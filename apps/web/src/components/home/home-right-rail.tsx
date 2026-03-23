import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { HomeBlocker, HomePendingAction } from "@aas-companion/api";

type HomeRightRailProps = {
  blockers: HomeBlocker[];
  nextActions: HomePendingAction[];
};

export function HomeRightRail({ blockers, nextActions }: HomeRightRailProps) {
  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Top blockers</CardTitle>
          <CardDescription>The most important blockers visible from the current seed state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
              No blockers are currently surfaced.
            </div>
          ) : null}
          {blockers.map((item) => (
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item.id}>
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Next actions</CardTitle>
          <CardDescription>Immediate follow-ups for the value owner and delivery roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextActions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
              No pending actions are currently queued.
            </div>
          ) : null}
          {nextActions.map((item) => (
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item.id}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div className="space-y-2">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  {item.href ? (
                    <Link className="inline-flex items-center gap-1 text-sm font-medium text-primary" href={item.href}>
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
