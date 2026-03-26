import {
  createSignoffRecord,
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
  recordTollgateDecisionInputSchema,
  summarizeTollgateFromSignoffs,
  tollgateUpsertInputSchema
} from "@aas-companion/domain";
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
  const tollgate =
    input.existingTollgate ??
    (await getTollgate(input.organizationId, input.entityType, input.entityId, input.tollgateType));
  const [people, signoffRecords] = await Promise.all([
    listPartyRoleEntries(input.organizationId),
    tollgate?.id
      ? listSignoffRecordsForTollgate(input.organizationId, tollgate.id)
      : listSignoffRecordsForEntity(input.organizationId, input.entityType, input.entityId)
  ]);
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
      const relatedRecords = signoffRecords.filter(
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
    signoffs: signoffRecords.map((record) => ({
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
    blockers: [...(tollgate?.blockers ?? input.fallbackBlockers ?? []), ...(tollgateSummary.status === "blocked" ? ["Required sign-off is still missing or explicitly blocked."] : [])],
    comments: tollgate?.comments ?? input.fallbackComments ?? null,
    status: tollgateSummary.status,
    requiredReviewRoles: profile.reviewRequirements,
    requiredApprovalRoles: profile.approvalRequirements
  });
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

  const tollgate = await getTollgate(
    parsed.data.organizationId,
    parsed.data.entityType,
    parsed.data.entityId,
    tollgateType
  );

  if (!tollgate) {
    return failure({
      code: "tollgate_not_initialized",
      message: "Submit the tollgate first before recording review or approval decisions."
    });
  }

  const profile = getTollgateDecisionProfile({
    tollgateType,
    aiAccelerationLevel: parsed.data.aiAccelerationLevel
  });
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

  try {
    record = await createSignoffRecord({
      ...parsed.data,
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
  const summary = summarizeTollgateFromSignoffs({
    blockers: tollgate.blockers,
    profile,
    signoffs: signoffRecords.map((item) => ({
      ...item,
      tollgateType: item.tollgateType ?? undefined,
      tollgateId: item.tollgateId ?? undefined,
      note: item.note ?? undefined,
      evidenceReference: item.evidenceReference ?? undefined,
      createdBy: item.createdBy ?? undefined
    }))
  });
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
    comments: parsed.data.note ?? tollgate.comments ?? null,
    actorId: parsed.data.actorId ?? null,
    decidedBy: summary.status === "approved" ? parsed.data.actorId ?? null : tollgate.decidedBy,
    decidedAt: summary.status === "approved" ? new Date() : tollgate.decidedAt
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
