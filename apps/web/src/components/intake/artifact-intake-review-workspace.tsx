import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, CircleAlert, GitBranch, ShieldCheck } from "lucide-react";
import type {
  ArtifactCandidateDraftRecord,
  ArtifactCandidateHumanDecision,
  ArtifactComplianceResult,
  ArtifactIssueDispositionMap,
  ArtifactParseResult
} from "@aas-companion/domain";
import { getArtifactCandidateIssueProgress } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { ArtifactIntakeDispositionButtons } from "@/components/intake/artifact-intake-disposition-buttons";
import { ArtifactIntakeReviewSubmitButtons } from "@/components/intake/artifact-intake-pending-actions";

type ParsedSection = ArtifactParseResult["sections"][number];

type IntakeArtifactFile = {
  id: string;
  fileName: string;
  extension: string;
  content: string;
  sizeBytes: number;
  sourceTypeStatus: string;
  sourceType: string | null;
  sourceTypeConfidence: "high" | "medium" | "low" | null;
  parsedArtifacts: ArtifactParseResult | null;
  sectionDispositions: ArtifactIssueDispositionMap;
  parsedSectionCount: number;
  uncertainSectionCount: number;
};

type IntakeArtifactCandidate = {
  id: string;
  fileId: string;
  type: "outcome" | "epic" | "story";
  title: string;
  summary: string;
  mappingState: "mapped" | "uncertain" | "missing";
  relationshipState: "mapped" | "uncertain" | "missing";
  relationshipNote?: string | null | undefined;
  reviewStatus: "pending" | "confirmed" | "edited" | "rejected" | "follow_up_needed" | "promoted";
  source: {
    fileId: string;
    fileName: string;
    sectionId: string;
    sectionTitle: string;
    sectionMarker: string;
    sourceType: string;
    confidence: "high" | "medium" | "low";
  };
  draftRecord: ArtifactCandidateDraftRecord | null;
  humanDecisions: ArtifactCandidateHumanDecision | null;
  complianceResult: ArtifactComplianceResult | null;
  issueDispositions: ArtifactIssueDispositionMap;
  reviewComment?: string | null;
  promotedEntityId?: string | null;
  promotedEntityType?: string | null;
  importedReadinessState?: string | null;
};

type IntakeArtifactSession = {
  id: string;
  label: string;
  mappedArtifacts: { unmappedSections: ParsedSection[] } | null;
  allCandidates: IntakeArtifactCandidate[];
};

type ProjectOutcomeOption = {
  id: string;
  key: string;
  title: string;
};

type ProjectEpicOption = {
  id: string;
  key: string;
  title: string;
  outcomeId: string;
};

type QueueItem = {
  id: string;
  title: string;
  description: string;
  context: string;
  status: "resolved" | "unresolved";
  href: string;
  selectedAction?: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked" | null;
  dispositionLabel?: string | null;
  resolvedActions: Array<"corrected" | "confirmed" | "not_relevant" | "pending" | "blocked">;
  actionScope: "candidate" | "section";
  candidateId?: string;
  candidateType?: "outcome" | "epic" | "story";
  issueId: string;
  actions: Array<{
    label: string;
    value: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";
  }>;
};

type FieldValidationNote = {
  fieldName: string;
  label: string;
  message: string;
};

type ArtifactIntakeReviewWorkspaceProps = {
  session: IntakeArtifactSession;
  selectedFile: IntakeArtifactFile;
  fileCandidates: IntakeArtifactCandidate[];
  projectOutcomes: ProjectOutcomeOption[];
  projectEpics: ProjectEpicOption[];
  selectedCandidate: IntakeArtifactCandidate | null;
  submitAction: (formData: FormData) => Promise<void>;
  submitCandidateDispositionInlineAction: (input: {
    candidateId: string;
    candidateType: "outcome" | "epic" | "story";
    issueId: string;
    issueAction: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";
  }) => Promise<{ ok: true; selectedAction: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked" } | { ok: false; message: string }>;
  submitSectionDispositionInlineAction: (input: {
    fileId: string;
    sectionId: string;
    action: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";
  }) => Promise<{ ok: true; selectedAction: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked" } | { ok: false; message: string }>;
};

function intakeHref(
  sessionId: string,
  fileId: string,
  candidateId?: string | null,
  hash?: string,
  currentSelection?: {
    sessionId: string;
    fileId: string;
    candidateId: string | null;
  }
) {
  if (
    hash &&
    currentSelection &&
    currentSelection.sessionId === sessionId &&
    currentSelection.fileId === fileId &&
    currentSelection.candidateId === (candidateId ?? null)
  ) {
    return `#${hash}`;
  }

  const params = new URLSearchParams({ sessionId, fileId });
  if (candidateId) {
    params.set("candidateId", candidateId);
  }
  return `/intake?${params.toString()}${hash ? `#${hash}` : ""}`;
}

function label(value: string) {
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

function buildSuggestedImportedStoryKey(session: IntakeArtifactSession, candidate: IntakeArtifactCandidate | null) {
  if (!candidate || candidate.type !== "story") {
    return "";
  }

  const storyCandidates = session.allCandidates.filter((entry) => entry.type === "story");
  const index = storyCandidates.findIndex((entry) => entry.id === candidate.id);
  const sequence = index >= 0 ? index + 1 : storyCandidates.length + 1;

  return `IMP-STR-${String(sequence).padStart(3, "0")}`;
}

function dispositionLabel(action: string | null | undefined) {
  if (!action) {
    return null;
  }

  return label(action);
}

function queueItems(
  session: IntakeArtifactSession,
  file: IntakeArtifactFile,
  currentSelection?: {
    sessionId: string;
    fileId: string;
    candidateId: string | null;
  }
) {
  const items: Array<{ key: string; title: string; description: string; items: QueueItem[] }> = [];
  const baseCandidateId =
    session.allCandidates.find((candidate) => candidate.fileId === file.id)?.id ?? null;

  items.push({
    key: "unmapped",
    title: "Review leftovers",
    description: "These source sections could not yet be placed confidently into an Outcome, Epic, or Story candidate. Review them here to see exactly what was left outside the structured import.",
    items: (session.mappedArtifacts?.unmappedSections ?? [])
      .filter((section) => section.sourceReference.fileId === file.id)
      .map((section) => ({
        id: section.id,
        title: section.title,
        description: section.text,
        context: `${section.sourceReference.sectionMarker} lines ${section.sourceReference.lineStart}-${section.sourceReference.lineEnd}`,
        status:
          file.sectionDispositions[section.id]?.action &&
          file.sectionDispositions[section.id]?.action !== "pending" &&
          file.sectionDispositions[section.id]?.action !== "blocked"
            ? ("resolved" as const)
            : ("unresolved" as const),
        href: intakeHref(session.id, file.id, baseCandidateId, `source-section-${section.id}`, currentSelection),
        selectedAction: file.sectionDispositions[section.id]?.action ?? null,
        dispositionLabel: dispositionLabel(file.sectionDispositions[section.id]?.action),
        resolvedActions: ["corrected", "not_relevant"],
        actionScope: "section" as const,
        issueId: section.id,
        actions: [
          { label: "Worked off", value: "corrected" as const },
          { label: "Not relevant", value: "not_relevant" as const },
          { label: "Keep pending", value: "pending" as const },
          { label: "Mark blocker", value: "blocked" as const }
        ]
      }))
  });

  return items;
}

function describeProjectOutcome(option: ProjectOutcomeOption) {
  return `${option.key} - ${option.title}`;
}

function describeProjectEpic(option: ProjectEpicOption) {
  return `${option.key} - ${option.title}`;
}

function compactMetric(labelText: string, metricValue: string | number) {
  return (
    <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted-foreground">
      {labelText}: <strong className="ml-1 text-foreground">{metricValue}</strong>
    </span>
  );
}

function queueItemTone(item: QueueItem) {
  if (item.selectedAction === "blocked") {
    return "border-rose-200 bg-rose-50/60";
  }

  if (item.status === "resolved") {
    return "border-emerald-200 bg-emerald-50/50";
  }

  return "border-amber-200 bg-amber-50/50";
}

function CollapsibleReviewPanel(props: {
  title: string;
  description?: string | undefined;
  defaultOpen?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-background shadow-sm" open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
        <div>
          <h3 className="font-semibold text-foreground">{props.title}</h3>
          {props.description ? <p className="mt-1 text-sm text-muted-foreground">{props.description}</p> : null}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-6 py-5">{props.children}</div>
    </details>
  );
}

function resolveFieldValidationNotes(candidate: IntakeArtifactCandidate | null): FieldValidationNote[] {
  if (!candidate?.complianceResult) {
    return [];
  }

  const notes: FieldValidationNote[] = [];

  for (const finding of candidate.complianceResult.findings) {
    const mappedFields =
      finding.code === "story_outcome_link_missing"
        ? [{ fieldName: "outcomeCandidateId", label: "Outcome destination" }]
        : finding.code === "story_epic_link_missing"
          ? [{ fieldName: "epicCandidateId", label: "Epic destination" }]
          : finding.code === "epic_outcome_link_missing"
            ? [{ fieldName: "outcomeCandidateId", label: "Outcome destination" }]
            : finding.code === "candidate_relationship_uncertain"
              ? candidate.type === "story"
                ? [{ fieldName: "epicCandidateId", label: "Epic destination" }]
                : candidate.type === "epic"
                  ? [{ fieldName: "outcomeCandidateId", label: "Outcome destination" }]
                  : []
              : finding.code === "story_test_definition_missing"
                ? [{ fieldName: "testDefinition", label: "Test Definition" }]
                : finding.code === "story_definition_of_done_missing"
                  ? [{ fieldName: "definitionOfDone", label: "Definition of Done" }]
                  : finding.code === "story_acceptance_criteria_missing"
                    ? [{ fieldName: "acceptanceCriteria", label: "Acceptance criteria" }]
                    : finding.code === "story_value_intent_missing"
                      ? [{ fieldName: "valueIntent", label: "Value intent" }]
                      : finding.code === "story_key_missing"
                        ? [{ fieldName: "key", label: "Key" }]
                        : finding.code === "outcome_statement_missing"
                          ? [{ fieldName: "outcomeStatement", label: "Outcome statement" }]
                          : finding.code === "baseline_definition_missing"
                            ? [{ fieldName: "baselineDefinition", label: "Baseline definition" }]
                            : finding.code === "baseline_source_missing"
                              ? [{ fieldName: "baselineSource", label: "Baseline source" }]
                              : finding.code === "epic_purpose_missing"
                                ? [{ fieldName: "purpose", label: "Purpose" }]
                                : finding.code === "epic_scope_boundary_missing"
                                  ? [{ fieldName: "scopeBoundary", label: "Scope boundary" }]
                                  : finding.code === "ai_acceleration_human_only"
                                    ? [{ fieldName: "aiAccelerationLevel", label: "AI level" }]
                                    : finding.code === "risk_acceptance_human_only"
                                      ? [{ fieldName: "riskAcceptanceStatus", label: "Risk acceptance status" }]
                                      : finding.code === "risk_profile_human_only"
                                        ? [{ fieldName: "riskProfile", label: "Risk profile" }]
                                        : finding.code === "baseline_validity_human_only"
                                          ? [{ fieldName: "baselineValidity", label: "Baseline validity" }]
                                          : finding.code === "value_owner_human_only"
                                            ? [{ fieldName: "valueOwnerId", label: "Value owner" }]
                                            : [];

    for (const mappedField of mappedFields) {
      notes.push({
        fieldName: mappedField.fieldName,
        label: mappedField.label,
        message: finding.message
      });
    }
  }

  return notes;
}

export function ArtifactIntakeReviewWorkspace({
  session,
  selectedFile,
  fileCandidates,
  projectOutcomes,
  projectEpics,
  selectedCandidate,
  submitAction,
  submitSectionDispositionInlineAction
}: ArtifactIntakeReviewWorkspaceProps) {
  const currentSelection = {
    sessionId: session.id,
    fileId: selectedFile.id,
    candidateId: selectedCandidate?.id ?? null
  };
  const groups = queueItems(session, selectedFile, currentSelection);
  const unmappedSectionCount = (session.mappedArtifacts?.unmappedSections ?? []).filter(
    (section) => section.sourceReference.fileId === selectedFile.id
  ).length;
  const progress = selectedCandidate?.complianceResult
    ? getArtifactCandidateIssueProgress({
        complianceResult: selectedCandidate.complianceResult,
        issueDispositions: selectedCandidate.issueDispositions,
        unmappedSectionCount,
        sectionDispositions: selectedFile.sectionDispositions
      })
    : null;
  const outcomeCandidateOptions = projectOutcomes ?? [];
  const selectedOutcomeCandidateId =
    selectedCandidate?.draftRecord?.outcomeCandidateId &&
    outcomeCandidateOptions.some((candidate) => candidate.id === selectedCandidate.draftRecord?.outcomeCandidateId)
      ? selectedCandidate.draftRecord.outcomeCandidateId
      : outcomeCandidateOptions.length === 1
        ? outcomeCandidateOptions[0]?.id ?? ""
        : "";
  const epicCandidateOptions = selectedOutcomeCandidateId
    ? (projectEpics ?? []).filter((epic) => epic.outcomeId === selectedOutcomeCandidateId)
    : (projectEpics ?? []);
  const selectedEpicCandidateId =
    selectedCandidate?.draftRecord?.epicCandidateId &&
    epicCandidateOptions.some((candidate) => candidate.id === selectedCandidate.draftRecord?.epicCandidateId)
      ? selectedCandidate.draftRecord.epicCandidateId
      : epicCandidateOptions.length === 1
        ? epicCandidateOptions[0]?.id ?? ""
        : "";
  const suggestedStoryKey = buildSuggestedImportedStoryKey(session, selectedCandidate);
  const selectedCandidateKeyValue =
    selectedCandidate?.type === "story"
      ? selectedCandidate.draftRecord?.key ?? suggestedStoryKey
      : selectedCandidate?.draftRecord?.key ?? "";
  const mappedSectionsBySourceId = new Map(
    fileCandidates.map((candidate) => [candidate.source.sectionId, candidate] as const)
  );
  const unmappedSourceSectionIds = new Set(
    (session.mappedArtifacts?.unmappedSections ?? [])
      .filter((section) => section.sourceReference.fileId === selectedFile.id)
      .map((section) => section.sourceReference.sectionId)
  );
  const quickEditFieldNames = new Set<string>();
  const showHumanDecisionFields = true;
  const fieldValidationNotes = resolveFieldValidationNotes(selectedCandidate);
  const fieldValidationMap = new Map<string, FieldValidationNote[]>();

  for (const note of fieldValidationNotes) {
    const existing = fieldValidationMap.get(note.fieldName) ?? [];
    existing.push(note);
    fieldValidationMap.set(note.fieldName, existing);
  }

  function fieldNotes(fieldName: string) {
    return fieldValidationMap.get(fieldName) ?? [];
  }

  function withValidationTone(baseClassName: string, fieldName: string) {
    return fieldNotes(fieldName).length > 0
      ? `${baseClassName} border-amber-300 bg-amber-50/30 focus:border-amber-500`
      : baseClassName;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Review leftovers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress?.categories.unmapped ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {compactMetric("Review leftovers", progress.categories.unmapped)}
            </div>
          ) : null}

          {groups.map((group) => {
            const unresolved = group.items.filter((item) => item.status === "unresolved").length;
            const resolved = group.items.filter((item) => item.status === "resolved").length;

            return (
              <div
                className={`rounded-2xl border p-4 ${
                  unresolved > 0 ? "border-amber-200 bg-amber-50/20" : "border-border/70 bg-background/80"
                }`}
                key={group.key}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{group.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      {unresolved} unresolved
                    </span>
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {resolved} resolved
                    </span>
                  </div>
                </div>

                {group.items.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
                    No items currently belong to this queue section for the selected artifact.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {group.items.map((item) => (
                      <div className={`rounded-2xl border p-4 ${queueItemTone(item)}`} key={item.id}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                                  item.selectedAction === "blocked"
                                    ? "border-rose-200 bg-rose-100 text-rose-700"
                                    : item.status === "resolved"
                                      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                                      : "border-amber-200 bg-amber-100 text-amber-700"
                                }`}
                              >
                                {item.status === "resolved" && item.selectedAction !== "blocked" ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <CircleAlert className="h-4 w-4" />
                                )}
                              </span>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {item.actionScope === "section" ? "Source section" : "Candidate issue"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                            <p className="mt-2 text-xs text-muted-foreground">{item.context}</p>
                            {item.dispositionLabel ? (
                              <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                Disposition: {item.dispositionLabel}
                              </p>
                            ) : null}
                            {item.dispositionLabel === "blocked" ? (
                              <p className="mt-2 text-xs text-rose-700">
                                This item remains in the queue and continues to block import approval.
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                item.selectedAction === "blocked"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : item.status === "resolved"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {item.selectedAction === "blocked" ? "blocked" : item.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {item.actionScope === "section" ? (
                            <Button asChild className="gap-2" size="sm" variant="secondary">
                              <Link href={item.href} prefetch={false}>
                                View source section
                                <GitBranch className="h-4 w-4" />
                              </Link>
                            </Button>
                          ) : item.actionScope === "candidate" ? (
                            <Button asChild className="gap-2" size="sm" variant="secondary">
                              <Link href={item.href} prefetch={false}>
                                Open fields to fix
                                <GitBranch className="h-4 w-4" />
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                        {item.actionScope === "section" ? (
                          <ArtifactIntakeDispositionButtons
                            actions={item.actions}
                            fileId={selectedFile.id}
                            initialAction={item.selectedAction}
                            initialStatus={item.status}
                            key={`${item.id}-section-actions`}
                            kind="section"
                            resolvedActions={item.resolvedActions}
                            sectionId={item.issueId}
                            submitSectionDisposition={submitSectionDispositionInlineAction}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="space-y-6">
          <CollapsibleReviewPanel defaultOpen={false} title="Full imported source artifact">
            <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                {selectedFile.sourceType ? label(selectedFile.sourceType) : label(selectedFile.sourceTypeStatus)}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                {selectedFile.extension}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                {selectedFile.uncertainSectionCount} uncertain section(s)
              </span>
            </div>

            {selectedFile.parsedArtifacts?.sections.length ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Source structure
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFile.parsedArtifacts.sections.map((section) => (
                    <Link
                      className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                      href={intakeHref(
                        session.id,
                        selectedFile.id,
                        selectedCandidate?.id ?? null,
                        `source-section-${section.id}`,
                        currentSelection
                      )}
                      key={section.id}
                      prefetch={false}
                    >
                      {section.sourceReference.sectionMarker}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 bg-slate-950 px-5 py-5 text-sm text-slate-100 shadow-inner">
              <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap break-words font-mono leading-6">{selectedFile.content}</pre>
            </div>

            {selectedFile.parsedArtifacts?.sections.length ? (
              <details className="group rounded-2xl border border-border/70 bg-muted/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Parsed sections</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Expand to inspect how each section was interpreted and whether it already became a candidate or
                      still needs a human decision.
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
                </summary>
                <div className="space-y-3 border-t border-border/70 px-4 py-4">
                  {selectedFile.parsedArtifacts.sections.map((section) => {
                    const sourceSectionId = section.sourceReference.sectionId;
                    const mappedCandidate = mappedSectionsBySourceId.get(sourceSectionId) ?? null;
                    const sectionState = mappedCandidate
                      ? {
                          badge: `${mappedCandidate.type} candidate`,
                          tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
                          description: `Already interpreted into ${mappedCandidate.title}. Adjust the candidate workspace if the governed fields need correction.`
                        }
                      : unmappedSourceSectionIds.has(sourceSectionId)
                        ? {
                            badge: "Review leftover",
                            tone: "border-amber-200 bg-amber-50 text-amber-800",
                            description:
                              "This section could not be placed confidently into a mapped Outcome, Epic, or Story candidate. Review it in the Correction queue, then absorb it, dismiss it, or keep it pending."
                          }
                        : {
                            badge: "Supporting context",
                            tone: "border-border/70 bg-muted/20 text-muted-foreground",
                            description:
                              "Parsed for traceability, but not currently treated as a standalone candidate or queue item."
                          };

                    return (
                      <div
                        className="rounded-2xl border border-border/70 bg-background/80 p-4"
                        id={`source-section-${section.id}`}
                        key={section.id}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{section.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {section.sourceReference.sectionMarker} - lines {section.sourceReference.lineStart}-
                              {section.sourceReference.lineEnd}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                              {label(section.kind)}
                            </span>
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${confidenceTone(section.confidence)}`}
                            >
                              {section.confidence}
                            </span>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${sectionState.tone}`}>
                              {sectionState.badge}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{sectionState.description}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{section.text}</p>
                      </div>
                    );
                  })}
                </div>
              </details>
            ) : null}
            </div>
          </CollapsibleReviewPanel>
        </div>

        <div className="space-y-6">
          {selectedCandidate ? (
            <form action={submitAction} className="space-y-4" id="candidate-editor">
              <input name="sessionId" type="hidden" value={session.id} />
              <input name="fileId" type="hidden" value={selectedFile.id} />
              <input name="candidateId" type="hidden" value={selectedCandidate.id} />
              <input name="candidateType" type="hidden" value={selectedCandidate.type} />

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Save and approve import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Imported record</p>
                    {fieldValidationNotes.length > 0 ? (
                      <p className="mt-1 text-sm text-amber-700">
                        Needs review: {[...new Set(fieldValidationNotes.map((note) => note.label))].join(", ")}
                      </p>
                    ) : null}
                  </div>

                  {!quickEditFieldNames.has("key") ? (
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Key</span>
                      <input
                        className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "key")}
                        defaultValue={selectedCandidateKeyValue}
                        name="key"
                        type="text"
                      />
                      {fieldNotes("key").map((note) => (
                        <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                          {note.message}
                        </p>
                      ))}
                      {selectedCandidate.type === "story" && !selectedCandidate.draftRecord?.key ? (
                        <p className="text-xs text-muted-foreground">
                          Suggested import key. It stays visibly separate from native Story keys.
                        </p>
                      ) : null}
                    </label>
                  ) : null}
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "title")}
                      defaultValue={selectedCandidate.draftRecord?.title ?? selectedCandidate.title}
                      name="title"
                      type="text"
                    />
                    {fieldNotes("title").map((note) => (
                      <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                        {note.message}
                      </p>
                    ))}
                  </label>

                  {selectedCandidate.type === "outcome" ? (
                    <>
                      {!quickEditFieldNames.has("outcomeStatement") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Outcome statement</span>
                          <textarea
                            className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "outcomeStatement")}
                            defaultValue={selectedCandidate.draftRecord?.outcomeStatement ?? ""}
                            name="outcomeStatement"
                          />
                          {fieldNotes("outcomeStatement").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      {!quickEditFieldNames.has("baselineDefinition") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Baseline definition</span>
                          <textarea
                            className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "baselineDefinition")}
                            defaultValue={selectedCandidate.draftRecord?.baselineDefinition ?? ""}
                            name="baselineDefinition"
                          />
                          {fieldNotes("baselineDefinition").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      {!quickEditFieldNames.has("baselineSource") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Baseline source</span>
                          <textarea
                            className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "baselineSource")}
                            defaultValue={selectedCandidate.draftRecord?.baselineSource ?? ""}
                            name="baselineSource"
                          />
                          {fieldNotes("baselineSource").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                    </>
                  ) : null}

                  {selectedCandidate.type === "epic" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Purpose</span>
                        <textarea
                          className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "purpose")}
                          defaultValue={selectedCandidate.draftRecord?.purpose ?? ""}
                          name="purpose"
                        />
                        {fieldNotes("purpose").map((note) => (
                          <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                            {note.message}
                          </p>
                        ))}
                      </label>
                      {!quickEditFieldNames.has("scopeBoundary") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Scope boundary</span>
                          <textarea
                            className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "scopeBoundary")}
                            defaultValue={selectedCandidate.draftRecord?.scopeBoundary ?? ""}
                            name="scopeBoundary"
                          />
                          {fieldNotes("scopeBoundary").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Risk note</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.riskNote ?? ""}
                          name="riskNote"
                        />
                      </label>
                      <div className="pt-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Destination</p>
                      </div>
                      {!quickEditFieldNames.has("outcomeCandidateId") ? (
                        outcomeCandidateOptions.length === 1 && selectedOutcomeCandidateId ? (
                          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-foreground">
                            <input name="outcomeCandidateId" type="hidden" value={selectedOutcomeCandidateId} />
                            <p className="font-medium">Outcome destination</p>
                            <p className="mt-1 text-muted-foreground">{describeProjectOutcome(outcomeCandidateOptions[0]!)}</p>
                          </div>
                        ) : (
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Linked imported Outcome</span>
                            <select
                              className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "outcomeCandidateId")}
                              defaultValue={selectedOutcomeCandidateId}
                              name="outcomeCandidateId"
                            >
                              <option value="">Select project Outcome</option>
                              {outcomeCandidateOptions.map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>
                                  {describeProjectOutcome(candidate)}
                                </option>
                              ))}
                            </select>
                            {fieldNotes("outcomeCandidateId").map((note) => (
                              <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                                {note.message}
                              </p>
                            ))}
                          </label>
                        )
                      ) : null}
                    </>
                  ) : null}

                  {selectedCandidate.type === "story" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Story type</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.storyType ?? "outcome_delivery"}
                          name="storyType"
                        >
                          <option value="outcome_delivery">Outcome delivery</option>
                          <option value="governance">Governance</option>
                          <option value="enablement">Enablement</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Value intent</span>
                        <textarea
                          className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "valueIntent")}
                          defaultValue={selectedCandidate.draftRecord?.valueIntent ?? ""}
                          name="valueIntent"
                        />
                        {fieldNotes("valueIntent").map((note) => (
                          <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                            {note.message}
                          </p>
                        ))}
                      </label>
                      {!quickEditFieldNames.has("acceptanceCriteria") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                          <textarea
                            className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "acceptanceCriteria")}
                            defaultValue={(selectedCandidate.draftRecord?.acceptanceCriteria ?? []).join("\n")}
                            name="acceptanceCriteria"
                          />
                          {fieldNotes("acceptanceCriteria").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">AI usage scope</span>
                        <input
                          className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "aiUsageScope")}
                          defaultValue={(selectedCandidate.draftRecord?.aiUsageScope ?? []).join(", ")}
                          name="aiUsageScope"
                          type="text"
                        />
                      </label>
                      {!quickEditFieldNames.has("testDefinition") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Test Definition</span>
                          <textarea
                            className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "testDefinition")}
                            defaultValue={selectedCandidate.draftRecord?.testDefinition ?? ""}
                            name="testDefinition"
                          />
                          {fieldNotes("testDefinition").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      {!quickEditFieldNames.has("definitionOfDone") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Definition of Done</span>
                          <textarea
                            className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "definitionOfDone")}
                            defaultValue={(selectedCandidate.draftRecord?.definitionOfDone ?? []).join("\n")}
                            name="definitionOfDone"
                          />
                          {fieldNotes("definitionOfDone").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      <div className="pt-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Destination</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Outcome is fixed automatically when the project only has one Outcome. Choose the Epic once here.
                        </p>
                      </div>
                      {!quickEditFieldNames.has("outcomeCandidateId") || !quickEditFieldNames.has("epicCandidateId") ? (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {!quickEditFieldNames.has("outcomeCandidateId") ? (
                              outcomeCandidateOptions.length === 1 && selectedOutcomeCandidateId ? (
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-foreground">
                                  <input name="outcomeCandidateId" type="hidden" value={selectedOutcomeCandidateId} />
                                  <p className="font-medium">Outcome destination</p>
                                  <p className="mt-1 text-muted-foreground">{describeProjectOutcome(outcomeCandidateOptions[0]!)}</p>
                                </div>
                              ) : (
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Linked imported Outcome</span>
                                  <select
                                    className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "outcomeCandidateId")}
                                    defaultValue={selectedOutcomeCandidateId}
                                    name="outcomeCandidateId"
                                  >
                                    <option value="">Select project Outcome</option>
                                    {outcomeCandidateOptions.map((candidate) => (
                                      <option key={candidate.id} value={candidate.id}>
                                        {describeProjectOutcome(candidate)}
                                      </option>
                                    ))}
                                  </select>
                                  {fieldNotes("outcomeCandidateId").map((note) => (
                                    <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                                      {note.message}
                                    </p>
                                  ))}
                                </label>
                              )
                            ) : null}
                            {!quickEditFieldNames.has("epicCandidateId") ? (
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Linked imported Epic</span>
                                <select
                                  className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "epicCandidateId")}
                                  defaultValue={selectedEpicCandidateId}
                                  name="epicCandidateId"
                                >
                                  <option value="">Select project Epic</option>
                                  {epicCandidateOptions.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                      {describeProjectEpic(candidate)}
                                    </option>
                                  ))}
                                </select>
                                {fieldNotes("epicCandidateId").map((note) => (
                                  <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                                    {note.message}
                                  </p>
                                ))}
                              </label>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : null}
                  {showHumanDecisionFields ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-foreground">Human-only decisions</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                      {!quickEditFieldNames.has("valueOwnerId") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Value Owner</span>
                          <input
                            className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "valueOwnerId")}
                            defaultValue={selectedCandidate.humanDecisions?.valueOwnerId ?? ""}
                            name="valueOwnerId"
                            type="text"
                          />
                          {fieldNotes("valueOwnerId").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      {!quickEditFieldNames.has("baselineValidity") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Baseline validity</span>
                          <select
                            className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "baselineValidity")}
                            defaultValue={selectedCandidate.humanDecisions?.baselineValidity ?? ""}
                            name="baselineValidity"
                          >
                            <option value="">Unresolved</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="needs_follow_up">Needs follow-up</option>
                          </select>
                          {fieldNotes("baselineValidity").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      {!quickEditFieldNames.has("aiAccelerationLevel") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">AI level</span>
                          <select
                            className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "aiAccelerationLevel")}
                            defaultValue={selectedCandidate.humanDecisions?.aiAccelerationLevel ?? ""}
                            name="aiAccelerationLevel"
                          >
                            <option value="">Unresolved</option>
                            <option value="level_1">Level 1</option>
                            <option value="level_2">Level 2</option>
                            <option value="level_3">Level 3</option>
                          </select>
                          {fieldNotes("aiAccelerationLevel").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      {!quickEditFieldNames.has("riskProfile") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Risk profile</span>
                          <select
                            className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "riskProfile")}
                            defaultValue={selectedCandidate.humanDecisions?.riskProfile ?? ""}
                            name="riskProfile"
                          >
                            <option value="">Unresolved</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          {fieldNotes("riskProfile").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      {!quickEditFieldNames.has("riskAcceptanceStatus") ? (
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Risk acceptance status</span>
                          <select
                            className={withValidationTone("h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary", "riskAcceptanceStatus")}
                            defaultValue={selectedCandidate.humanDecisions?.riskAcceptanceStatus ?? ""}
                            name="riskAcceptanceStatus"
                          >
                            <option value="">Unresolved</option>
                            <option value="accepted">Accepted</option>
                            <option value="needs_review">Needs review</option>
                          </select>
                          {fieldNotes("riskAcceptanceStatus").map((note) => (
                            <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                              {note.message}
                            </p>
                          ))}
                        </label>
                      ) : null}
                      </div>
                    </div>
                  ) : null}

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Review comment</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={selectedCandidate.reviewComment ?? ""}
                      name="reviewComment"
                    />
                  </label>

                  <ArtifactIntakeReviewSubmitButtons />

                  {selectedCandidate.promotedEntityId ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                      Imported into the project as governed {selectedCandidate.promotedEntityType} with ID{" "}
                      {selectedCandidate.promotedEntityId}. It now continues like native project work.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </form>
          ) : (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>No mapped candidate selected</CardTitle>
                <CardDescription>
                  Full source and the correction queue stay available even when the selected artifact currently has no
                  candidate to edit.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
