"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveControlMirrorEvidencePackExportService,
  createControlMirrorUploadedSnapshotService,
  recordControlMirrorEvidencePackExportAcceptanceDecisionService,
  recordControlMirrorHumanReviewDecisionService,
  reopenControlMirrorHumanReviewItemService,
  resetControlMirrorWorkspaceService,
  refreshControlMirrorCurrentImportsSnapshotService
} from "@aas-companion/api";
import type { ControlMirrorReviewDecisionType } from "@aas-companion/db";
import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import {
  canRecordControlMirrorExportAcceptanceRole,
  formatControlMirrorExportAcceptanceReviewerRole
} from "@/lib/control-mirror/export-acceptance-authority";
import {
  CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILE_BYTES,
  CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES,
  prepareControlMirrorUploadedSnapshotFilesFromFormData
} from "@/lib/control-mirror/uploaded-snapshot-adapter";

const CONTROL_MIRROR_EXPORT_ARCHIVE_ROLES = new Set(["value_owner", "delivery_lead", "architect", "aida", "aqa"]);

function buildRedirect(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    search.set(key, String(value));
  }

  const query = search.toString();
  return `/control-mirror${query ? `?${query}` : ""}`;
}

export async function refreshControlMirrorSnapshotAction() {
  const session = await requireActiveProjectSession();
  const result = await refreshControlMirrorCurrentImportsSnapshotService({
    organizationId: session.organization.organizationId,
    actorId: session.userId
  });

  revalidatePath("/control-mirror");

  if (!result.ok) {
    redirect(
      buildRedirect({
        status: "error",
        message: result.errors[0]?.message ?? "Control Mirror snapshot refresh failed."
      })
    );
  }

  redirect(
    buildRedirect({
      status: "refreshed",
      snapshotId: result.data.snapshotId,
      message: `Snapshot refreshed: ${result.data.fileCount} artifact(s), ${result.data.normalizedEvidenceCount} normalized evidence item(s), ${result.data.newCount} new, ${result.data.modifiedCount} modified, ${result.data.deletedCount} deleted.`
    })
  );
}

export async function resetControlMirrorWorkspaceAction() {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirect(
      buildRedirect({
        status: "error",
        message: "Control Mirror reset is read-only in Demo. Leave Demo and open a normal project before resetting Control Mirror."
      })
    );
  }

  const result = await resetControlMirrorWorkspaceService({
    organizationId: session.organization.organizationId,
    actorId: session.userId
  });

  revalidatePath("/control-mirror");

  if (!result.ok) {
    redirect(
      buildRedirect({
        status: "error",
        message: result.errors[0]?.message ?? "Control Mirror reset failed."
      })
    );
  }

  redirect(
    buildRedirect({
      status: "reset",
      snapshotId: result.data.snapshotId,
      message: `Control Mirror reset: ${result.data.clearedSnapshots} snapshot(s), ${result.data.clearedReviewItems} review item(s), and ${result.data.clearedExports} export(s) cleared. Framing, stories, signoffs and project imports were kept.`
    })
  );
}

export async function submitControlMirrorUploadedSnapshotAction(formData: FormData) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirect(
      buildRedirect({
        source: "uploaded-snapshot",
        status: "error",
        message: "Upload failed. No snapshot was created. Control Mirror uploads are read-only in Demo. Leave Demo and open a normal project before uploading evidence."
      })
    );
  }

  const selectedFileCount = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0).length;

  if (selectedFileCount === 0) {
    redirect(
      buildRedirect({
        source: "uploaded-snapshot",
        status: "error",
        message: "Upload failed. No snapshot was created. Select one or more explicit project snapshot files before submitting."
      })
    );
  }

  if (selectedFileCount > CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES) {
    redirect(
      buildRedirect({
        source: "uploaded-snapshot",
        status: "error",
        message: `Upload failed. No snapshot was created. Control Mirror accepts up to ${CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILES} files per uploaded snapshot.`
      })
    );
  }

  const adapterResult = await prepareControlMirrorUploadedSnapshotFilesFromFormData(formData);

  if (adapterResult.files.length === 0) {
    redirect(
      buildRedirect({
        source: "uploaded-snapshot",
        status: "error",
        message: `Upload failed. No snapshot was created. No processable files were selected. Files must be non-empty and no larger than ${Math.round(CONTROL_MIRROR_UPLOADED_SNAPSHOT_MAX_FILE_BYTES / 1024 / 1024)} MB.`
      })
    );
  }

  const result = await createControlMirrorUploadedSnapshotService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    label: String(formData.get("label") ?? "").trim() || null,
    files: adapterResult.files
  });

  revalidatePath("/control-mirror");

  if (!result.ok) {
    redirect(
      buildRedirect({
        source: "uploaded-snapshot",
        status: "error",
        message: `Upload failed. No snapshot was created. ${result.errors[0]?.message ?? "Uploaded Control Mirror snapshot could not be processed."}`
      })
    );
  }

  const localRejectedCount = adapterResult.rejectedBeforeProcessing.length;
  const rejectedText = result.data.rejectedCount + localRejectedCount > 0 ? `, ${result.data.rejectedCount + localRejectedCount} rejected` : "";

  redirect(
    buildRedirect({
      source: "uploaded-snapshot",
      status: "uploaded",
      snapshotId: result.data.snapshotId,
      message: `Uploaded snapshot processed: ${result.data.acceptedCount} accepted${rejectedText}, ${result.data.unreadableCount} unreadable, ${result.data.newCount} new, ${result.data.modifiedCount} modified, ${result.data.unchangedCount} unchanged, ${result.data.deletedCount} deleted.`
    })
  );
}

function parseDecisionType(value: FormDataEntryValue | null): ControlMirrorReviewDecisionType | null {
  if (
    value === "approve" ||
    value === "approve_with_controls" ||
    value === "reject" ||
    value === "defer" ||
    value === "downgrade" ||
    value === "request_exception" ||
    value === "request_rework"
  ) {
    return value;
  }

  return null;
}

function parseExportAcceptanceReviewerRole(value: FormDataEntryValue | null) {
  if (value === "product_owner" || value === "security_privacy" || value === "aqa") {
    return value;
  }

  return null;
}

function parseExportAcceptanceDecisionType(value: FormDataEntryValue | null) {
  if (value === "accepted" || value === "accepted_with_conditions" || value === "changes_requested" || value === "revoked") {
    return value;
  }

  return null;
}

export async function recordControlMirrorHumanReviewDecisionAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const reviewItemId = String(formData.get("reviewItemId") ?? "");
  const decisionType = parseDecisionType(formData.get("decisionType"));
  const rationale = String(formData.get("rationale") ?? "");

  if (!reviewItemId || !decisionType) {
    redirect(
      buildRedirect({
        status: "error",
        message: "Control Mirror review decision is missing required fields."
      })
    );
  }

  const result = await recordControlMirrorHumanReviewDecisionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    reviewItemId,
    decisionType,
    rationale
  });

  revalidatePath("/control-mirror");

  if (!result.ok) {
    redirect(
      buildRedirect({
        status: "error",
        message: result.errors[0]?.message ?? "Control Mirror review decision could not be recorded."
      })
    );
  }

  redirect(
    buildRedirect({
      status: "decision-recorded",
      reviewItemId: result.data.reviewItemId,
      message: "Human decision recorded for Control Mirror review item."
    })
  );
}

export async function reopenControlMirrorHumanReviewItemAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const reviewItemId = String(formData.get("reviewItemId") ?? "");

  if (!reviewItemId) {
    redirect(
      buildRedirect({
        status: "error",
        message: "Control Mirror review item is missing."
      })
    );
  }

  const result = await reopenControlMirrorHumanReviewItemService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    reviewItemId
  });

  revalidatePath("/control-mirror");

  if (!result.ok) {
    redirect(
      buildRedirect({
        status: "error",
        message: result.errors[0]?.message ?? "Control Mirror review item could not be reopened."
      })
    );
  }

  redirect(
    buildRedirect({
      status: "review-reopened",
      reviewItemId: result.data.reviewItemId,
      message: "Human Review item reopened as unhandled."
    })
  );
}

export async function recordControlMirrorEvidencePackExportAcceptanceAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const exportId = String(formData.get("exportId") ?? "");
  const reviewerRole = parseExportAcceptanceReviewerRole(formData.get("reviewerRole"));
  const decisionType = parseExportAcceptanceDecisionType(formData.get("decisionType"));
  const rationale = String(formData.get("rationale") ?? "");

  if (!exportId || !reviewerRole || !decisionType) {
    redirect(
      buildRedirect({
        status: "error",
        message: "Control Mirror export acceptance decision is missing required fields."
      })
    );
  }

  if (!canRecordControlMirrorExportAcceptanceRole({
    membershipRole: session.organization.role,
    reviewerRole
  })) {
    redirect(
      buildRedirect({
        status: "error",
        message: `Reviewer authority is required to record ${formatControlMirrorExportAcceptanceReviewerRole(reviewerRole)} acceptance for this export.`
      })
    );
  }

  const result = await recordControlMirrorEvidencePackExportAcceptanceDecisionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    exportId,
    reviewerRole,
    decisionType,
    rationale
  });

  revalidatePath("/control-mirror");

  if (!result.ok) {
    redirect(
      buildRedirect({
        status: "error",
        message: result.errors[0]?.message ?? "Control Mirror export acceptance decision could not be recorded."
      })
    );
  }

  redirect(
    buildRedirect({
      status: "acceptance-recorded",
      exportId: result.data.exportId,
      message: "Product/Security acceptance decision recorded for evidence pack export."
    })
  );
}

export async function archiveControlMirrorEvidencePackExportAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const exportId = String(formData.get("exportId") ?? "");
  const reason = String(formData.get("archiveReason") ?? "");

  if (!exportId || !reason.trim()) {
    redirect(
      buildRedirect({
        status: "error",
        message: "Control Mirror export archive is missing required fields."
      })
    );
  }

  if (!CONTROL_MIRROR_EXPORT_ARCHIVE_ROLES.has(session.organization.role)) {
    redirect(
      buildRedirect({
        status: "error",
        message: "Archive authority is required to archive a Control Mirror evidence pack export."
      })
    );
  }

  const result = await archiveControlMirrorEvidencePackExportService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    exportId,
    reason
  });

  revalidatePath("/control-mirror");

  if (!result.ok) {
    redirect(
      buildRedirect({
        status: "error",
        message: result.errors[0]?.message ?? "Control Mirror export could not be archived."
      })
    );
  }

  redirect(
    buildRedirect({
      status: "export-archived",
      exportId: result.data.exportId,
      message: "Control Mirror evidence pack export archived. Download remains available for audit history."
    })
  );
}
