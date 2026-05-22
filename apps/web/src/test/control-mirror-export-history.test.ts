import { describe, expect, it, vi } from "vitest";
import {
  archiveControlMirrorEvidencePackExportRecord,
  createControlMirrorEvidencePackExportRecord,
  getControlMirrorEvidencePackExportRecordById,
  listControlMirrorEvidencePackExportRecords,
  recordControlMirrorEvidencePackExportAcceptanceDecision,
  recordControlMirrorEvidencePackExportDownloadEvent
} from "@aas-companion/db";

function createEvidencePack() {
  return {
    schemaVersion: "control-mirror-evidence-pack/v1" as const,
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
      requested: "level_3" as const,
      achieved: "level_2" as const,
      releaseReadiness: "downgrade_required" as const
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
      normalizedEvidence: []
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
      rawSourceTextIncluded: false as const,
      disclosure: "Evidence packs include metadata. Raw source text is not included."
    }
  };
}

describe("Control Mirror export history persistence", () => {
  it("creates a tenant-scoped JSON export history record from an evidence pack", async () => {
    const create = vi.fn(async (query) => ({
      id: query.data.id,
      organizationId: query.data.organizationId,
      snapshotId: query.data.snapshotId,
      format: query.data.format,
      schemaVersion: query.data.schemaVersion,
      fileName: query.data.fileName,
      contentType: query.data.contentType,
      generatedAt: query.data.generatedAt,
      retentionState: query.data.retentionState,
      retentionPolicyLabel: query.data.retentionPolicyLabel,
      retentionReviewDueAt: null,
      retentionReviewedAt: null,
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      createdAt: query.data.createdAt
    }));
    const db = {
      controlMirrorEvidencePackExport: {
        create
      }
    };

    const record = await createControlMirrorEvidencePackExportRecord({
      organizationId: "org-1",
      format: "json",
      fileName: "aas-demo-snapshot-1-evidence-pack.json",
      contentType: "application/json; charset=utf-8",
      evidencePack: createEvidencePack(),
      createdBy: "user-1",
      createdAt: new Date("2026-05-22T10:01:00.000Z")
    }, db as never);

    expect(record).toMatchObject({
      organizationId: "org-1",
      snapshotId: "snapshot-1",
      format: "json",
      schemaVersion: "control-mirror-evidence-pack/v1",
      fileName: "aas-demo-snapshot-1-evidence-pack.json",
      contentType: "application/json; charset=utf-8"
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "json",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "aas-demo-snapshot-1-evidence-pack.json",
        contentType: "application/json; charset=utf-8",
        markdownContent: null,
        createdBy: "user-1",
        retentionState: "active",
        retentionPolicyLabel: "governance_audit_artifact",
        generatedAt: new Date("2026-05-22T10:00:00.000Z"),
        createdAt: new Date("2026-05-22T10:01:00.000Z")
      }),
      select: expect.any(Object)
    });
    expect(record.retentionState).toBe("active");
    expect(record.retentionPolicyLabel).toBe("governance_audit_artifact");
    expect(JSON.stringify(create.mock.calls[0]?.[0].data.payload)).not.toContain("retainedExcerpt");
    expect(JSON.stringify(create.mock.calls[0]?.[0].data.payload)).not.toContain("\"content\"");
  });

  it("stores Markdown body for markdown export records", async () => {
    const create = vi.fn(async (query) => query.data);
    const db = {
      controlMirrorEvidencePackExport: {
        create
      }
    };

    await createControlMirrorEvidencePackExportRecord({
      organizationId: "org-1",
      format: "markdown",
      fileName: "aas-demo-snapshot-1-evidence-pack.md",
      contentType: "text/markdown; charset=utf-8",
      evidencePack: createEvidencePack(),
      markdownContent: "# Control Mirror Evidence Pack\n",
      createdBy: null
    }, db as never);

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        format: "markdown",
        markdownContent: "# Control Mirror Evidence Pack\n",
        createdBy: null
      }),
      select: expect.any(Object)
    });
  });

  it("lists recent export records without loading payload bodies", async () => {
    const findMany = vi.fn(async () => []);
    const db = {
      controlMirrorEvidencePackExport: {
        findMany
      }
    };

    await listControlMirrorEvidencePackExportRecords({
      organizationId: "org-1",
      take: 5
    }, db as never);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        organizationId: "org-1"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5,
      select: {
        id: true,
        organizationId: true,
        snapshotId: true,
        format: true,
        schemaVersion: true,
        fileName: true,
        contentType: true,
        generatedAt: true,
        createdBy: true,
        createdAt: true,
        retentionState: true,
        retentionPolicyLabel: true,
        retentionReviewDueAt: true,
        retentionReviewedAt: true,
        archivedAt: true,
        archivedBy: true,
        archiveReason: true,
        acceptanceDecisions: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            exportId: true,
            reviewerRole: true,
            decisionType: true,
            rationale: true,
            actorId: true,
            createdAt: true
          }
        },
        downloadEvents: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1,
          select: {
            id: true,
            exportId: true,
            actorId: true,
            actor: {
              select: {
                fullName: true,
                email: true
              }
            },
            createdAt: true
          }
        }
      }
    });
  });

  it("computes multi-role acceptance readiness from latest reviewer decisions", async () => {
    const findMany = vi.fn(async () => [
      {
        id: "export-pending",
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "json",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "pending.json",
        contentType: "application/json; charset=utf-8",
        generatedAt: new Date("2026-05-22T10:00:00.000Z"),
        createdBy: "user-1",
        createdAt: new Date("2026-05-22T10:01:00.000Z"),
        acceptanceDecisions: [],
        downloadEvents: []
      },
      {
        id: "export-blocked",
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "json",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "blocked.json",
        contentType: "application/json; charset=utf-8",
        generatedAt: new Date("2026-05-22T10:05:00.000Z"),
        createdBy: "user-1",
        createdAt: new Date("2026-05-22T10:06:00.000Z"),
        downloadEvents: [],
        acceptanceDecisions: [
          {
            id: "decision-security-block",
            exportId: "export-blocked",
            reviewerRole: "security_privacy",
            decisionType: "changes_requested",
            rationale: "Retention copy needs review.",
            actorId: "security-1",
            createdAt: new Date("2026-05-22T10:09:00.000Z")
          },
          {
            id: "decision-product-accepted",
            exportId: "export-blocked",
            reviewerRole: "product_owner",
            decisionType: "accepted",
            rationale: "Product copy accepted.",
            actorId: "product-1",
            createdAt: new Date("2026-05-22T10:08:00.000Z")
          }
        ]
      },
      {
        id: "export-ready",
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "markdown",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "ready.md",
        contentType: "text/markdown; charset=utf-8",
        generatedAt: new Date("2026-05-22T10:10:00.000Z"),
        createdBy: "user-1",
        createdAt: new Date("2026-05-22T10:11:00.000Z"),
        downloadEvents: [
          {
            id: "download-ready",
            exportId: "export-ready",
            actorId: "user-2",
            createdAt: new Date("2026-05-22T10:18:00.000Z")
          }
        ],
        acceptanceDecisions: [
          {
            id: "decision-aqa",
            exportId: "export-ready",
            reviewerRole: "aqa",
            decisionType: "accepted",
            rationale: "AQA accepted.",
            actorId: "aqa-1",
            createdAt: new Date("2026-05-22T10:15:00.000Z")
          },
          {
            id: "decision-security-ready",
            exportId: "export-ready",
            reviewerRole: "security_privacy",
            decisionType: "accepted_with_conditions",
            rationale: "Security accepted with conditions.",
            actorId: "security-1",
            createdAt: new Date("2026-05-22T10:14:00.000Z")
          },
          {
            id: "decision-product-ready",
            exportId: "export-ready",
            reviewerRole: "product_owner",
            decisionType: "accepted",
            rationale: "Product accepted.",
            actorId: "product-1",
            createdAt: new Date("2026-05-22T10:13:00.000Z")
          }
        ]
      },
      {
        id: "export-revoked",
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "json",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "revoked.json",
        contentType: "application/json; charset=utf-8",
        generatedAt: new Date("2026-05-22T10:20:00.000Z"),
        createdBy: "user-1",
        createdAt: new Date("2026-05-22T10:21:00.000Z"),
        downloadEvents: [],
        acceptanceDecisions: [
          {
            id: "decision-product-revoked",
            exportId: "export-revoked",
            reviewerRole: "product_owner",
            decisionType: "revoked",
            rationale: "Product acceptance revoked after export context changed.",
            actorId: "product-1",
            createdAt: new Date("2026-05-22T10:25:00.000Z")
          },
          {
            id: "decision-aqa-revoked-record",
            exportId: "export-revoked",
            reviewerRole: "aqa",
            decisionType: "accepted",
            rationale: "AQA accepted.",
            actorId: "aqa-1",
            createdAt: new Date("2026-05-22T10:24:00.000Z")
          },
          {
            id: "decision-security-revoked-record",
            exportId: "export-revoked",
            reviewerRole: "security_privacy",
            decisionType: "accepted",
            rationale: "Security accepted.",
            actorId: "security-1",
            createdAt: new Date("2026-05-22T10:23:00.000Z")
          },
          {
            id: "decision-product-old-accepted",
            exportId: "export-revoked",
            reviewerRole: "product_owner",
            decisionType: "accepted",
            rationale: "Earlier Product acceptance.",
            actorId: "product-1",
            createdAt: new Date("2026-05-22T10:22:00.000Z")
          }
        ]
      }
    ]);
    const db = {
      controlMirrorEvidencePackExport: {
        findMany
      }
    };

    const records = await listControlMirrorEvidencePackExportRecords({
      organizationId: "org-1",
      take: 5
    }, db as never);

    expect(records[0]?.acceptanceSummary).toMatchObject({
      shareReadiness: "acceptance_pending",
      acceptedRoles: [],
      missingRoles: ["product_owner", "security_privacy", "aqa"],
      blockingRoles: []
    });
    expect(records[1]?.acceptanceSummary).toMatchObject({
      shareReadiness: "changes_requested",
      acceptedRoles: ["product_owner"],
      missingRoles: ["aqa"],
      blockingRoles: ["security_privacy"]
    });
    expect(records[2]?.acceptanceSummary).toMatchObject({
      shareReadiness: "share_ready",
      acceptedRoles: ["product_owner", "security_privacy", "aqa"],
      missingRoles: [],
      blockingRoles: []
    });
    expect(records[2]?.acceptanceSummary.latestDecisions.map((decision) => decision.reviewerRole)).toEqual([
      "product_owner",
      "security_privacy",
      "aqa"
    ]);
    expect(records[3]?.acceptanceSummary).toMatchObject({
      shareReadiness: "acceptance_pending",
      acceptedRoles: ["security_privacy", "aqa"],
      missingRoles: ["product_owner"],
      blockingRoles: []
    });
    expect(records[3]?.acceptanceSummary.latestDecisions.find((decision) => decision.reviewerRole === "product_owner")).toMatchObject({
      decisionType: "revoked",
      rationale: "Product acceptance revoked after export context changed."
    });
    expect(records[2]?.latestDownloadEvent).toMatchObject({
      id: "download-ready",
      exportId: "export-ready",
      actorId: "user-2",
      actorDisplayName: "user-2",
      createdAt: new Date("2026-05-22T10:18:00.000Z")
    });
  });

  it("resolves readable actor labels for archived exports and latest re-downloads with id fallback", async () => {
    const findMany = vi.fn(async () => [
      {
        id: "export-resolved",
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "json",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "resolved.json",
        contentType: "application/json; charset=utf-8",
        generatedAt: new Date("2026-05-22T10:00:00.000Z"),
        createdBy: "user-1",
        createdAt: new Date("2026-05-22T10:01:00.000Z"),
        retentionState: "archived",
        retentionPolicyLabel: "governance_audit_artifact",
        retentionReviewDueAt: null,
        retentionReviewedAt: null,
        archivedAt: new Date("2026-05-22T11:00:00.000Z"),
        archivedBy: "archive-user",
        archiveReason: "Superseded.",
        downloadEvents: [
          {
            id: "download-1",
            exportId: "export-resolved",
            actorId: "download-user",
            actor: {
              fullName: "Dana Download",
              email: "dana@example.com"
            },
            createdAt: new Date("2026-05-22T11:10:00.000Z")
          }
        ],
        acceptanceDecisions: []
      },
      {
        id: "export-fallback",
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "markdown",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "fallback.md",
        contentType: "text/markdown; charset=utf-8",
        generatedAt: new Date("2026-05-22T10:20:00.000Z"),
        createdBy: "user-1",
        createdAt: new Date("2026-05-22T10:21:00.000Z"),
        retentionState: "archived",
        retentionPolicyLabel: "governance_audit_artifact",
        retentionReviewDueAt: null,
        retentionReviewedAt: null,
        archivedAt: new Date("2026-05-22T11:20:00.000Z"),
        archivedBy: "missing-archive-user",
        archiveReason: "Superseded.",
        downloadEvents: [
          {
            id: "download-2",
            exportId: "export-fallback",
            actorId: "download-user-without-profile",
            actor: {
              fullName: null,
              email: null
            },
            createdAt: new Date("2026-05-22T11:25:00.000Z")
          }
        ],
        acceptanceDecisions: []
      }
    ]);
    const appUserFindMany = vi.fn(async () => [
      {
        id: "archive-user",
        fullName: "Alex Archive",
        email: "alex@example.com"
      }
    ]);
    const db = {
      controlMirrorEvidencePackExport: {
        findMany
      },
      appUser: {
        findMany: appUserFindMany
      }
    };

    const records = await listControlMirrorEvidencePackExportRecords({
      organizationId: "org-1",
      take: 5
    }, db as never);

    expect(appUserFindMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["archive-user", "missing-archive-user"]
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    });
    expect(records[0]?.archivedByDisplayName).toBe("Alex Archive");
    expect(records[0]?.latestDownloadEvent?.actorDisplayName).toBe("Dana Download");
    expect(records[1]?.archivedByDisplayName).toBe("missing-archive-user");
    expect(records[1]?.latestDownloadEvent?.actorDisplayName).toBe("download-user-without-profile");
  });

  it("records an acceptance decision in a tenant-scoped transaction", async () => {
    const findFirst = vi.fn(async (query) => {
      expect(query.where).toMatchObject({
        id: "export-1",
        organizationId: "org-1"
      });

      return {
        id: "export-1"
      };
    });
    const create = vi.fn(async (query) => {
      expect(query.data).toMatchObject({
        organizationId: "org-1",
        exportId: "export-1",
        reviewerRole: "security_privacy",
        decisionType: "accepted_with_conditions",
        rationale: "Accepted for governance sharing after retention disclosure review.",
        actorId: "user-1"
      });

      return {
        id: "decision-1",
        exportId: "export-1",
        reviewerRole: "security_privacy",
        decisionType: "accepted_with_conditions",
        rationale: "Accepted for governance sharing after retention disclosure review.",
        actorId: "user-1",
        createdAt: new Date("2026-05-22T11:00:00.000Z")
      };
    });
    const db = {
      $transaction: vi.fn(async (callback) =>
        callback({
          controlMirrorEvidencePackExport: {
            findFirst
          },
          controlMirrorEvidencePackExportAcceptanceDecision: {
            create
          }
        })
      )
    };

    const decision = await recordControlMirrorEvidencePackExportAcceptanceDecision({
      organizationId: "org-1",
      exportId: "export-1",
      reviewerRole: "security_privacy",
      decisionType: "accepted_with_conditions",
      rationale: "Accepted for governance sharing after retention disclosure review.",
      actorId: "user-1"
    }, db as never);

    expect(decision).toMatchObject({
      id: "decision-1",
      exportId: "export-1",
      reviewerRole: "security_privacy",
      decisionType: "accepted_with_conditions"
    });
    expect(findFirst).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
  });

  it("rejects acceptance decision recording without actor or rationale", async () => {
    const db = {
      $transaction: vi.fn()
    };

    await expect(
      recordControlMirrorEvidencePackExportAcceptanceDecision({
        organizationId: "org-1",
        exportId: "export-1",
        reviewerRole: "product_owner",
        decisionType: "accepted",
        rationale: "Looks good.",
        actorId: ""
      }, db as never)
    ).rejects.toThrow("human actor");

    await expect(
      recordControlMirrorEvidencePackExportAcceptanceDecision({
        organizationId: "org-1",
        exportId: "export-1",
        reviewerRole: "product_owner",
        decisionType: "accepted",
        rationale: " ",
        actorId: "user-1"
      }, db as never)
    ).rejects.toThrow("Acceptance decision rationale");

    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("records a re-download audit event in a tenant-scoped transaction", async () => {
    const findFirst = vi.fn(async (query) => {
      expect(query.where).toMatchObject({
        id: "export-1",
        organizationId: "org-1"
      });

      return {
        id: "export-1"
      };
    });
    const create = vi.fn(async (query) => {
      expect(query.data).toMatchObject({
        organizationId: "org-1",
        exportId: "export-1",
        actorId: "user-1",
        createdAt: new Date("2026-05-22T12:15:00.000Z")
      });
      expect(query.data.id).toEqual(expect.any(String));

      return {
        id: "download-1",
        exportId: "export-1",
        actorId: "user-1",
        createdAt: new Date("2026-05-22T12:15:00.000Z")
      };
    });
    const db = {
      $transaction: vi.fn(async (callback) =>
        callback({
          controlMirrorEvidencePackExport: {
            findFirst
          },
          controlMirrorEvidencePackExportDownloadEvent: {
            create
          }
        })
      )
    };

    const event = await recordControlMirrorEvidencePackExportDownloadEvent({
      organizationId: "org-1",
      exportId: "export-1",
      actorId: "user-1",
      createdAt: new Date("2026-05-22T12:15:00.000Z")
    }, db as never);

    expect(event).toMatchObject({
      id: "download-1",
      exportId: "export-1",
      actorId: "user-1",
      createdAt: new Date("2026-05-22T12:15:00.000Z")
    });
    expect(findFirst).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
  });

  it("rejects re-download audit recording without a human actor", async () => {
    const db = {
      $transaction: vi.fn()
    };

    await expect(
      recordControlMirrorEvidencePackExportDownloadEvent({
        organizationId: "org-1",
        exportId: "export-1",
        actorId: ""
      }, db as never)
    ).rejects.toThrow("human actor");

    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("archives a persisted export in organization scope with actor and reason", async () => {
    const findFirst = vi.fn(async (query) => {
      expect(query.where).toMatchObject({
        id: "export-1",
        organizationId: "org-1"
      });

      return {
        id: "export-1"
      };
    });
    const update = vi.fn(async (query) => {
      expect(query.where).toEqual({
        id: "export-1"
      });
      expect(query.data).toMatchObject({
        retentionState: "archived",
        archivedAt: new Date("2026-05-22T12:00:00.000Z"),
        archivedBy: "user-1",
        archiveReason: "Superseded by a newer accepted export."
      });

      return {
        id: "export-1",
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        format: "json",
        schemaVersion: "control-mirror-evidence-pack/v1",
        fileName: "aas-demo-snapshot-1-evidence-pack.json",
        contentType: "application/json; charset=utf-8",
        generatedAt: new Date("2026-05-22T10:00:00.000Z"),
        createdBy: "user-1",
        createdAt: new Date("2026-05-22T10:01:00.000Z"),
        retentionState: "archived",
        retentionPolicyLabel: "governance_audit_artifact",
        retentionReviewDueAt: null,
        retentionReviewedAt: null,
        archivedAt: new Date("2026-05-22T12:00:00.000Z"),
        archivedBy: "user-1",
        archiveReason: "Superseded by a newer accepted export."
      };
    });
    const db = {
      $transaction: vi.fn(async (callback) =>
        callback({
          controlMirrorEvidencePackExport: {
            findFirst,
            update
          }
        })
      )
    };

    const record = await archiveControlMirrorEvidencePackExportRecord({
      organizationId: "org-1",
      exportId: "export-1",
      actorId: "user-1",
      reason: " Superseded by a newer accepted export. ",
      archivedAt: new Date("2026-05-22T12:00:00.000Z")
    }, db as never);

    expect(record).toMatchObject({
      id: "export-1",
      retentionState: "archived",
      archivedBy: "user-1",
      archiveReason: "Superseded by a newer accepted export."
    });
    expect(findFirst).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it("rejects export archive without actor or reason", async () => {
    const db = {
      $transaction: vi.fn()
    };

    await expect(
      archiveControlMirrorEvidencePackExportRecord({
        organizationId: "org-1",
        exportId: "export-1",
        actorId: "",
        reason: "Archive it."
      }, db as never)
    ).rejects.toThrow("human actor");

    await expect(
      archiveControlMirrorEvidencePackExportRecord({
        organizationId: "org-1",
        exportId: "export-1",
        actorId: "user-1",
        reason: " "
      }, db as never)
    ).rejects.toThrow("Archive reason");

    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("loads a persisted export by id only within the organization scope", async () => {
    const findFirst = vi.fn(async () => null);
    const db = {
      controlMirrorEvidencePackExport: {
        findFirst
      }
    };

    await getControlMirrorEvidencePackExportRecordById({
      organizationId: "org-1",
      exportId: "export-1"
    }, db as never);

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "export-1",
        organizationId: "org-1"
      },
      select: {
        id: true,
        organizationId: true,
        snapshotId: true,
        format: true,
        schemaVersion: true,
        fileName: true,
        contentType: true,
        payload: true,
        markdownContent: true,
        generatedAt: true,
        createdBy: true,
        createdAt: true,
        retentionState: true,
        retentionPolicyLabel: true,
        retentionReviewDueAt: true,
        retentionReviewedAt: true,
        archivedAt: true,
        archivedBy: true,
        archiveReason: true
      }
    });
  });
});
