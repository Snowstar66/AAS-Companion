"use client";

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
      {status.replaceAll("_", " ")}
    </span>
  );
}

function StepSummary({ count }: { count: number }) {
  return (
    <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
      {count} detailed step{count === 1 ? "" : "s"}
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
  onRemoveStep
}: JourneyCardProps) {
  return (
    <details
      className={`group rounded-[28px] border bg-background shadow-none ${
        isFocused ? "border-emerald-300 ring-2 ring-emerald-100" : "border-border/70"
      }`}
      open
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              Journey {journey.id}
            </span>
            {journey.type ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                {journey.type}
              </span>
            ) : null}
            <StepSummary count={journey.steps.length} />
            <CoverageBadge status={journey.coverage?.status ?? "unanalysed"} />
            {isFocused ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                AI focus
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{journey.title || "Untitled Journey"}</p>
            <p className="text-sm text-muted-foreground">
              Primary actor: {journey.primaryActor || "Not captured yet"}
              {journey.goal ? ` / Goal: ${journey.goal}` : ""}
            </p>
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
              {isFocused ? "Focused in AI" : "Focus in AI"}
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
            Delete Journey
          </Button>
        </div>
      </summary>

      <div className="border-t border-border/70 px-5 py-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          Describe the Journey at flow level first. Focus on actor, goal, trigger, current friction, and desired support. Add detailed Steps only if they help explain a decision, handoff, or gap.
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, title: event.target.value })}
              type="text"
              value={journey.title}
            />
            <FieldHint>Use a short verb-driven name for the journey, such as Handle incoming case or Resolve production incident.</FieldHint>
            <FieldError>{validation?.title}</FieldError>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Primary Actor</span>
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, primaryActor: event.target.value })}
              type="text"
              value={journey.primaryActor}
            />
            <FieldError>{validation?.primaryActor}</FieldError>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Goal</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, goal: event.target.value })}
              value={journey.goal}
            />
            <FieldHint>Describe what the actor is trying to achieve, not what screen they want.</FieldHint>
            <FieldError>{validation?.goal}</FieldError>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Trigger</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, trigger: event.target.value })}
              value={journey.trigger}
            />
            <FieldHint>Describe what starts the journey.</FieldHint>
            <FieldError>{validation?.trigger}</FieldError>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Current State</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, currentState: event.target.value })}
              value={journey.currentState ?? ""}
            />
            <FieldHint>Describe how the journey works today, especially friction or fragmentation.</FieldHint>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Desired Future State</span>
            <textarea
              className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChange({ ...journey, desiredFutureState: event.target.value })}
              value={journey.desiredFutureState ?? ""}
            />
            <FieldHint>Describe how the journey should work with better support.</FieldHint>
          </label>

        </div>

        <details className="mt-6 rounded-[24px] border border-border/70 bg-muted/10" open={false}>
          <summary className="cursor-pointer list-none px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Optional detail</p>
                <p className="text-sm text-muted-foreground">
                  Add supporting actors, pain points, detailed steps, and manual links only when they add signal.
                </p>
              </div>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                Expand details
              </span>
            </div>
          </summary>

          <div className="border-t border-border/70 px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Type</span>
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
                  <option value="">Optional</option>
                  <option value="business">Business</option>
                  <option value="user">User</option>
                  <option value="operational">Operational</option>
                  <option value="support">Support</option>
                  <option value="transformation">Transformation</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Supporting Actors</span>
                <textarea
                  className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, supportingActors: parseLines(event.target.value) })}
                  value={joinLines(journey.supportingActors)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Pain Points</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, painPoints: parseLines(event.target.value) })}
                  value={joinLines(journey.painPoints)}
                />
                <FieldHint>List only the most important frictions, delays, ambiguities, or risks.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Desired Support</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, desiredSupport: parseLines(event.target.value) })}
                  value={joinLines(journey.desiredSupport)}
                />
                <FieldHint>Describe desired support as capabilities or help, not detailed UI design.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Exceptions</span>
                <textarea
                  className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, exceptions: parseLines(event.target.value) })}
                  value={joinLines(journey.exceptions)}
                />
                <FieldHint>Optional. Use when the journey has important variations or failure modes.</FieldHint>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Notes</span>
                <textarea
                  className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange({ ...journey, notes: event.target.value })}
                  value={journey.notes ?? ""}
                />
                <FieldHint>Optional. Add context that may help later refinement.</FieldHint>
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">Detailed Steps</p>
                  <p className="text-sm text-muted-foreground">
                    Optional. Add only the major steps, decisions, or handoffs that help coverage analysis.
                  </p>
                  <FieldError>{validation?.stepsSummary}</FieldError>
                </div>
                <Button onClick={onAddStep} type="button" variant="secondary">Add detailed Step</Button>
              </div>

              {journey.steps.length === 0 ? (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
                  No detailed Steps added yet. Keep it this way unless extra flow detail will genuinely help.
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
                <p className="text-base font-semibold text-foreground">Optional manual links</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Optional. Add links if obvious, but you do not need to manually map everything. AI coverage analysis can suggest likely Epic and Story Idea matches later.
                </p>
              </div>
              <MultiSelectLinks
                helper="Optional Epic links for obvious alignment."
                onChange={(nextIds) => onChange({ ...journey, linkedEpicIds: nextIds })}
                options={availableEpics}
                selectedIds={journey.linkedEpicIds}
                title="Linked Epics"
              />
              <MultiSelectLinks
                helper="Optional Story Idea links for obvious alignment."
                onChange={(nextIds) => onChange({ ...journey, linkedStoryIdeaIds: nextIds })}
                options={availableStoryIdeas}
                selectedIds={journey.linkedStoryIdeaIds}
                title="Linked Story Ideas"
              />
              <MultiSelectLinks
                helper="Optional Figma or reference links when they already exist in this Framing package."
                onChange={(nextIds) => onChange({ ...journey, linkedFigmaRefs: nextIds })}
                options={availableFigmaRefs}
                selectedIds={journey.linkedFigmaRefs}
                title="Linked Figma / References"
              />
              {validation?.linkErrors.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {validation.linkErrors.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </details>

        {journey.coverage ? (
          <Card className="mt-6 border-border/70 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Coverage analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Coverage suggestions are AI-generated recommendations based on the Journey, its Steps, and the existing Epics and Story Ideas. Review before accepting.
              </p>
              <div className="flex flex-wrap gap-2">
                <CoverageBadge status={journey.coverage.status} />
              </div>
              {journey.coverage.suggestedEpicIds?.length ? (
                <p><span className="font-medium text-foreground">Suggested Epic IDs:</span> {journey.coverage.suggestedEpicIds.join(", ")}</p>
              ) : null}
              {journey.coverage.suggestedStoryIdeaIds?.length ? (
                <p><span className="font-medium text-foreground">Suggested Story Idea IDs:</span> {journey.coverage.suggestedStoryIdeaIds.join(", ")}</p>
              ) : null}
              {journey.coverage.suggestedNewStoryIdeas?.length ? (
                <div className="space-y-3">
                  <p className="font-medium text-foreground">Suggested new Story Ideas</p>
                  {journey.coverage.suggestedNewStoryIdeas.map((idea) => (
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={`${idea.title}-${idea.description}`}>
                      <p className="font-medium text-foreground">{idea.title}</p>
                      <p className="mt-1 text-muted-foreground">{idea.description}</p>
                      {idea.valueIntent ? <p className="mt-2"><span className="font-medium text-foreground">Value intent:</span> {idea.valueIntent}</p> : null}
                      {idea.expectedOutcome ? <p><span className="font-medium text-foreground">Expected outcome:</span> {idea.expectedOutcome}</p> : null}
                      {idea.confidence !== undefined ? <p><span className="font-medium text-foreground">Confidence:</span> {Math.round(idea.confidence * 100)}%</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}
              {journey.coverage.notes ? <p className="text-muted-foreground">{journey.coverage.notes}</p> : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </details>
  );
}
