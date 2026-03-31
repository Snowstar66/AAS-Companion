import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { type getOutcomeWorkspaceService } from "@aas-companion/api";
import { getOutcomeFramingBlockers } from "@aas-companion/domain";
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
import { TollgateDecisionCard } from "@/components/workspace/tollgate-decision-card";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOutcomeTollgateReviewData } from "@/lib/cache/project-data";
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
  const { outcome, tollgate, removal, availableOwners } = data;
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
      : tollgate?.blockers ?? computedBlockers;
  const framingComplete = computedBlockers.length === 0;
  const statusLabel = outcome.status.replaceAll("_", " ");
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
        <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI level</p>
            <p className="mt-2 text-base font-semibold capitalize">{outcome.aiAccelerationLevel.replaceAll("_", " ")}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk profile</p>
            <p className="mt-2 text-base font-semibold capitalize">{outcome.riskProfile}</p>
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
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Story Ideas</CardTitle>
                      <CardDescription>
                        Capture epics and lightweight story ideas here. Keep them directional, not operational.
                      </CardDescription>
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
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Ready for framing</p>
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
        <FramingBriefExportPanel disabled={isArchived} markdown={framingBriefExport.markdown} payload={framingBriefExport.payload} />
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

  const { outcome, tollgate, blockers, framingComplete, tollgateReview } = tollgateResult.data;
  const tollgateReviewLabels = tollgateReview.requiredReviewRoles.map((requirement) => requirement.label);
  const tollgateApprovalLabels = tollgateReview.requiredApprovalRoles.map((requirement) => requirement.label);
  const visibleBlockers = blockers.length > 0 ? blockers : props.defaultBlockers;

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{tollgateReview.status === "ready" || tollgateReview.status === "approved" ? "Tollgate follow-up" : "Submit to Tollgate"}</CardTitle>
          <CardDescription>
            Tollgate 1 is the framing decision gate. It applies to the framing brief, not to individual Story Ideas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`rounded-2xl border px-4 py-4 text-sm ${
              tollgateReview.status === "approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : tollgateReview.status === "ready"
                  ? "border-sky-200 bg-sky-50 text-sky-900"
                  : framingComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-medium">
              {tollgateReview.status === "approved"
                ? "Tollgate 1 is already approved."
                : tollgateReview.status === "ready"
                  ? "This framing brief is already submitted and waiting for human decision."
                  : framingComplete
                    ? "This framing brief is ready to submit."
                    : "This framing brief is not ready to submit yet."}
            </p>
            <p className="mt-2 leading-6">
              {tollgateReview.status === "approved"
                ? "Continue from Human Review only if you need to inspect the recorded sign-offs."
                : tollgateReview.status === "ready"
                  ? "Open Human Review to record the remaining TG1 decision and approvals."
                  : visibleBlockers[0] ?? "Complete the framing brief and then submit it once to start TG1 review."}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Required review roles</p>
              <p className="mt-2 leading-6 text-foreground">{tollgateReviewLabels.join(" | ")}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Required approval roles</p>
              <p className="mt-2 leading-6 text-foreground">{tollgateApprovalLabels.join(" | ")}</p>
            </div>
          </div>

          {tollgateReview.status === "ready" || tollgateReview.status === "approved" ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2" variant="secondary">
                <Link href="/review">Open Human Review</Link>
              </Button>
              <p className="self-center text-sm text-muted-foreground">
                Human Review is where the actual TG1 sign-off is recorded.
              </p>
            </div>
          ) : !props.isArchived ? (
            <form action={props.submitTollgateAction} className="space-y-4">
              <input name="outcomeId" type="hidden" value={props.outcomeId} />
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
          ) : null}
        </CardContent>
      </Card>

      {tollgate?.id || tollgateReview.signoffRecords.length ? (
        <div id="tollgate-review">
          <TollgateDecisionCard
            aiAccelerationLevel={outcome.aiAccelerationLevel}
            approvalActions={tollgateReview.approvalActions}
            availablePeople={tollgateReview.availablePeople}
            blockers={visibleBlockers}
            blockedActions={tollgateReview.blockedActions}
            comments={tollgateReview.comments ?? tollgate?.comments ?? null}
            description="Record the required human review and approval decisions for Tollgate 1 here."
            entityId={props.outcomeId}
            entityType="outcome"
            formAction={props.recordTollgateDecisionAction}
            hiddenFields={[
              { name: "outcomeId", value: props.outcomeId }
            ]}
            pendingActions={tollgateReview.pendingActions}
            reviewActions={tollgateReview.reviewActions}
            signoffRecords={tollgateReview.signoffRecords.map((record) => ({
              id: record.id,
              decisionKind: record.decisionKind,
              requiredRoleType: record.requiredRoleType,
              actualPersonName: record.actualPersonName,
              actualRoleTitle: record.actualRoleTitle,
              organizationSide: record.organizationSide,
              decisionStatus: record.decisionStatus,
              note: record.note,
              evidenceReference: record.evidenceReference,
              createdAt: record.createdAt
            }))}
            status={tollgateReview.status ?? (framingComplete ? "ready" : "blocked")}
            title="Tollgate 1 decision workspace"
            tollgateType="tg1_baseline"
          />
        </div>
      ) : null}
    </>
  );
}

function OutcomeTollgateSectionFallback() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Loading tollgate follow-up</CardTitle>
        <CardDescription>Review roles, submission state and decision lanes are loading separately.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
      </CardContent>
    </Card>
  );
}
