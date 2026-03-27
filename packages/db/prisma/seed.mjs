import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../generated/client/index.js";

const prisma = new PrismaClient();

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const seedDataPath = resolve(currentDirectory, "data/aas-demo-replacement.json");
const seedData = JSON.parse(readFileSync(seedDataPath, "utf8"));

const organization = seedData.organization;
const appUsers = seedData.app_users;
const partyRoles = seedData.party_roles;
const outcomes = seedData.outcomes;
const epics = seedData.epics;
const stories = seedData.stories;
const tests = seedData.tests;
const runtimeOverrides = seedData.runtime_seed_overrides;
const expectedShape = seedData.expected_shape;
const organizationId = organization.runtime_id;

const userByRole = new Map(appUsers.map((user) => [user.membership_role, user]));
const partyRoleByType = new Map(partyRoles.map((role) => [role.role_type, role]));
const outcomeIdByCanonical = new Map(outcomes.map((outcome) => [outcome.canonical_id, outcome.runtime_id]));
const epicIdByCanonical = new Map(epics.map((epic) => [epic.canonical_id, epic.runtime_id]));
const testById = new Map(tests.map((test) => [test.test_id, test]));

const governanceRoleRequirements = [
  {
    aiAccelerationLevel: "level_1",
    organizationSide: "customer",
    roleType: "value_owner",
    minimumCount: 1,
    rationale: "Level 1 still needs named business ownership."
  },
  {
    aiAccelerationLevel: "level_1",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    minimumCount: 1,
    rationale: "Level 1 still needs delivery accountability."
  },
  {
    aiAccelerationLevel: "level_1",
    organizationSide: "supplier",
    roleType: "builder",
    minimumCount: 1,
    rationale: "Level 1 execution needs at least one accountable builder."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "customer",
    roleType: "value_owner",
    minimumCount: 1,
    rationale: "Structured acceleration needs named value ownership."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "customer",
    roleType: "customer_domain_owner",
    minimumCount: 1,
    rationale: "Customer-side domain context is required before governed delivery can proceed."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "architect",
    minimumCount: 1,
    rationale: "Structured acceleration requires architecture review."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "aida",
    minimumCount: 1,
    rationale: "Structured acceleration requires named AI delivery oversight."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "aqa",
    minimumCount: 1,
    rationale: "Structured acceleration requires independent AI quality review."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    minimumCount: 1,
    rationale: "Supplier execution still needs an accountable delivery lead."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "customer",
    roleType: "customer_sponsor",
    minimumCount: 1,
    rationale: "Level 3 work requires sponsor authority."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "customer",
    roleType: "customer_domain_owner",
    minimumCount: 1,
    rationale: "Level 3 work requires customer domain ownership."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "customer",
    roleType: "risk_owner",
    minimumCount: 1,
    rationale: "Level 3 work requires explicit risk ownership."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "supplier",
    roleType: "architect",
    minimumCount: 1,
    rationale: "Level 3 work requires architecture control."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "supplier",
    roleType: "aida",
    minimumCount: 1,
    rationale: "Level 3 work requires AI delivery architecture."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "supplier",
    roleType: "aqa",
    minimumCount: 1,
    rationale: "Level 3 work requires AI quality assurance."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    minimumCount: 1,
    rationale: "Level 3 work requires accountable delivery leadership."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "supplier",
    roleType: "builder",
    minimumCount: 1,
    rationale: "Level 3 work still needs direct build ownership."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "supplier",
    roleType: "ai_governance_lead",
    minimumCount: 1,
    rationale: "Level 3 work requires a named AI governance lead."
  }
];

const governanceRiskCombinationRules = [
  {
    aiAccelerationLevel: "level_2",
    primaryRoleType: "value_owner",
    conflictingRoleType: "aqa",
    rationale: "Business approval and independent quality stop authority should stay separated."
  },
  {
    aiAccelerationLevel: "level_2",
    primaryRoleType: "delivery_lead",
    conflictingRoleType: "aqa",
    rationale: "Execution ownership and independent quality review should not collapse into one role."
  },
  {
    aiAccelerationLevel: "level_3",
    primaryRoleType: "architect",
    conflictingRoleType: "risk_owner",
    rationale: "The same person should not own both design and final risk acceptance at level 3."
  }
];

const agentRegistryEntries = [
  {
    id: "agent_demo_framing",
    agentName: "OrderFlow Framing Agent",
    agentType: "bmad_agent",
    purpose: "Supports framing, shaping, and backlog structuring for OrderFlow.",
    scopeOfWork: "Drafting, reframing, decomposition, and traceability support for outcome, epic, and story work.",
    allowedArtifactTypes: ["outcome", "epic", "story"],
    allowedActions: ["draft", "summarize", "suggest_structure"],
    supervisingPartyRoleId: partyRoleByType.get("aida").runtime_id
  },
  {
    id: "agent_demo_governance",
    agentName: "OrderFlow Governance Review Agent",
    agentType: "governance_agent",
    purpose: "Highlights readiness gaps, missing approvals, and evidence-chain issues.",
    scopeOfWork: "Review-only checks against governance coverage, tollgates, traceability, and handoff readiness.",
    allowedArtifactTypes: ["tollgate", "story", "outcome"],
    allowedActions: ["review", "flag_risks", "summarize_gaps"],
    supervisingPartyRoleId: partyRoleByType.get("aqa").runtime_id
  }
];

function ensureValue(value, message) {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function humanize(value) {
  return value.replaceAll("_", " ");
}

function sentenceCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildStoryValueIntent(story) {
  return `Enable a reviewable delivery step for ${story.title.toLowerCase()}.`;
}

function buildStoryAcceptanceCriteria(story) {
  return [
    `${story.title} is described in a way that stakeholders can review.`,
    `${story.key} can be traced to the active outcome and epic.`
  ];
}

function buildStoryDefinitionOfDone(story) {
  return [
    `${story.key} is linked to its governing outcome and epic.`,
    `A human review note exists for ${story.key}.`
  ];
}

function buildStoryAiUsageScope(story) {
  if (story.runtime_story_type === "governance") {
    return ["content"];
  }

  if (story.runtime_story_type === "enablement") {
    return ["content", "test"];
  }

  return story.title.toLowerCase().includes("test") ? ["test", "code"] : ["code"];
}

function buildTestDefinition(story) {
  if (story.runtime_status === "definition_blocked") {
    return null;
  }

  const test = testById.get(story.test_id);

  if (!test) {
    return "Seeded verification plan pending runtime mapping.";
  }

  return `${sentenceCase(test.test_level)} ${humanize(test.test_type)} with ${test.automation} automation.`;
}

async function resetSeedManagedOrganizationState() {
  await prisma.signoffRecord.deleteMany({ where: { organizationId } });
  await prisma.tollgate.deleteMany({ where: { organizationId } });
  await prisma.activityEvent.deleteMany({
    where: {
      organizationId,
      eventType: "demo_seeded"
    }
  });
  await prisma.story.deleteMany({
    where: {
      organizationId,
      originType: "seeded",
      createdMode: "demo"
    }
  });
  await prisma.epic.deleteMany({
    where: {
      organizationId,
      originType: "seeded",
      createdMode: "demo"
    }
  });
  await prisma.outcome.deleteMany({
    where: {
      organizationId,
      originType: "seeded",
      createdMode: "demo"
    }
  });
  await prisma.agentRegistryEntry.deleteMany({ where: { organizationId } });
  await prisma.governanceRiskCombinationRule.deleteMany({ where: { organizationId } });
  await prisma.governanceRoleRequirement.deleteMany({ where: { organizationId } });
  await prisma.partyRoleEntry.deleteMany({ where: { organizationId } });
}

async function main() {
  await prisma.organization.upsert({
    where: { id: organizationId },
    update: {
      name: organization.name,
      slug: organization.slug
    },
    create: {
      id: organizationId,
      name: organization.name,
      slug: organization.slug
    }
  });

  await resetSeedManagedOrganizationState();

  for (const user of appUsers) {
    await prisma.appUser.upsert({
      where: { id: user.runtime_id },
      update: {
        email: user.email,
        fullName: user.full_name
      },
      create: {
        id: user.runtime_id,
        email: user.email,
        fullName: user.full_name
      }
    });

    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.runtime_id
        }
      },
      update: {
        role: user.membership_role
      },
      create: {
        id: user.membership_id,
        organizationId,
        userId: user.runtime_id,
        role: user.membership_role
      }
    });
  }

  for (const partyRole of partyRoles) {
    await prisma.partyRoleEntry.create({
      data: {
        id: partyRole.runtime_id,
        organizationId,
        fullName: partyRole.full_name,
        email: partyRole.email,
        organizationSide: partyRole.organization_side,
        roleType: partyRole.role_type,
        roleTitle: partyRole.role_title,
        mandateNotes:
          partyRole.mandate_notes ??
          `${partyRole.role_title} is a seeded AAS runtime role for ${organization.system_name}.`,
        isActive: true
      }
    });
  }

  for (const requirement of governanceRoleRequirements) {
    await prisma.governanceRoleRequirement.create({
      data: {
        id: `gov_req_${requirement.aiAccelerationLevel}_${requirement.organizationSide}_${requirement.roleType}`,
        organizationId,
        aiAccelerationLevel: requirement.aiAccelerationLevel,
        organizationSide: requirement.organizationSide,
        roleType: requirement.roleType,
        minimumCount: requirement.minimumCount,
        rationale: requirement.rationale
      }
    });
  }

  for (const rule of governanceRiskCombinationRules) {
    await prisma.governanceRiskCombinationRule.create({
      data: {
        id: `gov_risk_${rule.aiAccelerationLevel}_${rule.primaryRoleType}_${rule.conflictingRoleType}`,
        organizationId,
        aiAccelerationLevel: rule.aiAccelerationLevel,
        primaryRoleType: rule.primaryRoleType,
        conflictingRoleType: rule.conflictingRoleType,
        rationale: rule.rationale
      }
    });
  }

  for (const agent of agentRegistryEntries) {
    await prisma.agentRegistryEntry.create({
      data: {
        id: agent.id,
        organizationId,
        agentName: agent.agentName,
        agentType: agent.agentType,
        purpose: agent.purpose,
        scopeOfWork: agent.scopeOfWork,
        allowedArtifactTypes: agent.allowedArtifactTypes,
        allowedActions: agent.allowedActions,
        supervisingPartyRoleId: agent.supervisingPartyRoleId,
        isActive: true
      }
    });
  }

  for (const outcome of outcomes) {
    await prisma.outcome.create({
      data: {
        id: outcome.runtime_id,
        organizationId,
        key: outcome.key,
        title: outcome.title,
        problemStatement: `The current delivery profile in ${organization.system_name} is too slow and too incident-prone to sustain governed change.`,
        outcomeStatement: outcome.outcome_statement,
        baselineDefinition: outcome.baseline_definition,
        baselineSource: outcome.baseline_source,
        timeframe: outcome.timeframe,
        valueOwnerId: ensureValue(userByRole.get("value_owner")?.runtime_id, "Missing demo value owner user."),
        riskProfile: outcome.risk_profile,
        aiAccelerationLevel: outcome.ai_acceleration_level,
        status: outcome.runtime_status,
        originType: "seeded",
        createdMode: "demo"
      }
    });
  }

  for (const epic of epics) {
    await prisma.epic.create({
      data: {
        id: epic.runtime_id,
        organizationId,
        outcomeId: ensureValue(
          outcomeIdByCanonical.get(epic.outcome_canonical_id),
          `Missing outcome mapping for epic ${epic.key}.`
        ),
        key: epic.key,
        title: epic.title,
        purpose: epic.purpose ?? `Advance the outcome through ${epic.title.toLowerCase()}.`,
        summary: epic.summary ?? epic.title,
        status: epic.runtime_status,
        originType: "seeded",
        createdMode: "demo"
      }
    });
  }

  for (const story of stories) {
    await prisma.story.create({
      data: {
        id: story.runtime_id,
        organizationId,
        outcomeId: ensureValue(
          outcomeIdByCanonical.get(story.outcome_canonical_id ?? "O-001"),
          `Missing outcome mapping for story ${story.key}.`
        ),
        epicId: ensureValue(epicIdByCanonical.get(story.epic_canonical_id), `Missing epic mapping for story ${story.key}.`),
        key: story.key,
        title: story.title,
        storyType: story.runtime_story_type,
        valueIntent: story.value_intent ?? buildStoryValueIntent(story),
        acceptanceCriteria: story.acceptance_criteria ?? buildStoryAcceptanceCriteria(story),
        aiUsageScope: story.ai_usage_scope ?? buildStoryAiUsageScope(story),
        aiAccelerationLevel: story.ai_acceleration_level,
        testDefinition: story.test_definition_summary ?? buildTestDefinition(story),
        definitionOfDone: story.definition_of_done ?? buildStoryDefinitionOfDone(story),
        status: story.runtime_status,
        originType: "seeded",
        createdMode: "demo"
      }
    });
  }

  const primaryOutcomeTollgate = runtimeOverrides.primary_outcome_tollgate;
  const handoffStoryTollgate = runtimeOverrides.handoff_story_tollgate;

  await prisma.tollgate.create({
    data: {
      id: primaryOutcomeTollgate.runtime_id,
      organizationId,
      entityType: "outcome",
      entityId: outcomes[0].runtime_id,
      tollgateType: primaryOutcomeTollgate.tollgate_type,
      status: primaryOutcomeTollgate.status,
      blockers: [],
      approverRoles: primaryOutcomeTollgate.approver_roles,
      comments: "OrderFlow framing is seeded as ready for Tollgate 1 review."
    }
  });

  await prisma.tollgate.create({
    data: {
      id: handoffStoryTollgate.runtime_id,
      organizationId,
      entityType: "story",
      entityId: ensureValue(stories.find((story) => story.runtime_status === "ready_for_handoff")?.runtime_id, "Missing ready-for-handoff story."),
      tollgateType: handoffStoryTollgate.tollgate_type,
      status: handoffStoryTollgate.status,
      blockers: [],
      approverRoles: handoffStoryTollgate.approver_roles,
      comments: "Representative OrderFlow delivery slice is seeded as handoff-ready."
    }
  });

  const architectRole = ensureValue(partyRoleByType.get("architect"), "Missing architect party role.");
  const architectUser = ensureValue(userByRole.get("architect"), "Missing architect user.");
  const aqaRole = ensureValue(partyRoleByType.get("aqa"), "Missing AQA party role.");
  const aqaUser = ensureValue(userByRole.get("aqa"), "Missing AQA user.");
  const valueOwnerRole = ensureValue(partyRoleByType.get("value_owner"), "Missing value owner party role.");
  const valueOwnerUser = ensureValue(userByRole.get("value_owner"), "Missing value owner user.");
  const readyStoryId = ensureValue(stories.find((story) => story.runtime_status === "ready_for_handoff")?.runtime_id, "Missing ready story id.");

  await prisma.signoffRecord.create({
    data: {
      id: runtimeOverrides.signoff_records[0].runtime_id,
      organizationId,
      entityType: "outcome",
      entityId: outcomes[0].runtime_id,
      tollgateId: primaryOutcomeTollgate.runtime_id,
      tollgateType: primaryOutcomeTollgate.tollgate_type,
      decisionKind: "review",
      requiredRoleType: "architect",
      actualPartyRoleEntryId: architectRole.runtime_id,
      actualPersonName: architectRole.full_name,
      actualPersonEmail: architectRole.email,
      actualRoleTitle: architectRole.role_title,
      organizationSide: architectRole.organization_side,
      decisionStatus: "approved",
      note: "Architecture and delivery framing are coherent enough to proceed to design review.",
      evidenceReference: "aas://orderflow/outcome/O-001/design-readiness",
      createdBy: architectUser.runtime_id
    }
  });

  await prisma.signoffRecord.create({
    data: {
      id: runtimeOverrides.signoff_records[1].runtime_id,
      organizationId,
      entityType: "story",
      entityId: readyStoryId,
      tollgateId: handoffStoryTollgate.runtime_id,
      tollgateType: handoffStoryTollgate.tollgate_type,
      decisionKind: "review",
      requiredRoleType: "aqa",
      actualPartyRoleEntryId: aqaRole.runtime_id,
      actualPersonName: aqaRole.full_name,
      actualPersonEmail: aqaRole.email,
      actualRoleTitle: aqaRole.role_title,
      organizationSide: aqaRole.organization_side,
      decisionStatus: "approved",
      note: "Quality review is complete for the seeded handoff-ready story.",
      evidenceReference: "aas://orderflow/story/S-002/readiness-review",
      createdBy: aqaUser.runtime_id
    }
  });

  await prisma.signoffRecord.create({
    data: {
      id: runtimeOverrides.signoff_records[2].runtime_id,
      organizationId,
      entityType: "story",
      entityId: readyStoryId,
      tollgateId: handoffStoryTollgate.runtime_id,
      tollgateType: handoffStoryTollgate.tollgate_type,
      decisionKind: "approval",
      requiredRoleType: "value_owner",
      actualPartyRoleEntryId: valueOwnerRole.runtime_id,
      actualPersonName: valueOwnerRole.full_name,
      actualPersonEmail: valueOwnerRole.email,
      actualRoleTitle: valueOwnerRole.role_title,
      organizationSide: valueOwnerRole.organization_side,
      decisionStatus: "approved",
      note: "Value owner accepts the scoped delivery package for controlled handoff.",
      evidenceReference: "aas://orderflow/story/S-002/value-owner-approval",
      createdBy: valueOwnerUser.runtime_id
    }
  });

  await prisma.activityEvent.create({
    data: {
      id: "activity_demo_seed",
      organizationId,
      actorId: valueOwnerUser.runtime_id,
      entityType: "organization",
      entityId: organizationId,
      eventType: "demo_seeded",
      metadata: {
        seededBy: "packages/db/prisma/seed.mjs",
        seedSource: "packages/db/prisma/data/aas-demo-replacement.json",
        outcomes: expectedShape.outcomes,
        epics: expectedShape.epics,
        stories: expectedShape.stories,
        tollgates: 2,
        signoffRecords: runtimeOverrides.signoff_records.length,
        partyRoleEntries: partyRoles.length,
        governanceRoleRequirements: governanceRoleRequirements.length,
        governanceRiskCombinationRules: governanceRiskCombinationRules.length,
        agentRegistryEntries: agentRegistryEntries.length,
        provenance: {
          originType: "seeded",
          createdMode: "demo",
          lineageReference: null
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
