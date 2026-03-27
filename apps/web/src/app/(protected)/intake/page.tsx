import Link from "next/link";
import { Inbox } from "lucide-react";
import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ArtifactIntakeUploadSubmitButton } from "@/components/intake/artifact-intake-pending-actions";
import { ArtifactIntakeReviewWorkspace } from "@/components/intake/artifact-intake-review-workspace";
import { ContextHelp } from "@/components/shared/context-help";
import { requireProtectedSession } from "@/lib/auth/guards";
import { getHelpPattern } from "@/lib/help/aas-help";
import { loadArtifactIntakeWorkspace } from "@/lib/intake/workspace";
import {
  submitArtifactSectionDispositionInlineAction,
  submitArtifactCandidateIssueDispositionInlineAction,
  submitArtifactCandidateFromIntakeAction,
  uploadArtifactIntakeFilesAction
} from "./actions";

type ArtifactIntakePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function formatBytes(value: number) {
  return value < 1024 ? `${value} B` : `${(value / 1024).toFixed(1)} KB`;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function confidenceTone(confidence: "high" | "medium" | "low") {
  if (confidence === "high") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (confidence === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function flashTone(status: string | undefined) {
  if (status === "error" || status === "blocked") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (status === "reject") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function buildIntakeHref(sessionId: string, fileId: string, candidateId?: string | null, queueFilter?: string) {
  const params = new URLSearchParams({ sessionId, fileId });
  if (candidateId) {
    params.set("candidateId", candidateId);
  }
  if (queueFilter && queueFilter !== "all") {
    params.set("queue", queueFilter);
  }
  return `/intake?${params.toString()}`;
}

export default async function ArtifactIntakePage({ searchParams }: ArtifactIntakePageProps) {
  const query = searchParams ? await searchParams : {};
  const session = await requireProtectedSession();
  const sessionId = getParamValue(query.sessionId);
  const fileId = getParamValue(query.fileId);
  const workspace = await loadArtifactIntakeWorkspace({ sessionId, fileId });
  const isDemoSession = session.mode === "demo" || session.organization?.organizationId === DEMO_ORGANIZATION.organizationId;
  const error = getParamValue(query.error);
  const message = getParamValue(query.message);
  const status = getParamValue(query.status);
  const candidateId = getParamValue(query.candidateId);
  const queueFilter = getParamValue(query.queue) ?? "all";
  const visibleSessions =
    workspace.state === "ready"
      ? workspace.sessions.filter((artifactSession) => {
          if ((artifactSession.activeImportWorkCount ?? 1) === 0) {
            return false;
          }

          if (queueFilter === "pending_classification") {
            return artifactSession.files.some((file) => file.sourceTypeStatus === "pending");
          }

          if (queueFilter === "review_required") {
            return artifactSession.pendingReviewCount > 0 || artifactSession.status === "human_review_required";
          }

          return true;
        })
      : [];

  const selectedSession =
    workspace.state === "ready"
      ? visibleSessions.find((artifactSession) => artifactSession.id === sessionId) ?? visibleSessions[0] ?? null
      : null;
  const visibleFiles =
    selectedSession?.files.filter((artifactFile) => (artifactFile.activeImportWorkCount ?? 1) > 0) ?? [];
  const selectedFile =
    visibleFiles.find((artifactFile) => artifactFile.id === fileId) ?? visibleFiles[0] ?? null;
  const selectedSessionCandidates =
    selectedSession && selectedSession.candidates.length > 0
      ? selectedSession.candidates
      : selectedSession?.displayCandidates ?? [];
  const normalizedSelectedFileCandidatesSource = selectedSessionCandidates.map((candidate) => ({
    ...candidate,
    fileId: "fileId" in candidate ? candidate.fileId : candidate.source.fileId
  }));
  const selectedFileCandidates = selectedFile
    ? normalizedSelectedFileCandidatesSource.filter((candidate) => candidate.fileId === selectedFile.id)
    : [];
  const selectedCandidate =
    selectedFileCandidates.find((candidate) => candidate.id === candidateId) ?? selectedFileCandidates[0] ?? null;
  const importHelp = getHelpPattern(
    "import.workspace",
    selectedCandidate?.humanDecisions?.aiAccelerationLevel ?? null
  );

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        projectName: workspace.organizationName,
        sectionLabel: "Import",
        badge: "Project section"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Inbox className="h-3.5 w-3.5 text-primary" />
            Import before promotion
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Project Import</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Upload markdown delivery artifacts, inspect the full imported source, review structured candidates, and
            correct them before promotion.
          </p>
          <div className="mt-5 max-w-4xl">
            <ContextHelp pattern={importHelp} summaryLabel="Open import help" />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {message ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${flashTone(status)}`}>{message}</div>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Upload markdown artifacts</CardTitle>
            <CardDescription>
              Supported extensions: <strong>.md</strong>, <strong>.mdx</strong>, and <strong>.markdown</strong>. Uploads are
              grouped into a persisted import session for {workspace.organizationName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDemoSession ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                Import writes persisted intake sessions and is therefore disabled in Demo. Leave Demo, then open or create a
                normal project before uploading markdown artifacts.
              </div>
            ) : null}
            <form action={uploadArtifactIntakeFilesAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Artifact files</span>
                <input
                  accept=".md,.mdx,.markdown,text/markdown"
                  className="block w-full rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:opacity-90"
                  multiple
                  name="files"
                  type="file"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <ArtifactIntakeUploadSubmitButton disabled={isDemoSession} />
                {isDemoSession ? (
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href="/">Leave Demo and choose project</Link>
                  </Button>
                ) : (
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href="/review">Open Human Review</Link>
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {workspace.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Import is unavailable</CardTitle>
              <CardDescription>The route is online, but the persisted import data could not be loaded.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{workspace.message}</CardContent>
          </Card>
        ) : workspace.sessions.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No import sessions yet</CardTitle>
              <CardDescription>{workspace.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : visibleSessions.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No active import work remains</CardTitle>
              <CardDescription>
                Everything in intake has either been promoted into the project Value Spine, rejected from import, or
                otherwise cleared from the active queue.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 2xl:grid-cols-[1.15fr,0.85fr]">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Import sessions</CardTitle>
                  <CardDescription>
                    Pick a session and then a single imported artifact to keep review scoped and trustworthy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {visibleSessions.map((artifactSession) => (
                    <div
                      className={`rounded-2xl border p-4 ${selectedSession?.id === artifactSession.id ? "border-primary/50 bg-primary/5" : "border-border/70 bg-background/80"}`}
                      key={artifactSession.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{artifactSession.label}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Created {formatDate(artifactSession.createdAt)} by{" "}
                            {artifactSession.creator?.fullName ?? artifactSession.creator?.email ?? "Unknown uploader"}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {formatLabel(artifactSession.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Files</p>
                          <p className="mt-1 font-semibold">{artifactSession.files.length}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Parsed</p>
                          <p className="mt-1 font-semibold">
                            {artifactSession.files.reduce((count, file) => count + file.parsedSectionCount, 0)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Candidates</p>
                          <p className="mt-1 font-semibold">{artifactSession.candidateCount}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Outside candidate</p>
                          <p className="mt-1 font-semibold">{artifactSession.unmappedSectionCount}</p>
                        </div>
                      </div>

                      {artifactSession.clearedCandidateCount > 0 ? (
                        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                          {artifactSession.rejectedCandidateCount > 0 ? (
                            <span>{artifactSession.rejectedCandidateCount} candidate(s) were rejected and removed from the active import queue. </span>
                          ) : null}
                          {artifactSession.promotedCandidateCount > 0 ? (
                            <span>{artifactSession.promotedCandidateCount} candidate(s) were already promoted into the project Value Spine. </span>
                          ) : null}
                          Review keeps the audit trail, but intake now focuses on work that is still active.
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {artifactSession.files
                          .filter((artifactFile) => (artifactFile.activeImportWorkCount ?? 1) > 0)
                          .map((artifactFile) => {
                          const sessionCandidates =
                            artifactSession.candidates.length > 0 ? artifactSession.candidates : artifactSession.displayCandidates;
                          const firstCandidate =
                            sessionCandidates.find((candidate) => {
                              if ("fileId" in candidate) {
                                return candidate.fileId === artifactFile.id;
                              }

                              return candidate.source.fileId === artifactFile.id;
                            }) ?? null;

                          return (
                            <Button
                              asChild
                              key={artifactFile.id}
                              size="sm"
                              variant={
                                selectedSession?.id === artifactSession.id && selectedFile?.id === artifactFile.id
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              <Link href={buildIntakeHref(artifactSession.id, artifactFile.id, firstCandidate?.id ?? null, queueFilter)} prefetch={false}>
                                {artifactFile.fileName}
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {visibleSessions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                      No import sessions match the current action filter.
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Import context and summary</CardTitle>
                  <CardDescription>
                    The intake summary lives here in-flow so the review workspace can stay focused on the correction queue.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <details className="group rounded-2xl border border-border/70 bg-muted/10">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">Import summary</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Persisted intake activity and current review volume for this project.
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground group-open:hidden">Expand</span>
                      <span className="hidden text-xs text-muted-foreground group-open:inline">Collapse</span>
                    </summary>
                    <div className="grid gap-3 border-t border-border/70 px-4 py-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sessions</p>
                        <p className="mt-1 font-semibold text-foreground">{workspace.summary.sessions}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Uploaded files</p>
                        <p className="mt-1 font-semibold text-foreground">{workspace.summary.files}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pending classification</p>
                        <p className="mt-1 font-semibold text-foreground">{workspace.summary.pendingClassification}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Parsed sections</p>
                        <p className="mt-1 font-semibold text-foreground">{workspace.summary.parsedSections}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Candidate objects</p>
                        <p className="mt-1 font-semibold text-foreground">{workspace.summary.candidateObjects}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Human review queues</p>
                        <p className="mt-1 font-semibold text-foreground">{workspace.summary.humanReviewRequired}</p>
                      </div>
                    </div>
                  </details>

                  {selectedFile ? (
                    <details className="group rounded-2xl border border-border/70 bg-background/80" open>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">Selected artifact</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            The current review context is always tied to one imported file.
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground group-open:hidden">Expand</span>
                        <span className="hidden text-xs text-muted-foreground group-open:inline">Collapse</span>
                      </summary>
                      <div className="space-y-4 border-t border-border/70 px-4 py-4">
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                          <p className="font-medium text-foreground">{selectedFile.fileName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedSession?.label} for {workspace.organizationName}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            {selectedFile.sourceType ? formatLabel(selectedFile.sourceType) : formatLabel(selectedFile.sourceTypeStatus)}
                          </span>
                          {selectedFile.sourceTypeConfidence ? (
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${confidenceTone(selectedFile.sourceTypeConfidence)}`}
                            >
                              {selectedFile.sourceTypeConfidence} confidence
                            </span>
                          ) : null}
                          <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            {selectedFile.parsedSectionCount} parsed sections
                          </span>
                          <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            {formatBytes(selectedFile.sizeBytes)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {selectedFile.parsedArtifacts?.sections.slice(0, 4).map((section) => (
                            <div className="rounded-2xl border border-border/70 bg-muted/10 p-3 text-sm" key={section.id}>
                              <p className="font-medium text-foreground">{section.title}</p>
                              <p className="mt-1 text-muted-foreground">
                                {formatLabel(section.kind)}: {section.sourceReference.sectionMarker}
                              </p>
                            </div>
                          ))}
                        </div>
                        {selectedFileCandidates.length === 0 && (selectedSession?.clearedCandidateCount ?? 0) > 0 ? (
                          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                            This artifact has no active import candidates left. Any earlier candidates were either rejected
                            or already promoted into the project Value Spine.
                          </div>
                        ) : null}
                      </div>
                    </details>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select an artifact file to begin scoped intake review.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedSession && selectedFile ? (
              <ArtifactIntakeReviewWorkspace
                fileCandidates={selectedFileCandidates}
                projectEpics={workspace.projectEpics}
                projectOutcomes={workspace.projectOutcomes}
                selectedCandidate={selectedCandidate}
                selectedFile={selectedFile}
                session={{
                  ...selectedSession,
                  allCandidates: selectedSession.allCandidates ?? selectedSession.candidates ?? []
                }}
                submitAction={submitArtifactCandidateFromIntakeAction}
                submitCandidateDispositionInlineAction={submitArtifactCandidateIssueDispositionInlineAction}
                submitSectionDispositionInlineAction={submitArtifactSectionDispositionInlineAction}
              />
            ) : null}
          </>
        )}
      </section>
    </AppShell>
  );
}
