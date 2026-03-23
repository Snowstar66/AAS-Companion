import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import { storyCreateInputSchema, storyUpdateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";

export async function listStories(organizationId: string) {
  return prisma.story.findMany({
    where: { organizationId },
    orderBy: {
      createdAt: "desc"
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

export async function getStoryWorkspaceSnapshot(organizationId: string, id: string) {
  const [story, tollgate, activities] = await prisma.$transaction([
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
    story,
    tollgate,
    activities
  };
}

export async function createStory(input: unknown) {
  const parsed = storyCreateInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
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
        acceptanceCriteria: parsed.acceptanceCriteria,
        aiUsageScope: parsed.aiUsageScope,
        aiAccelerationLevel: parsed.aiAccelerationLevel,
        testDefinition: parsed.testDefinition ?? null,
        definitionOfDone: parsed.definitionOfDone,
        status: parsed.status
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
          status: story.status
        }
      },
      tx
    );

    return story;
  });
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

    if (parsed.status !== undefined) {
      data.status = parsed.status;
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
          status: story.status
        }
      },
      tx
    );

    return story;
  });
}
