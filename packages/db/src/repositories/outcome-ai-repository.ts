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
  overallVerdict: "good" | "needs_attention" | "blocked";
  executiveSummary: string;
  missingItems: string[];
  suggestedChanges: string[];
  nextAiLevel: {
    canAdvance: boolean;
    targetLevel: "level_2" | "level_3" | null;
    rationale: string;
    requirements: string[];
  };
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
  const overallVerdict = candidate.overallVerdict;
  const executiveSummary = candidate.executiveSummary;
  const missingItems = candidate.missingItems;
  const suggestedChanges = candidate.suggestedChanges;
  const nextAiLevel = candidate.nextAiLevel;

  if (overallVerdict !== "good" && overallVerdict !== "needs_attention" && overallVerdict !== "blocked") {
    throw new Error("AI framing review returned an invalid verdict.");
  }

  if (typeof executiveSummary !== "string" || !executiveSummary.trim()) {
    throw new Error("AI framing review returned an invalid summary.");
  }

  if (!Array.isArray(missingItems) || !missingItems.every((item) => typeof item === "string")) {
    throw new Error("AI framing review returned invalid missing items.");
  }

  if (!Array.isArray(suggestedChanges) || !suggestedChanges.every((item) => typeof item === "string")) {
    throw new Error("AI framing review returned invalid suggested changes.");
  }

  if (!nextAiLevel || typeof nextAiLevel !== "object") {
    throw new Error("AI framing review returned an invalid next AI level section.");
  }

  const next = nextAiLevel as Record<string, unknown>;
  const targetLevel = next.targetLevel;
  const canAdvance = next.canAdvance;
  const rationale = next.rationale;
  const requirements = next.requirements;

  if (targetLevel !== null && targetLevel !== "level_2" && targetLevel !== "level_3") {
    throw new Error("AI framing review returned an invalid target AI level.");
  }

  if (typeof canAdvance !== "boolean") {
    throw new Error("AI framing review returned an invalid canAdvance flag.");
  }

  if (typeof rationale !== "string" || !rationale.trim()) {
    throw new Error("AI framing review returned an invalid next-level rationale.");
  }

  if (!Array.isArray(requirements) || !requirements.every((item) => typeof item === "string")) {
    throw new Error("AI framing review returned invalid next-level requirements.");
  }

  return {
    overallVerdict,
    executiveSummary: executiveSummary.trim(),
    missingItems: missingItems.map((item) => item.trim()).filter(Boolean),
    suggestedChanges: suggestedChanges.map((item) => item.trim()).filter(Boolean),
    nextAiLevel: {
      canAdvance,
      targetLevel,
      rationale: rationale.trim(),
      requirements: requirements.map((item) => item.trim()).filter(Boolean)
    }
  };
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
  outcome: {
    key: string;
    title: string;
    problemStatement?: string | null;
    outcomeStatement?: string | null;
    baselineDefinition?: string | null;
    baselineSource?: string | null;
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
  const nextAiLevel =
    input.outcome.aiAccelerationLevel === "level_1"
      ? "level_2"
      : input.outcome.aiAccelerationLevel === "level_2"
        ? "level_3"
        : null;

  return `
You review a whole governed Framing conservatively.

Rules:
- Only report material gaps, not stylistic preferences.
- If the framing is already good enough, say so plainly.
- Suggested changes should be limited to the few changes that would most improve clarity or readiness.
- "nextAiLevel" should explain what would be required to move one level higher than the current AI level.
- Treat direction seeds as lightweight directional hints, not delivery stories.

What to evaluate:
- whether the Outcome framing reads like a real framing, not just a delivery task
- whether the baseline is sufficiently grounded
- whether the current Epic direction and Direction Seeds are defined enough to support the current AI level
- what is still missing in general
- what would be additionally required for the next AI level

Current AI level: ${input.outcome.aiAccelerationLevel}
Next higher level to consider: ${nextAiLevel ?? "none"}

Required output JSON:
{
  "overallVerdict": "good" | "needs_attention" | "blocked",
  "executiveSummary": "short report summary",
  "missingItems": ["..."],
  "suggestedChanges": ["..."],
  "nextAiLevel": {
    "canAdvance": true | false,
    "targetLevel": "level_2" | "level_3" | null,
    "rationale": "short explanation",
    "requirements": ["..."]
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
  const fieldText = input.field === "outcome_statement" ? input.outcomeStatement : input.baselineDefinition;

  if (!fieldText?.trim()) {
    return parseOutcomeFieldAiValidation({
      field: input.field,
      verdict: "needs_revision",
      confidence: "high",
      rationale: "Field is empty, so there is nothing to validate yet.",
      suggestedRewrite: null
    });
  }

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

  return parseOutcomeFramingAiReview(parsed);
}

export async function validateStoryExpectedBehaviorWithAi(input: {
  title?: string | null;
  valueIntent?: string | null;
  expectedBehavior?: string | null;
  epicTitle?: string | null;
  epicPurpose?: string | null;
  epicScopeBoundary?: string | null;
}) {
  if (!input.expectedBehavior?.trim()) {
    return parseStoryExpectedBehaviorAiValidation({
      field: "story_expected_behavior",
      verdict: "needs_revision",
      confidence: "high",
      rationale: "Expected behavior is empty, so there is nothing to validate yet.",
      suggestedRewrite: null
    });
  }

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
