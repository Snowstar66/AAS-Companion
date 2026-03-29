export type OutcomeFieldAiValidation = {
  field: "outcome_statement" | "baseline_definition";
  verdict: "good" | "needs_revision" | "unclear";
  confidence: "high" | "medium" | "low";
  rationale: string;
  suggestedRewrite: string | null;
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
