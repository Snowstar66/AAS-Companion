import {
  artifactCandidateDraftRecordSchema,
  artifactCandidateHumanDecisionSchema,
  artifactIssueDispositionMapSchema,
  artifactComplianceResultSchema,
  getArtifactCandidateIssueProgress
} from "@aas-companion/domain/artifact-intake";
import { unstable_rethrow } from "next/navigation";
import { getArtifactCandidateService, listArtifactCandidateQueueService } from "@aas-companion/api/intake";
import { requireOrganizationContext } from "@/lib/auth/guards";

type ParsedIssueDispositions = ReturnType<typeof artifactIssueDispositionMapSchema.parse>;

function parseDraftRecord(value: unknown) {
  const parsed = artifactCandidateDraftRecordSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseHumanDecisions(value: unknown) {
  const parsed = artifactCandidateHumanDecisionSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseComplianceResult(value: unknown) {
  const parsed = artifactComplianceResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function parseIssueDispositions(value: unknown) {
  const parsed = artifactIssueDispositionMapSchema.safeParse(value);
  return parsed.success ? parsed.data : artifactIssueDispositionMapSchema.parse({});
}

function parseImportIntent(value: unknown) {
  return value === "design" ? "design" : "framing";
}

function buildIssueProgress(
  complianceResult: ReturnType<typeof parseComplianceResult>,
  issueDispositions: ParsedIssueDispositions
) {
  return complianceResult
    ? getArtifactCandidateIssueProgress({
        complianceResult,
        issueDispositions
      })
    : {
        total: 0,
        resolved: 0,
        unresolved: 0,
        categories: {
          missing: 0,
          uncertain: 0,
          humanOnly: 0,
          blocked: 0,
          unmapped: 0
        }
      };
}

function parseReviewCandidate<T extends {
  draftRecord: unknown;
  humanDecisions: unknown;
  complianceResult: unknown;
  issueDispositions: unknown;
  intakeSession?: {
    id?: unknown;
    label?: unknown;
    importIntent?: unknown;
  } | null;
}>(candidate: T) {
  const complianceResult = parseComplianceResult(candidate.complianceResult);
  const issueDispositions = parseIssueDispositions(candidate.issueDispositions);

  return {
    ...candidate,
    intakeSession: {
      id: typeof candidate.intakeSession?.id === "string" ? candidate.intakeSession.id : "",
      label: typeof candidate.intakeSession?.label === "string" ? candidate.intakeSession.label : "",
      importIntent: parseImportIntent(candidate.intakeSession?.importIntent)
    },
    draftRecord: parseDraftRecord(candidate.draftRecord),
    humanDecisions: parseHumanDecisions(candidate.humanDecisions),
    complianceResult,
    issueDispositions,
    issueProgress: buildIssueProgress(complianceResult, issueDispositions)
  };
}

export async function loadArtifactReviewQueue(selectedCandidateId?: string) {
  try {
    const organization = await requireOrganizationContext();
    const [result, selectedCandidateResult] = await Promise.all([
      listArtifactCandidateQueueService(organization.organizationId),
      selectedCandidateId ? getArtifactCandidateService(organization.organizationId, selectedCandidateId) : Promise.resolve(null)
    ]);

    if (!result.ok) {
      return {
        state: "unavailable" as const,
        organizationName: organization.organizationName,
        items: [],
        selectedCandidate: null,
        summary: {
          total: 0,
          pending: 0,
          followUpNeeded: 0,
          rejected: 0,
          promoted: 0
        },
        message: result.errors[0]?.message ?? "Review queue could not be loaded."
      };
    }

    const items = result.data.map((candidate) => parseReviewCandidate(candidate));
    const selectedCandidate =
      selectedCandidateResult && selectedCandidateResult.ok && selectedCandidateResult.data
        ? parseReviewCandidate(selectedCandidateResult.data)
        : null;

    return {
      state: "ready" as const,
      organizationName: organization.organizationName,
      items,
      selectedCandidate,
      summary: {
        total: items.length,
        pending: items.filter((item) => item.reviewStatus === "pending").length,
        followUpNeeded: items.filter((item) => item.reviewStatus === "follow_up_needed").length,
        rejected: items.filter((item) => item.reviewStatus === "rejected").length,
        promoted: items.filter((item) => item.reviewStatus === "promoted").length
      },
      message:
        items.length > 0
          ? "Imported candidate objects are ready for deterministic compliance review, human confirmation, and promotion."
          : "No imported candidates are waiting for human review."
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      state: "unavailable" as const,
      organizationName: "Unknown project",
      items: [],
      selectedCandidate: null,
      summary: {
        total: 0,
        pending: 0,
        followUpNeeded: 0,
        rejected: 0,
        promoted: 0
      },
      message: error instanceof Error ? `Human Review is unavailable right now: ${error.message}` : "Human Review is unavailable right now."
    };
  }
}
