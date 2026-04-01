import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import { epicCreateInputSchema, epicUpdateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import { encodeEpicShape, withEpicShape } from "./epic-shape";
import {
  attachStoryReadinessTollgateStatus,
  mapStoryReadinessTollgateStatusByEntityId
} from "./story-readiness-tollgate";
import {
  resolveGovernedObjectProvenance,
  toGovernedObjectProvenanceFields,
  toGovernedObjectProvenanceMetadata
} from "./governed-object-provenance";
import { advanceOutcomeFramingVersion } from "./outcome-repository";

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
        summary: encodeEpicShape({
          scopeBoundary: parsed.scopeBoundary ?? null,
          riskNote: parsed.riskNote ?? null
        }),
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

    await advanceOutcomeFramingVersion(tx, {
      organizationId: parsed.organizationId,
      outcomeId: parsed.outcomeId
    });

    return withEpicShape(epic);
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

  const epics = await prisma.epic.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    }
  });

  return epics.map((epic) => withEpicShape(epic));
}

export async function getEpicById(organizationId: string, id: string) {
  const epic = await prisma.epic.findFirst({
    where: {
      organizationId,
      id
    }
  });

  return epic ? withEpicShape(epic) : null;
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
        directionSeeds: {
          orderBy: {
            createdAt: "asc"
          }
        },
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

  const storyTollgates = await prisma.tollgate.findMany({
    where: {
      organizationId,
      entityType: "story",
      tollgateType: "story_readiness",
      entityId: {
        in: epic.stories.map((story) => story.id)
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    select: {
      entityId: true,
      status: true
    }
  });

  const relatedLifecycleState = epic.lifecycleState === "archived" ? "archived" : "active";
  const storyTollgateStatuses = mapStoryReadinessTollgateStatusByEntityId(storyTollgates);

  return {
    epic: withEpicShape({
      ...epic,
      directionSeeds: epic.directionSeeds.filter((seed) => seed.lifecycleState === relatedLifecycleState),
      stories: attachStoryReadinessTollgateStatus(
        epic.stories.filter((story) => story.lifecycleState === relatedLifecycleState),
        storyTollgateStatuses
      )
    }),
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
    const existingShape = withEpicShape(existing);
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
    const framingContentChanged =
      (parsed.outcomeId !== undefined && parsed.outcomeId !== existing.outcomeId) ||
      (parsed.key !== undefined && parsed.key !== existing.key) ||
      (parsed.title !== undefined && parsed.title !== existing.title) ||
      (parsed.purpose !== undefined && parsed.purpose !== existing.purpose) ||
      (parsed.scopeBoundary !== undefined && parsed.scopeBoundary !== existingShape.scopeBoundary) ||
      (parsed.riskNote !== undefined && parsed.riskNote !== existingShape.riskNote);

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

    if (parsed.scopeBoundary !== undefined || parsed.riskNote !== undefined) {
      data.summary = encodeEpicShape({
        scopeBoundary: parsed.scopeBoundary === undefined ? existingShape.scopeBoundary : parsed.scopeBoundary,
        riskNote: parsed.riskNote === undefined ? existingShape.riskNote : parsed.riskNote
      });
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

    if (framingContentChanged) {
      await advanceOutcomeFramingVersion(tx, {
        organizationId: parsed.organizationId,
        outcomeId: epic.outcomeId
      });
    }

    return withEpicShape(epic);
  });
}
