import type { JourneyContext, JourneyStep } from "@aas-companion/domain";
import { generateBmadExport } from "@/lib/framing/bmadAdapter";
import { generateDesignHandover } from "@/lib/framing/designHandoverAgent";
import { runJourneyCoverageAgent } from "@/lib/framing/journeyCoverageAgent";
import { runStorySuggestionAgent } from "@/lib/framing/storySuggestionAgent";
import {
  buildFramingAgentSuggestionId,
  type FramingAgentArtifact,
  type FramingAgentSourceOfTruth,
  type FramingAgentSuggestion,
  type FramingAgentTool,
  type FramingAgentToolCall,
  type FramingAgentToolTrace
} from "@/lib/framing/agentTypes";

export const framingAgentToolDescriptions: Record<FramingAgentTool, string> = {
  getFramingSourceOfTruth: "Read the current Framing source of truth.",
  getJourneyContext: "Read Journey Context for the current Framing package.",
  getJourney: "Read a specific Journey from the current Framing package.",
  createJourneyContext: "Propose a new Journey Context suggestion without mutating the source of truth.",
  updateJourneyContext: "Propose a Journey Context update suggestion without mutating the source of truth.",
  addJourney: "Propose adding a Journey to an existing Journey Context.",
  updateJourney: "Propose a Journey rewrite or refinement.",
  addJourneyStep: "Propose adding a new Step to an existing Journey.",
  updateJourneyStep: "Propose a Step rewrite or refinement.",
  analyzeJourneyCoverage: "Analyze Journey Context coverage against Epics and Story Ideas.",
  suggestStoryIdeas: "Suggest Story Ideas from Journey Context and current Story Idea structure.",
  createStoryIdeaFromSuggestion: "Create a structured Story Idea candidate suggestion.",
  linkStoryIdeaToJourney: "Propose linking a Story Idea to a Journey.",
  linkEpicToJourney: "Propose linking an Epic to a Journey.",
  getDownstreamAiInstructions: "Read Downstream AI Instructions.",
  updateDownstreamAiInstructions: "Propose a Downstream AI Instructions preference change.",
  addCustomInstruction: "Propose a new custom instruction.",
  generateDesignHandover: "Generate a downstream Design and Build handover package.",
  generateBmadExport: "Generate a BMAD-friendly export profile."
};

export type FramingAgentToolExecutionResult = {
  data?: unknown;
  suggestions: FramingAgentSuggestion[];
  artifacts: FramingAgentArtifact[];
  warnings: string[];
  toolTrace: FramingAgentToolTrace[];
};

function createId(prefix: string, suffix: string) {
  const normalizedSuffix = suffix.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return `${prefix}-${normalizedSuffix || "suggestion"}`;
}

function createEmptyJourneyStep(title = "", description = ""): JourneyStep {
  return {
    id: createId("step", title || description || "new"),
    title,
    description,
    actor: "",
    currentPain: "",
    desiredSupport: "",
    decisionPoint: false
  };
}

function findContext(source: FramingAgentSourceOfTruth, contextId: unknown) {
  return source.journeyContexts.find((context) => context.id === contextId) ?? null;
}

function findJourney(source: FramingAgentSourceOfTruth, journeyId: unknown) {
  for (const context of source.journeyContexts) {
    const journey = context.journeys.find((item) => item.id === journeyId);

    if (journey) {
      return {
        context,
        journey
      };
    }
  }

  return null;
}

function findStep(source: FramingAgentSourceOfTruth, journeyId: unknown, stepId: unknown) {
  const located = findJourney(source, journeyId);

  if (!located) {
    return null;
  }

  const step = located.journey.steps.find((item) => item.id === stepId);

  if (!step) {
    return null;
  }

  return {
    ...located,
    step
  };
}

function toArtifact(kind: "design_handover" | "bmad_export", title: string, result: ReturnType<typeof generateDesignHandover>): FramingAgentArtifact {
  return {
    kind,
    title,
    summary: result.summary,
    markdown: result.markdown,
    json: result.json
  };
}

export function executeFramingAgentToolCall(input: {
  source: FramingAgentSourceOfTruth;
  toolCall: FramingAgentToolCall;
}): FramingAgentToolExecutionResult {
  const { source, toolCall } = input;

  switch (toolCall.tool) {
    case "getFramingSourceOfTruth":
      return {
        data: source,
        suggestions: [],
        artifacts: [],
        warnings: [],
        toolTrace: [
          {
            tool: toolCall.tool,
            summary: `Loaded the full Framing source of truth for ${source.outcome.key}.`
          }
        ]
      };
    case "getJourneyContext": {
      const contextId = toolCall.arguments?.contextId ?? null;
      const contexts = contextId ? source.journeyContexts.filter((context) => context.id === contextId) : source.journeyContexts;

      return {
        data: contexts,
        suggestions: [],
        artifacts: [],
        warnings: contexts.length === 0 ? ["No Journey Context matched the requested scope."] : [],
        toolTrace: [
          {
            tool: toolCall.tool,
            summary: `Loaded ${contexts.length} Journey Context item(s).`
          }
        ]
      };
    }
    case "getJourney": {
      const found = findJourney(source, toolCall.arguments?.journeyId);

      return {
        data: found?.journey ?? null,
        suggestions: [],
        artifacts: [],
        warnings: found ? [] : ["The requested Journey was not found."],
        toolTrace: [
          {
            tool: toolCall.tool,
            summary: found ? `Loaded Journey ${found.journey.title || found.journey.id}.` : "No Journey matched the requested identifier."
          }
        ]
      };
    }
    case "createJourneyContext": {
      const initiativeType = source.outcome.deliveryType ?? "AD";
      const context = {
        id: createId("journey-context", String(toolCall.arguments?.title ?? "new")),
        outcomeId: source.outcome.id,
        initiativeType,
        title: String(toolCall.arguments?.title ?? "New Journey Context"),
        description: String(toolCall.arguments?.description ?? ""),
        journeys: [],
        notes: String(toolCall.arguments?.notes ?? "")
      } satisfies JourneyContext;

      return {
        data: context,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["new-context", context.id]),
            kind: "rewrite_journey_context",
            title: `Create Journey Context: ${context.title}`,
            description: "AI suggestion for a new Journey Context container.",
            contextId: context.id,
            nextContext: context,
            confidence: 0.61
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [
          {
            tool: toolCall.tool,
            summary: `Drafted a new Journey Context suggestion titled "${context.title}".`
          }
        ]
      };
    }
    case "updateJourneyContext": {
      const context = findContext(source, toolCall.arguments?.contextId);

      if (!context) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["The Journey Context to update was not found."],
          toolTrace: [{ tool: toolCall.tool, summary: "Journey Context update could not be prepared because the target was missing." }]
        };
      }

      const nextContext = {
        ...context,
        title: typeof toolCall.arguments?.title === "string" ? toolCall.arguments.title : context.title,
        description:
          typeof toolCall.arguments?.description === "string" ? toolCall.arguments.description : context.description,
        notes: typeof toolCall.arguments?.notes === "string" ? toolCall.arguments.notes : context.notes
      };

      return {
        data: nextContext,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["update-context", context.id]),
            kind: "rewrite_journey_context",
            title: `Refine Journey Context: ${nextContext.title || context.id}`,
            description: "AI suggestion to improve the Journey Context wording without silently changing saved source data.",
            contextId: context.id,
            nextContext,
            confidence: 0.66
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a Journey Context rewrite suggestion for ${context.id}.` }]
      };
    }
    case "addJourney": {
      const context = findContext(source, toolCall.arguments?.contextId);

      if (!context) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["The Journey Context for the new Journey was not found."],
          toolTrace: [{ tool: toolCall.tool, summary: "Journey add suggestion failed because the parent Journey Context was missing." }]
        };
      }

      const nextJourney = {
        id: createId("journey", String(toolCall.arguments?.title ?? "new")),
        title: String(toolCall.arguments?.title ?? "New Journey"),
        type: undefined,
        primaryActor: String(toolCall.arguments?.primaryActor ?? ""),
        supportingActors: [],
        goal: String(toolCall.arguments?.goal ?? ""),
        trigger: String(toolCall.arguments?.trigger ?? ""),
        currentState: "",
        desiredFutureState: "",
        steps: [createEmptyJourneyStep("Start", String(toolCall.arguments?.stepDescription ?? "Describe the first step in business language."))],
        painPoints: [],
        desiredSupport: [],
        exceptions: [],
        notes: "",
        linkedEpicIds: [],
        linkedStoryIdeaIds: [],
        linkedFigmaRefs: [],
        coverage: {
          status: "unanalysed" as const
        }
      };

      return {
        data: nextJourney,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["add-journey", context.id, nextJourney.id]),
            kind: "rewrite_journey_context",
            title: `Add Journey to ${context.title || context.id}`,
            description: "AI suggestion to add a new Journey to the selected Journey Context.",
            contextId: context.id,
            nextContext: {
              ...context,
              journeys: [...context.journeys, nextJourney]
            },
            confidence: 0.59
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a Journey add suggestion inside Journey Context ${context.id}.` }]
      };
    }
    case "updateJourney": {
      const found = findJourney(source, toolCall.arguments?.journeyId);

      if (!found) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["The Journey to update was not found."],
          toolTrace: [{ tool: toolCall.tool, summary: "Journey update could not be prepared because the target Journey was missing." }]
        };
      }

      const nextJourney = {
        ...found.journey,
        title: typeof toolCall.arguments?.title === "string" ? toolCall.arguments.title : found.journey.title,
        goal: typeof toolCall.arguments?.goal === "string" ? toolCall.arguments.goal : found.journey.goal,
        trigger: typeof toolCall.arguments?.trigger === "string" ? toolCall.arguments.trigger : found.journey.trigger,
        currentState:
          typeof toolCall.arguments?.currentState === "string" ? toolCall.arguments.currentState : found.journey.currentState,
        desiredFutureState:
          typeof toolCall.arguments?.desiredFutureState === "string"
            ? toolCall.arguments.desiredFutureState
            : found.journey.desiredFutureState,
        notes: typeof toolCall.arguments?.notes === "string" ? toolCall.arguments.notes : found.journey.notes
      };

      return {
        data: nextJourney,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["update-journey", found.context.id, found.journey.id]),
            kind: "rewrite_journey",
            title: `Refine Journey: ${nextJourney.title || found.journey.id}`,
            description: "AI suggestion to improve Journey wording without silently changing saved source data.",
            contextId: found.context.id,
            journeyId: found.journey.id,
            nextJourney,
            confidence: 0.67
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a Journey rewrite suggestion for ${found.journey.id}.` }]
      };
    }
    case "addJourneyStep": {
      const found = findJourney(source, toolCall.arguments?.journeyId);

      if (!found) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["The Journey for the new Step was not found."],
          toolTrace: [{ tool: toolCall.tool, summary: "Step add suggestion failed because the Journey was missing." }]
        };
      }

      const nextStep = createEmptyJourneyStep(
        String(toolCall.arguments?.title ?? "New Step"),
        String(toolCall.arguments?.description ?? "Describe what happens in this step in business language.")
      );

      return {
        data: nextStep,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["add-step", found.context.id, found.journey.id, nextStep.id]),
            kind: "rewrite_journey",
            title: `Add Step to ${found.journey.title || found.journey.id}`,
            description: "AI suggestion to add a Step to the current Journey.",
            contextId: found.context.id,
            journeyId: found.journey.id,
            nextJourney: {
              ...found.journey,
              steps: [...found.journey.steps, nextStep]
            },
            confidence: 0.58
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a Step add suggestion for Journey ${found.journey.id}.` }]
      };
    }
    case "updateJourneyStep": {
      const found = findStep(source, toolCall.arguments?.journeyId, toolCall.arguments?.stepId);

      if (!found) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["The Journey Step to update was not found."],
          toolTrace: [{ tool: toolCall.tool, summary: "Step rewrite suggestion could not be prepared because the Step was missing." }]
        };
      }

      const nextStep = {
        ...found.step,
        title: typeof toolCall.arguments?.title === "string" ? toolCall.arguments.title : found.step.title,
        actor: typeof toolCall.arguments?.actor === "string" ? toolCall.arguments.actor : found.step.actor,
        description:
          typeof toolCall.arguments?.description === "string" ? toolCall.arguments.description : found.step.description,
        currentPain:
          typeof toolCall.arguments?.currentPain === "string" ? toolCall.arguments.currentPain : found.step.currentPain,
        desiredSupport:
          typeof toolCall.arguments?.desiredSupport === "string"
            ? toolCall.arguments.desiredSupport
            : found.step.desiredSupport,
        decisionPoint:
          typeof toolCall.arguments?.decisionPoint === "boolean"
            ? toolCall.arguments.decisionPoint
            : found.step.decisionPoint
      };

      return {
        data: nextStep,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["update-step", found.context.id, found.journey.id, found.step.id]),
            kind: "rewrite_journey_step",
            title: `Refine Step: ${nextStep.title || found.step.id}`,
            description: "AI suggestion to improve the Step wording without silently changing saved source data.",
            contextId: found.context.id,
            journeyId: found.journey.id,
            stepId: found.step.id,
            nextStep,
            confidence: 0.7
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a Step rewrite suggestion for ${found.step.id}.` }]
      };
    }
    case "analyzeJourneyCoverage": {
      const result = runJourneyCoverageAgent({
        source,
        journeyContextId: typeof toolCall.arguments?.journeyContextId === "string" ? toolCall.arguments.journeyContextId : null
      });

      return {
        data: result.coverageResults,
        suggestions: result.suggestions,
        artifacts: [],
        warnings: result.warnings,
        toolTrace: result.toolTrace
      };
    }
    case "suggestStoryIdeas": {
      const result = runStorySuggestionAgent(source);

      return {
        data: result.result,
        suggestions: result.suggestions,
        artifacts: [],
        warnings: result.warnings,
        toolTrace: result.toolTrace
      };
    }
    case "createStoryIdeaFromSuggestion": {
      const title = String(toolCall.arguments?.title ?? "Suggested Story Idea");
      const description = String(toolCall.arguments?.description ?? "AI-generated Story Idea suggestion.");
      const suggestedEpicId =
        typeof toolCall.arguments?.epicId === "string" ? toolCall.arguments.epicId : source.epics[0]?.id ?? null;

      return {
        data: null,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["story-suggestion", title, suggestedEpicId]),
            kind: "story_idea_candidate",
            title: `Create Story Idea: ${title}`,
            description,
            storyIdea: {
              title,
              description,
              valueIntent: description,
              expectedOutcome: typeof toolCall.arguments?.expectedOutcome === "string" ? toolCall.arguments.expectedOutcome : undefined,
              basedOnJourneyIds: Array.isArray(toolCall.arguments?.basedOnJourneyIds)
                ? toolCall.arguments?.basedOnJourneyIds.filter((value): value is string => typeof value === "string")
                : [],
              basedOnStepIds: Array.isArray(toolCall.arguments?.basedOnStepIds)
                ? toolCall.arguments?.basedOnStepIds.filter((value): value is string => typeof value === "string")
                : [],
              confidence: typeof toolCall.arguments?.confidence === "number" ? toolCall.arguments.confidence : undefined,
              suggestedEpicId
            }
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a Story Idea suggestion titled "${title}".` }]
      };
    }
    case "linkStoryIdeaToJourney": {
      const found = findJourney(source, toolCall.arguments?.journeyId);
      const storyIdeaId = typeof toolCall.arguments?.storyIdeaId === "string" ? toolCall.arguments.storyIdeaId : null;

      if (!found || !storyIdeaId) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["A Journey and Story Idea identifier are both required for linking."],
          toolTrace: [{ tool: toolCall.tool, summary: "Story Idea link suggestion could not be prepared." }]
        };
      }

      return {
        data: null,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["journey-story-link", found.context.id, found.journey.id, storyIdeaId]),
            kind: "link_story_idea_to_journey",
            title: `Link Story Idea to ${found.journey.title || found.journey.id}`,
            description: "AI suggestion for a likely Journey-to-Story mapping.",
            contextId: found.context.id,
            journeyId: found.journey.id,
            storyIdeaId
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a Story Idea link suggestion for Journey ${found.journey.id}.` }]
      };
    }
    case "linkEpicToJourney": {
      const found = findJourney(source, toolCall.arguments?.journeyId);
      const epicId = typeof toolCall.arguments?.epicId === "string" ? toolCall.arguments.epicId : null;

      if (!found || !epicId) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["A Journey and Epic identifier are both required for linking."],
          toolTrace: [{ tool: toolCall.tool, summary: "Epic link suggestion could not be prepared." }]
        };
      }

      return {
        data: null,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["journey-epic-link", found.context.id, found.journey.id, epicId]),
            kind: "link_epic_to_journey",
            title: `Link Epic to ${found.journey.title || found.journey.id}`,
            description: "AI suggestion for a likely Journey-to-Epic mapping.",
            contextId: found.context.id,
            journeyId: found.journey.id,
            epicId
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared an Epic link suggestion for Journey ${found.journey.id}.` }]
      };
    }
    case "getDownstreamAiInstructions":
      return {
        data: source.downstreamAiInstructions,
        suggestions: [],
        artifacts: [],
        warnings: source.downstreamAiInstructions ? [] : ["No Downstream AI Instructions were configured."],
        toolTrace: [
          {
            tool: toolCall.tool,
            summary: source.downstreamAiInstructions
              ? "Loaded the current Downstream AI Instructions configuration."
              : "No Downstream AI Instructions were captured yet."
          }
        ]
      };
    case "updateDownstreamAiInstructions": {
      const preferenceId = typeof toolCall.arguments?.preferenceId === "string" ? toolCall.arguments.preferenceId : null;
      const suggestedValue = toolCall.arguments?.suggestedValue;

      if (
        !preferenceId ||
        (suggestedValue !== "YES" && suggestedValue !== "NO" && suggestedValue !== "N/A")
      ) {
        return {
          data: null,
          suggestions: [],
          artifacts: [],
          warnings: ["A preference identifier and a valid suggested value are required."],
          toolTrace: [{ tool: toolCall.tool, summary: "Preference-change suggestion could not be prepared." }]
        };
      }

      return {
        data: null,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["preference-change", preferenceId, suggestedValue]),
            kind: "preference_change",
            title: `Update preference ${preferenceId}`,
            description:
              typeof toolCall.arguments?.rationale === "string"
                ? toolCall.arguments.rationale
                : "AI suggestion for a stronger downstream AI preference selection.",
            preferenceId,
            suggestedValue,
            rationale:
              typeof toolCall.arguments?.rationale === "string"
                ? toolCall.arguments.rationale
                : "AI suggestion for a stronger downstream AI preference selection."
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a preference-change suggestion for ${preferenceId}.` }]
      };
    }
    case "addCustomInstruction": {
      const title = typeof toolCall.arguments?.title === "string" ? toolCall.arguments.title : "New custom instruction";
      const body = typeof toolCall.arguments?.body === "string" ? toolCall.arguments.body : "";
      const category =
        toolCall.arguments?.category === "Epic" ||
        toolCall.arguments?.category === "Story" ||
        toolCall.arguments?.category === "Journey" ||
        toolCall.arguments?.category === "Design" ||
        toolCall.arguments?.category === "Build"
          ? toolCall.arguments.category
          : "General";
      const priority = toolCall.arguments?.priority === "High" ? "High" : "Normal";

      return {
        data: null,
        suggestions: [
          {
            id: buildFramingAgentSuggestionId(["custom-instruction", title, category]),
            kind: "add_custom_instruction",
            title: `Add custom instruction: ${title}`,
            description: body || "AI suggestion for a new custom instruction.",
            instruction: {
              id: createId("custom-instruction", title),
              title,
              body,
              category,
              priority
            }
          }
        ],
        artifacts: [],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: `Prepared a custom instruction suggestion titled "${title}".` }]
      };
    }
    case "generateDesignHandover": {
      const result = generateDesignHandover(source);

      return {
        data: result.json,
        suggestions: [],
        artifacts: [toArtifact("design_handover", "Design Handover", result)],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: "Generated a downstream Design and Build handover package." }]
      };
    }
    case "generateBmadExport": {
      const result = generateBmadExport(source);

      return {
        data: result.json,
        suggestions: [],
        artifacts: [toArtifact("bmad_export", "BMAD-friendly export", result as ReturnType<typeof generateDesignHandover>)],
        warnings: [],
        toolTrace: [{ tool: toolCall.tool, summary: "Generated a BMAD-friendly export profile." }]
      };
    }
    default:
      return {
        data: null,
        suggestions: [],
        artifacts: [],
        warnings: [`Unsupported tool requested: ${String(toolCall.tool)}`],
        toolTrace: [{ tool: toolCall.tool, summary: "Unsupported tool call was ignored." }]
      };
  }
}
