import { DEMO_ORGANIZATION, DEMO_SESSION } from "@aas-companion/domain/demo";
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
    const [session, account] = await Promise.all([getAppSession(), getSignedInAccountIdentity()]);

    if (!session) {
      return {
        session,
        dashboard: {
          state: "empty",
          organizationName: "No project selected",
          message: "Choose a project or Demo explicitly before operational data is shown.",
          projectPhase: {
            key: "framing",
            label: "Framing phase",
            detail: "The project remains in framing until a framing brief is approved at Tollgate 1."
          },
          storyIdeaStats: {
            total: 0,
            started: 0,
            framingReady: 0
          },
          deliveryStoryStats: {
            total: 0,
            readyToStartBuild: 0
          },
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

    const shouldLoadProjects = Boolean(
      account || (session.mode === "demo" && session.userId !== DEMO_SESSION.userId)
    );
    const dashboardPromise = session.organization?.organizationId
      ? getHomeDashboardData(session.organization.organizationId)
      : Promise.resolve({
          state: "empty",
          organizationName: "No project selected",
          message: "Choose an existing project, create a new one, or open Demo explicitly before entering operational work.",
          projectPhase: {
            key: "framing",
            label: "Framing phase",
            detail: "The project remains in framing until a framing brief is approved at Tollgate 1."
          },
          storyIdeaStats: {
            total: 0,
            started: 0,
            framingReady: 0
          },
          deliveryStoryStats: {
            total: 0,
            readyToStartBuild: 0
          },
          summary: [],
          outcomesByStatus: [],
          topBlockers: [],
          pendingActions: [],
          recentActivity: [],
          rightRail: {
            blockers: [],
            nextActions: []
          }
        } satisfies HomeDashboardData);
    const projectsPromise = shouldLoadProjects
      ? listOrganizationProjectSummariesForUser(session.userId)
      : Promise.resolve([]);
    const [dashboard, availableProjects] = await Promise.all([dashboardPromise, projectsPromise]);
    const projects = availableProjects
      .filter((project) => project.organizationId !== DEMO_ORGANIZATION.organizationId)
      .map((project) => ({
        organizationId: project.organizationId,
        organizationName: project.organizationName,
        organizationSlug: project.organizationSlug,
        role: project.role,
        counts: project.counts,
        isActive: session.organization?.organizationId === project.organizationId
      } satisfies HomeProjectSummary));

    return {
      session,
      dashboard,
      projects,
      activeProject: session?.organization ?? null,
      hasAuthenticatedUser: Boolean(session),
      canManageProjects: shouldLoadProjects,
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
        projectPhase: {
          key: "framing",
          label: "Framing phase",
          detail: "The project remains in framing until a framing brief is approved at Tollgate 1."
        },
        storyIdeaStats: {
          total: 0,
          started: 0,
          framingReady: 0
        },
        deliveryStoryStats: {
          total: 0,
          readyToStartBuild: 0
        },
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
