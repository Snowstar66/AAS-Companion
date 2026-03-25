import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileJson2, ShieldCheck } from "lucide-react";
import { getStoryReadinessBlockers } from "@aas-companion/domain";
import { getStoryWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { FramingContextCard } from "@/components/workspace/framing-context-card";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { TollgateDecisionCard } from "@/components/workspace/tollgate-decision-card";
import { requireOrganizationContext } from "@/lib/auth/guards";
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

  return (
    <AppShell
      rightRail={
        <aside className="space-y-4">
          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle>Readiness blockers</CardTitle>
              <CardDescription>Missing fields that still block build handoff readiness.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blockers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900">
                  No readiness blockers are currently visible.
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
              <CardTitle>Build handoff</CardTitle>
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

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
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
                      testDefinition: story.testDefinition ?? null
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

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription>
                  {story.key} in {organization.organizationName}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Story type</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{story.storyType.replaceAll("_", " ")}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{story.status.replaceAll("_", " ")}</p>
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
              </CardContent>
            </Card>

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

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Handoff inputs</CardTitle>
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

            {!isArchived ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Submit Story readiness</CardTitle>
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

            <Card className="border-border/70 shadow-sm">
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

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Latest activity</CardTitle>
                <CardDescription>Recent Story-specific audit entries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
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
              </CardContent>
            </Card>

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

            {story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Imported lineage</CardTitle>
                  <CardDescription>Trace this governed Story back to its reviewed import candidate.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/review?candidateId=${story.lineageSourceId}`}>Open source candidate review</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
