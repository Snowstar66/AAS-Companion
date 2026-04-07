import { revalidateTag, unstable_cache } from "next/cache";
import { getOutcomeWorkspaceService } from "@aas-companion/api";
import { getOrganizationUsersService } from "@aas-companion/api";
import { getOrganizationValueOwnersService } from "@aas-companion/api";
import { getOutcomeTollgateReviewService } from "@aas-companion/api";
import { getFramingCockpitData } from "@aas-companion/api/framing";

export function getFramingCockpitTag(organizationId: string) {
  return `framing-cockpit:${organizationId}`;
}

export function getOutcomeWorkspaceTag(organizationId: string, outcomeId: string) {
  return `outcome-workspace:${organizationId}:${outcomeId}`;
}

export function getOutcomeTollgateReviewTag(organizationId: string, outcomeId: string) {
  return `outcome-tollgate-review:${organizationId}:${outcomeId}`;
}

export function getOrganizationValueOwnersTag(organizationId: string) {
  return `organization-value-owners:${organizationId}`;
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

export function getCachedOutcomeTollgateReviewData(organizationId: string, outcomeId: string) {
  return unstable_cache(
    async () => getOutcomeTollgateReviewService(organizationId, outcomeId),
    ["outcome-tollgate-review", organizationId, outcomeId],
    {
      tags: [getOutcomeTollgateReviewTag(organizationId, outcomeId)]
    }
  )();
}

export function getCachedOrganizationUsersData(organizationId: string) {
  return unstable_cache(
    async () => getOrganizationUsersService(organizationId),
    ["organization-users", organizationId],
    {
      revalidate: 300
    }
  )();
}

export function getCachedOrganizationValueOwnersData(organizationId: string) {
  return unstable_cache(
    async () => getOrganizationValueOwnersService(organizationId),
    ["organization-value-owners", organizationId],
    {
      tags: [getOrganizationValueOwnersTag(organizationId)],
      revalidate: 300
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

export function revalidateOutcomeTollgateReviewCache(organizationId: string, outcomeId: string | null | undefined) {
  if (!outcomeId) {
    return;
  }

  revalidateTag(getOutcomeTollgateReviewTag(organizationId, outcomeId));
}

export function revalidateOrganizationValueOwnersCache(organizationId: string) {
  revalidateTag(getOrganizationValueOwnersTag(organizationId));
}
