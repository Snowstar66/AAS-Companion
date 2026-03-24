import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
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
import { AppShell } from "@/components/layout/app-shell";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
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

function getSummaryAction(input: { label: string; value: string }) {
  const numericValue = Number.parseInt(input.value, 10) || 0;

  if (input.label === "Outcomes" && numericValue > 0) {
    return {
      href: "/framing?origin=all",
      label: "Open Framing"
    };
  }

  if (input.label === "Stories Ready" && numericValue > 0) {
    return {
      href: "/stories?state=ready",
      label: "Open ready stories"
    };
  }

  if (input.label === "Blocked Items" && numericValue > 0) {
    return {
      href: "/stories?state=blocked",
      label: "Open blocked stories"
    };
  }

  return null;
}

function summaryTone(label: string) {
  if (label === "Blocked Items") {
    return "border-rose-200/80 bg-rose-50/70";
  }

  if (label === "Stories Ready") {
    return "border-emerald-200/80 bg-emerald-50/70";
  }

  if (label === "Outcomes") {
    return "border-sky-200/80 bg-sky-50/60";
  }

  return "border-border/70 bg-background/90";
}

function attentionTone(kind: "blocker" | "pending") {
  if (kind === "blocker") {
    return "border-rose-200/80 bg-rose-50/65";
  }

  return "border-amber-200/80 bg-amber-50/65";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = searchParams ? await searchParams : {};
  const {
    dashboard,
    projects,
    activeProject,
    hasAuthenticatedUser,
    canManageProjects,
    isDemoSession
  } = await loadHomeDashboard();
  const blockedCount = dashboard.summary.find((item) => item.label === "Blocked Items")?.value ?? "0";
  const readyCount = dashboard.summary.find((item) => item.label === "Stories Ready")?.value ?? "0";
  const hasActiveProject = Boolean(activeProject?.organizationId);
  const flashError = getParamValue(query.error);
  const flashMessage = getParamValue(query.message);
  const status = deriveProjectStatus({
    hasActiveProject,
    dashboardState: dashboard.state,
    blockedCount: Number.parseInt(blockedCount, 10) || 0,
    pendingCount: dashboard.pendingActions.length,
    readyCount: Number.parseInt(readyCount, 10) || 0
  });
  const currentProjectName = activeProject?.organizationName ?? "No active project selected";
  const currentProjectDescription = hasActiveProject
    ? isDemoSession
      ? "Demo stays isolated and only appears because it was chosen explicitly."
      : "Only this project's Outcomes, Value Spine items, Import sessions, and Human Review records are visible."
    : hasAuthenticatedUser
      ? "You are signed in, but no operational project is active until you select or create one."
      : "Sign in, then choose an existing project, create a new one, or enter Demo explicitly.";

  const projectQuickLinks = [
    { href: "/framing", label: "Open Framing", icon: FolderKanban },
    { href: "/workspace", label: "Open Value Spine", icon: GitBranch },
    { href: "/review", label: "Open Review", icon: ShieldCheck },
    { href: "/intake", label: "Open Import", icon: ClipboardList }
  ];

  return (
    <AppShell
      {...(activeProject?.organizationName ? { activeProjectName: activeProject.organizationName } : {})}
      hideRightRail
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
                Strict project isolation
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {hasActiveProject ? "Project Home" : "Choose how to enter work"}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {hasActiveProject
                    ? "The active project gets the first screen now. Switching, creating and demo access stay available, but they no longer crowd out the current project's signals."
                    : "Open an existing project, create a new one, or open Demo explicitly. Nothing operational becomes active until you make that choice."}
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

        {flashError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flashError}</div>
        ) : null}
        {flashMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {flashMessage}
          </div>
        ) : null}

        {hasActiveProject ? (
          <div className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.82fr)]">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Project overview</CardTitle>
                  <CardDescription>Live signals for the currently active project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {dashboard.summary.length > 0 ? (
                      dashboard.summary.map((item) => {
                        const action = getSummaryAction({ label: item.label, value: item.value });

                        return (
                          <ActionSummaryCard
                            actionHref={action?.href}
                            actionLabel={action?.label}
                            className={summaryTone(item.label)}
                            description={item.description}
                            key={item.label}
                            label={item.label}
                            value={item.value}
                          />
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground sm:col-span-2 xl:col-span-4">
                        {dashboard.state === "unavailable"
                          ? dashboard.message
                          : "The project is active but still does not have enough operational data to summarize."}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)]">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick links</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {projectQuickLinks.map((item) => {
                          const Icon = item.icon;

                          return (
                            <Button asChild className="justify-start gap-2" key={item.href} variant="secondary">
                              <Link href={item.href}>
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current posture</p>
                      <p className="mt-4 text-lg font-semibold text-foreground">{status.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.detail}</p>
                      {dashboard.state !== "live" ? (
                        <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
                          {dashboard.message}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-5">
                <Card className="border-border/70 shadow-sm">
                  <CardHeader>
                    <CardTitle>Needs attention</CardTitle>
                    <CardDescription>Highest-signal blockers and follow-ups in the active project.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...dashboard.topBlockers.slice(0, 2), ...dashboard.pendingActions.slice(0, 2)].length > 0 ? (
                      [
                        ...dashboard.topBlockers.slice(0, 2).map((item) => ({ ...item, attentionKind: "blocker" as const })),
                        ...dashboard.pendingActions.slice(0, 2).map((item) => ({ ...item, attentionKind: "pending" as const }))
                      ].map((item) => (
                        <div className={`rounded-2xl border p-4 ${attentionTone(item.attentionKind)}`} key={item.id}>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                        No active blockers or pending review items are currently surfaced.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/70 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent activity</CardTitle>
                    <CardDescription>Latest append-only project events.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboard.recentActivity.length > 0 ? (
                      dashboard.recentActivity.slice(0, 4).map((item) => (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item.id}>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{item.timestamp}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
                        No recent project activity is available yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {dashboard.outcomesByStatus.length > 0 ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Outcome spread</CardTitle>
                  <CardDescription>How the active project's Framing cases are distributed right now.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {dashboard.outcomesByStatus.map((item) => (
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4" key={item.status}>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{item.count}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                Open project
              </CardTitle>
              <CardDescription>
                Show only the projects you created or belong to, then choose one explicitly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {canManageProjects ? `${projects.length} normal project(s) available` : "Sign in required"}
                </p>
                <p className="mt-2 leading-6">
                  {canManageProjects
                    ? projects.length > 0
                      ? "Project switching happens only from the explicit list below."
                      : "No normal projects exist yet for this signed-in user."
                    : isDemoSession
                      ? "Demo is active, but normal project selection requires your signed-in account."
                      : "Sign in first to see or open your normal projects."}
                </p>
              </div>
              {canManageProjects ? (
                projects.length > 0 ? (
                  <Button asChild className="gap-2">
                    <Link href="#project-list">
                      Review project list
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">Open project stays empty until a project is created.</p>
                )
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="gap-2">
                    <Link href="/login?redirectTo=%2F">
                      Sign in to continue
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  {isDemoSession ? (
                    <form action={clearActiveProjectAction}>
                      <Button className="gap-2" type="submit" variant="secondary">
                        <LogOut className="h-4 w-4" />
                        Leave demo project
                      </Button>
                    </form>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-sky-50/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sky-950">
                <PlusCircle className="h-4 w-4" />
                Create project
              </CardTitle>
              <CardDescription className="text-sky-900/80">
                Start a brand-new isolated project with its own local numbering and empty operational state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManageProjects ? (
                <form action={createProjectAction} className="space-y-3">
                  <input
                    className="h-11 w-full rounded-2xl border border-sky-200 bg-background px-4 text-sm outline-none transition focus:border-primary"
                    name="projectName"
                    placeholder="New project name"
                    type="text"
                  />
                  <Button className="gap-2" type="submit">
                    Create and open project
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="gap-2">
                    <Link href="/login?redirectTo=%2F">
                      Sign in to create
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  {isDemoSession ? (
                    <form action={clearActiveProjectAction}>
                      <Button className="gap-2" type="submit" variant="secondary">
                        <LogOut className="h-4 w-4" />
                        Leave demo project
                      </Button>
                    </form>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Open demo project
              </CardTitle>
              <CardDescription>
                Demo remains separate from normal projects and opens only when chosen explicitly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Use Demo only when you want reference content. It never appears as a hidden startup fallback.
              </p>
              {hasAuthenticatedUser ? (
                <form action={openDemoProjectAction}>
                  <Button className="gap-2" type="submit" variant="secondary">
                    {isDemoSession ? "Re-open demo project" : "Open demo project"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/login">
                    Choose demo access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm" id="project-list">
          <CardHeader>
            <CardTitle>Open project</CardTitle>
            <CardDescription>
              Only explicitly created normal projects appear here. Demo is handled separately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canManageProjects ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                {isDemoSession
                  ? "Sign in with your account to manage normal projects, or leave Demo to return to a clean Home."
                  : "Sign in before opening or creating a normal project."}
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">No normal projects exist yet.</p>
                <p className="mt-2">Create the first project here, or open Demo explicitly if you need reference material.</p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {projects.map((project) => (
                  <div className="rounded-2xl border border-border/70 bg-background/90 p-5 shadow-sm" key={project.organizationId}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{project.organizationName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{project.organizationSlug}</p>
                      </div>
                      {project.isActive ? (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Outcomes</p>
                        <p className="mt-1 font-semibold">{project.counts.outcomes}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Epics</p>
                        <p className="mt-1 font-semibold">{project.counts.epics}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stories</p>
                        <p className="mt-1 font-semibold">{project.counts.stories}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Events</p>
                        <p className="mt-1 font-semibold">{project.counts.activityEvents}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={openProjectAction}>
                        <input name="organizationId" type="hidden" value={project.organizationId} />
                        <Button className="gap-2" type="submit">
                          {project.isActive ? "Continue project" : "Open project"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {hasActiveProject ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Current project controls</CardTitle>
              <CardDescription>
                Explicitly leave the active project, or delete it and return to an empty Home state.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{currentProjectName}</p>
                <p className="mt-2 leading-6">
                  {isDemoSession
                    ? "Leave Demo to return to a clean Home without an active project."
                    : "Leaving or deleting this project clears active context immediately and prevents cross-project leakage."}
                </p>
              </div>
              <form action={clearActiveProjectAction}>
                <Button className="gap-2" type="submit" variant="secondary">
                  <LogOut className="h-4 w-4" />
                  {isDemoSession ? "Leave demo project" : "Leave current project"}
                </Button>
              </form>
              {!isDemoSession ? (
                <form action={deleteCurrentProjectAction}>
                  <Button className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95" type="submit">
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Project status at a glance</CardTitle>
              <CardDescription>
                Signals apply only to the currently active project. Without a project selection, operational lists stay empty.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project</p>
                <p className="mt-2 text-lg font-semibold text-foreground">None selected</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Choose or create a project before any operational data is shown.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Framing</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{status.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.detail}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Review</p>
                <p className="mt-2 text-lg font-semibold text-foreground">No active review queue</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No project-scoped review actions are currently surfaced.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Build posture</p>
                <p className="mt-2 text-lg font-semibold text-foreground">No active build scope</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Build-readiness stays unset until a project and its stories are explicitly in play.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
