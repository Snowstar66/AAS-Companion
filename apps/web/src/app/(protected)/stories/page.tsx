import Link from "next/link";
import { ArrowRight, CircleAlert, CircleCheckBig, LibraryBig } from "lucide-react";
import { getStoryReadinessBlockers } from "@aas-companion/domain";
import { listStoriesService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { requireOrganizationContext } from "@/lib/auth/guards";

type StoriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const organization = await requireOrganizationContext();
  const query = searchParams ? await searchParams : {};
  const readinessFilter = getParamValue(query.state) ?? "all";
  const missingTestsOnly = getParamValue(query.missingTests) === "1";
  const storiesResult = await listStoriesService(organization.organizationId);

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Stories",
        badge: "Story M1-007"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <LibraryBig className="h-3.5 w-3.5 text-primary" />
            Story page index
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Story readiness overview</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Open a Story to complete required AAS fields, remove readiness blockers, and prepare build handoff.
          </p>
        </div>

        {!storiesResult.ok || storiesResult.data.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No stories available</CardTitle>
              <CardDescription>Seed or create stories before using the Story pages.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4">
            {storiesResult.data
              .filter((story) => {
                const blockers = getStoryReadinessBlockers(story);
                const ready = blockers.length === 0;

                if (readinessFilter === "ready" && !ready) {
                  return false;
                }

                if (readinessFilter === "blocked" && ready) {
                  return false;
                }

                if (missingTestsOnly && story.testDefinition) {
                  return false;
                }

                return true;
              })
              .map((story) => {
              const blockers = getStoryReadinessBlockers(story);
              const ready = blockers.length === 0;
              const imported = story.originType === "imported";

              return (
                <Card className="border-border/70 shadow-sm" key={story.id}>
                  <CardContent className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {story.key}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                            ready
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-amber-200 bg-amber-50 text-amber-900"
                          }`}
                        >
                          {ready ? <CircleCheckBig className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
                          {ready ? "Ready" : "Blocked"}
                        </span>
                        {imported ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
                            Imported
                          </span>
                        ) : null}
                        {story.importedReadinessState ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
                            {story.importedReadinessState.replaceAll("_", " ")}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">{story.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {ready ? "Execution Contract preview is available." : blockers.join(" ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="gap-2" variant="secondary">
                        <Link href={`/stories/${story.id}`}>
                          Open Story
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild className="gap-2">
                        <Link href={`/handoff/${story.id}`}>
                          Open Handoff
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
