"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import {
  buildDefaultFramingAgentPrompt,
  framingAgentIntroText,
  framingAgentModeLabels,
  framingAgentQuickActions
} from "@/lib/framing/agentModes";
import type { FramingAgentActionResult } from "@/lib/framing/agentStructuredOutputs";
import type { JourneyContext, JourneyInitiativeType } from "@/lib/framing/journeyContextTypes";
import type {
  FramingAgentMode,
  FramingAgentScopeKind,
  FramingAgentSuggestion
} from "@/lib/framing/agentTypes";

type AiAssistantPanelProps = {
  outcomeId: string;
  initiativeType: "AD" | "AT" | "AM" | null;
  aiLevel: 0 | 1 | 2 | 3;
  embedded?: boolean;
  scopeKind: FramingAgentScopeKind;
  scopeLabel: string;
  scopeEntityId?: string | null;
  focusedJourneyId?: string | null;
  onFocusJourney?: (journeyId: string | null) => void;
  hasUnsavedChanges?: boolean;
  runAction: (formData: FormData) => Promise<FramingAgentActionResult>;
  journeyContextsJson?: string | null;
  downstreamAiInstructionsJson?: string | null;
  epicLabels?: string[];
  epicOptions?: Array<{ id: string; label: string }>;
  storyIdeaLabels?: string[];
  onApplySuggestion?: (suggestion: FramingAgentSuggestion) => void;
  createStoryIdeaAction?: (formData: FormData) => void | Promise<void>;
};

type ConversationEntry = {
  id: string;
  createdAt: string;
  mode: FramingAgentMode;
  prompt: string;
  message: string;
  scopeLabel: string;
};

type GuidedJourneyField =
  | "journeyTitle"
  | "primaryActor"
  | "goal"
  | "trigger"
  | "currentState"
  | "desiredFutureState";

type GuidedJourneyInterviewTarget = {
  context: JourneyContext;
  journey: JourneyContext["journeys"][number];
  field: GuidedJourneyField;
  question: string;
  placeholder: string;
  helper: string;
  promptKey: string;
  totalMissing: number;
  skippedMissing: number;
};

type GuidedJourneyInterviewState = {
  target: GuidedJourneyInterviewTarget | null;
  isComplete: boolean;
  hasOnlySkippedQuestions: boolean;
  contextCount: number;
  journeyCount: number;
  focusedJourneyLabel: string | null;
};

type JourneyFocusOption = {
  journeyId: string;
  contextId: string;
  label: string;
};

type JourneyDraftTarget = {
  context: JourneyContext;
  journey: JourneyContext["journeys"][number];
  journeyLabel: string;
};

type StoryIdeaCandidateSuggestion = Extract<FramingAgentSuggestion, { kind: "story_idea_candidate" }>;

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildHistoryKey(outcomeId: string) {
  return `framing-ai-history:${outcomeId}`;
}

function buildDismissedKey(outcomeId: string) {
  return `framing-ai-dismissed:${outcomeId}`;
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function createStarterJourney(id: string): JourneyContext["journeys"][number] {
  return {
    id,
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

function createStarterJourneyContext(outcomeId: string, initiativeType: "AD" | "AT" | "AM" | null): JourneyContext {
  return {
    id: `journey-context-${outcomeId}`,
    outcomeId,
    initiativeType: (initiativeType ?? "AD") as JourneyInitiativeType,
    title: "",
    description: "",
    journeys: [createStarterJourney(`journey-${outcomeId}`)],
    notes: ""
  };
}

function parseJourneyContextsJson(raw: string | null | undefined) {
  if (!raw) {
    return [] as JourneyContext[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as JourneyContext[]) : [];
  } catch {
    return [];
  }
}

function buildJourneyFieldLabel(journey: JourneyContext["journeys"][number], index: number) {
  if (hasText(journey.title)) {
    return `"${journey.title.trim()}"`;
  }

  return index === 0 ? "den här journeyn" : `journey ${index + 1}`;
}

function formatReferencePreview(labels: string[] | undefined, max = 3) {
  if (!labels || labels.length === 0) {
    return "";
  }

  const preview = labels.slice(0, max).join(", ");
  return labels.length > max ? `${preview}, och ${labels.length - max} till` : preview;
}

function hasCoreJourneyInputs(journey: JourneyContext["journeys"][number]) {
  return hasText(journey.title) && hasText(journey.primaryActor) && hasText(journey.goal) && hasText(journey.trigger);
}

function buildGuidedJourneyPrompt(
  input: {
    field: GuidedJourneyField;
    journeyLabel: string;
    context: JourneyContext;
    storyIdeaLabels: string[] | undefined;
    epicLabels: string[] | undefined;
  }
): Pick<GuidedJourneyInterviewTarget, "question" | "placeholder" | "helper"> {
  const storyIdeaPreview = formatReferencePreview(input.storyIdeaLabels);
  const epicPreview = formatReferencePreview(input.epicLabels);

  switch (input.field) {
    case "journeyTitle":
      return {
        question: `Vad ska ${input.journeyLabel} heta?`,
        placeholder: "Exempel: Inventera förråd",
        helper: `Använd ett kort verbdrivet namn som beskriver hela flödet.${storyIdeaPreview ? ` Om det passar, gör det tillräckligt brett för Story Ideas som ${storyIdeaPreview}.` : ""}`
      };
    case "primaryActor":
      return {
        question: `Vem är huvudaktör i ${input.journeyLabel}?`,
        placeholder: "Exempel: Privatperson",
        helper: `Namnge den roll som driver journeyn.${epicPreview ? ` Befintliga Epics som ${epicPreview} kan hjälpa dig att se var aktören passar in.` : ""}`
      };
    case "goal":
      return {
        question: `Vad är huvudmålet i ${input.journeyLabel}?`,
        placeholder: "Exempel: Få koll på förrådet utan manuell dubbelkoll",
        helper: `Beskriv vad aktören försöker uppnå, inte vilken skärm personen behöver.${storyIdeaPreview ? ` Om Story Ideas redan finns, beskriv vilket gemensamt utfall de ska bidra till: ${storyIdeaPreview}.` : ""}`
      };
    case "trigger":
      return {
        question: `Vad brukar trigga ${input.journeyLabel}?`,
        placeholder: "Exempel: Månaden närmar sig sitt slut och förrådet behöver kontrolleras",
        helper: `Beskriv vad som startar flödet.${storyIdeaPreview ? ` Du kan använda befintliga Story Ideas som ledtrådar till vilken händelse, begäran eller överlämning som brukar starta arbetet.` : ""}`
      };
    case "currentState":
      return {
        question: `Hur fungerar ${input.journeyLabel} i dag?`,
        placeholder: "Exempel: Jag går runt hemma, tittar i skåp och försöker minnas vad som saknas",
        helper: `Fokusera på friktion, fragmentering, fördröjningar eller oklarhet i nuvarande flöde.${storyIdeaPreview ? ` Om Story Ideas redan finns, förklara vad som fortfarande är rörigt, långsamt eller oklart runt dem.` : ""}`
      };
    case "desiredFutureState":
      return {
        question: `Hur ska ${input.journeyLabel} fungera i önskat läge?`,
        placeholder: "Exempel: Jag ser direkt vad som finns, vad som saknas och vad jag behöver fylla på",
        helper: `Beskriv bättre stöd och smidigare flöde, inte detaljerad UI-design.${storyIdeaPreview ? ` Om Story Ideas redan finns, beskriv hur de ska fungera tillsammans när journeyn fungerar väl.` : ""}`
      };
  }
}

function buildGuidedJourneyInterviewState(input: {
  outcomeId: string;
  initiativeType: "AD" | "AT" | "AM" | null;
  rawJourneyContexts: JourneyContext[];
  skippedPromptKeys: string[];
  focusedJourneyId: string | null;
  epicLabels: string[] | undefined;
  storyIdeaLabels: string[] | undefined;
}): GuidedJourneyInterviewState {
  const normalizedContexts = input.rawJourneyContexts.length > 0 ? input.rawJourneyContexts : [createStarterJourneyContext(input.outcomeId, input.initiativeType)];
  const skipped = new Set(input.skippedPromptKeys);
  const missingTargets: GuidedJourneyInterviewTarget[] = [];
  let journeyCount = 0;
  let focusedJourneyLabel: string | null = null;

  for (const context of normalizedContexts) {
    const journeys =
      context.journeys.length > 0
        ? context.journeys
        : [createStarterJourney(`journey-${context.id}`)];
    const firstJourney = journeys[0];

    if (!firstJourney) {
      continue;
    }

    journeyCount += journeys.length;

    journeys.forEach((journey, index) => {
      if (input.focusedJourneyId && journey.id !== input.focusedJourneyId) {
        return;
      }

      const journeyLabel = buildJourneyFieldLabel(journey, index);

      if (journey.id === input.focusedJourneyId) {
        focusedJourneyLabel = journeyLabel;
      }

      const fieldOrder: GuidedJourneyField[] = [
        "journeyTitle",
        "primaryActor",
        "goal",
        "trigger",
        "currentState",
        "desiredFutureState"
      ];

      for (const field of fieldOrder) {
        const value =
          field === "journeyTitle"
            ? journey.title
            : field === "primaryActor"
              ? journey.primaryActor
              : field === "goal"
                ? journey.goal
                : field === "trigger"
                  ? journey.trigger
                  : field === "currentState"
                    ? journey.currentState
                    : journey.desiredFutureState;

        if (hasText(value)) {
          continue;
        }

        const prompt = buildGuidedJourneyPrompt({
          field,
          journeyLabel,
          context,
          epicLabels: input.epicLabels,
          storyIdeaLabels: input.storyIdeaLabels
        });
        missingTargets.push({
          context,
          journey,
          field,
          question: prompt.question,
          placeholder: prompt.placeholder,
          helper: prompt.helper,
          promptKey: `${journey.id}:${field}`,
          totalMissing: 0,
          skippedMissing: 0
        });
      }
    });

  }

  const target = missingTargets.find((candidate) => !skipped.has(candidate.promptKey)) ?? null;
  const skippedMissing = missingTargets.filter((candidate) => skipped.has(candidate.promptKey)).length;

  if (!target) {
    return {
      target: null,
      isComplete: missingTargets.length === 0,
      hasOnlySkippedQuestions: missingTargets.length > 0,
      contextCount: normalizedContexts.length,
      journeyCount,
      focusedJourneyLabel
    };
  }

  return {
    target: {
      ...target,
      totalMissing: missingTargets.length,
      skippedMissing
    },
    isComplete: false,
    hasOnlySkippedQuestions: false,
    contextCount: normalizedContexts.length,
    journeyCount,
    focusedJourneyLabel
  };
}

function buildJourneyFocusOptions(rawJourneyContexts: JourneyContext[]): JourneyFocusOption[] {
  return rawJourneyContexts.flatMap((context) =>
    context.journeys.map((journey, index) => ({
      journeyId: journey.id,
      contextId: context.id,
      label: hasText(journey.title)
        ? journey.title.trim()
        : hasText(context.title)
          ? `${context.title.trim()} / journey ${index + 1}`
          : `Journey ${index + 1}`
    }))
  );
}

function findJourneyDraftTarget(input: {
  rawJourneyContexts: JourneyContext[];
  focusedJourneyId: string | null;
}): JourneyDraftTarget | null {
  for (const context of input.rawJourneyContexts) {
    for (const [index, journey] of context.journeys.entries()) {
      if (input.focusedJourneyId && journey.id !== input.focusedJourneyId) {
        continue;
      }

      return {
        context,
        journey,
        journeyLabel: buildJourneyFieldLabel(journey, index)
      };
    }
  }

  return null;
}

function toSentenceCase(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function ensurePeriod(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildGuidedJourneyDraft(input: {
  target: GuidedJourneyInterviewTarget;
  rawAnswer: string;
}) {
  const raw = input.rawAnswer.trim();

  if (!raw) {
    return "";
  }

  switch (input.target.field) {
    case "journeyTitle":
      return toSentenceCase(raw.replace(/[.:]+$/g, ""));
    case "primaryActor":
      return toTitleCase(raw.replace(/[.:]+$/g, ""));
    case "goal": {
      const normalized = ensurePeriod(toSentenceCase(raw));
      return /\b(actor|user|team|role)\b/i.test(normalized)
        ? normalized
        : `Huvudaktören vill ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
    }
    case "trigger": {
      const normalized = ensurePeriod(toSentenceCase(raw));
      return /^(when|once|if|after|a |an |the )/i.test(normalized)
        ? normalized
        : `Journeyn börjar när ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
    }
    case "currentState": {
      const normalized = ensurePeriod(toSentenceCase(raw));
      return /^(i dag|idag|nu|för närvarande)/i.test(normalized)
        ? normalized
        : `I dag ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
    }
    case "desiredFutureState": {
      const normalized = ensurePeriod(toSentenceCase(raw));
      return /^(i framtiden|framåt|helst|i önskat läge)/i.test(normalized)
        ? normalized
        : `I önskat läge ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
    }
  }
}

function buildGuidedJourneySuggestion(input: {
  target: GuidedJourneyInterviewTarget;
  answer: string;
}): FramingAgentSuggestion {
  const answer = input.answer.trim();
  const nextContext: JourneyContext = {
    ...input.target.context,
    journeys:
      input.target.context.journeys.length > 0
        ? input.target.context.journeys.map((journey) =>
            journey.id !== input.target.journey.id
              ? journey
              : {
                  ...journey,
                  title: input.target.field === "journeyTitle" ? answer : journey.title,
                  primaryActor: input.target.field === "primaryActor" ? answer : journey.primaryActor,
                  goal: input.target.field === "goal" ? answer : journey.goal,
                  trigger: input.target.field === "trigger" ? answer : journey.trigger,
                  currentState: input.target.field === "currentState" ? answer : journey.currentState,
                  desiredFutureState: input.target.field === "desiredFutureState" ? answer : journey.desiredFutureState
                }
          )
        : [
            {
              ...input.target.journey,
              title: input.target.field === "journeyTitle" ? answer : input.target.journey.title,
              primaryActor: input.target.field === "primaryActor" ? answer : input.target.journey.primaryActor,
              goal: input.target.field === "goal" ? answer : input.target.journey.goal,
              trigger: input.target.field === "trigger" ? answer : input.target.journey.trigger,
              currentState: input.target.field === "currentState" ? answer : input.target.journey.currentState,
              desiredFutureState:
                input.target.field === "desiredFutureState" ? answer : input.target.journey.desiredFutureState
            }
          ]
  };

  return {
    id: createId("guided-journey-answer"),
    kind: "rewrite_journey_context",
    title: `Använd svar för ${input.target.field}`,
    description: "Lägger till ditt svar i det aktuella journey-utkastet.",
    contextId: nextContext.id,
    nextContext,
    confidence: 0.95
  };
}

function lowerFirst(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function buildFirstDraftJourneySuggestion(input: {
  target: JourneyDraftTarget;
  initiativeType: "AD" | "AT" | "AM" | null;
}): FramingAgentSuggestion {
  const { context, journey } = input.target;
  const actor = journey.primaryActor.trim();
  const goal = journey.goal.trim();
  const trigger = journey.trigger.trim();
  const title = journey.title.trim();
  const initiativePhrase =
    input.initiativeType === "AT"
      ? "mellan nuvarande och framtida arbetssätt"
      : input.initiativeType === "AM"
        ? "med starkare operativ kontinuitet"
        : "med tydligare stöd och mindre friktion";

  const generatedSteps =
    journey.steps.length > 0
      ? journey.steps
      : [
          {
            id: createId("step"),
            title: `Starta ${title || "journey"}`,
            actor,
            description: `${actor} uppfattar triggern och förstår varför journeyn behöver starta.`,
            currentPain: "Ingången i flödet kan vara fragmenterad eller oklar.",
            desiredSupport: "Triggern och nästa steg bör vara tydliga direkt.",
            decisionPoint: false
          },
          {
            id: createId("step"),
            title: `Driv ${title || "journey"} framåt`,
            actor,
            description: `${actor} arbetar sig genom huvudflödet mot att ${lowerFirst(goal)} samtidigt som nödvändiga överlämningar eller kontroller hanteras.`,
            currentPain: "Viktiga framsteg kan bero på manuell samordning eller dold status.",
            desiredSupport: "Flödet bör tydligt stötta framdrift, beslut och överlämningar.",
            decisionPoint: true
          },
          {
            id: createId("step"),
            title: `Avsluta ${title || "journey"}`,
            actor,
            description: `${actor} bekräftar utfallet, avslutar journeyn och gör resultatet synligt för rätt personer.`,
            currentPain: "Avslut och uppföljning kan vara inkonsekventa eller svåra att verifiera.",
            desiredSupport: "Avslut bör vara tydligt, synligt och enkelt att lämna över eller följa upp.",
            decisionPoint: false
          }
        ];

  const nextJourney: JourneyContext["journeys"][number] = {
    ...journey,
    currentState:
      journey.currentState && journey.currentState.trim().length > 0
        ? journey.currentState
        : `I dag börjar ${actor.toLowerCase()} ofta när ${lowerFirst(trigger)}, men flödet blir lätt fragmenterat av manuell samordning, begränsad överblick eller oklara överlämningar.`,
    desiredFutureState:
      journey.desiredFutureState && journey.desiredFutureState.trim().length > 0
        ? journey.desiredFutureState
        : `I önskat läge kan ${actor.toLowerCase()} ${lowerFirst(goal)} ${initiativePhrase}, med tydligare status, färre manuella avbrott och smidigare beslut.`,
    painPoints:
      journey.painPoints && journey.painPoints.length > 0
        ? journey.painPoints
        : [
            `Flödet kan starta inkonsekvent när ${lowerFirst(trigger)}.`,
            "Status, ansvar eller nästa steg kan bli oklart under journeyn.",
            `Manuell samordning gör det svårare att ${lowerFirst(goal)} på ett förutsägbart sätt.`
          ],
    desiredSupport:
      journey.desiredSupport && journey.desiredSupport.length > 0
        ? journey.desiredSupport
        : [
            "Tydlig ingång i flödet med synlig trigger och ansvar.",
            "Stödd framdrift med bättre överblick över status, överlämningar och beslut.",
            `Konsekvent stöd i avslutet så att det blir enklare att ${lowerFirst(goal)} och verifiera resultatet.`
          ],
    steps: generatedSteps
  };

  return {
    id: createId("first-draft-journey"),
    kind: "rewrite_journey",
    title: `Generera första utkast för ${title || "den här journeyn"}`,
    description: "Skapar ett första brett journey-utkast med flödesspråk, problem, önskat stöd och några övergripande steg.",
    contextId: context.id,
    journeyId: journey.id,
    nextJourney,
    confidence: 0.84
  };
}

function stripTrailingPunctuation(value: string) {
  return value.trim().replace(/[.!?]+$/g, "");
}

function findEpicLabel(epicId: string | null | undefined, epicOptions: Array<{ id: string; label: string }> | undefined) {
  if (!epicId || !epicOptions?.length) {
    return null;
  }

  return epicOptions.find((option) => option.id === epicId)?.label ?? null;
}

function buildStoryBehaviorText(suggestion: StoryIdeaCandidateSuggestion) {
  const outcome = suggestion.storyIdea.expectedOutcome?.trim();

  if (outcome) {
    return `När storyn är på plats ska ${lowerFirst(stripTrailingPunctuation(outcome))}.`;
  }

  return `När storyn är på plats ska den stödja ${lowerFirst(stripTrailingPunctuation(suggestion.storyIdea.description))} utan att tappa spårbarhet eller ärvda ramar.`;
}

function buildStoryConsiderations(
  suggestion: StoryIdeaCandidateSuggestion,
  epicOptions: Array<{ id: string; label: string }> | undefined
) {
  const items: string[] = [];
  const suggestedEpicLabel = findEpicLabel(suggestion.storyIdea.suggestedEpicId, epicOptions);
  const journeyCount = suggestion.storyIdea.basedOnJourneyIds?.length ?? 0;
  const stepCount = suggestion.storyIdea.basedOnStepIds?.length ?? 0;

  if (suggestedEpicLabel) {
    items.push(`Placera storyn under ${suggestedEpicLabel} så att den ligger i rätt förmågeområde.`);
  }

  if (journeyCount > 0) {
    items.push(
      journeyCount === 1
        ? "Behåll en tydlig koppling till den journey som drev fram förslaget."
        : "Behåll kopplingen till de journeys som tillsammans pekar på samma behov."
    );
  }

  if (stepCount > 0) {
    items.push("Låt storyn lösa ett sammanhållet problem i flödet, inte sprida sig över för många steg.");
  }

  items.push("Bevara constraints, UX-principer, NFR:er och datakänslighet när storyn förtydligas vidare.");
  return items;
}

function buildStoryTestFocus(suggestion: StoryIdeaCandidateSuggestion) {
  const items: string[] = [];
  const outcome = suggestion.storyIdea.expectedOutcome?.trim();

  if (outcome) {
    items.push(`Verifiera att ${lowerFirst(stripTrailingPunctuation(outcome))}.`);
  } else {
    items.push("Verifiera att storyn faktiskt ger tydligare stöd eller lägre friktion i det tänkta läget.");
  }

  if ((suggestion.storyIdea.basedOnJourneyIds?.length ?? 0) > 0) {
    items.push("Verifiera att den berörda journeyn blir enklare att ta från trigger till önskat läge.");
  }

  if ((suggestion.storyIdea.basedOnStepIds?.length ?? 0) > 0) {
    items.push("Verifiera att berörda steg inte längre fastnar i oklar status, manuell samordning eller tappad överlämning.");
  }

  items.push("Verifiera att storyn fortfarande går att bryta ned vidare utan att bli för bred eller tekniskt låst.");
  return items;
}

function suggestionDetails(suggestion: FramingAgentSuggestion) {
  if (suggestion.kind === "rewrite_journey_step") {
    return suggestion.nextStep.description;
  }

  if (suggestion.kind === "rewrite_journey") {
    return suggestion.nextJourney.goal || suggestion.nextJourney.trigger || "Förslag på omformulering av journey.";
  }

  if (suggestion.kind === "rewrite_journey_context") {
    return suggestion.nextContext.description || "Förslag på uppdatering av journey-underlaget.";
  }

  if (suggestion.kind === "apply_journey_coverage") {
    return `Status: ${suggestion.coverage.status}`;
  }

  if (suggestion.kind === "story_idea_candidate") {
    return `${suggestion.storyIdea.description}${suggestion.storyIdea.suggestedEpicId ? ` Recommended Epic: ${suggestion.storyIdea.suggestedEpicId}.` : ""}`;
  }

  if (suggestion.kind === "preference_change") {
    return `Suggested value: ${suggestion.suggestedValue}. ${suggestion.rationale}`;
  }

  if (suggestion.kind === "add_custom_instruction") {
    return `${suggestion.instruction.category} / ${suggestion.instruction.priority} / ${suggestion.instruction.body}`;
  }

  return suggestion.description;
}

export function AiAssistantPanel({
  outcomeId,
  initiativeType,
  aiLevel,
  embedded = false,
  scopeKind,
  scopeLabel,
  scopeEntityId,
  focusedJourneyId,
  onFocusJourney,
  hasUnsavedChanges,
  runAction,
  journeyContextsJson,
  downstreamAiInstructionsJson,
  epicLabels,
  epicOptions,
  storyIdeaLabels,
  onApplySuggestion,
  createStoryIdeaAction
}: AiAssistantPanelProps) {
  const isCompactSurface = scopeKind === "journey-context" || scopeKind === "story-ideas";
  const isEmbeddedJourneySurface = embedded && scopeKind === "journey-context";
  const initialMode: FramingAgentMode = scopeKind === "export" ? "export" : "ask";
  const [mode, setMode] = useState<FramingAgentMode>(initialMode);
  const [prompt, setPrompt] = useState(() => buildDefaultFramingAgentPrompt(scopeKind, initialMode));
  const [result, setResult] = useState<Extract<FramingAgentActionResult, { ok: true }> | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);
  const [guidedAnswer, setGuidedAnswer] = useState("");
  const [guidedDraft, setGuidedDraft] = useState("");
  const [skippedPromptKeys, setSkippedPromptKeys] = useState<string[]>([]);
  const [recentlyAppliedFirstDraftJourneyId, setRecentlyAppliedFirstDraftJourneyId] = useState<string | null>(null);
  const [selectedStorySuggestionId, setSelectedStorySuggestionId] = useState<string | null>(null);
  const [showCustomPromptComposer, setShowCustomPromptComposer] = useState(false);
  const [showAdvancedWorkspace, setShowAdvancedWorkspace] = useState(!isCompactSurface);
  const [isPending, startTransition] = useTransition();
  const quickActions = framingAgentQuickActions[scopeKind] ?? [];

  useEffect(() => {
    const nextInitialMode: FramingAgentMode = scopeKind === "export" ? "export" : "ask";
    setMode(nextInitialMode);
    setPrompt(buildDefaultFramingAgentPrompt(scopeKind, nextInitialMode));
  }, [scopeKind]);

  const rawJourneyContexts = useMemo(() => parseJourneyContextsJson(journeyContextsJson), [journeyContextsJson]);
  const journeyFocusOptions = useMemo(() => buildJourneyFocusOptions(rawJourneyContexts), [rawJourneyContexts]);
  const journeyDraftTarget = useMemo(
    () =>
      scopeKind === "journey-context"
        ? findJourneyDraftTarget({
            rawJourneyContexts,
            focusedJourneyId: focusedJourneyId ?? null
          })
        : null,
    [focusedJourneyId, rawJourneyContexts, scopeKind]
  );
  const firstDraftSuggestion = useMemo(
    () =>
      journeyDraftTarget && hasCoreJourneyInputs(journeyDraftTarget.journey)
        ? buildFirstDraftJourneySuggestion({
            target: journeyDraftTarget,
            initiativeType
          })
        : null,
    [initiativeType, journeyDraftTarget]
  );
  const firstDraftJourneySuggestion =
    firstDraftSuggestion?.kind === "rewrite_journey" ? firstDraftSuggestion : null;
  const canGenerateFirstDraft = Boolean(
    firstDraftJourneySuggestion &&
      (
        !hasText(firstDraftJourneySuggestion.nextJourney.currentState) ||
        !hasText(firstDraftJourneySuggestion.nextJourney.desiredFutureState) ||
        (firstDraftJourneySuggestion.nextJourney.painPoints?.length ?? 0) === 0 ||
        (firstDraftJourneySuggestion.nextJourney.desiredSupport?.length ?? 0) === 0 ||
        (firstDraftJourneySuggestion.nextJourney.steps?.length ?? 0) === 0 ||
        !journeyDraftTarget?.journey.currentState ||
        !journeyDraftTarget?.journey.desiredFutureState ||
        (journeyDraftTarget?.journey.painPoints?.length ?? 0) === 0 ||
        (journeyDraftTarget?.journey.desiredSupport?.length ?? 0) === 0 ||
        (journeyDraftTarget?.journey.steps?.length ?? 0) === 0
      )
  );
  const guidedJourneyInterview = useMemo(
    () =>
      scopeKind === "journey-context" && mode === "ask"
        ? buildGuidedJourneyInterviewState({
            outcomeId,
            initiativeType,
            rawJourneyContexts,
            skippedPromptKeys,
            focusedJourneyId: focusedJourneyId ?? null,
            epicLabels,
            storyIdeaLabels
          })
        : null,
    [epicLabels, focusedJourneyId, initiativeType, mode, outcomeId, rawJourneyContexts, scopeKind, skippedPromptKeys, storyIdeaLabels]
  );
  const journeyHelpState = useMemo(() => {
    if (scopeKind !== "journey-context") {
      return null;
    }

    if (journeyFocusOptions.length === 0) {
      return {
        step: "Steg 1 av 3",
        title: "Börja med en bred journey",
        description: "Använd frågorna här för att fånga en viktig journey innan du tänker på analys eller extra detalj."
      };
    }

    if (guidedJourneyInterview?.target) {
      return {
        step: "Steg 2 av 3",
        title: "Förtydliga en journey i taget",
        description: "Svara på en fråga i taget här, eller skriv direkt i journey-kortet. Målet är att få en journey tillräckligt tydlig för att guida caset."
      };
    }

    if (canGenerateFirstDraft && firstDraftJourneySuggestion) {
      return {
        step: "Steg 2 av 3",
        title: "Generera ett bredare första utkast",
        description: "Grunderna finns på plats. Nu kan AI hjälpa dig att skissa nuläge, önskat läge och några övergripande problem."
      };
    }

    return {
      step: "Steg 3 av 3",
      title: "Analysera täckning när journeyn känns rätt",
      description: "När en journey är tydlig nog kan du använda analys för att jämföra den med Epics och Story Ideas och hitta luckor."
    };
  }, [canGenerateFirstDraft, firstDraftJourneySuggestion, guidedJourneyInterview, journeyFocusOptions.length, scopeKind]);
  const assistantTitle =
    scopeKind === "journey-context"
      ? "AI-hjälp för nästa steg"
      : scopeKind === "story-ideas"
        ? "AI-hjälp för Story Ideas"
        : "AI Assistant";
  const assistantDescription =
    scopeKind === "journey-context"
      ? "Använd den här rutan för AI-hjälp med den aktuella journeyn. Här kan du svara på en fråga i taget eller låta AI ta fram ett bättre utkast."
      : scopeKind === "story-ideas"
        ? "Använd AI här när du vill få ett sammanfattat story-utkast, hitta överlapp eller ta fram nya Story Ideas från journeys."
        : framingAgentIntroText;
  const isExportScope = scopeKind === "export";
  const currentModeLabel =
    isExportScope && mode === "export"
      ? "Preview export"
      : framingAgentModeLabels[mode];
  const promptLabel = isExportScope ? "FrÃ¥ga eller instruktion till AI" : "FrÃ¥ga till AI";
  const promptPlaceholder =
    scopeKind === "journey-context"
      ? "Be AI fÃ¶rklara, analysera eller fÃ¶rfina de aktuella journeys."
      : scopeKind === "story-ideas"
        ? "Be AI sammanfatta en mÃ¶jlig story, hitta Ã¶verlapp eller fÃ¶reslÃ¥ nya Story Ideas."
        : isExportScope
          ? "Be AI previewa ett handoff-underlag, analysera exportluckor eller fÃ¶reslÃ¥ vad som ska rÃ¤ttas innan verklig export."
          : "Ask, analyze, refine, or export against the current Framing package.";
  void promptLabel;
  void promptPlaceholder;
  const assistantTitleDisplay = isExportScope ? "AI export preview" : assistantTitle;
  const assistantDescriptionDisplay = isExportScope
    ? "Use this area to preview handoff artifacts and analyze what is missing before you use the real export panel for downloads."
    : assistantDescription;
  const promptLabelDisplay = isExportScope ? "AI prompt or instruction" : "Ask AI";
  const promptPlaceholderDisplay =
    scopeKind === "journey-context"
      ? "Ask AI to explain, analyze or refine the current journeys."
      : scopeKind === "story-ideas"
        ? "Ask AI to summarize a possible story, find overlap or propose new Story Ideas."
        : isExportScope
          ? "Ask AI to preview a handoff artifact, analyze export gaps or suggest what to fix before real export."
          : "Ask, analyze, refine, or export against the current Framing package.";
  const justAppliedFirstDraft =
    recentlyAppliedFirstDraftJourneyId !== null &&
    journeyDraftTarget?.journey.id === recentlyAppliedFirstDraftJourneyId &&
    !canGenerateFirstDraft;
  const visibleSuggestions = useMemo(
    () => result?.suggestions.filter((suggestion) => !dismissedIds.includes(suggestion.id)) ?? [],
    [dismissedIds, result]
  );
  const storyIdeaSuggestions = useMemo(
    () => visibleSuggestions.filter((suggestion): suggestion is StoryIdeaCandidateSuggestion => suggestion.kind === "story_idea_candidate"),
    [visibleSuggestions]
  );
  const selectedStoryIdeaSuggestion =
    storyIdeaSuggestions.find((suggestion) => suggestion.id === selectedStorySuggestionId) ?? storyIdeaSuggestions[0] ?? null;
  const nonStoryIdeaSuggestions = useMemo(
    () => visibleSuggestions.filter((suggestion) => suggestion.kind !== "story_idea_candidate"),
    [visibleSuggestions]
  );

  useEffect(() => {
    if (storyIdeaSuggestions.length === 0) {
      setSelectedStorySuggestionId(null);
      return;
    }

    if (!selectedStorySuggestionId || !storyIdeaSuggestions.some((suggestion) => suggestion.id === selectedStorySuggestionId)) {
      setSelectedStorySuggestionId(storyIdeaSuggestions[0]?.id ?? null);
    }
  }, [selectedStorySuggestionId, storyIdeaSuggestions]);

  useEffect(() => {
    try {
      const rawHistory = window.localStorage.getItem(buildHistoryKey(outcomeId));
      const rawDismissed = window.localStorage.getItem(buildDismissedKey(outcomeId));
      setHistory(rawHistory ? (JSON.parse(rawHistory) as ConversationEntry[]) : []);
      setDismissedIds(rawDismissed ? (JSON.parse(rawDismissed) as string[]) : []);
    } catch {
      setHistory([]);
      setDismissedIds([]);
    }
  }, [outcomeId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(buildHistoryKey(outcomeId), JSON.stringify(history.slice(0, 8)));
    } catch {
      return;
    }
  }, [history, outcomeId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(buildDismissedKey(outcomeId), JSON.stringify(dismissedIds));
    } catch {
      return;
    }
  }, [dismissedIds, outcomeId]);

  useEffect(() => {
    setGuidedAnswer("");
    setGuidedDraft("");
  }, [guidedJourneyInterview?.target?.promptKey]);

  useEffect(() => {
    if (!guidedJourneyInterview?.target || !guidedAnswer.trim()) {
      setGuidedDraft("");
      return;
    }

    setGuidedDraft(
      buildGuidedJourneyDraft({
        target: guidedJourneyInterview.target,
        rawAnswer: guidedAnswer
      })
    );
  }, [guidedAnswer, guidedJourneyInterview?.target]);

  useEffect(() => {
    if (!isEmbeddedJourneySurface && (mode !== "ask" || result || prompt.trim())) {
      setShowAdvancedWorkspace(true);
    }
  }, [isEmbeddedJourneySurface, mode, prompt, result]);

  useEffect(() => {
    if (canGenerateFirstDraft) {
      setRecentlyAppliedFirstDraftJourneyId(null);
    }
  }, [canGenerateFirstDraft]);

  function dismissSuggestion(suggestionId: string) {
    setDismissedIds((current) => (current.includes(suggestionId) ? current : [...current, suggestionId]));
  }

  function handleApplySuggestion(suggestion: FramingAgentSuggestion) {
    if (!onApplySuggestion) {
      return;
    }

    onApplySuggestion(suggestion);

    if (suggestion.kind === "rewrite_journey" && firstDraftJourneySuggestion && suggestion.id === firstDraftJourneySuggestion.id) {
      setRecentlyAppliedFirstDraftJourneyId(suggestion.journeyId);
    }

    dismissSuggestion(suggestion.id);
  }

  function applyGuidedJourneyAnswer(answerOverride?: string) {
    const finalAnswer = answerOverride?.trim() || guidedAnswer.trim();

    if (!guidedJourneyInterview?.target || !onApplySuggestion || !finalAnswer) {
      return;
    }

    const suggestion = buildGuidedJourneySuggestion({
      target: guidedJourneyInterview.target,
      answer: finalAnswer
    });

    onApplySuggestion(suggestion);
    setGuidedAnswer("");
    setGuidedDraft("");
    setSkippedPromptKeys((current) => current.filter((entry) => entry !== guidedJourneyInterview.target?.promptKey));
  }

  function skipGuidedJourneyQuestion() {
    if (!guidedJourneyInterview?.target) {
      return;
    }

    const promptKey = guidedJourneyInterview.target.promptKey;

    setSkippedPromptKeys((current) =>
      current.includes(promptKey)
        ? current
        : [...current, promptKey]
    );
    setGuidedAnswer("");
    setGuidedDraft("");
  }

  function handleCopyArtifact(kind: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedArtifact(kind);
      window.setTimeout(() => setCopiedArtifact(null), 1500);
    }).catch(() => {
      setCopiedArtifact(null);
    });
  }

  function submitAgentRun(nextMode: FramingAgentMode, nextPrompt: string, quickActionId?: string | null) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("outcomeId", outcomeId);
      formData.set("mode", nextMode);
      formData.set("scopeKind", scopeKind);
      formData.set("scopeLabel", scopeLabel);

      if (scopeEntityId) {
        formData.set("scopeEntityId", scopeEntityId);
      }

      if (quickActionId) {
        formData.set("quickActionId", quickActionId);
      }

      formData.set("prompt", nextPrompt);

      if (journeyContextsJson) {
        formData.set("journeyContextsJson", journeyContextsJson);
      }

      if (downstreamAiInstructionsJson) {
        formData.set("downstreamAiInstructionsJson", downstreamAiInstructionsJson);
      }

      const response = await runAction(formData);

      if (!response.ok) {
        setResult(null);
        setHistory((current) => [
          {
            id: createId("history"),
            createdAt: new Date().toISOString(),
            mode: nextMode,
            prompt: nextPrompt,
            message: response.error,
            scopeLabel
          },
          ...current
        ]);
        return;
      }

      setMode(nextMode);
      setResult(response);
      setHistory((current) => [
        {
          id: createId("history"),
          createdAt: new Date().toISOString(),
          mode: nextMode,
          prompt: nextPrompt,
          message: response.message,
          scopeLabel
        },
        ...current
      ]);
    });
  }

  function applyMode(nextMode: FramingAgentMode) {
    setMode(nextMode);
    setPrompt(buildDefaultFramingAgentPrompt(scopeKind, nextMode));
  }

  const content = (
    <>
      {!embedded ? (
        <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {assistantTitleDisplay}
            </CardTitle>
            <CardDescription>{assistantDescriptionDisplay}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              {initiativeType ?? "Ej satt"}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              AI Level {aiLevel}
            </span>
            {!isCompactSurface ? (
              <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
                Mode: {currentModeLabel}
              </span>
            ) : null}
            {!isCompactSurface ? (
              <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
                Scope: {scopeLabel}
              </span>
            ) : null}
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                hasUnsavedChanges
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {hasUnsavedChanges ? "Osparat utkast" : "Sparat utkast"}
            </span>
          </div>
        </div>
        </CardHeader>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles className="h-4 w-4" />
                AI-hjälp i denna journey
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                1. Skriv direkt i fälten ovan om du vill. 2. Klicka på en AI-knapp här nedanför när du vill få hjälp med formulering, första utkast eller täckningsanalys.
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                hasUnsavedChanges
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {hasUnsavedChanges ? "Osparat utkast" : "Sparat utkast"}
            </span>
          </div>
        </div>
      )}
      <CardContent className={`${embedded ? "px-0 pb-0 pt-4" : ""} space-y-5`}>
        {guidedJourneyInterview ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
            {!embedded && journeyHelpState ? (
              <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">{journeyHelpState.step}</p>
                <p className="mt-2 text-base font-semibold text-foreground">{journeyHelpState.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{journeyHelpState.description}</p>
                <p className="mt-3 text-sm text-foreground">
                  Så använder du AI här: skriv ett kort svar i rutan nedan och låt sedan AI föreslå en tydligare formulering som du kan använda direkt.
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{embedded ? "AI hjälper dig i den här journeyn" : "Stegvis AI-hjälp för journey"}</p>
                <p className="mt-1 text-sm text-sky-900/85">
                  Du kan antingen svara på frågan nedan eller klicka på en AI-knapp längre ned. AI svarar alltid här i samma journey-kort.
                </p>
                {guidedJourneyInterview.focusedJourneyLabel ? (
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-sky-900/75">
                    Fokus på {guidedJourneyInterview.focusedJourneyLabel}
                  </p>
                ) : null}
              </div>
              <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-800">
                {guidedJourneyInterview.contextCount} yta / {guidedJourneyInterview.journeyCount} journey
              </span>
            </div>

            {!embedded && journeyFocusOptions.length > 0 && onFocusJourney ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Välj vilken journey AI ska hjälpa med</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onFocusJourney(null)}
                    type="button"
                    variant={focusedJourneyId ? "secondary" : "default"}
                  >
                    Alla journeys
                  </Button>
                  {journeyFocusOptions.map((option) => (
                    <Button
                      key={option.journeyId}
                      onClick={() => onFocusJourney(option.journeyId)}
                      type="button"
                      variant={focusedJourneyId === option.journeyId ? "default" : "secondary"}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {canGenerateFirstDraft && firstDraftJourneySuggestion ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Generera första utkast</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Kärnan i journeyn finns på plats. Nu kan AI ta fram ett bredare första utkast för resten av flödet.
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      När du använder utkastet fylls fälten i samma journey-kort med nuläge, önskat läge, problem, önskat stöd och breda steg.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApplySuggestion(firstDraftJourneySuggestion)}
                    type="button"
                  >
                    Fyll i journey med detta utkast
                  </Button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast nuläge</p>
                    <p className="text-sm leading-6 text-foreground">{firstDraftJourneySuggestion.nextJourney.currentState}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast önskat läge</p>
                    <p className="text-sm leading-6 text-foreground">{firstDraftJourneySuggestion.nextJourney.desiredFutureState}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast problem</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {(firstDraftJourneySuggestion.nextJourney.painPoints ?? []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast önskat stöd</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {(firstDraftJourneySuggestion.nextJourney.desiredSupport ?? []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {firstDraftJourneySuggestion.nextJourney.steps.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast breda steg</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {firstDraftJourneySuggestion.nextJourney.steps.map((step) => (
                        <li key={step.id}>
                          <span className="font-medium text-foreground">{step.title}:</span> {step.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {justAppliedFirstDraft ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="font-medium text-emerald-950">AI-utkastet är nu infört i denna journey.</p>
                <p className="mt-2 text-sm text-emerald-900">
                  Fälten ovan i samma journey-kort har fyllts i med nuläge, önskat läge, problem, önskat stöd och breda steg.
                </p>
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-foreground">
                  <p>Gör nu så här:</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li>Läs igenom de ifyllda fälten ovan i samma journey-kort.</li>
                    <li>Justera det som inte stämmer.</li>
                    <li>Spara journeys när innehållet känns rätt.</li>
                  </ol>
                </div>
              </div>
            ) : null}

            {guidedJourneyInterview.target ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Nästa fråga</p>
                  <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{guidedJourneyInterview.target.question}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{guidedJourneyInterview.target.helper}</p>
                  <p className="mt-3 text-xs text-sky-900/70">
                    Kvar att fylla i: {guidedJourneyInterview.target.totalMissing}
                    {guidedJourneyInterview.target.skippedMissing > 0
                      ? ` / hoppade över: ${guidedJourneyInterview.target.skippedMissing}`
                      : ""}
                  </p>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Ditt svar</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                  onChange={(event) => setGuidedAnswer(event.target.value)}
                  placeholder={guidedJourneyInterview.target.placeholder}
                  value={guidedAnswer}
                />
                </label>
                {guidedDraft && guidedDraft !== guidedAnswer.trim() ? (
                  <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">AI-förslag</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{guidedDraft}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Det här är AI:s förslag på en tydligare journey-formulering baserat på ditt svar.
                    </p>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={!guidedDraft.trim()}
                    onClick={() => applyGuidedJourneyAnswer(guidedDraft)}
                    type="button"
                  >
                    Använd AI-förslaget
                  </Button>
                  <Button disabled={!guidedAnswer.trim()} onClick={() => applyGuidedJourneyAnswer()} type="button" variant="secondary">
                    Använd min formulering
                  </Button>
                  <Button onClick={skipGuidedJourneyQuestion} type="button" variant="secondary">
                    Hoppa över frågan
                  </Button>
                  {skippedPromptKeys.length > 0 ? (
                    <Button onClick={() => setSkippedPromptKeys([])} type="button" variant="secondary">
                      Visa hoppade frågor
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : guidedJourneyInterview.isComplete && !justAppliedFirstDraft ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-white px-4 py-4">
                <p className="font-medium text-foreground">Kärnan i journeyn är redan fångad.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nästa naturliga steg är att antingen förtydliga språket eller analysera täckning mot Epics och Story Ideas.
                </p>
              </div>
            ) : guidedJourneyInterview.hasOnlySkippedQuestions ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-white px-4 py-4">
                <p className="font-medium text-foreground">Alla kvarvarande frågor är just nu hoppade över.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ta tillbaka dem när du vill fortsätta förtydliga journeyn.
                </p>
                <div className="mt-3">
                  <Button onClick={() => setSkippedPromptKeys([])} type="button" variant="secondary">
                    Visa hoppade frågor
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isEmbeddedJourneySurface && isCompactSurface ? (
          <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Fler AI-val</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Öppna detta bara när du vill ha analys, fri promptning, Story Idea-förslag eller exportstöd.
                </p>
              </div>
              <Button onClick={() => setShowAdvancedWorkspace((current) => !current)} type="button" variant="secondary">
                {showAdvancedWorkspace ? "Dölj fler AI-val" : "Visa fler AI-val"}
              </Button>
            </div>
          </div>
        ) : null}

        {(isEmbeddedJourneySurface || showAdvancedWorkspace || !isCompactSurface) ? (
          <div className="space-y-5 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            {isExportScope ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
                <p className="font-medium text-foreground">Use this area for preview and review, not the final download.</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sky-900/90">
                  <li><span className="font-medium">Ask</span> when you want a clarification about the handoff.</li>
                  <li><span className="font-medium">Analyze</span> when you want a fix list before export.</li>
                  <li><span className="font-medium">Refine</span> when you want help improving the framing before export.</li>
                  <li><span className="font-medium">Export</span> when you want a preview artifact, not the real download package.</li>
                  <li>Use the separate export panel for real <span className="font-medium">Neutral Governed</span> and <span className="font-medium">BMAD Prepared</span> downloads.</li>
                  <li>UX sketch files are only included in the real export package when they are saved on Story Ideas inside Framing.</li>
                </ul>
              </div>
            ) : null}
            {isEmbeddedJourneySurface ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">Välj hur du vill få hjälp</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Klicka på ett av alternativen nedan. AI:s svar visas direkt här i samma journey-kort.
                  </p>
                </div>

                {quickActions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.id}
                        onClick={() => {
                          setPrompt(action.prompt);
                          submitAgentRun(action.mode, action.prompt, action.id);
                        }}
                        type="button"
                        variant="secondary"
                      >
                        {action.label}
                      </Button>
                    ))}
                    <Button onClick={() => setShowCustomPromptComposer((current) => !current)} type="button" variant="secondary">
                      {showCustomPromptComposer ? "Dölj egen fråga" : "Ställ egen fråga"}
                    </Button>
                  </div>
                ) : null}

                {showCustomPromptComposer ? (
                  <div className="space-y-3 rounded-2xl border border-border/70 bg-background px-4 py-4">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Egen fråga till AI</span>
                      <textarea
                        className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="Beskriv vad du vill ha hjälp med i just den här journeyn."
                        value={prompt}
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={isPending || !prompt.trim()}
                        onClick={() => submitAgentRun("ask", prompt)}
                        type="button"
                      >
                        {isPending ? "Kör..." : "Skicka till AI"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {(["ask", "analyze", "refine", "export"] as FramingAgentMode[]).map((entry) => (
                    <Button key={entry} onClick={() => applyMode(entry)} type="button" variant={mode === entry ? "default" : "secondary"}>
                      {framingAgentModeLabels[entry]}
                    </Button>
                  ))}
                </div>

                {quickActions.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Andra AI-handlingar</p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => (
                        <Button
                          key={action.id}
                          onClick={() => {
                            setPrompt(action.prompt);
                            submitAgentRun(action.mode, action.prompt, action.id);
                          }}
                          type="button"
                          variant="secondary"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{promptLabelDisplay}</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder={promptPlaceholderDisplay}
                      value={prompt}
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      disabled={isPending || !prompt.trim()}
                      onClick={() => submitAgentRun(mode, prompt)}
                      type="button"
                    >
                      {isPending ? "Kör..." : "Kör AI"}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {result ? (
              <div className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-900">
                    {result.role}
                  </span>
                  <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-900">
                    {result.usedLiveAi ? "Live AI-planerare" : "Strukturerad lokal planerare"}
                  </span>
                </div>
                <p>{result.message}</p>
                {result.helperText ? <p className="text-xs leading-6 text-sky-900/80">{result.helperText}</p> : null}
              </div>
            ) : null}

            {result?.followUpQuestions.length ? (
              <div className="rounded-2xl border border-sky-200/80 bg-white px-4 py-4 text-sm text-foreground">
                <p className="font-medium text-foreground">Följdfrågor</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                  {result.followUpQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result?.warnings.length ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                <p className="font-medium">{isExportScope ? "Warnings and fix list" : "Varningar"}</p>
                {isExportScope ? (
                  <p className="mt-2 text-sm text-amber-900">
                    Correct these items in the source Framing package before you export the final downloadable handoff.
                  </p>
                ) : null}
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {scopeKind === "story-ideas" && selectedStoryIdeaSuggestion ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI-brief för Story Idea</p>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Använd detta för att snabbt bedöma om storyn ger rätt riktning</p>
                      <p className="mt-1 text-sm text-sky-900/85">
                        Kortet sammanfattar storyn som AI ser den just nu. Om den känns rätt kan du skapa Story Idea direkt härifrån.
                      </p>
                    </div>
                    <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-800">
                      {storyIdeaSuggestions.length} utkast
                    </span>
                  </div>

                  {storyIdeaSuggestions.length > 1 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {storyIdeaSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          onClick={() => setSelectedStorySuggestionId(suggestion.id)}
                          type="button"
                          variant={selectedStoryIdeaSuggestion.id === suggestion.id ? "default" : "secondary"}
                        >
                          {suggestion.storyIdea.title}
                        </Button>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-2xl border border-sky-200 bg-white px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Story-utkast</p>
                        <p className="text-lg font-semibold text-foreground">{selectedStoryIdeaSuggestion.storyIdea.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{selectedStoryIdeaSuggestion.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {createStoryIdeaAction ? (
                          <form action={createStoryIdeaAction}>
                            <input name="outcomeId" type="hidden" value={outcomeId} />
                            <input
                              name="quickStoryIdeaEpicId"
                              type="hidden"
                              value={selectedStoryIdeaSuggestion.storyIdea.suggestedEpicId ?? ""}
                            />
                            <input name="quickStoryIdeaTitle" type="hidden" value={selectedStoryIdeaSuggestion.storyIdea.title} />
                            <Button type="submit">Skapa Story Idea från utkastet</Button>
                          </form>
                        ) : null}
                        <Button onClick={() => dismissSuggestion(selectedStoryIdeaSuggestion.id)} type="button" variant="secondary">
                          Avfärda utkastet
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast syfte</p>
                        <p className="text-sm leading-6 text-foreground">{selectedStoryIdeaSuggestion.storyIdea.description}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast förväntat beteende</p>
                        <p className="text-sm leading-6 text-foreground">{buildStoryBehaviorText(selectedStoryIdeaSuggestion)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast användarvärde</p>
                        <p className="text-sm leading-6 text-foreground">
                          {selectedStoryIdeaSuggestion.storyIdea.valueIntent?.trim() || selectedStoryIdeaSuggestion.storyIdea.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Viktiga hänsyn</p>
                        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                          {buildStoryConsiderations(selectedStoryIdeaSuggestion, epicOptions).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Utkast testfokus</p>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                        {buildStoryTestFocus(selectedStoryIdeaSuggestion).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {nonStoryIdeaSuggestions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Föreslagna handlingar</p>
                {nonStoryIdeaSuggestions.map((suggestion) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={suggestion.id}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">{suggestion.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{suggestion.description}</p>
                        <p className="text-sm leading-6 text-foreground">{suggestionDetails(suggestion)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {onApplySuggestion ? (
                          <Button onClick={() => handleApplySuggestion(suggestion)} type="button">
                            Använd förslag
                          </Button>
                        ) : null}
                        <Button onClick={() => dismissSuggestion(suggestion.id)} type="button" variant="secondary">
                          Avfärda
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {result?.artifacts.length ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {isExportScope ? "Preview generated handoff" : "Genererade underlag"}
                </p>
                {result.artifacts.map((artifact) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={artifact.kind}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{artifact.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{artifact.summary}</p>
                        {isExportScope ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Preview only. Use the export panel for the real downloadable package and attached UX sketch files.
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleCopyArtifact(`${artifact.kind}-markdown`, artifact.markdown)}
                          type="button"
                          variant="secondary"
                        >
                          {copiedArtifact === `${artifact.kind}-markdown` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Kopiera markdown
                        </Button>
                        <Button
                          onClick={() => handleCopyArtifact(`${artifact.kind}-json`, JSON.stringify(artifact.json, null, 2))}
                          type="button"
                          variant="secondary"
                        >
                          {copiedArtifact === `${artifact.kind}-json` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Kopiera JSON
                        </Button>
                      </div>
                    </div>
                    <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-white p-4 text-xs text-foreground">
                      <code>{artifact.markdown}</code>
                    </pre>
                  </div>
                ))}
              </div>
            ) : null}

            {!isEmbeddedJourneySurface && result?.toolTrace.length ? (
              <details className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground">Tool trace</summary>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {result.toolTrace.map((entry, index) => (
                    <li key={`${entry.tool}-${index}`}>{entry.tool}: {entry.summary}</li>
                  ))}
                </ul>
              </details>
            ) : null}

            {!isEmbeddedJourneySurface && history.length > 0 ? (
              <details className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground">Recent conversation history</summary>
                <div className="mt-3 space-y-3">
                  {history.slice(0, 5).map((entry) => (
                    <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3" key={entry.id}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {framingAgentModeLabels[entry.mode]} / {new Date(entry.createdAt).toLocaleString("sv-SE")}
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">{entry.prompt}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.message}</p>
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
            ) : null}
      </CardContent>
    </>
  );

  return embedded ? (
    <div className="space-y-5">{content}</div>
  ) : (
    <Card className="border-border/70 shadow-sm">{content}</Card>
  );
}
