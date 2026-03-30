import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Clock3,
  FolderKanban,
  FolderOpen,
  GitBranch,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import {
  clearActiveProjectAction,
  createProjectAction,
  deleteCurrentProjectAction,
  openDemoProjectAction,
  openProjectAction
} from "@/app/project-actions";
import { ViewerSessionProvider } from "@/components/auth/viewer-session-provider";
import { HomeActivityCard } from "@/components/home/home-activity-card";
import { AppShell } from "@/components/layout/app-shell";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { loadHomeDashboard } from "@/lib/home/dashboard";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function deriveProjectStatus(input: {
  hasActiveProject: boolean;
  dashboardState: "live" | "empty" | "unavailable";
  blockedCount: number;
  pendingCount: number;
  readyCount: number;
}) {
  if (!input.hasActiveProject) {
    return {
      label: "No active project",
      detail: "Choose an existing project, create one, or open Demo explicitly before entering operational work."
    };
  }

  if (input.dashboardState === "unavailable") {
    return {
      label: "Degraded",
      detail: "Project data is partially unavailable right now."
    };
  }

  if (input.dashboardState === "empty") {
    return {
      label: "Ready to begin",
      detail: "This project is active but still has no Framing case."
    };
  }

  if (input.blockedCount > 0) {
    return {
      label: "Needs attention",
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
      label: "Ready to move",
      detail: "At least one branch is ready to continue deeper into delivery."
    };
  }

  return {
    label: "In progress",
    detail: "Work is active inside the current project."
  };
}

function MetricCard(props: {
  label: string;
  value: number;
  description: string;
  className: string;
  href?: string | undefined;
  actionLabel?: string | undefined;
  icon: typeof FolderKanban;
}) {
  const Icon = props.icon;

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${props.className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{props.label}</p>
        <Icon className="h-4 w-4 opacity-80" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{props.value}</p>
      <p className="mt-2 text-sm leading-6 opacity-90">{props.description}</p>
      {props.href && props.actionLabel ? (
        <Button asChild className="mt-4 gap-2" size="sm" variant="secondary">
          <Link href={props.href}>
            {props.actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function attentionTone(kind: "blocker" | "pending") {
  if (kind === "blocker") {
    return "border-rose-200/80 bg-rose-50/70";
  }

  return "border-amber-200/80 bg-amber-50/70";
}

function CompactProjectCount(props: { label: string; value: number | string }) {
  return (
    <div className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <span className="uppercase tracking-[0.18em]">{props.label}</span>
      <span className="ml-2 font-semibold text-foreground">{props.value}</span>
    </div>
  );
}

function ProjectToneCard(props: {
  active?: boolean | undefined;
  title: string;
  slug: string;
  counts: {
    outcomes: number;
    epics: number;
    stories: number;
    activityEvents: number;
  };
  organizationId: string;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm transition ${
        props.active
          ? "border-sky-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(255,255,255,0.98))]"
          : "border-border/70 bg-background/95"
      }`}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-foreground">{props.title}</p>
            {props.active ? (
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                Current project
              </span>
            ) : null}
            <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {props.slug}
            </span>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {props.active
              ? "This project is already active. Continue straight back into its current Framing and operational work."
              : "Open this project to scope the dashboard, Framing, Value Spine, Import and Review to this branch of work."}
          </p>
          <div className="flex flex-wrap gap-2">
            <CompactProjectCount label="Outcomes" value={props.counts.outcomes} />
            <CompactProjectCount label="Epics" value={props.counts.epics} />
            <CompactProjectCount label="Stories" value={props.counts.stories} />
            <CompactProjectCount label="Events" value={props.counts.activityEvents} />
          </div>
        </div>
        <form action={openProjectAction} className="lg:min-w-[170px]">
          <input name="organizationId" type="hidden" value={props.organizationId} />
          <PendingFormButton
            className="w-full gap-2"
            label={props.active ? "Continue in project" : "Open project"}
            pendingLabel={props.active ? "Opening project..." : "Opening project..."}
            size="sm"
            variant={props.active ? "default" : "secondary"}
          />
        </form>
      </div>
    </div>
  );
}

function getSummaryMetricValue(summary: Array<{ label: string; value: string }>, label: string) {
  return Number.parseInt(summary.find((item) => item.label === label)?.value ?? "0", 10) || 0;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = searchParams ? await searchParams : {};
  const {
    session,
    dashboard,
    projects,
    activeProject,
    hasAuthenticatedUser,
    canManageProjects,
    isDemoSession
  } = await loadHomeDashboard();

  const flashError = getParamValue(query.error);
  const flashMessage = getParamValue(query.message);
  const readyStoriesMetric = getSummaryMetricValue(dashboard.summary, "Stories Ready");
  const recentEventsMetric = getSummaryMetricValue(dashboard.summary, "Recent Events");
  const blockedCount = dashboard.topBlockers.length;
  const pendingCount = dashboard.pendingActions.length;
  const hasActiveProject = Boolean(activeProject?.organizationId);
  const status = deriveProjectStatus({
    hasActiveProject,
    dashboardState: dashboard.state,
    blockedCount,
    pendingCount,
    readyCount: readyStoriesMetric
  });
  const currentProjectName = activeProject?.organizationName ?? "No active project selected";
  const currentProjectDescription = hasActiveProject
    ? isDemoSession
      ? "Demo stays isolated and only appears because it was chosen explicitly."
      : "Only this project's Framing, Value Spine, Import and Review records are visible here."
    : hasAuthenticatedUser
      ? "You are signed in, but no operational project is active until you select or create one."
      : "Sign in, then choose an existing project, create a new one, or enter Demo explicitly.";
  const quickLinks = [
    { href: "/framing", label: "Open Framing", icon: FolderKanban },
    { href: "/workspace", label: "Open Value Spine", icon: GitBranch },
    { href: "/review", label: "Open Review", icon: ShieldCheck },
    { href: "/intake", label: "Open Import", icon: ClipboardList }
  ];
  const activeProjectSummary = projects.find((project) => project.isActive) ?? null;
  const managedProjectCount = projects.length;

  return (
    <ViewerSessionProvider session={session}>
      <AppShell
        {...(activeProject?.organizationName ? { activeProjectName: activeProject.organizationName } : {})}
        hideRightRail
        topbarProps={{
          eyebrow: "AAS Companion",
          title: "Home",
          badge: "Dashboard"
        }}
      >
        <section className="space-y-8">
          <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.18),_transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <FolderKanban className="h-3.5 w-3.5 text-primary" />
                  {hasActiveProject ? "Project dashboard" : "Project access"}
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    {hasActiveProject ? "Project dashboard" : "Choose how to enter work"}
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                    {hasActiveProject
                      ? "This screen should tell you what matters now: current posture, blockers, pending work, recent movement and the fastest route back into the right part of the project."
                      : "Open an existing project, create a new one, or open Demo explicitly. Operational views stay empty until you choose a project on purpose."}
                  </p>
                </div>

                {hasActiveProject ? (
                  <div className="flex flex-wrap gap-3">
                    {quickLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Button asChild className="gap-2" key={item.href} variant="secondary">
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current project</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{currentProjectName}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentProjectDescription}</p>
                {hasActiveProject ? (
                  <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Current phase</p>
                    <p className="mt-2 text-lg font-semibold text-sky-950">{dashboard.projectPhase.label}</p>
                    <p className="mt-2 text-sm leading-6 text-sky-900">{dashboard.projectPhase.detail}</p>
                  </div>
                ) : null}
                <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current posture</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{status.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.detail}</p>
                </div>
                {dashboard.state !== "live" && dashboard.message ? (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {dashboard.message}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {flashError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flashError}</div>
          ) : null}
          {flashMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {flashMessage}
            </div>
          ) : null}

          {hasActiveProject ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  actionLabel={readyStoriesMetric > 0 ? "Open ready stories" : undefined}
                  className="border-emerald-200 bg-emerald-50/75 text-emerald-950"
                  description="Stories that can move toward handoff or delivery."
                  href={readyStoriesMetric > 0 ? "/stories?state=ready" : undefined}
                  icon={GitBranch}
                  label="Ready stories"
                  value={readyStoriesMetric}
                />
                <MetricCard
                  actionLabel={blockedCount > 0 ? "Open blockers" : undefined}
                  className="border-rose-200 bg-rose-50/75 text-rose-950"
                  description="Framing or Story gaps currently blocking progress."
                  href={dashboard.topBlockers[0]?.href}
                  icon={AlertTriangle}
                  label="Open blockers"
                  value={blockedCount}
                />
                <MetricCard
                  actionLabel={pendingCount > 0 ? "Open pending work" : undefined}
                  className="border-amber-200 bg-amber-50/75 text-amber-950"
                  description="Review or follow-up items still waiting for human action."
                  href={dashboard.pendingActions[0]?.href}
                  icon={Clock3}
                  label="Pending work"
                  value={pendingCount}
                />
                <MetricCard
                  actionLabel={recentEventsMetric > 0 ? "Open project activity" : undefined}
                  className="border-border/70 bg-background/90 text-foreground"
                  description="Recent movement visible in the active project trail."
                  href={recentEventsMetric > 0 ? "/workspace" : undefined}
                  icon={ClipboardList}
                  label="Recent events"
                  value={recentEventsMetric}
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <Card className="border-border/70 shadow-sm">
                  <CardHeader>
                    <CardTitle>Needs attention</CardTitle>
                    <CardDescription>The clearest blockers and pending items in the active project.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...dashboard.topBlockers.slice(0, 3), ...dashboard.pendingActions.slice(0, 3)].length > 0 ? (
                      [
                        ...dashboard.topBlockers.slice(0, 3).map((item) => ({ ...item, attentionKind: "blocker" as const })),
                        ...dashboard.pendingActions.slice(0, 3).map((item) => ({ ...item, attentionKind: "pending" as const }))
                      ].map((item) => (
                        <div className={`rounded-2xl border p-4 ${attentionTone(item.attentionKind)}`} key={item.id}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                            </div>
                            {item.href ? (
                              <Button asChild className="gap-2" size="sm" variant="secondary">
                                <Link href={item.href}>
                                  Open
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                        No active blockers or pending review items are currently surfaced.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-5">
                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Project pulse</CardTitle>
                      <CardDescription>Compact project facts that are still useful at a glance.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Active project</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{currentProjectName}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Stories ready</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{readyStoriesMetric}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Blocked items</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{blockedCount}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pending actions</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{pendingCount}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <HomeActivityCard
                    defaultOpen={false}
                    description="Latest append-only project events."
                    emptyMessage="No recent project activity is available yet."
                    items={dashboard.recentActivity.slice(0, 4)}
                  />
                </div>
              </div>
            </>
          ) : (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Dashboard will light up when a project is active</CardTitle>
                <CardDescription>
                  Until then, blockers, review queues, Value Spine and handoff status stay intentionally empty.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Framing</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">Inactive</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Review</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">Inactive</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Delivery</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">Inactive</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/70 shadow-sm" id="project-list">
            <CardHeader>
              <CardTitle>Project access</CardTitle>
              <CardDescription>
                Open, create, switch, leave or remove projects from one place without taking over the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Available projects</p>
                  <CompactProjectCount label="Projects" value={managedProjectCount} />
                  <CompactProjectCount label="Active" value={hasActiveProject ? currentProjectName : "None"} />
                  <CompactProjectCount label="Mode" value={isDemoSession ? "Demo" : "Normal"} />
                </div>
                {!canManageProjects ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                    {isDemoSession
                      ? "Sign in with your account to manage normal projects, or leave Demo to return to a clean Home."
                      : "Sign in first to choose a normal project or create a new one. The sign-in page lets you pick direct sign-in, email login, or Demo when available."}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">No normal projects exist yet.</p>
                    <p className="mt-2">Create the first project here, or open Demo explicitly if you need reference material.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <ProjectToneCard
                        active={project.isActive}
                        counts={project.counts}
                        key={project.organizationId}
                        organizationId={project.organizationId}
                        slug={project.organizationSlug}
                        title={project.organizationName}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/92 shadow-sm">
                  <div className="border-b border-border/70 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project tools</p>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-sky-900" />
                        <p className="font-semibold text-sky-950">Create project</p>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Start a brand-new isolated project with its own local numbering and empty operational state.
                      </p>
                      {canManageProjects ? (
                        <form action={createProjectAction} className="flex flex-col gap-3 sm:flex-row">
                          <input
                            className="h-11 min-w-0 flex-1 rounded-2xl border border-sky-200 bg-background px-4 text-sm outline-none transition focus:border-primary"
                            name="projectName"
                            placeholder="New project name"
                            type="text"
                          />
                          <Button className="gap-2 sm:shrink-0" type="submit">
                            Create and open project
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </form>
                      ) : (
                        <Button asChild className="gap-2">
                          <Link href="/login?redirectTo=%2F">
                            Open sign-in options
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-foreground">Demo access</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Demo remains separate from normal projects and opens only when chosen explicitly.
                        </p>
                        {hasAuthenticatedUser ? (
                          <form action={openDemoProjectAction} className="mt-4">
                            <Button className="gap-2 w-full" type="submit" variant="secondary">
                              {isDemoSession ? "Re-open demo project" : "Open demo project"}
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </form>
                        ) : (
                          <Button asChild className="mt-4 gap-2 w-full" variant="secondary">
                            <Link href="/login">
                              Choose demo access
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-foreground">Current project controls</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {isDemoSession
                            ? "Leave Demo to return to a clean Home without an active project."
                            : "Leave or delete the current project when you intentionally want to reset active context."}
                        </p>
                        {(hasActiveProject || isDemoSession) ? (
                          <div className="mt-4 flex flex-wrap gap-3">
                            <form action={clearActiveProjectAction}>
                              <Button className="gap-2" type="submit" variant="secondary">
                                <LogOut className="h-4 w-4" />
                                {isDemoSession ? "Leave demo project" : "Leave current project"}
                              </Button>
                            </form>
                            {hasActiveProject && !isDemoSession ? (
                              <form action={deleteCurrentProjectAction}>
                                <Button className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95" type="submit">
                                  <Trash2 className="h-4 w-4" />
                                  Delete project
                                </Button>
                              </form>
                            ) : null}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">No active project controls are needed until a project is open.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Active project snapshot</p>
                        {activeProjectSummary ? (
                          <>
                            <CompactProjectCount label="Outcomes" value={activeProjectSummary.counts.outcomes} />
                            <CompactProjectCount label="Stories" value={activeProjectSummary.counts.stories} />
                            <CompactProjectCount label="Epics" value={activeProjectSummary.counts.epics} />
                          </>
                        ) : (
                          <CompactProjectCount label="Status" value={hasActiveProject ? "Scoped" : "No active project"} />
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {activeProjectSummary
                          ? "The dashboard is already scoped to this project, so these counts stay close to the access controls instead of taking over the main dashboard."
                          : hasActiveProject
                            ? "The dashboard is already scoped to the active project even when the project list is empty, for example in Demo or in a freshly selected project."
                            : "When a project becomes active, this panel turns into a compact snapshot instead of another landing page."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </AppShell>
    </ViewerSessionProvider>
  );
}
