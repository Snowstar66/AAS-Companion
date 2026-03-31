import { getFramingCockpitData } from "@aas-companion/api/framing";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { withDevTiming } from "@/lib/dev-timing";

export async function loadFramingCockpit(requestedOutcomeId?: string | null) {
  return withDevTiming("web.framing.loadFramingCockpit", async () => {
    const session = await requireActiveProjectSession();
    const cockpit = await getFramingCockpitData(
      session.organization.organizationId,
      session.organization.organizationName
    );
    const resolvedOutcomeId =
      requestedOutcomeId ??
      cockpit.items.find((item) => item.originType === "native")?.id ??
      cockpit.items[0]?.id ??
      null;

    return {
      session,
      cockpit,
      resolvedOutcomeId
    };
  });
}
