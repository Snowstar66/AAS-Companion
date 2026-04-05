import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import {
  buildAiAssistedArtifactProcessingResult,
  artifactFileSectionDispositionActionInputSchema,
  artifactIssueDispositionMapSchema,
  artifactIntakeUploadRequestSchema,
  classifyArtifactSource,
  getArtifactFileExtension,
  mapParsedArtifactsToAasCandidates,
  parseMarkdownArtifact,
  shouldPreferDeterministicFramingImport,
  type ArtifactIntakeRejectedFile
} from "@aas-companion/domain";
import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import { createPersistedArtifactCandidates } from "./artifact-candidate-repository";
import { interpretArtifactFilesWithAi } from "./artifact-intake-ai";

type AiFallbackIssue = {
  path?: Array<string | number>;
  message?: string;
};

function humanizeAiFallbackField(path: Array<string | number>) {
  const normalized = path.filter((part) => typeof part === "string") as string[];
  const last = normalized.at(-1);
  const parent = normalized.at(-2);

  if (!last) {
    return null;
  }

  const fieldLabels: Record<string, string> = {
    rationale: "file rationale",
    type: "candidate type",
    title: "candidate title",
    summary: "candidate summary",
    draftRecord: "candidate draft fields"
  };

  if (fieldLabels[last]) {
    return fieldLabels[last];
  }

  if (parent === "candidates") {
    return `candidate ${last.replaceAll("_", " ")}`;
  }

  if (normalized.includes("files")) {
    return `file ${last.replaceAll("_", " ")}`;
  }

  return last.replaceAll("_", " ");
}

function extractAiFallbackIssues(error: unknown) {
  if (error && typeof error === "object" && "issues" in error && Array.isArray((error as { issues?: unknown[] }).issues)) {
    return (error as { issues: AiFallbackIssue[] }).issues;
  }

  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as unknown;

      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is AiFallbackIssue => Boolean(entry) && typeof entry === "object");
      }
    } catch {
      return [];
    }
  }

  return [];
}

function describeAiFallback(error: unknown) {
  const issues = extractAiFallbackIssues(error);

  if (issues.length === 0) {
    return "The AI response was incomplete, so the built-in parser completed the import instead.";
  }

  const fields = [...new Set(
    issues
      .map((issue) => humanizeAiFallbackField(issue.path ?? []))
      .filter((value): value is string => Boolean(value))
  )];

  if (fields.length === 0) {
    return "The AI response was incomplete, so the built-in parser completed the import instead.";
  }

  return `The AI response was incomplete, so the built-in parser completed the import instead. Missing or invalid AI fields: ${fields.slice(0, 4).join(", ")}${fields.length > 4 ? ", and more" : ""}.`;
}

function countCandidateTypes(mappingResult: {
  candidates: Array<{ type: "outcome" | "epic" | "story" }>;
}) {
  return {
    outcomes: mappingResult.candidates.filter((candidate) => candidate.type === "outcome").length,
    epics: mappingResult.candidates.filter((candidate) => candidate.type === "epic").length,
    stories: mappingResult.candidates.filter((candidate) => candidate.type === "story").length
  };
}

function countExplicitValueSpineHeadings(input: {
  files: Array<{
    parseResult: {
      sections: Array<{ title: string }>;
    };
  }>;
}) {
  return input.files.reduce(
    (counts, file) => {
      for (const section of file.parseResult.sections) {
        const title = section.title.trim().toUpperCase();

        if (/^(OUT|OUTCOME)-\d+\b/.test(title)) {
          counts.outcomes += 1;
        } else if (/^(EPIC|EPC)-\d+\b/.test(title)) {
          counts.epics += 1;
        } else if (/^(STORY|SC|STR)-\d+\b/.test(title)) {
          counts.stories += 1;
        }
      }

      return counts;
    },
    {
      outcomes: 0,
      epics: 0,
      stories: 0
    }
  );
}

type ArtifactRejectionContext = {
  organizationId: string;
  actorId?: string | null;
  sessionId?: string | null;
  rejectedFiles: ArtifactIntakeRejectedFile[];
};

type ArtifactProcessingContext = {
  organizationId: string;
  sessionId: string;
  importIntent: "framing" | "design";
  processingMode: "deterministic" | "ai_assisted";
};

async function resolveExistingActorId(
  actorId: string | null | undefined,
  db: Prisma.TransactionClient | typeof prisma = prisma
) {
  if (!actorId) {
    return null;
  }

  const existingActor = await db.appUser.findUnique({
    where: {
      id: actorId
    },
    select: {
      id: true
    }
  });

  return existingActor?.id ?? null;
}

async function runIndependentDbOperations<T>(
  db: Prisma.TransactionClient | typeof prisma,
  operations: Array<() => Promise<T>>
) {
  if (db === prisma) {
    return Promise.all(operations.map((operation) => operation()));
  }

  const results: T[] = [];

  for (const operation of operations) {
    results.push(await operation());
  }

  return results;
}

export async function listArtifactIntakeSessions(organizationId: string) {
  return prisma.artifactIntakeSession.findMany({
    where: { organizationId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      organizationId: true,
      label: true,
      importIntent: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      mappingCompletedAt: true,
      mappedArtifacts: true,
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      files: {
        orderBy: [{ uploadedAt: "desc" }, { fileName: "asc" }],
        select: {
          id: true,
          intakeSessionId: true,
          organizationId: true,
          fileName: true,
          mimeType: true,
          extension: true,
          sizeBytes: true,
          sourceTypeStatus: true,
          sourceType: true,
          sourceTypeConfidence: true,
          classifiedAt: true,
          parsedAt: true,
          parsedArtifacts: true,
          sectionDispositions: true,
          uploadedAt: true,
          uploadedBy: true,
          uploader: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      },
      candidates: {
        orderBy: [{ updatedAt: "desc" }, { createdAt: "asc" }]
      }
    }
  });
}

export async function getArtifactIntakeFileById(organizationId: string, fileId: string) {
  return prisma.artifactIntakeFile.findFirst({
    where: {
      organizationId,
      id: fileId
    },
    select: {
      id: true,
      intakeSessionId: true,
      organizationId: true,
      fileName: true,
      mimeType: true,
      extension: true,
      sizeBytes: true,
      content: true,
      sourceTypeStatus: true,
      sourceType: true,
      sourceTypeConfidence: true,
      classifiedAt: true,
      parsedAt: true,
      parsedArtifacts: true,
      sectionDispositions: true,
      uploadedAt: true,
      uploadedBy: true,
      uploader: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });
}

export async function reviewArtifactFileSectionDisposition(input: unknown) {
  const parsed = artifactFileSectionDispositionActionInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.artifactIntakeFile.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.fileId
      }
    });

    if (!existing) {
      throw new Error("Artifact file was not found in organization scope.");
    }

    const sectionDispositions = artifactIssueDispositionMapSchema.parse({
      ...(artifactIssueDispositionMapSchema.parse(existing.sectionDispositions ?? {})),
      [parsed.sectionId]: {
        issueId: parsed.sectionId,
        action: parsed.action,
        note: parsed.note ?? null
      }
    });

    const updated = await tx.artifactIntakeFile.update({
      where: { id: existing.id },
      data: {
        sectionDispositions: sectionDispositions as Prisma.InputJsonValue
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "artifact_intake_file",
        entityId: updated.id,
        eventType: "artifact_file_section_disposition_recorded",
        actorId: parsed.actorId ?? null,
        metadata: {
          sectionId: parsed.sectionId,
          action: parsed.action,
          note: parsed.note ?? null
        }
      },
      tx
    );

    return updated;
  });
}

export async function deleteArtifactIntakeSession(input: {
  organizationId: string;
  sessionId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.artifactIntakeSession.findFirst({
      where: {
        organizationId: input.organizationId,
        id: input.sessionId
      },
      select: {
        id: true,
        label: true,
        files: {
          select: {
            id: true
          }
        },
        candidates: {
          select: {
            id: true
          }
        }
      }
    });

    if (!session) {
      throw new Error("Artifact intake session was not found in organization scope.");
    }

    const fileIds = session.files.map((file) => file.id);
    const candidateIds = session.candidates.map((candidate) => candidate.id);

    if (candidateIds.length > 0) {
      await tx.activityEvent.deleteMany({
        where: {
          organizationId: input.organizationId,
          entityType: "artifact_aas_candidate",
          entityId: {
            in: candidateIds
          }
        }
      });

      await tx.artifactAasCandidate.deleteMany({
        where: {
          organizationId: input.organizationId,
          intakeSessionId: session.id
        }
      });
    }

    if (fileIds.length > 0) {
      await tx.activityEvent.deleteMany({
        where: {
          organizationId: input.organizationId,
          entityType: "artifact_intake_file",
          entityId: {
            in: fileIds
          }
        }
      });

      await tx.artifactIntakeFile.deleteMany({
        where: {
          organizationId: input.organizationId,
          intakeSessionId: session.id
        }
      });
    }

    await tx.activityEvent.deleteMany({
      where: {
        organizationId: input.organizationId,
        entityType: "artifact_intake_session",
        entityId: session.id
      }
    });

    await tx.artifactIntakeSession.delete({
      where: {
        id: session.id
      }
    });

    return session;
  });
}

export async function reviewArtifactFileSectionDispositionsBulk(inputs: unknown[]) {
  const parsedInputs = inputs.map((input) => artifactFileSectionDispositionActionInputSchema.parse(input));
  const chunkSize = 8;
  let processedCount = 0;

  for (let index = 0; index < parsedInputs.length; index += chunkSize) {
    const chunk = parsedInputs.slice(index, index + chunkSize);
    await prisma.$transaction(async (tx) => {
      const organizationId = chunk[0]!.organizationId;
      const uniqueFileIds = [...new Set(chunk.map((parsed) => parsed.fileId))];
      const files = await tx.artifactIntakeFile.findMany({
        where: {
          id: { in: uniqueFileIds },
          organizationId
        }
      });
      const filesById = new Map(files.map((file) => [file.id, file] as const));

      if (filesById.size !== uniqueFileIds.length) {
        throw new Error("Artifact file was not found in organization scope.");
      }

      const updatesByFileId = new Map<string, Prisma.InputJsonValue>();

      for (const fileId of uniqueFileIds) {
        const existing = filesById.get(fileId);

        if (!existing) {
          throw new Error("Artifact file was not found in organization scope.");
        }

        let nextSectionDispositions = artifactIssueDispositionMapSchema.parse(existing.sectionDispositions ?? {});

        for (const parsed of chunk.filter((entry) => entry.fileId === fileId)) {
          nextSectionDispositions = artifactIssueDispositionMapSchema.parse({
            ...nextSectionDispositions,
            [parsed.sectionId]: {
              issueId: parsed.sectionId,
              action: parsed.action,
              note: parsed.note ?? null
            }
          });
        }

        updatesByFileId.set(fileId, nextSectionDispositions as Prisma.InputJsonValue);
      }

      await Promise.all(
        uniqueFileIds.map((fileId) =>
          tx.artifactIntakeFile.update({
            where: { id: fileId },
            data: {
              sectionDispositions: updatesByFileId.get(fileId)!
            }
          })
        )
      );

      await tx.activityEvent.createMany({
        data: chunk.map((parsed) => ({
          id: randomUUID(),
          organizationId: parsed.organizationId,
          entityType: "artifact_intake_file" as const,
          entityId: parsed.fileId,
          eventType: "artifact_file_section_disposition_recorded" as const,
          actorId: parsed.actorId ?? null,
          metadata: {
            sectionId: parsed.sectionId,
            action: parsed.action,
            note: parsed.note ?? null
          } as Prisma.InputJsonValue
        }))
      });
      processedCount += chunk.length;
    });
  }

  return {
    processedCount
  };
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
  const classificationByFileId = new Map(classifications.map((entry) => [entry.fileId, entry.classification] as const));

  await runIndependentDbOperations(
    db,
    classifications.map((entry) => () =>
      db.artifactIntakeFile.update({
        where: { id: entry.fileId },
        data: {
          sourceTypeStatus: "classified",
          sourceType: entry.classification.sourceType,
          sourceTypeConfidence: entry.classification.confidence,
          classifiedAt
        }
      })
    )
  );

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
  const initialParsedArtifacts = session.files.map((file) => ({
    fileId: file.id,
    fileName: file.fileName,
    sourceType: classificationByFileId.get(file.id)?.sourceType ?? null,
    parseResult: parseMarkdownArtifact(file.id, file.fileName, file.content)
  }));

  let parsedArtifacts = initialParsedArtifacts;
  let mappingResult = mapParsedArtifactsToAasCandidates({
    files: initialParsedArtifacts.map((entry) => ({
      id: entry.fileId,
      fileName: entry.fileName,
      sourceType: entry.sourceType,
      parsedArtifacts: entry.parseResult
    })),
    importIntent: input.importIntent
  });
  let processingModeUsed: "deterministic" | "ai_assisted" = "deterministic";
  let processingNote: string | null = null;

  if (input.processingMode === "ai_assisted") {
    try {
      const aiInterpretation = await interpretArtifactFilesWithAi({
        importIntent: input.importIntent,
        files: initialParsedArtifacts.map((entry) => ({
          fileId: entry.fileId,
          fileName: entry.fileName,
          parsedArtifacts: entry.parseResult
        }))
      });
      const aiResult = buildAiAssistedArtifactProcessingResult({
        files: initialParsedArtifacts.map((entry) => ({
          id: entry.fileId,
          fileName: entry.fileName,
          parsedArtifacts: entry.parseResult
        })),
        interpretation: aiInterpretation,
        importIntent: input.importIntent
      });

      parsedArtifacts = aiResult.files.map((entry) => ({
        fileId: entry.fileId,
        fileName: entry.fileName,
        sourceType: entry.sourceType,
        parseResult: entry.parseResult
      }));
      const explicitValueSpineCounts = countExplicitValueSpineHeadings({
        files: initialParsedArtifacts.map((entry) => ({
          parseResult: entry.parseResult
        }))
      });
      const aiCandidateCounts = countCandidateTypes(aiResult.mappingResult);
      const deterministicCandidateCounts = countCandidateTypes(mappingResult);
      const shouldFallBackToDeterministicForExplicitSpine = shouldPreferDeterministicFramingImport({
        importIntent: input.importIntent,
        explicitValueSpineCounts,
        aiCandidateCounts,
        deterministicCandidateCounts
      });

      if (shouldFallBackToDeterministicForExplicitSpine) {
        processingNote =
          "An explicit Value Spine was detected, so the built-in parser handled the framing import to preserve the declared Outcome, Epic, and Story links.";
      } else {
        mappingResult = aiResult.mappingResult;
        processingModeUsed = "ai_assisted";
      }
    } catch (error) {
      processingNote = describeAiFallback(error);
    }
  }

  await runIndependentDbOperations(
    db,
    parsedArtifacts.map((entry) => () =>
      db.artifactIntakeFile.update({
        where: { id: entry.fileId },
        data: {
          sourceType: entry.parseResult.classification.sourceType,
          sourceTypeConfidence: entry.parseResult.classification.confidence,
          parsedAt,
          parsedArtifacts: entry.parseResult as Prisma.InputJsonValue
        }
      })
    )
  );

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

  await db.artifactIntakeSession.update({
    where: { id: session.id },
    data: {
      status: "human_review_required",
      mappedArtifacts: mappingResult as Prisma.InputJsonValue,
      mappingCompletedAt
    }
  });

  await db.artifactAasCandidate.deleteMany({
    where: {
      organizationId: input.organizationId,
      intakeSessionId: session.id
    }
  });

  await createPersistedArtifactCandidates(
    {
      organizationId: input.organizationId,
      intakeSessionId: session.id,
      candidates: mappingResult.candidates,
      importIntent: input.importIntent
    },
    db
  );

  return {
    mappingResult,
    processingModeUsed,
    processingNote
  };
}

export async function createArtifactIntakeSession(input: unknown, rejectedFiles: ArtifactIntakeRejectedFile[] = []) {
  const parsed = artifactIntakeUploadRequestSchema.parse(input);

  const { session, files } = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: {
        id: parsed.organizationId
      },
      select: {
        id: true
      }
    });

    if (!organization) {
      if (parsed.organizationId === DEMO_ORGANIZATION.organizationId) {
        throw new Error("Import is read-only in Demo. Leave Demo and open a normal project before uploading files.");
      }

      throw new Error("The selected project is no longer available. Open or create a normal project and try again.");
    }

    const actorId = await resolveExistingActorId(parsed.actorId ?? null, tx);
    const session = await tx.artifactIntakeSession.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        label: parsed.label ?? `Artifact intake ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
        importIntent: parsed.importIntent,
        status: "uploaded",
        createdBy: actorId
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "artifact_intake_session",
        entityId: session.id,
        eventType: "artifact_intake_session_created",
        actorId,
        metadata: {
          label: session.label,
          importIntent: session.importIntent,
          fileCount: parsed.files.length
        }
      },
      tx
    );

    const uploadedAt = new Date();
    const files = parsed.files.map((file) => ({
      id: randomUUID(),
      intakeSessionId: session.id,
      organizationId: parsed.organizationId,
      fileName: file.fileName,
      mimeType: file.mimeType ?? null,
      extension: getArtifactFileExtension(file.fileName),
      sizeBytes: file.sizeBytes,
      content: file.content,
      sourceTypeStatus: "pending" as const,
      sectionDispositions: {} as Prisma.InputJsonValue,
      uploadedBy: actorId,
      uploadedAt
    }));

    if (files.length > 0) {
      await tx.artifactIntakeFile.createMany({
        data: files
      });

      await tx.activityEvent.createMany({
        data: files.map((artifactFile) => ({
          id: randomUUID(),
          organizationId: parsed.organizationId,
          entityType: "artifact_intake_file",
          entityId: artifactFile.id,
          eventType: "artifact_file_uploaded",
          actorId,
          metadata: {
            intakeSessionId: session.id,
            fileName: artifactFile.fileName,
            sizeBytes: artifactFile.sizeBytes,
            sourceTypeStatus: artifactFile.sourceTypeStatus
          } as Prisma.InputJsonValue
        }))
      });
    }

    if (rejectedFiles.length > 0) {
      await appendArtifactFileRejections(
        {
          organizationId: parsed.organizationId,
          actorId,
          sessionId: session.id,
          rejectedFiles
        },
        tx
      );
    }

    return {
      session,
      files
    };
  });

  try {
    const processingResult = await processArtifactIntakeSession({
      organizationId: parsed.organizationId,
      sessionId: session.id,
      importIntent: parsed.importIntent,
      processingMode: parsed.processingMode
    });

    return {
      session,
      files,
      mappingResult: processingResult.mappingResult,
      processingModeUsed: processingResult.processingModeUsed,
      processingNote: processingResult.processingNote
    };
  } catch (error) {
    await prisma.artifactIntakeSession
      .update({
        where: { id: session.id },
        data: {
          status: "blocked"
        }
      })
      .catch(() => undefined);

    throw error;
  }
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
