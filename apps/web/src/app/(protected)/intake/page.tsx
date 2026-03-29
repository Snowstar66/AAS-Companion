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
        <div className="rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.12),_transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Inbox className="h-3.5 w-3.5 text-primary" />
            Import before promotion
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Project Import</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Upload text or markdown delivery artifacts, inspect the full imported source, review structured candidates,
                and correct them before promotion. Use AI-assisted import when the source material is looser and needs help
                to be interpreted into the Value Spine.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1">
                {workspace.state === "ready" ? `${workspace.summary.files} uploaded file(s)` : "Intake overview"}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1">
                {workspace.state === "ready" ? `${workspace.summary.candidateObjects} candidate object(s)` : workspace.organizationName}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1">
                {workspace.state === "ready" ? `${workspace.summary.humanReviewRequired} human review queue(s)` : "Project scope"}
              </span>
            </div>
          </div>
          <div className="mt-4 max-w-4xl">
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
            <CardTitle>Upload import artifacts</CardTitle>
            <CardDescription>
              Supported extensions: <strong>.md</strong>, <strong>.mdx</strong>, <strong>.markdown</strong>, and{" "}
              <strong>.txt</strong>. Uploads are grouped into a persisted import session for {workspace.organizationName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDemoSession ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                Import writes persisted intake sessions and is therefore disabled in Demo. Leave Demo, then open or create a
                normal project before uploading import artifacts.
              </div>
            ) : null}
            <form action={uploadArtifactIntakeFilesAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Artifact files</span>
                <input
                  accept=".md,.mdx,.markdown,.txt,text/markdown,text/plain"
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
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Imported candidates</CardTitle>
                <CardDescription>
                  Pick the imported file and candidate you want to inspect and continue working on.
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

                    <div className="mt-4 space-y-3">
                      {artifactSession.files
                        .filter((artifactFile) => (artifactFile.activeImportWorkCount ?? 1) > 0)
                        .map((artifactFile) => {
                          const sessionCandidates =
                            artifactSession.candidates.length > 0 ? artifactSession.candidates : artifactSession.displayCandidates;
                          const fileCandidates = sessionCandidates.filter((candidate) =>
                            "fileId" in candidate ? candidate.fileId === artifactFile.id : candidate.source.fileId === artifactFile.id
                          );
                          const firstCandidate = fileCandidates[0] ?? null;

                          return (
                            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={artifactFile.id}>
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <Button
                                  asChild
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
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <span>{formatBytes(artifactFile.sizeBytes)}</span>
                                  <span>{artifactFile.parsedSectionCount} parsed</span>
                                  <span>{fileCandidates.length} candidate(s)</span>
                                </div>
                              </div>

                              {fileCandidates.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {fileCandidates.map((candidate) => (
                                    <Button
                                      asChild
                                      className="gap-2"
                                      key={candidate.id}
                                      size="sm"
                                      variant={selectedCandidate?.id === candidate.id ? "default" : "secondary"}
                                    >
                                      <Link href={buildIntakeHref(artifactSession.id, artifactFile.id, candidate.id, queueFilter)} prefetch={false}>
                                        {candidate.type}: {candidate.title}
                                      </Link>
                                    </Button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
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
