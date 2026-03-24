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
          <CardTitle>Framing summary</CardTitle>
          <CardDescription>Current outcome posture for the active organization context.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
          <div className="rounded-3xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Total outcomes</p>
            <p className="mt-3 text-3xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Blocked</p>
            <p className="mt-3 text-2xl font-semibold">{summary.blocked}</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Ready for TG1</p>
            <p className="mt-3 flex items-center gap-2 text-2xl font-semibold">
              <CircleCheckBig className="h-5 w-5" />
              {summary.ready}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Cockpit notes</CardTitle>
          <CardDescription>M1-STORY-005 keeps the framing entry point clear and narrow.</CardDescription>
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
