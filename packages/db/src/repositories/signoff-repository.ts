import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "../../generated/client";
import { signoffRecordCreateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";

type DbClient = Prisma.TransactionClient | PrismaClient;

export async function listSignoffRecordsForEntity(
  organizationId: string,
  entityType: "outcome" | "story",
  entityId: string
) {
  return prisma.signoffRecord.findMany({
    where: {
      organizationId,
      entityType,
      entityId
    },
    include: {
      actualPartyRoleEntry: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function listSignoffRecordsForTollgate(organizationId: string, tollgateId: string) {
  return prisma.signoffRecord.findMany({
    where: {
      organizationId,
      tollgateId
    },
    include: {
      actualPartyRoleEntry: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function listSignoffRecordsForOrganization(organizationId: string) {
  return prisma.signoffRecord.findMany({
    where: {
      organizationId
    },
    include: {
      actualPartyRoleEntry: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function createSignoffRecord(input: unknown, db: DbClient = prisma) {
  const parsed = signoffRecordCreateInputSchema.parse(input);

  const persist = async (tx: Prisma.TransactionClient) => {
    if (parsed.decisionKind !== "escalation") {
      const existingApproved = await tx.signoffRecord.findFirst({
        where: {
          organizationId: parsed.organizationId,
          entityType: parsed.entityType,
          entityId: parsed.entityId,
          entityVersion: parsed.entityVersion ?? null,
          tollgateId: parsed.tollgateId ?? null,
          decisionKind: parsed.decisionKind,
          requiredRoleType: parsed.requiredRoleType,
          organizationSide: parsed.organizationSide,
          decisionStatus: "approved"
        },
        select: {
          id: true,
          actualPersonName: true,
          requiredRoleType: true,
          organizationSide: true,
          decisionKind: true
        }
      });

      if (existingApproved) {
        throw new Error(
          `${existingApproved.actualPersonName} has already recorded approved ${existingApproved.decisionKind} for ${existingApproved.requiredRoleType} on the ${existingApproved.organizationSide} side.`
        );
      }
    }

    const actualPerson = await tx.partyRoleEntry.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.actualPartyRoleEntryId,
        isActive: true
      }
    });

    if (!actualPerson) {
      throw new Error("The selected human sign-off person is not active in the current project.");
    }

    const record = await tx.signoffRecord.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        entityType: parsed.entityType,
        entityId: parsed.entityId,
        entityVersion: parsed.entityVersion ?? null,
        tollgateId: parsed.tollgateId ?? null,
        tollgateType: parsed.tollgateType ?? null,
        decisionKind: parsed.decisionKind,
        requiredRoleType: parsed.requiredRoleType,
        actualPartyRoleEntryId: parsed.actualPartyRoleEntryId,
        actualPersonName: actualPerson.fullName,
        actualPersonEmail: actualPerson.email,
        actualRoleTitle: actualPerson.roleTitle,
        organizationSide: parsed.organizationSide,
        decisionStatus: parsed.decisionStatus,
        note: parsed.note ?? null,
        evidenceReference: parsed.evidenceReference ?? null,
        createdBy: parsed.createdBy ?? null
      },
      include: {
        actualPartyRoleEntry: true
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "signoff_record",
        entityId: record.id,
        eventType: "signoff_recorded",
        actorId: parsed.createdBy ?? null,
        metadata: {
          entityType: parsed.entityType,
          entityId: parsed.entityId,
          entityVersion: parsed.entityVersion ?? null,
          tollgateType: parsed.tollgateType ?? null,
          decisionKind: parsed.decisionKind,
          decisionStatus: parsed.decisionStatus,
          requiredRoleType: parsed.requiredRoleType,
          actualPersonName: record.actualPersonName,
          evidenceReference: parsed.evidenceReference ?? null
        }
      },
      tx
    );

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: parsed.entityType,
        entityId: parsed.entityId,
        eventType: "signoff_recorded",
        actorId: parsed.createdBy ?? null,
        metadata: {
          tollgateType: parsed.tollgateType ?? null,
          decisionKind: parsed.decisionKind,
          decisionStatus: parsed.decisionStatus,
          requiredRoleType: parsed.requiredRoleType,
          actualPersonName: record.actualPersonName,
          evidenceReference: parsed.evidenceReference ?? null,
          note: parsed.note ?? null
        }
      },
      tx
    );

    return record;
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}
