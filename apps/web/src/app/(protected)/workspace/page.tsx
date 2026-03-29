import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";
import { getValueSpineService } from "@aas-companion/api/spine";
import { Button, Card, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { withDevTiming } from "@/lib/dev-timing";
import { getStoryUxModel } from "@/lib/workspace/story-ux";

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
  return withDevTiming("web.page.workspace", async () => {
    const [session, query] = await Promise.all([
      requireActiveProjectSession(),
      searchParams ? searchParams : Promise.resolve<Record<string, string | string[] | undefined>>({})
    ]);
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
        tollgateStatus: story.tollgateStatus ?? null
      }).isReadyForHandoff
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
                description="Stories that have been approved and can move forward into design."
                label="Ready for design"
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
                  <div className="space-y-2">
                    <CardTitle>Lifecycle view</CardTitle>
                    <CardDescription>
                      The selected Framing branch is already shown in the backlog below. Use the filter here to decide which lifecycle states to include.
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {selectedOutcome.key}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {getOriginLabel(selectedOutcome.originType)}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatLabel(selectedOutcome.lifecycleState)}
                      </span>
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

            {selectedOutcome.lifecycleState === "archived" ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                This Framing branch is archived. Restore it from the Outcome page if you want it active again.
              </div>
            ) : null}

            <FramingValueSpineTree
              description="The active branch is listed like one backlog from Framing into Epics and Stories."
              emptyEpicMessage="No Epics are currently visible in this branch for the selected lifecycle filter."
              emptyStoryMessage="No Stories are currently visible in this Epic for the selected lifecycle filter."
              epics={selectedEpics.map((epic) => ({
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
                stories: epic.stories
                  .filter((story) => (viewFilter === "all" ? true : story.lifecycleState === viewFilter))
                  .map((story) => ({
                    id: story.id,
                    key: story.key,
                    title: story.title,
                    href: `/stories/${story.id}`,
                    isCurrent: false,
                    testDefinition: story.testDefinition ?? null,
                    acceptanceCriteria: story.acceptanceCriteria,
                    definitionOfDone: story.definitionOfDone,
                    status: story.status,
                    originType: story.originType,
                    lifecycleState: story.lifecycleState,
                    tollgateStatus: story.tollgateStatus ?? null,
                    pendingActionCount: story.pendingActionCount ?? 0,
                    blockedActionCount: story.blockedActionCount ?? 0,
                    importedReadinessState: story.importedReadinessState ?? null,
                    lineageHref:
                      story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId
                        ? `/review?candidateId=${story.lineageSourceId}`
                        : null
                  }))
              }))}
              outcome={{
                id: selectedOutcome.id,
                key: selectedOutcome.key,
                title: selectedOutcome.title,
                href: `/outcomes/${selectedOutcome.id}`,
                isCurrent: true,
                statement: selectedOutcome.outcomeStatement ?? null,
                originType: selectedOutcome.originType,
                lifecycleState: selectedOutcome.lifecycleState,
                importedReadinessState: selectedOutcome.importedReadinessState ?? null,
                lineageHref:
                  selectedOutcome.lineageSourceType === "artifact_aas_candidate" && selectedOutcome.lineageSourceId
                    ? `/review?candidateId=${selectedOutcome.lineageSourceId}`
                    : null
              }}
              title="Project Value Spine backlog"
            />
          </>
        )}
      </section>
      </AppShell>
    );
  });
}
