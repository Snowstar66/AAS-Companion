import { z } from "zod";

export const membershipRoles = ["value_owner", "aida", "aqa", "architect", "delivery_lead", "builder"] as const;
export const outcomeStatuses = ["draft", "baseline_in_progress", "ready_for_tg1", "active"] as const;
export const epicStatuses = ["draft", "in_progress", "completed"] as const;
export const storyTypes = ["outcome_delivery", "governance", "enablement"] as const;
export const storyStatuses = ["draft", "definition_blocked", "ready_for_handoff", "in_progress"] as const;
export const tollgateEntityTypes = ["outcome", "story"] as const;
export const tollgateTypes = ["tg1_baseline", "story_readiness"] as const;
export const tollgateStatuses = ["blocked", "ready", "approved"] as const;
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
export const activityEntityTypes = [
  "organization",
  "outcome",
  "epic",
  "story",
  "tollgate",
  "artifact_intake_session",
  "artifact_intake_file"
] as const;
export const activityEventTypes = [
  "demo_seeded",
  "outcome_created",
  "outcome_updated",
  "story_created",
  "story_updated",
  "tollgate_recorded",
  "execution_contract_generated",
  "artifact_intake_session_created",
  "artifact_file_uploaded",
  "artifact_file_rejected"
] as const;
export const riskProfiles = ["low", "medium", "high"] as const;
export const aiAccelerationLevels = ["level_2"] as const;

export const membershipRoleSchema = z.enum(membershipRoles);
export const outcomeStatusSchema = z.enum(outcomeStatuses);
export const epicStatusSchema = z.enum(epicStatuses);
export const storyTypeSchema = z.enum(storyTypes);
export const storyStatusSchema = z.enum(storyStatuses);
export const tollgateEntityTypeSchema = z.enum(tollgateEntityTypes);
export const tollgateTypeSchema = z.enum(tollgateTypes);
export const tollgateStatusSchema = z.enum(tollgateStatuses);
export const artifactIntakeSessionStatusSchema = z.enum(artifactIntakeSessionStatuses);
export const artifactSourceTypeStatusSchema = z.enum(artifactSourceTypeStatuses);
export const artifactSourceTypeSchema = z.enum(artifactSourceTypes);
export const extractionConfidenceSchema = z.enum(extractionConfidences);
export const artifactParsedSectionKindSchema = z.enum(artifactParsedSectionKinds);
export const artifactAasCandidateTypeSchema = z.enum(artifactAasCandidateTypes);
export const artifactAasMappingStateSchema = z.enum(artifactAasMappingStates);
export const activityEntityTypeSchema = z.enum(activityEntityTypes);
export const activityEventTypeSchema = z.enum(activityEventTypes);
export const riskProfileSchema = z.enum(riskProfiles);
export const aiAccelerationLevelSchema = z.enum(aiAccelerationLevels);

export type MembershipRole = z.infer<typeof membershipRoleSchema>;
export type OutcomeStatus = z.infer<typeof outcomeStatusSchema>;
export type EpicStatus = z.infer<typeof epicStatusSchema>;
export type StoryType = z.infer<typeof storyTypeSchema>;
export type StoryStatus = z.infer<typeof storyStatusSchema>;
export type TollgateEntityType = z.infer<typeof tollgateEntityTypeSchema>;
export type TollgateType = z.infer<typeof tollgateTypeSchema>;
export type TollgateStatus = z.infer<typeof tollgateStatusSchema>;
export type ArtifactIntakeSessionStatus = z.infer<typeof artifactIntakeSessionStatusSchema>;
export type ArtifactSourceTypeStatus = z.infer<typeof artifactSourceTypeStatusSchema>;
export type ArtifactSourceType = z.infer<typeof artifactSourceTypeSchema>;
export type ExtractionConfidence = z.infer<typeof extractionConfidenceSchema>;
export type ArtifactParsedSectionKind = z.infer<typeof artifactParsedSectionKindSchema>;
export type ArtifactAasCandidateType = z.infer<typeof artifactAasCandidateTypeSchema>;
export type ArtifactAasMappingState = z.infer<typeof artifactAasMappingStateSchema>;
export type ActivityEntityType = z.infer<typeof activityEntityTypeSchema>;
export type ActivityEventType = z.infer<typeof activityEventTypeSchema>;
export type RiskProfile = z.infer<typeof riskProfileSchema>;
export type AiAccelerationLevel = z.infer<typeof aiAccelerationLevelSchema>;
