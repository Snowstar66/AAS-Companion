import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import { outcomeCreateInputSchema, outcomeUpdateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import {
  resolveGovernedObjectProvenance,
  toGovernedObjectProvenanceFields,
  toGovernedObjectProvenanceMetadata
} from "./governed-object-provenance";

export async function listOutcomes(organizationId: string, options?: { includeArchived?: boolean }) {
  const where: Prisma.OutcomeWhereInput = {
    organizationId
  };

  if (!options?.includeArchived) {
    where.lifecycleState = "active";
  }

  return prisma.outcome.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function listOutcomeCockpitEntries(organizationId: string) {
  const outcomeWhere: Prisma.OutcomeWhereInput = {
    organizationId,
    lifecycleState: "active"
  };

  const [outcomes, tollgates] = await prisma.$transaction([
    prisma.outcome.findMany({
      where: outcomeWhere,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        valueOwner: {
          select: {
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            epics: true,
            stories: true
          }
        }
      }
    }),
    prisma.tollgate.findMany({
      where: {
        organizationId,
        entityType: "outcome"
      },
      orderBy: {
        updatedAt: "desc"
      }
    })
  ]);

  return outcomes.map((outcome) => ({
    ...outcome,
    tollgates: tollgates.filter((tollgate) => tollgate.entityId === outcome.id)
  }));
}

export async function getOutcomeById(organizationId: string, id: string) {
  return prisma.outcome.findFirst({
    where: {
      organizationId,
      id
    }
  });
}

export async function getOutcomeWorkspaceSnapshot(organizationId: string, id: string) {
  const [outcome, tollgate, activities] = await prisma.$transaction([
    prisma.outcome.findFirst({
      where: {
        organizationId,
        id
      },
      include: {
        valueOwner: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        epics: {
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
    prisma.tollgate.findFirst({
      where: {
        organizationId,
        entityType: "outcome",
        entityId: id,
        tollgateType: "tg1_baseline"
      }
    }),
    prisma.activityEvent.findMany({
      where: {
        organizationId,
        entityType: "outcome",
        entityId: id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    })
  ]);

  if (!outcome) {
    return null;
  }

  const relatedLifecycleState = outcome.lifecycleState === "archived" ? "archived" : "active";

  return {
    outcome: {
      ...outcome,
      epics: outcome.epics.filter((epic) => epic.lifecycleState === relatedLifecycleState),
      stories: outcome.stories.filter((story) => story.lifecycleState === relatedLifecycleState)
    },
    tollgate,
    activities
  };
}

export async function createOutcome(input: unknown, db: Prisma.TransactionClient | typeof prisma = prisma) {
  const parsed = outcomeCreateInputSchema.parse(input);
  const provenance = resolveGovernedObjectProvenance(parsed);

  const persist = async (tx: Prisma.TransactionClient) => {
    const outcome = await tx.outcome.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        key: parsed.key,
        title: parsed.title,
        problemStatement: parsed.problemStatement ?? null,
        outcomeStatement: parsed.outcomeStatement ?? null,
        baselineDefinition: parsed.baselineDefinition ?? null,
        baselineSource: parsed.baselineSource ?? null,
        timeframe: parsed.timeframe ?? null,
        valueOwnerId: parsed.valueOwnerId ?? null,
        riskProfile: parsed.riskProfile,
        aiAccelerationLevel: parsed.aiAccelerationLevel,
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
        entityType: "outcome",
        entityId: outcome.id,
        eventType: "outcome_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: outcome.key,
          status: outcome.status,
          importedReadinessState: outcome.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    return outcome;
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}

export async function updateOutcome(input: unknown) {
  const parsed = outcomeUpdateInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.outcome.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.id
      }
    });

    if (!existing) {
      throw new Error("Outcome not found in organization scope.");
    }

    const data: Prisma.OutcomeUncheckedUpdateInput = {};
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

    if (parsed.key !== undefined) {
      data.key = parsed.key;
    }

    if (parsed.title !== undefined) {
      data.title = parsed.title;
    }

    if (parsed.problemStatement !== undefined) {
      data.problemStatement = parsed.problemStatement;
    }

    if (parsed.outcomeStatement !== undefined) {
      data.outcomeStatement = parsed.outcomeStatement;
    }

    if (parsed.baselineDefinition !== undefined) {
      data.baselineDefinition = parsed.baselineDefinition;
    }

    if (parsed.baselineSource !== undefined) {
      data.baselineSource = parsed.baselineSource;
    }

    if (parsed.timeframe !== undefined) {
      data.timeframe = parsed.timeframe;
    }

    if (parsed.valueOwnerId !== undefined) {
      data.valueOwnerId = parsed.valueOwnerId;
    }

    if (parsed.riskProfile !== undefined) {
      data.riskProfile = parsed.riskProfile;
    }

    if (parsed.aiAccelerationLevel !== undefined) {
      data.aiAccelerationLevel = parsed.aiAccelerationLevel;
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

    const outcome = await tx.outcome.update({
      where: { id: existing.id },
      data
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "outcome",
        entityId: outcome.id,
        eventType: "outcome_updated",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: outcome.key,
          status: outcome.status,
          importedReadinessState: outcome.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    return outcome;
  });
}
