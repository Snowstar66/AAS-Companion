import {
  appendActivityEvent,
  getDirectionSeedById,
  getDirectionSeedBySourceStoryId,
  listPartyRoleEntries,
  listOrganizationUsers,
  listStoriesByDirectionSeedId,
  getOutcomeTollgateReviewSnapshot,
  getOutcomeWorkspaceSnapshot,
  reviewOutcomeFramingWithAi,
  getStoryWorkspaceSnapshot,
  validateStoryExpectedBehaviorWithAi,
  validateOutcomeFieldWithAi,
  updateOutcome,
  updateStory,
  upsertTollgate
} from "@aas-companion/db";
import {
  artifactComplianceResultSchema,
  analyzeJourneyCoverage,
  buildGovernedRemovalDecision,
  deriveOutcomeRiskProfile,
  executionContractSchema,
  executionContractToMarkdown,
  type GovernedChildImpact,
  getOutcomeFramingReadiness,
  getStoryHandoffReadiness,
  parseDownstreamAiInstructions,
  parseJourneyContexts,
  validateStoryAgainstValueSpine
} from "@aas-companion/domain";
import { getArtifactCandidateById } from "@aas-companion/db";
import { withDevTiming } from "./dev-timing";
import { failure, success, type ApiResult } from "./shared";
import { getTollgateReviewWorkspaceService } from "./tollgates";

function isJourneyContextsStorageUnavailableError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes("journeycontexts");
}

function isDownstreamAiInstructionsStorageUnavailableError(error: unknown) {
  return error instanceof Error && error.message.toLowerCase().includes("downstreamaiinstructions");
}

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

function normalizeAiUsageRole(value: string | null | undefined) {
  return value === "support" ||
    value === "generation" ||
    value === "validation" ||
    value === "decision_support" ||
    value === "automation"
    ? value
    : null;
}

function normalizeAiExecutionPattern(value: string | null | undefined) {
  return value === "assisted" || value === "step_by_step" || value === "orchestrated" ? value : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeStoryWorkspaceSnapshot(
  snapshot: NonNullable<Awaited<ReturnType<typeof getStoryWorkspaceSnapshot>>>
) {
  return {
    ...snapshot,
    story: {
      ...snapshot.story,
      acceptanceCriteria: normalizeStringArray(snapshot.story.acceptanceCriteria),
      aiUsageScope: normalizeStringArray(snapshot.story.aiUsageScope),
      definitionOfDone: normalizeStringArray(snapshot.story.definitionOfDone),
      uxSketches: Array.isArray(snapshot.story.uxSketches) ? snapshot.story.uxSketches : []
    },
    tollgate: snapshot.tollgate
      ? {
          ...snapshot.tollgate,
          blockers: normalizeStringArray(snapshot.tollgate.blockers)
        }
      : null
  };
}

function buildOutcomeRemovalFromSnapshot(snapshot: NonNullable<Awaited<ReturnType<typeof getOutcomeWorkspaceSnapshot>>>) {
  const activeChildren = [
    ...snapshot.outcome.epics.map((epic) => toGovernedChildImpact("epic", epic)),
    ...snapshot.outcome.directionSeeds.map((seed) => toGovernedChildImpact("direction_seed", seed)),
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
      activityEventCount: snapshot.activityEventCount,
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

export async function getOutcomeWorkspaceService(organizationId: string, outcomeId: string) {
  return withDevTiming("api.getOutcomeWorkspaceService", async () => {
    const snapshot = await getOutcomeWorkspaceSnapshot(organizationId, outcomeId);

    if (!snapshot) {
      return failure({
        code: "outcome_not_found",
        message: "Outcome was not found in the current organization."
      });
    }

    return success({
      ...snapshot,
      readiness: getOutcomeFramingReadiness({
        ...snapshot.outcome,
        aiUsageRole: normalizeAiUsageRole(snapshot.outcome.aiUsageRole),
        aiExecutionPattern: normalizeAiExecutionPattern(snapshot.outcome.aiExecutionPattern),
        epicCount: snapshot.outcome.epics.length
      }),
      removal: buildOutcomeRemovalFromSnapshot(snapshot)
    });
  }, `organizationId=${organizationId} outcomeId=${outcomeId}`);
}

export async function getOrganizationUsersService(organizationId: string) {
  return withDevTiming("api.getOrganizationUsersService", async () => {
    return success(await listOrganizationUsers(organizationId));
  }, `organizationId=${organizationId}`);
}

export async function getOrganizationValueOwnersService(organizationId: string) {
  return withDevTiming("api.getOrganizationValueOwnersService", async () => {
    const [users, partyRoles] = await Promise.all([
      listOrganizationUsers(organizationId),
      listPartyRoleEntries(organizationId)
    ]);

    const usersByEmail = new Map(
      users.map((user) => [user.email.trim().toLowerCase(), user] as const)
    );

    const matchedValueOwners = partyRoles
      .filter((person) => person.isActive && person.organizationSide === "customer" && person.roleType === "value_owner")
      .map((person) => usersByEmail.get(person.email.trim().toLowerCase()) ?? null)
      .filter((user): user is NonNullable<typeof user> => Boolean(user));

    if (matchedValueOwners.length === 0) {
      return success(users);
    }

    const deduped = [...new Map(matchedValueOwners.map((user) => [user.userId, user] as const)).values()].sort((left, right) => {
      const leftLabel = left.fullName ?? left.email;
      const rightLabel = right.fullName ?? right.email;
      return leftLabel.localeCompare(rightLabel, "en");
    });

    return success(deduped);
  }, `organizationId=${organizationId}`);
}

export async function getOutcomeTollgateReviewService(organizationId: string, outcomeId: string) {
  return withDevTiming("api.getOutcomeTollgateReviewService", async () => {
    const snapshot = await getOutcomeTollgateReviewSnapshot(organizationId, outcomeId);

    if (!snapshot) {
      return failure({
        code: "outcome_not_found",
        message: "Outcome was not found in the current organization."
      });
    }

    const blockers =
      snapshot.tollgate?.blockers ??
      getOutcomeFramingReadiness({
        ...snapshot.outcome,
        aiUsageRole: normalizeAiUsageRole(snapshot.outcome.aiUsageRole),
        aiExecutionPattern: normalizeAiExecutionPattern(snapshot.outcome.aiExecutionPattern),
        epicCount: snapshot.outcome.epicCount
      }).reasons.map((reason) => reason.message);

    const tollgateReview = await getTollgateReviewWorkspaceService({
      organizationId,
      entityType: "outcome",
      entityId: outcomeId,
      tollgateType: "tg1_baseline",
      aiAccelerationLevel: snapshot.outcome.aiAccelerationLevel,
      fallbackBlockers: blockers,
      fallbackComments: snapshot.tollgate?.comments ?? null,
      existingTollgate: snapshot.tollgate
    });

    if (!tollgateReview.ok) {
      return tollgateReview;
    }

    return success({
      outcome: {
        id: snapshot.outcome.id,
        aiAccelerationLevel: snapshot.outcome.aiAccelerationLevel,
        framingVersion: snapshot.outcome.framingVersion,
        riskProfile: snapshot.outcome.riskProfile,
        businessImpactLevel: snapshot.outcome.businessImpactLevel ?? null,
        businessImpactRationale: snapshot.outcome.businessImpactRationale ?? null,
        dataSensitivityLevel: snapshot.outcome.dataSensitivityLevel ?? null,
        dataSensitivityRationale: snapshot.outcome.dataSensitivityRationale ?? null,
        blastRadiusLevel: snapshot.outcome.blastRadiusLevel ?? null,
        blastRadiusRationale: snapshot.outcome.blastRadiusRationale ?? null,
        decisionImpactLevel: snapshot.outcome.decisionImpactLevel ?? null,
        decisionImpactRationale: snapshot.outcome.decisionImpactRationale ?? null
      },
      tollgate: snapshot.tollgate,
      blockers,
      framingComplete: blockers.length === 0,
      tollgateReview: tollgateReview.data
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
  solutionContext?: string | null;
  solutionConstraints?: string | null;
  dataSensitivity?: string | null;
  journeyContexts?: ReturnType<typeof parseJourneyContexts>;
  downstreamAiInstructions?: ReturnType<typeof parseDownstreamAiInstructions>;
  deliveryType?: "AD" | "AT" | "AM" | null;
  aiUsageRole?: "support" | "generation" | "validation" | "decision_support" | "automation" | null;
  aiExecutionPattern?: "assisted" | "step_by_step" | "orchestrated" | null;
  aiUsageIntent?: string | null;
  businessImpactLevel?: "low" | "medium" | "high" | null;
  businessImpactRationale?: string | null;
  dataSensitivityLevel?: "low" | "medium" | "high" | null;
  dataSensitivityRationale?: string | null;
  blastRadiusLevel?: "low" | "medium" | "high" | null;
  blastRadiusRationale?: string | null;
  decisionImpactLevel?: "low" | "medium" | "high" | null;
  decisionImpactRationale?: string | null;
  aiLevelJustification?: string | null;
  timeframe?: string | null;
  valueOwnerId?: string | null;
  riskProfile?: "low" | "medium" | "high";
  aiAccelerationLevel?: "level_1" | "level_2" | "level_3";
}) {
  const derivedRiskProfile = deriveOutcomeRiskProfile({
    businessImpactLevel: input.businessImpactLevel ?? null,
    dataSensitivityLevel: input.dataSensitivityLevel ?? null,
    blastRadiusLevel: input.blastRadiusLevel ?? null,
    decisionImpactLevel: input.decisionImpactLevel ?? null
  });

  const result = await updateOutcome({
    organizationId: input.organizationId,
    id: input.id,
    actorId: input.actorId ?? null,
    title: input.title,
    problemStatement: input.problemStatement,
    outcomeStatement: input.outcomeStatement,
    baselineDefinition: input.baselineDefinition,
    baselineSource: input.baselineSource,
    solutionContext: input.solutionContext,
    solutionConstraints: input.solutionConstraints,
    dataSensitivity: input.dataSensitivity,
    journeyContexts: input.journeyContexts,
    downstreamAiInstructions: input.downstreamAiInstructions,
    deliveryType: input.deliveryType,
    aiUsageRole: input.aiUsageRole,
    aiExecutionPattern: input.aiExecutionPattern,
    aiUsageIntent: input.aiUsageIntent,
    businessImpactLevel: input.businessImpactLevel,
    businessImpactRationale: input.businessImpactRationale,
    dataSensitivityLevel: input.dataSensitivityLevel,
    dataSensitivityRationale: input.dataSensitivityRationale,
    blastRadiusLevel: input.blastRadiusLevel,
    blastRadiusRationale: input.blastRadiusRationale,
    decisionImpactLevel: input.decisionImpactLevel,
    decisionImpactRationale: input.decisionImpactRationale,
    aiLevelJustification: input.aiLevelJustification,
    timeframe: input.timeframe,
    valueOwnerId: input.valueOwnerId,
    riskProfile: derivedRiskProfile ?? input.riskProfile,
    aiAccelerationLevel: input.aiAccelerationLevel
  });

  return success(result);
}

export async function saveOutcomeJourneyContextsService(input: {
  organizationId: string;
  outcomeId: string;
  actorId?: string | null;
  journeyContexts: ReturnType<typeof parseJourneyContexts>;
}) {
  try {
    const result = await updateOutcome({
      organizationId: input.organizationId,
      id: input.outcomeId,
      actorId: input.actorId ?? null,
      journeyContexts: input.journeyContexts
    });

    return success(result);
  } catch (error) {
    if (isJourneyContextsStorageUnavailableError(error)) {
      return failure({
        code: "journey_context_storage_unavailable",
        message: "Journey Context needs the latest database migration before it can be saved."
      });
    }

    throw error;
  }
}

export async function saveOutcomeDownstreamAiInstructionsService(input: {
  organizationId: string;
  outcomeId: string;
  actorId?: string | null;
  downstreamAiInstructions: ReturnType<typeof parseDownstreamAiInstructions>;
}) {
  try {
    const result = await updateOutcome({
      organizationId: input.organizationId,
      id: input.outcomeId,
      actorId: input.actorId ?? null,
      downstreamAiInstructions: input.downstreamAiInstructions
    });

    return success(result);
  } catch (error) {
    if (isDownstreamAiInstructionsStorageUnavailableError(error)) {
      return failure({
        code: "downstream_ai_instructions_storage_unavailable",
        message: "Downstream AI Instructions need the latest database migration before they can be saved."
      });
    }

    throw error;
  }
}

export async function analyzeOutcomeJourneyCoverageService(input: {
  organizationId: string;
  outcomeId: string;
  journeyContextId: string;
  actorId?: string | null;
  journeyContexts?: ReturnType<typeof parseJourneyContexts>;
}) {
  const snapshot = await getOutcomeWorkspaceSnapshot(input.organizationId, input.outcomeId);

  if (!snapshot) {
    return failure({
      code: "outcome_not_found",
      message: "Outcome was not found in the current organization."
    });
  }

  const currentJourneyContexts = input.journeyContexts ?? snapshot.outcome.journeyContexts;
  const matchingJourneyContext = currentJourneyContexts.find((context) => context.id === input.journeyContextId);

  if (!matchingJourneyContext) {
    return failure({
      code: "journey_context_not_found",
      message: "Journey Context was not found for the selected outcome."
    });
  }

  const analyzedJourneyContext = analyzeJourneyCoverage({
    journeyContext: matchingJourneyContext,
    epics: snapshot.outcome.epics.map((epic) => ({
      id: epic.id,
      key: epic.key,
      title: epic.title,
      purpose: epic.purpose ?? null,
      scopeBoundary: epic.scopeBoundary ?? null
    })),
    storyIdeas: snapshot.outcome.directionSeeds.map((seed) => ({
      id: seed.id,
      key: seed.key,
      title: seed.title,
      valueIntent: seed.shortDescription ?? null,
      expectedBehavior: seed.expectedBehavior ?? null,
      epicId: seed.epicId ?? null
    }))
  });
  const nextJourneyContexts = currentJourneyContexts.map((context) =>
    context.id === analyzedJourneyContext.id ? analyzedJourneyContext : context
  );
  try {
    const result = await updateOutcome({
      organizationId: input.organizationId,
      id: input.outcomeId,
      actorId: input.actorId ?? null,
      journeyContexts: nextJourneyContexts
    });

    return success({
      outcome: result,
      analyzedJourneyContext
    });
  } catch (error) {
    if (isJourneyContextsStorageUnavailableError(error)) {
      return failure({
        code: "journey_context_storage_unavailable",
        message: "Journey Context analysis cannot be saved until the latest database migration is applied."
      });
    }

    throw error;
  }
}

export async function validateOutcomeFieldWithAiService(input: {
  organizationId: string;
  outcomeId?: string | null;
  field: "outcome_statement" | "baseline_definition";
  deliveryType?: "AD" | "AT" | "AM" | null;
  title?: string | null;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
  baselineDefinition?: string | null;
  baselineSource?: string | null;
  solutionContext?: string | null;
  solutionConstraints?: string | null;
  dataSensitivity?: string | null;
  timeframe?: string | null;
  aiAccelerationLevel?: "level_1" | "level_2" | "level_3";
  riskProfile?: "low" | "medium" | "high";
}) {
  return withDevTiming("api.validateOutcomeFieldWithAiService", async () => {
    try {
      const snapshot = input.outcomeId
        ? await getOutcomeWorkspaceSnapshot(input.organizationId, input.outcomeId)
        : null;
      const snapshotDeliveryType =
        snapshot?.outcome.deliveryType === "AD" || snapshot?.outcome.deliveryType === "AT" || snapshot?.outcome.deliveryType === "AM"
          ? snapshot.outcome.deliveryType
          : null;
      const result = await validateOutcomeFieldWithAi({
        field: input.field,
        deliveryType: input.deliveryType ?? snapshotDeliveryType,
        title: input.title ?? snapshot?.outcome.title ?? null,
        problemStatement: input.problemStatement ?? snapshot?.outcome.problemStatement ?? null,
        outcomeStatement: input.outcomeStatement ?? snapshot?.outcome.outcomeStatement ?? null,
        baselineDefinition: input.baselineDefinition ?? snapshot?.outcome.baselineDefinition ?? null,
        baselineSource: input.baselineSource ?? snapshot?.outcome.baselineSource ?? null,
        solutionContext: input.solutionContext ?? snapshot?.outcome.solutionContext ?? null,
        solutionConstraints: input.solutionConstraints ?? snapshot?.outcome.solutionConstraints ?? null,
        dataSensitivity: input.dataSensitivity ?? snapshot?.outcome.dataSensitivity ?? null,
        timeframe: input.timeframe ?? snapshot?.outcome.timeframe ?? null,
        aiAccelerationLevel: input.aiAccelerationLevel ?? snapshot?.outcome.aiAccelerationLevel ?? "level_2",
        riskProfile: input.riskProfile ?? snapshot?.outcome.riskProfile ?? "medium",
        epics: snapshot?.outcome.epics.map((epic) => ({
          key: epic.key,
          title: epic.title,
          purpose: epic.purpose ?? null,
          scopeBoundary: epic.scopeBoundary ?? null
        })) ?? [],
        directionSeeds: snapshot?.outcome.directionSeeds.map((seed) => ({
          key: seed.key,
          title: seed.title,
          epicKey: snapshot?.outcome.epics.find((epic) => epic.id === seed.epicId)?.key ?? null,
          shortDescription: seed.shortDescription ?? null,
          expectedBehavior: seed.expectedBehavior ?? null
        })) ?? [],
        journeyContexts: snapshot?.outcome.journeyContexts ?? []
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
          solutionContext: snapshot.outcome.solutionContext ?? null,
          solutionConstraints: snapshot.outcome.solutionConstraints ?? null,
          dataSensitivity: snapshot.outcome.dataSensitivity ?? null,
          deliveryType: snapshot.outcome.deliveryType === "AD" || snapshot.outcome.deliveryType === "AT" || snapshot.outcome.deliveryType === "AM"
            ? snapshot.outcome.deliveryType
            : null,
          valueOwner: snapshot.outcome.valueOwner?.fullName ?? snapshot.outcome.valueOwner?.email ?? null,
          aiUsageRole: normalizeAiUsageRole(snapshot.outcome.aiUsageRole),
          aiExecutionPattern: normalizeAiExecutionPattern(snapshot.outcome.aiExecutionPattern),
          aiUsageIntent: snapshot.outcome.aiUsageIntent ?? null,
          businessImpactLevel: snapshot.outcome.businessImpactLevel ?? null,
          businessImpactRationale: snapshot.outcome.businessImpactRationale ?? null,
          dataSensitivityLevel: snapshot.outcome.dataSensitivityLevel ?? null,
          dataSensitivityRationale: snapshot.outcome.dataSensitivityRationale ?? null,
          blastRadiusLevel: snapshot.outcome.blastRadiusLevel ?? null,
          blastRadiusRationale: snapshot.outcome.blastRadiusRationale ?? null,
          decisionImpactLevel: snapshot.outcome.decisionImpactLevel ?? null,
          decisionImpactRationale: snapshot.outcome.decisionImpactRationale ?? null,
          aiLevelJustification: snapshot.outcome.aiLevelJustification ?? null,
          riskAcceptedAt: snapshot.outcome.riskAcceptedAt ?? null,
          riskAcceptedBy: snapshot.outcome.valueOwner?.fullName ?? snapshot.outcome.valueOwner?.email ?? null,
          timeframe: snapshot.outcome.timeframe ?? null,
          aiAccelerationLevel: snapshot.outcome.aiAccelerationLevel,
          riskProfile: snapshot.outcome.riskProfile
        },
        epics: snapshot.outcome.epics.map((epic) => ({
          key: epic.key,
          title: epic.title,
          purpose: epic.purpose ?? null,
          scopeBoundary: epic.scopeBoundary ?? null,
          seedCount: epic.directionSeeds.length
        })),
        directionSeeds: snapshot.outcome.directionSeeds.map((seed) => ({
          storyIdeaId: seed.id,
          seedId: seed.key,
          title: seed.title,
          epicKey: snapshot.outcome.epics.find((epic) => epic.id === seed.epicId)?.key ?? null,
          shortDescription: seed.shortDescription?.trim() || null,
          expectedBehavior: seed.expectedBehavior?.trim() || null
        })),
        journeyContexts: snapshot.outcome.journeyContexts,
        downstreamAiInstructions: snapshot.outcome.downstreamAiInstructions
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
  const snapshot = await getOutcomeTollgateReviewSnapshot(input.organizationId, input.outcomeId);

  if (!snapshot) {
    return failure({
      code: "outcome_not_found",
      message: "Outcome was not found in the current organization."
    });
  }

  const readiness = getOutcomeFramingReadiness({
    ...snapshot.outcome,
    aiUsageRole: normalizeAiUsageRole(snapshot.outcome.aiUsageRole),
    aiExecutionPattern: normalizeAiExecutionPattern(snapshot.outcome.aiExecutionPattern),
    epicCount: snapshot.outcome.epicCount
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
    approverRoles:
      snapshot.outcome.aiAccelerationLevel === "level_1"
        ? ["value_owner", "delivery_lead"]
        : snapshot.outcome.aiAccelerationLevel === "level_2"
          ? ["value_owner", "architect"]
          : ["value_owner", "aqa"],
    submissionVersion: snapshot.outcome.framingVersion,
    approvedVersion: snapshot.tollgate?.approvedVersion ?? null,
    approvalSnapshot: snapshot.tollgate?.approvalSnapshot ?? null,
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
    const rawSnapshot = await getStoryWorkspaceSnapshot(organizationId, storyId);

    if (!rawSnapshot) {
      return failure({
        code: "story_not_found",
        message: "Story was not found in the current organization."
      });
    }

    const snapshot = normalizeStoryWorkspaceSnapshot(rawSnapshot);
    let importedBuildBlockers: string[] = [];

    try {
      importedBuildBlockers = await getImportedStoryBuildBlockers({
        organizationId,
        originType: snapshot.story.originType,
        lineageSourceType: snapshot.story.lineageSourceType,
        lineageSourceId: snapshot.story.lineageSourceId
      });
    } catch {
      importedBuildBlockers = [];
    }

    let linkedSeed: Awaited<ReturnType<typeof getDirectionSeedById>> | null = null;
    let originStoryIdea:
      | {
          seedId: string;
          storyId: string | null;
          key: string;
          title: string;
          epicId: string;
          outcomeId: string;
          valueIntent: string | null;
          expectedBehavior: string | null;
        }
      | null = null;
    let derivedDeliveryStories: Awaited<ReturnType<typeof listStoriesByDirectionSeedId>> = [];

    try {
      linkedSeed = snapshot.story.sourceDirectionSeedId
        ? await getDirectionSeedById(organizationId, snapshot.story.sourceDirectionSeedId)
        : null;

      originStoryIdea = linkedSeed
        ? {
            seedId: linkedSeed.id,
            storyId: linkedSeed.sourceStoryId ?? null,
            key: linkedSeed.key,
            title: linkedSeed.title,
            epicId: linkedSeed.epicId,
            outcomeId: linkedSeed.outcomeId,
            valueIntent: linkedSeed.shortDescription?.trim() || null,
            expectedBehavior: linkedSeed.expectedBehavior?.trim() || null
          }
        : null;

      const relatedSeed = snapshot.story.sourceDirectionSeedId
        ? linkedSeed
        : await getDirectionSeedBySourceStoryId(organizationId, snapshot.story.id);

      derivedDeliveryStories = relatedSeed
        ? await listStoriesByDirectionSeedId(organizationId, relatedSeed.id)
        : [];
    } catch {
      linkedSeed = null;
      originStoryIdea = null;
      derivedDeliveryStories = [];
    }

    const valueSpineValidation = validateStoryAgainstValueSpine(snapshot.story);
    const baseReadinessBlockers = getStoryHandoffReadiness(snapshot.story).reasons.map((reason) => reason.message);
    let tollgateReview: Awaited<ReturnType<typeof getTollgateReviewWorkspaceService>> | null = null;

    try {
      tollgateReview = await getTollgateReviewWorkspaceService({
        organizationId,
        entityType: "story",
        entityId: storyId,
        tollgateType: "story_readiness",
        aiAccelerationLevel: snapshot.story.aiAccelerationLevel,
        fallbackBlockers: [...new Set([...(snapshot.tollgate?.blockers ?? baseReadinessBlockers), ...importedBuildBlockers])],
        fallbackComments: snapshot.tollgate?.comments ?? null,
        existingTollgate: snapshot.tollgate
      });
    } catch {
      tollgateReview = null;
    }

    let removal: ReturnType<typeof buildStoryRemovalFromSnapshot> | null = null;

    try {
      removal = buildStoryRemovalFromSnapshot(snapshot);
    } catch {
      removal = null;
    }

    return success({
      ...snapshot,
      originStoryIdea,
      derivedDeliveryStories,
      valueSpineValidation,
      readiness: getStoryHandoffReadiness(snapshot.story),
      importedBuildBlockers,
      tollgateReview: tollgateReview?.ok ? tollgateReview.data : null,
      removal
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
  expectedBehavior?: string | null;
  uxSketchName?: string | null;
  uxSketchContentType?: string | null;
  uxSketchDataUrl?: string | null;
  uxSketches?: Array<{
    id: string;
    name: string;
    contentType: string;
    dataUrl: string;
  }> | null;
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
    expectedBehavior: input.expectedBehavior,
    uxSketchName: input.uxSketchName,
    uxSketchContentType: input.uxSketchContentType,
    uxSketchDataUrl: input.uxSketchDataUrl,
    uxSketches: input.uxSketches,
    acceptanceCriteria: input.acceptanceCriteria,
    aiUsageScope: input.aiUsageScope,
    testDefinition: input.testDefinition,
    definitionOfDone: input.definitionOfDone
  });

  return success(result);
}

export async function validateStoryExpectedBehaviorWithAiService(input: {
  organizationId: string;
  title?: string | null;
  valueIntent?: string | null;
  expectedBehavior?: string | null;
  epicTitle?: string | null;
  epicPurpose?: string | null;
  epicScopeBoundary?: string | null;
}) {
  return withDevTiming("api.validateStoryExpectedBehaviorWithAiService", async () => {
    try {
      const result = await validateStoryExpectedBehaviorWithAi({
        title: input.title ?? null,
        valueIntent: input.valueIntent ?? null,
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
  }, `organizationId=${input.organizationId} field=story_expected_behavior`);
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
      outcome_title: snapshot.story.outcome.title,
      outcome_statement: snapshot.story.outcome.outcomeStatement ?? null,
      epic_id: snapshot.story.epicId,
      epic_title: snapshot.story.epic.title,
      story_id: snapshot.story.id,
      story_key: snapshot.story.key,
      story_title: snapshot.story.title,
      value_intent: snapshot.story.valueIntent,
      expected_behavior: snapshot.story.expectedBehavior ?? null,
      ai_level: snapshot.story.aiAccelerationLevel,
      ai_usage_scope: snapshot.story.aiUsageScope,
      framing_version: snapshot.story.outcome.framingVersion ?? null,
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
