import Link from "next/link";
import { ArrowRight, GitBranch, Workflow } from "lucide-react";
import { getStoryHandoffReadiness } from "@aas-companion/domain";
import { getValueSpineService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { requireActiveProjectSession } from "@/lib/auth/guards";

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

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const session = await requireActiveProjectSession();
  const query = searchParams ? await searchParams : {};
  const viewFilter = getParamValue(query.view) ?? "active";
  const framingId = getParamValue(query.framing);
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
    orderedOutcomes.find((outcome) => outcome.id === framingId) ??
    orderedOutcomes.find((outcome) => outcome.lifecycleState === "active") ??
    orderedOutcomes[0] ??
    null;

  const selectedEpics =
    selectedOutcome?.epics.filter((epic) => (viewFilter === "all" ? true : epic.lifecycleState === viewFilter)) ?? [];
  const selectedStories = selectedEpics.flatMap((epic) =>
    epic.stories.filter((story) => (viewFilter === "all" ? true : story.lifecycleState === viewFilter))
  );
  const readyStoryCount = selectedStories.filter((story) => getStoryHandoffReadiness(story).state === "ready").length;
  const lineageCount =
    selectedEpics.filter((epic) => epic.lineageSourceType === "artifact_aas_candidate").length +
    selectedStories.filter((story) => story.lineageSourceType === "artifact_aas_candidate").length;
  const missingTestCount = selectedStories.filter((story) => !story.testDefinition).length;

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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <Workflow className="h-3.5 w-3.5 text-primary" />
                One active Framing branch
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Project Value Spine</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                This view stays inside the current project and one Framing case at a time. Related Epics, Stories, readiness,
                lineage, and lifecycle state remain scoped to the selected branch instead of falling back to unrelated work.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-2">
              <div className="rounded-3xl border border-border/70 bg-background/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Visible epics</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{selectedEpics.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Scoped to the selected branch and filter.</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Ready stories</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950">{readyStoryCount}</p>
                <p className="mt-2 text-sm text-emerald-900/80">Can move toward build handoff.</p>
              </div>
              <div className="rounded-3xl border border-sky-200 bg-sky-50/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Review lineage</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-sky-950">{lineageCount}</p>
                <p className="mt-2 text-sm text-sky-900/80">Imported items still linked back to review.</p>
              </div>
              <div className="rounded-3xl border border-amber-200 bg-amber-50/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Missing tests</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-950">{missingTestCount}</p>
                <p className="mt-2 text-sm text-amber-900/80">Stories still missing test definition.</p>
              </div>
            </div>
          </div>
        </div>

        {selectedOutcome ? (
          <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))] shadow-sm">
            <CardHeader>
              <CardTitle>Project context</CardTitle>
              <CardDescription>
                {session.organization.organizationName} currently works through one visible Framing branch at a time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
                <div className="rounded-3xl border border-border/70 bg-background/90 p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Active Framing: {selectedOutcome.key}
                    </span>
                    <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {getOriginLabel(selectedOutcome.originType)}
                    </span>
                    <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {formatLabel(selectedOutcome.lifecycleState)}
                    </span>
                    {selectedOutcome.importedReadinessState ? (
                      <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                        {formatLabel(selectedOutcome.importedReadinessState)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Only objects attached to <strong className="text-foreground">{selectedOutcome.title}</strong> are shown in
                    this project view.
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-muted/15 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current branch</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">{selectedOutcome.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {selectedOutcome.outcomeStatement ?? "Outcome statement is still missing."}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Switch branch</p>
                  <div className="-mx-1 overflow-x-auto pb-1">
                    <div className="flex min-w-max gap-2 px-1">
                      {orderedOutcomes.map((outcome) => (
                        <Button
                          asChild
                          key={outcome.id}
                          variant={selectedOutcome?.id === outcome.id ? "default" : "secondary"}
                        >
                          <Link href={`/workspace?framing=${outcome.id}&view=${viewFilter}`}>
                            {outcome.key} - {outcome.title}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button asChild variant="secondary">
                  <Link href={`/outcomes/${selectedOutcome.id}`}>
                    Open Outcome
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lifecycle filter</p>
                <div className="-mx-1 overflow-x-auto pb-1">
                  <div className="flex min-w-max gap-2 px-1">
                    <Button asChild variant={viewFilter === "active" ? "default" : "secondary"}>
                      <Link href={`/workspace?framing=${selectedOutcome?.id ?? ""}&view=active`}>Active only</Link>
                    </Button>
                    <Button asChild variant={viewFilter === "archived" ? "default" : "secondary"}>
                      <Link href={`/workspace?framing=${selectedOutcome?.id ?? ""}&view=archived`}>Archived only</Link>
                    </Button>
                    <Button asChild variant={viewFilter === "all" ? "default" : "secondary"}>
                      <Link href={`/workspace?framing=${selectedOutcome?.id ?? ""}&view=all`}>All lifecycle states</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!selectedOutcome ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No Framing cases are available in this project</CardTitle>
              <CardDescription>Start a clean case from Framing to create the first project branch.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))] shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-3">
                    <span>{selectedOutcome.key}</span>
                    <span>{selectedOutcome.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedOutcome.outcomeStatement ?? "Outcome statement is still missing."}
                  </CardDescription>
                </div>
                <Button asChild variant="secondary">
                  <Link href={`/outcomes/${selectedOutcome.id}`}>
                    Open Outcome
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
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
                <div className="grid gap-4 2xl:grid-cols-2">
                  {selectedEpics.map((epic) => {
                    const visibleStories = epic.stories.filter((story) =>
                      viewFilter === "all" ? true : story.lifecycleState === viewFilter
                    );

                    return (
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={epic.id}>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{epic.key}</p>
                            <h2 className="mt-2 text-lg font-semibold text-foreground">{epic.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{epic.summary ?? epic.purpose}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {getOriginLabel(epic.originType)}
                            </span>
                            <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {formatLabel(epic.lifecycleState)}
                            </span>
                            {epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId ? (
                              <Button asChild size="sm" variant="secondary">
                                <Link href={`/review?candidateId=${epic.lineageSourceId}`}>Open review lineage</Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 xl:grid-cols-2">
                          {visibleStories.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
                              No Stories are currently visible in this Epic for the selected lifecycle filter.
                            </div>
                          ) : (
                            visibleStories.map((story) => {
                              const readiness = getStoryHandoffReadiness(story);

                              return (
                                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={story.id}>
                                  <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                      <p className="font-semibold text-foreground">{story.key}</p>
                                      <p className="mt-1 text-sm text-muted-foreground">{story.title}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        {getOriginLabel(story.originType)}
                                      </span>
                                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        {formatLabel(story.lifecycleState)}
                                      </span>
                                      <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                          readiness.state === "ready"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                            : "border-amber-200 bg-amber-50 text-amber-800"
                                        }`}
                                      >
                                        {readiness.state === "ready" ? "Ready for build" : formatLabel(readiness.state)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    {story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId ? (
                                      <Button asChild size="sm" variant="secondary">
                                        <Link href={`/review?candidateId=${story.lineageSourceId}`}>
                                          <GitBranch className="mr-2 h-3.5 w-3.5" />
                                          Open review lineage
                                        </Link>
                                      </Button>
                                    ) : null}
                                    {story.testDefinition ? null : (
                                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">
                                        Missing Test Definition
                                      </span>
                                    )}
                                    {story.acceptanceCriteria.length === 0 ? (
                                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">
                                        Missing acceptance criteria
                                      </span>
                                    ) : null}
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
        )}
      </section>
    </AppShell>
  );
}
