import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import { outcomeCreateInputSchema, outcomeUpdateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { logDevTiming, withDevTiming } from "../dev-timing";
import { appendActivityEvent } from "./activity-repository";
import { withEpicShape } from "./epic-shape";
import {
  resolveGovernedObjectProvenance,
  toGovernedObjectProvenanceFields,
  toGovernedObjectProvenanceMetadata
} from "./governed-object-provenance";

function hasScalarChanged<T>(nextValue: T | undefined, currentValue: T | null | undefined) {
  if (nextValue === undefined) {
    return false;
  }

  if (nextValue instanceof Date) {
    return nextValue.getTime() !== (currentValue instanceof Date ? currentValue.getTime() : null);
  }

  return nextValue !== currentValue;
}

async function invalidateOutcomeTollgateForNewFramingVersion(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    outcomeId: string;
    framingVersion: number;
  }
) {
  const tollgate = await tx.tollgate.findFirst({
    where: {
      organizationId: input.organizationId,
      entityType: "outcome",
      entityId: input.outcomeId,
      tollgateType: "tg1_baseline"
    },
    select: {
      id: true,
      status: true,
      approvedVersion: true,
      submissionVersion: true,
      comments: true
    }
  });

  if (!tollgate || (tollgate.status !== "approved" && tollgate.status !== "ready" && !tollgate.submissionVersion)) {
    return;
  }

  const priorVersion = tollgate.approvedVersion ?? tollgate.submissionVersion ?? input.framingVersion - 1;

  await tx.tollgate.update({
    where: {
      id: tollgate.id
    },
    data: {
      status: "blocked",
      blockers: [
        `Framing changed after version ${priorVersion}. Submit version ${input.framingVersion} to Tollgate 1 for a new approval.`
      ],
      submissionVersion: null
    }
  });
}

export async function advanceOutcomeFramingVersion(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    outcomeId: string;
  }
) {
  const outcome = await tx.outcome.update({
    where: {
      id: input.outcomeId
    },
    data: {
      framingVersion: {
        increment: 1
      }
    },
    select: {
      framingVersion: true
    }
  });

  await invalidateOutcomeTollgateForNewFramingVersion(tx, {
    organizationId: input.organizationId,
    outcomeId: input.outcomeId,
    framingVersion: outcome.framingVersion
  });

  return outcome.framingVersion;
}

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

export async function getPreferredFramingOutcomeId(organizationId: string) {
  return withDevTiming("db.getPreferredFramingOutcomeId", async () => {
    const outcomes = await prisma.outcome.findMany({
      where: {
        organizationId,
        lifecycleState: "active"
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        originType: true
      }
    });

    return outcomes.find((outcome) => outcome.originType === "native")?.id ?? outcomes[0]?.id ?? null;
  }, `organizationId=${organizationId}`);
}

export async function listOutcomeCockpitEntries(organizationId: string) {
  return withDevTiming("db.listOutcomeCockpitEntries", async () => {
    const outcomeWhere: Prisma.OutcomeWhereInput = {
      organizationId,
      lifecycleState: "active"
    };

    const [outcomes, tollgates] = await prisma.$transaction([
      prisma.outcome.findMany({
        where: outcomeWhere,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          key: true,
          title: true,
          outcomeStatement: true,
          status: true,
          originType: true,
          importedReadinessState: true,
          lineageSourceType: true,
          lineageSourceId: true,
          baselineDefinition: true,
          baselineSource: true,
          aiUsageRole: true,
          aiUsageIntent: true,
          businessImpactLevel: true,
          businessImpactRationale: true,
          dataSensitivityLevel: true,
          dataSensitivityRationale: true,
          blastRadiusLevel: true,
          blastRadiusRationale: true,
          decisionImpactLevel: true,
          decisionImpactRationale: true,
          aiLevelJustification: true,
          riskAcceptedAt: true,
          riskAcceptedByValueOwnerId: true,
          timeframe: true,
          valueOwnerId: true,
          riskProfile: true,
          aiAccelerationLevel: true,
          updatedAt: true,
          valueOwner: {
            select: {
              fullName: true,
              email: true
            }
          },
          _count: {
            select: {
              epics: true,
              directionSeeds: true
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
        },
        select: {
          id: true,
          entityId: true,
          status: true,
          blockers: true
        }
      })
    ]);

    const mapStartedAt = Date.now();
    const tollgatesByEntityId = new Map<string, typeof tollgates>();

    for (const tollgate of tollgates) {
      const existing = tollgatesByEntityId.get(tollgate.entityId) ?? [];
      existing.push(tollgate);
      tollgatesByEntityId.set(tollgate.entityId, existing);
    }

    const entries = outcomes.map((outcome) => ({
      ...outcome,
      tollgates: tollgatesByEntityId.get(outcome.id) ?? []
    }));
    logDevTiming("db.listOutcomeCockpitEntries.map", mapStartedAt, `outcomes=${outcomes.length} tollgates=${tollgates.length}`);

    return entries;
  }, `organizationId=${organizationId}`);
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
  return withDevTiming("db.getOutcomeWorkspaceSnapshot", async () => {
    const [outcome, tollgate, activityEventCount] = await prisma.$transaction([
      prisma.outcome.findFirst({
        where: {
          organizationId,
          id
        },
        select: {
          id: true,
          organizationId: true,
          key: true,
          title: true,
          framingVersion: true,
          problemStatement: true,
          outcomeStatement: true,
          baselineDefinition: true,
          baselineSource: true,
          solutionContext: true,
          solutionConstraints: true,
          dataSensitivity: true,
          deliveryType: true,
          aiUsageRole: true,
          aiUsageIntent: true,
          businessImpactLevel: true,
          businessImpactRationale: true,
          dataSensitivityLevel: true,
          dataSensitivityRationale: true,
          blastRadiusLevel: true,
          blastRadiusRationale: true,
          decisionImpactLevel: true,
          decisionImpactRationale: true,
          aiLevelJustification: true,
          riskAcceptedAt: true,
          riskAcceptedByValueOwnerId: true,
          timeframe: true,
          valueOwnerId: true,
          riskProfile: true,
          aiAccelerationLevel: true,
          status: true,
          originType: true,
          createdMode: true,
          lifecycleState: true,
          lineageSourceType: true,
          lineageSourceId: true,
          lineageNote: true,
          importedReadinessState: true,
          valueOwner: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          epics: {
            select: {
              id: true,
              organizationId: true,
              outcomeId: true,
              key: true,
              title: true,
              purpose: true,
              summary: true,
              originType: true,
              lifecycleState: true,
              lineageSourceType: true,
              lineageSourceId: true,
              importedReadinessState: true
            },
            orderBy: {
              createdAt: "asc"
            }
          },
          directionSeeds: {
            select: {
              id: true,
              organizationId: true,
              outcomeId: true,
              epicId: true,
              key: true,
              title: true,
              shortDescription: true,
              expectedBehavior: true,
              uxSketchName: true,
              uxSketchDataUrl: true,
              sourceStoryId: true,
              originType: true,
              lifecycleState: true,
              lineageSourceType: true,
              lineageSourceId: true,
              importedReadinessState: true
            },
            orderBy: {
              createdAt: "asc"
            }
          },
          stories: {
            select: {
              id: true,
              epicId: true,
              key: true,
              title: true,
              valueIntent: true,
              expectedBehavior: true,
              acceptanceCriteria: true,
              testDefinition: true,
              definitionOfDone: true,
              sourceDirectionSeedId: true,
              status: true,
              originType: true,
              lifecycleState: true,
              lineageSourceType: true,
              lineageSourceId: true,
              importedReadinessState: true
            },
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
        },
        select: {
          id: true,
          organizationId: true,
          entityType: true,
          entityId: true,
          tollgateType: true,
          status: true,
          blockers: true,
          approverRoles: true,
          submissionVersion: true,
          approvedVersion: true,
          approvalSnapshot: true,
          decidedBy: true,
          decidedAt: true,
          comments: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.activityEvent.count({
        where: {
          organizationId,
          entityType: "outcome",
          entityId: id
        }
      })
    ]);

    if (!outcome) {
      return null;
    }

    const relatedLifecycleState = outcome.lifecycleState === "archived" ? "archived" : "active";
    const scopedStories = outcome.stories.filter((story) => story.lifecycleState === relatedLifecycleState);

    return {
      outcome: {
        ...outcome,
        epics: outcome.epics
          .filter((epic) => epic.lifecycleState === relatedLifecycleState)
          .map((epic) =>
            withEpicShape({
              ...epic,
              directionSeeds: outcome.directionSeeds.filter((seed) => seed.epicId === epic.id && seed.lifecycleState === relatedLifecycleState),
              stories: scopedStories.filter((story) => story.epicId === epic.id)
            })
          ),
        directionSeeds: outcome.directionSeeds.filter((seed) => seed.lifecycleState === relatedLifecycleState),
        stories: scopedStories
      },
      tollgate,
      activities: [],
      activityEventCount
    };
  }, `organizationId=${organizationId} outcomeId=${id}`);
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
        framingVersion: 1,
        problemStatement: parsed.problemStatement ?? null,
        outcomeStatement: parsed.outcomeStatement ?? null,
        baselineDefinition: parsed.baselineDefinition ?? null,
        baselineSource: parsed.baselineSource ?? null,
        solutionContext: parsed.solutionContext ?? null,
        solutionConstraints: parsed.solutionConstraints ?? null,
        dataSensitivity: parsed.dataSensitivity ?? null,
        deliveryType: parsed.deliveryType ?? null,
        aiUsageRole: parsed.aiUsageRole ?? null,
        aiUsageIntent: parsed.aiUsageIntent ?? null,
        businessImpactLevel: parsed.businessImpactLevel ?? null,
        businessImpactRationale: parsed.businessImpactRationale ?? null,
        dataSensitivityLevel: parsed.dataSensitivityLevel ?? null,
        dataSensitivityRationale: parsed.dataSensitivityRationale ?? null,
        blastRadiusLevel: parsed.blastRadiusLevel ?? null,
        blastRadiusRationale: parsed.blastRadiusRationale ?? null,
        decisionImpactLevel: parsed.decisionImpactLevel ?? null,
        decisionImpactRationale: parsed.decisionImpactRationale ?? null,
        aiLevelJustification: parsed.aiLevelJustification ?? null,
        riskAcceptedAt: parsed.riskAcceptedAt ?? null,
        riskAcceptedByValueOwnerId: parsed.riskAcceptedByValueOwnerId ?? null,
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
    const framingContentChanged =
      hasScalarChanged(parsed.title, existing.title) ||
      hasScalarChanged(parsed.problemStatement, existing.problemStatement) ||
      hasScalarChanged(parsed.outcomeStatement, existing.outcomeStatement) ||
      hasScalarChanged(parsed.baselineDefinition, existing.baselineDefinition) ||
      hasScalarChanged(parsed.baselineSource, existing.baselineSource) ||
      hasScalarChanged(parsed.solutionContext, existing.solutionContext) ||
      hasScalarChanged(parsed.solutionConstraints, existing.solutionConstraints) ||
      hasScalarChanged(parsed.dataSensitivity, existing.dataSensitivity) ||
      hasScalarChanged(parsed.deliveryType, existing.deliveryType) ||
      hasScalarChanged(parsed.aiUsageRole, existing.aiUsageRole) ||
      hasScalarChanged(parsed.aiUsageIntent, existing.aiUsageIntent) ||
      hasScalarChanged(parsed.businessImpactLevel, existing.businessImpactLevel) ||
      hasScalarChanged(parsed.businessImpactRationale, existing.businessImpactRationale) ||
      hasScalarChanged(parsed.dataSensitivityLevel, existing.dataSensitivityLevel) ||
      hasScalarChanged(parsed.dataSensitivityRationale, existing.dataSensitivityRationale) ||
      hasScalarChanged(parsed.blastRadiusLevel, existing.blastRadiusLevel) ||
      hasScalarChanged(parsed.blastRadiusRationale, existing.blastRadiusRationale) ||
      hasScalarChanged(parsed.decisionImpactLevel, existing.decisionImpactLevel) ||
      hasScalarChanged(parsed.decisionImpactRationale, existing.decisionImpactRationale) ||
      hasScalarChanged(parsed.aiLevelJustification, existing.aiLevelJustification) ||
      hasScalarChanged(parsed.riskAcceptedAt, existing.riskAcceptedAt) ||
      hasScalarChanged(parsed.riskAcceptedByValueOwnerId, existing.riskAcceptedByValueOwnerId) ||
      hasScalarChanged(parsed.timeframe, existing.timeframe) ||
      hasScalarChanged(parsed.valueOwnerId, existing.valueOwnerId) ||
      hasScalarChanged(parsed.riskProfile, existing.riskProfile) ||
      hasScalarChanged(parsed.aiAccelerationLevel, existing.aiAccelerationLevel);

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

    if (parsed.solutionContext !== undefined) {
      data.solutionContext = parsed.solutionContext;
    }

    if (parsed.solutionConstraints !== undefined) {
      data.solutionConstraints = parsed.solutionConstraints;
    }

    if (parsed.dataSensitivity !== undefined) {
      data.dataSensitivity = parsed.dataSensitivity;
    }

    if (parsed.deliveryType !== undefined) {
      data.deliveryType = parsed.deliveryType;
    }

    if (parsed.aiUsageRole !== undefined) {
      data.aiUsageRole = parsed.aiUsageRole;
    }

    if (parsed.aiUsageIntent !== undefined) {
      data.aiUsageIntent = parsed.aiUsageIntent;
    }

    if (parsed.businessImpactLevel !== undefined) {
      data.businessImpactLevel = parsed.businessImpactLevel;
    }

    if (parsed.businessImpactRationale !== undefined) {
      data.businessImpactRationale = parsed.businessImpactRationale;
    }

    if (parsed.dataSensitivityLevel !== undefined) {
      data.dataSensitivityLevel = parsed.dataSensitivityLevel;
    }

    if (parsed.dataSensitivityRationale !== undefined) {
      data.dataSensitivityRationale = parsed.dataSensitivityRationale;
    }

    if (parsed.blastRadiusLevel !== undefined) {
      data.blastRadiusLevel = parsed.blastRadiusLevel;
    }

    if (parsed.blastRadiusRationale !== undefined) {
      data.blastRadiusRationale = parsed.blastRadiusRationale;
    }

    if (parsed.decisionImpactLevel !== undefined) {
      data.decisionImpactLevel = parsed.decisionImpactLevel;
    }

    if (parsed.decisionImpactRationale !== undefined) {
      data.decisionImpactRationale = parsed.decisionImpactRationale;
    }

    if (parsed.aiLevelJustification !== undefined) {
      data.aiLevelJustification = parsed.aiLevelJustification;
    }

    if (parsed.riskAcceptedAt !== undefined) {
      data.riskAcceptedAt = parsed.riskAcceptedAt;
    }

    if (parsed.riskAcceptedByValueOwnerId !== undefined) {
      data.riskAcceptedByValueOwnerId = parsed.riskAcceptedByValueOwnerId;
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
      data: {
        ...data,
        ...(framingContentChanged
          ? {
              framingVersion: {
                increment: 1
              }
            }
          : {})
      }
    });

    if (framingContentChanged) {
      await invalidateOutcomeTollgateForNewFramingVersion(tx, {
        organizationId: parsed.organizationId,
        outcomeId: outcome.id,
        framingVersion: outcome.framingVersion
      });
    }

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
