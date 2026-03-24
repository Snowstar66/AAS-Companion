import { PrismaClient } from "../generated/client/index.js";

const prisma = new PrismaClient();

const ids = {
  organizationId: "org_demo_control_plane",
  users: {
    valueOwner: "user_demo_value_owner",
    aida: "user_demo_aida",
    aqa: "user_demo_aqa",
    architect: "user_demo_architect",
    deliveryLead: "user_demo_delivery_lead",
    builder: "user_demo_builder"
  },
  memberships: {
    valueOwner: "membership_demo_value_owner",
    aida: "membership_demo_aida",
    aqa: "membership_demo_aqa",
    architect: "membership_demo_architect",
    deliveryLead: "membership_demo_delivery_lead",
    builder: "membership_demo_builder"
  },
  partyRoles: {
    sponsor: "party_role_demo_customer_sponsor",
    domainOwner: "party_role_demo_customer_domain_owner",
    valueOwner: "party_role_demo_value_owner",
    riskOwner: "party_role_demo_risk_owner",
    architect: "party_role_demo_architect",
    aida: "party_role_demo_aida",
    aqa: "party_role_demo_aqa",
    deliveryLead: "party_role_demo_delivery_lead",
    builder: "party_role_demo_builder"
  },
  agents: {
    framing: "agent_demo_framing",
    governance: "agent_demo_governance"
  },
  signoffs: {
    outcomeReview: "signoff_demo_outcome_review",
    storyReview: "signoff_demo_story_review"
  },
  outcomes: {
    draft: "outcome_demo_governance_gap",
    almostReady: "outcome_demo_outcome_readiness"
  },
  epicId: "epic_demo_framing",
  stories: {
    blocked: "story_demo_outcome_workspace",
    ready: "story_demo_execution_contract",
    draft: "story_demo_activity_timeline"
  },
  tollgateId: "tollgate_demo_baseline_blocked",
  activityEventId: "activity_demo_seed"
};

const users = [
  {
    id: ids.users.valueOwner,
    membershipId: ids.memberships.valueOwner,
    email: "value.owner@aas-companion.local",
    fullName: "Demo Value Owner",
    role: "value_owner"
  },
  {
    id: ids.users.aida,
    membershipId: ids.memberships.aida,
    email: "aida@aas-companion.local",
    fullName: "Demo AIDA",
    role: "aida"
  },
  {
    id: ids.users.aqa,
    membershipId: ids.memberships.aqa,
    email: "aqa@aas-companion.local",
    fullName: "Demo AQA",
    role: "aqa"
  },
  {
    id: ids.users.architect,
    membershipId: ids.memberships.architect,
    email: "architect@aas-companion.local",
    fullName: "Demo Architect",
    role: "architect"
  },
  {
    id: ids.users.deliveryLead,
    membershipId: ids.memberships.deliveryLead,
    email: "delivery.lead@aas-companion.local",
    fullName: "Demo Delivery Lead",
    role: "delivery_lead"
  },
  {
    id: ids.users.builder,
    membershipId: ids.memberships.builder,
    email: "builder@aas-companion.local",
    fullName: "Demo Builder",
    role: "builder"
  }
];

const partyRoles = [
  {
    id: ids.partyRoles.sponsor,
    fullName: "Mikael Sponsor",
    email: "mikael.sponsor@customer.local",
    organizationSide: "customer",
    roleType: "customer_sponsor",
    roleTitle: "Executive Sponsor",
    mandateNotes: "Approves escalation and major AI acceleration risk."
  },
  {
    id: ids.partyRoles.domainOwner,
    fullName: "Karin Domain Owner",
    email: "karin.domain@customer.local",
    organizationSide: "customer",
    roleType: "customer_domain_owner",
    roleTitle: "Customer Domain Owner",
    mandateNotes: "Owns outcome framing and domain clarity."
  },
  {
    id: ids.partyRoles.valueOwner,
    fullName: "Demo Value Owner",
    email: "value.owner@aas-companion.local",
    organizationSide: "customer",
    roleType: "value_owner",
    roleTitle: "Value Owner",
    mandateNotes: "Owns business value and framing scope."
  },
  {
    id: ids.partyRoles.riskOwner,
    fullName: "Sara Risk Owner",
    email: "sara.risk@customer.local",
    organizationSide: "customer",
    roleType: "risk_owner",
    roleTitle: "Risk Owner",
    mandateNotes: "Accepts material delivery and AI governance risk."
  },
  {
    id: ids.partyRoles.architect,
    fullName: "Demo Architect",
    email: "architect@aas-companion.local",
    organizationSide: "supplier",
    roleType: "architect",
    roleTitle: "Solution Architect",
    mandateNotes: "Reviews architecture and solution constraints."
  },
  {
    id: ids.partyRoles.aida,
    fullName: "Demo AIDA",
    email: "aida@aas-companion.local",
    organizationSide: "supplier",
    roleType: "aida",
    roleTitle: "AI Delivery Architect",
    mandateNotes: "Shapes governed AI delivery patterns."
  },
  {
    id: ids.partyRoles.aqa,
    fullName: "Demo AQA",
    email: "aqa@aas-companion.local",
    organizationSide: "supplier",
    roleType: "aqa",
    roleTitle: "AI Quality Assurance",
    mandateNotes: "Reviews testability and AI quality posture."
  },
  {
    id: ids.partyRoles.deliveryLead,
    fullName: "Demo Delivery Lead",
    email: "delivery.lead@aas-companion.local",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    roleTitle: "Delivery Lead",
    mandateNotes: "Owns supplier execution readiness and escalation."
  },
  {
    id: ids.partyRoles.builder,
    fullName: "Demo Builder",
    email: "builder@aas-companion.local",
    organizationSide: "supplier",
    roleType: "builder",
    roleTitle: "Builder",
    mandateNotes: "Owns implementation execution inside the governed scope."
  }
];

const governanceRoleRequirements = [
  {
    aiAccelerationLevel: "level_1",
    organizationSide: "customer",
    roleType: "value_owner",
    minimumCount: 1,
    rationale: "Level 1 work still needs a named business owner."
  },
  {
    aiAccelerationLevel: "level_1",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    minimumCount: 1,
    rationale: "Level 1 work needs one supplier-side delivery owner."
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
    rationale: "Level 2 work needs named value ownership."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "customer",
    roleType: "customer_domain_owner",
    minimumCount: 1,
    rationale: "Level 2 work requires explicit customer domain oversight."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "architect",
    minimumCount: 1,
    rationale: "Level 2 work requires architecture review."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "aida",
    minimumCount: 1,
    rationale: "Level 2 work requires named AI delivery oversight."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "aqa",
    minimumCount: 1,
    rationale: "Level 2 work requires AI quality review."
  },
  {
    aiAccelerationLevel: "level_2",
    organizationSide: "supplier",
    roleType: "delivery_lead",
    minimumCount: 1,
    rationale: "Level 2 work needs one supplier delivery owner."
  },
  {
    aiAccelerationLevel: "level_3",
    organizationSide: "customer",
    roleType: "customer_sponsor",
    minimumCount: 1,
    rationale: "Level 3 work requires named sponsor authority."
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
    rationale: "Level 3 work needs one accountable delivery lead."
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
    rationale: "Level 3 work requires a named AI governance lead before approval can be trusted."
  }
];

const governanceRiskCombinationRules = [
  {
    aiAccelerationLevel: "level_2",
    primaryRoleType: "aida",
    conflictingRoleType: "aqa",
    rationale: "The same person should not both shape AI delivery and independently assure AI quality."
  },
  {
    aiAccelerationLevel: "level_3",
    primaryRoleType: "architect",
    conflictingRoleType: "risk_owner",
    rationale: "The same person should not own both solution design and final risk acceptance at Level 3."
  },
  {
    aiAccelerationLevel: "level_3",
    primaryRoleType: "aida",
    conflictingRoleType: "aqa",
    rationale: "Level 3 requires separation between AI delivery design and AI quality sign-off."
  }
];

const agentRegistryEntries = [
  {
    id: ids.agents.framing,
    agentName: "BMAD Framing Agent",
    agentType: "bmad_agent",
    purpose: "Helps teams shape outcomes, epics and stories inside governed project scope.",
    scopeOfWork: "Framing assistance, story shaping and structured drafting for active project work.",
    allowedArtifactTypes: ["outcome", "epic", "story"],
    allowedActions: ["draft", "summarize", "suggest_structure"],
    supervisingPartyRoleId: ids.partyRoles.aida
  },
  {
    id: ids.agents.governance,
    agentName: "Governance Review Agent",
    agentType: "governance_agent",
    purpose: "Highlights readiness gaps and governance concerns before promotion or handoff.",
    scopeOfWork: "Review-only checks against role coverage, readiness posture and traceability evidence.",
    allowedArtifactTypes: ["tollgate", "story", "outcome"],
    allowedActions: ["review", "flag_risks", "summarize_gaps"],
    supervisingPartyRoleId: ids.partyRoles.aqa
  }
];

async function main() {
  await prisma.organization.upsert({
    where: { id: ids.organizationId },
    update: {
      name: "AAS Demo Organization",
      slug: "aas-demo-org"
    },
    create: {
      id: ids.organizationId,
      name: "AAS Demo Organization",
      slug: "aas-demo-org"
    }
  });

  for (const user of users) {
    await prisma.appUser.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        fullName: user.fullName
      },
      create: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    });

    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: ids.organizationId,
          userId: user.id
        }
      },
      update: {
        role: user.role
      },
      create: {
        id: user.membershipId,
        organizationId: ids.organizationId,
        userId: user.id,
        role: user.role
      }
    });
  }

  for (const partyRole of partyRoles) {
    await prisma.partyRoleEntry.upsert({
      where: {
        id: partyRole.id
      },
      update: {
        fullName: partyRole.fullName,
        email: partyRole.email,
        organizationSide: partyRole.organizationSide,
        roleType: partyRole.roleType,
        roleTitle: partyRole.roleTitle,
        mandateNotes: partyRole.mandateNotes,
        isActive: true
      },
      create: {
        id: partyRole.id,
        organizationId: ids.organizationId,
        fullName: partyRole.fullName,
        email: partyRole.email,
        organizationSide: partyRole.organizationSide,
        roleType: partyRole.roleType,
        roleTitle: partyRole.roleTitle,
        mandateNotes: partyRole.mandateNotes,
        isActive: true
      }
    });
  }

  for (const requirement of governanceRoleRequirements) {
    await prisma.governanceRoleRequirement.upsert({
      where: {
        organizationId_aiAccelerationLevel_organizationSide_roleType: {
          organizationId: ids.organizationId,
          aiAccelerationLevel: requirement.aiAccelerationLevel,
          organizationSide: requirement.organizationSide,
          roleType: requirement.roleType
        }
      },
      update: {
        minimumCount: requirement.minimumCount,
        rationale: requirement.rationale
      },
      create: {
        id: `gov_req_${requirement.aiAccelerationLevel}_${requirement.organizationSide}_${requirement.roleType}`,
        organizationId: ids.organizationId,
        aiAccelerationLevel: requirement.aiAccelerationLevel,
        organizationSide: requirement.organizationSide,
        roleType: requirement.roleType,
        minimumCount: requirement.minimumCount,
        rationale: requirement.rationale
      }
    });
  }

  for (const rule of governanceRiskCombinationRules) {
    await prisma.governanceRiskCombinationRule.upsert({
      where: {
        organizationId_aiAccelerationLevel_primaryRoleType_conflictingRoleType: {
          organizationId: ids.organizationId,
          aiAccelerationLevel: rule.aiAccelerationLevel,
          primaryRoleType: rule.primaryRoleType,
          conflictingRoleType: rule.conflictingRoleType
        }
      },
      update: {
        rationale: rule.rationale
      },
      create: {
        id: `gov_risk_${rule.aiAccelerationLevel}_${rule.primaryRoleType}_${rule.conflictingRoleType}`,
        organizationId: ids.organizationId,
        aiAccelerationLevel: rule.aiAccelerationLevel,
        primaryRoleType: rule.primaryRoleType,
        conflictingRoleType: rule.conflictingRoleType,
        rationale: rule.rationale
      }
    });
  }

  for (const agent of agentRegistryEntries) {
    await prisma.agentRegistryEntry.upsert({
      where: {
        id: agent.id
      },
      update: {
        agentName: agent.agentName,
        agentType: agent.agentType,
        purpose: agent.purpose,
        scopeOfWork: agent.scopeOfWork,
        allowedArtifactTypes: agent.allowedArtifactTypes,
        allowedActions: agent.allowedActions,
        supervisingPartyRoleId: agent.supervisingPartyRoleId,
        isActive: true
      },
      create: {
        id: agent.id,
        organizationId: ids.organizationId,
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

  await prisma.outcome.upsert({
    where: {
      organizationId_key: {
        organizationId: ids.organizationId,
        key: "OUT-001"
      }
    },
    update: {
      title: "Close the governance readiness gap",
      status: "draft",
      originType: "seeded",
      createdMode: "demo"
    },
    create: {
      id: ids.outcomes.draft,
      organizationId: ids.organizationId,
      key: "OUT-001",
      title: "Close the governance readiness gap",
      problemStatement: "Teams can accelerate AI delivery faster than they can govern it.",
      outcomeStatement: "Create an AAS control plane that makes delivery status, gates, and evidence explicit.",
      baselineDefinition: null,
      baselineSource: null,
      timeframe: "Q2 2026",
      valueOwnerId: ids.users.valueOwner,
      riskProfile: "high",
      aiAccelerationLevel: "level_2",
      status: "draft",
      originType: "seeded",
      createdMode: "demo"
    }
  });

  await prisma.outcome.upsert({
    where: {
      organizationId_key: {
        organizationId: ids.organizationId,
        key: "OUT-002"
      }
    },
    update: {
      title: "Make outcome delivery reviewable",
      status: "ready_for_tg1",
      originType: "seeded",
      createdMode: "demo"
    },
    create: {
      id: ids.outcomes.almostReady,
      organizationId: ids.organizationId,
      key: "OUT-002",
      title: "Make outcome delivery reviewable",
      problemStatement: "Stakeholders cannot tell if AI-assisted delivery is ready for review.",
      outcomeStatement: "Show a demonstrable path from outcome framing to execution handoff.",
      baselineDefinition: "Manual review against missing baseline fields and missing story test definitions.",
      baselineSource: "Seeded demo records",
      timeframe: "Q2 2026",
      valueOwnerId: ids.users.valueOwner,
      riskProfile: "medium",
      aiAccelerationLevel: "level_2",
      status: "ready_for_tg1",
      originType: "seeded",
      createdMode: "demo"
    }
  });

  await prisma.epic.upsert({
    where: {
      organizationId_key: {
        organizationId: ids.organizationId,
        key: "EPC-001"
      }
    },
    update: {
      title: "Framing and delivery visibility",
      status: "in_progress",
      originType: "seeded",
      createdMode: "demo"
    },
    create: {
      id: ids.epicId,
      organizationId: ids.organizationId,
      outcomeId: ids.outcomes.almostReady,
      key: "EPC-001",
      title: "Framing and delivery visibility",
      purpose: "Connect framing, story readiness, and execution handoff in one governed slice.",
      status: "in_progress",
      originType: "seeded",
      createdMode: "demo"
    }
  });

  const storySeeds = [
    {
      id: ids.stories.blocked,
      key: "M1-STORY-004",
      title: "Build the Home dashboard",
      storyType: "outcome_delivery",
      valueIntent: "Give the value owner a fast read on current control-plane health.",
      acceptanceCriteria: [
        "Home shows core system status.",
        "User can see blocked and ready work."
      ],
      aiUsageScope: ["ui", "copy"],
      testDefinition: null,
      definitionOfDone: ["Dashboard renders", "Counts are tenant-scoped"],
      status: "definition_blocked"
    },
    {
      id: ids.stories.ready,
      key: "M1-STORY-008",
      title: "Preview execution contract",
      storyType: "governance",
      valueIntent: "Allow teams to preview a governed handoff before delivery starts.",
      acceptanceCriteria: [
        "Valid story can produce a preview.",
        "Preview shows required inputs."
      ],
      aiUsageScope: ["contract_generation"],
      testDefinition: "Service-level validation plus smoke coverage for preview entry.",
      definitionOfDone: ["Contract preview loads", "Missing fields are surfaced"],
      status: "ready_for_handoff"
    },
    {
      id: ids.stories.draft,
      key: "M1-STORY-009",
      title: "Show core activity timeline",
      storyType: "enablement",
      valueIntent: "Expose the latest governance-relevant events to reviewers.",
      acceptanceCriteria: [
        "Timeline lists newest events first."
      ],
      aiUsageScope: ["instrumentation"],
      testDefinition: "Repository integration test for append-only event reads.",
      definitionOfDone: ["Events are ordered", "Events remain append-only"],
      status: "draft"
    }
  ];

  for (const story of storySeeds) {
    await prisma.story.upsert({
      where: {
        organizationId_key: {
          organizationId: ids.organizationId,
          key: story.key
        }
      },
      update: {
        title: story.title,
        storyType: story.storyType,
        valueIntent: story.valueIntent,
        acceptanceCriteria: story.acceptanceCriteria,
        aiUsageScope: story.aiUsageScope,
        testDefinition: story.testDefinition,
        definitionOfDone: story.definitionOfDone,
        status: story.status,
        originType: "seeded",
        createdMode: "demo"
      },
      create: {
        id: story.id,
        organizationId: ids.organizationId,
        outcomeId: ids.outcomes.almostReady,
        epicId: ids.epicId,
        key: story.key,
        title: story.title,
        storyType: story.storyType,
        valueIntent: story.valueIntent,
        acceptanceCriteria: story.acceptanceCriteria,
        aiUsageScope: story.aiUsageScope,
        aiAccelerationLevel: "level_2",
        testDefinition: story.testDefinition,
        definitionOfDone: story.definitionOfDone,
        status: story.status,
        originType: "seeded",
        createdMode: "demo"
      }
    });
  }

  await prisma.tollgate.upsert({
    where: {
      organizationId_entityType_entityId_tollgateType: {
        organizationId: ids.organizationId,
        entityType: "outcome",
        entityId: ids.outcomes.draft,
        tollgateType: "tg1_baseline"
      }
    },
    update: {
      status: "blocked",
      blockers: [
        "Baseline definition is missing.",
        "Baseline source is missing."
      ],
      approverRoles: ["value_owner", "architect"],
      comments: "Tollgate 1 remains blocked until baseline fields are completed."
    },
    create: {
      id: ids.tollgateId,
      organizationId: ids.organizationId,
      entityType: "outcome",
      entityId: ids.outcomes.draft,
      tollgateType: "tg1_baseline",
      status: "blocked",
      blockers: [
        "Baseline definition is missing.",
        "Baseline source is missing."
      ],
      approverRoles: ["value_owner", "architect"],
      comments: "Tollgate 1 remains blocked until baseline fields are completed."
    }
  });

  await prisma.signoffRecord.upsert({
    where: {
      id: ids.signoffs.outcomeReview
    },
    update: {
      decisionKind: "review",
      requiredRoleType: "architect",
      actualPartyRoleEntryId: ids.partyRoles.architect,
      actualPersonName: "Demo Architect",
      actualPersonEmail: "architect@aas-companion.local",
      actualRoleTitle: "Solution Architect",
      organizationSide: "supplier",
      decisionStatus: "changes_requested",
      note: "Baseline source still needs explicit evidence before approval can proceed.",
      evidenceReference: "demo://baseline-gap/outcome-001",
      createdBy: ids.users.architect
    },
    create: {
      id: ids.signoffs.outcomeReview,
      organizationId: ids.organizationId,
      entityType: "outcome",
      entityId: ids.outcomes.draft,
      tollgateId: ids.tollgateId,
      tollgateType: "tg1_baseline",
      decisionKind: "review",
      requiredRoleType: "architect",
      actualPartyRoleEntryId: ids.partyRoles.architect,
      actualPersonName: "Demo Architect",
      actualPersonEmail: "architect@aas-companion.local",
      actualRoleTitle: "Solution Architect",
      organizationSide: "supplier",
      decisionStatus: "changes_requested",
      note: "Baseline source still needs explicit evidence before approval can proceed.",
      evidenceReference: "demo://baseline-gap/outcome-001",
      createdBy: ids.users.architect
    }
  });

  await prisma.signoffRecord.upsert({
    where: {
      id: ids.signoffs.storyReview
    },
    update: {
      decisionKind: "review",
      requiredRoleType: "aqa",
      actualPartyRoleEntryId: ids.partyRoles.aqa,
      actualPersonName: "Demo AQA",
      actualPersonEmail: "aqa@aas-companion.local",
      actualRoleTitle: "AI Quality Assurance",
      organizationSide: "supplier",
      decisionStatus: "approved",
      note: "Quality review completed for the ready story.",
      evidenceReference: "demo://handoff/quality-review/story-ready",
      createdBy: ids.users.aqa
    },
    create: {
      id: ids.signoffs.storyReview,
      organizationId: ids.organizationId,
      entityType: "story",
      entityId: ids.stories.ready,
      tollgateType: "story_readiness",
      decisionKind: "review",
      requiredRoleType: "aqa",
      actualPartyRoleEntryId: ids.partyRoles.aqa,
      actualPersonName: "Demo AQA",
      actualPersonEmail: "aqa@aas-companion.local",
      actualRoleTitle: "AI Quality Assurance",
      organizationSide: "supplier",
      decisionStatus: "approved",
      note: "Quality review completed for the ready story.",
      evidenceReference: "demo://handoff/quality-review/story-ready",
      createdBy: ids.users.aqa
    }
  });

  await prisma.activityEvent.upsert({
    where: { id: ids.activityEventId },
    update: {
      metadata: {
        seededBy: "packages/db/prisma/seed.mjs",
        outcomes: 2,
        epics: 1,
        stories: 3,
        tollgates: 1,
        signoffRecords: 2,
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
    },
    create: {
      id: ids.activityEventId,
      organizationId: ids.organizationId,
      actorId: ids.users.valueOwner,
      entityType: "organization",
      entityId: ids.organizationId,
      eventType: "demo_seeded",
      metadata: {
        seededBy: "packages/db/prisma/seed.mjs",
        outcomes: 2,
        epics: 1,
        stories: 3,
        tollgates: 1,
        signoffRecords: 2,
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
