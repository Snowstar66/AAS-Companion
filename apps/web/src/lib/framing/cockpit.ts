import { getFramingCockpitData } from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

export async function loadFramingCockpit() {
  const session = await requireActiveProjectSession();
  const cockpit = await getFramingCockpitData(
    session.organization.organizationId,
    session.organization.organizationName
  );

  return {
    session,
    cockpit
  };
}
