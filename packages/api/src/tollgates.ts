import {
  createSignoffRecord,
  getOutcomeWorkspaceSnapshot,
  getStoryById,
  getTollgate,
  listPartyRoleEntries,
  listSignoffRecordsForEntity,
  listSignoffRecordsForTollgate,
  updateStory,
  upsertTollgate
} from "@aas-companion/db";
import {
  getTollgateDecisionProfile,
  getOutcomeFramingReadiness,
  recordTollgateDecisionInputSchema,
  summarizeTollgateFromSignoffs,
  tollgateUpsertInputSchema
} from "@aas-companion/domain";
import { withDevTiming } from "./dev-timing";
import { failure, success, type ApiResult } from "./shared";

export async function getTollgateService(
  organizationId: string,
  entityType: string,
  entityId: string,
  tollgateType: string
): Promise<ApiResult<Awaited<ReturnType<typeof getTollgate>>>> {
  return success(await getTollgate(organizationId, entityType, entityId, tollgateType));
}

export async function recordTollgateService(input: unknown) {
  const parsed = tollgateUpsertInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_tollgate",
      message: parsed.error.issues[0]?.message ?? "Tollgate input is invalid."
    });
  }

  return success(await upsertTollgate(parsed.data));
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
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

function mapFramingApproverRolesToMembershipRoles(
  requirements: Array<{
    roleType: string;
  }>
) {
  return requirements
    .map((requirement) => {
      if (requirement.roleType === "value_owner") {
        return "value_owner" as const;
      }

      if (requirement.roleType === "delivery_lead") {
        return "delivery_lead" as const;
      }

      if (requirement.roleType === "architect") {
        return "architect" as const;
      }

      if (requirement.roleType === "aqa") {
        return "aqa" as const;
      }

      return null;
    })
    .filter((value): value is "value_owner" | "delivery_lead" | "architect" | "aqa" => Boolean(value));
}

function getRelevantSignoffRecords<T extends { entityVersion?: number | null }>(
  signoffRecords: T[],
  input: { entityType: "outcome" | "story"; submissionVersion?: number | null | undefined }
) {
  if (input.entityType !== "outcome") {
    return signoffRecords;
  }

  if (!input.submissionVersion) {
    return [];
  }

  return signoffRecords.filter((record) => record.entityVersion === input.submissionVersion);
}

function buildOutcomeApprovalSnapshot(input: {
  snapshot: NonNullable<Awaited<ReturnType<typeof getOutcomeWorkspaceSnapshot>>>;
  signoffRecords: Array<{
    id: string;
    entityVersion?: number | null;
    decisionKind: string;
    requiredRoleType: string;
    actualPersonName: string;
    actualRoleTitle: string;
    organizationSide: string;
    decisionStatus: string;
    note?: string | null;
    evidenceReference?: string | null;
    createdAt: Date;
  }>;
  approvedAt: Date;
  approvedVersion: number;
}) {
  const valueOwner =
    input.snapshot.outcome.valueOwner?.fullName ??
    input.snapshot.outcome.valueOwner?.email ??
    (input.snapshot.outcome.valueOwnerId ? input.snapshot.outcome.valueOwnerId : null);
  const epicKeyById = new Map(input.snapshot.outcome.epics.map((epic) => [epic.id, epic.key] as const));
  const seedIdsByEpic = new Set(input.snapshot.outcome.directionSeeds.map((seed) => seed.sourceStoryId).filter(Boolean));
  const legacyStoryIdeas = input.snapshot.outcome.stories
    .filter((story) => !story.sourceDirectionSeedId)
    .filter((story) =>
      input.snapshot.outcome.directionSeeds.some((seed) => seed.epicId === story.epicId) ? false : !seedIdsByEpic.has(story.id)
    )
    .filter((story) => story.status === "draft" || story.status === "definition_blocked");

  return {
    kind: "framing_approval_document",
    version: 1,
    approvedVersion: input.approvedVersion,
    approvedAt: input.approvedAt.toISOString(),
    outcome: {
      outcomeId: input.snapshot.outcome.id,
      key: input.snapshot.outcome.key,
      title: input.snapshot.outcome.title,
      problemStatement: input.snapshot.outcome.problemStatement ?? null,
      outcomeStatement: input.snapshot.outcome.outcomeStatement ?? null,
      timeframe: input.snapshot.outcome.timeframe ?? null,
      valueOwner,
      baselineDefinition: input.snapshot.outcome.baselineDefinition ?? null,
      baselineSource: input.snapshot.outcome.baselineSource ?? null,
      solutionContext: input.snapshot.outcome.solutionContext ?? null,
      constraints: input.snapshot.outcome.solutionConstraints ?? null,
      dataSensitivity: input.snapshot.outcome.dataSensitivity ?? null,
      deliveryType:
        input.snapshot.outcome.deliveryType === "AD" ||
        input.snapshot.outcome.deliveryType === "AT" ||
        input.snapshot.outcome.deliveryType === "AM"
          ? input.snapshot.outcome.deliveryType
          : null,
      aiLevel: input.snapshot.outcome.aiAccelerationLevel,
      riskProfile: input.snapshot.outcome.riskProfile,
      riskRationale: {
        businessImpact: input.snapshot.outcome.businessImpactLevel
          ? `${input.snapshot.outcome.businessImpactLevel}: ${input.snapshot.outcome.businessImpactRationale ?? "Not captured"}`
          : null,
        dataSensitivity: input.snapshot.outcome.dataSensitivityLevel
          ? `${input.snapshot.outcome.dataSensitivityLevel}: ${input.snapshot.outcome.dataSensitivityRationale ?? "Not captured"}`
          : null,
        blastRadius: input.snapshot.outcome.blastRadiusLevel
          ? `${input.snapshot.outcome.blastRadiusLevel}: ${input.snapshot.outcome.blastRadiusRationale ?? "Not captured"}`
          : null,
        decisionImpact: input.snapshot.outcome.decisionImpactLevel
          ? `${input.snapshot.outcome.decisionImpactLevel}: ${input.snapshot.outcome.decisionImpactRationale ?? "Not captured"}`
          : null
      },
      riskAcceptance: {
        acceptedBy: valueOwner,
        acceptedAt: input.snapshot.outcome.riskAcceptedAt?.toISOString() ?? null
      }
    },
    epics: input.snapshot.outcome.epics.map((epic) => ({
      key: epic.key,
      title: epic.title,
      purpose: epic.purpose ?? null,
      scopeBoundary: epic.scopeBoundary ?? null
    })),
    storyIdeas: [
      ...input.snapshot.outcome.directionSeeds.map((seed) => ({
        key: seed.key,
        title: seed.title,
        linkedEpic: seed.epicId ? epicKeyById.get(seed.epicId) ?? null : null,
        valueIntent: seed.shortDescription?.trim() || null,
        expectedBehavior: seed.expectedBehavior?.trim() || null,
        sourceType: "direction_seed" as const
      })),
      ...legacyStoryIdeas.map((story) => ({
        key: story.key,
        title: story.title,
        linkedEpic: epicKeyById.get(story.epicId) ?? null,
        valueIntent: story.valueIntent?.trim() || null,
        expectedBehavior: story.expectedBehavior?.trim() || null,
        sourceType: "legacy_story_idea" as const
      }))
    ],
    signoffs: input.signoffRecords.map((record) => ({
      id: record.id,
      decisionKind: record.decisionKind,
      requiredRoleType: record.requiredRoleType,
      actualPersonName: record.actualPersonName,
      actualRoleTitle: record.actualRoleTitle,
      organizationSide: record.organizationSide,
      decisionStatus: record.decisionStatus,
      note: record.note ?? null,
      evidenceReference: record.evidenceReference ?? null,
      createdAt: record.createdAt.toISOString()
    }))
  };
}

export async function getTollgateReviewWorkspaceService(input: {
  organizationId: string;
  entityType: "outcome" | "story";
  entityId: string;
  tollgateType: "tg1_baseline" | "story_readiness";
  aiAccelerationLevel: "level_1" | "level_2" | "level_3";
  fallbackBlockers?: string[];
  fallbackComments?: string | null;
  existingTollgate?: Awaited<ReturnType<typeof getTollgate>>;
}) {
  return withDevTiming("api.getTollgateReviewWorkspaceService", async () => {
    const tollgate =
      input.existingTollgate ??
      (await getTollgate(input.organizationId, input.entityType, input.entityId, input.tollgateType));
    const [people, signoffRecords] = await Promise.all([
      listPartyRoleEntries(input.organizationId),
      tollgate?.id
        ? listSignoffRecordsForTollgate(input.organizationId, tollgate.id)
        : listSignoffRecordsForEntity(input.organizationId, input.entityType, input.entityId)
    ]);
    const relevantSignoffRecords = getRelevantSignoffRecords(signoffRecords, {
      entityType: input.entityType,
      submissionVersion: tollgate?.submissionVersion
    });
    const profile = getTollgateDecisionProfile({
      tollgateType: input.tollgateType,
      aiAccelerationLevel: input.aiAccelerationLevel
    });
    const buildActions = (
      requirements: typeof profile.reviewRequirements | typeof profile.approvalRequirements
    ) =>
      requirements.map((requirement) => {
        const assignedPeople = people
          .filter(
            (person) =>
              person.isActive &&
              person.roleType === requirement.roleType &&
              person.organizationSide === requirement.organizationSide
          )
          .map((person) => ({
            partyRoleEntryId: person.id,
            fullName: person.fullName,
            email: person.email,
            roleTitle: person.roleTitle
          }));
        const relatedRecords = relevantSignoffRecords.filter(
          (record) =>
            record.decisionKind === requirement.decisionKind &&
            record.requiredRoleType === requirement.roleType &&
            record.organizationSide === requirement.organizationSide
        );
        const completedRecords = relatedRecords.filter((record) => record.decisionStatus === "approved");
        const blockedReasons = [
          ...(assignedPeople.length === 0
            ? [`No active ${formatLabel(requirement.roleType)} is currently assigned on the ${requirement.organizationSide} side.`]
            : []),
          ...relatedRecords
            .filter((record) => record.decisionStatus !== "approved")
            .map(
              (record) =>
                `${record.actualPersonName} recorded ${formatLabel(record.decisionStatus)} for ${requirement.label.toLowerCase()}.`
            )
        ];

        return {
          ...requirement,
          assignedPeople,
          completedRecords,
          pending: completedRecords.length === 0,
          blockedReasons
        };
      });

    const reviewActions = buildActions(profile.reviewRequirements);
    const approvalActions = buildActions(profile.approvalRequirements);
    const tollgateSummary = summarizeTollgateFromSignoffs({
      blockers: tollgate?.blockers ?? input.fallbackBlockers ?? [],
      profile,
      ignoreBlockers: input.entityType === "outcome" && input.tollgateType === "tg1_baseline",
      signoffs: relevantSignoffRecords.map((record) => ({
        ...record,
        tollgateType: record.tollgateType ?? undefined,
        tollgateId: record.tollgateId ?? undefined,
        note: record.note ?? undefined,
        evidenceReference: record.evidenceReference ?? undefined,
        createdBy: record.createdBy ?? undefined
      }))
    });

    return success({
      tollgate,
      availablePeople: people
        .filter((person) => person.isActive)
        .map((person) => ({
          id: person.id,
          fullName: person.fullName,
          email: person.email,
          roleType: person.roleType,
          organizationSide: person.organizationSide,
          roleTitle: person.roleTitle
        })),
      signoffRecords,
      reviewActions,
      approvalActions,
      pendingActions: [...reviewActions, ...approvalActions].filter((action) => action.pending),
      blockedActions: [...reviewActions, ...approvalActions].filter((action) => action.blockedReasons.length > 0),
      blockers: [
        ...(tollgate?.blockers ?? input.fallbackBlockers ?? []),
        ...(tollgateSummary.status === "blocked" ? ["Required sign-off is still missing or explicitly blocked."] : [])
      ],
      comments: tollgate?.comments ?? input.fallbackComments ?? null,
      status: tollgateSummary.status,
      activeSubmissionVersion: tollgate?.submissionVersion ?? null,
      approvedVersion: tollgate?.approvedVersion ?? null,
      approvalSnapshot: tollgate?.approvalSnapshot ?? null,
      requiredReviewRoles: profile.reviewRequirements,
      requiredApprovalRoles: profile.approvalRequirements
    });
  }, `${input.entityType}:${input.entityId}:${input.tollgateType}`);
}

export async function recordTollgateDecisionService(input: unknown) {
  const parsed = recordTollgateDecisionInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_signoff",
      message: parsed.error.issues[0]?.message ?? "Tollgate decision input is invalid."
    });
  }

  const tollgateType = parsed.data.tollgateType;

  if (!tollgateType) {
    return failure({
      code: "invalid_signoff",
      message: "A tollgate type is required when recording a sign-off decision."
    });
  }

  const profile = getTollgateDecisionProfile({
    tollgateType,
    aiAccelerationLevel: parsed.data.aiAccelerationLevel
  });
  let tollgate = await getTollgate(parsed.data.organizationId, parsed.data.entityType, parsed.data.entityId, tollgateType);

  if (parsed.data.entityType === "outcome" && tollgateType === "tg1_baseline") {
    const snapshot = await getOutcomeWorkspaceSnapshot(parsed.data.organizationId, parsed.data.entityId);

    if (!snapshot) {
      return failure({
        code: "outcome_not_found",
        message: "Outcome was not found in the current organization."
      });
    }

    const blockers = getOutcomeFramingReadiness({
      ...snapshot.outcome,
      aiUsageRole: normalizeAiUsageRole(snapshot.outcome.aiUsageRole),
      aiExecutionPattern: normalizeAiExecutionPattern(snapshot.outcome.aiExecutionPattern),
      epicCount: snapshot.outcome.epics.length
    }).reasons.map((reason) => reason.message);
    const currentSubmissionVersion = snapshot.outcome.framingVersion;
    const currentApproverRoles = mapFramingApproverRolesToMembershipRoles(profile.approvalRequirements);

    if (!tollgate || tollgate.submissionVersion !== currentSubmissionVersion) {
      tollgate = await upsertTollgate({
        organizationId: parsed.data.organizationId,
        entityType: "outcome",
        entityId: parsed.data.entityId,
        tollgateType,
        status: tollgate?.status === "approved" && tollgate.approvedVersion === currentSubmissionVersion ? "approved" : "ready",
        blockers,
        approverRoles: currentApproverRoles,
        submissionVersion: currentSubmissionVersion,
        approvedVersion: tollgate?.approvedVersion ?? null,
        approvalSnapshot: tollgate?.approvalSnapshot ?? null,
        comments: tollgate?.comments ?? null,
        actorId: parsed.data.actorId ?? null,
        decidedBy: tollgate?.decidedBy ?? null,
        decidedAt: tollgate?.decidedAt ?? null
      });
    } else if (JSON.stringify(tollgate.blockers) !== JSON.stringify(blockers)) {
      tollgate = await upsertTollgate({
        organizationId: parsed.data.organizationId,
        entityType: "outcome",
        entityId: parsed.data.entityId,
        tollgateType,
        status: tollgate.status,
        blockers,
        approverRoles: tollgate.approverRoles,
        submissionVersion: tollgate.submissionVersion ?? currentSubmissionVersion,
        approvedVersion: tollgate.approvedVersion ?? null,
        approvalSnapshot: tollgate.approvalSnapshot ?? null,
        comments: tollgate.comments ?? null,
        actorId: parsed.data.actorId ?? null,
        decidedBy: tollgate.decidedBy ?? null,
        decidedAt: tollgate.decidedAt ?? null
      });
    }
  }

  if (!tollgate) {
    return failure({
      code: "tollgate_not_initialized",
      message: "Submit the tollgate first before recording review or approval decisions."
    });
  }
  const validRequirement = [...profile.reviewRequirements, ...profile.approvalRequirements].find(
    (requirement) =>
      requirement.decisionKind === parsed.data.decisionKind &&
      requirement.roleType === parsed.data.requiredRoleType &&
      requirement.organizationSide === parsed.data.organizationSide
  );

  if (parsed.data.decisionKind !== "escalation" && !validRequirement) {
    return failure({
      code: "invalid_signoff_role",
      message: "That decision does not match a required role for the active tollgate."
    });
  }

  const projectPeople = await listPartyRoleEntries(parsed.data.organizationId);
  const selectedPerson = projectPeople.find((person) => person.id === parsed.data.actualPartyRoleEntryId && person.isActive);

  if (!selectedPerson) {
    return failure({
      code: "signoff_person_missing",
      message: "Choose an active human project role to record the sign-off."
    });
  }

  if (
    parsed.data.decisionKind !== "escalation" &&
    (selectedPerson.roleType !== parsed.data.requiredRoleType ||
      selectedPerson.organizationSide !== parsed.data.organizationSide)
  ) {
    return failure({
      code: "signoff_person_mismatch",
      message: "The selected human does not match the required role and organization side for this action."
    });
  }

  let record;
  const entityVersion = parsed.data.entityType === "outcome" ? tollgate.submissionVersion ?? null : null;

  try {
    record = await createSignoffRecord({
      ...parsed.data,
      entityVersion,
      tollgateType,
      requiredRoleType: parsed.data.decisionKind === "escalation" ? selectedPerson.roleType : parsed.data.requiredRoleType,
      organizationSide: parsed.data.decisionKind === "escalation" ? selectedPerson.organizationSide : parsed.data.organizationSide,
      tollgateId: tollgate.id,
      createdBy: parsed.data.actorId ?? null
    });
  } catch (error) {
    return failure({
      code: "duplicate_signoff",
      message: error instanceof Error ? error.message : "A sign-off for this tollgate lane has already been recorded."
    });
  }

  const signoffRecords = await listSignoffRecordsForTollgate(parsed.data.organizationId, tollgate.id);
  const relevantSignoffRecords = getRelevantSignoffRecords(signoffRecords, {
    entityType: parsed.data.entityType,
    submissionVersion: entityVersion
  });
  const summary = summarizeTollgateFromSignoffs({
    blockers: tollgate.blockers,
    profile,
    ignoreBlockers: parsed.data.entityType === "outcome" && tollgateType === "tg1_baseline",
    signoffs: relevantSignoffRecords.map((item) => ({
      ...item,
      tollgateType: item.tollgateType ?? undefined,
      tollgateId: item.tollgateId ?? undefined,
      note: item.note ?? undefined,
      evidenceReference: item.evidenceReference ?? undefined,
      createdBy: item.createdBy ?? undefined
    }))
  });
  let approvalSnapshot = tollgate.approvalSnapshot ?? null;
  const approvedAt = summary.status === "approved" ? new Date() : tollgate.decidedAt;

  if (summary.status === "approved" && parsed.data.entityType === "outcome") {
    const outcomeSnapshot = await getOutcomeWorkspaceSnapshot(parsed.data.organizationId, parsed.data.entityId);

    if (outcomeSnapshot) {
      approvalSnapshot = buildOutcomeApprovalSnapshot({
        snapshot: outcomeSnapshot,
        signoffRecords: relevantSignoffRecords,
        approvedAt: approvedAt ?? new Date(),
        approvedVersion: entityVersion ?? outcomeSnapshot.outcome.framingVersion
      });
    }
  }

  const updatedTollgate = await upsertTollgate({
    organizationId: parsed.data.organizationId,
    entityType: parsed.data.entityType,
    entityId: parsed.data.entityId,
    tollgateType,
    status: summary.status,
    blockers:
      summary.status === "blocked"
        ? [
            ...tollgate.blockers,
            ...summary.pendingRequirements.map(
              (requirement) => `${formatLabel(requirement.decisionKind)} still required from ${formatLabel(requirement.roleType)}.`
            )
          ]
        : tollgate.blockers,
    approverRoles: tollgate.approverRoles,
    submissionVersion: tollgate.submissionVersion ?? null,
    approvedVersion:
      summary.status === "approved" && parsed.data.entityType === "outcome" ? entityVersion ?? tollgate.approvedVersion ?? null : tollgate.approvedVersion,
    approvalSnapshot,
    comments: parsed.data.note ?? tollgate.comments ?? null,
    actorId: parsed.data.actorId ?? null,
    decidedBy: summary.status === "approved" ? parsed.data.actorId ?? null : tollgate.decidedBy,
    decidedAt: approvedAt ?? null
  });

  if (parsed.data.entityType === "story") {
    const story = await getStoryById(parsed.data.organizationId, parsed.data.entityId);

    if (story && story.status !== "in_progress") {
      const nextStatus =
        summary.status === "blocked"
          ? "definition_blocked"
          : summary.status === "ready" || summary.status === "approved"
            ? "ready_for_handoff"
            : story.status;

      if (nextStatus !== story.status) {
        await updateStory({
          organizationId: parsed.data.organizationId,
          id: story.id,
          actorId: parsed.data.actorId ?? null,
          status: nextStatus
        });
      }
    }
  }

  return success({
    record,
    tollgate: updatedTollgate,
    status: summary.status
  });
}
