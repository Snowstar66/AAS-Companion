import { afterEach, describe, expect, it, vi } from "vitest";

const {
  archiveControlMirrorEvidencePackExportRecordMock,
  getControlMirrorEvidencePackExportRecordByIdMock,
  recordControlMirrorEvidencePackExportDownloadEventMock
} = vi.hoisted(() => ({
  archiveControlMirrorEvidencePackExportRecordMock: vi.fn(),
  getControlMirrorEvidencePackExportRecordByIdMock: vi.fn(),
  recordControlMirrorEvidencePackExportDownloadEventMock: vi.fn()
}));

vi.mock("@aas-companion/db", () => ({
  archiveControlMirrorEvidencePackExportRecord: archiveControlMirrorEvidencePackExportRecordMock,
  createControlMirrorUploadedSnapshot: vi.fn(),
  createControlMirrorEvidencePackExportRecord: vi.fn(),
  getControlMirrorEvidencePackExportRecordById: getControlMirrorEvidencePackExportRecordByIdMock,
  getControlMirrorDashboardSnapshot: vi.fn(),
  listControlMirrorEvidencePackExportRecords: vi.fn(),
  mergeControlMirrorHumanReviewItemsWithQueueState: vi.fn(),
  recordControlMirrorEvidencePackExportAcceptanceDecision: vi.fn(),
  recordControlMirrorEvidencePackExportDownloadEvent: recordControlMirrorEvidencePackExportDownloadEventMock,
  recordControlMirrorHumanReviewDecision: vi.fn(),
  refreshControlMirrorCurrentImportsSnapshot: vi.fn(),
  syncControlMirrorHumanReviewQueueItems: vi.fn()
}));

import {
  archiveControlMirrorEvidencePackExportService,
  getPersistedControlMirrorEvidencePackExportService,
  recordControlMirrorEvidencePackExportDownloadEventService
} from "../../../../packages/api/src/control-mirror";

function createLegacyEvidencePackPayload() {
  return {
    schemaVersion: "control-mirror-evidence-pack/v1",
    generatedAt: "2026-05-22T10:00:00.000Z",
    activeProject: "AAS Demo Organization",
    snapshot: {
      id: "snapshot-1",
      label: "Uploaded project snapshot",
      sourceType: "uploaded_zip",
      scanTime: "2026-05-22T09:30:00.000Z",
      fileCount: 1,
      acceptedCount: 1,
      rejectedCount: 0,
      unreadableCount: 0,
      unchangedCount: 0,
      newCount: 1,
      modifiedCount: 0,
      deletedCount: 0
    },
    aiLevel: {
      requested: "level_3",
      achieved: "level_2",
      releaseReadiness: "downgrade_required"
    },
    source: {
      summary: "Control Mirror reads only user-authorized evidence.",
      retentionDefault: "metadata_and_excerpts",
      activeModeLabel: "Uploaded snapshot",
      activeModeRetention: "redacted_excerpts"
    },
    report: {
      approvedFramingVersion: "1",
      summaryItems: [],
      requiredApprovals: [],
      blockingGaps: [],
      residualRisks: [],
      recommendedNextStep: "Downgrade the achieved AI level or add missing evidence.",
      executionStatement: "Control Mirror is calculated from existing AAS Companion records.",
      evidenceRetentionSummary: "1 excerpt retained, 1 redacted, 0 metadata-only or omitted."
    },
    evidence: {
      artifacts: [],
      normalizedEvidence: [
        {
          id: "evidence-1",
          artifactId: "artifact-1",
          fileName: "docs/runtime.ts",
          evidenceType: "implementation_evidence",
          label: "Runtime",
          sourceSection: "full-file",
          storyClassification: "not_story_like",
          readinessState: "not_story_like",
          missingReadinessFields: [],
          storyId: null,
          retentionMode: "redacted_excerpts",
          retentionDisclosure: "A redacted source excerpt was retained.",
          redactionApplied: true,
          sensitiveFindingCount: 1
        }
      ]
    },
    findings: {
      conformance: [],
      guardrails: []
    },
    humanReview: {
      summary: {
        open: 0,
        decided: 0,
        deferred: 0,
        superseded: 0,
        openBlocking: 0,
        items: []
      },
      items: []
    },
    safety: {
      rawSourceTextIncluded: false,
      disclosure: "Evidence packs include metadata. Raw source text is not included."
    }
  };
}

function createPersistedExportRecord(format: "json" | "markdown", markdownContent: string | null = null) {
  return {
    id: `export-${format}`,
    organizationId: "org-demo",
    snapshotId: "snapshot-1",
    format,
    schemaVersion: "control-mirror-evidence-pack/v1",
    fileName: `aas-demo-snapshot-1-evidence-pack.${format === "markdown" ? "md" : "json"}`,
    contentType: format === "markdown" ? "text/markdown; charset=utf-8" : "application/json; charset=utf-8",
    payload: createLegacyEvidencePackPayload(),
    markdownContent,
    generatedAt: new Date("2026-05-22T10:00:00.000Z"),
    createdBy: "user-1",
    createdAt: new Date("2026-05-22T10:01:00.000Z"),
    retentionState: "active",
    retentionPolicyLabel: "governance_audit_artifact",
    retentionReviewDueAt: null,
    retentionReviewedAt: null,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null
  };
}

describe("Control Mirror persisted export download service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("enriches legacy JSON payloads with acceptance-required disclosure", async () => {
    getControlMirrorEvidencePackExportRecordByIdMock.mockResolvedValueOnce(createPersistedExportRecord("json"));

    const result = await getPersistedControlMirrorEvidencePackExportService({
      organizationId: "org-demo",
      exportId: "export-json"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const body = JSON.parse(result.data.body);

    expect(body.acceptance).toMatchObject({
      status: "requires_product_security_acceptance",
      shareReadiness: "acceptance_required",
      disclosure: "Evidence packs are generated audit artifacts. Product/Security acceptance is required before broad governance or external sharing."
    });
    expect(body.acceptance.checklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "retention-disclosure-review",
          detail: "1 sensitive finding requires retention disclosure review before broad sharing."
        })
      ])
    );
    expect(result.data.retention).toMatchObject({
      state: "active",
      policyLabel: "governance_audit_artifact"
    });
  });

  it("rebuilds legacy Markdown downloads when the stored body lacks acceptance disclosure", async () => {
    getControlMirrorEvidencePackExportRecordByIdMock.mockResolvedValueOnce(createPersistedExportRecord(
      "markdown",
      "# Control Mirror Evidence Pack\n\nLegacy body without acceptance.\n"
    ));

    const result = await getPersistedControlMirrorEvidencePackExportService({
      organizationId: "org-demo",
      exportId: "export-markdown"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.body).toContain("## Product/Security Acceptance");
    expect(result.data.body).toContain("Product/Security acceptance is required before broad governance or external sharing");
    expect(result.data.body).toContain("1 sensitive finding requires retention disclosure review before broad sharing.");
  });

  it("maps archived export repository records into retention governance API shape", async () => {
    archiveControlMirrorEvidencePackExportRecordMock.mockResolvedValueOnce({
      id: "export-1",
      retentionState: "archived",
      retentionPolicyLabel: "governance_audit_artifact",
      archivedAt: new Date("2026-05-22T12:00:00.000Z"),
      archivedBy: "user-1",
      archiveReason: "Superseded by a newer evidence pack export."
    });

    const result = await archiveControlMirrorEvidencePackExportService({
      organizationId: "org-demo",
      exportId: "export-1",
      actorId: "user-1",
      reason: "Superseded by a newer evidence pack export."
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(archiveControlMirrorEvidencePackExportRecordMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      exportId: "export-1",
      actorId: "user-1",
      reason: "Superseded by a newer evidence pack export."
    });
    expect(result.data).toEqual({
      exportId: "export-1",
      retention: {
        state: "archived",
        policyLabel: "governance_audit_artifact",
        archivedAt: "2026-05-22T12:00:00.000Z",
        archivedBy: "user-1",
        archiveReason: "Superseded by a newer evidence pack export."
      }
    });
  });

  it("maps re-download audit events into API response shape", async () => {
    recordControlMirrorEvidencePackExportDownloadEventMock.mockResolvedValueOnce({
      id: "download-1",
      exportId: "export-1",
      actorId: "user-1",
      createdAt: new Date("2026-05-22T12:15:00.000Z")
    });

    const result = await recordControlMirrorEvidencePackExportDownloadEventService({
      organizationId: "org-demo",
      exportId: "export-1",
      actorId: "user-1"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(recordControlMirrorEvidencePackExportDownloadEventMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      exportId: "export-1",
      actorId: "user-1"
    });
    expect(result.data).toEqual({
      eventId: "download-1",
      exportId: "export-1",
      actorId: "user-1",
      downloadedAt: "2026-05-22T12:15:00.000Z"
    });
  });

  it("fails closed when re-download audit persistence fails", async () => {
    recordControlMirrorEvidencePackExportDownloadEventMock.mockRejectedValueOnce(new Error("Actor is required."));

    const result = await recordControlMirrorEvidencePackExportDownloadEventService({
      organizationId: "org-demo",
      exportId: "export-1",
      actorId: ""
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors[0]).toMatchObject({
      code: "control_mirror_export_download_audit_failed",
      message: "Actor is required."
    });
  });
});
