import { getFramingCockpitData } from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";

export async function loadFramingCockpit() {
  const session = await requireProtectedSession();
  const cockpit = await getFramingCockpitData(session.organization.organizationId);

  return {
    session,
    cockpit
  };
}
