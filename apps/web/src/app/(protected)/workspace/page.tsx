import Link from "next/link";
import { GitBranch, ShieldCheck, Workflow } from "lucide-react";
import { getStoryHandoffReadiness } from "@aas-companion/domain";
import { getValueSpineService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { requireProtectedSession } from "@/lib/auth/guards";

type WorkspacePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const session = await requireProtectedSession();
  const query = searchParams ? await searchParams : {};
  const originFilter = getParamValue(query.origin) ?? "all";
  const viewFilter = getParamValue(query.view) ?? "active";
  const snapshot = await getValueSpineService(session.organization.organizationId);

  if (!snapshot.ok) {
    return (
      <AppShell>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Value Spine unavailable</CardTitle>
            <CardDescription>{snapshot.errors[0]?.message ?? "The Value Spine could not be loaded."}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  const outcomes = snapshot.data.organization.outcomes
    .filter((outcome) => {
      if (originFilter === "imported" && outcome.originType !== "imported") {
        return false;
      }

      if (originFilter === "native" && outcome.originType === "imported") {
        return false;
      }

      if (viewFilter === "active" && outcome.lifecycleState !== "active") {
        return false;
      }

      if (viewFilter === "archived" && outcome.lifecycleState !== "archived") {
        return false;
      }

      return true;
    })
    .map((outcome) => ({
      ...outcome,
      epics: outcome.epics.filter((epic) => (viewFilter === "all" ? true : epic.lifecycleState === outcome.lifecycleState))
    }));

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Value Spine",
        badge: "Patch M1-019 to M1-023"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,246,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Workflow className="h-3.5 w-3.5 text-primary" />
            Shared governed view
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Value Spine and readiness view</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Inspect Outcomes, Epics, and Stories in one shared governed model, with imported origin markers, lifecycle
            state, archive-aware filtering, readiness state badges, missing-link signals, and direct lineage back to Human
            Review when an object came from import.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant={originFilter === "all" ? "default" : "secondary"}>
            <Link href={`/workspace?view=${viewFilter}`}>All objects</Link>
          </Button>
          <Button asChild variant={originFilter === "imported" ? "default" : "secondary"}>
            <Link href={`/workspace?origin=imported&view=${viewFilter}`}>Imported only</Link>
          </Button>
          <Button asChild variant={originFilter === "native" ? "default" : "secondary"}>
            <Link href={`/workspace?origin=native&view=${viewFilter}`}>Native and seeded</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant={viewFilter === "active" ? "default" : "secondary"}>
            <Link href={`/workspace?origin=${originFilter}&view=active`}>Active view</Link>
          </Button>
          <Button asChild variant={viewFilter === "archived" ? "default" : "secondary"}>
            <Link href={`/workspace?origin=${originFilter}&view=archived`}>Archived view</Link>
          </Button>
          <Button asChild variant={viewFilter === "all" ? "default" : "secondary"}>
            <Link href={`/workspace?origin=${originFilter}&view=all`}>All lifecycle states</Link>
          </Button>
        </div>

        {outcomes.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No Value Spine objects match this filter</CardTitle>
              <CardDescription>Try another lifecycle or origin filter to inspect governed work.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-5">
            {outcomes.map((outcome) => (
              <Card className="border-border/70 shadow-sm" key={outcome.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-3">
                        <span>{outcome.key}</span>
                        <span>{outcome.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {outcome.outcomeStatement ?? "Outcome statement is still missing."}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatLabel(outcome.originType)}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatLabel(outcome.lifecycleState)}
                      </span>
                      {outcome.importedReadinessState ? (
                        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                          {formatLabel(outcome.importedReadinessState)}
                        </span>
                      ) : null}
                      {outcome.lineageSourceType === "artifact_aas_candidate" && outcome.lineageSourceId ? (
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/review?candidateId=${outcome.lineageSourceId}`}>
                            <GitBranch className="mr-2 h-3.5 w-3.5" />
                            Open lineage
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {outcome.lifecycleState === "archived" ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                      Archived outcome. Open its workspace to inspect details or restore it.
                    </div>
                  ) : null}
                  {outcome.epics.length === 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                      Outcome → Epic linkage is still missing for this Value Spine branch.
                    </div>
                  ) : null}

                  <div className="grid gap-4">
                    {outcome.epics.map((epic) => (
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={epic.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{epic.key}</p>
                            <h2 className="mt-2 text-lg font-semibold text-foreground">{epic.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{epic.summary ?? epic.purpose}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {formatLabel(epic.originType)}
                            </span>
                            <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {formatLabel(epic.lifecycleState)}
                            </span>
                            {epic.importedReadinessState ? (
                              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                                {formatLabel(epic.importedReadinessState)}
                              </span>
                            ) : null}
                            {epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId ? (
                              <Button asChild size="sm" variant="secondary">
                                <Link href={`/review?candidateId=${epic.lineageSourceId}`}>Lineage</Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                          {epic.stories.filter((story) => (viewFilter === "all" ? true : story.lifecycleState === epic.lifecycleState)).length ===
                          0 ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                              Epic → Story linkage is still missing for this branch.
                            </div>
                          ) : null}

                          {epic.stories
                            .filter((story) => (viewFilter === "all" ? true : story.lifecycleState === epic.lifecycleState))
                            .map((story) => {
                              const readiness = getStoryHandoffReadiness(story);

                              return (
                                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={story.id}>
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">{story.key}</p>
                                      <p className="mt-1 text-sm text-muted-foreground">{story.title}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        {formatLabel(story.originType)}
                                      </span>
                                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        {formatLabel(story.lifecycleState)}
                                      </span>
                                      {story.importedReadinessState ? (
                                        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                                          {formatLabel(story.importedReadinessState)}
                                        </span>
                                      ) : null}
                                      <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                          readiness.state === "ready"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                            : "border-amber-200 bg-amber-50 text-amber-800"
                                        }`}
                                      >
                                        {readiness.state === "ready" ? "handoff ready" : formatLabel(readiness.state)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    {story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId ? (
                                      <Button asChild size="sm" variant="secondary">
                                        <Link href={`/review?candidateId=${story.lineageSourceId}`}>Trace to import</Link>
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
                            })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button asChild variant="secondary">
                      <Link href={`/outcomes/${outcome.id}`}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Open Outcome Workspace
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
