import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleAlert, CircleCheckBig, ShieldCheck } from "lucide-react";
import { getOutcomeBaselineBlockers } from "@aas-companion/domain";
import { getOutcomeWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { requireOrganizationContext } from "@/lib/auth/guards";
import {
  createEpicFromOutcomeAction,
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
    return "This case comes from seeded demo content for guided exploration.";
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
  const saveMessage = getParamValue(query.message);
  const blockersFromQuery = getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [];
  const outcomeResult = await getOutcomeWorkspaceService(organization.organizationId, outcomeId);

  if (!outcomeResult.ok) {
    notFound();
  }

  const { outcome, tollgate, activities } = outcomeResult.data;
  const computedBlockers = getOutcomeBaselineBlockers(outcome);
  const blockers = blockersFromQuery.length > 0 ? blockersFromQuery : tollgate?.blockers ?? computedBlockers;
  const baselineComplete = computedBlockers.length === 0;
  const statusLabel = outcome.status.replaceAll("_", " ");
  const originLabel = getOriginLabel(outcome.originType);
  const workspaceLabel = getWorkspaceLabel(outcome);
  const tollgateStatusLabel = tollgate?.status ? tollgate.status.replaceAll("_", " ") : "not started";

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
        title: "Outcome Workspace",
        badge: "Story M1-006"
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

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Case provenance</CardTitle>
            <CardDescription>Use this lightweight summary to distinguish demo examples from native customer work.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                Origin: {originLabel}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Workspace: {workspaceLabel}
              </span>
              <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                Status: {statusLabel}
              </span>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">{getOriginSummary(outcome.originType)}</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={outcome.title}
                      name="title"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Problem statement</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={outcome.problemStatement ?? ""}
                      name="problemStatement"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Outcome statement</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={outcome.outcomeStatement ?? ""}
                      name="outcomeStatement"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Timeframe</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={outcome.timeframe ?? ""}
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
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={outcome.baselineDefinition ?? ""}
                      name="baselineDefinition"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Baseline source</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={outcome.baselineSource ?? ""}
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
                        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                        defaultValue={outcome.riskProfile}
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
                      <Button className="gap-2" formAction={createEpicFromOutcomeAction} type="submit">
                        Create Epic
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    {outcome.epics.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
                        <p className="font-medium text-foreground">No Epics exist for this case yet.</p>
                        <p className="mt-2">Create the first native Epic here. No demo-seeded Epics will be attached as fallback.</p>
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
                                Open Epic Workspace
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

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Stories in this case</CardTitle>
                  <CardDescription>Only Stories linked to the current Outcome are visible in clean workspace mode.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {outcome.stories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5">
                      <p className="font-medium text-foreground">No Stories exist for this case yet.</p>
                      <p className="mt-2">Create an Epic first, then break it down into native Stories from Epic context.</p>
                    </div>
                  ) : (
                    outcome.stories.map((story) => (
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={story.id}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{story.key}</p>
                            <p className="mt-1">{story.title}</p>
                          </div>
                          <Button asChild className="gap-2" variant="secondary">
                            <Link href={`/stories/${story.id}`}>
                              Open Story Workspace
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="gap-2" type="submit">
                  Save outcome changes
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/framing">Back to Framing Cockpit</Link>
                </Button>
              </div>
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

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Scope note</CardTitle>
            <CardDescription>M1-STORY-006 implements the baseline and Tollgate 1 slice only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Multi-approver review depth, exceptions, and advanced risk handling remain out of scope for this story.</p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
