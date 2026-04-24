import { randomUUID } from "node:crypto";
import { Prisma } from "../../generated/client";
import { storyCreateInputSchema, storyUpdateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import { withEpicShape } from "./epic-shape";
import {
  resolveGovernedObjectProvenance,
  toGovernedObjectProvenanceFields,
  toGovernedObjectProvenanceMetadata
} from "./governed-object-provenance";

export async function listStories(organizationId: string, options?: { includeArchived?: boolean }) {
  const where: Prisma.StoryWhereInput = {
    organizationId
  };

  if (!options?.includeArchived) {
    where.lifecycleState = "active";
  }

  return prisma.story.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function listStoryKeys(organizationId: string) {
  return prisma.story.findMany({
    where: {
      organizationId,
      key: {
        startsWith: "STR-"
      }
    },
    select: {
      key: true
    }
  });
}

export async function getStoryById(organizationId: string, id: string) {
  return prisma.story.findFirst({
    where: {
      organizationId,
      id
    }
  });
}

export async function countStoriesByDirectionSeedId(organizationId: string, directionSeedId: string) {
  return prisma.story.count({
    where: {
      organizationId,
      sourceDirectionSeedId: directionSeedId
    }
  });
}

export async function listStoriesByDirectionSeedId(organizationId: string, directionSeedId: string) {
  return prisma.story.findMany({
    where: {
      organizationId,
      sourceDirectionSeedId: directionSeedId
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function getStoryWorkspaceSnapshot(organizationId: string, id: string) {
  const [story, tollgate, activities] = await Promise.all([
    prisma.story.findFirst({
      where: {
        organizationId,
        id
      },
      include: {
        outcome: true,
        epic: true
      }
    }),
    prisma.tollgate.findFirst({
      where: {
        organizationId,
        entityType: "story",
        entityId: id,
        tollgateType: "story_readiness"
      }
    }),
    prisma.activityEvent.findMany({
      where: {
        organizationId,
        entityType: "story",
        entityId: id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    })
  ]);

  if (!story) {
    return null;
  }

  return {
    story: {
      ...story,
      epic: withEpicShape(story.epic)
    },
    tollgate,
    activities
  };
}

export async function createStory(input: unknown, db: Prisma.TransactionClient | typeof prisma = prisma) {
  const parsed = storyCreateInputSchema.parse(input);
  const provenance = resolveGovernedObjectProvenance(parsed);

  const persist = async (tx: Prisma.TransactionClient) => {
    const story = await tx.story.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        outcomeId: parsed.outcomeId,
        epicId: parsed.epicId,
        key: parsed.key,
        title: parsed.title,
        storyType: parsed.storyType,
        valueIntent: parsed.valueIntent,
        expectedBehavior: parsed.expectedBehavior ?? null,
        uxSketchName: parsed.uxSketchName ?? null,
        uxSketchContentType: parsed.uxSketchContentType ?? null,
        uxSketchDataUrl: parsed.uxSketchDataUrl ?? null,
        uxSketches: parsed.uxSketches ?? Prisma.JsonNull,
        acceptanceCriteria: parsed.acceptanceCriteria,
        aiUsageScope: parsed.aiUsageScope,
        aiAccelerationLevel: parsed.aiAccelerationLevel,
        testDefinition: parsed.testDefinition ?? null,
        definitionOfDone: parsed.definitionOfDone,
        sourceDirectionSeedId: parsed.sourceDirectionSeedId ?? null,
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
        entityType: "story",
        entityId: story.id,
        eventType: "story_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: story.key,
          status: story.status,
          importedReadinessState: story.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    return story;
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}

export async function updateStory(input: unknown) {
  const parsed = storyUpdateInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.story.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.id
      }
    });

    if (!existing) {
      throw new Error("Story not found in organization scope.");
    }

    const data: Prisma.StoryUncheckedUpdateInput = {};
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

    if (parsed.epicId !== undefined) {
      data.epicId = parsed.epicId;
    }

    if (parsed.key !== undefined) {
      data.key = parsed.key;
    }

    if (parsed.title !== undefined) {
      data.title = parsed.title;
    }

    if (parsed.storyType !== undefined) {
      data.storyType = parsed.storyType;
    }

    if (parsed.valueIntent !== undefined) {
      data.valueIntent = parsed.valueIntent;
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

    if (parsed.acceptanceCriteria !== undefined) {
      data.acceptanceCriteria = parsed.acceptanceCriteria;
    }

    if (parsed.aiUsageScope !== undefined) {
      data.aiUsageScope = parsed.aiUsageScope;
    }

    if (parsed.aiAccelerationLevel !== undefined) {
      data.aiAccelerationLevel = parsed.aiAccelerationLevel;
    }

    if (parsed.testDefinition !== undefined) {
      data.testDefinition = parsed.testDefinition;
    }

    if (parsed.definitionOfDone !== undefined) {
      data.definitionOfDone = parsed.definitionOfDone;
    }

    if (parsed.sourceDirectionSeedId !== undefined) {
      data.sourceDirectionSeedId = parsed.sourceDirectionSeedId;
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

    const story = await tx.story.update({
      where: { id: existing.id },
      data
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "story",
        entityId: story.id,
        eventType: "story_updated",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: story.key,
          status: story.status,
          importedReadinessState: story.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    return story;
  });
}
