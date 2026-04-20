import type { CustomInstruction, SuggestedStoryIdea } from "@aas-companion/domain";
import type { FramingAgentArtifact, FramingAgentSuggestion, FramingAgentToolCall, FramingAgentToolTrace } from "@/lib/framing/agentTypes";

export type CoverageAnalysisResult = {
  journeyId: string;
  status: "covered" | "partially_covered" | "uncovered";
  suggestedEpicIds: string[];
  suggestedStoryIdeaIds: string[];
  suggestedNewStoryIdeas: SuggestedStoryIdea[];
  notes?: string;
};

export type StorySuggestionResult = {
  suggestions: Array<SuggestedStoryIdea & { suggestedEpicId?: string | null }>;
  splitCandidates?: string[];
  mergeCandidates?: string[];
  rewriteSuggestions?: Array<{
    storyIdeaId: string;
    suggestedText: string;
  }>;
};

export type InstructionReviewResult = {
  warnings: string[];
  suggestedPreferenceChanges?: Array<{
    preferenceId: string;
    suggestedValue: "YES" | "NO" | "N/A";
    rationale: string;
  }>;
  suggestedCustomInstructions?: CustomInstruction[];
};

export type DesignHandoverResult = {
  summary: string;
  markdown: string;
  json: Record<string, unknown>;
};

export type FramingAgentRunResult = {
  ok: true;
  mode: "ask" | "analyze" | "refine" | "export";
  role:
    | "Framing Interview Agent"
    | "Journey Context Agent"
    | "Coverage Analysis Agent"
    | "Story Suggestion Agent"
    | "Downstream AI Instructions Assistant"
    | "Design Handover Agent"
    | "BMAD Adapter";
  scopeLabel: string;
  usedLiveAi: boolean;
  message: string;
  followUpQuestions: string[];
  warnings: string[];
  helperText?: string | null;
  suggestions: FramingAgentSuggestion[];
  artifacts: FramingAgentArtifact[];
  toolTrace: FramingAgentToolTrace[];
  plannedToolCalls: FramingAgentToolCall[];
};

export type FramingAgentRunFailure = {
  ok: false;
  error: string;
};

export type FramingAgentActionResult = FramingAgentRunResult | FramingAgentRunFailure;
