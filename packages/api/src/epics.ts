import {
  getGovernedRemovalState,
  createEpic,
  createStory,
  getEpicById,
  getEpicWorkspaceSnapshot,
  getOutcomeById,
  listEpics,
  listStories,
  updateEpic
} from "@aas-companion/db";
import { failure, success, type ApiResult } from "./shared";

function buildNextKey(existingKeys: string[], prefix: string) {
  const numericKeys = existingKeys
    .map((key) => new RegExp(`^${prefix}-(\\d+)$`).exec(key)?.[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  const nextNumber = (numericKeys.length > 0 ? Math.max(...numericKeys) : 0) + 1;
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

export async function listEpicsService(organizationId: string): Promise<ApiResult<Awaited<ReturnType<typeof listEpics>>>> {
  return success(await listEpics(organizationId));
}

export async function getEpicWorkspaceService(
  organizationId: string,
  epicId: string
) {
  const snapshot = await getEpicWorkspaceSnapshot(organizationId, epicId);

  if (!snapshot) {
    return failure({
      code: "epic_not_found",
      message: "Epic was not found in the current organization."
    });
  }

  const removal = await getGovernedRemovalState({
    organizationId,
    entityType: "epic",
    entityId: epicId
  });

  return success({
    ...snapshot,
    removal
  });
}

export async function createNativeEpicFromOutcomeService(input: {
  organizationId: string;
  outcomeId: string;
  actorId?: string | null;
}) {
  const outcome = await getOutcomeById(input.organizationId, input.outcomeId);

  if (!outcome) {
    return failure({
      code: "outcome_not_found",
      message: "Outcome was not found in the current organization."
    });
  }

  const epics = await listEpics(input.organizationId, { includeArchived: true });
  const key = buildNextKey(epics.map((epic) => epic.key), "EPC");

  return success(
    await createEpic({
      organizationId: input.organizationId,
      outcomeId: outcome.id,
      key,
      title: "New epic",
      purpose: "Describe the value area this Epic advances.",
      scopeBoundary: "Describe what this Epic includes, excludes, or leaves for later.",
      riskNote: null,
      status: "draft",
      originType: "native",
      createdMode: "clean",
      actorId: input.actorId ?? null
    })
  );
}

export async function createNativeStoryFromEpicService(input: {
  organizationId: string;
  epicId: string;
  actorId?: string | null;
}) {
  const epic = await getEpicById(input.organizationId, input.epicId);

  if (!epic) {
    return failure({
      code: "epic_not_found",
      message: "Epic was not found in the current organization."
    });
  }

  const stories = await listStories(input.organizationId, { includeArchived: true });
  const key = buildNextKey(stories.map((story) => story.key), "STR");
  const outcome = await getOutcomeById(input.organizationId, epic.outcomeId);

  return success(
    await createStory({
      organizationId: input.organizationId,
      outcomeId: epic.outcomeId,
      epicId: epic.id,
      key,
      title: "New story",
      storyType: "outcome_delivery",
      valueIntent: "Describe the intended value for this story.",
      acceptanceCriteria: [],
      aiUsageScope: [],
      aiAccelerationLevel: outcome?.aiAccelerationLevel ?? "level_2",
      testDefinition: null,
      definitionOfDone: [],
      status: "draft",
      originType: "native",
      createdMode: "clean",
      actorId: input.actorId ?? null
    })
  );
}

export async function saveEpicWorkspaceService(input: {
  organizationId: string;
  id: string;
  actorId?: string | null;
  title?: string;
  purpose?: string;
  scopeBoundary?: string | null;
  riskNote?: string | null;
}) {
  const result = await updateEpic({
    organizationId: input.organizationId,
    id: input.id,
    actorId: input.actorId ?? null,
    title: input.title,
    purpose: input.purpose,
    scopeBoundary: input.scopeBoundary,
    riskNote: input.riskNote
  });

  return success(result);
}
