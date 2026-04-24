import { randomUUID } from "node:crypto";
import { Prisma } from "../../generated/client";
import { directionSeedCreateInputSchema, directionSeedUpdateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import {
  resolveGovernedObjectProvenance,
  toGovernedObjectProvenanceFields,
  toGovernedObjectProvenanceMetadata
} from "./governed-object-provenance";
import { advanceOutcomeFramingVersion } from "./outcome-repository";

export async function listDirectionSeeds(organizationId: string, options?: { includeArchived?: boolean }) {
  const where: Prisma.DirectionSeedWhereInput = {
    organizationId
  };

  if (!options?.includeArchived) {
    where.lifecycleState = "active";
  }

  return prisma.directionSeed.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function listDirectionSeedKeys(organizationId: string) {
  return prisma.directionSeed.findMany({
    where: {
      organizationId,
      key: {
        startsWith: "SEED-"
      }
    },
    select: {
      key: true
    }
  });
}

export async function getDirectionSeedById(organizationId: string, id: string) {
  return prisma.directionSeed.findFirst({
    where: {
      organizationId,
      id
    }
  });
}

export async function getDirectionSeedBySourceStoryId(organizationId: string, sourceStoryId: string) {
  return prisma.directionSeed.findFirst({
    where: {
      organizationId,
      sourceStoryId
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function createDirectionSeed(input: unknown, db: Prisma.TransactionClient | typeof prisma = prisma) {
  const parsed = directionSeedCreateInputSchema.parse(input);
  const provenance = resolveGovernedObjectProvenance(parsed);

  const persist = async (tx: Prisma.TransactionClient) => {
    const seed = await tx.directionSeed.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        outcomeId: parsed.outcomeId,
        epicId: parsed.epicId,
        key: parsed.key,
        title: parsed.title,
        shortDescription: parsed.shortDescription,
        expectedBehavior: parsed.expectedBehavior ?? null,
        uxSketchName: parsed.uxSketchName ?? null,
        uxSketchContentType: parsed.uxSketchContentType ?? null,
        uxSketchDataUrl: parsed.uxSketchDataUrl ?? null,
        uxSketches: parsed.uxSketches ?? Prisma.JsonNull,
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
        entityType: "direction_seed",
        entityId: seed.id,
        eventType: "direction_seed_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: seed.key,
          importedReadinessState: seed.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    await advanceOutcomeFramingVersion(tx, {
      organizationId: parsed.organizationId,
      outcomeId: parsed.outcomeId
    });

    return seed;
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}

export async function updateDirectionSeed(input: unknown) {
  const parsed = directionSeedUpdateInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.directionSeed.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.id
      }
    });

    if (!existing) {
      throw new Error("Direction seed not found in organization scope.");
    }

    const data: Prisma.DirectionSeedUncheckedUpdateInput = {};
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
      (parsed.epicId !== undefined && parsed.epicId !== existing.epicId) ||
      (parsed.key !== undefined && parsed.key !== existing.key) ||
      (parsed.title !== undefined && parsed.title !== existing.title) ||
      (parsed.shortDescription !== undefined && parsed.shortDescription !== existing.shortDescription) ||
      (parsed.expectedBehavior !== undefined && parsed.expectedBehavior !== existing.expectedBehavior) ||
      (parsed.uxSketchName !== undefined && parsed.uxSketchName !== existing.uxSketchName) ||
      (parsed.uxSketchContentType !== undefined && parsed.uxSketchContentType !== existing.uxSketchContentType) ||
      (parsed.uxSketchDataUrl !== undefined && parsed.uxSketchDataUrl !== existing.uxSketchDataUrl) ||
      parsed.uxSketches !== undefined;

    if (parsed.outcomeId !== undefined) {
      data.outcomeId = parsed.outcomeId;
    }

    if (parsed.epicId !== undefined) {
      data.epicId = parsed.epicId;
    }

    if (parsed.key !== undefined) {
      data.key = parsed.key;
    }

    if (parsed.title !== undefined) {
      data.title = parsed.title;
    }

    if (parsed.shortDescription !== undefined) {
      data.shortDescription = parsed.shortDescription;
    }

    if (parsed.expectedBehavior !== undefined) {
      data.expectedBehavior = parsed.expectedBehavior;
    }

    if (parsed.uxSketchName !== undefined) {
      data.uxSketchName = parsed.uxSketchName;
    }

    if (parsed.uxSketchContentType !== undefined) {
      data.uxSketchContentType = parsed.uxSketchContentType;
    }

    if (parsed.uxSketchDataUrl !== undefined) {
      data.uxSketchDataUrl = parsed.uxSketchDataUrl;
    }

    if (parsed.uxSketches !== undefined) {
      data.uxSketches = parsed.uxSketches ?? Prisma.JsonNull;
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

    const seed = await tx.directionSeed.update({
      where: {
        id: existing.id
      },
      data
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "direction_seed",
        entityId: seed.id,
        eventType: "direction_seed_updated",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: seed.key,
          importedReadinessState: seed.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    if (framingContentChanged) {
      await advanceOutcomeFramingVersion(tx, {
        organizationId: parsed.organizationId,
        outcomeId: seed.outcomeId
      });
    }

    return seed;
  });
}
