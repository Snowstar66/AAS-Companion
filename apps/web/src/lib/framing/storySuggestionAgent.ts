import type { SuggestedStoryIdea } from "@aas-companion/domain";
import { runJourneyCoverageAgent } from "@/lib/framing/journeyCoverageAgent";
import type { StorySuggestionResult } from "@/lib/framing/agentStructuredOutputs";
import {
  buildFramingAgentSuggestionId,
  type FramingAgentSourceOfTruth,
  type FramingAgentSuggestion,
  type FramingAgentToolTrace
} from "@/lib/framing/agentTypes";

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function overlapScore(left: string, right: string) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

function pickSuggestedEpicId(
  source: FramingAgentSourceOfTruth,
  text: string,
  fallbackEpicId?: string | null
) {
  if (fallbackEpicId && source.epics.some((epic) => epic.id === fallbackEpicId)) {
    return fallbackEpicId;
  }

  const sorted = source.epics
    .map((epic) => ({
      id: epic.id,
      score: overlapScore(`${epic.key} ${epic.title} ${epic.purpose ?? ""} ${epic.scopeBoundary ?? ""}`, text)
    }))
    .sort((left, right) => right.score - left.score);

  return sorted[0]?.score && sorted[0].score > 0.15 ? sorted[0].id : source.epics[0]?.id ?? null;
}

function buildStoryIdeaFromJourney(input: {
  source: FramingAgentSourceOfTruth;
  title: string;
  description: string;
  basedOnJourneyIds: string[];
  basedOnStepIds: string[];
  expectedOutcome?: string | null;
  confidence?: number | null;
  suggestedEpicId?: string | null;
}): SuggestedStoryIdea & { suggestedEpicId?: string | null } {
  return {
    title: input.title,
    description: input.description,
    valueIntent: input.description,
    expectedOutcome: input.expectedOutcome ?? undefined,
    basedOnJourneyIds: input.basedOnJourneyIds,
    basedOnStepIds: input.basedOnStepIds,
    confidence: input.confidence ?? undefined,
    suggestedEpicId:
      input.suggestedEpicId ?? pickSuggestedEpicId(input.source, `${input.title} ${input.description}`)
  };
}

function rewriteExpectedBehavior(title: string, valueIntent: string | null, expectedBehavior: string | null) {
  if (expectedBehavior?.trim()) {
    return expectedBehavior.trim();
  }

  return `When implemented, ${title.toLowerCase()} should support ${valueIntent?.trim() || "the intended outcome"} without dropping traceability or inherited constraints.`;
}

export function runStorySuggestionAgent(source: FramingAgentSourceOfTruth): {
  result: StorySuggestionResult;
  suggestions: FramingAgentSuggestion[];
  warnings: string[];
  toolTrace: FramingAgentToolTrace[];
} {
  const coverage = runJourneyCoverageAgent({ source });
  const suggestions: Array<SuggestedStoryIdea & { suggestedEpicId?: string | null }> = [];
  const mergeCandidates: string[] = [];
  const splitCandidates: string[] = [];
  const rewriteSuggestions: Array<{ storyIdeaId: string; suggestedText: string }> = [];
  const panelSuggestions: FramingAgentSuggestion[] = [];

  for (const suggestion of coverage.suggestions) {
    if (suggestion.kind === "story_idea_candidate") {
      suggestions.push(suggestion.storyIdea);
      panelSuggestions.push(suggestion);
    }
  }

  for (const context of source.journeyContexts) {
    for (const journey of context.journeys) {
      if (journey.coverage?.status === "covered") {
        continue;
      }

      if ((journey.coverage?.suggestedNewStoryIdeas?.length ?? 0) > 0) {
        continue;
      }

      const generated = buildStoryIdeaFromJourney({
        source,
        title: journey.title ? `${journey.title}` : `Support ${journey.primaryActor || "core flow"}`,
        description:
          journey.desiredSupport?.[0] ??
          journey.goal ??
          "Support the actor with a clearer, lower-friction path through the journey.",
        basedOnJourneyIds: [journey.id],
        basedOnStepIds: journey.steps.map((step) => step.id),
        expectedOutcome: journey.desiredFutureState ?? null,
        confidence: 0.58,
        suggestedEpicId: journey.linkedEpicIds?.[0] ?? null
      });

      suggestions.push(generated);
      panelSuggestions.push({
        id: buildFramingAgentSuggestionId(["journey-story-suggestion", context.id, journey.id, generated.title]),
        kind: "story_idea_candidate",
        title: `Create Story Idea for ${journey.title || journey.id}`,
        description: generated.description,
        storyIdea: generated,
        confidence: generated.confidence ?? null
      });
    }
  }

  for (let index = 0; index < source.storyIdeas.length; index += 1) {
    const left = source.storyIdeas[index];

    if (!left) {
      continue;
    }

    const combinedText = `${left.title} ${left.shortDescription ?? ""} ${left.expectedBehavior ?? ""}`;

    if ((left.expectedBehavior?.length ?? 0) > 220 || /\band\b|,/i.test(left.title)) {
      splitCandidates.push(left.key);
    }

    if (!left.expectedBehavior?.trim()) {
      rewriteSuggestions.push({
        storyIdeaId: left.id,
        suggestedText: rewriteExpectedBehavior(left.title, left.shortDescription, left.expectedBehavior)
      });
    }

    for (let compareIndex = index + 1; compareIndex < source.storyIdeas.length; compareIndex += 1) {
      const right = source.storyIdeas[compareIndex];

      if (!right) {
        continue;
      }

      const score = overlapScore(
        combinedText,
        `${right.title} ${right.shortDescription ?? ""} ${right.expectedBehavior ?? ""}`
      );

      if (score >= 0.45) {
        mergeCandidates.push(`${left.key} + ${right.key}`);
      }
    }
  }

  return {
    result: {
      suggestions,
      splitCandidates: [...new Set(splitCandidates)],
      mergeCandidates: [...new Set(mergeCandidates)],
      rewriteSuggestions
    },
    suggestions: panelSuggestions,
    warnings: suggestions.length === 0 ? ["Inga tydliga nya Story Idea-kandidater hittades utifrån nuvarande Journey Context."] : [],
    toolTrace: [
      coverage.toolTrace[0] ?? {
        tool: "suggestStoryIdeas",
        summary: "Återanvände journey-täckningsanalysen när Story Ideas-förslag togs fram."
      },
      {
        tool: "suggestStoryIdeas",
        summary: `Tog fram ${suggestions.length} Story Idea-kandidat(er), ${splitCandidates.length} split-kandidat(er) och ${mergeCandidates.length} merge-kandidat(er).`
      }
    ]
  };
}
