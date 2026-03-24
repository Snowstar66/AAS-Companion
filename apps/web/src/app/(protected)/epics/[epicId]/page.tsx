import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleAlert, GitBranch, Layers3 } from "lucide-react";
import { getEpicWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { requireOrganizationContext } from "@/lib/auth/guards";
import { createStoryFromEpicAction } from "./actions";

type EpicWorkspacePageProps = {
  params: Promise<{
    epicId: string;
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

function getWorkspaceLabel(epic: { originType: string; createdMode: string }) {
  return epic.originType === "native" && epic.createdMode === "clean" ? "Clean" : "Shared";
}

export default async function EpicWorkspacePage({ params, searchParams }: EpicWorkspacePageProps) {
  const organization = await requireOrganizationContext();
  const { epicId } = await params;
  const query = searchParams ? await searchParams : {};
  const created = getParamValue(query.created) === "1";
  const error = getParamValue(query.error);
  const epicResult = await getEpicWorkspaceService(organization.organizationId, epicId);

  if (!epicResult.ok || !epicResult.data) {
    notFound();
  }

  const { epic, activities } = epicResult.data;
  const originLabel = getOriginLabel(epic.originType);
  const workspaceLabel = getWorkspaceLabel(epic);
  const statusLabel = epic.status.replaceAll("_", " ");

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Epic Workspace",
        badge: "M1 clean native flow"
      }}
    >
      <section className="space-y-6">
        {created ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Native Epic created and ready for Story breakdown.
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{epic.title}</CardTitle>
            <CardDescription>
              {epic.key} in {organization.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Origin</p>
              <p className="mt-2 text-lg font-semibold">{originLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
              <p className="mt-2 text-lg font-semibold">{workspaceLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
              <p className="mt-2 text-lg font-semibold capitalize">{statusLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Outcome</p>
              <p className="mt-2 text-lg font-semibold">{epic.outcome.key}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Epic purpose</CardTitle>
                <CardDescription>This native Epic stays scoped to the current Outcome only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{epic.purpose}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/outcomes/${epic.outcomeId}`}>
                      Back to Outcome Workspace
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Story breakdown</CardTitle>
                    <CardDescription>Create native Stories directly from this Epic without using import.</CardDescription>
                  </div>
                  <form action={createStoryFromEpicAction}>
                    <input name="epicId" type="hidden" value={epic.id} />
                    <Button className="gap-2" type="submit">
                      Create Story
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {epic.stories.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">No Stories exist for this Epic yet.</p>
                    <p className="mt-2">
                      Start the first native Story here. No demo acceptance criteria, tests, or fallback design content
                      will be injected.
                    </p>
                  </div>
                ) : (
                  epic.stories.map((story) => (
                    <div className="rounded-2xl border border-border/70 bg-background p-4" key={story.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{story.key}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{story.title}</p>
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
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Clean workspace scope</CardTitle>
                <CardDescription>Only the current Outcome, this Epic, and its Stories are surfaced here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>No demo-seeded Epics or Stories are shown in this context.</p>
                <p>Use Create Story to continue design work natively from this Epic.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Latest activity</CardTitle>
                <CardDescription>Recent Epic-specific audit entries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {activities.length === 0 ? (
                  <p>No activity has been recorded yet for this Epic.</p>
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

            {epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Imported lineage</CardTitle>
                  <CardDescription>Trace this Epic back to the reviewed import candidate.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/review?candidateId=${epic.lineageSourceId}`}>
                      <GitBranch className="h-4 w-4" />
                      Open source candidate review
                    </Link>
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
