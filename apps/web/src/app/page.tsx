import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { HomeActivityCard } from "@/components/home/home-activity-card";
import { HomeAnalytics } from "@/components/home/home-analytics";
import { HomeEmptyState } from "@/components/home/home-empty-state";
import { HomeListCard } from "@/components/home/home-list-card";
import { HomeRightRail } from "@/components/home/home-right-rail";
import { HomeStatusGrid } from "@/components/home/home-status-grid";
import { HomeSummaryCards } from "@/components/home/home-summary-cards";
import { loadHomeDashboard } from "@/lib/home/dashboard";

export default async function HomePage() {
  const { session, dashboard } = await loadHomeDashboard();

  const heroBadge =
    dashboard.state === "live"
      ? "Live seeded data"
      : dashboard.state === "empty"
        ? "Waiting for seed data"
        : "Degraded data mode";

  const heroCopy =
    dashboard.state === "live"
      ? "Operational overview for the current organization, built from real M1 seed records."
      : dashboard.message;

  return (
    <AppShell
      rightRail={
        <HomeRightRail
          blockers={dashboard.rightRail.blockers}
          nextActions={dashboard.rightRail.nextActions}
        />
      }
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Home Dashboard",
        badge: "Story M1-004"
      }}
    >
      <HomeAnalytics organizationName={dashboard.organizationName} />
      <section className="space-y-8">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.18),_transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {heroBadge}
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Home Dashboard</h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{heroCopy}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2">
                <Link href={session ? "/workspace" : "/login"}>
                  {session ? "Open Workspace" : "Start Demo Access"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {dashboard.summary.length > 0 ? <HomeSummaryCards items={dashboard.summary} /> : null}

        {dashboard.state !== "live" ? (
          <HomeEmptyState
            description={dashboard.message}
            title={dashboard.state === "empty" ? "Dashboard is ready for data" : "Dashboard is in degraded mode"}
          />
        ) : (
          <>
            <HomeStatusGrid items={dashboard.outcomesByStatus} />

            <div className="grid gap-5 xl:grid-cols-2">
              <HomeListCard
                description="The most urgent blockers across tollgates and story readiness."
                emptyMessage="No blockers are currently visible."
                items={dashboard.topBlockers}
                title="Top blockers"
              />
              <HomeListCard
                description="Pending tollgate and readiness actions requiring follow-up."
                emptyMessage="No pending actions are currently queued."
                items={dashboard.pendingActions}
                title="Pending actions"
              />
            </div>

            <HomeActivityCard items={dashboard.recentActivity} />
          </>
        )}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Current scope note</CardTitle>
            <CardDescription>M1-STORY-004 delivers the Home dashboard only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Outcome, Story, and execution flows remain separate stories and are not silently widened here.</p>
            <p>The dashboard tolerates missing or partial data and surfaces that state explicitly to reviewers.</p>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
