import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, CircleAlert, GitBranch, ShieldCheck } from "lucide-react";
import type {
  ArtifactCarryForwardItem,
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
  importIntent?: "framing" | "design";
  mappedArtifacts: {
    carryForwardItems?: ArtifactCarryForwardItem[];
    unmappedSections: ParsedSection[];
  } | null;
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

const FALLBACK_EPIC_OPTION_VALUE = "__fallback_epic__";

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
  submitFramingBulkApproveAction?: ((formData: FormData) => Promise<void>) | undefined;
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

function promotedEntityLabel(
  candidateType: string,
  promotedEntityType: string | null | undefined,
  importIntent: "framing" | "design" | undefined
) {
  if (candidateType === "story" || promotedEntityType === "story") {
    return importIntent === "design" ? "Delivery Story" : "Story Idea";
  }

  return promotedEntityType ? label(promotedEntityType) : "record";
}

function importedStoryLabel(importIntent: "framing" | "design" | undefined) {
  return importIntent === "design" ? "Delivery Story" : "Story Idea";
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

  return `SC-${String(sequence).padStart(3, "0")}`;
}

function buildSuggestedCandidateKey(session: IntakeArtifactSession, candidate: IntakeArtifactCandidate | null) {
  if (!candidate) {
    return "";
  }

  if (candidate.type === "story") {
    return buildSuggestedImportedStoryKey(session, candidate);
  }

  const typedCandidates = session.allCandidates.filter((entry) => entry.type === candidate.type);
  const index = typedCandidates.findIndex((entry) => entry.id === candidate.id);
  const sequence = index >= 0 ? index + 1 : typedCandidates.length + 1;
  const prefix = candidate.type === "outcome" ? "OUT" : "EPC";
  return `${prefix}-${String(sequence).padStart(3, "0")}`;
}

function isLegacyImportKey(value: string | null | undefined) {
  return /^IMP-(OUT|EPC|STR|STORY)-/i.test(value?.trim() ?? "");
}

function summarizeReviewText(value: string, maxLength = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function normalizeForComparison(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function mergeReviewParagraphs(values: Array<string | null | undefined>) {
  const paragraphs = values
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);

  return paragraphs.length > 0 ? [...new Set(paragraphs)].join("\n\n") : null;
}

function mergeReviewLines(values: Array<string | null | undefined>) {
  const lines = values
    .flatMap((value) => (value ?? "").split(/\r?\n+/))
    .map((value) => value.trim())
    .filter(Boolean);

  return lines.length > 0 ? [...new Set(lines)].join("\n") : null;
}

function storyIdeaDescription(candidate: IntakeArtifactCandidate) {
  const valueIntent = candidate.draftRecord?.valueIntent?.trim() ?? "";
  const expectedBehavior = candidate.draftRecord?.expectedBehavior?.trim() ?? "";
  const description = valueIntent || candidate.summary.trim();
  const normalizedTitle = normalizeForComparison(candidate.draftRecord?.title ?? candidate.title);
  const normalizedDescription = normalizeForComparison(description);
  const normalizedExpectedBehavior = normalizeForComparison(expectedBehavior);

  if (
    !normalizedDescription ||
    normalizedDescription === normalizedTitle ||
    (normalizedExpectedBehavior && normalizedDescription === normalizedExpectedBehavior)
  ) {
    return null;
  }

  return description;
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
          { label: "Reject", value: "not_relevant" as const },
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

function carryForwardDispositionState(action: string | null | undefined) {
  if (action === "confirmed" || action === "corrected") {
    return {
      status: "resolved" as const,
      tone: "border-emerald-200 bg-emerald-50/45 text-emerald-900"
    };
  }

  if (action === "not_relevant") {
    return {
      status: "resolved" as const,
      tone: "border-slate-200 bg-slate-50/45 text-slate-900"
    };
  }

  if (action === "blocked") {
    return {
      status: "unresolved" as const,
      tone: "border-rose-200 bg-rose-50/45 text-rose-900"
    };
  }

  return {
    status: "unresolved" as const,
    tone: "border-amber-200 bg-amber-50/45 text-amber-900"
  };
}

function groupLeftoversByKind(sections: ParsedSection[]) {
  const grouped = new Map<string, { title: string; count: number; preview: string }>();

  for (const section of sections) {
    const key = section.kind;
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
      continue;
    }

    grouped.set(key, {
      title: label(section.kind),
      count: 1,
      preview: summarizeReviewText(section.text, 140)
    });
  }

  return [...grouped.values()];
}

function carryForwardCategoryLabel(category: ArtifactCarryForwardItem["category"]) {
  if (category === "ux_principle") {
    return "UX principle";
  }

  if (category === "nfr_constraint") {
    return "Non-functional requirement";
  }

  if (category === "solution_constraint") {
    return "Solution constraint";
  }

  if (category === "additional_requirement") {
    return "Additional requirement";
  }

  return "Design input";
}

function carryForwardUseLabel(recommendedUse: ArtifactCarryForwardItem["recommendedUse"]) {
  if (recommendedUse === "cross_cutting_requirement") {
    return "Carry forward as cross-cutting requirement";
  }

  if (recommendedUse === "framing_constraint") {
    return "Carry forward as framing constraint";
  }

  return "Carry forward to design";
}

function collapseFramingCandidatesForDisplay(fileCandidates: IntakeArtifactCandidate[]) {
  const outcomeCandidates = fileCandidates.filter((candidate) => candidate.type === "outcome");

  if (outcomeCandidates.length <= 1) {
    return {
      candidates: fileCandidates,
      suppressedOutcomeCandidateIds: [] as string[]
    };
  }

  const primaryOutcome = outcomeCandidates[0]!;
  const suppressedOutcomeCandidateIds: string[] = [];
  const outcomeAliasMap = new Map<string, string>();
  let mergedPrimaryOutcome: IntakeArtifactCandidate = {
    ...primaryOutcome,
    draftRecord: primaryOutcome.draftRecord ? { ...primaryOutcome.draftRecord } : null
  };

  for (const secondaryOutcome of outcomeCandidates.slice(1)) {
    suppressedOutcomeCandidateIds.push(secondaryOutcome.id);
    outcomeAliasMap.set(secondaryOutcome.id, primaryOutcome.id);
    mergedPrimaryOutcome = {
      ...mergedPrimaryOutcome,
      title: mergedPrimaryOutcome.title.trim() || secondaryOutcome.title,
      summary: summarizeReviewText(
        mergeReviewParagraphs([
          mergedPrimaryOutcome.draftRecord?.outcomeStatement ?? mergedPrimaryOutcome.summary,
          secondaryOutcome.draftRecord?.outcomeStatement ?? secondaryOutcome.summary
        ]) ?? mergedPrimaryOutcome.summary
      ),
      draftRecord: mergedPrimaryOutcome.draftRecord
        ? {
            ...mergedPrimaryOutcome.draftRecord,
            title:
              mergedPrimaryOutcome.draftRecord.title?.trim() ||
              secondaryOutcome.draftRecord?.title ||
              secondaryOutcome.title,
            problemStatement: mergeReviewParagraphs([
              mergedPrimaryOutcome.draftRecord.problemStatement,
              secondaryOutcome.draftRecord?.problemStatement
            ]),
            outcomeStatement: mergeReviewParagraphs([
              mergedPrimaryOutcome.draftRecord.outcomeStatement,
              secondaryOutcome.draftRecord?.outcomeStatement,
              secondaryOutcome.summary
            ]),
            baselineDefinition: mergeReviewLines([
              mergedPrimaryOutcome.draftRecord.baselineDefinition,
              secondaryOutcome.draftRecord?.baselineDefinition
            ]),
            baselineSource: mergeReviewLines([
              mergedPrimaryOutcome.draftRecord.baselineSource,
              secondaryOutcome.draftRecord?.baselineSource
            ]),
            timeframe: mergeReviewLines([
              mergedPrimaryOutcome.draftRecord.timeframe,
              secondaryOutcome.draftRecord?.timeframe
            ])
          }
        : mergedPrimaryOutcome.draftRecord
    };
  }

  const collapsedCandidates = fileCandidates.flatMap((candidate) => {
    if (suppressedOutcomeCandidateIds.includes(candidate.id)) {
      return [];
    }

    if (candidate.id === primaryOutcome.id) {
      return [mergedPrimaryOutcome];
    }

    const resolvedOutcomeCandidateId =
      candidate.draftRecord?.outcomeCandidateId && outcomeAliasMap.has(candidate.draftRecord.outcomeCandidateId)
        ? outcomeAliasMap.get(candidate.draftRecord.outcomeCandidateId) ?? candidate.draftRecord.outcomeCandidateId
        : candidate.draftRecord?.outcomeCandidateId ?? null;

    return [
      {
        ...candidate,
        draftRecord: candidate.draftRecord
          ? {
              ...candidate.draftRecord,
              outcomeCandidateId: resolvedOutcomeCandidateId
            }
          : candidate.draftRecord
      }
    ];
  });

  return {
    candidates: collapsedCandidates,
    suppressedOutcomeCandidateIds
  };
}

function framingCandidateStatus(
  candidate: IntakeArtifactCandidate,
  context?: {
    resolvedKey?: string | null | undefined;
    resolvedOutcomeLink?: string | null | undefined;
    resolvedEpicLink?: string | null | undefined;
  }
) {
  if (candidate.reviewStatus === "rejected") {
    return {
      label: "Rejected",
      tone: "border-slate-300 bg-slate-100 text-slate-700"
    };
  }

  const draft = candidate.draftRecord ?? null;
  const hasKey = Boolean((draft?.key ?? context?.resolvedKey ?? "").trim()) || !candidate.type;
  const hasTitle = Boolean((draft?.title ?? candidate.title ?? "").trim());
  const hasOutcomeStatement = candidate.type !== "outcome" || Boolean((draft?.outcomeStatement ?? "").trim());
  const hasBaselineDefinition = candidate.type !== "outcome" || Boolean((draft?.baselineDefinition ?? "").trim());
  const hasBaselineSource = candidate.type !== "outcome" || Boolean((draft?.baselineSource ?? "").trim());
  const hasEpicPurpose = candidate.type !== "epic" || Boolean((draft?.purpose ?? "").trim());
  const hasValueIntent = candidate.type !== "story" || Boolean((draft?.valueIntent ?? "").trim());
  const hasOutcomeLink = candidate.type === "outcome" || Boolean((draft?.outcomeCandidateId ?? context?.resolvedOutcomeLink ?? "").trim());
  const hasEpicLink = candidate.type !== "story" || Boolean((draft?.epicCandidateId ?? context?.resolvedEpicLink ?? "").trim());
  const isReady =
    hasKey &&
    hasTitle &&
    hasOutcomeStatement &&
    hasBaselineDefinition &&
    hasBaselineSource &&
    hasEpicPurpose &&
    hasValueIntent &&
    hasOutcomeLink &&
    hasEpicLink;

  return isReady
    ? {
        label: "Ready",
        tone: "border-emerald-200 bg-emerald-50 text-emerald-700"
      }
    : {
        label: "Missing required fields",
        tone: "border-amber-200 bg-amber-50 text-amber-800"
      };
}

function framingConstraintStatus(action: string | null | undefined) {
  if (action === "not_relevant") {
    return {
      label: "Rejected",
      tone: "border-slate-300 bg-slate-100 text-slate-700"
    };
  }

  return {
    label: "Ready",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700"
  };
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
              : finding.code === "story_value_intent_missing" || finding.code === "story_value_intent_too_thin"
                ? [{ fieldName: "valueIntent", label: "Value intent" }]
                : finding.code === "story_expected_behavior_missing" || finding.code === "story_expected_behavior_too_thin"
                  ? [{ fieldName: "expectedBehavior", label: "Expected behavior" }]
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

function FramingImportSpine(props: {
  session: IntakeArtifactSession;
  selectedFile: IntakeArtifactFile;
  importedOutcomeCandidates: IntakeArtifactCandidate[];
  importedEpicCandidates: IntakeArtifactCandidate[];
  importedStoryCandidates: IntakeArtifactCandidate[];
  suppressedOutcomeCandidateIds: string[];
  carryForwardItems: ArtifactCarryForwardItem[];
  fileLeftovers: ParsedSection[];
  outcomeCandidateOptions: ProjectOutcomeOption[];
  projectEpicOptionsForTarget: ProjectEpicOption[];
  defaultTargetOutcomeId: string;
  defaultBulkEpicCandidateId: string;
  submitFramingBulkApproveAction?: ((formData: FormData) => Promise<void>) | undefined;
}) {
  const projectEpicOptions = [
    {
      id: FALLBACK_EPIC_OPTION_VALUE,
      key: "EPC-AUTO",
      title: "Fallback Epic",
      outcomeId: props.defaultTargetOutcomeId
    },
    ...props.projectEpicOptionsForTarget
  ];
  const storyEpicOptions = [
    ...props.importedEpicCandidates.map((candidate) => ({
      id: candidate.id,
      label: `Imported Epic: ${candidate.title}`
    })),
    ...projectEpicOptions.map((candidate) => ({
      id: candidate.id,
      label: `Project Epic: ${describeProjectEpic(candidate)}`
    }))
  ];

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Framing value spine</CardTitle>
        <CardDescription>
          Review imported framing content directly in one spine. Open the nodes you want to complete, mark the objects
          you want to act on, then approve or reject only that selection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          {compactMetric("Outcomes", props.importedOutcomeCandidates.length)}
          {compactMetric("Epics", props.importedEpicCandidates.length)}
          {compactMetric("Story ideas", props.importedStoryCandidates.length)}
          {compactMetric("Constraints", props.carryForwardItems.length)}
          {compactMetric("Hidden leftovers", props.fileLeftovers.length)}
        </div>
        {props.submitFramingBulkApproveAction ? (
          <form action={props.submitFramingBulkApproveAction} className="space-y-4">
            <input name="sessionId" type="hidden" value={props.session.id} />
            <input name="fileId" type="hidden" value={props.selectedFile.id} />
            {props.suppressedOutcomeCandidateIds.map((candidateId) => (
              <input key={candidateId} name="suppressedCandidateIds" type="hidden" value={candidateId} />
            ))}
            {props.fileLeftovers.map((section) => (
              <input key={section.id} name="leftoverSectionIds" type="hidden" value={section.id} />
            ))}

            <div className="rounded-2xl border border-sky-200 bg-sky-50/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">Outcome target</p>
              {props.outcomeCandidateOptions.length > 1 ? (
                <label className="mt-3 block space-y-2">
                  <span className="text-sm font-medium text-foreground">Project Outcome to update or attach to</span>
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                    defaultValue=""
                    name="targetOutcomeId"
                  >
                    <option value="">Select project Outcome</option>
                    {props.outcomeCandidateOptions.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {describeProjectOutcome(candidate)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : props.outcomeCandidateOptions.length === 1 ? (
                <>
                  <input name="targetOutcomeId" type="hidden" value={props.defaultTargetOutcomeId} />
                  <p className="mt-2 font-medium text-foreground">{describeProjectOutcome(props.outcomeCandidateOptions[0]!)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The project already has one Outcome, so imported framing content will use it automatically.
                  </p>
                </>
              ) : props.importedOutcomeCandidates.length > 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No Outcome exists in the project yet. Approving a selected imported Outcome will create it first.
                </p>
              ) : (
                <p className="mt-2 text-sm text-amber-800">
                  This import has no Outcome and the project has no existing Outcome. Approve or create an Outcome
                  before Epics, Story Ideas, or constraints can be attached.
                </p>
              )}
            </div>

            <input name="targetEpicCandidateId" type="hidden" value={props.defaultBulkEpicCandidateId || FALLBACK_EPIC_OPTION_VALUE} />

            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
              {(props.importedOutcomeCandidates.length > 0 ? props.importedOutcomeCandidates : [null]).map((outcomeCandidate, index) => {
                const epicNodes = props.importedEpicCandidates.filter((epic) =>
                  outcomeCandidate ? epic.draftRecord?.outcomeCandidateId === outcomeCandidate.id : true
                );
                const freeStandingStories = props.importedStoryCandidates.filter(
                  (story) =>
                    !story.draftRecord?.epicCandidateId?.trim() &&
                    (!outcomeCandidate ||
                      !story.draftRecord?.outcomeCandidateId?.trim() ||
                      story.draftRecord?.outcomeCandidateId === outcomeCandidate.id)
                );
                const outcomeStatus = outcomeCandidate
                  ? framingCandidateStatus(outcomeCandidate, {
                      resolvedKey:
                        outcomeCandidate.draftRecord?.key && !isLegacyImportKey(outcomeCandidate.draftRecord.key)
                          ? outcomeCandidate.draftRecord.key
                          : buildSuggestedCandidateKey(props.session, outcomeCandidate)
                    })
                  : null;

                return (
                  <details className="rounded-2xl border border-border/70 bg-background shadow-sm" key={outcomeCandidate?.id ?? `root-${index}`} open>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4">
                      <div className="flex items-start gap-3">
                        {outcomeCandidate ? (
                          <input defaultChecked name="candidateIds" type="checkbox" value={outcomeCandidate.id} />
                        ) : null}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
                              Outcome
                            </span>
                            {outcomeStatus ? (
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${outcomeStatus.tone}`}>
                                {outcomeStatus.label}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 font-medium text-foreground">
                            {outcomeCandidate
                              ? `${(outcomeCandidate.draftRecord?.key && !isLegacyImportKey(outcomeCandidate.draftRecord.key)
                                  ? outcomeCandidate.draftRecord.key
                                  : buildSuggestedCandidateKey(props.session, outcomeCandidate))} ${outcomeCandidate.title}`
                              : props.defaultTargetOutcomeId
                                ? describeProjectOutcome(props.outcomeCandidateOptions.find((candidate) => candidate.id === props.defaultTargetOutcomeId) ?? props.outcomeCandidateOptions[0]!)
                                : "Outcome required"}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {outcomeCandidate
                              ? outcomeCandidate.draftRecord?.outcomeStatement ?? outcomeCandidate.summary
                              : "Imported Epics, Story Ideas, and constraints will attach to the selected project Outcome."}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </summary>
                    <div className="space-y-4 border-t border-border/70 px-4 py-4">
                      {outcomeCandidate ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Key</span>
                            <input
                              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                              defaultValue={
                                outcomeCandidate.draftRecord?.key && !isLegacyImportKey(outcomeCandidate.draftRecord.key)
                                  ? outcomeCandidate.draftRecord.key
                                  : buildSuggestedCandidateKey(props.session, outcomeCandidate)
                              }
                              name={`candidate:${outcomeCandidate.id}:key`}
                              type="text"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Title</span>
                            <input
                              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                              defaultValue={outcomeCandidate.draftRecord?.title ?? outcomeCandidate.title}
                              name={`candidate:${outcomeCandidate.id}:title`}
                              type="text"
                            />
                          </label>
                          <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-foreground">Outcome statement</span>
                            <textarea
                              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                              defaultValue={outcomeCandidate.draftRecord?.outcomeStatement ?? ""}
                              name={`candidate:${outcomeCandidate.id}:outcomeStatement`}
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Baseline definition</span>
                            <textarea
                              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                              defaultValue={outcomeCandidate.draftRecord?.baselineDefinition ?? ""}
                              name={`candidate:${outcomeCandidate.id}:baselineDefinition`}
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Baseline source</span>
                            <textarea
                              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                              defaultValue={outcomeCandidate.draftRecord?.baselineSource ?? ""}
                              name={`candidate:${outcomeCandidate.id}:baselineSource`}
                            />
                          </label>
                          <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-foreground">Timeframe</span>
                            <input
                              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                              defaultValue={outcomeCandidate.draftRecord?.timeframe ?? ""}
                              name={`candidate:${outcomeCandidate.id}:timeframe`}
                              type="text"
                            />
                          </label>
                        </div>
                      ) : null}

                      {props.carryForwardItems.length > 0 && index === 0 ? (
                        <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/15 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Outcome constraints</p>
                          {props.carryForwardItems.map((item) => {
                            const constraintState = framingConstraintStatus(props.selectedFile.sectionDispositions[item.sourceSection.id]?.action ?? null);

                            return (
                              <details className="ml-4 rounded-2xl border border-border/70 bg-background" key={item.id}>
                                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4">
                                  <div className="flex items-start gap-3">
                                    <input defaultChecked name="carryForwardSectionIds" type="checkbox" value={item.sourceSection.id} />
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                          {carryForwardCategoryLabel(item.category)}
                                        </span>
                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${constraintState.tone}`}>
                                          {constraintState.label}
                                        </span>
                                      </div>
                                      <p className="mt-2 font-medium text-foreground">{item.title}</p>
                                      <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                                    </div>
                                  </div>
                                  <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                </summary>
                                <div className="space-y-4 border-t border-border/70 px-4 py-4">
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Title</span>
                                    <input
                                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                      defaultValue={item.title}
                                      name={`section:${item.sourceSection.id}:title`}
                                      type="text"
                                    />
                                  </label>
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Text</span>
                                    <textarea
                                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                      defaultValue={item.summary}
                                      name={`section:${item.sourceSection.id}:summary`}
                                    />
                                  </label>
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Constraint category</span>
                                    <input
                                      className="h-11 w-full rounded-2xl border border-border bg-muted/20 px-4 text-sm text-muted-foreground"
                                      defaultValue="Stored under the Outcome constraint field"
                                      disabled
                                      readOnly
                                      type="text"
                                    />
                                    <input
                                      name={`section:${item.sourceSection.id}:category`}
                                      type="hidden"
                                      value={item.category}
                                    />
                                  </label>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      ) : null}

                      {epicNodes.map((epic) => {
                        const epicStatus = framingCandidateStatus(epic, {
                          resolvedKey:
                            epic.draftRecord?.key && !isLegacyImportKey(epic.draftRecord.key)
                              ? epic.draftRecord.key
                              : buildSuggestedCandidateKey(props.session, epic),
                          resolvedOutcomeLink: epic.draftRecord?.outcomeCandidateId ?? outcomeCandidate?.id ?? props.defaultTargetOutcomeId
                        });
                        const epicStories = props.importedStoryCandidates.filter((story) => story.draftRecord?.epicCandidateId === epic.id);

                        return (
                          <details className="ml-4 rounded-2xl border border-border/70 bg-background" key={epic.id}>
                            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4">
                              <div className="flex items-start gap-3">
                                <input defaultChecked name="candidateIds" type="checkbox" value={epic.id} />
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-800">
                                      Epic
                                    </span>
                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${epicStatus.tone}`}>
                                      {epicStatus.label}
                                    </span>
                                  </div>
                                  <p className="mt-2 font-medium text-foreground">
                                    {(epic.draftRecord?.key && !isLegacyImportKey(epic.draftRecord.key)
                                      ? epic.draftRecord.key
                                      : buildSuggestedCandidateKey(props.session, epic))}{" "}
                                    {epic.title}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">{epic.draftRecord?.purpose ?? epic.summary}</p>
                                </div>
                              </div>
                              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                            </summary>
                            <div className="space-y-4 border-t border-border/70 px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Key</span>
                                  <input
                                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                    defaultValue={
                                      epic.draftRecord?.key && !isLegacyImportKey(epic.draftRecord.key)
                                        ? epic.draftRecord.key
                                        : buildSuggestedCandidateKey(props.session, epic)
                                    }
                                    name={`candidate:${epic.id}:key`}
                                    type="text"
                                  />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Title</span>
                                  <input
                                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                    defaultValue={epic.draftRecord?.title ?? epic.title}
                                    name={`candidate:${epic.id}:title`}
                                    type="text"
                                  />
                                </label>
                                <label className="space-y-2 md:col-span-2">
                                  <span className="text-sm font-medium text-foreground">Purpose</span>
                                  <textarea
                                    className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                    defaultValue={epic.draftRecord?.purpose ?? epic.summary}
                                    name={`candidate:${epic.id}:purpose`}
                                  />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Scope boundary</span>
                                  <textarea
                                    className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                    defaultValue={epic.draftRecord?.scopeBoundary ?? ""}
                                    name={`candidate:${epic.id}:scopeBoundary`}
                                  />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Risk note</span>
                                  <textarea
                                    className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                    defaultValue={epic.draftRecord?.riskNote ?? ""}
                                    name={`candidate:${epic.id}:riskNote`}
                                  />
                                </label>
                                <input
                                  name={`candidate:${epic.id}:outcomeCandidateId`}
                                  type="hidden"
                                  value={epic.draftRecord?.outcomeCandidateId ?? outcomeCandidate?.id ?? ""}
                                />
                              </div>

                              {epicStories.map((story) => {
                                const storyStatus = framingCandidateStatus(story, {
                                  resolvedKey:
                                    story.draftRecord?.key && !isLegacyImportKey(story.draftRecord.key)
                                      ? story.draftRecord.key
                                      : buildSuggestedCandidateKey(props.session, story),
                                  resolvedOutcomeLink:
                                    story.draftRecord?.outcomeCandidateId ??
                                    outcomeCandidate?.id ??
                                    props.defaultTargetOutcomeId,
                                  resolvedEpicLink: story.draftRecord?.epicCandidateId ?? epic.id
                                });
                                const parentEpic = props.importedEpicCandidates.find((candidate) => candidate.id === story.draftRecord?.epicCandidateId);

                                return (
                                  <details className="ml-4 rounded-2xl border border-border/70 bg-muted/10" key={story.id}>
                                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4">
                                      <div className="flex items-start gap-3">
                                        <input defaultChecked name="candidateIds" type="checkbox" value={story.id} />
                                        <div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                                              Story idea
                                            </span>
                                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${storyStatus.tone}`}>
                                              {storyStatus.label}
                                            </span>
                                          </div>
                                          <p className="mt-2 font-medium text-foreground">
                                            {(story.draftRecord?.key && !isLegacyImportKey(story.draftRecord.key)
                                              ? story.draftRecord.key
                                              : buildSuggestedCandidateKey(props.session, story))}{" "}
                                            {story.title}
                                          </p>
                                          {storyIdeaDescription(story) ? (
                                            <p className="mt-1 text-sm text-muted-foreground">{storyIdeaDescription(story)}</p>
                                          ) : null}
                                          <p className="mt-2 text-xs text-muted-foreground">
                                            {parentEpic
                                              ? `Linked to imported Epic ${parentEpic.title}.`
                                              : "Will use the selected project Epic if no imported Epic is linked."}
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                    </summary>
                                    <div className="space-y-4 border-t border-border/70 px-4 py-4">
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <label className="space-y-2">
                                          <span className="text-sm font-medium text-foreground">Key</span>
                                          <input
                                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                            defaultValue={
                                              story.draftRecord?.key && !isLegacyImportKey(story.draftRecord.key)
                                                ? story.draftRecord.key
                                                : buildSuggestedCandidateKey(props.session, story)
                                            }
                                            name={`candidate:${story.id}:key`}
                                            type="text"
                                          />
                                        </label>
                                        <label className="space-y-2">
                                          <span className="text-sm font-medium text-foreground">Title</span>
                                          <input
                                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                            defaultValue={story.draftRecord?.title ?? story.title}
                                            name={`candidate:${story.id}:title`}
                                            type="text"
                                          />
                                        </label>
                                        <label className="space-y-2">
                                          <span className="text-sm font-medium text-foreground">Linked Epic</span>
                                          <select
                                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                            defaultValue={story.draftRecord?.epicCandidateId ?? epic.id}
                                            name={`candidate:${story.id}:epicCandidateId`}
                                          >
                                            {storyEpicOptions.map((candidate) => (
                                              <option key={candidate.id} value={candidate.id}>
                                                {candidate.label}
                                              </option>
                                            ))}
                                          </select>
                                        </label>
                                        <label className="space-y-2 md:col-span-2">
                                          <span className="text-sm font-medium text-foreground">Value intent</span>
                                          <textarea
                                            className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                            defaultValue={story.draftRecord?.valueIntent ?? story.summary}
                                            name={`candidate:${story.id}:valueIntent`}
                                          />
                                        </label>
                                        <label className="space-y-2 md:col-span-2">
                                          <span className="text-sm font-medium text-foreground">Expected behavior</span>
                                          <textarea
                                            className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                            defaultValue={story.draftRecord?.expectedBehavior ?? ""}
                                            name={`candidate:${story.id}:expectedBehavior`}
                                          />
                                        </label>
                                        <input
                                          name={`candidate:${story.id}:outcomeCandidateId`}
                                          type="hidden"
                                          value={story.draftRecord?.outcomeCandidateId ?? outcomeCandidate?.id ?? ""}
                                        />
                                        <input
                                          name={`candidate:${story.id}:storyType`}
                                          type="hidden"
                                          value={story.draftRecord?.storyType ?? "outcome_delivery"}
                                        />
                                      </div>
                                    </div>
                                  </details>
                                );
                              })}
                            </div>
                          </details>
                        );
                      })}

                      {freeStandingStories.length > 0 ? (
                        <details className="ml-4 rounded-2xl border border-amber-200 bg-amber-50/30" open>
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                                  Epic linkage
                                </span>
                              </div>
                              <p className="mt-2 font-medium text-foreground">Story ideas that still need an Epic</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Choose an imported Epic, a project Epic, or let these stories land in `Fallback Epic`.
                              </p>
                            </div>
                            <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                          </summary>
                          <div className="space-y-4 border-t border-border/70 px-4 py-4">
                            {freeStandingStories.map((story) => {
                              const storyStatus = framingCandidateStatus(story, {
                                resolvedKey:
                                  story.draftRecord?.key && !isLegacyImportKey(story.draftRecord.key)
                                    ? story.draftRecord.key
                                    : buildSuggestedCandidateKey(props.session, story),
                                resolvedOutcomeLink:
                                  story.draftRecord?.outcomeCandidateId ??
                                  outcomeCandidate?.id ??
                                  props.defaultTargetOutcomeId,
                                resolvedEpicLink:
                                  story.draftRecord?.epicCandidateId ??
                                  props.defaultBulkEpicCandidateId ??
                                  FALLBACK_EPIC_OPTION_VALUE
                              });

                              return (
                                <details className="ml-4 rounded-2xl border border-border/70 bg-muted/10" key={story.id}>
                                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4">
                                    <div className="flex items-start gap-3">
                                      <input defaultChecked name="candidateIds" type="checkbox" value={story.id} />
                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                                            Story idea
                                          </span>
                                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${storyStatus.tone}`}>
                                            {storyStatus.label}
                                          </span>
                                        </div>
                                        <p className="mt-2 font-medium text-foreground">
                                          {(story.draftRecord?.key && !isLegacyImportKey(story.draftRecord.key)
                                            ? story.draftRecord.key
                                            : buildSuggestedCandidateKey(props.session, story))}{" "}
                                          {story.title}
                                        </p>
                                        {storyIdeaDescription(story) ? (
                                          <p className="mt-1 text-sm text-muted-foreground">{storyIdeaDescription(story)}</p>
                                        ) : null}
                                      </div>
                                    </div>
                                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                  </summary>
                                  <div className="space-y-4 border-t border-border/70 px-4 py-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <label className="space-y-2">
                                        <span className="text-sm font-medium text-foreground">Key</span>
                                        <input
                                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                          defaultValue={
                                            story.draftRecord?.key && !isLegacyImportKey(story.draftRecord.key)
                                              ? story.draftRecord.key
                                              : buildSuggestedCandidateKey(props.session, story)
                                          }
                                          name={`candidate:${story.id}:key`}
                                          type="text"
                                        />
                                      </label>
                                      <label className="space-y-2">
                                        <span className="text-sm font-medium text-foreground">Title</span>
                                        <input
                                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                          defaultValue={story.draftRecord?.title ?? story.title}
                                          name={`candidate:${story.id}:title`}
                                          type="text"
                                        />
                                      </label>
                                      <label className="space-y-2 md:col-span-2">
                                        <span className="text-sm font-medium text-foreground">Linked Epic</span>
                                        <select
                                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                          defaultValue={story.draftRecord?.epicCandidateId ?? props.defaultBulkEpicCandidateId ?? FALLBACK_EPIC_OPTION_VALUE}
                                          name={`candidate:${story.id}:epicCandidateId`}
                                        >
                                          {storyEpicOptions.map((candidate) => (
                                            <option key={candidate.id} value={candidate.id}>
                                              {candidate.label}
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                      <label className="space-y-2 md:col-span-2">
                                        <span className="text-sm font-medium text-foreground">Value intent</span>
                                        <textarea
                                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                          defaultValue={story.draftRecord?.valueIntent ?? story.summary}
                                          name={`candidate:${story.id}:valueIntent`}
                                        />
                                      </label>
                                      <label className="space-y-2 md:col-span-2">
                                        <span className="text-sm font-medium text-foreground">Expected behavior</span>
                                        <textarea
                                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                          defaultValue={story.draftRecord?.expectedBehavior ?? ""}
                                          name={`candidate:${story.id}:expectedBehavior`}
                                        />
                                      </label>
                                      <input
                                        name={`candidate:${story.id}:outcomeCandidateId`}
                                        type="hidden"
                                        value={story.draftRecord?.outcomeCandidateId ?? outcomeCandidate?.id ?? ""}
                                      />
                                      <input
                                        name={`candidate:${story.id}:storyType`}
                                        type="hidden"
                                        value={story.draftRecord?.storyType ?? "outcome_delivery"}
                                      />
                                    </div>
                                  </div>
                                </details>
                              );
                            })}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </details>
                );
              })}
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              {props.fileLeftovers.length > 0
                ? "Any leftover source noise stays hidden here and will be ignored automatically when you approve selected framing objects."
                : "No hidden leftovers remain for this imported file."}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1 gap-2" name="decision" type="submit" value="approve">
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button className="flex-1 gap-2" name="decision" type="submit" value="reject" variant="secondary">
                <CircleAlert className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
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
  submitFramingBulkApproveAction,
  submitSectionDispositionInlineAction
}: ArtifactIntakeReviewWorkspaceProps) {
  const currentSelection = {
    sessionId: session.id,
    fileId: selectedFile.id,
    candidateId: selectedCandidate?.id ?? null
  };
  const groups = queueItems(session, selectedFile, currentSelection);
  const carryForwardItems = (session.mappedArtifacts?.carryForwardItems ?? []).filter(
    (item) => item.sourceSection.sourceReference.fileId === selectedFile.id
  );
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
  const suggestedCandidateKey = buildSuggestedCandidateKey(session, selectedCandidate);
  const displayedCandidateKeyValue =
    selectedCandidate && isLegacyImportKey(selectedCandidateKeyValue) ? suggestedCandidateKey : selectedCandidateKeyValue;
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
  const fileLeftovers = (session.mappedArtifacts?.unmappedSections ?? []).filter(
    (section) => section.sourceReference.fileId === selectedFile.id
  );
  const leftoverGroups = groupLeftoversByKind(fileLeftovers);
  const carryForwardItemStates = carryForwardItems.map((item) => {
    const selectedAction = selectedFile.sectionDispositions[item.sourceSection.id]?.action ?? null;
    return {
      item,
      selectedAction,
      dispositionLabel: dispositionLabel(selectedAction),
      ...carryForwardDispositionState(selectedAction)
    };
  });
  const unresolvedCarryForwardCount = carryForwardItemStates.filter((entry) => entry.status === "unresolved").length;
  const collapsedFramingCandidates = collapseFramingCandidatesForDisplay(fileCandidates);
  const importedOutcomeCandidates = collapsedFramingCandidates.candidates.filter((candidate) => candidate.type === "outcome");
  const importedEpicCandidates = collapsedFramingCandidates.candidates.filter((candidate) => candidate.type === "epic");
  const importedStoryCandidates = collapsedFramingCandidates.candidates.filter((candidate) => candidate.type === "story");
  const defaultTargetOutcomeId = outcomeCandidateOptions.length === 1 ? outcomeCandidateOptions[0]?.id ?? "" : "";
  const projectEpicOptionsForTarget = defaultTargetOutcomeId
    ? (projectEpics ?? []).filter((epic) => epic.outcomeId === defaultTargetOutcomeId)
    : (projectEpics ?? []);
  const defaultBulkEpicCandidateId = projectEpicOptionsForTarget.length === 1 ? projectEpicOptionsForTarget[0]?.id ?? "" : "";
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
      {session.importIntent === "framing" ? (
        <FramingImportSpine
          carryForwardItems={carryForwardItems}
          defaultBulkEpicCandidateId={defaultBulkEpicCandidateId}
          defaultTargetOutcomeId={defaultTargetOutcomeId}
          fileLeftovers={fileLeftovers}
          importedEpicCandidates={importedEpicCandidates}
          importedOutcomeCandidates={importedOutcomeCandidates}
          importedStoryCandidates={importedStoryCandidates}
          outcomeCandidateOptions={outcomeCandidateOptions}
          projectEpicOptionsForTarget={projectEpicOptionsForTarget}
          selectedFile={selectedFile}
          session={session}
          suppressedOutcomeCandidateIds={collapsedFramingCandidates.suppressedOutcomeCandidateIds}
          submitFramingBulkApproveAction={submitFramingBulkApproveAction}
        />
      ) : null}

      {carryForwardItems.length > 0 && session.importIntent !== "framing" ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Carry forward to design</CardTitle>
            <CardDescription>
              These sections were recognized as useful design or constraint input, so they are kept visible here
              instead of being treated as leftovers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              {compactMetric("Carry-forward items", carryForwardItems.length)}
              {compactMetric("Pending decisions", unresolvedCarryForwardCount)}
            </div>
            <div className="grid gap-3">
              {carryForwardItemStates.map(({ item, selectedAction, dispositionLabel, status, tone }) => (
                <div className={`rounded-2xl border p-4 ${tone}`} key={item.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
                      {carryForwardCategoryLabel(item.category)}
                    </span>
                    <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {carryForwardUseLabel(item.recommendedUse)}
                    </span>
                  </div>
                  <p className="mt-3 font-medium text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                  {dispositionLabel ? (
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Disposition: {dispositionLabel}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {item.sourceSection.sourceReference.sectionMarker} lines {item.sourceSection.sourceReference.lineStart}-
                    {item.sourceSection.sourceReference.lineEnd}
                  </p>
                  <ArtifactIntakeDispositionButtons
                    actions={
                      session.importIntent === "framing"
                        ? [
                            { label: "Approve into Framing", value: "confirmed" as const },
                            { label: "Reject", value: "not_relevant" as const },
                            { label: "Keep pending", value: "pending" as const },
                            { label: "Mark blocker", value: "blocked" as const }
                          ]
                        : [
                            { label: "Confirm", value: "confirmed" as const },
                            { label: "Not relevant", value: "not_relevant" as const },
                            { label: "Keep pending", value: "pending" as const },
                            { label: "Mark blocker", value: "blocked" as const }
                          ]
                    }
                    fileId={selectedFile.id}
                    initialAction={selectedAction}
                    initialStatus={status}
                    key={`${item.id}-carry-forward-actions`}
                    kind="section"
                    resolvedActions={["confirmed", "corrected", "not_relevant"]}
                    sectionId={item.sourceSection.id}
                    submitSectionDisposition={submitSectionDispositionInlineAction}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {session.importIntent !== "framing" ? (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Review leftovers</CardTitle>
          <CardDescription>
            Only leftover material that still needs a human decision is shown here. Supporting noise is summarized first so it is easier to reject and move on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress?.categories.unmapped ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {compactMetric("Review leftovers", progress.categories.unmapped)}
            </div>
          ) : null}
          {leftoverGroups.length > 0 ? (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Leftover summary</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {leftoverGroups.map((group) => (
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={`${group.title}-${group.preview}`}>
                    <p className="font-medium text-foreground">{group.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{group.count} section(s)</p>
                    <p className="mt-2 text-sm text-muted-foreground">{group.preview}</p>
                  </div>
                ))}
              </div>
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
                            <p className="mt-1 text-sm text-muted-foreground">{summarizeReviewText(item.description, 180)}</p>
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
      ) : null}

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

        {session.importIntent !== "framing" ? (
          <div className="space-y-6">
            {selectedCandidate ? (
              <form action={submitAction} className="space-y-4" id="candidate-editor">
              <input name="sessionId" type="hidden" value={session.id} />
              <input name="fileId" type="hidden" value={selectedFile.id} />
              <input name="candidateId" type="hidden" value={selectedCandidate.id} />
              <input name="candidateType" type="hidden" value={selectedCandidate.type} />
              <input name="importIntent" type="hidden" value={session.importIntent ?? "framing"} />

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>
                    {selectedCandidate.type === "story"
                      ? `Save and approve ${importedStoryLabel(session.importIntent)} import`
                      : "Save and approve import"}
                  </CardTitle>
                  <CardDescription>
                    {selectedCandidate.type === "story"
                      ? session.importIntent === "design"
                        ? "This imported story will become a Delivery Story when approved."
                        : "This imported story will become a Story Idea in Framing when approved."
                      : "Review the imported candidate, make corrections, then approve it into governed project records."}
                  </CardDescription>
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
                        defaultValue={displayedCandidateKeyValue}
                        name="key"
                        type="text"
                      />
                      {fieldNotes("key").map((note) => (
                        <p className="text-xs text-amber-700" key={`${note.fieldName}-${note.message}`}>
                          {note.message}
                        </p>
                      ))}
                      {selectedCandidate.type === "story" && (isLegacyImportKey(selectedCandidate.draftRecord?.key) || !selectedCandidate.draftRecord?.key) ? (
                        <p className="text-xs text-muted-foreground">
                          Suggested simple project key. A unique `SC-###` value is assigned automatically if you approve without changing it.
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
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Expected behavior</span>
                        <textarea
                          className={withValidationTone("min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary", "expectedBehavior")}
                          defaultValue={selectedCandidate.draftRecord?.expectedBehavior ?? ""}
                          name="expectedBehavior"
                        />
                        {fieldNotes("expectedBehavior").map((note) => (
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

                  <ArtifactIntakeReviewSubmitButtons
                    importTargetLabel={
                      selectedCandidate.type === "story"
                        ? importedStoryLabel(session.importIntent)
                        : label(selectedCandidate.type)
                    }
                  />

                  {selectedCandidate.promotedEntityId ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                      Imported into the project as governed{" "}
                      {promotedEntityLabel(selectedCandidate.type, selectedCandidate.promotedEntityType, session.importIntent)} with ID{" "}
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
        ) : null}
      </div>
    </div>
  );
}
