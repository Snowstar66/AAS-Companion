import { randomUUID } from "node:crypto";
import { Prisma } from "../../generated/client";
import {
  createControlMirrorHumanReviewStableKey,
  type ControlMirrorHumanReviewItem
} from "@aas-companion/domain";
import { prisma } from "../client";

export { createControlMirrorHumanReviewStableKey } from "@aas-companion/domain";

type DbClient = Prisma.TransactionClient | typeof prisma;

export type ControlMirrorReviewItemState = "open" | "decided" | "deferred" | "superseded";
export type ControlMirrorReviewDecisionType =
  | "approve"
  | "approve_with_controls"
  | "reject"
  | "defer"
  | "downgrade"
  | "request_exception"
  | "request_rework";

export type PreparedControlMirrorHumanReviewQueueItem = {
  organizationId: string;
  snapshotId: string | null;
  sourceFindingId: string;
  stableFindingKey: string;
  severity: "high" | "medium" | "low";
  category: string;
  decisionNeeded: string;
  recommendedOption: "approve" | "approve_with_condition" | "reject" | "defer" | "request_change";
  affectedObject: string;
  affectedOutcomeId: string | null;
  affectedEpicId: string | null;
  affectedStoryId: string | null;
  blocksRelease: boolean;
  reviewHref: string;
  valueRationale: string;
  alternatives: string[];
  riskIfApproved: string;
  riskIfNotApproved: string;
  suggestedResponse: string;
  rationale: string;
  sourceLineageJson: Prisma.InputJsonObject;
  state: ControlMirrorReviewItemState;
  lastSeenAt: Date;
};

export type PersistedControlMirrorHumanReviewQueueItem = {
  id: string;
  stableFindingKey: string;
  state: ControlMirrorReviewItemState;
  updatedAt: Date;
  latestDecision?: {
    id: string;
    decisionType: ControlMirrorReviewDecisionType;
    rationale: string;
    actorId: string;
    createdAt: Date;
  } | null;
};

export type ControlMirrorHumanReviewDecisionResult = {
  reviewItem: {
    id: string;
    state: ControlMirrorReviewItemState;
  };
  decisionEvent: {
    id: string;
    decisionType: ControlMirrorReviewDecisionType;
    rationale: string;
    priorState: ControlMirrorReviewItemState;
    resultingState: ControlMirrorReviewItemState;
    actorId: string;
    createdAt: Date;
  };
};

function mapRecommendedOption(value: ControlMirrorHumanReviewItem["recommendedOption"]) {
  if (value === "APPROVE") return "approve" as const;
  if (value === "APPROVE WITH CONDITION") return "approve_with_condition" as const;
  if (value === "REJECT") return "reject" as const;
  if (value === "DEFER") return "defer" as const;
  return "request_change" as const;
}

export function getControlMirrorReviewDecisionResultingState(decisionType: ControlMirrorReviewDecisionType): ControlMirrorReviewItemState {
  return decisionType === "defer" ? "deferred" : "decided";
}

function assertHumanDecisionInput(input: {
  actorId?: string | null;
  rationale?: string | null;
}) {
  if (!input.actorId?.trim()) {
    throw new Error("A human actor is required before a Control Mirror review decision can be recorded.");
  }

  if (!input.rationale?.trim()) {
    throw new Error("Decision rationale is required before a Control Mirror review decision can be recorded.");
  }
}

export function prepareControlMirrorHumanReviewQueueItems(input: {
  organizationId: string;
  snapshotId?: string | null;
  items: ControlMirrorHumanReviewItem[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const byStableKey = new Map<string, PreparedControlMirrorHumanReviewQueueItem>();

  for (const item of input.items) {
    const stableFindingKey = createControlMirrorHumanReviewStableKey(item);

    if (byStableKey.has(stableFindingKey)) {
      continue;
    }

    byStableKey.set(stableFindingKey, {
      organizationId: input.organizationId,
      snapshotId: input.snapshotId ?? null,
      sourceFindingId: item.sourceFindingId ?? item.id,
      stableFindingKey,
      severity: item.severity,
      category: item.category,
      decisionNeeded: item.decisionNeeded,
      recommendedOption: mapRecommendedOption(item.recommendedOption),
      affectedObject: item.affectedObject,
      affectedOutcomeId: item.affectedOutcomeId ?? null,
      affectedEpicId: item.affectedEpicId ?? null,
      affectedStoryId: item.affectedStoryId ?? null,
      blocksRelease: item.blocksRelease,
      reviewHref: item.reviewHref,
      valueRationale: item.valueRationale,
      alternatives: item.alternatives,
      riskIfApproved: item.riskIfApproved,
      riskIfNotApproved: item.riskIfNotApproved,
      suggestedResponse: item.suggestedResponse,
      rationale: item.rationale,
      sourceLineageJson: {
        generatedItemId: item.id,
        sourceFindingId: item.sourceFindingId ?? item.id,
        reviewHref: item.reviewHref,
        affectedOutcomeId: item.affectedOutcomeId ?? null,
        affectedEpicId: item.affectedEpicId ?? null,
        affectedStoryId: item.affectedStoryId ?? null
      },
      state: "open",
      lastSeenAt: now
    });
  }

  return [...byStableKey.values()];
}

export function mergeControlMirrorHumanReviewItemsWithQueueState(
  items: ControlMirrorHumanReviewItem[],
  persistedItems: PersistedControlMirrorHumanReviewQueueItem[]
): ControlMirrorHumanReviewItem[] {
  const persistedByStableKey = new Map(persistedItems.map((item) => [item.stableFindingKey, item]));

  return items.map((item) => {
    const stableFindingKey = createControlMirrorHumanReviewStableKey(item);
    const persisted = persistedByStableKey.get(stableFindingKey);

    if (!persisted) {
      return {
        ...item,
        stableFindingKey
      };
    }

    return {
      ...item,
      persistedReviewItemId: persisted.id,
      stableFindingKey,
      reviewState: persisted.state,
      persistedUpdatedAt: persisted.updatedAt.toISOString(),
      latestHumanDecision: persisted.latestDecision
        ? {
            id: persisted.latestDecision.id,
            decisionType: persisted.latestDecision.decisionType,
            rationale: persisted.latestDecision.rationale,
            actorId: persisted.latestDecision.actorId,
            createdAt: persisted.latestDecision.createdAt.toISOString()
          }
        : null
    };
  });
}

export async function syncControlMirrorHumanReviewQueueItems(input: {
  organizationId: string;
  snapshotId?: string | null;
  items: ControlMirrorHumanReviewItem[];
}, db: DbClient = prisma): Promise<PersistedControlMirrorHumanReviewQueueItem[]> {
  const preparedItems = prepareControlMirrorHumanReviewQueueItems(input);

  if (preparedItems.length === 0) {
    await db.controlMirrorHumanReviewItem.updateMany({
      where: {
        organizationId: input.organizationId,
        state: {
          in: ["open", "deferred"]
        }
      },
      data: {
        state: "superseded"
      }
    });

    return [];
  }

  for (const item of preparedItems) {
    await db.controlMirrorHumanReviewItem.upsert({
      where: {
        organizationId_stableFindingKey: {
          organizationId: item.organizationId,
          stableFindingKey: item.stableFindingKey
        }
      },
      create: {
        id: randomUUID(),
        ...item
      },
      update: {
        snapshotId: item.snapshotId,
        sourceFindingId: item.sourceFindingId,
        severity: item.severity,
        category: item.category,
        decisionNeeded: item.decisionNeeded,
        recommendedOption: item.recommendedOption,
        affectedObject: item.affectedObject,
        affectedOutcomeId: item.affectedOutcomeId,
        affectedEpicId: item.affectedEpicId,
        affectedStoryId: item.affectedStoryId,
        blocksRelease: item.blocksRelease,
        reviewHref: item.reviewHref,
        valueRationale: item.valueRationale,
        alternatives: item.alternatives,
        riskIfApproved: item.riskIfApproved,
        riskIfNotApproved: item.riskIfNotApproved,
        suggestedResponse: item.suggestedResponse,
        rationale: item.rationale,
        sourceLineageJson: item.sourceLineageJson,
        lastSeenAt: item.lastSeenAt
      }
    });
  }

  await db.controlMirrorHumanReviewItem.updateMany({
    where: {
      organizationId: input.organizationId,
      stableFindingKey: {
        in: preparedItems.map((item) => item.stableFindingKey)
      },
      state: "superseded"
    },
    data: {
      state: "open"
    }
  });

  await db.controlMirrorHumanReviewItem.updateMany({
    where: {
      organizationId: input.organizationId,
      stableFindingKey: {
        notIn: preparedItems.map((item) => item.stableFindingKey)
      },
      state: {
        in: ["open", "deferred"]
      }
    },
    data: {
      state: "superseded"
    }
  });

  return db.controlMirrorHumanReviewItem.findMany({
    where: {
      organizationId: input.organizationId,
      stableFindingKey: {
        in: preparedItems.map((item) => item.stableFindingKey)
      }
    },
    select: {
      id: true,
      stableFindingKey: true,
      state: true,
      updatedAt: true,
      decisionEvents: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1,
        select: {
          id: true,
          decisionType: true,
          rationale: true,
          actorId: true,
          createdAt: true
        }
      }
    }
  }).then((items) =>
    items.map((item) => ({
      id: item.id,
      stableFindingKey: item.stableFindingKey,
      state: item.state,
      updatedAt: item.updatedAt,
      latestDecision: item.decisionEvents[0] ?? null
    }))
  );
}

export async function recordControlMirrorHumanReviewDecision(input: {
  organizationId: string;
  reviewItemId: string;
  decisionType: ControlMirrorReviewDecisionType;
  rationale: string;
  actorId: string;
}, db: typeof prisma = prisma): Promise<ControlMirrorHumanReviewDecisionResult> {
  assertHumanDecisionInput(input);

  return db.$transaction(async (tx) => {
    const reviewItem = await tx.controlMirrorHumanReviewItem.findFirst({
      where: {
        id: input.reviewItemId,
        organizationId: input.organizationId
      },
      select: {
        id: true,
        state: true
      }
    });

    if (!reviewItem) {
      throw new Error("Control Mirror review item was not found for this project.");
    }

    const resultingState = getControlMirrorReviewDecisionResultingState(input.decisionType);
    const decisionEvent = await tx.controlMirrorHumanReviewDecisionEvent.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        reviewItemId: reviewItem.id,
        decisionType: input.decisionType,
        rationale: input.rationale.trim(),
        priorState: reviewItem.state,
        resultingState,
        actorId: input.actorId.trim()
      },
      select: {
        id: true,
        decisionType: true,
        rationale: true,
        priorState: true,
        resultingState: true,
        actorId: true,
        createdAt: true
      }
    });

    const updated = await tx.controlMirrorHumanReviewItem.update({
      where: {
        id: reviewItem.id
      },
      data: {
        state: resultingState
      },
      select: {
        id: true,
        state: true
      }
    });

    return {
      reviewItem: updated,
      decisionEvent
    };
  });
}

export async function reopenControlMirrorHumanReviewItem(input: {
  organizationId: string;
  reviewItemId: string;
  actorId: string;
}, db: typeof prisma = prisma) {
  if (!input.actorId?.trim()) {
    throw new Error("A human actor is required before a Control Mirror review item can be reopened.");
  }

  const updated = await db.controlMirrorHumanReviewItem.update({
    where: {
      id: input.reviewItemId,
      organizationId: input.organizationId
    },
    data: {
      state: "open"
    },
    select: {
      id: true,
      state: true
    }
  });

  return {
    reviewItem: updated
  };
}
