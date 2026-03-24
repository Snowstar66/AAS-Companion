import Link from "next/link";
import {
  ArrowRight,
  FolderKanban,
  FolderOpen,
  LogOut,
  PlusCircle,
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

  return (
    <AppShell
      {...(activeProject?.organizationName ? { activeProjectName: activeProject.organizationName } : {})}
      rightRail={
        <aside className="space-y-4">
          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle>Project rules</CardTitle>
              <CardDescription>Normal work starts only after an explicit project choice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Startup no longer opens a hidden project implicitly.</p>
              <p>Open project shows only real created projects, not demo fallback data.</p>
              <p>Demo remains available only through an explicit separate action.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle>Current status</CardTitle>
              <CardDescription>High-level posture for the currently active project only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="font-medium text-foreground">{status.label}</p>
                <p className="mt-2 leading-6">{status.detail}</p>
              </div>
              {!hasActiveProject ? (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4">
                  <p className="font-medium text-foreground">No data leakage</p>
                  <p className="mt-2 leading-6">
                    Operational lists stay empty until a project is chosen explicitly.
                  </p>
                </div>
              ) : dashboard.state !== "live" ? (
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
                Strict project isolation
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Choose how to enter work
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Open an existing project, create a new one, or open Demo explicitly. Nothing operational becomes active
                  until you make that choice.
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
        ) : null}

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
              <p className="mt-2 text-lg font-semibold text-foreground">
                {hasActiveProject ? (isDemoSession ? "Demo" : "Active") : "None selected"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {hasActiveProject
                  ? "Operational views are now scoped to this project only."
                  : "Choose or create a project before any operational data is shown."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Framing</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{status.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.detail}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Review</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {hasActiveProject && dashboard.pendingActions.length > 0 ? "Awaiting review" : "No active review queue"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {hasActiveProject && dashboard.pendingActions.length > 0
                  ? `${dashboard.pendingActions.length} follow-up action(s) remain in the active project.`
                  : "No project-scoped review actions are currently surfaced."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Build posture</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {hasActiveProject && (Number.parseInt(blockedCount, 10) || 0) > 0 ? "Not ready for build" : "No active build scope"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {hasActiveProject && (Number.parseInt(blockedCount, 10) || 0) > 0
                  ? `${blockedCount} blocking issue(s) still need attention.`
                  : "Build-readiness stays unset until a project and its stories are explicitly in play."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
