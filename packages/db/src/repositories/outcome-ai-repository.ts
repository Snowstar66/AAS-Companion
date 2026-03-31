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
  framingReadiness: {
    score: number;
    interpretation: "ready_for_tollgate" | "needs_refinement" | "not_ready";
  };
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
    deliveryType?: "AD" | "AT" | "AM" | null;
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
    seedId: string;
    title: string;
    epicKey?: string | null;
    shortDescription?: string | null;
    expectedBehavior?: string | null;
  }>;
};

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

  return {
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
    framingReadiness: {
      score: Math.round(parsedFramingReadiness.score),
      interpretation: parsedFramingReadiness.interpretation
    }
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
  const epicKeys = new Set(input.epics.map((epic) => epic.key));
  const epicCoverageFindings: string[] = [];
  const storyCoverageFindings: string[] = [];
  const riskFindings: string[] = [];

  if (!input.outcome.outcomeStatement?.trim()) {
    report.outcomeQuality.status = "needs_improvement";
    report.outcomeQuality.comment = "Outcome statement is missing, so the intended business effect is still unclear.";
    report.outcomeQuality.suggestedImprovement = "Add one measurable outcome statement before Tollgate 1.";
    riskFindings.push(`[${input.outcome.key}] Outcome statement is missing, which increases the risk of solving the wrong problem.`);
  }

  if (!input.outcome.baselineDefinition?.trim()) {
    report.outcomeQuality.status = "needs_improvement";
    report.outcomeQuality.comment = "Baseline is not defined clearly enough to judge progress from the current state.";
    report.outcomeQuality.suggestedImprovement = "Add a concrete baseline definition that describes the current state.";
    riskFindings.push(`[${input.outcome.key}] Baseline definition is missing, which weakens measurement and decision confidence.`);
  }

  if (input.epics.length === 0) {
    report.epicCoverage.status = "partial";
    epicCoverageFindings.push(`[${input.outcome.key}] No Epics are defined yet.`);
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
  }

  for (const seed of input.directionSeeds) {
    if (!seed.epicKey || !epicKeys.has(seed.epicKey)) {
      report.storyCoverage.status = "partial";
      storyCoverageFindings.push(`[${seed.seedId}] Story Idea is missing a valid Epic link.`);
      riskFindings.push(`[${seed.seedId}] Story Idea lacks a reliable Epic link, which increases misalignment risk.`);
    }

    if (!seed.shortDescription?.trim()) {
      report.storyCoverage.status = "partial";
      storyCoverageFindings.push(`[${seed.seedId}] Value Intent is missing or too thin.`);
    }

    if (!seed.expectedBehavior?.trim()) {
      report.storyCoverage.status = "partial";
      storyCoverageFindings.push(`[${seed.seedId}] Expected Behavior is missing.`);
      riskFindings.push(`[${seed.seedId}] Missing Expected Behavior increases the risk of scope expansion during design.`);
    }
  }

  report.epicCoverage.missingAreas = prependUnique(epicCoverageFindings, report.epicCoverage.missingAreas);
  report.storyCoverage.gapsOrOverlaps = prependUnique(storyCoverageFindings, report.storyCoverage.gapsOrOverlaps);
  report.riskOverview.topRisks = prependUnique(riskFindings, report.riskOverview.topRisks).slice(0, 5);

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

  readinessScore = Math.max(0, Math.min(100, readinessScore));

  report.framingReadiness = {
    score: readinessScore,
    interpretation:
      readinessScore >= 80 ? "ready_for_tollgate" : readinessScore >= 60 ? "needs_refinement" : "not_ready"
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
  title?: string | null;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
  baselineDefinition?: string | null;
  baselineSource?: string | null;
  timeframe?: string | null;
}) {
  const fieldText = input.field === "outcome_statement" ? input.outcomeStatement : input.baselineDefinition;
  const payload = {
    field: input.field,
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

Field guidance:
- outcome_statement: should describe a desired effect or result, not implementation work, deliverables, or a project task.
- baseline_definition: should describe the current starting state, present condition, or measurable baseline before change. It should not read like the desired future outcome or a delivery plan.

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

Payload:
${JSON.stringify(payload, null, 2)}
  `.trim();
}

function buildFramingReviewPrompt(input: {
  outcome: OutcomeFramingAiReviewInput["outcome"];
  epics: OutcomeFramingAiReviewInput["epics"];
  directionSeeds: OutcomeFramingAiReviewInput["directionSeeds"];
}) {
  return `
You are validating a full AAS Framing Brief.

Your goal is NOT to rewrite the content, but to evaluate its quality and readiness for Tollgate 1.

Use a critical but constructive approach.

You will receive:
- Problem Statement
- Outcome (including baseline and owner context)
- Solution Context & Constraints
- Epics
- Story Ideas (with Value Intent and Expected Behavior)
- Selected AI Acceleration Level

Evaluate the framing across five dimensions:
1. Outcome Quality
2. Problem -> Outcome Alignment
3. Epic Coverage
4. Story Idea Coverage
5. Risk & Complexity
6. AI Level Appropriateness

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

5. Risk & Complexity
- Identify product, technical, data/privacy and AI-related risks.
- Also identify likely expansion and misalignment risk.
- Return top 3-5 risks, plus Expansion Risk and Misalignment Risk as Low/Medium/High.

6. AI Level Validation
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

export async function validateOutcomeFieldWithAi(input: {
  field: "outcome_statement" | "baseline_definition";
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

  return parseOutcomeFieldAiValidation(parsed);
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
    deliveryType?: "AD" | "AT" | "AM" | null;
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
    seedId: string;
    title: string;
    epicKey?: string | null;
    shortDescription?: string | null;
    expectedBehavior?: string | null;
  }>;
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
