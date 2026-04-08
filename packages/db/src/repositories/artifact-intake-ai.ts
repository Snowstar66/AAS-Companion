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

You are not writing a human-facing report or markdown handoff.
You are producing strict JSON classification output for a downstream importer.

Primary objective:
- Map only source-grounded signal into governed Value Spine candidates.
- Keep ambiguous, noisy, duplicative, weakly structured, or supporting material out of core candidates by using leftoverSectionIds.
- Be conservative. It is better to omit a doubtful field or leave a section in leftovers than to over-structure weak source material.

Non-goals:
- Do not rewrite the source to make it "better".
- Do not invent missing delivery detail.
- Do not create elegant summaries that change meaning.
- Do not force every section into a candidate.

Import intent:
- ${input.importIntent === "framing" ? "framing" : "design"}
- If intent is framing:
  - prefer outcome and epic structure first
  - story candidates are allowed only when the source can be restated as framing-level Story Ideas
  - framing story candidates should focus on title, value intent, and expected behavior
  - avoid preserving delivery-only detail such as full acceptance criteria, full test plans, UI flows, implementation steps, or build checklists unless a tiny amount of that detail is needed as weak source context
  - leave NFR, UX, architecture, solution constraints, and other cross-cutting material outside candidates whenever they do not clearly belong inside an outcome/epic/story record
  - when a section is too detailed for framing and cannot be cleanly generalized, put it in leftoverSectionIds
- If intent is design:
  - story candidates may stay concrete enough for design and delivery review
  - preserve acceptance criteria, verification detail, and story typing when the source clearly contains them
  - still classify weak, noisy, or cross-cutting material as leftovers instead of forcing it into a story

Value Spine object meanings:
- Outcome = desired user or business effect; not implementation work, not a task list, not a UI solution.
- Epic = bounded capability, value area, or delivery slice under an Outcome.
- Story = implementable work item. In framing mode it may be a Story Idea; in design mode it may stay delivery-oriented and testable.

Field semantics for draftRecord:
- outcome.title = concise name of the desired result.
- outcome.problemStatement = why the work is needed now; current pain, obstacle, or gap.
- outcome.outcomeStatement = the desired effect or result to achieve.
- outcome.baselineDefinition = current state, missing capability, or current baseline.
- outcome.baselineSource = how the baseline is known, measured, or validated.
- outcome.timeframe = explicit timing horizon such as MVP, phase, release window, or review horizon.
- epic.purpose = why this epic exists and what value area it covers.
- epic.scopeBoundary = what is in scope or out of scope for the epic; boundaries only, not risks or implementation notes.
- epic.riskNote = a real delivery, domain, compliance, or technical risk; not generic uncertainty.
- story.storyType = outcome_delivery | governance | enablement only when the source supports that distinction.
- story.valueIntent = user or business value the story should create.
- story.expectedBehavior = what behavior or result the story should enable.
- story.acceptanceCriteria = testable conditions only when clearly present in the source.
- story.aiUsageScope = only include if the source clearly indicates AI or automation scope.
- story.testDefinition = short verification approach when clearly grounded in the source.
- story.definitionOfDone = completion conditions only when clearly present in the source.

Classification heuristics:
- problem statements, goals, business outcomes, success intent, baseline context -> usually outcome_candidate or problem_goal
- bounded capability areas, larger workflow slices, named themes under an outcome -> usually epic_candidate
- concrete user needs, story-shaped work items, implementable slices -> usually story_candidate
- explicit acceptance criteria lists -> acceptance_criteria
- explicit verification or test notes -> test_notes
- architecture intent, cross-cutting technical decisions, design principles -> architecture_notes
- unresolved notes, duplicates, meeting chatter, examples, appendices, speculative material, or text that does not clearly fit -> unmapped and likely leftoverSectionIds

Noise and leftovers handling:
- Treat duplicates, meeting chatter, open questions, implementation detail at the wrong level, vague aspiration text, and mixed notes conservatively.
- If a section contains useful context but not enough clean structure for a governed candidate, classify it appropriately and include its sectionId in leftoverSectionIds.
- File rationale should briefly mention if the file contains substantial noise, mixed granularity, or leftover-heavy content.

Relationship rules:
- Whenever a story candidate clearly belongs to a specific epic section, set linkedEpicSectionId to that epic sectionId.
- Whenever an epic candidate clearly belongs to a specific outcome section, set linkedOutcomeSectionId to that outcome sectionId.
- In design imports, also set linkedOutcomeSectionId for story candidates whenever the structure is visible.
- Do not guess links from thematic similarity alone. If uncertain, omit the link and set relationshipState to uncertain or missing.

Confidence and mapping rules:
- Use high only when the section meaning is explicit and structurally clear.
- Use medium when the meaning is plausible but still somewhat interpretive.
- Use low when the material is weak, mixed, or ambiguous.
- Prefer mappingState=uncertain over mapped when you had to infer structure from messy text.
- Prefer relationshipState=uncertain or missing over inventing lineage.

Allowed enums:
- sourceType: bmad_prd | epic_file | story_file | mixed_markdown_bundle | unknown_artifact
- confidence: high | medium | low
- section kind: problem_goal | outcome_candidate | epic_candidate | story_candidate | acceptance_criteria | test_notes | architecture_notes | unmapped
- candidate type: outcome | epic | story
- mappingState / relationshipState: mapped | uncertain | missing
- storyType in draftRecord: outcome_delivery | governance | enablement

Required output contract:
- Return JSON only, with shape { "files": [...] }.
- Every input file must appear exactly once in the output.
- Use the input fileName unchanged.
- Every candidate must point to one existing sectionId from that file.
- linkedEpicSectionId and linkedOutcomeSectionId must point to existing sectionIds from that same file when used.
- leftoverSectionIds must only contain existing sectionIds from that file.
- sectionDecisions may revise the current section kind and confidence, but only when justified by the source.
- draftRecord should include only fields justified by the source. Leave weak or missing fields out.
- For weak or uncertain material, prefer omitted draft fields, uncertain mapping, and leftoverSectionIds over hallucinated structure.

Final self-check before responding:
- Did you keep uncertain material out of governed candidates where appropriate?
- Did you avoid turning NFR/architecture/supporting notes into fake stories?
- Did you avoid placing implementation detail into outcomes or epic purpose?
- Did you keep the output strictly within the JSON schema?

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
