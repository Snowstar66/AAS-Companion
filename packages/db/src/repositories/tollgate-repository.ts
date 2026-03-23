import { randomUUID } from "node:crypto";
import { tollgateUpsertInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";

export async function getTollgate(
  organizationId: string,
  entityType: string,
  entityId: string,
  tollgateType: string
) {
  return prisma.tollgate.findFirst({
    where: {
      organizationId,
      entityType: entityType as never,
      entityId,
      tollgateType: tollgateType as never
    }
  });
}

export async function upsertTollgate(input: unknown) {
  const parsed = tollgateUpsertInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const tollgate = await tx.tollgate.upsert({
      where: {
        organizationId_entityType_entityId_tollgateType: {
          organizationId: parsed.organizationId,
          entityType: parsed.entityType,
          entityId: parsed.entityId,
          tollgateType: parsed.tollgateType
        }
      },
      update: {
        status: parsed.status,
        blockers: parsed.blockers,
        approverRoles: parsed.approverRoles,
        decidedBy: parsed.decidedBy ?? null,
        decidedAt: parsed.decidedAt ?? null,
        comments: parsed.comments ?? null
      },
      create: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        entityType: parsed.entityType,
        entityId: parsed.entityId,
        tollgateType: parsed.tollgateType,
        status: parsed.status,
        blockers: parsed.blockers,
        approverRoles: parsed.approverRoles,
        decidedBy: parsed.decidedBy ?? null,
        decidedAt: parsed.decidedAt ?? null,
        comments: parsed.comments ?? null
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "tollgate",
        entityId: tollgate.id,
        eventType: "tollgate_recorded",
        actorId: parsed.actorId ?? null,
        metadata: {
          entityType: tollgate.entityType,
          tollgateType: tollgate.tollgateType,
          status: tollgate.status
        }
      },
      tx
    );

    return tollgate;
  });
}
