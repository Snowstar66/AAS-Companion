"use client";

import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { StoryIdeaInlineSaveButton } from "@/components/workspace/story-idea-inline-save-button";
import { StoryIdeaUxSketchField } from "@/components/workspace/story-idea-ux-sketch-field";
import { StoryIdeaAiValidatedTextarea } from "@/components/workspace/story-idea-ai-validated-textarea";
import { getStoryIdeaBlockers, getStoryIdeaStatusText } from "@/lib/framing/story-idea-status";
import { formatAiLevel, getSimplifiedStatusClasses, SecondaryPanel, WorkspaceStatusSummary } from "./story-workspace-shared";

type DirectionSeedWorkspaceProps = {
  data: {
    seed: {
      id: string;
      key: string;
      title: string;
      shortDescription: string | null;
      expectedBehavior: string | null;
      uxSketchName: string | null;
      uxSketchContentType: string | null;
      uxSketchDataUrl: string | null;
      uxSketches?: Array<{
        id: string;
        name: string;
        contentType: string;
        dataUrl: string;
      }> | null;
      lifecycleState: string;
    };
    epic: {
      id: string;
      key: string;
      title: string;
      purpose: string | null;
      scopeBoundary: string | null;
    };
    outcome: {
      id: string;
      key: string;
      title: string;
      outcomeStatement: string | null;
      aiAccelerationLevel: string;
      status: string;
    };
    derivedDeliveryStories: Array<{
      id: string;
      key: string;
      title: string;
      valueIntent: string;
      status: string;
    }>;
  };
  isArchived: boolean;
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
  createDeliveryStoryAction: (formData: FormData) => void | Promise<void>;
};

export function DirectionSeedWorkspace({
  data,
  isArchived,
  saveAction,
  saveInlineAction,
  validateAction,
  createDeliveryStoryAction
}: DirectionSeedWorkspaceProps) {
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
  const { seed, epic, outcome, derivedDeliveryStories } = data;
  const ideaBlockers = getStoryIdeaBlockers({
    shortDescription: seed.shortDescription,
    expectedBehavior: seed.expectedBehavior,
    hasEpicLink: Boolean(epic.id),
    parentApproved: outcome.status === "active"
  });
  const primaryStatusLabel = getStoryIdeaStatusText({
    shortDescription: seed.shortDescription,
    expectedBehavior: seed.expectedBehavior,
    hasEpicLink: Boolean(epic.id),
    parentApproved: outcome.status === "active"
  });
  const statusTone = ideaBlockers.length > 0 ? "needs_action" : outcome.status === "active" ? "approved" : "ready_for_review";
  const primaryStatusClasses = getSimplifiedStatusClasses(statusTone);
  const epicAlignmentText =
    epic.purpose?.trim() ||
    epic.scopeBoundary?.trim() ||
    t(
      `This story idea should contribute clearly to Epic ${epic.key} ${epic.title}.`,
      `Den här storyidén ska tydligt bidra till Epic ${epic.key} ${epic.title}.`
    );
  const uxSketches =
    seed.uxSketches && seed.uxSketches.length > 0
      ? seed.uxSketches
      : seed.uxSketchDataUrl?.trim()
        ? [
            {
              id: "legacy-sketch",
              name: seed.uxSketchName ?? t("Concept sketch attached", "Konceptskiss bifogad"),
              contentType: seed.uxSketchContentType ?? "image/*",
              dataUrl: seed.uxSketchDataUrl
            }
          ]
        : [];
  const completeItems = [
    seed.shortDescription?.trim() ? t("Value intent is captured", "Value intent är ifyllt") : null,
    seed.expectedBehavior?.trim() ? t("Expected behavior is captured", "Expected behavior är ifyllt") : null,
    epic.id ? t(`Linked to Epic ${epic.key}`, `Lankad till Epic ${epic.key}`) : null,
    outcome.status === "active" ? t(`Parent Framing ${outcome.key} is approved`, `Överordnad Framing ${outcome.key} är godkänd`) : null
  ].filter((value): value is string => Boolean(value));
  const nextActionLabel =
    ideaBlockers.length > 0
      ? t("Complete the Story Idea", "Fardigstall storyiden")
      : outcome.status === "active"
        ? t("Guide later refinement", "Styr senare forfining")
        : t("Review in Framing", "Granska i Framing");
  const nextActionDetail =
    ideaBlockers.length > 0
      ? t(
          "Clear the listed blockers so this Story Idea is complete enough for review.",
          "Lös blockerarna nedan så att storyidén blir tillräckligt komplett för granskning."
        )
      : outcome.status === "active"
        ? t(
            "This Story Idea already sits inside approved Framing and can now guide design and downstream AI refinement.",
            "Den har storyiden ligger redan i godkand Framing och kan nu styra design och downstream AI-forfining."
          )
        : t(
            "This Story Idea is complete enough for Framing review and Tollgate conversation.",
            "Den här storyidén är tillräckligt komplett för Framing-review och Tollgate-dialog."
          );
  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {seed.key}
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
                <CardTitle>{seed.title}</CardTitle>
                <CardDescription className="mt-2 max-w-4xl">
                  {t(
                    "Describe this Story Idea so it is clear enough to guide design and AI refinement, but not detailed enough to become a delivery specification.",
                    "Beskriv storyidén så att den är tydlig nog att styra design och AI-förädling, men inte så detaljerad att den blir en leveransspecifikation."
                  )}
                </CardDescription>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
                  {t(
                    "This is a dedicated Story Idea view. Keep the focus on framing intent, not delivery workflow.",
                    "Detta är en dedikerad Story Idea-vy. Håll fokus på framing-intent, inte på leveransworkflow."
                  )}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <WorkspaceStatusSummary
              blockerEmptyText={t("No Story Idea blockers are visible right now.", "Inga blockerare för storyidén är synliga just nu.")}
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
          <input name="storyIdeaId" type="hidden" value={seed.id} />
          <input name="epicId" type="hidden" value={epic.id} />
          <input name="outcomeId" type="hidden" value={outcome.id} />
          <input name="epicTitle" type="hidden" value={epic.title} />
          <input name="epicPurpose" type="hidden" value={epic.purpose ?? ""} />
          <input name="epicScopeBoundary" type="hidden" value={epic.scopeBoundary ?? ""} />
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t("Story idea definition", "Definition av storyide")}</CardTitle>
              <CardDescription>{t("Keep this directional and useful for framing, design and AI refinement.", "Hall detta riktat och anvandbart for framing, design och AI-foradling.")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("AI level", "AI-nivå")}</p>
                <p className="mt-2 font-semibold text-foreground">{formatAiLevel(outcome.aiAccelerationLevel)}</p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  {t(
                    "This comes from the current Framing and affects governance expectations for the Story Idea.",
                    "Detta kommer från aktuell Framing och påverkar governance-förväntningarna för storyidén."
                  )}
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("Title", "Titel")}</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={seed.title}
                  disabled={isArchived}
                  name="title"
                  type="text"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("Value intent", "Value intent")}</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={seed.shortDescription ?? ""}
                  disabled={isArchived}
                  name="shortDescription"
                />
              </label>
              <StoryIdeaUxSketchField existingSketches={uxSketches} entityTitle={seed.title} isArchived={isArchived} />
              <StoryIdeaAiValidatedTextarea
                disabled={isArchived}
                initialValue={seed.expectedBehavior ?? ""}
                label={t("Expected behavior", "Expected behavior")}
                name="expectedBehavior"
                saveAction={saveInlineAction}
                validateAction={validateAction}
              />
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Epic alignment", "Epic-koppling")}</p>
                <p className="mt-2 font-semibold text-foreground">
                  {epic.key} {epic.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Blocking items", "Blockerande punkter")}</p>
                {ideaBlockers.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-foreground">
                    {ideaBlockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 leading-6 text-muted-foreground">{t("No blockers remain. This Story Idea is ready for review.", "Inga blockerare återstår. Storyidén är redo för review.")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isArchived ? (
              <StoryIdeaInlineSaveButton
                label={t("Save Story Idea", "Spara storyidé")}
                pendingLabel={t("Saving Story Idea...", "Sparar storyidé...")}
                saveAction={saveInlineAction}
              />
            ) : null}
            {!isArchived ? (
              <PendingFormButton
                className="gap-2"
                formAction={createDeliveryStoryAction}
                icon={<ArrowRight className="h-4 w-4" />}
                label={
                  derivedDeliveryStories.length > 0
                    ? t("Create another linked delivery record", "Skapa en till lankad leveranspost")
                    : t("Create linked delivery record", "Skapa lankad leveranspost")
                }
                pendingLabel={t("Creating linked delivery record...", "Skapar lankad leveranspost...")}
                variant="secondary"
              />
            ) : null}
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/epics/${epic.id}`}>{t("Back to current Epic", "Tillbaka till aktuell Epic")}</Link>
            </Button>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/framing?outcomeId=${outcome.id}`}>{t("Open current Framing", "Öppna aktuell Framing")}</Link>
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "See what later design or build work has returned to this Story Idea as traceable evidence, without turning the framing view into delivery workflow.",
            "Se vad senare design- eller buildarbete har fort tillbaka till den har storyiden som sparbar evidens, utan att gora framing-vyn till leveransworkflow."
          )}
          title={t("Returned delivery evidence", "Aterford leveransevidens")}
        >
          {derivedDeliveryStories.length > 0 ? (
            <div className="space-y-3">
              {derivedDeliveryStories.map((deliveryStory) => (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/45 p-4 text-sm" key={deliveryStory.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Delivery evidence", "Leveransevidens")}</p>
                      <p className="mt-2 font-semibold text-foreground">
                        {deliveryStory.key} {deliveryStory.title}
                      </p>
                      <p className="mt-2 leading-6 text-muted-foreground">
                        {deliveryStory.valueIntent?.trim() || t("This Delivery Story still needs a clearer value intent.", "Den här Delivery Storyn behöver fortfarande ett tydligare value intent.")}
                      </p>
                    </div>
                    <Button asChild className="gap-2" size="sm" variant="secondary">
                      <Link href={`/stories/${deliveryStory.id}`}>
                        {t("Open Delivery Story", "Öppna Delivery Story")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              {t("No Delivery Stories are linked to this Story Idea yet.", "Inga Delivery Stories är länkade till den här storyidén ännu.")}
            </div>
          )}
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Open this only when you need to check where the Story Idea sits in the current branch.",
            "Öppna detta bara när du behöver kontrollera var storyidén ligger i den aktuella grenen."
          )}
          title={t("Branch context", "Grenkontext")}
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Current framing", "Aktuell framing")}</p>
              <p className="mt-2 font-semibold text-foreground">
                {outcome.key} {outcome.title}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">
                {outcome.outcomeStatement?.trim() || t("Outcome statement is not yet described in this Framing.", "Outcome statement är inte beskriven i den här Framing ännu.")}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Current epic", "Aktuell Epic")}</p>
              <p className="mt-2 font-semibold text-foreground">
                {epic.key} {epic.title}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
            </div>
          </div>
        </SecondaryPanel>
      </div>
    </div>
  );
}
