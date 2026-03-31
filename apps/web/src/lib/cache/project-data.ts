import { revalidateTag, unstable_cache } from "next/cache";
import { getOutcomeWorkspaceService } from "@aas-companion/api";
import { getFramingCockpitData } from "@aas-companion/api/framing";

export function getFramingCockpitTag(organizationId: string) {
  return `framing-cockpit:${organizationId}`;
}

export function getOutcomeWorkspaceTag(organizationId: string, outcomeId: string) {
  return `outcome-workspace:${organizationId}:${outcomeId}`;
}

export function getCachedFramingCockpitData(organizationId: string, organizationName: string) {
  return unstable_cache(
    async () => getFramingCockpitData(organizationId, organizationName),
    ["framing-cockpit", organizationId, organizationName],
    {
      tags: [getFramingCockpitTag(organizationId)]
    }
  )();
}

export function getCachedOutcomeWorkspaceData(organizationId: string, outcomeId: string) {
  return unstable_cache(
    async () => getOutcomeWorkspaceService(organizationId, outcomeId),
    ["outcome-workspace", organizationId, outcomeId],
    {
      tags: [getOutcomeWorkspaceTag(organizationId, outcomeId)]
    }
  )();
}

export function revalidateFramingCockpitCache(organizationId: string) {
  revalidateTag(getFramingCockpitTag(organizationId));
}

export function revalidateOutcomeWorkspaceCache(organizationId: string, outcomeId: string | null | undefined) {
  if (!outcomeId) {
    return;
  }

  revalidateTag(getOutcomeWorkspaceTag(organizationId, outcomeId));
}
