import {
  artifactCandidateDraftRecordSchema,
  artifactCandidateHumanDecisionSchema,
  artifactComplianceResultSchema,
  artifactParseResultSchema
} from "@aas-companion/domain";
import { listArtifactCandidateQueueService } from "@aas-companion/api";
import { requireOrganizationContext } from "@/lib/auth/guards";

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

function parseParsedArtifacts(value: unknown) {
  const parsed = artifactParseResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function loadArtifactReviewQueue() {
  const organization = await requireOrganizationContext();
  const result = await listArtifactCandidateQueueService(organization.organizationId);

  if (!result.ok) {
    return {
      state: "unavailable" as const,
      organizationName: organization.organizationName,
      items: [],
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

  const items = result.data.map((candidate) => ({
    ...candidate,
    draftRecord: parseDraftRecord(candidate.draftRecord),
    humanDecisions: parseHumanDecisions(candidate.humanDecisions),
    complianceResult: parseComplianceResult(candidate.complianceResult),
    file: {
      ...candidate.file,
      parsedArtifacts: parseParsedArtifacts(candidate.file.parsedArtifacts)
    }
  }));

  return {
    state: "ready" as const,
    organizationName: organization.organizationName,
    items,
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
}
