import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDashed,
  FileSearch,
  TestTube2,
  Workflow
} from "lucide-react";
import { getValueSpineService } from "@aas-companion/api/spine";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getStoryToneClasses, getStoryUxModel, type StoryUxModel } from "@/lib/workspace/story-ux";

type WorkspacePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
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

function getLifecycleStepClasses(state: StoryUxModel["lifecycleSteps"][number]["state"]) {
  if (state === "complete") {
    return "border-emerald-200 bg-emerald-50/80";
  }

  if (state === "current") {
    return "border-sky-200 bg-sky-50/80";
  }

  if (state === "attention") {
    return "border-amber-200 bg-amber-50/80";
  }

  return "border-border/70 bg-muted/10";
}

function LifecycleStepIcon({ state }: { state: StoryUxModel["lifecycleSteps"][number]["state"] }) {
  if (state === "complete") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-700" />;
  }

  if (state === "current") {
    return <Circle className="h-4 w-4 fill-sky-700 text-sky-700" />;
  }

  if (state === "attention") {
    return <CircleAlert className="h-4 w-4 text-amber-700" />;
  }

  return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
}

function StatCard(props: {
  label: string;
  count: number;
  description: string;
  className: string;
  actionHref?: string | undefined;
  actionLabel?: string | undefined;
}) {
  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${props.className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{props.label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{props.count}</p>
      <p className="mt-2 text-sm leading-6 opacity-90">{props.description}</p>
      {props.actionHref && props.actionLabel ? (
        <Button asChild className="mt-4 gap-2" size="sm" variant="secondary">
          <Link href={props.actionHref}>
            {props.actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const session = await requireActiveProjectSession();
  const query = searchParams ? await searchParams : {};
  const viewFilter = getParamValue(query.view) ?? "active";
  const snapshot = await getValueSpineService(session.organization.organizationId);

  if (!snapshot.ok) {
    return (
      <AppShell>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Value Spine is unavailable</CardTitle>
            <CardDescription>{snapshot.errors[0]?.message ?? "The project spine could not be loaded."}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  const orderedOutcomes = [...snapshot.data.organization.outcomes].sort((left, right) => {
    if (left.lifecycleState === right.lifecycleState) {
      return left.key.localeCompare(right.key);
    }

    if (left.lifecycleState === "active") {
      return -1;
    }

    if (right.lifecycleState === "active") {
      return 1;
    }

    return left.key.localeCompare(right.key);
  });

  const selectedOutcome =
    orderedOutcomes.find((outcome) => outcome.lifecycleState === "active" && outcome.originType !== "seeded") ??
    orderedOutcomes.find((outcome) => outcome.lifecycleState === "active") ??
    orderedOutcomes[0] ??
    null;

  const selectedEpics =
    selectedOutcome?.epics.filter((epic) => (viewFilter === "all" ? true : epic.lifecycleState === viewFilter)) ?? [];
  const selectedStories = selectedEpics.flatMap((epic) =>
    epic.stories.filter((story) => (viewFilter === "all" ? true : story.lifecycleState === viewFilter))
  );
  const readyStories = selectedStories.filter((story) =>
    getStoryUxModel({
      id: story.id,
      key: story.key,
      status: story.status,
      lifecycleState: story.lifecycleState,
      testDefinition: story.testDefinition ?? null,
      acceptanceCriteria: story.acceptanceCriteria,
      definitionOfDone: story.definitionOfDone,
      tollgateStatus: null
    }).isReadyForHandoff || story.status === "ready_for_handoff"
  );
  const missingTestStories = selectedStories.filter((story) => !story.testDefinition);
  const lineageTargets = [
    ...(selectedOutcome?.lineageSourceType === "artifact_aas_candidate" && selectedOutcome.lineageSourceId
      ? [{ href: `/review?candidateId=${selectedOutcome.lineageSourceId}`, label: `Open ${selectedOutcome.key} lineage` }]
      : []),
    ...selectedEpics
      .filter((epic) => epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId)
      .map((epic) => ({
        href: `/review?candidateId=${epic.lineageSourceId}`,
        label: `Open ${epic.key} lineage`
      })),
    ...selectedStories
      .filter((story) => story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId)
      .map((story) => ({
        href: `/review?candidateId=${story.lineageSourceId}`,
        label: `Open ${story.key} lineage`
      }))
  ];
  const firstVisibleStory = selectedStories[0] ?? null;
  const firstReadyStory = readyStories[0] ?? null;
  const firstMissingTestStory = missingTestStories[0] ?? null;
  const firstLineageTarget = lineageTargets[0] ?? null;

  return (
    <AppShell
      topbarProps={{
        projectName: session.organization.organizationName,
        sectionLabel: "Value Spine",
        badge: "Project section"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,246,252,0.92))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="space-y-6">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <Workflow className="h-3.5 w-3.5 text-primary" />
                Active project branch
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Project Value Spine</h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                This page stays inside the active project and its current Framing branch. It should feel like one guided path,
                not a set of competing branches.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                actionHref={firstVisibleStory ? `/stories/${firstVisibleStory.id}` : undefined}
                actionLabel={firstVisibleStory ? "Open first Story" : undefined}
                className="border-border/70 bg-background/90 text-foreground"
                count={selectedStories.length}
                description={`${selectedEpics.length} epic${selectedEpics.length === 1 ? "" : "s"} visible in the active Framing.`}
                label="Visible stories"
              />
              <StatCard
                actionHref={firstReadyStory ? `/stories/${firstReadyStory.id}` : undefined}
                actionLabel={firstReadyStory ? "Open ready Story" : undefined}
                className="border-emerald-200 bg-emerald-50/85 text-emerald-950"
                count={readyStories.length}
                description="Stories that can move forward into handoff or delivery."
                label="Ready for handoff"
              />
              <StatCard
                actionHref={firstLineageTarget?.href}
                actionLabel={firstLineageTarget?.label}
                className="border-sky-200 bg-sky-50/85 text-sky-950"
                count={lineageTargets.length}
                description="Imported items that still keep a direct review trail."
                label="Imported lineage"
              />
              <StatCard
                actionHref={firstMissingTestStory ? `/stories/${firstMissingTestStory.id}#story-handoff-inputs` : undefined}
                actionLabel={firstMissingTestStory ? "Fix next test gap" : undefined}
                className="border-amber-200 bg-amber-50/85 text-amber-950"
                count={missingTestStories.length}
                description="Stories that still miss a Test Definition."
                label="Missing tests"
              />
            </div>
          </div>
        </div>

        {!selectedOutcome ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No Framing is available in this project</CardTitle>
              <CardDescription>Start a clean case from Framing to create the first project branch.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))] shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Current Framing: {selectedOutcome.key}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {getOriginLabel(selectedOutcome.originType)}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatLabel(selectedOutcome.lifecycleState)}
                      </span>
                    </div>
                    <div>
                      <CardTitle>{selectedOutcome.title}</CardTitle>
                      <CardDescription className="mt-2 max-w-4xl">
                        {selectedOutcome.outcomeStatement ?? "Outcome statement is still missing."}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lifecycle filter</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant={viewFilter === "active" ? "default" : "secondary"}>
                        <Link href="/workspace?view=active">Active only</Link>
                      </Button>
                      <Button asChild variant={viewFilter === "archived" ? "default" : "secondary"}>
                        <Link href="/workspace?view=archived">Archived only</Link>
                      </Button>
                      <Button asChild variant={viewFilter === "all" ? "default" : "secondary"}>
                        <Link href="/workspace?view=all">All lifecycle states</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))] shadow-sm">
              <CardHeader>
                <CardTitle>Value Spine in current Framing</CardTitle>
                <CardDescription>
                  The branch is shown as one active path from Framing into Epics and Stories. Story progress is stacked so the next move is easier to scan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedOutcome.lifecycleState === "archived" ? (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                    This Framing branch is archived. Restore it from the Outcome page if you want it active again.
                  </div>
                ) : null}

                {selectedEpics.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                    No Epics are currently visible in this branch for the selected lifecycle filter.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedEpics.map((epic) => {
                      const visibleStories = epic.stories.filter((story) =>
                        viewFilter === "all" ? true : story.lifecycleState === viewFilter
                      );

                      return (
                        <div className="rounded-[28px] border border-border/70 bg-muted/15 p-4" key={epic.id}>
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  {epic.key}
                                </span>
                                <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  {formatLabel(epic.lifecycleState)}
                                </span>
                                <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  {getOriginLabel(epic.originType)}
                                </span>
                              </div>
                              <div>
                                <h2 className="text-lg font-semibold text-foreground">{epic.title}</h2>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                  {epic.scopeBoundary ?? epic.purpose}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId ? (
                                <Button asChild size="sm" variant="secondary">
                                  <Link href={`/review?candidateId=${epic.lineageSourceId}`}>
                                    <FileSearch className="mr-2 h-3.5 w-3.5" />
                                    Open lineage
                                  </Link>
                                </Button>
                              ) : null}
                              <Button asChild size="sm" variant="secondary">
                                <Link href={`/epics/${epic.id}`}>
                                  Open Epic
                                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3 border-l border-border/70 pl-4">
                            {visibleStories.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
                                No Stories are currently visible in this Epic for the selected lifecycle filter.
                              </div>
                            ) : (
                              visibleStories.map((story) => {
                                const storyUx = getStoryUxModel({
                                  id: story.id,
                                  key: story.key,
                                  status: story.status,
                                  lifecycleState: story.lifecycleState,
                                  testDefinition: story.testDefinition ?? null,
                                  acceptanceCriteria: story.acceptanceCriteria,
                                  definitionOfDone: story.definitionOfDone,
                                  tollgateStatus: null
                                });

                                return (
                                  <div className="rounded-2xl border border-border/70 bg-background p-4" key={story.id}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                          <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                                            {story.key}
                                          </span>
                                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStoryToneClasses(storyUx.tone)}`}>
                                            {storyUx.statusLabel}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold text-foreground">{story.title}</p>
                                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{storyUx.statusDetail}</p>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        {story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId ? (
                                          <Button asChild size="sm" variant="secondary">
                                            <Link href={`/review?candidateId=${story.lineageSourceId}`}>
                                              <FileSearch className="mr-2 h-3.5 w-3.5" />
                                              Open lineage
                                            </Link>
                                          </Button>
                                        ) : null}
                                        <Button asChild size="sm" variant="secondary">
                                          <Link href={`/stories/${story.id}`}>
                                            Open Story
                                            <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                          </Link>
                                        </Button>
                                      </div>
                                    </div>

                                    <ol className="mt-4 space-y-2">
                                      {storyUx.lifecycleSteps.map((step) => (
                                        <li
                                          className={`rounded-2xl border px-3 py-3 text-sm ${getLifecycleStepClasses(step.state)}`}
                                          key={step.key}
                                        >
                                          <div className="flex items-start gap-3">
                                            <LifecycleStepIcon state={step.state} />
                                            <div>
                                              <p className="font-medium text-foreground">{step.label}</p>
                                              <p className="mt-1 leading-6 text-muted-foreground">{step.description}</p>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ol>

                                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next step</p>
                                        <p className="mt-2 font-semibold text-foreground">{storyUx.nextActions[0]?.label ?? "Open Story"}</p>
                                        <p className="mt-2 leading-6 text-muted-foreground">
                                          {storyUx.nextActions[0]?.description ?? "Open the Story to continue delivery planning."}
                                        </p>
                                      </div>
                                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                                        <div className="flex items-start gap-3">
                                          <TestTube2 className="mt-0.5 h-4 w-4 text-primary" />
                                          <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Test branch</p>
                                            <p className="mt-2 font-semibold text-foreground">
                                              {story.testDefinition ? "Test Definition captured" : "Missing Test Definition"}
                                            </p>
                                            <p className="mt-2 leading-6 text-muted-foreground">
                                              {story.testDefinition ??
                                                "Add the test definition on the Story page so handoff can move forward cleanly."}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </AppShell>
  );
}
