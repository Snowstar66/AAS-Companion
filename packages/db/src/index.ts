export { prisma } from "./client";
export {
  appendArtifactFileRejections,
  createArtifactIntakeSession,
  listArtifactIntakeSessions
} from "./repositories/artifact-intake-repository";
export { appendActivityEvent, listActivityEventsForEntity } from "./repositories/activity-repository";
export {
  getOrganizationContextForUser,
  listOrganizationContextsForUser,
  type OrganizationMembershipContext
} from "./repositories/organization-repository";
export {
  createOutcome,
  getOutcomeById,
  getOutcomeWorkspaceSnapshot,
  listOutcomeCockpitEntries,
  listOutcomes,
  updateOutcome
} from "./repositories/outcome-repository";
export {
  createStory,
  getStoryById,
  getStoryWorkspaceSnapshot,
  listStories,
  updateStory
} from "./repositories/story-repository";
export {
  getTollgate,
  upsertTollgate
} from "./repositories/tollgate-repository";
export { getWorkspaceSnapshot } from "./repositories/workspace-repository";
export { expectedSeedShape, seedRuntimeEntry } from "./seed";

export type TenantScopedQuery = {
  organizationId: string;
};

export function assertTenantScope(input: TenantScopedQuery) {
  if (!input.organizationId) {
    throw new Error("organizationId is required for tenant-scoped operations.");
  }

  return input;
}
