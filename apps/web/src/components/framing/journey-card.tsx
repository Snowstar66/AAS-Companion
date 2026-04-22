"use client";

import { type ReactNode, useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { JourneyStepEditor } from "@/components/framing/journey-step-editor";
import { hasMeaningfulListChange, hasMeaningfulTextChange } from "@/lib/ai/meaningful-change";
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

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

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
  const { language } = useAppChromeLanguage();

  return (
    <div className="rounded-[24px] border border-border/70 bg-muted/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{props.title}</p>
          {props.description ? <p className="mt-1 text-sm text-muted-foreground">{props.description}</p> : null}
        </div>
        <Button onClick={props.onToggleEdit} size="sm" type="button" variant={props.isEditing ? "secondary" : "default"}>
          {props.isEditing ? t(language, "Done", "Klar") : props.actionLabel}
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
  const { language } = useAppChromeLanguage();

  if (!props.text.trim()) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 text-sky-900" />
        <div className="space-y-2">
          <p className="font-medium text-foreground">{props.title}</p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t(language, "If you use the suggestion it will be written directly into the field ", "Om du använder förslaget skrivs det direkt in i fältet ")}
            <span className="font-medium text-foreground">{props.targetLabel}</span>
            {t(language, " in the editor below.", " i redigeringen nedanför.")}
          </p>
          <p className="leading-6 text-foreground">{props.text}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={props.onApply} size="sm" type="button">
          {t(language, "Use in ", "Använd i ")}
          {props.targetLabel.toLowerCase()}
        </Button>
        <Button onClick={props.onDismiss} size="sm" type="button" variant="secondary">
          {t(language, "Hide", "Dölj")}
        </Button>
      </div>
    </div>
  );
}

function InlineAiNoImprovementNotice(props: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
      {props.message}
    </div>
  );
}

function InlineAiCoreSuggestion(props: { suggestion: JourneyCoreSuggestion; onApply: () => void; onDismiss: () => void }) {
  const { language } = useAppChromeLanguage();

  if (![props.suggestion.title, props.suggestion.goal, props.suggestion.trigger].some(Boolean)) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 text-sky-900" />
        <div className="space-y-3">
          <p className="font-medium text-foreground">{t(language, "AI suggestion for title, goal, and trigger", "AI-förslag för titel, mål och trigger")}</p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t(language, "If you use the suggestion, the fields ", "Om du använder förslaget uppdateras fälten ")}
            <span className="font-medium text-foreground">{t(language, "Title", "Titel")}</span>, <span className="font-medium text-foreground">{t(language, "Goal", "Mål")}</span> {t(language, "and", "och")}{" "}
            <span className="font-medium text-foreground">{t(language, "Trigger", "Trigger")}</span>
            {t(language, " will be updated directly in the editor below.", " direkt i redigeringen nedanför.")}
          </p>
          {props.suggestion.title ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">{t(language, "Title", "Titel")}</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.title}</p></div> : null}
          {props.suggestion.goal ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">{t(language, "Goal", "Mål")}</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.goal}</p></div> : null}
          {props.suggestion.trigger ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">{t(language, "Trigger", "Trigger")}</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.trigger}</p></div> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={props.onApply} size="sm" type="button">{t(language, "Use in editor", "Använd i redigeringen")}</Button>
        <Button onClick={props.onDismiss} size="sm" type="button" variant="secondary">{t(language, "Hide", "Dölj")}</Button>
      </div>
    </div>
  );
}
function getCoreMissingCount(journey: Journey) {
  return [hasText(journey.title), hasText(journey.primaryActor), hasText(journey.goal), hasText(journey.trigger)].filter((entry) => !entry).length;
}

function CoverageBadge({ status }: { status: string }) {
  const { language } = useAppChromeLanguage();
  const tone = status === "covered"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : status === "partially_covered"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : status === "uncovered"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
      {status === "covered"
        ? t(language, "covered", "täckt")
        : status === "partially_covered"
          ? t(language, "partially covered", "delvis täckt")
          : status === "uncovered"
            ? t(language, "uncovered", "otäckt")
            : t(language, "not analysed", "ej analyserad")}
    </span>
  );
}

function StepSummary({ count }: { count: number }) {
  const { language } = useAppChromeLanguage();
  return (
    <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
      {language === "sv" ? `${count} steg` : `${count} step${count === 1 ? "" : "s"}`}
    </span>
  );
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
  const { language } = useAppChromeLanguage();
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
  const [coreSuggestionInfo, setCoreSuggestionInfo] = useState<string | null>(null);
  const [narrativeSuggestionInfo, setNarrativeSuggestionInfo] = useState<string | null>(null);
  const [valueMomentSuggestionInfo, setValueMomentSuggestionInfo] = useState<string | null>(null);
  const [successSignalsSuggestionInfo, setSuccessSignalsSuggestionInfo] = useState<string | null>(null);
  const journeyStageLabel =
    coreMissingCount > 0
      ? t(language, `${coreMissingCount} core fields left`, `${coreMissingCount} kärnfält kvar`)
      : (journey.coverage?.status ?? "unanalysed") === "unanalysed"
        ? t(language, "Ready for analysis", "Redo för analys")
        : t(language, "Analysed", "Analyserad");
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
    setCoreSuggestionInfo(null);
    setNarrativeSuggestionInfo(null);
    setValueMomentSuggestionInfo(null);
    setSuccessSignalsSuggestionInfo(null);
    setEditingSection(coreMissingCount > 0 ? "core" : null);
  }, [journey.id]);

  function buildNoImprovementMessage(targetLabel: string) {
    return t(
      language,
      `AI could not find a meaningfully better suggestion for ${targetLabel} from the current Framing context. Refine the surrounding Outcome, Baseline, Story Ideas, or Journey details first if you want a stronger suggestion.`,
      `AI hittade ingen meningsfullt bättre förbättring för ${targetLabel} utifrån nuvarande Framing-kontext. Förfina gärna Outcome, Baseline, Story Ideas eller Journey-detaljerna först om du vill få ett starkare förslag.`
    );
  }

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
    return ensurePeriod(
      actor
        ? language === "sv"
          ? `${actor} vill ${lowerFirst(normalized)}`
          : `${actor} wants to ${lowerFirst(normalized)}`
        : language === "sv"
          ? `Aktören vill ${lowerFirst(normalized)}`
          : `The actor wants to ${lowerFirst(normalized)}`
    );
  }

  function buildTriggerSuggestion() {
    const normalized = normalizeTriggerPhrase(journey.trigger || "");
    if (!normalized) return "";
    return ensurePeriod(
      language === "sv"
        ? `Journeyn börjar när ${lowerFirst(normalized)}`
        : `The journey begins when ${lowerFirst(normalized)}`
    );
  }

  function buildCoreSuggestion() {
    return { title: normalizeJourneyTitle(journey.title), goal: buildGoalSuggestion(), trigger: buildTriggerSuggestion() };
  }

  function buildCurrentStateSuggestion() {
    const normalized = ensurePeriod(toSentenceCase(journey.currentState || ""));
    if (normalized) {
      if (language === "sv") {
        return /^(i dag|idag|nu)/i.test(normalized) ? normalized : `I dag ${lowerFirst(normalized)}`;
      }
      return /^(today|currently|now)/i.test(normalized) ? normalized : `Today ${lowerFirst(normalized)}`;
    }
    if (!hasText(journey.primaryActor) || !hasText(journey.trigger)) return "";
    const inspiration = relevantStoryIdeaInsights[0] ?? relevantEpicInsights[0] ?? "";
    if (language === "sv") {
      return inspiration
        ? ensurePeriod(`I dag börjar ${journey.primaryActor.toLowerCase()} ofta när ${lowerFirst(journey.trigger)}, men flödet blir lätt fragmenterat. Det märks särskilt där stödet ännu inte riktigt lever upp till riktningar som ${lowerFirst(inspiration)}`)
        : `I dag börjar ${journey.primaryActor.toLowerCase()} ofta när ${lowerFirst(journey.trigger)}, men flödet blir lätt fragmenterat av manuell samordning, begränsad överblick eller oklara överlämningar.`;
    }
    return inspiration
      ? ensurePeriod(`Today ${journey.primaryActor.toLowerCase()} often begins when ${lowerFirst(journey.trigger)}, but the flow easily becomes fragmented. This is especially visible where the support still does not fully live up to directions such as ${lowerFirst(inspiration)}`)
      : `Today ${journey.primaryActor.toLowerCase()} often begins when ${lowerFirst(journey.trigger)}, but the flow easily becomes fragmented by manual coordination, limited visibility, or unclear handoffs.`;
  }

  function buildDesiredFutureStateSuggestion() {
    const normalized = ensurePeriod(toSentenceCase(journey.desiredFutureState || ""));
    if (normalized) {
      if (language === "sv") {
        return /^(i önskat läge|i framtiden|framåt)/i.test(normalized) ? normalized : `I önskat läge ${lowerFirst(normalized)}`;
      }
      return /^(in the desired state|in the future|going forward)/i.test(normalized) ? normalized : `In the desired state ${lowerFirst(normalized)}`;
    }
    if (!hasText(journey.primaryActor) || !hasText(journey.goal)) return "";
    const inspiration = relevantStoryIdeaInsights[0] ?? relevantEpicInsights[0] ?? "";
    if (language === "sv") {
      return inspiration
        ? ensurePeriod(`I önskat läge kan ${journey.primaryActor.toLowerCase()} ${lowerFirst(normalizeGoalPhrase(journey.goal))}, med tydligare status och stöd som bättre speglar riktningar som ${lowerFirst(inspiration)}`)
        : `I önskat läge kan ${journey.primaryActor.toLowerCase()} ${lowerFirst(journey.goal)}, med tydligare status, färre manuella avbrott och smidigare beslut.`;
    }
    return inspiration
      ? ensurePeriod(`In the desired state ${journey.primaryActor.toLowerCase()} can ${lowerFirst(normalizeGoalPhrase(journey.goal))}, with clearer status and support that better reflects directions such as ${lowerFirst(inspiration)}`)
      : `In the desired state ${journey.primaryActor.toLowerCase()} can ${lowerFirst(journey.goal)}, with clearer status, fewer manual interruptions, and smoother decisions.`;
  }

  function buildNarrativeSuggestion() {
    if (hasText(journey.narrative)) {
      return ensurePeriod(journey.narrative ?? "");
    }

    const actor = journey.primaryActor.trim() || t(language, "The user", "Användaren");
    const goal = normalizeGoalPhrase(journey.goal);
    const trigger = normalizeTriggerPhrase(journey.trigger);
    const currentState = buildCurrentStateSuggestion();
    const desiredFuture = buildDesiredFutureStateSuggestion();
    const storySupport = relevantStoryIdeaInsights[0]
      ? language === "sv"
        ? `Stödet bör särskilt hjälpa där ${lowerFirst(relevantStoryIdeaInsights[0])}`
        : `The support should help especially where ${lowerFirst(relevantStoryIdeaInsights[0])}`
      : "";

    if (!goal || !trigger) {
      return "";
    }

    return [
      language === "sv"
        ? `${actor} arbetar i ett flöde där behovet uppstår när ${lowerFirst(trigger)}.`
        : `${actor} works in a flow where the need arises when ${lowerFirst(trigger)}.`,
      currentState,
      language === "sv"
        ? `${actor} ska kunna ${lowerFirst(goal)} med tydligare stöd i det framtida flödet.`
        : `${actor} should be able to ${lowerFirst(goal)} with clearer support in the future flow.`,
      desiredFuture,
      storySupport
    ]
      .filter(Boolean)
      .join(" ");
  }

  function buildValueMomentSuggestion() {
    if (hasText(journey.valueMoment)) {
      return ensurePeriod(journey.valueMoment ?? "");
    }

    const actor = journey.primaryActor.trim() || t(language, "the user", "användaren");
    const goal = normalizeGoalPhrase(journey.goal);

    if (!goal) {
      return "";
    }

    return ensurePeriod(
      language === "sv"
        ? `Det avgörande värdeögonblicket är när ${actor.toLowerCase()} inte längre behöver hålla ihop arbetet manuellt, utan kan ${lowerFirst(goal)} direkt med stöd av systemet`
        : `The decisive value moment is when ${actor.toLowerCase()} no longer needs to hold the work together manually, but can ${lowerFirst(goal)} directly with support from the system`
    );
  }

  function buildSuccessSignalsSuggestion() {
    if ((journey.successSignals?.length ?? 0) > 0) {
      return journey.successSignals ?? [];
    }

    const actor = journey.primaryActor.trim() || t(language, "the user", "användaren");
    const baseSignals = [
      t(language, "understood what needs to be done without losing the overview", "förstått vad som behöver göras utan att tappa överblicken"),
      t(language, "been able to continue directly in the system", "kunnat arbeta vidare direkt i systemet"),
      t(language, "felt confident that important steps or actions are not lost", "känt trygghet i att viktiga steg eller åtgärder inte tappas bort")
    ];

    if (hasText(journey.goal)) {
      baseSignals.unshift(
        language === "sv"
          ? `${actor.toLowerCase()} kunnat ${lowerFirst(normalizeGoalPhrase(journey.goal))}`
          : `${actor.toLowerCase()} been able to ${lowerFirst(normalizeGoalPhrase(journey.goal))}`
      );
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

    const title = normalizeJourneyTitle(journey.title) || t(language, "the journey", "journeyn");
    const actor = journey.primaryActor.trim() || t(language, "the user", "användaren");
    const goal = normalizeGoalPhrase(journey.goal);
    const trigger = normalizeTriggerPhrase(journey.trigger);
    const firstPainPoint = journey.painPoints?.[0];
    const firstDesiredSupport = journey.desiredSupport?.[0];

    if (!goal || !trigger) {
      return [];
    }

    const fallbackDescriptionParts = [
      language === "sv"
        ? `${actor} behöver bättre stöd att ${lowerFirst(goal)} när ${lowerFirst(trigger)}.`
        : `${actor} needs better support to ${lowerFirst(goal)} when ${lowerFirst(trigger)}.`,
      firstDesiredSupport
        ? language === "sv"
          ? `Storyn bör särskilt hjälpa med ${lowerFirst(stripTrailingPeriod(firstDesiredSupport))}.`
          : `The story should especially help with ${lowerFirst(stripTrailingPeriod(firstDesiredSupport))}.`
        : null,
      !firstDesiredSupport && firstPainPoint
        ? language === "sv"
          ? `Den bör minska friktion där ${lowerFirst(stripTrailingPeriod(firstPainPoint))}.`
          : `It should reduce friction where ${lowerFirst(stripTrailingPeriod(firstPainPoint))}.`
        : null
    ].filter(Boolean);

    return [
      {
        title: language === "sv" ? `Stöd för ${title}` : `Support for ${title}`,
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
    const title = normalizeJourneyTitle(journey.title) || t(language, "the journey", "journeyn");
    const suggestedStoryIdeas = buildMissingStoryIdeaSuggestions();
    const currentState = hasText(journey.currentState) ? ensurePeriod(toSentenceCase(journey.currentState ?? "")) : buildCurrentStateSuggestion();
    const desiredFutureState = hasText(journey.desiredFutureState)
      ? ensurePeriod(toSentenceCase(journey.desiredFutureState ?? ""))
      : buildDesiredFutureStateSuggestion();
    const painPoints =
      (journey.painPoints?.length ?? 0) > 0
        ? journey.painPoints ?? []
        : [
            language === "sv"
              ? `Flödet kan starta inkonsekvent när ${lowerFirst(trigger)}.`
              : `The flow can start inconsistently when ${lowerFirst(trigger)}.`,
            language === "sv"
              ? "Status, ansvar eller nästa steg kan bli oklart under journeyn."
              : "Status, ownership, or the next step can become unclear during the journey.",
            language === "sv"
              ? `Manuell samordning gör det svårare att ${lowerFirst(goal)} på ett förutsägbart sätt.`
              : `Manual coordination makes it harder to ${lowerFirst(goal)} in a predictable way.`
          ];
    const desiredSupport =
      (journey.desiredSupport?.length ?? 0) > 0
        ? journey.desiredSupport ?? []
        : uniqueLabels([
            t(language, "A clear entry into the flow with visible trigger and ownership.", "Tydlig ingång i flödet med synlig trigger och ansvar."),
            t(language, "Supported progress with better overview of status, handoffs, and decisions.", "Stödd framdrift med bättre överblick över status, överlämningar och beslut."),
            language === "sv"
              ? `Konsekvent stöd i avslutet så att det blir enklare att ${lowerFirst(goal)} och verifiera resultatet.`
              : `Consistent support in the ending so it becomes easier to ${lowerFirst(goal)} and verify the result.`
          ].concat(
            relevantStoryIdeaInsights.slice(0, 2).map(
              (item) =>
                language === "sv"
                  ? `Stöd som också ligger nära befintliga Story Ideas: ${lowerFirst(ensurePeriod(item))}`
                  : `Support also aligned with existing Story Ideas: ${lowerFirst(ensurePeriod(item))}`
            )
          ));
    const steps =
      journey.steps.length > 0
        ? journey.steps
        : [
            {
              id: `step-${journey.id}-1`,
              title: language === "sv" ? `Starta ${title}` : `Start ${title}`,
              actor,
              description: language === "sv" ? `${actor} uppfattar triggern och förstår varför journeyn behöver starta.` : `${actor} notices the trigger and understands why the journey needs to begin.`,
              currentPain: language === "sv" ? "Ingången i flödet kan vara fragmenterad eller oklar." : "The entry into the flow can be fragmented or unclear.",
              desiredSupport: language === "sv" ? "Triggern och nästa steg bör vara tydliga direkt." : "The trigger and next step should be clear immediately.",
              decisionPoint: false
            },
            {
              id: `step-${journey.id}-2`,
              title: language === "sv" ? `Driv ${title} framåt` : `Drive ${title} forward`,
              actor,
              description: language === "sv" ? `${actor} arbetar sig genom huvudflödet mot att ${lowerFirst(goal)} samtidigt som nödvändiga överlämningar eller kontroller hanteras.` : `${actor} works through the main flow toward ${lowerFirst(goal)} while necessary handoffs or checks are handled.`,
              currentPain: language === "sv" ? "Viktiga framsteg kan bero på manuell samordning eller dold status." : "Important progress can depend on manual coordination or hidden status.",
              desiredSupport: language === "sv" ? "Flödet bör tydligt stötta framdrift, beslut och överlämningar." : "The flow should clearly support progress, decisions, and handoffs.",
              decisionPoint: true
            },
            {
              id: `step-${journey.id}-3`,
              title: language === "sv" ? `Avsluta ${title}` : `Complete ${title}`,
              actor,
              description: language === "sv" ? `${actor} bekräftar utfallet, avslutar journeyn och gör resultatet synligt för rätt personer.` : `${actor} confirms the outcome, completes the journey, and makes the result visible to the right people.`,
              currentPain: language === "sv" ? "Avslut och uppföljning kan vara inkonsekventa eller svåra att verifiera." : "Closure and follow-up can be inconsistent or hard to verify.",
              desiredSupport: language === "sv" ? "Avslut bör vara tydligt, synligt och enkelt att lämna över eller följa upp." : "Closure should be clear, visible, and easy to hand off or follow up.",
              decisionPoint: false
            }
          ];

    return {
      summary:
        relevantEpicLabels.length > 0 || relevantStoryIdeaLabels.length > 0
          ? language === "sv"
            ? `${actor} behöver kunna ${lowerFirst(goal)} när ${lowerFirst(trigger)}. Den här journeyn tydliggör både nulägets friktion och vilket stöd som behövs framåt. Den hämtar också riktning från ${relevantEpicLabels.length > 0 ? `Epics som ${relevantEpicLabels.slice(0, 2).join(" och ")}` : `Story Ideas som ${relevantStoryIdeaLabels.slice(0, 2).join(" och ")}`}${relevantStoryIdeaInsights[0] ? `, särskilt där stödet bör spegla ${lowerFirst(relevantStoryIdeaInsights[0])}` : ""}.`
            : `${actor} needs to be able to ${lowerFirst(goal)} when ${lowerFirst(trigger)}. This journey clarifies both the friction in the current state and what support is needed going forward. It also takes direction from ${relevantEpicLabels.length > 0 ? `Epics such as ${relevantEpicLabels.slice(0, 2).join(" and ")}` : `Story Ideas such as ${relevantStoryIdeaLabels.slice(0, 2).join(" and ")}`}${relevantStoryIdeaInsights[0] ? `, especially where the support should reflect ${lowerFirst(relevantStoryIdeaInsights[0])}` : ""}.`
          : language === "sv"
            ? `${actor} behöver kunna ${lowerFirst(goal)} när ${lowerFirst(trigger)}. Den här journeyn tydliggör nulägets friktion, vilket framtida stöd som behövs och vilka breda steg som bär värdet i business caset.`
            : `${actor} needs to be able to ${lowerFirst(goal)} when ${lowerFirst(trigger)}. This journey clarifies the friction in the current state, what future support is needed, and which broad steps carry the value in the business case.`,
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
    !hasText(journey.currentState) ? t(language, "Current state", "Nuläge") : null,
    !hasText(journey.desiredFutureState) ? t(language, "Desired state", "Önskat läge") : null,
    !((journey.painPoints?.length ?? 0) > 0) ? t(language, "Problems", "Problem") : null,
    !((journey.desiredSupport?.length ?? 0) > 0) ? t(language, "Desired support", "Önskat stöd") : null,
    journey.steps.length === 0 ? t(language, "Steps", "Steg") : null
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
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {isFocused ? <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">{t(language, "Active now", "Aktiv nu")}</span> : null}
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${coreMissingCount > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : (journey.coverage?.status ?? "unanalysed") === "unanalysed" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{journeyStageLabel}</span>
            {journey.type ? <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">{journey.type === "business" ? t(language, "business", "verksamhet") : journey.type === "user" ? t(language, "user", "användare") : journey.type === "operational" ? t(language, "operational", "operativ") : journey.type === "support" ? t(language, "support", "support") : t(language, "transformation", "transformation")}</span> : null}
            {coreMissingCount === 0 ? <CoverageBadge status={journey.coverage?.status ?? "unanalysed"} /> : null}
            {journey.steps.length > 0 ? <StepSummary count={journey.steps.length} /> : null}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{normalizeJourneyTitle(journey.title) || t(language, "Untitled journey", "Namnlös journey")}</p>
            <p className="text-sm text-muted-foreground">{journey.primaryActor ? `${t(language, "Primary actor", "Huvudaktör")}: ${journey.primaryActor}` : t(language, "Primary actor not filled in yet", "Huvudaktör är inte ifylld ännu")}</p>
            {journey.goal ? <p className="text-sm text-muted-foreground">{t(language, "Goal", "Mål")}: {journey.goal}</p> : null}
            {displayedNarrative ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{truncateText(displayedNarrative, 220)}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start">
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-background px-3 text-xs font-medium text-muted-foreground">
            <span>{isOpen ? t(language, "Hide", "Dölj") : t(language, "Show", "Visa")}</span>
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </span>
          {onFocus && !isFocused ? (
            <Button
              className="h-9 whitespace-nowrap rounded-full px-4"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); setIsOpen(true); onFocus(); }}
              size="sm"
              type="button"
              variant="secondary"
            >
              {t(language, "Make active", "Gör aktiv")}
            </Button>
          ) : null}
          <Button
            className="h-9 whitespace-nowrap rounded-full px-4"
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); onRemove(); }}
            size="sm"
            type="button"
            variant="secondary"
          >
            {t(language, "Remove journey", "Ta bort journey")}
          </Button>
        </div>
      </summary>

      <div className="border-t border-border/70 px-5 py-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          {coreMissingCount > 0
            ? t(
                language,
                "Start broad. Fill in title, actor, goal, and trigger before adding more detail.",
                "Börja brett. Fyll i titel, aktör, mål och trigger innan du lägger till mer detalj."
              )
            : t(
                language,
                "This journey has the basics in place. Add more detail only if it clarifies the case or improves the analysis.",
                "Den här journeyn har grunderna på plats. Lägg bara till mer detalj om det förtydligar caset eller förbättrar analysen."
              )}
        </div>
        <div className="mt-6 space-y-4">
          <InlineSectionCard
            actionLabel={t(language, "Edit core", "Redigera kärnan")}
            description={t(language, "This shows the most important pieces first: title, actor, goal, and trigger.", "Här ser du det viktigaste först: titel, aktör, mål och trigger.")}
            editor={
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Title", "Titel")}</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, title: event.target.value })} type="text" value={journey.title} />
                  <FieldHint>{t(language, "Use a short verb-driven name for the journey.", "Använd ett kort verbdrivet namn för journeyn.")}</FieldHint>
                  <FieldError>{validation?.title}</FieldError>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Primary actor", "Huvudaktör")}</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, primaryActor: event.target.value })} type="text" value={journey.primaryActor} />
                  <FieldError>{validation?.primaryActor}</FieldError>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Goal", "Mål")}</span>
                  <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, goal: event.target.value })} value={journey.goal} />
                  <FieldHint>{t(language, "Describe what the actor is trying to achieve, not which screen they want to reach.", "Beskriv vad aktören försöker uppnå, inte vilken skärm personen vill till.")}</FieldHint>
                  <FieldError>{validation?.goal}</FieldError>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Trigger", "Trigger")}</span>
                  <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, trigger: event.target.value })} value={journey.trigger} />
                  <FieldHint>{t(language, "Describe what starts the journey.", "Beskriv vad som startar journeyn.")}</FieldHint>
                  <FieldError>{validation?.trigger}</FieldError>
                </label>
              </div>
            }
            helper={
              <>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      const nextSuggestion = buildCoreSuggestion();
                      const hasCoreImprovement =
                        hasMeaningfulTextChange(journey.title, nextSuggestion.title) ||
                        hasMeaningfulTextChange(journey.goal, nextSuggestion.goal) ||
                        hasMeaningfulTextChange(journey.trigger, nextSuggestion.trigger);

                      if (!hasCoreImprovement) {
                        setCoreSuggestion(null);
                        setCoreSuggestionInfo(buildNoImprovementMessage(t(language, "journey core", "journeykärnan")));
                        setEditingSection("core");
                        return;
                      }

                      setCoreSuggestionInfo(null);
                      setCoreSuggestion(nextSuggestion);
                      setEditingSection("core");
                    }}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {t(language, "Clarify the core text", "Förtydliga kärntext")}
                  </Button>
                </div>
                {coreSuggestionInfo ? <InlineAiNoImprovementNotice message={coreSuggestionInfo} /> : null}
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
            title={t(language, "Journey core", "Kärnan i journeyn")}
          >
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <p><span className="font-medium text-foreground">{t(language, "Title", "Titel")}:</span> {normalizeJourneyTitle(journey.title) || t(language, "Not filled in yet", "Inte ifyllt ännu")}</p>
              <p><span className="font-medium text-foreground">{t(language, "Primary actor", "Huvudaktör")}:</span> {journey.primaryActor || t(language, "Not filled in yet", "Inte ifyllt ännu")}</p>
              <p className="md:col-span-2"><span className="font-medium text-foreground">{t(language, "Goal", "Mål")}:</span> {journey.goal || t(language, "Not filled in yet", "Inte ifyllt ännu")}</p>
              <p className="md:col-span-2"><span className="font-medium text-foreground">{t(language, "Trigger", "Trigger")}:</span> {journey.trigger || t(language, "Not filled in yet", "Inte ifyllt ännu")}</p>
            </div>
          </InlineSectionCard>

          <div className="grid gap-4">
            <InlineSectionCard
              actionLabel={t(language, "Edit journey text", "Redigera journeytext")}
              description={t(language, "Describe the journey as a short connected narrative in the style of a business-case flow.", "Beskriv journeyen som ett kort sammanhängande narrativ i samma stil som ett business case-flöde.")}
              editor={
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Journey description", "Journey-beskrivning")}</span>
                  <textarea className="min-h-40 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, narrative: event.target.value })} value={journey.narrative ?? ""} />
                  <FieldHint>{t(language, "Describe the user's situation, today's way of working, the future support, and how the flow changes.", "Beskriv användarens situation, dagens arbetssätt, det framtida stödet och hur flödet förändras.")}</FieldHint>
                </label>
              }
                helper={
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          const nextSuggestion = buildNarrativeSuggestion();
                          if (!hasMeaningfulTextChange(journey.narrative, nextSuggestion)) {
                            setNarrativeSuggestion("");
                            setNarrativeSuggestionInfo(buildNoImprovementMessage(t(language, "journey text", "journeytexten")));
                            setEditingSection("narrative");
                            return;
                          }

                          setNarrativeSuggestionInfo(null);
                          setNarrativeSuggestion(nextSuggestion);
                          setEditingSection("narrative");
                        }}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        {t(language, "Improve journey text", "Förbättra journeytext")}
                      </Button>
                    </div>
                    {narrativeSuggestionInfo ? <InlineAiNoImprovementNotice message={narrativeSuggestionInfo} /> : null}
                  {narrativeSuggestion ? (
                    <div className="w-full">
                      <InlineAiSuggestion
                        onApply={() => {
                          onChange({ ...journey, narrative: narrativeSuggestion });
                          setEditingSection("narrative");
                          setNarrativeSuggestion("");
                        }}
                        onDismiss={() => setNarrativeSuggestion("")}
                        targetLabel={t(language, "Journey description", "Journey-beskrivning")}
                        text={narrativeSuggestion}
                        title={t(language, "AI suggestion for journey text", "AI-förslag för journeytext")}
                      />
                    </div>
                  ) : null}
                </div>
              }
              isEditing={isEditingNarrative}
              onToggleEdit={() => setEditingSection((current) => (current === "narrative" ? null : "narrative"))}
              title={t(language, "Journey description", "Journey-beskrivning")}
            >
              <p className="text-sm leading-6 text-muted-foreground">{displayedNarrative || t(language, "Not filled in yet", "Inte ifyllt ännu")}</p>
            </InlineSectionCard>

            <div className="grid gap-4 md:grid-cols-2">
              <InlineSectionCard
                actionLabel={t(language, "Edit value moment", "Redigera värdeögonblick")}
                description={t(language, "Describe when the real value appears for the user.", "Beskriv när det verkliga värdet uppstår för användaren.")}
                editor={
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(language, "Value moment", "Värdeögonblick")}</span>
                    <textarea className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, valueMoment: event.target.value })} value={journey.valueMoment ?? ""} />
                    <FieldHint>{t(language, "Describe when the user no longer has to hold the work together manually or is genuinely helped by the system.", "Beskriv när användaren inte längre behöver hålla ihop arbetet manuellt eller blir verkligt hjälpt av systemet.")}</FieldHint>
                  </label>
                }
                helper={
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          const nextSuggestion = buildValueMomentSuggestion();
                          if (!hasMeaningfulTextChange(journey.valueMoment, nextSuggestion)) {
                            setValueMomentSuggestion("");
                            setValueMomentSuggestionInfo(buildNoImprovementMessage(t(language, "value moment", "värdeögonblicket")));
                            setEditingSection("valueMoment");
                            return;
                          }

                          setValueMomentSuggestionInfo(null);
                          setValueMomentSuggestion(nextSuggestion);
                          setEditingSection("valueMoment");
                        }}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        {t(language, "Suggest value moment", "Föreslå värdeögonblick")}
                      </Button>
                    </div>
                    {valueMomentSuggestionInfo ? <InlineAiNoImprovementNotice message={valueMomentSuggestionInfo} /> : null}
                    {valueMomentSuggestion ? (
                      <div className="w-full">
                        <InlineAiSuggestion
                          onApply={() => {
                            onChange({ ...journey, valueMoment: valueMomentSuggestion });
                            setEditingSection("valueMoment");
                            setValueMomentSuggestion("");
                          }}
                          onDismiss={() => setValueMomentSuggestion("")}
                          targetLabel={t(language, "Value moment", "Värdeögonblick")}
                          text={valueMomentSuggestion}
                          title={t(language, "AI suggestion for value moment", "AI-förslag för värdeögonblick")}
                        />
                      </div>
                    ) : null}
                  </div>
                }
                isEditing={isEditingValueMoment}
                onToggleEdit={() => setEditingSection((current) => (current === "valueMoment" ? null : "valueMoment"))}
                title={t(language, "Value moment", "Värdeögonblick")}
              >
                <p className="text-sm leading-6 text-muted-foreground">{displayedValueMoment || t(language, "Not filled in yet", "Inte ifyllt ännu")}</p>
              </InlineSectionCard>

              <InlineSectionCard
                actionLabel={t(language, "Edit successful outcome", "Redigera lyckat utfall")}
                description={t(language, "Describe what is true when the journey works well.", "Beskriv vad som är sant när journeyen fungerar väl.")}
                editor={
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(language, "When the journey succeeds...", "När journeyen lyckas...")}</span>
                    <textarea className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, successSignals: parseLines(event.target.value) })} value={joinLines(journey.successSignals)} />
                    <FieldHint>{t(language, "Write a few short points about what the user can now do or feel confident about.", "Skriv några korta punkter om vad användaren nu kan göra eller känna trygghet i.")}</FieldHint>
                  </label>
                }
                helper={
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          const nextSuggestion = buildSuccessSignalsSuggestion();
                          if (!hasMeaningfulListChange(journey.successSignals, nextSuggestion)) {
                            setSuccessSignalsSuggestion([]);
                            setSuccessSignalsSuggestionInfo(buildNoImprovementMessage(t(language, "successful outcome", "lyckat utfall")));
                            setEditingSection("success");
                            return;
                          }

                          setSuccessSignalsSuggestionInfo(null);
                          setSuccessSignalsSuggestion(nextSuggestion);
                          setEditingSection("success");
                        }}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        {t(language, "Suggest successful outcome", "Föreslå lyckat utfall")}
                      </Button>
                    </div>
                    {successSignalsSuggestionInfo ? <InlineAiNoImprovementNotice message={successSignalsSuggestionInfo} /> : null}
                    {successSignalsSuggestion.length > 0 ? (
                      <div className="w-full">
                        <InlineAiSuggestion
                          onApply={() => {
                            onChange({ ...journey, successSignals: successSignalsSuggestion });
                            setEditingSection("success");
                            setSuccessSignalsSuggestion([]);
                          }}
                          onDismiss={() => setSuccessSignalsSuggestion([])}
                          targetLabel={t(language, "When the journey succeeds", "När journeyen lyckas")}
                          text={successSignalsSuggestion.map((item) => `- ${item}`).join("\n")}
                          title={t(language, "AI suggestion for successful outcome", "AI-förslag för lyckat utfall")}
                        />
                      </div>
                    ) : null}
                  </div>
                }
                isEditing={isEditingSuccess}
                onToggleEdit={() => setEditingSection((current) => (current === "success" ? null : "success"))}
                title={t(language, "When the journey succeeds", "När journeyen lyckas")}
              >
                {displayedSuccessSignals.length > 0 ? (
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {displayedSuccessSignals.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">{t(language, "Not filled in yet", "Inte ifyllt ännu")}</p>
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
                  <p className="text-base font-semibold text-foreground">{t(language, "AI analysis and backlog links", "AI-analys och backlog-kopplingar")}</p>
                  <p className="text-sm text-muted-foreground">{t(language, "Open only when you want to see likely links, gaps, or let AI fill empty analysis fields.", "Öppna bara när du vill se sannolika kopplingar, luckor eller låta AI fylla tomma analysfält.")}</p>
                </div>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                  {journey.coverage ? t(language, "Analysed", "Analyserad") : t(language, "Secondary", "Sekundärt")}
                </span>
              </div>
            </summary>

            <div className="space-y-4 border-t border-border/70 px-4 py-4">
              {journeyBrief && hasEmptyDraftSections ? (
                <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
                  <p className="font-medium text-foreground">{t(language, "Fill empty analysis fields with AI", "Fyll tomma analysfält med AI")}</p>
                  <p className="mt-1 leading-6 text-muted-foreground">
                    {t(language, "AI can fill what is still missing in the secondary fields:", "AI kan fylla sådant som fortfarande saknas i de sekundära fälten:")} {missingDraftFieldLabels.join(", ")}.
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
                      {t(language, "Insert suggestions into empty fields", "Lägg in förslag i tomma fält")}
                    </Button>
                  </div>
                </div>
              ) : null}

              {relevantStoryIdeaLabels.length > 0 || relevantEpicLabels.length > 0 ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <p className="font-medium text-foreground">{t(language, "Backlog already close to this journey", "Backlog som redan ligger nära journeyn")}</p>
                  {relevantStoryIdeaLabels.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">{t(language, "Story Ideas already close", "Story Ideas som redan ligger nära")}</p>
                      <CoverageSupportText labels={relevantStoryIdeaLabels} />
                    </div>
                  ) : null}
                  {relevantEpicLabels.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">{t(language, "Epics already giving direction", "Epics som redan ger riktning")}</p>
                      <CoverageSupportText labels={relevantEpicLabels} />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {missingStoryIdeaSuggestions.length > 0 ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <InlineStoryIdeaSuggestionList
                    description={t(language, "These are the next likely Story Ideas to consider if the journey needs more support than the current backlog already provides.", "Det här är nästa sannolika Story Ideas att överväga om journeyn behöver mer stöd än backloggen redan ger.")}
                    suggestions={missingStoryIdeaSuggestions}
                    title={t(language, "Possible missing Story Ideas", "Möjliga saknade Story Ideas")}
                  />
                </div>
              ) : null}

              {journey.coverage ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{t(language, "Coverage analysis", "Täckningsanalys")}</p>
                    <CoverageBadge status={journey.coverage.status} />
                  </div>
                  <p className="mt-2 text-muted-foreground">{t(language, "These are AI suggestions about likely links and gaps, not accepted truths.", "Det här är AI-förslag om sannolika kopplingar och luckor, inte accepterade sanningar.")}</p>
                  {suggestedEpicLabels.length > 0 ? <div className="mt-4"><p className="font-medium text-foreground">{t(language, "Likely Epic links", "Troliga Epic-kopplingar")}</p><CoverageSupportText labels={suggestedEpicLabels} /></div> : null}
                  {suggestedStoryIdeaLabels.length > 0 ? <div className="mt-4"><p className="font-medium text-foreground">{t(language, "Likely Story Idea links", "Troliga Story Idea-kopplingar")}</p><CoverageSupportText labels={suggestedStoryIdeaLabels} /></div> : null}
                  {journey.coverage.suggestedNewStoryIdeas?.length ? (
                    <div className="mt-4 space-y-3">
                      <p className="font-medium text-foreground">{t(language, "Suggested gaps to close", "Föreslagna luckor att stänga")}</p>
                      {journey.coverage.suggestedNewStoryIdeas.map((idea) => (
                        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3" key={`${idea.title}-${idea.description}`}>
                          <p className="font-medium text-foreground">{idea.title}</p>
                          <p className="mt-1 text-muted-foreground">{idea.description}</p>
                          {idea.expectedOutcome ? <p className="mt-2"><span className="font-medium text-foreground">{t(language, "Expected outcome:", "Förväntat utfall:")}</span> {idea.expectedOutcome}</p> : null}
                          {idea.confidence !== undefined ? <p><span className="font-medium text-foreground">{t(language, "Confidence:", "Säkerhet:")}</span> {Math.round(idea.confidence * 100)}%</p> : null}
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
                <p className="text-base font-semibold text-foreground">{t(language, "More detail if needed", "Mer detalj vid behov")}</p>
                <p className="text-sm text-muted-foreground">{t(language, "Add supporting actors, problems, manual links, steps, or analysis details only when they add signal.", "Lägg till stödaktörer, problem, manuella länkar, steg eller analysdetaljer bara när det tillför signal.")}</p>
              </div>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">{optionalDetailCount > 0 ? t(language, `${optionalDetailCount} areas in use`, `${optionalDetailCount} områden används`) : t(language, "Optional", "Frivilligt")}</span>
            </div>
          </summary>

          <div className="border-t border-border/70 px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Type", "Typ")}</span>
                <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, type: event.target.value ? (event.target.value as Journey["type"]) : undefined })} value={journey.type ?? ""}>
                  <option value="">{t(language, "Optional", "Frivilligt")}</option>
                  <option value="business">{t(language, "Business", "Verksamhet")}</option>
                  <option value="user">{t(language, "User", "Användare")}</option>
                  <option value="operational">{t(language, "Operational", "Operativ")}</option>
                  <option value="support">{t(language, "Support", "Support")}</option>
                  <option value="transformation">{t(language, "Transformation", "Transformation")}</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Supporting actors", "Stödaktörer")}</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, supportingActors: parseLines(event.target.value) })} value={joinLines(journey.supportingActors)} />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Current state", "Nuläge")}</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, currentState: event.target.value })} value={journey.currentState ?? ""} />
                <FieldHint>{t(language, "Optional. Describe the current state more analytically if it helps the analysis.", "Frivilligt. Beskriv nuläget mer analytiskt om det hjälper analysen.")}</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Desired state", "Önskat läge")}</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, desiredFutureState: event.target.value })} value={journey.desiredFutureState ?? ""} />
                <FieldHint>{t(language, "Optional. Describe the desired state more explicitly if it helps the analysis.", "Frivilligt. Beskriv det önskade läget mer explicit om det hjälper analysen.")}</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Problems", "Problem")}</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, painPoints: parseLines(event.target.value) })} value={joinLines(journey.painPoints)} />
                <FieldHint>{t(language, "Optional. List only the most important frictions if you need them separately from the journey text.", "Frivilligt. Lista bara de viktigaste friktionerna om du behöver dem separat från journeytexten.")}</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Desired support", "Önskat stöd")}</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, desiredSupport: parseLines(event.target.value) })} value={joinLines(journey.desiredSupport)} />
                <FieldHint>{t(language, "Optional. Describe support as capabilities or help, not detailed UI design.", "Frivilligt. Beskriv stöd som förmågor eller hjälp, inte detaljerad UI-design.")}</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Exceptions", "Undantag")}</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, exceptions: parseLines(event.target.value) })} value={joinLines(journey.exceptions)} />
                <FieldHint>{t(language, "Optional. Use when the journey has important variations or failure modes.", "Frivilligt. Använd när journeyn har viktiga variationer eller fellägen.")}</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Notes", "Noteringar")}</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, notes: event.target.value })} value={journey.notes ?? ""} />
                <FieldHint>{t(language, "Optional. Add context that may help later refinement.", "Frivilligt. Lägg till kontext som kan hjälpa senare förfining.")}</FieldHint>
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{t(language, "Optional steps", "Frivilliga steg")}</p>
                  <p className="text-sm text-muted-foreground">{t(language, "Add only larger handoffs, decisions, or breaks in the flow. Most journeys do not need many steps.", "Lägg bara till större överlämningar, beslut eller brott i flödet. De flesta journeys behöver inte många steg.")}</p>
                  <FieldError>{validation?.stepsSummary}</FieldError>
                </div>
                <Button onClick={onAddStep} type="button" variant="secondary">{t(language, "Add step", "Lägg till steg")}</Button>
              </div>

              {journey.steps.length === 0 ? <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">{t(language, "No steps added. Leave it that way if extra flow detail does not actually help.", "Inga steg tillagda. Låt det vara så om extra flödesdetalj inte faktiskt hjälper.")}</div> : null}
              {journey.steps.map((step, index) => <JourneyStepEditor isFirst={index === 0} isLast={index === journey.steps.length - 1} key={step.id} onChange={(nextStep) => onUpdateStep(step.id, () => nextStep)} onMoveDown={() => onMoveStep(step.id, "down")} onMoveUp={() => onMoveStep(step.id, "up")} onRemove={() => onRemoveStep(step.id)} step={step} validation={validation?.steps[step.id]} />)}
            </div>

            <div className="mt-6 space-y-4 rounded-[24px] border border-border/70 bg-muted/15 p-4">
              <div>
                <p className="text-base font-semibold text-foreground">{t(language, "Optional manual links", "Frivilliga manuella länkar")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t(language, "Optional. Add links when they are obvious, but you do not need to map everything manually. The AI analysis can suggest likely Epic and Story Idea links later.", "Frivilligt. Lägg till länkar om de är uppenbara, men du behöver inte mappa allt manuellt. AI-analysen kan föreslå sannolika Epic- och Story Idea-kopplingar senare.")}</p>
              </div>
              <MultiSelectLinks helper={t(language, "Optional Epic links when the connection is obvious.", "Frivilliga Epic-länkar när kopplingen är uppenbar.")} onChange={(nextIds) => onChange({ ...journey, linkedEpicIds: nextIds })} options={availableEpics} selectedIds={journey.linkedEpicIds} title={t(language, "Linked Epics", "Länkade Epics")} />
              <MultiSelectLinks helper={t(language, "Optional Story Idea links when the connection is obvious.", "Frivilliga Story Idea-länkar när kopplingen är uppenbar.")} onChange={(nextIds) => onChange({ ...journey, linkedStoryIdeaIds: nextIds })} options={availableStoryIdeas} selectedIds={journey.linkedStoryIdeaIds} title={t(language, "Linked Story Ideas", "Länkade Story Ideas")} />
              <MultiSelectLinks helper={t(language, "Optional Figma or reference links when they already exist in this Framing package.", "Frivilliga Figma- eller referenslänkar när de redan finns i detta Framing-paket.")} onChange={(nextIds) => onChange({ ...journey, linkedFigmaRefs: nextIds })} options={availableFigmaRefs} selectedIds={journey.linkedFigmaRefs} title={t(language, "Linked Figma / references", "Länkad Figma / referenser")} />
              {validation?.linkErrors.length ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{validation.linkErrors.map((message) => <p key={message}>{message}</p>)}</div> : null}
            </div>
          </div>
        </details>
      </div>
    </details>
  );
}

