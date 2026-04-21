"use client";

import { useEffect, useMemo, useState } from "react";
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

export function JourneyContextPage({ data, saveAction, analyzeAction, flash }: JourneyContextPageProps) {
  const journeyContextStorageAvailable =
    (data.outcome as { journeyContextsStorageAvailable?: boolean }).journeyContextsStorageAvailable !== false;
  const initiativeType =
    data.outcome.deliveryType === "AD" || data.outcome.deliveryType === "AT" || data.outcome.deliveryType === "AM"
      ? data.outcome.deliveryType
      : null;
  const initialContexts = useMemo(() => data.outcome.journeyContexts ?? [], [data.outcome.journeyContexts]);
  const [contexts, setContexts] = useState<JourneyContext[]>(initialContexts);
  const [focusedJourneyId, setFocusedJourneyId] = useState<string | null>(initialContexts[0]?.journeys[0]?.id ?? null);
  const [showPageGuidance, setShowPageGuidance] = useState(false);
  const availableEpics: JourneyReferenceOption[] = data.outcome.epics.map((epic) => ({
    id: epic.id,
    label: `${epic.key} - ${epic.title}`,
    ...(hasText([epic.purpose, epic.scopeBoundary].filter(hasText).join(" "))
      ? { description: [epic.purpose, epic.scopeBoundary].filter(hasText).join(" ") }
      : {}),
    ...(hasText(epic.purpose) ? { purpose: epic.purpose ?? "" } : {}),
    ...(hasText(epic.scopeBoundary) ? { scopeBoundary: epic.scopeBoundary ?? "" } : {})
  }));
  const availableStoryIdeas: JourneyReferenceOption[] = data.outcome.directionSeeds.map((seed) => ({
    id: seed.id,
    label: `${seed.key} - ${seed.title}`,
    ...(hasText(seed.shortDescription) ? { description: seed.shortDescription ?? "" } : {}),
    ...(hasText(seed.shortDescription) ? { valueIntent: seed.shortDescription ?? "" } : {}),
    ...(hasText(seed.expectedBehavior) ? { expectedBehavior: seed.expectedBehavior ?? "" } : {})
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
  const allJourneys = contexts.flatMap((context) => context.journeys);
  const focusedJourney = allJourneys.find((journey) => journey.id === focusedJourneyId) ?? allJourneys[0] ?? null;
  const readyJourneys = allJourneys.filter((journey) => getJourneyCoreMissingCount(journey) === 0);
  const analyzedJourneys = allJourneys.filter((journey) => (journey.coverage?.status ?? "unanalysed") !== "unanalysed");
  const currentFlowStep =
    allJourneys.length === 0
      ? {
          label: "Just nu",
          title: "Börja med en bred journey",
          description:
            "Skapa en journey som förtydligar business caset. Börja brett och fånga bara aktör, mål, trigger och dagens friktion.",
          nextAction: "Klicka på Starta journeys och beskriv sedan en viktig journey."
        }
      : focusedJourney && getJourneyCoreMissingCount(focusedJourney) > 0
        ? {
            label: "Just nu",
            title: "Förtydliga den aktuella journeyn",
            description:
              "Få en journey tillräckligt tydlig innan du lägger till mer detalj. Fyll först i titel, huvudaktör, mål och trigger.",
            nextAction: "Skriv direkt i journey-kortet och använd AI-hjälpen direkt i samma kort när du vill få bättre formuleringar eller ett första utkast."
          }
        : analyzedJourneys.length === 0
          ? {
              label: "Nästa naturliga steg",
              title: "Kontrollera täckning när en journey är tydlig",
              description:
                "När minst en journey har grunderna på plats kan du jämföra den med Epics och Story Ideas för att hitta luckor och sannolika kopplingar.",
              nextAction: "Kör Analysera täckning när den aktuella journeyn känns tillräckligt rätt i riktningen."
            }
          : {
              label: "Journeys pågår",
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

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div>
                <CardTitle>Journey Context</CardTitle>
                <CardDescription>
                  Frivillig kontext som förtydligar business caset och hjälper downstream AI att arbeta med högre kvalitet.
                </CardDescription>
              </div>
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
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    hasUnsavedChanges
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {hasUnsavedChanges ? "Osparat utkast" : "Sparat"}
                </span>
              </div>
            </div>

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
                <Button disabled={!hasUnsavedChanges} type="submit">
                  Spara journeys
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {flash?.save === "success" ? <FlashBanner message="Journeys sparades i Framing-paketet." tone="success" /> : null}
          {flash?.analyze === "success" ? <FlashBanner message="Journey-analysen uppdaterades för den valda ytan." tone="success" /> : null}
          {flash?.message && (flash.save === "error" || flash.analyze === "error") ? (
            <FlashBanner message={flash.message} tone="error" />
          ) : null}

          <details
            className="rounded-2xl border border-border/70 bg-muted/10"
            onToggle={(event) => setShowPageGuidance((event.currentTarget as HTMLDetailsElement).open)}
            open={showPageGuidance}
          >
            <summary className="cursor-pointer list-none px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Visa vägledning och status</p>
                  <p className="text-sm text-muted-foreground">Öppna bara när du vill läsa rekommendationer, nuläge och extra information.</p>
                </div>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {showPageGuidance ? "Dölj" : "Visa"}
                </span>
              </div>
            </summary>
            <div className="space-y-4 border-t border-border/70 px-4 py-4">
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

              <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{currentFlowStep.label}</p>
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
            </div>
          </details>
        </CardContent>
      </Card>

      {contexts.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Inga journeys tillagda ännu</CardTitle>
            <CardDescription>
              Lägg till en eller flera breda journeys när du vill ge rikare flödeskontext för senare AI-förfining av Epics, Story Ideas, designstöd eller byggstöd.
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              AI-hjälpen visas direkt inne i journey-kortet när du har startat din första journey.
            </p>
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
