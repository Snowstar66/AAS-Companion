import {
  artifactMappingResultSchema,
  artifactParseResultSchema,
  type ArtifactMappingResult,
  type ArtifactParseResult
} from "@aas-companion/domain";
import { listArtifactIntakeSessionsService } from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";

function parseStoredParseResult(value: unknown): ArtifactParseResult | null {
  const parsed = artifactParseResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseStoredMappingResult(value: unknown): ArtifactMappingResult | null {
  const parsed = artifactMappingResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function loadArtifactIntakeWorkspace() {
  const session = await requireProtectedSession();

  try {
    const result = await listArtifactIntakeSessionsService(session.organization.organizationId);

    if (!result.ok) {
      return {
        state: "unavailable" as const,
        organizationName: session.organization.organizationName,
        summary: {
          sessions: 0,
          files: 0,
          pendingClassification: 0,
          parsedSections: 0,
          candidateObjects: 0,
          humanReviewRequired: 0
        },
        sessions: [],
        message: result.errors[0]?.message ?? "Artifact Intake could not be loaded."
      };
    }

    const sessions = result.data.map((artifactSession) => {
      const files = artifactSession.files.map((file) => {
        const parsedArtifacts = parseStoredParseResult(file.parsedArtifacts);

        return {
          ...file,
          parsedArtifacts,
          parsedSectionCount: parsedArtifacts?.sections.length ?? 0,
          uncertainSectionCount:
            parsedArtifacts?.sections.filter((section) => section.isUncertain || section.confidence === "low").length ?? 0
        };
      });

      const mappedArtifacts = parseStoredMappingResult(artifactSession.mappedArtifacts);

      return {
        ...artifactSession,
        files,
        mappedArtifacts,
        candidateCount: mappedArtifacts?.candidates.length ?? 0,
        uncertainCandidateCount:
          mappedArtifacts?.candidates.filter(
            (candidate) => candidate.mappingState !== "mapped" || candidate.relationshipState !== "mapped"
          ).length ?? 0,
        unmappedSectionCount: mappedArtifacts?.unmappedSections.length ?? 0
      };
    });

    const pendingClassification = sessions.reduce((count, artifactSession) => {
      return count + artifactSession.files.filter((file) => file.sourceTypeStatus === "pending").length;
    }, 0);

    const parsedSections = sessions.reduce((count, artifactSession) => {
      return count + artifactSession.files.reduce((fileCount, file) => fileCount + file.parsedSectionCount, 0);
    }, 0);

    const candidateObjects = sessions.reduce((count, artifactSession) => count + artifactSession.candidateCount, 0);
    const humanReviewRequired = sessions.filter((artifactSession) => artifactSession.status === "human_review_required").length;

    return {
      state: "ready" as const,
      organizationName: session.organization.organizationName,
      summary: {
        sessions: sessions.length,
        files: sessions.reduce((count, artifactSession) => count + artifactSession.files.length, 0),
        pendingClassification,
        parsedSections,
        candidateObjects,
        humanReviewRequired
      },
      sessions,
      message:
        sessions.length > 0
          ? "Uploaded markdown artifacts are now classified, parsed into candidate sections, and mapped into reviewable AAS candidates."
          : "No intake sessions exist yet. Upload markdown artifacts to start the governed import path."
    };
  } catch (error) {
    return {
      state: "unavailable" as const,
      organizationName: session.organization.organizationName,
      summary: {
        sessions: 0,
        files: 0,
        pendingClassification: 0,
        parsedSections: 0,
        candidateObjects: 0,
        humanReviewRequired: 0
      },
      sessions: [],
      message: error instanceof Error ? error.message : "Artifact Intake could not be loaded."
    };
  }
}
