import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, ChevronDown, CircleAlert, CircleCheckBig, Clock3, FileSearch, GitBranch, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { ArtifactIntakeReviewWorkspace } from "@/components/intake/artifact-intake-review-workspace";
import { AppShell } from "@/components/layout/app-shell";
import {
  OutcomeTollgateApprovalSection,
  OutcomeTollgateSectionFallback
} from "@/components/review/outcome-tollgate-approval-section";
import { ReviewSessionValueSpine } from "@/components/review/review-session-value-spine";
import { ContextHelp } from "@/components/shared/context-help";
import { getHelpPattern } from "@/lib/help/aas-help";
import { loadArtifactIntakeWorkspace } from "@/lib/intake/workspace";
import { loadArtifactReviewQueue } from "@/lib/intake/review-queue";
import { loadOperationalReviewDashboard } from "@/lib/review/operational-review";
import {
  submitArtifactCandidateFromIntakeAction,
  submitArtifactCandidateIssueDispositionInlineAction,
  submitArtifactSectionBulkDeleteInlineAction,
  submitArtifactSectionDispositionInlineAction,
  submitFramingBulkApproveFromIntakeAction
} from "../intake/actions";
import { LocalizedText } from "@/components/shared/localized-text";
import {
  deleteArtifactIntakeSessionAction,
  submitArtifactBulkReviewAction,
  submitArtifactCandidateReviewAction
} from "./actions";
import { recordOutcomeTollgateDecisionAction } from "../outcomes/[outcomeId]/actions";

type ReviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ReviewQueue = Awaited<ReturnType<typeof loadArtifactReviewQueue>>;
type ReviewCandidate = ReviewQueue["items"][number];
type SelectedReviewCandidate = NonNullable<ReviewQueue["selectedCandidate"]>;
type ReviewFinding = NonNullable<SelectedReviewCandidate["complianceResult"]>["findings"][number];
type ReviewProjectOutcomeOption = ReviewQueue["projectOutcomes"][number];
type ReviewProjectEpicOption = ReviewQueue["projectEpics"][number];
type ReviewBacklogState = "needs_action" | "needs_confirmation" | "pending" | "approved" | "discarded";
type OperationalReviewDashboard = Awaited<ReturnType<typeof loadOperationalReviewDashboard>>;
type OperationalReviewItem = OperationalReviewDashboard["items"][number];

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getServerLanguage() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getImportIntentLabel(importIntent: "framing" | "design" | string, language: "en" | "sv" = "en") {
  return importIntent === "design"
    ? language === "sv"
      ? "Designimport"
      : "Design import"
    : language === "sv"
      ? "Framingimport"
      : "Framing import";
}

function getImportTargetLabel(importIntent: "framing" | "design" | string, language: "en" | "sv" = "en") {
  return importIntent === "design"
    ? language === "sv"
      ? "Delivery Stories i Design"
      : "Delivery Stories in Design"
    : language === "sv"
      ? "Story Ideas i Framing"
      : "Story Ideas in Framing";
}

function getCandidateObjectLabel(candidate: {
  type: ReviewCandidate["type"];
  intakeSession: {
    importIntent?: "framing" | "design" | string | null;
  };
}, language: "en" | "sv" = "en") {
  if (candidate.type !== "story") {
    return candidate.type === "outcome"
      ? language === "sv"
        ? "Outcome"
        : "Outcome"
      : candidate.type === "epic"
        ? "Epic"
        : candidate.type === "constraint"
          ? language === "sv"
            ? "Constraint"
            : "Constraint"
          : formatLabel(candidate.type);
  }

  return candidate.intakeSession?.importIntent === "design"
    ? language === "sv"
      ? "Delivery Story"
      : "Delivery Story"
    : language === "sv"
      ? "Story Idea"
      : "Story Idea";
}

function getPromotedEntityLabel(
  candidateType: string,
  promotedEntityType: string | null | undefined,
  importIntent: "framing" | "design" | string,
  language: "en" | "sv" = "en"
) {
  if (candidateType === "story" || promotedEntityType === "story") {
    return importIntent === "design"
      ? language === "sv"
        ? "Delivery Story"
        : "Delivery Story"
      : language === "sv"
        ? "Story Idea"
        : "Story Idea";
  }

  return promotedEntityType ? formatLabel(promotedEntityType) : language === "sv" ? "post" : "record";
}

function getFindingClasses(category: "missing" | "uncertain" | "human_only" | "blocked") {
  if (category === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  if (category === "human_only") {
    return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900";
  }

  if (category === "uncertain") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-sky-200 bg-sky-50 text-sky-900";
}

function getBacklogState(candidate: Pick<ReviewCandidate, "reviewStatus" | "importedReadinessState" | "issueProgress">) {
  if (candidate.reviewStatus === "rejected" || candidate.importedReadinessState === "discarded") {
    return "discarded" as const;
  }

  if (candidate.reviewStatus === "promoted") {
    return "approved" as const;
  }

  if (
    candidate.reviewStatus === "follow_up_needed" ||
    candidate.issueProgress.categories.missing > 0 ||
    candidate.issueProgress.categories.blocked > 0
  ) {
    return "needs_action" as const;
  }

  if (
    candidate.issueProgress.categories.uncertain > 0 ||
    candidate.issueProgress.categories.humanOnly > 0 ||
    candidate.issueProgress.categories.unmapped > 0
  ) {
    return "needs_confirmation" as const;
  }

  return "pending" as const;
}

function getBacklogLabel(state: ReviewBacklogState) {
  if (state === "needs_action") {
    return "Needs action";
  }

  if (state === "needs_confirmation") {
    return "Needs confirmation";
  }

  if (state === "pending") {
    return "Pending";
  }

  if (state === "approved") {
    return "Approved";
  }

  return "Discarded";
}

function getBacklogBadgeClasses(state: ReviewBacklogState) {
  if (state === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (state === "discarded") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (state === "pending") {
    return "border-slate-200 bg-slate-50 text-slate-800";
  }

  if (state === "needs_confirmation") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-sky-200 bg-sky-50 text-sky-800";
}

function getDispositionLabel(action: string | undefined) {
  if (action === "corrected") {
    return "Fixed";
  }

  if (action === "confirmed") {
    return "Confirmed";
  }

  if (action === "not_relevant") {
    return "Not relevant";
  }

  if (action === "blocked") {
    return "Blocked";
  }

  if (action === "pending") {
    return "Pending";
  }

  return null;
}

function getDispositionClasses(action: string | undefined) {
  if (action === "corrected" || action === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (action === "not_relevant") {
    return "border-slate-200 bg-slate-50 text-slate-800";
  }

  if (action === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-border/70 bg-background text-muted-foreground";
}

function getActionVerb(category: "missing" | "uncertain" | "human_only" | "blocked") {
  if (category === "missing") {
    return "Fix";
  }

  if (category === "uncertain") {
    return "Confirm or correct";
  }

  if (category === "human_only") {
    return "Confirm";
  }

  return "Resolve";
}

function buildReviewHref(input: {
  candidateId?: string | undefined;
  reviewStatusFilter?: string | undefined;
  findingFilter?: string | undefined;
  importIntent?: string | undefined;
}) {
  const params = new URLSearchParams();

  if (input.candidateId) {
    params.set("candidateId", input.candidateId);
  }

  if (input.reviewStatusFilter && input.reviewStatusFilter !== "all") {
    params.set("reviewStatusFilter", input.reviewStatusFilter);
  }

  if (input.findingFilter && input.findingFilter !== "all") {
    params.set("findingFilter", input.findingFilter);
  }

  if (input.importIntent && input.importIntent !== "all") {
    params.set("importIntent", input.importIntent);
  }

  const query = params.toString();
  return query ? `/review?${query}` : "/review";
}

function getCandidatePreviewRows(candidate: ReviewCandidate) {
  const rows: Array<{ label: string; value: string }> = [];

  if (candidate.draftRecord?.key) {
    rows.push({ label: "Key", value: candidate.draftRecord.key });
  }

  rows.push({ label: "Title", value: candidate.draftRecord?.title ?? candidate.title });

  if (candidate.type === "outcome") {
    if (candidate.draftRecord?.outcomeStatement) {
      rows.push({ label: "Outcome statement", value: candidate.draftRecord.outcomeStatement });
    }
    if (candidate.draftRecord?.baselineDefinition) {
      rows.push({ label: "Baseline definition", value: candidate.draftRecord.baselineDefinition });
    }
  }

  if (candidate.type === "epic") {
    if (candidate.draftRecord?.purpose) {
      rows.push({ label: "Purpose", value: candidate.draftRecord.purpose });
    }
    if (candidate.draftRecord?.scopeBoundary) {
      rows.push({ label: "Scope boundary", value: candidate.draftRecord.scopeBoundary });
    }
  }

  if (candidate.type === "story") {
    const acceptanceCriteria = candidate.draftRecord?.acceptanceCriteria ?? [];

    if (candidate.intakeSession?.importIntent === "design" && candidate.draftRecord?.storyType) {
      rows.push({ label: "Story type", value: formatLabel(candidate.draftRecord.storyType) });
    }
    if (candidate.draftRecord?.valueIntent) {
      rows.push({ label: "Value intent", value: candidate.draftRecord.valueIntent });
    }
    if (candidate.draftRecord?.expectedBehavior) {
      rows.push({ label: "Expected behavior", value: candidate.draftRecord.expectedBehavior });
    }
    if (candidate.intakeSession?.importIntent === "design" && acceptanceCriteria.length > 0) {
      rows.push({ label: "Acceptance criteria", value: acceptanceCriteria.join(" | ") });
    }
  }

  if (candidate.humanDecisions?.aiAccelerationLevel) {
    rows.push({ label: "AI level", value: formatLabel(candidate.humanDecisions.aiAccelerationLevel) });
  }

  if (candidate.humanDecisions?.riskProfile) {
    rows.push({ label: "Risk profile", value: candidate.humanDecisions.riskProfile });
  }

  if (candidate.humanDecisions?.riskAcceptanceStatus) {
    rows.push({ label: "Risk acceptance", value: formatLabel(candidate.humanDecisions.riskAcceptanceStatus) });
  }

  return rows.slice(0, 8);
}

// Retained for possible future reuse when richer backlog cards return.
function getCandidateRelationshipSummary(candidate: ReviewCandidate, allCandidates: ReviewQueue["items"]) {
  const outcomeCandidateId = candidate.draftRecord?.outcomeCandidateId ?? candidate.inferredOutcomeCandidateId ?? null;
  const epicCandidateId = candidate.draftRecord?.epicCandidateId ?? candidate.inferredEpicCandidateId ?? null;
  const outcomeCandidate = outcomeCandidateId ? allCandidates.find((entry) => entry.id === outcomeCandidateId) : null;
  const epicCandidate = epicCandidateId ? allCandidates.find((entry) => entry.id === epicCandidateId) : null;

  if (candidate.type === "outcome") {
    return "Outcome root";
  }

  if (candidate.type === "epic") {
    return outcomeCandidate ? `Outcome -> ${outcomeCandidate.title}` : "Outcome -> needs linkage";
  }

  return [
    outcomeCandidate ? `Outcome -> ${outcomeCandidate.title}` : "Outcome -> needs linkage",
    epicCandidate ? `Epic -> ${epicCandidate.title}` : "Epic -> needs linkage"
  ].join(" | ");
}

function compareText(left: string | null | undefined, right: string | null | undefined) {
  return (left ?? "").localeCompare(right ?? "", "sv", { numeric: true, sensitivity: "base" });
}

function getReviewHierarchyWeight(candidate: ReviewCandidate) {
  return candidate.type === "outcome" ? 0 : candidate.type === "epic" ? 1 : 2;
}

function getReviewCandidateSortKey(candidate: ReviewCandidate, allCandidates: ReviewQueue["items"]) {
  const linkedOutcome =
    candidate.draftRecord?.outcomeCandidateId
      ? allCandidates.find((entry) => entry.id === candidate.draftRecord?.outcomeCandidateId)
      : null;
  const linkedEpic =
    candidate.draftRecord?.epicCandidateId
      ? allCandidates.find((entry) => entry.id === candidate.draftRecord?.epicCandidateId)
      : null;

  return {
    sessionLabel: candidate.intakeSession?.label ?? "",
    fileName: candidate.file.fileName,
    hierarchyWeight: getReviewHierarchyWeight(candidate),
    linkedOutcomeTitle: linkedOutcome?.title ?? candidate.title,
    linkedEpicTitle: linkedEpic?.title ?? candidate.title,
    sourceMarker: candidate.sourceSectionMarker ?? "",
    displayKey: getDisplayedCandidateKey(allCandidates, candidate, candidate.intakeSession?.importIntent ?? "framing"),
    title: candidate.draftRecord?.title ?? candidate.title
  };
}

function sortReviewCandidates(candidates: ReviewQueue["items"], allCandidates: ReviewQueue["items"]) {
  return [...candidates].sort((left, right) => {
    const leftKey = getReviewCandidateSortKey(left, allCandidates);
    const rightKey = getReviewCandidateSortKey(right, allCandidates);

    return (
      compareText(leftKey.sessionLabel, rightKey.sessionLabel) ||
      compareText(leftKey.fileName, rightKey.fileName) ||
      leftKey.hierarchyWeight - rightKey.hierarchyWeight ||
      compareText(leftKey.linkedOutcomeTitle, rightKey.linkedOutcomeTitle) ||
      compareText(leftKey.linkedEpicTitle, rightKey.linkedEpicTitle) ||
      compareText(leftKey.displayKey, rightKey.displayKey) ||
      compareText(leftKey.sourceMarker, rightKey.sourceMarker) ||
      compareText(leftKey.title, rightKey.title)
    );
  });
}

function describeCandidateOption(candidate: ReviewCandidate) {
  const key = candidate.draftRecord?.key?.trim();
  const title = candidate.draftRecord?.title?.trim() || candidate.title;
  return key ? `${key} - ${title}` : title;
}

function describeProjectOutcomeOption(option: ReviewProjectOutcomeOption) {
  return `${option.key} - ${option.title}`;
}

function describeProjectEpicOption(option: ReviewProjectEpicOption) {
  return `${option.key} - ${option.title}`;
}

function isLegacyImportKey(value: string | null | undefined) {
  return /^IMP-(OUT|EPC|STR|STORY)-/i.test(value?.trim() ?? "");
}

function buildSuggestedCandidateKey(
  allCandidates: ReviewQueue["items"],
  candidate: ReviewCandidate | null | undefined,
  importIntent: "framing" | "design" | string | null | undefined
) {
  if (!candidate) {
    return "";
  }

  const typedCandidates = allCandidates.filter(
    (entry) =>
      entry.type === candidate.type &&
      entry.intakeSession?.id === candidate.intakeSession?.id &&
      entry.reviewStatus !== "rejected"
  );
  const index = typedCandidates.findIndex((entry) => entry.id === candidate.id);
  const sequence = index >= 0 ? index + 1 : typedCandidates.length + 1;
  const prefix =
    candidate.type === "outcome" ? "OUT" : candidate.type === "epic" ? "EPC" : importIntent === "design" ? "STR" : "SC";

  return `${prefix}-${String(sequence).padStart(3, "0")}`;
}

function getDisplayedCandidateKey(
  allCandidates: ReviewQueue["items"],
  candidate: ReviewCandidate | null | undefined,
  importIntent: "framing" | "design" | string | null | undefined
) {
  const storedKey = candidate?.draftRecord?.key?.trim() ?? "";

  if (storedKey && !isLegacyImportKey(storedKey)) {
    return storedKey;
  }

  return buildSuggestedCandidateKey(allCandidates, candidate, importIntent);
}

function getImportedEpicOptions(
  allCandidates: ReviewQueue["items"],
  currentCandidate: ReviewCandidate
) {
  return allCandidates.filter(
    (candidate) =>
      candidate.type === "epic" &&
      candidate.reviewStatus !== "rejected" &&
      candidate.intakeSession?.id === currentCandidate.intakeSession?.id
  );
}

// Retained for possible future reuse when inline backlog editing returns.
function CandidateInlineEditor(props: {
  allCandidates: ReviewQueue["items"];
  projectOutcomes: ReviewQueue["projectOutcomes"];
  projectEpics: ReviewQueue["projectEpics"];
  candidate: ReviewCandidate;
}) {
  const { allCandidates, projectOutcomes, projectEpics, candidate } = props;
  const displayedCandidateKey = getDisplayedCandidateKey(
    allCandidates,
    candidate,
    candidate.intakeSession?.importIntent ?? "framing"
  );
  const isFinal = candidate.reviewStatus === "promoted" || candidate.reviewStatus === "rejected";
  const defaultOpen =
    candidate.reviewStatus !== "promoted" &&
    candidate.reviewStatus !== "rejected" &&
    (candidate.issueProgress.categories.missing > 0 ||
      candidate.issueProgress.categories.blocked > 0 ||
      candidate.issueProgress.categories.uncertain > 0);
  const currentOutcomeCandidateId =
    candidate.draftRecord?.outcomeCandidateId && projectOutcomes.some((option) => option.id === candidate.draftRecord?.outcomeCandidateId)
      ? candidate.draftRecord.outcomeCandidateId
      : projectOutcomes.length === 1
        ? projectOutcomes[0]?.id ?? ""
        : candidate.draftRecord?.outcomeCandidateId ?? "";
  const importedEpicOptions = getImportedEpicOptions(allCandidates, candidate);
  const projectEpicOptions = currentOutcomeCandidateId
    ? projectEpics.filter((option) => option.outcomeId === currentOutcomeCandidateId)
    : projectEpics;
  const combinedEpicOptions = [
    ...importedEpicOptions.map((option) => ({ id: option.id, label: describeCandidateOption(option) })),
    ...projectEpicOptions
      .filter((option) => !importedEpicOptions.some((candidateOption) => candidateOption.id === option.id))
      .map((option) => ({ id: option.id, label: describeProjectEpicOption(option) }))
  ];
  const currentEpicCandidateId =
    candidate.draftRecord?.epicCandidateId && combinedEpicOptions.some((option) => option.id === candidate.draftRecord?.epicCandidateId)
      ? candidate.draftRecord.epicCandidateId
      : combinedEpicOptions.length === 1
        ? combinedEpicOptions[0]?.id ?? ""
        : candidate.draftRecord?.epicCandidateId ?? "";
  const needsCurrentOutcomeOption =
    currentOutcomeCandidateId.length > 0 && !projectOutcomes.some((option) => option.id === currentOutcomeCandidateId);
  const needsCurrentEpicOption =
    currentEpicCandidateId.length > 0 && !combinedEpicOptions.some((option) => option.id === currentEpicCandidateId);

  return (
    <details className="mt-4 rounded-2xl border border-border/70 bg-background/80" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Expand to fix fields and approve here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Update the missing fields inline, then save or approve without leaving this backlog row.
          </p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </summary>
      <form action={submitArtifactCandidateReviewAction} className="space-y-4 border-t border-border/70 px-4 py-4">
        <input name="candidateId" type="hidden" value={candidate.id} />
        <input name="candidateType" type="hidden" value={candidate.type} />
        <input name="importIntent" type="hidden" value={candidate.intakeSession?.importIntent ?? "framing"} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              defaultValue={candidate.draftRecord?.title ?? candidate.title}
              disabled={isFinal}
              name="title"
              type="text"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Key</span>
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              defaultValue={displayedCandidateKey}
              disabled={isFinal}
              name="key"
              type="text"
            />
          </label>
        </div>

        {candidate.type === "outcome" ? (
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Outcome statement</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={candidate.draftRecord?.outcomeStatement ?? ""}
                disabled={isFinal}
                name="outcomeStatement"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Baseline definition</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={candidate.draftRecord?.baselineDefinition ?? ""}
                disabled={isFinal}
                name="baselineDefinition"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Baseline source</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={candidate.draftRecord?.baselineSource ?? ""}
                disabled={isFinal}
                name="baselineSource"
              />
            </label>
          </div>
        ) : null}

        {candidate.type === "epic" ? (
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Purpose</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={candidate.draftRecord?.purpose ?? ""}
                disabled={isFinal}
                name="purpose"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Scope boundary</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={candidate.draftRecord?.scopeBoundary ?? ""}
                disabled={isFinal}
                name="scopeBoundary"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Linked Outcome</span>
              <select
                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                defaultValue={currentOutcomeCandidateId}
                disabled={isFinal}
                name="outcomeCandidateId"
              >
                <option value="">Select linked Outcome</option>
                {projectOutcomes.length === 1 ? (
                  <option value={projectOutcomes[0]?.id ?? ""}>{describeProjectOutcomeOption(projectOutcomes[0]!)}</option>
                ) : null}
                {needsCurrentOutcomeOption ? (
                  <option value={currentOutcomeCandidateId}>Current linked record ({currentOutcomeCandidateId})</option>
                ) : null}
                {projectOutcomes.length > 1
                  ? projectOutcomes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {describeProjectOutcomeOption(option)}
                  </option>
                    ))
                  : null}
              </select>
            </label>
          </div>
        ) : null}

        {candidate.type === "story" ? (
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Value intent</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={candidate.draftRecord?.valueIntent ?? ""}
                disabled={isFinal}
                name="valueIntent"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Expected behavior</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={candidate.draftRecord?.expectedBehavior ?? ""}
                disabled={isFinal}
                name="expectedBehavior"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Linked Outcome</span>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                  defaultValue={currentOutcomeCandidateId}
                  disabled={isFinal}
                  name="outcomeCandidateId"
                >
                  <option value="">Select linked Outcome</option>
                  {projectOutcomes.length === 1 ? (
                    <option value={projectOutcomes[0]?.id ?? ""}>{describeProjectOutcomeOption(projectOutcomes[0]!)}</option>
                  ) : null}
                  {needsCurrentOutcomeOption ? (
                    <option value={currentOutcomeCandidateId}>Current linked record ({currentOutcomeCandidateId})</option>
                  ) : null}
                  {projectOutcomes.length > 1
                    ? projectOutcomes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {describeProjectOutcomeOption(option)}
                    </option>
                      ))
                    : null}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Linked Epic</span>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                  defaultValue={currentEpicCandidateId}
                  disabled={isFinal}
                  name="epicCandidateId"
                >
                  <option value="">Select linked Epic</option>
                  {needsCurrentEpicOption ? (
                    <option value={currentEpicCandidateId}>Current linked record ({currentEpicCandidateId})</option>
                  ) : null}
                  {combinedEpicOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Review comment</span>
          <textarea
            className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            defaultValue={candidate.reviewComment ?? ""}
            disabled={isFinal}
            name="reviewComment"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button className="gap-2" disabled={isFinal} name="intent" type="submit" value="edit" variant="secondary">
            <GitBranch className="h-4 w-4" />
            Save edits
          </Button>
          <Button className="gap-2" disabled={isFinal} name="intent" type="submit" value="promote">
            <ShieldCheck className="h-4 w-4" />
            {candidate.intakeSession?.importIntent === "design" ? "Approve as Delivery Story" : "Approve as Story Idea"}
          </Button>
          <Button className="gap-2" disabled={isFinal} name="intent" type="submit" value="reject" variant="secondary">
            <CircleAlert className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </form>
    </details>
  );
}

// Retained for possible future reuse when compact backlog rows return.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReviewBacklogSpineRow(props: {
  candidate: ReviewCandidate;
  allCandidates: ReviewQueue["items"];
  selectedCandidateId?: string | null;
  reviewStatusFilter?: string;
  findingFilter?: string;
  importIntentFilter?: string;
  indentClassName?: string;
}) {
  const { candidate, allCandidates, selectedCandidateId, reviewStatusFilter, findingFilter, importIntentFilter, indentClassName } = props;
  const isSelected = candidate.id === selectedCandidateId;
  const isFinal = candidate.reviewStatus === "promoted" || candidate.reviewStatus === "rejected";
  const displayedKey = getDisplayedCandidateKey(
    allCandidates,
    candidate,
    candidate.intakeSession?.importIntent ?? "framing"
  );
  const summary =
    candidate.type === "outcome"
      ? candidate.draftRecord?.outcomeStatement ?? candidate.summary
      : candidate.type === "epic"
        ? candidate.draftRecord?.purpose ?? candidate.summary
        : candidate.draftRecord?.valueIntent ?? candidate.summary;

  return (
    <div className={`${indentClassName ?? ""} rounded-2xl border border-border/70 bg-background/80 p-4`}>
      <div className="flex items-start gap-3">
        <input
          className="mt-1 h-4 w-4 rounded border-border text-primary"
          defaultChecked={false}
          disabled={isFinal}
          form={`bulk-review-${candidate.intakeSession?.importIntent ?? "framing"}`}
          name="candidateIds"
          type="checkbox"
          value={candidate.id}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {getCandidateObjectLabel(candidate)}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getBacklogBadgeClasses(getBacklogState(candidate))}`}>
              {getBacklogLabel(getBacklogState(candidate))}
            </span>
            {isSelected ? (
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                Selected
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">
              {displayedKey} {candidate.draftRecord?.title ?? candidate.title}
            </p>
            <Button asChild size="sm" variant={isSelected ? "default" : "secondary"}>
              <Link
                href={buildReviewHref({
                  candidateId: candidate.id,
                  reviewStatusFilter,
                  findingFilter: findingFilter ?? "all",
                  importIntent: importIntentFilter
                })}
              >
                Open
              </Link>
            </Button>
          </div>
          {summary ? <p className="text-sm leading-6 text-muted-foreground">{summary}</p> : null}
        </div>
      </div>
    </div>
  );
}

// Retained for possible future reuse when richer backlog cards return.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReviewQueueCandidateCard(props: {
  allCandidates: ReviewQueue["items"];
  projectOutcomes: ReviewQueue["projectOutcomes"];
  projectEpics: ReviewQueue["projectEpics"];
  candidate: ReviewCandidate;
  isSelected: boolean;
  reviewStatusFilter: string;
  importIntentFilter: string;
}) {
  const { allCandidates, projectOutcomes, projectEpics, candidate, isSelected, reviewStatusFilter, importIntentFilter } = props;
  const candidateState = getBacklogState(candidate);
  const isFinal = candidate.reviewStatus === "promoted" || candidate.reviewStatus === "rejected";

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isSelected ? "border-primary/40 bg-primary/5" : "border-border/70 bg-muted/20"
      }`}
      key={candidate.id}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <input
            className="mt-1 h-4 w-4 rounded border-border text-primary"
            defaultChecked={false}
            disabled={isFinal}
            form={`bulk-review-${candidate.intakeSession?.importIntent ?? "framing"}`}
            name="candidateIds"
            type="checkbox"
            value={candidate.id}
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{candidate.title}</p>
              <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {getCandidateObjectLabel(candidate)}
              </span>
              <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {getImportIntentLabel(candidate.intakeSession?.importIntent ?? "framing")}
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900">
                {getImportTargetLabel(candidate.intakeSession?.importIntent ?? "framing")}
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getBacklogBadgeClasses(candidateState)}`}>
                {getBacklogLabel(candidateState)}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{candidate.summary}</p>
            {getCandidateRelationshipSummary(candidate, allCandidates) ? (
              <p className="text-sm text-sky-900">{getCandidateRelationshipSummary(candidate, allCandidates)}</p>
            ) : null}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>File: {candidate.file.fileName}</span>
              <span>Source: {candidate.sourceSectionMarker}</span>
              <span>
                Queue: {candidate.issueProgress.unresolved} open / {candidate.issueProgress.total} total
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row">
          <Button asChild size="sm" variant={isSelected ? "default" : "secondary"}>
            <Link
              href={buildReviewHref({
                candidateId: candidate.id,
                reviewStatusFilter,
                findingFilter: "all",
                importIntent: importIntentFilter
              })}
            >
              Open focused workspace
            </Link>
          </Button>
        </div>
      </div>
      <CandidateInlineEditor
        allCandidates={allCandidates}
        projectOutcomes={projectOutcomes}
        projectEpics={projectEpics}
        candidate={candidate}
      />
    </div>
  );
}

function CollapsibleSection(props: {
  title: ReactNode;
  description: ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-background" open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{props.title}</p>
            {props.badge ? (
              <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {props.badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-4 py-4">{props.children}</div>
    </details>
  );
}

function FindingDispositionAction(props: {
  candidate: ReviewCandidate;
  issueId: string;
  issueAction: "confirmed" | "not_relevant";
  label: string;
}) {
  return (
    <form action={submitArtifactCandidateReviewAction}>
      <input name="candidateId" type="hidden" value={props.candidate.id} />
      <input name="candidateType" type="hidden" value={props.candidate.type} />
      <input name="intent" type="hidden" value="edit" />
      <input name="issueId" type="hidden" value={props.issueId} />
      <input name="issueAction" type="hidden" value={props.issueAction} />
      <Button size="sm" type="submit" variant="secondary">
        {props.label}
      </Button>
    </form>
  );
}

function getOperationalBadgeClasses(status: OperationalReviewItem["status"]) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "ready") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

function getOperationalStatusLabel(status: OperationalReviewItem["status"], language: "en" | "sv" = "en") {
  if (status === "approved") {
    return language === "sv" ? "Redo att starta build" : "Ready to start build";
  }

  if (status === "ready") {
    return language === "sv" ? "Behöver mänsklig granskning" : "Needs human review";
  }

  return language === "sv" ? "Blockerad" : "Blocked";
}

function getOperationalSectionLabel(workflow: OperationalReviewItem["workflow"], language: "en" | "sv" = "en") {
  if (workflow === "outcome_tollgate") {
    return language === "sv" ? "Framingbrief" : "Framing brief";
  }

  return language === "sv" ? "Delivery Story" : "Delivery Story";
}

function ReviewSummaryCard(props: {
  label: ReactNode;
  count: number | string;
  description: ReactNode;
  className: string;
  actionHref?: string | undefined;
  actionLabel?: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${props.className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{props.label}</p>
      <p className="mt-2 text-2xl font-semibold">{props.count}</p>
      <p className="mt-2 text-sm leading-6 opacity-90">{props.description}</p>
      {props.actionHref && props.actionLabel ? (
        <Button asChild className="mt-4 gap-2" size="sm" variant="secondary">
          <Link href={props.actionHref}>
            {props.actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const query = searchParams ? await searchParams : {};
  const language = await getServerLanguage();
  const candidateId = getParamValue(query.candidateId);
  const [queue, operationalReview] = await Promise.all([loadArtifactReviewQueue(candidateId), loadOperationalReviewDashboard()]);
  const message = getParamValue(query.message);
  const status = getParamValue(query.status);
  const reviewStatusFilter = getParamValue(query.reviewStatusFilter) ?? "all";
  const findingFilter = getParamValue(query.findingFilter) ?? "all";
  const importIntentFilter = getParamValue(query.importIntent) ?? "all";
  const requestedReviewOutcomeId = getParamValue(query.reviewOutcomeId) ?? null;
  const reviewHelp = getHelpPattern("review.workspace", null, language);

  const completedCount = queue.summary.promoted + queue.summary.rejected;
  const remainingCount = queue.items.length;
  const completionPercent = queue.summary.total > 0 ? Math.round((completedCount / queue.summary.total) * 100) : 0;
  const sortedQueueItems = sortReviewCandidates(queue.items, queue.items);
  const visibleItems = sortedQueueItems.filter((candidate) => {
    if (importIntentFilter !== "all" && (candidate.intakeSession?.importIntent ?? "framing") !== importIntentFilter) {
      return false;
    }

    if (reviewStatusFilter === "all") {
      return true;
    }

    return getBacklogState(candidate) === reviewStatusFilter;
  });

  const selectedCandidate = queue.selectedCandidate;
  const selectedCandidateState = selectedCandidate ? getBacklogState(selectedCandidate) : null;
  const selectedImportIntent = selectedCandidate?.intakeSession?.importIntent ?? "framing";
  const selectedSessionCandidates = selectedCandidate
    ? sortReviewCandidates(
        queue.items.filter((candidate) => candidate.intakeSession?.id === selectedCandidate.intakeSession?.id),
        queue.items
      )
    : [];
  const selectedCandidateOutcomeOptions = queue.projectOutcomes ?? [];
  const selectedCandidateImportedEpicOptions = selectedCandidate ? getImportedEpicOptions(queue.items, selectedCandidate) : [];
  const selectedOutcomeCandidateId =
    selectedCandidate?.draftRecord?.outcomeCandidateId &&
    selectedCandidateOutcomeOptions.some((option) => option.id === selectedCandidate.draftRecord?.outcomeCandidateId)
      ? selectedCandidate.draftRecord.outcomeCandidateId
      : selectedCandidateOutcomeOptions.length === 1
        ? selectedCandidateOutcomeOptions[0]?.id ?? ""
        : selectedCandidate?.draftRecord?.outcomeCandidateId ?? "";
  const selectedProjectEpicOptions = selectedOutcomeCandidateId
    ? queue.projectEpics.filter((option) => option.outcomeId === selectedOutcomeCandidateId)
    : queue.projectEpics;
  const selectedCandidateEpicOptions = [
    ...selectedCandidateImportedEpicOptions.map((option) => ({ id: option.id, label: describeCandidateOption(option) })),
    ...selectedProjectEpicOptions
      .filter((option) => !selectedCandidateImportedEpicOptions.some((candidateOption) => candidateOption.id === option.id))
      .map((option) => ({ id: option.id, label: describeProjectEpicOption(option) }))
  ];
  const selectedEpicCandidateId =
    selectedCandidate?.draftRecord?.epicCandidateId &&
    selectedCandidateEpicOptions.some((option) => option.id === selectedCandidate.draftRecord?.epicCandidateId)
      ? selectedCandidate.draftRecord.epicCandidateId
      : selectedCandidateEpicOptions.length === 1
        ? selectedCandidateEpicOptions[0]?.id ?? ""
        : selectedCandidate?.draftRecord?.epicCandidateId ?? "";
  const selectedNeedsCurrentOutcomeOption =
    selectedOutcomeCandidateId.length > 0 &&
    !selectedCandidateOutcomeOptions.some((option) => option.id === selectedOutcomeCandidateId);
  const selectedNeedsCurrentEpicOption =
    selectedEpicCandidateId.length > 0 &&
    !selectedCandidateEpicOptions.some((option) => option.id === selectedEpicCandidateId);
  const displayedSelectedCandidateKey = getDisplayedCandidateKey(
    queue.items,
    selectedCandidate,
    selectedCandidate?.intakeSession?.importIntent ?? "framing"
  );
  const visibleFindings =
    selectedCandidate?.complianceResult?.findings.filter((finding: ReviewFinding) => {
      if (findingFilter === "all") {
        return true;
      }

      return finding.category === findingFilter;
    }) ?? [];
  const visibleFramingItems = sortReviewCandidates(
    visibleItems.filter((candidate) => (candidate.intakeSession?.importIntent ?? "framing") === "framing"),
    queue.items
  );
  const activeFramingCandidate =
    selectedCandidate?.intakeSession?.importIntent === "framing"
      ? selectedCandidate
      : !selectedCandidate
        ? visibleFramingItems[0] ?? null
        : null;
  const activeFramingWorkspace =
    activeFramingCandidate
      ? await loadArtifactIntakeWorkspace({
          sessionId: activeFramingCandidate.intakeSession?.id ?? null,
          fileId: activeFramingCandidate.file?.id ?? null
        })
      : null;
  const activeFramingSession =
    activeFramingWorkspace?.state === "ready"
      ? activeFramingWorkspace.sessions.find((session) => session.id === activeFramingCandidate?.intakeSession?.id) ?? null
      : null;
  const activeFramingFile =
    activeFramingSession?.files.find((file) => file.id === activeFramingCandidate?.file?.id) ?? null;
  const activeFramingFileCandidates = activeFramingFile
    ? (activeFramingSession?.candidates ?? []).filter((candidate) => candidate.fileId === activeFramingFile.id)
    : [];
  const activeFramingWorkspaceCandidate =
    activeFramingFileCandidates.find((candidate) => candidate.id === activeFramingCandidate?.id) ??
    activeFramingFileCandidates[0] ??
    null;
  const showImportStyleFramingReview = Boolean(
    activeFramingCandidate &&
      activeFramingWorkspace?.state === "ready" &&
      activeFramingSession &&
      activeFramingFile &&
      activeFramingWorkspaceCandidate
  );

  const importIntentGroups = (["framing", "design"] as const)
    .map((importIntent) => {
      const items = visibleItems.filter((candidate) => (candidate.intakeSession?.importIntent ?? "framing") === importIntent);
      const sessions = new Map<
        string,
        {
          id: string;
          label: string;
          fileNames: string[];
          files: Array<{
            id: string;
            fileName: string;
            candidateId: string;
            itemCount: number;
          }>;
          items: typeof items;
        }
      >();

      for (const candidate of items) {
        const sessionKey = candidate.intakeSession?.id || `candidate-${candidate.id}`;
        const existingSession = sessions.get(sessionKey);

        if (existingSession) {
          existingSession.items.push(candidate);
          if (!existingSession.fileNames.includes(candidate.file.fileName)) {
            existingSession.fileNames.push(candidate.file.fileName);
          }
          const existingFile = existingSession.files.find((file) => file.id === candidate.file.id);
          if (existingFile) {
            existingFile.itemCount += 1;
          } else {
            existingSession.files.push({
              id: candidate.file.id,
              fileName: candidate.file.fileName,
              candidateId: candidate.id,
              itemCount: 1
            });
          }
          continue;
        }

        sessions.set(sessionKey, {
          id: sessionKey,
          label: candidate.intakeSession?.label || candidate.file.fileName,
          fileNames: [candidate.file.fileName],
          files: [
            {
              id: candidate.file.id,
              fileName: candidate.file.fileName,
              candidateId: candidate.id,
              itemCount: 1
            }
          ],
          items: [candidate]
        });
      }

      return {
        importIntent,
        label: getImportIntentLabel(importIntent, language),
        items,
        sessions: [...sessions.values()]
          .map((sessionGroup) => ({
            ...sessionGroup,
            files: [...sessionGroup.files].sort((left, right) => compareText(left.fileName, right.fileName)),
            items: sortReviewCandidates(sessionGroup.items, queue.items)
          }))
          .sort((left, right) => compareText(right.label, left.label))
      };
    })
    .filter((group) => group.items.length > 0);
  const operationalGroups: Array<{
    title: string;
    description: string;
    items: OperationalReviewItem[];
    defaultOpen: boolean;
  }> = [
    {
      title: "Framing approvals",
      description: "Framing briefs waiting on Tollgate 1 approvals. Story Ideas stay in Framing and Import, not in Delivery review.",
      items: operationalReview.items.filter((item) => item.workflow === "outcome_tollgate"),
      defaultOpen: false
    },
    {
      title: "Delivery review",
      description: "Individual Delivery Stories no longer use human approval lanes here. This stays empty until a future design-wide checkpoint is introduced.",
      items: operationalReview.items.filter((item) => item.workflow === "story_review" || item.workflow === "delivery_start"),
      defaultOpen: false
    }
  ];
  const framingReviewItems = operationalReview.items.filter((item) => item.workflow === "outcome_tollgate");
  const deliveryReviewItems = operationalReview.items.filter(
    (item) => item.workflow === "story_review" || item.workflow === "delivery_start"
  );
  const projectName =
    operationalReview.organizationName && operationalReview.organizationName !== "Unknown project"
      ? operationalReview.organizationName
      : queue.organizationName;
  const firstBlockedOperational = operationalReview.items.find((item) => item.status === "blocked") ?? null;
  const firstInProgressOperational = operationalReview.items.find((item) => item.status === "ready") ?? null;
  const firstReadyToStart = operationalReview.items.find((item) => item.workflow === "delivery_start") ?? null;
  const firstOperationalOutcomeReviewItem =
    operationalReview.items.find((item) => item.workflow === "outcome_tollgate") ?? null;
  const selectedOperationalReviewItem =
    operationalReview.items.find(
      (item) =>
        item.workflow === "outcome_tollgate" &&
        item.entityId === (requestedReviewOutcomeId ?? (!candidateId ? firstOperationalOutcomeReviewItem?.entityId ?? null : null))
    ) ?? null;
  const firstImportedCandidate =
    sortedQueueItems.find((candidate) => {
      const state = getBacklogState(candidate);
      return state === "needs_action" || state === "needs_confirmation" || state === "pending";
    }) ?? null;

  return (
    <AppShell
      topbarProps={{
        projectName,
        sectionLabel: language === "sv" ? "Mänsklig granskning" : "Human Review",
        badge: "Project section"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <FileSearch className="h-3.5 w-3.5 text-primary" />
            <LocalizedText en="Human review command center" sv="Kommandocenter för mänsklig granskning" />
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            <LocalizedText en="Human Review dashboard" sv="Översikt för mänsklig granskning" />
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            <LocalizedText
              en="Use this page whenever you want one answer to the question: what still needs a human decision right now? Framing and Value Spine hold the working context, while Human Review separates framing decisions from delivery checkpoints so you do not have to guess what kind of review you are looking at."
              sv="Använd den här sidan när du vill ha ett tydligt svar på frågan: vad kräver fortfarande ett mänskligt beslut just nu? Framing och Value Spine håller arbetskontexten, medan Human Review skiljer framingbeslut från leveranskontroller så att du slipper gissa vilken typ av granskning du tittar på."
            />
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                <LocalizedText en="Human Review" sv="Mänsklig granskning" />
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <LocalizedText
                  en="Start here when you want to know what a human must review, clarify or hand off next."
                  sv="Börja här när du vill se vad en människa måste granska, förtydliga eller lämna vidare härnäst."
                />
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                <LocalizedText en="Framing review" sv="Framing-granskning" />
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <LocalizedText
                  en="Story Ideas stay in Framing, while Tollgate 1 approvals for the Framing brief are coordinated here. This is about intent and direction, not delivery execution."
                  sv="Story Ideas ligger kvar i Framing, medan Tollgate 1-godkännanden för framingbriefen samordnas här. Det här handlar om riktning och intention, inte om leveransexekvering."
                />
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                <LocalizedText en="Delivery review" sv="Leveransgranskning" />
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                <LocalizedText
                  en="Individual Delivery Stories do not use approval lanes here anymore. Use the Story pages for design completeness and Value Spine checks instead."
                  sv="Enskilda Delivery Stories använder inte längre godkännandespår här. Använd Story-sidorna i stället för designkomplettering och Value Spine-kontroller."
                />
              </p>
            </div>
          </div>
          <div className="mt-5 max-w-4xl">
            <ContextHelp pattern={reviewHelp} summaryLabel={<LocalizedText en="Open human review help" sv="Öppna hjälp för human review" />} />
          </div>
        </div>

        {message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status === "error" || status === "blocked"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReviewSummaryCard
            actionHref={firstBlockedOperational?.href ?? firstInProgressOperational?.href ?? firstReadyToStart?.href}
            actionLabel={
              firstBlockedOperational
                ? <LocalizedText en="Open first blocked review" sv="Öppna första blockerade granskningen" />
                : firstInProgressOperational
                  ? <LocalizedText en="Open next review" sv="Öppna nästa granskning" />
                  : firstReadyToStart
                    ? <LocalizedText en="Open ready Delivery Story" sv="Öppna färdig Delivery Story" />
                    : undefined
            }
            className="border-border/70 bg-background text-foreground"
            count={operationalReview.summary.total}
            description={
              <LocalizedText
                en="All framing reviews and Delivery Story reviews that still need human attention."
                sv="Alla framinggranskningar och Delivery Story-granskningar som fortfarande behöver mänsklig uppmärksamhet."
              />
            }
            label={<LocalizedText en="Needs human action now" sv="Behöver mänsklig åtgärd nu" />}
          />
          <ReviewSummaryCard
            actionHref={framingReviewItems[0]?.href}
            actionLabel={framingReviewItems[0] ? <LocalizedText en="Open framing review" sv="Öppna framinggranskning" /> : undefined}
            className="border-sky-200 bg-sky-50 text-sky-950"
            count={framingReviewItems.length}
            description={
              <LocalizedText
                en="Outcome tollgates and framing decisions that still need a human reviewer."
                sv="Outcome-tollgates och framingbeslut som fortfarande behöver en mänsklig granskare."
              />
            }
            label={<LocalizedText en="Framing approvals" sv="Framing-godkännanden" />}
          />
          <ReviewSummaryCard
            actionHref={deliveryReviewItems[0]?.href}
            actionLabel={deliveryReviewItems[0] ? <LocalizedText en="Open delivery review" sv="Öppna leveransgranskning" /> : undefined}
            className="border-indigo-200 bg-indigo-50 text-indigo-950"
            count={deliveryReviewItems.length}
            description={
              <LocalizedText
                en="Reserved for a future design-wide checkpoint. Individual Delivery Stories are no longer approved here."
                sv="Reserverad för en framtida designövergripande kontrollpunkt. Enskilda Delivery Stories godkänns inte längre här."
              />
            }
            label={<LocalizedText en="Delivery review" sv="Leveransgranskning" />}
          />
          <ReviewSummaryCard
            actionHref={firstBlockedOperational?.href}
            actionLabel={firstBlockedOperational ? <LocalizedText en="Go to blocker" sv="Gå till blockerare" /> : undefined}
            className="border-rose-200 bg-rose-50 text-rose-950"
            count={operationalReview.summary.blocked}
            description={
              <LocalizedText
                en="Human work cannot continue until these blockers are cleared in the linked workspace."
                sv="Mänskligt arbete kan inte fortsätta förrän dessa blockerare har lösts i den länkade arbetsytan."
              />
            }
            label={<LocalizedText en="Blocked reviews" sv="Blockerade granskningar" />}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReviewSummaryCard
            actionHref={
              firstImportedCandidate
                ? buildReviewHref({
                    candidateId: firstImportedCandidate.id,
                    importIntent: firstImportedCandidate.intakeSession?.importIntent ?? "framing"
                  })
                : undefined
            }
            actionLabel={firstImportedCandidate ? <LocalizedText en="Open import approval" sv="Öppna importgodkännande" /> : undefined}
            className="border-border/70 bg-background text-foreground"
            count={remainingCount}
            description={
              <LocalizedText
                en="Imported objects waiting to be approved into Framing or Design."
                sv="Importerade objekt som väntar på att godkännas in i Framing eller Design."
              />
            }
            label={<LocalizedText en="Import objects to review" sv="Importobjekt att granska" />}
          />
          <ReviewSummaryCard
            className="border-emerald-200 bg-emerald-50 text-emerald-950"
            count={completedCount}
            description={
              <LocalizedText
                en="Imported candidates that already have a final human decision: approved into project records or discarded."
                sv="Importerade kandidater som redan har ett slutligt mänskligt beslut: godkända in i projektposter eller avvisade."
              />
            }
            label={<LocalizedText en="Imported decisions done" sv="Importerade beslut klara" />}
          />
          <ReviewSummaryCard
            actionHref={
              firstImportedCandidate
                ? buildReviewHref({
                    candidateId: firstImportedCandidate.id,
                    importIntent: firstImportedCandidate.intakeSession?.importIntent ?? "framing"
                  })
                : undefined
            }
            actionLabel={firstImportedCandidate ? <LocalizedText en="Resolve next import approval" sv="Hantera nästa importgodkännande" /> : undefined}
            className="border-sky-200 bg-sky-50 text-sky-950"
            count={remainingCount}
            description={
              <LocalizedText
                en="Imported objects that still need a human to fix, approve or reject."
                sv="Importerade objekt som fortfarande behöver en människa för att rätta, godkänna eller avvisa."
              />
            }
            label={<LocalizedText en="Imported decisions left" sv="Importerade beslut kvar" />}
          />
          <ReviewSummaryCard
            className="border-border/70 bg-background text-foreground"
            count={`${completionPercent}%`}
            description={
              <LocalizedText
                en="How much of the imported review queue already has a final human disposition."
                sv="Hur stor del av den importerade granskningskön som redan har ett slutligt mänskligt beslut."
              />
            }
            label={<LocalizedText en="Imported queue completed" sv="Importerad kö klar" />}
          />
        </div>

        <Card className="border-border/70 shadow-sm" id="operational-review">
          <CardHeader>
            <CardTitle>
              <LocalizedText en="Human review lanes" sv="Spår för human review" />
            </CardTitle>
            <CardDescription>
              <LocalizedText
                en="This page is split into Framing approvals and Delivery review. Story Ideas stay in Framing or Import. Individual Delivery Stories no longer require human approval lanes here."
                sv="Den här sidan är uppdelad i Framing-godkännanden och leveransgranskning. Story Ideas ligger kvar i Framing eller Import. Enskilda Delivery Stories kräver inte längre egna human review-spår här."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operationalReview.state === "unavailable" ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                {operationalReview.message}
              </div>
            ) : operationalReview.items.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <LocalizedText
                  en="No Framing approvals are currently waiting for human action."
                  sv="Inga Framing-godkännanden väntar just nu på mänsklig åtgärd."
                />
              </div>
            ) : (
              operationalGroups.map((group) => (
                <CollapsibleSection
                  badge={`${group.items.length}`}
                  defaultOpen={group.defaultOpen}
                  description={group.description}
                  key={group.title}
                  title={group.title}
                >
                  {group.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items are currently in this group.</p>
                  ) : (
                    <div className="grid gap-3">
                      {group.items.map((item) => (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item.id}>
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">{item.title}</p>
                                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                  {item.key}
                                </span>
                                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              {getOperationalSectionLabel(item.workflow, language)}
                                </span>
                                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getOperationalBadgeClasses(item.status)}`}>
                                  {getOperationalStatusLabel(item.status, language)}
                                </span>
                              </div>
                              <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span>Context: {item.context}</span>
                                <span>Open lanes: {item.pendingLaneCount}</span>
                                {item.blocker ? <span>Primary blocker: {item.blocker}</span> : null}
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-2 sm:flex-row">
                              <Button asChild size="sm" variant="secondary">
                                <Link href={item.href}>
                                  {item.actionLabel}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleSection>
              ))
            )}
          </CardContent>
        </Card>

        {selectedOperationalReviewItem ? (
          <section className="space-y-4" id="approval-workspace">
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <LocalizedText en="Human review approval workspace" sv="Arbetsyta för godkännande i mänsklig granskning" />
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    {selectedOperationalReviewItem.key} {selectedOperationalReviewItem.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    <LocalizedText
                      en="This is the same live Tollgate 1 approval workspace that Framing uses, surfaced directly in Human Review so you can complete approvals here."
                      sv="Det här är samma live-arbetsyta för Tollgate 1-godkännande som Framing använder, nu visad direkt i Human Review så att du kan slutföra godkännanden här."
                    />
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getOperationalBadgeClasses(selectedOperationalReviewItem.status)}`}>
                    {getOperationalStatusLabel(selectedOperationalReviewItem.status, language)}
                  </span>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/framing?outcomeId=${selectedOperationalReviewItem.entityId}#tollgate-review`}>
                      <LocalizedText en="Open full Framing" sv="Öppna hela Framing" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <Suspense fallback={<OutcomeTollgateSectionFallback />}>
              <OutcomeTollgateApprovalSection
                defaultBlockers={selectedOperationalReviewItem.blocker ? [selectedOperationalReviewItem.blocker] : []}
                isArchived={false}
                outcomeId={selectedOperationalReviewItem.entityId}
                recordTollgateDecisionAction={recordOutcomeTollgateDecisionAction}
                returnPath="/review"
              />
            </Suspense>
          </section>
        ) : null}

        {queue.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>
                <LocalizedText en="Imported review backlog is unavailable" sv="Importerad granskningsbacklog är inte tillgänglig" />
              </CardTitle>
              <CardDescription>{queue.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>
                      <LocalizedText en="Import object review" sv="Granskning av importobjekt" />
                    </CardTitle>
                    <CardDescription>
                      <LocalizedText
                        en="This section only covers imported objects from Import. Tollgate 1, framing PDFs, and version approvals remain in Human review lanes above."
                        sv="Den här sektionen täcker bara importerade objekt från Import. Tollgate 1, framing-PDF:er och versionsgodkännanden ligger kvar i spåren för human review ovanför."
                      />
                    </CardDescription>
                  </div>
                  {reviewStatusFilter !== "all" || importIntentFilter !== "all" ? (
                    <Button asChild className="gap-2" variant="secondary">
                      <Link href={buildReviewHref({ candidateId })}>
                        <LocalizedText en="Clear filter" sv="Rensa filter" />
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {importIntentGroups.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    <LocalizedText
                      en="No imported candidates are currently waiting for human action. Sessions where every imported object was already approved or rejected are hidden from this review list."
                      sv="Inga importerade kandidater väntar just nu på mänsklig åtgärd. Sessioner där varje importerat objekt redan har godkänts eller avvisats döljs från den här granskningslistan."
                    />
                  </div>
                ) : (
                  importIntentGroups.map((intentGroup) => (
                    <div className="space-y-4" key={intentGroup.importIntent}>
                      {intentGroup.importIntent === "framing" ? (
                        <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">
                                <LocalizedText en="Imported framing objects" sv="Importerade framingobjekt" />
                              </p>
                              <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                <LocalizedText
                                  en={`${intentGroup.sessions.length} session${intentGroup.sessions.length === 1 ? "" : "s"}`}
                                  sv={`${intentGroup.sessions.length} session${intentGroup.sessions.length === 1 ? "" : "er"}`}
                                />
                              </span>
                            </div>
                            <p className="text-sm leading-6 text-muted-foreground">
                              <LocalizedText
                                en="Open one import session below to review imported objects in the same indented value spine workspace as Import."
                                sv="Öppna en importsession nedan för att granska importerade objekt i samma indenterade value spine-arbetsyta som i Import."
                              />
                            </p>
                          </div>

                          {intentGroup.sessions.map((group) => (
                            <CollapsibleSection
                              badge={`${group.items.length}`}
                              defaultOpen={activeFramingSession ? group.id === activeFramingSession.id : true}
                              description={`Files: ${group.fileNames.join(", ")}.`}
                              key={`${intentGroup.importIntent}-${group.id}`}
                              title={group.label}
                            >
                              <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                                  <p className="text-sm text-muted-foreground">
                                    <LocalizedText
                                      en="This import session only affects imported review objects. Deleting it removes the intake session, files, and import candidates from review, but keeps any project records that were already approved into Framing or Design."
                                      sv="Den här importsessionen påverkar bara importerade granskningsobjekt. Om du tar bort den försvinner importsessionen, filerna och importkandidaterna från review, men projektposter som redan har godkänts in i Framing eller Design behålls."
                                    />
                                  </p>
                                  <form action={deleteArtifactIntakeSessionAction}>
                                    <input name="sessionId" type="hidden" value={group.id} />
                                    <Button className="gap-2" type="submit" variant="secondary">
                                      <CircleAlert className="h-4 w-4" />
                                      <LocalizedText en="Delete import session" sv="Ta bort importsession" />
                                    </Button>
                                  </form>
                                </div>
                                <div className="grid gap-3">
                                {group.files.map((file) => {
                                  const isActive = activeFramingFile?.id === file.id;

                                  return (
                                    <Link
                                      className={`rounded-2xl border px-4 py-3 text-sm transition ${
                                        isActive
                                          ? "border-primary/40 bg-primary/5 text-foreground"
                                          : "border-border/70 bg-background/80 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                      }`}
                                      href={buildReviewHref({
                                        candidateId: file.candidateId,
                                        reviewStatusFilter,
                                        findingFilter,
                                        importIntent: intentGroup.importIntent
                                      })}
                                      key={file.id}
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="font-medium">{file.fileName}</span>
                                        <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium">
                                          {file.itemCount} item{file.itemCount === 1 ? "" : "s"}
                                        </span>
                                      </div>
                                    </Link>
                                  );
                                })}
                                </div>
                              </div>
                            </CollapsibleSection>
                          ))}
                        </div>
                      ) : (
                        <>
                          <form
                            action={submitArtifactBulkReviewAction}
                            className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                            id={`bulk-review-${intentGroup.importIntent}`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium text-foreground">Imported design objects</p>
                                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {intentGroup.items.length} Delivery candidate(s)
                                  </span>
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                  Approve checked rows to create Delivery Stories in Design. Linked Outcome and Epic candidates are promoted automatically when needed.
                                </p>
                              </div>
                              <div className="flex flex-col gap-3 lg:min-w-[320px]">
                                <textarea
                                  className="min-h-20 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                                  name="bulkReviewComment"
                                  placeholder="Optional decision note for all checked candidates"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <Button className="gap-2" name="bulkIntent" type="submit" value="approve">
                                    <ShieldCheck className="h-4 w-4" />
                                    Approve selected as Delivery Stories
                                  </Button>
                                  <Button className="gap-2" name="bulkIntent" type="submit" value="reject" variant="secondary">
                                    <CircleAlert className="h-4 w-4" />
                                    Reject selected
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </form>

                          {intentGroup.sessions.map((group) => (
                          <CollapsibleSection
                            badge={`${group.items.length}`}
                            defaultOpen={selectedCandidate ? group.items.some((candidate) => candidate.id === selectedCandidate.id) : true}
                            description={`Files: ${group.fileNames.join(", ")}. Sorted as Outcome -> Epic -> ${intentGroup.importIntent === "design" ? "Delivery Story" : "Story Idea"}.`}
                            key={`${intentGroup.importIntent}-${group.id}`}
                            title={group.label}
                          >
                            {group.items.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No review items are currently in this import session.</p>
                            ) : (
                              <ReviewSessionValueSpine
                                bulkFormId={`bulk-review-${intentGroup.importIntent}`}
                                candidates={group.items}
                                description={`Approve or reject directly from this import spine. Grouped as Outcome -> Epic -> ${intentGroup.importIntent === "design" ? "Delivery Story" : "Story Idea"}.`}
                                projectEpics={queue.projectEpics}
                                projectOutcomes={queue.projectOutcomes}
                                reviewHref={(candidateId) =>
                                  buildReviewHref({
                                    candidateId,
                                    reviewStatusFilter,
                                    findingFilter,
                                    importIntent: intentGroup.importIntent
                                  })
                                }
                                selectedCandidateId={selectedCandidate?.id ?? null}
                                title={group.label}
                              />
                            )}
                          </CollapsibleSection>
                          ))}
                        </>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {showImportStyleFramingReview &&
            activeFramingWorkspace?.state === "ready" &&
            activeFramingSession &&
            activeFramingFile &&
            activeFramingWorkspaceCandidate ? (
              <ArtifactIntakeReviewWorkspace
                fileCandidates={activeFramingFileCandidates}
                projectEpics={activeFramingWorkspace.projectEpics}
                projectOutcomes={activeFramingWorkspace.projectOutcomes}
                selectedCandidate={activeFramingWorkspaceCandidate}
                selectedFile={activeFramingFile}
                session={activeFramingSession}
                submitAction={submitArtifactCandidateFromIntakeAction}
                submitCandidateDispositionInlineAction={submitArtifactCandidateIssueDispositionInlineAction}
                submitFramingBulkApproveAction={submitFramingBulkApproveFromIntakeAction}
                submitSectionBulkDeleteAction={submitArtifactSectionBulkDeleteInlineAction}
                submitSectionDispositionInlineAction={submitArtifactSectionDispositionInlineAction}
              />
            ) : !selectedCandidate ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Choose one item to start</CardTitle>
                  <CardDescription>
                    Select one imported candidate from the backlog to open its focused correction workspace.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-6 2xl:grid-cols-[minmax(340px,0.88fr)_minmax(0,1.12fr)]">
                <div className="space-y-6">
                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <CardTitle className="flex flex-wrap items-center gap-3">
                            <span>{selectedCandidate.title}</span>
                            <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {getCandidateObjectLabel(selectedCandidate, language)}
                            </span>
                            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {getImportIntentLabel(selectedCandidate.intakeSession?.importIntent ?? "framing", language)}
                            </span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBacklogBadgeClasses(selectedCandidateState ?? "needs_action")}`}>
                              {getBacklogLabel(selectedCandidateState ?? "needs_action")}
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Focus one imported item at a time. Review the source, inspect the parsed candidate, clear the correction queue, then approve or discard.
                          </CardDescription>
                        </div>
                        <Button asChild className="gap-2" variant="secondary">
                          <Link href={buildReviewHref({ reviewStatusFilter, findingFilter })}>
                            Back to backlog
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Issue progress</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {selectedCandidate.issueProgress.resolved} resolved / {selectedCandidate.issueProgress.unresolved} open
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Import context</p>
                        <p className="mt-2 text-sm leading-6 text-foreground">{selectedCandidate.intakeSession.label}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{selectedCandidate.file.fileName}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedImportIntent === "framing" && selectedSessionCandidates.length > 0 ? (
                    <ReviewSessionValueSpine
                      candidates={selectedSessionCandidates}
                      projectEpics={queue.projectEpics}
                      projectOutcomes={queue.projectOutcomes}
                      reviewHref={(candidateId) =>
                        buildReviewHref({
                          candidateId,
                          reviewStatusFilter,
                          findingFilter,
                          importIntent: selectedImportIntent
                        })
                      }
                      selectedCandidateId={selectedCandidate.id}
                      title="Framing value spine"
                      description="Same hierarchy as Import. Read the selected file as one Outcome -> Epic -> Story Idea spine while you review."
                    />
                  ) : null}

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Parsed candidate</CardTitle>
                      <CardDescription>
                        This is the current interpreted candidate record before it is approved into governed project data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {getCandidatePreviewRows(selectedCandidate).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No interpreted fields are populated yet for this candidate.</p>
                      ) : (
                        getCandidatePreviewRows(selectedCandidate).map((row) => (
                          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={row.label}>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{row.label}</p>
                            <p className="mt-2 text-sm leading-6 text-foreground">{row.value}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Full source</CardTitle>
                      <CardDescription>Keep the original artifact visible while you review and correct the imported interpretation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Section:</strong> {selectedCandidate.sourceSectionMarker}
                        </p>
                        <p className="mt-2">
                          <strong className="text-foreground">Current summary:</strong> {selectedCandidate.summary}
                        </p>
                      </div>
                      <pre className="max-h-[520px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-xs leading-6 text-slate-100 2xl:max-h-[640px]">
                        {selectedCandidate.file.content}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <CardTitle>Correction queue</CardTitle>
                          <CardDescription>
                            Work through the open findings in order. Fix in the workspace, confirm interpretations, or mark irrelevant noise.
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant={findingFilter === "all" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "all" })}>
                              All
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant={findingFilter === "missing" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "missing" })}>
                              Missing
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant={findingFilter === "human_only" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "human_only" })}>
                              Human-only
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant={findingFilter === "blocked" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "blocked" })}>
                              Blocked
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {visibleFindings.length === 0 ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                          No open findings match the current filter for this candidate.
                        </div>
                      ) : (
                        visibleFindings.map((finding: ReviewFinding) => {
                          const disposition = selectedCandidate.issueDispositions[finding.code];
                          const dispositionLabel = getDispositionLabel(disposition?.action);

                          return (
                            <div
                              className={`rounded-2xl border px-4 py-4 text-sm ${getFindingClasses(finding.category)}`}
                              key={`${selectedCandidate.id}-${finding.code}`}
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-current">
                                      {getActionVerb(finding.category)} {finding.fieldLabel ? finding.fieldLabel.toLowerCase() : "this issue"}
                                    </p>
                                    <span className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium">
                                      {formatLabel(finding.category)}
                                    </span>
                                    {dispositionLabel ? (
                                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getDispositionClasses(disposition?.action)}`}>
                                        {dispositionLabel}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-2 leading-6">{finding.message}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button asChild size="sm" variant="secondary">
                                    <Link href="#candidate-editor">Fix in workspace</Link>
                                  </Button>
                                  {finding.category === "uncertain" || finding.category === "human_only" ? (
                                    <FindingDispositionAction candidate={selectedCandidate} issueAction="confirmed" issueId={finding.code} label="Confirm" />
                                  ) : null}
                                  <FindingDispositionAction candidate={selectedCandidate} issueAction="not_relevant" issueId={finding.code} label="Mark not relevant" />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>

                  <form action={submitArtifactCandidateReviewAction} className="space-y-4" id="candidate-editor">
                    <input name="candidateId" type="hidden" value={selectedCandidate.id} />
                    <input name="candidateType" type="hidden" value={selectedCandidate.type} />
                    <input name="importIntent" type="hidden" value={selectedCandidate.intakeSession?.importIntent ?? "framing"} />

                    <Card className="border-border/70 shadow-sm">
                      <CardHeader>
                        <CardTitle>Focused correction workspace</CardTitle>
                        <CardDescription>
                          Update the parsed candidate, resolve human-only decisions, then send it onward with a clear disposition.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Key</span>
                            <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={displayedSelectedCandidateKey} name="key" type="text" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Title</span>
                            <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.title ?? selectedCandidate.title} name="title" type="text" />
                          </label>
                        </div>

                        <CollapsibleSection badge={selectedCandidate.type} defaultOpen={false} description="Type-specific fields for the current candidate." title="Candidate fields">
                          <div className="grid gap-4">
                            {selectedCandidate.type === "outcome" ? (
                              <>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Problem statement</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.problemStatement ?? ""} name="problemStatement" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Outcome statement</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.outcomeStatement ?? ""} name="outcomeStatement" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Baseline definition</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.baselineDefinition ?? ""} name="baselineDefinition" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Baseline source</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.baselineSource ?? ""} name="baselineSource" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Timeframe</span>
                                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.timeframe ?? ""} name="timeframe" type="text" />
                                </label>
                              </>
                            ) : null}

                            {selectedCandidate.type === "epic" ? (
                              <>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Purpose</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.purpose ?? ""} name="purpose" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Scope boundary</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.scopeBoundary ?? ""} name="scopeBoundary" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Risk note</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.riskNote ?? ""} name="riskNote" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Linked Outcome</span>
                                  <select
                                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                    defaultValue={selectedOutcomeCandidateId}
                                    name="outcomeCandidateId"
                                  >
                                    <option value="">Select linked Outcome</option>
                                    {selectedCandidateOutcomeOptions.length === 1 ? (
                                      <option value={selectedCandidateOutcomeOptions[0]?.id ?? ""}>
                                        {describeProjectOutcomeOption(selectedCandidateOutcomeOptions[0]!)}
                                      </option>
                                    ) : null}
                                    {selectedNeedsCurrentOutcomeOption ? (
                                      <option value={selectedOutcomeCandidateId}>
                                        Current linked record ({selectedOutcomeCandidateId})
                                      </option>
                                    ) : null}
                                    {selectedCandidateOutcomeOptions.length > 1
                                      ? selectedCandidateOutcomeOptions.map((option) => (
                                          <option key={option.id} value={option.id}>
                                            {describeProjectOutcomeOption(option)}
                                          </option>
                                        ))
                                      : null}
                                  </select>
                                </label>
                              </>
                            ) : null}

                            {selectedCandidate.type === "story" ? (
                              <>
                                {selectedCandidate.intakeSession?.importIntent === "design" ? (
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Story type</span>
                                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.storyType ?? "outcome_delivery"} name="storyType">
                                      <option value="outcome_delivery">Outcome delivery</option>
                                      <option value="governance">Governance</option>
                                      <option value="enablement">Enablement</option>
                                    </select>
                                  </label>
                                ) : (
                                  <input name="storyType" type="hidden" value={selectedCandidate.draftRecord?.storyType ?? "outcome_delivery"} />
                                )}
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Value intent</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.valueIntent ?? ""} name="valueIntent" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Expected behavior</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.expectedBehavior ?? ""} name="expectedBehavior" />
                                </label>
                                {selectedCandidate.intakeSession?.importIntent === "design" ? (
                                  <>
                                    <label className="space-y-2">
                                      <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                                      <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={(selectedCandidate.draftRecord?.acceptanceCriteria ?? []).join("\n")} name="acceptanceCriteria" />
                                    </label>
                                    <label className="space-y-2">
                                      <span className="text-sm font-medium text-foreground">AI usage scope</span>
                                      <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={(selectedCandidate.draftRecord?.aiUsageScope ?? []).join(", ")} name="aiUsageScope" type="text" />
                                    </label>
                                    <label className="space-y-2">
                                      <span className="text-sm font-medium text-foreground">Test Definition</span>
                                      <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.testDefinition ?? ""} name="testDefinition" />
                                    </label>
                                    <label className="space-y-2">
                                      <span className="text-sm font-medium text-foreground">Definition of Done</span>
                                      <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={(selectedCandidate.draftRecord?.definitionOfDone ?? []).join("\n")} name="definitionOfDone" />
                                    </label>
                                  </>
                                ) : (
                                  <>
                                    <input name="acceptanceCriteria" type="hidden" value="" />
                                    <input name="aiUsageScope" type="hidden" value="" />
                                    <input name="testDefinition" type="hidden" value="" />
                                    <input name="definitionOfDone" type="hidden" value="" />
                                  </>
                                )}
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Linked Outcome</span>
                                    <select
                                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                      defaultValue={selectedOutcomeCandidateId}
                                      name="outcomeCandidateId"
                                    >
                                      <option value="">Select linked Outcome</option>
                                      {selectedCandidateOutcomeOptions.length === 1 ? (
                                        <option value={selectedCandidateOutcomeOptions[0]?.id ?? ""}>
                                          {describeProjectOutcomeOption(selectedCandidateOutcomeOptions[0]!)}
                                        </option>
                                      ) : null}
                                      {selectedNeedsCurrentOutcomeOption ? (
                                        <option value={selectedOutcomeCandidateId}>
                                          Current linked record ({selectedOutcomeCandidateId})
                                        </option>
                                      ) : null}
                                      {selectedCandidateOutcomeOptions.length > 1
                                        ? selectedCandidateOutcomeOptions.map((option) => (
                                            <option key={option.id} value={option.id}>
                                              {describeProjectOutcomeOption(option)}
                                            </option>
                                          ))
                                        : null}
                                    </select>
                                  </label>
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Linked Epic</span>
                                    <select
                                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                      defaultValue={selectedEpicCandidateId}
                                      name="epicCandidateId"
                                    >
                                      <option value="">Select linked Epic</option>
                                      {selectedNeedsCurrentEpicOption ? (
                                        <option value={selectedEpicCandidateId}>
                                          Current linked record ({selectedEpicCandidateId})
                                        </option>
                                      ) : null}
                                      {selectedCandidateEpicOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection badge={`${selectedCandidate.issueProgress.categories.humanOnly} human-only`} defaultOpen={false} description="Resolve the decisions that explicitly require a human reviewer." title="Human-only decisions">
                          <div className="grid gap-4">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Value Owner</span>
                              <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.valueOwnerId ?? ""} name="valueOwnerId" type="text" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Baseline validity</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.baselineValidity ?? ""} name="baselineValidity">
                                <option value="">Unresolved</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="needs_follow_up">Needs follow-up</option>
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">AI level</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.aiAccelerationLevel ?? ""} name="aiAccelerationLevel">
                                <option value="">Unresolved</option>
                                <option value="level_1">Level 1</option>
                                <option value="level_2">Level 2</option>
                                <option value="level_3">Level 3</option>
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Risk profile</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.riskProfile ?? ""} name="riskProfile">
                                <option value="">Unresolved</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Risk acceptance status</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.riskAcceptanceStatus ?? ""} name="riskAcceptanceStatus">
                                <option value="">Unresolved</option>
                                <option value="accepted">Accepted</option>
                                <option value="needs_review">Needs review</option>
                              </select>
                            </label>
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection defaultOpen={false} description="Leave a short note and choose how this item should move through the backlog." title="Disposition">
                          <div className="space-y-4">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Review comment</span>
                              <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.reviewComment ?? ""} name="reviewComment" />
                            </label>

                            <div className="grid gap-3">
                              <Button className="gap-2" name="intent" type="submit" value="edit">
                                <GitBranch className="h-4 w-4" />
                                Fix and save
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="confirm" variant="secondary">
                                <CircleCheckBig className="h-4 w-4" />
                                Confirm interpretation
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="follow_up" variant="secondary">
                                <Clock3 className="h-4 w-4" />
                                Return to pending
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="reject" variant="secondary">
                                <CircleAlert className="h-4 w-4" />
                                Reject import
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="promote" variant="secondary">
                                <ShieldCheck className="h-4 w-4" />
                                {selectedCandidate.intakeSession?.importIntent === "design"
                                  ? "Approve as Delivery Story"
                                  : "Approve as Story Idea"}
                              </Button>
                            </div>
                          </div>
                        </CollapsibleSection>

                        {selectedCandidate.promotedEntityId ? (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                            Approved and promoted into project{" "}
                            {getPromotedEntityLabel(
                              selectedCandidate.type,
                              selectedCandidate.promotedEntityType,
                              selectedCandidate.intakeSession?.importIntent ?? "framing"
                            )}{" "}
                            with ID {selectedCandidate.promotedEntityId}.
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}
