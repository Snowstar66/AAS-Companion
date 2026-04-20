"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@aas-companion/ui";
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
  return (
    <Card className="border-border/70 bg-background shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{step.title || "Untitled step"}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Optional detail for a major handoff, decision, or break in flow.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onMoveUp} size="sm" type="button" variant="secondary" disabled={isFirst}>
            Move up
          </Button>
          <Button onClick={onMoveDown} size="sm" type="button" variant="secondary" disabled={isLast}>
            Move down
          </Button>
          <Button onClick={onRemove} size="sm" type="button" variant="secondary">
            Remove Step
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Title</span>
          <input
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, title: event.target.value })}
            type="text"
            value={step.title}
          />
          <FieldHint>Use a short action-oriented step name.</FieldHint>
          <FieldError>{validation?.title}</FieldError>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Actor</span>
          <input
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, actor: event.target.value })}
            type="text"
            value={step.actor ?? ""}
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-foreground">Description</span>
          <textarea
            className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, description: event.target.value })}
            value={step.description}
          />
          <FieldHint>Describe what happens in this step in plain business or operational language.</FieldHint>
          <FieldError>{validation?.description}</FieldError>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Current Pain</span>
          <textarea
            className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, currentPain: event.target.value })}
            value={step.currentPain ?? ""}
          />
          <FieldHint>Optional. Describe the difficulty in this step specifically.</FieldHint>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Desired Support</span>
          <textarea
            className="min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            onChange={(event) => onChange({ ...step, desiredSupport: event.target.value })}
            value={step.desiredSupport ?? ""}
          />
          <FieldHint>Optional. Describe what support would help in this step.</FieldHint>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-sm md:col-span-2">
          <input
            checked={Boolean(step.decisionPoint)}
            className="mt-1 h-4 w-4"
            onChange={(event) => onChange({ ...step, decisionPoint: event.target.checked })}
            type="checkbox"
          />
          <span>
            <span className="block font-medium text-foreground">Decision Point</span>
            <span className="mt-1 block text-muted-foreground">
              Turn on when this step contains an important assessment, choice, approval, or branch.
            </span>
          </span>
        </label>
      </CardContent>
    </Card>
  );
}
