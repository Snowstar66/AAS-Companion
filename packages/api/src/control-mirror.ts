import {
  archiveControlMirrorEvidencePackExportRecord,
  createControlMirrorUploadedSnapshot,
  createControlMirrorEvidencePackExportRecord,
  getControlMirrorEvidencePackExportRecordById,
  getControlMirrorDashboardSnapshot,
  hasControlMirrorCurrentImportFilesAfter,
  listControlMirrorEvidencePackExportRecords,
  mergeControlMirrorHumanReviewItemsWithQueueState,
  recordControlMirrorEvidencePackExportAcceptanceDecision,
  recordControlMirrorEvidencePackExportDownloadEvent,
  recordControlMirrorHumanReviewDecision,
  resetControlMirrorWorkspace,
  refreshControlMirrorCurrentImportsSnapshot,
  syncControlMirrorHumanReviewQueueItems,
  type ControlMirrorReviewDecisionType
} from "@aas-companion/db";
import {
  applyControlMirrorHumanReviewStateToDashboard,
  buildControlMirrorEvidencePack,
  buildControlMirrorEvidencePackFileName,
  buildControlMirrorEvidencePackMarkdown,
  ensureControlMirrorEvidencePackAcceptancePolicy,
  type ControlMirrorDashboard,
  type ControlMirrorEvidencePack,
  type ControlMirrorUploadedSnapshotFileInput
} from "@aas-companion/domain";
import { failure, success } from "./shared";

function isControlMirrorResetBaseline(dashboard: ControlMirrorDashboard) {
  return dashboard.snapshot.isPersistent &&
    dashboard.snapshot.fileCount === 0 &&
    dashboard.artifacts.length === 0 &&
    dashboard.normalizedEvidence.length === 0 &&
    dashboard.snapshot.label.startsWith("Reset baseline ");
}

function getResetBaselineScanTime(dashboard: ControlMirrorDashboard) {
  if (!dashboard.snapshot.scanTime) {
    return null;
  }

  const scanTime = new Date(dashboard.snapshot.scanTime);

  return Number.isNaN(scanTime.getTime()) ? null : scanTime;
}

function clearGeneratedControlMirrorStateAfterReset(dashboard: ControlMirrorDashboard): ControlMirrorDashboard {
  return {
    ...dashboard,
    releaseReadiness: "conditional",
    storyIdeaEvidence: [],
    metrics: [],
    normalization: {
      evidenceCount: 0,
      storyLikeItems: 0,
      candidateDeliveryStories: 0,
      storyIdeas: 0,
      explorationStories: 0,
      outOfScopeItems: 0,
      readyForBuild: 0,
      needsRefinement: 0
    },
    conformance: {
      ...dashboard.conformance,
      framingAligned: 0,
      framingPartial: 0,
      weakValueAlignment: 0,
      scopeDrift: 0,
      outOfScope: 0,
      rightBuilt: 0,
      weaklyTracedBuild: 0,
      untracedBuildArtifacts: 0,
      findings: [],
      releaseRisk: 0,
      aiLevelRecommendation: "proceed_with_controls"
    },
    guardrails: {
      checked: 0,
      passed: 0,
      flagged: 0,
      findings: []
    },
    designProgress: {
      storyIdeas: 0,
      classifiedItems: 0,
      refinedDeliveryStories: 0,
      storiesWithAcceptanceCriteria: 0,
      storiesWithTestDefinition: 0,
      readyForBuild: 0,
      blockedStories: 0
    },
    buildConformance: {
      ...dashboard.buildConformance,
      rightBuilt: 0,
      partiallyBuilt: 0,
      builtButUnverified: 0,
      weaklyTraced: 0,
      releaseRisk: 0,
      untracedArtifacts: 0
    },
    testEvidence: {
      ...dashboard.testEvidence,
      storiesWithNoTest: 0,
      storiesWithTestDefinitionOnly: 0,
      storiesWithImplementedTests: 0,
      storiesWithPassingTests: 0,
      storiesWithFailingTests: 0,
      manualVerificationOnly: 0,
      behaviouralContractTests: 0,
      brokenValueSpineLinks: 0,
      mappedEvidence: [],
      valueSpineCoverage: [],
      untracedImplementationArtifacts: []
    },
    aiEvidence: [],
    humanReviewItems: [],
    reviewStateSummary: {
      open: 0,
      decided: 0,
      deferred: 0,
      superseded: 0,
      openBlocking: 0,
      items: []
    },
    report: {
      ...dashboard.report,
      releaseReadiness: "conditional",
      evidenceSummaries: [],
      openHumanReviewItems: 0,
      blockingHumanReviewItems: 0,
      scopeDriftItems: 0,
      untracedArtifacts: 0,
      requiredApprovals: [],
      blockingGaps: [],
      residualRisks: [],
      decisionLogSummary: "Control Mirror has been reset. Import or refresh evidence before recording new decisions.",
      recommendedNextStep: "Import or refresh Control Mirror evidence to evaluate the current Framing baseline."
    }
  };
}

export async function getControlMirrorDashboardService(organizationId: string) {
  try {
    let snapshot = await getControlMirrorDashboardSnapshot(organizationId);

    if (!snapshot) {
      return failure({
        code: "control_mirror_not_found",
        message: "No governed project snapshot was found for this organization."
      });
    }

    const resetBaselineScanTime = isControlMirrorResetBaseline(snapshot) ? getResetBaselineScanTime(snapshot) : null;

    if (resetBaselineScanTime && await hasControlMirrorCurrentImportFilesAfter({
      organizationId,
      after: resetBaselineScanTime
    })) {
      await refreshControlMirrorCurrentImportsSnapshot({
        organizationId
      });
      snapshot = await getControlMirrorDashboardSnapshot(organizationId);

      if (!snapshot) {
        return failure({
          code: "control_mirror_not_found",
          message: "No governed project snapshot was found for this organization."
        });
      }
    }

    if (isControlMirrorResetBaseline(snapshot)) {
      await syncControlMirrorHumanReviewQueueItems({
        organizationId,
        snapshotId: snapshot.snapshot.id,
        items: []
      });

      return success(clearGeneratedControlMirrorStateAfterReset(snapshot));
    }

    const persistedReviewItems = await syncControlMirrorHumanReviewQueueItems({
      organizationId,
      snapshotId: snapshot.snapshot.isPersistent ? snapshot.snapshot.id : null,
      items: snapshot.humanReviewItems
    });

    const humanReviewItems = mergeControlMirrorHumanReviewItemsWithQueueState(snapshot.humanReviewItems, persistedReviewItems);

    return success(applyControlMirrorHumanReviewStateToDashboard(snapshot, humanReviewItems));
  } catch (error) {
    return failure({
      code: "control_mirror_unavailable",
      message: error instanceof Error ? error.message : "Control Mirror is unavailable."
    });
  }
}

export async function getControlMirrorEvidencePackService(input: {
  organizationId: string;
  generatedAt?: Date | string;
}) {
  const dashboard = await getControlMirrorDashboardService(input.organizationId);

  if (!dashboard.ok) {
    return dashboard;
  }

  return success(buildControlMirrorEvidencePack(
    dashboard.data,
    input.generatedAt === undefined ? {} : { generatedAt: input.generatedAt }
  ));
}

export type ControlMirrorEvidencePackExportFormat = "json" | "markdown";

export async function createControlMirrorEvidencePackExportService(input: {
  organizationId: string;
  actorId?: string | null;
  format?: ControlMirrorEvidencePackExportFormat;
}) {
  try {
    const format = input.format ?? "json";
    const evidencePack = await getControlMirrorEvidencePackService({
      organizationId: input.organizationId
    });

    if (!evidencePack.ok) {
      return evidencePack;
    }

    const extension = format === "markdown" ? "md" : "json";
    const fileName = buildControlMirrorEvidencePackFileName({
      activeProject: evidencePack.data.activeProject,
      snapshotId: evidencePack.data.snapshot.id,
      extension
    });
    const body = format === "markdown"
      ? buildControlMirrorEvidencePackMarkdown(evidencePack.data)
      : JSON.stringify(evidencePack.data, null, 2);
    const contentType = format === "markdown" ? "text/markdown; charset=utf-8" : "application/json; charset=utf-8";
    const record = await createControlMirrorEvidencePackExportRecord({
      organizationId: input.organizationId,
      format,
      fileName,
      contentType,
      evidencePack: evidencePack.data,
      markdownContent: format === "markdown" ? body : null,
      createdBy: input.actorId ?? null
    });

    return success({
      id: record.id,
      format,
      fileName,
      contentType,
      body,
      evidencePack: evidencePack.data,
      generatedAt: record.generatedAt.toISOString(),
      createdAt: record.createdAt.toISOString()
    });
  } catch (error) {
    return failure({
      code: "control_mirror_export_persist_failed",
      message: error instanceof Error ? error.message : "Control Mirror export could not be saved."
    });
  }
}

export async function listControlMirrorEvidencePackExportsService(input: {
  organizationId: string;
  take?: number;
}) {
  try {
    const records = await listControlMirrorEvidencePackExportRecords(input.take === undefined
      ? {
          organizationId: input.organizationId
        }
      : {
          organizationId: input.organizationId,
          take: input.take
        });

    return success(records.map((record) => ({
      id: record.id,
      snapshotId: record.snapshotId,
      format: record.format,
      schemaVersion: record.schemaVersion,
      fileName: record.fileName,
      contentType: record.contentType,
      generatedAt: record.generatedAt.toISOString(),
      createdBy: record.createdBy,
      createdAt: record.createdAt.toISOString(),
      retention: {
        state: record.retentionState,
        policyLabel: record.retentionPolicyLabel,
        reviewDueAt: record.retentionReviewDueAt?.toISOString() ?? null,
        reviewedAt: record.retentionReviewedAt?.toISOString() ?? null,
        archivedAt: record.archivedAt?.toISOString() ?? null,
        archivedBy: record.archivedBy,
        archivedByDisplayName: record.archivedByDisplayName ?? record.archivedBy,
        archiveReason: record.archiveReason
      },
      latestDownloadEvent: record.latestDownloadEvent
        ? {
            id: record.latestDownloadEvent.id,
            exportId: record.latestDownloadEvent.exportId,
            actorId: record.latestDownloadEvent.actorId,
            actorDisplayName: record.latestDownloadEvent.actorDisplayName ?? record.latestDownloadEvent.actorId,
            createdAt: record.latestDownloadEvent.createdAt.toISOString()
          }
        : null,
      acceptanceSummary: {
        shareReadiness: record.acceptanceSummary.shareReadiness,
        requiredRoles: record.acceptanceSummary.requiredRoles,
        acceptedRoles: record.acceptanceSummary.acceptedRoles,
        missingRoles: record.acceptanceSummary.missingRoles,
        blockingRoles: record.acceptanceSummary.blockingRoles,
        latestDecisions: record.acceptanceSummary.latestDecisions.map((decision) => ({
          id: decision.id,
          exportId: decision.exportId,
          reviewerRole: decision.reviewerRole,
          decisionType: decision.decisionType,
          rationale: decision.rationale,
          actorId: decision.actorId,
          createdAt: decision.createdAt.toISOString()
        }))
      },
      latestAcceptanceDecision: record.latestAcceptanceDecision
        ? {
            id: record.latestAcceptanceDecision.id,
            exportId: record.latestAcceptanceDecision.exportId,
            reviewerRole: record.latestAcceptanceDecision.reviewerRole,
            decisionType: record.latestAcceptanceDecision.decisionType,
            rationale: record.latestAcceptanceDecision.rationale,
            actorId: record.latestAcceptanceDecision.actorId,
            createdAt: record.latestAcceptanceDecision.createdAt.toISOString()
          }
        : null
    })));
  } catch (error) {
    return failure({
      code: "control_mirror_export_history_unavailable",
      message: error instanceof Error ? error.message : "Control Mirror export history is unavailable."
    });
  }
}

export async function recordControlMirrorEvidencePackExportAcceptanceDecisionService(input: {
  organizationId: string;
  exportId: string;
  reviewerRole: "product_owner" | "security_privacy" | "aqa";
  decisionType: "accepted" | "accepted_with_conditions" | "changes_requested" | "revoked";
  rationale: string;
  actorId: string;
}) {
  try {
    const decision = await recordControlMirrorEvidencePackExportAcceptanceDecision(input);

    return success({
      decisionId: decision.id,
      exportId: decision.exportId,
      reviewerRole: decision.reviewerRole,
      decisionType: decision.decisionType,
      decidedAt: decision.createdAt.toISOString()
    });
  } catch (error) {
    return failure({
      code: "control_mirror_export_acceptance_failed",
      message: error instanceof Error ? error.message : "Control Mirror export acceptance decision could not be recorded."
    });
  }
}

export async function archiveControlMirrorEvidencePackExportService(input: {
  organizationId: string;
  exportId: string;
  actorId: string;
  reason: string;
}) {
  try {
    const record = await archiveControlMirrorEvidencePackExportRecord(input);

    return success({
      exportId: record.id,
      retention: {
        state: record.retentionState,
        policyLabel: record.retentionPolicyLabel,
        archivedAt: record.archivedAt?.toISOString() ?? null,
        archivedBy: record.archivedBy,
        archiveReason: record.archiveReason
      }
    });
  } catch (error) {
    return failure({
      code: "control_mirror_export_archive_failed",
      message: error instanceof Error ? error.message : "Control Mirror export could not be archived."
    });
  }
}

export async function recordControlMirrorEvidencePackExportDownloadEventService(input: {
  organizationId: string;
  exportId: string;
  actorId: string;
}) {
  try {
    const event = await recordControlMirrorEvidencePackExportDownloadEvent(input);

    return success({
      eventId: event.id,
      exportId: event.exportId,
      actorId: event.actorId,
      downloadedAt: event.createdAt.toISOString()
    });
  } catch (error) {
    return failure({
      code: "control_mirror_export_download_audit_failed",
      message: error instanceof Error ? error.message : "Control Mirror export download could not be audited."
    });
  }
}

export async function getPersistedControlMirrorEvidencePackExportService(input: {
  organizationId: string;
  exportId: string;
}) {
  try {
    const record = await getControlMirrorEvidencePackExportRecordById({
      organizationId: input.organizationId,
      exportId: input.exportId
    });

    if (!record) {
      return failure({
        code: "control_mirror_export_not_found",
        message: "Persisted Control Mirror export was not found for this project."
      });
    }

    const evidencePack = ensureControlMirrorEvidencePackAcceptancePolicy(record.payload as ControlMirrorEvidencePack);
    const body = record.format === "markdown"
      ? record.markdownContent?.includes("Product/Security Acceptance")
        ? record.markdownContent
        : buildControlMirrorEvidencePackMarkdown(evidencePack)
      : JSON.stringify(evidencePack, null, 2);

    return success({
      id: record.id,
      format: record.format,
      fileName: record.fileName,
      contentType: record.contentType,
      body,
      generatedAt: record.generatedAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
      retention: {
        state: record.retentionState,
        policyLabel: record.retentionPolicyLabel,
        reviewDueAt: record.retentionReviewDueAt?.toISOString() ?? null,
        reviewedAt: record.retentionReviewedAt?.toISOString() ?? null,
        archivedAt: record.archivedAt?.toISOString() ?? null,
        archivedBy: record.archivedBy,
        archiveReason: record.archiveReason
      }
    });
  } catch (error) {
    return failure({
      code: "control_mirror_export_download_failed",
      message: error instanceof Error ? error.message : "Persisted Control Mirror export is unavailable."
    });
  }
}

export async function refreshControlMirrorCurrentImportsSnapshotService(input: {
  organizationId: string;
  actorId?: string | null;
}) {
  try {
    const snapshot = await refreshControlMirrorCurrentImportsSnapshot(input);
    const dashboard = await getControlMirrorDashboardSnapshot(input.organizationId);

    if (dashboard) {
      await syncControlMirrorHumanReviewQueueItems({
        organizationId: input.organizationId,
        snapshotId: dashboard.snapshot.isPersistent ? dashboard.snapshot.id : null,
        items: dashboard.humanReviewItems
      });
    }

    return success({
      snapshotId: snapshot.id,
      label: snapshot.label,
      fileCount: snapshot.fileCount,
      unchangedCount: snapshot.unchangedCount,
      newCount: snapshot.newCount,
      modifiedCount: snapshot.modifiedCount,
      deletedCount: snapshot.deletedCount,
      unreadableCount: snapshot.unreadableCount,
      normalizedEvidenceCount: snapshot.normalizedEvidence.length
    });
  } catch (error) {
    return failure({
      code: "control_mirror_snapshot_refresh_failed",
      message: error instanceof Error ? error.message : "Control Mirror snapshot refresh failed."
    });
  }
}

export async function resetControlMirrorWorkspaceService(input: {
  organizationId: string;
  actorId?: string | null;
}) {
  try {
    const reset = await resetControlMirrorWorkspace(input);
    const dashboard = await getControlMirrorDashboardSnapshot(input.organizationId);

    if (dashboard) {
      await syncControlMirrorHumanReviewQueueItems({
        organizationId: input.organizationId,
        snapshotId: dashboard.snapshot.isPersistent ? dashboard.snapshot.id : null,
        items: isControlMirrorResetBaseline(dashboard) ? [] : dashboard.humanReviewItems
      });
    }

    return success({
      snapshotId: reset.snapshot.id,
      label: reset.snapshot.label,
      clearedSnapshots: reset.clearedSnapshots,
      clearedReviewItems: reset.clearedReviewItems,
      clearedExports: reset.clearedExports
    });
  } catch (error) {
    return failure({
      code: "control_mirror_reset_failed",
      message: error instanceof Error ? error.message : "Control Mirror reset failed."
    });
  }
}

function readUploadedSnapshotSummary(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      acceptedCount: 0,
      rejectedCount: 0,
      unreadableCount: 0
    };
  }

  const summary = value as {
    acceptedCount?: unknown;
    rejectedCount?: unknown;
    unreadableCount?: unknown;
  };

  return {
    acceptedCount: typeof summary.acceptedCount === "number" ? summary.acceptedCount : 0,
    rejectedCount: typeof summary.rejectedCount === "number" ? summary.rejectedCount : 0,
    unreadableCount: typeof summary.unreadableCount === "number" ? summary.unreadableCount : 0
  };
}

export async function createControlMirrorUploadedSnapshotService(input: {
  organizationId: string;
  actorId?: string | null;
  label?: string | null;
  files: ControlMirrorUploadedSnapshotFileInput[];
}) {
  try {
    const snapshot = await createControlMirrorUploadedSnapshot(input);
    const summary = readUploadedSnapshotSummary(snapshot.summaryJson);
    const dashboard = await getControlMirrorDashboardSnapshot(input.organizationId);

    if (dashboard) {
      await syncControlMirrorHumanReviewQueueItems({
        organizationId: input.organizationId,
        snapshotId: dashboard.snapshot.isPersistent ? dashboard.snapshot.id : null,
        items: dashboard.humanReviewItems
      });
    }

    return success({
      snapshotId: snapshot.id,
      label: snapshot.label,
      fileCount: snapshot.fileCount,
      acceptedCount: summary.acceptedCount,
      rejectedCount: summary.rejectedCount,
      unreadableCount: summary.unreadableCount,
      unchangedCount: snapshot.unchangedCount,
      newCount: snapshot.newCount,
      modifiedCount: snapshot.modifiedCount,
      deletedCount: snapshot.deletedCount,
      normalizedEvidenceCount: snapshot.normalizedEvidence.length
    });
  } catch (error) {
    return failure({
      code: "control_mirror_uploaded_snapshot_failed",
      message: error instanceof Error ? error.message : "Uploaded Control Mirror snapshot could not be processed."
    });
  }
}

export async function recordControlMirrorHumanReviewDecisionService(input: {
  organizationId: string;
  reviewItemId: string;
  decisionType: ControlMirrorReviewDecisionType;
  rationale: string;
  actorId: string;
}) {
  try {
    const result = await recordControlMirrorHumanReviewDecision(input);

    return success({
      reviewItemId: result.reviewItem.id,
      reviewState: result.reviewItem.state,
      decisionEventId: result.decisionEvent.id,
      decisionType: result.decisionEvent.decisionType,
      decidedAt: result.decisionEvent.createdAt
    });
  } catch (error) {
    return failure({
      code: "control_mirror_review_decision_failed",
      message: error instanceof Error ? error.message : "Control Mirror review decision could not be recorded."
    });
  }
}
