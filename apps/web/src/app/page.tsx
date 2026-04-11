import {
  clearActiveProjectAction,
  createProjectAction,
  deleteCurrentProjectAction,
  openDemoProjectAction,
  openProjectAction
} from "@/app/project-actions";
import { ViewerSessionProvider } from "@/components/auth/viewer-session-provider";
import { HomeDashboardHero } from "@/components/home/home-dashboard-hero";
import { HomeProjectAccess } from "@/components/home/home-project-access";
import { AppShell } from "@/components/layout/app-shell";
import { loadHomeDashboard } from "@/lib/home/dashboard";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [query, home] = await Promise.all([
    searchParams ? searchParams : Promise.resolve({}),
    loadHomeDashboard()
  ]);
  const {
    session,
    dashboard,
    projects,
    activeProject,
    hasAuthenticatedUser,
    canManageProjects,
    isDemoSession
  } = home;

  const flashError = getParamValue(query.error);
  const flashMessage = getParamValue(query.message);
  const hasActiveProject = Boolean(activeProject?.organizationId);
  const currentProjectName = activeProject?.organizationName ?? "No active project selected";

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

          <HomeProjectAccess
            canManageProjects={canManageProjects}
            clearActiveProjectAction={clearActiveProjectAction}
            createProjectAction={createProjectAction}
            currentProjectName={currentProjectName}
            deleteCurrentProjectAction={deleteCurrentProjectAction}
            hasActiveProject={hasActiveProject}
            hasAuthenticatedUser={hasAuthenticatedUser}
            isDemoSession={isDemoSession}
            openDemoProjectAction={openDemoProjectAction}
            openProjectAction={openProjectAction}
            projects={projects}
          />
        </section>
      </AppShell>
    </ViewerSessionProvider>
  );
}
