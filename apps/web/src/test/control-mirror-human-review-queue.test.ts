import { describe, expect, it, vi } from "vitest";
import {
  getControlMirrorReviewDecisionResultingState,
  mergeControlMirrorHumanReviewItemsWithQueueState,
  prepareControlMirrorHumanReviewQueueItems,
  recordControlMirrorHumanReviewDecision,
  syncControlMirrorHumanReviewQueueItems,
  type PersistedControlMirrorHumanReviewQueueItem
} from "@aas-companion/db";
import type { ControlMirrorHumanReviewItem } from "@aas-companion/domain";

function createReviewItem(overrides: Partial<ControlMirrorHumanReviewItem> = {}): ControlMirrorHumanReviewItem {
  return {
    id: "ai-level-mismatch",
    sourceFindingId: "ai-level-recommendation",
    severity: "high",
    category: "AI level evidence mismatch",
    decisionNeeded: "Downgrade the achieved AI level or add the missing evidence.",
    recommendedOption: "DEFER",
    affectedObject: "Requested level_3, achieved level_2",
    affectedOutcomeId: "outcome-1",
    affectedEpicId: null,
    affectedStoryId: null,
    blocksRelease: true,
    reviewHref: "/review?source=control-mirror&reviewItem=ai-level-mismatch#operational-review",
    valueRationale: "Keeps proceed, pause, downgrade and release decisions traceable.",
    alternatives: ["Resolve the evidence gap", "Downgrade the AI-level claim"],
    riskIfApproved: "The team may proceed with an unsupported control claim.",
    riskIfNotApproved: "Delivery may pause while evidence is restored.",
    suggestedResponse: "DEFER",
    rationale: "AAS Companion must not overstate Level 2 or Level 3 readiness.",
    ...overrides
  };
}

describe("Control Mirror Human Review queue persistence mapping", () => {
  it("prepares tenant-scoped queue rows and deduplicates stable findings", () => {
    const now = new Date("2026-05-21T18:00:00.000Z");
    const prepared = prepareControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      snapshotId: "snapshot-1",
      items: [
        createReviewItem(),
        createReviewItem({
          id: "ai-level-mismatch-duplicate"
        })
      ],
      now
    });

    expect(prepared).toHaveLength(1);
    expect(prepared[0]).toMatchObject({
      organizationId: "org-1",
      snapshotId: "snapshot-1",
      sourceFindingId: "ai-level-recommendation",
      stableFindingKey: "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
      severity: "high",
      recommendedOption: "defer",
      state: "open",
      blocksRelease: true,
      lastSeenAt: now
    });
    expect(prepared[0]?.sourceLineageJson).toMatchObject({
      generatedItemId: "ai-level-mismatch",
      reviewHref: "/review?source=control-mirror&reviewItem=ai-level-mismatch#operational-review"
    });
  });

  it("merges persisted queue identity and state back onto generated review items", () => {
    const generated = createReviewItem();
    const persisted: PersistedControlMirrorHumanReviewQueueItem[] = [
      {
        id: "queue-1",
        stableFindingKey: "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
        state: "open",
        updatedAt: new Date("2026-05-21T18:05:00.000Z")
      }
    ];

    const merged = mergeControlMirrorHumanReviewItemsWithQueueState([generated], persisted);

    expect(merged[0]).toMatchObject({
      id: "ai-level-mismatch",
      persistedReviewItemId: "queue-1",
      reviewState: "open",
      stableFindingKey: "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
      persistedUpdatedAt: "2026-05-21T18:05:00.000Z"
    });
  });

  it("keeps aggregate finding keys stable when affected counts change", () => {
    const first = createReviewItem({
      sourceFindingId: "untraced-artifacts",
      category: "Untraced artifact",
      affectedOutcomeId: null,
      affectedObject: "2 artifacts"
    });
    const second = createReviewItem({
      sourceFindingId: "untraced-artifacts",
      category: "Untraced artifact",
      affectedOutcomeId: null,
      affectedObject: "3 artifacts"
    });

    const prepared = prepareControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      items: [first, second]
    });

    expect(prepared).toHaveLength(1);
    expect(prepared[0]?.stableFindingKey).toBe("untraced-artifacts|untraced-artifact|||");
  });

  it("keeps uploaded snapshot review identity stable across refresh snapshots", () => {
    const first = createReviewItem({
      id: "untraced-uploaded-docs-runtime-ts",
      sourceFindingId: "uploaded:docs/runtime.ts",
      category: "Untraced artifact",
      affectedOutcomeId: null,
      affectedEpicId: null,
      affectedStoryId: null,
      affectedObject: "docs/runtime.ts in snapshot-1"
    });
    const second = createReviewItem({
      id: "untraced-uploaded-docs-runtime-ts-refresh",
      sourceFindingId: "uploaded:docs/runtime.ts",
      category: "Untraced artifact",
      affectedOutcomeId: null,
      affectedEpicId: null,
      affectedStoryId: null,
      affectedObject: "docs/runtime.ts in snapshot-2"
    });

    const firstPrepared = prepareControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      snapshotId: "snapshot-1",
      items: [first]
    });
    const secondPrepared = prepareControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      snapshotId: "snapshot-2",
      items: [second]
    });

    expect(firstPrepared[0]?.stableFindingKey).toBe(secondPrepared[0]?.stableFindingKey);
    expect(secondPrepared[0]?.stableFindingKey).toBe("uploaded-docs-runtime-ts|untraced-artifact|||");
  });

  it("treats materially changed affected objects as distinct review needs", () => {
    const first = createReviewItem({
      affectedOutcomeId: "outcome-1"
    });
    const second = createReviewItem({
      affectedOutcomeId: "outcome-2"
    });

    const prepared = prepareControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      items: [first, second]
    });

    expect(prepared).toHaveLength(2);
    expect(prepared.map((item) => item.stableFindingKey)).toEqual([
      "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
      "ai-level-recommendation|ai-level-evidence-mismatch|outcome-2||"
    ]);
  });

  it("maps human decision types to explicit lifecycle states", () => {
    expect(getControlMirrorReviewDecisionResultingState("defer")).toBe("deferred");
    expect(getControlMirrorReviewDecisionResultingState("approve_with_controls")).toBe("decided");
    expect(getControlMirrorReviewDecisionResultingState("request_rework")).toBe("decided");
  });

  it("keeps latest human decision separate from generated recommendation", () => {
    const generated = createReviewItem({
      recommendedOption: "DEFER"
    });
    const persisted: PersistedControlMirrorHumanReviewQueueItem[] = [
      {
        id: "queue-1",
        stableFindingKey: "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
        state: "decided",
        updatedAt: new Date("2026-05-21T18:10:00.000Z"),
        latestDecision: {
          id: "decision-1",
          decisionType: "approve_with_controls",
          rationale: "Proceed only after test evidence is attached.",
          actorId: "user-1",
          createdAt: new Date("2026-05-21T18:09:00.000Z")
        }
      }
    ];

    const merged = mergeControlMirrorHumanReviewItemsWithQueueState([generated], persisted);

    expect(merged[0]?.recommendedOption).toBe("DEFER");
    expect(merged[0]?.latestHumanDecision).toMatchObject({
      id: "decision-1",
      decisionType: "approve_with_controls",
      rationale: "Proceed only after test evidence is attached.",
      actorId: "user-1",
      createdAt: "2026-05-21T18:09:00.000Z"
    });
  });

  it("rejects decision recording without an explicit human actor or rationale", async () => {
    const db = {
      $transaction: vi.fn()
    };

    await expect(
      recordControlMirrorHumanReviewDecision({
        organizationId: "org-1",
        reviewItemId: "queue-1",
        decisionType: "approve_with_controls",
        rationale: "Proceed with controls.",
        actorId: ""
      }, db as never)
    ).rejects.toThrow("human actor");

    await expect(
      recordControlMirrorHumanReviewDecision({
        organizationId: "org-1",
        reviewItemId: "queue-1",
        decisionType: "approve_with_controls",
        rationale: " ",
        actorId: "user-1"
      }, db as never)
    ).rejects.toThrow("Decision rationale");

    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("appends a decision event and updates item state in one tenant-scoped transaction", async () => {
    const findFirst = vi.fn(async (query) => {
      expect(query.where).toMatchObject({
        id: "queue-1",
        organizationId: "org-1"
      });

      return {
        id: "queue-1",
        state: "open"
      };
    });
    const create = vi.fn(async (query) => {
      expect(query.data).toMatchObject({
        organizationId: "org-1",
        reviewItemId: "queue-1",
        decisionType: "approve_with_controls",
        rationale: "Proceed only with attached test evidence.",
        priorState: "open",
        resultingState: "decided",
        actorId: "user-1"
      });

      return {
        id: "decision-1",
        decisionType: "approve_with_controls",
        rationale: "Proceed only with attached test evidence.",
        priorState: "open",
        resultingState: "decided",
        actorId: "user-1",
        createdAt: new Date("2026-05-21T19:00:00.000Z")
      };
    });
    const update = vi.fn(async (query) => {
      expect(query).toMatchObject({
        where: {
          id: "queue-1"
        },
        data: {
          state: "decided"
        }
      });

      return {
        id: "queue-1",
        state: "decided"
      };
    });
    const db = {
      $transaction: vi.fn(async (callback) =>
        callback({
          controlMirrorHumanReviewItem: {
            findFirst,
            update
          },
          controlMirrorHumanReviewDecisionEvent: {
            create
          }
        })
      )
    };

    const result = await recordControlMirrorHumanReviewDecision({
      organizationId: "org-1",
      reviewItemId: "queue-1",
      decisionType: "approve_with_controls",
      rationale: "Proceed only with attached test evidence.",
      actorId: "user-1"
    }, db as never);

    expect(result.reviewItem).toMatchObject({
      id: "queue-1",
      state: "decided"
    });
    expect(result.decisionEvent).toMatchObject({
      id: "decision-1",
      resultingState: "decided"
    });
    expect(findFirst).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it("supersedes disappeared unresolved review items during queue sync", async () => {
    const upsert = vi.fn(async () => undefined);
    const updateMany = vi.fn(async () => ({
      count: 1
    }));
    const findMany = vi.fn(async () => [
      {
        id: "queue-1",
        stableFindingKey: "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
        state: "open",
        updatedAt: new Date("2026-05-21T20:00:00.000Z"),
        decisionEvents: []
      }
    ]);
    const db = {
      controlMirrorHumanReviewItem: {
        upsert,
        updateMany,
        findMany
      }
    };

    const synced = await syncControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      snapshotId: "snapshot-2",
      items: [createReviewItem()]
    }, db as never);

    expect(synced).toHaveLength(1);
    expect(upsert).toHaveBeenCalledOnce();
    expect(updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        organizationId: "org-1",
        stableFindingKey: {
          in: ["ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||"]
        },
        state: "superseded"
      },
      data: {
        state: "open"
      }
    });
    expect(updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        organizationId: "org-1",
        stableFindingKey: {
          notIn: ["ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||"]
        },
        state: {
          in: ["open", "deferred"]
        }
      },
      data: {
        state: "superseded"
      }
    });
    expect(findMany).toHaveBeenCalledOnce();
  });

  it("reopens superseded review items when the same stable finding reappears", async () => {
    const upsert = vi.fn(async () => undefined);
    const updateMany = vi.fn(async () => ({
      count: 1
    }));
    const findMany = vi.fn(async () => [
      {
        id: "queue-1",
        stableFindingKey: "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
        state: "open",
        updatedAt: new Date("2026-05-21T20:00:00.000Z"),
        decisionEvents: []
      }
    ]);
    const db = {
      controlMirrorHumanReviewItem: {
        upsert,
        updateMany,
        findMany
      }
    };

    const synced = await syncControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      snapshotId: "snapshot-2",
      items: [createReviewItem()]
    }, db as never);

    expect(synced).toHaveLength(1);
    expect(updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        organizationId: "org-1",
        stableFindingKey: {
          in: ["ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||"]
        },
        state: "superseded"
      },
      data: {
        state: "open"
      }
    });
  });

  it("supersedes unresolved queue rows when the current sync set is empty", async () => {
    const upsert = vi.fn();
    const findMany = vi.fn();
    const updateMany = vi.fn(async (query) => {
      expect(query).toMatchObject({
        where: {
          organizationId: "org-1",
          state: {
            in: ["open", "deferred"]
          }
        },
        data: {
          state: "superseded"
        }
      });

      return {
        count: 2
      };
    });
    const db = {
      controlMirrorHumanReviewItem: {
        upsert,
        updateMany,
        findMany
      }
    };

    const synced = await syncControlMirrorHumanReviewQueueItems({
      organizationId: "org-1",
      items: []
    }, db as never);

    expect(synced).toEqual([]);
    expect(updateMany).toHaveBeenCalledOnce();
    expect(upsert).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });
});
