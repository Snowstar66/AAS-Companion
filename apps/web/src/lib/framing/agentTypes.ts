import type {
  CustomInstruction,
  DownstreamAiInstructions,
  JourneyContext,
  JourneyCoverage,
  JourneyStep,
  SuggestedStoryIdea
} from "@aas-companion/domain";

export type FramingAgentMode = "ask" | "analyze" | "refine" | "export";

export type FramingAgentScopeKind =
  | "journey-context"
  | "story-ideas"
  | "downstream-ai-instructions"
  | "export"
  | "full-framing";

export type FramingAgentTool =
  | "getFramingSourceOfTruth"
  | "getJourneyContext"
  | "getJourney"
  | "createJourneyContext"
  | "updateJourneyContext"
  | "addJourney"
  | "updateJourney"
  | "addJourneyStep"
  | "updateJourneyStep"
  | "analyzeJourneyCoverage"
  | "suggestStoryIdeas"
  | "createStoryIdeaFromSuggestion"
  | "linkStoryIdeaToJourney"
  | "linkEpicToJourney"
  | "getDownstreamAiInstructions"
  | "updateDownstreamAiInstructions"
  | "addCustomInstruction"
  | "generateDesignHandover"
  | "generateBmadExport";

export type FramingAgentScope = {
  kind: FramingAgentScopeKind;
  label: string;
  entityId?: string | null;
};

export type FramingAgentSourceOfTruth = {
  outcome: {
    id: string;
    key: string;
    title: string;
    deliveryType: "AD" | "AT" | "AM" | null;
    aiLevel: 0 | 1 | 2 | 3;
    aiAccelerationLevel: "level_1" | "level_2" | "level_3";
    problemStatement: string | null;
    outcomeStatement: string | null;
    baselineDefinition: string | null;
    baselineSource: string | null;
    solutionContext: string | null;
    constraints: string | null;
    structuredConstraints: {
      uxPrinciples: string;
      nonFunctionalRequirements: string;
      additionalRequirements: string;
    };
    dataSensitivity: string | null;
    dataSensitivityLevel: "low" | "medium" | "high" | null;
    dataSensitivityRationale: string | null;
    timeframe: string | null;
    riskProfile: "low" | "medium" | "high";
  };
  epics: Array<{
    id: string;
    key: string;
    title: string;
    purpose: string | null;
    scopeBoundary: string | null;
  }>;
  storyIdeas: Array<{
    id: string;
    key: string;
    title: string;
    epicId: string | null;
    epicKey: string | null;
    shortDescription: string | null;
    expectedBehavior: string | null;
    uxSketchName: string | null;
    uxSketchDataUrl: string | null;
  }>;
  journeyContexts: JourneyContext[];
  downstreamAiInstructions: DownstreamAiInstructions | null;
};

export type FramingAgentQuickAction = {
  id: string;
  label: string;
  mode: FramingAgentMode;
  prompt: string;
};

export type FramingAgentSuggestion =
  | {
      id: string;
      kind: "rewrite_journey_context";
      title: string;
      description: string;
      contextId: string;
      nextContext: JourneyContext;
      confidence?: number | null;
    }
  | {
      id: string;
      kind: "rewrite_journey";
      title: string;
      description: string;
      contextId: string;
      journeyId: string;
      nextJourney: JourneyContext["journeys"][number];
      confidence?: number | null;
    }
  | {
      id: string;
      kind: "rewrite_journey_step";
      title: string;
      description: string;
      contextId: string;
      journeyId: string;
      stepId: string;
      nextStep: JourneyStep;
      confidence?: number | null;
    }
  | {
      id: string;
      kind: "apply_journey_coverage";
      title: string;
      description: string;
      contextId: string;
      journeyId: string;
      coverage: JourneyCoverage;
      confidence?: number | null;
    }
  | {
      id: string;
      kind: "story_idea_candidate";
      title: string;
      description: string;
      storyIdea: SuggestedStoryIdea & {
        suggestedEpicId?: string | null;
      };
      confidence?: number | null;
    }
  | {
      id: string;
      kind: "link_story_idea_to_journey";
      title: string;
      description: string;
      contextId: string;
      journeyId: string;
      storyIdeaId: string;
    }
  | {
      id: string;
      kind: "link_epic_to_journey";
      title: string;
      description: string;
      contextId: string;
      journeyId: string;
      epicId: string;
    }
  | {
      id: string;
      kind: "preference_change";
      title: string;
      description: string;
      preferenceId: string;
      suggestedValue: "YES" | "NO" | "N/A";
      rationale: string;
    }
  | {
      id: string;
      kind: "add_custom_instruction";
      title: string;
      description: string;
      instruction: CustomInstruction;
    };

export type FramingAgentToolCall = {
  tool: FramingAgentTool;
  arguments?: Record<string, unknown>;
};

export type FramingAgentArtifact = {
  kind: "design_handover" | "bmad_export";
  title: string;
  summary: string;
  markdown: string;
  json: Record<string, unknown>;
};

export type FramingAgentToolTrace = {
  tool: FramingAgentTool;
  summary: string;
};

export function buildFramingAgentSuggestionId(parts: Array<string | number | null | undefined>) {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined && String(part).trim().length > 0)
    .map((part) => String(part).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .join("-")
    .replace(/^-+|-+$/g, "");
}
