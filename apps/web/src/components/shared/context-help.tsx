import { ChevronDown, CircleHelp } from "lucide-react";
import { Card, CardContent } from "@aas-companion/ui";
import type { HelpPattern } from "@/lib/help/aas-help";

type ContextHelpProps = {
  pattern: HelpPattern & { aiLevelNote?: string | null };
  className?: string | undefined;
  summaryLabel?: string | undefined;
  defaultOpen?: boolean | undefined;
};

export function ContextHelp({ pattern, className, summaryLabel = "Open help", defaultOpen = false }: ContextHelpProps) {
  return (
    <details
      className={`group rounded-2xl border border-border/70 bg-background/85 shadow-sm ${className ?? ""}`}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-border/70 bg-muted/30 p-2">
            <CircleHelp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{pattern.title}</p>
            <p className="text-sm text-muted-foreground">{summaryLabel}</p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="space-y-4 px-4 pb-4 pt-0 text-sm text-muted-foreground">
          <p className="leading-6">{pattern.summary}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">What this is for</p>
              <p className="mt-2 leading-6">{pattern.purpose}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">What belongs here</p>
              <p className="mt-2 leading-6">{pattern.belongs}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">What to avoid</p>
              <p className="mt-2 leading-6">{pattern.avoid}</p>
            </div>
          </div>
          {pattern.aiLevelNote ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sky-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">AI-level note</p>
              <p className="mt-2 leading-6">{pattern.aiLevelNote}</p>
            </div>
          ) : null}
          {pattern.nextStep ? (
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Next step</p>
              <p className="mt-2 leading-6">{pattern.nextStep}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </details>
  );
}

export function InlineFieldGuidance({ guidance }: { guidance: string }) {
  return <p className="framing-inline-guidance text-sm leading-6 text-muted-foreground">{guidance}</p>;
}
