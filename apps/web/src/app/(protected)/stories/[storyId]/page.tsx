import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, FileJson2, ShieldCheck } from "lucide-react";
import { getStoryReadinessBlockers } from "@aas-companion/domain";
import { getStoryWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { InlineTermHelp } from "@/components/shared/inline-term-help";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { TollgateDecisionCard } from "@/components/workspace/tollgate-decision-card";
import { requireOrganizationContext } from "@/lib/auth/guards";
import { getStoryToneClasses, getStoryUxModel } from "@/lib/workspace/story-ux";
import {
  archiveStoryAction,
  hardDeleteStoryAction,
  recordStoryTollgateDecisionAction,
  restoreStoryAction,
  saveStoryWorkspaceAction,
  submitStoryReadinessAction
} from "./actions";

type StoryWorkspacePageProps = {
  params: Promise<{
    storyId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const STORY_IDEA_GUIDANCE =
  "Describe this Story Idea so it is clear enough to guide design and AI refinement, but not detailed enough to become a delivery specification.";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatAiLevel(value: string) {
  return value.replace("level_", "Level ").replaceAll("_", " ");
}

function getReadinessFieldStatus(story: {
  acceptanceCriteria: string[];
  testDefinition: string | null;
  definitionOfDone: string[];
  aiAccelerationLevel: string;
}) {
  return [
    {
      key: "acceptance-criteria",
      label: "Acceptance criteria",
      href: "#story-acceptance-criteria",
      complete: story.acceptanceCriteria.length > 0,
      help: "Add at least one checkable outcome for the Story."
    },
    {
      key: "test-definition",
      label: "Test Definition",
      href: "#story-test-definition",
      complete: Boolean(story.testDefinition?.trim()),
      help: "Describe how the Story will be verified before approval."
    },
    {
      key: "definition-of-done",
      label: "Definition of Done",
      href: "#story-definition-of-done",
      complete: story.definitionOfDone.length > 0,
      help: "List the minimum conditions for considering the Story done."
    },
    {
      key: "ai-level",
      label: "AI level",
      href: "#story-ai-level",
      complete: true,
      help: `Inherited from the current Framing: ${formatAiLevel(story.aiAccelerationLevel)}.`
    }
  ] as const;
}

function SecondaryPanel(props: {
  id?: string | undefined;
  title: string;
  description: string;
  defaultOpen?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-background shadow-sm" id={props.id} open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
        <div>
          <p className="font-semibold text-foreground">{props.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-6 py-5">{props.children}</div>
    </details>
  );
}

export default async function StoryWorkspacePage({ params, searchParams }: StoryWorkspacePageProps) {
  const organization = await requireOrganizationContext();
  const { storyId } = await params;
  const query = searchParams ? await searchParams : {};
  const created = getParamValue(query.created) === "1";
  const saveState = getParamValue(query.save);
  const readyState = getParamValue(query.ready);
  const lifecycleState = getParamValue(query.lifecycle);
  const saveMessage = getParamValue(query.message);
  const blockersFromQuery = getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [];
  const storyResult = await getStoryWorkspaceService(organization.organizationId, storyId);

  if (!storyResult.ok) {
    notFound();
  }

  const { story, tollgate, activities, removal } = storyResult.data;
  const tollgateReview = storyResult.data.tollgateReview;
  const computedBlockers = getStoryReadinessBlockers(story);
  const importedBuildBlockers = storyResult.data.importedBuildBlockers ?? [];
  const blockers =
    blockersFromQuery.length > 0
      ? blockersFromQuery
      : tollgateReview?.blockers ?? [...new Set([...(tollgate?.blockers ?? computedBlockers), ...importedBuildBlockers])];
  const isArchived = story.lifecycleState === "archived";
  const storyUx = getStoryUxModel({
    id: story.id,
    key: story.key,
    status: story.status,
    lifecycleState: story.lifecycleState,
    testDefinition: story.testDefinition ?? null,
    acceptanceCriteria: story.acceptanceCriteria,
    definitionOfDone: story.definitionOfDone,
    tollgateStatus: tollgateReview?.status ?? tollgate?.status ?? null,
    blockers,
    pendingActionCount: tollgateReview?.pendingActions.length ?? 0,
    blockedActionCount: tollgateReview?.blockedActions.length ?? 0
  });
  const readinessFields = getReadinessFieldStatus(story);
  const missingReadinessFields = readinessFields.filter((field) => !field.complete);
  const tollgateStatus = tollgateReview?.status ?? tollgate?.status ?? null;
  const isDeliveryMode = tollgateStatus === "approved" || story.status === "in_progress";
  const ideaBlockers = [
    !story.valueIntent?.trim() ? "Value Intent still needs to be described." : null,
    !story.expectedBehavior?.trim() ? "Expected Behavior still needs to be described." : null
  ].filter((value): value is string => Boolean(value));
  const epicAlignmentText =
    story.epic.purpose?.trim() ||
    story.epic.scopeBoundary?.trim() ||
    `This story idea should contribute clearly to Epic ${story.epic.key} ${story.epic.title}.`;
  const primaryStatusLabel = isDeliveryMode ? storyUx.statusLabel : "Story idea";
  const primaryStatusDetail = isDeliveryMode ? storyUx.statusDetail : STORY_IDEA_GUIDANCE;
  const primaryNextStepLabel = isDeliveryMode
    ? storyUx.nextActions[0]?.label ?? "Continue Story"
    : ideaBlockers.length > 0
      ? "Refine the story idea"
      : "Keep guiding design and AI refinement";
  const primaryNextStepDetail = isDeliveryMode
    ? storyUx.nextActions[0]?.description ?? "Continue working in the Story workspace."
    : ideaBlockers.length > 0
      ? ideaBlockers[0]
      : "This story idea is already clear enough to support design and AI refinement without becoming a delivery specification.";

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Story",
        badge: story.key
      }}
    >
      <PageViewAnalytics
        eventName="story_workspace_viewed"
        properties={{
          storyId: story.id,
          storyKey: story.key
        }}
      />
      <section className="space-y-6">
        {created ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {isDeliveryMode ? "Native Story created and ready for design work." : "Native Story idea created inside the current Framing."}
          </div>
        ) : null}
        {saveState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Story changes were saved successfully.
          </div>
        ) : null}
        {saveState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {readyState === "blocked" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Story readiness is blocked. Fill the missing fields listed below and try again.
          </div>
        ) : null}
        {readyState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Story readiness recorded. This Story is now ready for design review.
          </div>
        ) : null}
        {readyState === "duplicate" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This approval was already recorded. Duplicate sign-offs are blocked so the Story status stays trustworthy.
          </div>
        ) : null}
        {readyState === "approved" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Required sign-offs are complete. This Story is now ready for design.
          </div>
        ) : null}
        {lifecycleState === "archived" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Story archived. It is now removed from active working views but remains traceable.
          </div>
        ) : null}
        {lifecycleState === "restored" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Story restored to active work.
          </div>
        ) : null}
        {lifecycleState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {isArchived ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            This Story is archived and currently read-only. Restore it to continue active design work.
          </div>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {story.key}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      isDeliveryMode ? getStoryToneClasses(storyUx.tone) : "border-sky-200 bg-sky-50 text-sky-800"
                    }`}
                  >
                    {primaryStatusLabel}
                  </span>
                  {isDeliveryMode ? (
                    <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {story.storyType.replaceAll("_", " ")}
                    </span>
                  ) : null}
                </div>
                <div>
                  <CardTitle>{story.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-4xl">{primaryStatusDetail}</CardDescription>
                </div>
              </div>

              {!isArchived && isDeliveryMode ? (
                <Button asChild className="gap-2" variant={blockers.length === 0 ? "default" : "secondary"}>
                  <Link href={`/handoff/${story.id}`}>
                    Preview Execution Contract
                    <FileJson2 className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {isDeliveryMode ? (
              <>
                <div className={`rounded-2xl border px-4 py-4 text-sm ${getStoryToneClasses(storyUx.tone)}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">Readiness</p>
                  <p className="mt-2 font-semibold">{storyUx.readinessLabel}</p>
                  <p className="mt-2 leading-6">{storyUx.readinessDetail}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next step</p>
                  <p className="mt-2 font-semibold text-foreground">{primaryNextStepLabel}</p>
                  <p className="mt-2 leading-6 text-muted-foreground">{primaryNextStepDetail}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm" id="story-blockers">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current blocker</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {blockers.length === 0 ? "No visible blockers" : blockers[0]}
                  </p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {blockers.length > 1
                      ? `${blockers.length - 1} more blocker${blockers.length - 1 === 1 ? "" : "s"} are listed below in approvals.`
                      : "Use the sections below to continue the Story."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Value intent</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {story.valueIntent?.trim() ? "Described" : "Still needs definition"}
                  </p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {story.valueIntent?.trim() || "Explain why this story idea matters and what user or business value it should create."}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Expected behavior</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {story.expectedBehavior?.trim() ? "Described" : "Still needs definition"}
                  </p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {story.expectedBehavior?.trim() || "Describe roughly what should happen when this idea is implemented without turning it into detailed delivery requirements."}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm" id="story-blockers">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic alignment</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {story.epic.key} {story.epic.title}
                  </p>
                  <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <div className="space-y-6">
            <form action={saveStoryWorkspaceAction} className="space-y-6">
              <input name="storyId" type="hidden" value={story.id} />
              <input name="epicId" type="hidden" value={story.epicId} />
              <input name="outcomeId" type="hidden" value={story.outcomeId} />
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{isDeliveryMode ? "Story design" : "Story idea definition"}</CardTitle>
                  <CardDescription>
                    {isDeliveryMode
                      ? "Keep Story focused on one testable delivery unit and its explicit handoff inputs."
                      : STORY_IDEA_GUIDANCE}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm" id="story-ai-level">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI level</p>
                    <p className="mt-2 font-semibold text-foreground">{formatAiLevel(story.aiAccelerationLevel)}</p>
                    <p className="mt-2 leading-6 text-muted-foreground">
                      This comes from the current Framing and affects governance requirements for the Story.
                    </p>
                  </div>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.title}
                      disabled={isArchived}
                      name="title"
                      type="text"
                    />
                  </label>
                  {isDeliveryMode ? (
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Story type</span>
                      <select
                        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                        defaultValue={story.storyType}
                        disabled={isArchived}
                        name="storyType"
                      >
                        <option value="outcome_delivery">Outcome delivery</option>
                        <option value="governance">Governance</option>
                        <option value="enablement">Enablement</option>
                      </select>
                    </label>
                  ) : (
                    <input name="storyType" type="hidden" value={story.storyType} />
                  )}
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Value intent</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.valueIntent}
                      disabled={isArchived}
                      name="valueIntent"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Expected behavior</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.expectedBehavior ?? ""}
                      disabled={isArchived}
                      name="expectedBehavior"
                    />
                  </label>
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic alignment</p>
                    <p className="mt-2 font-semibold text-foreground">
                      {story.epic.key} {story.epic.title}
                    </p>
                    <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
                  </div>
                </CardContent>
              </Card>

              <SecondaryPanel
                defaultOpen={isDeliveryMode}
                description={
                  isDeliveryMode
                    ? missingReadinessFields.length === 0
                      ? "All required design inputs are present. Review and approval can continue without more field edits."
                      : "Fields highlighted below still need input before the Story can move forward."
                    : "These delivery details can wait until the story idea is approved for later handoff work."
                }
                id="story-handoff-inputs"
                title={isDeliveryMode ? "Required design inputs" : "Delivery details later"}
              >
                <div className="grid gap-4">
                  <label className="space-y-2" id="story-acceptance-criteria">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          readinessFields[0].complete
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {readinessFields[0].complete ? "Ready" : "Missing"}
                      </span>
                    </div>
                    <textarea
                      className={`min-h-28 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                        readinessFields[0].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                      }`}
                      defaultValue={story.acceptanceCriteria.join("\n")}
                      disabled={isArchived}
                      name="acceptanceCriteria"
                    />
                    {!readinessFields[0].complete ? (
                      <p className="text-sm text-amber-800">{readinessFields[0].help}</p>
                    ) : null}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">AI Usage Scope</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.aiUsageScope.join(", ")}
                      disabled={isArchived}
                      name="aiUsageScope"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2" id="story-test-definition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">Test Definition</span>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          readinessFields[1].complete
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {readinessFields[1].complete ? "Ready" : "Missing"}
                      </span>
                    </div>
                    <textarea
                      className={`min-h-24 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                        readinessFields[1].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                      }`}
                      defaultValue={story.testDefinition ?? ""}
                      disabled={isArchived}
                      name="testDefinition"
                    />
                    {!readinessFields[1].complete ? (
                      <p className="text-sm text-amber-800">{readinessFields[1].help}</p>
                    ) : null}
                  </label>
                  <label className="space-y-2" id="story-definition-of-done">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">Definition of Done</span>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          readinessFields[2].complete
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                      >
                        {readinessFields[2].complete ? "Ready" : "Missing"}
                      </span>
                    </div>
                    <textarea
                      className={`min-h-28 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                        readinessFields[2].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                      }`}
                      defaultValue={story.definitionOfDone.join("\n")}
                      disabled={isArchived}
                      name="definitionOfDone"
                    />
                    {!readinessFields[2].complete ? (
                      <p className="text-sm text-amber-800">{readinessFields[2].help}</p>
                    ) : null}
                  </label>
                </div>
              </SecondaryPanel>

              {!isArchived ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <PendingFormButton
                    className="gap-2"
                    icon={<ArrowRight className="h-4 w-4" />}
                    label="Save Story changes"
                    pendingLabel="Saving Story..."
                  />
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/epics/${story.epicId}`}>Back to current Epic</Link>
                  </Button>
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/framing?outcomeId=${story.outcomeId}`}>Open current Framing</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/epics/${story.epicId}`}>Back to current Epic</Link>
                  </Button>
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/framing?outcomeId=${story.outcomeId}`}>Open current Framing</Link>
                  </Button>
                </div>
              )}
            </form>

            <SecondaryPanel
              defaultOpen={false}
              description="Open this only when you need to check where the Story sits in the current branch."
              title="Branch context"
            >
              <div id="story-value-spine">
                {isDeliveryMode ? (
                  <FramingValueSpineTree
                    emptyEpicMessage="This Story is already inside an active Framing branch, so no sibling Framing branches are shown here."
                    emptyStoryMessage="This view is already scoped to the current Story branch."
                    epics={[
                      {
                        id: story.epic.id,
                        key: story.epic.key,
                        title: story.epic.title,
                        href: `/epics/${story.epicId}`,
                        isCurrent: false,
                        scopeBoundary: story.epic.scopeBoundary ?? null,
                        purpose: story.epic.purpose ?? null,
                        originType: story.epic.originType,
                        lifecycleState: story.epic.lifecycleState,
                        importedReadinessState: story.epic.importedReadinessState ?? null,
                        lineageHref:
                          story.epic.lineageSourceType === "artifact_aas_candidate" && story.epic.lineageSourceId
                            ? `/review?candidateId=${story.epic.lineageSourceId}`
                            : null,
                        stories: [
                          {
                            id: story.id,
                            key: story.key,
                            title: story.title,
                            href: `/stories/${story.id}`,
                            isCurrent: true,
                            valueIntent: story.valueIntent ?? null,
                            testDefinition: story.testDefinition ?? null,
                            acceptanceCriteria: story.acceptanceCriteria,
                            definitionOfDone: story.definitionOfDone,
                            status: story.status,
                            originType: story.originType,
                            lifecycleState: story.lifecycleState,
                            tollgateStatus,
                            pendingActionCount: tollgateReview?.pendingActions.length ?? 0,
                            blockedActionCount: tollgateReview?.blockedActions.length ?? 0,
                            importedReadinessState: story.importedReadinessState ?? null,
                            lineageHref:
                              story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId
                                ? `/review?candidateId=${story.lineageSourceId}`
                                : null
                          }
                        ]
                      }
                    ]}
                    outcome={{
                      id: story.outcome.id,
                      key: story.outcome.key,
                      title: story.outcome.title,
                      href: `/framing?outcomeId=${story.outcomeId}`,
                      isCurrent: false,
                      statement: story.outcome.outcomeStatement ?? null,
                      originType: story.outcome.originType,
                      lifecycleState: story.outcome.lifecycleState,
                      importedReadinessState: story.outcome.importedReadinessState ?? null,
                      lineageHref:
                        story.outcome.lineageSourceType === "artifact_aas_candidate" && story.outcome.lineageSourceId
                          ? `/review?candidateId=${story.outcome.lineageSourceId}`
                          : null
                    }}
                  />
                ) : (
                  <Card className="border-border/70 shadow-none">
                    <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current framing</p>
                        <p className="mt-2 font-semibold text-foreground">
                          {story.outcome.key} {story.outcome.title}
                        </p>
                        <p className="mt-2 leading-6 text-muted-foreground">
                          {story.outcome.outcomeStatement?.trim() || "Outcome statement is not yet described in this Framing."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current epic</p>
                        <p className="mt-2 font-semibold text-foreground">
                          {story.epic.key} {story.epic.title}
                        </p>
                        <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </SecondaryPanel>
          </div>

          <div className="space-y-6">
            <SecondaryPanel
              defaultOpen={isDeliveryMode}
              description={
                isDeliveryMode
                  ? "Server-backed readiness, review, approval and escalation trail for Story handoff."
                  : "This delivery review trail becomes important later, after the story idea is clear enough for framing."
              }
              title={isDeliveryMode ? "Story readiness review and approval" : "Delivery review later"}
            >
              <div id="story-signoff-history">
                <div id="story-signoff">
              <TollgateDecisionCard
                aiAccelerationLevel={story.aiAccelerationLevel}
                approvalActions={tollgateReview?.approvalActions ?? []}
                availablePeople={tollgateReview?.availablePeople ?? []}
                blockers={blockers}
                blockedActions={tollgateReview?.blockedActions ?? []}
                comments={tollgateReview?.comments ?? tollgate?.comments ?? null}
                description="Server-backed readiness, review, approval and escalation trail for Story handoff."
                entityId={story.id}
                entityType="story"
                formAction={recordStoryTollgateDecisionAction}
                hiddenFields={[
                  { name: "storyId", value: story.id },
                  { name: "epicId", value: story.epicId },
                  { name: "outcomeId", value: story.outcomeId }
                ]}
                pendingActions={tollgateReview?.pendingActions ?? []}
                reviewActions={tollgateReview?.reviewActions ?? []}
                signoffRecords={
                  tollgateReview?.signoffRecords.map((record) => ({
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
                  })) ?? []
                }
                status={tollgateReview?.status ?? (blockers.length === 0 ? "ready" : "blocked")}
                title="Story readiness review and approval"
                tollgateType="story_readiness"
              />
                </div>
              </div>
            </SecondaryPanel>

            {!isArchived && isDeliveryMode ? (
              <Card className="border-border/70 shadow-sm" id="story-readiness">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Submit Story readiness
                    <InlineTermHelp term="Readiness" />
                  </CardTitle>
                  <CardDescription>Readiness submission freezes the current blockers before human sign-off continues.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={submitStoryReadinessAction} className="space-y-4">
                    <input name="storyId" type="hidden" value={story.id} />
                    <input name="epicId" type="hidden" value={story.epicId} />
                    <input name="outcomeId" type="hidden" value={story.outcomeId} />
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Readiness note</span>
                      <textarea
                        className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                        defaultValue={tollgate?.comments ?? ""}
                        name="comments"
                      />
                    </label>
                    <PendingFormButton
                      className="gap-2"
                      icon={<ShieldCheck className="h-4 w-4" />}
                      label="Record readiness"
                      pendingLabel="Recording readiness..."
                    />
                  </form>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-border/70 shadow-sm" id="story-governance">
              <CardHeader>
                <CardTitle>Governance readiness</CardTitle>
                <CardDescription>Check whether the project is staffed strongly enough for this Story's AI level.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href={`/governance?view=readiness&sourceEntity=story&sourceId=${story.id}&level=${story.aiAccelerationLevel}`}>
                    Open Governance readiness
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <SecondaryPanel
              defaultOpen={false}
              description="Operational history is useful, but not usually the first thing needed to move work forward."
              title="Latest activity"
            >
              <div className="space-y-3 text-sm text-muted-foreground">
                {activities.length === 0 ? (
                  <p>No activity has been recorded yet for this Story.</p>
                ) : (
                  activities.map((activity) => (
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={activity.id}>
                      <p className="font-medium text-foreground">{activity.eventType.replaceAll("_", " ")}</p>
                      <p className="mt-1">{new Date(activity.createdAt).toLocaleString("en-US")}</p>
                    </div>
                  ))
                )}
              </div>
            </SecondaryPanel>

            <SecondaryPanel
              defaultOpen={false}
              description="Archive, restore and delete controls stay available without displacing primary Story work."
              id="story-lifecycle"
              title="Lifecycle controls"
            >
              <GovernedLifecycleCard
                archiveAction={archiveStoryAction}
                decision={removal?.decision ?? null}
                entityId={story.id}
                entityLabel="Story"
                hardDeleteAction={hardDeleteStoryAction}
                hiddenFields={[
                  { name: "epicId", value: story.epicId },
                  { name: "outcomeId", value: story.outcomeId }
                ]}
                restoreAction={restoreStoryAction}
              />
            </SecondaryPanel>

            {story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId ? (
              <SecondaryPanel
                defaultOpen={false}
                description="Imported lineage is still accessible when you need to trace the source material."
                title="Imported lineage"
              >
                <Button asChild className="gap-2" variant="secondary">
                  <Link href={`/review?candidateId=${story.lineageSourceId}`}>Open source candidate review</Link>
                </Button>
              </SecondaryPanel>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
