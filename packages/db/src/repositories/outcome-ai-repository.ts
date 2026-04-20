import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyzeDownstreamAiInstructions,
  mapAiAccelerationLevelToDownstreamAiLevel,
  type DownstreamAiInstructions,
  type JourneyContext
} from "@aas-companion/domain";

type DeliveryType = "AD" | "AT" | "AM";

export type OutcomeFieldAiValidation = {
  field: "outcome_statement" | "baseline_definition";
  verdict: "good" | "needs_revision" | "unclear";
  confidence: "high" | "medium" | "low";
  rationale: string;
  suggestedRewrite: string | null;
};

export type StoryExpectedBehaviorAiValidation = {
  field: "story_expected_behavior";
  verdict: "good" | "needs_revision" | "unclear";
  confidence: "high" | "medium" | "low";
  rationale: string;
  suggestedRewrite: string | null;
};

export type OutcomeFramingAiReview = {
  validationMode: DeliveryType | "generic";
  outcomeQuality: {
    status: "ok" | "needs_improvement";
    comment: string;
    suggestedImprovement: string;
  };
  problemAlignment: {
    status: "strong" | "weak";
    comment: string;
  };
  epicCoverage: {
    status: "complete" | "partial";
    comment: string;
    missingAreas: string[];
  };
  storyCoverage: {
    status: "good" | "partial";
    comment: string;
    gapsOrOverlaps: string[];
  };
  riskOverview: {
    topRisks: string[];
    expansionRisk: "low" | "medium" | "high";
    misalignmentRisk: "low" | "medium" | "high";
  };
  aiLevel: {
    assessment: "appropriate" | "too_high" | "too_low";
    suggestedLevel: "level_1" | "level_2" | "level_3" | null;
    comment: string;
  };
  journeyContext: {
    status: "not_used" | "helpful" | "needs_refinement";
    comment: string;
    gaps: string[];
  };
  downstreamAiInstructions: {
    status: "not_configured" | "configured" | "needs_refinement";
    comment: string;
    warnings: string[];
  };
  tollgateHandshake: {
    status: "ready" | "needs_refinement";
    comment: string;
    missingItems: string[];
  };
  framingReadiness: {
    score: number;
    interpretation: "ready_for_tollgate" | "needs_refinement" | "not_ready";
  };
  requiredActions: string[];
};

type OutcomeFramingAiReviewInput = {
  outcome: {
    key: string;
    title: string;
    problemStatement?: string | null;
    outcomeStatement?: string | null;
    baselineDefinition?: string | null;
    baselineSource?: string | null;
    solutionContext?: string | null;
    solutionConstraints?: string | null;
    dataSensitivity?: string | null;
    deliveryType?: DeliveryType | null;
    valueOwner?: string | null;
    aiUsageRole?: "support" | "generation" | "validation" | "decision_support" | "automation" | null;
    aiExecutionPattern?: "assisted" | "step_by_step" | "orchestrated" | null;
    aiUsageIntent?: string | null;
    businessImpactLevel?: "low" | "medium" | "high" | null;
    businessImpactRationale?: string | null;
    dataSensitivityLevel?: "low" | "medium" | "high" | null;
    dataSensitivityRationale?: string | null;
    blastRadiusLevel?: "low" | "medium" | "high" | null;
    blastRadiusRationale?: string | null;
    decisionImpactLevel?: "low" | "medium" | "high" | null;
    decisionImpactRationale?: string | null;
    aiLevelJustification?: string | null;
    riskAcceptedAt?: Date | null;
    riskAcceptedBy?: string | null;
    timeframe?: string | null;
    aiAccelerationLevel: "level_1" | "level_2" | "level_3";
    riskProfile: "low" | "medium" | "high";
  };
  epics: Array<{
    key: string;
    title: string;
    purpose?: string | null;
    scopeBoundary?: string | null;
    seedCount: number;
  }>;
  directionSeeds: Array<{
    storyIdeaId: string;
    seedId: string;
    title: string;
    epicKey?: string | null;
    shortDescription?: string | null;
    expectedBehavior?: string | null;
  }>;
  journeyContexts?: JourneyContext[];
  downstreamAiInstructions?: DownstreamAiInstructions | null;
};

const repositoryDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(repositoryDirectory, "../../../../");

function readValidationReference(fileName: string) {
  try {
    return readFileSync(path.join(repositoryRoot, fileName), "utf8").trim();
  } catch {
    return "";
  }
}

const validationQuestionsReference = readValidationReference("ValidationQuestionsTollgate1.md");
const validationRulesMetaReference = readValidationReference("ValidationRulesMeta.md");

function normalizeDeliveryType(value: string | null | undefined): DeliveryType | null {
  return value === "AD" || value === "AT" || value === "AM" ? value : null;
}

function getDeliveryTypeRuleSummary(deliveryType: DeliveryType | null) {
  if (deliveryType === "AT") {
    return [
      "AT is strict: baseline is mandatory and must be data-driven.",
      "AT problem framing should be fact-based and quantified, not only aspirational.",
      "Transformation without a baseline should not be considered ready.",
      "AI level must stay conservative when governance evidence is weak."
    ];
  }

  if (deliveryType === "AM") {
    return [
      "AM is operational: baseline is mandatory and should reflect real operating conditions.",
      "AM should use quantified operational evidence such as incidents, MTTR, SLA, queue volume, cost per ticket, or similar run-state data.",
      "Operational improvement without supporting data should not be considered ready.",
      "Story ideas and epics should focus on service optimization, automation, and stability improvements."
    ];
  }

  if (deliveryType === "AD") {
    return [
      "AD can start from a weaker baseline, but a value hypothesis still needs to be explicit.",
      "Outcome should describe a business or user effect, not a feature output.",
      "Lack of baseline is a warning in AD, not automatically a stop condition.",
      "Epics should describe functional capabilities that support the intended value."
    ];
  }

  return [
    "Apply general framing rigor conservatively.",
    "Prefer the smallest useful corrective action over a full rewrite."
  ];
}

function buildValidationReferenceContext(deliveryType: DeliveryType | null) {
  const summary = getDeliveryTypeRuleSummary(deliveryType);
  const docs = [
    validationQuestionsReference ? `ValidationQuestionsTollgate1.md\n${validationQuestionsReference}` : "",
    validationRulesMetaReference ? `ValidationRulesMeta.md\n${validationRulesMetaReference}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    summary,
    docs
  };
}

function containsQuantifiedEvidence(value: string | null | undefined) {
  if (!value?.trim()) {
    return false;
  }

  return /\b\d+(?:[.,]\d+)?\b|%|lead time|cycle time|cost|incident|mttr|sla|availability|throughput|latency|queue|backlog/i.test(
    value
  );
}

function countOperationalSignals(value: string) {
  const patterns = [
    /\bincident/i,
    /\bmttr\b/i,
    /\bsla\b/i,
    /\bavailability\b/i,
    /\bcost per (ticket|case|issue|request|incident)\b/i,
    /\bresponse time\b/i,
    /\bresolution time\b/i,
    /\bqueue\b/i,
    /\bbacklog\b/i,
    /\bvolume\b/i
  ];

  return patterns.reduce((count, pattern) => count + (pattern.test(value) ? 1 : 0), 0);
}

function buildConservativeFieldSuggestion(input: {
  field: "outcome_statement" | "baseline_definition";
  deliveryType?: DeliveryType | null;
  title?: string | null;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
}) {
  const deliveryType = normalizeDeliveryType(input.deliveryType);
  const title = input.title?.trim() || "the case";
  const problem = input.problemStatement?.trim() || "the current problem";
  const outcome = input.outcomeStatement?.trim() || "a clearer measurable effect";

  if (input.field === "outcome_statement") {
    if (deliveryType === "AT") {
      return `Reduce the verified structural problem described in ${title} with a measurable improvement in lead time, cost, quality, or risk.`;
    }

    if (deliveryType === "AM") {
      return `Improve operational performance for ${title} with a measurable effect on stability, handling time, service quality, or support cost.`;
    }

    return `Create a measurable business or user effect for ${title} by addressing ${problem}.`;
  }

  if (deliveryType === "AT") {
    return `Current baseline for ${title}: quantify today's lead time, maintenance cost, incident load, dependency complexity, or similar structural indicators before change.`;
  }

  if (deliveryType === "AM") {
    return `Current operational baseline for ${title}: quantify incident volume, MTTR, SLA performance, queue volume, or cost per ticket before improvement work starts.`;
  }

  return `Current baseline for ${title}: describe how the work is done today and what measurable starting point exists before moving toward ${outcome}.`;
}

function parseOutcomeFieldAiValidation(input: unknown): OutcomeFieldAiValidation {
  if (!input || typeof input !== "object") {
    throw new Error("AI validation response was not an object.");
  }

  const candidate = input as Record<string, unknown>;
  const field = candidate.field;
  const verdict = candidate.verdict;
  const confidence = candidate.confidence;
  const rationale = candidate.rationale;
  const suggestedRewrite = candidate.suggestedRewrite;

  if (field !== "outcome_statement" && field !== "baseline_definition") {
    throw new Error("AI validation returned an invalid field.");
  }

  if (verdict !== "good" && verdict !== "needs_revision" && verdict !== "unclear") {
    throw new Error("AI validation returned an invalid verdict.");
  }

  if (confidence !== "high" && confidence !== "medium" && confidence !== "low") {
    throw new Error("AI validation returned an invalid confidence.");
  }

  if (typeof rationale !== "string" || !rationale.trim()) {
    throw new Error("AI validation returned an invalid rationale.");
  }

  if (suggestedRewrite !== null && suggestedRewrite !== undefined && typeof suggestedRewrite !== "string") {
    throw new Error("AI validation returned an invalid suggested rewrite.");
  }

  return {
    field,
    verdict,
    confidence,
    rationale: rationale.trim(),
    suggestedRewrite: typeof suggestedRewrite === "string" && suggestedRewrite.trim() ? suggestedRewrite.trim() : null
  };
}

function parseOutcomeFramingAiReview(input: unknown): OutcomeFramingAiReview {
  if (!input || typeof input !== "object") {
    throw new Error("AI framing review response was not an object.");
  }

  const candidate = input as Record<string, unknown>;
  const outcomeQuality = candidate.outcomeQuality;
  const problemAlignment = candidate.problemAlignment;
  const epicCoverage = candidate.epicCoverage;
  const storyCoverage = candidate.storyCoverage;
  const riskOverview = candidate.riskOverview;
  const aiLevel = candidate.aiLevel;
  const journeyContext = candidate.journeyContext;
  const downstreamAiInstructions = candidate.downstreamAiInstructions;
  const tollgateHandshake = candidate.tollgateHandshake;
  const framingReadiness = candidate.framingReadiness;

  if (!outcomeQuality || typeof outcomeQuality !== "object") {
    throw new Error("AI framing review returned invalid outcome quality.");
  }

  if (!problemAlignment || typeof problemAlignment !== "object") {
    throw new Error("AI framing review returned invalid problem alignment.");
  }

  if (!epicCoverage || typeof epicCoverage !== "object") {
    throw new Error("AI framing review returned invalid epic coverage.");
  }

  if (!storyCoverage || typeof storyCoverage !== "object") {
    throw new Error("AI framing review returned invalid story coverage.");
  }

  if (!riskOverview || typeof riskOverview !== "object") {
    throw new Error("AI framing review returned invalid risk overview.");
  }

  if (!aiLevel || typeof aiLevel !== "object") {
    throw new Error("AI framing review returned invalid AI level section.");
  }

  if (!framingReadiness || typeof framingReadiness !== "object") {
    throw new Error("AI framing review returned invalid framing readiness.");
  }

  const parsedOutcomeQuality = outcomeQuality as Record<string, unknown>;
  const parsedProblemAlignment = problemAlignment as Record<string, unknown>;
  const parsedEpicCoverage = epicCoverage as Record<string, unknown>;
  const parsedStoryCoverage = storyCoverage as Record<string, unknown>;
  const parsedRiskOverview = riskOverview as Record<string, unknown>;
  const parsedAiLevel = aiLevel as Record<string, unknown>;
  const parsedFramingReadiness = framingReadiness as Record<string, unknown>;

  if (parsedOutcomeQuality.status !== "ok" && parsedOutcomeQuality.status !== "needs_improvement") {
    throw new Error("AI framing review returned an invalid outcome quality status.");
  }

  if (parsedProblemAlignment.status !== "strong" && parsedProblemAlignment.status !== "weak") {
    throw new Error("AI framing review returned an invalid problem alignment status.");
  }

  if (parsedEpicCoverage.status !== "complete" && parsedEpicCoverage.status !== "partial") {
    throw new Error("AI framing review returned an invalid epic coverage status.");
  }

  if (parsedStoryCoverage.status !== "good" && parsedStoryCoverage.status !== "partial") {
    throw new Error("AI framing review returned an invalid story coverage status.");
  }

  if (
    parsedRiskOverview.expansionRisk !== "low" &&
    parsedRiskOverview.expansionRisk !== "medium" &&
    parsedRiskOverview.expansionRisk !== "high"
  ) {
    throw new Error("AI framing review returned an invalid expansion risk.");
  }

  if (
    parsedRiskOverview.misalignmentRisk !== "low" &&
    parsedRiskOverview.misalignmentRisk !== "medium" &&
    parsedRiskOverview.misalignmentRisk !== "high"
  ) {
    throw new Error("AI framing review returned an invalid misalignment risk.");
  }

  if (
    parsedAiLevel.assessment !== "appropriate" &&
    parsedAiLevel.assessment !== "too_high" &&
    parsedAiLevel.assessment !== "too_low"
  ) {
    throw new Error("AI framing review returned an invalid AI level assessment.");
  }

  if (
    parsedAiLevel.suggestedLevel !== null &&
    parsedAiLevel.suggestedLevel !== "level_1" &&
    parsedAiLevel.suggestedLevel !== "level_2" &&
    parsedAiLevel.suggestedLevel !== "level_3"
  ) {
    throw new Error("AI framing review returned an invalid suggested AI level.");
  }

  if (
    parsedFramingReadiness.interpretation !== "ready_for_tollgate" &&
    parsedFramingReadiness.interpretation !== "needs_refinement" &&
    parsedFramingReadiness.interpretation !== "not_ready"
  ) {
    throw new Error("AI framing review returned an invalid readiness interpretation.");
  }

  if (
    typeof parsedOutcomeQuality.comment !== "string" ||
    typeof parsedOutcomeQuality.suggestedImprovement !== "string" ||
    typeof parsedProblemAlignment.comment !== "string" ||
    typeof parsedEpicCoverage.comment !== "string" ||
    typeof parsedStoryCoverage.comment !== "string" ||
    typeof parsedAiLevel.comment !== "string"
  ) {
    throw new Error("AI framing review returned invalid comments.");
  }

  if (
    !Array.isArray(parsedEpicCoverage.missingAreas) ||
    !parsedEpicCoverage.missingAreas.every((item) => typeof item === "string") ||
    !Array.isArray(parsedStoryCoverage.gapsOrOverlaps) ||
    !parsedStoryCoverage.gapsOrOverlaps.every((item) => typeof item === "string") ||
    !Array.isArray(parsedRiskOverview.topRisks) ||
    !parsedRiskOverview.topRisks.every((item) => typeof item === "string")
  ) {
    throw new Error("AI framing review returned invalid lists.");
  }

  if (
    typeof parsedFramingReadiness.score !== "number" ||
    Number.isNaN(parsedFramingReadiness.score) ||
    parsedFramingReadiness.score < 0 ||
    parsedFramingReadiness.score > 100
  ) {
    throw new Error("AI framing review returned an invalid readiness score.");
  }

  const defaultJourneyContext: OutcomeFramingAiReview["journeyContext"] = {
    status: "not_used",
    comment: "No Journey Context review details were returned.",
    gaps: []
  };
  const defaultDownstreamAiInstructions: OutcomeFramingAiReview["downstreamAiInstructions"] = {
    status: "not_configured",
    comment: "No Downstream AI Instructions review details were returned.",
    warnings: []
  };
  const defaultTollgateHandshake: OutcomeFramingAiReview["tollgateHandshake"] = {
    status: "needs_refinement",
    comment: "No Tollgate 1 handshake summary was returned.",
    missingItems: []
  };

  const parsedJourneyContext =
    journeyContext && typeof journeyContext === "object"
      ? (journeyContext as Record<string, unknown>)
      : null;
  const parsedDownstreamAiInstructions =
    downstreamAiInstructions && typeof downstreamAiInstructions === "object"
      ? (downstreamAiInstructions as Record<string, unknown>)
      : null;
  const parsedTollgateHandshake =
    tollgateHandshake && typeof tollgateHandshake === "object"
      ? (tollgateHandshake as Record<string, unknown>)
      : null;

  return {
    validationMode: "generic",
    outcomeQuality: {
      status: parsedOutcomeQuality.status,
      comment: parsedOutcomeQuality.comment.trim(),
      suggestedImprovement: parsedOutcomeQuality.suggestedImprovement.trim()
    },
    problemAlignment: {
      status: parsedProblemAlignment.status,
      comment: String(parsedProblemAlignment.comment).trim()
    },
    epicCoverage: {
      status: parsedEpicCoverage.status,
      comment: parsedEpicCoverage.comment.trim(),
      missingAreas: parsedEpicCoverage.missingAreas.map((item) => item.trim()).filter(Boolean)
    },
    storyCoverage: {
      status: parsedStoryCoverage.status,
      comment: parsedStoryCoverage.comment.trim(),
      gapsOrOverlaps: parsedStoryCoverage.gapsOrOverlaps.map((item) => item.trim()).filter(Boolean)
    },
    riskOverview: {
      topRisks: parsedRiskOverview.topRisks.map((item) => item.trim()).filter(Boolean),
      expansionRisk: parsedRiskOverview.expansionRisk,
      misalignmentRisk: parsedRiskOverview.misalignmentRisk
    },
    aiLevel: {
      assessment: parsedAiLevel.assessment,
      suggestedLevel: parsedAiLevel.suggestedLevel,
      comment: parsedAiLevel.comment.trim()
    },
    journeyContext:
      parsedJourneyContext &&
      (parsedJourneyContext.status === "not_used" ||
        parsedJourneyContext.status === "helpful" ||
        parsedJourneyContext.status === "needs_refinement") &&
      typeof parsedJourneyContext.comment === "string" &&
      Array.isArray(parsedJourneyContext.gaps) &&
      parsedJourneyContext.gaps.every((item) => typeof item === "string")
        ? {
            status: parsedJourneyContext.status,
            comment: parsedJourneyContext.comment.trim(),
            gaps: parsedJourneyContext.gaps.map((item) => item.trim()).filter(Boolean)
          }
        : defaultJourneyContext,
    downstreamAiInstructions:
      parsedDownstreamAiInstructions &&
      (parsedDownstreamAiInstructions.status === "not_configured" ||
        parsedDownstreamAiInstructions.status === "configured" ||
        parsedDownstreamAiInstructions.status === "needs_refinement") &&
      typeof parsedDownstreamAiInstructions.comment === "string" &&
      Array.isArray(parsedDownstreamAiInstructions.warnings) &&
      parsedDownstreamAiInstructions.warnings.every((item) => typeof item === "string")
        ? {
            status: parsedDownstreamAiInstructions.status,
            comment: parsedDownstreamAiInstructions.comment.trim(),
            warnings: parsedDownstreamAiInstructions.warnings.map((item) => item.trim()).filter(Boolean)
          }
        : defaultDownstreamAiInstructions,
    tollgateHandshake:
      parsedTollgateHandshake &&
      (parsedTollgateHandshake.status === "ready" || parsedTollgateHandshake.status === "needs_refinement") &&
      typeof parsedTollgateHandshake.comment === "string" &&
      Array.isArray(parsedTollgateHandshake.missingItems) &&
      parsedTollgateHandshake.missingItems.every((item) => typeof item === "string")
        ? {
            status: parsedTollgateHandshake.status,
            comment: parsedTollgateHandshake.comment.trim(),
            missingItems: parsedTollgateHandshake.missingItems.map((item) => item.trim()).filter(Boolean)
          }
        : defaultTollgateHandshake,
    framingReadiness: {
      score: Math.round(parsedFramingReadiness.score),
      interpretation: parsedFramingReadiness.interpretation
    },
    requiredActions: []
  };
}

function prependUnique(referenceFindings: string[], existing: string[]) {
  const normalized = new Set(existing.map((item) => item.trim().toLowerCase()));
  const additions = referenceFindings.filter((item) => {
    const key = item.trim().toLowerCase();

    if (!key || normalized.has(key)) {
      return false;
    }

    normalized.add(key);
    return true;
  });

  return [...additions, ...existing];
}

function deriveDeterministicFramingAdjustments(
  input: OutcomeFramingAiReviewInput,
  report: OutcomeFramingAiReview
): OutcomeFramingAiReview {
  const deliveryType = normalizeDeliveryType(input.outcome.deliveryType);
  const epicKeys = new Set(input.epics.map((epic) => epic.key));
  const epicCoverageFindings: string[] = [];
  const storyCoverageFindings: string[] = [];
  const journeyFindings: string[] = [];
  const downstreamFindings: string[] = [];
  const handshakeFindings: string[] = [];
  const riskFindings: string[] = [];
  const requiredActions: string[] = [];
  const combinedProblemEvidence = [input.outcome.problemStatement, input.outcome.baselineDefinition, input.outcome.baselineSource]
    .filter(Boolean)
    .join(" ");
  const journeyContexts = input.journeyContexts ?? [];
  const totalJourneys = journeyContexts.reduce((count, context) => count + context.journeys.length, 0);
  const allJourneys = journeyContexts.flatMap((context) =>
    context.journeys.map((journey) => ({
      context,
      journey
    }))
  );
  const journeysWithoutCoverage = allJourneys.filter(
    ({ journey }) => !journey.coverage || journey.coverage.status === "unanalysed"
  );
  const uncoveredJourneys = allJourneys.filter(({ journey }) => journey.coverage?.status === "uncovered");
  const representedStoryIdeaIds = new Set(
    allJourneys.flatMap(({ journey }) => [
      ...(journey.linkedStoryIdeaIds ?? []),
      ...(journey.coverage?.suggestedStoryIdeaIds ?? [])
    ])
  );
  const storyIdeasOutsideJourneys = input.directionSeeds.filter(
    (seed) => !representedStoryIdeaIds.has(seed.storyIdeaId)
  );
  const granularJourneys = allJourneys.filter(({ journey }) => journey.steps.length >= 8);
  const incompleteJourneys = allJourneys.filter(
    ({ journey }) =>
      !journey.title.trim() ||
      !journey.primaryActor.trim() ||
      !journey.goal.trim() ||
      !journey.trigger.trim()
  );
  const parsedDownstreamInstructions = input.downstreamAiInstructions ?? null;
  const downstreamAnalysis = parsedDownstreamInstructions
    ? analyzeDownstreamAiInstructions({
        instructions: parsedDownstreamInstructions,
        hasJourneyContext: journeyContexts.length > 0
      })
    : null;
  const expectedDownstreamAiLevel = mapAiAccelerationLevelToDownstreamAiLevel(input.outcome.aiAccelerationLevel);

  if (!input.outcome.outcomeStatement?.trim()) {
    report.outcomeQuality.status = "needs_improvement";
    report.outcomeQuality.comment = "Outcome statement is missing, so the intended business effect is still unclear.";
    report.outcomeQuality.suggestedImprovement = "Add one measurable outcome statement before Tollgate 1.";
    riskFindings.push(`[${input.outcome.key}] Outcome statement is missing, which increases the risk of solving the wrong problem.`);
    requiredActions.push("Add a measurable outcome statement before Tollgate 1.");
  }

  if (!input.outcome.baselineDefinition?.trim()) {
    report.outcomeQuality.status = "needs_improvement";
    report.outcomeQuality.comment =
      deliveryType === "AD"
        ? "Baseline is thin, so progress from the current state will be harder to judge."
        : "Baseline is not defined clearly enough to judge progress from the current state.";
    report.outcomeQuality.suggestedImprovement =
      deliveryType === "AD"
        ? "Add a lightweight current-state baseline or starting assumption before Tollgate 1."
        : "Add a concrete baseline definition that describes the current state with measurable evidence.";
    riskFindings.push(
      `[${input.outcome.key}] Baseline definition is missing, which weakens measurement and decision confidence.`
    );
    requiredActions.push(
      deliveryType === "AD"
        ? "Add a lightweight baseline so the value hypothesis has a visible starting point."
        : `Add a data-backed baseline because ${deliveryType ?? "this"} framing requires one.`
    );
  }

  if (!input.outcome.valueOwner?.trim()) {
    riskFindings.push(`[${input.outcome.key}] Value Owner is not visible in the framing payload.`);
    requiredActions.push("Assign a visible Value Owner before approval.");
  }

  if (deliveryType === "AT" && !containsQuantifiedEvidence(combinedProblemEvidence)) {
    report.problemAlignment.status = "weak";
    report.problemAlignment.comment =
      "AT framing needs a fact-based and quantified problem definition, but the current problem and baseline evidence are still too soft.";
    riskFindings.push(`[${input.outcome.key}] AT framing lacks quantified transformation evidence.`);
    requiredActions.push("Quantify the transformation problem with current-state metrics before approval.");
  }

  if (deliveryType === "AM") {
    const operationalSignalCount = countOperationalSignals(combinedProblemEvidence);

    if (operationalSignalCount < 2) {
      report.problemAlignment.status = "weak";
      report.outcomeQuality.status = "needs_improvement";
      report.outcomeQuality.comment =
        "AM framing should be grounded in operational evidence, but the baseline does not yet show enough run-state signals.";
      report.outcomeQuality.suggestedImprovement =
        "Add at least two operational datapoints such as incidents, MTTR, SLA, queue volume, or cost per ticket.";
      riskFindings.push(`[${input.outcome.key}] AM framing lacks enough operational datapoints to validate the improvement case.`);
      requiredActions.push("Add at least two operational datapoints to justify the AM framing.");
    }
  }

  if (input.epics.length === 0) {
    report.epicCoverage.status = "partial";
    epicCoverageFindings.push(`[${input.outcome.key}] No Epics are defined yet.`);
    requiredActions.push("Define at least one Epic linked to the Outcome.");
  }

  for (const epic of input.epics) {
    if (!epic.purpose?.trim() && !epic.scopeBoundary?.trim()) {
      report.epicCoverage.status = "partial";
      epicCoverageFindings.push(`[${epic.key}] Epic direction is too thin to judge coverage cleanly.`);
    }
  }

  if (input.directionSeeds.length === 0) {
    report.storyCoverage.status = "partial";
    storyCoverageFindings.push(`[${input.outcome.key}] No Story Ideas are defined yet.`);
    requiredActions.push("Capture at least one Story Idea before asking Tollgate 1 to sign the package.");
  }

  for (const seed of input.directionSeeds) {
    if (!seed.epicKey || !epicKeys.has(seed.epicKey)) {
      report.storyCoverage.status = "partial";
      storyCoverageFindings.push(`[${seed.seedId}] Story Idea is missing a valid Epic link.`);
      riskFindings.push(`[${seed.seedId}] Story Idea lacks a reliable Epic link, which increases misalignment risk.`);
      requiredActions.push(`Link Story Idea ${seed.seedId} to a valid Epic.`);
    }

    if (!seed.shortDescription?.trim()) {
      report.storyCoverage.status = "partial";
      storyCoverageFindings.push(`[${seed.seedId}] Value Intent is missing or too thin.`);
      requiredActions.push(`Strengthen the Value Intent for Story Idea ${seed.seedId}.`);
    }

    if (!seed.expectedBehavior?.trim()) {
      report.storyCoverage.status = "partial";
      storyCoverageFindings.push(`[${seed.seedId}] Expected Behavior is missing.`);
      riskFindings.push(`[${seed.seedId}] Missing Expected Behavior increases the risk of scope expansion during design.`);
      requiredActions.push(`Add Expected Behavior for Story Idea ${seed.seedId}.`);
    }
  }

  if (input.outcome.aiAccelerationLevel === "level_3") {
    if (!input.outcome.riskAcceptedAt || !input.outcome.riskAcceptedBy) {
      report.aiLevel.assessment = "too_high";
      report.aiLevel.suggestedLevel = "level_2";
      report.aiLevel.comment =
        "Level 3 needs stronger governance evidence. Risk acceptance is not yet visible in the framing payload.";
      riskFindings.push(`[${input.outcome.key}] Level 3 AI acceleration is proposed without visible risk acceptance.`);
      requiredActions.push("Record explicit risk acceptance before keeping AI Level 3.");
    }

    if ((deliveryType === "AT" || deliveryType === "AM") && !input.outcome.baselineDefinition?.trim()) {
      report.aiLevel.assessment = "too_high";
      report.aiLevel.suggestedLevel = "level_2";
      report.aiLevel.comment =
        "Level 3 is too ambitious while the baseline remains incomplete for this delivery type.";
      riskFindings.push(`[${input.outcome.key}] Level 3 AI acceleration exceeds the available baseline evidence.`);
      requiredActions.push(`Reduce AI acceleration level or complete the ${deliveryType} baseline first.`);
    }
  }

  if (journeyContexts.length === 0) {
    report.journeyContext.status = "not_used";
    report.journeyContext.comment =
      "No Journey Context is captured. That is optional, but downstream refinement can only rely on the main Framing spine right now.";

    if (input.outcome.aiAccelerationLevel !== "level_1") {
      requiredActions.push("Decide whether a broad Journey Context would help downstream AI refine this case before export.");
    }
  } else {
    report.journeyContext.status = "helpful";
    report.journeyContext.comment = `Journey Context adds ${totalJourneys} Journey${totalJourneys === 1 ? "" : "s"} of extra business-flow context to the package.`;

    if (totalJourneys === 0) {
      report.journeyContext.status = "needs_refinement";
      journeyFindings.push("Journey Context exists, but it still contains no Journeys.");
      requiredActions.push("Add at least one broad Journey before relying on Journey Context in Framing.");
    }

    if (incompleteJourneys.length > 0) {
      report.journeyContext.status = "needs_refinement";
      journeyFindings.push(
        `${incompleteJourneys.length} Journey${incompleteJourneys.length === 1 ? "" : "s"} still miss core actor, goal, or trigger framing.`
      );
      requiredActions.push("Complete the core actor, goal, and trigger fields for each saved Journey.");
    }

    if (journeysWithoutCoverage.length > 0 && input.directionSeeds.length > 0) {
      journeyFindings.push(
        `${journeysWithoutCoverage.length} Journey${journeysWithoutCoverage.length === 1 ? "" : "s"} have not yet been checked against Story Ideas and Epics.`
      );
      requiredActions.push("Run Journey Coverage analysis before final export when Journey Context is part of the package.");
    }

    if (uncoveredJourneys.length > 0) {
      report.journeyContext.status = "needs_refinement";
      journeyFindings.push(
        `${uncoveredJourneys.length} Journey${uncoveredJourneys.length === 1 ? " appears" : " appear"} uncovered by the current Story Ideas or Epics.`
      );
      requiredActions.push("Resolve uncovered Journeys by refining Story Ideas, Epics, or the Journey framing.");
    }

    if (storyIdeasOutsideJourneys.length > 0) {
      storyCoverageFindings.push(
        `${storyIdeasOutsideJourneys
          .slice(0, 3)
          .map((seed) => `[${seed.seedId}]`)
          .join(", ")} ${storyIdeasOutsideJourneys.length === 1 ? "is" : "are"} not currently visible in any Journey.`
      );
      requiredActions.push(
        "Review whether each Story Idea should be represented by a Journey when Journey Context is part of the case."
      );
    }

    if (granularJourneys.length > 0) {
      journeyFindings.push(
        `${granularJourneys.length} Journey${granularJourneys.length === 1 ? "" : "s"} look overly granular and may need to be simplified back to broad flow guidance.`
      );
    }
  }

  if (!parsedDownstreamInstructions) {
    report.downstreamAiInstructions.status = "not_configured";
    report.downstreamAiInstructions.comment =
      "Downstream AI Instructions are not configured yet. Export still works, but later Design and Build AI will receive looser guidance.";

    if (input.outcome.aiAccelerationLevel !== "level_1") {
      requiredActions.push("Configure Downstream AI Instructions before export if downstream AI is expected to do meaningful refinement.");
    }
  } else {
    const warnings = downstreamAnalysis ? [...downstreamAnalysis.hardIssues, ...downstreamAnalysis.warnings] : [];
    report.downstreamAiInstructions.status =
      warnings.length > 0 || parsedDownstreamInstructions.aiLevel !== expectedDownstreamAiLevel
        ? "needs_refinement"
        : "configured";
    report.downstreamAiInstructions.comment =
      report.downstreamAiInstructions.status === "configured"
        ? "Downstream AI Instructions are configured and aligned closely enough to guide Design and Build refinement."
        : "Downstream AI Instructions exist, but they still contain issues or weak combinations that could dilute downstream guidance.";

    if (parsedDownstreamInstructions.aiLevel !== expectedDownstreamAiLevel) {
      downstreamFindings.push(
        `Downstream AI Instructions use AI Level ${parsedDownstreamInstructions.aiLevel}, while the current Framing case is set to ${expectedDownstreamAiLevel}.`
      );
      requiredActions.push("Align the Downstream AI Instructions AI Level with the current Framing AI level.");
    }

    for (const issue of warnings.slice(0, 5)) {
      downstreamFindings.push(issue);
    }

    for (const issue of downstreamAnalysis?.hardIssues ?? []) {
      requiredActions.push(issue);
    }
  }

  const hasBaselineForHandshake = Boolean(input.outcome.baselineDefinition?.trim());
  const hasRiskRationale =
    Boolean(input.outcome.businessImpactRationale?.trim()) &&
    Boolean(input.outcome.dataSensitivityRationale?.trim()) &&
    Boolean(input.outcome.blastRadiusRationale?.trim()) &&
    Boolean(input.outcome.decisionImpactRationale?.trim());

  if (!input.outcome.valueOwner?.trim()) {
    handshakeFindings.push("Value Owner is missing from the approval package.");
  }

  if (!input.outcome.problemStatement?.trim()) {
    handshakeFindings.push("Problem statement is missing from the handshake package.");
  }

  if (!input.outcome.outcomeStatement?.trim()) {
    handshakeFindings.push("Outcome statement is missing from the handshake package.");
  }

  if ((deliveryType === "AT" || deliveryType === "AM") && !hasBaselineForHandshake) {
    handshakeFindings.push(`${deliveryType} requires a visible baseline in the signed Tollgate 1 package.`);
  }

  if (input.epics.length === 0) {
    handshakeFindings.push("No Epics are available for the Tollgate 1 handshake.");
  }

  if (input.directionSeeds.length === 0) {
    handshakeFindings.push("No Story Ideas are available for the Tollgate 1 handshake.");
  }

  if (!hasRiskRationale) {
    handshakeFindings.push("Structured risk rationale is still incomplete for the Tollgate 1 handshake.");
  }

  if (journeyContexts.length > 0 && report.journeyContext.status === "needs_refinement") {
    handshakeFindings.push("Journey Context exists, but it is not yet strong enough to sign as part of the package.");
  }

  if (parsedDownstreamInstructions && report.downstreamAiInstructions.status === "needs_refinement") {
    handshakeFindings.push("Downstream AI Instructions exist, but their current configuration is too weak to sign with confidence.");
  }

  report.tollgateHandshake = {
    status: handshakeFindings.length === 0 ? "ready" : "needs_refinement",
    comment:
      handshakeFindings.length === 0
        ? "The current Framing package looks structurally complete enough to become the Tollgate 1 handshake document."
        : "The current Framing package can still be refined before Tollgate 1 so the signed handshake is clearer and more complete.",
    missingItems: handshakeFindings
  };

  report.epicCoverage.missingAreas = prependUnique(epicCoverageFindings, report.epicCoverage.missingAreas);
  report.storyCoverage.gapsOrOverlaps = prependUnique(storyCoverageFindings, report.storyCoverage.gapsOrOverlaps);
  report.journeyContext.gaps = prependUnique(journeyFindings, report.journeyContext.gaps);
  report.downstreamAiInstructions.warnings = prependUnique(
    downstreamFindings,
    report.downstreamAiInstructions.warnings
  );
  report.tollgateHandshake.missingItems = prependUnique(
    handshakeFindings,
    report.tollgateHandshake.missingItems
  );
  report.riskOverview.topRisks = prependUnique(riskFindings, report.riskOverview.topRisks).slice(0, 5);
  report.validationMode = deliveryType ?? "generic";
  report.requiredActions = prependUnique(requiredActions, report.requiredActions).slice(0, 10);

  if (storyCoverageFindings.length > 0 && report.storyCoverage.comment.length > 0) {
    const referencedSeeds = storyCoverageFindings
      .map((item) => item.match(/\[([^\]]+)\]/)?.[1] ?? null)
      .filter(Boolean)
      .join(", ");

    if (referencedSeeds) {
      report.storyCoverage.comment = `${report.storyCoverage.comment} Referenced Story Ideas: ${referencedSeeds}.`;
    }
  }

  if (epicCoverageFindings.length > 0 && report.epicCoverage.comment.length > 0) {
    const referencedEpics = epicCoverageFindings
      .map((item) => item.match(/\[([^\]]+)\]/)?.[1] ?? null)
      .filter(Boolean)
      .join(", ");

    if (referencedEpics) {
      report.epicCoverage.comment = `${report.epicCoverage.comment} Referenced Epics: ${referencedEpics}.`;
    }
  }

  let readinessScore = 100;

  if (report.outcomeQuality.status === "needs_improvement") {
    readinessScore -= 15;
  }

  if (report.problemAlignment.status === "weak") {
    readinessScore -= 15;
  }

  if (report.epicCoverage.status === "partial") {
    readinessScore -= 10;
  }

  if (report.storyCoverage.status === "partial") {
    readinessScore -= 10;
  }

  if (report.riskOverview.expansionRisk === "high" || report.riskOverview.misalignmentRisk === "high") {
    readinessScore -= 20;
  }

  if (report.aiLevel.assessment !== "appropriate") {
    readinessScore -= 10;
  }

  if (report.journeyContext.status === "needs_refinement") {
    readinessScore -= 8;
  }

  if (report.downstreamAiInstructions.status === "needs_refinement") {
    readinessScore -= 8;
  }

  if (!parsedDownstreamInstructions && input.outcome.aiAccelerationLevel !== "level_1") {
    readinessScore -= 5;
  }

  if (report.tollgateHandshake.status === "needs_refinement") {
    readinessScore -= 10;
  }

  if (deliveryType === "AT" && !input.outcome.baselineDefinition?.trim()) {
    readinessScore -= 20;
  }

  if (deliveryType === "AM" && !input.outcome.baselineDefinition?.trim()) {
    readinessScore -= 20;
  }

  if ((deliveryType === "AT" || deliveryType === "AM") && report.problemAlignment.status === "weak") {
    readinessScore -= 10;
  }

  if (!input.outcome.valueOwner?.trim()) {
    readinessScore -= 10;
  }

  readinessScore = Math.max(0, Math.min(100, readinessScore));

  report.framingReadiness = {
    score: readinessScore,
    interpretation:
      deliveryType === "AT" && !input.outcome.baselineDefinition?.trim()
        ? "not_ready"
        : deliveryType === "AM" && (!input.outcome.baselineDefinition?.trim() || report.problemAlignment.status === "weak")
          ? "not_ready"
          : !input.outcome.outcomeStatement?.trim() || input.epics.length === 0
            ? "not_ready"
            : report.tollgateHandshake.missingItems.length >= 5
              ? "not_ready"
            : readinessScore >= 80
              ? "ready_for_tollgate"
              : readinessScore >= 60
                ? "needs_refinement"
                : "not_ready"
  };

  return report;
}

function parseStoryExpectedBehaviorAiValidation(input: unknown): StoryExpectedBehaviorAiValidation {
  if (!input || typeof input !== "object") {
    throw new Error("AI validation response was not an object.");
  }

  const candidate = input as Record<string, unknown>;
  const field = candidate.field;
  const verdict = candidate.verdict;
  const confidence = candidate.confidence;
  const rationale = candidate.rationale;
  const suggestedRewrite = candidate.suggestedRewrite;

  if (field !== "story_expected_behavior") {
    throw new Error("AI validation returned an invalid field.");
  }

  if (verdict !== "good" && verdict !== "needs_revision" && verdict !== "unclear") {
    throw new Error("AI validation returned an invalid verdict.");
  }

  if (confidence !== "high" && confidence !== "medium" && confidence !== "low") {
    throw new Error("AI validation returned an invalid confidence.");
  }

  if (typeof rationale !== "string" || !rationale.trim()) {
    throw new Error("AI validation returned an invalid rationale.");
  }

  if (suggestedRewrite !== null && suggestedRewrite !== undefined && typeof suggestedRewrite !== "string") {
    throw new Error("AI validation returned an invalid suggested rewrite.");
  }

  return {
    field,
    verdict,
    confidence,
    rationale: rationale.trim(),
    suggestedRewrite: typeof suggestedRewrite === "string" && suggestedRewrite.trim() ? suggestedRewrite.trim() : null
  };
}

function readRequiredLlmEnv() {
  const endpoint = process.env.LLM_ENDPOINT?.trim() ?? "";
  const apiKey = process.env.LLM_ENDPOINT_KEY?.trim() ?? "";
  const model = process.env.LLM_MODEL?.trim() ?? "";

  if (!endpoint || !apiKey || !model) {
    throw new Error("AI validation is not configured. Set LLM_ENDPOINT, LLM_ENDPOINT_KEY, and LLM_MODEL.");
  }

  return {
    endpoint: endpoint.endsWith("/") ? endpoint : `${endpoint}/`,
    apiKey,
    model
  };
}

function extractOutputText(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object") {
    return "";
  }

  const body = responseBody as {
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  return (body.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text ?? "")
    .join("\n")
    .trim();
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("AI validation returned an empty response.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace < firstBrace) {
    throw new Error("AI validation did not return valid JSON.");
  }

  return candidate.slice(firstBrace, lastBrace + 1);
}

function buildPrompt(input: {
  field: "outcome_statement" | "baseline_definition";
  deliveryType?: DeliveryType | null;
  title?: string | null;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
  baselineDefinition?: string | null;
  baselineSource?: string | null;
  timeframe?: string | null;
}) {
  const deliveryType = normalizeDeliveryType(input.deliveryType);
  const validationReference = buildValidationReferenceContext(deliveryType);
  const fieldText = input.field === "outcome_statement" ? input.outcomeStatement : input.baselineDefinition;
  const payload = {
    field: input.field,
    deliveryType,
    title: input.title ?? null,
    problemStatement: input.problemStatement ?? null,
    outcomeStatement: input.outcomeStatement ?? null,
    baselineDefinition: input.baselineDefinition ?? null,
    baselineSource: input.baselineSource ?? null,
    timeframe: input.timeframe ?? null,
    fieldText: fieldText ?? null
  };

  return `
You validate governed Value Spine authoring text conservatively.

General rules:
- Do not nitpick or optimize text that is already good enough.
- Suggest a rewrite only when the text is clearly wrong, too vague to trust, or missing the essential idea.
- If the text is acceptable, return verdict "good" and leave suggestedRewrite null.
- If the field text is empty but the surrounding context is sufficient, propose a conservative starting draft in suggestedRewrite.
- Keep rationale short and concrete.
- Apply the delivery type rules strictly when the project type is provided.

Field guidance:
- outcome_statement: should describe a desired effect or result, not implementation work, deliverables, or a project task.
- baseline_definition: should describe the current starting state, present condition, or measurable baseline before change. It should not read like the desired future outcome or a delivery plan.

Delivery type specific rules:
${validationReference.summary.map((rule) => `- ${rule}`).join("\n")}

Verdicts:
- good = acceptable as written
- needs_revision = clearly the wrong shape or too weak to rely on
- unclear = borderline or hard to judge from the available text

Required output:
- Return JSON only.
- Shape:
  {
    "field": "outcome_statement" | "baseline_definition",
    "verdict": "good" | "needs_revision" | "unclear",
    "confidence": "high" | "medium" | "low",
    "rationale": "short explanation",
    "suggestedRewrite": "optional replacement text or null"
  }

Reference material from validation guidance:
${validationReference.docs || "No external validation markdown was available."}

Payload:
${JSON.stringify(payload, null, 2)}
  `.trim();
}

function buildFramingReviewPrompt(input: {
  outcome: OutcomeFramingAiReviewInput["outcome"];
  epics: OutcomeFramingAiReviewInput["epics"];
  directionSeeds: OutcomeFramingAiReviewInput["directionSeeds"];
  journeyContexts?: OutcomeFramingAiReviewInput["journeyContexts"];
  downstreamAiInstructions?: OutcomeFramingAiReviewInput["downstreamAiInstructions"];
}) {
  const deliveryType = normalizeDeliveryType(input.outcome.deliveryType);
  const validationReference = buildValidationReferenceContext(deliveryType);

  return `
You are validating a full AAS Framing Brief.

Your goal is NOT to rewrite the content, but to evaluate its quality and readiness for Tollgate 1.

Use a critical but constructive approach.

You will receive:
- Problem Statement
- Outcome (including baseline and owner context)
- Solution Context & Constraints
- AI execution pattern, lifecycle usage intent and structured risk rationale
- Optional Journey Context
- Epics
- Story Ideas (with Value Intent and Expected Behavior)
- Optional Downstream AI Instructions
- Selected AI Acceleration Level
- Delivery Type rules for ${deliveryType ?? "generic framing"}

Evaluate the framing across these dimensions:
1. Outcome Quality
2. Problem -> Outcome Alignment
3. Epic Coverage
4. Story Idea Coverage
5. Journey Context Quality
6. Downstream AI Instructions Quality
7. Tollgate 1 Handshake Completeness
8. Risk & Complexity
9. AI Level Appropriateness

Rules:
- Do NOT rewrite everything.
- Do NOT generate new full content.
- Do NOT overcomplicate.
- Do identify gaps, risks, assumption problems and the smallest useful improvements.
- Keep Story Ideas at framing level, not delivery level.
- Be concise, critical and useful.
- Be deterministic. The same input should lead to the same statuses and the same referenced items.
- When a gap or risk refers to a specific Epic or Story Idea, include its key in square brackets, for example [EPC-001] or [SEED-002].
- Do not mention an Epic or Story Idea without its reference key when one is available.
- Apply the delivery type rules below as hard validation policy, not as optional hints.

Delivery type validation rules:
${validationReference.summary.map((rule) => `- ${rule}`).join("\n")}

Evaluation details:
1. Outcome Quality
- Check if the outcome is measurable, baseline is defined and value is clear.
- Return status OK or Needs improvement.
- Include one short suggested improvement sentence.

2. Problem -> Outcome Alignment
- Check whether the outcome actually addresses the stated problem.
- Return status Strong or Weak with a short explanation.

3. Epic Coverage
- Check whether the epics cover the outcome, whether areas are missing, and whether epics overlap.
- Return status Complete or Partial.

4. Story Idea Coverage
- Check whether the story ideas support the epics, whether ideas are redundant, and whether important ideas are missing.
- Return status Good or Partial.

5. Journey Context Quality
- If Journey Context is absent, mark it as not_used and explain whether that is acceptable.
- If Journey Context exists, check whether Journeys are broad enough, whether actor/goal/trigger are visible, and whether coverage analysis or obvious links are missing.
- Return status Not used, Helpful, or Needs refinement.

6. Downstream AI Instructions Quality
- If Downstream AI Instructions are absent, mark them as not_configured.
- If they exist, check whether they are coherent, aligned with initiative type and AI level, and free from weak combinations.
- Return status Not configured, Configured, or Needs refinement.

7. Tollgate 1 Handshake Completeness
- Treat the full framing package as the future signed handshake document.
- Consider whether the package is complete enough for Tollgate 1, including optional Journey Context and Downstream AI Instructions when they exist.
- Return status Ready or Needs refinement.

8. Risk & Complexity
- Identify product, technical, data/privacy and AI-related risks.
- Also identify likely expansion and misalignment risk.
- Return top 3-5 risks, plus Expansion Risk and Misalignment Risk as Low/Medium/High.

9. AI Level Validation
- Check whether the selected AI level is appropriate for risk, clarity and structure.
- Return Appropriate, Too high or Too low.
- If not appropriate, suggest a better level.

Readiness score:
- Start at 100
- Deduct:
  -15 if outcome unclear
  -15 if alignment weak
  -10 if epic gaps
  -10 if story gaps
  -20 if high risk
  -10 if AI level mismatch

Interpretation:
- 80-100 -> Ready for Tollgate
- 60-79 -> Needs refinement
- below 60 -> Not ready

Reference material from validation guidance:
${validationReference.docs || "No external validation markdown was available."}

Required output:
- Return JSON only.
- Use exactly this shape:
{
  "outcomeQuality": {
    "status": "ok" | "needs_improvement",
    "comment": "short explanation",
    "suggestedImprovement": "one sentence"
  },
  "problemAlignment": {
    "status": "strong" | "weak",
    "comment": "short explanation"
  },
  "epicCoverage": {
    "status": "complete" | "partial",
    "comment": "short explanation",
    "missingAreas": ["..."]
  },
  "storyCoverage": {
    "status": "good" | "partial",
    "comment": "short explanation",
    "gapsOrOverlaps": ["..."]
  },
  "riskOverview": {
    "topRisks": ["risk 1", "risk 2", "risk 3"],
    "expansionRisk": "low" | "medium" | "high",
    "misalignmentRisk": "low" | "medium" | "high"
  },
  "aiLevel": {
    "assessment": "appropriate" | "too_high" | "too_low",
    "suggestedLevel": "level_1" | "level_2" | "level_3" | null,
    "comment": "short explanation"
  },
  "journeyContext": {
    "status": "not_used" | "helpful" | "needs_refinement",
    "comment": "short explanation",
    "gaps": ["..."]
  },
  "downstreamAiInstructions": {
    "status": "not_configured" | "configured" | "needs_refinement",
    "comment": "short explanation",
    "warnings": ["..."]
  },
  "tollgateHandshake": {
    "status": "ready" | "needs_refinement",
    "comment": "short explanation",
    "missingItems": ["..."]
  },
  "framingReadiness": {
    "score": 0,
    "interpretation": "ready_for_tollgate" | "needs_refinement" | "not_ready"
  }
}

Payload:
${JSON.stringify(input, null, 2)}
  `.trim();
}

function buildStoryExpectedBehaviorPrompt(input: {
  title?: string | null;
  valueIntent?: string | null;
  expectedBehavior?: string | null;
  epicTitle?: string | null;
  epicPurpose?: string | null;
  epicScopeBoundary?: string | null;
}) {
  return `
You improve and validate Story Idea expected behavior for AAS-style Framing.

Rules:
- Improve this Story Idea expected behavior so it is clear, concise, and suitable for Framing.
- Use the Value Intent and Epic as context.
- Keep it at framing level.
- Do not add acceptance criteria, test cases, implementation detail, or technical design.
- Flag if the description is too vague or if the Epic connection is weak.
- Do not nitpick text that is already good enough.
- If the text is acceptable, return verdict "good" and leave suggestedRewrite null.
- If expectedBehavior is empty but the Value Intent and Epic give enough context, suggest a concise framing-level starting text.

Verdicts:
- good = acceptable as written for framing
- needs_revision = clearly too vague, too detailed, or weakly connected to the epic/value intent
- unclear = borderline or hard to judge from the available context

Required output:
- Return JSON only.
- Shape:
  {
    "field": "story_expected_behavior",
    "verdict": "good" | "needs_revision" | "unclear",
    "confidence": "high" | "medium" | "low",
    "rationale": "short explanation",
    "suggestedRewrite": "optional replacement text or null"
  }

Payload:
${JSON.stringify(
  {
    field: "story_expected_behavior",
    title: input.title ?? null,
    valueIntent: input.valueIntent ?? null,
    expectedBehavior: input.expectedBehavior ?? null,
    epic: {
      title: input.epicTitle ?? null,
      purpose: input.epicPurpose ?? null,
      scopeBoundary: input.epicScopeBoundary ?? null
    }
  },
  null,
  2
)}
  `.trim();
}

function applyDeterministicFieldValidationAdjustments(
  input: {
    field: "outcome_statement" | "baseline_definition";
    deliveryType?: DeliveryType | null;
    title?: string | null;
    problemStatement?: string | null;
    outcomeStatement?: string | null;
    baselineDefinition?: string | null;
    baselineSource?: string | null;
  },
  result: OutcomeFieldAiValidation
) {
  const deliveryType = normalizeDeliveryType(input.deliveryType);
  const fieldText =
    input.field === "outcome_statement" ? input.outcomeStatement?.trim() ?? "" : input.baselineDefinition?.trim() ?? "";

  if (input.field === "outcome_statement" && !fieldText) {
    result.verdict = "needs_revision";
    result.confidence = "high";
    result.rationale = `Outcome statement is missing. ${deliveryType ?? "This"} framing still needs a measurable effect statement.`;
    result.suggestedRewrite ??= buildConservativeFieldSuggestion(input);
    return result;
  }

  if (input.field === "baseline_definition" && !fieldText) {
    if (deliveryType === "AT" || deliveryType === "AM") {
      result.verdict = "needs_revision";
      result.confidence = "high";
      result.rationale = `${deliveryType} framing requires a baseline. The current baseline definition is missing.`;
      result.suggestedRewrite ??= buildConservativeFieldSuggestion(input);
      return result;
    }

    if (deliveryType === "AD") {
      result.verdict = result.verdict === "good" ? "unclear" : result.verdict;
      result.confidence = result.confidence === "low" ? "low" : "medium";
      result.rationale = "AD framing can start with a lighter baseline, but adding one will make value validation easier.";
      result.suggestedRewrite ??= buildConservativeFieldSuggestion(input);
    }
  }

  if (input.field === "baseline_definition" && deliveryType === "AT" && !containsQuantifiedEvidence(fieldText)) {
    result.verdict = "needs_revision";
    result.confidence = "high";
    result.rationale = "AT framing needs a quantified baseline. The current baseline text is still too qualitative.";
    result.suggestedRewrite ??= buildConservativeFieldSuggestion(input);
  }

  if (input.field === "baseline_definition" && deliveryType === "AM" && countOperationalSignals(fieldText) < 2) {
    result.verdict = "needs_revision";
    result.confidence = "high";
    result.rationale = "AM framing should reference operational data such as incidents, MTTR, SLA, queue volume, or cost per ticket.";
    result.suggestedRewrite ??= buildConservativeFieldSuggestion(input);
  }

  return result;
}

export async function validateOutcomeFieldWithAi(input: {
  field: "outcome_statement" | "baseline_definition";
  deliveryType?: DeliveryType | null;
  title?: string | null;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
  baselineDefinition?: string | null;
  baselineSource?: string | null;
  timeframe?: string | null;
}) {
  const env = readRequiredLlmEnv();
  const response = await fetch(new URL("responses", env.endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiKey}`,
      "api-key": env.apiKey
    },
    body: JSON.stringify({
      model: env.model,
      input: buildPrompt(input)
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`AI validation failed with HTTP ${response.status}.`);
  }

  const responseBody = await response.json();
  const outputText = extractOutputText(responseBody);
  const jsonText = extractJsonObject(outputText);
  const parsed = JSON.parse(jsonText) as OutcomeFieldAiValidation;

  return applyDeterministicFieldValidationAdjustments(input, parseOutcomeFieldAiValidation(parsed));
}

export async function reviewOutcomeFramingWithAi(input: {
  outcome: {
    key: string;
    title: string;
    problemStatement?: string | null;
    outcomeStatement?: string | null;
    baselineDefinition?: string | null;
    baselineSource?: string | null;
    solutionContext?: string | null;
    solutionConstraints?: string | null;
    dataSensitivity?: string | null;
    deliveryType?: DeliveryType | null;
    valueOwner?: string | null;
    aiUsageRole?: "support" | "generation" | "validation" | "decision_support" | "automation" | null;
    aiExecutionPattern?: "assisted" | "step_by_step" | "orchestrated" | null;
    aiUsageIntent?: string | null;
    businessImpactLevel?: "low" | "medium" | "high" | null;
    businessImpactRationale?: string | null;
    dataSensitivityLevel?: "low" | "medium" | "high" | null;
    dataSensitivityRationale?: string | null;
    blastRadiusLevel?: "low" | "medium" | "high" | null;
    blastRadiusRationale?: string | null;
    decisionImpactLevel?: "low" | "medium" | "high" | null;
    decisionImpactRationale?: string | null;
    aiLevelJustification?: string | null;
    riskAcceptedAt?: Date | null;
    riskAcceptedBy?: string | null;
    timeframe?: string | null;
    aiAccelerationLevel: "level_1" | "level_2" | "level_3";
    riskProfile: "low" | "medium" | "high";
  };
  epics: Array<{
    key: string;
    title: string;
    purpose?: string | null;
    scopeBoundary?: string | null;
    seedCount: number;
  }>;
  directionSeeds: Array<{
    storyIdeaId: string;
    seedId: string;
    title: string;
    epicKey?: string | null;
    shortDescription?: string | null;
    expectedBehavior?: string | null;
  }>;
  journeyContexts?: JourneyContext[];
  downstreamAiInstructions?: DownstreamAiInstructions | null;
}) {
  const env = readRequiredLlmEnv();
  const response = await fetch(new URL("responses", env.endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiKey}`,
      "api-key": env.apiKey
    },
    body: JSON.stringify({
      model: env.model,
      temperature: 0,
      input: buildFramingReviewPrompt(input)
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`AI framing review failed with HTTP ${response.status}.`);
  }

  const responseBody = await response.json();
  const outputText = extractOutputText(responseBody);
  const jsonText = extractJsonObject(outputText);
  const parsed = JSON.parse(jsonText) as OutcomeFramingAiReview;

  return deriveDeterministicFramingAdjustments(input, parseOutcomeFramingAiReview(parsed));
}

export async function validateStoryExpectedBehaviorWithAi(input: {
  title?: string | null;
  valueIntent?: string | null;
  expectedBehavior?: string | null;
  epicTitle?: string | null;
  epicPurpose?: string | null;
  epicScopeBoundary?: string | null;
}) {
  const env = readRequiredLlmEnv();
  const response = await fetch(new URL("responses", env.endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiKey}`,
      "api-key": env.apiKey
    },
    body: JSON.stringify({
      model: env.model,
      input: buildStoryExpectedBehaviorPrompt(input)
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`AI validation failed with HTTP ${response.status}.`);
  }

  const responseBody = await response.json();
  const outputText = extractOutputText(responseBody);
  const jsonText = extractJsonObject(outputText);
  const parsed = JSON.parse(jsonText) as StoryExpectedBehaviorAiValidation;

  return parseStoryExpectedBehaviorAiValidation(parsed);
}
