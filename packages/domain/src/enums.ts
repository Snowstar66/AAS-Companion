import { z } from "zod";

export const membershipRoles = ["value_owner", "aida", "aqa", "architect", "delivery_lead", "builder"] as const;
export const outcomeStatuses = ["draft", "baseline_in_progress", "ready_for_tg1", "active"] as const;
export const epicStatuses = ["draft", "in_progress", "completed"] as const;
export const storyTypes = ["outcome_delivery", "governance", "enablement"] as const;
export const storyStatuses = ["draft", "definition_blocked", "ready_for_handoff", "in_progress"] as const;
export const tollgateEntityTypes = ["outcome", "story"] as const;
export const tollgateTypes = ["tg1_baseline", "story_readiness"] as const;
export const tollgateStatuses = ["blocked", "ready", "approved"] as const;
export const activityEntityTypes = ["organization", "outcome", "epic", "story", "tollgate"] as const;
export const activityEventTypes = [
  "demo_seeded",
  "outcome_created",
  "outcome_updated",
  "story_created",
  "story_updated",
  "tollgate_recorded"
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
export type ActivityEntityType = z.infer<typeof activityEntityTypeSchema>;
export type ActivityEventType = z.infer<typeof activityEventTypeSchema>;
export type RiskProfile = z.infer<typeof riskProfileSchema>;
export type AiAccelerationLevel = z.infer<typeof aiAccelerationLevelSchema>;
