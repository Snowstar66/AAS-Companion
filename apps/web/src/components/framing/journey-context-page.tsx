"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { getOutcomeWorkspaceService } from "@aas-companion/api";
import { JourneyContextSection } from "@/components/framing/journey-context-section";
import {
  getJourneyContextCounts,
  journeyContextHasBlockingValidation,
  validateJourneyContext,
  type JourneyReferenceOption
} from "@/lib/framing/journey-context-ui";
import type { Journey, JourneyContext, JourneyInitiativeType, JourneyStep } from "@/lib/framing/journeyContextTypes";

type OutcomeWorkspaceData = Extract<Awaited<ReturnType<typeof getOutcomeWorkspaceService>>, { ok: true }>["data"];

type JourneyContextPageProps = {
  data: OutcomeWorkspaceData;
  saveAction: (formData: FormData) => void | Promise<void>;
  analyzeAction: (formData: FormData) => void | Promise<void>;
  flash?: {
    save?: "success" | "error" | null;
    analyze?: "success" | "error" | null;
    message?: string | null;
  };
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyStep(): JourneyStep {
  return {
    id: createId("step"),
    title: "",
    description: "",
    actor: "",
    currentPain: "",
    desiredSupport: "",
    decisionPoint: false
  };
}

function createEmptyJourney(): Journey {
  return {
    id: createId("journey"),
    title: "",
    type: undefined,
    primaryActor: "",
    supportingActors: [],
    goal: "",
    trigger: "",
    currentState: "",
    desiredFutureState: "",
    steps: [createEmptyStep()],
    painPoints: [],
    desiredSupport: [],
    exceptions: [],
    notes: "",
    linkedEpicIds: [],
    linkedStoryIdeaIds: [],
    linkedFigmaRefs: [],
    coverage: {
      status: "unanalysed"
    }
  };
}

function createEmptyJourneyContext(outcomeId: string, initiativeType: JourneyInitiativeType): JourneyContext {
  return {
    id: createId("journey-context"),
    outcomeId,
    initiativeType,
    title: "",
    description: "",
    journeys: [createEmptyJourney()],
    notes: ""
  };
}

function getInitiativeRecommendation(initiativeType: JourneyInitiativeType | null) {
  if (initiativeType === "AD") {
    return "Recommended when user flows, role-based experiences, or end-to-end support journeys are important.";
  }

  if (initiativeType === "AT") {
    return "Strongly recommended when transformation affects multiple roles, process continuity, handoffs, or coexistence between current and future ways of working.";
  }

  if (initiativeType === "AM") {
    return "Useful when incident, support, operational, or change-related flows need to be understood more clearly.";
  }

  return "Set the initiative type in Framing Overview first so Journey Context can inherit the right posture.";
}

function FlashBanner(props: { tone: "success" | "error"; message: string }) {
  const classes =
    props.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>{props.message}</div>;
}

export function JourneyContextPage({ data, saveAction, analyzeAction, flash }: JourneyContextPageProps) {
  const initiativeType =
    data.outcome.deliveryType === "AD" || data.outcome.deliveryType === "AT" || data.outcome.deliveryType === "AM"
      ? data.outcome.deliveryType
      : null;
  const [contexts, setContexts] = useState<JourneyContext[]>(data.outcome.journeyContexts ?? []);
  const availableEpics: JourneyReferenceOption[] = data.outcome.epics.map((epic) => ({
    id: epic.id,
    label: `${epic.key} - ${epic.title}`
  }));
  const availableStoryIdeas: JourneyReferenceOption[] = data.outcome.directionSeeds.map((seed) => ({
    id: seed.id,
    label: `${seed.key} - ${seed.title}`
  }));
  const availableFigmaRefs: JourneyReferenceOption[] = data.outcome.directionSeeds
    .filter((seed) => seed.uxSketchName || seed.uxSketchDataUrl)
    .map((seed) => ({
      id: `${seed.id}:figma`,
      label: `${seed.key} - ${seed.uxSketchName ?? "Reference attached"}`
    }));
  const validations = Object.fromEntries(
    contexts.map((context) => [
      context.id,
      validateJourneyContext(context, {
        epics: availableEpics,
        storyIdeas: availableStoryIdeas,
        figmaRefs: availableFigmaRefs
      })
    ] as const)
  );
  const counts = getJourneyContextCounts(contexts);
  const serializedContexts = JSON.stringify(contexts);

  function updateContext(contextId: string, nextContext: JourneyContext) {
    setContexts((current) => current.map((context) => (context.id === contextId ? nextContext : context)));
  }

  function updateJourney(contextId: string, journeyId: string, updater: (journey: Journey) => Journey) {
    setContexts((current) =>
      current.map((context) =>
        context.id !== contextId
          ? context
          : {
              ...context,
              journeys: context.journeys.map((journey) => (journey.id === journeyId ? updater(journey) : journey))
            }
      )
    );
  }

  function updateStep(
    contextId: string,
    journeyId: string,
    stepId: string,
    updater: (step: JourneyStep) => JourneyStep
  ) {
    updateJourney(contextId, journeyId, (journey) => ({
      ...journey,
      steps: journey.steps.map((step) => (step.id === stepId ? updater(step) : step))
    }));
  }

  function moveStep(contextId: string, journeyId: string, stepId: string, direction: "up" | "down") {
    updateJourney(contextId, journeyId, (journey) => {
      const index = journey.steps.findIndex((step) => step.id === stepId);

      if (index === -1) {
        return journey;
      }

      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= journey.steps.length) {
        return journey;
      }

      const nextSteps = [...journey.steps];
      const [step] = nextSteps.splice(index, 1);

      if (!step) {
        return journey;
      }

      nextSteps.splice(swapIndex, 0, step);

      return {
        ...journey,
        steps: nextSteps
      };
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Journey Context</CardTitle>
          <CardDescription>Optional flow-based context for AI-assisted refinement of Epics and Story Ideas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              Outcome {data.outcome.key}
            </span>
            <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              {data.outcome.title}
            </span>
            {initiativeType ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                {initiativeType}
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Journey Context items</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{counts.contextCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Journeys</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{counts.journeyCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Uncovered Journeys</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{counts.uncoveredJourneyCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Suggested Story Ideas</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{counts.suggestedStoryIdeaCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
            Journey Context is optional. Use it when you want to describe role-based, user, operational, or transformation flows that can help later AI refinement. It is especially useful when handoffs, decision points, pain points, or multi-step support needs matter.
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm">
            <p className="font-medium text-foreground">Contextual recommendation</p>
            <p className="mt-2 text-muted-foreground">{getInitiativeRecommendation(initiativeType)}</p>
          </div>

          {flash?.save === "success" ? <FlashBanner message="Journey Context saved to the Framing package." tone="success" /> : null}
          {flash?.analyze === "success" ? <FlashBanner message="Journey coverage analysis updated for the selected Journey Context." tone="success" /> : null}
          {flash?.message && (flash.save === "error" || flash.analyze === "error") ? (
            <FlashBanner message={flash.message} tone="error" />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!initiativeType}
              onClick={() => {
                if (!initiativeType) {
                  return;
                }

                setContexts((current) => [...current, createEmptyJourneyContext(data.outcome.id, initiativeType)]);
              }}
              type="button"
            >
              Add Journey Context
            </Button>

            <form action={saveAction}>
              <input name="outcomeId" type="hidden" value={data.outcome.id} />
              <input name="journeyContextsJson" type="hidden" value={serializedContexts} />
              <Button type="submit" variant="secondary">Save Journey Context</Button>
            </form>
          </div>

          {!initiativeType ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Journey Context auto-binds to the current outcome and its initiative type. Set AD, AT, or AM in Framing Overview first.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {contexts.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No Journey Context added yet</CardTitle>
            <CardDescription>
              Add Journey Context when you want richer flow-based context for later AI refinement of Epics, Story Ideas, design guidance, or build guidance.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <JourneyContextSection
          availableEpics={availableEpics}
          availableFigmaRefs={availableFigmaRefs}
          availableStoryIdeas={availableStoryIdeas}
          contexts={contexts}
          onAddJourney={(contextId) =>
            setContexts((current) =>
              current.map((context) =>
                context.id === contextId
                  ? {
                      ...context,
                      journeys: [...context.journeys, createEmptyJourney()]
                    }
                  : context
              )
            )
          }
          onAddStep={(contextId, journeyId) =>
            updateJourney(contextId, journeyId, (journey) => ({
              ...journey,
              steps: [...journey.steps, createEmptyStep()]
            }))
          }
          onChangeContext={updateContext}
          onDeleteContext={(contextId) => setContexts((current) => current.filter((context) => context.id !== contextId))}
          onMoveStep={moveStep}
          onRemoveJourney={(contextId, journeyId) =>
            setContexts((current) =>
              current.map((context) =>
                context.id === contextId
                  ? {
                      ...context,
                      journeys: context.journeys.filter((journey) => journey.id !== journeyId)
                    }
                  : context
              )
            )
          }
          onRemoveStep={(contextId, journeyId, stepId) =>
            updateJourney(contextId, journeyId, (journey) => ({
              ...journey,
              steps: journey.steps.filter((step) => step.id !== stepId)
            }))
          }
          onUpdateJourney={updateJourney}
          onUpdateStep={updateStep}
          renderAnalyzeAction={(context) => (
            <form action={analyzeAction}>
              <input name="outcomeId" type="hidden" value={data.outcome.id} />
              <input name="journeyContextId" type="hidden" value={context.id} />
              <input name="journeyContextsJson" type="hidden" value={serializedContexts} />
              <Button disabled={journeyContextHasBlockingValidation(validations[context.id])} type="submit" variant="secondary">
                Analyze Journey Coverage
              </Button>
            </form>
          )}
          validations={validations}
        />
      )}

      {contexts.length > 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex flex-wrap gap-3 pt-6">
            <form action={saveAction}>
              <input name="outcomeId" type="hidden" value={data.outcome.id} />
              <input name="journeyContextsJson" type="hidden" value={serializedContexts} />
              <Button type="submit">Save Journey Context</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
