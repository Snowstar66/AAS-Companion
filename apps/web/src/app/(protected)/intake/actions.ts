"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { appendActivityEvent } from "@aas-companion/db";
import {
  applyApprovedArtifactFileCarryForwardToOutcomeService,
  createArtifactIntakeSessionService,
  createNativeEpicFromOutcomeService,
  getArtifactCandidatesService,
  promoteArtifactCandidateService,
  promoteArtifactCandidatesBulkService,
  reviewArtifactCandidatesBulkService,
  reviewArtifactFileSectionDispositionsBulkService,
  reviewArtifactFileSectionDispositionService,
  reviewArtifactCandidateService,
  updateArtifactFileCarryForwardItemsService
} from "@aas-companion/api";
import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildRedirect(pathname: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function readLines(formData: FormData, name: string) {
  return String(formData.get(name) ?? "")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readCsv(formData: FormData, name: string) {
  return String(formData.get(name) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readNullableField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim() || null;
}

function getPromotionLabel(candidateType: string, promotedEntityType: string, importIntent: "framing" | "design") {
  if (candidateType === "story" || promotedEntityType === "story") {
    return importIntent === "design" ? "Delivery Story" : "Story Idea";
  }

  return promotedEntityType.replaceAll("_", " ");
}

function sortCandidateIdsForPromotion(
  candidates: Array<{
    id: string;
    type: "outcome" | "epic" | "story";
  }>
) {
  const weights: Record<"outcome" | "epic" | "story", number> = {
    outcome: 0,
    epic: 1,
    story: 2
  };

  return [...candidates].sort((left, right) => weights[left.type] - weights[right.type]);
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function readDynamicField(formData: FormData, scope: "candidate" | "section", id: string, field: string) {
  return String(formData.get(`${scope}:${id}:${field}`) ?? "").trim();
}

function hasDynamicField(formData: FormData, scope: "candidate" | "section", id: string, field: string) {
  return formData.has(`${scope}:${id}:${field}`);
}

function readNullableDynamicField(formData: FormData, scope: "candidate" | "section", id: string, field: string) {
  return readDynamicField(formData, scope, id, field) || null;
}

function readDynamicLines(formData: FormData, scope: "candidate" | "section", id: string, field: string) {
  return readDynamicField(formData, scope, id, field)
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeComparableValue(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (value === undefined) {
    return null;
  }

  return value ?? null;
}

function sameStringList(left: unknown, right: unknown) {
  const leftList = Array.isArray(left)
    ? left.map((value) => String(value).trim()).filter(Boolean)
    : [];
  const rightList = Array.isArray(right)
    ? right.map((value) => String(value).trim()).filter(Boolean)
    : [];

  if (leftList.length !== rightList.length) {
    return false;
  }

  return leftList.every((value, index) => value === rightList[index]);
}

function draftRecordNeedsUpdate(
  currentDraftRecord: Record<string, unknown> | null | undefined,
  nextDraftRecord: Record<string, unknown>
) {
  for (const [field, nextValue] of Object.entries(nextDraftRecord)) {
    const currentValue = currentDraftRecord?.[field];

    if (Array.isArray(nextValue) || Array.isArray(currentValue)) {
      if (!sameStringList(currentValue, nextValue)) {
        return true;
      }

      continue;
    }

    if (normalizeComparableValue(currentValue) !== normalizeComparableValue(nextValue)) {
      return true;
    }
  }

  return false;
}

const FALLBACK_EPIC_OPTION_VALUE = "__fallback_epic__";

function redirectDemoIntakeBlocked() {
  redirect(
    buildRedirect("/intake", {
      status: "blocked",
      message: "Import is read-only in Demo. Leave Demo and open a normal project before uploading, reviewing, or promoting artifacts."
    })
  );
}

async function recordOperationalLog(input: {
  organizationId: string;
  entityType: "organization" | "artifact_intake_session" | "artifact_intake_file";
  entityId: string;
  actorId?: string | null;
  scope: "import" | "approval";
  action: string;
  status: "started" | "success" | "error";
  summary: string;
  detail?: string | null;
  durationMs?: number | null;
  itemCount?: number | null;
}) {
  try {
    await appendActivityEvent({
      organizationId: input.organizationId,
      entityType: input.entityType,
      entityId: input.entityId,
      eventType: "operational_log_recorded",
      actorId: input.actorId ?? null,
      metadata: {
        scope: input.scope,
        action: input.action,
        status: input.status,
        summary: input.summary,
        detail: input.detail ?? null,
        durationMs: input.durationMs ?? null,
        itemCount: input.itemCount ?? null
      }
    });
  } catch {
    // Logging must never block the primary workflow.
  }
}

export async function uploadArtifactIntakeFilesAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const startedAt = Date.now();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirectDemoIntakeBlocked();
  }

  const requestedProcessingMode = String(formData.get("processingMode") ?? "ai_assisted");
  const processingMode = requestedProcessingMode === "deterministic" ? "deterministic" : "ai_assisted";
  const requestedImportIntent = String(formData.get("importIntent") ?? "framing");
  const importIntent = requestedImportIntent === "design" ? "design" : "framing";
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    redirect(
      buildRedirect("/intake", {
        error: "Select one or more text or markdown files before creating an import session."
      })
    );
  }

  const preparedFiles = await Promise.all(
    files.map(async (file) => ({
      fileName: file.name,
      mimeType: file.type || null,
      sizeBytes: file.size,
      content: await file.text()
    }))
  );

  const result = await createArtifactIntakeSessionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    importIntent,
    processingMode,
    files: preparedFiles
  });

  if (!result.ok) {
    await recordOperationalLog({
      organizationId: session.organization.organizationId,
      entityType: "organization",
      entityId: session.organization.organizationId,
      actorId: session.userId,
      scope: "import",
      action: "artifact_intake_upload",
      status: "error",
      summary: result.errors[0]?.message ?? "Import upload failed.",
      durationMs: Date.now() - startedAt,
      itemCount: preparedFiles.length
    });

    redirect(
      buildRedirect("/intake", {
        error: result.errors[0]?.message ?? "Import upload failed."
      })
    );
  }

  revalidatePath("/intake");
  revalidatePath("/");

  const baseMessage =
    requestedProcessingMode === "ai_assisted" && result.data.processingModeUsed === "ai_assisted"
      ? `Uploaded ${result.data.uploadedCount} file(s) into a new AI-assisted ${importIntent} import session. Likely Value Spine candidates were extracted, carry-forward design input was separated when possible, and anything that still could not be placed confidently remains visible under Review leftovers.`
      : requestedProcessingMode === "ai_assisted"
        ? `Uploaded ${result.data.uploadedCount} file(s) into a new ${importIntent} import session. The built-in parser completed the import successfully, carry-forward design input was separated when possible, and anything that could not be placed confidently remains visible under Review leftovers.`
        : result.data.rejectedCount > 0
          ? `Uploaded ${result.data.uploadedCount} file(s) into a new ${importIntent} import. ${result.data.rejectedCount} file(s) were rejected with clear feedback while the accepted files were classified and mapped for review.`
        : `Uploaded ${result.data.uploadedCount} file(s) into a new ${importIntent} import session and mapped them into reviewable candidates.`;
  const message = result.data.processingNote ? `${baseMessage} ${result.data.processingNote}` : baseMessage;

  await recordOperationalLog({
    organizationId: session.organization.organizationId,
    entityType: "artifact_intake_session",
    entityId: result.data.sessionId,
    actorId: session.userId,
    scope: "import",
    action: "artifact_intake_upload",
    status: "success",
    summary: `Imported ${result.data.uploadedCount} file(s) for ${importIntent}.`,
    detail: result.data.processingModeUsed,
    durationMs: Date.now() - startedAt,
    itemCount: result.data.uploadedCount
  });

  redirect(
    buildRedirect("/intake", {
      status: "uploaded",
      message,
      sessionId: result.data.sessionId
    })
  );
}

export async function submitArtifactCandidateFromIntakeAction(formData: FormData) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirectDemoIntakeBlocked();
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  const candidateId = String(formData.get("candidateId") ?? "");
  const candidateType = String(formData.get("candidateType") ?? "story");
  const importIntent = String(formData.get("importIntent") ?? "framing") === "design" ? "design" : "framing";
  const intent = String(formData.get("intent") ?? "edit");
  const reviewComment = String(formData.get("reviewComment") ?? "") || null;
  const issueId = String(formData.get("issueId") ?? "") || null;
  const issueAction = String(formData.get("issueAction") ?? "") || null;

  if (intent === "reject" && !reviewComment) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        candidateId,
        message: "Add a short discard reason before rejecting the imported candidate."
      })
    );
  }

  const reviewResult = await reviewArtifactCandidateService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    candidateId,
    reviewStatus:
      intent === "confirm"
        ? "confirmed"
        : intent === "reject"
          ? "rejected"
          : intent === "follow_up"
            ? "follow_up_needed"
            : "edited",
    reviewComment,
    draftRecord: {
      ...(formData.has("key") ? { key: readNullableField(formData, "key") } : {}),
      ...(formData.has("title") ? { title: readNullableField(formData, "title") } : {}),
      ...(formData.has("problemStatement") ? { problemStatement: readNullableField(formData, "problemStatement") } : {}),
      ...(formData.has("outcomeStatement") ? { outcomeStatement: readNullableField(formData, "outcomeStatement") } : {}),
      ...(formData.has("baselineDefinition") ? { baselineDefinition: readNullableField(formData, "baselineDefinition") } : {}),
      ...(formData.has("baselineSource") ? { baselineSource: readNullableField(formData, "baselineSource") } : {}),
      ...(formData.has("timeframe") ? { timeframe: readNullableField(formData, "timeframe") } : {}),
      ...(formData.has("purpose") ? { purpose: readNullableField(formData, "purpose") } : {}),
      ...(candidateType === "story" && formData.has("storyType")
        ? {
            storyType: readNullableField(formData, "storyType") as "outcome_delivery" | "governance" | "enablement" | null
          }
        : {}),
      ...(formData.has("valueIntent") ? { valueIntent: readNullableField(formData, "valueIntent") } : {}),
      ...(formData.has("expectedBehavior") ? { expectedBehavior: readNullableField(formData, "expectedBehavior") } : {}),
      ...(formData.has("acceptanceCriteria") ? { acceptanceCriteria: readLines(formData, "acceptanceCriteria") } : {}),
      ...(formData.has("aiUsageScope") ? { aiUsageScope: readCsv(formData, "aiUsageScope") } : {}),
      ...(formData.has("testDefinition") ? { testDefinition: readNullableField(formData, "testDefinition") } : {}),
      ...(formData.has("definitionOfDone") ? { definitionOfDone: readLines(formData, "definitionOfDone") } : {}),
      ...(formData.has("outcomeCandidateId") ? { outcomeCandidateId: readNullableField(formData, "outcomeCandidateId") } : {}),
      ...(formData.has("epicCandidateId") ? { epicCandidateId: readNullableField(formData, "epicCandidateId") } : {})
    },
    humanDecisions: {
      valueOwnerId: String(formData.get("valueOwnerId") ?? "") || null,
      baselineValidity:
        ((String(formData.get("baselineValidity") ?? "") || null) as "confirmed" | "needs_follow_up" | null),
      aiAccelerationLevel:
        ((String(formData.get("aiAccelerationLevel") ?? "") || null) as "level_1" | "level_2" | "level_3" | null),
      riskProfile: ((String(formData.get("riskProfile") ?? "") || null) as "low" | "medium" | "high" | null),
      riskAcceptanceStatus:
        ((String(formData.get("riskAcceptanceStatus") ?? "") || null) as "accepted" | "needs_review" | null)
    },
    issueDisposition:
      issueId && issueAction
        ? {
            issueId,
            action: issueAction as "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked",
            note: reviewComment
          }
        : undefined
  });

  if (!reviewResult.ok) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        candidateId,
        message: reviewResult.errors[0]?.message ?? "Review action could not be saved."
      })
    );
  }

  if (intent === "promote") {
    const promoteResult = await promoteArtifactCandidateService({
      organizationId: session.organization.organizationId,
      candidateId,
      actorId: session.userId
    });

    revalidatePath("/intake");
    revalidatePath("/review");
    revalidatePath("/framing");
    revalidatePath("/stories");
    revalidatePath("/workspace");
    revalidatePath("/");

    if (!promoteResult.ok) {
      redirect(
        buildRedirect("/intake", {
          status: "blocked",
          sessionId,
          fileId,
          candidateId,
          message: promoteResult.errors[0]?.message ?? "Promotion is blocked."
        })
      );
    }

    redirect(
      buildRedirect("/intake", {
        status: "promoted",
        sessionId,
        fileId,
        candidateId,
        message: `${reviewResult.data.title ?? "Candidate"} was promoted into governed ${getPromotionLabel(candidateType, promoteResult.data.promotedEntityType, importIntent)} work.`
      })
    );
  }

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/workspace");
  revalidatePath("/");

  redirect(
    buildRedirect("/intake", {
      status: intent,
      sessionId,
      fileId,
      candidateId,
      message:
        intent === "confirm"
          ? "Candidate confirmed."
          : intent === "reject"
            ? "Candidate rejected."
            : issueId && issueAction
              ? "Issue disposition saved."
            : intent === "follow_up"
              ? "Candidate marked for follow-up."
              : "Candidate edits saved."
    })
  );
}

export async function submitFramingBulkApproveFromIntakeAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const startedAt = Date.now();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirectDemoIntakeBlocked();
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  const decision = String(formData.get("decision") ?? "approve") === "reject" ? "reject" : "approve";
  const targetOutcomeId = String(formData.get("targetOutcomeId") ?? "") || null;
  const targetEpicCandidateId = String(formData.get("targetEpicCandidateId") ?? "") || null;
  const selectedCandidateIds = formData
    .getAll("candidateIds")
    .map((value) => String(value))
    .filter(Boolean);
  const selectedCarryForwardSectionIds = formData
    .getAll("carryForwardSectionIds")
    .map((value) => String(value))
    .filter(Boolean);
  const suppressedCandidateIds = formData
    .getAll("suppressedCandidateIds")
    .map((value) => String(value))
    .filter(Boolean);
  const leftoverSectionIds = formData
    .getAll("leftoverSectionIds")
    .map((value) => String(value))
    .filter(Boolean);
  const totalSelectedItemCount = selectedCandidateIds.length + selectedCarryForwardSectionIds.length;

  async function logApproval(status: "started" | "success" | "error", summary: string, detail?: string | null) {
    await recordOperationalLog({
      organizationId: session.organization.organizationId,
      entityType: fileId ? "artifact_intake_file" : "organization",
      entityId: fileId || session.organization.organizationId,
      actorId: session.userId,
      scope: "approval",
      action: decision === "reject" ? "framing_bulk_reject" : "framing_bulk_approve",
      status,
      summary,
      detail: detail ?? null,
      durationMs: Date.now() - startedAt,
      itemCount: totalSelectedItemCount
    });
  }

  async function redirectWithApprovalError(message: string, detail?: string | null): Promise<never> {
    await logApproval("error", message, detail);
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        message
      })
    );
  }

  await logApproval(
    "started",
    `${decision === "reject" ? "Rejecting" : "Approving"} ${totalSelectedItemCount} framing item(s).`,
    sessionId ? `Session ${sessionId}` : null
  );

  try {
  if (selectedCandidateIds.length === 0 && selectedCarryForwardSectionIds.length === 0) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        message: `Select at least one imported object before ${decision === "approve" ? "approval" : "rejection"}.`
      })
    );
  }

  const candidatesResult = await getArtifactCandidatesService(
    session.organization.organizationId,
    selectedCandidateIds
  );

  if (!candidatesResult.ok) {
    await redirectWithApprovalError(
      candidatesResult.errors[0]?.message ?? "One or more imported candidates could not be loaded for bulk approval."
    );
  }
  const candidates = candidatesResult.ok ? candidatesResult.data : [];

  if (candidates.length !== selectedCandidateIds.length) {
    await redirectWithApprovalError("One or more imported candidates could not be loaded for bulk approval.");
  }
  const selectedOutcomeCandidates = candidates.filter((candidate) => candidate.type === "outcome");
  const selectedOutcomeCandidateIds = new Set(selectedOutcomeCandidates.map((candidate) => candidate.id));
  const selectedOutcomeCandidateId =
    selectedOutcomeCandidates.length === 1 ? selectedOutcomeCandidates[0]?.id ?? null : null;
  const selectedStoryCandidates = candidates.filter((candidate) => candidate.type === "story");
  function readResolvedStoryEpicSelection(candidate: {
    id: string;
    draftRecord?: { epicCandidateId?: string | null } | null;
    inferredEpicCandidateId?: string | null;
  }) {
    return (
      readDynamicField(formData, "candidate", candidate.id, "epicCandidateId") ||
      readDynamicField(formData, "candidate", candidate.id, "originalEpicCandidateId") ||
      candidate.draftRecord?.epicCandidateId?.trim() ||
      candidate.inferredEpicCandidateId?.trim() ||
      targetEpicCandidateId ||
      ""
    );
  }
  function readResolvedStoryOutcomeSelection(candidate: {
    id: string;
    draftRecord?: { outcomeCandidateId?: string | null } | null;
    inferredOutcomeCandidateId?: string | null;
  }) {
    return (
      readDynamicField(formData, "candidate", candidate.id, "outcomeCandidateId") ||
      candidate.draftRecord?.outcomeCandidateId?.trim() ||
      candidate.inferredOutcomeCandidateId?.trim() ||
      ""
    );
  }
  const storiesMissingEpic = candidates.filter((candidate) => {
    if (candidate.type !== "story") {
      return false;
    }

    const currentEpicId = readResolvedStoryEpicSelection(candidate);

    return !currentEpicId;
  });

  if (decision === "approve" && storiesMissingEpic.length > 0) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        message: "Choose the target Epic for imported Story Ideas that do not already belong to an imported Epic."
      })
    );
  }

  if (
    decision === "approve" &&
    selectedCarryForwardSectionIds.length > 0 &&
    selectedOutcomeCandidates.length > 1
  ) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        message: "Approve constraints together with one imported Outcome at a time."
      })
    );
  }

  if (
    decision === "approve" &&
    selectedOutcomeCandidates.length === 0 &&
    !targetOutcomeId
  ) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        message: "Select a project Outcome before approving imported Epics, Story Ideas, or constraints."
      })
    );
  }

  if (decision === "reject") {
    const carryForwardRejectResult =
      selectedCarryForwardSectionIds.length > 0
        ? await reviewArtifactFileSectionDispositionsBulkService(
            selectedCarryForwardSectionIds.map((sectionId) => ({
              organizationId: session.organization.organizationId,
              actorId: session.userId,
              fileId,
              sectionId,
              action: "not_relevant",
              note: "Rejected from the framing import spine."
            }))
          )
        : { ok: true as const, data: [] };
    const failedCarryForwardReject = !carryForwardRejectResult.ok ? carryForwardRejectResult : null;

    if (failedCarryForwardReject && !failedCarryForwardReject.ok) {
      await redirectWithApprovalError(
        failedCarryForwardReject.errors[0]?.message ?? "Selected framing constraints could not be rejected."
      );
    }

    const candidateRejectResult =
      candidates.length > 0
        ? await reviewArtifactCandidatesBulkService(
            candidates.map((candidate) => ({
              organizationId: session.organization.organizationId,
              actorId: session.userId,
              candidateId: candidate.id,
              reviewStatus: "rejected",
              reviewComment: "Rejected from the framing import spine."
            }))
          )
        : { ok: true as const, data: [] };
    const failedCandidateReject = !candidateRejectResult.ok ? candidateRejectResult : null;

    if (failedCandidateReject && !failedCandidateReject.ok) {
      await redirectWithApprovalError(
        failedCandidateReject.errors[0]?.message ?? "One or more selected framing items could not be rejected."
      );
    }

    const suppressedRejectResult =
      suppressedCandidateIds.length > 0
        ? await reviewArtifactCandidatesBulkService(
            suppressedCandidateIds.map((candidateId) => ({
              organizationId: session.organization.organizationId,
              actorId: session.userId,
              candidateId,
              reviewStatus: "rejected",
              reviewComment: "Merged into the primary imported Outcome in the framing spine."
            }))
          )
        : { ok: true as const, data: [] };
    const failedSuppressedReject = !suppressedRejectResult.ok ? suppressedRejectResult : null;

    if (failedSuppressedReject && !failedSuppressedReject.ok) {
      await redirectWithApprovalError(
        failedSuppressedReject.errors[0]?.message ?? "One or more merged Outcome candidates could not be cleared."
      );
    }

    revalidatePath("/intake");
    revalidatePath("/review");
    revalidatePath("/workspace");
    revalidatePath("/");

    await logApproval(
      "success",
      `Rejected ${selectedCandidateIds.length + selectedCarryForwardSectionIds.length} selected framing item(s).`
    );

    redirect(
      buildRedirect("/intake", {
        status: "reject",
        sessionId,
        fileId,
        message: `Rejected ${selectedCandidateIds.length + selectedCarryForwardSectionIds.length} selected framing item(s).`
      })
    );
  }

  const carryForwardUpdates = selectedCarryForwardSectionIds.map((sectionId) => ({
    sectionId,
    title: readDynamicField(formData, "section", sectionId, "title"),
    summary: readDynamicField(formData, "section", sectionId, "summary"),
    category:
      ((readDynamicField(formData, "section", sectionId, "category") || "additional_requirement") as
        | "ux_principle"
        | "nfr_constraint"
        | "solution_constraint"
        | "additional_requirement"
        | "excluded_design")
  }));

  if (carryForwardUpdates.length > 0) {
    const updateCarryForwardResult = await updateArtifactFileCarryForwardItemsService({
      organizationId: session.organization.organizationId,
      fileId,
      updates: carryForwardUpdates
    });

    if (!updateCarryForwardResult.ok) {
      await redirectWithApprovalError(
        updateCarryForwardResult.errors[0]?.message ?? "Constraint edits could not be saved for approval."
      );
    }
  }

  const carryForwardConfirmResult =
    selectedCarryForwardSectionIds.length > 0
      ? await reviewArtifactFileSectionDispositionsBulkService(
          selectedCarryForwardSectionIds.map((sectionId) => ({
            organizationId: session.organization.organizationId,
            actorId: session.userId,
            fileId,
            sectionId,
            action: "confirmed",
            note: "Approved from the framing import spine."
          }))
        )
      : { ok: true as const, data: [] };
  const failedCarryForwardConfirm = !carryForwardConfirmResult.ok ? carryForwardConfirmResult : null;

  if (failedCarryForwardConfirm && !failedCarryForwardConfirm.ok) {
    await redirectWithApprovalError(
      failedCarryForwardConfirm.errors[0]?.message ?? "Selected framing constraints could not be approved."
    );
  }

  const leftoverDispositionResult =
    leftoverSectionIds.length > 0
      ? await reviewArtifactFileSectionDispositionsBulkService(
          leftoverSectionIds.map((sectionId) => ({
            organizationId: session.organization.organizationId,
            actorId: session.userId,
            fileId,
            sectionId,
            action: "not_relevant",
            note: "Ignored during framing spine approval."
          }))
        )
      : { ok: true as const, data: [] };
  const failedLeftoverDisposition = !leftoverDispositionResult.ok ? leftoverDispositionResult : null;

  if (failedLeftoverDisposition && !failedLeftoverDisposition.ok) {
    await redirectWithApprovalError(
      failedLeftoverDisposition.errors[0]?.message ?? "Leftover cleanup could not be saved."
    );
  }

  const candidatePreparationPayloads = candidates.flatMap((candidate) => {
      const currentOutcomeLink =
        candidate.type === "story"
          ? readResolvedStoryOutcomeSelection(candidate)
          : readDynamicField(formData, "candidate", candidate.id, "outcomeCandidateId") ||
            candidate.draftRecord?.outcomeCandidateId?.trim() ||
            candidate.inferredOutcomeCandidateId?.trim() ||
            "";
      const currentEpicLink = readResolvedStoryEpicSelection(candidate);
      const usesFallbackEpic = currentEpicLink === FALLBACK_EPIC_OPTION_VALUE;
      const resolvedOutcomeLink =
        candidate.type === "outcome"
          ? targetOutcomeId
          : currentOutcomeLink && selectedOutcomeCandidateIds.has(currentOutcomeLink)
            ? currentOutcomeLink
            : currentOutcomeLink && !selectedOutcomeCandidateIds.has(currentOutcomeLink) && currentOutcomeLink !== targetOutcomeId
              ? targetOutcomeId
              : currentOutcomeLink || (selectedOutcomeCandidateId ?? targetOutcomeId);
      const draftRecord =
        candidate.type === "outcome"
          ? {
              ...(candidate.draftRecord ?? {}),
              ...(hasDynamicField(formData, "candidate", candidate.id, "key")
                ? { key: readNullableDynamicField(formData, "candidate", candidate.id, "key") }
                : {}),
              ...(hasDynamicField(formData, "candidate", candidate.id, "title")
                ? { title: readNullableDynamicField(formData, "candidate", candidate.id, "title") }
                : {}),
              ...(hasDynamicField(formData, "candidate", candidate.id, "problemStatement")
                ? { problemStatement: readNullableDynamicField(formData, "candidate", candidate.id, "problemStatement") }
                : {}),
              ...(hasDynamicField(formData, "candidate", candidate.id, "outcomeStatement")
                ? { outcomeStatement: readNullableDynamicField(formData, "candidate", candidate.id, "outcomeStatement") }
                : {}),
              ...(hasDynamicField(formData, "candidate", candidate.id, "baselineDefinition")
                ? { baselineDefinition: readNullableDynamicField(formData, "candidate", candidate.id, "baselineDefinition") }
                : {}),
              ...(hasDynamicField(formData, "candidate", candidate.id, "baselineSource")
                ? { baselineSource: readNullableDynamicField(formData, "candidate", candidate.id, "baselineSource") }
                : {}),
              ...(hasDynamicField(formData, "candidate", candidate.id, "timeframe")
                ? { timeframe: readNullableDynamicField(formData, "candidate", candidate.id, "timeframe") }
                : {}),
              outcomeCandidateId: targetOutcomeId
            }
          : candidate.type === "epic"
            ? {
                ...(candidate.draftRecord ?? {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "key")
                  ? { key: readNullableDynamicField(formData, "candidate", candidate.id, "key") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "title")
                  ? { title: readNullableDynamicField(formData, "candidate", candidate.id, "title") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "purpose")
                  ? { purpose: readNullableDynamicField(formData, "candidate", candidate.id, "purpose") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "scopeBoundary")
                  ? { scopeBoundary: readNullableDynamicField(formData, "candidate", candidate.id, "scopeBoundary") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "riskNote")
                  ? { riskNote: readNullableDynamicField(formData, "candidate", candidate.id, "riskNote") }
                  : {}),
                outcomeCandidateId: resolvedOutcomeLink || null
              }
            : {
                ...(candidate.draftRecord ?? {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "key")
                  ? { key: readNullableDynamicField(formData, "candidate", candidate.id, "key") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "title")
                  ? { title: readNullableDynamicField(formData, "candidate", candidate.id, "title") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "storyType")
                  ? {
                      storyType: readNullableDynamicField(formData, "candidate", candidate.id, "storyType") as
                        | "outcome_delivery"
                        | "governance"
                        | "enablement"
                        | null
                    }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "valueIntent")
                  ? { valueIntent: readNullableDynamicField(formData, "candidate", candidate.id, "valueIntent") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "expectedBehavior")
                  ? { expectedBehavior: readNullableDynamicField(formData, "candidate", candidate.id, "expectedBehavior") }
                  : {}),
                ...(hasDynamicField(formData, "candidate", candidate.id, "acceptanceCriteria")
                  ? { acceptanceCriteria: readDynamicLines(formData, "candidate", candidate.id, "acceptanceCriteria") }
                  : {}),
                outcomeCandidateId: resolvedOutcomeLink || null,
                epicCandidateId: usesFallbackEpic ? null : currentEpicLink || null
              };

      const payload = {
        organizationId: session.organization.organizationId,
        actorId: session.userId,
        candidateId: candidate.id,
        reviewStatus: "confirmed",
        reviewComment: "Approved from the framing import spine.",
        draftRecord
      };

      const reviewStatusNeedsUpdate = candidate.reviewStatus !== "confirmed" && candidate.reviewStatus !== "edited";
      const reviewCommentNeedsUpdate =
        normalizeComparableValue(candidate.reviewComment) !==
        normalizeComparableValue(payload.reviewComment);
      const draftNeedsUpdate = draftRecordNeedsUpdate(
        (candidate.draftRecord ?? null) as Record<string, unknown> | null,
        draftRecord
      );

      return reviewStatusNeedsUpdate || reviewCommentNeedsUpdate || draftNeedsUpdate ? [payload] : [];
    });
  const candidatePreparationResult =
    candidatePreparationPayloads.length > 0
      ? await reviewArtifactCandidatesBulkService(candidatePreparationPayloads)
      : { ok: true as const, data: [] };
  const failedCandidatePreparation = !candidatePreparationResult.ok ? candidatePreparationResult : null;

  if (failedCandidatePreparation && !failedCandidatePreparation.ok) {
    await redirectWithApprovalError(
      failedCandidatePreparation.errors[0]?.message ?? "Imported framing items could not be prepared for approval."
    );
  }
  const suppressedCleanupResult =
    suppressedCandidateIds.length > 0
      ? await reviewArtifactCandidatesBulkService(
          suppressedCandidateIds.map((candidateId) => ({
            organizationId: session.organization.organizationId,
            actorId: session.userId,
            candidateId,
            reviewStatus: "rejected",
            reviewComment: "Merged into the primary imported Outcome in the framing spine."
          }))
        )
      : { ok: true as const, data: [] };
  const failedSuppressedCleanup = !suppressedCleanupResult.ok ? suppressedCleanupResult : null;

  if (failedSuppressedCleanup && !failedSuppressedCleanup.ok) {
    await redirectWithApprovalError(
      failedSuppressedCleanup.errors[0]?.message ?? "Merged Outcome cleanup could not be saved."
    );
  }

  const orderedCandidates = sortCandidateIdsForPromotion(
    candidates.map((candidate) => ({
      id: candidate.id,
      type: candidate.type
    }))
  );
  let promotedCount = 0;
  const failures: string[] = [];
  let resolvedOutcomeId = targetOutcomeId;
  let resolvedFallbackEpicId: string | null = null;

  const outcomeAndEpicCandidates = orderedCandidates.filter((candidate) => candidate.type !== "story");

  if (outcomeAndEpicCandidates.length > 0) {
    for (const candidateChunk of chunkItems(outcomeAndEpicCandidates, 8)) {
      const bulkPromoteResult = await promoteArtifactCandidatesBulkService({
        organizationId: session.organization.organizationId,
        candidateIds: candidateChunk.map((candidate) => candidate.id),
        actorId: session.userId,
        disableAutoPromoteDependencies: true,
        trustPreparedReadiness: true
      });

      if (!bulkPromoteResult.ok) {
        await redirectWithApprovalError(
          bulkPromoteResult.errors[0]?.message ?? "Selected imported Outcomes or Epics could not be approved."
        );
      } else {
        const promotedOutcomeAndEpicResults = bulkPromoteResult.data;

        for (const promoted of promotedOutcomeAndEpicResults) {
          const promotedCandidate = candidateChunk.find((candidate) => candidate.id === promoted.candidateId);

          if (promotedCandidate?.type === "outcome") {
            resolvedOutcomeId = promoted.promotedEntityId;
          }

          promotedCount += 1;
        }
      }
    }
  }

  if (
    selectedStoryCandidates.some((candidate) => {
      const currentEpicLink = readResolvedStoryEpicSelection(candidate);
      return !currentEpicLink || currentEpicLink === FALLBACK_EPIC_OPTION_VALUE;
    })
  ) {
    if (!resolvedOutcomeId) {
      await redirectWithApprovalError("Choose or approve an Outcome before creating the Fallback Epic.");
    }

    const fallbackOutcomeId = resolvedOutcomeId as string;

    const fallbackEpicResult = await createNativeEpicFromOutcomeService({
      organizationId: session.organization.organizationId,
      outcomeId: fallbackOutcomeId,
      actorId: session.userId,
      title: "Fallback Epic"
    });

    if (!fallbackEpicResult.ok) {
      await redirectWithApprovalError(
        fallbackEpicResult.errors[0]?.message ?? "Fallback Epic could not be created."
      );
    }

    resolvedFallbackEpicId = fallbackEpicResult.ok ? fallbackEpicResult.data.id : null;
  }

  const storyCandidatesInOrder = orderedCandidates.filter((entry) => entry.type === "story");
  if (resolvedFallbackEpicId) {
    const fallbackOutcomeId = resolvedOutcomeId as string;
    const fallbackStoryPayloads = storyCandidatesInOrder
      .map((candidate) => {
        const story = candidates.find((entry) => entry.id === candidate.id);
        const currentEpicLink = story ? readResolvedStoryEpicSelection(story) : "";

        if (currentEpicLink && currentEpicLink !== FALLBACK_EPIC_OPTION_VALUE) {
          return null;
        }

        return {
          organizationId: session.organization.organizationId,
          actorId: session.userId,
          candidateId: candidate.id,
          reviewStatus: "confirmed" as const,
          reviewComment: "Approved from the framing import spine.",
          draftRecord: {
            epicCandidateId: resolvedFallbackEpicId,
            outcomeCandidateId: fallbackOutcomeId
          }
        };
      })
      .filter((payload): payload is NonNullable<typeof payload> => payload !== null);

    if (fallbackStoryPayloads.length > 0) {
      const fallbackReviewResult = await reviewArtifactCandidatesBulkService(fallbackStoryPayloads);

      if (!fallbackReviewResult.ok) {
        await redirectWithApprovalError(
          fallbackReviewResult.errors[0]?.message ?? "Fallback Epic could not be linked to the selected Story Ideas."
        );
      }
    }
  }

  if (storyCandidatesInOrder.length > 0) {
    for (const candidateChunk of chunkItems(storyCandidatesInOrder, 12)) {
      const bulkStoryPromoteResult = await promoteArtifactCandidatesBulkService({
        organizationId: session.organization.organizationId,
        candidateIds: candidateChunk.map((candidate) => candidate.id),
        actorId: session.userId,
        disableAutoPromoteDependencies: true,
        trustPreparedReadiness: true
      });

      if (!bulkStoryPromoteResult.ok) {
        await redirectWithApprovalError(
          bulkStoryPromoteResult.errors[0]?.message ?? "Selected imported Story Ideas could not be approved."
        );
      } else {
        const promotedStoryResults = bulkStoryPromoteResult.data;

        promotedCount += promotedStoryResults.length;
      }
    }
  }

  if (selectedCarryForwardSectionIds.length > 0) {
    if (!resolvedOutcomeId) {
      await redirectWithApprovalError("Approve or choose a framing Outcome before applying imported constraints.");
    }

    const approvedOutcomeId = resolvedOutcomeId as string;

    const carryForwardApplyResult = await applyApprovedArtifactFileCarryForwardToOutcomeService({
      organizationId: session.organization.organizationId,
      actorId: session.userId,
      outcomeId: approvedOutcomeId,
      fileId
    });

    if (!carryForwardApplyResult.ok) {
      await redirectWithApprovalError(
        carryForwardApplyResult.errors[0]?.message ?? "Constraints could not be applied to the framing Outcome."
      );
    }
  }

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/framing");
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");

  await logApproval(
    failures.length > 0 ? "error" : "success",
    failures.length > 0
      ? `Approved ${promotedCount} framing item(s), but ${failures.length} still need attention.`
      : `Approved ${promotedCount} framing item(s) and applied ${selectedCarryForwardSectionIds.length} constraint item(s).`,
    failures.length > 0 ? failures.slice(0, 3).join(" | ") : null
  );

  redirect(
    buildRedirect("/intake", {
      status: failures.length > 0 ? "blocked" : "promoted",
      sessionId,
      fileId,
      message:
        failures.length > 0
          ? `Approved ${promotedCount} selected framing item(s), but ${failures.length} still need attention: ${failures.slice(0, 2).join(" | ")}`
          : `Approved ${promotedCount} selected framing item(s) and applied ${selectedCarryForwardSectionIds.length} approved constraint item(s).`
    })
  );
  } catch (error) {
    unstable_rethrow(error);

    await logApproval(
      "error",
      error instanceof Error ? error.message : "Framing approval failed unexpectedly.",
      error instanceof Error ? error.stack?.split("\n").slice(0, 3).join(" | ") ?? null : null
    );

    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        message:
          error instanceof Error ? error.message : "Framing approval failed unexpectedly before a response could be completed."
      })
    );
  }
}

export async function submitArtifactSectionDispositionAction(formData: FormData) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirectDemoIntakeBlocked();
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  const candidateId = String(formData.get("candidateId") ?? "") || undefined;
  const sectionId = String(formData.get("sectionId") ?? "");
  const action = String(formData.get("action") ?? "pending");
  const note = String(formData.get("note") ?? "") || null;

  const result = await reviewArtifactFileSectionDispositionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    fileId,
    sectionId,
    action,
    note
  });

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        candidateId,
        message: result.errors[0]?.message ?? "Section disposition could not be saved."
      })
    );
  }

  redirect(
    buildRedirect("/intake", {
      status: "edited",
      sessionId,
      fileId,
      candidateId,
      message: "Section disposition saved."
    })
  );
}

export async function submitArtifactCandidateIssueDispositionInlineAction(input: {
  candidateId: string;
  candidateType: "outcome" | "epic" | "story";
  issueId: string;
  issueAction: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";
}) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    return {
      ok: false as const,
      message: "Import is read-only in Demo. Leave Demo and open a normal project before changing review state."
    };
  }

  const reviewResult = await reviewArtifactCandidateService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    candidateId: input.candidateId,
    reviewStatus: "edited",
    issueDisposition: {
      issueId: input.issueId,
      action: input.issueAction,
      note: null
    }
  });

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!reviewResult.ok) {
    return {
      ok: false as const,
      message: reviewResult.errors[0]?.message ?? "Issue disposition could not be saved."
    };
  }

  return {
    ok: true as const,
    selectedAction: input.issueAction
  };
}

export async function submitArtifactSectionDispositionInlineAction(input: {
  fileId: string;
  sectionId: string;
  action: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";
}) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    return {
      ok: false as const,
      message: "Import is read-only in Demo. Leave Demo and open a normal project before changing review state."
    };
  }

  const result = await reviewArtifactFileSectionDispositionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    fileId: input.fileId,
    sectionId: input.sectionId,
    action: input.action,
    note: null
  });

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/");

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.errors[0]?.message ?? "Section disposition could not be saved."
    };
  }

  return {
    ok: true as const,
    selectedAction: input.action
  };
}

export async function submitArtifactSectionBulkDeleteAction(formData: FormData) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId: String(formData.get("sessionId") ?? "").trim() || undefined,
        fileId: String(formData.get("fileId") ?? "").trim() || undefined,
        message: "Import is read-only in Demo. Leave Demo and open a normal project before changing review state."
      })
    );
  }

  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const fileId = String(formData.get("fileId") ?? "").trim();
  const queueLabel = String(formData.get("queueLabel") ?? "items").trim() || "items";
  const sectionIds = formData
    .getAll("sectionIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!fileId || sectionIds.length === 0) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId: sessionId || undefined,
        fileId: fileId || undefined,
        message: "No import sections were selected for deletion."
      })
    );
  }

  const result = await reviewArtifactFileSectionDispositionsBulkService(
    sectionIds.map((sectionId) => ({
      organizationId: session.organization.organizationId,
      actorId: session.userId,
      fileId,
      sectionId,
      action: "not_relevant" as const,
      note: `Deleted from ${queueLabel} in the intake import view.`
    }))
  );

  if (!result.ok) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId: sessionId || undefined,
        fileId,
        message: result.errors[0]?.message ?? `The selected ${queueLabel} could not be deleted.`
      })
    );
  }

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/");

  redirect(
    buildRedirect("/intake", {
      status: "success",
      sessionId: sessionId || undefined,
      fileId,
      message: `Deleted ${sectionIds.length} ${queueLabel} from the import view.`
    })
  );
}

export async function submitArtifactSectionBulkDeleteInlineAction(input: {
  fileId: string;
  sectionIds: string[];
  queueLabel: string;
}) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    return {
      ok: false as const,
      message: "Import is read-only in Demo. Leave Demo and open a normal project before changing review state."
    };
  }

  const fileId = input.fileId.trim();
  const queueLabel = input.queueLabel.trim() || "items";
  const sectionIds = input.sectionIds.map((sectionId) => sectionId.trim()).filter(Boolean);

  if (!fileId || sectionIds.length === 0) {
    return {
      ok: false as const,
      message: "No import sections were selected for deletion."
    };
  }

  const result = await reviewArtifactFileSectionDispositionsBulkService(
    sectionIds.map((sectionId) => ({
      organizationId: session.organization.organizationId,
      actorId: session.userId,
      fileId,
      sectionId,
      action: "not_relevant" as const,
      note: `Deleted from ${queueLabel} in the intake import view.`
    }))
  );

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/");

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.errors[0]?.message ?? `The selected ${queueLabel} could not be deleted.`
    };
  }

  return {
    ok: true as const,
    deletedCount: sectionIds.length
  };
}
