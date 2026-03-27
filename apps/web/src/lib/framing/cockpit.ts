import { getFramingCockpitData, getPreferredFramingOutcomeIdService } from "@aas-companion/api/framing";
import { getOutcomeWorkspaceService } from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { withDevTiming } from "@/lib/dev-timing";

export async function loadFramingCockpit(requestedOutcomeId?: string | null) {
  return withDevTiming("web.framing.loadFramingCockpit", async () => {
    const session = await requireActiveProjectSession();
    const cockpitPromise = getFramingCockpitData(
      session.organization.organizationId,
      session.organization.organizationName
    );
    const resolvedOutcomeIdPromise = requestedOutcomeId
      ? Promise.resolve(requestedOutcomeId)
      : getPreferredFramingOutcomeIdService(session.organization.organizationId);
    const requestedOutcomePromise = resolvedOutcomeIdPromise.then((resolvedOutcomeId) =>
      resolvedOutcomeId ? getOutcomeWorkspaceService(session.organization.organizationId, resolvedOutcomeId) : null
    );
    const [cockpit, resolvedOutcomeId, requestedOutcome] = await Promise.all([
      cockpitPromise,
      resolvedOutcomeIdPromise,
      requestedOutcomePromise
    ]);

    return {
      session,
      cockpit,
      requestedOutcome,
      resolvedOutcomeId
    };
  });
}
