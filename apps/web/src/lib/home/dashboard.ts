import { DEMO_ORGANIZATION } from "@aas-companion/domain";
import { getHomeDashboardData } from "@aas-companion/api";
import { getAppSession } from "@/lib/auth/session";

export async function loadHomeDashboard() {
  const session = await getAppSession();
  const organizationId = session?.organization.organizationId ?? DEMO_ORGANIZATION.organizationId;
  const dashboard = await getHomeDashboardData(organizationId);

  return {
    session,
    dashboard
  };
}
