import Link from "next/link";
import {
  ArrowRight,
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
import { ViewerSessionProvider } from "@/components/auth/viewer-session-provider";
import { HomeDashboardHero } from "@/components/home/home-dashboard-hero";
import { AppShell } from "@/components/layout/app-shell";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { loadHomeDashboard } from "@/lib/home/dashboard";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
  const hasActiveProject = Boolean(activeProject?.organizationId);
  const currentProjectName = activeProject?.organizationName ?? "No active project selected";
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
          <HomeDashboardHero
            activeProjectName={activeProject?.organizationName ?? null}
            dashboard={dashboard}
            hasAuthenticatedUser={hasAuthenticatedUser}
            isDemoSession={isDemoSession}
          />

          {flashError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flashError}</div>
          ) : null}
          {flashMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {flashMessage}
            </div>
          ) : null}

          <Card className="border-border/70 shadow-sm" id="project-list">
            <CardHeader>
              <CardTitle>Project access</CardTitle>
              <CardDescription>
                Open, create, switch, leave or remove projects from one compact control surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick actions</p>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-sky-900" />
                        <p className="font-semibold text-sky-950">Create project</p>
                      </div>
                      {canManageProjects ? (
                        <form action={createProjectAction} className="flex flex-col gap-3 sm:flex-row">
                          <input
                            className="h-11 min-w-0 flex-1 rounded-2xl border border-sky-200 bg-background px-4 text-sm outline-none transition focus:border-primary"
                            name="projectName"
                            placeholder="New project name"
                            required
                            type="text"
                          />
                          <PendingFormButton
                            className="gap-2 sm:shrink-0"
                            icon={<ArrowRight className="h-4 w-4" />}
                            label="Create and open project"
                            pendingLabel="Creating project..."
                            showPendingCursor
                          />
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
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Demo remains separate from normal projects and opens only when chosen explicitly.</p>
                        {hasAuthenticatedUser ? (
                          <form action={openDemoProjectAction} className="mt-4">
                            <PendingFormButton
                              className="gap-2 w-full"
                              icon={<ArrowRight className="h-4 w-4" />}
                              label={isDemoSession ? "Re-open demo project" : "Open demo project"}
                              pendingLabel="Opening demo..."
                              showPendingCursor
                              variant="secondary"
                            />
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
                              <PendingFormButton
                                className="gap-2"
                                icon={<LogOut className="h-4 w-4" />}
                                label={isDemoSession ? "Leave demo project" : "Leave current project"}
                                pendingLabel={isDemoSession ? "Leaving demo..." : "Leaving project..."}
                                showPendingCursor
                                variant="secondary"
                              />
                            </form>
                            {hasActiveProject && !isDemoSession ? (
                              <form action={deleteCurrentProjectAction}>
                                <PendingFormButton
                                  className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                                  icon={<Trash2 className="h-4 w-4" />}
                                  label="Delete project"
                                  pendingLabel="Deleting project..."
                                  showPendingCursor
                                />
                              </form>
                            ) : null}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">No active project controls are needed until a project is open.</p>
                        )}
                      </div>
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
