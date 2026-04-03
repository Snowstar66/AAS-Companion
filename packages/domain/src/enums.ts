import { z } from "zod";

export const membershipRoles = ["value_owner", "aida", "aqa", "architect", "delivery_lead", "builder"] as const;
export const organizationSides = ["customer", "supplier"] as const;
export const partyRoleTypes = [
  "customer_sponsor",
  "customer_domain_owner",
  "value_owner",
  "architect",
  "aida",
  "aqa",
  "delivery_lead",
  "builder",
  "ai_governance_lead",
  "risk_owner"
] as const;
export const agentTypes = ["bmad_agent", "governance_agent", "automation_agent"] as const;
export const governanceCoverageStatuses = ["satisfied", "missing", "partially_covered", "risky_combination"] as const;
export const signoffDecisionKinds = ["review", "approval", "escalation"] as const;
export const signoffDecisionStatuses = ["approved", "rejected", "changes_requested"] as const;
export const authorityResponsibilityAreas = [
  "outcome_ownership",
  "architecture_review",
  "ai_review",
  "risk_acceptance",
  "tollgate_approval",
  "build_readiness_approval",
  "escalation_ownership"
] as const;
export const authorityAssignmentKinds = ["owner", "reviewer", "approver", "not_assigned"] as const;
export const outcomeStatuses = ["draft", "baseline_in_progress", "ready_for_tg1", "active"] as const;
export const epicStatuses = ["draft", "in_progress", "completed"] as const;
export const storyTypes = ["outcome_delivery", "governance", "enablement"] as const;
export const storyStatuses = ["draft", "definition_blocked", "ready_for_handoff", "in_progress"] as const;
export const tollgateEntityTypes = ["outcome", "story"] as const;
export const tollgateTypes = ["tg1_baseline", "story_readiness"] as const;
export const tollgateStatuses = ["blocked", "ready", "approved"] as const;
export const governedObjectOriginTypes = ["seeded", "native", "imported"] as const;
export const governedObjectCreatedModes = ["demo", "clean", "promotion"] as const;
export const governedLifecycleStates = ["active", "archived"] as const;
export const governedValueSpineObjectTypes = ["outcome", "epic", "story", "direction_seed", "test"] as const;
export const governedRemovalActionKinds = ["hard_delete", "archive", "restore", "blocked"] as const;
export const lineageSourceTypes = ["artifact_intake_session", "artifact_intake_file", "artifact_aas_candidate"] as const;
export const readinessStates = ["blocked", "in_progress", "ready"] as const;
export const readinessBlockReasonSeverities = ["high", "medium"] as const;
export const artifactIntakeSessionStatuses = [
  "uploaded",
  "source_classification_pending",
  "source_classified",
  "parsing_pending",
  "parsed",
  "mapping_pending",
  "human_review_required",
  "promoted",
  "blocked"
] as const;
export const artifactImportIntents = ["framing", "design"] as const;
export const artifactSourceTypeStatuses = ["pending", "classified"] as const;
export const artifactSourceTypes = ["bmad_prd", "epic_file", "story_file", "mixed_markdown_bundle", "unknown_artifact"] as const;
export const extractionConfidences = ["high", "medium", "low"] as const;
export const artifactParsedSectionKinds = [
  "problem_goal",
  "outcome_candidate",
  "epic_candidate",
  "story_candidate",
  "acceptance_criteria",
  "test_notes",
  "architecture_notes",
  "unmapped"
] as const;
export const artifactAasCandidateTypes = ["outcome", "epic", "story"] as const;
export const artifactAasMappingStates = ["mapped", "uncertain", "missing"] as const;
export const artifactComplianceFindingCategories = ["missing", "uncertain", "human_only", "blocked"] as const;
export const artifactIssueDispositionActions = [
  "corrected",
  "confirmed",
  "not_relevant",
  "pending",
  "blocked"
] as const;
export const artifactCandidateReviewStatuses = [
  "pending",
  "confirmed",
  "edited",
  "rejected",
  "follow_up_needed",
  "promoted"
] as const;
export const importedGovernedReadinessStates = [
  "imported",
  "imported_incomplete",
  "imported_human_review_needed",
  "imported_framing_ready",
  "imported_design_ready",
  "blocked",
  "discarded"
] as const;
export const activityEntityTypes = [
  "organization",
  "outcome",
  "epic",
  "direction_seed",
  "story",
  "tollgate",
  "signoff_record",
  "party_role_entry",
  "agent_registry_entry",
  "artifact_intake_session",
  "artifact_intake_file",
  "artifact_aas_candidate"
] as const;
export const activityEventTypes = [
  "demo_seeded",
  "outcome_created",
  "outcome_updated",
  "epic_created",
  "epic_updated",
  "direction_seed_created",
  "direction_seed_updated",
  "story_created",
  "story_updated",
  "tollgate_recorded",
  "signoff_recorded",
  "execution_contract_generated",
  "governed_removal_requested",
  "governed_hard_deleted",
  "governed_archived",
  "governed_restored",
  "party_role_entry_created",
  "party_role_entry_updated",
  "party_role_entry_deactivated",
  "agent_registry_entry_created",
  "agent_registry_entry_updated",
  "agent_registry_entry_deactivated",
  "artifact_intake_session_created",
  "artifact_file_uploaded",
  "artifact_file_rejected",
  "artifact_candidate_compliance_analyzed",
  "artifact_candidate_confirmed",
  "artifact_candidate_edited",
  "artifact_candidate_rejected",
  "artifact_candidate_follow_up_marked",
  "artifact_candidate_issue_disposition_recorded",
  "artifact_candidate_promoted",
  "artifact_file_section_disposition_recorded",
  "artifact_file_carry_forward_applied",
  "imported_progression_blocked",
  "imported_progression_allowed"
] as const;
export const riskProfiles = ["low", "medium", "high"] as const;
export const aiAccelerationLevels = ["level_1", "level_2", "level_3"] as const;

export const membershipRoleSchema = z.enum(membershipRoles);
export const organizationSideSchema = z.enum(organizationSides);
export const partyRoleTypeSchema = z.enum(partyRoleTypes);
export const agentTypeSchema = z.enum(agentTypes);
export const governanceCoverageStatusSchema = z.enum(governanceCoverageStatuses);
export const signoffDecisionKindSchema = z.enum(signoffDecisionKinds);
export const signoffDecisionStatusSchema = z.enum(signoffDecisionStatuses);
export const authorityResponsibilityAreaSchema = z.enum(authorityResponsibilityAreas);
export const authorityAssignmentKindSchema = z.enum(authorityAssignmentKinds);
export const outcomeStatusSchema = z.enum(outcomeStatuses);
export const epicStatusSchema = z.enum(epicStatuses);
export const storyTypeSchema = z.enum(storyTypes);
export const storyStatusSchema = z.enum(storyStatuses);
export const tollgateEntityTypeSchema = z.enum(tollgateEntityTypes);
export const tollgateTypeSchema = z.enum(tollgateTypes);
export const tollgateStatusSchema = z.enum(tollgateStatuses);
export const governedObjectOriginTypeSchema = z.enum(governedObjectOriginTypes);
export const governedObjectCreatedModeSchema = z.enum(governedObjectCreatedModes);
export const governedLifecycleStateSchema = z.enum(governedLifecycleStates);
export const governedValueSpineObjectTypeSchema = z.enum(governedValueSpineObjectTypes);
export const governedRemovalActionKindSchema = z.enum(governedRemovalActionKinds);
export const lineageSourceTypeSchema = z.enum(lineageSourceTypes);
export const readinessStateSchema = z.enum(readinessStates);
export const readinessBlockReasonSeveritySchema = z.enum(readinessBlockReasonSeverities);
export const artifactIntakeSessionStatusSchema = z.enum(artifactIntakeSessionStatuses);
export const artifactImportIntentSchema = z.enum(artifactImportIntents);
export const artifactSourceTypeStatusSchema = z.enum(artifactSourceTypeStatuses);
export const artifactSourceTypeSchema = z.enum(artifactSourceTypes);
export const extractionConfidenceSchema = z.enum(extractionConfidences);
export const artifactParsedSectionKindSchema = z.enum(artifactParsedSectionKinds);
export const artifactAasCandidateTypeSchema = z.enum(artifactAasCandidateTypes);
export const artifactAasMappingStateSchema = z.enum(artifactAasMappingStates);
export const artifactComplianceFindingCategorySchema = z.enum(artifactComplianceFindingCategories);
export const artifactIssueDispositionActionSchema = z.enum(artifactIssueDispositionActions);
export const artifactCandidateReviewStatusSchema = z.enum(artifactCandidateReviewStatuses);
export const importedGovernedReadinessStateSchema = z.enum(importedGovernedReadinessStates);
export const activityEntityTypeSchema = z.enum(activityEntityTypes);
export const activityEventTypeSchema = z.enum(activityEventTypes);
export const riskProfileSchema = z.enum(riskProfiles);
export const aiAccelerationLevelSchema = z.enum(aiAccelerationLevels);

export type MembershipRole = z.infer<typeof membershipRoleSchema>;
export type OrganizationSide = z.infer<typeof organizationSideSchema>;
export type PartyRoleType = z.infer<typeof partyRoleTypeSchema>;
export type AgentType = z.infer<typeof agentTypeSchema>;
export type GovernanceCoverageStatus = z.infer<typeof governanceCoverageStatusSchema>;
export type SignoffDecisionKind = z.infer<typeof signoffDecisionKindSchema>;
export type SignoffDecisionStatus = z.infer<typeof signoffDecisionStatusSchema>;
export type AuthorityResponsibilityArea = z.infer<typeof authorityResponsibilityAreaSchema>;
export type AuthorityAssignmentKind = z.infer<typeof authorityAssignmentKindSchema>;
export type OutcomeStatus = z.infer<typeof outcomeStatusSchema>;
export type EpicStatus = z.infer<typeof epicStatusSchema>;
export type StoryType = z.infer<typeof storyTypeSchema>;
export type StoryStatus = z.infer<typeof storyStatusSchema>;
export type TollgateEntityType = z.infer<typeof tollgateEntityTypeSchema>;
export type TollgateType = z.infer<typeof tollgateTypeSchema>;
export type TollgateStatus = z.infer<typeof tollgateStatusSchema>;
export type GovernedObjectOriginType = z.infer<typeof governedObjectOriginTypeSchema>;
export type GovernedObjectCreatedMode = z.infer<typeof governedObjectCreatedModeSchema>;
export type GovernedLifecycleState = z.infer<typeof governedLifecycleStateSchema>;
export type GovernedValueSpineObjectType = z.infer<typeof governedValueSpineObjectTypeSchema>;
export type GovernedRemovalActionKind = z.infer<typeof governedRemovalActionKindSchema>;
export type LineageSourceType = z.infer<typeof lineageSourceTypeSchema>;
export type ReadinessState = z.infer<typeof readinessStateSchema>;
export type ReadinessBlockReasonSeverity = z.infer<typeof readinessBlockReasonSeveritySchema>;
export type ArtifactIntakeSessionStatus = z.infer<typeof artifactIntakeSessionStatusSchema>;
export type ArtifactImportIntent = z.infer<typeof artifactImportIntentSchema>;
export type ArtifactSourceTypeStatus = z.infer<typeof artifactSourceTypeStatusSchema>;
export type ArtifactSourceType = z.infer<typeof artifactSourceTypeSchema>;
export type ExtractionConfidence = z.infer<typeof extractionConfidenceSchema>;
export type ArtifactParsedSectionKind = z.infer<typeof artifactParsedSectionKindSchema>;
export type ArtifactAasCandidateType = z.infer<typeof artifactAasCandidateTypeSchema>;
export type ArtifactAasMappingState = z.infer<typeof artifactAasMappingStateSchema>;
export type ArtifactComplianceFindingCategory = z.infer<typeof artifactComplianceFindingCategorySchema>;
export type ArtifactIssueDispositionAction = z.infer<typeof artifactIssueDispositionActionSchema>;
export type ArtifactCandidateReviewStatus = z.infer<typeof artifactCandidateReviewStatusSchema>;
export type ImportedGovernedReadinessState = z.infer<typeof importedGovernedReadinessStateSchema>;
export type ActivityEntityType = z.infer<typeof activityEntityTypeSchema>;
export type ActivityEventType = z.infer<typeof activityEventTypeSchema>;
export type RiskProfile = z.infer<typeof riskProfileSchema>;
export type AiAccelerationLevel = z.infer<typeof aiAccelerationLevelSchema>;
