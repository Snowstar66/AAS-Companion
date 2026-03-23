import {
  appendActivityEvent,
  getOutcomeWorkspaceSnapshot,
  getStoryWorkspaceSnapshot,
  updateOutcome,
  updateStory,
  upsertTollgate
} from "@aas-companion/db";
import {
  executionContractSchema,
  executionContractToMarkdown,
  getOutcomeBaselineBlockers,
  getStoryReadinessBlockers
} from "@aas-companion/domain";
import { failure, success, type ApiResult } from "./shared";

export async function getOutcomeWorkspaceService(organizationId: string, outcomeId: string) {
  const snapshot = await getOutcomeWorkspaceSnapshot(organizationId, outcomeId);

  if (!snapshot) {
    return failure({
      code: "outcome_not_found",
      message: "Outcome was not found in the current organization."
    });
  }

  return success(snapshot);
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

  const blockers = getOutcomeBaselineBlockers(snapshot.outcome);
  const isReady = blockers.length === 0;

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

  return success(snapshot);
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

  const blockers = getStoryReadinessBlockers(snapshot.story);
  const isReady = blockers.length === 0;

  await upsertTollgate({
    organizationId: input.organizationId,
    entityType: "story",
    entityId: input.storyId,
    tollgateType: "story_readiness",
    status: isReady ? "ready" : "blocked",
    blockers,
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
    blockers
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

  const blockers = getStoryReadinessBlockers(snapshot.story);

  if (blockers.length > 0) {
    return failure({
      code: "story_not_ready",
      message: blockers[0] ?? "Story is not ready for execution contract generation."
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

  return success({
    contract,
    markdown: executionContractToMarkdown(contract)
  });
}
