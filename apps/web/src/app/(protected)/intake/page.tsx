import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2, CircleAlert, Inbox } from "lucide-react";
import { getArtifactCandidateIssueProgress } from "@aas-companion/domain";
import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ArtifactIntakeUploadSubmitButton } from "@/components/intake/artifact-intake-pending-actions";
import { ArtifactIntakeReviewWorkspace } from "@/components/intake/artifact-intake-review-workspace";
import { LocalizedText } from "@/components/shared/localized-text";
import { requireProtectedSession } from "@/lib/auth/guards";
import { loadArtifactIntakeWorkspace } from "@/lib/intake/workspace";
import {
  submitArtifactSectionDispositionInlineAction,
  submitArtifactCandidateIssueDispositionInlineAction,
  submitArtifactCandidateFromIntakeAction,
  submitFramingBulkApproveFromIntakeAction,
  uploadArtifactIntakeFilesAction
} from "./actions";

type ArtifactIntakePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AppLanguage = "en" | "sv";

type BacklogRow = {
  kind: "candidate" | "leftovers";
  id: string;
  href: string;
  isSelected: boolean;
  sessionLabel: string;
  fileName: string;
  title: string;
  subtitle: string;
  typeLabel: string;
  statusLabel: string;
  unresolvedCount: number;
  blockedCount: number;
  leftoverCount: number;
  meta: string;
  attentionPreview: string[];
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatBytes(value: number) {
  return value < 1024 ? `${value} B` : `${(value / 1024).toFixed(1)} KB`;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getImportTargetLabel(importIntent: "framing" | "design" | string | undefined) {
  return importIntent === "design" ? "Delivery Story" : "Story Idea";
}

function getImportWorkspaceLabel(importIntent: "framing" | "design" | string | undefined) {
  return importIntent === "design" ? "Design approval queue" : "Framing approval queue";
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

function matchesOriginTarget(
  candidate: {
    id: string;
    promotedEntityId?: string | null;
  },
  target: {
    candidateId?: string | null | undefined;
    entityId?: string | null | undefined;
  }
) {
  if (target.candidateId && candidate.id === target.candidateId) {
    return true;
  }

  if (target.entityId && candidate.promotedEntityId === target.entityId) {
    return true;
  }

  return false;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function ArtifactIntakePage({ searchParams }: ArtifactIntakePageProps) {
  const query = searchParams ? await searchParams : {};
  const serverLanguage = await getServerLanguage();
  const session = await requireProtectedSession();
  const sessionId = getParamValue(query.sessionId);
  const fileId = getParamValue(query.fileId);
  const workspace = await loadArtifactIntakeWorkspace({ sessionId, fileId });
  const isDemoSession = session.mode === "demo" || session.organization?.organizationId === DEMO_ORGANIZATION.organizationId;
  const error = getParamValue(query.error);
  const message = getParamValue(query.message);
  const status = getParamValue(query.status);
  const candidateId = getParamValue(query.candidateId);
  const originEntityId = getParamValue(query.entityId);
  const sourceSectionId = getParamValue(query.sourceSectionId);
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
  const explicitlySelectedSession =
    workspace.state === "ready"
      ? workspace.sessions.find((artifactSession) => artifactSession.id === sessionId) ?? null
      : null;
  const candidateSelectedSession =
    workspace.state === "ready" && (candidateId || originEntityId)
      ? workspace.sessions.find((artifactSession) =>
          artifactSession.allCandidates.some((candidate) =>
            matchesOriginTarget(candidate, { candidateId, entityId: originEntityId })
          )
        ) ?? null
      : null;

  const selectedSession =
    workspace.state === "ready"
      ? explicitlySelectedSession ?? candidateSelectedSession ?? visibleSessions[0] ?? workspace.sessions[0] ?? null
      : null;
  const visibleFiles =
    selectedSession?.files.filter((artifactFile) => (artifactFile.activeImportWorkCount ?? 1) > 0) ?? [];
  const candidateSelectedFile =
    selectedSession && (candidateId || originEntityId)
      ? selectedSession.files.find((artifactFile) =>
          selectedSession.allCandidates.some(
            (candidate) =>
              matchesOriginTarget(candidate, { candidateId, entityId: originEntityId }) &&
              candidate.fileId === artifactFile.id
          )
        ) ?? null
      : null;
  const selectedFile =
    selectedSession?.files.find((artifactFile) => artifactFile.id === fileId) ??
    candidateSelectedFile ??
    visibleFiles[0] ??
    selectedSession?.files[0] ??
    null;
  const selectedSessionCandidates =
    selectedSession && (candidateId || originEntityId)
      ? selectedSession.allCandidates
      : selectedSession && selectedSession.candidates.length > 0
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
    selectedFileCandidates.find((candidate) =>
      matchesOriginTarget(candidate, { candidateId, entityId: originEntityId })
    ) ??
    selectedFileCandidates[0] ??
    null;
  const showBacklogCard = selectedSession?.importIntent !== "framing";
  const shouldShowNoActiveWorkState = visibleSessions.length === 0 && !explicitlySelectedSession && !candidateSelectedSession;

  const backlogRows: BacklogRow[] =
    workspace.state === "ready"
      ? visibleSessions.flatMap((artifactSession): BacklogRow[] => {
          const sessionCandidates =
            artifactSession.candidates.length > 0 ? artifactSession.candidates : artifactSession.displayCandidates;

          return artifactSession.files
            .filter((artifactFile) => (artifactFile.activeImportWorkCount ?? 1) > 0)
            .reduce<BacklogRow[]>((rows, artifactFile) => {
              const fileCandidates = sessionCandidates.filter((candidate) =>
                "fileId" in candidate ? candidate.fileId === artifactFile.id : candidate.source.fileId === artifactFile.id
              );
              const unmappedSectionCount = (artifactSession.mappedArtifacts?.unmappedSections ?? []).filter(
                (section) => section.sourceReference.fileId === artifactFile.id
              ).length;
              const meta = `${formatBytes(artifactFile.sizeBytes)} - ${pluralize(artifactFile.parsedSectionCount, "parsed section")}`;

              if (fileCandidates.length === 0) {
                rows.push({
                  kind: "leftovers",
                  id: `${artifactFile.id}-leftovers`,
                  href: buildIntakeHref(artifactSession.id, artifactFile.id, null, queueFilter),
                  isSelected: selectedSession?.id === artifactSession.id && selectedFile?.id === artifactFile.id && !selectedCandidate,
                  sessionLabel: artifactSession.label,
                  fileName: artifactFile.fileName,
                  title: artifactFile.fileName,
                  subtitle: "No mapped candidate yet. Review leftovers and source sections for this file.",
                  typeLabel: "source review",
                  statusLabel: formatLabel(artifactSession.status),
                  unresolvedCount: unmappedSectionCount,
                  blockedCount: 0,
                  leftoverCount: unmappedSectionCount,
                  meta,
                  attentionPreview:
                    unmappedSectionCount > 0
                      ? [`${pluralize(unmappedSectionCount, "review leftover")}`]
                      : ["No open correction items"]
                });

                return rows;
              }

              for (const candidate of fileCandidates) {
                const progress = candidate.complianceResult
                  ? getArtifactCandidateIssueProgress({
                      complianceResult: candidate.complianceResult,
                      issueDispositions: candidate.issueDispositions,
                      unmappedSectionCount,
                      sectionDispositions: artifactFile.sectionDispositions
                    })
                  : null;
                const attentionPreview = [
                  ...(candidate.complianceResult?.findings ?? [])
                    .map((finding) => finding.fieldLabel ?? finding.message)
                    .filter(Boolean)
                    .slice(0, 2),
                  ...(unmappedSectionCount > 0 ? [`${pluralize(unmappedSectionCount, "review leftover")}`] : [])
                ].slice(0, 3);

                rows.push({
                  kind: "candidate",
                  id: candidate.id,
                  href: buildIntakeHref(artifactSession.id, artifactFile.id, candidate.id, queueFilter),
                  isSelected: selectedCandidate?.id === candidate.id,
                  sessionLabel: artifactSession.label,
                  fileName: artifactFile.fileName,
                  title: candidate.title,
                  subtitle: candidate.summary,
                  typeLabel: candidate.type === "story" ? getImportTargetLabel(artifactSession.importIntent) : candidate.type,
                  statusLabel: formatLabel(candidate.reviewStatus),
                  unresolvedCount: progress?.unresolved ?? 0,
                  blockedCount: progress?.categories.blocked ?? 0,
                  leftoverCount: progress?.categories.unmapped ?? 0,
                  meta,
                  attentionPreview:
                    attentionPreview.length > 0
                      ? attentionPreview
                      : candidate.reviewStatus === "promoted"
                        ? ["Already promoted"]
                        : ["No open correction items"]
                });
              }

              return rows;
            }, []);
        })
      : [];

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
            <LocalizedText en="Import before promotion" sv="Import före promotion" />
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                <LocalizedText en="Project Import" sv="Projektimport" />
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                <LocalizedText
                  en="Upload text or markdown delivery artifacts, inspect the full imported source, review structured candidates, and correct them before promotion. Import always starts with AI-assisted interpretation and falls back to the built-in parser automatically when the AI response is incomplete."
                  sv="Ladda upp text- eller markdownunderlag, granska hela den importerade källan, gå igenom strukturerade kandidater och rätta dem innan promotion. Import startar alltid med AI-stödd tolkning och faller automatiskt tillbaka till den inbyggda parsern när AI-svaret är ofullständigt."
                />
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1">
                {workspace.state === "ready" ? (
                  <LocalizedText
                    en={`${workspace.summary.files} uploaded file(s)`}
                    sv={`${workspace.summary.files} uppladdade filer`}
                  />
                ) : (
                  <LocalizedText en="Intake overview" sv="Importöversikt" />
                )}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1">
                {workspace.state === "ready" ? (
                  <LocalizedText
                    en={`${workspace.summary.candidateObjects} candidate object(s)`}
                    sv={`${workspace.summary.candidateObjects} kandidatobjekt`}
                  />
                ) : (
                  workspace.organizationName
                )}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1">
                {workspace.state === "ready" ? (
                  <LocalizedText
                    en={`${workspace.summary.humanReviewRequired} human review queue(s)`}
                    sv={`${workspace.summary.humanReviewRequired} human review-köer`}
                  />
                ) : (
                  <LocalizedText en="Project scope" sv="Projektomfång" />
                )}
              </span>
            </div>
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
            <CardTitle>
              <LocalizedText en="Upload import artifacts" sv="Ladda upp importunderlag" />
            </CardTitle>
            <CardDescription>
              <LocalizedText
                en={
                  <>
                    Supported extensions: <strong>.md</strong>, <strong>.mdx</strong>, <strong>.markdown</strong>, and{" "}
                    <strong>.txt</strong>. Uploads are grouped into a persisted import session for {workspace.organizationName}.
                  </>
                }
                sv={
                  <>
                    Stödda filändelser: <strong>.md</strong>, <strong>.mdx</strong>, <strong>.markdown</strong> och{" "}
                    <strong>.txt</strong>. Uppladdningar grupperas i en sparad importsession för {workspace.organizationName}.
                  </>
                }
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDemoSession ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                <LocalizedText
                  en="Import writes persisted intake sessions and is therefore disabled in Demo. Leave Demo, then open or create a normal project before uploading import artifacts."
                  sv="Import skriver sparade importsessioner och är därför avstängd i Demo. Lämna Demo och öppna eller skapa ett vanligt projekt innan du laddar upp importunderlag."
                />
              </div>
            ) : null}
            <form action={uploadArtifactIntakeFilesAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">
                  <LocalizedText en="Import target" sv="Importmål" />
                </span>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                  defaultValue="framing"
                  name="importIntent"
                >
                  <option value="framing">
                    <LocalizedText en="Import to Framing" sv="Importera till Framing" />
                  </option>
                  <option value="design">
                    <LocalizedText en="Import to Design" sv="Importera till Design" />
                  </option>
                </select>
                <p className="text-sm text-muted-foreground">
                  <LocalizedText
                    en={
                      <>
                        Choose <strong>Framing</strong> when the document should become Outcome, Epics, Story Ideas and
                        constraints. Choose <strong>Design</strong> when the document already contains concrete stories that
                        should become Delivery Stories.
                      </>
                    }
                    sv={
                      <>
                        Välj <strong>Framing</strong> när dokumentet ska bli Outcome, Epics, Story Ideas och constraints.
                        Välj <strong>Design</strong> när dokumentet redan innehåller konkreta stories som ska bli Delivery
                        Stories.
                      </>
                    }
                  />
                </p>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">
                  <LocalizedText en="Artifact files" sv="Importfiler" />
                </span>
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
                    <Link href="/">
                      <LocalizedText en="Leave Demo and choose project" sv="Lämna Demo och välj projekt" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {workspace.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>
                <LocalizedText en="Import is unavailable" sv="Import är inte tillgänglig" />
              </CardTitle>
              <CardDescription>
                <LocalizedText
                  en="The route is online, but the persisted import data could not be loaded."
                  sv="Sidan är tillgänglig, men den sparade importdatan kunde inte laddas."
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{workspace.message}</CardContent>
          </Card>
        ) : workspace.sessions.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>
                <LocalizedText en="No import sessions yet" sv="Inga importsessioner ännu" />
              </CardTitle>
              <CardDescription>{workspace.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : shouldShowNoActiveWorkState ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>
                <LocalizedText en="No active import work remains" sv="Inget aktivt importarbete återstår" />
              </CardTitle>
              <CardDescription>
                <LocalizedText
                  en="Everything in intake has either been promoted into the project Value Spine, rejected from import, or otherwise cleared from the active queue."
                  sv="Allt i importen har antingen promoterats in i projektets Value Spine, avvisats från importen eller på annat sätt rensats från den aktiva kön."
                />
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {showBacklogCard ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>
                    <LocalizedText en="Imported candidates" sv="Importerade kandidater" />
                  </CardTitle>
                  <CardDescription>
                    <LocalizedText
                      en="Work through the imported material as a backlog. If the import target was Framing, imported stories are reviewed and approved as Story Ideas."
                      sv="Arbeta igenom det importerade materialet som en backlog. Om importmålet var Framing granskas och godkänns importerade stories som Story Ideas."
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/40 px-4 py-4 text-sm text-sky-950">
                    <p>
                      <LocalizedText
                        en="Use Intake to inspect one file at a time. When you want to approve or reject many imported rows together, continue to"
                        sv="Använd Import för att granska en fil i taget. När du vill godkänna eller avvisa många importerade rader samtidigt går du vidare till"
                      />{" "}
                      <Link
                        className="font-semibold underline underline-offset-4"
                        href={`/review?importIntent=${selectedSession?.importIntent ?? "framing"}&reviewStatusFilter=pending`}
                      >
                        {getImportWorkspaceLabel(selectedSession?.importIntent)}
                      </Link>
                      .
                    </p>
                    <p className="mt-2 text-sky-900/80">
                      <LocalizedText
                        en={`There you can tick checkboxes and approve selected ${selectedSession?.importIntent === "design" ? "Delivery Stories" : "Story Ideas"} in bulk.`}
                        sv={`Där kan du markera kryssrutor och godkänna valda ${selectedSession?.importIntent === "design" ? "Delivery Stories" : "Story Ideas"} i bulk.`}
                      />
                    </p>
                  </div>
                  {backlogRows.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
                      {backlogRows.map((row, index) => {
                        const needsAttention = row.unresolvedCount > 0 || row.blockedCount > 0 || row.leftoverCount > 0;

                        return (
                          <Link
                            className={`block px-5 py-4 transition ${
                              index > 0 ? "border-t border-border/70" : ""
                            } ${
                              row.isSelected
                                ? "border-l-4 border-l-[#2f5f98] bg-[#2f5f98] text-white"
                                : needsAttention
                                  ? "border-l-4 border-l-amber-400 bg-amber-50/30 hover:bg-amber-50/50"
                                  : "border-l-4 border-l-transparent hover:bg-muted/30"
                            }`}
                            href={row.href}
                            key={row.id}
                            prefetch={false}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                                      row.isSelected
                                        ? "border-white/30 bg-white/10 text-white"
                                        : needsAttention
                                          ? "border-amber-200 bg-amber-50 text-amber-700"
                                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    }`}
                                  >
                                    {needsAttention ? <CircleAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                  </span>
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                      row.isSelected
                                        ? "border-white/20 bg-white/10 text-white/85"
                                        : "border-border/70 bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {row.typeLabel}
                                  </span>
                                  <h3 className={`text-sm font-semibold ${row.isSelected ? "text-white" : "text-foreground"}`}>{row.title}</h3>
                                </div>
                                <p className={`mt-2 text-sm leading-6 ${row.isSelected ? "text-white/90" : "text-muted-foreground"}`}>
                                  {row.subtitle}
                                </p>
                                <div className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs ${row.isSelected ? "text-white/75" : "text-muted-foreground"}`}>
                                  <span>{row.fileName}</span>
                                  <span>{row.sessionLabel}</span>
                                  <span>{row.meta}</span>
                                  <span>{row.statusLabel}</span>
                                </div>
                                <p className={`mt-2 text-xs ${row.isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                                  <LocalizedText en={needsAttention ? "Needs review:" : "Status:"} sv={needsAttention ? "Behöver granskning:" : "Status:"} />{" "}
                                  {row.attentionPreview.join(" - ")}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 ${
                                    row.isSelected
                                      ? "border-white/20 bg-white/10 text-white/90"
                                      : "border-border/70 bg-background text-muted-foreground"
                                  }`}
                                >
                                  <LocalizedText en="Open:" sv="Öppna:" />{" "}
                                  <strong className={`ml-1 ${row.isSelected ? "text-white" : "text-foreground"}`}>{row.unresolvedCount}</strong>
                                </span>
                                {row.blockedCount > 0 ? (
                                  <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-medium text-rose-700">
                                    <LocalizedText en={`Blocked: ${row.blockedCount}`} sv={`Blockerad: ${row.blockedCount}`} />
                                  </span>
                                ) : null}
                                {row.leftoverCount > 0 ? (
                                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700">
                                    <LocalizedText en={`Leftovers: ${row.leftoverCount}`} sv={`Restposter: ${row.leftoverCount}`} />
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                  {backlogRows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                      <LocalizedText
                        en="No import sessions match the current action filter."
                        sv="Inga importsessioner matchar det aktuella åtgärdsfiltret."
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {selectedSession && selectedFile ? (
              <ArtifactIntakeReviewWorkspace
                fileCandidates={selectedFileCandidates}
                language={serverLanguage}
                originCandidateRequested={Boolean(candidateId || originEntityId)}
                projectEpics={workspace.projectEpics}
                projectOutcomes={workspace.projectOutcomes}
                selectedCandidate={selectedCandidate}
                selectedFile={selectedFile}
                session={{
                  ...selectedSession,
                  allCandidates: selectedSession.allCandidates ?? selectedSession.candidates ?? []
                }}
                sourceSectionFocusId={sourceSectionId ?? null}
                submitAction={submitArtifactCandidateFromIntakeAction}
                submitFramingBulkApproveAction={submitFramingBulkApproveFromIntakeAction}
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
