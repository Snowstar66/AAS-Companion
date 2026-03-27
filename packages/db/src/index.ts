export { prisma } from "./client";
export {
  appendArtifactFileRejections,
  createArtifactIntakeSession,
  getArtifactIntakeFileById,
  listArtifactIntakeSessions,
  reviewArtifactFileSectionDisposition
} from "./repositories/artifact-intake-repository";
export {
  getArtifactCandidateById,
  listArtifactCandidatesForOrganization,
  promoteArtifactCandidate,
  reviewArtifactCandidate
} from "./repositories/artifact-candidate-repository";
export { appendActivityEvent, listActivityEventsForEntity } from "./repositories/activity-repository";
export {
  archiveGovernedObject,
  getGovernedRemovalState,
  hardDeleteGovernedObject,
  restoreGovernedObject
} from "./repositories/governed-lifecycle-repository";
export {
  createOrganizationContextForUser,
  deleteOrganizationContextForUser,
  getAppUserByEmail,
  ensureAppUser,
  getAppUserById,
  getOrganizationContextForUser,
  listAppUsers,
  listOrganizationUsers,
  listOrganizationContextsForUser,
  listOrganizationProjectSummariesForUser,
  upsertAppUserByEmail,
  type AppUserIdentity,
  type OrganizationMembershipContext,
  type OrganizationMembershipProjectSummary
} from "./repositories/organization-repository";
export {
  createAgentRegistryEntry,
  createPartyRoleEntry,
  listAgentRegistryEntries,
  listGovernanceRiskCombinationRules,
  listGovernanceRoleRequirements,
  listPartyRoleEntries,
  updateAgentRegistryEntry,
  updatePartyRoleEntry
} from "./repositories/governance-repository";
export {
  createOutcome,
  getPreferredFramingOutcomeId,
  getOutcomeById,
  getOutcomeWorkspaceSnapshot,
  listOutcomeCockpitEntries,
  listOutcomes,
  updateOutcome
} from "./repositories/outcome-repository";
export {
  createEpic,
  getEpicById,
  getEpicWorkspaceSnapshot,
  listEpics,
  updateEpic
} from "./repositories/epic-repository";
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
export { getHumanReviewSnapshot } from "./repositories/human-review-repository";
export {
  createSignoffRecord,
  listSignoffRecordsForEntity,
  listSignoffRecordsForOrganization,
  listSignoffRecordsForTollgate
} from "./repositories/signoff-repository";
export { getHomeDashboardSnapshot, getProjectSpineSnapshot, getWorkspaceSnapshot } from "./repositories/workspace-repository";
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
