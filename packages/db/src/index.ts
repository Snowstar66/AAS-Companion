export { prisma } from "./client";
export {
  appendArtifactFileRejections,
  createArtifactIntakeSession,
  deleteArtifactIntakeSession,
  getArtifactIntakeFileById,
  listArtifactIntakeSessions,
  reviewArtifactFileSectionDisposition,
  reviewArtifactFileSectionDispositionsBulk
} from "./repositories/artifact-intake-repository";
export {
  applyApprovedArtifactFileCarryForwardToOutcome,
  getArtifactCandidateById,
  getArtifactCandidatesByIds,
  listArtifactCandidatesForOrganization,
  promoteArtifactCandidate,
  promoteArtifactCandidatesBulk,
  reviewArtifactCandidate,
  reviewArtifactCandidatesBulk,
  updateArtifactFileCarryForwardItems
} from "./repositories/artifact-candidate-repository";
export {
  appendActivityEvent,
  clearOperationalActivityEventsForOrganization,
  listActivityEventsForEntity,
  listOperationalActivityEventsForOrganization
} from "./repositories/activity-repository";
export {
  archiveGovernedObject,
  getGovernedRemovalState,
  hardDeleteGovernedObject,
  restoreGovernedObject
} from "./repositories/governed-lifecycle-repository";
export {
  createOrganizationContextForUser,
  deleteOrganizationContextForUser,
  hardDeleteOrganizationContextsForUser,
  getAppUserByEmail,
  ensureAppUser,
  getAppUserById,
  getOrganizationContextForUser,
  listAppUsers,
  listOrganizationProjectUsers,
  listOrganizationUsers,
  listOrganizationContextsForUser,
  listOrganizationProjectSummariesForUser,
  removeOrganizationProjectUser,
  updateOrganizationProjectUser,
  upsertAppUserByEmail,
  type AppUserIdentity,
  type OrganizationProjectUserIdentity,
  type OrganizationMembershipContext,
  type OrganizationMembershipProjectSummary,
  type RemoveOrganizationProjectUserResult
} from "./repositories/organization-repository";
export {
  createAgentRegistryEntry,
  createPartyRoleEntry,
  getPartyRoleEntryById,
  hardDeletePartyRoleEntry,
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
  getOutcomeTollgateReviewSnapshot,
  getOutcomeWorkspaceSnapshot,
  listOutcomeReferences,
  listOutcomeCockpitEntries,
  listOutcomes,
  updateOutcome
} from "./repositories/outcome-repository";
export {
  reviewOutcomeFramingWithAi,
  validateStoryExpectedBehaviorWithAi,
  validateOutcomeFieldWithAi,
  type OutcomeFieldAiValidation,
  type OutcomeFramingAiReview,
  type StoryExpectedBehaviorAiValidation
} from "./repositories/outcome-ai-repository";
export {
  createDirectionSeed,
  getDirectionSeedById,
  getDirectionSeedBySourceStoryId,
  listDirectionSeedKeys,
  listDirectionSeeds,
  updateDirectionSeed
} from "./repositories/direction-seed-repository";
export {
  createEpic,
  getEpicById,
  getEpicWorkspaceSnapshot,
  listEpicKeys,
  listEpicReferences,
  listEpics,
  updateEpic
} from "./repositories/epic-repository";
export {
  countStoriesByDirectionSeedId,
  createStory,
  getStoryById,
  getStoryWorkspaceSnapshot,
  listStoryKeys,
  listStoriesByDirectionSeedId,
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
