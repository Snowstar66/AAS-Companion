import { AlertTriangle, Compass, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { FramingSummary } from "@aas-companion/api";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
import { ContextHelp } from "@/components/shared/context-help";
import { getHelpPattern } from "@/lib/help/aas-help";

type FramingRightRailProps = {
  summary: FramingSummary;
};

const notes = [
  {
    title: "Find the right outcome",
    detail: "Search and status filters keep Demo and newly created outcomes manageable.",
    icon: Compass
  },
  {
    title: "Spot blocked work fast",
    detail: "Blocked outcomes are visually marked so Tollgate 1 readiness issues stay obvious.",
    icon: AlertTriangle
  },
  {
    title: "Start new framing",
    detail: "Create a draft outcome from the cockpit without widening into later project detail work.",
    icon: Plus
  }
];

export function FramingRightRail({ summary }: FramingRightRailProps) {
  const framingHelp = getHelpPattern("framing.handshake");

  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Active framing posture</CardTitle>
          <CardDescription>Compact readout for the current project's cockpit state.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          <ActionSummaryCard
            actionHref={summary.total > 0 ? "/framing?origin=all&readiness=all" : undefined}
            actionLabel="Open all outcomes"
            className="border-border/70 bg-muted/30"
            description="All visible outcomes in the active project."
            label="Total"
            value={summary.total}
          />
          <ActionSummaryCard
            actionHref={summary.blocked > 0 ? "/framing?origin=all&readiness=blocked" : undefined}
            actionLabel="Open blocked outcomes"
            className="border-amber-200 bg-amber-50"
            description="Outcomes that still need framing cleanup."
            label="Blocked"
            value={summary.blocked}
          />
          <ActionSummaryCard
            actionHref={summary.ready > 0 ? "/framing?origin=all&readiness=ready" : undefined}
            actionLabel="Open ready outcomes"
            className="border-emerald-200 bg-emerald-50"
            description="Outcomes already ready for TG1."
            label="Ready"
            value={summary.ready}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.9))] shadow-sm">
        <CardHeader>
          <CardTitle>Handshake posture</CardTitle>
          <CardDescription>Use Framing to align the customer case before detailed design work begins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.map((note) => {
            const Icon = note.icon;

            return (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4" key={note.title}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="font-medium">{note.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.detail}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <ContextHelp pattern={framingHelp} summaryLabel="Open AAS-aligned framing help" />
    </aside>
  );
}
