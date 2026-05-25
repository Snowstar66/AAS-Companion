import { createHash, randomUUID } from "node:crypto";
import { ControlMirrorArtifactChangeStatus, Prisma } from "../../generated/client";
import {
  applyControlMirrorEvidenceRetentionPolicy,
  classifyControlMirrorArtifact,
  getControlMirrorRetentionModeForSourceType,
  normalizeControlMirrorArtifactEvidence,
  validateControlMirrorUploadedSnapshotFiles,
  type ControlMirrorEvidenceRetentionDecision,
  type ControlMirrorArtifactType,
  type ControlMirrorUploadedSnapshotFileInput
} from "@aas-companion/domain";
import { prisma } from "../client";

type DbClient = Prisma.TransactionClient | typeof prisma;

function createHashForContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function createRetentionMetadata(retention: ControlMirrorEvidenceRetentionDecision) {
  return {
    retentionMode: retention.retentionMode,
    redactionApplied: retention.redactionApplied,
    sensitiveFindingCount: retention.sensitiveFindingCount,
    humanReviewRecommended: retention.humanReviewRecommended,
    disclosure: retention.disclosure
  };
}

function readRetentionMetadata(value: unknown): Prisma.InputJsonValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return "evidenceRetention" in value ? value.evidenceRetention as Prisma.InputJsonValue : null;
}

function applyRetentionPolicy(content: string, sourceType: string) {
  return applyControlMirrorEvidenceRetentionPolicy({
    content,
    retentionMode: getControlMirrorRetentionModeForSourceType(sourceType)
  });
}

function detectStoryKey(value: string) {
  return /\b(?:CM|STR|STORY|M\d+-STORY)-\d+(?:\.\d+)?\b/i.exec(value)?.[0] ?? null;
}

function detectAiLevel(value: string) {
  if (/\blevel\s*3\b|\blevel_3\b/i.test(value)) return "level_3" as const;
  if (/\blevel\s*2\b|\blevel_2\b/i.test(value)) return "level_2" as const;
  if (/\blevel\s*1\b|\blevel_1\b/i.test(value)) return "level_1" as const;
  return null;
}

async function getOrCreateCurrentImportsSource(input: {
  organizationId: string;
  actorId?: string | null;
}, db: DbClient = prisma) {
  const existing = await db.controlMirrorSource.findFirst({
    where: {
      organizationId: input.organizationId,
      sourceType: "current_imports"
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  if (existing) {
    return existing;
  }

  return db.controlMirrorSource.create({
    data: {
      id: randomUUID(),
      organizationId: input.organizationId,
      label: "Current Import artifacts",
      sourceType: "current_imports",
      supportStatus: "active",
      sourceReference: "artifact_intake_sessions",
      refreshSupported: true,
      createdBy: input.actorId ?? null
    }
  });
}

async function getOrCreateUploadedZipSource(input: {
  organizationId: string;
  actorId?: string | null;
  label?: string | null;
}, db: DbClient = prisma) {
  const existing = await db.controlMirrorSource.findFirst({
    where: {
      organizationId: input.organizationId,
      sourceType: "uploaded_zip"
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  if (existing) {
    return existing;
  }

  return db.controlMirrorSource.create({
    data: {
      id: randomUUID(),
      organizationId: input.organizationId,
      label: input.label?.trim() || "Uploaded project snapshot",
      sourceType: "uploaded_zip",
      supportStatus: "active",
      sourceReference: "uploaded_snapshot",
      refreshSupported: false,
      createdBy: input.actorId ?? null
    }
  });
}

export async function createControlMirrorUploadedSnapshot(input: {
  organizationId: string;
  actorId?: string | null;
  label?: string | null;
  files: ControlMirrorUploadedSnapshotFileInput[];
}, db: typeof prisma = prisma) {
  const validation = validateControlMirrorUploadedSnapshotFiles(input.files);

  return db.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: {
        id: input.organizationId
      },
      select: {
        id: true
      }
    });

    if (!organization) {
      throw new Error("The selected project is no longer available.");
    }

    const source = await getOrCreateUploadedZipSource(input, tx);
    const previousSnapshot = await tx.controlMirrorSnapshot.findFirst({
      where: {
        organizationId: input.organizationId,
        sourceId: source.id,
        status: "completed"
      },
      orderBy: {
        scanCompletedAt: "desc"
      },
      include: {
        artifacts: true
      }
    });
    const previousByPath = new Map(previousSnapshot?.artifacts.map((artifact) => [artifact.filePath, artifact]) ?? []);
    const scanStartedAt = new Date();
    const snapshot = await tx.controlMirrorSnapshot.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        sourceId: source.id,
        label: input.label?.trim() || `Uploaded snapshot ${scanStartedAt.toISOString().slice(0, 16).replace("T", " ")}`,
        status: "scanning",
        scanStartedAt
      }
    });
    const seenPaths = new Set<string>();
    let unchangedCount = 0;
    let newCount = 0;
    let modifiedCount = 0;

    const artifactRows = validation.accepted.map((file) => {
      const retention = applyRetentionPolicy(file.content, source.sourceType);
      const sourceHash = createHashForContent(file.content);
      const previous = previousByPath.get(file.normalizedPath);
      const changeStatus: ControlMirrorArtifactChangeStatus = !previous
        ? "new"
        : previous.sourceHash === sourceHash
          ? "unchanged"
          : "modified";
      const artifactType = classifyControlMirrorArtifact({
        fileName: file.fileName,
        content: retention.retainedExcerpt ?? file.content
      });
      const storyKey = detectStoryKey(`${file.fileName}\n${file.content}`);
      const implementationLike = artifactType === "implementation_note" || artifactType === "test_evidence";

      seenPaths.add(file.normalizedPath);
      if (changeStatus === "unchanged") unchangedCount += 1;
      if (changeStatus === "new") newCount += 1;
      if (changeStatus === "modified") modifiedCount += 1;

      return {
        id: randomUUID(),
        organizationId: input.organizationId,
        snapshotId: snapshot.id,
        sourceFileId: `uploaded:${file.normalizedPath}`,
        filePath: file.normalizedPath,
        fileName: file.fileName,
        extension: file.extension,
        sizeBytes: file.sizeBytes,
        sourceHash,
        lastModifiedAt: file.lastModifiedAt ? new Date(file.lastModifiedAt) : scanStartedAt,
        artifactType,
        parsingStatus: "parsed" as const,
        parsingConfidence: "medium" as const,
        detectedStoryKey: storyKey,
        detectedAiLevel: detectAiLevel(file.content),
        lineageStatus: storyKey ? "traced" as const : implementationLike ? "missing" as const : "weak" as const,
        changeStatus,
        sourceExcerpt: retention.retainedExcerpt,
        parsedJson: {
          evidenceRetention: createRetentionMetadata(retention)
        }
      };
    });
    const unreadableRows = validation.unreadable.map((file) => {
      const filePath = file.normalizedPath ?? file.originalPath;
      const fileName = filePath.split(/[\\/]/).pop() ?? filePath;
      const extension = /\.[^.]+$/.exec(fileName)?.[0]?.slice(1).toLowerCase() ?? "";

      seenPaths.add(filePath);

      return {
        id: randomUUID(),
        organizationId: input.organizationId,
        snapshotId: snapshot.id,
        sourceFileId: `uploaded:${filePath}`,
        filePath,
        fileName,
        extension,
        sizeBytes: 0,
        sourceHash: "unreadable",
        lastModifiedAt: scanStartedAt,
        artifactType: "unknown_artifact" as const,
        parsingStatus: "unreadable" as const,
        parsingConfidence: "low" as const,
        lineageStatus: "missing" as const,
        changeStatus: "unreadable" as const,
        sourceExcerpt: "",
        parsedJson: Prisma.JsonNull
      };
    });
    const deletedRows = [...previousByPath.values()]
      .filter((artifact) => !seenPaths.has(artifact.filePath))
      .map((artifact) => ({
        id: randomUUID(),
        organizationId: input.organizationId,
        snapshotId: snapshot.id,
        sourceFileId: artifact.sourceFileId,
        filePath: artifact.filePath,
        fileName: artifact.fileName,
        extension: artifact.extension,
        sizeBytes: artifact.sizeBytes,
        sourceHash: artifact.sourceHash,
        lastModifiedAt: artifact.lastModifiedAt,
        artifactType: artifact.artifactType,
        parsingStatus: "skipped" as const,
        parsingConfidence: artifact.parsingConfidence,
        detectedOutcomeKey: artifact.detectedOutcomeKey,
        detectedEpicKey: artifact.detectedEpicKey,
        detectedStoryKey: artifact.detectedStoryKey,
        detectedAiLevel: artifact.detectedAiLevel,
        lineageStatus: artifact.lineageStatus,
        changeStatus: "deleted" as const,
        sourceExcerpt: artifact.sourceExcerpt,
        parsedJson: artifact.parsedJson ?? Prisma.JsonNull
      }));
    const allArtifactRows = [...artifactRows, ...unreadableRows, ...deletedRows];

    if (allArtifactRows.length > 0) {
      await tx.controlMirrorArtifact.createMany({
        data: allArtifactRows
      });
    }

    if (artifactRows.length > 0) {
      await tx.controlMirrorNormalizedEvidence.createMany({
        data: artifactRows.flatMap((artifact) => {
          const sourceFile = validation.accepted.find((file) => `uploaded:${file.normalizedPath}` === artifact.sourceFileId);
          const normalizedItems = normalizeControlMirrorArtifactEvidence({
            artifactId: artifact.id,
            fileName: artifact.fileName,
            artifactType: artifact.artifactType as ControlMirrorArtifactType,
            ...(sourceFile?.content === undefined ? {} : { content: sourceFile.content }),
            sourceExcerpt: artifact.sourceExcerpt,
            storyId: artifact.detectedStoryKey
          });

          return normalizedItems.map((normalized) => ({
            id: randomUUID(),
            organizationId: input.organizationId,
            snapshotId: snapshot.id,
            artifactId: artifact.id,
            sourceFileId: artifact.sourceFileId,
            evidenceType: normalized.evidenceType,
            label: normalized.label,
            sourceSection: normalized.sourceSection,
            sourceExcerpt: artifact.sourceExcerpt,
            storyClassification: normalized.storyClassification,
            readinessState: normalized.readinessState,
            missingReadinessFields: normalized.missingReadinessFields,
            detectedStoryKey: normalized.storyId,
            lineageJson: {
              sourceType: source.sourceType,
              snapshotId: snapshot.id,
              artifactId: artifact.id,
              sourceFileId: artifact.sourceFileId,
              filePath: artifact.filePath,
              evidenceRetention: artifact.parsedJson.evidenceRetention
            }
          }));
        })
      });
    }

    return tx.controlMirrorSnapshot.update({
      where: {
        id: snapshot.id
      },
      data: {
        status: "completed",
        scanCompletedAt: new Date(),
        fileCount: allArtifactRows.length,
        unchangedCount,
        newCount,
        modifiedCount,
        deletedCount: deletedRows.length,
        unreadableCount: validation.unreadableCount,
        summaryJson: {
          sourceType: source.sourceType,
          acceptedCount: validation.acceptedCount,
          rejectedCount: validation.rejectedCount,
          unreadableCount: validation.unreadableCount,
          unchangedCount,
          newCount,
          modifiedCount,
          deletedCount: deletedRows.length,
          rejectedFiles: validation.rejected
        }
      },
      include: {
        artifacts: {
          orderBy: [{ changeStatus: "asc" }, { filePath: "asc" }]
        },
        normalizedEvidence: {
          orderBy: [{ readinessState: "asc" }, { evidenceType: "asc" }, { label: "asc" }]
        },
        source: true
      }
    });
  });
}

export async function refreshControlMirrorCurrentImportsSnapshot(input: {
  organizationId: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: {
        id: input.organizationId
      },
      select: {
        id: true
      }
    });

    if (!organization) {
      throw new Error("The selected project is no longer available.");
    }

    const source = await getOrCreateCurrentImportsSource(input, tx);
    const previousSnapshot = await tx.controlMirrorSnapshot.findFirst({
      where: {
        organizationId: input.organizationId,
        sourceId: source.id,
        status: "completed"
      },
      orderBy: {
        scanCompletedAt: "desc"
      },
      include: {
        artifacts: true
      }
    });
    const previousByPath = new Map(previousSnapshot?.artifacts.map((artifact) => [artifact.filePath, artifact]) ?? []);
    const files = await tx.artifactIntakeFile.findMany({
      where: {
        organizationId: input.organizationId
      },
      orderBy: [{ uploadedAt: "asc" }, { fileName: "asc" }],
      select: {
        id: true,
        intakeSessionId: true,
        fileName: true,
        extension: true,
        sizeBytes: true,
        content: true,
        sourceType: true,
        sourceTypeConfidence: true,
        parsedAt: true,
        uploadedAt: true
      }
    });
    const scanStartedAt = new Date();
    const snapshot = await tx.controlMirrorSnapshot.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        sourceId: source.id,
        label: `Current imports ${scanStartedAt.toISOString().slice(0, 16).replace("T", " ")}`,
        status: "scanning",
        scanStartedAt
      }
    });
    const seenPaths = new Set<string>();
    let unchangedCount = 0;
    let newCount = 0;
    let modifiedCount = 0;

    const artifactRows = files.map((file) => {
      const filePath = `artifact-intake/${file.intakeSessionId}/${file.fileName}`;
      const sourceHash = createHashForContent(file.content);
      const retention = applyRetentionPolicy(file.content, source.sourceType);
      const previous = previousByPath.get(filePath);
      const changeStatus: ControlMirrorArtifactChangeStatus = !previous
        ? "new"
        : previous.sourceHash === sourceHash
          ? "unchanged"
          : "modified";
      const artifactType = classifyControlMirrorArtifact({
        fileName: file.fileName,
        sourceType: file.sourceType,
        content: retention.retainedExcerpt ?? file.content
      });
      const storyKey = detectStoryKey(`${file.fileName}\n${file.content}`);
      const implementationLike = artifactType === "implementation_note" || artifactType === "test_evidence";

      seenPaths.add(filePath);

      if (changeStatus === "unchanged") unchangedCount += 1;
      if (changeStatus === "new") newCount += 1;
      if (changeStatus === "modified") modifiedCount += 1;

      return {
        id: randomUUID(),
        organizationId: input.organizationId,
        snapshotId: snapshot.id,
        sourceFileId: file.id,
        filePath,
        fileName: file.fileName,
        extension: file.extension,
        sizeBytes: file.sizeBytes,
        sourceHash,
        lastModifiedAt: file.uploadedAt,
        artifactType,
        parsingStatus: file.parsedAt ? "parsed" as const : "pending" as const,
        parsingConfidence: file.sourceTypeConfidence ?? ("medium" as const),
        detectedStoryKey: storyKey,
        detectedAiLevel: detectAiLevel(file.content),
        lineageStatus: storyKey ? "traced" as const : implementationLike ? "missing" as const : file.sourceTypeConfidence === "low" ? "weak" as const : "traced" as const,
        changeStatus,
        sourceExcerpt: retention.retainedExcerpt,
        parsedJson: {
          evidenceRetention: createRetentionMetadata(retention)
        }
      };
    });
    const deletedRows = [...previousByPath.values()]
      .filter((artifact) => !seenPaths.has(artifact.filePath))
      .map((artifact) => ({
        id: randomUUID(),
        organizationId: input.organizationId,
        snapshotId: snapshot.id,
        sourceFileId: artifact.sourceFileId,
        filePath: artifact.filePath,
        fileName: artifact.fileName,
        extension: artifact.extension,
        sizeBytes: artifact.sizeBytes,
        sourceHash: artifact.sourceHash,
        lastModifiedAt: artifact.lastModifiedAt,
        artifactType: artifact.artifactType,
        parsingStatus: "skipped" as const,
        parsingConfidence: artifact.parsingConfidence,
        detectedOutcomeKey: artifact.detectedOutcomeKey,
        detectedEpicKey: artifact.detectedEpicKey,
        detectedStoryKey: artifact.detectedStoryKey,
        detectedAiLevel: artifact.detectedAiLevel,
        lineageStatus: artifact.lineageStatus,
        changeStatus: "deleted" as const,
        sourceExcerpt: artifact.sourceExcerpt,
        parsedJson: artifact.parsedJson ?? Prisma.JsonNull
      }));

    const allArtifactRows = [...artifactRows, ...deletedRows];

    if (allArtifactRows.length > 0) {
      await tx.controlMirrorArtifact.createMany({
        data: allArtifactRows
      });

      await tx.controlMirrorNormalizedEvidence.createMany({
        data: allArtifactRows.flatMap((artifact) => {
          const normalizedItems = normalizeControlMirrorArtifactEvidence({
            artifactId: artifact.id,
            fileName: artifact.fileName,
            artifactType: artifact.artifactType as ControlMirrorArtifactType,
            sourceExcerpt: artifact.sourceExcerpt,
            storyId: artifact.detectedStoryKey
          });

          return normalizedItems.map((normalized) => ({
            id: randomUUID(),
            organizationId: input.organizationId,
            snapshotId: snapshot.id,
            artifactId: artifact.id,
            sourceFileId: artifact.sourceFileId,
            evidenceType: normalized.evidenceType,
            label: normalized.label,
            sourceSection: normalized.sourceSection,
            sourceExcerpt: artifact.sourceExcerpt,
            storyClassification: normalized.storyClassification,
            readinessState: normalized.readinessState,
            missingReadinessFields: normalized.missingReadinessFields,
            detectedStoryKey: normalized.storyId,
            lineageJson: {
              sourceType: source.sourceType,
              snapshotId: snapshot.id,
              artifactId: artifact.id,
              sourceFileId: artifact.sourceFileId,
              filePath: artifact.filePath,
              evidenceRetention: readRetentionMetadata(artifact.parsedJson)
            }
          }));
        })
      });
    }

    const completed = await tx.controlMirrorSnapshot.update({
      where: {
        id: snapshot.id
      },
      data: {
        status: "completed",
        scanCompletedAt: new Date(),
        fileCount: artifactRows.length + deletedRows.length,
        unchangedCount,
        newCount,
        modifiedCount,
        deletedCount: deletedRows.length,
        unreadableCount: 0,
        summaryJson: {
          sourceType: source.sourceType,
          fileCount: artifactRows.length + deletedRows.length,
          unchangedCount,
          newCount,
          modifiedCount,
          deletedCount: deletedRows.length,
          unreadableCount: 0
        }
      },
      include: {
        artifacts: {
          orderBy: [{ changeStatus: "asc" }, { filePath: "asc" }]
        },
        normalizedEvidence: {
          orderBy: [{ readinessState: "asc" }, { evidenceType: "asc" }, { label: "asc" }]
        },
        source: true
      }
    });

    return completed;
  });
}

export async function resetControlMirrorWorkspace(input: {
  organizationId: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: {
        id: input.organizationId
      },
      select: {
        id: true
      }
    });

    if (!organization) {
      throw new Error("The selected project is no longer available.");
    }

    const source = await getOrCreateCurrentImportsSource(input, tx);
    const [reviewItems, exports, snapshots] = await Promise.all([
      tx.controlMirrorHumanReviewItem.deleteMany({
        where: {
          organizationId: input.organizationId
        }
      }),
      tx.controlMirrorEvidencePackExport.deleteMany({
        where: {
          organizationId: input.organizationId
        }
      }),
      tx.controlMirrorSnapshot.deleteMany({
        where: {
          organizationId: input.organizationId
        }
      })
    ]);
    const scanStartedAt = new Date();
    const snapshot = await tx.controlMirrorSnapshot.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        sourceId: source.id,
        label: `Reset baseline ${scanStartedAt.toISOString().slice(0, 16).replace("T", " ")}`,
        status: "completed",
        scanStartedAt,
        scanCompletedAt: scanStartedAt,
        fileCount: 0,
        unchangedCount: 0,
        newCount: 0,
        modifiedCount: 0,
        deletedCount: 0,
        unreadableCount: 0,
        summaryJson: {
          sourceType: source.sourceType,
          resetAt: scanStartedAt.toISOString(),
          resetBy: input.actorId ?? null,
          clearedSnapshots: snapshots.count,
          clearedReviewItems: reviewItems.count,
          clearedExports: exports.count,
          fileCount: 0,
          unchangedCount: 0,
          newCount: 0,
          modifiedCount: 0,
          deletedCount: 0,
          unreadableCount: 0
        }
      },
      include: {
        artifacts: {
          orderBy: [{ changeStatus: "asc" }, { filePath: "asc" }]
        },
        normalizedEvidence: {
          orderBy: [{ readinessState: "asc" }, { evidenceType: "asc" }, { label: "asc" }]
        },
        source: true
      }
    });

    return {
      snapshot,
      clearedSnapshots: snapshots.count,
      clearedReviewItems: reviewItems.count,
      clearedExports: exports.count
    };
  });
}

export async function getLatestControlMirrorSnapshot(organizationId: string) {
  return prisma.controlMirrorSnapshot.findFirst({
    where: {
      organizationId,
      status: "completed"
    },
    orderBy: {
      scanCompletedAt: "desc"
    },
    include: {
      source: true,
      artifacts: {
        orderBy: [{ changeStatus: "asc" }, { filePath: "asc" }]
      },
      normalizedEvidence: {
        orderBy: [{ readinessState: "asc" }, { evidenceType: "asc" }, { label: "asc" }]
      }
    }
  });
}

export async function hasControlMirrorCurrentImportFilesAfter(input: {
  organizationId: string;
  after: Date;
}) {
  const count = await prisma.artifactIntakeFile.count({
    where: {
      organizationId: input.organizationId,
      uploadedAt: {
        gt: input.after
      }
    }
  });

  return count > 0;
}
