"use client";

import type { ReactNode } from "react";
import { JourneyContextCard } from "@/components/framing/journey-context-card";
import type { JourneyContextValidation, JourneyReferenceOption } from "@/lib/framing/journey-context-ui";
import type { Journey, JourneyContext, JourneyStep } from "@/lib/framing/journeyContextTypes";

type JourneyContextSectionProps = {
  contexts: JourneyContext[];
  validations: Record<string, JourneyContextValidation>;
  availableEpics: JourneyReferenceOption[];
  availableStoryIdeas: JourneyReferenceOption[];
  availableFigmaRefs: JourneyReferenceOption[];
  focusedJourneyId: string | null;
  onChangeContext: (contextId: string, nextContext: JourneyContext) => void;
  onDeleteContext: (contextId: string) => void;
  onAddJourney: (contextId: string) => void;
  onFocusJourney: (journeyId: string) => void;
  onUpdateJourney: (contextId: string, journeyId: string, updater: (journey: Journey) => Journey) => void;
  onRemoveJourney: (contextId: string, journeyId: string) => void;
  onAddStep: (contextId: string, journeyId: string) => void;
  onUpdateStep: (
    contextId: string,
    journeyId: string,
    stepId: string,
    updater: (step: JourneyStep) => JourneyStep
  ) => void;
  onMoveStep: (contextId: string, journeyId: string, stepId: string, direction: "up" | "down") => void;
  onRemoveStep: (contextId: string, journeyId: string, stepId: string) => void;
  renderAnalyzeAction: (context: JourneyContext) => ReactNode;
  renderJourneyAssistant?: (journey: Journey) => ReactNode;
};

export function JourneyContextSection({
  contexts,
  validations,
  availableEpics,
  availableStoryIdeas,
  availableFigmaRefs,
  focusedJourneyId,
  onChangeContext,
  onDeleteContext,
  onAddJourney,
  onFocusJourney,
  onUpdateJourney,
  onRemoveJourney,
  onAddStep,
  onUpdateStep,
  onMoveStep,
  onRemoveStep,
  renderAnalyzeAction,
  renderJourneyAssistant
}: JourneyContextSectionProps) {
  return (
    <div className="space-y-5">
      {contexts.map((context) => (
        <JourneyContextCard
          analyzeAction={renderAnalyzeAction(context)}
          availableEpics={availableEpics}
          availableFigmaRefs={availableFigmaRefs}
          availableStoryIdeas={availableStoryIdeas}
          context={context}
          focusedJourneyId={focusedJourneyId}
          key={context.id}
          onAddJourney={() => onAddJourney(context.id)}
          onAddStep={(journeyId) => onAddStep(context.id, journeyId)}
          onChange={(nextContext) => onChangeContext(context.id, nextContext)}
          onDelete={() => onDeleteContext(context.id)}
          onFocusJourney={onFocusJourney}
          onMoveStep={(journeyId, stepId, direction) => onMoveStep(context.id, journeyId, stepId, direction)}
          onRemoveJourney={(journeyId) => onRemoveJourney(context.id, journeyId)}
          onRemoveStep={(journeyId, stepId) => onRemoveStep(context.id, journeyId, stepId)}
          onUpdateJourney={(journeyId, updater) => onUpdateJourney(context.id, journeyId, updater)}
          onUpdateStep={(journeyId, stepId, updater) => onUpdateStep(context.id, journeyId, stepId, updater)}
          validation={validations[context.id]}
          {...(renderJourneyAssistant ? { renderJourneyAssistant } : {})}
        />
      ))}
    </div>
  );
}
