import { z } from "zod";
import {
  agentTypeSchema,
  aiAccelerationLevelSchema,
  authorityAssignmentKindSchema,
  authorityResponsibilityAreaSchema,
  governanceCoverageStatusSchema,
  organizationSideSchema,
  partyRoleTypeSchema
} from "./enums";

export const partyRoleEntryRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().nullish(),
  avatarUrl: z.string().url().nullish(),
  organizationSide: organizationSideSchema,
  roleType: partyRoleTypeSchema,
  roleTitle: z.string().min(1),
  mandateNotes: z.string().nullish(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const partyRoleEntryCreateInputSchema = partyRoleEntryRecordSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    actorId: z.string().nullish()
  });

export const partyRoleEntryUpdateInputSchema = partyRoleEntryCreateInputSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    id: z.string().min(1),
    actorId: z.string().nullish()
  });

export const agentRegistryEntryRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  agentName: z.string().min(1),
  agentType: agentTypeSchema,
  purpose: z.string().min(1),
  scopeOfWork: z.string().min(1),
  allowedArtifactTypes: z.array(z.string().min(1)).default([]),
  allowedActions: z.array(z.string().min(1)).default([]),
  supervisingPartyRoleId: z.string().min(1),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const agentRegistryEntryCreateInputSchema = agentRegistryEntryRecordSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    actorId: z.string().nullish()
  });

export const agentRegistryEntryUpdateInputSchema = agentRegistryEntryCreateInputSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    id: z.string().min(1),
    supervisingPartyRoleId: z.string().min(1),
    actorId: z.string().nullish()
  });

export const governanceRoleRequirementRecordSchema = z.object({
  id: z.string().min(1),
  aiAccelerationLevel: aiAccelerationLevelSchema,
  organizationSide: organizationSideSchema,
  roleType: partyRoleTypeSchema,
  minimumCount: z.number().int().min(1),
  rationale: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const governanceRiskCombinationRuleRecordSchema = z.object({
  id: z.string().min(1),
  aiAccelerationLevel: aiAccelerationLevelSchema,
  primaryRoleType: partyRoleTypeSchema,
  conflictingRoleType: partyRoleTypeSchema,
  rationale: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const governanceCoverageItemSchema = z.object({
  aiAccelerationLevel: aiAccelerationLevelSchema,
  organizationSide: organizationSideSchema,
  roleType: partyRoleTypeSchema,
  minimumCount: z.number().int().min(1),
  matchedCount: z.number().int().min(0),
  totalActiveRoleCount: z.number().int().min(0),
  status: governanceCoverageStatusSchema,
  rationale: z.string().min(1),
  message: z.string().min(1),
  matchedPeople: z.array(
    z.object({
      partyRoleEntryId: z.string().min(1),
      fullName: z.string().min(1),
      email: z.string().email(),
      roleTitle: z.string().min(1)
    })
  )
});

export const governanceRiskFlagSchema = z.object({
  aiAccelerationLevel: aiAccelerationLevelSchema,
  primaryRoleType: partyRoleTypeSchema,
  conflictingRoleType: partyRoleTypeSchema,
  message: z.string().min(1),
  people: z.array(
    z.object({
      fullName: z.string().min(1),
      email: z.string().email()
    })
  )
});

export const governanceAgentSupervisionGapSchema = z.object({
  agentId: z.string().min(1),
  agentName: z.string().min(1),
  supervisingPartyRoleId: z.string().min(1),
  message: z.string().min(1)
});

export const governanceStaffingValidationStatusSchema = z.enum([
  "supports_selected_level",
  "needs_attention",
  "does_not_support_selected_level"
]);

export const governanceRecommendationKindSchema = z.enum([
  "assign_missing_role",
  "separate_conflicting_roles",
  "assign_supervising_human",
  "keep_level_blocked",
  "downgrade_ai_level"
]);

export const governanceRecommendationSchema = z.object({
  kind: governanceRecommendationKindSchema,
  priority: z.enum(["high", "medium"]),
  title: z.string().min(1),
  description: z.string().min(1)
});

export const governanceStaffingValidationSchema = z.object({
  selectedAiLevel: aiAccelerationLevelSchema,
  status: governanceStaffingValidationStatusSchema,
  summaryTitle: z.string().min(1),
  summaryMessage: z.string().min(1),
  staffingSupportsSelectedLevel: z.boolean(),
  missingRoleCount: z.number().int().nonnegative(),
  riskyCombinationCount: z.number().int().nonnegative(),
  supervisionGapCount: z.number().int().nonnegative(),
  furtherGovernanceRequired: z.boolean(),
  recommendations: z.array(governanceRecommendationSchema)
});

export const authorityMatrixRuleSchema = z.object({
  responsibilityArea: authorityResponsibilityAreaSchema,
  summaryLabel: z.string().min(1),
  description: z.string().min(1),
  customerAssignment: authorityAssignmentKindSchema,
  customerRoleTypes: z.array(partyRoleTypeSchema),
  supplierAssignment: authorityAssignmentKindSchema,
  supplierRoleTypes: z.array(partyRoleTypeSchema),
  aiGovernanceAssignment: authorityAssignmentKindSchema,
  aiGovernanceRoleTypes: z.array(partyRoleTypeSchema)
});

export type PartyRoleEntryRecord = z.infer<typeof partyRoleEntryRecordSchema>;
export type PartyRoleEntryCreateInput = z.infer<typeof partyRoleEntryCreateInputSchema>;
export type PartyRoleEntryUpdateInput = z.infer<typeof partyRoleEntryUpdateInputSchema>;
export type AgentRegistryEntryRecord = z.infer<typeof agentRegistryEntryRecordSchema>;
export type AgentRegistryEntryCreateInput = z.infer<typeof agentRegistryEntryCreateInputSchema>;
export type AgentRegistryEntryUpdateInput = z.infer<typeof agentRegistryEntryUpdateInputSchema>;
export type GovernanceRoleRequirementRecord = z.infer<typeof governanceRoleRequirementRecordSchema>;
export type GovernanceRiskCombinationRuleRecord = z.infer<typeof governanceRiskCombinationRuleRecordSchema>;
export type GovernanceCoverageItem = z.infer<typeof governanceCoverageItemSchema>;
export type GovernanceRiskFlag = z.infer<typeof governanceRiskFlagSchema>;
export type GovernanceAgentSupervisionGap = z.infer<typeof governanceAgentSupervisionGapSchema>;
export type GovernanceStaffingValidationStatus = z.infer<typeof governanceStaffingValidationStatusSchema>;
export type GovernanceRecommendation = z.infer<typeof governanceRecommendationSchema>;
export type GovernanceStaffingValidation = z.infer<typeof governanceStaffingValidationSchema>;
export type AuthorityMatrixRule = z.infer<typeof authorityMatrixRuleSchema>;

export const authorityMatrixRules = authorityMatrixRuleSchema.array().parse([
  {
    responsibilityArea: "outcome_ownership",
    summaryLabel: "Outcome ownership",
    description: "Value direction and business ownership of the active outcome.",
    customerAssignment: "owner",
    customerRoleTypes: ["customer_domain_owner", "customer_sponsor", "value_owner"],
    supplierAssignment: "reviewer",
    supplierRoleTypes: ["delivery_lead"],
    aiGovernanceAssignment: "not_assigned",
    aiGovernanceRoleTypes: []
  },
  {
    responsibilityArea: "architecture_review",
    summaryLabel: "Architecture review",
    description: "Architecture soundness before deeper execution decisions.",
    customerAssignment: "reviewer",
    customerRoleTypes: ["customer_domain_owner"],
    supplierAssignment: "owner",
    supplierRoleTypes: ["architect"],
    aiGovernanceAssignment: "not_assigned",
    aiGovernanceRoleTypes: []
  },
  {
    responsibilityArea: "ai_review",
    summaryLabel: "AI review",
    description: "Review of AI usage scope, constraints and governed execution posture.",
    customerAssignment: "reviewer",
    customerRoleTypes: ["customer_sponsor"],
    supplierAssignment: "reviewer",
    supplierRoleTypes: ["aqa", "aida"],
    aiGovernanceAssignment: "approver",
    aiGovernanceRoleTypes: ["ai_governance_lead"]
  },
  {
    responsibilityArea: "risk_acceptance",
    summaryLabel: "Risk acceptance",
    description: "Acceptance of delivery and AI acceleration risk.",
    customerAssignment: "approver",
    customerRoleTypes: ["risk_owner", "customer_sponsor"],
    supplierAssignment: "reviewer",
    supplierRoleTypes: ["architect", "delivery_lead"],
    aiGovernanceAssignment: "reviewer",
    aiGovernanceRoleTypes: ["ai_governance_lead"]
  },
  {
    responsibilityArea: "tollgate_approval",
    summaryLabel: "Tollgate approval",
    description: "Human authority required to move through formal tollgates.",
    customerAssignment: "approver",
    customerRoleTypes: ["customer_sponsor", "value_owner"],
    supplierAssignment: "reviewer",
    supplierRoleTypes: ["architect", "aqa"],
    aiGovernanceAssignment: "reviewer",
    aiGovernanceRoleTypes: ["ai_governance_lead"]
  },
  {
    responsibilityArea: "build_readiness_approval",
    summaryLabel: "Build readiness approval",
    description: "Approval that the implementation slice is ready to move into build execution.",
    customerAssignment: "reviewer",
    customerRoleTypes: ["value_owner"],
    supplierAssignment: "approver",
    supplierRoleTypes: ["delivery_lead", "builder"],
    aiGovernanceAssignment: "reviewer",
    aiGovernanceRoleTypes: ["aqa"]
  },
  {
    responsibilityArea: "escalation_ownership",
    summaryLabel: "Escalation ownership",
    description: "Who owns escalation when delivery or governance ambiguity blocks progress.",
    customerAssignment: "owner",
    customerRoleTypes: ["customer_sponsor"],
    supplierAssignment: "owner",
    supplierRoleTypes: ["delivery_lead"],
    aiGovernanceAssignment: "reviewer",
    aiGovernanceRoleTypes: ["ai_governance_lead"]
  }
]);

export function buildGovernanceCoverageAssessment(input: {
  aiAccelerationLevel: "level_1" | "level_2" | "level_3";
  requirements: GovernanceRoleRequirementRecord[];
  riskRules: GovernanceRiskCombinationRuleRecord[];
  people: PartyRoleEntryRecord[];
  agents?: Array<{
    id: string;
    agentName: string;
    isActive: boolean;
    supervisingPartyRoleId: string;
    supervisingPartyRole?: {
      isActive: boolean;
    } | null;
  }>;
}) {
  const activePeople = input.people.filter((person) => person.isActive);
  const relevantRequirements = input.requirements.filter((rule) => rule.aiAccelerationLevel === input.aiAccelerationLevel);
  const relevantRiskRules = input.riskRules.filter((rule) => rule.aiAccelerationLevel === input.aiAccelerationLevel);

  const coverage = relevantRequirements.map((rule) => {
    const matchedPeople = activePeople.filter(
      (person) => person.organizationSide === rule.organizationSide && person.roleType === rule.roleType
    );
    const totalActiveRoleCount = activePeople.filter((person) => person.roleType === rule.roleType).length;
    const status =
      matchedPeople.length >= rule.minimumCount
        ? "satisfied"
        : totalActiveRoleCount > 0
          ? "partially_covered"
          : "missing";

    return governanceCoverageItemSchema.parse({
      aiAccelerationLevel: rule.aiAccelerationLevel,
      organizationSide: rule.organizationSide,
      roleType: rule.roleType,
      minimumCount: rule.minimumCount,
      matchedCount: matchedPeople.length,
      totalActiveRoleCount,
      status,
      rationale: rule.rationale,
      message:
        status === "satisfied"
          ? `${rule.roleType.replaceAll("_", " ")} is staffed as required.`
          : status === "partially_covered"
            ? `${rule.roleType.replaceAll("_", " ")} exists, but not with the required organization-side coverage.`
            : `${rule.roleType.replaceAll("_", " ")} is missing for ${rule.organizationSide} coverage.`,
      matchedPeople: matchedPeople.map((person) => ({
        partyRoleEntryId: person.id,
        fullName: person.fullName,
        email: person.email,
        roleTitle: person.roleTitle
      }))
    });
  });

  const riskFlags = relevantRiskRules.flatMap((rule) => {
    const primaryPeople = activePeople.filter((person) => person.roleType === rule.primaryRoleType);
    const conflictingPeople = activePeople.filter((person) => person.roleType === rule.conflictingRoleType);
    const riskyPeople = primaryPeople.filter((primaryPerson) =>
      conflictingPeople.some((candidate) => candidate.email === primaryPerson.email)
    );

    if (riskyPeople.length === 0) {
      return [];
    }

    return [
      governanceRiskFlagSchema.parse({
        aiAccelerationLevel: rule.aiAccelerationLevel,
        primaryRoleType: rule.primaryRoleType,
        conflictingRoleType: rule.conflictingRoleType,
        message: rule.rationale,
        people: riskyPeople.map((person) => ({
          fullName: person.fullName,
          email: person.email
        }))
      })
    ];
  });

  const supervisionGaps = (input.agents ?? [])
    .filter((agent) => agent.isActive)
    .filter((agent) => !agent.supervisingPartyRole || agent.supervisingPartyRole.isActive !== true)
    .map((agent) =>
      governanceAgentSupervisionGapSchema.parse({
        agentId: agent.id,
        agentName: agent.agentName,
        supervisingPartyRoleId: agent.supervisingPartyRoleId,
        message: "Active agent lacks an active supervising human."
      })
    );

  const summaryStatus =
    coverage.some((item) => item.status === "missing")
      ? "missing"
      : riskFlags.length > 0 || supervisionGaps.length > 0
        ? "risky_combination"
        : coverage.some((item) => item.status === "partially_covered")
          ? "partially_covered"
          : "satisfied";

  const downgradeTarget =
    input.aiAccelerationLevel === "level_3"
      ? "level_2"
      : input.aiAccelerationLevel === "level_2"
        ? "level_1"
        : null;
  const recommendations: GovernanceRecommendation[] = [];

  for (const item of coverage) {
    if (item.status === "missing" || item.status === "partially_covered") {
      recommendations.push(
        governanceRecommendationSchema.parse({
          kind: "assign_missing_role",
          priority: item.status === "missing" ? "high" : "medium",
          title: `Assign ${item.organizationSide} ${item.roleType.replaceAll("_", " ")}`,
          description:
            item.status === "missing"
              ? `The selected AI level still needs a named ${item.organizationSide} ${item.roleType.replaceAll("_", " ")}.`
              : `Add more explicit ${item.organizationSide} coverage for ${item.roleType.replaceAll("_", " ")} before trusting this AI level.`
        })
      );
    }
  }

  for (const flag of riskFlags) {
    recommendations.push(
      governanceRecommendationSchema.parse({
        kind: "separate_conflicting_roles",
        priority: "high",
        title: `Separate ${flag.primaryRoleType.replaceAll("_", " ")} and ${flag.conflictingRoleType.replaceAll("_", " ")}`,
        description: flag.message
      })
    );
  }

  for (const gap of supervisionGaps) {
    recommendations.push(
      governanceRecommendationSchema.parse({
        kind: "assign_supervising_human",
        priority: "high",
        title: `Assign a supervising human for ${gap.agentName}`,
        description: gap.message
      })
    );
  }

  if (summaryStatus !== "satisfied") {
    recommendations.push(
      governanceRecommendationSchema.parse({
        kind: "keep_level_blocked",
        priority: "high",
        title: `Keep ${input.aiAccelerationLevel.replaceAll("_", " ")} blocked for now`,
        description: "Current staffing and separation do not yet justify a green light for this AI level."
      })
    );
  }

  if (downgradeTarget && (summaryStatus === "missing" || summaryStatus === "risky_combination")) {
    recommendations.push(
      governanceRecommendationSchema.parse({
        kind: "downgrade_ai_level",
        priority: "medium",
        title: `Consider downgrading to ${downgradeTarget.replaceAll("_", " ")}`,
        description: `Until the missing roles, risky combinations or supervision gaps are resolved, ${downgradeTarget.replaceAll("_", " ")} is the safer AAS-aligned fallback.`
      })
    );
  }

  const validationStatus =
    summaryStatus === "satisfied"
      ? "supports_selected_level"
      : summaryStatus === "partially_covered"
        ? "needs_attention"
        : "does_not_support_selected_level";
  const validation = governanceStaffingValidationSchema.parse({
    selectedAiLevel: input.aiAccelerationLevel,
    status: validationStatus,
    summaryTitle:
      validationStatus === "supports_selected_level"
        ? "Staffing supports selected AI level"
        : validationStatus === "needs_attention"
          ? "Staffing still needs attention"
          : "Staffing does not support selected AI level",
    summaryMessage:
      validationStatus === "supports_selected_level"
        ? `Named staffing, role separation and agent supervision support ${input.aiAccelerationLevel.replaceAll("_", " ")}.`
        : validationStatus === "needs_attention"
          ? `The selected AI level has some coverage, but gaps still need to be closed before trusting the staffing picture.`
          : `Missing roles, risky combinations or weak supervision mean the current staffing does not yet support ${input.aiAccelerationLevel.replaceAll("_", " ")}.`,
    staffingSupportsSelectedLevel: validationStatus === "supports_selected_level",
    missingRoleCount: coverage.filter((item) => item.status === "missing").length,
    riskyCombinationCount: riskFlags.length,
    supervisionGapCount: supervisionGaps.length,
    furtherGovernanceRequired: true,
    recommendations
  });

  return {
    coverage,
    riskFlags,
    supervisionGaps,
    summaryStatus: governanceCoverageStatusSchema.parse(summaryStatus),
    validation
  };
}
