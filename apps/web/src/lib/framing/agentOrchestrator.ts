import type { getOutcomeWorkspaceService } from "@aas-companion/api";
import {
  mapAiAccelerationLevelToDownstreamAiLevel,
  parseDownstreamAiInstructions,
  parseFramingConstraintBundle,
  parseJourneyContexts
} from "@aas-companion/domain";
import { explainInstructionSetting, reviewDownstreamInstructions } from "@/lib/framing/instructionAssistantAgent";
import { collectFramingAgentWarnings, generateDesignHandover } from "@/lib/framing/designHandoverAgent";
import { executeFramingAgentToolCall, framingAgentToolDescriptions } from "@/lib/framing/agentTools";
import type { FramingAgentRunResult } from "@/lib/framing/agentStructuredOutputs";
import { generateBmadExport } from "@/lib/framing/bmadAdapter";
import { runJourneyCoverageAgent } from "@/lib/framing/journeyCoverageAgent";
import { runStorySuggestionAgent } from "@/lib/framing/storySuggestionAgent";
import {
  buildFramingAgentSuggestionId,
  type FramingAgentMode,
  type FramingAgentScope,
  type FramingAgentSourceOfTruth,
  type FramingAgentSuggestion,
  type FramingAgentTool,
  type FramingAgentToolCall
} from "@/lib/framing/agentTypes";

type OutcomeWorkspaceData = Extract<Awaited<ReturnType<typeof getOutcomeWorkspaceService>>, { ok: true }>["data"];

type RunFramingAgentInput = {
  data: OutcomeWorkspaceData;
  mode: FramingAgentMode;
  scope: FramingAgentScope;
  prompt: string;
  quickActionId?: string | null;
  journeyContextsOverride?: ReturnType<typeof parseJourneyContexts> | null;
  downstreamAiInstructionsOverride?: ReturnType<typeof parseDownstreamAiInstructions> | null;
};

type LivePlannerResponse = {
  summary: string;
  toolCalls: FramingAgentToolCall[];
};

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function dedupeById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item] as const)).values()];
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeDeliveryType(value: unknown): "AD" | "AT" | "AM" | null {
  return value === "AD" || value === "AT" || value === "AM" ? value : null;
}

function normalizeRiskLevel(value: unknown): "low" | "medium" | "high" | null {
  return value === "low" || value === "medium" || value === "high" ? value : null;
}

function buildSourceOfTruth(input: {
  data: OutcomeWorkspaceData;
  journeyContextsOverride: ReturnType<typeof parseJourneyContexts> | null | undefined;
  downstreamAiInstructionsOverride: ReturnType<typeof parseDownstreamAiInstructions> | null | undefined;
}): FramingAgentSourceOfTruth {
  const outcome = input.data.outcome;
  const structuredConstraints = parseFramingConstraintBundle(outcome.solutionConstraints ?? null);
  const journeyContexts = input.journeyContextsOverride ?? parseJourneyContexts(outcome.journeyContexts ?? []);
  const deliveryType = normalizeDeliveryType(outcome.deliveryType);

  return {
    outcome: {
      id: outcome.id,
      key: outcome.key,
      title: outcome.title,
      deliveryType,
      aiLevel: mapAiAccelerationLevelToDownstreamAiLevel(outcome.aiAccelerationLevel),
      aiAccelerationLevel: outcome.aiAccelerationLevel,
      problemStatement: outcome.problemStatement ?? null,
      outcomeStatement: outcome.outcomeStatement ?? null,
      baselineDefinition: outcome.baselineDefinition ?? null,
      baselineSource: outcome.baselineSource ?? null,
      solutionContext: outcome.solutionContext ?? null,
      constraints: outcome.solutionConstraints ?? null,
      structuredConstraints,
      dataSensitivity: outcome.dataSensitivity ?? null,
      dataSensitivityLevel: normalizeRiskLevel(outcome.dataSensitivityLevel),
      dataSensitivityRationale: outcome.dataSensitivityRationale ?? null,
      timeframe: outcome.timeframe ?? null,
      riskProfile: outcome.riskProfile
    },
    epics: outcome.epics.map((epic) => ({
      id: epic.id,
      key: epic.key,
      title: epic.title,
      purpose: epic.purpose ?? null,
      scopeBoundary: epic.scopeBoundary ?? null
    })),
    storyIdeas: outcome.directionSeeds.map((seed) => ({
      id: seed.id,
      key: seed.key,
      title: seed.title,
      epicId: seed.epicId ?? null,
      epicKey: outcome.epics.find((epic) => epic.id === seed.epicId)?.key ?? null,
      shortDescription: seed.shortDescription ?? null,
      expectedBehavior: seed.expectedBehavior ?? null,
      uxSketchName: seed.uxSketchName ?? null,
      uxSketchDataUrl: seed.uxSketchDataUrl ?? null
    })),
    journeyContexts,
    downstreamAiInstructions:
      input.downstreamAiInstructionsOverride ??
      parseDownstreamAiInstructions(outcome.downstreamAiInstructions, {
        initiativeType: deliveryType ?? "AD",
        aiLevel: mapAiAccelerationLevelToDownstreamAiLevel(outcome.aiAccelerationLevel)
      }) ??
      null
  };
}

function buildJourneyRefinementSuggestions(source: FramingAgentSourceOfTruth, contextId?: string | null) {
  const contexts = contextId ? source.journeyContexts.filter((context) => context.id === contextId) : source.journeyContexts;
  const suggestions: FramingAgentSuggestion[] = [];
  const questions: string[] = [];
  const warnings: string[] = [];
  const uiSpecificPattern = /\b(screen|page|button|tab|modal|dropdown|field|click|ui)\b/i;

  if (contexts.length === 0) {
    return {
      message: "Journey Context is empty right now. Start by capturing one Journey Context with at least one Journey and one Step.",
      suggestions,
      warnings: ["Journey Context exists only after at least one Journey Context item is captured."],
      helperText:
        "Journey Context is optional. Use it when you want to describe role-based, user, operational, or transformation flows that can help later AI refinement.",
      toolCalls: [{ tool: "getJourneyContext" as const }],
      toolTrace: [{ tool: "getJourneyContext" as const, summary: "No Journey Context was available for refinement." }]
    };
  }

  for (const context of contexts) {
    if (!hasText(context.title)) {
      const firstJourney = context.journeys[0];
      const nextContext = {
        ...context,
        title: firstJourney?.title ? `${firstJourney.title} context` : "Journey Context"
      };

      suggestions.push({
        id: buildFramingAgentSuggestionId(["refine-context-title", context.id]),
        kind: "rewrite_journey_context",
        title: "Add a clearer Journey Context title",
        description: "A Journey Context groups a meaningful flow area. A concrete title makes later AI refinement easier.",
        contextId: context.id,
        nextContext,
        confidence: 0.62
      });
    }

    for (const journey of context.journeys) {
      if (!hasText(journey.goal)) {
        questions.push(`What is the primary goal in "${journey.title || journey.id}"?`);
      }

      if (!hasText(journey.trigger)) {
        questions.push(`What triggers "${journey.title || journey.id}"?`);
      }

      if (!hasText(journey.currentState)) {
        questions.push(`How does "${journey.title || journey.id}" work today, especially where it is fragmented or slow?`);
      }

      if (!hasText(journey.desiredFutureState)) {
        questions.push(`How should "${journey.title || journey.id}" feel or work in the desired future state?`);
      }

      for (const step of journey.steps) {
        const description = step.description ?? "";
        const looksThin = description.trim().split(/\s+/).filter(Boolean).length < 5;
        const looksUiSpecific = uiSpecificPattern.test(description);

        if (!looksThin && !looksUiSpecific) {
          continue;
        }

        const nextDescription = [
          step.actor || journey.primaryActor
            ? `${step.actor || journey.primaryActor} ${step.title ? step.title.toLowerCase() : "performs this step"}`
            : step.title || "The actor completes this step",
          journey.goal ? `to move toward ${journey.goal.toLowerCase()}.` : "within the journey flow.",
          step.currentPain ? `Current pain: ${step.currentPain}.` : "",
          step.desiredSupport ? `Desired support: ${step.desiredSupport}.` : ""
        ]
          .filter(Boolean)
          .join(" ");

        suggestions.push({
          id: buildFramingAgentSuggestionId(["rewrite-step", context.id, journey.id, step.id]),
          kind: "rewrite_journey_step",
          title: `Refine step wording for ${step.title || step.id}`,
          description:
            looksUiSpecific
              ? "This Step reads UI-specific. Reframe it in actor, flow, decision, and support language."
              : "This Step is still too thin. Add clearer business or operational language.",
          contextId: context.id,
          journeyId: journey.id,
          stepId: step.id,
          nextStep: {
            ...step,
            description: nextDescription
          },
          confidence: looksUiSpecific ? 0.74 : 0.63
        });
      }
    }
  }

  if (suggestions.length === 0) {
    warnings.push("The current Journey Context already looks reasonably structured. Use Analyze mode if you want coverage guidance instead of wording help.");
  }

  return {
    message:
      suggestions.length > 0
        ? `I found ${suggestions.length} refinement suggestion(s) to make the Journey language more actor-, flow-, and support-oriented.${questions.length > 0 ? ` Follow-up questions: ${questions.slice(0, 3).join(" ")}` : ""}`
        : "The current Journey Context reads fairly well. The next best step is usually coverage analysis or explicit link cleanup.",
    suggestions,
    warnings,
    helperText:
      "Journey Context is optional. Use it when you want to describe role-based, user, operational, or transformation flows that can help later AI refinement.",
    toolCalls: [{ tool: "getJourneyContext" as const }],
    toolTrace: [{ tool: "getJourneyContext" as const, summary: `Reviewed ${contexts.length} Journey Context item(s) for wording quality.` }]
  };
}

function resolveRole(input: {
  mode: FramingAgentMode;
  scopeKind: FramingAgentScope["kind"];
  quickActionId?: string | null;
}) {
  if (input.mode === "export") {
    return input.quickActionId === "export-bmad" ? "BMAD Adapter" : "Design Handover Agent";
  }

  if (input.scopeKind === "downstream-ai-instructions") {
    return "Downstream AI Instructions Assistant";
  }

  if (input.scopeKind === "journey-context") {
    return input.mode === "analyze" ? "Coverage Analysis Agent" : "Journey Context Agent";
  }

  if (input.scopeKind === "story-ideas") {
    return input.mode === "analyze" ? "Story Suggestion Agent" : "Framing Interview Agent";
  }

  return "Framing Interview Agent";
}

function buildFallbackToolCalls(input: {
  mode: FramingAgentMode;
  scopeKind: FramingAgentScope["kind"];
  quickActionId?: string | null;
  scopeEntityId?: string | null;
}): FramingAgentToolCall[] {
  if (input.scopeKind === "journey-context") {
    if (input.mode === "analyze" || input.quickActionId === "journey-coverage" || input.quickActionId === "journey-missing-story-ideas") {
      return [
        {
          tool: "analyzeJourneyCoverage",
          arguments: {
            journeyContextId: input.scopeEntityId ?? null
          }
        },
        {
          tool: "suggestStoryIdeas"
        }
      ];
    }

    return [
      {
        tool: "getJourneyContext",
        arguments: {
          contextId: input.scopeEntityId ?? null
        }
      }
    ];
  }

  if (input.scopeKind === "story-ideas") {
    return [{ tool: "suggestStoryIdeas" }];
  }

  if (input.scopeKind === "downstream-ai-instructions") {
    return [{ tool: "getDownstreamAiInstructions" }];
  }

  if (input.scopeKind === "export") {
    return input.quickActionId === "export-bmad"
      ? [{ tool: "generateBmadExport" }]
      : [{ tool: "generateDesignHandover" }];
  }

  return [{ tool: "getFramingSourceOfTruth" }];
}

function readLlmEnv() {
  const endpoint = process.env.LLM_ENDPOINT?.trim() ?? "";
  const apiKey = process.env.LLM_ENDPOINT_KEY?.trim() ?? "";
  const model = process.env.LLM_MODEL?.trim() ?? "";

  if (!endpoint || !apiKey || !model) {
    return null;
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
    throw new Error("AI planner returned an empty response.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace < 0 || lastBrace < firstBrace) {
    throw new Error("AI planner did not return valid JSON.");
  }

  return candidate.slice(firstBrace, lastBrace + 1);
}

function isFramingAgentTool(value: unknown): value is FramingAgentTool {
  return typeof value === "string" && value in framingAgentToolDescriptions;
}

function parsePlannerResponse(input: unknown): LivePlannerResponse {
  if (!input || typeof input !== "object") {
    throw new Error("AI planner response was not an object.");
  }

  const candidate = input as {
    summary?: unknown;
    toolCalls?: unknown;
  };
  const toolCalls = Array.isArray(candidate.toolCalls) ? candidate.toolCalls : [];

  const parsedToolCalls = toolCalls.reduce<FramingAgentToolCall[]>((accumulator, toolCall) => {
      if (!toolCall || typeof toolCall !== "object") {
        return accumulator;
      }

      const record = toolCall as {
        tool?: unknown;
        arguments?: unknown;
      };

      if (!isFramingAgentTool(record.tool)) {
        return accumulator;
      }

      accumulator.push({
        tool: record.tool,
        arguments: record.arguments && typeof record.arguments === "object" ? (record.arguments as Record<string, unknown>) : {}
      });

      return accumulator;
    }, []);

  return {
    summary: typeof candidate.summary === "string" ? candidate.summary.trim() : "",
    toolCalls: parsedToolCalls
  };
}

async function selectToolCallsWithLiveAi(input: {
  source: FramingAgentSourceOfTruth;
  mode: FramingAgentMode;
  scope: FramingAgentScope;
  prompt: string;
  quickActionId?: string | null;
}): Promise<LivePlannerResponse | null> {
  const env = readLlmEnv();

  if (!env) {
    return null;
  }

  const sourceSummary = {
    outcome: {
      key: input.source.outcome.key,
      title: input.source.outcome.title,
      initiativeType: input.source.outcome.deliveryType,
      aiLevel: input.source.outcome.aiLevel
    },
    counts: {
      epics: input.source.epics.length,
      storyIdeas: input.source.storyIdeas.length,
      journeyContexts: input.source.journeyContexts.length,
      customInstructions: input.source.downstreamAiInstructions?.customInstructions.length ?? 0
    },
    journeyContextTitles: input.source.journeyContexts.map((context) => context.title || context.id),
    storyIdeaTitles: input.source.storyIdeas.slice(0, 12).map((storyIdea) => `${storyIdea.key} ${storyIdea.title}`),
    warnings: collectFramingAgentWarnings(input.source)
  };
  const toolCatalog = Object.entries(framingAgentToolDescriptions).map(([tool, description]) => ({
    tool,
    description
  }));
  const prompt = `
You are selecting structured application tool calls for a Framing AI assistant.

Rules:
- The human-owned Framing package is the source of truth.
- Never silently overwrite source data.
- If the user wants structured changes or export artifacts, prefer tool calls over prose.
- Use only the tools listed below.
- Keep tool calls focused and minimal.
- Return JSON only.

Mode: ${input.mode}
Scope: ${input.scope.kind} (${input.scope.label})
Quick action: ${input.quickActionId ?? "none"}
User prompt: ${input.prompt}

Available tools:
${toolCatalog.map((entry) => `- ${entry.tool}: ${entry.description}`).join("\n")}

Source summary:
${JSON.stringify(sourceSummary, null, 2)}

Return JSON in this shape:
{
  "summary": "short reasoned summary",
  "toolCalls": [
    {
      "tool": "one of the tool names above",
      "arguments": { "optional": "json arguments" }
    }
  ]
}
  `.trim();
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
      input: prompt
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const responseBody = await response.json();
  const outputText = extractOutputText(responseBody);
  const jsonText = extractJsonObject(outputText);
  return parsePlannerResponse(JSON.parse(jsonText));
}

export async function runFramingAgentOrchestrator(input: RunFramingAgentInput): Promise<FramingAgentRunResult> {
  const source = buildSourceOfTruth({
    data: input.data,
    journeyContextsOverride: input.journeyContextsOverride,
    downstreamAiInstructionsOverride: input.downstreamAiInstructionsOverride
  });
  const livePlanner = await selectToolCallsWithLiveAi({
    source,
    mode: input.mode,
    scope: input.scope,
    prompt: input.prompt,
    quickActionId: input.quickActionId ?? null
  }).catch(() => null);
  const plannedToolCalls =
    livePlanner?.toolCalls.length
      ? livePlanner.toolCalls
      : buildFallbackToolCalls({
          mode: input.mode,
          scopeKind: input.scope.kind,
          quickActionId: input.quickActionId ?? null,
          scopeEntityId: input.scope.entityId ?? null
        });

  let suggestions: FramingAgentSuggestion[] = [];
  const artifacts: FramingAgentRunResult["artifacts"] = [];
  const warnings: string[] = [];
  const toolTrace: FramingAgentRunResult["toolTrace"] = [];

  for (const toolCall of plannedToolCalls) {
    const executed = executeFramingAgentToolCall({
      source,
      toolCall
    });

    suggestions = suggestions.concat(executed.suggestions);
    artifacts.push(...executed.artifacts);
    warnings.push(...executed.warnings);
    toolTrace.push(...executed.toolTrace);
  }

  let message = livePlanner?.summary?.trim() || "";
  let helperText: string | null = null;

  if (input.scope.kind === "journey-context" && (input.mode === "ask" || input.mode === "refine")) {
    const journeyAssistant = buildJourneyRefinementSuggestions(source, input.scope.entityId ?? null);
    suggestions = suggestions.concat(journeyAssistant.suggestions);
    warnings.push(...journeyAssistant.warnings);
    toolTrace.push(...journeyAssistant.toolTrace);
    helperText = journeyAssistant.helperText;
    message = message ? `${message}\n\n${journeyAssistant.message}` : journeyAssistant.message;
  }

  if (input.scope.kind === "journey-context" && input.mode === "analyze") {
    const coverage = runJourneyCoverageAgent({
      source,
      journeyContextId: input.scope.entityId ?? null
    });

    suggestions = suggestions.concat(coverage.suggestions);
    warnings.push(...coverage.warnings);
    toolTrace.push(...coverage.toolTrace);
    helperText =
      "Coverage suggestions are AI-generated recommendations based on Journeys, Steps, Epics, Story Ideas, and inherited constraints. Review before accepting.";
    if (!message) {
      message =
        coverage.coverageResults.length > 0
          ? `I analyzed ${coverage.coverageResults.length} Journey coverage result(s) against the current Epics and Story Ideas.`
          : "No Journey coverage analysis could be produced yet.";
    }
  }

  if (input.scope.kind === "story-ideas") {
    const storyAgent = runStorySuggestionAgent(source);
    suggestions = suggestions.concat(storyAgent.suggestions);
    warnings.push(...storyAgent.warnings);
    toolTrace.push(...storyAgent.toolTrace);

    if (!message) {
      message = `I reviewed the Story Ideas against Journey Context and the current Story Idea structure. Found ${storyAgent.result.suggestions.length} Story Idea candidate(s), ${storyAgent.result.splitCandidates?.length ?? 0} split candidate(s), and ${storyAgent.result.mergeCandidates?.length ?? 0} merge candidate(s).`;
    }

    if (storyAgent.result.rewriteSuggestions?.length) {
      warnings.push(
        ...storyAgent.result.rewriteSuggestions.map(
          (rewrite) => `Story Idea ${rewrite.storyIdeaId} needs clearer expected behavior wording.`
        )
      );
    }
  }

  if (input.scope.kind === "downstream-ai-instructions") {
    if (input.mode === "ask") {
      const explanation = explainInstructionSetting({
        source,
        prompt: input.prompt
      });
      warnings.push(...explanation.warnings);
      toolTrace.push(...explanation.toolTrace);
      message = message ? `${message}\n\n${explanation.message}` : explanation.message;
    } else {
      const review = reviewDownstreamInstructions(source);
      warnings.push(...review.result.warnings);
      suggestions = suggestions.concat(review.suggestions);
      toolTrace.push(...review.toolTrace);
      message =
        message ||
        `I reviewed the current Downstream AI Instructions and found ${review.result.warnings.length} warning(s) plus ${review.result.suggestedPreferenceChanges?.length ?? 0} preference change suggestion(s).`;
    }

    helperText =
      "N/A means leave this dimension open for downstream AI. N/A does not disable mandatory controls.";
  }

  if (input.scope.kind === "export") {
    if (!artifacts.some((artifact) => artifact.kind === "design_handover") && input.quickActionId !== "export-bmad") {
      const handover = generateDesignHandover(source);
      artifacts.push({
        kind: "design_handover",
        title: "Design Handover",
        summary: handover.summary,
        markdown: handover.markdown,
        json: handover.json
      });
    }

    if (input.quickActionId === "export-bmad" || /bmad/i.test(input.prompt)) {
      const bmad = generateBmadExport(source);
      artifacts.push({
        kind: "bmad_export",
        title: "BMAD-friendly export",
        summary: bmad.summary,
        markdown: bmad.markdown,
        json: bmad.json
      });
    }

    warnings.push(...collectFramingAgentWarnings(source));
    helperText =
      "The export inherits the current Framing package, including Journey Context and Downstream AI Instructions when present.";
    message =
      message ||
      `I prepared ${artifacts.length} export artifact(s) from the current Framing package and checked the inheritance chain for missing source inputs.`;
  }

  if (!message) {
    message = "I reviewed the current Framing package and prepared structured suggestions where they looked useful.";
  }

  return {
    ok: true,
    mode: input.mode,
    role: resolveRole({
      mode: input.mode,
      scopeKind: input.scope.kind,
      quickActionId: input.quickActionId ?? null
    }),
    scopeLabel: input.scope.label,
    usedLiveAi: Boolean(livePlanner),
    message,
    warnings: dedupeStrings(warnings),
    helperText,
    suggestions: dedupeById(suggestions),
    artifacts,
    toolTrace,
    plannedToolCalls
  };
}
