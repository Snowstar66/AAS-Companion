import {
  artifactCandidateDraftRecordSchema,
  artifactCandidateHumanDecisionSchema,
  artifactIssueDispositionMapSchema,
  artifactComplianceResultSchema,
  artifactMappingResultSchema,
  artifactParseResultSchema,
  type ArtifactMappingResult,
  type ArtifactParseResult
} from "@aas-companion/domain/artifact-intake";
import { artifactCandidateReviewStatusSchema } from "@aas-companion/domain/enums";
import { unstable_rethrow } from "next/navigation";
import { getArtifactIntakeFileService, listArtifactIntakeSessionsService } from "@aas-companion/api/intake";
import { listEpicsService } from "@aas-companion/api/epics";
import { listOutcomesService } from "@aas-companion/api/outcomes";
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

function parseStoredIssueDispositions(value: unknown) {
  const parsed = artifactIssueDispositionMapSchema.safeParse(value);
  return parsed.success ? parsed.data : {};
}

function parseStoredReviewStatus(value: unknown) {
  const parsed = artifactCandidateReviewStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : "pending";
}

function unresolvedUnmappedSectionCount(input: {
  fileId: string;
  unmappedSections: Array<{ id: string; sourceReference: { fileId: string } }>;
  sectionDispositions: Record<string, { action: string }>;
}) {
  return input.unmappedSections.filter((section) => {
    if (section.sourceReference.fileId !== input.fileId) {
      return false;
    }

    const action = input.sectionDispositions[section.id]?.action;
    return !action || action === "pending" || action === "blocked";
  }).length;
}

type ArtifactIntakeWorkspaceSelection = {
  sessionId?: string | null | undefined;
  fileId?: string | null | undefined;
};

function isActiveImportCandidate(candidate: {
  reviewStatus: "pending" | "confirmed" | "edited" | "rejected" | "follow_up_needed" | "promoted";
  importedReadinessState?: string | null;
}) {
  if (candidate.reviewStatus === "rejected" || candidate.reviewStatus === "promoted") {
    return false;
  }

  if (candidate.importedReadinessState === "discarded") {
    return false;
  }

  return true;
}

export async function loadArtifactIntakeWorkspace(selection: ArtifactIntakeWorkspaceSelection = {}) {
  try {
    const organization = await requireOrganizationContext();
    const [result, outcomesResult, epicsResult] = await Promise.all([
      listArtifactIntakeSessionsService(organization.organizationId),
      listOutcomesService(organization.organizationId),
      listEpicsService(organization.organizationId)
    ]);

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
      const mappedArtifacts = parseStoredMappingResult(artifactSession.mappedArtifacts);
      const files = artifactSession.files.map((file) => {
        const parsedArtifacts = parseStoredParseResult(file.parsedArtifacts);
        const sectionDispositions = parseStoredIssueDispositions(file.sectionDispositions);
        const unresolvedUnmappedCount = unresolvedUnmappedSectionCount({
          fileId: file.id,
          unmappedSections: mappedArtifacts?.unmappedSections ?? [],
          sectionDispositions
        });

        return {
          ...file,
          content: "",
          parsedArtifacts,
          sectionDispositions,
          parsedSectionCount: parsedArtifacts?.sections.length ?? 0,
          uncertainSectionCount:
            parsedArtifacts?.sections.filter((section) => section.isUncertain || section.confidence === "low").length ?? 0,
          unresolvedUnmappedCount,
          activeImportWorkCount: unresolvedUnmappedCount
        };
      });
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
        issueDispositions: parseStoredIssueDispositions(candidate.issueDispositions),
        reviewStatus: parseStoredReviewStatus(candidate.reviewStatus)
      }));
      const activeCandidates = candidates.filter((candidate) => isActiveImportCandidate(candidate));
      const displayCandidates =
        candidates.length > 0
          ? activeCandidates
          : (mappedArtifacts?.candidates ?? []).map((candidate) => ({
              ...candidate,
              draftRecord: null,
              humanDecisions: null,
              complianceResult: null,
              issueDispositions: {},
              reviewStatus: "pending" as const
            }));
      const rejectedCandidates = candidates.filter((candidate) => candidate.reviewStatus === "rejected");
      const promotedCandidates = candidates.filter((candidate) => candidate.reviewStatus === "promoted");
      const filesWithActiveWork = files.map((file) => {
        const fileCandidates = candidates.filter((candidate) => candidate.fileId === file.id);
        const activeFileCandidates = activeCandidates.filter((candidate) => candidate.fileId === file.id);
        const clearedFileCandidates = fileCandidates.filter(
          (candidate) => candidate.reviewStatus === "rejected" || candidate.reviewStatus === "promoted"
        );
        const allPersistedFileCandidatesCleared =
          fileCandidates.length > 0 && clearedFileCandidates.length === fileCandidates.length;

        return {
          ...file,
          activeImportWorkCount: allPersistedFileCandidatesCleared
            ? 0
            : file.activeImportWorkCount + activeFileCandidates.length
        };
      });
      const activeImportWorkCount = filesWithActiveWork.reduce((count, file) => count + file.activeImportWorkCount, 0);

      return {
        ...artifactSession,
        files: filesWithActiveWork,
        candidates: activeCandidates,
        allCandidates: candidates,
        displayCandidates,
        mappedArtifacts,
        candidateCount: displayCandidates.length,
        uncertainCandidateCount: activeCandidates.filter(
          (candidate) => candidate.complianceResult?.summary.uncertain || candidate.mappingState !== "mapped" || candidate.relationshipState !== "mapped"
        ).length,
        blockedCandidateCount: activeCandidates.filter((candidate) => (candidate.complianceResult?.summary.blocked ?? 0) > 0).length,
        pendingReviewCount: activeCandidates.filter((candidate) =>
          candidate.reviewStatus === "pending" || candidate.reviewStatus === "follow_up_needed"
        ).length,
        rejectedCandidateCount: rejectedCandidates.length,
        promotedCandidateCount: promotedCandidates.length,
        clearedCandidateCount: rejectedCandidates.length + promotedCandidates.length,
        activeImportWorkCount,
        unmappedSectionCount: mappedArtifacts?.unmappedSections.length ?? 0
      };
    });

    const selectedSession =
      sessions.find((artifactSession) => artifactSession.id === selection.sessionId) ?? sessions[0] ?? null;
    const selectedFile =
      selectedSession?.files.find((artifactFile) => artifactFile.id === selection.fileId) ?? selectedSession?.files[0] ?? null;

    if (selectedSession && selectedFile) {
      const fileResult = await getArtifactIntakeFileService(organization.organizationId, selectedFile.id);

      if (fileResult.ok && fileResult.data) {
        const parsedArtifacts = parseStoredParseResult(fileResult.data.parsedArtifacts);

        selectedSession.files = selectedSession.files.map((file) =>
          file.id === fileResult.data?.id
            ? {
                ...file,
                ...fileResult.data,
                parsedArtifacts,
                sectionDispositions: parseStoredIssueDispositions(fileResult.data.sectionDispositions),
                parsedSectionCount: parsedArtifacts?.sections.length ?? 0,
                uncertainSectionCount:
                  parsedArtifacts?.sections.filter((section) => section.isUncertain || section.confidence === "low").length ?? 0
              }
            : file
        );
      }
    }

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
      projectOutcomes: outcomesResult.ok
        ? outcomesResult.data.map((outcome) => ({
            id: outcome.id,
            key: outcome.key,
            title: outcome.title
          }))
        : [],
      projectEpics: epicsResult.ok
        ? epicsResult.data.map((epic) => ({
            id: epic.id,
            key: epic.key,
            title: epic.title,
            outcomeId: epic.outcomeId
          }))
        : [],
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
          ? "Imported text and markdown artifacts are now classified, parsed into candidate sections, and mapped into reviewable AAS candidates."
          : "No import sessions exist yet. Upload import artifacts to start the governed import path."
      };
  } catch (error) {
    unstable_rethrow(error);

    return {
      state: "unavailable" as const,
      organizationName: "Unknown project",
      projectOutcomes: [],
      projectEpics: [],
      summary: {
        sessions: 0,
        files: 0,
        pendingClassification: 0,
        parsedSections: 0,
        candidateObjects: 0,
        humanReviewRequired: 0
      },
      sessions: [],
      message: error instanceof Error ? `Import is unavailable right now: ${error.message}` : "Import data could not be loaded."
    };
  }
}
