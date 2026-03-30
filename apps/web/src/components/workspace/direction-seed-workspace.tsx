import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { StoryIdeaInlineSaveButton } from "@/components/workspace/story-idea-inline-save-button";
import { StoryIdeaUxSketchField } from "@/components/workspace/story-idea-ux-sketch-field";
import { StoryIdeaAiValidatedTextarea } from "@/components/workspace/story-idea-ai-validated-textarea";
import { formatAiLevel, SecondaryPanel } from "./story-workspace-shared";

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
  const { seed, epic, outcome, derivedDeliveryStories } = data;
  const ideaBlockers = [
    !seed.shortDescription?.trim() ? "Value Intent still needs to be described." : null,
    !seed.expectedBehavior?.trim() ? "Expected Behavior still needs to be described." : null
  ].filter((value): value is string => Boolean(value));
  const primaryStatusLabel = ideaBlockers.length > 0 ? "Needs clarification" : "Framing ready";
  const primaryStatusClasses =
    ideaBlockers.length > 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900";
  const epicAlignmentText =
    epic.purpose?.trim() ||
    epic.scopeBoundary?.trim() ||
    `This story idea should contribute clearly to Epic ${epic.key} ${epic.title}.`;
  const uxSketches =
    seed.uxSketches && seed.uxSketches.length > 0
      ? seed.uxSketches
      : seed.uxSketchDataUrl?.trim()
        ? [
            {
              id: "legacy-sketch",
              name: seed.uxSketchName ?? "Concept sketch attached",
              contentType: seed.uxSketchContentType ?? "image/*",
              dataUrl: seed.uxSketchDataUrl
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
                  {seed.key}
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
                <CardTitle>{seed.title}</CardTitle>
                <CardDescription className="mt-2 max-w-4xl">
                  Describe this Story Idea so it is clear enough to guide design and AI refinement, but not detailed enough to become a delivery specification.
                </CardDescription>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
                  This is a dedicated Story Idea view. Keep the focus on framing intent, not delivery workflow.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Value intent</p>
              <p className="mt-2 font-semibold text-foreground">{seed.shortDescription?.trim() ? "Described" : "Still needs definition"}</p>
              <p className="mt-2 leading-6 text-muted-foreground">
                {seed.shortDescription?.trim() || "Explain why this story idea matters and what user or business value it should create."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Expected behavior</p>
              <p className="mt-2 font-semibold text-foreground">
                {seed.expectedBehavior?.trim() ? "Described" : "Still needs definition"}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">
                {seed.expectedBehavior?.trim() ||
                  "Describe roughly what should happen when this idea is implemented without turning it into detailed delivery requirements."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic alignment</p>
              <p className="mt-2 font-semibold text-foreground">
                {epic.key} {epic.title}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
            </div>
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
              <CardTitle>Story idea definition</CardTitle>
              <CardDescription>Keep this directional and useful for framing, design and AI refinement.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI level</p>
                <p className="mt-2 font-semibold text-foreground">{formatAiLevel(outcome.aiAccelerationLevel)}</p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  This comes from the current Framing and affects governance expectations for the Story Idea.
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Title</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={seed.title}
                  disabled={isArchived}
                  name="title"
                  type="text"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Value intent</span>
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
                label="Expected behavior"
                name="expectedBehavior"
                saveAction={saveInlineAction}
                validateAction={validateAction}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isArchived ? (
              <StoryIdeaInlineSaveButton
                label="Save Story Idea"
                pendingLabel="Saving Story Idea..."
                saveAction={saveInlineAction}
              />
            ) : null}
            {!isArchived ? (
              <PendingFormButton
                className="gap-2"
                formAction={createDeliveryStoryAction}
                icon={<ArrowRight className="h-4 w-4" />}
                label={derivedDeliveryStories.length > 0 ? "Create another Delivery Story" : "Create Delivery Story"}
                pendingLabel="Creating Delivery Story..."
                variant="secondary"
              />
            ) : null}
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/epics/${epic.id}`}>Back to current Epic</Link>
            </Button>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/framing?outcomeId=${outcome.id}`}>Open current Framing</Link>
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <SecondaryPanel
          defaultOpen
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
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current framing</p>
              <p className="mt-2 font-semibold text-foreground">
                {outcome.key} {outcome.title}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">
                {outcome.outcomeStatement?.trim() || "Outcome statement is not yet described in this Framing."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current epic</p>
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
