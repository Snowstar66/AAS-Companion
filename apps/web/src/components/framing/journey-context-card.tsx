"use client";

import type { ReactNode } from "react";
import { Button } from "@aas-companion/ui";
import { JourneyCard } from "@/components/framing/journey-card";
import { getCoverageSummaryLabel, type JourneyContextValidation, type JourneyReferenceOption } from "@/lib/framing/journey-context-ui";
import type { Journey, JourneyContext } from "@/lib/framing/journeyContextTypes";

type JourneyContextCardProps = {
  context: JourneyContext;
  validation: JourneyContextValidation | undefined;
  availableEpics: JourneyReferenceOption[];
  availableStoryIdeas: JourneyReferenceOption[];
  availableFigmaRefs: JourneyReferenceOption[];
  analyzeAction: ReactNode;
  focusedJourneyId: string | null;
  onChange: (nextContext: JourneyContext) => void;
  onDelete: () => void;
  onAddJourney: () => void;
  onFocusJourney: ((journeyId: string) => void) | undefined;
  onUpdateJourney: (journeyId: string, updater: (journey: Journey) => Journey) => void;
  onRemoveJourney: (journeyId: string) => void;
  onAddStep: (journeyId: string) => void;
  onUpdateStep: (journeyId: string, stepId: string, updater: (step: Journey["steps"][number]) => Journey["steps"][number]) => void;
  onMoveStep: (journeyId: string, stepId: string, direction: "up" | "down") => void;
  onRemoveStep: (journeyId: string, stepId: string) => void;
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

export function JourneyContextCard({
  context,
  validation,
  availableEpics,
  availableStoryIdeas,
  availableFigmaRefs,
  analyzeAction,
  focusedJourneyId,
  onChange,
  onDelete,
  onAddJourney,
  onFocusJourney,
  onUpdateJourney,
  onRemoveJourney,
  onAddStep,
  onUpdateStep,
  onMoveStep,
  onRemoveStep
}: JourneyContextCardProps) {
  const coverageLabel = getCoverageSummaryLabel(context);

  return (
    <details className="group rounded-[28px] border border-border/70 bg-background shadow-sm" open>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              {context.initiativeType}
            </span>
            <span className="rounded-full border border-border/70 bg-muted/15 px-3 py-1 text-xs font-medium text-muted-foreground">
              {context.journeys.length} journey{context.journeys.length === 1 ? "" : "s"}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Journeys</p>
            <p className="text-sm text-muted-foreground">
              Put the value in the journeys below. Add another one only when it describes a meaningfully different flow.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{coverageLabel}</p>
          </div>
        </div>
      </summary>

      <div className="border-t border-border/70 px-5 py-5">
        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Start with one broad journey. Add another only when it helps explain a different actor flow, handoff, or operational situation.
          </p>
          <FieldError>{validation?.journeysSummary}</FieldError>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={onAddJourney} type="button">Add Journey</Button>
            {analyzeAction}
            <Button onClick={onDelete} type="button" variant="secondary">
              Clear Journeys
            </Button>
          </div>
        </div>

        <details className="mt-4 rounded-[24px] border border-border/70 bg-muted/10">
          <summary className="cursor-pointer list-none px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">Optional shared note</p>
                <p className="text-sm text-muted-foreground">Only use this if all journeys together need one short shared note.</p>
              </div>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                Expand
              </span>
            </div>
          </summary>
          <div className="border-t border-border/70 px-4 py-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Shared note</span>
              <textarea
                className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                onChange={(event) => onChange({ ...context, notes: event.target.value })}
                value={context.notes ?? ""}
              />
              <FieldHint>Optional. Most cases can leave this empty and let the Journeys speak for themselves.</FieldHint>
            </label>
          </div>
        </details>

        <div className="mt-6 space-y-4">
          {context.journeys.map((journey) => (
            <JourneyCard
              availableEpics={availableEpics}
              availableFigmaRefs={availableFigmaRefs}
              availableStoryIdeas={availableStoryIdeas}
              isFocused={focusedJourneyId === journey.id}
              journey={journey}
              key={journey.id}
              onAddStep={() => onAddStep(journey.id)}
              onChange={(nextJourney) => onUpdateJourney(journey.id, () => nextJourney)}
              onFocus={onFocusJourney ? () => onFocusJourney(journey.id) : undefined}
              onMoveStep={(stepId, direction) => onMoveStep(journey.id, stepId, direction)}
              onRemove={() => onRemoveJourney(journey.id)}
              onRemoveStep={(stepId) => onRemoveStep(journey.id, stepId)}
              onUpdateStep={(stepId, updater) => onUpdateStep(journey.id, stepId, updater)}
              validation={validation?.journeys[journey.id]}
            />
          ))}
        </div>
      </div>
    </details>
  );
}
