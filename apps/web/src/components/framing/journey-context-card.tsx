"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
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

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
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
  onRemoveStep,
}: JourneyContextCardProps) {
  const { language } = useAppChromeLanguage();
  const coverageLabel = getCoverageSummaryLabel(context);
  const [isOpen, setIsOpen] = useState(true);
  const [showSharedNote, setShowSharedNote] = useState(false);

  return (
    <details
      className="group rounded-[28px] border border-border/70 bg-background shadow-sm"
      onToggle={(event) => setIsOpen((event.currentTarget as HTMLDetailsElement).open)}
      open={isOpen}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              {context.initiativeType}
            </span>
            <span className="rounded-full border border-border/70 bg-muted/15 px-3 py-1 text-xs font-medium text-muted-foreground">
              {context.journeys.length} {t(language, context.journeys.length === 1 ? "journey" : "journeys", context.journeys.length === 1 ? "journey" : "journeys")}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{t(language, "Journeys", "Journeys")}</p>
            <p className="text-sm text-muted-foreground">
              {t(language, "Put the value in the journeys below. Only add another when it describes a meaningfully different flow.", "Lägg värdet i journeys nedanför. Lägg bara till en till när den beskriver ett meningsfullt annorlunda flöde.")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{coverageLabel}</p>
          </div>
        </div>
        <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          {isOpen ? t(language, "Hide", "Dölj") : t(language, "Show", "Visa")}
        </span>
      </summary>

      <div className="border-t border-border/70 px-5 py-5">
        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t(language, "Start with one broad journey. Add another only when it helps explain a different actor flow, handoff, or operational situation.", "Börja med en bred journey. Lägg till en till bara när den hjälper till att förklara ett annat aktörsflöde, en annan överlämning eller en annan operativ situation.")}
          </p>
          <FieldError>{validation?.journeysSummary}</FieldError>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={onAddJourney} type="button">{t(language, "Add journey", "Lägg till journey")}</Button>
            {analyzeAction}
            <Button onClick={onDelete} type="button" variant="secondary">
              {t(language, "Clear journeys", "Rensa journeys")}
            </Button>
          </div>
        </div>

        <details
          className="mt-4 rounded-[24px] border border-border/70 bg-muted/10"
          onToggle={(event) => setShowSharedNote((event.currentTarget as HTMLDetailsElement).open)}
          open={showSharedNote}
        >
          <summary className="cursor-pointer list-none px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">{t(language, "Optional shared note", "Frivillig gemensam notering")}</p>
                <p className="text-sm text-muted-foreground">{t(language, "Use this only if all journeys together need one short shared note.", "Använd detta bara om alla journeys tillsammans behöver en kort gemensam notering.")}</p>
              </div>
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {showSharedNote ? t(language, "Hide", "Dölj") : t(language, "Show", "Visa")}
              </span>
            </div>
          </summary>
          <div className="border-t border-border/70 px-4 py-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "Shared note", "Gemensam notering")}</span>
              <textarea
                className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                onChange={(event) => onChange({ ...context, notes: event.target.value })}
                value={context.notes ?? ""}
              />
              <FieldHint>{t(language, "Optional. In most cases this can stay empty and let the journeys speak for themselves.", "Frivilligt. I de flesta fall kan detta lämnas tomt och låta journeys tala för sig själva.")}</FieldHint>
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

