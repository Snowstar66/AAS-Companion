import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import { epicCreateInputSchema, epicUpdateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import {
  resolveGovernedObjectProvenance,
  toGovernedObjectProvenanceFields,
  toGovernedObjectProvenanceMetadata
} from "./governed-object-provenance";

export async function createEpic(input: unknown, db: Prisma.TransactionClient | typeof prisma = prisma) {
  const parsed = epicCreateInputSchema.parse(input);
  const provenance = resolveGovernedObjectProvenance(parsed);

  const persist = async (tx: Prisma.TransactionClient) => {
    const epic = await tx.epic.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        outcomeId: parsed.outcomeId,
        key: parsed.key,
        title: parsed.title,
        purpose: parsed.purpose,
        summary: parsed.summary ?? null,
        status: parsed.status,
        lifecycleState: "active",
        archivedAt: null,
        archiveReason: null,
        importedReadinessState: parsed.importedReadinessState ?? null,
        ...toGovernedObjectProvenanceFields(provenance)
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "epic",
        entityId: epic.id,
        eventType: "epic_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: epic.key,
          status: epic.status,
          importedReadinessState: epic.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    return epic;
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}

export async function listEpics(organizationId: string, options?: { includeArchived?: boolean }) {
  const where: Prisma.EpicWhereInput = {
    organizationId
  };

  if (!options?.includeArchived) {
    where.lifecycleState = "active";
  }

  return prisma.epic.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getEpicById(organizationId: string, id: string) {
  return prisma.epic.findFirst({
    where: {
      organizationId,
      id
    }
  });
}

export async function getEpicWorkspaceSnapshot(organizationId: string, id: string) {
  const [epic, activities] = await prisma.$transaction([
    prisma.epic.findFirst({
      where: {
        organizationId,
        id
      },
      include: {
        outcome: true,
        stories: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    }),
    prisma.activityEvent.findMany({
      where: {
        organizationId,
        entityType: "epic",
        entityId: id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    })
  ]);

  if (!epic) {
    return null;
  }

  const relatedLifecycleState = epic.lifecycleState === "archived" ? "archived" : "active";

  return {
    epic: {
      ...epic,
      stories: epic.stories.filter((story) => story.lifecycleState === relatedLifecycleState)
    },
    activities
  };
}

export async function updateEpic(input: unknown) {
  const parsed = epicUpdateInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.epic.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.id
      }
    });

    if (!existing) {
      throw new Error("Epic not found in organization scope.");
    }

    const data: Prisma.EpicUncheckedUpdateInput = {};
    const provenance = resolveGovernedObjectProvenance({
      organizationId: parsed.organizationId,
      originType: parsed.originType ?? existing.originType,
      createdMode: parsed.createdMode ?? existing.createdMode,
      lineageReference:
        parsed.lineageReference === undefined
          ? existing.lineageSourceType && existing.lineageSourceId
            ? {
                sourceType: existing.lineageSourceType,
                sourceId: existing.lineageSourceId,
                note: existing.lineageNote
              }
            : null
          : parsed.lineageReference
    });

    if (parsed.outcomeId !== undefined) {
      data.outcomeId = parsed.outcomeId;
    }

    if (parsed.key !== undefined) {
      data.key = parsed.key;
    }

    if (parsed.title !== undefined) {
      data.title = parsed.title;
    }

    if (parsed.purpose !== undefined) {
      data.purpose = parsed.purpose;
    }

    if (parsed.summary !== undefined) {
      data.summary = parsed.summary;
    }

    if (parsed.status !== undefined) {
      data.status = parsed.status;
    }

    if (parsed.importedReadinessState !== undefined) {
      data.importedReadinessState = parsed.importedReadinessState;
    }

    if (
      parsed.originType !== undefined ||
      parsed.createdMode !== undefined ||
      parsed.lineageReference !== undefined
    ) {
      Object.assign(data, toGovernedObjectProvenanceFields(provenance));
    }

    const epic = await tx.epic.update({
      where: { id: existing.id },
      data
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "epic",
        entityId: epic.id,
        eventType: "epic_updated",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: epic.key,
          status: epic.status,
          importedReadinessState: epic.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    return epic;
  });
}
