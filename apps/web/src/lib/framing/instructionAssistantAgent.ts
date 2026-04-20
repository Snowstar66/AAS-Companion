import { analyzeDownstreamAiInstructions } from "@/lib/framing/downstreamValidation";
import type { InstructionReviewResult } from "@/lib/framing/agentStructuredOutputs";
import {
  buildFramingAgentSuggestionId,
  type FramingAgentSourceOfTruth,
  type FramingAgentSuggestion,
  type FramingAgentToolTrace
} from "@/lib/framing/agentTypes";

function buildSuggestedCustomInstruction(input: {
  title: string;
  body: string;
  category: "General" | "Epic" | "Story" | "Journey" | "Design" | "Build";
  priority?: "Normal" | "High";
}) {
  return {
    id: buildFramingAgentSuggestionId(["custom-instruction", input.title, input.category]),
    title: input.title,
    body: input.body,
    category: input.category,
    priority: input.priority ?? "Normal"
  } as const;
}

export function explainInstructionSetting(input: {
  source: FramingAgentSourceOfTruth;
  prompt: string;
}): {
  message: string;
  warnings: string[];
  suggestions: FramingAgentSuggestion[];
  toolTrace: FramingAgentToolTrace[];
} {
  const instructions = input.source.downstreamAiInstructions;

  if (!instructions) {
    return {
      message:
        "Downstream AI Instructions are not configured yet. Start from the seeded defaults for this initiative type, then review deviations and warnings before export.",
      warnings: [],
      suggestions: [] as FramingAgentSuggestion[],
      toolTrace: [
        {
          tool: "getDownstreamAiInstructions",
          summary: "No Downstream AI Instructions were captured yet."
        }
      ]
    };
  }

  const prompt = input.prompt.toLowerCase();
  const matchedPreference =
    instructions.refinementPreferences.find(
      (preference) =>
        prompt.includes(preference.id.toLowerCase()) || prompt.includes(preference.title.toLowerCase())
    ) ?? instructions.refinementPreferences[0];

  if (!matchedPreference) {
    return {
      message: "No configurable preference was available to explain.",
      warnings: [],
      suggestions: [],
      toolTrace: [
        {
          tool: "getDownstreamAiInstructions",
          summary: "Downstream AI Instructions loaded but no refinement preferences were available."
        }
      ]
    };
  }

  const recommended = matchedPreference.defaultByMode[instructions.initiativeType];
  const message = `${matchedPreference.title}: ${matchedPreference.description ?? "No description captured yet."} Current selection is ${matchedPreference.selectedValue}, recommended default for ${instructions.initiativeType} is ${recommended}. YES makes downstream AI explicit on this dimension. NO tells downstream AI not to force it. N/A leaves the choice open for downstream AI while mandatory controls still apply.`;

  return {
    message,
    warnings:
      matchedPreference.selectedValue === "N/A"
        ? ["N/A means leave this dimension open for downstream AI. It does not disable mandatory controls."]
        : [],
    suggestions: [] as FramingAgentSuggestion[],
    toolTrace: [
      {
        tool: "getDownstreamAiInstructions",
        summary: `Explained preference ${matchedPreference.id}.`
      }
    ]
  };
}

export function reviewDownstreamInstructions(source: FramingAgentSourceOfTruth): {
  result: InstructionReviewResult;
  suggestions: FramingAgentSuggestion[];
  toolTrace: FramingAgentToolTrace[];
} {
  const instructions = source.downstreamAiInstructions;

  if (!instructions) {
    const customInstruction = buildSuggestedCustomInstruction({
      title: "Preserve Framing inheritance in downstream AI work",
      body:
        "Downstream AI must inherit Outcome, constraints, UX principles, non-functional requirements, data sensitivity, and traceability before proposing Design or Build outputs.",
      category: "General",
      priority: "High"
    });

    return {
      result: {
        warnings: ["Downstream AI Instructions do not exist yet, so downstream AI behavior is currently underconfigured."],
        suggestedCustomInstructions: [customInstruction]
      },
      suggestions: [
        {
          id: buildFramingAgentSuggestionId(["instruction-add", customInstruction.id]),
          kind: "add_custom_instruction",
          title: "Add foundational downstream instruction",
          description: "Use a high-priority custom instruction to preserve Source of Truth inheritance until the full preference set is reviewed.",
          instruction: customInstruction
        }
      ],
      toolTrace: [
        {
          tool: "getDownstreamAiInstructions",
          summary: "No Downstream AI Instructions existed, so the assistant proposed a starter custom instruction."
        }
      ]
    };
  }

  const analysis = analyzeDownstreamAiInstructions({
    instructions,
    hasJourneyContext: source.journeyContexts.length > 0
  });
  const suggestions: FramingAgentSuggestion[] = [];
  const suggestedPreferenceChanges: InstructionReviewResult["suggestedPreferenceChanges"] = [];
  const suggestedCustomInstructions: NonNullable<InstructionReviewResult["suggestedCustomInstructions"]> = [];

  for (const deviation of analysis.deviations) {
    if (deviation.selected === deviation.recommended || deviation.selected === "N/A") {
      continue;
    }

    suggestedPreferenceChanges.push({
      preferenceId: deviation.id,
      suggestedValue: deviation.recommended,
      rationale:
        deviation.rationale ??
        `This setting deviates from the recommended default for ${instructions.initiativeType}.`
    });

    suggestions.push({
      id: buildFramingAgentSuggestionId(["preference", deviation.id, deviation.recommended]),
      kind: "preference_change",
      title: `Set ${deviation.id} back to ${deviation.recommended}`,
      description:
        deviation.rationale ??
        `This setting differs from the recommended default for ${instructions.initiativeType}.`,
      preferenceId: deviation.id,
      suggestedValue: deviation.recommended,
      rationale:
        deviation.rationale ??
        `This setting differs from the recommended default for ${instructions.initiativeType}.`
    });
  }

  if (source.outcome.dataSensitivityLevel === "high" || source.outcome.dataSensitivity?.trim()) {
    suggestedCustomInstructions.push(
      buildSuggestedCustomInstruction({
        title: "Preserve explicit sensitive-data handling",
        body:
          "Downstream AI must keep sensitive-data classification, privacy boundaries, and review expectations explicit in both Design and Build guidance.",
        category: "Design",
        priority: "High"
      })
    );
  }

  if (source.journeyContexts.length > 0) {
    suggestedCustomInstructions.push(
      buildSuggestedCustomInstruction({
        title: "Carry forward Journey coverage context",
        body:
          "When Journey Context exists, downstream AI should preserve actor continuity, decision points, and handoff risks while refining Story Ideas and Design guidance.",
        category: "Journey",
        priority: "Normal"
      })
    );
  }

  for (const instruction of suggestedCustomInstructions) {
    suggestions.push({
      id: buildFramingAgentSuggestionId(["add-custom", instruction.id]),
      kind: "add_custom_instruction",
      title: `Add custom instruction: ${instruction.title}`,
      description: instruction.body,
      instruction
    });
  }

  return {
    result: {
      warnings: analysis.warnings,
      suggestedPreferenceChanges,
      suggestedCustomInstructions
    },
    suggestions,
    toolTrace: [
      {
        tool: "getDownstreamAiInstructions",
        summary: "Loaded the current Downstream AI Instructions configuration."
      },
      {
        tool: "updateDownstreamAiInstructions",
        summary: `Reviewed ${instructions.refinementPreferences.length} configurable preference(s) and found ${analysis.deviations.length} deviation(s).`
      }
    ]
  };
}
