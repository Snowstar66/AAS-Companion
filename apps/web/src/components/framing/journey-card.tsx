"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";
import { JourneyStepEditor } from "@/components/framing/journey-step-editor";
import type { Journey } from "@/lib/framing/journeyContextTypes";
import type { JourneyReferenceOption, JourneyValidation } from "@/lib/framing/journey-context-ui";

type JourneyCardProps = {
  journey: Journey;
  validation: JourneyValidation | undefined;
  availableEpics: JourneyReferenceOption[];
  availableStoryIdeas: JourneyReferenceOption[];
  availableFigmaRefs: JourneyReferenceOption[];
  isFocused: boolean;
  onFocus: (() => void) | undefined;
  onChange: (nextJourney: Journey) => void;
  onRemove: () => void;
  onAddStep: () => void;
  onUpdateStep: (stepId: string, updater: (step: Journey["steps"][number]) => Journey["steps"][number]) => void;
  onMoveStep: (stepId: string, direction: "up" | "down") => void;
  onRemoveStep: (stepId: string) => void;
};

type JourneyCoreSuggestion = {
  title: string;
  goal: string;
  trigger: string;
};

type JourneyFirstDraftSuggestion = {
  summary: string;
  currentState: string;
  desiredFutureState: string;
  painPoints: string[];
  desiredSupport: string[];
  steps: Journey["steps"];
  relatedEpicLabels: string[];
  relatedEpicInsights: string[];
  relatedStoryIdeaLabels: string[];
  relatedStoryIdeaInsights: string[];
  suggestedStoryIdeas: Array<{
    title: string;
    description: string;
    source: "coverage" | "heuristic";
  }>;
};

type JourneyEditingSection = "core" | "narrative" | "valueMoment" | "success" | "current" | "desired" | "pain" | "support" | null;

function FieldHint({ children }: { children: string }) {
  return <p className="text-xs leading-5 text-muted-foreground">{children}</p>;
}

function FieldError({ children }: { children: string | undefined }) {
  if (!children) {
    return null;
  }

  return <p className="text-xs font-medium text-amber-700">{children}</p>;
}

function joinLines(values: string[] | undefined) {
  return (values ?? []).join("\n");
}

function parseLines(value: string) {
  return value
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSentenceCase(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function ensurePeriod(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function lowerFirst(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function stripTrailingPeriod(value: string) {
  return value.trim().replace(/[.!?]+$/g, "");
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function normalizeJourneyTitle(value: string) {
  const trimmed = value.trim().replace(/^titel:\s*/i, "");
  if (!trimmed) return "";
  return toSentenceCase(trimmed);
}

function findReferenceLabels(ids: string[] | undefined, options: JourneyReferenceOption[]) {
  return (ids ?? []).map((id) => options.find((option) => option.id === id)?.label ?? id);
}

function uniqueLabels(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueReferenceOptions(options: JourneyReferenceOption[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.id)) {
      return false;
    }

    seen.add(option.id);
    return true;
  });
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenizeText(value: string) {
  const stopWords = new Set([
    "och",
    "att",
    "det",
    "den",
    "detta",
    "som",
    "for",
    "med",
    "till",
    "eller",
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "then",
    "har",
    "ska",
    "kan",
    "sig",
    "sin",
    "sitt",
    "vara"
  ]);

  return Array.from(
    new Set(
      normalizeSearchText(value)
        .split(/[^a-z0-9]+/i)
        .map((item) => item.trim())
        .filter((item) => item.length > 2 && !stopWords.has(item))
    )
  );
}

function summarizeReferenceContext(option: JourneyReferenceOption) {
  return [
    option.purpose,
    option.valueIntent,
    option.expectedBehavior,
    option.scopeBoundary,
    option.description
  ]
    .map((value) => value?.trim())
    .filter(Boolean)[0] ?? "";
}

function rankReferenceOptions(options: JourneyReferenceOption[], journeySearchText: string) {
  const journeyTokens = tokenizeText(journeySearchText);
  if (journeyTokens.length === 0) {
    return [];
  }

  return options
    .map((option) => {
      const optionTokens = tokenizeText(
        [option.label, option.description, option.valueIntent, option.expectedBehavior, option.purpose, option.scopeBoundary]
          .filter(Boolean)
          .join(" ")
      );
      const overlapCount = optionTokens.filter((token) => journeyTokens.includes(token)).length;
      return {
        option,
        score: overlapCount
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.option);
}

function pickRelevantReferenceOptions(params: {
  explicitIds: string[];
  options: JourneyReferenceOption[];
  journeySearchText: string;
  limit: number;
}) {
  const explicit = params.explicitIds
    .map((id) => params.options.find((option) => option.id === id))
    .filter((option): option is JourneyReferenceOption => Boolean(option));
  const ranked = rankReferenceOptions(
    params.options.filter((option) => !params.explicitIds.includes(option.id)),
    params.journeySearchText
  );

  return uniqueReferenceOptions([...explicit, ...ranked]).slice(0, params.limit);
}

function truncateText(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}...`;
}

function cleanCoverageNote(value: string | undefined) {
  if (!value) return null;
  return value.replace(/^AI-generated recommendation scaffold based on Journey text overlap with current Epics and Story Ideas\.\s*/i, "").trim() || value;
}

function normalizeGoalPhrase(value: string) {
  const trimmed = stripTrailingPeriod(value);
  if (!trimmed) return "";

  return trimmed
    .replace(/^huvudaktören vill\s+/i, "")
    .replace(/^aktören vill\s+/i, "")
    .replace(/^jag vill\s+/i, "")
    .replace(/^vill\s+/i, "");
}

function normalizeTriggerPhrase(value: string) {
  const trimmed = stripTrailingPeriod(value);
  if (!trimmed) return "";

  return trimmed
    .replace(/^journeyn börjar när\s+/i, "")
    .replace(/^börjar när\s+/i, "")
    .replace(/^när\s+/i, "");
}

function CoverageSupportText({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {labels.map((label) => (
        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800" key={label}>
          {label}
        </span>
      ))}
    </div>
  );
}

function InlineStoryIdeaSuggestionList(props: {
  title: string;
  description?: string;
  suggestions: Array<{
    title: string;
    description: string;
    source: "coverage" | "heuristic";
  }>;
}) {
  if (props.suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">{props.title}</p>
        {props.description ? <p className="mt-1 text-sm text-muted-foreground">{props.description}</p> : null}
      </div>
      <div className="space-y-3">
        {props.suggestions.map((suggestion) => (
          <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={`${suggestion.source}-${suggestion.title}`}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{suggestion.title}</p>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-800">
                {suggestion.source === "coverage" ? "från täckningsanalys" : "AI-utkast"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InlineSectionCard(props: {
  title: string;
  description?: string;
  actionLabel: string;
  onToggleEdit: () => void;
  isEditing: boolean;
  children: ReactNode;
  editor: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-muted/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{props.title}</p>
          {props.description ? <p className="mt-1 text-sm text-muted-foreground">{props.description}</p> : null}
        </div>
        <Button onClick={props.onToggleEdit} size="sm" type="button" variant={props.isEditing ? "secondary" : "default"}>
          {props.isEditing ? "Klar" : props.actionLabel}
        </Button>
      </div>
      <div className="mt-4">{props.children}</div>
      {props.helper ? <div className="mt-3">{props.helper}</div> : null}
      {props.isEditing ? <div className="mt-4">{props.editor}</div> : null}
    </div>
  );
}

function InlineAiSuggestion(props: {
  title: string;
  text: string;
  targetLabel: string;
  onApply: () => void;
  onDismiss: () => void;
}) {
  if (!props.text.trim()) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 text-sky-900" />
        <div className="space-y-2">
          <p className="font-medium text-foreground">{props.title}</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Om du använder förslaget skrivs det direkt in i fältet <span className="font-medium text-foreground">{props.targetLabel}</span> i redigeringen nedanför.
          </p>
          <p className="leading-6 text-foreground">{props.text}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={props.onApply} size="sm" type="button">Använd i {props.targetLabel.toLowerCase()}</Button>
        <Button onClick={props.onDismiss} size="sm" type="button" variant="secondary">Dölj</Button>
      </div>
    </div>
  );
}

function InlineAiCoreSuggestion(props: { suggestion: JourneyCoreSuggestion; onApply: () => void; onDismiss: () => void }) {
  if (![props.suggestion.title, props.suggestion.goal, props.suggestion.trigger].some(Boolean)) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 text-sky-900" />
        <div className="space-y-3">
          <p className="font-medium text-foreground">AI-förslag för titel, mål och trigger</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Om du använder förslaget uppdateras fälten <span className="font-medium text-foreground">Titel</span>, <span className="font-medium text-foreground">Mål</span> och <span className="font-medium text-foreground">Trigger</span> direkt i redigeringen nedanför.
          </p>
          {props.suggestion.title ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Titel</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.title}</p></div> : null}
          {props.suggestion.goal ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Mål</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.goal}</p></div> : null}
          {props.suggestion.trigger ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Trigger</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.trigger}</p></div> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={props.onApply} size="sm" type="button">Använd i redigeringen</Button>
        <Button onClick={props.onDismiss} size="sm" type="button" variant="secondary">Dölj</Button>
      </div>
    </div>
  );
}
function getCoreMissingCount(journey: Journey) {
  return [hasText(journey.title), hasText(journey.primaryActor), hasText(journey.goal), hasText(journey.trigger)].filter((entry) => !entry).length;
}

function CoverageBadge({ status }: { status: string }) {
  const tone = status === "covered"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : status === "partially_covered"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : status === "uncovered"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>{status === "covered" ? "täckt" : status === "partially_covered" ? "delvis täckt" : status === "uncovered" ? "otäckt" : "ej analyserad"}</span>;
}

function StepSummary({ count }: { count: number }) {
  return <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">{count} steg</span>;
}

function MultiSelectLinks(props: { title: string; helper: string; options: JourneyReferenceOption[]; selectedIds: string[] | undefined; onChange: (nextIds: string[]) => void }) {
  if (props.options.length === 0) return null;
  const selected = new Set(props.selectedIds ?? []);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{props.title}</p>
      <p className="text-xs leading-5 text-muted-foreground">{props.helper}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {props.options.map((option) => {
          const isChecked = selected.has(option.id);
          return (
            <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-sm" key={option.id}>
              <input
                checked={isChecked}
                className="mt-1 h-4 w-4"
                onChange={(event) => {
                  const next = event.target.checked ? [...selected, option.id] : [...selected].filter((item) => item !== option.id);
                  props.onChange(next);
                }}
                type="checkbox"
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function JourneyCard({ journey, validation, availableEpics, availableStoryIdeas, availableFigmaRefs, isFocused, onFocus, onChange, onRemove, onAddStep, onUpdateStep, onMoveStep, onRemoveStep }: JourneyCardProps) {
  const optionalDetailCount = (journey.steps.length > 0 ? 1 : 0) + ((journey.painPoints?.length ?? 0) > 0 ? 1 : 0) + ((journey.desiredSupport?.length ?? 0) > 0 ? 1 : 0) + ((journey.linkedEpicIds?.length ?? 0) > 0 || (journey.linkedStoryIdeaIds?.length ?? 0) > 0 || (journey.linkedFigmaRefs?.length ?? 0) > 0 ? 1 : 0);
  const coreMissingCount = getCoreMissingCount(journey);
  const suggestedEpicLabels = findReferenceLabels(journey.coverage?.suggestedEpicIds, availableEpics);
  const suggestedStoryIdeaLabels = findReferenceLabels(journey.coverage?.suggestedStoryIdeaIds, availableStoryIdeas);
  const cleanedCoverageNote = cleanCoverageNote(journey.coverage?.notes);
  const [isOpen, setIsOpen] = useState(isFocused);
  const [editingSection, setEditingSection] = useState<JourneyEditingSection>(coreMissingCount > 0 ? "core" : null);
  const [coreSuggestion, setCoreSuggestion] = useState<JourneyCoreSuggestion | null>(null);
  const [narrativeSuggestion, setNarrativeSuggestion] = useState("");
  const [valueMomentSuggestion, setValueMomentSuggestion] = useState("");
  const [successSignalsSuggestion, setSuccessSignalsSuggestion] = useState<string[]>([]);
  const journeyStageLabel = coreMissingCount > 0 ? `${coreMissingCount} kärnfält kvar` : (journey.coverage?.status ?? "unanalysed") === "unanalysed" ? "Redo för analys" : "Analyserad";
  const hasEmptyDraftSections =
    !hasText(journey.currentState) ||
    !hasText(journey.desiredFutureState) ||
    !((journey.painPoints?.length ?? 0) > 0) ||
    !((journey.desiredSupport?.length ?? 0) > 0) ||
    journey.steps.length === 0;

  useEffect(() => {
    if (isFocused) {
      setIsOpen(true);
    }
  }, [isFocused]);

  useEffect(() => {
    setCoreSuggestion(null);
    setNarrativeSuggestion("");
    setValueMomentSuggestion("");
    setSuccessSignalsSuggestion([]);
    setEditingSection(coreMissingCount > 0 ? "core" : null);
  }, [journey.id]);

  const canBuildJourneySummary =
    hasText(journey.title) &&
    hasText(journey.primaryActor) &&
    hasText(journey.goal) &&
    hasText(journey.trigger);
  const journeySearchText = [
    journey.title,
    journey.primaryActor,
    journey.goal,
    journey.trigger,
    journey.narrative,
    journey.valueMoment,
    ...(journey.successSignals ?? []),
    journey.currentState,
    journey.desiredFutureState,
    ...(journey.painPoints ?? []),
    ...(journey.desiredSupport ?? []),
    ...journey.steps.flatMap((step) => [step.title, step.description, step.currentPain, step.desiredSupport])
  ]
    .filter(Boolean)
    .join(" ");
  const relevantEpicOptions = pickRelevantReferenceOptions({
    explicitIds: uniqueLabels([...(journey.linkedEpicIds ?? []), ...(journey.coverage?.suggestedEpicIds ?? [])]),
    options: availableEpics,
    journeySearchText,
    limit: 2
  });
  const relevantStoryIdeaOptions = pickRelevantReferenceOptions({
    explicitIds: uniqueLabels([...(journey.linkedStoryIdeaIds ?? []), ...(journey.coverage?.suggestedStoryIdeaIds ?? [])]),
    options: availableStoryIdeas,
    journeySearchText,
    limit: 4
  });
  const relevantEpicInsights = relevantEpicOptions
    .map((option) => summarizeReferenceContext(option))
    .filter(Boolean)
    .map((item) => ensurePeriod(toSentenceCase(item)));
  const relevantEpicLabels = uniqueLabels(relevantEpicOptions.map((option) => option.label));
  const relevantStoryIdeaLabels = uniqueLabels(relevantStoryIdeaOptions.map((option) => option.label));
  const relevantStoryIdeaInsights = uniqueLabels(
    relevantStoryIdeaOptions
      .flatMap((option) => [option.valueIntent, option.expectedBehavior, option.description])
      .map((value) => value?.trim() ?? "")
      .filter(Boolean)
      .map((item) => ensurePeriod(toSentenceCase(item)))
  ).slice(0, 3);

  function buildGoalSuggestion() {
    const normalized = normalizeGoalPhrase(journey.goal || "");
    if (!normalized) return "";
    const actor = journey.primaryActor.trim();
    return ensurePeriod(actor ? `${actor} vill ${lowerFirst(normalized)}` : `Aktören vill ${lowerFirst(normalized)}`);
  }

  function buildTriggerSuggestion() {
    const normalized = normalizeTriggerPhrase(journey.trigger || "");
    if (!normalized) return "";
    return ensurePeriod(`Journeyn börjar när ${lowerFirst(normalized)}`);
  }

  function buildCoreSuggestion() {
    return { title: normalizeJourneyTitle(journey.title), goal: buildGoalSuggestion(), trigger: buildTriggerSuggestion() };
  }

  function buildCurrentStateSuggestion() {
    const normalized = ensurePeriod(toSentenceCase(journey.currentState || ""));
    if (normalized) return /^(i dag|idag|nu)/i.test(normalized) ? normalized : `I dag ${lowerFirst(normalized)}`;
    if (!hasText(journey.primaryActor) || !hasText(journey.trigger)) return "";
    const inspiration = relevantStoryIdeaInsights[0] ?? relevantEpicInsights[0] ?? "";
    return inspiration
      ? ensurePeriod(`I dag börjar ${journey.primaryActor.toLowerCase()} ofta när ${lowerFirst(journey.trigger)}, men flödet blir lätt fragmenterat. Det märks särskilt där stödet ännu inte riktigt lever upp till riktningar som ${lowerFirst(inspiration)}`)
      : `I dag börjar ${journey.primaryActor.toLowerCase()} ofta när ${lowerFirst(journey.trigger)}, men flödet blir lätt fragmenterat av manuell samordning, begränsad överblick eller oklara överlämningar.`;
  }

  function buildDesiredFutureStateSuggestion() {
    const normalized = ensurePeriod(toSentenceCase(journey.desiredFutureState || ""));
    if (normalized) return /^(i önskat läge|i framtiden|framåt)/i.test(normalized) ? normalized : `I önskat läge ${lowerFirst(normalized)}`;
    if (!hasText(journey.primaryActor) || !hasText(journey.goal)) return "";
    const inspiration = relevantStoryIdeaInsights[0] ?? relevantEpicInsights[0] ?? "";
    return inspiration
      ? ensurePeriod(`I önskat läge kan ${journey.primaryActor.toLowerCase()} ${lowerFirst(normalizeGoalPhrase(journey.goal))}, med tydligare status och stöd som bättre speglar riktningar som ${lowerFirst(inspiration)}`)
      : `I önskat läge kan ${journey.primaryActor.toLowerCase()} ${lowerFirst(journey.goal)}, med tydligare status, färre manuella avbrott och smidigare beslut.`;
  }

  function buildNarrativeSuggestion() {
    if (hasText(journey.narrative)) {
      return ensurePeriod(journey.narrative ?? "");
    }

    const actor = journey.primaryActor.trim() || "Användaren";
    const goal = normalizeGoalPhrase(journey.goal);
    const trigger = normalizeTriggerPhrase(journey.trigger);
    const currentState = buildCurrentStateSuggestion();
    const desiredFuture = buildDesiredFutureStateSuggestion();
    const storySupport = relevantStoryIdeaInsights[0] ? ` Stödet bör särskilt hjälpa där ${lowerFirst(relevantStoryIdeaInsights[0])}` : "";

    if (!goal || !trigger) {
      return "";
    }

    return [
      `${actor} arbetar i ett flöde där behovet uppstår när ${lowerFirst(trigger)}.`,
      currentState,
      `${actor} ska kunna ${lowerFirst(goal)} med tydligare stöd i det framtida flödet.`,
      desiredFuture,
      storySupport.trim()
    ]
      .filter(Boolean)
      .join(" ");
  }

  function buildValueMomentSuggestion() {
    if (hasText(journey.valueMoment)) {
      return ensurePeriod(journey.valueMoment ?? "");
    }

    const actor = journey.primaryActor.trim() || "användaren";
    const goal = normalizeGoalPhrase(journey.goal);

    if (!goal) {
      return "";
    }

    return ensurePeriod(
      `Det avgörande värdeögonblicket är när ${actor.toLowerCase()} inte längre behöver hålla ihop arbetet manuellt, utan kan ${lowerFirst(goal)} direkt med stöd av systemet`
    );
  }

  function buildSuccessSignalsSuggestion() {
    if ((journey.successSignals?.length ?? 0) > 0) {
      return journey.successSignals ?? [];
    }

    const actor = journey.primaryActor.trim() || "användaren";
    const baseSignals = [
      `förstått vad som behöver göras utan att tappa överblicken`,
      `kunnat arbeta vidare direkt i systemet`,
      `känt trygghet i att viktiga steg eller åtgärder inte tappas bort`
    ];

    if (hasText(journey.goal)) {
      baseSignals.unshift(`${actor.toLowerCase()} kunnat ${lowerFirst(normalizeGoalPhrase(journey.goal))}`);
    }

    return uniqueLabels(baseSignals.map((item) => item.trim())).slice(0, 4);
  }

  function buildMissingStoryIdeaSuggestions() {
    const coverageSuggestions =
      journey.coverage?.suggestedNewStoryIdeas?.map((idea) => ({
        title: idea.title,
        description: idea.description,
        source: "coverage" as const
      })) ?? [];

    if (coverageSuggestions.length > 0) {
      return coverageSuggestions;
    }

    if (!canBuildJourneySummary) {
      return [];
    }

    const title = normalizeJourneyTitle(journey.title) || "journeyn";
    const actor = journey.primaryActor.trim() || "användaren";
    const goal = normalizeGoalPhrase(journey.goal);
    const trigger = normalizeTriggerPhrase(journey.trigger);
    const firstPainPoint = journey.painPoints?.[0];
    const firstDesiredSupport = journey.desiredSupport?.[0];

    if (!goal || !trigger) {
      return [];
    }

    const fallbackDescriptionParts = [
      `${actor} behöver bättre stöd att ${lowerFirst(goal)} när ${lowerFirst(trigger)}.`,
      firstDesiredSupport
        ? `Storyn bör särskilt hjälpa med ${lowerFirst(stripTrailingPeriod(firstDesiredSupport))}.`
        : null,
      !firstDesiredSupport && firstPainPoint
        ? `Den bör minska friktion där ${lowerFirst(stripTrailingPeriod(firstPainPoint))}.`
        : null
    ].filter(Boolean);

    return [
      {
        title: `Stöd för ${title}`,
        description: fallbackDescriptionParts.join(" "),
        source: "heuristic" as const
      }
    ];
  }

  function createFirstDraftSuggestion() {
    if (!canBuildJourneySummary) return null;
    const actor = journey.primaryActor.trim();
    const goal = normalizeGoalPhrase(journey.goal.trim());
    const trigger = normalizeTriggerPhrase(journey.trigger.trim());
    const title = normalizeJourneyTitle(journey.title) || "journeyn";
    const suggestedStoryIdeas = buildMissingStoryIdeaSuggestions();
    const currentState = hasText(journey.currentState) ? ensurePeriod(toSentenceCase(journey.currentState ?? "")) : buildCurrentStateSuggestion();
    const desiredFutureState = hasText(journey.desiredFutureState)
      ? ensurePeriod(toSentenceCase(journey.desiredFutureState ?? ""))
      : buildDesiredFutureStateSuggestion();
    const painPoints =
      (journey.painPoints?.length ?? 0) > 0
        ? journey.painPoints ?? []
        : [
            `Flödet kan starta inkonsekvent när ${lowerFirst(trigger)}.`,
            "Status, ansvar eller nästa steg kan bli oklart under journeyn.",
            `Manuell samordning gör det svårare att ${lowerFirst(goal)} på ett förutsägbart sätt.`
          ];
    const desiredSupport =
      (journey.desiredSupport?.length ?? 0) > 0
        ? journey.desiredSupport ?? []
        : uniqueLabels([
            "Tydlig ingång i flödet med synlig trigger och ansvar.",
            "Stödd framdrift med bättre överblick över status, överlämningar och beslut.",
            `Konsekvent stöd i avslutet så att det blir enklare att ${lowerFirst(goal)} och verifiera resultatet.`
          ].concat(
            relevantStoryIdeaInsights.slice(0, 2).map(
              (item) => `Stöd som också ligger nära befintliga Story Ideas: ${lowerFirst(ensurePeriod(item))}`
            )
          ));
    const steps =
      journey.steps.length > 0
        ? journey.steps
        : [
            { id: `step-${journey.id}-1`, title: `Starta ${title}`, actor, description: `${actor} uppfattar triggern och förstår varför journeyn behöver starta.`, currentPain: "Ingången i flödet kan vara fragmenterad eller oklar.", desiredSupport: "Triggern och nästa steg bör vara tydliga direkt.", decisionPoint: false },
            { id: `step-${journey.id}-2`, title: `Driv ${title} framåt`, actor, description: `${actor} arbetar sig genom huvudflödet mot att ${lowerFirst(goal)} samtidigt som nödvändiga överlämningar eller kontroller hanteras.`, currentPain: "Viktiga framsteg kan bero på manuell samordning eller dold status.", desiredSupport: "Flödet bör tydligt stötta framdrift, beslut och överlämningar.", decisionPoint: true },
            { id: `step-${journey.id}-3`, title: `Avsluta ${title}`, actor, description: `${actor} bekräftar utfallet, avslutar journeyn och gör resultatet synligt för rätt personer.`, currentPain: "Avslut och uppföljning kan vara inkonsekventa eller svåra att verifiera.", desiredSupport: "Avslut bör vara tydligt, synligt och enkelt att lämna över eller följa upp.", decisionPoint: false }
          ];

    return {
      summary:
        relevantEpicLabels.length > 0 || relevantStoryIdeaLabels.length > 0
          ? `${actor} behöver kunna ${lowerFirst(goal)} när ${lowerFirst(trigger)}. Den här journeyn tydliggör både nulägets friktion och vilket stöd som behövs framåt. Den hämtar också riktning från ${relevantEpicLabels.length > 0 ? `Epics som ${relevantEpicLabels.slice(0, 2).join(" och ")}` : `Story Ideas som ${relevantStoryIdeaLabels.slice(0, 2).join(" och ")}`}${relevantStoryIdeaInsights[0] ? `, särskilt där stödet bör spegla ${lowerFirst(relevantStoryIdeaInsights[0])}` : ""}.`
          : `${actor} behöver kunna ${lowerFirst(goal)} när ${lowerFirst(trigger)}. Den här journeyn tydliggör nulägets friktion, vilket framtida stöd som behövs och vilka breda steg som bär värdet i business caset.`,
      currentState,
      desiredFutureState,
      painPoints,
      desiredSupport,
      steps,
      relatedEpicLabels: relevantEpicLabels,
      relatedEpicInsights: relevantEpicInsights,
      relatedStoryIdeaLabels: relevantStoryIdeaLabels,
      relatedStoryIdeaInsights: relevantStoryIdeaInsights,
      suggestedStoryIdeas
    } satisfies JourneyFirstDraftSuggestion;
  }

  const journeyBrief = canBuildJourneySummary ? createFirstDraftSuggestion() : null;
  const missingStoryIdeaSuggestions = buildMissingStoryIdeaSuggestions();
  const missingDraftFieldLabels = [
    !hasText(journey.currentState) ? "Nuläge" : null,
    !hasText(journey.desiredFutureState) ? "Önskat läge" : null,
    !((journey.painPoints?.length ?? 0) > 0) ? "Problem" : null,
    !((journey.desiredSupport?.length ?? 0) > 0) ? "Önskat stöd" : null,
    journey.steps.length === 0 ? "Steg" : null
  ].filter((value): value is string => Boolean(value));
  const hasAiAnalysis =
    relevantEpicLabels.length > 0 ||
    relevantStoryIdeaLabels.length > 0 ||
    Boolean(journey.coverage) ||
    missingStoryIdeaSuggestions.length > 0 ||
    hasEmptyDraftSections;
  const displayedNarrative = buildNarrativeSuggestion();
  const displayedValueMoment = buildValueMomentSuggestion();
  const displayedSuccessSignals = buildSuccessSignalsSuggestion();
  const isEditingCore = editingSection === "core" || !journeyBrief;
  const isEditingNarrative = editingSection === "narrative";
  const isEditingValueMoment = editingSection === "valueMoment";
  const isEditingSuccess = editingSection === "success";
  return (
    <details
      className={`group rounded-[28px] border bg-background shadow-none ${isFocused ? "border-sky-300 ring-2 ring-sky-100" : "border-border/70"}`}
      onToggle={(event) => setIsOpen((event.currentTarget as HTMLDetailsElement).open)}
      open={isOpen}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4" onClick={() => onFocus?.()}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {isFocused ? <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">Aktiv nu</span> : null}
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${coreMissingCount > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : (journey.coverage?.status ?? "unanalysed") === "unanalysed" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{journeyStageLabel}</span>
            {journey.type ? <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">{journey.type === "business" ? "verksamhet" : journey.type === "user" ? "användare" : journey.type === "operational" ? "operativ" : journey.type === "support" ? "support" : "transformation"}</span> : null}
            {coreMissingCount === 0 ? <CoverageBadge status={journey.coverage?.status ?? "unanalysed"} /> : null}
            {journey.steps.length > 0 ? <StepSummary count={journey.steps.length} /> : null}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{normalizeJourneyTitle(journey.title) || "Namnlös journey"}</p>
            <p className="text-sm text-muted-foreground">{journey.primaryActor ? `Huvudaktör: ${journey.primaryActor}` : "Huvudaktör är inte ifylld ännu"}</p>
            {journey.goal ? <p className="text-sm text-muted-foreground">Mål: {journey.goal}</p> : null}
            {displayedNarrative ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{truncateText(displayedNarrative, 220)}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">{isOpen ? "Dölj" : "Visa"}</span>
          {onFocus ? <Button onClick={(event) => { event.preventDefault(); event.stopPropagation(); setIsOpen(true); onFocus(); }} size="sm" type="button" variant={isFocused ? "default" : "secondary"}>{isFocused ? "Aktiv nu" : "Gör aktiv"}</Button> : null}
          <Button onClick={(event) => { event.preventDefault(); event.stopPropagation(); onRemove(); }} size="sm" type="button" variant="secondary">Ta bort journey</Button>
        </div>
      </summary>

      <div className="border-t border-border/70 px-5 py-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">{coreMissingCount > 0 ? "Börja brett. Fyll i titel, aktör, mål och trigger innan du lägger till mer detalj." : "Den här journeyn har grunderna på plats. Lägg bara till mer detalj om det förtydligar caset eller förbättrar analysen."}</div>
        <div className="mt-6 space-y-4">
          <InlineSectionCard
            actionLabel="Redigera kärnan"
            description="Här ser du det viktigaste först: titel, aktör, mål och trigger."
            editor={
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Titel</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, title: event.target.value })} type="text" value={journey.title} />
                  <FieldHint>Använd ett kort verbdrivet namn för journeyn.</FieldHint>
                  <FieldError>{validation?.title}</FieldError>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Huvudaktör</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, primaryActor: event.target.value })} type="text" value={journey.primaryActor} />
                  <FieldError>{validation?.primaryActor}</FieldError>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-foreground">Mål</span>
                  <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, goal: event.target.value })} value={journey.goal} />
                  <FieldHint>Beskriv vad aktören försöker uppnå, inte vilken skärm personen vill till.</FieldHint>
                  <FieldError>{validation?.goal}</FieldError>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-foreground">Trigger</span>
                  <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, trigger: event.target.value })} value={journey.trigger} />
                  <FieldHint>Beskriv vad som startar journeyn.</FieldHint>
                  <FieldError>{validation?.trigger}</FieldError>
                </label>
              </div>
            }
            helper={
              <>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => { setCoreSuggestion(buildCoreSuggestion()); setEditingSection("core"); }} size="sm" type="button" variant="secondary">
                    Förtydliga kärntext
                  </Button>
                </div>
                {coreSuggestion ? (
                  <div className="mt-3">
                    <InlineAiCoreSuggestion
                      onApply={() => {
                        onChange({
                          ...journey,
                          title: coreSuggestion.title || journey.title,
                          goal: coreSuggestion.goal || journey.goal,
                          trigger: coreSuggestion.trigger || journey.trigger
                        });
                        setEditingSection("core");
                        setCoreSuggestion(null);
                      }}
                      onDismiss={() => setCoreSuggestion(null)}
                      suggestion={coreSuggestion}
                    />
                  </div>
                ) : null}
              </>
            }
            isEditing={isEditingCore}
            onToggleEdit={() => setEditingSection((current) => (current === "core" ? null : "core"))}
            title="Kärnan i journeyn"
          >
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <p><span className="font-medium text-foreground">Titel:</span> {normalizeJourneyTitle(journey.title) || "Inte ifyllt ännu"}</p>
              <p><span className="font-medium text-foreground">Huvudaktör:</span> {journey.primaryActor || "Inte ifyllt ännu"}</p>
              <p className="md:col-span-2"><span className="font-medium text-foreground">Mål:</span> {journey.goal || "Inte ifyllt ännu"}</p>
              <p className="md:col-span-2"><span className="font-medium text-foreground">Trigger:</span> {journey.trigger || "Inte ifyllt ännu"}</p>
            </div>
          </InlineSectionCard>

          <div className="grid gap-4">
            <InlineSectionCard
              actionLabel="Redigera journeytext"
              description="Beskriv journeyen som ett kort sammanhängande narrativ i samma stil som ett business case-flöde."
              editor={
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Journey-beskrivning</span>
                  <textarea className="min-h-40 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, narrative: event.target.value })} value={journey.narrative ?? ""} />
                  <FieldHint>Beskriv användarens situation, dagens arbetssätt, det framtida stödet och hur flödet förändras.</FieldHint>
                </label>
              }
              helper={
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { setNarrativeSuggestion(buildNarrativeSuggestion()); setEditingSection("narrative"); }} size="sm" type="button" variant="secondary">
                      Förbättra journeytext
                    </Button>
                  </div>
                  {narrativeSuggestion ? (
                    <div className="w-full">
                      <InlineAiSuggestion
                        onApply={() => {
                          onChange({ ...journey, narrative: narrativeSuggestion });
                          setEditingSection("narrative");
                          setNarrativeSuggestion("");
                        }}
                        onDismiss={() => setNarrativeSuggestion("")}
                        targetLabel="Journey-beskrivning"
                        text={narrativeSuggestion}
                        title="AI-förslag för journeytext"
                      />
                    </div>
                  ) : null}
                </div>
              }
              isEditing={isEditingNarrative}
              onToggleEdit={() => setEditingSection((current) => (current === "narrative" ? null : "narrative"))}
              title="Journey-beskrivning"
            >
              <p className="text-sm leading-6 text-muted-foreground">{displayedNarrative || "Inte ifyllt ännu"}</p>
            </InlineSectionCard>

            <div className="grid gap-4 md:grid-cols-2">
              <InlineSectionCard
                actionLabel="Redigera värdeögonblick"
                description="Beskriv när det verkliga värdet uppstår för användaren."
                editor={
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Värdeögonblick</span>
                    <textarea className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, valueMoment: event.target.value })} value={journey.valueMoment ?? ""} />
                    <FieldHint>Beskriv när användaren inte längre behöver hålla ihop arbetet manuellt eller blir verkligt hjälpt av systemet.</FieldHint>
                  </label>
                }
                helper={
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { setValueMomentSuggestion(buildValueMomentSuggestion()); setEditingSection("valueMoment"); }} size="sm" type="button" variant="secondary">
                      Föreslå värdeögonblick
                    </Button>
                    {valueMomentSuggestion ? (
                      <div className="mt-3 w-full">
                        <InlineAiSuggestion
                          onApply={() => {
                            onChange({ ...journey, valueMoment: valueMomentSuggestion });
                            setEditingSection("valueMoment");
                            setValueMomentSuggestion("");
                          }}
                          onDismiss={() => setValueMomentSuggestion("")}
                          targetLabel="Värdeögonblick"
                          text={valueMomentSuggestion}
                          title="AI-förslag för värdeögonblick"
                        />
                      </div>
                    ) : null}
                  </div>
                }
                isEditing={isEditingValueMoment}
                onToggleEdit={() => setEditingSection((current) => (current === "valueMoment" ? null : "valueMoment"))}
                title="Värdeögonblick"
              >
                <p className="text-sm leading-6 text-muted-foreground">{displayedValueMoment || "Inte ifyllt ännu"}</p>
              </InlineSectionCard>

              <InlineSectionCard
                actionLabel="Redigera lyckat utfall"
                description="Beskriv vad som är sant när journeyen fungerar väl."
                editor={
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">När journeyen lyckas...</span>
                    <textarea className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, successSignals: parseLines(event.target.value) })} value={joinLines(journey.successSignals)} />
                    <FieldHint>Skriv några korta punkter om vad användaren nu kan göra eller känna trygghet i.</FieldHint>
                  </label>
                }
                helper={
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { setSuccessSignalsSuggestion(buildSuccessSignalsSuggestion()); setEditingSection("success"); }} size="sm" type="button" variant="secondary">
                      Föreslå lyckat utfall
                    </Button>
                    {successSignalsSuggestion.length > 0 ? (
                      <div className="mt-3 w-full">
                        <InlineAiSuggestion
                          onApply={() => {
                            onChange({ ...journey, successSignals: successSignalsSuggestion });
                            setEditingSection("success");
                            setSuccessSignalsSuggestion([]);
                          }}
                          onDismiss={() => setSuccessSignalsSuggestion([])}
                          targetLabel="När journeyen lyckas"
                          text={successSignalsSuggestion.map((item) => `- ${item}`).join("\n")}
                          title="AI-förslag för lyckat utfall"
                        />
                      </div>
                    ) : null}
                  </div>
                }
                isEditing={isEditingSuccess}
                onToggleEdit={() => setEditingSection((current) => (current === "success" ? null : "success"))}
                title="När journeyen lyckas"
              >
                {displayedSuccessSignals.length > 0 ? (
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {displayedSuccessSignals.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">Inte ifyllt ännu</p>
                )}
              </InlineSectionCard>
            </div>
          </div>
        </div>
        {hasAiAnalysis ? (
          <details className="mt-6 rounded-[24px] border border-border/70 bg-muted/10">
            <summary className="cursor-pointer list-none px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">AI-analys och backlog-kopplingar</p>
                  <p className="text-sm text-muted-foreground">Öppna bara när du vill se sannolika kopplingar, luckor eller låta AI fylla tomma analysfält.</p>
                </div>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {journey.coverage ? "Analyserad" : "Sekundärt"}
                </span>
              </div>
            </summary>

            <div className="space-y-4 border-t border-border/70 px-4 py-4">
              {journeyBrief && hasEmptyDraftSections ? (
                <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
                  <p className="font-medium text-foreground">Fyll tomma analysfält med AI</p>
                  <p className="mt-1 leading-6 text-muted-foreground">
                    AI kan fylla sådant som fortfarande saknas i de sekundära fälten: {missingDraftFieldLabels.join(", ")}.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        onChange({
                          ...journey,
                          currentState: hasText(journey.currentState) ? journey.currentState : journeyBrief.currentState,
                          desiredFutureState: hasText(journey.desiredFutureState) ? journey.desiredFutureState : journeyBrief.desiredFutureState,
                          painPoints: journey.painPoints?.length ? journey.painPoints : journeyBrief.painPoints,
                          desiredSupport: journey.desiredSupport?.length ? journey.desiredSupport : journeyBrief.desiredSupport,
                          steps: journey.steps.length ? journey.steps : journeyBrief.steps
                        });
                      }}
                      size="sm"
                      type="button"
                    >
                      Lägg in förslag i tomma fält
                    </Button>
                  </div>
                </div>
              ) : null}

              {relevantStoryIdeaLabels.length > 0 || relevantEpicLabels.length > 0 ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <p className="font-medium text-foreground">Backlog som redan ligger nära journeyn</p>
                  {relevantStoryIdeaLabels.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">Story Ideas som redan ligger nära</p>
                      <CoverageSupportText labels={relevantStoryIdeaLabels} />
                    </div>
                  ) : null}
                  {relevantEpicLabels.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">Epics som redan ger riktning</p>
                      <CoverageSupportText labels={relevantEpicLabels} />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {missingStoryIdeaSuggestions.length > 0 ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <InlineStoryIdeaSuggestionList
                    description="Det här är nästa sannolika Story Ideas att överväga om journeyn behöver mer stöd än backloggen redan ger."
                    suggestions={missingStoryIdeaSuggestions}
                    title="Möjliga saknade Story Ideas"
                  />
                </div>
              ) : null}

              {journey.coverage ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">Täckningsanalys</p>
                    <CoverageBadge status={journey.coverage.status} />
                  </div>
                  <p className="mt-2 text-muted-foreground">Det här är AI-förslag om sannolika kopplingar och luckor, inte accepterade sanningar.</p>
                  {suggestedEpicLabels.length > 0 ? <div className="mt-4"><p className="font-medium text-foreground">Troliga Epic-kopplingar</p><CoverageSupportText labels={suggestedEpicLabels} /></div> : null}
                  {suggestedStoryIdeaLabels.length > 0 ? <div className="mt-4"><p className="font-medium text-foreground">Troliga Story Idea-kopplingar</p><CoverageSupportText labels={suggestedStoryIdeaLabels} /></div> : null}
                  {journey.coverage.suggestedNewStoryIdeas?.length ? (
                    <div className="mt-4 space-y-3">
                      <p className="font-medium text-foreground">Föreslagna luckor att stänga</p>
                      {journey.coverage.suggestedNewStoryIdeas.map((idea) => (
                        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3" key={`${idea.title}-${idea.description}`}>
                          <p className="font-medium text-foreground">{idea.title}</p>
                          <p className="mt-1 text-muted-foreground">{idea.description}</p>
                          {idea.expectedOutcome ? <p className="mt-2"><span className="font-medium text-foreground">Förväntat utfall:</span> {idea.expectedOutcome}</p> : null}
                          {idea.confidence !== undefined ? <p><span className="font-medium text-foreground">Säkerhet:</span> {Math.round(idea.confidence * 100)}%</p> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {cleanedCoverageNote ? <p className="mt-4 text-muted-foreground">{cleanedCoverageNote}</p> : null}
                </div>
              ) : null}
            </div>
          </details>
        ) : null}
        <details className="mt-6 rounded-[24px] border border-border/70 bg-muted/10">
          <summary className="cursor-pointer list-none px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Mer detalj vid behov</p>
                <p className="text-sm text-muted-foreground">Lägg till stödaktörer, problem, manuella länkar, steg eller analysdetaljer bara när det tillför signal.</p>
              </div>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">{optionalDetailCount > 0 ? `${optionalDetailCount} områden används` : "Frivilligt"}</span>
            </div>
          </summary>

          <div className="border-t border-border/70 px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Typ</span>
                <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, type: event.target.value ? (event.target.value as Journey["type"]) : undefined })} value={journey.type ?? ""}>
                  <option value="">Frivilligt</option>
                  <option value="business">Verksamhet</option>
                  <option value="user">Användare</option>
                  <option value="operational">Operativ</option>
                  <option value="support">Support</option>
                  <option value="transformation">Transformation</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Stödaktörer</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, supportingActors: parseLines(event.target.value) })} value={joinLines(journey.supportingActors)} />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Nuläge</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, currentState: event.target.value })} value={journey.currentState ?? ""} />
                <FieldHint>Frivilligt. Beskriv nuläget mer analytiskt om det hjälper analysen.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Önskat läge</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, desiredFutureState: event.target.value })} value={journey.desiredFutureState ?? ""} />
                <FieldHint>Frivilligt. Beskriv det önskade läget mer explicit om det hjälper analysen.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Problem</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, painPoints: parseLines(event.target.value) })} value={joinLines(journey.painPoints)} />
                <FieldHint>Frivilligt. Lista bara de viktigaste friktionerna om du behöver dem separat från journeytexten.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Önskat stöd</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, desiredSupport: parseLines(event.target.value) })} value={joinLines(journey.desiredSupport)} />
                <FieldHint>Frivilligt. Beskriv stöd som förmågor eller hjälp, inte detaljerad UI-design.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Undantag</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, exceptions: parseLines(event.target.value) })} value={joinLines(journey.exceptions)} />
                <FieldHint>Frivilligt. Använd när journeyn har viktiga variationer eller fellägen.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Noteringar</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, notes: event.target.value })} value={journey.notes ?? ""} />
                <FieldHint>Frivilligt. Lägg till kontext som kan hjälpa senare förfining.</FieldHint>
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">Frivilliga steg</p>
                  <p className="text-sm text-muted-foreground">Lägg bara till större överlämningar, beslut eller brott i flödet. De flesta journeys behöver inte många steg.</p>
                  <FieldError>{validation?.stepsSummary}</FieldError>
                </div>
                <Button onClick={onAddStep} type="button" variant="secondary">Lägg till steg</Button>
              </div>

              {journey.steps.length === 0 ? <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">Inga steg tillagda. Låt det vara så om extra flödesdetalj inte faktiskt hjälper.</div> : null}
              {journey.steps.map((step, index) => <JourneyStepEditor isFirst={index === 0} isLast={index === journey.steps.length - 1} key={step.id} onChange={(nextStep) => onUpdateStep(step.id, () => nextStep)} onMoveDown={() => onMoveStep(step.id, "down")} onMoveUp={() => onMoveStep(step.id, "up")} onRemove={() => onRemoveStep(step.id)} step={step} validation={validation?.steps[step.id]} />)}
            </div>

            <div className="mt-6 space-y-4 rounded-[24px] border border-border/70 bg-muted/15 p-4">
              <div>
                <p className="text-base font-semibold text-foreground">Frivilliga manuella länkar</p>
                <p className="mt-1 text-sm text-muted-foreground">Frivilligt. Lägg till länkar om de är uppenbara, men du behöver inte mappa allt manuellt. AI-analysen kan föreslå sannolika Epic- och Story Idea-kopplingar senare.</p>
              </div>
              <MultiSelectLinks helper="Frivilliga Epic-länkar när kopplingen är uppenbar." onChange={(nextIds) => onChange({ ...journey, linkedEpicIds: nextIds })} options={availableEpics} selectedIds={journey.linkedEpicIds} title="Länkade Epics" />
              <MultiSelectLinks helper="Frivilliga Story Idea-länkar när kopplingen är uppenbar." onChange={(nextIds) => onChange({ ...journey, linkedStoryIdeaIds: nextIds })} options={availableStoryIdeas} selectedIds={journey.linkedStoryIdeaIds} title="Länkade Story Ideas" />
              <MultiSelectLinks helper="Frivilliga Figma- eller referenslänkar när de redan finns i detta Framing-paket." onChange={(nextIds) => onChange({ ...journey, linkedFigmaRefs: nextIds })} options={availableFigmaRefs} selectedIds={journey.linkedFigmaRefs} title="Länkad Figma / referenser" />
              {validation?.linkErrors.length ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{validation.linkErrors.map((message) => <p key={message}>{message}</p>)}</div> : null}
            </div>
          </div>
        </details>
      </div>
    </details>
  );
}
