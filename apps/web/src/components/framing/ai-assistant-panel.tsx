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
  runAction: (formData: FormData) => Promise<FramingAgentActionResult>;
  journeyContextsJson?: string | null;
  downstreamAiInstructionsJson?: string | null;
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
  | "contextTitle"
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

function buildGuidedJourneyPrompt(
  field: GuidedJourneyField,
  journeyLabel: string
): Pick<GuidedJourneyInterviewTarget, "question" | "placeholder" | "helper"> {
  switch (field) {
    case "contextTitle":
      return {
        question: "What should this flow area be called?",
        placeholder: "Example: Case handling context",
        helper: "Name the broader flow area first. Keep it short and meaningful."
      };
    case "journeyTitle":
      return {
        question: `What should ${journeyLabel} be called?`,
        placeholder: "Example: Handle incoming case",
        helper: "Use a short verb-driven name that describes the whole flow."
      };
    case "primaryActor":
      return {
        question: `Who is the primary actor in ${journeyLabel}?`,
        placeholder: "Example: Case officer",
        helper: "Name the main role driving the journey."
      };
    case "goal":
      return {
        question: `What is the primary goal in ${journeyLabel}?`,
        placeholder: "Example: Resolve the case without manual handoffs",
        helper: "Describe what the actor is trying to achieve, not which screen they need."
      };
    case "trigger":
      return {
        question: `What usually triggers ${journeyLabel}?`,
        placeholder: "Example: A new customer case arrives",
        helper: "Describe what starts the flow."
      };
    case "currentState":
      return {
        question: `How does ${journeyLabel} work today?`,
        placeholder: "Example: Work starts in email, continues in spreadsheets, and often stalls during handoff",
        helper: "Focus on friction, fragmentation, delays, or ambiguity in the current flow."
      };
    case "desiredFutureState":
      return {
        question: `How should ${journeyLabel} work in the desired future state?`,
        placeholder: "Example: The actor follows one clear flow with visible status and fewer manual checks",
        helper: "Describe better support and smoother flow, not detailed UI design."
      };
  }
}

function buildGuidedJourneyInterviewState(input: {
  outcomeId: string;
  initiativeType: "AD" | "AT" | "AM" | null;
  rawJourneyContexts: JourneyContext[];
  skippedPromptKeys: string[];
}): GuidedJourneyInterviewState {
  const normalizedContexts = input.rawJourneyContexts.length > 0 ? input.rawJourneyContexts : [createStarterJourneyContext(input.outcomeId, input.initiativeType)];
  const skipped = new Set(input.skippedPromptKeys);
  const missingTargets: GuidedJourneyInterviewTarget[] = [];
  let journeyCount = 0;

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

    const contextFieldOrder: GuidedJourneyField[] = ["contextTitle"];

    for (const field of contextFieldOrder) {
      const promptKey = `${context.id}:${field}`;

      if (field === "contextTitle" && !hasText(context.title)) {
        const prompt = buildGuidedJourneyPrompt(field, "this journey");
        missingTargets.push({
          context,
          journey: firstJourney,
          field,
          question: prompt.question,
          placeholder: prompt.placeholder,
          helper: prompt.helper,
          promptKey,
          totalMissing: 0,
          skippedMissing: 0
        });
      }
    }

    journeys.forEach((journey, index) => {
      const journeyLabel = buildJourneyFieldLabel(journey, index);
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

        const prompt = buildGuidedJourneyPrompt(field, journeyLabel);
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
      journeyCount
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
    journeyCount
  };
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

  if (input.target.field === "contextTitle") {
    nextContext.title = answer;
  }

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
  runAction,
  journeyContextsJson,
  downstreamAiInstructionsJson,
  onApplySuggestion,
  createStoryIdeaAction
}: AiAssistantPanelProps) {
  const [mode, setMode] = useState<FramingAgentMode>(scopeKind === "export" ? "export" : "ask");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<Extract<FramingAgentActionResult, { ok: true }> | null>(null);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);
  const [guidedAnswer, setGuidedAnswer] = useState("");
  const [skippedPromptKeys, setSkippedPromptKeys] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const quickActions = framingAgentQuickActions[scopeKind] ?? [];
  const rawJourneyContexts = useMemo(() => parseJourneyContextsJson(journeyContextsJson), [journeyContextsJson]);
  const guidedJourneyInterview = useMemo(
    () =>
      scopeKind === "journey-context" && mode === "ask"
        ? buildGuidedJourneyInterviewState({
            outcomeId,
            initiativeType,
            rawJourneyContexts,
            skippedPromptKeys
          })
        : null,
    [initiativeType, mode, outcomeId, rawJourneyContexts, scopeKind, skippedPromptKeys]
  );
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
  }, [guidedJourneyInterview?.target?.promptKey]);

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

  function applyGuidedJourneyAnswer() {
    if (!guidedJourneyInterview?.target || !onApplySuggestion || !guidedAnswer.trim()) {
      return;
    }

    const suggestion = buildGuidedJourneySuggestion({
      target: guidedJourneyInterview.target,
      answer: guidedAnswer
    });

    onApplySuggestion(suggestion);
    setGuidedAnswer("");
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
              AI Assistant
            </CardTitle>
            <CardDescription>{framingAgentIntroText}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              Mode: {framingAgentModeLabels[mode]}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              {initiativeType ?? "Unset"}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              AI Level {aiLevel}
            </span>
            <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              Scope: {scopeLabel}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {(["ask", "analyze", "refine", "export"] as FramingAgentMode[]).map((entry) => (
            <Button key={entry} onClick={() => setMode(entry)} type="button" variant={mode === entry ? "default" : "secondary"}>
              {framingAgentModeLabels[entry]}
            </Button>
          ))}
        </div>

        {guidedJourneyInterview ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Guided journey interview</p>
                <p className="mt-1 text-sm text-emerald-900/85">
                  Work one question at a time. Each answer updates the local Journey draft only after you explicitly apply it.
                </p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-800">
                {guidedJourneyInterview.contextCount} context / {guidedJourneyInterview.journeyCount} journey
              </span>
            </div>

            {guidedJourneyInterview.target ? (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{guidedJourneyInterview.target.question}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-900/80">{guidedJourneyInterview.target.helper}</p>
                  <p className="mt-2 text-xs text-emerald-900/70">
                    Remaining gaps: {guidedJourneyInterview.target.totalMissing}
                    {guidedJourneyInterview.target.skippedMissing > 0
                      ? ` / skipped for now: ${guidedJourneyInterview.target.skippedMissing}`
                      : ""}
                  </p>
                </div>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                  onChange={(event) => setGuidedAnswer(event.target.value)}
                  placeholder={guidedJourneyInterview.target.placeholder}
                  value={guidedAnswer}
                />
                <div className="flex flex-wrap gap-3">
                  <Button disabled={!guidedAnswer.trim()} onClick={applyGuidedJourneyAnswer} type="button">
                    Apply answer
                  </Button>
                  <Button onClick={skipGuidedJourneyQuestion} type="button" variant="secondary">
                    Skip for now
                  </Button>
                  {skippedPromptKeys.length > 0 ? (
                    <Button onClick={() => setSkippedPromptKeys([])} type="button" variant="secondary">
                      Review skipped questions
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : guidedJourneyInterview.isComplete ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-4">
                <p className="font-medium text-foreground">The core Journey framing is already captured.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Move to `Refine` for wording help or `Analyze` for coverage against Epics and Story Ideas.
                </p>
              </div>
            ) : guidedJourneyInterview.hasOnlySkippedQuestions ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-4">
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

        {quickActions.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick actions</p>
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
              placeholder="Ask, analyze, refine, or export against the current Framing package."
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
              <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4" key={suggestion.id}>
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
              <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4" key={artifact.kind}>
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
                <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-background p-4 text-xs text-foreground">
                  <code>{artifact.markdown}</code>
                </pre>
              </div>
            ))}
          </div>
        ) : null}

        {result?.toolTrace.length ? (
          <details className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground">Tool trace</summary>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {result.toolTrace.map((entry, index) => (
                <li key={`${entry.tool}-${index}`}>{entry.tool}: {entry.summary}</li>
              ))}
            </ul>
          </details>
        ) : null}

        {history.length > 0 ? (
          <details className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground">Recent conversation history</summary>
            <div className="mt-3 space-y-3">
              {history.slice(0, 5).map((entry) => (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={entry.id}>
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
      </CardContent>
    </Card>
  );
}
