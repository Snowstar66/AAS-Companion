import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import type { OrganizationContext } from "@aas-companion/domain/organization";
import { getHomeDashboardData, type HomeDashboardData } from "@aas-companion/api/dashboard";
import { listOrganizationProjectSummariesForUser } from "@aas-companion/db/organization-repository";
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

export type HomeDashboardLoadResult = {
  session: Awaited<ReturnType<typeof getAppSession>>;
  dashboard: HomeDashboardData;
  projects: HomeProjectSummary[];
  activeProject: OrganizationContext | null;
  hasAuthenticatedUser: boolean;
  canManageProjects: boolean;
  isDemoSession: boolean;
};

export async function loadHomeDashboard(): Promise<HomeDashboardLoadResult> {
  try {
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
        const availableProjects = (await listOrganizationProjectSummariesForUser(account.userId)).filter(
          (project) => project.organizationId !== DEMO_ORGANIZATION.organizationId
        );

        projects = availableProjects.map((project) => ({
          organizationId: project.organizationId,
          organizationName: project.organizationName,
          organizationSlug: project.organizationSlug,
          role: project.role,
          counts: project.counts,
          isActive: session.organization?.organizationId === project.organizationId
        } satisfies HomeProjectSummary));
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
  } catch (error) {
    return {
      session: null,
      dashboard: {
        state: "unavailable",
        organizationName: "Unknown project",
        message:
          error instanceof Error
            ? `Dashboard data is unavailable right now: ${error.message}`
            : "Dashboard data is unavailable right now.",
        summary: [],
        outcomesByStatus: [],
        topBlockers: [],
        pendingActions: [],
        recentActivity: [],
        rightRail: {
          blockers: [],
          nextActions: []
        }
      },
      projects: [],
      activeProject: null,
      hasAuthenticatedUser: false,
      canManageProjects: false,
      isDemoSession: false
    };
  }
}
