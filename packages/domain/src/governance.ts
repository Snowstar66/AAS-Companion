import { z } from "zod";
import {
  agentTypeSchema,
  aiAccelerationLevelSchema,
  authorityAssignmentKindSchema,
  authorityResponsibilityAreaSchema,
  governanceCoverageStatusSchema,
  organizationSideSchema,
  partyRoleTypeSchema,
  type OrganizationSide,
  type PartyRoleType
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

export const governanceRoleCategorySchema = z.enum(["required", "recommended", "optional"]);
export const governanceAdaptiveReadinessSchema = z.enum(["ready", "partial", "not_ready"]);

export const governanceAdaptiveRoleItemSchema = z.object({
  roleType: partyRoleTypeSchema,
  organizationSide: organizationSideSchema,
  category: governanceRoleCategorySchema,
  label: z.string().min(1),
  assignedPeople: z.array(
    z.object({
      id: z.string().min(1),
      fullName: z.string().min(1),
      email: z.string().email(),
      roleTitle: z.string().min(1)
    })
  ),
  status: z.enum(["covered", "gap", "warning"])
});

export const governanceAdaptiveRoleBucketSchema = z.object({
  category: governanceRoleCategorySchema,
  title: z.string().min(1),
  items: z.array(governanceAdaptiveRoleItemSchema)
});

export const governanceAgentExpectationSchema = z.object({
  label: z.string().min(1),
  purpose: z.string().min(1)
});

export const governanceAgentGuidanceSchema = z.object({
  allowedAgents: z.array(governanceAgentExpectationSchema),
  rules: z.array(z.string().min(1))
});

export const governanceReadinessGapSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["gap", "warning"]),
  message: z.string().min(1),
  guidance: z.string().min(1),
  targetSection: z.enum(["human_roles", "ai_agents"])
});

export const governanceAdaptiveCockpitSchema = z.object({
  selectedAiLevel: aiAccelerationLevelSchema,
  readiness: governanceAdaptiveReadinessSchema,
  readinessLabel: z.string().min(1),
  readinessDetail: z.string().min(1),
  keyMissingItems: z.array(z.string().min(1))
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
export type GovernanceRoleCategory = z.infer<typeof governanceRoleCategorySchema>;
export type GovernanceAdaptiveReadiness = z.infer<typeof governanceAdaptiveReadinessSchema>;
export type GovernanceAdaptiveRoleItem = z.infer<typeof governanceAdaptiveRoleItemSchema>;
export type GovernanceAdaptiveRoleBucket = z.infer<typeof governanceAdaptiveRoleBucketSchema>;
export type GovernanceAgentExpectation = z.infer<typeof governanceAgentExpectationSchema>;
export type GovernanceAgentGuidance = z.infer<typeof governanceAgentGuidanceSchema>;
export type GovernanceReadinessGap = z.infer<typeof governanceReadinessGapSchema>;
export type GovernanceAdaptiveCockpit = z.infer<typeof governanceAdaptiveCockpitSchema>;

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

const adaptiveGovernanceLevelDefinitions = {
  level_1: {
    title: "Level 1 - Assisted",
    description: "Human-led delivery with light AI usage."
  },
  level_2: {
    title: "Level 2 - Structured",
    description: "Shared human and AI execution with clearer review coverage."
  },
  level_3: {
    title: "Level 3 - Agentic",
    description: "High AI automation with explicit supervision and traceability."
  }
} as const satisfies Record<
  "level_1" | "level_2" | "level_3",
  {
    title: string;
    description: string;
  }
>;

const adaptiveRoleProfiles = {
  level_1: [
    { roleType: "value_owner", organizationSide: "customer", category: "required", label: "Value Owner" },
    { roleType: "delivery_lead", organizationSide: "supplier", category: "required", label: "Delivery Lead" },
    { roleType: "architect", organizationSide: "supplier", category: "recommended", label: "Architect" },
    { roleType: "aida", organizationSide: "supplier", category: "optional", label: "AIDA (AI Delivery)" },
    { roleType: "aqa", organizationSide: "supplier", category: "optional", label: "AQA (AI Quality Authority)" },
    { roleType: "risk_owner", organizationSide: "customer", category: "optional", label: "Risk Owner" }
  ],
  level_2: [
    { roleType: "value_owner", organizationSide: "customer", category: "required", label: "Value Owner" },
    { roleType: "delivery_lead", organizationSide: "supplier", category: "required", label: "Delivery Lead" },
    { roleType: "architect", organizationSide: "supplier", category: "required", label: "Architect" },
    { roleType: "aqa", organizationSide: "supplier", category: "required", label: "AQA (AI Quality Authority)" },
    { roleType: "aida", organizationSide: "supplier", category: "recommended", label: "AIDA (AI Delivery)" },
    { roleType: "risk_owner", organizationSide: "customer", category: "optional", label: "Risk Owner" },
    { roleType: "ai_governance_lead", organizationSide: "supplier", category: "optional", label: "AI Governance Lead" }
  ],
  level_3: [
    { roleType: "value_owner", organizationSide: "customer", category: "required", label: "Value Owner" },
    { roleType: "delivery_lead", organizationSide: "supplier", category: "required", label: "Delivery Lead" },
    { roleType: "architect", organizationSide: "supplier", category: "required", label: "Architect" },
    { roleType: "aqa", organizationSide: "supplier", category: "required", label: "AQA (AI Quality Authority)" },
    { roleType: "aida", organizationSide: "supplier", category: "required", label: "AIDA (AI Delivery)" },
    { roleType: "ai_governance_lead", organizationSide: "supplier", category: "recommended", label: "AI Governance Lead" },
    { roleType: "risk_owner", organizationSide: "customer", category: "recommended", label: "Risk Owner" },
    { roleType: "customer_domain_owner", organizationSide: "customer", category: "optional", label: "Domain Owner" }
  ]
} as const satisfies Record<
  "level_1" | "level_2" | "level_3",
  ReadonlyArray<{
    roleType: PartyRoleType;
    organizationSide: OrganizationSide;
    category: GovernanceRoleCategory;
    label: string;
  }>
>;

const adaptiveAgentGuidanceProfiles = {
  level_1: {
    allowedAgents: [
      { label: "Code assistant", purpose: "Supports human-led coding work." },
      { label: "Text assistant", purpose: "Refines framing text and documentation." },
      { label: "Basic test generation", purpose: "Suggests straightforward tests under direct supervision." }
    ],
    rules: ["Direct human supervision", "No structured AI workflow required"]
  },
  level_2: {
    allowedAgents: [
      { label: "Structured code generation", purpose: "Supports scoped delivery work with human review." },
      { label: "Test generation", purpose: "Produces draft tests for human review." },
      { label: "Story refinement", purpose: "Improves design and story definition clarity." },
      { label: "Design assistance", purpose: "Supports design structure and documentation." }
    ],
    rules: ["AQA should review AI output", "Human supervision must be explicit", "Prompt and workflow awareness is expected"]
  },
  level_3: {
    allowedAgents: [
      { label: "Agent workflows", purpose: "Coordinates multi-step governed AI work." },
      { label: "Multi-step automation", purpose: "Automates structured delivery activities." },
      { label: "Semi-autonomous execution", purpose: "Runs bounded flows under named human supervision." }
    ],
    rules: ["Every active agent must be registered", "Each active agent needs a named supervisor", "Agent workflows must be documented", "Traceability must stay clear"]
  }
} as const satisfies Record<"level_1" | "level_2" | "level_3", GovernanceAgentGuidance>;

const adaptiveConflictRules = {
  level_1: [] as const,
  level_2: [
    {
      primaryRoleType: "value_owner" as const,
      conflictingRoleType: "aqa" as const,
      message: "Same person holds Value Owner and AQA. Keep business ownership and AI quality review separated where possible."
    },
    {
      primaryRoleType: "delivery_lead" as const,
      conflictingRoleType: "aqa" as const,
      message: "Same person holds Delivery Lead and AQA. Delivery control and independent quality review should not collapse."
    }
  ],
  level_3: [
    {
      primaryRoleType: "value_owner" as const,
      conflictingRoleType: "aqa" as const,
      message: "Same person holds Value Owner and AQA. Level 3 should keep business ownership and AI quality review separated."
    },
    {
      primaryRoleType: "delivery_lead" as const,
      conflictingRoleType: "aqa" as const,
      message: "Same person holds Delivery Lead and AQA. Level 3 needs stronger separation between execution and quality authority."
    },
    {
      primaryRoleType: "architect" as const,
      conflictingRoleType: "risk_owner" as const,
      message: "Same person holds Architect and Risk Owner. Level 3 should separate design authority from final risk acceptance."
    },
    {
      primaryRoleType: "aida" as const,
      conflictingRoleType: "aqa" as const,
      message: "Same person holds AIDA and AQA. Level 3 should separate AI delivery from AI quality authority."
    }
  ]
} as const;

function findMatchingPeople(
  people: PartyRoleEntryRecord[],
  roleType: PartyRoleType,
  organizationSide: OrganizationSide
) {
  return people
    .filter((person) => person.isActive && person.roleType === roleType && person.organizationSide === organizationSide)
    .map((person) => ({
      id: person.id,
      fullName: person.fullName,
      email: person.email,
      roleTitle: person.roleTitle
    }));
}

export function getAdaptiveGovernanceLevelDefinition(aiAccelerationLevel: "level_1" | "level_2" | "level_3") {
  return adaptiveGovernanceLevelDefinitions[aiAccelerationLevel];
}

export function getAdaptiveGovernanceRoleProfile(aiAccelerationLevel: "level_1" | "level_2" | "level_3") {
  return adaptiveRoleProfiles[aiAccelerationLevel];
}

export function getAdaptiveGovernanceAgentGuidance(aiAccelerationLevel: "level_1" | "level_2" | "level_3") {
  return adaptiveAgentGuidanceProfiles[aiAccelerationLevel];
}

export function buildAdaptiveGovernanceAssessment(input: {
  aiAccelerationLevel: "level_1" | "level_2" | "level_3";
  people: PartyRoleEntryRecord[];
  agents: Array<{
    id: string;
    agentName: string;
    purpose: string;
    scopeOfWork: string;
    allowedArtifactTypes: string[];
    allowedActions: string[];
    isActive: boolean;
    supervisingPartyRoleId: string;
    supervisingPartyRole?: {
      isActive: boolean;
    } | null;
  }>;
}) {
  const activePeople = input.people.filter((person) => person.isActive);
  const roleProfile = getAdaptiveGovernanceRoleProfile(input.aiAccelerationLevel);
  const agentGuidance = getAdaptiveGovernanceAgentGuidance(input.aiAccelerationLevel);
  const roleItems = roleProfile.map((profile) =>
    governanceAdaptiveRoleItemSchema.parse({
      ...profile,
      assignedPeople: findMatchingPeople(activePeople, profile.roleType, profile.organizationSide),
      status:
        findMatchingPeople(activePeople, profile.roleType, profile.organizationSide).length > 0
          ? "covered"
          : profile.category === "required"
            ? "gap"
            : "warning"
    })
  );
  const roleBuckets = (["required", "recommended", "optional"] as const).map((category) =>
    governanceAdaptiveRoleBucketSchema.parse({
      category,
      title: category === "required" ? "Required" : category === "recommended" ? "Recommended" : "Optional",
      items: roleItems.filter((item) => item.category === category)
    })
  );

  const readinessGaps: GovernanceReadinessGap[] = [];

  for (const item of roleItems) {
    if (item.category === "required" && item.assignedPeople.length === 0) {
      readinessGaps.push(
        governanceReadinessGapSchema.parse({
          id: `missing-role-${item.organizationSide}-${item.roleType}`,
          status: "gap",
          message: `Missing ${item.label} for ${input.aiAccelerationLevel.replaceAll("_", " ")}.`,
          guidance: "Assign a named active person to this required role.",
          targetSection: "human_roles"
        })
      );
    }
  }

  for (const item of roleItems) {
    if (item.category === "recommended" && item.assignedPeople.length === 0) {
      readinessGaps.push(
        governanceReadinessGapSchema.parse({
          id: `recommended-role-${item.organizationSide}-${item.roleType}`,
          status: "warning",
          message: `${item.label} is recommended for ${input.aiAccelerationLevel.replaceAll("_", " ")} but not yet named.`,
          guidance: "Add this role if you want clearer governance coverage.",
          targetSection: "human_roles"
        })
      );
    }
  }

  for (const rule of adaptiveConflictRules[input.aiAccelerationLevel]) {
    const riskyPeople = activePeople.filter(
      (person) =>
        person.roleType === rule.primaryRoleType &&
        activePeople.some(
          (candidate) => candidate.email === person.email && candidate.roleType === rule.conflictingRoleType
        )
    );

    for (const person of riskyPeople) {
      readinessGaps.push(
        governanceReadinessGapSchema.parse({
          id: `role-conflict-${rule.primaryRoleType}-${rule.conflictingRoleType}-${person.id}`,
          status: "warning",
          message: `Same person holds conflicting roles: ${person.fullName}.`,
          guidance: rule.message,
          targetSection: "human_roles"
        })
      );
    }
  }

  const activeAgents = input.agents.filter((agent) => agent.isActive);

  for (const agent of activeAgents) {
    if (!agent.supervisingPartyRole || agent.supervisingPartyRole.isActive !== true) {
      readinessGaps.push(
        governanceReadinessGapSchema.parse({
          id: `missing-supervisor-${agent.id}`,
          status: "gap",
          message: `Agent "${agent.agentName}" has no active human supervisor.`,
          guidance: "Assign a named active supervisor before trusting this agent in live work.",
          targetSection: "ai_agents"
        })
      );
    }

    if (
      input.aiAccelerationLevel === "level_3" &&
      (agent.allowedActions.length === 0 || agent.allowedArtifactTypes.length === 0)
    ) {
      readinessGaps.push(
        governanceReadinessGapSchema.parse({
          id: `agent-traceability-${agent.id}`,
          status: "warning",
          message: `Agent "${agent.agentName}" needs clearer Level 3 traceability.`,
          guidance: "Document scope, allowed artifacts and allowed actions more explicitly.",
          targetSection: "ai_agents"
        })
      );
    }
  }

  const hardGapCount = readinessGaps.filter((gap) => gap.status === "gap").length;
  const warningCount = readinessGaps.filter((gap) => gap.status === "warning").length;
  const readiness: GovernanceAdaptiveReadiness =
    hardGapCount > 0 ? "not_ready" : warningCount > 0 ? "partial" : "ready";
  const cockpit = governanceAdaptiveCockpitSchema.parse({
    selectedAiLevel: input.aiAccelerationLevel,
    readiness,
    readinessLabel: readiness === "ready" ? "Ready" : readiness === "partial" ? "Partial" : "Not ready",
    readinessDetail:
      readiness === "ready"
        ? "Required roles and agent supervision are in place for the selected AI level."
        : readiness === "partial"
          ? "Required roles are covered, but some governance warnings still need attention."
          : "Required roles or agent supervision are still missing for the selected AI level.",
    keyMissingItems: readinessGaps.slice(0, 4).map((gap) => gap.message)
  });

  return {
    levelDefinition: getAdaptiveGovernanceLevelDefinition(input.aiAccelerationLevel),
    roleBuckets,
    agentGuidance,
    readinessGaps,
    cockpit
  };
}

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
