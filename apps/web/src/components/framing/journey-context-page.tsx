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

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function getJourneyCoreMissingCount(journey: Journey) {
  return [
    hasText(journey.title),
    hasText(journey.primaryActor),
    hasText(journey.goal),
    hasText(journey.trigger)
  ].filter((entry) => !entry).length;
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
    return "Rekommenderas när användarflöden, rollbaserade upplevelser eller end-to-end-stöd är viktiga.";
  }

  if (initiativeType === "AT") {
    return "Rekommenderas starkt när förändringen påverkar flera roller, processkontinuitet, överlämningar eller samspelet mellan nuvarande och framtida arbetssätt.";
  }

  if (initiativeType === "AM") {
    return "Användbart när incident-, support-, drift- eller förändringsflöden behöver förstås tydligare.";
  }

  return "Sätt initiativtyp i Framing Overview först så att Journey-sidan kan ärva rätt utgångsläge.";
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
  const allJourneys = contexts.flatMap((context) => context.journeys);
  const focusedJourney = allJourneys.find((journey) => journey.id === focusedJourneyId) ?? allJourneys[0] ?? null;
  const readyJourneys = allJourneys.filter((journey) => getJourneyCoreMissingCount(journey) === 0);
  const analyzedJourneys = allJourneys.filter((journey) => (journey.coverage?.status ?? "unanalysed") !== "unanalysed");
  const currentFlowStep =
    allJourneys.length === 0
      ? {
          step: "Steg 1 av 3",
          title: "Börja med en bred journey",
          description:
            "Skapa en journey som förtydligar business caset. Börja brett och fånga bara aktör, mål, trigger och dagens friktion.",
          nextAction: "Klicka på Starta journeys och beskriv sedan en viktig journey."
        }
      : focusedJourney && getJourneyCoreMissingCount(focusedJourney) > 0
        ? {
            step: "Steg 2 av 3",
            title: "Förtydliga den aktuella journeyn",
            description:
              "Få en journey tillräckligt tydlig innan du lägger till mer detalj. Fyll först i titel, huvudaktör, mål och trigger.",
            nextAction: "Skriv direkt i journey-kortet eller använd AI-hjälpen nedanför en fråga i taget."
          }
        : analyzedJourneys.length === 0
          ? {
              step: "Steg 3 av 3",
              title: "Kontrollera täckning när en journey är tydlig",
              description:
                "När minst en journey har grunderna på plats kan du jämföra den med Epics och Story Ideas för att hitta luckor och sannolika kopplingar.",
              nextAction: "Kör Analysera täckning när den aktuella journeyn känns tillräckligt rätt i riktningen."
            }
          : {
              step: "Journeys pågår",
              title: "Förfina bara där det tillför värde",
              description:
                "Du har redan användbara journeys och minst en täckningsanalys. Lägg bara till en ny journey om den representerar ett genuint annat flöde.",
              nextAction: "Förtydliga formuleringar, analysera en annan journey eller låt det vara om det redan ger tillräcklig riktning."
            };

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
            Frivillig kontext som förtydligar business caset och hjälper downstream AI att arbeta med högre kvalitet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              Outcome {data.outcome.key}
            </span>
            {initiativeType ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                {initiativeType}
              </span>
            ) : null}
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {counts.journeyCount} journey{counts.journeyCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
            <p className="font-medium text-foreground">Använd journeys för att förtydliga business caset</p>
            <p className="mt-2">
              Lägg till några få viktiga journeys när de gör caset tydligare och ger downstream AI bättre kontext för förfining, design och byggstöd.
            </p>
            <p className="mt-3">
              Värdet sitter i journeys i sig: vem som är involverad, vad de försöker uppnå, vad som triggar arbetet och var dagens friktion finns.
            </p>
            <p className="mt-3 text-sky-900/85">{getInitiativeRecommendation(initiativeType)}</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{currentFlowStep.step}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{currentFlowStep.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentFlowStep.description}</p>
            <p className="mt-3 text-sm font-medium text-foreground">Nästa steg: {currentFlowStep.nextAction}</p>
            {(counts.uncoveredJourneyCount > 0 || counts.suggestedStoryIdeaCount > 0 || readyJourneys.length > 0) ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {readyJourneys.length > 0 ? `${readyJourneys.length} redo för analys` : "Ingen journey är redo för analys ännu"}
                {counts.uncoveredJourneyCount > 0 ? ` · ${counts.uncoveredJourneyCount} otäckt${counts.uncoveredJourneyCount === 1 ? "" : "a"} journey${counts.uncoveredJourneyCount === 1 ? "" : "s"}` : ""}
                {counts.suggestedStoryIdeaCount > 0 ? ` · ${counts.suggestedStoryIdeaCount} föreslag${counts.suggestedStoryIdeaCount === 1 ? "en" : "na"} Story Idea${counts.suggestedStoryIdeaCount === 1 ? "" : "s"}` : ""}
              </p>
            ) : null}
          </div>

          <div
            className={`rounded-2xl border px-4 py-4 text-sm ${
              hasUnsavedChanges
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-border/70 bg-muted/10 text-muted-foreground"
            }`}
          >
            {hasUnsavedChanges
              ? "Du har lokala Journey-ändringar som ännu inte är sparade i Framing-paketet."
              : "Journey-sidan är sparad och i synk med det aktuella Framing-paketet."}
          </div>

          {flash?.save === "success" ? <FlashBanner message="Journeys sparades i Framing-paketet." tone="success" /> : null}
          {flash?.analyze === "success" ? <FlashBanner message="Journey-analysen uppdaterades för den valda ytan." tone="success" /> : null}
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
                Starta journeys
              </Button>
            ) : null}

            <form action={saveAction}>
              <input name="outcomeId" type="hidden" value={data.outcome.id} />
              <input name="journeyContextsJson" type="hidden" value={serializedContexts} />
              <Button disabled={!hasUnsavedChanges} type="submit" variant="secondary">
                Spara journeys
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              Börja med en viktig journey som förtydligar caset. Lägg bara till fler när de representerar ett meningsfullt annorlunda flöde.
            </p>
          </div>

          {!initiativeType ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Journey-sidan binds automatiskt till aktuellt outcome och dess initiativtyp. Sätt AD, AT eller AM i Framing Overview först.
            </div>
          ) : null}

          {!journeyContextStorageAvailable ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Journey-sidan är synlig, men databasmigreringen är ännu inte applicerad. Framing-routen laddar ändå, men Journey-ändringar kan inte sparas förrän senaste migreringen körts.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <details className="rounded-[28px] border border-border/70 bg-background shadow-sm" open={contexts.length === 0}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-base font-semibold text-foreground">Få hjälp med nästa steg</p>
            <p className="text-sm text-muted-foreground">
              Här använder du AI-hjälpen. Verktyget guidar dig en journey i taget och börjar med själva journeyn, inte med ett separat Journey Context-namn.
            </p>
          </div>
          <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
            {contexts.length === 0 ? "Bra att börja här" : "Valfritt stöd"}
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
            <CardTitle>Inga journeys tillagda ännu</CardTitle>
            <CardDescription>
              Lägg till en eller flera breda journeys när du vill ge rikare flödeskontext för senare AI-förfining av Epics, Story Ideas, designstöd eller byggstöd.
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
                Analysera täckning
              </Button>
            </form>
          )}
          validations={validations}
        />
      )}
    </div>
  );
}
