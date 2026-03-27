import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, GitBranch, ShieldCheck } from "lucide-react";
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

function bytes(value: number) {
  return value < 1024 ? `${value} B` : `${(value / 1024).toFixed(1)} KB`;
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

function fieldTone(kind: "neutral" | "resolved" | "missing" | "uncertain") {
  if (kind === "resolved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (kind === "missing") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }
  if (kind === "uncertain") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-border/70 bg-muted/20 text-muted-foreground";
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function hasItems(value: string[] | null | undefined) {
  return Boolean(value && value.length > 0);
}

function value(value: string | string[] | null) {
  if (Array.isArray(value)) {
    return value.length ? value.join("\n") : "Not set";
  }
  return value && value.trim() ? value : "Not set";
}

function candidateFields(candidate: IntakeArtifactCandidate) {
  const draft = candidate.draftRecord;
  const decisions = candidate.humanDecisions;
  const uncertain =
    candidate.mappingState !== "mapped" ||
    candidate.relationshipState !== "mapped" ||
    candidate.source.confidence !== "high";

  if (candidate.type === "outcome") {
    return [
      ["Key", draft?.key ?? null, !hasText(draft?.key) ? "missing" : "resolved"],
      ["Title", draft?.title ?? candidate.title, "neutral"],
      ["Outcome statement", draft?.outcomeStatement ?? null, !hasText(draft?.outcomeStatement) ? "missing" : uncertain ? "uncertain" : "resolved"],
      ["Baseline definition", draft?.baselineDefinition ?? null, !hasText(draft?.baselineDefinition) ? "missing" : "resolved"],
      ["Baseline source", draft?.baselineSource ?? null, !hasText(draft?.baselineSource) ? "missing" : "resolved"],
      ["Value Owner", decisions?.valueOwnerId ?? null, !hasText(decisions?.valueOwnerId) ? "missing" : "resolved"]
    ] as const;
  }

  if (candidate.type === "epic") {
    return [
      ["Key", draft?.key ?? null, !hasText(draft?.key) ? "missing" : "resolved"],
      ["Title", draft?.title ?? candidate.title, "neutral"],
      ["Purpose", draft?.purpose ?? candidate.summary, uncertain ? "uncertain" : "neutral"],
      ["Scope boundary", draft?.scopeBoundary ?? null, !hasText(draft?.scopeBoundary) ? "missing" : "resolved"],
      ["Risk note", draft?.riskNote ?? null, "neutral"],
      ["Linked Outcome candidate", draft?.outcomeCandidateId ?? null, !hasText(draft?.outcomeCandidateId) ? "missing" : candidate.relationshipState !== "mapped" ? "uncertain" : "resolved"]
    ] as const;
  }

  return [
    ["Key", draft?.key ?? null, !hasText(draft?.key) ? "missing" : "resolved"],
    ["Title", draft?.title ?? candidate.title, "neutral"],
    ["Story type", draft?.storyType ?? null, "neutral"],
    ["Value intent", draft?.valueIntent ?? candidate.summary, uncertain ? "uncertain" : "neutral"],
    ["Acceptance criteria", draft?.acceptanceCriteria ?? [], !hasItems(draft?.acceptanceCriteria) ? "missing" : "resolved"],
    ["AI usage scope", draft?.aiUsageScope ?? [], "neutral"],
    ["Test Definition", draft?.testDefinition ?? null, !hasText(draft?.testDefinition) ? "missing" : "resolved"],
    ["Definition of Done", draft?.definitionOfDone ?? [], !hasItems(draft?.definitionOfDone) ? "missing" : "resolved"],
    ["Linked Outcome candidate", draft?.outcomeCandidateId ?? null, !hasText(draft?.outcomeCandidateId) ? "missing" : candidate.relationshipState !== "mapped" ? "uncertain" : "resolved"],
    ["Linked Epic candidate", draft?.epicCandidateId ?? null, !hasText(draft?.epicCandidateId) ? "missing" : candidate.relationshipState !== "mapped" ? "uncertain" : "resolved"]
  ] as const;
}

function dispositionLabel(action: string | null | undefined) {
  if (!action) {
    return null;
  }

  return label(action);
}

function findingResolved(input: {
  category: "missing" | "uncertain" | "human_only" | "blocked";
  action: string | null | undefined;
}) {
  if (!input.action || input.action === "pending" || input.action === "blocked") {
    return false;
  }

  if (input.category === "human_only") {
    return false;
  }

  if (input.category === "missing") {
    return input.action === "not_relevant";
  }

  if (input.category === "blocked") {
    return input.action === "not_relevant";
  }

  return input.action === "confirmed" || input.action === "not_relevant";
}

function issueActions(category: "missing" | "uncertain" | "human_only" | "blocked") {
  if (category === "missing") {
    return [
      { label: "Not relevant", value: "not_relevant" as const },
      { label: "Keep pending", value: "pending" as const },
      { label: "Mark blocker", value: "blocked" as const }
    ];
  }

  if (category === "human_only") {
    return [
      { label: "Keep pending", value: "pending" as const },
      { label: "Mark blocker", value: "blocked" as const }
    ];
  }

  return [
    { label: "Confirm", value: "confirmed" as const },
    { label: "Not relevant", value: "not_relevant" as const },
    { label: "Keep pending", value: "pending" as const },
    { label: "Mark blocker", value: "blocked" as const }
  ];
}

function queueItems(
  session: IntakeArtifactSession,
  file: IntakeArtifactFile,
  candidates: IntakeArtifactCandidate[],
  currentSelection?: {
    sessionId: string;
    fileId: string;
    candidateId: string | null;
  }
) {
  const items: Array<{ key: string; title: string; description: string; items: QueueItem[] }> = [];
  const baseCandidateId = candidates[0]?.id ?? null;

  items.push({
    key: "unmapped",
    title: "Sections not yet absorbed into a candidate",
    description: "These source sections are still outside any mapped Outcome, Epic, or Story candidate and need a human decision.",
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

  items.push({
    key: "required",
    title: "Candidate issues",
    description: "Each remaining issue now has an explicit action path instead of staying as passive uncertainty.",
    items: candidates.flatMap((candidate) =>
      (candidate.complianceResult?.findings ?? []).map((finding) => {
        const action = candidate.issueDispositions[finding.code]?.action;
        const resolved = findingResolved({
          category: finding.category,
          action
        });

        return {
          id: `${candidate.id}-${finding.code}`,
          title: finding.fieldLabel ?? "Imported issue",
          description: finding.message,
          context: candidate.title,
          status: resolved ? ("resolved" as const) : ("unresolved" as const),
          href: intakeHref(session.id, file.id, candidate.id, "candidate-editor", currentSelection),
          selectedAction: action ?? null,
          dispositionLabel: dispositionLabel(action),
          resolvedActions:
            finding.category === "uncertain"
              ? ["confirmed", "not_relevant"]
              : finding.category === "missing" || finding.category === "blocked"
                ? ["not_relevant"]
                : [],
          actionScope: "candidate" as const,
          candidateId: candidate.id,
          candidateType: candidate.type,
          issueId: finding.code,
          actions: issueActions(finding.category)
        };
      })
    )
  });

  return items;
}

function readiness(candidate: IntakeArtifactCandidate, file: IntakeArtifactFile, session: IntakeArtifactSession) {
  const compliance = candidate.complianceResult;
  if (!compliance) {
    return ["border-amber-200 bg-amber-50 text-amber-900", "Correction state unavailable", "Persisted compliance analysis is missing for this candidate."] as const;
  }
  const unmappedSectionCount = (session.mappedArtifacts?.unmappedSections ?? []).filter(
    (section) => section.sourceReference.fileId === file.id
  ).length;
  const progress = getArtifactCandidateIssueProgress({
    complianceResult: compliance,
    issueDispositions: candidate.issueDispositions,
    unmappedSectionCount,
    sectionDispositions: file.sectionDispositions
  });
  if (candidate.reviewStatus === "promoted") {
    return ["border-emerald-200 bg-emerald-50 text-emerald-900", "Already promoted", `This candidate has already been promoted into governed ${candidate.promotedEntityType ?? candidate.type} work.`] as const;
  }
  if (candidate.reviewStatus === "rejected" || candidate.importedReadinessState === "discarded") {
    return ["border-rose-200 bg-rose-50 text-rose-900", "Discarded or rejected", "This imported candidate has been explicitly taken out of the active promotion path."] as const;
  }
  if (candidate.importedReadinessState === "blocked" || progress.categories.blocked > 0) {
    return ["border-rose-200 bg-rose-50 text-rose-900", "Blocked by human decision", "Blocking issues or blocked section dispositions still prevent promotion."] as const;
  }
  if (
    candidate.importedReadinessState === "imported_incomplete" ||
    candidate.importedReadinessState === "imported_human_review_needed" ||
    progress.unresolved > 0
  ) {
    return [
      "border-amber-200 bg-amber-50 text-amber-900",
      "Not ready for promotion",
      `${progress.unresolved} unresolved item(s) still remain across missing fields, uncertainty, human-only confirmation, or unmapped source work.`
    ] as const;
  }
  if (
    candidate.importedReadinessState === "imported_framing_ready" ||
    candidate.importedReadinessState === "imported_design_ready" ||
    candidate.reviewStatus === "confirmed" ||
    candidate.reviewStatus === "edited"
  ) {
    return ["border-emerald-200 bg-emerald-50 text-emerald-900", "Ready for promotion", "Required correction work looks complete and the candidate is ready for explicit promotion."] as const;
  }
  return ["border-sky-200 bg-sky-50 text-sky-900", "Awaiting explicit human confirmation", "The candidate can now be reviewed directly against the source artifact."] as const;
}

function candidateLinkageState(candidate: IntakeArtifactCandidate) {
  const relationshipDisposition = candidate.issueDispositions["candidate_relationship_uncertain"]?.action;
  const hasExplicitOutcomeLink = Boolean(candidate.draftRecord?.outcomeCandidateId?.trim());
  const hasExplicitEpicLink = Boolean(candidate.draftRecord?.epicCandidateId?.trim());
  const hasExplicitProjectLinkage =
    candidate.type === "story"
      ? hasExplicitOutcomeLink && hasExplicitEpicLink
      : candidate.type === "epic"
        ? hasExplicitOutcomeLink
        : true;

  if (
    hasExplicitProjectLinkage &&
    (relationshipDisposition === "confirmed" || relationshipDisposition === "corrected" || relationshipDisposition === "not_relevant")
  ) {
    return {
      label: "Linkage confirmed in review",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
      description: "This candidate has explicit project linkage recorded in review and no longer depends on inferred file context."
    } as const;
  }

  if (hasExplicitProjectLinkage && candidate.relationshipState !== "mapped") {
    return {
      label: "Explicitly linked in workspace",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
      description: "Outcome/Epic links are filled explicitly in the review workspace even if the original file inference stayed incomplete."
    } as const;
  }

  if (candidate.relationshipState === "missing") {
    return {
      label: "Unlinked import candidate",
      tone: "border-rose-200 bg-rose-50 text-rose-800",
      description: "This candidate was extracted from the file, but it is not yet connected to the needed Outcome/Epic context."
    } as const;
  }

  if (candidate.relationshipState === "uncertain") {
    return {
      label: "Linkage needs confirmation",
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      description: "The nearest Outcome/Epic linkage was inferred, but it still needs human confirmation."
    } as const;
  }

  return {
    label: "Linkage looks connected",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    description: "This candidate is already connected to the inferred Value Spine context."
  } as const;
}

function describeProjectOutcome(option: ProjectOutcomeOption) {
  return `${option.key} - ${option.title}`;
}

function describeProjectEpic(option: ProjectEpicOption) {
  return `${option.key} - ${option.title}`;
}

function CollapsibleReviewPanel(props: {
  title: string;
  description: string;
  defaultOpen?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-background shadow-sm" open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
        <div>
          <h3 className="font-semibold text-foreground">{props.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-6 py-5">{props.children}</div>
    </details>
  );
}

export function ArtifactIntakeReviewWorkspace({
  session,
  selectedFile,
  fileCandidates,
  projectOutcomes,
  projectEpics,
  selectedCandidate,
  submitAction,
  submitCandidateDispositionInlineAction,
  submitSectionDispositionInlineAction
}: ArtifactIntakeReviewWorkspaceProps) {
  const currentSelection = {
    sessionId: session.id,
    fileId: selectedFile.id,
    candidateId: selectedCandidate?.id ?? null
  };
  const groups = queueItems(session, selectedFile, fileCandidates, currentSelection);
  const ready = selectedCandidate ? readiness(selectedCandidate, selectedFile, session) : null;
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
  const selectedProjectOutcome = outcomeCandidateOptions.find((candidate) => candidate.id === selectedOutcomeCandidateId) ?? null;
  const selectedProjectEpic = epicCandidateOptions.find((candidate) => candidate.id === selectedEpicCandidateId) ?? null;
  const mappedSectionsBySourceId = new Map(
    fileCandidates.map((candidate) => [candidate.source.sectionId, candidate] as const)
  );
  const unmappedSourceSectionIds = new Set(
    (session.mappedArtifacts?.unmappedSections ?? [])
      .filter((section) => section.sourceReference.fileId === selectedFile.id)
      .map((section) => section.sourceReference.sectionId)
  );
  const promotionSummary =
    selectedCandidate?.type === "story"
      ? selectedProjectOutcome && selectedProjectEpic
        ? `Approving this import will create or update a governed Story under ${selectedProjectOutcome.key} and ${selectedProjectEpic.key}. After approval it should be treated like other project Stories and continue through the normal Story review and handoff flow.`
        : "Approving this import will bring the Story into the project as governed work. Confirm the destination Outcome and Epic first so the imported Story lands in the correct branch."
      : selectedCandidate?.type === "epic"
        ? selectedProjectOutcome
          ? `Approving this import will create or update a governed Epic under ${selectedProjectOutcome.key}. After approval it should be treated like other project Epics inside the active Framing branch.`
          : "Approving this import will bring the Epic into the project as governed work. Confirm the destination Outcome first so the Epic lands in the correct Framing branch."
        : selectedCandidate?.type === "outcome"
          ? "Approving this import will create or update a governed Outcome in the project. After approval it continues through the same Tollgate 1 and review process as native Outcomes."
          : null;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-muted/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Artifact-scoped project review
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Current artifact context</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review stays scoped to one imported artifact at a time so full source, interpreted candidates, and the
              correction queue stay aligned.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {selectedFile.fileName}
            </span>
            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {bytes(selectedFile.sizeBytes)}
            </span>
            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {selectedFile.parsedSectionCount} parsed sections
            </span>
            {selectedFile.sourceTypeConfidence ? (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${confidenceTone(selectedFile.sourceTypeConfidence)}`}
              >
                {selectedFile.sourceTypeConfidence} confidence
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Correction queue</CardTitle>
          <CardDescription>
            Start here. Clear linkage, content gaps, human-only decisions, and truly leftover source sections before you approve the import into the project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
            <p className="font-medium">How to work this queue</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Start with destination and linkage so the imported candidate belongs to the right Outcome and Epic.</li>
              <li>Resolve real content gaps such as missing Test Definition, Definition of Done, or baseline fields.</li>
              <li>Use <strong>Confirm</strong> when an interpretation is correct and you want it accepted.</li>
              <li>Use <strong>Not relevant</strong> when a finding or source section should be dismissed from the queue.</li>
              <li>Use <strong>Mark blocker</strong> only when you want the import to stay visible and intentionally stop promotion.</li>
            </ol>
          </div>
          {progress ? (
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Remaining</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{progress.unresolved}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resolved</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{progress.resolved}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Blocked</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{progress.categories.blocked}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Still intentionally stopping promotion.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Progress</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {progress.total > 0 ? Math.round((progress.resolved / progress.total) * 100) : 100}%
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Missing</p>
                  <p className="mt-1 font-semibold text-foreground">{progress.categories.missing}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Uncertain</p>
                  <p className="mt-1 font-semibold text-foreground">{progress.categories.uncertain}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Human-only</p>
                  <p className="mt-1 font-semibold text-foreground">{progress.categories.humanOnly}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Outside candidate</p>
                  <p className="mt-1 font-semibold text-foreground">{progress.categories.unmapped}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Source sections not yet absorbed into a candidate.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total tracked</p>
                  <p className="mt-1 font-semibold text-foreground">{progress.total}</p>
                </div>
              </div>
            </div>
          ) : null}

          {groups.map((group) => {
            const unresolved = group.items.filter((item) => item.status === "unresolved").length;
            const resolved = group.items.filter((item) => item.status === "resolved").length;

            return (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={group.key}>
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
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    No items currently belong to this queue section for the selected artifact.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {group.items.map((item) => (
                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
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
                          <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                            {item.actionScope === "section" ? "Source section" : "Candidate issue"}
                          </span>
                        </div>
                        <Button asChild className="mt-3 gap-2" size="sm" variant="secondary">
                          <Link href={item.href} prefetch={false}>
                            Open in context
                            <GitBranch className="h-4 w-4" />
                          </Link>
                        </Button>
                        {item.actionScope === "candidate" && item.candidateId && item.candidateType ? (
                          <ArtifactIntakeDispositionButtons
                            actions={item.actions}
                            candidateId={item.candidateId}
                            candidateType={item.candidateType}
                            initialAction={item.selectedAction}
                            initialStatus={item.status}
                            issueId={item.issueId}
                            key={`${item.id}-candidate-actions`}
                            kind="candidate"
                            resolvedActions={item.resolvedActions}
                            submitCandidateDisposition={submitCandidateDispositionInlineAction}
                          />
                        ) : null}
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

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        <div className="order-2 space-y-6 2xl:order-1">
          <CollapsibleReviewPanel
            defaultOpen={false}
            description="Expand the original markdown only when you need full-source verification or line-by-line context."
            title="Full imported source artifact"
          >
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
                            badge: "Needs human decision",
                            tone: "border-amber-200 bg-amber-50 text-amber-800",
                            description:
                              "Still outside any mapped Outcome, Epic, or Story candidate. Use the Correction queue to absorb it, dismiss it, or intentionally keep it blocked."
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

        <div className="order-1 space-y-6 2xl:order-2">
          <CollapsibleReviewPanel
            defaultOpen
            description="Compare the imported interpretation with the governed fields that will be saved into the project."
            title="Structured candidate view"
          >
            <div className="space-y-4" id="candidate-panel">
              {fileCandidates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {fileCandidates.map((candidate) => (
                    <Button
                      asChild
                      className="gap-2"
                      key={candidate.id}
                      size="sm"
                      variant={candidate.id === selectedCandidate?.id ? "default" : "secondary"}
                    >
                      <Link href={intakeHref(session.id, selectedFile.id, candidate.id, "candidate-panel")} prefetch={false}>
                        {candidate.type}: {candidate.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : null}
              {selectedCandidate ? (
                <>
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {selectedCandidate.type}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">{selectedCandidate.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedCandidate.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${confidenceTone(selectedCandidate.source.confidence)}`}
                        >
                          {selectedCandidate.source.confidence} confidence
                        </span>
                        <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {selectedCandidate.reviewStatus}
                        </span>
                        {selectedCandidate.importedReadinessState ? (
                          <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {ready?.[1] ?? label(selectedCandidate.importedReadinessState)}
                          </span>
                        ) : null}
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${candidateLinkageState(selectedCandidate).tone}`}
                        >
                          {candidateLinkageState(selectedCandidate).label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {candidateLinkageState(selectedCandidate).description}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {candidateFields(selectedCandidate).map(([fieldLabel, fieldValue, tone]) => (
                      <div className={`rounded-2xl border p-4 ${fieldTone(tone)}`} key={fieldLabel}>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{fieldLabel}</p>
                        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 font-sans">{value(fieldValue)}</pre>
                      </div>
                    ))}
                  </div>

                  {selectedCandidate.relationshipNote ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                      <strong className="text-foreground">Relationship note:</strong> {selectedCandidate.relationshipNote}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                  No mapped candidate is currently attached to this artifact file. The source view remains available while
                  unmapped sections are reviewed.
                </div>
              )}
            </div>
          </CollapsibleReviewPanel>

          {selectedCandidate ? (
            <form action={submitAction} className="space-y-4" id="candidate-editor">
              <input name="sessionId" type="hidden" value={session.id} />
              <input name="fileId" type="hidden" value={selectedFile.id} />
              <input name="candidateId" type="hidden" value={selectedCandidate.id} />
              <input name="candidateType" type="hidden" value={selectedCandidate.type} />

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Correction workspace and approval</CardTitle>
                  <CardDescription>
                    Human corrections are persisted here before approval. Approving the import is the moment it becomes
                    governed project work and continues through the same review path as native records.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ready ? (
                    <div className={`rounded-2xl border px-4 py-4 text-sm ${ready[0]}`}>
                      <p className="font-medium">{ready[1]}</p>
                      <p className="mt-2">{ready[2]}</p>
                    </div>
                  ) : null}

                  {promotionSummary ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                      <p className="font-medium">What approval does</p>
                      <p className="mt-2">{promotionSummary}</p>
                    </div>
                  ) : null}

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Key</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={selectedCandidate.draftRecord?.key ?? ""}
                      name="key"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={selectedCandidate.draftRecord?.title ?? selectedCandidate.title}
                      name="title"
                      type="text"
                    />
                  </label>

                  {selectedCandidate.type === "outcome" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Outcome statement</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.outcomeStatement ?? ""}
                          name="outcomeStatement"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Baseline definition</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.baselineDefinition ?? ""}
                          name="baselineDefinition"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Baseline source</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.baselineSource ?? ""}
                          name="baselineSource"
                        />
                      </label>
                    </>
                  ) : null}

                  {selectedCandidate.type === "epic" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Purpose</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.purpose ?? ""}
                          name="purpose"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Scope boundary</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.scopeBoundary ?? ""}
                          name="scopeBoundary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Risk note</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.riskNote ?? ""}
                          name="riskNote"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Linked imported Outcome</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
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
                      </label>
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
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.valueIntent ?? ""}
                          name="valueIntent"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={(selectedCandidate.draftRecord?.acceptanceCriteria ?? []).join("\n")}
                          name="acceptanceCriteria"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">AI usage scope</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={(selectedCandidate.draftRecord?.aiUsageScope ?? []).join(", ")}
                          name="aiUsageScope"
                          type="text"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Test Definition</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.testDefinition ?? ""}
                          name="testDefinition"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Definition of Done</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={(selectedCandidate.draftRecord?.definitionOfDone ?? []).join("\n")}
                          name="definitionOfDone"
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Linked imported Outcome</span>
                          <select
                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
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
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Linked imported Epic</span>
                          <select
                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
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
                        </label>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Choose the project Outcome and Epic this imported work should land in. If there is only one
                        available option, it is preselected automatically.
                      </p>
                    </>
                  ) : null}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Human-only decisions</p>
                    </div>
                    <div className="grid gap-4">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Value Owner</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.valueOwnerId ?? ""}
                          name="valueOwnerId"
                          type="text"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Baseline validity</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.baselineValidity ?? ""}
                          name="baselineValidity"
                        >
                          <option value="">Unresolved</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="needs_follow_up">Needs follow-up</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">AI level</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.aiAccelerationLevel ?? ""}
                          name="aiAccelerationLevel"
                        >
                          <option value="">Unresolved</option>
                          <option value="level_1">Level 1</option>
                          <option value="level_2">Level 2</option>
                          <option value="level_3">Level 3</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Risk profile</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.riskProfile ?? ""}
                          name="riskProfile"
                        >
                          <option value="">Unresolved</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Risk acceptance status</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.riskAcceptanceStatus ?? ""}
                          name="riskAcceptanceStatus"
                        >
                          <option value="">Unresolved</option>
                          <option value="accepted">Accepted</option>
                          <option value="needs_review">Needs review</option>
                        </select>
                      </label>
                    </div>
                  </div>

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
