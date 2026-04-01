import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, CircleAlert, CircleCheckBig, Clock3, ShieldCheck } from "lucide-react";
import { type getOutcomeWorkspaceService } from "@aas-companion/api";
import { deriveOutcomeRiskProfile, getOutcomeFramingBlockers } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type {
  OutcomeInlineSaveActionState,
  OutcomeFieldAiActionState,
  ReviewOutcomeFramingAiActionState,
  reviewOutcomeFramingWithAiAction
} from "@/app/(protected)/outcomes/[outcomeId]/actions";
import { FramingBriefExportPanel } from "@/components/framing/framing-brief-export-panel";
import { InlineFieldGuidance } from "@/components/shared/context-help";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { OutcomeAiReviewDialog } from "@/components/workspace/outcome-ai-review-dialog";
import { OutcomeAiValidatedTextarea } from "@/components/workspace/outcome-ai-validated-textarea";
import { FramingContextCard } from "@/components/workspace/framing-context-card";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { OutcomeAiRiskPostureCard } from "@/components/workspace/outcome-ai-risk-posture-card";
import { WorkspaceStatusSummary } from "@/components/workspace/story-workspace-shared";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOrganizationUsersData, getCachedOutcomeTollgateReviewData } from "@/lib/cache/project-data";
import { buildFramingBriefExport } from "@/lib/framing/framing-brief-export";
import { isLikelyDeliveryStory } from "@/lib/framing/story-idea-delivery-feedback";
import { isStoryIdeaReadyForFraming, isStoryIdeaStarted } from "@/lib/framing/story-idea-status";
import { getInlineGuidance } from "@/lib/help/aas-help";

type OutcomeWorkspaceData = Extract<Awaited<ReturnType<typeof getOutcomeWorkspaceService>>, { ok: true }>["data"];

type FramingOutcomeSectionProps = {
  data: OutcomeWorkspaceData;
  search: {
    created?: boolean;
    saveState?: string | null;
    submitState?: string | null;
    lifecycleState?: string | null;
    saveMessage?: string | null;
    blockersFromQuery?: string[];
    aiField?: "outcome_statement" | "baseline_definition" | null;
    aiVerdict?: "good" | "needs_revision" | "unclear" | null;
    aiConfidence?: "high" | "medium" | "low" | null;
    aiReason?: string | null;
    aiSuggestion?: string | null;
    aiError?: string | null;
    draftOutcomeStatement?: string | null;
    draftBaselineDefinition?: string | null;
  };
  embeddedInFraming?: boolean;
  saveAction: (formData: FormData) => void | Promise<void>;
  saveInlineAction: (formData: FormData) => Promise<OutcomeInlineSaveActionState>;
  createEpicAction: (formData: FormData) => void | Promise<void>;
  createStoryIdeaAction: (formData: FormData) => void | Promise<void>;
  archiveAction: (formData: FormData) => void | Promise<void>;
  hardDeleteAction: (formData: FormData) => void | Promise<void>;
  restoreAction: (formData: FormData) => void | Promise<void>;
  submitTollgateAction: (formData: FormData) => void | Promise<void>;
  recordTollgateDecisionAction: (formData: FormData) => void | Promise<void>;
  validateOutcomeStatementAiAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  validateBaselineDefinitionAiAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  reviewFramingAction: typeof reviewOutcomeFramingWithAiAction;
  initialReviewFramingState: ReviewOutcomeFramingAiActionState;
};

function getOriginLabel(originType: string) {
  if (originType === "seeded") return "Demo";
  if (originType === "native") return "Native";
  return "Imported";
}

function getOriginSummary(originType: string) {
  if (originType === "seeded") return "This case comes from the Demo project for guided exploration.";
  if (originType === "native") return "This case was authored natively and represents clean customer work.";
  return "This case was promoted from imported source material.";
}

function getWorkspaceLabel(outcome: { originType: string; createdMode: string }) {
  return outcome.originType === "native" && outcome.createdMode === "clean" ? "Clean" : "Shared";
}

function formatRoleLabel(value: string) {
  return value.replaceAll("_", " ");
}

function CollapsibleFramingPanel(props: {
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

export function FramingOutcomeSection({
  data,
  search,
  embeddedInFraming = false,
  saveAction,
  saveInlineAction,
  createEpicAction,
  createStoryIdeaAction,
  archiveAction,
  hardDeleteAction,
  restoreAction,
  submitTollgateAction,
  recordTollgateDecisionAction,
  validateOutcomeStatementAiAction,
  validateBaselineDefinitionAiAction,
  reviewFramingAction,
  initialReviewFramingState
}: FramingOutcomeSectionProps) {
  const { outcome, tollgate, removal } = data;
  const computedBlockers = getOutcomeFramingBlockers({
    title: outcome.title,
    outcomeStatement: outcome.outcomeStatement ?? null,
    baselineDefinition: outcome.baselineDefinition ?? null,
    valueOwnerId: outcome.valueOwnerId ?? null,
    aiUsageRole:
      outcome.aiUsageRole === "support" ||
      outcome.aiUsageRole === "generation" ||
      outcome.aiUsageRole === "validation" ||
      outcome.aiUsageRole === "decision_support" ||
      outcome.aiUsageRole === "automation"
        ? outcome.aiUsageRole
        : null,
    aiExecutionPattern:
      outcome.aiExecutionPattern === "assisted" ||
      outcome.aiExecutionPattern === "step_by_step" ||
      outcome.aiExecutionPattern === "orchestrated"
        ? outcome.aiExecutionPattern
        : null,
    aiUsageIntent: outcome.aiUsageIntent ?? null,
    businessImpactLevel: outcome.businessImpactLevel ?? null,
    businessImpactRationale: outcome.businessImpactRationale ?? null,
    dataSensitivityLevel: outcome.dataSensitivityLevel ?? null,
    dataSensitivityRationale: outcome.dataSensitivityRationale ?? null,
    blastRadiusLevel: outcome.blastRadiusLevel ?? null,
    blastRadiusRationale: outcome.blastRadiusRationale ?? null,
    decisionImpactLevel: outcome.decisionImpactLevel ?? null,
    decisionImpactRationale: outcome.decisionImpactRationale ?? null,
    aiLevelJustification: outcome.aiLevelJustification ?? null,
    riskAcceptedAt: outcome.riskAcceptedAt ?? null,
    riskAcceptedByValueOwnerId: outcome.riskAcceptedByValueOwnerId ?? null,
    riskProfile: outcome.riskProfile,
    aiAccelerationLevel: outcome.aiAccelerationLevel,
    status: outcome.status,
    epicCount: outcome.epics.length
  });
  const blockers =
    search.blockersFromQuery && search.blockersFromQuery.length > 0
      ? search.blockersFromQuery
      : tollgate?.blockers ?? computedBlockers;
  const statusLabel = tollgate?.status === "approved" ? "Approved" : blockers.length > 0 ? "Needs action" : "Ready for review";
  const statusTone = tollgate?.status === "approved" ? "approved" : blockers.length > 0 ? "needs_action" : "ready_for_review";
  const originLabel = getOriginLabel(outcome.originType);
  const workspaceLabel = getWorkspaceLabel(outcome);
  const isArchived = outcome.lifecycleState === "archived";
  const framingHref = `/framing?outcomeId=${outcome.id}`;
  const framingBriefExport = buildFramingBriefExport({
    outcome,
    blockers
  });
  const aiFeedback =
    search.aiField && search.aiVerdict && search.aiReason
      ? {
          field: search.aiField,
          verdict: search.aiVerdict,
          confidence: search.aiConfidence ?? "medium",
          rationale: search.aiReason,
          suggestedRewrite: search.aiSuggestion ?? null
        }
      : null;
  const returnPath = embeddedInFraming ? "/framing" : `/outcomes/${outcome.id}`;
  const draftOutcomeStatement = search.draftOutcomeStatement ?? outcome.outcomeStatement ?? "";
  const draftBaselineDefinition = search.draftBaselineDefinition ?? outcome.baselineDefinition ?? "";
  const derivedRiskProfile = deriveOutcomeRiskProfile({
    businessImpactLevel: outcome.businessImpactLevel ?? null,
    dataSensitivityLevel: outcome.dataSensitivityLevel ?? null,
    blastRadiusLevel: outcome.blastRadiusLevel ?? null,
    decisionImpactLevel: outcome.decisionImpactLevel ?? null
  });
  const seedsByEpicId = new Map<string, typeof outcome.directionSeeds>();

  for (const seed of outcome.directionSeeds) {
    const existing = seedsByEpicId.get(seed.epicId) ?? [];
    existing.push(seed);
    seedsByEpicId.set(seed.epicId, existing);
  }

  const legacyStoryIdeas = outcome.stories.filter((story) => {
    if (story.sourceDirectionSeedId) {
      return false;
    }

    const epicSeeds = seedsByEpicId.get(story.epicId) ?? [];
    const mappedSourceStoryIds = new Set(epicSeeds.map((seed) => seed.sourceStoryId).filter(Boolean));
    const hasExplicitStoryIdeas = epicSeeds.length > 0;

    return !hasExplicitStoryIdeas
      ? story.status === "draft" || story.status === "definition_blocked" || !isLikelyDeliveryStory(story, mappedSourceStoryIds)
      : !isLikelyDeliveryStory(story, mappedSourceStoryIds);
  });
  const visibleStoryIdeaCount = outcome.directionSeeds.length + legacyStoryIdeas.length;
  const startedStoryIdeaCount =
    outcome.directionSeeds.filter((seed) =>
      isStoryIdeaStarted({
        shortDescription: seed.shortDescription,
        expectedBehavior: seed.expectedBehavior
      })
    ).length +
    legacyStoryIdeas.filter((story) =>
      isStoryIdeaStarted({
        valueIntent: story.valueIntent,
        expectedBehavior: story.expectedBehavior
      })
    ).length;
  const readyStoryIdeaCount =
    outcome.directionSeeds.filter((seed) =>
      isStoryIdeaReadyForFraming({
        shortDescription: seed.shortDescription,
        expectedBehavior: seed.expectedBehavior
      })
    ).length +
    legacyStoryIdeas.filter((story) =>
      isStoryIdeaReadyForFraming({
        valueIntent: story.valueIntent,
        expectedBehavior: story.expectedBehavior
      })
    ).length;
  const canCreateStoryIdea = outcome.epics.length > 0 && !isArchived;
  const framingCompleteItems = [
    outcome.outcomeStatement?.trim() ? "Outcome statement is captured" : null,
    outcome.baselineDefinition?.trim() ? "Baseline is defined" : null,
    outcome.valueOwnerId ? "Value owner is assigned" : null,
    derivedRiskProfile && blockers.every((blocker) => !blocker.toLowerCase().includes("risk") && !blocker.toLowerCase().includes("ai "))
      ? "AI and risk decision is structured"
      : null,
    outcome.epics.length > 0 ? `${outcome.epics.length} Epic${outcome.epics.length === 1 ? "" : "s"} created` : null,
    tollgate?.status === "approved" ? "Tollgate 1 approval is complete" : null
  ].filter((value): value is string => Boolean(value));
  const framingNextActionLabel =
    tollgate?.status === "approved"
      ? "Continue with Story Ideas"
      : blockers.length > 0
        ? "Clear blockers and collect approvals"
        : "Collect Tollgate 1 approvals";
  const framingNextActionDetail =
    tollgate?.status === "approved"
      ? "Use the approved Framing as the decision baseline for Story Ideas, design and delivery work."
      : blockers.length > 0
        ? "Approvals are still possible now, but the open blockers should be cleared before you rely on the Framing as a stable baseline."
        : "Framing is complete enough to collect the required Tollgate 1 approvals for the current AI level.";

  return (
    <section className="space-y-6">
      {search.created ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Clean native case created and ready for framing work.
        </div>
      ) : null}
      {search.saveState === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Outcome changes were saved successfully.
        </div>
      ) : null}
      {search.saveState === "error" && search.saveMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {search.saveMessage}
        </div>
      ) : null}
      {search.submitState === "blocked" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Framing still has open recommendations. Approvals are allowed, but a fresh approval is recommended after the blockers are cleared.
        </div>
      ) : null}
      {search.submitState === "ready" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          A Framing approval was recorded. Remaining approver roles are still shown below.
        </div>
      ) : null}
      {search.submitState === "approved" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Required sign-offs are complete. Tollgate 1 is now approved.
        </div>
      ) : null}
      {search.lifecycleState === "archived" ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Outcome archived. It is now removed from active working views but still traceable here.
        </div>
      ) : null}
      {search.lifecycleState === "restored" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Outcome restored to active work.
        </div>
      ) : null}
      {search.lifecycleState === "error" && search.saveMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {search.saveMessage}
        </div>
      ) : null}
      {isArchived ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          This Outcome is archived and currently read-only. Restore it to continue active framing work.
        </div>
      ) : null}

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                {outcome.key}
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                Origin: {originLabel}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Project mode: {workspaceLabel}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : statusTone === "ready_for_review" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                Status: {statusLabel}
              </span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">{outcome.title}</CardTitle>
              <CardDescription className="max-w-4xl text-sm leading-7 sm:text-base">
                {getOriginSummary(outcome.originType)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <WorkspaceStatusSummary
            blockerEmptyText="No framing blockers are visible right now."
            blockers={blockers}
            completeItems={framingCompleteItems}
            nextActionDetail={framingNextActionDetail}
            nextActionLabel={framingNextActionLabel}
            statusLabel={statusLabel}
            statusTone={statusTone}
          />
        </CardContent>
      </Card>

      {!embeddedInFraming ? (
        <>
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Case provenance</CardTitle>
              <CardDescription>
                Use this lightweight summary to distinguish Demo reference work from native customer work.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                  Origin: {originLabel}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Project mode: {workspaceLabel}
                </span>
                <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Status: {statusLabel}
                </span>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Lifecycle: {outcome.lifecycleState.replaceAll("_", " ")}
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{getOriginSummary(outcome.originType)}</p>
            </CardContent>
          </Card>

        <FramingContextCard
            epic={null}
            outcome={{ id: outcome.id, key: outcome.key, title: outcome.title, href: framingHref }}
          summary="Opening this Framing establishes the active business context. Only Epics and Story Ideas attached to this case are shown by default."
        />
        </>
      ) : null}

      <div className="flex justify-start">
        <OutcomeAiReviewDialog
          action={reviewFramingAction}
          currentAiLevel={outcome.aiAccelerationLevel}
          initialState={initialReviewFramingState}
          outcomeId={outcome.id}
        />
      </div>

      <form action={saveAction} className="space-y-6">
            <input name="outcomeId" type="hidden" value={outcome.id} />
            <input name="returnPath" type="hidden" value={returnPath} />
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Business case</CardTitle>
                <CardDescription>
                  Capture the case at framing level: business problem, intended outcome, owner and solution context. Keep baseline and AI/risk as separate decisions below.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 xl:grid-cols-2">
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">Title</span>
                  <input
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.title}
                    disabled={isArchived}
                    name="title"
                    type="text"
                  />
                  <InlineFieldGuidance guidance="Use a short business-facing case name that the customer and delivery team can both recognize." />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Timeframe</span>
                  <input
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.timeframe ?? ""}
                    disabled={isArchived}
                    name="timeframe"
                    type="text"
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.timeframe")} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Value owner</span>
                  <Suspense
                    fallback={
                      <ValueOwnerFieldFallback
                        currentOwnerLabel={outcome.valueOwner?.fullName ?? outcome.valueOwner?.email ?? null}
                        currentOwnerId={outcome.valueOwnerId ?? null}
                        disabled={isArchived}
                      />
                    }
                  >
                    <DeferredValueOwnerField
                      currentOwnerId={outcome.valueOwnerId ?? null}
                      currentOwnerLabel={outcome.valueOwner?.fullName ?? outcome.valueOwner?.email ?? null}
                      disabled={isArchived}
                      organizationId={outcome.organizationId}
                    />
                  </Suspense>
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.value_owner")} />
                </label>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">Problem statement</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.problemStatement ?? ""}
                    disabled={isArchived}
                    name="problemStatement"
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.problem")} />
                </label>
                <div className="xl:col-span-2">
                  <OutcomeAiValidatedTextarea
                    disabled={isArchived}
                    field="outcome_statement"
                    guidance={<InlineFieldGuidance guidance={getInlineGuidance("framing.outcome")} />}
                    initialError={search.aiField === "outcome_statement" ? search.aiError ?? null : null}
                    initialFeedback={search.aiField === "outcome_statement" ? aiFeedback : null}
                    initialValue={draftOutcomeStatement}
                    label="Outcome statement"
                    name="outcomeStatement"
                    saveAction={saveInlineAction}
                    validateAction={validateOutcomeStatementAiAction}
                  />
                </div>
                <div className="xl:col-span-2 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Solution Context &amp; Constraints</p>
                    <p className="text-sm text-muted-foreground">
                      Keep this at framing level. Capture context, risk and constraints without defining architecture,
                      technologies, APIs or implementation details.
                    </p>
                  </div>
                </div>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">Solution context</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.solutionContext ?? ""}
                    disabled={isArchived}
                    name="solutionContext"
                    placeholder="Describe the system context, usage context and high-level integration expectations."
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.solution_context")} />
                </label>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">Constraints</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.solutionConstraints ?? ""}
                    disabled={isArchived}
                    name="solutionConstraints"
                    placeholder="List the conditions the solution must satisfy."
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.solution_constraints")} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Data sensitivity</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.dataSensitivity ?? ""}
                    disabled={isArchived}
                    name="dataSensitivity"
                    placeholder="List the data types involved and their sensitivity level."
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.data_sensitivity")} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Delivery type</span>
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.deliveryType ?? ""}
                    disabled={isArchived}
                    name="deliveryType"
                  >
                    <option value="">Select delivery type</option>
                    <option value="AD">AD</option>
                    <option value="AT">AT</option>
                    <option value="AM">AM</option>
                  </select>
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.delivery_type")} />
                </label>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Baseline</CardTitle>
                <CardDescription>These fields help ground the Framing before approval is recorded.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 xl:grid-cols-2">
                <OutcomeAiValidatedTextarea
                  disabled={isArchived}
                  field="baseline_definition"
                  guidance={<InlineFieldGuidance guidance={getInlineGuidance("framing.baseline_definition")} />}
                  initialError={search.aiField === "baseline_definition" ? search.aiError ?? null : null}
                  initialFeedback={search.aiField === "baseline_definition" ? aiFeedback : null}
                  initialValue={draftBaselineDefinition}
                  label="Baseline definition"
                  name="baselineDefinition"
                  saveAction={saveInlineAction}
                  validateAction={validateBaselineDefinitionAiAction}
                />
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Baseline source</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.baselineSource ?? ""}
                    disabled={isArchived}
                    name="baselineSource"
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.baseline_source")} />
                </label>
              </CardContent>
            </Card>

            <CollapsibleFramingPanel
              defaultOpen
              description="Define AI usage intent, classify risk and record the framing-level AI decision before Tollgate 1."
              title="AI and risk"
            >
              <OutcomeAiRiskPostureCard
                defaultAiLevelJustification={outcome.aiLevelJustification ?? null}
                defaultAiLevel={outcome.aiAccelerationLevel}
                defaultAiExecutionPattern={
                  outcome.aiExecutionPattern === "assisted" ||
                  outcome.aiExecutionPattern === "step_by_step" ||
                  outcome.aiExecutionPattern === "orchestrated"
                    ? outcome.aiExecutionPattern
                    : null
                }
                defaultAiUsageIntent={outcome.aiUsageIntent ?? null}
                defaultBlastRadiusLevel={outcome.blastRadiusLevel ?? null}
                defaultBlastRadiusRationale={outcome.blastRadiusRationale ?? null}
                defaultBusinessImpactLevel={outcome.businessImpactLevel ?? null}
                defaultBusinessImpactRationale={outcome.businessImpactRationale ?? null}
                defaultDataSensitivityLevel={outcome.dataSensitivityLevel ?? null}
                defaultDataSensitivityRationale={outcome.dataSensitivityRationale ?? null}
                defaultDecisionImpactLevel={outcome.decisionImpactLevel ?? null}
                defaultDecisionImpactRationale={outcome.decisionImpactRationale ?? null}
                defaultRiskProfile={outcome.riskProfile}
                disabled={isArchived}
                embedded
              />
            </CollapsibleFramingPanel>

            <CollapsibleFramingPanel
              defaultOpen
              description="Capture scope boundaries through Epics and lightweight Story Ideas. Keep them directional, not operational."
              title="Epics and Story Ideas"
            >
              <div className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Epics and Story Ideas</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Capture scope boundaries through Epics and lightweight Story Ideas. Keep them directional, not operational.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
                    {!isArchived ? (
                      <PendingFormButton
                        className="w-full gap-2 self-start whitespace-nowrap"
                        formAction={createEpicAction}
                        icon={<ArrowRight className="h-4 w-4" />}
                        label="Create Epic"
                        pendingLabel="Creating Epic..."
                      />
                    ) : null}
                  </div>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current Epics</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{outcome.epics.length}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {outcome.epics.length === 0
                          ? "No Epics exist yet for this case."
                          : "Open and inspect them in the Value Spine below."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Story Ideas</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{visibleStoryIdeaCount}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Story ideas stay nested under their Epic and only capture framing intent, not delivery workflow.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Started</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{startedStoryIdeaCount}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Story ideas with at least value intent or expected behavior captured.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Ready for review</p>
                      <p className="mt-2 text-2xl font-semibold text-sky-950">{readyStoryIdeaCount}</p>
                      <p className="mt-2 text-sm leading-6 text-sky-900">
                        Story ideas that already have both value intent and expected behavior.
                      </p>
                    </div>
                  </div>
                  {outcome.epics.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
                      <p className="font-medium text-foreground">No Epics exist for this case yet.</p>
                      <p className="mt-2 leading-6">
                        {isArchived
                          ? "Restore the Outcome if you want to continue breaking it down."
                          : "Create the first native Epic here. No Demo Epics will be attached as fallback."}
                      </p>
                    </div>
                  ) : null}
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/45 p-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">Quick create Story Idea</p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Create a new Story Idea directly from Framing and assign its Epic now, without opening the Epic first.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-end">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Story idea title</span>
                            <input
                              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                              defaultValue="New story idea"
                              disabled={!canCreateStoryIdea}
                              name="quickStoryIdeaTitle"
                              type="text"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Epic</span>
                            <select
                              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                              disabled={!canCreateStoryIdea}
                              name="quickStoryIdeaEpicId"
                              defaultValue={outcome.epics[0]?.id ?? ""}
                            >
                              {outcome.epics.map((epic) => (
                                <option key={epic.id} value={epic.id}>
                                  {epic.key} {epic.title}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <PendingFormButton
                          className="gap-2 self-start px-5"
                          disabled={!canCreateStoryIdea}
                          formAction={createStoryIdeaAction}
                          icon={<ArrowRight className="h-4 w-4" />}
                          label="Create Story Idea"
                          pendingLabel="Creating Story Idea..."
                        />
                      </div>
                    </div>
                    {!canCreateStoryIdea ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {isArchived
                          ? "Restore the framing brief before creating new Story Ideas."
                          : "Create at least one Epic first, then you can assign a new Story Idea directly from Framing."}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </CollapsibleFramingPanel>

            <CollapsibleFramingPanel
              defaultOpen
              description="Scan the framing brief, epics and story ideas together in one compact branch."
              title="Framing value spine"
            >
              <FramingValueSpineTree
                description="Read the active branch as one framing brief with epics and story ideas."
                emptyEpicMessage={
                  isArchived
                    ? "Archived Outcomes no longer surface active Epic work in this branch."
                    : "Create the first native Epic here. Empty branches stay empty until you add child work."
                }
                emptyStoryMessage={
                  isArchived
                    ? "Archived Outcomes no longer surface active story ideas."
                    : "Create story ideas from the relevant Epic so the hierarchy stays scoped to this Framing."
                }
                mode="framing"
                epics={outcome.epics.map((epic) => ({
                  id: epic.id,
                  key: epic.key,
                  title: epic.title,
                  href: `/epics/${epic.id}`,
                  isCurrent: false,
                  scopeBoundary: epic.scopeBoundary ?? null,
                  purpose: epic.purpose ?? null,
                  originType: epic.originType,
                  lifecycleState: epic.lifecycleState,
                  importedReadinessState: epic.importedReadinessState ?? null,
                  lineageHref:
                    epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId
                      ? `/review?candidateId=${epic.lineageSourceId}`
                      : null,
                  directionSeeds: outcome.directionSeeds
                    .filter((seed) => seed.epicId === epic.id)
                    .map((seed) => ({
                      id: seed.id,
                      key: seed.key,
                      title: seed.title,
                      href: `/story-ideas/${seed.id}`,
                      isCurrent: false,
                      shortDescription: seed.shortDescription ?? null,
                      expectedBehavior: seed.expectedBehavior ?? null,
                      uxSketchName: seed.uxSketchName ?? null,
                      uxSketchDataUrl: seed.uxSketchDataUrl ?? null,
                      sourceStoryId: seed.sourceStoryId ?? null,
                      originType: seed.originType,
                      lifecycleState: seed.lifecycleState,
                      importedReadinessState: seed.importedReadinessState ?? null,
                      lineageHref:
                        seed.lineageSourceType === "artifact_aas_candidate" && seed.lineageSourceId
                          ? `/review?candidateId=${seed.lineageSourceId}`
                      : null
                    })),
                  stories: outcome.stories
                    .filter((story) => story.epicId === epic.id)
                    .map((story) => ({
                      id: story.id,
                      key: story.key,
                      title: story.title,
                      href: story.sourceDirectionSeedId ? `/stories/${story.id}` : `/story-ideas/${story.id}`,
                      isCurrent: false,
                      sourceDirectionSeedId: story.sourceDirectionSeedId ?? null,
                      valueIntent: story.valueIntent ?? null,
                      expectedBehavior: story.expectedBehavior ?? null,
                      testDefinition: story.testDefinition ?? null,
                      acceptanceCriteria: story.acceptanceCriteria,
                      definitionOfDone: story.definitionOfDone,
                      status: story.status,
                      originType: story.originType,
                      lifecycleState: story.lifecycleState,
                      importedReadinessState: story.importedReadinessState ?? null,
                      lineageHref:
                        story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId
                          ? `/review?candidateId=${story.lineageSourceId}`
                          : null
                    }))
                }))}
                outcome={{
                  id: outcome.id,
                  key: outcome.key,
                  title: outcome.title,
                  href: framingHref,
                  isCurrent: true,
                  statement: outcome.outcomeStatement ?? null,
                  originType: outcome.originType,
                  lifecycleState: outcome.lifecycleState,
                  importedReadinessState: outcome.importedReadinessState ?? null,
                  lineageHref:
                    outcome.lineageSourceType === "artifact_aas_candidate" && outcome.lineageSourceId
                      ? `/review?candidateId=${outcome.lineageSourceId}`
                      : null
                }}
              />
            </CollapsibleFramingPanel>

            {!isArchived ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <PendingFormButton
                  className="gap-2"
                  icon={<ArrowRight className="h-4 w-4" />}
                  label="Save framing changes"
                  pendingLabel="Saving framing..."
                />
                {!embeddedInFraming ? (
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href="/framing">Back to Framing Cockpit</Link>
                  </Button>
                ) : null}
              </div>
            ) : !embeddedInFraming ? (
              <Button asChild className="gap-2" variant="secondary">
                <Link href="/framing">Back to Framing Cockpit</Link>
              </Button>
            ) : null}
      </form>

      <Suspense fallback={<OutcomeTollgateSectionFallback />}>
        <DeferredOutcomeTollgateSection
          defaultBlockers={blockers}
          isArchived={isArchived}
          outcomeId={outcome.id}
          recordTollgateDecisionAction={recordTollgateDecisionAction}
          submitTollgateAction={submitTollgateAction}
        />
      </Suspense>

      {removal?.decision ? (
        <CollapsibleFramingPanel
          defaultOpen={false}
          description="Hard delete stays easy for eligible drafts, while governed work is archived and restored inside the current project context."
          title="Remove or archive in this project"
        >
          <GovernedLifecycleCard
            archiveAction={archiveAction}
            decision={removal.decision}
            entityId={outcome.id}
            entityLabel="Outcome"
            hardDeleteAction={hardDeleteAction}
            hideHeader
            restoreAction={restoreAction}
          />
        </CollapsibleFramingPanel>
      ) : null}

      <CollapsibleFramingPanel
        defaultOpen={false}
        description="Expand when you want to export the customer handshake into another AI tool or workflow."
        title="Export framing brief"
      >
        <FramingBriefExportPanel embedded disabled={isArchived} markdown={framingBriefExport.markdown} payload={framingBriefExport.payload} />
      </CollapsibleFramingPanel>
    </section>
  );
}

async function DeferredOutcomeTollgateSection(props: {
  outcomeId: string;
  isArchived: boolean;
  defaultBlockers: string[];
  submitTollgateAction: (formData: FormData) => void | Promise<void>;
  recordTollgateDecisionAction: (formData: FormData) => void | Promise<void>;
}) {
  void props.submitTollgateAction;
  const session = await requireActiveProjectSession();
  const tollgateResult = await getCachedOutcomeTollgateReviewData(
    session.organization.organizationId,
    props.outcomeId
  );

  if (!tollgateResult.ok) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Tollgate follow-up is unavailable</CardTitle>
          <CardDescription>
            {tollgateResult.errors[0]?.message ?? "The Tollgate workspace could not be loaded right now."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { outcome, blockers, tollgateReview } = tollgateResult.data;
  const visibleBlockers = blockers.length > 0 ? blockers : props.defaultBlockers;
  const hasApprovedDocument = Boolean(tollgateReview.approvalSnapshot);
  const approvedVersion = tollgateReview.approvedVersion ?? null;
  const currentFramingVersion = outcome.framingVersion;
  const currentVersionApproved = approvedVersion === currentFramingVersion && tollgateReview.status === "approved";
  const hasPartialApprovals =
    !currentVersionApproved &&
    tollgateReview.approvalActions.some((action) => action.completedRecords.length > 0);
  const versionRecommendationVisible = Boolean(approvedVersion && approvedVersion !== currentFramingVersion);
  const primaryStatusClasses = currentVersionApproved
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : visibleBlockers.length > 0 || versionRecommendationVisible
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-sky-200 bg-sky-50 text-sky-900";
  const primaryStatusIcon = currentVersionApproved ? (
    <CircleCheckBig className="h-4 w-4" />
  ) : visibleBlockers.length > 0 || versionRecommendationVisible ? (
    <CircleAlert className="h-4 w-4" />
  ) : (
    <Clock3 className="h-4 w-4" />
  );
  const primaryStatusTitle = currentVersionApproved
    ? "Tollgate 1 is approved for the current Framing version."
    : hasPartialApprovals
      ? "Framing approvals are in progress for the current version."
      : "Tollgate 1 approvals can be recorded now.";
  const primaryStatusDetail = currentVersionApproved
    ? "The required approval roles for the current AI level have signed off on this Framing version."
    : versionRecommendationVisible
      ? `Framing changed after version ${approvedVersion}. A fresh approval is recommended for version ${currentFramingVersion}.`
      : visibleBlockers.length > 0
      ? "Approvals are still allowed, but the open blockers below should be cleared before you rely on this Framing as a stable baseline."
        : "The Framing looks complete enough. Record the required approvals for the current AI level below.";
  const riskSummaryRows = [
    {
      label: "AI Level",
      value: outcome.aiAccelerationLevel.replaceAll("_", " ")
    },
    {
      label: "Risk profile",
      value: outcome.riskProfile ? outcome.riskProfile.charAt(0).toUpperCase() + outcome.riskProfile.slice(1) : "Not determined"
    },
    {
      label: "Business impact",
      value: outcome.businessImpactLevel
        ? `${outcome.businessImpactLevel.charAt(0).toUpperCase() + outcome.businessImpactLevel.slice(1)}${outcome.businessImpactRationale ? ` - ${outcome.businessImpactRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Data sensitivity",
      value: outcome.dataSensitivityLevel
        ? `${outcome.dataSensitivityLevel.charAt(0).toUpperCase() + outcome.dataSensitivityLevel.slice(1)}${outcome.dataSensitivityRationale ? ` - ${outcome.dataSensitivityRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Blast radius",
      value: outcome.blastRadiusLevel
        ? `${outcome.blastRadiusLevel.charAt(0).toUpperCase() + outcome.blastRadiusLevel.slice(1)}${outcome.blastRadiusRationale ? ` - ${outcome.blastRadiusRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Decision impact",
      value: outcome.decisionImpactLevel
        ? `${outcome.decisionImpactLevel.charAt(0).toUpperCase() + outcome.decisionImpactLevel.slice(1)}${outcome.decisionImpactRationale ? ` - ${outcome.decisionImpactRationale}` : ""}`
        : "Not classified"
    }
  ];

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Tollgate 1 approval</CardTitle>
          <CardDescription>
            Tollgate 1 applies to the Framing brief as a whole. Review lanes are not used here. Record approvals directly
            from the required roles for the current AI level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`rounded-2xl border px-4 py-4 text-sm ${primaryStatusClasses}`}>
            <div className="flex items-center gap-2 font-medium">
              {primaryStatusIcon}
              {primaryStatusTitle}
            </div>
            <p className="mt-2 leading-6">{primaryStatusDetail}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current framing version</p>
              <p className="mt-2 leading-6 text-foreground">Version {currentFramingVersion}</p>
              {versionRecommendationVisible ? (
                <p className="mt-2 text-muted-foreground">
                  Latest approved version is {approvedVersion}. A new approval is recommended for the current brief.
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Approval progress</p>
              <p className="mt-2 leading-6 text-foreground">
                {tollgateReview.approvalActions.filter((action) => action.completedRecords.length > 0).length} of{" "}
                {tollgateReview.approvalActions.length} roles approved
              </p>
              <p className="mt-2 text-muted-foreground">
                {currentVersionApproved
                  ? "All required approvals for this Framing version are complete."
                  : "Each listed role records approval directly here with a short motivation."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Required approvers for current AI level</p>
              <p className="mt-2 leading-6 text-foreground">
                {tollgateReview.requiredApprovalRoles.map((requirement) => requirement.label).join(" | ")}
              </p>
            </div>
          </div>

          {visibleBlockers.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
              <p className="font-medium">Recommendations before relying on this approval</p>
              <ul className="mt-3 space-y-2">
                {visibleBlockers.map((blocker) => (
                  <li key={blocker}>• {blocker}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl border border-sky-200 bg-sky-50/55 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI and risk summary for approval</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {riskSummaryRows.map((row) => (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={row.label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{row.label}</p>
                  <p className="mt-2 leading-6 text-foreground">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {hasApprovedDocument ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="gap-2" variant="secondary">
                <Link href={`/outcomes/${props.outcomeId}/approval-document`}>
                  {approvedVersion === currentFramingVersion ? "Open approved framing document" : "Open last approved framing document"}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Open the saved approval record and print it as a PDF with the full Framing, approvals and dates.
              </p>
            </div>
          ) : null}

          {!props.isArchived ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-4 text-sm text-sky-950">
              Human Review only mirrors this as a queue entry. Record Framing approvals directly here.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4" id="tollgate-review">
        {tollgateReview.approvalActions.map((action) => {
          const completedRecord = action.completedRecords[0] ?? null;
          const hasAssignedPeople = action.assignedPeople.length > 0;

          return (
            <Card className="border-border/70 shadow-sm" key={`${action.decisionKind}:${action.roleType}:${action.organizationSide}`}>
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-lg">{action.label}</CardTitle>
                    <CardDescription>
                      Required {formatRoleLabel(action.roleType)} on the {action.organizationSide} side for{" "}
                      {outcome.aiAccelerationLevel.replaceAll("_", " ")}.
                    </CardDescription>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      completedRecord
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {completedRecord ? "Approved" : "Pending approval"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
                  <p className="font-medium text-foreground">Assigned role holders</p>
                  <p className="mt-2 text-muted-foreground">
                    {hasAssignedPeople
                      ? action.assignedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                      : "No active person is assigned for this approval role yet."}
                  </p>
                </div>

                {completedRecord ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
                    <div className="flex items-center gap-2 font-medium">
                      <CircleCheckBig className="h-4 w-4" />
                      Approved by {completedRecord.actualPersonName}
                    </div>
                    <p className="mt-2 leading-6">
                      {new Date(completedRecord.createdAt).toLocaleString("sv-SE")}
                    </p>
                    {completedRecord.note ? <p className="mt-2 leading-6">Motivation: {completedRecord.note}</p> : null}
                  </div>
                ) : props.isArchived ? (
                  <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm text-muted-foreground">
                    Restore the Framing brief to continue approvals.
                  </div>
                ) : hasAssignedPeople ? (
                  <form action={props.recordTollgateDecisionAction} className="space-y-4 rounded-2xl border border-border/70 bg-background p-4">
                    <input name="outcomeId" type="hidden" value={props.outcomeId} />
                    <input name="entityId" type="hidden" value={props.outcomeId} />
                    <input name="aiAccelerationLevel" type="hidden" value={outcome.aiAccelerationLevel} />
                    <input
                      name="decisionKey"
                      type="hidden"
                      value={`approval|${action.roleType}|${action.organizationSide}`}
                    />
                    <input name="decisionStatus" type="hidden" value="approved" />
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Approver</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={action.assignedPeople[0]?.partyRoleEntryId ?? ""}
                          name="actualPartyRoleEntryId"
                        >
                          {action.assignedPeople.map((person) => (
                            <option key={person.partyRoleEntryId} value={person.partyRoleEntryId}>
                              {person.fullName} - {person.roleTitle}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-sm">
                        <input className="mt-1 h-4 w-4" name="confirmApproval" required type="checkbox" value="yes" />
                        <span className="leading-6 text-foreground">
                          I confirm that this Framing version can be approved from the perspective of this role.
                        </span>
                      </label>
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Motivation</span>
                      <textarea
                        className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                        name="note"
                        required
                      />
                    </label>
                    <PendingFormButton
                      className="gap-2 whitespace-nowrap"
                      icon={<ShieldCheck className="h-4 w-4" />}
                      label={`Approve as ${action.label}`}
                      pendingLabel="Recording approval..."
                    />
                  </form>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                    Assign an active {formatRoleLabel(action.roleType)} on the {action.organizationSide} side before this
                    approval can be recorded.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function OutcomeTollgateSectionFallback() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Loading tollgate follow-up</CardTitle>
        <CardDescription>Approval roles and current Framing sign-offs are loading separately.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
      </CardContent>
    </Card>
  );
}

async function DeferredValueOwnerField(props: {
  organizationId: string;
  currentOwnerId: string | null;
  currentOwnerLabel: string | null;
  disabled: boolean;
}) {
  const ownersResult = await getCachedOrganizationUsersData(props.organizationId);

  if (!ownersResult.ok) {
    return (
      <ValueOwnerFieldFallback
        currentOwnerId={props.currentOwnerId}
        currentOwnerLabel={props.currentOwnerLabel}
        disabled={props.disabled}
      />
    );
  }

  return (
    <select
      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
      defaultValue={props.currentOwnerId ?? ""}
      disabled={props.disabled}
      name="valueOwnerId"
    >
      <option value="">Unassigned</option>
      {ownersResult.data.map((owner) => (
        <option key={owner.userId} value={owner.userId}>
          {owner.fullName ?? owner.email}
        </option>
      ))}
    </select>
  );
}

function ValueOwnerFieldFallback(props: {
  currentOwnerId: string | null;
  currentOwnerLabel: string | null;
  disabled: boolean;
}) {
  return (
    <select
      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
      defaultValue={props.currentOwnerId ?? ""}
      disabled
      name="valueOwnerId"
    >
      <option value="">{props.currentOwnerLabel ? `Loading owners... Current: ${props.currentOwnerLabel}` : "Loading owners..."}</option>
    </select>
  );
}
