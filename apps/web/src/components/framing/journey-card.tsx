"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@aas-companion/ui";
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
};

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

function InlineAiSuggestion(props: { title: string; text: string; onApply: () => void; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!props.text.trim()) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 text-sky-900" />
        <div className="space-y-2">
          <p className="font-medium text-foreground">{props.title}</p>
          <p className="leading-6 text-foreground">{props.text}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={props.onApply} size="sm" type="button">Använd förslag</Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(props.text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          size="sm"
          type="button"
          variant="secondary"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Kopierat" : "Kopiera"}
        </Button>
        <Button onClick={props.onDismiss} size="sm" type="button" variant="secondary">Dölj</Button>
      </div>
    </div>
  );
}

function InlineAiCoreSuggestion(props: { suggestion: JourneyCoreSuggestion; onApply: () => void; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyText = [
    props.suggestion.title ? `Titel: ${props.suggestion.title}` : null,
    props.suggestion.goal ? `Mål: ${props.suggestion.goal}` : null,
    props.suggestion.trigger ? `Trigger: ${props.suggestion.trigger}` : null
  ].filter(Boolean).join("\n");

  if (!copyText.trim()) return null;

  return (
    <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4 text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 text-sky-900" />
        <div className="space-y-3">
          <p className="font-medium text-foreground">AI-förslag för titel, mål och trigger</p>
          {props.suggestion.title ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Titel</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.title}</p></div> : null}
          {props.suggestion.goal ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Mål</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.goal}</p></div> : null}
          {props.suggestion.trigger ? <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Trigger</p><p className="mt-1 leading-6 text-foreground">{props.suggestion.trigger}</p></div> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={props.onApply} size="sm" type="button">Använd i kortet</Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(copyText);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          size="sm"
          type="button"
          variant="secondary"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Kopierat" : "Kopiera"}
        </Button>
        <Button onClick={props.onDismiss} size="sm" type="button" variant="secondary">Dölj</Button>
      </div>
    </div>
  );
}
function InlineAiFirstDraftSuggestion(props: {
  suggestion: JourneyFirstDraftSuggestion;
  onApply: () => void;
  onDismiss: () => void;
  applyLabel?: string;
  dismissLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copyText = [
    `Nuläge: ${props.suggestion.currentState}`,
    `Önskat läge: ${props.suggestion.desiredFutureState}`,
    "",
    "Problem:",
    ...props.suggestion.painPoints.map((item) => `- ${item}`),
    "",
    "Önskat stöd:",
    ...props.suggestion.desiredSupport.map((item) => `- ${item}`),
    "",
    "Breda steg:",
    ...props.suggestion.steps.map((step) => `- ${step.title}: ${step.description}`)
  ].join("\n");

  return (
    <div className="rounded-2xl border border-sky-200 bg-white px-4 py-4">
      <p className="font-medium text-foreground">AI-sammanfattning av journeyn</p>
      <p className="mt-1 text-sm text-muted-foreground">Det här är den sammanfattade vyn av journeyn. Här ser du riktning, friktion, önskat stöd, breda steg och sannolika kopplingar på ett ställe.</p>
      <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-sm leading-6 text-foreground">
        {props.suggestion.summary}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Nuläge</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{props.suggestion.currentState}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Önskat läge</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{props.suggestion.desiredFutureState}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Problem</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">{props.suggestion.painPoints.map((item) => <li key={item}>• {item}</li>)}</ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Önskat stöd</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">{props.suggestion.desiredSupport.map((item) => <li key={item}>• {item}</li>)}</ul>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Breda steg</p>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">
          {props.suggestion.steps.map((step) => (
            <li key={step.id}>• <span className="font-medium">{step.title}:</span> {step.description}</li>
          ))}
        </ul>
      </div>
      {props.suggestion.relatedEpicLabels.length > 0 || props.suggestion.relatedStoryIdeaLabels.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {props.suggestion.relatedEpicLabels.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Troliga Epic-kopplingar</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {props.suggestion.relatedEpicLabels.map((label) => (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800" key={label}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {props.suggestion.relatedStoryIdeaLabels.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Troliga Story Idea-kopplingar</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {props.suggestion.relatedStoryIdeaLabels.map((label) => (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800" key={label}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {props.suggestion.relatedEpicInsights.length > 0 || props.suggestion.relatedStoryIdeaInsights.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {props.suggestion.relatedEpicInsights.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Inspiration från Epics</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">
                {props.suggestion.relatedEpicInsights.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {props.suggestion.relatedStoryIdeaInsights.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900/75">Inspiration från Story Ideas</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">
                {props.suggestion.relatedStoryIdeaInsights.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={props.onApply} size="sm" type="button">{props.applyLabel ?? "Använd i kortet"}</Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(copyText);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          size="sm"
          type="button"
          variant="secondary"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Kopierat" : "Kopiera"}
        </Button>
        <Button onClick={props.onDismiss} size="sm" type="button" variant="secondary">{props.dismissLabel ?? "Dölj"}</Button>
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
  const [showEditor, setShowEditor] = useState(coreMissingCount > 0);
  const [coreSuggestion, setCoreSuggestion] = useState<JourneyCoreSuggestion | null>(null);
  const [currentStateSuggestion, setCurrentStateSuggestion] = useState("");
  const [desiredFutureStateSuggestion, setDesiredFutureStateSuggestion] = useState("");
  const journeyStageLabel = coreMissingCount > 0 ? `${coreMissingCount} kärnfält kvar` : (journey.coverage?.status ?? "unanalysed") === "unanalysed" ? "Redo för analys" : "Analyserad";

  useEffect(() => {
    if (isFocused) {
      setIsOpen(true);
    }
  }, [isFocused]);

  useEffect(() => {
    setCoreSuggestion(null);
    setCurrentStateSuggestion("");
    setDesiredFutureStateSuggestion("");
    setShowEditor(coreMissingCount > 0);
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
  const relevantStoryIdeaInsights = uniqueLabels(
    relevantStoryIdeaOptions
      .flatMap((option) => [option.valueIntent, option.expectedBehavior, option.description])
      .map((value) => value?.trim() ?? "")
      .filter(Boolean)
      .map((item) => ensurePeriod(toSentenceCase(item)))
  ).slice(0, 3);

  function buildGoalSuggestion() {
    const normalized = ensurePeriod(toSentenceCase(journey.goal || ""));
    if (!normalized) return "";
    return /\baktören\b/i.test(normalized) ? normalized : `Huvudaktören vill ${lowerFirst(normalized)}`;
  }

  function buildTriggerSuggestion() {
    const normalized = ensurePeriod(toSentenceCase(journey.trigger || ""));
    if (!normalized) return "";
    return /^journeyn börjar när/i.test(normalized) ? normalized : `Journeyn börjar när ${lowerFirst(normalized)}`;
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
      ? `I dag börjar ${journey.primaryActor.toLowerCase()} ofta när ${lowerFirst(journey.trigger)}, men flödet blir lätt fragmenterat. Det märks särskilt där stödet ännu inte riktigt lever upp till riktningar som ${lowerFirst(inspiration)}`
      : `I dag börjar ${journey.primaryActor.toLowerCase()} ofta när ${lowerFirst(journey.trigger)}, men flödet blir lätt fragmenterat av manuell samordning, begränsad överblick eller oklara överlämningar.`;
  }

  function buildDesiredFutureStateSuggestion() {
    const normalized = ensurePeriod(toSentenceCase(journey.desiredFutureState || ""));
    if (normalized) return /^(i önskat läge|i framtiden|framåt)/i.test(normalized) ? normalized : `I önskat läge ${lowerFirst(normalized)}`;
    if (!hasText(journey.primaryActor) || !hasText(journey.goal)) return "";
    const inspiration = relevantStoryIdeaInsights[0] ?? relevantEpicInsights[0] ?? "";
    return inspiration
      ? `I önskat läge kan ${journey.primaryActor.toLowerCase()} ${lowerFirst(journey.goal)}, med tydligare status och stöd som bättre speglar riktningar som ${lowerFirst(inspiration)}`
      : `I önskat läge kan ${journey.primaryActor.toLowerCase()} ${lowerFirst(journey.goal)}, med tydligare status, färre manuella avbrott och smidigare beslut.`;
  }

  function createFirstDraftSuggestion() {
    if (!canBuildJourneySummary) return null;
    const actor = journey.primaryActor.trim();
    const goal = journey.goal.trim();
    const trigger = journey.trigger.trim();
    const title = normalizeJourneyTitle(journey.title) || "journeyn";
    const relatedEpicLabels = uniqueLabels(relevantEpicOptions.map((option) => option.label));
    const relatedStoryIdeaLabels = uniqueLabels(relevantStoryIdeaOptions.map((option) => option.label));
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
        relatedEpicLabels.length > 0 || relatedStoryIdeaLabels.length > 0
          ? `${actor} behöver kunna ${lowerFirst(goal)} när ${lowerFirst(trigger)}. Den här journeyn tydliggör både nulägets friktion och vilket stöd som behövs framåt. Den hämtar också riktning från ${relatedEpicLabels.length > 0 ? `Epics som ${relatedEpicLabels.slice(0, 2).join(" och ")}` : `Story Ideas som ${relatedStoryIdeaLabels.slice(0, 2).join(" och ")}`}${relevantStoryIdeaInsights[0] ? `, särskilt där stödet bör spegla ${lowerFirst(relevantStoryIdeaInsights[0])}` : ""}.`
          : `${actor} behöver kunna ${lowerFirst(goal)} när ${lowerFirst(trigger)}. Den här journeyn tydliggör nulägets friktion, vilket framtida stöd som behövs och vilka breda steg som bär värdet i business caset.`,
      currentState,
      desiredFutureState,
      painPoints,
      desiredSupport,
      steps,
      relatedEpicLabels,
      relatedEpicInsights: relevantEpicInsights,
      relatedStoryIdeaLabels,
      relatedStoryIdeaInsights: relevantStoryIdeaInsights
    } satisfies JourneyFirstDraftSuggestion;
  }

  const journeyBrief = canBuildJourneySummary ? createFirstDraftSuggestion() : null;
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
            {journeyBrief?.summary ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{truncateText(journeyBrief.summary, 220)}</p> : null}
            {journeyBrief ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Nuläge:</span> {truncateText(journeyBrief.currentState, 120)}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Önskat läge:</span> {truncateText(journeyBrief.desiredFutureState, 120)}
                </p>
              </div>
            ) : null}
            {journeyBrief && (journeyBrief.relatedEpicLabels.length > 0 || journeyBrief.relatedStoryIdeaLabels.length > 0) ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {journeyBrief.relatedEpicLabels.slice(0, 2).map((label) => (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-800" key={`epic-${label}`}>
                    {truncateText(label, 48)}
                  </span>
                ))}
                {journeyBrief.relatedStoryIdeaLabels.slice(0, 2).map((label) => (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700" key={`story-${label}`}>
                    {truncateText(label, 48)}
                  </span>
                ))}
              </div>
            ) : null}
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

        {journeyBrief ? (
          <div className="mt-4 space-y-4">
            <InlineAiFirstDraftSuggestion
              applyLabel="Fyll i det som saknas"
              dismissLabel={showEditor ? "Dölj redigering" : "Redigera direkt"}
              onApply={() => {
                onChange({
                  ...journey,
                  currentState: hasText(journey.currentState) ? journey.currentState : journeyBrief.currentState,
                  desiredFutureState: hasText(journey.desiredFutureState) ? journey.desiredFutureState : journeyBrief.desiredFutureState,
                  painPoints: journey.painPoints?.length ? journey.painPoints : journeyBrief.painPoints,
                  desiredSupport: journey.desiredSupport?.length ? journey.desiredSupport : journeyBrief.desiredSupport,
                  steps: journey.steps.length ? journey.steps : journeyBrief.steps
                });
              }}
              onDismiss={() => setShowEditor((current) => !current)}
              suggestion={journeyBrief}
            />

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowEditor((current) => !current)} size="sm" type="button" variant={showEditor ? "secondary" : "default"}>
                {showEditor ? "Dölj redigering" : "Uppdatera journey"}
              </Button>
              <Button onClick={() => setCoreSuggestion(buildCoreSuggestion())} size="sm" type="button" variant="secondary">
                Förtydliga kärntext
              </Button>
              <Button onClick={() => setCurrentStateSuggestion(buildCurrentStateSuggestion())} size="sm" type="button" variant="secondary">
                {hasText(journey.currentState) ? "Förbättra nuläge" : "Skissa nuläge"}
              </Button>
              <Button onClick={() => setDesiredFutureStateSuggestion(buildDesiredFutureStateSuggestion())} size="sm" type="button" variant="secondary">
                {hasText(journey.desiredFutureState) ? "Förbättra önskat läge" : "Skissa önskat läge"}
              </Button>
            </div>

            {coreSuggestion ? (
              <InlineAiCoreSuggestion
                onApply={() => {
                  onChange({
                    ...journey,
                    title: coreSuggestion.title || journey.title,
                    goal: coreSuggestion.goal || journey.goal,
                    trigger: coreSuggestion.trigger || journey.trigger
                  });
                  setCoreSuggestion(null);
                }}
                onDismiss={() => setCoreSuggestion(null)}
                suggestion={coreSuggestion}
              />
            ) : null}
            {currentStateSuggestion ? (
              <InlineAiSuggestion
                onApply={() => {
                  onChange({ ...journey, currentState: currentStateSuggestion });
                  setCurrentStateSuggestion("");
                }}
                onDismiss={() => setCurrentStateSuggestion("")}
                text={currentStateSuggestion}
                title="AI-förslag för nuläge"
              />
            ) : null}
            {desiredFutureStateSuggestion ? (
              <InlineAiSuggestion
                onApply={() => {
                  onChange({ ...journey, desiredFutureState: desiredFutureStateSuggestion });
                  setDesiredFutureStateSuggestion("");
                }}
                onDismiss={() => setDesiredFutureStateSuggestion("")}
                text={desiredFutureStateSuggestion}
                title="AI-förslag för önskat läge"
              />
            ) : null}
          </div>
        ) : null}

        {showEditor || !journeyBrief ? (
          <div className="mt-6 space-y-4 rounded-[24px] border border-border/70 bg-muted/10 p-4">
            <div>
              <p className="font-medium text-foreground">{journeyBrief ? "Redigera journey" : "Fyll i journey"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {journeyBrief
                  ? "Uppdatera texten direkt här. Sammanfattningen ovan speglar sedan journeyns riktning och detaljer."
                  : "Fyll i grunderna först. När titel, huvudaktör, mål och trigger finns på plats får du den sammanfattade vyn ovan."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Titel</span>
                <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, title: event.target.value })} type="text" value={journey.title} />
                <FieldHint>Använd ett kort verbdrivet namn för journeyn, till exempel Hantera inkommande ärende.</FieldHint>
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

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Nuläge</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, currentState: event.target.value })} value={journey.currentState ?? ""} />
                <FieldHint>Beskriv hur journeyn fungerar i dag, särskilt friktion eller fragmentering.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Önskat framtida läge</span>
                <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, desiredFutureState: event.target.value })} value={journey.desiredFutureState ?? ""} />
                <FieldHint>Beskriv hur journeyn bör fungera med bättre stöd.</FieldHint>
              </label>
            </div>
          </div>
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
                <span className="text-sm font-medium text-foreground">Problem</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, painPoints: parseLines(event.target.value) })} value={joinLines(journey.painPoints)} />
                <FieldHint>Lista bara de viktigaste friktionerna, fördröjningarna, oklarheterna eller riskerna.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Önskat stöd</span>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" onChange={(event) => onChange({ ...journey, desiredSupport: parseLines(event.target.value) })} value={joinLines(journey.desiredSupport)} />
                <FieldHint>Beskriv önskat stöd som förmågor eller hjälp, inte detaljerad UI-design.</FieldHint>
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

            {journey.coverage ? (
              <Card className="mt-6 border-border/70 bg-background shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Täckningsanalys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">Täckningsanalysen visar sannolika kopplingar till Epics och Story Ideas samt var det fortfarande finns luckor. Det här är AI-förslag, inte accepterade sanningar.</p>
                  <div className="flex flex-wrap gap-2"><CoverageBadge status={journey.coverage.status} /></div>
                  {suggestedEpicLabels.length > 0 ? <div><p className="font-medium text-foreground">Troliga Epic-kopplingar</p><CoverageSupportText labels={suggestedEpicLabels} /></div> : null}
                  {suggestedStoryIdeaLabels.length > 0 ? <div><p className="font-medium text-foreground">Troliga Story Idea-kopplingar</p><CoverageSupportText labels={suggestedStoryIdeaLabels} /></div> : null}
                  {journey.coverage.suggestedNewStoryIdeas?.length ? (
                    <div className="space-y-3">
                      <p className="font-medium text-foreground">Föreslagna luckor att stänga</p>
                      {journey.coverage.suggestedNewStoryIdeas.map((idea) => (
                        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3" key={`${idea.title}-${idea.description}`}>
                          <p className="font-medium text-foreground">{idea.title}</p>
                          <p className="mt-1 text-muted-foreground">{idea.description}</p>
                          {idea.valueIntent ? <p className="mt-2"><span className="font-medium text-foreground">Värdeintention:</span> {idea.valueIntent}</p> : null}
                          {idea.expectedOutcome ? <p><span className="font-medium text-foreground">Förväntat utfall:</span> {idea.expectedOutcome}</p> : null}
                          {idea.confidence !== undefined ? <p><span className="font-medium text-foreground">Säkerhet:</span> {Math.round(idea.confidence * 100)}%</p> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {!suggestedEpicLabels.length && !suggestedStoryIdeaLabels.length && !(journey.coverage.suggestedNewStoryIdeas?.length ?? 0) ? <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3 text-muted-foreground">Analysen hittade ännu inga tydliga kopplingar. Förtydliga gärna journeyformuleringen eller kör analys igen när Epics och Story Ideas blivit tydligare.</div> : null}
                  {cleanedCoverageNote ? <p className="text-muted-foreground">{cleanedCoverageNote}</p> : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </details>
      </div>
    </details>
  );
}
