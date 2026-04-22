"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button, Card, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { getOutcomeWorkspaceService } from "@aas-companion/api";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { FramingPackagePageHero } from "@/components/framing/framing-package-page-hero";
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

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
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
    narrative: "",
    valueMoment: "",
    successSignals: [],
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

function getInitiativeRecommendation(language: "en" | "sv", initiativeType: JourneyInitiativeType | null) {
  if (initiativeType === "AD") {
    return t(
      language,
      "Recommended when user flows, role-based experiences, or end-to-end support matter.",
      "Rekommenderas när användarflöden, rollbaserade upplevelser eller end-to-end-stöd är viktiga."
    );
  }

  if (initiativeType === "AT") {
    return t(
      language,
      "Strongly recommended when the change affects multiple roles, process continuity, handoffs, or the relationship between current and future ways of working.",
      "Rekommenderas starkt när förändringen påverkar flera roller, processkontinuitet, överlämningar eller samspelet mellan nuvarande och framtida arbetssätt."
    );
  }

  if (initiativeType === "AM") {
    return t(
      language,
      "Useful when incident, support, operations, or change flows need to be understood more clearly.",
      "Användbart när incident-, support-, drift- eller förändringsflöden behöver förstås tydligare."
    );
  }

  return t(
    language,
    "Set the initiative type in Framing Overview first so the Journey page can inherit the right starting point.",
    "Sätt initiativtyp i Framing Overview först så att Journey-sidan kan ärva rätt utgångsläge."
  );
}

function FlashBanner(props: { tone: "success" | "error"; message: string }) {
  const classes =
    props.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>{props.message}</div>;
}

export function JourneyContextPage({ data, saveAction, analyzeAction, flash }: JourneyContextPageProps) {
  const { language } = useAppChromeLanguage();
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
          label: t(language, "Right now", "Just nu"),
          title: t(language, "Start with one broad journey", "Börja med en bred journey"),
          description:
            t(language, "Create a journey that clarifies the business case. Start broad and capture only actor, goal, trigger, and today's friction.", "Skapa en journey som förtydligar business caset. Börja brett och fånga bara aktör, mål, trigger och dagens friktion."),
          nextAction: t(language, "Click Start journeys and then describe one important journey.", "Klicka på Starta journeys och beskriv sedan en viktig journey.")
        }
      : focusedJourney && getJourneyCoreMissingCount(focusedJourney) > 0
        ? {
            label: t(language, "Right now", "Just nu"),
            title: t(language, "Clarify the current journey", "Förtydliga den aktuella journeyn"),
            description:
              t(language, "Make one journey clear enough before adding more detail. Start with title, primary actor, goal, and trigger.", "Få en journey tillräckligt tydlig innan du lägger till mer detalj. Fyll först i titel, huvudaktör, mål och trigger."),
            nextAction: t(language, "Write directly in the journey card and use the AI help in the same card when you want better wording or a first draft.", "Skriv direkt i journey-kortet och använd AI-hjälpen direkt i samma kort när du vill få bättre formuleringar eller ett första utkast.")
          }
        : analyzedJourneys.length === 0
          ? {
              label: t(language, "Next natural step", "Nästa naturliga steg"),
              title: t(language, "Check coverage when a journey is clear", "Kontrollera täckning när en journey är tydlig"),
              description:
                t(language, "When at least one journey has the basics in place, you can compare it with Epics and Story Ideas to find gaps and likely links.", "När minst en journey har grunderna på plats kan du jämföra den med Epics och Story Ideas för att hitta luckor och sannolika kopplingar."),
              nextAction: t(language, "Run Analyze coverage when the current journey feels clear enough in direction.", "Kör Analysera täckning när den aktuella journeyn känns tillräckligt rätt i riktningen.")
            }
          : {
              label: t(language, "Journeys in progress", "Journeys pågår"),
              title: t(language, "Refine only where it adds value", "Förfina bara där det tillför värde"),
              description:
                t(language, "You already have useful journeys and at least one coverage analysis. Add a new journey only if it represents a genuinely different flow.", "Du har redan användbara journeys och minst en täckningsanalys. Lägg bara till en ny journey om den representerar ett genuint annat flöde."),
              nextAction: t(language, "Refine wording, analyze another journey, or leave it as-is if it already provides enough direction.", "Förtydliga formuleringar, analysera en annan journey eller låt det vara om det redan ger tillräcklig riktning.")
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
      <FramingPackagePageHero
        actions={
          <>
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
                {t(language, "Start journeys", "Starta journeys")}
              </Button>
            ) : null}

            <form action={saveAction}>
              <input name="outcomeId" type="hidden" value={data.outcome.id} />
              <input name="journeyContextsJson" type="hidden" value={serializedContexts} />
              <Button disabled={!hasUnsavedChanges} type="submit">
                {t(language, "Save journeys", "Spara journeys")}
              </Button>
            </form>
          </>
        }
        badge={t(language, "Journey Context", "Journey Context")}
        chips={
          <>
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
              {t(language, "Outcome", "Utfall")} {data.outcome.key}
            </span>
            {initiativeType ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                {initiativeType}
              </span>
            ) : null}
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
              {counts.journeyCount} {t(language, counts.journeyCount === 1 ? "journey" : "journeys", counts.journeyCount === 1 ? "journey" : "journeys")}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                hasUnsavedChanges
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {hasUnsavedChanges ? t(language, "Unsaved draft", "Osparat utkast") : t(language, "Saved", "Sparat")}
            </span>
          </>
        }
        description={t(
          language,
          "Optional context that clarifies the business case and helps downstream AI work with higher quality.",
          "Frivillig kontext som förtydligar business caset och hjälper downstream AI att arbeta med högre kvalitet."
        )}
        title={t(language, "Journey Context", "Journey Context")}
      >
        <div className="space-y-4">
          {flash?.save === "success" ? <FlashBanner message={t(language, "Journeys were saved in the Framing package.", "Journeys sparades i Framing-paketet.")} tone="success" /> : null}
          {flash?.analyze === "success" ? (
            <FlashBanner
              message={t(language, "The journey analysis was updated for the selected area.", "Journey-analysen uppdaterades för den valda ytan.")}
              tone="success"
            />
          ) : null}
          {flash?.message && (flash.save === "error" || flash.analyze === "error") ? (
            <FlashBanner message={flash.message} tone="error" />
          ) : null}

          <details
            className="group rounded-2xl border border-border/70 bg-background shadow-sm"
            onToggle={(event) => setShowPageGuidance((event.currentTarget as HTMLDetailsElement).open)}
            open={showPageGuidance}
          >
            <summary className="cursor-pointer list-none px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
                      {t(language, "Optional", "Valfritt")}
                    </span>
                    <p className="text-sm font-semibold text-foreground">{t(language, "Guidance and current status", "Vägledning och nuläge")}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      language,
                      "Open for usage advice, the current focus, and quick readiness signals before you refine more journeys.",
                      "Öppna för råd om användning, aktuellt fokus och snabba readiness-signaler innan du förfinar fler journeys."
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border/70 bg-muted/10 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {counts.journeyCount} {t(language, counts.journeyCount === 1 ? "journey" : "journeys", counts.journeyCount === 1 ? "journey" : "journeys")}
                  </span>
                  <span className="rounded-full border border-border/70 bg-muted/10 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {readyJourneys.length} {t(language, "ready", "redo")}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-white shadow-sm">
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
                  </span>
                </div>
              </div>
            </summary>
            <div className="grid gap-4 border-t border-border/70 px-4 py-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                <p className="font-medium text-foreground">{t(language, "Use journeys to clarify the business case", "Använd journeys för att förtydliga business caset")}</p>
                <p className="mt-2">
                  {t(
                    language,
                    "Add a few important journeys when they make the case clearer and give downstream AI better context for refinement, design, and build support.",
                    "Lägg till några få viktiga journeys när de gör caset tydligare och ger downstream AI bättre kontext för förfining, design och byggstöd."
                  )}
                </p>
                <p className="mt-3">
                  {t(
                    language,
                    "The value sits in the journeys themselves: who is involved, what they are trying to achieve, what triggers the work, and where today's friction is.",
                    "Värdet sitter i journeys i sig: vem som är involverad, vad de försöker uppnå, vad som triggar arbetet och var dagens friktion finns."
                  )}
                </p>
                <p className="mt-3 text-sky-900/85">{getInitiativeRecommendation(language, initiativeType)}</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{currentFlowStep.label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{currentFlowStep.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentFlowStep.description}</p>
                  <p className="mt-3 text-sm font-medium text-foreground">{t(language, "Next step:", "Nästa steg:")} {currentFlowStep.nextAction}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t(language, "Coverage status", "Täckningsstatus")}</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {readyJourneys.length > 0
                        ? t(language, `${readyJourneys.length} ready for analysis`, `${readyJourneys.length} redo för analys`)
                        : t(language, "No journey is ready for analysis yet", "Ingen journey är redo för analys ännu")}
                    </p>
                    {(counts.uncoveredJourneyCount > 0 || counts.suggestedStoryIdeaCount > 0) ? (
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {counts.uncoveredJourneyCount > 0
                          ? language === "sv"
                            ? `${counts.uncoveredJourneyCount} otäckt${counts.uncoveredJourneyCount === 1 ? "" : "a"} journey${counts.uncoveredJourneyCount === 1 ? "" : "s"}`
                            : `${counts.uncoveredJourneyCount} uncovered journey${counts.uncoveredJourneyCount === 1 ? "" : "s"}`
                          : ""}
                        {counts.uncoveredJourneyCount > 0 && counts.suggestedStoryIdeaCount > 0 ? " · " : ""}
                        {counts.suggestedStoryIdeaCount > 0
                          ? language === "sv"
                            ? `${counts.suggestedStoryIdeaCount} föreslag${counts.suggestedStoryIdeaCount === 1 ? "en" : "na"} Story Idea${counts.suggestedStoryIdeaCount === 1 ? "" : "s"}`
                            : `${counts.suggestedStoryIdeaCount} suggested Story Idea${counts.suggestedStoryIdeaCount === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t(language, "Initiative fit", "Initiativpassform")}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{getInitiativeRecommendation(language, initiativeType)}</p>
                  </div>
                </div>
              </div>

              {!initiativeType ? (
                <div className="xl:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {t(
                    language,
                    "The Journey page is automatically bound to the current outcome and its initiative type. Set AD, AT, or AM in Framing Overview first.",
                    "Journey-sidan binds automatiskt till aktuellt outcome och dess initiativtyp. Sätt AD, AT eller AM i Framing Overview först."
                  )}
                </div>
              ) : null}

              {!journeyContextStorageAvailable ? (
                <div className="xl:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {t(
                    language,
                    "The Journey page is visible, but the database migration has not been applied yet. The Framing route still loads, but Journey changes cannot be saved until the latest migration has run.",
                    "Journey-sidan är synlig, men databasmigreringen är ännu inte applicerad. Framing-routen laddar ändå, men Journey-ändringar kan inte sparas förrän senaste migreringen körts."
                  )}
                </div>
              ) : null}
            </div>
          </details>
        </div>
      </FramingPackagePageHero>

      {contexts.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{t(language, "No journeys added yet", "Inga journeys tillagda ännu")}</CardTitle>
            <CardDescription>
              {t(
                language,
                "Add one or more broad journeys when you want richer flow context for later AI refinement of Epics, Story Ideas, design support, or build support.",
                "Lägg till en eller flera breda journeys när du vill ge rikare flödeskontext för senare AI-förfining av Epics, Story Ideas, designstöd eller byggstöd."
              )}
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              {t(
                language,
                "AI help appears directly inside the journey card once you have started your first journey.",
                "AI-hjälpen visas direkt inne i journey-kortet när du har startat din första journey."
              )}
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
              <Button className="h-10 rounded-full px-4" disabled={journeyContextHasBlockingValidation(validations[context.id])} type="submit" variant="secondary">
                {t(language, "Analyze coverage", "Analysera täckning")}
              </Button>
            </form>
          )}
          validations={validations}
        />
      )}
    </div>
  );
}

