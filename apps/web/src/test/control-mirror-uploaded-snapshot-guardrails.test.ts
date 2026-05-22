import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createControlMirrorUploadedSnapshot } from "@aas-companion/db";
import {
  normalizeControlMirrorUploadedSnapshotPath,
  validateControlMirrorUploadedSnapshotFiles
} from "@aas-companion/domain";

describe("Control Mirror uploaded snapshot guardrails", () => {
  function sha256(content: string) {
    return createHash("sha256").update(content).digest("hex");
  }

  it("rejects unsafe paths before uploaded snapshot processing", () => {
    expect(normalizeControlMirrorUploadedSnapshotPath("../secrets.env")).toMatchObject({
      ok: false,
      reason: "path_traversal"
    });
    expect(normalizeControlMirrorUploadedSnapshotPath("C:\\repo\\secret.md")).toMatchObject({
      ok: false,
      reason: "absolute_path"
    });
    expect(normalizeControlMirrorUploadedSnapshotPath("/var/log/app.log")).toMatchObject({
      ok: false,
      reason: "absolute_path"
    });
  });

  it("accepts safe evidence files and rejects unsupported or unreadable files", () => {
    const result = validateControlMirrorUploadedSnapshotFiles([
      {
        path: "docs/control-report.md",
        content: "# Final report\nStory CM-01.1",
        sizeBytes: 28
      },
      {
        path: "scripts/run.exe",
        content: "binary"
      },
      {
        path: "logs/build.log",
        content: null
      }
    ]);

    expect(result.accepted).toHaveLength(1);
    expect(result.accepted[0]).toMatchObject({
      normalizedPath: "docs/control-report.md",
      fileName: "control-report.md",
      extension: "md",
      sizeBytes: 28
    });
    expect(result.rejected).toEqual([
      {
        originalPath: "scripts/run.exe",
        normalizedPath: "scripts/run.exe",
        reason: "unsupported_extension"
      }
    ]);
    expect(result.unreadable).toEqual([
      {
        originalPath: "logs/build.log",
        normalizedPath: "logs/build.log",
        reason: "unreadable"
      }
    ]);
  });

  it("persists safe uploaded files and summarizes rejected and unreadable files", async () => {
    const source = {
      id: "source-1",
      sourceType: "uploaded_zip"
    };
    const snapshot = {
      id: "snapshot-1"
    };
    const artifactCreateMany = vi.fn(async (query) => {
      expect(query.data).toHaveLength(2);
      expect(query.data[0]).toMatchObject({
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        filePath: "docs/control-report.md",
        fileName: "control-report.md",
        extension: "md",
        changeStatus: "new",
        parsingStatus: "parsed",
        sourceExcerpt: "# Final report\nStory CM-01.1\nTOKEN=[REDACTED]"
      });
      expect(query.data[0].sourceExcerpt).not.toContain("super-secret");
      expect(query.data[0].parsedJson.evidenceRetention).toMatchObject({
        retentionMode: "redacted_excerpts",
        redactionApplied: true,
        sensitiveFindingCount: 1,
        humanReviewRecommended: true
      });
      expect(query.data[1]).toMatchObject({
        filePath: "logs/build.log",
        changeStatus: "unreadable",
        parsingStatus: "unreadable"
      });

      return {
        count: 2
      };
    });
    const evidenceCreateMany = vi.fn(async (query) => {
      expect(query.data).toHaveLength(1);
      expect(query.data[0]).toMatchObject({
        organizationId: "org-1",
        snapshotId: "snapshot-1",
        sourceFileId: "uploaded:docs/control-report.md",
        sourceExcerpt: "# Final report\nStory CM-01.1\nTOKEN=[REDACTED]",
        lineageJson: {
          evidenceRetention: {
            retentionMode: "redacted_excerpts",
            redactionApplied: true,
            sensitiveFindingCount: 1,
            humanReviewRecommended: true,
            disclosure: "A redacted source excerpt was retained."
          }
        }
      });

      return {
        count: 1
      };
    });
    const update = vi.fn(async (query) => {
      expect(query.data).toMatchObject({
        status: "completed",
        fileCount: 2,
        newCount: 1,
        unreadableCount: 1,
        summaryJson: {
          sourceType: "uploaded_zip",
          acceptedCount: 1,
          rejectedCount: 1,
          unreadableCount: 1
        }
      });

      return {
        id: "snapshot-1",
        ...query.data
      };
    });
    const tx = {
      organization: {
        findUnique: vi.fn(async () => ({
          id: "org-1"
        }))
      },
      controlMirrorSource: {
        findFirst: vi.fn(async () => source),
        create: vi.fn()
      },
      controlMirrorSnapshot: {
        findFirst: vi.fn(async () => null),
        create: vi.fn(async () => snapshot),
        update
      },
      controlMirrorArtifact: {
        createMany: artifactCreateMany
      },
      controlMirrorNormalizedEvidence: {
        createMany: evidenceCreateMany
      }
    };
    const db = {
      $transaction: vi.fn(async (callback) => callback(tx))
    };

    const result = await createControlMirrorUploadedSnapshot({
      organizationId: "org-1",
      label: "Uploaded test snapshot",
      files: [
        {
          path: "docs/control-report.md",
          content: "# Final report\nStory CM-01.1\nTOKEN=super-secret"
        },
        {
          path: "../secret.env",
          content: "TOKEN=secret"
        },
        {
          path: "logs/build.log",
          content: null
        }
      ]
    }, db as never);

    expect(result).toMatchObject({
      id: "snapshot-1",
      status: "completed",
      fileCount: 2,
      unreadableCount: 1
    });
    expect(tx.controlMirrorSource.create).not.toHaveBeenCalled();
    expect(artifactCreateMany).toHaveBeenCalledOnce();
    expect(evidenceCreateMany).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it("classifies uploaded snapshot refresh changes against the previous snapshot", async () => {
    const source = {
      id: "source-1",
      sourceType: "uploaded_zip"
    };
    const snapshot = {
      id: "snapshot-2"
    };
    const previousSnapshot = {
      id: "snapshot-1",
      artifacts: [
        {
          sourceFileId: "uploaded:docs/unchanged.md",
          filePath: "docs/unchanged.md",
          fileName: "unchanged.md",
          extension: "md",
          sizeBytes: 9,
          sourceHash: sha256("Same file"),
          lastModifiedAt: new Date("2026-05-20T10:00:00.000Z"),
          artifactType: "final_report",
          parsingConfidence: "medium",
          detectedOutcomeKey: null,
          detectedEpicKey: null,
          detectedStoryKey: "CM-01.1",
          detectedAiLevel: null,
          lineageStatus: "traced",
          sourceExcerpt: "Same file",
          parsedJson: null
        },
        {
          sourceFileId: "uploaded:docs/changed.md",
          filePath: "docs/changed.md",
          fileName: "changed.md",
          extension: "md",
          sizeBytes: 8,
          sourceHash: sha256("Old file"),
          lastModifiedAt: new Date("2026-05-20T10:00:00.000Z"),
          artifactType: "final_report",
          parsingConfidence: "medium",
          detectedOutcomeKey: null,
          detectedEpicKey: null,
          detectedStoryKey: "CM-01.1",
          detectedAiLevel: null,
          lineageStatus: "traced",
          sourceExcerpt: "Old file",
          parsedJson: null
        },
        {
          sourceFileId: "uploaded:docs/deleted.md",
          filePath: "docs/deleted.md",
          fileName: "deleted.md",
          extension: "md",
          sizeBytes: 12,
          sourceHash: sha256("Deleted file"),
          lastModifiedAt: new Date("2026-05-20T10:00:00.000Z"),
          artifactType: "decision_log",
          parsingConfidence: "medium",
          detectedOutcomeKey: null,
          detectedEpicKey: null,
          detectedStoryKey: null,
          detectedAiLevel: null,
          lineageStatus: "weak",
          sourceExcerpt: "Deleted file",
          parsedJson: null
        }
      ]
    };
    const artifactCreateMany = vi.fn(async (query) => {
      const byPath = new Map(query.data.map((row: { filePath: string; changeStatus: string }) => [row.filePath, row.changeStatus]));

      expect(byPath.get("docs/unchanged.md")).toBe("unchanged");
      expect(byPath.get("docs/changed.md")).toBe("modified");
      expect(byPath.get("docs/new.md")).toBe("new");
      expect(byPath.get("docs/deleted.md")).toBe("deleted");

      return {
        count: query.data.length
      };
    });
    const update = vi.fn(async (query) => {
      expect(query.data).toMatchObject({
        fileCount: 4,
        unchangedCount: 1,
        newCount: 1,
        modifiedCount: 1,
        deletedCount: 1,
        unreadableCount: 0,
        summaryJson: {
          unchangedCount: 1,
          newCount: 1,
          modifiedCount: 1,
          deletedCount: 1
        }
      });

      return {
        id: "snapshot-2",
        ...query.data
      };
    });
    const tx = {
      organization: {
        findUnique: vi.fn(async () => ({
          id: "org-1"
        }))
      },
      controlMirrorSource: {
        findFirst: vi.fn(async () => source),
        create: vi.fn()
      },
      controlMirrorSnapshot: {
        findFirst: vi.fn(async () => previousSnapshot),
        create: vi.fn(async () => snapshot),
        update
      },
      controlMirrorArtifact: {
        createMany: artifactCreateMany
      },
      controlMirrorNormalizedEvidence: {
        createMany: vi.fn(async (query) => ({
          count: query.data.length
        }))
      }
    };
    const db = {
      $transaction: vi.fn(async (callback) => callback(tx))
    };

    await createControlMirrorUploadedSnapshot({
      organizationId: "org-1",
      files: [
        {
          path: "docs/unchanged.md",
          content: "Same file"
        },
        {
          path: "docs/changed.md",
          content: "New file"
        },
        {
          path: "docs/new.md",
          content: "Brand new"
        }
      ]
    }, db as never);

    expect(artifactCreateMany).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it("classifies repeated identical uploaded files as unchanged", async () => {
    const source = {
      id: "source-1",
      sourceType: "uploaded_zip"
    };
    const snapshot = {
      id: "snapshot-2"
    };
    const previousSnapshot = {
      id: "snapshot-1",
      artifacts: [
        {
          sourceFileId: "uploaded:docs/repeated.md",
          filePath: "docs/repeated.md",
          fileName: "repeated.md",
          extension: "md",
          sizeBytes: 9,
          sourceHash: sha256("Same file"),
          lastModifiedAt: new Date("2026-05-20T10:00:00.000Z"),
          artifactType: "final_report",
          parsingConfidence: "medium",
          detectedOutcomeKey: null,
          detectedEpicKey: null,
          detectedStoryKey: "CM-01.1",
          detectedAiLevel: null,
          lineageStatus: "traced",
          sourceExcerpt: "Same file",
          parsedJson: null
        }
      ]
    };
    const artifactCreateMany = vi.fn(async (query) => {
      expect(query.data).toHaveLength(1);
      expect(query.data[0]).toMatchObject({
        sourceFileId: "uploaded:docs/repeated.md",
        filePath: "docs/repeated.md",
        changeStatus: "unchanged"
      });

      return {
        count: 1
      };
    });
    const update = vi.fn(async (query) => {
      expect(query.data).toMatchObject({
        fileCount: 1,
        unchangedCount: 1,
        newCount: 0,
        modifiedCount: 0,
        deletedCount: 0
      });

      return {
        id: "snapshot-2",
        ...query.data
      };
    });
    const tx = {
      organization: {
        findUnique: vi.fn(async () => ({
          id: "org-1"
        }))
      },
      controlMirrorSource: {
        findFirst: vi.fn(async () => source),
        create: vi.fn()
      },
      controlMirrorSnapshot: {
        findFirst: vi.fn(async () => previousSnapshot),
        create: vi.fn(async () => snapshot),
        update
      },
      controlMirrorArtifact: {
        createMany: artifactCreateMany
      },
      controlMirrorNormalizedEvidence: {
        createMany: vi.fn(async (query) => ({
          count: query.data.length
        }))
      }
    };
    const db = {
      $transaction: vi.fn(async (callback) => callback(tx))
    };

    await createControlMirrorUploadedSnapshot({
      organizationId: "org-1",
      files: [
        {
          path: "docs/repeated.md",
          content: "Same file"
        }
      ]
    }, db as never);

    expect(artifactCreateMany).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });
});
