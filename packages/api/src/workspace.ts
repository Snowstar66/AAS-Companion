import {
  appendActivityEvent,
  listOrganizationUsers,
  getOutcomeWorkspaceSnapshot,
  reviewOutcomeFramingWithAi,
  getStoryWorkspaceSnapshot,
  validateOutcomeFieldWithAi,
  updateOutcome,
  updateStory,
  upsertTollgate
} from "@aas-companion/db";
import {
  artifactComplianceResultSchema,
  buildGovernedRemovalDecision,
  executionContractSchema,
  executionContractToMarkdown,
  type GovernedChildImpact,
  getOutcomeFramingReadiness,
  getStoryHandoffReadiness
} from "@aas-companion/domain";
import { getArtifactCandidateById } from "@aas-companion/db";
import { withDevTiming } from "./dev-timing";
import { failure, success, type ApiResult } from "./shared";
import { getTollgateReviewWorkspaceService } from "./tollgates";

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
  objectType: GovernedChildImpact["objectType"],
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

function buildOutcomeRemovalFromSnapshot(snapshot: NonNullable<Awaited<ReturnType<typeof getOutcomeWorkspaceSnapshot>>>) {
  const activeChildren = [
    ...snapshot.outcome.epics.map((epic) => toGovernedChildImpact("epic", epic)),
    ...snapshot.outcome.stories.map((story) => toGovernedChildImpact("story", story))
  ];

  return {
    entityType: "outcome" as const,
    entityId: snapshot.outcome.id,
    key: snapshot.outcome.key,
    title: snapshot.outcome.title,
    activeChildren,
    decision: buildGovernedRemovalDecision({
      objectType: "outcome",
      key: snapshot.outcome.key,
      title: snapshot.outcome.title,
      originType: snapshot.outcome.originType,
      createdMode: snapshot.outcome.createdMode,
      lifecycleState: snapshot.outcome.lifecycleState,
      status: snapshot.outcome.status,
      lineageReference: toLineageReference(snapshot.outcome),
      importedReadinessState: snapshot.outcome.importedReadinessState,
      activityEventCount: snapshot.activities.length,
      tollgateCount: snapshot.tollgate ? 1 : 0,
      activeChildren
    })
  };
}

function buildStoryRemovalFromSnapshot(snapshot: NonNullable<Awaited<ReturnType<typeof getStoryWorkspaceSnapshot>>>) {
  const archivedAncestorLabels: string[] = [];

  if (snapshot.story.lifecycleState === "archived" && snapshot.story.outcome.lifecycleState === "archived") {
    archivedAncestorLabels.push(`Outcome ${snapshot.story.outcome.key}`);
  }

  if (snapshot.story.lifecycleState === "archived" && snapshot.story.epic.lifecycleState === "archived") {
    archivedAncestorLabels.push(`Epic ${snapshot.story.epic.key}`);
  }

  return {
    entityType: "story" as const,
    entityId: snapshot.story.id,
    key: snapshot.story.key,
    title: snapshot.story.title,
    activeChildren: [] as GovernedChildImpact[],
    decision: buildGovernedRemovalDecision({
      objectType: "story",
      key: snapshot.story.key,
      title: snapshot.story.title,
      originType: snapshot.story.originType,
      createdMode: snapshot.story.createdMode,
      lifecycleState: snapshot.story.lifecycleState,
      status: snapshot.story.status,
      lineageReference: toLineageReference(snapshot.story),
      importedReadinessState: snapshot.story.importedReadinessState,
      activityEventCount: snapshot.activities.length,
      tollgateCount: snapshot.tollgate ? 1 : 0,
      activeChildren: [],
      archivedAncestorLabels
    })
  };
}

async function getImportedStoryBuildBlockers(input: {
  organizationId: string;
  originType: string;
  lineageSourceType: string | null;
  lineageSourceId: string | null;
}) {
  if (input.originType !== "imported" || input.lineageSourceType !== "artifact_aas_candidate" || !input.lineageSourceId) {
    return [];
  }

  const candidate = await getArtifactCandidateById(input.organizationId, input.lineageSourceId);

  if (!candidate) {
    return ["The imported lineage reference can no longer be resolved to its source candidate."];
  }

  const compliance = artifactComplianceResultSchema.safeParse(candidate.complianceResult);
  const complianceFindings = compliance.success ? compliance.data.findings : [];
  const humanOrBlocked = complianceFindings.filter(
    (finding) => finding.category === "blocked" || finding.category === "human_only"
  );

  if (candidate.reviewStatus === "pending") {
    return ["Imported candidate still requires human confirmation before build progression."];
  }

  if (candidate.reviewStatus === "follow_up_needed") {
    return ["Imported candidate still has follow-up decisions open and cannot progress to build handoff."];
  }

  if (candidate.reviewStatus === "rejected") {
    return ["Imported candidate was rejected and cannot progress to build handoff."];
  }

  if (candidate.importedReadinessState !== "imported_design_ready") {
    return humanOrBlocked.map((finding) => finding.message);
  }

  return [];
}

function summarizeExpectedBehavior(acceptanceCriteria: string[]) {
  const normalized = acceptanceCriteria.map((item) => item.trim()).filter(Boolean);

  if (normalized.length === 0) {
    return null;
  }

  return normalized.slice(0, 2).join(" | ");
}

export async function getOutcomeWorkspaceService(organizationId: string, outcomeId: string) {
  return withDevTiming("api.getOutcomeWorkspaceService", async () => {
    const snapshot = await getOutcomeWorkspaceSnapshot(organizationId, outcomeId);

    if (!snapshot) {
      return failure({
        code: "outcome_not_found",
        message: "Outcome was not found in the current organization."
      });
    }

    const [tollgateReview, availableOwners] = await Promise.all([
      getTollgateReviewWorkspaceService({
        organizationId,
        entityType: "outcome",
        entityId: outcomeId,
        tollgateType: "tg1_baseline",
        aiAccelerationLevel: snapshot.outcome.aiAccelerationLevel,
        fallbackBlockers:
          snapshot.tollgate?.blockers ??
          getOutcomeFramingReadiness({
            ...snapshot.outcome,
            epicCount: snapshot.outcome.epics.length
          }).reasons.map((reason) => reason.message),
        fallbackComments: snapshot.tollgate?.comments ?? null,
        existingTollgate: snapshot.tollgate
      }),
      listOrganizationUsers(organizationId)
    ]);

    return success({
      ...snapshot,
      availableOwners,
      readiness: getOutcomeFramingReadiness({
        ...snapshot.outcome,
        epicCount: snapshot.outcome.epics.length
      }),
      tollgateReview: tollgateReview.ok ? tollgateReview.data : null,
      removal: buildOutcomeRemovalFromSnapshot(snapshot)
    });
  }, `organizationId=${organizationId} outcomeId=${outcomeId}`);
}

export async function saveOutcomeWorkspaceService(input: {
  organizationId: string;
  id: string;
  actorId?: string | null;
  title?: string;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
  baselineDefinition?: string | null;
  baselineSource?: string | null;
  timeframe?: string | null;
  valueOwnerId?: string | null;
  riskProfile?: "low" | "medium" | "high";
  aiAccelerationLevel?: "level_1" | "level_2" | "level_3";
}) {
  const result = await updateOutcome({
    organizationId: input.organizationId,
    id: input.id,
    actorId: input.actorId ?? null,
    title: input.title,
    problemStatement: input.problemStatement,
    outcomeStatement: input.outcomeStatement,
    baselineDefinition: input.baselineDefinition,
    baselineSource: input.baselineSource,
    timeframe: input.timeframe,
    valueOwnerId: input.valueOwnerId,
    riskProfile: input.riskProfile,
    aiAccelerationLevel: input.aiAccelerationLevel
  });

  return success(result);
}

export async function validateOutcomeFieldWithAiService(input: {
  organizationId: string;
  field: "outcome_statement" | "baseline_definition";
  title?: string | null;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
  baselineDefinition?: string | null;
  baselineSource?: string | null;
  timeframe?: string | null;
}) {
  return withDevTiming("api.validateOutcomeFieldWithAiService", async () => {
    try {
      const result = await validateOutcomeFieldWithAi({
        field: input.field,
        title: input.title ?? null,
        problemStatement: input.problemStatement ?? null,
        outcomeStatement: input.outcomeStatement ?? null,
        baselineDefinition: input.baselineDefinition ?? null,
        baselineSource: input.baselineSource ?? null,
        timeframe: input.timeframe ?? null
      });

      return success(result);
    } catch (error) {
      return failure({
        code: "ai_validation_failed",
        message: error instanceof Error ? error.message : "AI field validation failed."
      });
    }
  }, `organizationId=${input.organizationId} field=${input.field}`);
}

export async function reviewOutcomeFramingWithAiService(input: {
  organizationId: string;
  outcomeId: string;
}) {
  return withDevTiming("api.reviewOutcomeFramingWithAiService", async () => {
    const snapshot = await getOutcomeWorkspaceSnapshot(input.organizationId, input.outcomeId);

    if (!snapshot) {
      return failure({
        code: "outcome_not_found",
        message: "Outcome was not found in the current organization."
      });
    }

    try {
      const result = await reviewOutcomeFramingWithAi({
        outcome: {
          key: snapshot.outcome.key,
          title: snapshot.outcome.title,
          problemStatement: snapshot.outcome.problemStatement ?? null,
          outcomeStatement: snapshot.outcome.outcomeStatement ?? null,
          baselineDefinition: snapshot.outcome.baselineDefinition ?? null,
          baselineSource: snapshot.outcome.baselineSource ?? null,
          timeframe: snapshot.outcome.timeframe ?? null,
          aiAccelerationLevel: snapshot.outcome.aiAccelerationLevel,
          riskProfile: snapshot.outcome.riskProfile
        },
        epics: snapshot.outcome.epics.map((epic) => ({
          key: epic.key,
          title: epic.title,
          purpose: epic.purpose ?? null,
          scopeBoundary: epic.scopeBoundary ?? null,
          seedCount: epic.stories.length
        })),
        directionSeeds: snapshot.outcome.stories.map((story) => ({
          seedId: story.key,
          title: story.title,
          epicKey: snapshot.outcome.epics.find((epic) => epic.id === story.epicId)?.key ?? null,
          shortDescription: story.valueIntent?.trim() || null,
          expectedBehavior: summarizeExpectedBehavior(story.acceptanceCriteria)
        }))
      });

      return success(result);
    } catch (error) {
      return failure({
        code: "ai_framing_review_failed",
        message: error instanceof Error ? error.message : "AI framing review failed."
      });
    }
  }, `organizationId=${input.organizationId} outcomeId=${input.outcomeId}`);
}

export async function submitOutcomeTollgateService(input: {
  organizationId: string;
  outcomeId: string;
  actorId?: string | null;
  comments?: string | null;
}) {
  const snapshot = await getOutcomeWorkspaceSnapshot(input.organizationId, input.outcomeId);

  if (!snapshot) {
    return failure({
      code: "outcome_not_found",
      message: "Outcome was not found in the current organization."
    });
  }

  const readiness = getOutcomeFramingReadiness({
    ...snapshot.outcome,
    epicCount: snapshot.outcome.epics.length
  });
  const blockers = readiness.reasons.map((reason) => reason.message);
  const isReady = readiness.state === "ready";

  await upsertTollgate({
    organizationId: input.organizationId,
    entityType: "outcome",
    entityId: input.outcomeId,
    tollgateType: "tg1_baseline",
    status: isReady ? "ready" : "blocked",
    blockers,
    approverRoles: ["value_owner", "architect"],
    comments: input.comments ?? null,
    actorId: input.actorId ?? null
  });

  const updatedOutcome = await updateOutcome({
    organizationId: input.organizationId,
    id: input.outcomeId,
    actorId: input.actorId ?? null,
    status: isReady ? "ready_for_tg1" : "baseline_in_progress"
  });

  return success({
    outcome: updatedOutcome,
    blockers
  });
}

export async function getStoryWorkspaceService(organizationId: string, storyId: string) {
  return withDevTiming("api.getStoryWorkspaceService", async () => {
    const snapshot = await getStoryWorkspaceSnapshot(organizationId, storyId);

    if (!snapshot) {
      return failure({
        code: "story_not_found",
        message: "Story was not found in the current organization."
      });
    }

    const importedBuildBlockers = await getImportedStoryBuildBlockers({
      organizationId,
      originType: snapshot.story.originType,
      lineageSourceType: snapshot.story.lineageSourceType,
      lineageSourceId: snapshot.story.lineageSourceId
    });
    const baseReadinessBlockers = getStoryHandoffReadiness(snapshot.story).reasons.map((reason) => reason.message);
    const tollgateReview = await getTollgateReviewWorkspaceService({
      organizationId,
      entityType: "story",
      entityId: storyId,
      tollgateType: "story_readiness",
      aiAccelerationLevel: snapshot.story.aiAccelerationLevel,
      fallbackBlockers: [...new Set([...(snapshot.tollgate?.blockers ?? baseReadinessBlockers), ...importedBuildBlockers])],
      fallbackComments: snapshot.tollgate?.comments ?? null,
      existingTollgate: snapshot.tollgate
    });

    return success({
      ...snapshot,
      readiness: getStoryHandoffReadiness(snapshot.story),
      importedBuildBlockers,
      tollgateReview: tollgateReview.ok ? tollgateReview.data : null,
      removal: buildStoryRemovalFromSnapshot(snapshot)
    });
  }, `organizationId=${organizationId} storyId=${storyId}`);
}

export async function saveStoryWorkspaceService(input: {
  organizationId: string;
  id: string;
  actorId?: string | null;
  title?: string;
  storyType?: "outcome_delivery" | "governance" | "enablement";
  valueIntent?: string;
  acceptanceCriteria?: string[];
  aiUsageScope?: string[];
  testDefinition?: string | null;
  definitionOfDone?: string[];
}) {
  const result = await updateStory({
    organizationId: input.organizationId,
    id: input.id,
    actorId: input.actorId ?? null,
    title: input.title,
    storyType: input.storyType,
    valueIntent: input.valueIntent,
    acceptanceCriteria: input.acceptanceCriteria,
    aiUsageScope: input.aiUsageScope,
    testDefinition: input.testDefinition,
    definitionOfDone: input.definitionOfDone
  });

  return success(result);
}

export async function submitStoryReadinessService(input: {
  organizationId: string;
  storyId: string;
  actorId?: string | null;
  comments?: string | null;
}) {
  const snapshot = await getStoryWorkspaceSnapshot(input.organizationId, input.storyId);

  if (!snapshot) {
    return failure({
      code: "story_not_found",
      message: "Story was not found in the current organization."
    });
  }

  const readiness = getStoryHandoffReadiness(snapshot.story);
  const blockers = readiness.reasons.map((reason) => reason.message);
  const importedBuildBlockers = await getImportedStoryBuildBlockers({
    organizationId: input.organizationId,
    originType: snapshot.story.originType,
    lineageSourceType: snapshot.story.lineageSourceType,
    lineageSourceId: snapshot.story.lineageSourceId
  });
  const combinedBlockers = [...new Set([...blockers, ...importedBuildBlockers])];
  const isReady = readiness.state === "ready" && combinedBlockers.length === 0;

  await upsertTollgate({
    organizationId: input.organizationId,
    entityType: "story",
    entityId: input.storyId,
    tollgateType: "story_readiness",
    status: isReady ? "ready" : "blocked",
    blockers: combinedBlockers,
    approverRoles: ["delivery_lead", "builder"],
    comments: input.comments ?? null,
    actorId: input.actorId ?? null
  });

  const updatedStory = await updateStory({
    organizationId: input.organizationId,
    id: input.storyId,
    actorId: input.actorId ?? null,
    status: isReady ? "ready_for_handoff" : "definition_blocked"
  });

  return success({
    story: updatedStory,
    blockers: combinedBlockers
  });
}

export async function previewExecutionContractService(input: {
  organizationId: string;
  storyId: string;
  actorId?: string | null;
}): Promise<
  ApiResult<{
    contract: ReturnType<typeof executionContractSchema.parse>;
    markdown: string;
  }>
> {
  return withDevTiming("api.previewExecutionContractService", async () => {
    const snapshot = await getStoryWorkspaceSnapshot(input.organizationId, input.storyId);

    if (!snapshot) {
      return failure({
        code: "story_not_found",
        message: "Story was not found in the current organization."
      });
    }

    const readiness = getStoryHandoffReadiness(snapshot.story);
    const blockers = readiness.reasons.map((reason) => reason.message);
    const importedBuildBlockers = await getImportedStoryBuildBlockers({
      organizationId: input.organizationId,
      originType: snapshot.story.originType,
      lineageSourceType: snapshot.story.lineageSourceType,
      lineageSourceId: snapshot.story.lineageSourceId
    });
    const combinedBlockers = [...new Set([...blockers, ...importedBuildBlockers])];

    if (combinedBlockers.length > 0) {
      if (snapshot.story.originType === "imported") {
        await appendActivityEvent({
          organizationId: input.organizationId,
          entityType: "story",
          entityId: snapshot.story.id,
          eventType: "imported_progression_blocked",
          actorId: input.actorId ?? null,
          metadata: {
            storyKey: snapshot.story.key,
            blockers: combinedBlockers
          }
        });
      }

      return failure({
        code: "story_not_ready",
        message: combinedBlockers[0] ?? "Story is not ready for execution contract generation."
      });
    }

    const contract = executionContractSchema.parse({
      outcome_id: snapshot.story.outcomeId,
      epic_id: snapshot.story.epicId,
      story_id: snapshot.story.id,
      story_key: snapshot.story.key,
      ai_level: snapshot.story.aiAccelerationLevel,
      acceptance_criteria: snapshot.story.acceptanceCriteria,
      test_definition: snapshot.story.testDefinition,
      definition_of_done: snapshot.story.definitionOfDone
    });

    await appendActivityEvent({
      organizationId: input.organizationId,
      entityType: "story",
      entityId: snapshot.story.id,
      eventType: "execution_contract_generated",
      actorId: input.actorId ?? null,
      metadata: {
        storyKey: snapshot.story.key
      }
    });

    if (snapshot.story.originType === "imported") {
      await appendActivityEvent({
        organizationId: input.organizationId,
        entityType: "story",
        entityId: snapshot.story.id,
        eventType: "imported_progression_allowed",
        actorId: input.actorId ?? null,
        metadata: {
          storyKey: snapshot.story.key,
          importedReadinessState: snapshot.story.importedReadinessState ?? null
        }
      });
    }

    return success({
      contract,
      markdown: executionContractToMarkdown(contract)
    });
  }, `organizationId=${input.organizationId} storyId=${input.storyId}`);
}

export async function markStoryHandoffCompleteService(input: {
  organizationId: string;
  storyId: string;
  actorId?: string | null;
}) {
  return withDevTiming("api.markStoryHandoffCompleteService", async () => {
    const snapshot = await getStoryWorkspaceSnapshot(input.organizationId, input.storyId);

    if (!snapshot) {
      return failure({
        code: "story_not_found",
        message: "Story was not found in the current organization."
      });
    }

    if (snapshot.story.lifecycleState === "archived") {
      return failure({
        code: "story_archived",
        message: "Restore the Story before recording handoff completion."
      });
    }

    const readiness = getStoryHandoffReadiness(snapshot.story);
    const blockers = readiness.reasons.map((reason) => reason.message);
    const importedBuildBlockers = await getImportedStoryBuildBlockers({
      organizationId: input.organizationId,
      originType: snapshot.story.originType,
      lineageSourceType: snapshot.story.lineageSourceType,
      lineageSourceId: snapshot.story.lineageSourceId
    });
    const combinedBlockers = [...new Set([...blockers, ...importedBuildBlockers])];

    if (combinedBlockers.length > 0) {
      return failure({
        code: "story_not_ready",
        message: combinedBlockers[0] ?? "Story is not ready for handoff completion."
      });
    }

    if (snapshot.story.status === "in_progress") {
      return success({
        story: snapshot.story,
        alreadyCompleted: true
      });
    }

    const story = await updateStory({
      organizationId: input.organizationId,
      id: input.storyId,
      actorId: input.actorId ?? null,
      status: "in_progress"
    });

    return success({
      story,
      alreadyCompleted: false
    });
  }, `organizationId=${input.organizationId} storyId=${input.storyId}`);
}
