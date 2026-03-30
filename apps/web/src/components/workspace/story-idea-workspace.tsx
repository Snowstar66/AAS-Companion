import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { StoryIdeaAiValidatedTextarea } from "@/components/workspace/story-idea-ai-validated-textarea";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { archiveStoryAction, hardDeleteStoryAction, restoreStoryAction } from "@/app/(protected)/stories/[storyId]/actions";
import {
  formatAiLevel,
  getReadinessFieldStatus,
  SecondaryPanel,
  STORY_IDEA_GUIDANCE,
  type StoryWorkspaceData
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
  const { activities, derivedDeliveryStories = [], originStoryIdea, removal, story } = data;
  const readinessFields = getReadinessFieldStatus(story);
  const epicAlignmentText =
    story.epic.purpose?.trim() ||
    story.epic.scopeBoundary?.trim() ||
    `This story idea should contribute clearly to Epic ${story.epic.key} ${story.epic.title}.`;
  const ideaBlockers = [
    !story.valueIntent?.trim() ? "Value Intent still needs to be described." : null,
    !story.expectedBehavior?.trim() ? "Expected Behavior still needs to be described." : null
  ].filter((value): value is string => Boolean(value));
  const primaryStatusLabel = ideaBlockers.length > 0 ? "Needs clarification" : "Framing ready";
  const primaryStatusClasses =
    ideaBlockers.length > 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900";
  const uxSketches: Array<{
    id: string;
    name: string;
    contentType: string;
    dataUrl: string;
  }> =
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
  const hasUxSketch = uxSketches.length > 0;

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
                  Story Idea
                </span>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${primaryStatusClasses}`}>
                  {primaryStatusLabel}
                </span>
              </div>
              <div>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription className="mt-2 max-w-4xl">{STORY_IDEA_GUIDANCE}</CardDescription>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
                  This record is still framing-level intent. Keep it directional, clear and useful for design and AI refinement
                  without turning it into a delivery specification.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Value intent</p>
              <p className="mt-2 font-semibold text-foreground">{story.valueIntent?.trim() ? "Described" : "Still needs definition"}</p>
              <p className="mt-2 leading-6 text-muted-foreground">
                {story.valueIntent?.trim() || "Explain why this story idea matters and what user or business value it should create."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Expected behavior</p>
              <p className="mt-2 font-semibold text-foreground">
                {story.expectedBehavior?.trim() ? "Described" : "Still needs definition"}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">
                {story.expectedBehavior?.trim() ||
                  "Describe roughly what should happen when this idea is implemented without turning it into detailed delivery requirements."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm" id="story-blockers">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic alignment</p>
              <p className="mt-2 font-semibold text-foreground">
                {story.epic.key} {story.epic.title}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
            </div>
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
              <CardTitle>Story idea definition</CardTitle>
              <CardDescription>{STORY_IDEA_GUIDANCE}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm" id="story-ai-level">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI level</p>
                <p className="mt-2 font-semibold text-foreground">{formatAiLevel(story.aiAccelerationLevel)}</p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  This comes from the current Framing and affects governance requirements for the Story.
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Title</span>
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
                <span className="text-sm font-medium text-foreground">Value intent</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.valueIntent}
                  disabled={isArchived}
                  name="valueIntent"
                />
              </label>
              <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/45 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">UX Sketch</span>
                  {hasUxSketch ? (
                    <span className="inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-sky-900">
                      {uxSketches.length > 1 ? `${uxSketches.length} UX Sketches Attached` : "UX Sketch Attached"}
                    </span>
                  ) : null}
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    Conceptual - subject to change
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Add an early UX sketch here when it helps explain the idea. Keep it conceptual and framing-level rather than final design.
                </p>
                {hasUxSketch ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {uxSketches.map((sketch) => (
                        <div className="space-y-2 overflow-hidden rounded-2xl border border-border/70 bg-white p-3" key={sketch.id}>
                          <img
                            alt={sketch.name ? `UX sketch for ${story.title}: ${sketch.name}` : `UX sketch attached to ${story.title}`}
                            className="max-h-80 w-full rounded-xl object-contain"
                            src={sketch.dataUrl}
                          />
                          <p className="text-xs text-muted-foreground">{sketch.name}</p>
                        </div>
                      ))}
                    </div>
                    {!isArchived ? (
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input className="rounded border-border" name="clearUxSketch" type="checkbox" value="1" />
                        Remove current sketches on next save
                      </label>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                    No UX sketch is attached yet.
                  </div>
                )}
                {!isArchived ? (
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Upload sketch</span>
                    <input
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-sky-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-900 hover:file:bg-sky-200"
                      multiple
                      name="uxSketchFiles"
                      type="file"
                    />
                    <p className="text-xs text-muted-foreground">PNG, JPEG, WEBP or GIF. Up to 4 files, max 2 MB each.</p>
                  </label>
                ) : null}
              </div>
              <StoryIdeaAiValidatedTextarea
                disabled={isArchived}
                initialValue={story.expectedBehavior ?? ""}
                label="Expected behavior"
                name="expectedBehavior"
                saveAction={saveInlineAction}
                validateAction={validateAction}
              />
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic alignment</p>
                <p className="mt-2 font-semibold text-foreground">
                  {story.epic.key} {story.epic.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
              </div>
            </CardContent>
          </Card>

        <SecondaryPanel
          defaultOpen={false}
          description="These delivery details can wait until the story idea is turned into a Delivery Story for later build work."
          id="story-handoff-inputs"
          title="Delivery details later"
        >
            <div className="grid gap-4">
              <label className="space-y-2" id="story-acceptance-criteria">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[0].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[0].complete ? "Ready" : "Missing"}
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
                <span className="text-sm font-medium text-foreground">AI Usage Scope</span>
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
                  <span className="text-sm font-medium text-foreground">Test Definition</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[1].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[1].complete ? "Ready" : "Missing"}
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
                  <span className="text-sm font-medium text-foreground">Definition of Done</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[2].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[2].complete ? "Ready" : "Missing"}
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
              <PendingFormButton
                className="gap-2"
                icon={<ArrowRight className="h-4 w-4" />}
                label="Save Story changes"
                pendingLabel="Saving Story..."
              />
            ) : null}
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/epics/${story.epicId}`}>Back to current Epic</Link>
            </Button>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/framing?outcomeId=${story.outcomeId}`}>Open current Framing</Link>
            </Button>
            {deliveryViewHref ? (
              <Button asChild className="gap-2" variant="secondary">
                <Link href={deliveryViewHref}>Open Delivery Story view</Link>
              </Button>
            ) : null}
          </div>
        </form>

        <SecondaryPanel
          defaultOpen={false}
          description="See how this Story Idea is being realized in delivery without turning the framing view into delivery workflow."
          title="Delivery realization"
        >
          {derivedDeliveryStories.length > 0 ? (
            <div className="space-y-3">
              {derivedDeliveryStories.map((deliveryStory) => (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/45 p-4 text-sm" key={deliveryStory.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Delivery Story</p>
                      <p className="mt-2 font-semibold text-foreground">
                        {deliveryStory.key} {deliveryStory.title}
                      </p>
                      <p className="mt-2 leading-6 text-muted-foreground">
                        {deliveryStory.valueIntent?.trim() || "This Delivery Story still needs a clearer value intent."}
                      </p>
                    </div>
                    <Button asChild className="gap-2" size="sm" variant="secondary">
                      <Link href={`/stories/${deliveryStory.id}`}>
                        Open Delivery Story
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : originStoryIdea ? (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              This Story Idea has traceability through a linked seed, but no Delivery Stories have been created from it yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              No Delivery Stories are linked to this Story Idea yet.
            </div>
          )}
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description="Open this only when you need to check where the Story Idea sits in the current branch."
          title="Branch context"
        >
          <Card className="border-border/70 shadow-none">
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current framing</p>
                <p className="mt-2 font-semibold text-foreground">
                  {story.outcome.key} {story.outcome.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  {story.outcome.outcomeStatement?.trim() || "Outcome statement is not yet described in this Framing."}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current epic</p>
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
          description="Delivery review only becomes active after the Story Idea is turned into a Delivery Story."
          title="Delivery review later"
        >
          <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">This is still a Story Idea.</p>
            <p className="mt-2 leading-6">
              Keep the focus on Value Intent, Expected Behavior and Epic Alignment. Delivery review, build readiness and build
              start controls appear after this idea is transformed into a Delivery Story.
            </p>
            {blockers.length > 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Current future delivery blockers: {blockers.join(" ")}
              </p>
            ) : null}
          </div>
        </SecondaryPanel>

        <Card className="border-border/70 shadow-sm" id="story-governance">
          <CardHeader>
            <CardTitle>Governance readiness</CardTitle>
            <CardDescription>Check whether the project is staffed strongly enough for this Story's AI level.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/governance?view=readiness&sourceEntity=story&sourceId=${story.id}&level=${story.aiAccelerationLevel}`}>
                Open Governance readiness
              </Link>
            </Button>
          </CardContent>
        </Card>

        <SecondaryPanel
          defaultOpen={false}
          description="Operational history is useful, but not usually the first thing needed to move work forward."
          title="Latest activity"
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            {activities.length === 0 ? (
              <p>No activity has been recorded yet for this Story.</p>
            ) : (
              activities.map((activity) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={activity.id}>
                  <p className="font-medium text-foreground">{activity.eventType.replaceAll("_", " ")}</p>
                  <p className="mt-1">{new Date(activity.createdAt).toLocaleString("en-US")}</p>
                </div>
              ))
            )}
          </div>
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description="Archive, restore and delete controls stay available without displacing primary Story work."
          id="story-lifecycle"
          title="Lifecycle controls"
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
            description="Imported lineage is still accessible when you need to trace the source material."
            title="Imported lineage"
          >
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/review?candidateId=${story.lineageSourceId}`}>Open source candidate review</Link>
            </Button>
          </SecondaryPanel>
        ) : null}
      </div>
    </div>
  );
}
