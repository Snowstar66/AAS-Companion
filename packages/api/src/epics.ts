import {
  createStory,
  createDirectionSeed,
  getArtifactCandidateById,
  createEpic,
  getDirectionSeedById,
  getEpicById,
  getEpicWorkspaceSnapshot,
  getOutcomeById,
  listDirectionSeeds,
  listEpics,
  listStoriesByDirectionSeedId,
  listStories,
  validateStoryExpectedBehaviorWithAi,
  updateEpic
} from "@aas-companion/db";
import { updateDirectionSeed } from "@aas-companion/db";
import {
  artifactCandidateDraftRecordSchema,
  buildGovernedRemovalDecision,
  type GovernedChildImpact
} from "@aas-companion/domain";
import { failure, success, type ApiResult } from "./shared";

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

function toGovernedChildImpact(record: {
  id: string;
  key: string;
  title: string;
  lifecycleState: "active" | "archived";
}, objectType: GovernedChildImpact["objectType"] = "story"): GovernedChildImpact {
  return {
    objectType,
    id: record.id,
    key: record.key,
    title: record.title,
    lifecycleState: record.lifecycleState
  };
}

function buildEpicRemovalFromSnapshot(snapshot: NonNullable<Awaited<ReturnType<typeof getEpicWorkspaceSnapshot>>>) {
  const activeChildren = [
    ...snapshot.epic.directionSeeds.map((seed) => toGovernedChildImpact(seed, "direction_seed")),
    ...snapshot.epic.stories.map((story) => toGovernedChildImpact(story))
  ];
  const archivedAncestorLabels =
    snapshot.epic.lifecycleState === "archived" && snapshot.epic.outcome.lifecycleState === "archived"
      ? [`Outcome ${snapshot.epic.outcome.key}`]
      : [];

  return {
    entityType: "epic" as const,
    entityId: snapshot.epic.id,
    key: snapshot.epic.key,
    title: snapshot.epic.title,
    activeChildren,
    decision: buildGovernedRemovalDecision({
      objectType: "epic",
      key: snapshot.epic.key,
      title: snapshot.epic.title,
      originType: snapshot.epic.originType,
      createdMode: snapshot.epic.createdMode,
      lifecycleState: snapshot.epic.lifecycleState,
      status: snapshot.epic.status,
      lineageReference: toLineageReference(snapshot.epic),
      importedReadinessState: snapshot.epic.importedReadinessState,
      activityEventCount: snapshot.activities.length,
      tollgateCount: 0,
      activeChildren,
      archivedAncestorLabels
    })
  };
}

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

  return success({
    ...snapshot,
    removal: buildEpicRemovalFromSnapshot(snapshot)
  });
}

export async function getDirectionSeedWorkspaceService(
  organizationId: string,
  directionSeedId: string
) {
  const seed = await getDirectionSeedById(organizationId, directionSeedId);

  if (!seed) {
    return failure({
      code: "direction_seed_not_found",
      message: "Story Idea was not found in the current organization."
    });
  }

  const [epic, outcome, derivedDeliveryStories] = await Promise.all([
    getEpicById(organizationId, seed.epicId),
    getOutcomeById(organizationId, seed.outcomeId),
    listStoriesByDirectionSeedId(organizationId, seed.id)
  ]);

  if (!epic || !outcome) {
    return failure({
      code: "direction_seed_context_missing",
      message: "Story Idea context could not be resolved."
    });
  }

  return success({
    seed,
    epic,
    outcome,
    derivedDeliveryStories
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

export async function createNativeDirectionSeedFromEpicService(input: {
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

  const directionSeeds = await listDirectionSeeds(input.organizationId, { includeArchived: true });
  const key = buildNextKey(directionSeeds.map((seed) => seed.key), "SEED");

  return success(
    await createDirectionSeed({
      organizationId: input.organizationId,
      outcomeId: epic.outcomeId,
      epicId: epic.id,
      key,
      title: "New direction seed",
      shortDescription: "Describe the directional change this seed points toward.",
      expectedBehavior: null,
      uxSketchName: null,
      uxSketchContentType: null,
      uxSketchDataUrl: null,
      originType: "native",
      createdMode: "clean",
      actorId: input.actorId ?? null
    })
  );
}

export async function saveDirectionSeedService(input: {
  organizationId: string;
  id: string;
  actorId?: string | null;
  title?: string;
  shortDescription?: string;
  expectedBehavior?: string | null;
  uxSketchName?: string | null;
  uxSketchContentType?: string | null;
  uxSketchDataUrl?: string | null;
}) {
  const existing = await getDirectionSeedById(input.organizationId, input.id);

  if (!existing) {
    return failure({
      code: "direction_seed_not_found",
      message: "Direction seed was not found in the current organization."
    });
  }

  const result = await updateDirectionSeed({
    organizationId: input.organizationId,
    id: input.id,
    actorId: input.actorId ?? null,
    title: input.title,
    shortDescription: input.shortDescription,
    expectedBehavior: input.expectedBehavior,
    uxSketchName: input.uxSketchName,
    uxSketchContentType: input.uxSketchContentType,
    uxSketchDataUrl: input.uxSketchDataUrl
  });

  return success(result);
}

export async function createDeliveryStoryFromDirectionSeedService(input: {
  organizationId: string;
  directionSeedId: string;
  actorId?: string | null;
}) {
  const seed = await getDirectionSeedById(input.organizationId, input.directionSeedId);

  if (!seed) {
    return failure({
      code: "direction_seed_not_found",
      message: "Story Idea was not found in the current organization."
    });
  }

  const [outcome, stories, linkedStories] = await Promise.all([
    getOutcomeById(input.organizationId, seed.outcomeId),
    listStories(input.organizationId, { includeArchived: true }),
    listStoriesByDirectionSeedId(input.organizationId, seed.id)
  ]);

  if (!outcome) {
    return failure({
      code: "outcome_not_found",
      message: "Parent Outcome for this Story Idea could not be resolved."
    });
  }

  const sourceImportDraftRecord =
    seed.lineageSourceType === "artifact_aas_candidate" && seed.lineageSourceId
      ? await getArtifactCandidateById(input.organizationId, seed.lineageSourceId)
      : null;
  const importedStoryDraft =
    sourceImportDraftRecord?.type === "story"
      ? artifactCandidateDraftRecordSchema.parse(sourceImportDraftRecord.draftRecord ?? {})
      : null;
  const key = buildNextKey(stories.map((story) => story.key), "STR");
  const createdStory = await createStory({
    organizationId: input.organizationId,
    outcomeId: seed.outcomeId,
    epicId: seed.epicId,
    key,
    title: seed.title,
    storyType: importedStoryDraft?.storyType ?? "outcome_delivery",
    valueIntent: seed.shortDescription,
    expectedBehavior: seed.expectedBehavior ?? null,
    acceptanceCriteria: importedStoryDraft?.acceptanceCriteria ?? [],
    aiUsageScope: importedStoryDraft?.aiUsageScope ?? [],
    aiAccelerationLevel: outcome.aiAccelerationLevel,
    testDefinition: importedStoryDraft?.testDefinition ?? null,
    definitionOfDone: importedStoryDraft?.definitionOfDone ?? [],
    sourceDirectionSeedId: seed.id,
    status: "draft",
    originType: seed.originType,
    createdMode: seed.createdMode,
    lineageReference:
      seed.lineageSourceType && seed.lineageSourceId
        ? {
            sourceType: seed.lineageSourceType,
            sourceId: seed.lineageSourceId,
            note: seed.lineageNote
          }
        : null,
    importedReadinessState: seed.importedReadinessState ?? null,
    actorId: input.actorId ?? null
  });

  return success({
    story: createdStory,
    created: true,
    existingLinkedStoryCount: linkedStories.length
  });
}

export async function validateDirectionSeedExpectedBehaviorWithAiService(input: {
  organizationId: string;
  title?: string | null;
  shortDescription?: string | null;
  expectedBehavior?: string | null;
  epicTitle?: string | null;
  epicPurpose?: string | null;
  epicScopeBoundary?: string | null;
}) {
  try {
    const result = await validateStoryExpectedBehaviorWithAi({
      title: input.title ?? null,
      valueIntent: input.shortDescription ?? null,
      expectedBehavior: input.expectedBehavior ?? null,
      epicTitle: input.epicTitle ?? null,
      epicPurpose: input.epicPurpose ?? null,
      epicScopeBoundary: input.epicScopeBoundary ?? null
    });

    return success(result);
  } catch (error) {
    return failure({
      code: "ai_validation_failed",
      message: error instanceof Error ? error.message : "AI expected behavior validation failed."
    });
  }
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
