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

  const summaryStatus =
    coverage.some((item) => item.status === "missing")
      ? "missing"
      : riskFlags.length > 0
        ? "risky_combination"
        : coverage.some((item) => item.status === "partially_covered")
          ? "partially_covered"
          : "satisfied";

  return {
    coverage,
    riskFlags,
    summaryStatus: governanceCoverageStatusSchema.parse(summaryStatus)
  };
}
