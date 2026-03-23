import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleAlert, CircleCheckBig, FileJson2, ShieldCheck } from "lucide-react";
import { getStoryReadinessBlockers } from "@aas-companion/domain";
import { getStoryWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { requireOrganizationContext } from "@/lib/auth/guards";
import { saveStoryWorkspaceAction, submitStoryReadinessAction } from "./actions";

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
  const saveState = getParamValue(query.save);
  const readyState = getParamValue(query.ready);
  const saveMessage = getParamValue(query.message);
  const blockersFromQuery = getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [];
  const storyResult = await getStoryWorkspaceService(organization.organizationId, storyId);

  if (!storyResult.ok) {
    notFound();
  }

  const { story, tollgate, activities } = storyResult.data;
  const computedBlockers = getStoryReadinessBlockers(story);
  const blockers = blockersFromQuery.length > 0 ? blockersFromQuery : tollgate?.blockers ?? computedBlockers;

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
              <Button asChild className="w-full gap-2" variant={blockers.length === 0 ? "default" : "secondary"}>
                <Link href={`/handoff/${story.id}`}>
                  Preview Execution Contract
                  <FileJson2 className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      }
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Story Workspace",
        badge: "Story M1-007"
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription>
                  {story.key} in {organization.organizationName}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
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
                </div>
              </CardContent>
            </Card>

            <form action={saveStoryWorkspaceAction} className="space-y-6">
              <input name="storyId" type="hidden" value={story.id} />
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Story design</CardTitle>
                  <CardDescription>Keep the structured Story fields explicit and human-reviewable.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={story.title}
                      name="title"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Story type</span>
                    <select
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={story.storyType}
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
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={story.valueIntent}
                      name="valueIntent"
                    />
                  </label>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Execution readiness inputs</CardTitle>
                  <CardDescription>These fields drive readiness and later contract generation.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={story.acceptanceCriteria.join("\n")}
                      name="acceptanceCriteria"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">AI Usage Scope</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={story.aiUsageScope.join(", ")}
                      name="aiUsageScope"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Test Definition</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={story.testDefinition ?? ""}
                      name="testDefinition"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Definition of Done</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={story.definitionOfDone.join("\n")}
                      name="definitionOfDone"
                    />
                  </label>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="gap-2" type="submit">
                  Save Story changes
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/stories">Back to Stories</Link>
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Readiness panel</CardTitle>
                <CardDescription>Server-backed readiness calculation for build handoff.</CardDescription>
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
                    {blockers.length === 0 ? "Ready for build handoff" : "Definition blocked"}
                  </div>
                  <p className="mt-2 leading-6">
                    {blockers.length === 0
                      ? "Required Story fields are present. Execution Contract preview can be generated."
                      : blockers.join(" ")}
                  </p>
                </div>

                <form action={submitStoryReadinessAction} className="space-y-4">
                  <input name="storyId" type="hidden" value={story.id} />
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
          </div>
        </div>
      </section>
    </AppShell>
  );
}
