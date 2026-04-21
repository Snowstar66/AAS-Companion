"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { framingAgentIntroText, framingAgentModeLabels, framingAgentQuickActions } from "@/lib/framing/agentModes";
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

  return index === 0 ? "this journey" : `journey ${index + 1}`;
}

function formatReferencePreview(labels: string[] | undefined, max = 3) {
  if (!labels || labels.length === 0) {
    return "";
  }

  const preview = labels.slice(0, max).join(", ");
  return labels.length > max ? `${preview}, and ${labels.length - max} more` : preview;
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
        question: `What should ${input.journeyLabel} be called?`,
        placeholder: "Example: Handle incoming case",
        helper: `Use a short verb-driven name that describes the whole flow.${storyIdeaPreview ? ` If relevant, make it broad enough to hold Story Ideas like ${storyIdeaPreview}.` : ""}`
      };
    case "primaryActor":
      return {
        question: `Who is the primary actor in ${input.journeyLabel}?`,
        placeholder: "Example: Case officer",
        helper: `Name the main role driving the journey.${epicPreview ? ` Existing Epics include ${epicPreview}, which may help you think about where this actor fits.` : ""}`
      };
    case "goal":
      return {
        question: `What is the primary goal in ${input.journeyLabel}?`,
        placeholder: "Example: Resolve the case without manual handoffs",
        helper: `Describe what the actor is trying to achieve, not which screen they need.${storyIdeaPreview ? ` If some Story Ideas already exist, describe the shared outcome they should move: ${storyIdeaPreview}.` : ""}`
      };
    case "trigger":
      return {
        question: `What usually triggers ${input.journeyLabel}?`,
        placeholder: "Example: A new customer case arrives",
        helper: `Describe what starts the flow.${storyIdeaPreview ? ` You can use existing Story Ideas as clues for what event, request, or handoff usually starts the work.` : ""}`
      };
    case "currentState":
      return {
        question: `How does ${input.journeyLabel} work today?`,
        placeholder: "Example: Work starts in email, continues in spreadsheets, and often stalls during handoff",
        helper: `Focus on friction, fragmentation, delays, or ambiguity in the current flow.${storyIdeaPreview ? ` If Story Ideas already exist, explain what is still messy, slow, or unclear around them.` : ""}`
      };
    case "desiredFutureState":
      return {
        question: `How should ${input.journeyLabel} work in the desired future state?`,
        placeholder: "Example: The actor follows one clear flow with visible status and fewer manual checks",
        helper: `Describe better support and smoother flow, not detailed UI design.${storyIdeaPreview ? ` If Story Ideas already exist, describe how they should feel together when the journey works well.` : ""}`
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
        : `The primary actor aims to ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
    }
    case "trigger": {
      const normalized = ensurePeriod(toSentenceCase(raw));
      return /^(when|once|if|after|a |an |the )/i.test(normalized)
        ? normalized
        : `The journey begins when ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
    }
    case "currentState": {
      const normalized = ensurePeriod(toSentenceCase(raw));
      return /^(today|currently|at the moment)/i.test(normalized)
        ? normalized
        : `Today, ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
    }
    case "desiredFutureState": {
      const normalized = ensurePeriod(toSentenceCase(raw));
      return /^(in the future|going forward|ideally)/i.test(normalized)
        ? normalized
        : `In the desired future state, ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
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
    title: `Apply answer for ${input.target.field}`,
    description: "Adds your guided interview answer to the current Journey Context draft.",
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
      ? "across current and future ways of working"
      : input.initiativeType === "AM"
        ? "with stronger operational continuity"
        : "with clearer support and less friction";

  const generatedSteps =
    journey.steps.length > 0
      ? journey.steps
      : [
          {
            id: createId("step"),
            title: `Start ${title || "journey"}`,
            actor,
            description: `${actor} receives or detects the trigger and understands why the journey needs to begin.`,
            currentPain: "Entry into the flow may be fragmented or unclear.",
            desiredSupport: "The trigger and next action should be visible immediately.",
            decisionPoint: false
          },
          {
            id: createId("step"),
            title: `Progress ${title || "journey"}`,
            actor,
            description: `${actor} works through the main flow toward ${lowerFirst(goal)} while coordinating any needed handoffs or checks.`,
            currentPain: "Important progress may depend on manual coordination or hidden status.",
            desiredSupport: "The flow should guide progress, decisions, and handoffs clearly.",
            decisionPoint: true
          },
          {
            id: createId("step"),
            title: `Complete ${title || "journey"}`,
            actor,
            description: `${actor} confirms the outcome, closes the journey, and makes the result visible to the right people.`,
            currentPain: "Completion and follow-up can be inconsistent or hard to verify.",
            desiredSupport: "Completion should be explicit, visible, and easy to hand over or audit.",
            decisionPoint: false
          }
        ];

  const nextJourney: JourneyContext["journeys"][number] = {
    ...journey,
    currentState:
      journey.currentState && journey.currentState.trim().length > 0
        ? journey.currentState
        : `Today, ${actor.toLowerCase()} often starts when ${lowerFirst(trigger)} but the flow can become fragmented through manual coordination, limited visibility, or unclear handoffs.`,
    desiredFutureState:
      journey.desiredFutureState && journey.desiredFutureState.trim().length > 0
        ? journey.desiredFutureState
        : `In the desired future state, ${actor.toLowerCase()} can ${lowerFirst(goal)} ${initiativePhrase}, with clearer status, fewer manual interruptions, and smoother decisions.`,
    painPoints:
      journey.painPoints && journey.painPoints.length > 0
        ? journey.painPoints
        : [
            `The flow can start inconsistently when ${lowerFirst(trigger)}.`,
            "Status, ownership, or next action may become unclear during the journey.",
            `Manual coordination makes it harder to ${lowerFirst(goal)} predictably.`
          ],
    desiredSupport:
      journey.desiredSupport && journey.desiredSupport.length > 0
        ? journey.desiredSupport
        : [
            "Clear entry into the flow with visible trigger and ownership.",
            "Guided progress with better visibility of status, handoffs, and decisions.",
            `Consistent completion support so ${lowerFirst(goal)} is easier to achieve and verify.`
          ],
    steps: generatedSteps
  };

  return {
    id: createId("first-draft-journey"),
    kind: "rewrite_journey",
    title: `Generate first draft for ${title || "this journey"}`,
    description: "Creates a broad first Journey draft with flow language, pain points, desired support, and a few high-level steps.",
    contextId: context.id,
    journeyId: journey.id,
    nextJourney,
    confidence: 0.84
  };
}

function suggestionDetails(suggestion: FramingAgentSuggestion) {
  if (suggestion.kind === "rewrite_journey_step") {
    return suggestion.nextStep.description;
  }

  if (suggestion.kind === "rewrite_journey") {
    return suggestion.nextJourney.goal || suggestion.nextJourney.trigger || "Journey rewrite suggestion.";
  }

  if (suggestion.kind === "rewrite_journey_context") {
    return suggestion.nextContext.description || "Journey Context rewrite suggestion.";
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
  storyIdeaLabels,
  onApplySuggestion,
  createStoryIdeaAction
}: AiAssistantPanelProps) {
  const isCompactSurface = scopeKind === "journey-context" || scopeKind === "story-ideas";
  const [mode, setMode] = useState<FramingAgentMode>(scopeKind === "export" ? "export" : "ask");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<Extract<FramingAgentActionResult, { ok: true }> | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);
  const [guidedAnswer, setGuidedAnswer] = useState("");
  const [guidedDraft, setGuidedDraft] = useState("");
  const [skippedPromptKeys, setSkippedPromptKeys] = useState<string[]>([]);
  const [showAdvancedWorkspace, setShowAdvancedWorkspace] = useState(!isCompactSurface);
  const [isPending, startTransition] = useTransition();
  const quickActions = framingAgentQuickActions[scopeKind] ?? [];
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
        step: "Step 1 of 3",
        title: "Start with one broad journey",
        description: "Use the guided questions to capture one important journey before you worry about analysis or extra detail."
      };
    }

    if (guidedJourneyInterview?.target) {
      return {
        step: "Step 2 of 3",
        title: "Clarify one journey at a time",
        description: "Answer one question at a time here, or write directly in the journey card. The point is to get one journey clear enough to guide the case."
      };
    }

    if (canGenerateFirstDraft && firstDraftJourneySuggestion) {
      return {
        step: "Step 2 of 3",
        title: "Generate a broader first draft",
        description: "The basics are in place. You can now let AI draft the broader current state, desired future state, and a few high-level pain points."
      };
    }

    return {
      step: "Step 3 of 3",
      title: "Analyze coverage when the journey feels right",
      description: "When a journey is directionally clear, use analysis to compare it with Epics and Story Ideas and spot gaps."
    };
  }, [canGenerateFirstDraft, firstDraftJourneySuggestion, guidedJourneyInterview, journeyFocusOptions.length, scopeKind]);
  const assistantTitle = scopeKind === "journey-context" ? "AI help for the next step" : "AI Assistant";
  const assistantDescription =
    scopeKind === "journey-context"
      ? "Use this first for step-by-step help with the current journey. Open more AI options only when you want deeper analysis or free prompting."
      : framingAgentIntroText;
  const visibleSuggestions = useMemo(
    () => result?.suggestions.filter((suggestion) => !dismissedIds.includes(suggestion.id)) ?? [],
    [dismissedIds, result]
  );

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
    if (mode !== "ask" || result || prompt.trim()) {
      setShowAdvancedWorkspace(true);
    }
  }, [mode, prompt, result]);

  function dismissSuggestion(suggestionId: string) {
    setDismissedIds((current) => (current.includes(suggestionId) ? current : [...current, suggestionId]));
  }

  function handleApplySuggestion(suggestion: FramingAgentSuggestion) {
    if (!onApplySuggestion) {
      return;
    }

    onApplySuggestion(suggestion);
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

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {assistantTitle}
            </CardTitle>
            <CardDescription>{assistantDescription}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              {initiativeType ?? "Unset"}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              AI Level {aiLevel}
            </span>
            {!isCompactSurface ? (
              <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
                Mode: {framingAgentModeLabels[mode]}
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
              {hasUnsavedChanges ? "Unsaved draft" : "Saved draft"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {guidedJourneyInterview ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
            {journeyHelpState ? (
              <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">{journeyHelpState.step}</p>
                <p className="mt-2 text-base font-semibold text-foreground">{journeyHelpState.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{journeyHelpState.description}</p>
                <p className="mt-3 text-sm text-foreground">
                  You can either answer one question at a time here or edit the journey card directly below.
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Step-by-step journey help</p>
                <p className="mt-1 text-sm text-sky-900/85">
                  The AI help here is simple on purpose: one question at a time, focused on the journey that should carry the value.
                </p>
                {guidedJourneyInterview.focusedJourneyLabel ? (
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-sky-900/75">
                    Focused on {guidedJourneyInterview.focusedJourneyLabel}
                  </p>
                ) : null}
              </div>
              <span className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-800">
                {guidedJourneyInterview.contextCount} context / {guidedJourneyInterview.journeyCount} journey
              </span>
            </div>

            {journeyFocusOptions.length > 0 && onFocusJourney ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Journey focus</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onFocusJourney(null)}
                    type="button"
                    variant={focusedJourneyId ? "secondary" : "default"}
                  >
                    All journeys
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
                    <p className="font-medium text-foreground">Generate first draft journey</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The core Journey inputs are in place. You can now generate a broader first draft for the rest of the flow.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApplySuggestion(firstDraftJourneySuggestion)}
                    type="button"
                  >
                    Apply first draft
                  </Button>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Draft current state</p>
                    <p className="text-sm leading-6 text-foreground">{firstDraftJourneySuggestion.nextJourney.currentState}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Draft desired future state</p>
                    <p className="text-sm leading-6 text-foreground">{firstDraftJourneySuggestion.nextJourney.desiredFutureState}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Draft pain points</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {(firstDraftJourneySuggestion.nextJourney.painPoints ?? []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Draft desired support</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {(firstDraftJourneySuggestion.nextJourney.desiredSupport ?? []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {firstDraftJourneySuggestion.nextJourney.steps.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Draft broad steps</p>
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

            {guidedJourneyInterview.target ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Next question</p>
                  <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{guidedJourneyInterview.target.question}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{guidedJourneyInterview.target.helper}</p>
                  <p className="mt-3 text-xs text-sky-900/70">
                    Remaining gaps: {guidedJourneyInterview.target.totalMissing}
                    {guidedJourneyInterview.target.skippedMissing > 0
                      ? ` / skipped for now: ${guidedJourneyInterview.target.skippedMissing}`
                      : ""}
                  </p>
                </div>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500"
                  onChange={(event) => setGuidedAnswer(event.target.value)}
                  placeholder={guidedJourneyInterview.target.placeholder}
                  value={guidedAnswer}
                />
                {guidedDraft && guidedDraft !== guidedAnswer.trim() ? (
                  <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Suggested wording</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{guidedDraft}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      This is a cleaner Journey-style wording suggestion based on your raw answer.
                    </p>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={!guidedDraft.trim()}
                    onClick={() => applyGuidedJourneyAnswer(guidedDraft)}
                    type="button"
                  >
                    Use suggested wording
                  </Button>
                  <Button disabled={!guidedAnswer.trim()} onClick={() => applyGuidedJourneyAnswer()} type="button" variant="secondary">
                    Use my wording
                  </Button>
                  <Button onClick={skipGuidedJourneyQuestion} type="button" variant="secondary">
                    Skip this question
                  </Button>
                  {skippedPromptKeys.length > 0 ? (
                    <Button onClick={() => setSkippedPromptKeys([])} type="button" variant="secondary">
                      Review skipped questions
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : guidedJourneyInterview.isComplete ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-white px-4 py-4">
                <p className="font-medium text-foreground">The core Journey framing is already captured.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Move to `Refine` for wording help or `Analyze` for coverage against Epics and Story Ideas.
                </p>
              </div>
            ) : guidedJourneyInterview.hasOnlySkippedQuestions ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-white px-4 py-4">
                <p className="font-medium text-foreground">All remaining guided questions are currently skipped.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bring them back when you want to continue tightening the Journey description.
                </p>
                <div className="mt-3">
                  <Button onClick={() => setSkippedPromptKeys([])} type="button" variant="secondary">
                    Review skipped questions
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {isCompactSurface ? (
          <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">More AI options</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open this only when you want analysis, freeform prompting, Story Idea suggestions, or export support.
                </p>
              </div>
              <Button onClick={() => setShowAdvancedWorkspace((current) => !current)} type="button" variant="secondary">
                {showAdvancedWorkspace ? "Hide more AI options" : "Show more AI options"}
              </Button>
            </div>
          </div>
        ) : null}

        {(showAdvancedWorkspace || !isCompactSurface) ? (
          <div className="space-y-5 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {(["ask", "analyze", "refine", "export"] as FramingAgentMode[]).map((entry) => (
                <Button key={entry} onClick={() => setMode(entry)} type="button" variant={mode === entry ? "default" : "secondary"}>
                  {framingAgentModeLabels[entry]}
                </Button>
              ))}
            </div>

            {quickActions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Other AI actions</p>
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
                <span className="text-sm font-medium text-foreground">Prompt</span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={scopeKind === "journey-context" ? "Ask the AI to analyze, refine, or explain the current journeys." : "Ask, analyze, refine, or export against the current Framing package."}
                  value={prompt}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={isPending || !prompt.trim()}
                  onClick={() => submitAgentRun(mode, prompt)}
                  type="button"
                >
                  {isPending ? "Running..." : "Run assistant"}
                </Button>
              </div>
            </div>

            {result ? (
              <div className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-900">
                    {result.role}
                  </span>
                  <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-900">
                    {result.usedLiveAi ? "Live AI planner" : "Structured local planner"}
                  </span>
                </div>
                <p>{result.message}</p>
                {result.helperText ? <p className="text-xs leading-6 text-sky-900/80">{result.helperText}</p> : null}
              </div>
            ) : null}

            {result?.followUpQuestions.length ? (
              <div className="rounded-2xl border border-sky-200/80 bg-white px-4 py-4 text-sm text-foreground">
                <p className="font-medium text-foreground">Follow-up questions</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                  {result.followUpQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result?.warnings.length ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                <p className="font-medium">Warnings</p>
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {visibleSuggestions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Suggested actions</p>
                {visibleSuggestions.map((suggestion) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={suggestion.id}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">{suggestion.title}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{suggestion.description}</p>
                        <p className="text-sm leading-6 text-foreground">{suggestionDetails(suggestion)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.kind === "story_idea_candidate" && createStoryIdeaAction ? (
                          <form action={createStoryIdeaAction}>
                            <input name="outcomeId" type="hidden" value={outcomeId} />
                            <input name="quickStoryIdeaEpicId" type="hidden" value={suggestion.storyIdea.suggestedEpicId ?? ""} />
                            <input name="quickStoryIdeaTitle" type="hidden" value={suggestion.storyIdea.title} />
                            <Button type="submit">Apply suggestion</Button>
                          </form>
                        ) : onApplySuggestion ? (
                          <Button onClick={() => handleApplySuggestion(suggestion)} type="button">
                            Apply suggestion
                          </Button>
                        ) : null}
                        <Button onClick={() => dismissSuggestion(suggestion.id)} type="button" variant="secondary">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {result?.artifacts.length ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Generated artifacts</p>
                {result.artifacts.map((artifact) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={artifact.kind}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{artifact.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{artifact.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleCopyArtifact(`${artifact.kind}-markdown`, artifact.markdown)}
                          type="button"
                          variant="secondary"
                        >
                          {copiedArtifact === `${artifact.kind}-markdown` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Copy markdown
                        </Button>
                        <Button
                          onClick={() => handleCopyArtifact(`${artifact.kind}-json`, JSON.stringify(artifact.json, null, 2))}
                          type="button"
                          variant="secondary"
                        >
                          {copiedArtifact === `${artifact.kind}-json` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Copy JSON
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

            {result?.toolTrace.length ? (
              <details className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground">Tool trace</summary>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {result.toolTrace.map((entry, index) => (
                    <li key={`${entry.tool}-${index}`}>{entry.tool}: {entry.summary}</li>
                  ))}
                </ul>
              </details>
            ) : null}

            {history.length > 0 ? (
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
    </Card>
  );
}
