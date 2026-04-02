import {
  artifactAiSessionInterpretationSchema,
  type ArtifactAiSessionInterpretation,
  type ArtifactParseResult
} from "@aas-companion/domain";

type AiArtifactFileInput = {
  fileId: string;
  fileName: string;
  parsedArtifacts: ArtifactParseResult;
};

type ArtifactImportIntent = "framing" | "design";

function readRequiredLlmEnv() {
  const endpoint = process.env.LLM_ENDPOINT?.trim() ?? "";
  const apiKey = process.env.LLM_ENDPOINT_KEY?.trim() ?? "";
  const model = process.env.LLM_MODEL?.trim() ?? "";

  if (!endpoint || !apiKey || !model) {
    throw new Error("AI-assisted import is not configured. Set LLM_ENDPOINT, LLM_ENDPOINT_KEY, and LLM_MODEL.");
  }

  return {
    endpoint: endpoint.endsWith("/") ? endpoint : `${endpoint}/`,
    apiKey,
    model
  };
}

function buildPrompt(input: { importIntent: ArtifactImportIntent; files: AiArtifactFileInput[] }) {
  const payload = {
    files: input.files.map((file) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      sourceTypeHint: file.parsedArtifacts.classification.sourceType,
      sourceConfidenceHint: file.parsedArtifacts.classification.confidence,
      sections: file.parsedArtifacts.sections.map((section) => ({
        sectionId: section.id,
        currentKind: section.kind,
        currentConfidence: section.confidence,
        title: section.title,
        marker: section.sourceReference.sectionMarker,
        lineStart: section.sourceReference.lineStart,
        lineEnd: section.sourceReference.lineEnd,
        text: section.text
      }))
    }))
  };

  return `
You are assisting a governed Value Spine import.

Goal:
- Classify each file conservatively.
- Reinterpret messy sections into Value Spine candidates when the source really supports it.
- Put doubtful, weakly structured, or supporting material into leftoverSectionIds so a human can review it manually.
- Do not invent delivery detail that is not grounded in the source.
- Do not suggest improvements unless the source clearly needs strengthening.
- If a field already seems adequate, keep it as-is rather than "improving" it.

Import intent:
- ${input.importIntent === "framing" ? "framing" : "design"}
- If intent is framing:
  - keep candidates outcome- and epic-oriented
  - treat detailed user stories conservatively
  - story candidates should describe framing-level intent, not design workflow
  - when a section is too detailed for framing, prefer leftoverSectionIds over forcing a candidate
- If intent is design:
  - story candidates may stay concrete enough for delivery/design use
  - preserve acceptance criteria and verification-oriented detail when the source clearly contains it

Value Spine guidance:
- Outcome = desired effect or business/user result, not implementation work.
- Epic = bounded capability or delivery slice under an Outcome.
- Story = implementable work item with testable acceptance criteria.

Allowed enums:
- sourceType: bmad_prd | epic_file | story_file | mixed_markdown_bundle | unknown_artifact
- confidence: high | medium | low
- section kind: problem_goal | outcome_candidate | epic_candidate | story_candidate | acceptance_criteria | test_notes | architecture_notes | unmapped
- candidate type: outcome | epic | story
- mappingState / relationshipState: mapped | uncertain | missing
- storyType in draftRecord: outcome_delivery | governance | enablement

Required output:
- Return JSON only, with shape { "files": [...] }.
- Every input file must appear exactly once in the output.
- Use the input fileName unchanged.
- Every candidate must point to one existing sectionId from that file.
- leftoverSectionIds must only contain existing sectionIds from that file.
- draftRecord should only include fields you can justify from the source. Leave other fields out.
- For weak or uncertain material, prefer null/omitted draft fields and leftoverSectionIds over hallucinating structure.

Payload:
${JSON.stringify(payload, null, 2)}
  `.trim();
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
    throw new Error("AI-assisted import returned an empty response.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace < firstBrace) {
    throw new Error("AI-assisted import did not return valid JSON.");
  }

  return candidate.slice(firstBrace, lastBrace + 1);
}

export async function interpretArtifactFilesWithAi(input: { importIntent: ArtifactImportIntent; files: AiArtifactFileInput[] }) {
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
    throw new Error(`AI-assisted import failed with HTTP ${response.status}.`);
  }

  const responseBody = await response.json();
  const outputText = extractOutputText(responseBody);
  const jsonText = extractJsonObject(outputText);
  const parsed = JSON.parse(jsonText) as ArtifactAiSessionInterpretation;

  return artifactAiSessionInterpretationSchema.parse(parsed);
}
