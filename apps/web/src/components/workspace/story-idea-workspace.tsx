import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { StoryIdeaInlineSaveButton } from "@/components/workspace/story-idea-inline-save-button";
import { StoryIdeaUxSketchField } from "@/components/workspace/story-idea-ux-sketch-field";
import { StoryIdeaAiValidatedTextarea } from "@/components/workspace/story-idea-ai-validated-textarea";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import {
  archiveStoryAction,
  hardDeleteStoryAction,
  restoreStoryAction
} from "@/app/(protected)/stories/[storyId]/actions";
import { getStoryIdeaBlockers, getStoryIdeaStatusText } from "@/lib/framing/story-idea-status";
import {
  formatAiLevel,
  getReadinessFieldStatus,
  getSimplifiedStatusClasses,
  SecondaryPanel,
  type StoryWorkspaceData,
  WorkspaceStatusSummary
} from "./story-workspace-shared";

type StoryIdeaWorkspaceProps = {
  blockers: string[];
  data: StoryWorkspaceData;
  isArchived: boolean;
  deliveryViewHref?: string | null;
  saveAction: (formData: FormData) => void | Promise<void>;
  saveInlineAction: (formData: FormData) => Promise<{ status: "success" | "error"; message: string }>;
  validateAction: (formData: FormData) => Promise<
    | {
        status: "success";
        field: "story_expected_behavior";
        verdict: "good" | "needs_revision" | "unclear";
        confidence: "high" | "medium" | "low";
        rationale: string;
        suggestedRewrite: string | null;
      }
    | {
        status: "error";
        field: "story_expected_behavior";
        error: string;
      }
  >;
};

export function StoryIdeaWorkspace({
  blockers,
  data,
  isArchived,
  deliveryViewHref = null,
  saveAction,
  saveInlineAction,
  validateAction
}: StoryIdeaWorkspaceProps) {
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
  const { activities, derivedDeliveryStories = [], originStoryIdea, removal, story } = data;
  const guidance = t(
    "Keep this at framing level: clear enough to guide design, UX, and AI refinement without turning it into a detailed delivery specification.",
    "Håll den här posten på framingnivå: tydlig nog att styra design, UX och AI-förädling, men utan att göra den till en detaljerad leveransspecifikation."
  );
  const readinessFields = getReadinessFieldStatus(story);
  const epicAlignmentText =
    story.epic.purpose?.trim() ||
    story.epic.scopeBoundary?.trim() ||
    t(
      `This story idea should contribute clearly to Epic ${story.epic.key} ${story.epic.title}.`,
      `Den här storyidén ska tydligt bidra till Epic ${story.epic.key} ${story.epic.title}.`
    );
  const ideaBlockers = getStoryIdeaBlockers({
    valueIntent: story.valueIntent,
    expectedBehavior: story.expectedBehavior,
    hasEpicLink: Boolean(story.epicId),
    parentApproved: story.outcome.status === "active"
  });
  const primaryStatusLabel = getStoryIdeaStatusText({
    valueIntent: story.valueIntent,
    expectedBehavior: story.expectedBehavior,
    hasEpicLink: Boolean(story.epicId),
    parentApproved: story.outcome.status === "active"
  });
  const statusTone = ideaBlockers.length > 0 ? "needs_action" : story.outcome.status === "active" ? "approved" : "ready_for_review";
  const primaryStatusClasses = getSimplifiedStatusClasses(statusTone);
  const completeItems = [
    story.valueIntent?.trim() ? t("Value intent is captured", "Value intent ar ifangat") : null,
    story.expectedBehavior?.trim() ? t("Expected behavior is captured", "Expected behavior ar ifangat") : null,
    story.epicId ? `${t("Linked to Epic", "Lankad till Epic")} ${story.epic.key}` : null,
    story.outcome.status === "active" ? `${t("Parent Framing is approved", "Overordnad Framing ar godkand")}: ${story.outcome.key}` : null
  ].filter((value): value is string => Boolean(value));
  const nextActionLabel =
    ideaBlockers.length > 0
      ? t("Complete the Story Idea", "Komplettera storyiden")
      : story.outcome.status === "active"
        ? t("Create or refine Delivery Stories", "Skapa eller forfina Delivery Stories")
        : t("Review in Framing", "Granska i Framing");
  const nextActionDetail =
    ideaBlockers.length > 0
      ? t(
          "Clear the listed blockers so this Story Idea is complete enough for review.",
          "Los blockerarna i listan sa att den har Story Idean blir tillrackligt komplett for review."
        )
      : story.outcome.status === "active"
        ? t(
            "This Story Idea already sits inside approved Framing and can now guide design and delivery decomposition.",
            "Den har Story Idean ligger redan i godkand Framing och kan nu styra design och vidare leveransnedbrytning."
          )
        : t(
            "This Story Idea is complete enough for Framing review and Tollgate conversation.",
            "Den här Story Idean är tillräckligt komplett för Framing-review och Tollgate-samtal."
          );
  const uxSketches: Array<{ id: string; name: string; contentType: string; dataUrl: string }> =
    story.uxSketches && story.uxSketches.length > 0
      ? story.uxSketches
      : story.uxSketchDataUrl?.trim()
        ? [
            {
              id: "legacy-sketch",
              name: story.uxSketchName ?? "Concept sketch attached",
              contentType: story.uxSketchContentType ?? "image/*",
              dataUrl: story.uxSketchDataUrl
            }
          ]
        : [];

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {story.key}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900">
                  <Lightbulb className="h-4 w-4" />
                  {t("Story Idea", "Storyide")}
                </span>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${primaryStatusClasses}`}>
                  {primaryStatusLabel}
                </span>
              </div>
              <div>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription className="mt-2 max-w-4xl">{guidance}</CardDescription>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
                  {t(
                    "This record is still framing-level intent. Keep it directional, clear and useful for design and AI refinement without turning it into a delivery specification.",
                    "Den här posten är fortfarande intention på framingnivå. Håll den riktad, tydlig och användbar för design och AI-förädling utan att göra den till en leveransspecifikation."
                  )}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <WorkspaceStatusSummary
              blockerEmptyText={t("No Story Idea blockers are visible right now.", "Inga blockerare for storyiden syns just nu.")}
              blockers={ideaBlockers}
              completeItems={completeItems}
              nextActionDetail={nextActionDetail}
              nextActionLabel={nextActionLabel}
              statusLabel={primaryStatusLabel}
              statusTone={statusTone}
            />
          </CardContent>
        </Card>
        <form action={saveAction} className="space-y-6">
          <input name="storyId" type="hidden" value={story.id} />
          <input name="epicId" type="hidden" value={story.epicId} />
          <input name="outcomeId" type="hidden" value={story.outcomeId} />
          <input name="epicTitle" type="hidden" value={story.epic.title} />
          <input name="epicPurpose" type="hidden" value={story.epic.purpose ?? ""} />
          <input name="epicScopeBoundary" type="hidden" value={story.epic.scopeBoundary ?? ""} />
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t("Story idea definition", "Storyide-definition")}</CardTitle>
              <CardDescription>{guidance}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm" id="story-ai-level">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("AI level", "AI-nivå")}</p>
                <p className="mt-2 font-semibold text-foreground">{formatAiLevel(story.aiAccelerationLevel)}</p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  {t(
                    "This comes from the current Framing and affects governance requirements for the Story.",
                    "Det har kommer fran aktuell Framing och paverkar governancekraven for storyn."
                  )}
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("Title", "Titel")}</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.title}
                  disabled={isArchived}
                  name="title"
                  type="text"
                />
              </label>
              <input name="storyType" type="hidden" value={story.storyType} />
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("Value intent", "Value intent")}</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.valueIntent}
                  disabled={isArchived}
                  name="valueIntent"
                />
              </label>
              <StoryIdeaUxSketchField existingSketches={uxSketches} entityTitle={story.title} isArchived={isArchived} />
              <StoryIdeaAiValidatedTextarea
                disabled={isArchived}
                initialValue={story.expectedBehavior ?? ""}
                label={t("Expected behavior", "Forvantat beteende")}
                name="expectedBehavior"
                saveAction={saveInlineAction}
                validateAction={validateAction}
              />
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Epic alignment", "Epic-anpassning")}</p>
                <p className="mt-2 font-semibold text-foreground">
                  {story.epic.key} {story.epic.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm" id="story-blockers">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Blocking items", "Blockerande punkter")}</p>
                {ideaBlockers.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-foreground">
                    {ideaBlockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {t("No blockers remain. This Story Idea is ready for review.", "Inga blockerare återstår. Den här storyidén är redo för review.")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <SecondaryPanel
            defaultOpen={false}
            description={t(
              "These delivery details can wait until the story idea is turned into a Delivery Story for later build work.",
              "De har leveransdetaljerna kan vanta tills storyidean blir en Delivery Story for senare build-arbete."
            )}
            id="story-handoff-inputs"
            title={t("Delivery details later", "Leveransdetaljer senare")}
          >
            <div className="grid gap-4">
              <label className="space-y-2" id="story-acceptance-criteria">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{t("Acceptance criteria", "Acceptanskriterier")}</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[0].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[0].complete ? t("Ready", "Redo") : t("Missing", "Saknas")}
                  </span>
                </div>
                <textarea
                  className={`min-h-28 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                    readinessFields[0].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                  }`}
                  defaultValue={story.acceptanceCriteria.join("\n")}
                  disabled={isArchived}
                  name="acceptanceCriteria"
                />
                {!readinessFields[0].complete ? <p className="text-sm text-amber-800">{readinessFields[0].help}</p> : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("AI Usage Scope", "AI-användningsomfång")}</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.aiUsageScope.join(", ")}
                  disabled={isArchived}
                  name="aiUsageScope"
                  type="text"
                />
              </label>
              <label className="space-y-2" id="story-test-definition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{t("Test Definition", "Testdefinition")}</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[1].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[1].complete ? t("Ready", "Redo") : t("Missing", "Saknas")}
                  </span>
                </div>
                <textarea
                  className={`min-h-24 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                    readinessFields[1].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                  }`}
                  defaultValue={story.testDefinition ?? ""}
                  disabled={isArchived}
                  name="testDefinition"
                />
                {!readinessFields[1].complete ? <p className="text-sm text-amber-800">{readinessFields[1].help}</p> : null}
              </label>
              <label className="space-y-2" id="story-definition-of-done">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{t("Definition of Done", "Definition of Done")}</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[2].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[2].complete ? t("Ready", "Redo") : t("Missing", "Saknas")}
                  </span>
                </div>
                <textarea
                  className={`min-h-28 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                    readinessFields[2].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                  }`}
                  defaultValue={story.definitionOfDone.join("\n")}
                  disabled={isArchived}
                  name="definitionOfDone"
                />
                {!readinessFields[2].complete ? <p className="text-sm text-amber-800">{readinessFields[2].help}</p> : null}
              </label>
            </div>
          </SecondaryPanel>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isArchived ? (
              <StoryIdeaInlineSaveButton
                label={t("Save Story changes", "Spara storyändringar")}
                pendingLabel={t("Saving Story...", "Sparar story...")}
                saveAction={saveInlineAction}
              />
            ) : null}
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/epics/${story.epicId}`}>{t("Back to current Epic", "Tillbaka till aktuell epic")}</Link>
            </Button>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/framing?outcomeId=${story.outcomeId}`}>{t("Open current Framing", "Öppna aktuell Framing")}</Link>
            </Button>
            {deliveryViewHref ? (
              <Button asChild className="gap-2" variant="secondary">
                <Link href={deliveryViewHref}>{t("Open Delivery Story view", "Öppna Delivery Story-vy")}</Link>
              </Button>
            ) : null}
          </div>
        </form>
        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "See how this Story Idea is being realized in delivery without turning the framing view into delivery workflow.",
            "Se hur den har Story Idean realiseras i leveransen utan att gora framingvyn till ett leveransflode."
          )}
          title={t("Delivery realization", "Leveransrealisering")}
        >
          {derivedDeliveryStories.length > 0 ? (
            <div className="space-y-3">
              {derivedDeliveryStories.map((deliveryStory) => (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/45 p-4 text-sm" key={deliveryStory.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Delivery Story", "Leveransstory")}</p>
                      <p className="mt-2 font-semibold text-foreground">
                        {deliveryStory.key} {deliveryStory.title}
                      </p>
                      <p className="mt-2 leading-6 text-muted-foreground">
                        {deliveryStory.valueIntent?.trim() ||
                          t(
                            "This Delivery Story still needs a clearer value intent.",
                            "Den här Delivery Storyn behöver fortfarande ett tydligare value intent."
                          )}
                      </p>
                    </div>
                    <Button asChild className="gap-2" size="sm" variant="secondary">
                      <Link href={`/stories/${deliveryStory.id}`}>
                        {t("Open Delivery Story", "Öppna leveransstory")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : originStoryIdea ? (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              {t(
                "This Story Idea has traceability through a linked seed, but no Delivery Stories have been created from it yet.",
                "Den här Story Idean har spårbarhet via ett länkat seed, men inga Delivery Stories har ännu skapats från den."
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              {t("No Delivery Stories are linked to this Story Idea yet.", "Inga Delivery Stories är länkade till den här Story Idean ännu.")}
            </div>
          )}
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Open this only when you need to check where the Story Idea sits in the current branch.",
            "Öppna detta bara när du behöver kontrollera var Story Idean ligger i den aktuella grenen."
          )}
          title={t("Branch context", "Grenkontext")}
        >
          <Card className="border-border/70 shadow-none">
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Current framing", "Aktuell Framing")}</p>
                <p className="mt-2 font-semibold text-foreground">
                  {story.outcome.key} {story.outcome.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  {story.outcome.outcomeStatement?.trim() ||
                    t("Outcome statement is not yet described in this Framing.", "Outcome statement är ännu inte beskriven i den här Framing-vyn.")}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Current epic", "Aktuell epic")}</p>
                <p className="mt-2 font-semibold text-foreground">
                  {story.epic.key} {story.epic.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
              </div>
            </CardContent>
          </Card>
        </SecondaryPanel>
      </div>

      <div className="space-y-6">
        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Delivery review only becomes active after the Story Idea is turned into a Delivery Story.",
            "Leveransgranskning blir först aktiv när Story Idean har blivit en Delivery Story."
          )}
          title={t("Delivery review later", "Leveransgranskning senare")}
        >
          <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t("This is still a Story Idea.", "Det här är fortfarande en storyidé.")}</p>
            <p className="mt-2 leading-6">
              {t(
                "Keep the focus on Value Intent, Expected Behavior and Epic Alignment. Delivery review, build readiness and build start controls appear after this idea is transformed into a Delivery Story.",
                "Behåll fokus på Value Intent, Expected Behavior och Epic Alignment. Leveransgranskning, build readiness och build-startkontroller visas först när idén har omvandlats till en Delivery Story."
              )}
            </p>
            {blockers.length > 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("Current future delivery blockers", "Nuvarande framtida leveransblockerare")}: {blockers.join(" ")}
              </p>
            ) : null}
          </div>
        </SecondaryPanel>

        <Card className="border-border/70 shadow-sm" id="story-governance">
          <CardHeader>
            <CardTitle>{t("Governance readiness", "Governance-beredskap")}</CardTitle>
            <CardDescription>
              {t(
                "Check whether the project is staffed strongly enough for this Story's AI level.",
                "Kontrollera om projektet är tillräckligt bemannat för den här storyns AI-nivå."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/governance?view=readiness&sourceEntity=story&sourceId=${story.id}&level=${story.aiAccelerationLevel}`}>
                {t("Open Governance readiness", "Öppna Governance-beredskap")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Operational history is useful, but not usually the first thing needed to move work forward.",
            "Operativ historik är användbar, men oftast inte det första som behövs för att föra arbetet framåt."
          )}
          title={t("Latest activity", "Senaste aktivitet")}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            {activities.length === 0 ? (
              <p>{t("No activity has been recorded yet for this Story.", "Ingen aktivitet har registrerats ännu för den här storyn.")}</p>
            ) : (
              activities.map((activity) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={activity.id}>
                  <p className="font-medium text-foreground">{activity.eventType.replaceAll("_", " ")}</p>
                  <p className="mt-1">{new Date(activity.createdAt).toLocaleString(language === "sv" ? "sv-SE" : "en-US")}</p>
                </div>
              ))
            )}
          </div>
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Archive, restore and delete controls stay available without displacing primary Story work.",
            "Arkivera-, återställ- och delete-kontroller finns kvar utan att tränga undan det primära storyarbetet."
          )}
          id="story-lifecycle"
          title={t("Lifecycle controls", "Livscykelkontroller")}
        >
          <GovernedLifecycleCard
            archiveAction={archiveStoryAction}
            decision={removal?.decision ?? null}
            entityId={story.id}
            entityLabel="Story"
            hardDeleteAction={hardDeleteStoryAction}
            hiddenFields={[
              { name: "epicId", value: story.epicId },
              { name: "outcomeId", value: story.outcomeId }
            ]}
            restoreAction={restoreStoryAction}
          />
        </SecondaryPanel>

        {story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId ? (
          <SecondaryPanel
            defaultOpen={false}
            description={t(
              "Imported lineage is still accessible when you need to trace the source material.",
              "Importerad lineage är fortfarande tillgänglig när du behöver spåra källmaterialet."
            )}
            title={t("Imported lineage", "Importerad lineage")}
          >
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/review?candidateId=${story.lineageSourceId}`}>{t("Open source candidate review", "Öppna källkandidatens review")}</Link>
            </Button>
          </SecondaryPanel>
        ) : null}
      </div>
    </div>
  );
}
