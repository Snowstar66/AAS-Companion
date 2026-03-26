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
import { FramingContextCard } from "@/components/workspace/framing-context-card";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { NextRequiredActionPanel } from "@/components/workspace/next-required-action-panel";
import { StoryLifecycleStepIndicator } from "@/components/workspace/story-lifecycle-step-indicator";
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

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

  return (
    <AppShell
      rightRail={
        <aside className="space-y-4">
          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {storyUx.statusLabel}
                <InlineTermHelp term="Readiness" />
              </CardTitle>
              <CardDescription>{storyUx.statusDetail}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`rounded-2xl border px-4 py-4 text-sm ${getStoryToneClasses(storyUx.tone)}`}>
                <p className="font-medium">{storyUx.readinessLabel}</p>
                <p className="mt-2 leading-6">{storyUx.readinessDetail}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Open actions</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{storyUx.openActionCount}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Missing sign-offs</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{storyUx.missingSignoffCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90 shadow-sm" id="story-blockers">
            <CardHeader>
              <CardTitle>Current blockers</CardTitle>
              <CardDescription>Only blocking items are shown first so the page stays easy to scan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blockers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900">
                  No blockers are currently visible.
                </div>
              ) : (
                blockers.map((blocker) => (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-900" key={blocker}>
                    {blocker}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Build handoff
                <InlineTermHelp term="Tollgate" />
              </CardTitle>
              <CardDescription>Execution Contract preview opens only when the Story is ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isArchived ? (
                <p className="text-sm text-muted-foreground">Restore the Story before resuming handoff preparation.</p>
              ) : (
                <Button asChild className="w-full gap-2" variant={blockers.length === 0 ? "default" : "secondary"}>
                  <Link href={`/handoff/${story.id}`}>
                    Preview Execution Contract
                    <FileJson2 className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      }
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
            Native Story created and ready for design work.
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
            Story readiness recorded. This Story is ready for handoff preview.
          </div>
        ) : null}
        {readyState === "duplicate" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This approval was already recorded. Duplicate sign-offs are blocked so the Story status stays trustworthy.
          </div>
        ) : null}
        {readyState === "approved" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Required sign-offs are complete. Story readiness is now approved.
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

        <NextRequiredActionPanel actions={storyUx.nextActions} />
        <StoryLifecycleStepIndicator steps={storyUx.lifecycleSteps} />

        <FramingContextCard
          epic={{
            id: story.epic.id,
            key: story.epic.key,
            title: story.epic.title,
            href: `/epics/${story.epicId}`
          }}
          outcome={{
            id: story.outcome.id,
            key: story.outcome.key,
            title: story.outcome.title,
            href: `/framing?outcomeId=${story.outcomeId}`
          }}
          story={{
            id: story.id,
            key: story.key,
            title: story.title,
            href: `/stories/${story.id}`
          }}
          summary="This Story stays inside one Epic and one Framing. Related panels and navigation remain scoped to this branch instead of falling back to unrelated native or demo work."
        />

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <div className="space-y-6">
            <div id="story-value-spine">
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
                    stories: [
                      {
                        id: story.id,
                        key: story.key,
                        title: story.title,
                        href: `/stories/${story.id}`,
                        isCurrent: true,
                        testDefinition: story.testDefinition ?? null,
                        acceptanceCriteria: story.acceptanceCriteria,
                        definitionOfDone: story.definitionOfDone,
                        status: story.status,
                        lifecycleState: story.lifecycleState,
                        tollgateStatus: tollgateReview?.status ?? tollgate?.status ?? null,
                        pendingActionCount: tollgateReview?.pendingActions.length ?? 0,
                        blockedActionCount: tollgateReview?.blockedActions.length ?? 0
                      }
                    ]
                  }
                ]}
                outcome={{
                  id: story.outcome.id,
                  key: story.outcome.key,
                  title: story.outcome.title,
                  href: `/framing?outcomeId=${story.outcomeId}`,
                  isCurrent: false
                }}
              />
            </div>

            <SecondaryPanel
              defaultOpen={false}
              description="Secondary metadata stays available without crowding the primary workflow."
              title="Story details"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Story type</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{story.storyType.replaceAll("_", " ")}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Shown status</p>
                  <p className="mt-2 text-lg font-semibold">{storyUx.statusLabel}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI level</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{story.aiAccelerationLevel.replaceAll("_", " ")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Inherited from the parent Outcome framing unless explicitly lowered later.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lifecycle</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{story.lifecycleState}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Origin</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{story.originType.replaceAll("_", " ")}</p>
                </div>
                {story.importedReadinessState ? (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Imported readiness</p>
                    <p className="mt-2 text-lg font-semibold capitalize text-sky-950">
                      {story.importedReadinessState.replaceAll("_", " ")}
                    </p>
                  </div>
                ) : null}
              </div>
            </SecondaryPanel>

            <form action={saveStoryWorkspaceAction} className="space-y-6">
              <input name="storyId" type="hidden" value={story.id} />
              <input name="epicId" type="hidden" value={story.epicId} />
              <input name="outcomeId" type="hidden" value={story.outcomeId} />
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Story design</CardTitle>
                  <CardDescription>Keep Story focused on one testable delivery unit and its explicit handoff inputs.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
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
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Value intent</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.valueIntent}
                      disabled={isArchived}
                      name="valueIntent"
                    />
                  </label>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm" id="story-handoff-inputs">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Handoff inputs
                    <InlineTermHelp term="Readiness" />
                  </CardTitle>
                  <CardDescription>These are the only delivery fields this Story needs before readiness review.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.acceptanceCriteria.join("\n")}
                      disabled={isArchived}
                      name="acceptanceCriteria"
                    />
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
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Test Definition</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.testDefinition ?? ""}
                      disabled={isArchived}
                      name="testDefinition"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Definition of Done</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={story.definitionOfDone.join("\n")}
                      disabled={isArchived}
                      name="definitionOfDone"
                    />
                  </label>
                </CardContent>
              </Card>

              {!isArchived ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="gap-2" type="submit">
                    Save Story changes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
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
          </div>

          <div className="space-y-6">
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

            {!isArchived ? (
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
                    <Button className="gap-2" type="submit">
                      <ShieldCheck className="h-4 w-4" />
                      Record readiness
                    </Button>
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
