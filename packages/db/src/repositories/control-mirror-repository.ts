import {
  buildControlMirrorDashboard,
  type ControlMirrorArtifactType,
  type ControlMirrorDashboard,
  type ControlMirrorRejectedUploadedSnapshotFile,
  type ControlMirrorOutcomeInput
} from "@aas-companion/domain";
import { prisma } from "../client";

function readEvidenceRetentionMetadata(value: unknown): {
  retentionMode?: "metadata_only" | "metadata_and_excerpts" | "redacted_excerpts" | "not_retained";
  retentionDisclosure?: string;
  redactionApplied?: boolean;
  sensitiveFindingCount?: number;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const lineage = value as { evidenceRetention?: unknown };

  if (!lineage.evidenceRetention || typeof lineage.evidenceRetention !== "object" || Array.isArray(lineage.evidenceRetention)) {
    return {};
  }

  const retention = lineage.evidenceRetention as {
    retentionMode?: unknown;
    disclosure?: unknown;
    redactionApplied?: unknown;
    sensitiveFindingCount?: unknown;
  };
  const retentionMode = typeof retention.retentionMode === "string" && (
    retention.retentionMode === "metadata_only" ||
    retention.retentionMode === "metadata_and_excerpts" ||
    retention.retentionMode === "redacted_excerpts" ||
    retention.retentionMode === "not_retained"
  )
    ? retention.retentionMode
    : undefined;
  const metadata: {
    retentionMode?: "metadata_only" | "metadata_and_excerpts" | "redacted_excerpts" | "not_retained";
    retentionDisclosure?: string;
    redactionApplied?: boolean;
    sensitiveFindingCount?: number;
  } = {};

  if (retentionMode) metadata.retentionMode = retentionMode;
  if (typeof retention.disclosure === "string") metadata.retentionDisclosure = retention.disclosure;
  if (typeof retention.redactionApplied === "boolean") metadata.redactionApplied = retention.redactionApplied;
  if (typeof retention.sensitiveFindingCount === "number") metadata.sensitiveFindingCount = retention.sensitiveFindingCount;

  return metadata;
}

export async function getControlMirrorDashboardSnapshot(organizationId: string): Promise<ControlMirrorDashboard | null> {
  const [organization, artifactSessions, latestControlMirrorSnapshot, tollgates, signoffRecords] = await Promise.all([
    prisma.organization.findUnique({
      where: {
        id: organizationId
      },
      select: {
        id: true,
        name: true,
        outcomes: {
          where: {
            lifecycleState: "active"
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            key: true,
            title: true,
            framingVersion: true,
            valueOwnerId: true,
            outcomeStatement: true,
            problemStatement: true,
            baselineDefinition: true,
            solutionConstraints: true,
            riskProfile: true,
            aiAccelerationLevel: true,
            status: true,
            directionSeeds: {
              where: {
                lifecycleState: "active"
              },
              orderBy: {
                createdAt: "asc"
              },
              select: {
                id: true,
                key: true,
                title: true,
                shortDescription: true,
                expectedBehavior: true,
                sourceStoryId: true
              }
            },
            epics: {
              where: {
                lifecycleState: "active"
              },
              orderBy: {
                createdAt: "asc"
              },
              select: {
                id: true,
                key: true,
                title: true,
                purpose: true,
                directionSeeds: {
                  where: {
                    lifecycleState: "active"
                  },
                  orderBy: {
                    createdAt: "asc"
                  },
                  select: {
                    id: true,
                    key: true,
                    title: true,
                    shortDescription: true,
                    expectedBehavior: true,
                    sourceStoryId: true
                  }
                },
                stories: {
                  where: {
                    lifecycleState: "active"
                  },
                  orderBy: {
                    createdAt: "asc"
                  },
                  select: {
                    id: true,
                    key: true,
                    title: true,
                    outcomeId: true,
                    epicId: true,
                    valueIntent: true,
                    expectedBehavior: true,
                    acceptanceCriteria: true,
                    aiUsageScope: true,
                    aiAccelerationLevel: true,
                    testDefinition: true,
                    definitionOfDone: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      }
    }),
    prisma.artifactIntakeSession.findMany({
      where: {
        organizationId
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        label: true,
        importIntent: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        files: {
          orderBy: [{ uploadedAt: "desc" }, { fileName: "asc" }],
          select: {
            id: true,
            fileName: true,
            sourceType: true,
            sourceTypeConfidence: true,
            sizeBytes: true,
            content: true,
            parsedAt: true,
            uploadedAt: true
          }
        },
        candidates: {
          select: {
            id: true,
            type: true,
            title: true,
            mappingState: true,
            relationshipState: true,
            reviewStatus: true,
            importedReadinessState: true,
            promotedEntityId: true
          }
        }
      }
    }),
    prisma.controlMirrorSnapshot.findFirst({
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
          include: {
            artifact: true
          },
          orderBy: [{ readinessState: "asc" }, { evidenceType: "asc" }, { label: "asc" }]
        }
      }
    }),
    prisma.tollgate.findMany({
      where: {
        organizationId
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        tollgateType: true,
        status: true,
        blockers: true
      }
    }),
    prisma.signoffRecord.findMany({
      where: {
        organizationId
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        decisionKind: true,
        decisionStatus: true,
        evidenceReference: true
      }
    })
  ]);

  if (!organization) {
    return null;
  }

  const storyTollgateStatusById = new Map(
    tollgates
      .filter((tollgate) => tollgate.entityType === "story" && tollgate.tollgateType === "story_readiness")
      .map((tollgate) => [tollgate.entityId, tollgate.status] as const)
  );
  const outcomes: ControlMirrorOutcomeInput[] = organization.outcomes.map((outcome) => ({
    ...outcome,
    riskProfile: outcome.riskProfile,
    aiAccelerationLevel: outcome.aiAccelerationLevel,
    epics: outcome.epics.map((epic) => ({
      ...epic,
      stories: epic.stories.map((story) => ({
        ...story,
        aiAccelerationLevel: story.aiAccelerationLevel,
        tollgateStatus: (storyTollgateStatusById.get(story.id) ?? null) as "blocked" | "ready" | "approved" | null
      }))
    }))
  }));

  const latestSnapshotSummary = latestControlMirrorSnapshot?.summaryJson && typeof latestControlMirrorSnapshot.summaryJson === "object" && !Array.isArray(latestControlMirrorSnapshot.summaryJson)
    ? latestControlMirrorSnapshot.summaryJson as {
        acceptedCount?: unknown;
        rejectedCount?: unknown;
        rejectedFiles?: unknown;
      }
    : null;
  const rejectedFiles = Array.isArray(latestSnapshotSummary?.rejectedFiles)
    ? latestSnapshotSummary.rejectedFiles.filter((file): file is ControlMirrorRejectedUploadedSnapshotFile => {
        if (!file || typeof file !== "object" || Array.isArray(file)) {
          return false;
        }

        const rejectedFile = file as { originalPath?: unknown; reason?: unknown };

        return typeof rejectedFile.originalPath === "string" && typeof rejectedFile.reason === "string";
      })
    : [];

  return buildControlMirrorDashboard({
    organizationName: organization.name,
    outcomes,
    artifactSessions: artifactSessions.map((session) => ({
      ...session,
      importIntent: session.importIntent,
      files: session.files.map((file) => ({
        ...file,
        sourceConfidence: file.sourceTypeConfidence
      }))
    })),
    persistentSnapshot: latestControlMirrorSnapshot
      ? {
          id: latestControlMirrorSnapshot.id,
          label: latestControlMirrorSnapshot.label,
          sourceType: latestControlMirrorSnapshot.source.sourceType.replaceAll("_", " "),
          scanTime: latestControlMirrorSnapshot.scanCompletedAt,
          sessionCount: artifactSessions.length,
          fileCount: latestControlMirrorSnapshot.fileCount,
          candidateCount: artifactSessions.reduce((count, session) => count + session.candidates.length, 0),
          unchangedCount: latestControlMirrorSnapshot.unchangedCount,
          newCount: latestControlMirrorSnapshot.newCount,
          modifiedCount: latestControlMirrorSnapshot.modifiedCount,
          deletedCount: latestControlMirrorSnapshot.deletedCount,
          unreadableCount: latestControlMirrorSnapshot.unreadableCount,
          acceptedCount: typeof latestSnapshotSummary?.acceptedCount === "number" ? latestSnapshotSummary.acceptedCount : Math.max(latestControlMirrorSnapshot.fileCount - latestControlMirrorSnapshot.unreadableCount, 0),
          rejectedCount: typeof latestSnapshotSummary?.rejectedCount === "number" ? latestSnapshotSummary.rejectedCount : 0,
          rejectedFiles,
          artifacts: latestControlMirrorSnapshot.artifacts.map((artifact) => ({
            id: artifact.id,
            fileName: artifact.filePath,
            artifactType: artifact.artifactType as ControlMirrorArtifactType,
            lineageStatus: artifact.lineageStatus,
            parsingConfidence: artifact.parsingConfidence,
            changeStatus: artifact.changeStatus,
            storyId: artifact.detectedStoryKey
          })),
          normalizedEvidence: latestControlMirrorSnapshot.normalizedEvidence.map((evidence) => ({
            id: evidence.id,
            artifactId: evidence.artifactId,
            fileName: evidence.artifact.filePath,
            evidenceType: evidence.evidenceType,
            label: evidence.label,
            sourceSection: evidence.sourceSection,
            storyClassification: evidence.storyClassification,
            readinessState: evidence.readinessState,
            missingReadinessFields: evidence.missingReadinessFields,
            storyId: evidence.detectedStoryKey,
            ...readEvidenceRetentionMetadata(evidence.lineageJson)
          }))
        }
      : null,
    tollgates,
    signoffRecords
  });
}
