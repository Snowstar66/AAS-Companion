"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import type { JourneyStep } from "@/lib/framing/journeyContextTypes";
import type { JourneyStepValidation } from "@/lib/framing/journey-context-ui";

type JourneyStepEditorProps = {
  step: JourneyStep;
  validation: JourneyStepValidation | undefined;
  isFirst: boolean;
  isLast: boolean;
  onChange: (nextStep: JourneyStep) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
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

export function JourneyStepEditor({
  step,
  validation,
  isFirst,
  isLast,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove
}: JourneyStepEditorProps) {
  const { language } = useAppChromeLanguage();
  return (
    <Card className="border-border/70 bg-background shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{step.title || t(language, "Untitled step", "Namnlöst steg")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t(language, "Optional detail for a larger handoff, decision, or break in the flow.", "Frivillig detalj för en större överlämning, ett beslut eller ett avbrott i flödet.")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onMoveUp} size="sm" type="button" variant="secondary" disabled={isFirst}>
            {t(language, "Move up", "Flytta upp")}
          </Button>
          <Button onClick={onMoveDown} size="sm" type="button" variant="secondary" disabled={isLast}>
            {t(language, "Move down", "Flytta ner")}
          </Button>
          <Button onClick={onRemove} size="sm" type="button" variant="secondary">
            {t(language, "Remove step", "Ta bort steg")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t(language, "Title", "Titel")}</span>
          <input
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, title: event.target.value })}
            type="text"
            value={step.title}
          />
          <FieldHint>{t(language, "Use a short action-oriented name for the step.", "Använd ett kort och handlingsorienterat namn på steget.")}</FieldHint>
          <FieldError>{validation?.title}</FieldError>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t(language, "Actor", "Aktör")}</span>
          <input
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, actor: event.target.value })}
            type="text"
            value={step.actor ?? ""}
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-foreground">{t(language, "Description", "Beskrivning")}</span>
          <textarea
            className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, description: event.target.value })}
            value={step.description}
          />
          <FieldHint>{t(language, "Describe what happens in this step in ordinary business or operational language.", "Beskriv vad som händer i steget med vanligt verksamhets- eller driftsspråk.")}</FieldHint>
          <FieldError>{validation?.description}</FieldError>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t(language, "Current pain", "Nuvarande problem")}</span>
          <textarea
            className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, currentPain: event.target.value })}
            value={step.currentPain ?? ""}
          />
          <FieldHint>{t(language, "Optional. Describe what is difficult specifically in this step.", "Frivilligt. Beskriv vad som är svårt just i detta steg.")}</FieldHint>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t(language, "Desired support", "Önskat stöd")}</span>
          <textarea
            className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, desiredSupport: event.target.value })}
            value={step.desiredSupport ?? ""}
          />
          <FieldHint>{t(language, "Optional. Describe what support would help in this step.", "Frivilligt. Beskriv vilket stöd som skulle hjälpa i detta steg.")}</FieldHint>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-sm md:col-span-2">
          <input
            checked={Boolean(step.decisionPoint)}
            className="mt-1 h-4 w-4"
            onChange={(event) => onChange({ ...step, decisionPoint: event.target.checked })}
            type="checkbox"
          />
          <span>
            <span className="block font-medium text-foreground">{t(language, "Decision point", "Beslutspunkt")}</span>
            <span className="mt-1 block text-muted-foreground">
              {t(language, "Turn this on when the step contains an important assessment, choice, approval, or branching point.", "Slå på när steget innehåller en viktig bedömning, ett val, ett godkännande eller en förgrening.")}
            </span>
          </span>
        </label>
      </CardContent>
    </Card>
  );
}
