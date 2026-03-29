import Link from "next/link";
import { ArrowRight, Workflow } from "lucide-react";
import { getValueSpineService } from "@aas-companion/api/spine";
import { Button, Card, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { withDevTiming } from "@/lib/dev-timing";

type WorkspacePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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
    void searchParams;
    const session = await requireActiveProjectSession();
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

    const selectedEpics = selectedOutcome?.epics.filter((epic) => epic.lifecycleState === "active") ?? [];
    const selectedDirectionSeeds = selectedEpics.flatMap((epic) =>
      (epic.directionSeeds ?? []).filter((seed) => seed.lifecycleState === "active")
    );
    const attentionSeeds = selectedDirectionSeeds.filter((seed) => !seed.shortDescription?.trim());
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
      ...selectedDirectionSeeds
        .filter((seed) => seed.lineageSourceType === "artifact_aas_candidate" && seed.lineageSourceId)
        .map((seed) => ({
          href: `/review?candidateId=${seed.lineageSourceId}`,
          label: `Open ${seed.key} lineage`
        }))
    ];
    const firstVisibleSeed = selectedDirectionSeeds[0] ?? null;
    const firstAttentionSeed = attentionSeeds[0] ?? null;
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
                actionHref={firstVisibleSeed ? `/epics/${firstVisibleSeed.epicId}#seed-${firstVisibleSeed.id}` : undefined}
                actionLabel={firstVisibleSeed ? "Open first seed" : undefined}
                className="border-border/70 bg-background/90 text-foreground"
                count={selectedDirectionSeeds.length}
                description={`${selectedEpics.length} epic${selectedEpics.length === 1 ? "" : "s"} visible in the active Framing.`}
                label="Visible seeds"
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
                actionHref={firstAttentionSeed ? `/epics/${firstAttentionSeed.epicId}#seed-${firstAttentionSeed.id}` : undefined}
                actionLabel={firstAttentionSeed ? "Open next attention seed" : undefined}
                className="border-amber-200 bg-amber-50/85 text-amber-950"
                count={attentionSeeds.length}
                description="Direction seeds that still need clearer framing before the branch feels clear."
                label="Needs attention"
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
            {selectedOutcome.lifecycleState === "archived" ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                This Framing branch is archived. Restore it from the Outcome page if you want it active again.
              </div>
            ) : null}

            <FramingValueSpineTree
              description="The active branch is listed from Framing into Epics and Direction Seeds using the same framing model shown elsewhere."
              emptyEpicMessage="No active Epics are currently visible in this branch."
              emptyStoryMessage="No active Direction Seeds are currently visible in this Epic."
              mode="framing"
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
                directionSeeds: (epic.directionSeeds ?? [])
                  .filter((seed) => seed.lifecycleState === "active")
                  .map((seed) => ({
                    id: seed.id,
                    key: seed.key,
                    title: seed.title,
                    href: `/epics/${epic.id}#seed-${seed.id}`,
                    isCurrent: false,
                    shortDescription: seed.shortDescription ?? null,
                    expectedBehavior: seed.expectedBehavior ?? null,
                    sourceStoryId: seed.sourceStoryId ?? null,
                    originType: seed.originType,
                    lifecycleState: seed.lifecycleState,
                    importedReadinessState: seed.importedReadinessState ?? null,
                    lineageHref:
                      seed.lineageSourceType === "artifact_aas_candidate" && seed.lineageSourceId
                        ? `/review?candidateId=${seed.lineageSourceId}`
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
              title="Project Value Spine"
            />
          </>
        )}
      </section>
      </AppShell>
    );
  });
}
