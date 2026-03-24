import Link from "next/link";
import { ArrowRight, Compass, FolderKanban, Layers3, Sparkles } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { loadHomeDashboard } from "@/lib/home/dashboard";

function deriveProjectStatus(input: {
  dashboardState: "live" | "empty" | "unavailable";
  blockedCount: number;
  pendingCount: number;
  readyCount: number;
}) {
  if (input.dashboardState === "unavailable") {
    return {
      label: "Degraded",
      detail: "Project data is partially unavailable right now."
    };
  }

  if (input.dashboardState === "empty") {
    return {
      label: "Framing draft",
      detail: "The project is ready for a first clean case."
    };
  }

  if (input.blockedCount > 0) {
    return {
      label: "Not ready for build",
      detail: "Blocking framing or story issues still need attention."
    };
  }

  if (input.pendingCount > 0) {
    return {
      label: "Awaiting review",
      detail: "Review or follow-up actions are still open in this project."
    };
  }

  if (input.readyCount > 0) {
    return {
      label: "Design in progress",
      detail: "At least one branch is ready to continue deeper into delivery."
    };
  }

  return {
    label: "In progress",
    detail: "Work is active inside the current project."
  };
}

export default async function HomePage() {
  const { session, dashboard } = await loadHomeDashboard();
  const blockedCount = dashboard.summary.find((item) => item.label === "Blocked Items")?.value ?? "0";
  const readyCount = dashboard.summary.find((item) => item.label === "Stories Ready")?.value ?? "0";
  const status = deriveProjectStatus({
    dashboardState: dashboard.state,
    blockedCount: Number.parseInt(blockedCount, 10) || 0,
    pendingCount: dashboard.pendingActions.length,
    readyCount: Number.parseInt(readyCount, 10) || 0
  });
  const isDemoProject = session?.organization.organizationId === "org_demo_control_plane";
  const currentProjectName = session?.organization.organizationName ?? "Sign in to a project";
  const currentProjectDescription = session
    ? isDemoProject
      ? "Demo project for guided exploration. Open it intentionally when you want reference material."
      : "Current operational project. Return here to resume one active Framing case at a time."
    : "Choose a real project or enter Demo explicitly before operational work begins.";

  return (
    <AppShell
      rightRail={
        <aside className="space-y-4">
          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle>Project rules</CardTitle>
              <CardDescription>The product now defaults to one project and one active Framing case.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Home is the return point for choosing or resuming a project.</p>
              <p>Operational views stay isolated to the current project by default.</p>
              <p>Demo remains explicit and clearly separated from normal work.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle>Current project status</CardTitle>
              <CardDescription>High-level posture only, without leaking mixed operational lists.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="font-medium text-foreground">{status.label}</p>
                <p className="mt-2 leading-6">{status.detail}</p>
              </div>
              {dashboard.state !== "live" ? (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="font-medium text-foreground">Data note</p>
                  <p className="mt-2 leading-6">{dashboard.message}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      }
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Home",
        badge: "Project selector"
      }}
    >
      <section className="space-y-8">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.18),_transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                Project-first operating model
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Choose or resume work</h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Home is now the clear return point for the current project. Start a clean case, resume the active
                  Framing context, or open Demo only by explicit choice.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/90 px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current project</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{currentProjectName}</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{currentProjectDescription}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Resume current project
              </CardTitle>
              <CardDescription>
                Re-enter the active Framing context for the current project and continue from there.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{status.label}</p>
                <p className="mt-2 leading-6">{status.detail}</p>
              </div>
              <Button asChild className="gap-2">
                <Link href={session ? "/framing" : "/login?redirectTo=%2Fframing"}>
                  {session ? "Open current project" : "Sign in to a project"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-sky-50/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sky-950">
                <Layers3 className="h-4 w-4" />
                Start a new project
              </CardTitle>
              <CardDescription className="text-sky-900/80">
                Create fresh work inside the current project without importing or reopening Demo content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-sky-900/80">
                This is the default path for real customer work when you want a new active Framing case.
              </p>
              <Button asChild className="gap-2">
                <Link href={session ? "/framing" : "/login?redirectTo=%2Fframing"}>
                  Start from Framing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Open Demo explicitly
              </CardTitle>
              <CardDescription>
                Demo is separate, clearly labeled, and never the default path for normal project work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Use Demo only when you want a reference project with example governed content.
              </p>
              {!session ? (
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/login">
                    Choose Demo access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : isDemoProject ? (
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/framing">
                    Open Demo project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Demo access is selected intentionally at sign in rather than as a background project switch.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Project status at a glance</CardTitle>
            <CardDescription>Lightweight signals only, designed for choosing or resuming work instead of browsing mixed operational lists.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{isDemoProject ? "Demo" : "Current"}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Everything operational stays scoped here by default.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Framing</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{status.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.detail}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Review</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {dashboard.pendingActions.length > 0 ? "Awaiting review" : "No open review queue"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {dashboard.pendingActions.length > 0
                  ? `${dashboard.pendingActions.length} follow-up action(s) remain in the current project.`
                  : "No pending approval-readiness actions are currently surfaced."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Build posture</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {(Number.parseInt(blockedCount, 10) || 0) > 0 ? "Not ready for build" : "In progress"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {(Number.parseInt(blockedCount, 10) || 0) > 0
                  ? `${blockedCount} blocking issue(s) still need attention.`
                  : "No blocking issues are currently surfaced at project level."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
