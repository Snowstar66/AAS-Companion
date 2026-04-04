import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "../../generated/client";
import { activityEventCreateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";

type DbClient = Prisma.TransactionClient | PrismaClient;

async function resolveExistingActorId(
  actorId: string | null | undefined,
  db: DbClient
) {
  if (!actorId) {
    return null;
  }

  const existingActor = await db.appUser.findUnique({
    where: {
      id: actorId
    },
    select: {
      id: true
    }
  });

  return existingActor?.id ?? null;
}

export async function appendActivityEvent(
  input: unknown,
  db: DbClient = prisma
) {
  const parsed = activityEventCreateInputSchema.parse(input);
  const actorId = await resolveExistingActorId(parsed.actorId ?? null, db);
  const data: Prisma.ActivityEventUncheckedCreateInput = {
    id: randomUUID(),
    organizationId: parsed.organizationId,
    entityType: parsed.entityType,
    entityId: parsed.entityId,
    eventType: parsed.eventType as never,
    actorId
  };

  if (parsed.metadata) {
    data.metadata = parsed.metadata as Prisma.InputJsonValue;
  }

  return db.activityEvent.create({
    data
  });
}

export async function listActivityEventsForEntity(organizationId: string, entityType: string, entityId: string) {
  return prisma.activityEvent.findMany({
    where: {
      organizationId,
      entityType: entityType as never,
      entityId
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function listOperationalActivityEventsForOrganization(input: {
  organizationId: string;
  limit?: number;
}) {
  return prisma.activityEvent.findMany({
    where: {
      organizationId: input.organizationId,
      eventType: "operational_log_recorded"
    },
    include: {
      actor: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: Math.max(1, Math.min(input.limit ?? 40, 100))
  });
}
