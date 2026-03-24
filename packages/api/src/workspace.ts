import {
  appendActivityEvent,
  getGovernedRemovalState,
  getOutcomeWorkspaceSnapshot,
  getStoryWorkspaceSnapshot,
  updateOutcome,
  updateStory,
  upsertTollgate
} from "@aas-companion/db";
import {
  artifactComplianceResultSchema,
  executionContractSchema,
  executionContractToMarkdown,
  getOutcomeBaselineReadiness,
  getStoryHandoffReadiness
} from "@aas-companion/domain";
import { getArtifactCandidateById } from "@aas-companion/db";
import { failure, success, type ApiResult } from "./shared";
import { getTollgateReviewWorkspaceService } from "./tollgates";

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

export async function getOutcomeWorkspaceService(organizationId: string, outcomeId: string) {
  const snapshot = await getOutcomeWorkspaceSnapshot(organizationId, outcomeId);

  if (!snapshot) {
    return failure({
      code: "outcome_not_found",
      message: "Outcome was not found in the current organization."
    });
  }

  const tollgateReview = await getTollgateReviewWorkspaceService({
    organizationId,
    entityType: "outcome",
    entityId: outcomeId,
    tollgateType: "tg1_baseline",
    aiAccelerationLevel: snapshot.outcome.aiAccelerationLevel,
    fallbackBlockers: snapshot.tollgate?.blockers ?? getOutcomeBaselineReadiness(snapshot.outcome).reasons.map((reason) => reason.message),
    fallbackComments: snapshot.tollgate?.comments ?? null
  });

  return success({
    ...snapshot,
    readiness: getOutcomeBaselineReadiness(snapshot.outcome),
    tollgateReview: tollgateReview.ok ? tollgateReview.data : null,
    removal: await getGovernedRemovalState({
      organizationId,
      entityType: "outcome",
      entityId: outcomeId
    })
  });
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
  riskProfile?: "low" | "medium" | "high";
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
    riskProfile: input.riskProfile
  });

  return success(result);
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

  const readiness = getOutcomeBaselineReadiness(snapshot.outcome);
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
    fallbackComments: snapshot.tollgate?.comments ?? null
  });

  return success({
    ...snapshot,
    readiness: getStoryHandoffReadiness(snapshot.story),
    importedBuildBlockers,
    tollgateReview: tollgateReview.ok ? tollgateReview.data : null,
    removal: await getGovernedRemovalState({
      organizationId,
      entityType: "story",
      entityId: storyId
    })
  });
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
}
