import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { type getOutcomeWorkspaceService } from "@aas-companion/api";
import { getOutcomeFramingBlockers } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type {
  OutcomeInlineSaveActionState,
  OutcomeFieldAiActionState,
  reviewOutcomeFramingWithAiAction
} from "@/app/(protected)/outcomes/[outcomeId]/actions";
import { FramingBriefExportPanel } from "@/components/framing/framing-brief-export-panel";
import { HomeActivityCard } from "@/components/home/home-activity-card";
import { InlineFieldGuidance } from "@/components/shared/context-help";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { OutcomeAiReviewDialog } from "@/components/workspace/outcome-ai-review-dialog";
import { OutcomeAiValidatedTextarea } from "@/components/workspace/outcome-ai-validated-textarea";
import { FramingContextCard } from "@/components/workspace/framing-context-card";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { OutcomeAiRiskPostureCard } from "@/components/workspace/outcome-ai-risk-posture-card";
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
  archiveAction: (formData: FormData) => void | Promise<void>;
  hardDeleteAction: (formData: FormData) => void | Promise<void>;
  restoreAction: (formData: FormData) => void | Promise<void>;
  submitTollgateAction: (formData: FormData) => void | Promise<void>;
  validateOutcomeStatementAiAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  validateBaselineDefinitionAiAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  reviewFramingAction: typeof reviewOutcomeFramingWithAiAction;
  initialReviewFramingState: {
    status: "idle" | "success" | "error";
    message: string | null;
    report: {
      overallVerdict: "good" | "needs_attention" | "blocked";
      executiveSummary: string;
      missingItems: string[];
      suggestedChanges: string[];
      nextAiLevel: {
        canAdvance: boolean;
        targetLevel: "level_2" | "level_3" | null;
        rationale: string;
        requirements: string[];
      };
    } | null;
  };
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
  archiveAction,
  hardDeleteAction,
  restoreAction,
  submitTollgateAction,
  validateOutcomeStatementAiAction,
  validateBaselineDefinitionAiAction,
  reviewFramingAction,
  initialReviewFramingState
}: FramingOutcomeSectionProps) {
  const { outcome, tollgate, activities, removal, availableOwners, tollgateReview } = data;
  const computedBlockers = getOutcomeFramingBlockers({
    title: outcome.title,
    outcomeStatement: outcome.outcomeStatement ?? null,
    baselineDefinition: outcome.baselineDefinition ?? null,
    valueOwnerId: outcome.valueOwnerId ?? null,
    riskProfile: outcome.riskProfile,
    aiAccelerationLevel: outcome.aiAccelerationLevel,
    status: outcome.status,
    epicCount: outcome.epics.length
  });
  const blockers =
    search.blockersFromQuery && search.blockersFromQuery.length > 0
      ? search.blockersFromQuery
      : tollgateReview?.blockers ?? tollgate?.blockers ?? computedBlockers;
  const framingComplete = computedBlockers.length === 0;
  const statusLabel = outcome.status.replaceAll("_", " ");
  const originLabel = getOriginLabel(outcome.originType);
  const workspaceLabel = getWorkspaceLabel(outcome);
  const tollgateStatusLabel = tollgateReview?.status
    ? tollgateReview.status.replaceAll("_", " ")
    : tollgate?.status
      ? tollgate.status.replaceAll("_", " ")
      : "not started";
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

    return !hasExplicitStoryIdeas || !isLikelyDeliveryStory(story, mappedSourceStoryIds);
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
          Tollgate submission is still blocked. Complete the missing framing fields listed below.
        </div>
      ) : null}
      {search.submitState === "ready" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Framing was submitted to Tollgate. Human review can now continue from the review workspace.
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
              <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
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
        <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 2xl:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Value owner</p>
            <p className="mt-2 text-base font-semibold">
              {outcome.valueOwner?.fullName ?? outcome.valueOwner?.email ?? "Unassigned"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI level</p>
            <p className="mt-2 text-base font-semibold capitalize">{outcome.aiAccelerationLevel.replaceAll("_", " ")}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk profile</p>
            <p className="mt-2 text-base font-semibold capitalize">{outcome.riskProfile}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tollgate</p>
            <p className="mt-2 text-base font-semibold capitalize">{tollgateStatusLabel}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Baseline readiness</p>
            <p className="mt-2 text-base font-semibold">
              {framingComplete ? "Framing complete for submit" : "Framing still incomplete"}
            </p>
          </div>
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
                <CardTitle>Customer handshake</CardTitle>
                <CardDescription>
                  Keep this form focused on business effect, baseline, ownership, intended AI level and early direction.
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
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.valueOwnerId ?? ""}
                    disabled={isArchived}
                    name="valueOwnerId"
                  >
                    <option value="">Unassigned</option>
                    {availableOwners.map((owner) => (
                      <option key={owner.userId} value={owner.userId}>
                        {owner.fullName ?? owner.email}
                      </option>
                    ))}
                  </select>
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
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Baseline</CardTitle>
                <CardDescription>These fields must be present before Tollgate 1 can move to review.</CardDescription>
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

            <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)]">
              <OutcomeAiRiskPostureCard
                defaultAiLevel={outcome.aiAccelerationLevel}
                defaultRiskProfile={outcome.riskProfile}
                disabled={isArchived}
              />
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Story Ideas</CardTitle>
                      <CardDescription>
                        Capture epics and lightweight story ideas here. Keep them directional, not operational.
                      </CardDescription>
                    </div>
                    {!isArchived ? (
                      <PendingFormButton
                        className="w-full gap-2 self-start whitespace-nowrap sm:w-auto sm:shrink-0"
                        formAction={createEpicAction}
                        icon={<ArrowRight className="h-4 w-4" />}
                        label="Create Epic"
                        pendingLabel="Creating Epic..."
                      />
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
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
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Ready for framing</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-950">{readyStoryIdeaCount}</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-900">
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
                </CardContent>
              </Card>
            </div>

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
                      href: `/epics/${epic.id}#seed-${seed.id}`,
                      isCurrent: false,
                      shortDescription: seed.shortDescription ?? null,
                      expectedBehavior: seed.expectedBehavior ?? null,
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

      <div className="grid items-start gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Framing blockers</CardTitle>
              <CardDescription>These are the missing framing fields that still prevent Tollgate submission.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blockers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900">
                  No framing blockers are currently visible.
                </div>
              ) : (
                blockers.map((blocker) => (
                  <div
                    className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm leading-6 text-amber-900"
                    key={blocker}
                  >
                    {blocker}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </div>
          <div className="xl:col-span-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Governance coverage</CardTitle>
              <CardDescription>Check named roles and authority only when you need deeper governance context.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2" variant="secondary">
                <Link
                  href={`/governance?view=readiness&sourceEntity=outcome&sourceId=${outcome.id}&level=${outcome.aiAccelerationLevel}`}
                >
                  Open Governance readiness
                </Link>
              </Button>
            </CardContent>
          </Card>
          </div>
          <div className="xl:col-span-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>After submit</CardTitle>
              <CardDescription>Framing uses one submit step here. Human sign-off continues in the review workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                When the framing brief is complete, submit it once. The detailed human decisions are then handled from Human Review, not inside this authoring form.
              </p>
              <Button asChild className="gap-2" variant="secondary">
                <Link href="/review">Open Human Review</Link>
              </Button>
            </CardContent>
          </Card>
          </div>
          <div className={outcome.lineageSourceType === "artifact_aas_candidate" && outcome.lineageSourceId ? "xl:col-span-4" : "xl:col-span-8"}>
          <HomeActivityCard
            defaultOpen={false}
            description="Recent outcome-specific audit entries."
            emptyMessage="No activity has been recorded yet for this outcome."
            items={activities.map((activity) => ({
              id: activity.id,
              title: activity.eventType.replaceAll("_", " "),
              timestamp: new Date(activity.createdAt).toLocaleString("en-US")
            }))}
          />
          </div>
          {outcome.lineageSourceType === "artifact_aas_candidate" && outcome.lineageSourceId ? (
            <div className="xl:col-span-4">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Imported lineage</CardTitle>
                <CardDescription>Trace this governed Outcome back to its reviewed import candidate.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href={`/review?candidateId=${outcome.lineageSourceId}`}>Open source candidate review</Link>
                </Button>
              </CardContent>
            </Card>
            </div>
          ) : null}
      </div>

      <CollapsibleFramingPanel
        defaultOpen
        description="This panel only shows framing submit status. Detailed sign-off handling happens in Human Review."
        title="Framing tollgate"
      >
        <div className="space-y-4">
          <div
            className={`rounded-2xl border px-4 py-4 text-sm ${
              tollgateReview?.status === "approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : tollgateReview?.status === "ready"
                  ? "border-sky-200 bg-sky-50 text-sky-900"
                  : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-medium">
              {tollgateReview?.status === "approved"
                ? "Tollgate approved"
                : tollgateReview?.status === "ready"
                  ? "Submitted and waiting for human review"
                  : "Not ready for submit yet"}
            </p>
            <p className="mt-2 leading-6">
              {tollgateReview?.status === "approved"
                ? "The framing brief is approved and traceable for the next phase."
                : tollgateReview?.status === "ready"
                  ? "The framing brief has been submitted. Record the human decision from Human Review when people are ready."
                  : blockers[0] ?? "Complete the missing framing fields before submitting."}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Open blockers</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{blockers.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pending sign-off lanes</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{tollgateReview?.pendingActions.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recorded sign-offs</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{tollgateReview?.signoffRecords.length ?? 0}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="gap-2" variant="secondary">
              <Link href="/review">Open Human Review</Link>
            </Button>
            {tollgateReview?.status === "ready" || tollgateReview?.status === "approved" ? (
              <p className="self-center text-sm text-muted-foreground">
                Continue human sign-off from the review workspace when needed.
              </p>
            ) : null}
          </div>
        </div>
      </CollapsibleFramingPanel>

      {!isArchived ? (
        <CollapsibleFramingPanel
          defaultOpen={false}
          description="Submit only when the framing brief is complete enough for Tollgate review."
          title="Submit to Tollgate"
        >
          <form action={submitTollgateAction} className="space-y-4">
            <input name="outcomeId" type="hidden" value={outcome.id} />
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Submission note</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                defaultValue={tollgate?.comments ?? ""}
                name="comments"
              />
            </label>
            <PendingFormButton
              className="gap-2"
              disabled={!framingComplete}
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Submit to Tollgate"
              pendingLabel="Submitting to Tollgate..."
            />
            {!framingComplete ? (
              <p className="text-sm text-muted-foreground">
                Submit unlocks as soon as the outcome statement, baseline, value owner, AI level, risk profile and at least one epic are in place.
              </p>
            ) : null}
          </form>
        </CollapsibleFramingPanel>
      ) : null}

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
        <FramingBriefExportPanel disabled={isArchived} markdown={framingBriefExport.markdown} payload={framingBriefExport.payload} />
      </CollapsibleFramingPanel>
    </section>
  );
}
