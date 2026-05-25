import {
  getControlMirrorSourcePolicy
} from "./control-mirror-source";
import {
  enrichControlMirrorHumanReviewItem,
  getControlMirrorHumanReviewState,
  summarizeControlMirrorHumanReviewState
} from "./control-mirror-human-review";
import {
  buildControlMirrorReportSummaryItems,
  summarizeControlMirrorEvidenceRetention
} from "./control-mirror-report";
import type {
  ControlMirrorEvidenceRetentionMode,
  ControlMirrorRejectedUploadedSnapshotFile,
  ControlMirrorSourcePolicy
} from "./control-mirror-source";
import type {
  ControlMirrorHumanReviewItem,
  ControlMirrorHumanReviewStateSummary
} from "./control-mirror-human-review";

export {
  applyControlMirrorEvidenceRetentionPolicy,
  getControlMirrorRetentionModeForSourceType,
  getControlMirrorSourcePolicy,
  normalizeControlMirrorUploadedSnapshotPath,
  validateControlMirrorUploadedSnapshotFiles
} from "./control-mirror-source";
export type {
  ControlMirrorEvidenceRetentionDecision,
  ControlMirrorEvidenceRetentionMode,
  ControlMirrorRejectedUploadedSnapshotFile,
  ControlMirrorSourceModeSupportStatus,
  ControlMirrorSourcePolicy,
  ControlMirrorUploadedSnapshotFileInput,
  ControlMirrorUploadedSnapshotRejectionReason,
  ControlMirrorUploadedSnapshotValidationResult,
  ControlMirrorValidatedUploadedSnapshotFile
} from "./control-mirror-source";
export {
  createControlMirrorHumanReviewStableKey,
  createControlMirrorReviewHref,
  enrichControlMirrorHumanReviewItem,
  getControlMirrorHumanReviewState,
  summarizeControlMirrorHumanReviewState
} from "./control-mirror-human-review";
export type {
  ControlMirrorHumanReviewDecisionType,
  ControlMirrorHumanReviewItem,
  ControlMirrorHumanReviewState,
  ControlMirrorHumanReviewStateSummary
} from "./control-mirror-human-review";
export {
  buildControlMirrorEvidencePack,
  buildControlMirrorEvidencePackAcceptancePolicy,
  buildControlMirrorEvidencePackFileName,
  buildControlMirrorEvidencePackMarkdown,
  ensureControlMirrorEvidencePackAcceptancePolicy,
  buildControlMirrorReportSummaryItems,
  summarizeControlMirrorEvidenceRetention
} from "./control-mirror-report";
export type {
  ControlMirrorEvidencePack,
  ControlMirrorEvidencePackAcceptancePolicy
} from "./control-mirror-report";

export type ControlMirrorAiLevel = "level_1" | "level_2" | "level_3";

export type ControlMirrorStatus = "ready" | "conditional" | "blocked" | "downgrade_required" | "human_approval_required";

export type ControlMirrorCheckStatus =
  | "aligned"
  | "partial"
  | "gap"
  | "risk"
  | "blocked";

export type ControlMirrorArtifactType =
  | "framing_source"
  | "design_artifact"
  | "architecture_artifact"
  | "ux_artifact"
  | "delivery_story"
  | "implementation_note"
  | "test_evidence"
  | "qa_review"
  | "ai_risk_ledger"
  | "decision_log"
  | "workflow_log"
  | "final_report"
  | "unknown_artifact";

type BmadComparisonEntry = {
  artifactPath: string;
  artifactType: string;
  evidenceState: string;
  sourceOutcomeId: string;
  sourceEpicId: string;
  sourceStoryIdeaId: string;
  deliveryStoryId: string;
  decisionId: string;
  testIds: string[];
  verificationResult: string;
  remainingGap: string;
};

export type ControlMirrorNormalizedEvidenceType =
  | "framing_design_evidence"
  | "architecture_evidence"
  | "journey_ux_evidence"
  | "delivery_story_candidate"
  | "implementation_evidence"
  | "test_evidence"
  | "ai_review_evidence"
  | "ai_risk_ledger"
  | "decision_log"
  | "workflow_log"
  | "final_report"
  | "unknown_evidence";

export type ControlMirrorStoryClassification =
  | "framing_story_idea"
  | "candidate_delivery_story"
  | "exploration_story"
  | "epic_candidate"
  | "acceptance_criteria_candidate"
  | "journey_ux_context"
  | "out_of_scope_deferred"
  | "not_story_like";

export type ControlMirrorStoryReadinessState =
  | "ready_for_build"
  | "needs_refinement"
  | "deferred"
  | "not_story_like";

export type ControlMirrorFramingAlignmentStatus =
  | "aligned"
  | "partially_aligned"
  | "weak_value_alignment"
  | "potential_scope_drift"
  | "out_of_scope"
  | "needs_human_review";

export type ControlMirrorBuildConformanceStatus =
  | "right_built"
  | "partially_built"
  | "built_but_unverified"
  | "built_but_weakly_traced"
  | "untraced_artifact"
  | "potential_scope_drift"
  | "release_risk";

export type ControlMirrorAiLevelRecommendation =
  | "proceed_at_requested_level"
  | "proceed_with_controls"
  | "downgrade"
  | "pause"
  | "request_exception_approval";

export type ControlMirrorTestLevel =
  | "unit"
  | "integration"
  | "system"
  | "regression"
  | "security"
  | "manual_verification"
  | "behavioural_contract"
  | "unknown";

export type ControlMirrorTestResult = "passing" | "failing" | "unknown";

export type ControlMirrorStoryCoverageState =
  | "no_test"
  | "test_definition_only"
  | "implemented_tests"
  | "passing_tests"
  | "failing_tests"
  | "manual_verification_only"
  | "behavioural_contract_tests";

export type ControlMirrorOutcomeInput = {
  id: string;
  key: string;
  title: string;
  framingVersion?: number | null;
  valueOwnerId?: string | null;
  outcomeStatement?: string | null;
  problemStatement?: string | null;
  baselineDefinition?: string | null;
  solutionConstraints?: string | null;
  riskProfile?: string | null;
  aiAccelerationLevel: ControlMirrorAiLevel;
  status?: string | null;
  epics: ControlMirrorEpicInput[];
  directionSeeds: ControlMirrorDirectionSeedInput[];
};

export type ControlMirrorEpicInput = {
  id: string;
  key: string;
  title: string;
  purpose?: string | null;
  directionSeeds: ControlMirrorDirectionSeedInput[];
  stories: ControlMirrorStoryInput[];
};

export type ControlMirrorDirectionSeedInput = {
  id: string;
  key: string;
  title: string;
  shortDescription?: string | null;
  expectedBehavior?: string | null;
  sourceStoryId?: string | null;
};

export type ControlMirrorStoryInput = {
  id: string;
  key: string;
  title: string;
  outcomeId: string;
  epicId: string;
  valueIntent?: string | null;
  expectedBehavior?: string | null;
  acceptanceCriteria: string[];
  aiUsageScope?: string[];
  aiAccelerationLevel?: ControlMirrorAiLevel | null;
  testDefinition?: string | null;
  definitionOfDone: string[];
  status?: string | null;
  tollgateStatus?: "blocked" | "ready" | "approved" | null;
};

export type ControlMirrorArtifactInput = {
  id: string;
  fileName: string;
  filePath?: string | null;
  sourceType?: string | null;
  sourceConfidence?: "high" | "medium" | "low" | null;
  sizeBytes: number;
  content?: string | null;
  parsedAt?: Date | string | null;
  uploadedAt?: Date | string | null;
};

export type ControlMirrorCandidateInput = {
  id: string;
  type: "outcome" | "epic" | "story";
  title: string;
  mappingState: "mapped" | "uncertain" | "missing";
  relationshipState: "mapped" | "uncertain" | "missing";
  reviewStatus: string;
  importedReadinessState?: string | null;
  promotedEntityId?: string | null;
};

export type ControlMirrorSessionInput = {
  id: string;
  label: string;
  importIntent: "framing" | "design";
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  files: ControlMirrorArtifactInput[];
  candidates: ControlMirrorCandidateInput[];
};

export type ControlMirrorTollgateInput = {
  id: string;
  entityType: "outcome" | "story" | string;
  entityId: string;
  tollgateType: string;
  status: "blocked" | "ready" | "approved" | string;
  blockers: string[];
};

export type ControlMirrorSignoffInput = {
  id: string;
  entityType: "outcome" | "story" | string;
  entityId: string;
  decisionKind: string;
  decisionStatus: string;
  evidenceReference?: string | null;
};

export type BuildControlMirrorInput = {
  organizationName: string;
  outcomes: ControlMirrorOutcomeInput[];
  artifactSessions: ControlMirrorSessionInput[];
  persistentSnapshot?: ControlMirrorPersistentSnapshotInput | null;
  tollgates: ControlMirrorTollgateInput[];
  signoffRecords: ControlMirrorSignoffInput[];
};

export type ControlMirrorPersistentSnapshotInput = {
  id: string;
  label: string;
  sourceType: string;
  scanTime: Date | string | null;
  sessionCount?: number | null;
  fileCount: number;
  candidateCount?: number | null;
  unchangedCount?: number | null;
  newCount?: number | null;
  modifiedCount?: number | null;
  deletedCount?: number | null;
  unreadableCount?: number | null;
  rejectedCount?: number | null;
  acceptedCount?: number | null;
  rejectedFiles?: ControlMirrorRejectedUploadedSnapshotFile[];
  artifacts: ControlMirrorArtifactSummary[];
  normalizedEvidence?: ControlMirrorNormalizedEvidenceSummary[];
};

export type ControlMirrorMetric = {
  id: string;
  label: string;
  value: number;
  total: number;
  percentage: number;
  status: ControlMirrorCheckStatus;
  description: string;
};

export type ControlMirrorArtifactSummary = {
  id: string;
  fileName: string;
  artifactType: ControlMirrorArtifactType;
  lineageStatus: "traced" | "weak" | "missing";
  parsingConfidence: "high" | "medium" | "low";
  changeStatus?: "unchanged" | "new" | "modified" | "deleted" | "unreadable";
  storyId: string | null;
};

export type ControlMirrorNormalizedEvidenceSummary = {
  id: string;
  artifactId: string;
  fileName: string;
  evidenceType: ControlMirrorNormalizedEvidenceType;
  label: string;
  sourceSection: string;
  storyClassification: ControlMirrorStoryClassification;
  readinessState: ControlMirrorStoryReadinessState;
  missingReadinessFields: string[];
  storyId: string | null;
  retentionMode?: ControlMirrorEvidenceRetentionMode;
  retentionDisclosure?: string;
  redactionApplied?: boolean;
  sensitiveFindingCount?: number;
};

export type ControlMirrorConformanceFinding = {
  id: string;
  category: "framing_alignment" | "scope_drift" | "build_conformance" | "ai_level_evidence";
  severity: "high" | "medium" | "low";
  status: ControlMirrorFramingAlignmentStatus | ControlMirrorBuildConformanceStatus | ControlMirrorAiLevelRecommendation;
  artifactId?: string | null;
  evidenceId?: string | null;
  label: string;
  affectedObject: string;
  recommendedAction: string;
  rationale: string;
};

export type ControlMirrorTestEvidenceItem = {
  id: string;
  testId: string;
  fileName: string;
  storyId: string | null;
  epicId: string | null;
  outcomeId: string | null;
  testLevel: ControlMirrorTestLevel;
  result: ControlMirrorTestResult;
  automationStatus: "automated" | "manual" | "unknown";
  evidenceSource: string;
};

export type ControlMirrorValueSpineCoverageItem = {
  id: string;
  storyId: string;
  storyKey: string;
  storyTitle: string;
  epicId: string | null;
  outcomeId: string | null;
  coverageState: ControlMirrorStoryCoverageState;
  testEvidenceCount: number;
  passingEvidenceCount: number;
  failingEvidenceCount: number;
  missingLinks: string[];
};

export type ControlMirrorGuardrailFinding = {
  id: string;
  category:
    | "baseline"
    | "value_spine"
    | "risk_ledger"
    | "mandate"
    | "aida_aqa_capacity"
    | "test_evidence"
    | "governance_funding";
  label: string;
  requiredFor: ControlMirrorAiLevel;
  present: boolean;
  severity: "high" | "medium" | "low";
  affectedObject: string;
  recommendedAction: string;
  rationale: string;
};

export type ControlMirrorReportSummaryItem = {
  id: string;
  label: string;
  value: string | number;
  status: ControlMirrorCheckStatus | ControlMirrorStatus;
};

export type ControlMirrorDashboard = {
  organizationName: string;
  snapshot: {
    id: string;
    isPersistent: boolean;
    label: string;
    sourceType: string;
    scanTime: string | null;
    sessionCount: number;
    fileCount: number;
    candidateCount: number;
    unchangedCount: number;
    newCount: number;
    modifiedCount: number;
    deletedCount: number;
    unreadableCount: number;
    rejectedCount: number;
    acceptedCount: number;
  };
  uploadSummary: {
    isUploadedSnapshot: boolean;
    acceptedCount: number;
    rejectedCount: number;
    unreadableCount: number;
    unchangedCount: number;
    newCount: number;
    modifiedCount: number;
    deletedCount: number;
    rejectedFiles: ControlMirrorRejectedUploadedSnapshotFile[];
    unreadableFiles: Array<{
      fileName: string;
      filePath: string;
    }>;
  };
  sourcePolicy: ControlMirrorSourcePolicy;
  requestedAiLevel: ControlMirrorAiLevel;
  achievedAiLevel: ControlMirrorAiLevel;
  releaseReadiness: ControlMirrorStatus;
  metrics: ControlMirrorMetric[];
  artifacts: ControlMirrorArtifactSummary[];
  normalizedEvidence: ControlMirrorNormalizedEvidenceSummary[];
  normalization: {
    evidenceCount: number;
    storyLikeItems: number;
    candidateDeliveryStories: number;
    storyIdeas: number;
    explorationStories: number;
    outOfScopeItems: number;
    readyForBuild: number;
    needsRefinement: number;
  };
  conformance: {
    framingAligned: number;
    framingPartial: number;
    weakValueAlignment: number;
    scopeDrift: number;
    outOfScope: number;
    rightBuilt: number;
    weaklyTracedBuild: number;
    untracedBuildArtifacts: number;
    releaseRisk: number;
    aiLevelRecommendation: ControlMirrorAiLevelRecommendation;
    findings: ControlMirrorConformanceFinding[];
  };
  guardrails: {
    checked: number;
    passed: number;
    flagged: number;
    findings: ControlMirrorGuardrailFinding[];
  };
  designProgress: {
    storyIdeas: number;
    classifiedItems: number;
    refinedDeliveryStories: number;
    storiesWithAcceptanceCriteria: number;
    storiesWithTestDefinition: number;
    readyForBuild: number;
    blockedStories: number;
  };
  buildConformance: {
    rightBuilt: number;
    partiallyBuilt: number;
    builtButUnverified: number;
    weaklyTraced: number;
    untracedArtifacts: number;
    releaseRisk: number;
  };
  testEvidence: {
    storiesWithNoTest: number;
    storiesWithTestDefinitionOnly: number;
    storiesWithImplementedTests: number;
    storiesWithPassingTests: number;
    storiesWithFailingTests: number;
    manualVerificationOnly: number;
    behaviouralContractTests: number;
    mappedEvidence: ControlMirrorTestEvidenceItem[];
    valueSpineCoverage: ControlMirrorValueSpineCoverageItem[];
    brokenValueSpineLinks: number;
    untracedImplementationArtifacts: ControlMirrorArtifactSummary[];
  };
  aiEvidence: Array<{
    id: string;
    label: string;
    requiredFor: ControlMirrorAiLevel;
    present: boolean;
    detail: string;
  }>;
  humanReviewItems: ControlMirrorHumanReviewItem[];
  reviewStateSummary: ControlMirrorHumanReviewStateSummary;
  report: {
    activeProject: string;
    approvedFramingVersion: string;
    snapshotId: string;
    requestedAiLevel: ControlMirrorAiLevel;
    achievedAiLevel: ControlMirrorAiLevel;
    releaseReadiness: ControlMirrorStatus;
    evidenceSummaries: ControlMirrorReportSummaryItem[];
    openHumanReviewItems: number;
    blockingHumanReviewItems: number;
    scopeDriftItems: number;
    untracedArtifacts: number;
    aiRiskLedgerSummary: string;
    decisionLogSummary: string;
    requiredApprovals: string[];
    blockingGaps: string[];
    residualRisks: string[];
    recommendedNextStep: string;
    executionStatement: string;
    evidenceRetentionSummary: string;
  };
};

const aiLevelWeight: Record<ControlMirrorAiLevel, number> = {
  level_1: 1,
  level_2: 2,
  level_3: 3
};

function isPresent(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function percentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function statusFromPercentage(value: number): ControlMirrorCheckStatus {
  if (value >= 90) return "aligned";
  if (value >= 65) return "partial";
  if (value > 0) return "gap";
  return "blocked";
}

function highestAiLevel(levels: Array<ControlMirrorAiLevel | null | undefined>): ControlMirrorAiLevel {
  return levels.reduce<ControlMirrorAiLevel>((highest, level) => {
    if (!level) return highest;
    return aiLevelWeight[level] > aiLevelWeight[highest] ? level : highest;
  }, "level_1");
}

function flattenStories(outcomes: ControlMirrorOutcomeInput[]) {
  return outcomes.flatMap((outcome) => outcome.epics.flatMap((epic) => epic.stories));
}

function flattenDirectionSeeds(outcomes: ControlMirrorOutcomeInput[]) {
  const byId = new Map<string, ControlMirrorDirectionSeedInput>();

  for (const outcome of outcomes) {
    for (const seed of outcome.directionSeeds) {
      byId.set(seed.id, seed);
    }
    for (const epic of outcome.epics) {
      for (const seed of epic.directionSeeds) {
        byId.set(seed.id, seed);
      }
    }
  }

  return [...byId.values()];
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function containsAnyToken(value: string, tokens: string[]) {
  const haystack = normalizeSearchText(value);
  return tokens.some((token) => token.length >= 3 && haystack.includes(token.toLowerCase()));
}

function buildFramingTokens(outcomes: ControlMirrorOutcomeInput[]) {
  const tokens = new Set<string>();

  for (const outcome of outcomes) {
    for (const value of [
      outcome.key,
      outcome.title,
      outcome.outcomeStatement,
      outcome.problemStatement,
      outcome.baselineDefinition,
      outcome.solutionConstraints,
      outcome.riskProfile
    ]) {
      for (const token of normalizeSearchText(value).split(/[^a-z0-9-]+/i)) {
        if (token.length >= 4) {
          tokens.add(token);
        }
      }
    }

    for (const epic of outcome.epics) {
      for (const value of [epic.key, epic.title, epic.purpose]) {
        for (const token of normalizeSearchText(value).split(/[^a-z0-9-]+/i)) {
          if (token.length >= 4) {
            tokens.add(token);
          }
        }
      }

      for (const story of epic.stories) {
        for (const value of [story.key, story.title, story.valueIntent, story.expectedBehavior]) {
          for (const token of normalizeSearchText(value).split(/[^a-z0-9-]+/i)) {
            if (token.length >= 4) {
              tokens.add(token);
            }
          }
        }
      }
    }
  }

  return [...tokens];
}

function detectStoryId(value: string) {
  return /\b(?:CM|STR|STORY|M\d+-STORY)-\d+(?:\.\d+)?\b/i.exec(value)?.[0] ?? null;
}

export function classifyControlMirrorArtifact(input: Pick<ControlMirrorArtifactInput, "fileName" | "sourceType" | "content">): ControlMirrorArtifactType {
  const haystack = `${input.fileName}\n${input.sourceType ?? ""}\n${input.content ?? ""}`.toLowerCase();

  if (/bmad-comparison-(manifest|matrix)|control-mirror\/bmad-comparison/.test(haystack)) return "decision_log";
  if (/risk.?ledger|risk register|ai risk/.test(haystack)) return "ai_risk_ledger";
  if (/decision.?log|adr-|architecture decision/.test(haystack)) return "decision_log";
  if (/workflow.?log|handoff|role handoff/.test(haystack)) return "workflow_log";
  if (/final.?report|evidence.?pack|control report|delivery report/.test(haystack)) return "final_report";
  if (/qa|aqa|quality review|review evidence/.test(haystack)) return "qa_review";
  if (/test|spec\.ts|spec\.tsx|verification|playwright|vitest/.test(haystack)) return "test_evidence";
  if (/architecture|solution design|blueprint|technical/.test(haystack)) return "architecture_artifact";
  if (/ux|journey|wireframe|prototype/.test(haystack)) return "ux_artifact";
  if (/implementation|src\/|apps\/|packages\/|component|route\.ts|page\.tsx/.test(haystack)) return "implementation_note";
  if (/story|acceptance criteria|definition of done/.test(haystack)) return "delivery_story";
  if (/prd|product brief|framing|outcome|baseline/.test(haystack) || input.sourceType === "bmad_prd") return "framing_source";
  if (/design/.test(haystack)) return "design_artifact";

  return "unknown_artifact";
}

function hasPattern(value: string, pattern: RegExp) {
  return pattern.test(value);
}

function mapArtifactTypeToEvidenceType(artifactType: ControlMirrorArtifactType): ControlMirrorNormalizedEvidenceType {
  if (artifactType === "framing_source" || artifactType === "design_artifact") return "framing_design_evidence";
  if (artifactType === "architecture_artifact") return "architecture_evidence";
  if (artifactType === "ux_artifact") return "journey_ux_evidence";
  if (artifactType === "delivery_story") return "delivery_story_candidate";
  if (artifactType === "implementation_note") return "implementation_evidence";
  if (artifactType === "test_evidence") return "test_evidence";
  if (artifactType === "qa_review") return "ai_review_evidence";
  if (artifactType === "ai_risk_ledger") return "ai_risk_ledger";
  if (artifactType === "decision_log") return "decision_log";
  if (artifactType === "workflow_log") return "workflow_log";
  if (artifactType === "final_report") return "final_report";
  return "unknown_evidence";
}

function getRecordString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return "";
}

function splitListValue(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[;|,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeBmadComparisonRecord(record: Record<string, unknown>): BmadComparisonEntry {
  const artifactPath = getRecordString(record, ["artifact_path", "artifactPath", "path", "file", "file_path", "implementation_artifacts"]);
  const artifactType = getRecordString(record, ["artifact_type", "artifactType", "type", "work_item_type", "category"]);
  const evidenceState = getRecordString(record, ["evidence_state", "evidenceState", "status", "state", "implementation_status"]);
  const sourceOutcomeId = getRecordString(record, ["source_outcome_id", "sourceOutcomeId", "outcome_id", "outcomeId", "outcome"]);
  const sourceEpicId = getRecordString(record, ["source_epic_id", "sourceEpicId", "epic_id", "epicId", "epic"]);
  const sourceStoryIdeaId = getRecordString(record, ["source_story_idea_id", "sourceStoryIdeaId", "story_idea_id", "storyIdeaId", "story_idea"]);
  const deliveryStoryId = getRecordString(record, ["delivery_story_id", "deliveryStoryId", "story_id", "storyId", "story", "story_key"]);
  const decisionId = getRecordString(record, ["decision_id", "decisionId", "decision"]);
  const testIdsValue = record.test_ids ?? record.testIds ?? record.tests ?? record.test_id ?? record.testId;
  const verificationResult = getRecordString(record, ["verification_result", "verificationResult", "test_result", "testResult", "result"]);
  const remainingGap = getRecordString(record, ["remaining_gap", "remainingGap", "gap", "known_gap", "knownGap", "customer_decision_needed"]);

  return {
    artifactPath,
    artifactType,
    evidenceState,
    sourceOutcomeId,
    sourceEpicId,
    sourceStoryIdeaId,
    deliveryStoryId,
    decisionId,
    testIds: splitListValue(testIdsValue),
    verificationResult,
    remainingGap
  };
}

function parseBmadComparisonManifest(content: string): BmadComparisonEntry[] {
  try {
    const parsed = JSON.parse(content) as unknown;
    const records = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? [
            ...("entries" in parsed && Array.isArray(parsed.entries) ? parsed.entries : []),
            ...("items" in parsed && Array.isArray(parsed.items) ? parsed.items : []),
            ...("manifest" in parsed && Array.isArray(parsed.manifest) ? parsed.manifest : [])
          ]
        : [];

    return records
      .filter((record): record is Record<string, unknown> => Boolean(record && typeof record === "object" && !Array.isArray(record)))
      .map(normalizeBmadComparisonRecord)
      .filter((entry) => isPresent(entry.artifactPath) || isPresent(entry.deliveryStoryId) || isPresent(entry.sourceStoryIdeaId) || entry.testIds.length > 0);
  } catch {
    return [];
  }
}

function parseControlMirrorCsv(content: string) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const delimiter = lines[0]!.includes(";") && !lines[0]!.includes(",") ? ";" : ",";
  const parseLine = (line: string) => {
    const values: string[] = [];
    let current = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      const nextCharacter = line[index + 1];

      if (character === "\"" && quoted && nextCharacter === "\"") {
        current += "\"";
        index += 1;
      } else if (character === "\"") {
        quoted = !quoted;
      } else if (character === delimiter && !quoted) {
        values.push(current.trim());
        current = "";
      } else {
        current += character;
      }
    }

    values.push(current.trim());
    return values;
  };
  const headers = parseLine(lines[0]!).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseBmadComparisonMatrix(content: string): BmadComparisonEntry[] {
  return parseControlMirrorCsv(content)
    .map(normalizeBmadComparisonRecord)
    .filter((entry) => isPresent(entry.artifactPath) || isPresent(entry.deliveryStoryId) || isPresent(entry.sourceStoryIdeaId) || entry.testIds.length > 0);
}

function parseBmadComparisonEvidence(fileName: string, content: string) {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.endsWith(".json") && /bmad-comparison-manifest|comparison-manifest/.test(normalizedName)) {
    return parseBmadComparisonManifest(content);
  }

  if (normalizedName.endsWith(".csv") && /bmad-comparison-matrix|comparison-matrix/.test(normalizedName)) {
    return parseBmadComparisonMatrix(content);
  }

  return [];
}

function getBmadComparisonEvidenceType(entry: BmadComparisonEntry): ControlMirrorNormalizedEvidenceType {
  const haystack = `${entry.artifactPath} ${entry.artifactType} ${entry.evidenceState} ${entry.verificationResult}`.toLowerCase();

  if (entry.testIds.length > 0 || /\b(test|tested|verification|passing|failing|manual)\b/.test(haystack)) {
    return "test_evidence";
  }

  if (/\b(implemented|implementation|src\/|apps\/|packages\/|component|route|page|tested)\b/.test(haystack)) {
    return "implementation_evidence";
  }

  if (/\b(decision|rejected|deferred|dropped|customer)\b/.test(`${haystack} ${entry.decisionId} ${entry.remainingGap}`)) {
    return "decision_log";
  }

  return "delivery_story_candidate";
}

function getBmadComparisonReadiness(entry: BmadComparisonEntry, evidenceType: ControlMirrorNormalizedEvidenceType): Pick<ControlMirrorNormalizedEvidenceSummary, "storyClassification" | "readinessState" | "missingReadinessFields"> {
  const state = entry.evidenceState.toLowerCase();
  const isDeferred = /\b(rejected|deferred|dropped|drop)\b/.test(state);

  if (isDeferred) {
    return {
      storyClassification: "out_of_scope_deferred",
      readinessState: "deferred",
      missingReadinessFields: []
    };
  }

  if (evidenceType !== "delivery_story_candidate" && evidenceType !== "implementation_evidence" && evidenceType !== "test_evidence") {
    return {
      storyClassification: "not_story_like",
      readinessState: "not_story_like",
      missingReadinessFields: []
    };
  }

  const missingReadinessFields = [
    ...(isPresent(entry.sourceOutcomeId) ? [] : ["linked outcome"]),
    ...(isPresent(entry.sourceEpicId) ? [] : ["linked epic"]),
    ...(isPresent(entry.deliveryStoryId) || isPresent(entry.sourceStoryIdeaId) ? [] : ["story id"]),
    ...(evidenceType === "test_evidence" || isPresent(entry.verificationResult) || entry.testIds.length > 0 ? [] : ["test definition"])
  ];

  return {
    storyClassification: "candidate_delivery_story",
    readinessState: missingReadinessFields.length === 0 && (evidenceType === "implementation_evidence" || evidenceType === "test_evidence") ? "ready_for_build" : "needs_refinement",
    missingReadinessFields
  };
}

function normalizeBmadComparisonEvidence(input: {
  artifactId: string;
  fileName: string;
  content: string;
}) {
  return parseBmadComparisonEvidence(input.fileName, input.content).map<Omit<ControlMirrorNormalizedEvidenceSummary, "id">>((entry, index) => {
    const evidenceType = getBmadComparisonEvidenceType(entry);
    const readiness = getBmadComparisonReadiness(entry, evidenceType);
    const storyId = entry.deliveryStoryId || entry.sourceStoryIdeaId || null;
    const testSuffix = entry.testIds.length > 0 ? ` tests ${entry.testIds.join(" ")}` : "";
    const labelParts = [
      entry.evidenceState || "comparison evidence",
      entry.artifactType,
      entry.artifactPath,
      entry.verificationResult,
      entry.remainingGap,
      testSuffix.trim()
    ].filter(Boolean);

    return {
      artifactId: input.artifactId,
      fileName: entry.artifactPath || input.fileName,
      evidenceType,
      label: labelParts.join(" | ") || `${input.fileName} row ${index + 1}`,
      sourceSection: `${input.fileName}#row-${index + 1}`,
      storyClassification: readiness.storyClassification,
      readinessState: readiness.readinessState,
      missingReadinessFields: readiness.missingReadinessFields,
      storyId
    };
  });
}

function detectStoryClassification(input: {
  artifactType: ControlMirrorArtifactType;
  storyId: string | null;
  haystack: string;
}): ControlMirrorStoryClassification {
  if (hasPattern(input.haystack, /\b(out of scope|scope out|deferred|won't build|wont build|not in scope)\b/i)) {
    return "out_of_scope_deferred";
  }

  if (hasPattern(input.haystack, /\b(exploration|explore|spike|research story|discovery story)\b/i)) {
    return "exploration_story";
  }

  if (input.artifactType === "ux_artifact" || hasPattern(input.haystack, /\b(journey|ux context|user flow|wireframe)\b/i)) {
    return "journey_ux_context";
  }

  if (hasPattern(input.haystack, /\bepic\b/i) && !hasPattern(input.haystack, /\bstory\b/i)) {
    return "epic_candidate";
  }

  if (hasPattern(input.haystack, /\bacceptance criteria\b/i) && !hasPattern(input.haystack, /\b(value intent|expected behavior|test definition)\b/i)) {
    return "acceptance_criteria_candidate";
  }

  if (input.storyId || input.artifactType === "delivery_story" || hasPattern(input.haystack, /\b(story|as a |i want|so that)\b/i)) {
    if (input.storyId || hasPattern(input.haystack, /\b(test definition|definition of done|ai usage scope)\b/i)) {
      return "candidate_delivery_story";
    }

    return "framing_story_idea";
  }

  return "not_story_like";
}

function detectMissingReadinessFields(input: {
  storyId: string | null;
  haystack: string;
}) {
  const requiredFields = [
    ["linked outcome", /\b(outcome|out-[a-z0-9-]+)\b/i],
    ["linked epic", /\b(epic|cm-\d+)\b/i],
    ["story id", /\b(?:CM|STR|STORY|M\d+-STORY)-\d+(?:\.\d+)?\b/i],
    ["value intent", /\b(value intent|value|so that)\b/i],
    ["expected behavior", /\b(expected behavior|behavior|then )\b/i],
    ["acceptance criteria", /\b(acceptance criteria|given |when |then )\b/i],
    ["test definition", /\b(test definition|test evidence|verification|vitest|playwright)\b/i],
    ["ai usage scope", /\b(ai usage scope|ai scope|ai-assisted|ai assisted|level_)\b/i]
  ] as const;

  return requiredFields
    .filter(([field, pattern]) => {
      if (field === "story id" && input.storyId) {
        return false;
      }

      return !hasPattern(input.haystack, pattern);
    })
    .map(([field]) => field);
}

export function normalizeControlMirrorArtifact(input: {
  artifactId: string;
  fileName: string;
  artifactType: ControlMirrorArtifactType;
  content?: string | null;
  sourceExcerpt?: string | null;
  storyId?: string | null;
}): Omit<ControlMirrorNormalizedEvidenceSummary, "id"> {
  const content = input.content ?? input.sourceExcerpt ?? "";
  const haystack = `${input.fileName}\n${content}`;
  const storyId = input.storyId ?? detectStoryId(haystack);
  const storyClassification = detectStoryClassification({
    artifactType: input.artifactType,
    storyId,
    haystack
  });
  const missingReadinessFields =
    storyClassification === "candidate_delivery_story" || storyClassification === "framing_story_idea"
      ? detectMissingReadinessFields({ storyId, haystack })
      : [];
  const readinessState: ControlMirrorStoryReadinessState =
    storyClassification === "out_of_scope_deferred"
      ? "deferred"
      : storyClassification === "not_story_like"
        ? "not_story_like"
        : missingReadinessFields.length === 0 && storyClassification === "candidate_delivery_story"
          ? "ready_for_build"
          : "needs_refinement";

  return {
    artifactId: input.artifactId,
    fileName: input.fileName,
    evidenceType: mapArtifactTypeToEvidenceType(input.artifactType),
    label: input.fileName.replace(/\.[^.]+$/, ""),
    sourceSection: "full-file",
    storyClassification,
    readinessState,
    missingReadinessFields,
    storyId
  };
}

export function normalizeControlMirrorArtifactEvidence(input: {
  artifactId: string;
  fileName: string;
  artifactType: ControlMirrorArtifactType;
  content?: string | null;
  sourceExcerpt?: string | null;
  storyId?: string | null;
}): Array<Omit<ControlMirrorNormalizedEvidenceSummary, "id">> {
  const content = input.content ?? input.sourceExcerpt ?? "";
  const bmadComparisonEvidence = normalizeBmadComparisonEvidence({
    artifactId: input.artifactId,
    fileName: input.fileName,
    content
  });

  if (bmadComparisonEvidence.length > 0) {
    return bmadComparisonEvidence;
  }

  return [normalizeControlMirrorArtifact(input)];
}

function buildEvidence(input: BuildControlMirrorInput, artifacts: ControlMirrorArtifactSummary[]) {
  const stories = flattenStories(input.outcomes);
  const contentByType = new Set(artifacts.map((artifact) => artifact.artifactType));
  const hasApprovedSignoff = input.signoffRecords.some((record) => record.decisionStatus === "approved");
  const hasApprovedOrReadyTollgate = input.tollgates.some((tollgate) => tollgate.status === "approved" || tollgate.status === "ready");

  return [
    {
      id: "requirements-baseline",
      label: "Requirements baseline",
      requiredFor: "level_2" as const,
      present: input.outcomes.some((outcome) => isPresent(outcome.baselineDefinition) && isPresent(outcome.outcomeStatement)),
      detail: "Approved framing needs outcome statement and baseline evidence."
    },
    {
      id: "implementation-map",
      label: "Implementation map",
      requiredFor: "level_2" as const,
      present: stories.some((story) => isPresent(story.key) && isPresent(story.outcomeId) && isPresent(story.epicId)),
      detail: "Delivery Stories should map to Outcome and Epic."
    },
    {
      id: "decision-log",
      label: "Decision log",
      requiredFor: "level_2" as const,
      present: contentByType.has("decision_log") || hasApprovedSignoff,
      detail: "Decision evidence can be imported or represented by sign-off records."
    },
    {
      id: "risk-ledger",
      label: "AI Risk Ledger",
      requiredFor: "level_2" as const,
      present: contentByType.has("ai_risk_ledger") || input.outcomes.some((outcome) => Boolean(outcome.riskProfile)),
      detail: "Risk posture must be visible for governed AI acceleration."
    },
    {
      id: "ai-review",
      label: "AI review",
      requiredFor: "level_2" as const,
      present: contentByType.has("qa_review") || hasApprovedOrReadyTollgate,
      detail: "AI-assisted delivery needs review evidence before higher-level claims."
    },
    {
      id: "test-evidence",
      label: "Test evidence",
      requiredFor: "level_2" as const,
      present: stories.some((story) => isPresent(story.testDefinition)) || contentByType.has("test_evidence"),
      detail: "Tests must connect back to delivery stories."
    },
    {
      id: "final-report",
      label: "Final delivery report",
      requiredFor: "level_2" as const,
      present: contentByType.has("final_report"),
      detail: "Final evidence pack or report is needed before claiming completed Level 2 delivery."
    },
    {
      id: "role-handoffs",
      label: "Role handoffs",
      requiredFor: "level_3" as const,
      present: contentByType.has("workflow_log") || input.signoffRecords.length >= 2,
      detail: "Level 3 needs visible role separation and handoffs."
    },
    {
      id: "delivery-blueprint",
      label: "AI Delivery Blueprint",
      requiredFor: "level_3" as const,
      present: contentByType.has("architecture_artifact") && contentByType.has("workflow_log"),
      detail: "Level 3 needs delivery design plus workflow evidence."
    },
    {
      id: "execution-statement",
      label: "Actual vs simulated execution statement",
      requiredFor: "level_3" as const,
      present: artifacts.some((artifact) => /simulated|actual/i.test(artifact.fileName)) || input.signoffRecords.some((record) => /simulated|actual/i.test(record.evidenceReference ?? "")),
      detail: "Reports must disclose whether execution was simulated or independently performed."
    },
    {
      id: "qa-independence",
      label: "QA/AQA independence statement",
      requiredFor: "level_3" as const,
      present: contentByType.has("qa_review") && input.signoffRecords.some((record) => /aqa|qa/i.test(record.evidenceReference ?? record.decisionKind)),
      detail: "Level 3 should not imply independent QA without evidence."
    },
    {
      id: "downgrade-rule",
      label: "Downgrade rule evaluation",
      requiredFor: "level_3" as const,
      present: artifacts.some((artifact) => /downgrade/i.test(artifact.fileName)),
      detail: "Missing Level 3 evidence needs downgrade evaluation."
    }
  ];
}

function determineAchievedAiLevel(input: {
  requestedAiLevel: ControlMirrorAiLevel;
  evidence: ReturnType<typeof buildEvidence>;
}) {
  const level2Ready = input.evidence.filter((item) => item.requiredFor === "level_2").every((item) => item.present);
  const level3Ready = level2Ready && input.evidence.filter((item) => item.requiredFor === "level_3").every((item) => item.present);
  const qualifiedLevel: ControlMirrorAiLevel = level3Ready ? "level_3" : level2Ready ? "level_2" : "level_1";

  return aiLevelWeight[qualifiedLevel] > aiLevelWeight[input.requestedAiLevel] ? input.requestedAiLevel : qualifiedLevel;
}

function releaseReadiness(input: {
  requestedAiLevel: ControlMirrorAiLevel;
  achievedAiLevel: ControlMirrorAiLevel;
  highReviewItems: number;
  mediumReviewItems: number;
  buildConformancePercentage: number;
  testEvidencePercentage: number;
}): ControlMirrorStatus {
  if (input.highReviewItems > 0) return "blocked";
  if (aiLevelWeight[input.achievedAiLevel] < aiLevelWeight[input.requestedAiLevel]) return "downgrade_required";
  if (input.mediumReviewItems > 0) return "human_approval_required";
  if (input.buildConformancePercentage < 100 || input.testEvidencePercentage < 100) return "conditional";
  return "ready";
}

function determineAiLevelRecommendation(input: {
  requestedAiLevel: ControlMirrorAiLevel;
  achievedAiLevel: ControlMirrorAiLevel;
  highFindings: number;
  missingRequiredEvidence: number;
}): ControlMirrorAiLevelRecommendation {
  if (aiLevelWeight[input.achievedAiLevel] < aiLevelWeight[input.requestedAiLevel]) {
    return input.highFindings > 0 ? "pause" : "downgrade";
  }

  if (input.missingRequiredEvidence > 0 || input.highFindings > 0) {
    return "proceed_with_controls";
  }

  return "proceed_at_requested_level";
}

function detectTestLevel(value: string): ControlMirrorTestLevel {
  if (/\bsecurity\b/i.test(value)) return "security";
  if (/\bregression\b/i.test(value)) return "regression";
  if (/\bintegration\b/i.test(value)) return "integration";
  if (/\bsystem\b|\be2e\b|\bend-to-end\b/i.test(value)) return "system";
  if (/\bmanual\b/i.test(value)) return "manual_verification";
  if (/\bcontract\b|\bbehavioural\b|\bbehavioral\b/i.test(value)) return "behavioural_contract";
  if (/\bunit\b|spec\.ts|spec\.tsx|vitest/i.test(value)) return "unit";
  return "unknown";
}

function detectTestResult(value: string): ControlMirrorTestResult {
  if (/\bfail(?:ed|ing|s)?\b|red|error/i.test(value)) return "failing";
  if (/\bpass(?:ed|ing|es)?\b|green|success/i.test(value)) return "passing";
  return "unknown";
}

function buildTestCoverage(input: {
  artifacts: ControlMirrorArtifactSummary[];
  normalizedEvidence: ControlMirrorNormalizedEvidenceSummary[];
  stories: ControlMirrorStoryInput[];
}) {
  const storyByKey = new Map(input.stories.map((story) => [story.key.toLowerCase(), story]));
  const artifactsByStory = new Map<string, ControlMirrorArtifactSummary[]>();

  for (const artifact of input.artifacts) {
    if (!artifact.storyId) {
      continue;
    }

    const key = artifact.storyId.toLowerCase();
    artifactsByStory.set(key, [...(artifactsByStory.get(key) ?? []), artifact]);
  }

  const mappedEvidence: ControlMirrorTestEvidenceItem[] = input.normalizedEvidence
    .filter((item) => item.evidenceType === "test_evidence")
    .map((item) => {
      const searchText = `${item.fileName} ${item.label} ${item.storyId ?? ""}`;
      const story = item.storyId ? storyByKey.get(item.storyId.toLowerCase()) ?? null : null;
      const testId = /\b[A-Z]+-\d+(?:\.\d+)?\b/i.exec(searchText)?.[0] ?? item.storyId ?? item.id;
      const testLevel = detectTestLevel(searchText);

      return {
        id: item.id,
        testId,
        fileName: item.fileName,
        storyId: item.storyId,
        epicId: story?.epicId ?? null,
        outcomeId: story?.outcomeId ?? null,
        testLevel,
        result: detectTestResult(searchText),
        automationStatus: testLevel === "manual_verification" ? "manual" : testLevel === "unknown" ? "unknown" : "automated",
        evidenceSource: item.sourceSection
      };
    });
  const evidenceByStory = new Map<string, ControlMirrorTestEvidenceItem[]>();

  for (const evidenceItem of mappedEvidence) {
    if (!evidenceItem.storyId) {
      continue;
    }

    const key = evidenceItem.storyId.toLowerCase();
    evidenceByStory.set(key, [...(evidenceByStory.get(key) ?? []), evidenceItem]);
  }

  const valueSpineCoverage = input.stories.map<ControlMirrorValueSpineCoverageItem>((story) => {
    const evidenceItems = evidenceByStory.get(story.key.toLowerCase()) ?? [];
    const artifactItems = artifactsByStory.get(story.key.toLowerCase()) ?? [];
    const missingLinks = [
      ...(isPresent(story.outcomeId) ? [] : ["outcome"]),
      ...(isPresent(story.epicId) ? [] : ["epic"]),
      ...(isPresent(story.key) ? [] : ["story"]),
      ...(story.acceptanceCriteria.length > 0 ? [] : ["acceptance criteria"])
    ];
    const passingEvidenceCount = evidenceItems.filter((item) => item.result === "passing").length;
    const failingEvidenceCount = evidenceItems.filter((item) => item.result === "failing").length;
    const manualEvidenceCount = evidenceItems.filter((item) => item.testLevel === "manual_verification").length;
    const behaviouralEvidenceCount = evidenceItems.filter((item) => item.testLevel === "behavioural_contract").length;
    let coverageState: ControlMirrorStoryCoverageState = "no_test";

    if (failingEvidenceCount > 0) {
      coverageState = "failing_tests";
    } else if (passingEvidenceCount > 0) {
      coverageState = "passing_tests";
    } else if (behaviouralEvidenceCount > 0) {
      coverageState = "behavioural_contract_tests";
    } else if (manualEvidenceCount > 0 && evidenceItems.length === manualEvidenceCount) {
      coverageState = "manual_verification_only";
    } else if (evidenceItems.length > 0 || artifactItems.some((artifact) => artifact.artifactType === "test_evidence")) {
      coverageState = "implemented_tests";
    } else if (isPresent(story.testDefinition)) {
      coverageState = "test_definition_only";
    }

    return {
      id: `coverage-${story.id}`,
      storyId: story.id,
      storyKey: story.key,
      storyTitle: story.title,
      epicId: story.epicId || null,
      outcomeId: story.outcomeId || null,
      coverageState,
      testEvidenceCount: evidenceItems.length,
      passingEvidenceCount,
      failingEvidenceCount,
      missingLinks
    };
  });
  const untracedImplementationArtifacts = input.artifacts.filter(
    (artifact) =>
      (artifact.artifactType === "implementation_note" || artifact.artifactType === "test_evidence") &&
      !artifact.storyId
  );

  return {
    mappedEvidence,
    valueSpineCoverage,
    untracedImplementationArtifacts
  };
}

function getEvidencePresence(evidence: ReturnType<typeof buildEvidence>, id: string) {
  return evidence.find((item) => item.id === id)?.present ?? false;
}

function buildGuardrailFindings(input: {
  outcomes: ControlMirrorOutcomeInput[];
  artifacts: ControlMirrorArtifactSummary[];
  stories: ControlMirrorStoryInput[];
  evidence: ReturnType<typeof buildEvidence>;
  requestedAiLevel: ControlMirrorAiLevel;
  testCoverage: ReturnType<typeof buildTestCoverage>;
  valueSpineCovered: number;
  valueSpineTotal: number;
  signoffRecords: ControlMirrorSignoffInput[];
}) {
  if (aiLevelWeight[input.requestedAiLevel] < aiLevelWeight.level_2) {
    return [];
  }

  const hasBaseline = input.outcomes.some((outcome) => isPresent(outcome.outcomeStatement) && isPresent(outcome.baselineDefinition));
  const hasCompleteValueSpine =
    input.valueSpineTotal > 0 &&
    input.valueSpineCovered === input.valueSpineTotal &&
    input.testCoverage.valueSpineCoverage.every((item) => item.missingLinks.length === 0);
  const hasRiskLedger =
    input.artifacts.some((artifact) => artifact.artifactType === "ai_risk_ledger") ||
    input.signoffRecords.some((record) => /risk.?ledger|risk register|ai risk/i.test(record.evidenceReference ?? ""));
  const hasMandate = input.outcomes.some((outcome) => isPresent(outcome.valueOwnerId)) || input.signoffRecords.some((record) => record.decisionStatus === "approved");
  const hasAidaAqaCapacity =
    input.requestedAiLevel !== "level_3" ||
    getEvidencePresence(input.evidence, "qa-independence") ||
    input.signoffRecords.some((record) => /aida|aqa|qa/i.test(`${record.decisionKind} ${record.evidenceReference ?? ""}`));
  const hasTestEvidence =
    input.stories.length > 0 &&
    input.testCoverage.mappedEvidence.length > 0 &&
    input.testCoverage.valueSpineCoverage.every((item) => item.coverageState !== "no_test" && item.coverageState !== "test_definition_only");
  const hasGovernanceFundingEvidence =
    input.artifacts.some((artifact) => /funding|margin.?gate|commercial|governance funding/i.test(artifact.fileName)) ||
    input.signoffRecords.some((record) => /funding|margin.?gate|commercial|governance funding/i.test(record.evidenceReference ?? ""));

  const guardrails: ControlMirrorGuardrailFinding[] = [
    {
      id: "guardrail-baseline",
      category: "baseline",
      label: "Baseline",
      requiredFor: "level_2",
      present: hasBaseline,
      severity: "high",
      affectedObject: "Approved Framing",
      recommendedAction: "Add outcome statement and baseline definition before claiming Level 2 or Level 3 readiness.",
      rationale: "Higher AI-level delivery requires a visible before-state and approved target outcome."
    },
    {
      id: "guardrail-value-spine",
      category: "value_spine",
      label: "Value Spine",
      requiredFor: "level_2",
      present: hasCompleteValueSpine,
      severity: "high",
      affectedObject: "Outcome/Epic/Story/Test traceability",
      recommendedAction: "Close missing Outcome, Epic, Story, acceptance or test links before release recommendation.",
      rationale: "AAS Companion must preserve value traceability from approved Framing into build and verification."
    },
    {
      id: "guardrail-risk-ledger",
      category: "risk_ledger",
      label: "AI Risk Ledger",
      requiredFor: "level_2",
      present: hasRiskLedger,
      severity: "high",
      affectedObject: "AI risk posture",
      recommendedAction: "Import an AI Risk Ledger or record accepted risk on the Outcome.",
      rationale: "Commercial and delivery claims need explicit AI risk posture before escalation."
    },
    {
      id: "guardrail-mandate",
      category: "mandate",
      label: "Customer mandate",
      requiredFor: "level_2",
      present: hasMandate,
      severity: "high",
      affectedObject: "Value Owner / approval mandate",
      recommendedAction: "Assign a Value Owner or record an approved signoff before proceeding.",
      rationale: "Human mandate must be visible before the system recommends higher-level delivery claims."
    },
    {
      id: "guardrail-aida-aqa-capacity",
      category: "aida_aqa_capacity",
      label: "AIDA/AQA capacity",
      requiredFor: "level_3",
      present: hasAidaAqaCapacity,
      severity: "high",
      affectedObject: "Independent AI delivery and quality capacity",
      recommendedAction: "Add AIDA/AQA review evidence or downgrade the requested AI level.",
      rationale: "Level 3 claims require visible role separation, execution capacity and quality review."
    },
    {
      id: "guardrail-test-evidence",
      category: "test_evidence",
      label: "Test evidence",
      requiredFor: "level_2",
      present: hasTestEvidence,
      severity: "high",
      affectedObject: "Story verification evidence",
      recommendedAction: "Map implemented or manual test evidence to every release-impacting Story.",
      rationale: "A release recommendation must be based on executable or recorded verification evidence."
    },
    {
      id: "guardrail-governance-funding",
      category: "governance_funding",
      label: "Governance funding evidence",
      requiredFor: "level_2",
      present: hasGovernanceFundingEvidence,
      severity: "medium",
      affectedObject: "Commercial governance",
      recommendedAction: "Attach funding, Margin Gate or commercial governance evidence before making a commercial Level 2/3 claim.",
      rationale: "Commercial guardrails prevent unsupported AI-level commitments from being sold or released."
    }
  ];

  return guardrails.filter((guardrail) => !guardrail.present);
}

export function applyControlMirrorHumanReviewStateToDashboard(
  dashboard: ControlMirrorDashboard,
  humanReviewItems: ControlMirrorHumanReviewItem[]
): ControlMirrorDashboard {
  const reviewStateSummary = summarizeControlMirrorHumanReviewState(humanReviewItems);
  const openItems = humanReviewItems.filter((item) => getControlMirrorHumanReviewState(item) === "open");
  const openBlockingItems = openItems.filter((item) => item.blocksRelease);
  const buildConformancePercentage = dashboard.metrics.find((metric) => metric.id === "build-conformance")?.percentage ?? 0;
  const testEvidencePercentage = dashboard.metrics.find((metric) => metric.id === "test-evidence")?.percentage ?? 0;
  const release = releaseReadiness({
    requestedAiLevel: dashboard.requestedAiLevel,
    achievedAiLevel: dashboard.achievedAiLevel,
    highReviewItems: openItems.filter((item) => item.severity === "high").length,
    mediumReviewItems: openItems.filter((item) => item.severity === "medium").length,
    buildConformancePercentage,
    testEvidencePercentage
  });
  const retentionSummary = summarizeControlMirrorEvidenceRetention(dashboard.normalizedEvidence);
  const decisionSummaries = humanReviewItems
    .filter((item) => item.latestHumanDecision)
    .map((item) => `${item.category}: ${item.latestHumanDecision?.decisionType} - ${item.latestHumanDecision?.rationale}`);
  const recommendedNextStep =
    openBlockingItems.length > 0
      ? "Resolve blocking Human Review items before release or higher AI-level claims."
      : release === "downgrade_required"
        ? "Downgrade the achieved AI level or add missing evidence."
        : release === "human_approval_required"
          ? "Continue with controls and named Human Review decisions."
          : release === "conditional"
            ? "Proceed conditionally while closing verification gaps."
            : "Ready for release review with current evidence.";

  return {
    ...dashboard,
    releaseReadiness: release,
    humanReviewItems,
    reviewStateSummary,
    buildConformance: {
      ...dashboard.buildConformance,
      releaseRisk: openBlockingItems.length
    },
    report: {
      ...dashboard.report,
      releaseReadiness: release,
      evidenceSummaries: buildControlMirrorReportSummaryItems({
        metrics: dashboard.metrics,
        releaseReadiness: release,
        requestedAiLevel: dashboard.requestedAiLevel,
        achievedAiLevel: dashboard.achievedAiLevel,
        openHumanReviewItems: openItems.length,
        blockingHumanReviewItems: openBlockingItems.length,
        evidenceRetentionSummary: retentionSummary.summary,
        evidenceRetentionStatus: retentionSummary.status
      }),
      openHumanReviewItems: openItems.length,
      blockingHumanReviewItems: openBlockingItems.length,
      decisionLogSummary: decisionSummaries.length > 0 ? decisionSummaries.join(" | ") : dashboard.report.decisionLogSummary,
      requiredApprovals: openBlockingItems.map((item) => item.category),
      blockingGaps: openBlockingItems.map((item) => item.decisionNeeded),
      recommendedNextStep,
      evidenceRetentionSummary: retentionSummary.summary
    }
  };
}

function buildConformanceFindings(input: {
  outcomes: ControlMirrorOutcomeInput[];
  artifacts: ControlMirrorArtifactSummary[];
  normalizedEvidence: ControlMirrorNormalizedEvidenceSummary[];
  stories: ControlMirrorStoryInput[];
  requestedAiLevel: ControlMirrorAiLevel;
  achievedAiLevel: ControlMirrorAiLevel;
  evidence: ReturnType<typeof buildEvidence>;
}) {
  const findings: ControlMirrorConformanceFinding[] = [];
  const framingTokens = buildFramingTokens(input.outcomes);
  const storyByKey = new Map(input.stories.map((story) => [story.key.toLowerCase(), story]));
  const storyKeysWithImportedTestEvidence = new Set(
    input.normalizedEvidence
      .filter((item) => item.evidenceType === "test_evidence" && item.storyId)
      .map((item) => item.storyId!.toLowerCase())
  );
  const artifactById = new Map(input.artifacts.map((artifact) => [artifact.id, artifact]));
  const designEvidenceTypes: ControlMirrorNormalizedEvidenceType[] = [
    "framing_design_evidence",
    "architecture_evidence",
    "journey_ux_evidence",
    "delivery_story_candidate"
  ];
  const buildEvidenceTypes: ControlMirrorNormalizedEvidenceType[] = [
    "implementation_evidence",
    "test_evidence"
  ];
  let framingAligned = 0;
  let framingPartial = 0;
  let weakValueAlignment = 0;
  let scopeDrift = 0;
  let outOfScope = 0;
  let rightBuilt = 0;
  let weaklyTracedBuild = 0;
  let untracedBuildArtifacts = 0;
  let releaseRisk = 0;

  for (const evidenceItem of input.normalizedEvidence.filter((item) => designEvidenceTypes.includes(item.evidenceType))) {
    const searchText = `${evidenceItem.fileName} ${evidenceItem.label} ${evidenceItem.storyId ?? ""}`;
    const artifact = artifactById.get(evidenceItem.artifactId);
    const hasStoryTrace = Boolean(evidenceItem.storyId);
    const hasFramingToken = containsAnyToken(searchText, framingTokens);
    let status: ControlMirrorFramingAlignmentStatus = "needs_human_review";

    if (evidenceItem.storyClassification === "out_of_scope_deferred") {
      status = "out_of_scope";
      outOfScope += 1;
    } else if (hasStoryTrace || hasFramingToken) {
      status = "aligned";
      framingAligned += 1;
    } else if (!evidenceItem.missingReadinessFields.includes("linked outcome") && !evidenceItem.missingReadinessFields.includes("linked epic")) {
      status = "partially_aligned";
      framingPartial += 1;
    } else if (artifact?.artifactType === "implementation_note" || evidenceItem.evidenceType === "delivery_story_candidate") {
      status = "potential_scope_drift";
      scopeDrift += 1;
    } else {
      status = "weak_value_alignment";
      weakValueAlignment += 1;
    }

    if (status !== "aligned" && status !== "partially_aligned") {
      findings.push({
        id: `framing-${evidenceItem.id}`,
        category: status === "potential_scope_drift" ? "scope_drift" : "framing_alignment",
        severity: status === "out_of_scope" || status === "potential_scope_drift" ? "high" : "medium",
        status,
        artifactId: evidenceItem.artifactId,
        evidenceId: evidenceItem.id,
        label: evidenceItem.label,
        affectedObject: evidenceItem.fileName,
        recommendedAction:
          status === "out_of_scope"
            ? "Keep deferred unless Value Owner explicitly reopens scope."
            : status === "potential_scope_drift"
              ? "Map to approved Outcome/Epic/Story or send to Human Review as scope drift."
              : "Add or confirm Outcome/Epic/Story linkage before treating this as aligned design evidence.",
        rationale: "Design evidence must remain traceable to approved Framing, baseline, scope and Value Spine."
      });
    }
  }

  for (const evidenceItem of input.normalizedEvidence.filter((item) => buildEvidenceTypes.includes(item.evidenceType))) {
    const artifact = artifactById.get(evidenceItem.artifactId);
    const story = evidenceItem.storyId ? storyByKey.get(evidenceItem.storyId.toLowerCase()) : null;
    let status: ControlMirrorBuildConformanceStatus = "partially_built";
    let severity: "high" | "medium" | "low" = "medium";

    if (!evidenceItem.storyId || artifact?.lineageStatus === "missing") {
      status = "untraced_artifact";
      severity = "high";
      untracedBuildArtifacts += 1;
      releaseRisk += 1;
    } else if (!story) {
      status = "built_but_weakly_traced";
      weaklyTracedBuild += 1;
    } else if (!isPresent(story.testDefinition) && !storyKeysWithImportedTestEvidence.has(story.key.toLowerCase())) {
      status = "built_but_unverified";
      releaseRisk += 1;
    } else if (story.acceptanceCriteria.length === 0) {
      status = "partially_built";
    } else {
      status = "right_built";
      rightBuilt += 1;
    }

    if (status !== "right_built") {
      findings.push({
        id: `build-${evidenceItem.id}`,
        category: "build_conformance",
        severity,
        status,
        artifactId: evidenceItem.artifactId,
        evidenceId: evidenceItem.id,
        label: evidenceItem.label,
        affectedObject: evidenceItem.fileName,
        recommendedAction:
          status === "untraced_artifact"
            ? "Map this artifact to an approved Story or classify it as scope drift before release."
            : status === "built_but_unverified"
              ? "Add test evidence before treating this as right-built."
              : "Strengthen Outcome/Epic/Story mapping before accepting the build evidence.",
        rationale: "Build artifacts are acceptable only when they trace to Story, Epic, Outcome, acceptance criteria and verification evidence."
      });
    }
  }

  const missingRequiredEvidence = input.evidence.filter((item) => !item.present).length;
  const aiLevelRecommendation = determineAiLevelRecommendation({
    requestedAiLevel: input.requestedAiLevel,
    achievedAiLevel: input.achievedAiLevel,
    highFindings: findings.filter((finding) => finding.severity === "high").length,
    missingRequiredEvidence
  });

  if (aiLevelRecommendation !== "proceed_at_requested_level") {
    findings.push({
      id: "ai-level-recommendation",
      category: "ai_level_evidence",
      severity: aiLevelRecommendation === "pause" || aiLevelRecommendation === "downgrade" ? "high" : "medium",
      status: aiLevelRecommendation,
      label: "Requested vs achieved AI level",
      affectedObject: `Requested ${input.requestedAiLevel}, achieved ${input.achievedAiLevel}`,
      recommendedAction:
        aiLevelRecommendation === "pause"
          ? "Pause higher-level claim until blocking conformance findings are resolved."
          : aiLevelRecommendation === "downgrade"
            ? "Downgrade the achieved AI level or add missing evidence."
            : "Proceed only with named controls and Human Review decisions.",
      rationale: "AAS Companion must not overstate Level 2 or Level 3 readiness without required evidence."
    });
  }

  return {
    framingAligned,
    framingPartial,
    weakValueAlignment,
    scopeDrift,
    outOfScope,
    rightBuilt,
    weaklyTracedBuild,
    untracedBuildArtifacts,
    releaseRisk,
    aiLevelRecommendation,
    findings
  };
}

export function buildControlMirrorDashboard(input: BuildControlMirrorInput): ControlMirrorDashboard {
  const stories = flattenStories(input.outcomes);
  const directionSeeds = flattenDirectionSeeds(input.outcomes);
  const latestSession = [...input.artifactSessions].sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))[0] ?? null;
  const rawArtifacts = input.artifactSessions.flatMap((session) => session.files);
  const candidates = input.artifactSessions.flatMap((session) => session.candidates);
  const derivedArtifacts = rawArtifacts.map<ControlMirrorArtifactSummary>((artifact) => {
    const artifactType = classifyControlMirrorArtifact(artifact);
    const storyId = detectStoryId(`${artifact.fileName}\n${artifact.content ?? ""}`);
    const implementationLike = artifactType === "implementation_note" || artifactType === "test_evidence";

    return {
      id: artifact.id,
      fileName: artifact.fileName,
      artifactType,
      storyId,
      parsingConfidence: artifact.sourceConfidence ?? "medium",
      lineageStatus: storyId ? "traced" : implementationLike ? "missing" : artifact.sourceConfidence === "low" ? "weak" : "traced"
    };
  });
  const artifacts = input.persistentSnapshot?.artifacts ?? derivedArtifacts;
  const rawArtifactById = new Map(rawArtifacts.map((artifact) => [artifact.id, artifact]));
  const normalizedEvidence = input.persistentSnapshot?.normalizedEvidence ?? artifacts.flatMap((artifact) => {
    const rawArtifact = rawArtifactById.get(artifact.id);

    return normalizeControlMirrorArtifactEvidence({
      artifactId: artifact.id,
      fileName: artifact.fileName,
      artifactType: artifact.artifactType,
      ...(rawArtifact?.content === undefined ? {} : { content: rawArtifact.content }),
      storyId: artifact.storyId
    }).map((evidence, index) => ({
      id: `normalized-${artifact.id}-${index + 1}`,
      ...evidence
    }));
  });
  const retentionSummary = summarizeControlMirrorEvidenceRetention(normalizedEvidence);
  const isUploadedSnapshot = (input.persistentSnapshot?.sourceType ?? "").replaceAll(" ", "_").toLowerCase() === "uploaded_zip";
  const unreadableFiles = artifacts
    .filter((artifact) => artifact.changeStatus === "unreadable")
    .map((artifact) => ({
      fileName: artifact.fileName,
      filePath: artifact.fileName
    }));
  const storyLikeEvidence = normalizedEvidence.filter((item) => item.storyClassification !== "not_story_like");
  const testCoverage = buildTestCoverage({
    artifacts,
    normalizedEvidence,
    stories
  });
  const storyKeysWithImportedTestEvidence = new Set(
    testCoverage.valueSpineCoverage
      .filter((item) => item.testEvidenceCount > 0)
      .map((item) => item.storyKey.toLowerCase())
  );
  const hasVerificationEvidence = (story: ControlMirrorStoryInput) =>
    isPresent(story.testDefinition) || storyKeysWithImportedTestEvidence.has(story.key.toLowerCase());

  const storyIdeasReady = directionSeeds.filter((seed) => isPresent(seed.shortDescription) && isPresent(seed.expectedBehavior)).length;
  const storiesWithAcceptanceCriteria = stories.filter((story) => story.acceptanceCriteria.length > 0).length;
  const storiesWithTestDefinition = stories.filter((story) => isPresent(story.testDefinition)).length;
  const storiesWithVerificationEvidence = stories.filter(hasVerificationEvidence).length;
  const rightBuiltStories = stories.filter(
    (story) =>
      isPresent(story.key) &&
      isPresent(story.outcomeId) &&
      isPresent(story.epicId) &&
      story.acceptanceCriteria.length > 0 &&
      hasVerificationEvidence(story) &&
      story.tollgateStatus !== "blocked"
  ).length;
  const blockedStories = stories.filter((story) => story.tollgateStatus === "blocked" || story.status === "definition_blocked").length;
  const untracedArtifacts = artifacts.filter((artifact) => artifact.lineageStatus === "missing").length;
  const outcomesWithEpics = input.outcomes.filter((outcome) => outcome.epics.length > 0).length;
  const epics = input.outcomes.flatMap((outcome) => outcome.epics);
  const epicsWithStories = epics.filter((epic) => epic.stories.length > 0).length;
  const outcomeAlignment = input.outcomes.filter((outcome) => isPresent(outcome.outcomeStatement) && isPresent(outcome.baselineDefinition)).length;
  const valueSpineCovered = outcomesWithEpics + epicsWithStories + storiesWithAcceptanceCriteria;
  const valueSpineTotal = input.outcomes.length + epics.length + stories.length;
  const designReadyTotal = directionSeeds.length + stories.length;
  const designReadyValue = storyIdeasReady + storiesWithAcceptanceCriteria;
  const buildConformancePercentage = percentage(rightBuiltStories, stories.length);
  const testEvidencePercentage = percentage(storiesWithVerificationEvidence, stories.length);

  const metrics: ControlMirrorMetric[] = [
    {
      id: "framing-alignment",
      label: "Framing Alignment",
      value: outcomeAlignment,
      total: input.outcomes.length,
      percentage: percentage(outcomeAlignment, input.outcomes.length),
      status: statusFromPercentage(percentage(outcomeAlignment, input.outcomes.length)),
      description: "Outcomes with baseline and outcome statement evidence."
    },
    {
      id: "value-spine-coverage",
      label: "Value Spine Coverage",
      value: valueSpineCovered,
      total: valueSpineTotal,
      percentage: percentage(valueSpineCovered, valueSpineTotal),
      status: statusFromPercentage(percentage(valueSpineCovered, valueSpineTotal)),
      description: "Outcome -> Epic -> Story -> acceptance coverage."
    },
    {
      id: "design-readiness",
      label: "Design Readiness",
      value: designReadyValue,
      total: designReadyTotal,
      percentage: percentage(designReadyValue, designReadyTotal),
      status: statusFromPercentage(percentage(designReadyValue, designReadyTotal)),
      description: "Story Ideas and Delivery Stories with design-ready content."
    },
    {
      id: "build-conformance",
      label: "Build Conformance",
      value: rightBuiltStories,
      total: stories.length,
      percentage: buildConformancePercentage,
      status: statusFromPercentage(buildConformancePercentage),
      description: "Stories with traceability, acceptance criteria and verification evidence."
    },
    {
      id: "test-evidence",
      label: "Test Evidence",
      value: storiesWithVerificationEvidence,
      total: stories.length,
      percentage: testEvidencePercentage,
      status: statusFromPercentage(testEvidencePercentage),
      description: "Stories with a test definition or imported test evidence."
    }
  ];

  const requestedAiLevel = highestAiLevel([
    ...input.outcomes.map((outcome) => outcome.aiAccelerationLevel),
    ...stories.map((story) => story.aiAccelerationLevel)
  ]);
  const evidence = buildEvidence(input, artifacts);
  const achievedAiLevel = determineAchievedAiLevel({ requestedAiLevel, evidence });
  const conformance = buildConformanceFindings({
    outcomes: input.outcomes,
    artifacts,
    normalizedEvidence,
    stories,
    requestedAiLevel,
    achievedAiLevel,
    evidence
  });
  const guardrailFindings = buildGuardrailFindings({
    outcomes: input.outcomes,
    artifacts,
    stories,
    evidence,
    requestedAiLevel,
    testCoverage,
    valueSpineCovered,
    valueSpineTotal,
    signoffRecords: input.signoffRecords
  });
  const humanReviewItems: ControlMirrorHumanReviewItem[] = [];

  if (retentionSummary.sensitiveFindingCount > 0) {
    humanReviewItems.push(enrichControlMirrorHumanReviewItem({
      id: "evidence-retention-sensitive-content",
      sourceFindingId: "evidence-retention-sensitive-content",
      severity: "medium",
      category: "Evidence retention",
      decisionNeeded: "Confirm whether redacted evidence with possible secrets may remain in the Control Mirror snapshot.",
      recommendedOption: "APPROVE WITH CONDITION",
      affectedObject: `${retentionSummary.sensitiveFindingCount} sensitive finding${retentionSummary.sensitiveFindingCount === 1 ? "" : "s"}`,
      blocksRelease: false,
      rationale: "Sensitive values should not be silently retained even when excerpts are redacted."
    }));
  }

  if (untracedArtifacts > 0) {
    humanReviewItems.push(enrichControlMirrorHumanReviewItem({
      id: "untraced-artifacts",
      sourceFindingId: "untraced-artifacts",
      severity: "high",
      category: "Untraced artifact",
      decisionNeeded: "Classify implementation or test artifacts that lack Story-ID evidence.",
      recommendedOption: "REQUEST CHANGE",
      affectedObject: `${untracedArtifacts} artifact${untracedArtifacts === 1 ? "" : "s"}`,
      blocksRelease: true,
      rationale: "Runtime or verification evidence without traceability is a release risk."
    }));
  }

  if (stories.length > storiesWithVerificationEvidence) {
    humanReviewItems.push(enrichControlMirrorHumanReviewItem({
      id: "missing-test-evidence",
      sourceFindingId: "guardrail-test-evidence",
      severity: "medium",
      category: "Verification gap",
      decisionNeeded: "Decide whether stories without test evidence can continue.",
      recommendedOption: "APPROVE WITH CONDITION",
      affectedObject: `${stories.length - storiesWithVerificationEvidence} story${stories.length - storiesWithVerificationEvidence === 1 ? "" : "ies"}`,
      blocksRelease: true,
      rationale: "Release readiness should be based on evidence, not only story status."
    }));
  }

  if (aiLevelWeight[achievedAiLevel] < aiLevelWeight[requestedAiLevel]) {
    humanReviewItems.push(enrichControlMirrorHumanReviewItem({
      id: "ai-level-mismatch",
      sourceFindingId: "ai-level-recommendation",
      severity: "high",
      category: "AI level evidence mismatch",
      decisionNeeded: "Downgrade the achieved AI level or add the missing evidence.",
      recommendedOption: "DEFER",
      affectedObject: `Requested ${requestedAiLevel}, achieved ${achievedAiLevel}`,
      blocksRelease: true,
      rationale: "AAS Companion must not overstate Level 2 or Level 3 readiness."
    }));
  }

  if (conformance.scopeDrift > 0 || conformance.outOfScope > 0) {
    humanReviewItems.push(enrichControlMirrorHumanReviewItem({
      id: "scope-drift-control",
      sourceFindingId: "scope-drift-control",
      severity: "high",
      category: "Scope drift",
      decisionNeeded: "Confirm whether drift or out-of-scope evidence should be mapped, deferred or rejected.",
      recommendedOption: "REQUEST CHANGE",
      affectedObject: `${conformance.scopeDrift + conformance.outOfScope} conformance finding${conformance.scopeDrift + conformance.outOfScope === 1 ? "" : "s"}`,
      blocksRelease: true,
      rationale: "Design or build evidence outside approved Framing must not silently enter delivery."
    }));
  }

  for (const tollgate of input.tollgates.filter((item) => item.status === "blocked")) {
    humanReviewItems.push(enrichControlMirrorHumanReviewItem({
      id: `blocked-tollgate-${tollgate.id}`,
      sourceFindingId: `blocked-tollgate-${tollgate.id}`,
      severity: "high",
      category: "Blocked tollgate",
      decisionNeeded: tollgate.blockers[0] ?? "Resolve blocked governance tollgate.",
      recommendedOption: "REQUEST CHANGE",
      affectedObject: `${tollgate.entityType} ${tollgate.entityId}`,
      affectedOutcomeId: tollgate.entityType === "outcome" ? tollgate.entityId : null,
      affectedStoryId: tollgate.entityType === "story" ? tollgate.entityId : null,
      blocksRelease: true,
      rationale: "Blocked tollgates require human decision before release readiness can be green."
    }));
  }

  for (const guardrail of guardrailFindings) {
    const itemId = `guardrail-review-${guardrail.category}`;
    humanReviewItems.push(enrichControlMirrorHumanReviewItem({
      id: itemId,
      sourceFindingId: guardrail.id,
      severity: guardrail.severity,
      category: `Guardrail: ${guardrail.label}`,
      decisionNeeded: guardrail.recommendedAction,
      recommendedOption: guardrail.severity === "high" ? "REQUEST CHANGE" : "APPROVE WITH CONDITION",
      affectedObject: guardrail.affectedObject,
      blocksRelease: true,
      rationale: guardrail.rationale
    }));
  }

  const release = releaseReadiness({
    requestedAiLevel,
    achievedAiLevel,
    highReviewItems: humanReviewItems.filter((item) => item.severity === "high").length,
    mediumReviewItems: humanReviewItems.filter((item) => item.severity === "medium").length,
    buildConformancePercentage,
    testEvidencePercentage
  });
  const approvedFramingVersion = input.outcomes.reduce<number | null>((latestVersion, outcome) => {
    if (!outcome.framingVersion) {
      return latestVersion;
    }

    return latestVersion === null ? outcome.framingVersion : Math.max(latestVersion, outcome.framingVersion);
  }, null);
  const snapshotId = input.persistentSnapshot?.id ?? latestSession?.id ?? "current-project-state";
  const aiRiskLedgerPresent = evidence.find((item) => item.id === "risk-ledger")?.present ?? false;
  const decisionLogPresent = evidence.find((item) => item.id === "decision-log")?.present ?? false;
  const blockingHumanReviewItems = humanReviewItems.filter((item) => item.blocksRelease).length;
  const reviewStateSummary = summarizeControlMirrorHumanReviewState(humanReviewItems);
  const recommendedNextStep =
    release === "blocked"
      ? "Resolve blocking Human Review items before release or higher AI-level claims."
      : release === "downgrade_required"
        ? "Downgrade the achieved AI level or add missing evidence."
        : release === "human_approval_required"
          ? "Continue with controls and named Human Review decisions."
          : release === "conditional"
            ? "Proceed conditionally while closing verification gaps."
            : "Ready for release review with current evidence.";

  return {
    organizationName: input.organizationName,
    snapshot: {
      id: snapshotId,
      isPersistent: Boolean(input.persistentSnapshot),
      label: input.persistentSnapshot?.label ?? latestSession?.label ?? "Current project state",
      sourceType: input.persistentSnapshot?.sourceType ?? (latestSession ? "Manual artifact upload" : "Native project records"),
      scanTime: input.persistentSnapshot ? String(input.persistentSnapshot.scanTime) : latestSession ? String(latestSession.updatedAt) : null,
      sessionCount: input.persistentSnapshot?.sessionCount ?? input.artifactSessions.length,
      fileCount: input.persistentSnapshot?.fileCount ?? rawArtifacts.length,
      candidateCount: input.persistentSnapshot?.candidateCount ?? candidates.length,
      unchangedCount: input.persistentSnapshot?.unchangedCount ?? 0,
      newCount: input.persistentSnapshot?.newCount ?? 0,
      modifiedCount: input.persistentSnapshot?.modifiedCount ?? 0,
      deletedCount: input.persistentSnapshot?.deletedCount ?? 0,
      unreadableCount: input.persistentSnapshot?.unreadableCount ?? 0,
      rejectedCount: input.persistentSnapshot?.rejectedCount ?? 0,
      acceptedCount: input.persistentSnapshot?.acceptedCount ?? Math.max((input.persistentSnapshot?.fileCount ?? rawArtifacts.length) - (input.persistentSnapshot?.unreadableCount ?? 0), 0)
    },
    uploadSummary: {
      isUploadedSnapshot,
      acceptedCount: input.persistentSnapshot?.acceptedCount ?? 0,
      rejectedCount: input.persistentSnapshot?.rejectedCount ?? 0,
      unreadableCount: input.persistentSnapshot?.unreadableCount ?? 0,
      unchangedCount: input.persistentSnapshot?.unchangedCount ?? 0,
      newCount: input.persistentSnapshot?.newCount ?? 0,
      modifiedCount: input.persistentSnapshot?.modifiedCount ?? 0,
      deletedCount: input.persistentSnapshot?.deletedCount ?? 0,
      rejectedFiles: input.persistentSnapshot?.rejectedFiles ?? [],
      unreadableFiles
    },
    sourcePolicy: getControlMirrorSourcePolicy(),
    requestedAiLevel,
    achievedAiLevel,
    releaseReadiness: release,
    metrics,
    artifacts,
    normalizedEvidence,
    normalization: {
      evidenceCount: normalizedEvidence.length,
      storyLikeItems: storyLikeEvidence.length,
      candidateDeliveryStories: normalizedEvidence.filter((item) => item.storyClassification === "candidate_delivery_story").length,
      storyIdeas: normalizedEvidence.filter((item) => item.storyClassification === "framing_story_idea").length,
      explorationStories: normalizedEvidence.filter((item) => item.storyClassification === "exploration_story").length,
      outOfScopeItems: normalizedEvidence.filter((item) => item.storyClassification === "out_of_scope_deferred").length,
      readyForBuild: normalizedEvidence.filter((item) => item.readinessState === "ready_for_build").length,
      needsRefinement: normalizedEvidence.filter((item) => item.readinessState === "needs_refinement").length
    },
    conformance,
    guardrails: {
      checked: guardrailFindings.length === 0 && aiLevelWeight[requestedAiLevel] < aiLevelWeight.level_2 ? 0 : 7,
      passed: guardrailFindings.length === 0 && aiLevelWeight[requestedAiLevel] < aiLevelWeight.level_2 ? 0 : 7 - guardrailFindings.length,
      flagged: guardrailFindings.length,
      findings: guardrailFindings
    },
    designProgress: {
      storyIdeas: directionSeeds.length,
      classifiedItems: candidates.length + normalizedEvidence.length,
      refinedDeliveryStories: stories.length,
      storiesWithAcceptanceCriteria,
      storiesWithTestDefinition,
      readyForBuild: rightBuiltStories,
      blockedStories
    },
    buildConformance: {
      rightBuilt: rightBuiltStories,
      partiallyBuilt: Math.max(storiesWithAcceptanceCriteria - rightBuiltStories, 0),
      builtButUnverified: Math.max(stories.length - storiesWithVerificationEvidence, 0),
      weaklyTraced: artifacts.filter((artifact) => artifact.lineageStatus === "weak").length,
      untracedArtifacts,
      releaseRisk: humanReviewItems.filter((item) => item.blocksRelease).length
    },
    testEvidence: {
      storiesWithNoTest: testCoverage.valueSpineCoverage.filter((item) => item.coverageState === "no_test").length,
      storiesWithTestDefinitionOnly: testCoverage.valueSpineCoverage.filter((item) => item.coverageState === "test_definition_only").length,
      storiesWithImplementedTests: testCoverage.valueSpineCoverage.filter((item) => item.coverageState === "implemented_tests").length,
      storiesWithPassingTests: testCoverage.valueSpineCoverage.filter((item) => item.coverageState === "passing_tests").length,
      storiesWithFailingTests: testCoverage.valueSpineCoverage.filter((item) => item.coverageState === "failing_tests").length,
      manualVerificationOnly: testCoverage.valueSpineCoverage.filter((item) => item.coverageState === "manual_verification_only").length,
      behaviouralContractTests: testCoverage.valueSpineCoverage.filter((item) => item.coverageState === "behavioural_contract_tests").length,
      mappedEvidence: testCoverage.mappedEvidence,
      valueSpineCoverage: testCoverage.valueSpineCoverage,
      brokenValueSpineLinks: testCoverage.valueSpineCoverage.filter((item) => item.missingLinks.length > 0).length,
      untracedImplementationArtifacts: testCoverage.untracedImplementationArtifacts
    },
    aiEvidence: evidence,
    humanReviewItems,
    reviewStateSummary,
    report: {
      activeProject: input.organizationName,
      approvedFramingVersion: approvedFramingVersion ? String(approvedFramingVersion) : "unversioned",
      snapshotId,
      requestedAiLevel,
      achievedAiLevel,
      releaseReadiness: release,
      evidenceSummaries: buildControlMirrorReportSummaryItems({
        metrics,
        releaseReadiness: release,
        requestedAiLevel,
        achievedAiLevel,
        openHumanReviewItems: humanReviewItems.length,
        blockingHumanReviewItems,
        evidenceRetentionSummary: retentionSummary.summary,
        evidenceRetentionStatus: retentionSummary.status
      }),
      openHumanReviewItems: humanReviewItems.length,
      blockingHumanReviewItems,
      scopeDriftItems: conformance.scopeDrift + conformance.outOfScope,
      untracedArtifacts,
      aiRiskLedgerSummary: aiRiskLedgerPresent ? "AI Risk Ledger evidence is present." : "AI Risk Ledger evidence is missing or only implied.",
      decisionLogSummary: decisionLogPresent ? "Decision evidence is present." : "Decision evidence is missing or only implied.",
      requiredApprovals: humanReviewItems.filter((item) => item.blocksRelease).map((item) => item.category),
      blockingGaps: humanReviewItems.filter((item) => item.blocksRelease).map((item) => item.decisionNeeded),
      residualRisks: [
        ...guardrailFindings.map((guardrail) => guardrail.rationale),
        ...conformance.findings.filter((finding) => finding.severity !== "high").map((finding) => finding.rationale)
      ],
      recommendedNextStep,
      executionStatement: "Control Mirror is calculated from existing AAS Companion records. This is conformance support, not automatic release approval.",
      evidenceRetentionSummary: retentionSummary.summary
    }
  };
}
