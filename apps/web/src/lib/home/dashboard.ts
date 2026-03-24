import { DEMO_ORGANIZATION } from "@aas-companion/domain";
import { getHomeDashboardData, type HomeDashboardData } from "@aas-companion/api";
import { getWorkspaceSnapshot, listOrganizationContextsForUser } from "@aas-companion/db";
import { getAppSession, getSignedInAccountIdentity } from "@/lib/auth/session";

export type HomeProjectSummary = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: string;
  counts: {
    outcomes: number;
    epics: number;
    stories: number;
    activityEvents: number;
  };
  isActive: boolean;
};

export async function loadHomeDashboard() {
  const session = await getAppSession();
  const account = await getSignedInAccountIdentity();
  let dashboard: HomeDashboardData;
  let projects: HomeProjectSummary[] = [];

  if (!session) {
    dashboard = {
      state: "empty",
      organizationName: "No project selected",
      message: "Choose a project or Demo explicitly before operational data is shown.",
      summary: [],
      outcomesByStatus: [],
      topBlockers: [],
      pendingActions: [],
      recentActivity: [],
      rightRail: {
        blockers: [],
        nextActions: []
      }
    };
  } else {
    if (account) {
      const availableProjects = (await listOrganizationContextsForUser(account.userId)).filter(
        (project) => project.organizationId !== DEMO_ORGANIZATION.organizationId
      );

      projects = await Promise.all(
        availableProjects.map(async (project) => {
          const snapshot = await getWorkspaceSnapshot(project.organizationId);

          return {
            organizationId: project.organizationId,
            organizationName: project.organizationName,
            organizationSlug: project.organizationSlug,
            role: project.role,
            counts: {
              outcomes: snapshot?.counts.outcomes ?? 0,
              epics: snapshot?.counts.epics ?? 0,
              stories: snapshot?.counts.stories ?? 0,
              activityEvents: snapshot?.counts.activityEvents ?? 0
            },
            isActive: session.organization?.organizationId === project.organizationId
          } satisfies HomeProjectSummary;
        })
      );
    }

    if (session.organization?.organizationId) {
      dashboard = await getHomeDashboardData(session.organization.organizationId);
    } else {
      dashboard = {
        state: "empty",
        organizationName: "No project selected",
        message: "Choose an existing project, create a new one, or open Demo explicitly before entering operational work.",
        summary: [],
        outcomesByStatus: [],
        topBlockers: [],
        pendingActions: [],
        recentActivity: [],
        rightRail: {
          blockers: [],
          nextActions: []
        }
      };
    }
  }

  return {
    session,
    dashboard,
    projects,
    activeProject: session?.organization ?? null,
    hasAuthenticatedUser: Boolean(session),
    canManageProjects: Boolean(account),
    isDemoSession: session?.mode === "demo"
  };
}
