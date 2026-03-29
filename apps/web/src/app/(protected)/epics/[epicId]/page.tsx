import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, GitBranch } from "lucide-react";
import { getEpicWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { FramingContextCard } from "@/components/workspace/framing-context-card";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { requireOrganizationContext } from "@/lib/auth/guards";
import {
  archiveEpicAction,
  createDirectionSeedFromEpicAction,
  hardDeleteEpicAction,
  restoreEpicAction,
  saveDirectionSeedAction,
  saveEpicWorkspaceAction
} from "./actions";

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
  const saveState = getParamValue(query.save);
  const lifecycleState = getParamValue(query.lifecycle);
  const message = getParamValue(query.message);
  const epicResult = await getEpicWorkspaceService(organization.organizationId, epicId);

  if (!epicResult.ok || !epicResult.data) {
    notFound();
  }

  const { epic, activities, removal } = epicResult.data;
  const originLabel = getOriginLabel(epic.originType);
  const workspaceLabel = getWorkspaceLabel(epic);
  const statusLabel = epic.status.replaceAll("_", " ");
  const isArchived = epic.lifecycleState === "archived";

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Epic",
        badge: epic.key
      }}
    >
      <section className="space-y-6">
        {created ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Native Epic created and ready for direction seeding.
          </div>
        ) : null}
        {saveState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Epic changes were saved successfully.
          </div>
        ) : null}
        {lifecycleState === "archived" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Epic archived. It is now removed from active working views but remains traceable.
          </div>
        ) : null}
        {lifecycleState === "restored" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Epic restored to active work.
          </div>
        ) : null}
        {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div> : null}
        {isArchived ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            This Epic is archived and currently read-only. Restore it to continue active design work.
          </div>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{epic.title}</CardTitle>
            <CardDescription>
              {epic.key} in {organization.organizationName}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Origin</p>
              <p className="mt-2 text-lg font-semibold">{originLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project mode</p>
              <p className="mt-2 text-lg font-semibold">{workspaceLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
              <p className="mt-2 text-lg font-semibold capitalize">{statusLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lifecycle</p>
              <p className="mt-2 text-lg font-semibold capitalize">{epic.lifecycleState}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Outcome</p>
              <p className="mt-2 text-lg font-semibold">{epic.outcome.key}</p>
            </div>
          </CardContent>
        </Card>

        <FramingContextCard
          epic={{
            id: epic.id,
            key: epic.key,
            title: epic.title,
            href: `/epics/${epic.id}`
          }}
          outcome={{
            id: epic.outcome.id,
            key: epic.outcome.key,
            title: epic.outcome.title,
            href: `/framing?outcomeId=${epic.outcomeId}`
          }}
          summary="This Epic remains inside one active Framing. Only direction seeds linked to this Epic and its parent Outcome are shown in this authoring view."
        />

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <FramingValueSpineTree
              emptyEpicMessage="This view is already scoped to one Epic, so no sibling Framing branches are shown here."
              emptyStoryMessage={
                isArchived
                  ? "Restore the Epic before resuming direction seeding in this branch."
                  : "Create the first native direction seed here. Empty branches stay empty until you add scoped child work."
              }
              mode="framing"
              epics={[
                {
                  id: epic.id,
                  key: epic.key,
                  title: epic.title,
                  href: `/epics/${epic.id}`,
                  isCurrent: true,
                  scopeBoundary: epic.scopeBoundary ?? null,
                  purpose: epic.purpose ?? null,
                  originType: epic.originType,
                  lifecycleState: epic.lifecycleState,
                  importedReadinessState: epic.importedReadinessState ?? null,
                  lineageHref:
                    epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId
                      ? `/review?candidateId=${epic.lineageSourceId}`
                      : null,
                  directionSeeds: epic.directionSeeds.map((seed) => ({
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
                }
              ]}
              outcome={{
                id: epic.outcome.id,
                key: epic.outcome.key,
                title: epic.outcome.title,
                href: `/framing?outcomeId=${epic.outcomeId}`,
                isCurrent: false,
                statement: epic.outcome.outcomeStatement ?? null,
                originType: epic.outcome.originType,
                lifecycleState: epic.outcome.lifecycleState,
                importedReadinessState: epic.outcome.importedReadinessState ?? null,
                lineageHref:
                  epic.outcome.lineageSourceType === "artifact_aas_candidate" && epic.outcome.lineageSourceId
                    ? `/review?candidateId=${epic.outcome.lineageSourceId}`
                    : null
              }}
            />

            <form action={saveEpicWorkspaceAction} className="space-y-6">
              <input name="epicId" type="hidden" value={epic.id} />
              <input name="outcomeId" type="hidden" value={epic.outcomeId} />
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Epic definition</CardTitle>
                  <CardDescription>Keep Epic focused on purpose, scope boundary and any local risk note.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={epic.title}
                      disabled={isArchived}
                      name="title"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Purpose</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={epic.purpose}
                      disabled={isArchived}
                      name="purpose"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Scope boundary</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={epic.scopeBoundary ?? ""}
                      disabled={isArchived}
                      name="scopeBoundary"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Risk note</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                      defaultValue={epic.riskNote ?? ""}
                      disabled={isArchived}
                      name="riskNote"
                    />
                  </label>
                </CardContent>
              </Card>

              {!isArchived ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <PendingFormButton
                    className="gap-2"
                    icon={<ArrowRight className="h-4 w-4" />}
                    label="Save Epic changes"
                    pendingLabel="Saving Epic..."
                  />
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href={`/framing?outcomeId=${epic.outcomeId}`}>
                      Back to current Framing
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button asChild className="gap-2" variant="secondary">
                  <Link href={`/framing?outcomeId=${epic.outcomeId}`}>
                    Back to current Framing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </form>

                <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Direction seeds</CardTitle>
                    <CardDescription>Create lightweight direction seeds directly from this Epic without introducing delivery workflow.</CardDescription>
                  </div>
                  {!isArchived ? (
                    <form action={createDirectionSeedFromEpicAction}>
                      <input name="epicId" type="hidden" value={epic.id} />
                      <input name="outcomeId" type="hidden" value={epic.outcomeId} />
                      <PendingFormButton
                        className="gap-2"
                        icon={<ArrowRight className="h-4 w-4" />}
                        label="Create Direction Seed"
                        pendingLabel="Creating Direction Seed..."
                      />
                    </form>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {epic.directionSeeds.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">No direction seeds exist for this Epic yet.</p>
                    <p className="mt-2">
                      {isArchived
                        ? "Restore the Epic before resuming direction seeding."
                        : "Start the first native direction seed here. Keep it directional and lightweight."}
                    </p>
                  </div>
                ) : (
                  epic.directionSeeds.map((seed) => (
                    <form action={saveDirectionSeedAction} className="rounded-2xl border border-border/70 bg-background p-4" id={`seed-${seed.id}`} key={seed.id}>
                      <input name="epicId" type="hidden" value={epic.id} />
                      <input name="outcomeId" type="hidden" value={epic.outcomeId} />
                      <input name="seedId" type="hidden" value={seed.id} />
                      <div className="grid gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{seed.key}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {seed.sourceStoryId ? `Migrated from Story ${seed.sourceStoryId}` : "Native framing seed"}
                            </p>
                          </div>
                          <PendingFormButton
                            className="gap-2"
                            icon={<ArrowRight className="h-4 w-4" />}
                            label="Save Seed"
                            pendingLabel="Saving Seed..."
                          />
                        </div>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Seed title</span>
                          <input
                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                            defaultValue={seed.title}
                            disabled={isArchived}
                            name="title"
                            type="text"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Short description</span>
                          <textarea
                            className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                            defaultValue={seed.shortDescription ?? ""}
                            disabled={isArchived}
                            name="shortDescription"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Expected behavior</span>
                          <textarea
                            className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                            defaultValue={seed.expectedBehavior ?? ""}
                            disabled={isArchived}
                            name="expectedBehavior"
                          />
                        </label>
                      </div>
                    </form>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                <CardTitle>Clean project scope</CardTitle>
                <CardDescription>Only the current Outcome, this Epic, and its direction seeds are surfaced here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>No Demo Epics or delivery Stories are shown in this context unless you opened Demo explicitly.</p>
                <p>{isArchived ? "Restore the Epic to continue native work from here." : "Use Create Direction Seed to continue framing work natively from this Epic."}</p>
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

            <GovernedLifecycleCard
              archiveAction={archiveEpicAction}
              decision={removal?.decision ?? null}
              entityId={epic.id}
              entityLabel="Epic"
              hardDeleteAction={hardDeleteEpicAction}
              hiddenFields={[{ name: "outcomeId", value: epic.outcomeId }]}
              restoreAction={restoreEpicAction}
            />

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
