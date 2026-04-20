"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { getOutcomeWorkspaceService } from "@aas-companion/api";
import { mapAiAccelerationLevelToDownstreamAiLevel } from "@aas-companion/domain";
import { AiAssistantPanel } from "@/components/framing/ai-assistant-panel";
import { JourneyContextSection } from "@/components/framing/journey-context-section";
import {
  getJourneyContextCounts,
  journeyContextHasBlockingValidation,
  validateJourneyContext,
  type JourneyReferenceOption
} from "@/lib/framing/journey-context-ui";
import type { Journey, JourneyContext, JourneyInitiativeType, JourneyStep } from "@/lib/framing/journeyContextTypes";
import type { FramingAgentActionResult } from "@/lib/framing/agentStructuredOutputs";
import type { FramingAgentSuggestion } from "@/lib/framing/agentTypes";

type OutcomeWorkspaceData = Extract<Awaited<ReturnType<typeof getOutcomeWorkspaceService>>, { ok: true }>["data"];

type JourneyContextPageProps = {
  data: OutcomeWorkspaceData;
  saveAction: (formData: FormData) => void | Promise<void>;
  analyzeAction: (formData: FormData) => void | Promise<void>;
  runAgentAction: (formData: FormData) => Promise<FramingAgentActionResult>;
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
    steps: [],
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

export function JourneyContextPage({ data, saveAction, analyzeAction, runAgentAction, flash }: JourneyContextPageProps) {
  const journeyContextStorageAvailable =
    (data.outcome as { journeyContextsStorageAvailable?: boolean }).journeyContextsStorageAvailable !== false;
  const initiativeType =
    data.outcome.deliveryType === "AD" || data.outcome.deliveryType === "AT" || data.outcome.deliveryType === "AM"
      ? data.outcome.deliveryType
      : null;
  const initialContexts = useMemo(() => data.outcome.journeyContexts ?? [], [data.outcome.journeyContexts]);
  const [contexts, setContexts] = useState<JourneyContext[]>(initialContexts);
  const [focusedJourneyId, setFocusedJourneyId] = useState<string | null>(initialContexts[0]?.journeys[0]?.id ?? null);
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
  const initialSerializedContexts = JSON.stringify(initialContexts);
  const serializedContexts = JSON.stringify(contexts);
  const hasUnsavedChanges = serializedContexts !== initialSerializedContexts;
  const allJourneyIds = contexts.flatMap((context) => context.journeys.map((journey) => journey.id));
  const focusedContextId =
    contexts.find((context) => context.journeys.some((journey) => journey.id === focusedJourneyId))?.id ?? contexts[0]?.id ?? null;

  useEffect(() => {
    if (focusedJourneyId && allJourneyIds.includes(focusedJourneyId)) {
      return;
    }

    setFocusedJourneyId(allJourneyIds[0] ?? null);
  }, [allJourneyIds, focusedJourneyId]);

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

  function applySuggestion(suggestion: FramingAgentSuggestion) {
    if (suggestion.kind === "rewrite_journey_context") {
      setContexts((current) => {
        const existingIndex = current.findIndex((context) => context.id === suggestion.contextId);

        if (existingIndex === -1) {
          return [...current, suggestion.nextContext];
        }

        return current.map((context) => (context.id === suggestion.contextId ? suggestion.nextContext : context));
      });
      return;
    }

    if (suggestion.kind === "rewrite_journey") {
      updateJourney(suggestion.contextId, suggestion.journeyId, () => suggestion.nextJourney);
      return;
    }

    if (suggestion.kind === "rewrite_journey_step") {
      updateStep(suggestion.contextId, suggestion.journeyId, suggestion.stepId, () => suggestion.nextStep);
      return;
    }

    if (suggestion.kind === "apply_journey_coverage") {
      updateJourney(suggestion.contextId, suggestion.journeyId, (journey) => ({
        ...journey,
        coverage: suggestion.coverage
      }));
      return;
    }

    if (suggestion.kind === "link_story_idea_to_journey") {
      updateJourney(suggestion.contextId, suggestion.journeyId, (journey) => ({
        ...journey,
        linkedStoryIdeaIds: Array.from(new Set([...(journey.linkedStoryIdeaIds ?? []), suggestion.storyIdeaId]))
      }));
      return;
    }

    if (suggestion.kind === "link_epic_to_journey") {
      updateJourney(suggestion.contextId, suggestion.journeyId, (journey) => ({
        ...journey,
        linkedEpicIds: Array.from(new Set([...(journey.linkedEpicIds ?? []), suggestion.epicId]))
      }));
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Journey Context</CardTitle>
          <CardDescription>
            Optional context that clarifies the business case and helps downstream AI work with better quality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {counts.journeyCount} journey{counts.journeyCount === 1 ? "" : "s"}
            </span>
            {counts.uncoveredJourneyCount > 0 ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                {counts.uncoveredJourneyCount} uncovered
              </span>
            ) : null}
            {counts.suggestedStoryIdeaCount > 0 ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                {counts.suggestedStoryIdeaCount} suggested Story Ideas
              </span>
            ) : null}
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
            <p className="font-medium text-foreground">Use Journey Context to clarify the business case</p>
            <p className="mt-2">
              Describe a few important journeys that make the case easier to understand for people and give downstream AI better context for refinement, design, and build guidance.
            </p>
            <p className="mt-3">
              Treat Journey Context mainly as this page and export section. The actual value should sit in the Journeys: who is involved, what they are trying to achieve, what triggers the work, and where today&apos;s friction exists.
            </p>
            <p className="mt-3 text-sky-900/85">{getInitiativeRecommendation(initiativeType)}</p>
          </div>

          <div
            className={`rounded-2xl border px-4 py-4 text-sm ${
              hasUnsavedChanges
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-border/70 bg-muted/10 text-muted-foreground"
            }`}
          >
            {hasUnsavedChanges
              ? "You have local Journey Context changes that are not saved to the Framing package yet."
              : "Journey Context is saved and in sync with the current Framing package."}
          </div>

          {flash?.save === "success" ? <FlashBanner message="Journeys saved to the Framing package." tone="success" /> : null}
          {flash?.analyze === "success" ? <FlashBanner message="Journey coverage analysis updated for the selected Journey Context." tone="success" /> : null}
          {flash?.message && (flash.save === "error" || flash.analyze === "error") ? (
            <FlashBanner message={flash.message} tone="error" />
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {contexts.length === 0 ? (
              <Button
                disabled={!initiativeType}
                onClick={() => {
                  if (!initiativeType) {
                    return;
                  }

                  const nextContext = createEmptyJourneyContext(data.outcome.id, initiativeType);
                  setContexts([nextContext]);
                  setFocusedJourneyId(nextContext.journeys[0]?.id ?? null);
                }}
                type="button"
              >
                Start Journeys
              </Button>
            ) : null}

            <form action={saveAction}>
              <input name="outcomeId" type="hidden" value={data.outcome.id} />
              <input name="journeyContextsJson" type="hidden" value={serializedContexts} />
              <Button disabled={!hasUnsavedChanges} type="submit" variant="secondary">
                Save Journeys
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              Start with one important Journey that clarifies the case. Add more only when they represent a meaningfully different flow.
            </p>
          </div>

          {!initiativeType ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Journey Context auto-binds to the current outcome and its initiative type. Set AD, AT, or AM in Framing Overview first.
            </div>
          ) : null}

          {!journeyContextStorageAvailable ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Journey Context is visible, but the database migration is not applied yet. The Framing route will still load, but Journey Context changes cannot be saved until the latest migration runs.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <details className="rounded-[28px] border border-border/70 bg-background shadow-sm" open={contexts.length === 0}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-base font-semibold text-foreground">Step-by-step help</p>
            <p className="text-sm text-muted-foreground">
              Use this when you want help clarifying one Journey at a time for the business case. It starts with the Journey itself.
              You do not need to invent a separate Journey Context name first.
            </p>
          </div>
          <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
            {contexts.length === 0 ? "Recommended to start" : "Optional"}
          </span>
        </summary>
        <div className="border-t border-border/70 px-5 py-5">
          <AiAssistantPanel
            aiLevel={mapAiAccelerationLevelToDownstreamAiLevel(data.outcome.aiAccelerationLevel)}
            epicLabels={availableEpics.map((option) => option.label)}
            focusedJourneyId={focusedJourneyId}
            hasUnsavedChanges={hasUnsavedChanges}
            initiativeType={initiativeType}
            journeyContextsJson={serializedContexts}
            onApplySuggestion={applySuggestion}
            onFocusJourney={setFocusedJourneyId}
            outcomeId={data.outcome.id}
            runAction={runAgentAction}
            scopeEntityId={focusedContextId}
            scopeKind="journey-context"
            scopeLabel="Journey Context"
            storyIdeaLabels={availableStoryIdeas.map((option) => option.label)}
          />
        </div>
      </details>

      {contexts.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No Journeys added yet</CardTitle>
            <CardDescription>
              Add one or more broad Journeys when you want richer flow-based context for later AI refinement of Epics, Story Ideas, design guidance, or build guidance.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <JourneyContextSection
          availableEpics={availableEpics}
          availableFigmaRefs={availableFigmaRefs}
          availableStoryIdeas={availableStoryIdeas}
          contexts={contexts}
          focusedJourneyId={focusedJourneyId}
          onAddJourney={(contextId) =>
            {
              const nextJourney = createEmptyJourney();

              setContexts((current) =>
                current.map((context) =>
                  context.id === contextId
                    ? {
                        ...context,
                        journeys: [...context.journeys, nextJourney]
                      }
                    : context
                )
              );
              setFocusedJourneyId(nextJourney.id);
            }
          }
          onAddStep={(contextId, journeyId) =>
            updateJourney(contextId, journeyId, (journey) => ({
              ...journey,
              steps: [...journey.steps, createEmptyStep()]
            }))
          }
          onChangeContext={updateContext}
          onDeleteContext={(contextId) => setContexts((current) => current.filter((context) => context.id !== contextId))}
          onFocusJourney={setFocusedJourneyId}
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
    </div>
  );
}
