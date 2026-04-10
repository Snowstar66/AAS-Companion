"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOutcomeTollgateReviewService, recordTollgateService } from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import {
  revalidateOutcomeTollgateReviewCache,
  revalidateOutcomeWorkspaceCache
} from "@/lib/cache/project-data";
import { buildTraceabilityEvidenceSnapshotFromCsv } from "@/lib/outcomes/traceability-evidence";

function buildApprovalDocumentRedirect(input: {
  outcomeId: string;
  status: "success" | "error";
  message: string;
}) {
  const params = new URLSearchParams({
    traceabilityUpload: input.status,
    traceabilityMessage: input.message
  });

  return `/outcomes/${input.outcomeId}/approval-document?${params.toString()}`;
}

export async function uploadOutcomeTraceabilityEvidenceAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "").trim();

  if (!outcomeId) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId: "unknown",
        status: "error",
        message: "Outcome id is required before traceability can be imported."
      })
    );
  }

  const upload = formData.get("traceabilityCsv");

  if (!(upload instanceof File) || upload.size === 0) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: "Choose a traceability-export.csv file before importing."
      })
    );
  }

  if (!upload.name.toLowerCase().endsWith(".csv")) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: "Only CSV traceability exports can be imported here."
      })
    );
  }

  const reviewResult = await getOutcomeTollgateReviewService(session.organization.organizationId, outcomeId);

  if (!reviewResult.ok) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: reviewResult.errors[0]?.message ?? "The approved framing document could not be loaded."
      })
    );
  }

  const tollgate = reviewResult.data.tollgateReview.tollgate ?? reviewResult.data.tollgate;
  const approvalSnapshot = reviewResult.data.tollgateReview.approvalSnapshot ?? reviewResult.data.tollgate?.approvalSnapshot;

  if (!tollgate || !approvalSnapshot || typeof approvalSnapshot !== "object") {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: "Approve Tollgate 1 before importing BMAD traceability evidence."
      })
    );
  }

  const outcomeKey =
    typeof (approvalSnapshot as { outcome?: { key?: unknown } }).outcome?.key === "string"
      ? ((approvalSnapshot as { outcome: { key: string } }).outcome.key)
      : null;

  if (!outcomeKey) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: "The approved framing snapshot is missing an outcome key."
      })
    );
  }

  const importedAt = new Date().toISOString();
  const traceabilityEvidence = buildTraceabilityEvidenceSnapshotFromCsv({
    content: await upload.text(),
    outcomeKey,
    sourcePath: upload.name,
    uploadedAt: importedAt
  });

  if (!traceabilityEvidence) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: "The uploaded CSV could not be parsed."
      })
    );
  }

  if (traceabilityEvidence.rows.length === 0) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: `The CSV did not contain any traceability rows for ${outcomeKey}.`
      })
    );
  }

  const saveResult = await recordTollgateService({
    organizationId: session.organization.organizationId,
    entityType: "outcome",
    entityId: outcomeId,
    tollgateType: "tg1_baseline",
    status: tollgate.status,
    blockers: tollgate.blockers,
    approverRoles: tollgate.approverRoles,
    submissionVersion: tollgate.submissionVersion ?? null,
    approvedVersion: tollgate.approvedVersion ?? null,
    approvalSnapshot: {
      ...approvalSnapshot,
      traceabilityEvidence
    },
    comments: tollgate.comments ?? null,
    actorId: session.userId,
    decidedBy: tollgate.decidedBy ?? null,
    decidedAt: tollgate.decidedAt ?? null
  });

  if (!saveResult.ok) {
    redirect(
      buildApprovalDocumentRedirect({
        outcomeId,
        status: "error",
        message: saveResult.errors[0]?.message ?? "The imported traceability evidence could not be saved."
      })
    );
  }

  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
  revalidatePath("/framing");
  revalidatePath("/");

  redirect(
    buildApprovalDocumentRedirect({
      outcomeId,
      status: "success",
      message: `Imported ${traceabilityEvidence.rows.length} BMAD traceability rows from ${upload.name}.`
    })
  );
}
