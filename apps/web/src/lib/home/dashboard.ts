import type { HomeDashboardData } from "@aas-companion/api";
import { getHomeDashboardData } from "@aas-companion/api";
import { getAppSession } from "@/lib/auth/session";

export async function loadHomeDashboard() {
  const session = await getAppSession();
  let dashboard: HomeDashboardData;

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
    dashboard = await getHomeDashboardData(session.organization.organizationId);
  }

  return {
    session,
    dashboard
  };
}
