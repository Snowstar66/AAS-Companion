import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Workflow } from "lucide-react";
import { getValueSpineService } from "@aas-companion/api/spine";
import { Button, Card, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { withDevTiming } from "@/lib/dev-timing";
import { isLikelyDeliveryStory } from "@/lib/framing/story-idea-delivery-feedback";
import { isStoryIdeaReadyForFraming } from "@/lib/framing/story-idea-status";

type WorkspacePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AppLanguage = "en" | "sv";

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
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
    void searchParams;
    const language = await getServerLanguage();
    const session = await requireActiveProjectSession();
    const snapshot = await getValueSpineService(session.organization.organizationId);

    if (!snapshot.ok) {
      return (
        <AppShell>
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Value Spine is unavailable", "Value Spine ar inte tillganglig")}</CardTitle>
              <CardDescription>{snapshot.errors[0]?.message ?? t(language, "The project spine could not be loaded.", "Projektets spine kunde inte laddas.")}</CardDescription>
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
    const selectedLegacyStoryIdeas = selectedEpics.flatMap((epic) => {
      const mappedSourceStoryIds = new Set((epic.directionSeeds ?? []).map((seed) => seed.sourceStoryId).filter(Boolean));
      const hasExplicitStoryIdeas = (epic.directionSeeds ?? []).length > 0;

      return (epic.stories ?? [])
        .filter(
          (story) =>
            story.lifecycleState === "active" &&
            !story.sourceDirectionSeedId &&
            (!hasExplicitStoryIdeas
              ? story.status === "draft" || story.status === "definition_blocked" || !isLikelyDeliveryStory(story, mappedSourceStoryIds)
              : !isLikelyDeliveryStory(story, mappedSourceStoryIds))
        )
        .map((story) => ({
          ...story,
          epicId: epic.id
        }));
    });
    const selectedStoryIdeas = [
      ...selectedDirectionSeeds.map((seed) => ({
        id: seed.id,
        epicId: seed.epicId,
        href: `/story-ideas/${seed.id}`,
        ready: isStoryIdeaReadyForFraming({
          shortDescription: seed.shortDescription,
          expectedBehavior: seed.expectedBehavior
        })
      })),
      ...selectedLegacyStoryIdeas.map((story) => ({
        id: story.id,
        epicId: story.epicId,
        href: `/story-ideas/${story.id}`,
        ready: isStoryIdeaReadyForFraming({
          valueIntent: story.valueIntent,
          expectedBehavior: story.expectedBehavior
        })
      }))
    ];
    const readyStoryIdeas = selectedStoryIdeas.filter((idea) => idea.ready);
    const attentionStoryIdeas = selectedStoryIdeas.filter((idea) => !idea.ready);
    const lineageTargets = [
      ...(selectedOutcome?.lineageSourceType === "artifact_aas_candidate" && selectedOutcome.lineageSourceId
        ? [{ href: `/intake?candidateId=${selectedOutcome.lineageSourceId}`, label: t(language, `Show ${selectedOutcome.key} origin`, `Visa ursprung för ${selectedOutcome.key}`) }]
        : []),
      ...selectedEpics
        .filter((epic) => epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId)
        .map((epic) => ({
          href: `/intake?candidateId=${epic.lineageSourceId}`,
          label: t(language, `Show ${epic.key} origin`, `Visa ursprung för ${epic.key}`)
        })),
      ...selectedDirectionSeeds
        .filter((seed) => seed.lineageSourceType === "artifact_aas_candidate" && seed.lineageSourceId)
        .map((seed) => ({
          href: `/intake?candidateId=${seed.lineageSourceId}`,
          label: t(language, `Show ${seed.key} origin`, `Visa ursprung för ${seed.key}`)
        })),
      ...selectedLegacyStoryIdeas
        .filter((story) => story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId)
        .map((story) => ({
          href: `/intake?candidateId=${story.lineageSourceId}`,
          label: t(language, `Show ${story.key} origin`, `Visa ursprung för ${story.key}`)
        }))
    ];
    const firstVisibleStoryIdea = selectedStoryIdeas[0] ?? null;
    const firstAttentionStoryIdea = attentionStoryIdeas[0] ?? null;
    const firstReadyStoryIdea = readyStoryIdeas[0] ?? null;
    const firstLineageTarget = lineageTargets[0] ?? null;

    return (
      <AppShell
        topbarProps={{
          projectName: session.organization.organizationName,
          sectionLabel: t(language, "Value Spine", "Value Spine"),
          badge: t(language, "Project section", "Projektsektion")
        }}
      >
        <section className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,246,252,0.92))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="space-y-6">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <Workflow className="h-3.5 w-3.5 text-primary" />
                  {t(language, "Active project branch", "Aktiv projektgren")}
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight">{t(language, "Project Value Spine", "Projektets Value Spine")}</h1>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {t(language, "This page stays inside the active project and its current Framing branch. It should feel like one guided path, not a set of competing branches.", "Den har sidan stannar inom det aktiva projektet och dess nuvarande Framing-gren. Den ska kannas som en guidad vag, inte som flera konkurrerande grenar.")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  actionHref={firstVisibleStoryIdea?.href}
                  actionLabel={firstVisibleStoryIdea ? t(language, "Open first Story Idea", "Oppna forsta Story Idea") : undefined}
                  className="border-border/70 bg-background/90 text-foreground"
                  count={selectedStoryIdeas.length}
                  description={t(language, `${selectedEpics.length} epic${selectedEpics.length === 1 ? "" : "s"} visible in the active Framing.`, `${selectedEpics.length} epic${selectedEpics.length === 1 ? "" : "s"} synliga i aktiv Framing.`)}
                  label={t(language, "Visible Story Ideas", "Synliga Story Ideas")}
                />
                <StatCard
                  actionHref={firstLineageTarget?.href}
                  actionLabel={firstLineageTarget?.label}
                  className="border-sky-200 bg-sky-50/85 text-sky-950"
                  count={lineageTargets.length}
                  description={t(language, "Imported items that still keep a direct review trail.", "Importerade objekt som fortfarande har ett direkt review-spar.")}
                  label={t(language, "Imported lineage", "Importerad lineage")}
                />
                <StatCard
                  actionHref={firstReadyStoryIdea?.href}
                  actionLabel={firstReadyStoryIdea ? t(language, "Open framing-ready idea", "Oppna framingredo ide") : undefined}
                  className="border-emerald-200 bg-emerald-50/85 text-emerald-950"
                  count={readyStoryIdeas.length}
                  description={t(language, "Story Ideas that already have both value intent and expected behavior.", "Story Ideas som redan har bade value intent och expected behavior.")}
                  label={t(language, "Ready for review", "Redo for granskning")}
                />
                <StatCard
                  actionHref={firstAttentionStoryIdea?.href}
                  actionLabel={firstAttentionStoryIdea ? t(language, "Open next Story Idea", "Oppna nasta Story Idea") : undefined}
                  className="border-amber-200 bg-amber-50/85 text-amber-950"
                  count={attentionStoryIdeas.length}
                  description={t(language, "Story Ideas that still need clearer framing before the branch feels clear.", "Story Ideas som fortfarande behover tydligare framing innan grenen kanns klar.")}
                  label={t(language, "Needs attention", "Behover uppmarksamhet")}
                />
              </div>
            </div>
          </div>

          {!selectedOutcome ? (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{t(language, "No Framing is available in this project", "Ingen Framing finns i detta projekt")}</CardTitle>
                <CardDescription>{t(language, "Start a clean case from Framing to create the first project branch.", "Starta ett rent case fran Framing for att skapa den forsta projektgrenen.")}</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              {selectedOutcome.lifecycleState === "archived" ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                  {t(language, "This Framing branch is archived. Restore it from the Outcome page if you want it active again.", "Den har Framing-grenen ar arkiverad. Aterstall den fran Outcome-sidan om du vill gora den aktiv igen.")}
                </div>
              ) : null}

              <FramingValueSpineTree
                description={t(language, "The active branch is listed from Framing into Epics and Story Ideas using the same framing model shown elsewhere.", "Den aktiva grenen visas fran Framing till Epics och Story Ideas med samma framingmodell som pa andra stallen.")}
                emptyEpicMessage={t(language, "No active Epics are currently visible in this branch.", "Inga aktiva Epics syns just nu i den har grenen.")}
                emptyStoryMessage={t(language, "No active Story Ideas are currently visible in this Epic.", "Inga aktiva Story Ideas syns just nu i detta epic.")}
                language={language}
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
                      ? `/intake?candidateId=${epic.lineageSourceId}`
                      : null,
                  directionSeeds: (epic.directionSeeds ?? [])
                    .filter((seed) => seed.lifecycleState === "active")
                    .map((seed) => ({
                      id: seed.id,
                      key: seed.key,
                      title: seed.title,
                      href: `/story-ideas/${seed.id}`,
                      isCurrent: false,
                      shortDescription: seed.shortDescription ?? null,
                      expectedBehavior: seed.expectedBehavior ?? null,
                      uxSketchName: seed.uxSketchName ?? null,
                      uxSketchDataUrl: seed.uxSketchDataUrl ?? null,
                      sourceStoryId: seed.sourceStoryId ?? null,
                      originType: seed.originType,
                      lifecycleState: seed.lifecycleState,
                      importedReadinessState: seed.importedReadinessState ?? null,
                      lineageHref:
                        seed.lineageSourceType === "artifact_aas_candidate" && seed.lineageSourceId
                          ? `/intake?candidateId=${seed.lineageSourceId}`
                          : null
                    })),
                  stories: (epic.stories ?? [])
                    .filter((story) => story.lifecycleState === "active")
                    .map((story) => ({
                      id: story.id,
                      key: story.key,
                      title: story.title,
                      href: story.sourceDirectionSeedId ? `/stories/${story.id}` : `/story-ideas/${story.id}`,
                      isCurrent: false,
                      sourceDirectionSeedId: story.sourceDirectionSeedId ?? null,
                      valueIntent: story.valueIntent ?? null,
                      expectedBehavior: story.expectedBehavior ?? null,
                      testDefinition: story.testDefinition ?? null,
                      acceptanceCriteria: story.acceptanceCriteria,
                      definitionOfDone: story.definitionOfDone,
                      status: story.status,
                      originType: story.originType,
                      lifecycleState: story.lifecycleState,
                      tollgateStatus: story.tollgateStatus ?? null,
                      importedReadinessState: story.importedReadinessState ?? null,
                      lineageHref:
                        story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId
                          ? `/intake?candidateId=${story.lineageSourceId}`
                          : null
                    }))
                }))}
                outcome={{
                  id: selectedOutcome.id,
                  key: selectedOutcome.key,
                  title: selectedOutcome.title,
                  href: `/outcomes/${selectedOutcome.id}`,
                  isCurrent: true,
                  problemStatement: selectedOutcome.problemStatement ?? null,
                  outcomeStatement: selectedOutcome.outcomeStatement ?? null,
                  originType: selectedOutcome.originType,
                  lifecycleState: selectedOutcome.lifecycleState,
                  importedReadinessState: selectedOutcome.importedReadinessState ?? null,
                  lineageHref:
                    selectedOutcome.lineageSourceType === "artifact_aas_candidate" && selectedOutcome.lineageSourceId
                      ? `/intake?candidateId=${selectedOutcome.lineageSourceId}`
                      : null
                }}
                title={t(language, "Project Value Spine", "Projektets Value Spine")}
              />
            </>
          )}
        </section>
      </AppShell>
    );
  });
}
