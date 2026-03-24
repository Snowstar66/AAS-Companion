import {
  buildGovernedRemovalDecision,
  type GovernedChildImpact,
  type GovernedRemovalContext,
  type GovernedRemovalDecision,
  type GovernedValueSpineObjectType
} from "@aas-companion/domain";
import type { Prisma } from "../../generated/client";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";

type GovernedEntityType = "outcome" | "epic" | "story";
type DbClient = Prisma.TransactionClient;

type GovernedRemovalState = {
  entityType: GovernedEntityType;
  entityId: string;
  key: string;
  title: string;
  decision: GovernedRemovalDecision;
  activeChildren: GovernedChildImpact[];
};

function toLineageReference(record: {
  lineageSourceType: string | null;
  lineageSourceId: string | null;
  lineageNote: string | null;
}) {
  if (!record.lineageSourceType || !record.lineageSourceId) {
    return null;
  }

  return {
    sourceType: record.lineageSourceType,
    sourceId: record.lineageSourceId,
    note: record.lineageNote
  };
}

function toGovernedChildImpact(
  objectType: GovernedValueSpineObjectType,
  record: { id: string; key: string; title: string; lifecycleState: "active" | "archived" }
): GovernedChildImpact {
  return {
    objectType,
    id: record.id,
    key: record.key,
    title: record.title,
    lifecycleState: record.lifecycleState
  };
}

async function loadOutcomeRemovalState(tx: DbClient, organizationId: string, entityId: string): Promise<GovernedRemovalState | null> {
  const [outcome, activityEventCount, tollgateCount] = await Promise.all([
    tx.outcome.findFirst({
      where: {
        organizationId,
        id: entityId
      },
      include: {
        epics: {
          where: {
            lifecycleState: "active"
          },
          orderBy: {
            createdAt: "asc"
          }
        },
        stories: {
          where: {
            lifecycleState: "active"
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    }),
    tx.activityEvent.count({
      where: {
        organizationId,
        entityType: "outcome",
        entityId
      }
    }),
    tx.tollgate.count({
      where: {
        organizationId,
        entityType: "outcome",
        entityId
      }
    })
  ]);

  if (!outcome) {
    return null;
  }

  const activeChildren = [
    ...outcome.epics.map((epic) => toGovernedChildImpact("epic", epic)),
    ...outcome.stories.map((story) => toGovernedChildImpact("story", story))
  ];

  const context: GovernedRemovalContext = {
    objectType: "outcome",
    key: outcome.key,
    title: outcome.title,
    originType: outcome.originType,
    createdMode: outcome.createdMode,
    lifecycleState: outcome.lifecycleState,
    status: outcome.status,
    lineageReference: toLineageReference(outcome),
    importedReadinessState: outcome.importedReadinessState,
    activityEventCount,
    tollgateCount,
    activeChildren
  };

  return {
    entityType: "outcome",
    entityId: outcome.id,
    key: outcome.key,
    title: outcome.title,
    decision: buildGovernedRemovalDecision(context),
    activeChildren
  };
}

async function loadEpicRemovalState(tx: DbClient, organizationId: string, entityId: string): Promise<GovernedRemovalState | null> {
  const [epic, activityEventCount] = await Promise.all([
    tx.epic.findFirst({
      where: {
        organizationId,
        id: entityId
      },
      include: {
        outcome: {
          select: {
            key: true,
            lifecycleState: true
          }
        },
        stories: {
          where: {
            lifecycleState: "active"
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    }),
    tx.activityEvent.count({
      where: {
        organizationId,
        entityType: "epic",
        entityId
      }
    }),
  ]);

  if (!epic) {
    return null;
  }

  const activeChildren = epic.stories.map((story) => toGovernedChildImpact("story", story));
  const archivedAncestorLabels =
    epic.lifecycleState === "archived" && epic.outcome.lifecycleState === "archived" ? [`Outcome ${epic.outcome.key}`] : [];

  const context: GovernedRemovalContext = {
    objectType: "epic",
    key: epic.key,
    title: epic.title,
    originType: epic.originType,
    createdMode: epic.createdMode,
    lifecycleState: epic.lifecycleState,
    status: epic.status,
    lineageReference: toLineageReference(epic),
    importedReadinessState: epic.importedReadinessState,
    activityEventCount,
    tollgateCount: 0,
    activeChildren,
    archivedAncestorLabels
  };

  return {
    entityType: "epic",
    entityId: epic.id,
    key: epic.key,
    title: epic.title,
    decision: buildGovernedRemovalDecision(context),
    activeChildren
  };
}

async function loadStoryRemovalState(tx: DbClient, organizationId: string, entityId: string): Promise<GovernedRemovalState | null> {
  const [story, activityEventCount, tollgateCount] = await Promise.all([
    tx.story.findFirst({
      where: {
        organizationId,
        id: entityId
      },
      include: {
        outcome: {
          select: {
            key: true,
            lifecycleState: true
          }
        },
        epic: {
          select: {
            key: true,
            lifecycleState: true
          }
        }
      }
    }),
    tx.activityEvent.count({
      where: {
        organizationId,
        entityType: "story",
        entityId
      }
    }),
    tx.tollgate.count({
      where: {
        organizationId,
        entityType: "story",
        entityId
      }
    })
  ]);

  if (!story) {
    return null;
  }

  const archivedAncestorLabels: string[] = [];

  if (story.lifecycleState === "archived" && story.outcome.lifecycleState === "archived") {
    archivedAncestorLabels.push(`Outcome ${story.outcome.key}`);
  }

  if (story.lifecycleState === "archived" && story.epic.lifecycleState === "archived") {
    archivedAncestorLabels.push(`Epic ${story.epic.key}`);
  }

  const context: GovernedRemovalContext = {
    objectType: "story",
    key: story.key,
    title: story.title,
    originType: story.originType,
    createdMode: story.createdMode,
    lifecycleState: story.lifecycleState,
    status: story.status,
    lineageReference: toLineageReference(story),
    importedReadinessState: story.importedReadinessState,
    activityEventCount,
    tollgateCount,
    activeChildren: [],
    archivedAncestorLabels
  };

  return {
    entityType: "story",
    entityId: story.id,
    key: story.key,
    title: story.title,
    decision: buildGovernedRemovalDecision(context),
    activeChildren: []
  };
}

async function loadGovernedRemovalState(
  tx: DbClient,
  organizationId: string,
  entityType: GovernedEntityType,
  entityId: string
) {
  if (entityType === "outcome") {
    return loadOutcomeRemovalState(tx, organizationId, entityId);
  }

  if (entityType === "epic") {
    return loadEpicRemovalState(tx, organizationId, entityId);
  }

  return loadStoryRemovalState(tx, organizationId, entityId);
}

function createActionSummary(state: GovernedRemovalState, action: "hard_delete" | "archive" | "restore") {
  return {
    entityType: state.entityType,
    entityId: state.entityId,
    key: state.key,
    title: state.title,
    action,
    affectedActiveChildCount: state.activeChildren.length,
    affectedChildren: state.activeChildren.map((child) => ({
      objectType: child.objectType,
      key: child.key,
      title: child.title
    }))
  };
}

async function appendRemovalRequestedEvent(
  tx: DbClient,
  input: {
    organizationId: string;
    actorId?: string | null;
    state: GovernedRemovalState;
    action: "hard_delete" | "archive" | "restore";
    reason?: string | null;
  }
) {
  await appendActivityEvent(
    {
      organizationId: input.organizationId,
      entityType: input.state.entityType,
      entityId: input.state.entityId,
      eventType: "governed_removal_requested",
      actorId: input.actorId ?? null,
      metadata: {
        ...createActionSummary(input.state, input.action),
        reason: input.reason ?? null
      }
    },
    tx
  );
}

export async function getGovernedRemovalState(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
}) {
  return prisma.$transaction((tx) => loadGovernedRemovalState(tx, input.organizationId, input.entityType, input.entityId));
}

export async function hardDeleteGovernedObject(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const state = await loadGovernedRemovalState(tx, input.organizationId, input.entityType, input.entityId);

    if (!state) {
      throw new Error("Governed object was not found in organization scope.");
    }

    await appendRemovalRequestedEvent(tx, {
      organizationId: input.organizationId,
      actorId: input.actorId ?? null,
      state,
      action: "hard_delete"
    });

    if (!state.decision.hardDelete.allowed) {
      throw new Error(state.decision.hardDelete.blockers[0] ?? "Hard delete is not allowed for this object.");
    }

    if (input.entityType === "outcome") {
      await tx.tollgate.deleteMany({
        where: {
          organizationId: input.organizationId,
          entityType: "outcome",
          entityId: input.entityId
        }
      });
      await tx.outcome.delete({
        where: {
          id: input.entityId
        }
      });
    } else if (input.entityType === "epic") {
      await tx.epic.delete({
        where: {
          id: input.entityId
        }
      });
    } else {
      await tx.tollgate.deleteMany({
        where: {
          organizationId: input.organizationId,
          entityType: "story",
          entityId: input.entityId
        }
      });
      await tx.story.delete({
        where: {
          id: input.entityId
        }
      });
    }

    await appendActivityEvent(
      {
        organizationId: input.organizationId,
        entityType: input.entityType,
        entityId: input.entityId,
        eventType: "governed_hard_deleted",
        actorId: input.actorId ?? null,
        metadata: createActionSummary(state, "hard_delete")
      },
      tx
    );

    return state;
  });
}

export async function archiveGovernedObject(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
  actorId?: string | null;
  reason: string;
}) {
  return prisma.$transaction(async (tx) => {
    const reason = input.reason.trim();

    if (!reason) {
      throw new Error("Archive reason is required.");
    }

    const state = await loadGovernedRemovalState(tx, input.organizationId, input.entityType, input.entityId);

    if (!state) {
      throw new Error("Governed object was not found in organization scope.");
    }

    await appendRemovalRequestedEvent(tx, {
      organizationId: input.organizationId,
      actorId: input.actorId ?? null,
      state,
      action: "archive",
      reason
    });

    if (!state.decision.archive.allowed) {
      throw new Error(state.decision.archive.blockers[0] ?? "Archive is not allowed for this object.");
    }

    const archivedAt = new Date();

    if (input.entityType === "outcome") {
      await tx.outcome.update({
        where: {
          id: input.entityId
        },
        data: {
          lifecycleState: "archived",
          archivedAt,
          archiveReason: reason
        }
      });

      await tx.epic.updateMany({
        where: {
          organizationId: input.organizationId,
          outcomeId: input.entityId,
          lifecycleState: "active"
        },
        data: {
          lifecycleState: "archived",
          archivedAt,
          archiveReason: reason
        }
      });

      await tx.story.updateMany({
        where: {
          organizationId: input.organizationId,
          outcomeId: input.entityId,
          lifecycleState: "active"
        },
        data: {
          lifecycleState: "archived",
          archivedAt,
          archiveReason: reason
        }
      });
    } else if (input.entityType === "epic") {
      await tx.epic.update({
        where: {
          id: input.entityId
        },
        data: {
          lifecycleState: "archived",
          archivedAt,
          archiveReason: reason
        }
      });

      await tx.story.updateMany({
        where: {
          organizationId: input.organizationId,
          epicId: input.entityId,
          lifecycleState: "active"
        },
        data: {
          lifecycleState: "archived",
          archivedAt,
          archiveReason: reason
        }
      });
    } else {
      await tx.story.update({
        where: {
          id: input.entityId
        },
        data: {
          lifecycleState: "archived",
          archivedAt,
          archiveReason: reason
        }
      });
    }

    for (const child of state.activeChildren) {
      await appendActivityEvent(
        {
          organizationId: input.organizationId,
          entityType: child.objectType as GovernedEntityType,
          entityId: child.id,
          eventType: "governed_archived",
          actorId: input.actorId ?? null,
          metadata: {
            archivedViaParent: true,
            parentEntityType: state.entityType,
            parentEntityId: state.entityId,
            parentKey: state.key,
            reason
          }
        },
        tx
      );
    }

    await appendActivityEvent(
      {
        organizationId: input.organizationId,
        entityType: input.entityType,
        entityId: input.entityId,
        eventType: "governed_archived",
        actorId: input.actorId ?? null,
        metadata: {
          ...createActionSummary(state, "archive"),
          reason
        }
      },
      tx
    );

    return state;
  });
}

export async function restoreGovernedObject(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const state = await loadGovernedRemovalState(tx, input.organizationId, input.entityType, input.entityId);

    if (!state) {
      throw new Error("Governed object was not found in organization scope.");
    }

    await appendRemovalRequestedEvent(tx, {
      organizationId: input.organizationId,
      actorId: input.actorId ?? null,
      state,
      action: "restore"
    });

    if (!state.decision.restore.allowed) {
      throw new Error(state.decision.restore.blockers[0] ?? "Restore is not allowed for this object.");
    }

    if (input.entityType === "outcome") {
      await tx.outcome.update({
        where: {
          id: input.entityId
        },
        data: {
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null
        }
      });
    } else if (input.entityType === "epic") {
      await tx.epic.update({
        where: {
          id: input.entityId
        },
        data: {
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null
        }
      });
    } else {
      await tx.story.update({
        where: {
          id: input.entityId
        },
        data: {
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null
        }
      });
    }

    await appendActivityEvent(
      {
        organizationId: input.organizationId,
        entityType: input.entityType,
        entityId: input.entityId,
        eventType: "governed_restored",
        actorId: input.actorId ?? null,
        metadata: createActionSummary(state, "restore")
      },
      tx
    );

    return state;
  });
}
