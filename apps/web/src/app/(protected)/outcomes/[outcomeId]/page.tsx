import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleAlert, CircleCheckBig, ShieldCheck } from "lucide-react";
import { getOutcomeBaselineBlockers } from "@aas-companion/domain";
import { getOutcomeWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { FramingContextCard } from "@/components/workspace/framing-context-card";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { requireOrganizationContext } from "@/lib/auth/guards";
import {
  archiveOutcomeAction,
  createEpicFromOutcomeAction,
  hardDeleteOutcomeAction,
  restoreOutcomeAction,
  saveOutcomeWorkspaceAction,
  submitOutcomeTollgateAction
} from "./actions";

type OutcomeWorkspacePageProps = {
  params: Promise<{
    outcomeId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getOriginLabel(originType: string) {
  if (originType === "seeded") {
    return "Demo";
  }

  if (originType === "native") {
    return "Native";
  }

  return "Imported";
}

function getOriginSummary(originType: string) {
  if (originType === "seeded") {
    return "This case comes from the Demo project for guided exploration.";
  }

  if (originType === "native") {
    return "This case was authored natively and represents clean customer work.";
  }

  return "This case was promoted from imported source material.";
}

function getWorkspaceLabel(outcome: { originType: string; createdMode: string }) {
  return outcome.originType === "native" && outcome.createdMode === "clean" ? "Clean" : "Shared";
}

export default async function OutcomeWorkspacePage({ params, searchParams }: OutcomeWorkspacePageProps) {
  const organization = await requireOrganizationContext();
  const { outcomeId } = await params;
  const query = searchParams ? await searchParams : {};
  const created = getParamValue(query.created) === "1";
  const saveState = getParamValue(query.save);
  const submitState = getParamValue(query.submit);
  const lifecycleState = getParamValue(query.lifecycle);
  const saveMessage = getParamValue(query.message);
  const blockersFromQuery = getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [];
  const outcomeResult = await getOutcomeWorkspaceService(organization.organizationId, outcomeId);

  if (!outcomeResult.ok) {
    notFound();
  }

  const { outcome, tollgate, activities, removal } = outcomeResult.data;
  const computedBlockers = getOutcomeBaselineBlockers(outcome);
  const blockers = blockersFromQuery.length > 0 ? blockersFromQuery : tollgate?.blockers ?? computedBlockers;
  const baselineComplete = computedBlockers.length === 0;
  const statusLabel = outcome.status.replaceAll("_", " ");
  const originLabel = getOriginLabel(outcome.originType);
  const workspaceLabel = getWorkspaceLabel(outcome);
  const tollgateStatusLabel = tollgate?.status ? tollgate.status.replaceAll("_", " ") : "not started";
  const isArchived = outcome.lifecycleState === "archived";

  return (
    <AppShell
      rightRail={
        <aside className="space-y-4">
          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle>Readiness blockers</CardTitle>
              <CardDescription>What still blocks Tollgate 1 for this outcome.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {blockers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900">
                  No baseline blockers are currently visible.
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
              <CardTitle>Tollgate posture</CardTitle>
              <CardDescription>Current TG1 stance for the active outcome.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Outcome status:</strong> {statusLabel}
              </p>
              <p>
                <strong className="text-foreground">Lifecycle:</strong> {outcome.lifecycleState.replaceAll("_", " ")}
              </p>
              <p>
                <strong className="text-foreground">Tollgate:</strong> {tollgateStatusLabel}
              </p>
              <p>
                <strong className="text-foreground">Approvers:</strong> {(tollgate?.approverRoles ?? ["value_owner", "architect"]).join(", ")}
              </p>
            </CardContent>
          </Card>
        </aside>
      }
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Outcome",
        badge: outcome.key
      }}
    >
      <PageViewAnalytics
        eventName="outcome_workspace_viewed"
        properties={{
          outcomeId: outcome.id,
          outcomeKey: outcome.key
        }}
      />
      <section className="space-y-6">
        {created ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Clean native case created and ready for framing work.
          </div>
        ) : null}
        {saveState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Outcome changes were saved successfully.
          </div>
        ) : null}
        {saveState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {submitState === "blocked" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Tollgate 1 is still blocked. Complete the missing baseline fields listed below.
          </div>
        ) : null}
        {submitState === "ready" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Tollgate 1 submission recorded. This outcome is now ready for review.
          </div>
        ) : null}
        {lifecycleState === "archived" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Outcome archived. It is now removed from active working views but still traceable here.
          </div>
        ) : null}
        {lifecycleState === "restored" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Outcome restored to active work.
          </div>
        ) : null}
        {lifecycleState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {isArchived ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            This Outcome is archived and currently read-only. Restore it to continue active framing work.
          </div>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Case provenance</CardTitle>
            <CardDescription>Use this lightweight summary to distinguish Demo reference work from native customer work.</CardDescription>
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
            <p className="max-w-2xl text-sm text-muted-foreground">{getOriginSummary(outcome.originType)}</p>
          </CardContent>
        </Card>

        <FramingContextCard
          epic={null}
          outcome={{
            id: outcome.id,
            key: outcome.key,
            title: outcome.title,
            href: `/outcomes/${outcome.id}`
          }}
          summary="Opening this Outcome establishes the active Framing context. Only Epics and Stories attached to this case are shown by default."
        />

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{outcome.title}</CardTitle>
                <CardDescription>
                  {outcome.key} in {organization.organizationName}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{statusLabel}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Baseline readiness</p>
                  <p className="mt-2 text-lg font-semibold">{baselineComplete ? "Baseline fields present" : "Baseline incomplete"}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk profile</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{outcome.riskProfile}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Origin</p>
                  <p className="mt-2 text-lg font-semibold">{originLabel}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lifecycle</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{outcome.lifecycleState}</p>
                </div>
                {outcome.importedReadinessState ? (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Imported readiness</p>
                    <p className="mt-2 text-lg font-semibold capitalize text-sky-950">
                      {outcome.importedReadinessState.replaceAll("_", " ")}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <form action={saveOutcomeWorkspaceAction} className="space-y-6">
              <input name="outcomeId" type="hidden" value={outcome.id} />
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Capture the core framing statement and surrounding context.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={outcome.title}
                      disabled={isArchived}
                      name="title"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Problem statement</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={outcome.problemStatement ?? ""}
                      disabled={isArchived}
                      name="problemStatement"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Outcome statement</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={outcome.outcomeStatement ?? ""}
                      disabled={isArchived}
                      name="outcomeStatement"
                    />
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
                  </label>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Baseline</CardTitle>
                  <CardDescription>These fields must be present before Tollgate 1 can move to review.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Baseline definition</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={outcome.baselineDefinition ?? ""}
                      disabled={isArchived}
                      name="baselineDefinition"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Baseline source</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={outcome.baselineSource ?? ""}
                      disabled={isArchived}
                      name="baselineSource"
                    />
                  </label>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/70 shadow-sm">
                  <CardHeader>
                    <CardTitle>Risks</CardTitle>
                    <CardDescription>Keep the risk posture explicit as part of framing discipline.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Risk profile</span>
                      <select
                        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                        defaultValue={outcome.riskProfile}
                        disabled={isArchived}
                        name="riskProfile"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </label>
                  </CardContent>
                </Card>

                <Card className="border-border/70 shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Epics in this case</CardTitle>
                        <CardDescription>Create native Epics directly from this Outcome without using import.</CardDescription>
                      </div>
                      {!isArchived ? (
                        <Button className="gap-2" formAction={createEpicFromOutcomeAction} type="submit">
                          Create Epic
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    {outcome.epics.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
                        <p className="font-medium text-foreground">No Epics exist for this case yet.</p>
                        <p className="mt-2">
                          {isArchived
                            ? "Restore the Outcome if you want to continue breaking it down."
                            : "Create the first native Epic here. No Demo Epics will be attached as fallback."}
                        </p>
                      </div>
                    ) : (
                      outcome.epics.map((epic) => (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={epic.id}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-foreground">{epic.key}</p>
                              <p className="mt-1">{epic.title}</p>
                            </div>
                            <Button asChild className="gap-2" variant="secondary">
                              <Link href={`/epics/${epic.id}`}>
                                Open Epic in current Framing
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <FramingValueSpineTree
                emptyEpicMessage={
                  isArchived
                    ? "Archived Outcomes no longer surface active Epic work in this branch."
                    : "Create the first native Epic here. Empty branches stay empty until you add child work."
                }
                emptyStoryMessage={
                  isArchived
                    ? "Archived Outcomes no longer surface active Story work."
                    : "Create Stories from the relevant Epic so the hierarchy stays scoped to this Framing."
                }
                epics={outcome.epics.map((epic) => ({
                  id: epic.id,
                  key: epic.key,
                  title: epic.title,
                  href: `/epics/${epic.id}`,
                  isCurrent: false,
                  summary: epic.summary ?? epic.purpose,
                  stories: outcome.stories
                    .filter((story) => story.epicId === epic.id)
                    .map((story) => ({
                      id: story.id,
                      key: story.key,
                      title: story.title,
                      href: `/stories/${story.id}`,
                      isCurrent: false,
                      testDefinition: story.testDefinition ?? null
                    }))
                }))}
                outcome={{
                  id: outcome.id,
                  key: outcome.key,
                  title: outcome.title,
                  href: `/outcomes/${outcome.id}`,
                  isCurrent: true
                }}
              />

              {!isArchived ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="gap-2" type="submit">
                    Save outcome changes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href="/framing">Back to Framing Cockpit</Link>
                  </Button>
                </div>
              ) : (
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/framing">Back to Framing Cockpit</Link>
                </Button>
              )}
            </form>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Approvals</CardTitle>
                <CardDescription>Current approval posture for the first framing tollgate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Required approvers:</strong>{" "}
                  {(tollgate?.approverRoles ?? ["value_owner", "architect"]).join(", ")}
                </p>
                <p>
                  <strong className="text-foreground">Comments:</strong> {tollgate?.comments ?? "No comments recorded yet."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Tollgate 1 panel</CardTitle>
                <CardDescription>Server-backed readiness check for baseline completeness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm ${
                    blockers.length === 0
                      ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                      : "border-amber-200 bg-amber-50/80 text-amber-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {blockers.length === 0 ? (
                      <CircleCheckBig className="h-4 w-4" />
                    ) : (
                      <CircleAlert className="h-4 w-4" />
                    )}
                    {blockers.length === 0 ? "Ready for TG1 review" : "Blocked"}
                  </div>
                  <p className="mt-2 leading-6">
                    {blockers.length === 0
                      ? "Required baseline fields are present. You can submit this outcome for Tollgate 1 review."
                      : blockers.join(" ")}
                  </p>
                </div>

                {!isArchived ? (
                  <form action={submitOutcomeTollgateAction} className="space-y-4">
                    <input name="outcomeId" type="hidden" value={outcome.id} />
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Submission note</span>
                      <textarea
                        className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                        defaultValue={tollgate?.comments ?? ""}
                        name="comments"
                      />
                    </label>
                    <Button className="gap-2" type="submit">
                      <ShieldCheck className="h-4 w-4" />
                      Submit to Tollgate 1
                    </Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">Restore the Outcome before resuming Tollgate progression.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Latest activity</CardTitle>
                <CardDescription>Recent outcome-specific audit entries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {activities.length === 0 ? (
                  <p>No activity has been recorded yet for this outcome.</p>
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
              archiveAction={archiveOutcomeAction}
              decision={removal?.decision ?? null}
              entityId={outcome.id}
              entityLabel="Outcome"
              hardDeleteAction={hardDeleteOutcomeAction}
              restoreAction={restoreOutcomeAction}
            />

            {outcome.lineageSourceType === "artifact_aas_candidate" && outcome.lineageSourceId ? (
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
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
