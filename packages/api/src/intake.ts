import {
  appendArtifactFileRejections,
  createArtifactIntakeSession,
  getArtifactIntakeFileById,
  getArtifactCandidateById,
  listArtifactCandidatesForOrganization,
  listArtifactIntakeSessions,
  promoteArtifactCandidate,
  reviewArtifactFileSectionDisposition,
  reviewArtifactCandidate
} from "@aas-companion/db";
import {
  artifactCandidateReviewActionInputSchema,
  artifactImportIntentSchema,
  artifactFileSectionDispositionActionInputSchema,
  artifactIntakeProcessingModeSchema,
  artifactIntakeRejectedFileSchema,
  isSupportedArtifactFile,
  type ArtifactIntakeProcessingMode,
  type ArtifactIntakeRejectedFile
} from "@aas-companion/domain";
import { failure, success, type ApiResult } from "./shared";

type UploadArtifactFileInput = {
  fileName: string;
  mimeType?: string | null;
  sizeBytes: number;
  content: string;
};

function buildRejectedFiles(files: UploadArtifactFileInput[]) {
  const accepted: UploadArtifactFileInput[] = [];
  const rejected: ArtifactIntakeRejectedFile[] = [];

  for (const file of files) {
    if (!isSupportedArtifactFile(file.fileName)) {
      rejected.push(
        artifactIntakeRejectedFileSchema.parse({
          fileName: file.fileName,
          mimeType: file.mimeType ?? null,
          reason: "Only text and markdown files (.md, .mdx, .markdown, .txt) are supported in Import."
        })
      );
      continue;
    }

    if (!file.content.trim()) {
      rejected.push(
        artifactIntakeRejectedFileSchema.parse({
          fileName: file.fileName,
          mimeType: file.mimeType ?? null,
          reason: "Uploaded text or markdown files must contain content before intake can continue."
        })
      );
      continue;
    }

    accepted.push(file);
  }

  return { accepted, rejected };
}

export async function listArtifactIntakeSessionsService(organizationId: string) {
  return success(await listArtifactIntakeSessions(organizationId));
}

export async function getArtifactIntakeFileService(organizationId: string, fileId: string) {
  return success(await getArtifactIntakeFileById(organizationId, fileId));
}

export async function listArtifactCandidateQueueService(organizationId: string) {
  return success(await listArtifactCandidatesForOrganization(organizationId));
}

export async function getArtifactCandidateService(organizationId: string, candidateId: string) {
  return success(await getArtifactCandidateById(organizationId, candidateId));
}

export async function createArtifactIntakeSessionService(input: {
  organizationId: string;
  actorId?: string | null;
  label?: string;
  importIntent?: "framing" | "design";
  processingMode?: ArtifactIntakeProcessingMode;
  files: UploadArtifactFileInput[];
}): Promise<
  ApiResult<{
    sessionId: string;
    uploadedCount: number;
    rejectedCount: number;
    rejectedFiles: ArtifactIntakeRejectedFile[];
    processingModeUsed: ArtifactIntakeProcessingMode;
    processingNote: string | null;
  }>
> {
  if (input.files.length === 0) {
    return failure({
      code: "artifact_files_required",
      message: "Select one or more text or markdown files before creating an intake session."
    });
  }

  const { accepted, rejected } = buildRejectedFiles(input.files);

  if (accepted.length === 0) {
    if (rejected.length > 0) {
      await appendArtifactFileRejections({
        organizationId: input.organizationId,
        actorId: input.actorId ?? null,
        rejectedFiles: rejected
      });
    }

    return failure({
      code: "artifact_files_unsupported",
      message: rejected[0]?.reason ?? "No supported text or markdown files were uploaded."
    });
  }

  let result;
  const requestedProcessingMode = artifactIntakeProcessingModeSchema.parse(input.processingMode ?? "deterministic");
  const importIntent = artifactImportIntentSchema.parse(input.importIntent ?? "framing");

  try {
    result = await createArtifactIntakeSession(
      {
        organizationId: input.organizationId,
        actorId: input.actorId ?? null,
        label: input.label,
        importIntent,
        processingMode: requestedProcessingMode,
        files: accepted
      },
      rejected
    );
  } catch (error) {
    return failure({
      code: "artifact_intake_create_failed",
      message: error instanceof Error ? error.message : "Import upload failed."
    });
  }

  return success({
    sessionId: result.session.id,
    uploadedCount: result.files.length,
    rejectedCount: rejected.length,
    rejectedFiles: rejected,
    processingModeUsed: result.processingModeUsed ?? requestedProcessingMode,
    processingNote: result.processingNote ?? null
  });
}

export async function reviewArtifactCandidateService(input: unknown) {
  const parsed = artifactCandidateReviewActionInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_artifact_candidate_review",
      message: parsed.error.issues[0]?.message ?? "Artifact candidate review input is invalid."
    });
  }

  return success(await reviewArtifactCandidate(parsed.data));
}

export async function reviewArtifactFileSectionDispositionService(input: unknown) {
  const parsed = artifactFileSectionDispositionActionInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_artifact_section_review",
      message: parsed.error.issues[0]?.message ?? "Artifact section disposition input is invalid."
    });
  }

  return success(await reviewArtifactFileSectionDisposition(parsed.data));
}

export async function promoteArtifactCandidateService(input: {
  organizationId: string;
  candidateId: string;
  actorId?: string | null;
}) {
  try {
    return success(
      await promoteArtifactCandidate({
        organizationId: input.organizationId,
        candidateId: input.candidateId,
        actorId: input.actorId ?? null
      })
    );
  } catch (error) {
    return failure({
      code: "artifact_candidate_promotion_blocked",
      message: error instanceof Error ? error.message : "Artifact candidate promotion is blocked."
    });
  }
}
