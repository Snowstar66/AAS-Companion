import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "../../generated/client";
import {
  agentRegistryEntryCreateInputSchema,
  agentRegistryEntryUpdateInputSchema,
  governanceRiskCombinationRuleRecordSchema,
  governanceRoleRequirementRecordSchema,
  partyRoleEntryCreateInputSchema,
  partyRoleEntryRecordSchema,
  partyRoleEntryUpdateInputSchema
} from "@aas-companion/domain";
import { prisma } from "../client";
import { withDevTiming } from "../dev-timing";
import { appendActivityEvent } from "./activity-repository";

type DbClient = Prisma.TransactionClient | PrismaClient;

function buildId(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

async function syncValueOwnerMembershipFromPartyRole(
  tx: Prisma.TransactionClient,
  entry: {
    organizationId: string;
    fullName: string;
    email: string;
    organizationSide: string;
    roleType: string;
    isActive: boolean;
  }
) {
  if (entry.organizationSide !== "customer" || entry.roleType !== "value_owner" || !entry.isActive) {
    return;
  }

  const normalizedEmail = entry.email.trim().toLowerCase();

  if (!normalizedEmail) {
    return;
  }

  const appUser = await tx.appUser.upsert({
    where: {
      email: normalizedEmail
    },
    update: {
      fullName: entry.fullName.trim() || null
    },
    create: {
      id: buildId("user"),
      email: normalizedEmail,
      fullName: entry.fullName.trim() || null
    },
    select: {
      id: true
    }
  });

  await tx.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: entry.organizationId,
        userId: appUser.id
      }
    },
    update: {
      role: "value_owner"
    },
    create: {
      id: buildId("membership"),
      organizationId: entry.organizationId,
      userId: appUser.id,
      role: "value_owner"
    }
  });
}

async function cleanupValueOwnerMembershipFromPartyRoleRemoval(
  tx: Prisma.TransactionClient,
  entry: {
    organizationId: string;
    email: string;
    organizationSide: string;
    roleType: string;
  }
) {
  if (entry.organizationSide !== "customer" || entry.roleType !== "value_owner") {
    return;
  }

  const normalizedEmail = entry.email.trim().toLowerCase();

  if (!normalizedEmail) {
    return;
  }

  const appUser = await tx.appUser.findUnique({
    where: {
      email: normalizedEmail
    },
    select: {
      id: true
    }
  });

  if (!appUser) {
    return;
  }

  await tx.outcome.updateMany({
    where: {
      organizationId: entry.organizationId,
      valueOwnerId: appUser.id
    },
    data: {
      valueOwnerId: null
    }
  });

  await tx.membership.deleteMany({
    where: {
      organizationId: entry.organizationId,
      userId: appUser.id,
      role: "value_owner"
    }
  });
}

async function requireActiveSupervisor(
  db: Prisma.TransactionClient,
  organizationId: string,
  supervisorId: string
) {
  const supervisor = await db.partyRoleEntry.findFirst({
    where: {
      organizationId,
      id: supervisorId,
      isActive: true
    }
  });

  if (!supervisor) {
    throw new Error("An active supervising party role is required for every registered agent.");
  }

  return supervisor;
}

export async function listPartyRoleEntries(organizationId: string, options?: { includeInactive?: boolean }) {
  return withDevTiming("db.listPartyRoleEntries", async () => {
    const entries = await prisma.partyRoleEntry.findMany({
      where: {
        organizationId,
        ...(options?.includeInactive ? {} : { isActive: true })
      },
      orderBy: [{ isActive: "desc" }, { organizationSide: "asc" }, { roleType: "asc" }, { fullName: "asc" }]
    });

    return entries.map((entry) => partyRoleEntryRecordSchema.parse(entry));
  }, `organizationId=${organizationId}`);
}

export async function createPartyRoleEntry(input: unknown, db: DbClient = prisma) {
  const parsed = partyRoleEntryCreateInputSchema.parse(input);

  const persist = async (tx: Prisma.TransactionClient) => {
    const entry = await tx.partyRoleEntry.create({
      data: {
        id: buildId("party_role"),
        organizationId: parsed.organizationId,
        fullName: parsed.fullName,
        email: parsed.email,
        phoneNumber: parsed.phoneNumber ?? null,
        avatarUrl: parsed.avatarUrl ?? null,
        organizationSide: parsed.organizationSide,
        roleType: parsed.roleType,
        roleTitle: parsed.roleTitle,
        mandateNotes: parsed.mandateNotes ?? null,
        isActive: parsed.isActive
      }
    });

    await syncValueOwnerMembershipFromPartyRole(tx, entry);

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "party_role_entry",
        entityId: entry.id,
        eventType: "party_role_entry_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          fullName: entry.fullName,
          email: entry.email,
          organizationSide: entry.organizationSide,
          roleType: entry.roleType,
          isActive: entry.isActive
        }
      },
      tx
    );

    return partyRoleEntryRecordSchema.parse(entry);
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}

export async function updatePartyRoleEntry(input: unknown) {
  const parsed = partyRoleEntryUpdateInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.partyRoleEntry.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.id
      }
    });

    if (!existing) {
      throw new Error("Party role entry not found in organization scope.");
    }

    const data: Prisma.PartyRoleEntryUpdateInput = {};

    if (parsed.fullName !== undefined) {
      data.fullName = parsed.fullName;
    }

    if (parsed.email !== undefined) {
      data.email = parsed.email;
    }

    if (parsed.phoneNumber !== undefined) {
      data.phoneNumber = parsed.phoneNumber ?? null;
    }

    if (parsed.avatarUrl !== undefined) {
      data.avatarUrl = parsed.avatarUrl ?? null;
    }

    if (parsed.organizationSide !== undefined) {
      data.organizationSide = parsed.organizationSide;
    }

    if (parsed.roleType !== undefined) {
      data.roleType = parsed.roleType;
    }

    if (parsed.roleTitle !== undefined) {
      data.roleTitle = parsed.roleTitle;
    }

    if (parsed.mandateNotes !== undefined) {
      data.mandateNotes = parsed.mandateNotes ?? null;
    }

    if (parsed.isActive !== undefined) {
      data.isActive = parsed.isActive;
    }

    const entry = await tx.partyRoleEntry.update({
      where: {
        id: existing.id
      },
      data
    });

    await syncValueOwnerMembershipFromPartyRole(tx, entry);

    const eventType =
      existing.isActive && entry.isActive === false ? "party_role_entry_deactivated" : "party_role_entry_updated";

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "party_role_entry",
        entityId: entry.id,
        eventType,
        actorId: parsed.actorId ?? null,
        metadata: {
          fullName: entry.fullName,
          email: entry.email,
          organizationSide: entry.organizationSide,
          roleType: entry.roleType,
          isActive: entry.isActive
        }
      },
      tx
    );

    return partyRoleEntryRecordSchema.parse(entry);
  });
}

export async function hardDeletePartyRoleEntry(input: {
  organizationId: string;
  id: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.partyRoleEntry.findFirst({
      where: {
        organizationId: input.organizationId,
        id: input.id
      }
    });

    if (!existing) {
      throw new Error("Party role entry not found in organization scope.");
    }

    await cleanupValueOwnerMembershipFromPartyRoleRemoval(tx, existing);

    await appendActivityEvent(
      {
        organizationId: input.organizationId,
        entityType: "party_role_entry",
        entityId: existing.id,
        eventType: "party_role_entry_deactivated",
        actorId: input.actorId ?? null,
        metadata: {
          fullName: existing.fullName,
          email: existing.email,
          organizationSide: existing.organizationSide,
          roleType: existing.roleType,
          isActive: false,
          removed: true
        }
      },
      tx
    );

    await tx.partyRoleEntry.delete({
      where: {
        id: existing.id
      }
    });

    return partyRoleEntryRecordSchema.parse(existing);
  });
}

export async function listAgentRegistryEntries(organizationId: string, options?: { includeInactive?: boolean }) {
  return prisma.agentRegistryEntry.findMany({
    where: {
      organizationId,
      ...(options?.includeInactive ? {} : { isActive: true })
    },
    include: {
      supervisingPartyRole: true
    },
    orderBy: [{ isActive: "desc" }, { agentType: "asc" }, { agentName: "asc" }]
  });
}

export async function createAgentRegistryEntry(input: unknown, db: DbClient = prisma) {
  const parsed = agentRegistryEntryCreateInputSchema.parse(input);

  const persist = async (tx: Prisma.TransactionClient) => {
    const supervisor = await requireActiveSupervisor(tx, parsed.organizationId, parsed.supervisingPartyRoleId);
    const entry = await tx.agentRegistryEntry.create({
      data: {
        id: buildId("agent_registry"),
        organizationId: parsed.organizationId,
        agentName: parsed.agentName,
        agentType: parsed.agentType,
        purpose: parsed.purpose,
        scopeOfWork: parsed.scopeOfWork,
        allowedArtifactTypes: parsed.allowedArtifactTypes,
        allowedActions: parsed.allowedActions,
        supervisingPartyRoleId: parsed.supervisingPartyRoleId,
        isActive: parsed.isActive
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "agent_registry_entry",
        entityId: entry.id,
        eventType: "agent_registry_entry_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          agentName: entry.agentName,
          agentType: entry.agentType,
          supervisingPartyRoleId: entry.supervisingPartyRoleId,
          supervisorFullName: supervisor.fullName,
          isActive: entry.isActive
        }
      },
      tx
    );

    return entry;
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}

export async function updateAgentRegistryEntry(input: unknown) {
  const parsed = agentRegistryEntryUpdateInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.agentRegistryEntry.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.id
      }
    });

    if (!existing) {
      throw new Error("Agent registry entry not found in organization scope.");
    }

    const supervisor = await requireActiveSupervisor(
      tx,
      parsed.organizationId,
      parsed.supervisingPartyRoleId ?? existing.supervisingPartyRoleId
    );

    const data: Prisma.AgentRegistryEntryUpdateInput = {};

    if (parsed.agentName !== undefined) {
      data.agentName = parsed.agentName;
    }

    if (parsed.agentType !== undefined) {
      data.agentType = parsed.agentType;
    }

    if (parsed.purpose !== undefined) {
      data.purpose = parsed.purpose;
    }

    if (parsed.scopeOfWork !== undefined) {
      data.scopeOfWork = parsed.scopeOfWork;
    }

    if (parsed.allowedArtifactTypes !== undefined) {
      data.allowedArtifactTypes = parsed.allowedArtifactTypes;
    }

    if (parsed.allowedActions !== undefined) {
      data.allowedActions = parsed.allowedActions;
    }

    if (parsed.supervisingPartyRoleId !== undefined) {
      data.supervisingPartyRole = {
        connect: {
          id: parsed.supervisingPartyRoleId
        }
      };
    }

    if (parsed.isActive !== undefined) {
      data.isActive = parsed.isActive;
    }

    const entry = await tx.agentRegistryEntry.update({
      where: {
        id: existing.id
      },
      data
    });

    const eventType =
      existing.isActive && entry.isActive === false ? "agent_registry_entry_deactivated" : "agent_registry_entry_updated";

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "agent_registry_entry",
        entityId: entry.id,
        eventType,
        actorId: parsed.actorId ?? null,
        metadata: {
          agentName: entry.agentName,
          agentType: entry.agentType,
          supervisingPartyRoleId: entry.supervisingPartyRoleId,
          supervisorFullName: supervisor.fullName,
          isActive: entry.isActive
        }
      },
      tx
    );

    return entry;
  });
}

export async function listGovernanceRoleRequirements(organizationId: string) {
  const rules = await prisma.governanceRoleRequirement.findMany({
    where: {
      organizationId
    },
    orderBy: [{ aiAccelerationLevel: "asc" }, { organizationSide: "asc" }, { roleType: "asc" }]
  });

  return rules.map((rule) => governanceRoleRequirementRecordSchema.parse(rule));
}

export async function listGovernanceRiskCombinationRules(organizationId: string) {
  const rules = await prisma.governanceRiskCombinationRule.findMany({
    where: {
      organizationId
    },
    orderBy: [{ aiAccelerationLevel: "asc" }, { primaryRoleType: "asc" }, { conflictingRoleType: "asc" }]
  });

  return rules.map((rule) => governanceRiskCombinationRuleRecordSchema.parse(rule));
}
