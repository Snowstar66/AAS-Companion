"use client";

import type { ReactNode } from "react";
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
  inlineAssistant?: ReactNode;
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

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function findReferenceLabels(ids: string[] | undefined, options: JourneyReferenceOption[]) {
  return (ids ?? []).map((id) => options.find((option) => option.id === id)?.label ?? id);
}

function cleanCoverageNote(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.replace(/^AI-generated recommendation scaffold based on Journey text overlap with current Epics and Story Ideas\.\s*/i, "").trim() || value;
}

function CoverageSupportText({ labels }: { labels: string[] }) {
  if (labels.length === 0) {
    return null;
  }

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

function getCoreMissingCount(journey: Journey) {
  return [
    hasText(journey.title),
    hasText(journey.primaryActor),
    hasText(journey.goal),
    hasText(journey.trigger)
  ].filter((entry) => !entry).length;
}

function CoverageBadge({ status }: { status: string }) {
  const tone =
    status === "covered"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "partially_covered"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "uncovered"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${tone}`}>
      {status === "covered"
        ? "täckt"
        : status === "partially_covered"
          ? "delvis täckt"
          : status === "uncovered"
            ? "otäckt"
            : "ej analyserad"}
    </span>
  );
}

function StepSummary({ count }: { count: number }) {
  return (
    <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
      {count} steg
    </span>
  );
}

function MultiSelectLinks(props: {
  title: string;
  helper: string;
  options: JourneyReferenceOption[];
  selectedIds: string[] | undefined;
  onChange: (nextIds: string[]) => void;
}) {
  if (props.options.length === 0) {
    return null;
  }

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
                  const next = event.target.checked
                    ? [...selected, option.id]
                    : [...selected].filter((item) => item !== option.id);

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

export function JourneyCard({
  journey,
  validation,
  availableEpics,
  availableStoryIdeas,
  availableFigmaRefs,
  isFocused,
  onFocus,
  onChange,
  onRemove,
  onAddStep,
  onUpdateStep,
  onMoveStep,
  onRemoveStep,
  inlineAssistant
}: JourneyCardProps) {
  const optionalDetailCount =
    (journey.steps.length > 0 ? 1 : 0) +
    ((journey.painPoints?.length ?? 0) > 0 ? 1 : 0) +
    ((journey.desiredSupport?.length ?? 0) > 0 ? 1 : 0) +
    ((journey.linkedEpicIds?.length ?? 0) > 0 || (journey.linkedStoryIdeaIds?.length ?? 0) > 0 || (journey.linkedFigmaRefs?.length ?? 0) > 0 ? 1 : 0);
  const coreMissingCount = getCoreMissingCount(journey);
  const suggestedEpicLabels = findReferenceLabels(journey.coverage?.suggestedEpicIds, availableEpics);
  const suggestedStoryIdeaLabels = findReferenceLabels(journey.coverage?.suggestedStoryIdeaIds, availableStoryIdeas);
  const cleanedCoverageNote = cleanCoverageNote(journey.coverage?.notes);
  const journeyStageLabel =
    coreMissingCount > 0
      ? `${coreMissingCount} kärnfält kvar`
      : (journey.coverage?.status ?? "unanalysed") === "unanalysed"
        ? "Redo för analys"
        : "Analyserad";

  return (
    <details
      className={`group rounded-[28px] border bg-background shadow-none ${
        isFocused ? "border-sky-300 ring-2 ring-sky-100" : "border-border/70"
      }`}
      open
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {isFocused ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                Aktiv i AI-hjälpen
              </span>
            ) : null}
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                coreMissingCount > 0
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : (journey.coverage?.status ?? "unanalysed") === "unanalysed"
                    ? "border-sky-200 bg-sky-50 text-sky-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {journeyStageLabel}
            </span>
            {journey.type ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                {journey.type === "business"
                  ? "verksamhet"
                  : journey.type === "user"
                    ? "användare"
                    : journey.type === "operational"
                      ? "operativ"
                      : journey.type === "support"
                        ? "support"
                        : "transformation"}
              </span>
            ) : null}
            {coreMissingCount === 0 ? <CoverageBadge status={journey.coverage?.status ?? "unanalysed"} /> : null}
            {journey.steps.length > 0 ? <StepSummary count={journey.steps.length} /> : null}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{journey.title || "Namnlös journey"}</p>
            <p className="text-sm text-muted-foreground">
              {journey.primaryActor ? `Huvudaktör: ${journey.primaryActor}` : "Huvudaktör är inte ifylld ännu"}
            </p>
            {journey.goal ? <p className="text-sm text-muted-foreground">Mål: {journey.goal}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onFocus ? (
            <Button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFocus();
              }}
              size="sm"
              type="button"
              variant={isFocused ? "default" : "secondary"}
            >
              {isFocused ? "Aktiv i AI-hjälpen" : "Arbeta med denna"}
            </Button>
          ) : null}
          <Button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            Ta bort journey
          </Button>
        </div>
      </summary>

      <div className="border-t border-border/70 px-5 py-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          {coreMissingCount > 0
            ? "Börja brett. Fyll i titel, aktör, mål och trigger innan du lägger till mer detalj."
            : "Den här journeyn har grunderna på plats. Lägg bara till mer detalj om det förtydligar caset eller förbättrar analysen."}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Titel</span>
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, title: event.target.value })}
              type="text"
              value={journey.title}
            />
            <FieldHint>Använd ett kort verbdrivet namn för journeyn, till exempel Hantera inkommande ärende.</FieldHint>
            <FieldError>{validation?.title}</FieldError>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Huvudaktör</span>
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, primaryActor: event.target.value })}
              type="text"
              value={journey.primaryActor}
            />
            <FieldError>{validation?.primaryActor}</FieldError>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Mål</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, goal: event.target.value })}
              value={journey.goal}
            />
            <FieldHint>Beskriv vad aktören försöker uppnå, inte vilken skärm personen vill till.</FieldHint>
            <FieldError>{validation?.goal}</FieldError>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Trigger</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, trigger: event.target.value })}
              value={journey.trigger}
            />
            <FieldHint>Beskriv vad som startar journeyn.</FieldHint>
            <FieldError>{validation?.trigger}</FieldError>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Nuläge</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, currentState: event.target.value })}
              value={journey.currentState ?? ""}
            />
            <FieldHint>Beskriv hur journeyn fungerar i dag, särskilt friktion eller fragmentering.</FieldHint>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Önskat framtida läge</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, desiredFutureState: event.target.value })}
              value={journey.desiredFutureState ?? ""}
            />
            <FieldHint>Beskriv hur journeyn bör fungera med bättre stöd.</FieldHint>
          </label>

        </div>

        {inlineAssistant ? (
          <div className="mt-6 rounded-[24px] border border-sky-200/80 bg-sky-50/50 p-4">
            {inlineAssistant}
          </div>
        ) : null}

        <details className="mt-6 rounded-[24px] border border-border/70 bg-muted/10">
          <summary className="cursor-pointer list-none px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Mer detalj vid behov</p>
                <p className="text-sm text-muted-foreground">
                  Lägg till stödaktörer, problem, manuella länkar, steg eller analysdetaljer bara när det tillför signal.
                </p>
              </div>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {optionalDetailCount > 0 ? `${optionalDetailCount} områden används` : "Frivilligt"}
              </span>
            </div>
          </summary>

          <div className="border-t border-border/70 px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Typ</span>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                  onChange={(event) =>
                    onChange({
                      ...journey,
                      type: event.target.value ? (event.target.value as Journey["type"]) : undefined
                    })
                  }
                  value={journey.type ?? ""}
                >
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
                <textarea
                  className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, supportingActors: parseLines(event.target.value) })}
                  value={joinLines(journey.supportingActors)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Problem</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, painPoints: parseLines(event.target.value) })}
                  value={joinLines(journey.painPoints)}
                />
                <FieldHint>Lista bara de viktigaste friktionerna, fördröjningarna, oklarheterna eller riskerna.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Önskat stöd</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, desiredSupport: parseLines(event.target.value) })}
                  value={joinLines(journey.desiredSupport)}
                />
                <FieldHint>Beskriv önskat stöd som förmågor eller hjälp, inte detaljerad UI-design.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Undantag</span>
                <textarea
                  className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, exceptions: parseLines(event.target.value) })}
                  value={joinLines(journey.exceptions)}
                />
                <FieldHint>Frivilligt. Använd när journeyn har viktiga variationer eller fellägen.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Noteringar</span>
                <textarea
                  className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, notes: event.target.value })}
                  value={journey.notes ?? ""}
                />
                <FieldHint>Frivilligt. Lägg till kontext som kan hjälpa senare förfining.</FieldHint>
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">Frivilliga steg</p>
                  <p className="text-sm text-muted-foreground">
                    Lägg bara till större överlämningar, beslut eller brott i flödet. De flesta journeys behöver inte många steg.
                  </p>
                  <FieldError>{validation?.stepsSummary}</FieldError>
                </div>
                <Button onClick={onAddStep} type="button" variant="secondary">Lägg till steg</Button>
              </div>

              {journey.steps.length === 0 ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
                  Inga steg tillagda. Låt det vara så om extra flödesdetalj inte faktiskt hjälper.
                </div>
              ) : null}

              {journey.steps.map((step, index) => (
                <JourneyStepEditor
                  isFirst={index === 0}
                  isLast={index === journey.steps.length - 1}
                  key={step.id}
                  onChange={(nextStep) => onUpdateStep(step.id, () => nextStep)}
                  onMoveDown={() => onMoveStep(step.id, "down")}
                  onMoveUp={() => onMoveStep(step.id, "up")}
                  onRemove={() => onRemoveStep(step.id)}
                  step={step}
                  validation={validation?.steps[step.id]}
                />
              ))}
            </div>

            <div className="mt-6 space-y-4 rounded-[24px] border border-border/70 bg-muted/15 p-4">
              <div>
                <p className="text-base font-semibold text-foreground">Frivilliga manuella länkar</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Frivilligt. Lägg till länkar om de är uppenbara, men du behöver inte mappa allt manuellt. AI-analysen kan föreslå sannolika Epic- och Story Idea-kopplingar senare.
                </p>
              </div>
              <MultiSelectLinks
                helper="Frivilliga Epic-länkar när kopplingen är uppenbar."
                onChange={(nextIds) => onChange({ ...journey, linkedEpicIds: nextIds })}
                options={availableEpics}
                selectedIds={journey.linkedEpicIds}
                title="Länkade Epics"
              />
              <MultiSelectLinks
                helper="Frivilliga Story Idea-länkar när kopplingen är uppenbar."
                onChange={(nextIds) => onChange({ ...journey, linkedStoryIdeaIds: nextIds })}
                options={availableStoryIdeas}
                selectedIds={journey.linkedStoryIdeaIds}
                title="Länkade Story Ideas"
              />
              <MultiSelectLinks
                helper="Frivilliga Figma- eller referenslänkar när de redan finns i detta Framing-paket."
                onChange={(nextIds) => onChange({ ...journey, linkedFigmaRefs: nextIds })}
                options={availableFigmaRefs}
                selectedIds={journey.linkedFigmaRefs}
                title="Länkad Figma / referenser"
              />
              {validation?.linkErrors.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {validation.linkErrors.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              ) : null}
            </div>
            {journey.coverage ? (
              <Card className="mt-6 border-border/70 bg-background shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Täckningsanalys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    Täckningsanalysen visar sannolika kopplingar till Epics och Story Ideas samt var det fortfarande finns luckor. Det här är AI-förslag, inte accepterade sanningar.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <CoverageBadge status={journey.coverage.status} />
                  </div>
                  {suggestedEpicLabels.length > 0 ? (
                    <div>
                      <p className="font-medium text-foreground">Troliga Epic-kopplingar</p>
                      <CoverageSupportText labels={suggestedEpicLabels} />
                    </div>
                  ) : null}
                  {suggestedStoryIdeaLabels.length > 0 ? (
                    <div>
                      <p className="font-medium text-foreground">Troliga Story Idea-kopplingar</p>
                      <CoverageSupportText labels={suggestedStoryIdeaLabels} />
                    </div>
                  ) : null}
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
                  {!suggestedEpicLabels.length && !suggestedStoryIdeaLabels.length && !(journey.coverage.suggestedNewStoryIdeas?.length ?? 0) ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3 text-muted-foreground">
                      Analysen hittade ännu inga tydliga kopplingar. Förtydliga gärna journeyformuleringen eller kör analys igen när Epics och Story Ideas blivit tydligare.
                    </div>
                  ) : null}
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
