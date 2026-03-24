import { AlertTriangle, CircleCheckBig, Compass, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { FramingSummary } from "@aas-companion/api";

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
  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Active framing posture</CardTitle>
          <CardDescription>Compact readout for the current project's cockpit state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            {summary.total} outcome{summary.total === 1 ? "" : "s"} are currently visible in this project. {summary.blocked} still need framing cleanup and {summary.ready} are already ready for TG1.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
              Total {summary.total}
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              Blocked {summary.blocked}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <CircleCheckBig className="h-3.5 w-3.5" />
              Ready {summary.ready}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.9))] shadow-sm">
        <CardHeader>
          <CardTitle>Working posture</CardTitle>
          <CardDescription>Use the cockpit to choose the right case before going deeper into outcome detail.</CardDescription>
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
    </aside>
  );
}
