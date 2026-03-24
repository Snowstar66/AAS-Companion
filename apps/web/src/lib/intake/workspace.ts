import {
  artifactCandidateDraftRecordSchema,
  artifactCandidateHumanDecisionSchema,
  artifactComplianceResultSchema,
  artifactCandidateReviewStatusSchema,
  artifactMappingResultSchema,
  artifactParseResultSchema,
  type ArtifactMappingResult,
  type ArtifactParseResult
} from "@aas-companion/domain";
import { listArtifactIntakeSessionsService } from "@aas-companion/api";
import { requireOrganizationContext } from "@/lib/auth/guards";

function parseStoredParseResult(value: unknown): ArtifactParseResult | null {
  const parsed = artifactParseResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseStoredMappingResult(value: unknown): ArtifactMappingResult | null {
  const parsed = artifactMappingResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseStoredCandidateDraftRecord(value: unknown) {
  const parsed = artifactCandidateDraftRecordSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseStoredCandidateHumanDecisions(value: unknown) {
  const parsed = artifactCandidateHumanDecisionSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseStoredComplianceResult(value: unknown) {
  const parsed = artifactComplianceResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseStoredReviewStatus(value: unknown) {
  const parsed = artifactCandidateReviewStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : "pending";
}

export async function loadArtifactIntakeWorkspace() {
  const organization = await requireOrganizationContext();

  try {
    const result = await listArtifactIntakeSessionsService(organization.organizationId);

    if (!result.ok) {
      return {
        state: "unavailable" as const,
        organizationName: organization.organizationName,
        summary: {
          sessions: 0,
          files: 0,
          pendingClassification: 0,
          parsedSections: 0,
          candidateObjects: 0,
          humanReviewRequired: 0
        },
        sessions: [],
        message: result.errors[0]?.message ?? "Import data could not be loaded."
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
      const candidates = (artifactSession.candidates ?? []).map((candidate) => ({
        ...candidate,
        source: {
          fileId: candidate.fileId,
          fileName: files.find((file) => file.id === candidate.fileId)?.fileName ?? candidate.sourceSectionTitle,
          sectionId: candidate.sourceSectionId,
          sectionTitle: candidate.sourceSectionTitle,
          sectionMarker: candidate.sourceSectionMarker,
          sourceType: candidate.sourceType,
          confidence: candidate.sourceConfidence
        },
        draftRecord: parseStoredCandidateDraftRecord(candidate.draftRecord),
        humanDecisions: parseStoredCandidateHumanDecisions(candidate.humanDecisions),
        complianceResult: parseStoredComplianceResult(candidate.complianceResult),
        reviewStatus: parseStoredReviewStatus(candidate.reviewStatus)
      }));
      const displayCandidates =
        candidates.length > 0
          ? candidates
          : (mappedArtifacts?.candidates ?? []).map((candidate) => ({
              ...candidate,
              draftRecord: null,
              humanDecisions: null,
              complianceResult: null,
              reviewStatus: "pending" as const
            }));

      return {
        ...artifactSession,
        files,
        candidates,
        displayCandidates,
        mappedArtifacts,
        candidateCount: displayCandidates.length,
        uncertainCandidateCount: candidates.filter(
          (candidate) => candidate.complianceResult?.summary.uncertain || candidate.mappingState !== "mapped" || candidate.relationshipState !== "mapped"
        ).length,
        blockedCandidateCount: candidates.filter((candidate) => (candidate.complianceResult?.summary.blocked ?? 0) > 0).length,
        pendingReviewCount: candidates.filter((candidate) =>
          candidate.reviewStatus === "pending" || candidate.reviewStatus === "follow_up_needed"
        ).length,
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
      organizationName: organization.organizationName,
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
          ? "Imported markdown artifacts are now classified, parsed into candidate sections, and mapped into reviewable AAS candidates."
          : "No import sessions exist yet. Upload markdown artifacts to start the governed import path."
    };
  } catch (error) {
    return {
      state: "unavailable" as const,
      organizationName: organization.organizationName,
      summary: {
        sessions: 0,
        files: 0,
        pendingClassification: 0,
        parsedSections: 0,
        candidateObjects: 0,
        humanReviewRequired: 0
      },
      sessions: [],
      message: error instanceof Error ? error.message : "Import data could not be loaded."
    };
  }
}
