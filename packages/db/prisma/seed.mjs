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

  await prisma.activityEvent.upsert({
    where: { id: ids.activityEventId },
    update: {
      metadata: {
        seededBy: "packages/db/prisma/seed.mjs",
        outcomes: 2,
        epics: 1,
        stories: 3,
        tollgates: 1,
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
