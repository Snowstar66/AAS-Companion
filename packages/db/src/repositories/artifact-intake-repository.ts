import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import {
  artifactIntakeUploadRequestSchema,
  classifyArtifactSource,
  getArtifactFileExtension,
  mapParsedArtifactsToAasCandidates,
  parseMarkdownArtifact,
  type ArtifactIntakeRejectedFile
} from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";

type ArtifactRejectionContext = {
  organizationId: string;
  actorId?: string | null;
  sessionId?: string | null;
  rejectedFiles: ArtifactIntakeRejectedFile[];
};

type ArtifactProcessingContext = {
  organizationId: string;
  sessionId: string;
};

export async function listArtifactIntakeSessions(organizationId: string) {
  return prisma.artifactIntakeSession.findMany({
    where: { organizationId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      files: {
        orderBy: [{ uploadedAt: "desc" }, { fileName: "asc" }],
        include: {
          uploader: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });
}

async function processArtifactIntakeSession(
  input: ArtifactProcessingContext,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  const session = await db.artifactIntakeSession.findFirst({
    where: {
      id: input.sessionId,
      organizationId: input.organizationId
    },
    include: {
      files: {
        orderBy: [{ uploadedAt: "asc" }, { fileName: "asc" }]
      }
    }
  });

  if (!session) {
    throw new Error("Artifact intake session was not found in organization scope.");
  }

  await db.artifactIntakeSession.update({
    where: { id: session.id },
    data: {
      status: "source_classification_pending"
    }
  });

  const classifiedAt = new Date();
  const classifications = session.files.map((file) => ({
    fileId: file.id,
    classification: classifyArtifactSource(file.fileName, file.content)
  }));

  for (const entry of classifications) {
    await db.artifactIntakeFile.update({
      where: { id: entry.fileId },
      data: {
        sourceTypeStatus: "classified",
        sourceType: entry.classification.sourceType,
        sourceTypeConfidence: entry.classification.confidence,
        classifiedAt
      }
    });
  }

  await db.artifactIntakeSession.update({
    where: { id: session.id },
    data: {
      status: "source_classified"
    }
  });

  await db.artifactIntakeSession.update({
    where: { id: session.id },
    data: {
      status: "parsing_pending"
    }
  });

  const parsedAt = new Date();
  const parsedArtifacts = session.files.map((file) => ({
    fileId: file.id,
    fileName: file.fileName,
    sourceType: classifications.find((entry) => entry.fileId === file.id)?.classification.sourceType ?? null,
    parseResult: parseMarkdownArtifact(file.id, file.fileName, file.content)
  }));

  for (const entry of parsedArtifacts) {
    await db.artifactIntakeFile.update({
      where: { id: entry.fileId },
      data: {
        parsedAt,
        parsedArtifacts: entry.parseResult as Prisma.InputJsonValue
      }
    });
  }

  await db.artifactIntakeSession.update({
    where: { id: session.id },
    data: {
      status: "parsed"
    }
  });

  await db.artifactIntakeSession.update({
    where: { id: session.id },
    data: {
      status: "mapping_pending"
    }
  });

  const mappingCompletedAt = new Date();
  const mappingResult = mapParsedArtifactsToAasCandidates({
    files: parsedArtifacts.map((entry) => ({
      id: entry.fileId,
      fileName: entry.fileName,
      sourceType: entry.sourceType,
      parsedArtifacts: entry.parseResult
    }))
  });

  await db.artifactIntakeSession.update({
    where: { id: session.id },
    data: {
      status: "human_review_required",
      mappedArtifacts: mappingResult as Prisma.InputJsonValue,
      mappingCompletedAt
    }
  });

  return mappingResult;
}

export async function createArtifactIntakeSession(input: unknown, rejectedFiles: ArtifactIntakeRejectedFile[] = []) {
  const parsed = artifactIntakeUploadRequestSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const session = await tx.artifactIntakeSession.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        label: parsed.label ?? `Artifact intake ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
        status: "uploaded",
        createdBy: parsed.actorId ?? null
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "artifact_intake_session",
        entityId: session.id,
        eventType: "artifact_intake_session_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          label: session.label,
          fileCount: parsed.files.length
        }
      },
      tx
    );

    const files = [];

    for (const file of parsed.files) {
      const artifactFile = await tx.artifactIntakeFile.create({
        data: {
          id: randomUUID(),
          intakeSessionId: session.id,
          organizationId: parsed.organizationId,
          fileName: file.fileName,
          mimeType: file.mimeType ?? null,
          extension: getArtifactFileExtension(file.fileName),
          sizeBytes: file.sizeBytes,
          content: file.content,
          sourceTypeStatus: "pending",
          uploadedBy: parsed.actorId ?? null
        }
      });

      await appendActivityEvent(
        {
          organizationId: parsed.organizationId,
          entityType: "artifact_intake_file",
          entityId: artifactFile.id,
          eventType: "artifact_file_uploaded",
          actorId: parsed.actorId ?? null,
          metadata: {
            intakeSessionId: session.id,
            fileName: artifactFile.fileName,
            sizeBytes: artifactFile.sizeBytes,
            sourceTypeStatus: artifactFile.sourceTypeStatus
          }
        },
        tx
      );

      files.push(artifactFile);
    }

    if (rejectedFiles.length > 0) {
      await appendArtifactFileRejections(
        {
          organizationId: parsed.organizationId,
          actorId: parsed.actorId ?? null,
          sessionId: session.id,
          rejectedFiles
        },
        tx
      );
    }

    const mappingResult = await processArtifactIntakeSession(
      {
        organizationId: parsed.organizationId,
        sessionId: session.id
      },
      tx
    );

    return {
      session,
      files,
      mappingResult
    };
  });
}

export async function appendArtifactFileRejections(
  input: ArtifactRejectionContext,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  for (const rejectedFile of input.rejectedFiles) {
    await appendActivityEvent(
      {
        organizationId: input.organizationId,
        entityType: input.sessionId ? "artifact_intake_session" : "organization",
        entityId: input.sessionId ?? input.organizationId,
        eventType: "artifact_file_rejected",
        actorId: input.actorId ?? null,
        metadata: {
          fileName: rejectedFile.fileName,
          mimeType: rejectedFile.mimeType ?? null,
          reason: rejectedFile.reason
        }
      },
      db
    );
  }
}
