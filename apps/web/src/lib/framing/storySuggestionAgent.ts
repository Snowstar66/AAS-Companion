import type { SuggestedStoryIdea } from "@aas-companion/domain";
import { runJourneyCoverageAgent } from "@/lib/framing/journeyCoverageAgent";
import type { StorySuggestionResult } from "@/lib/framing/agentStructuredOutputs";
import {
  buildFramingAgentSuggestionId,
  type FramingAgentSourceOfTruth,
  type FramingAgentSuggestion,
  type FramingAgentToolTrace
} from "@/lib/framing/agentTypes";

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function truncateText(value: string | null | undefined, maxLength: number) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength).trimEnd()}...`;
}

function stripTrailingPeriod(value: string) {
  return value.trim().replace(/[.!?]+$/g, "");
}

function lowerFirst(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
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

function buildStorySuggestionReason(source: FramingAgentSourceOfTruth, storyTitle: string, basedOnJourneyIds: string[]) {
  const journeys = source.journeyContexts
    .flatMap((context) => context.journeys)
    .filter((journey) => basedOnJourneyIds.includes(journey.id));
  const linkedEpicKeys = Array.from(
    new Set(
      journeys.flatMap((journey) =>
        (journey.linkedEpicIds ?? [])
          .map((epicId) => source.epics.find((epic) => epic.id === epicId)?.key)
          .filter((value): value is string => Boolean(value))
      )
    )
  );
  const linkedStoryIdeaKeys = Array.from(
    new Set(
      journeys.flatMap((journey) =>
        (journey.linkedStoryIdeaIds ?? [])
          .map((storyIdeaId) => source.storyIdeas.find((storyIdea) => storyIdea.id === storyIdeaId)?.key)
          .filter((value): value is string => Boolean(value))
      )
    )
  );

  const notes = [
    hasText(source.outcome.problemStatement)
      ? `Problem context: ${truncateText(source.outcome.problemStatement, 120)}`
      : "",
    hasText(source.outcome.outcomeStatement)
      ? `Target outcome: ${truncateText(source.outcome.outcomeStatement, 120)}`
      : "",
    hasText(source.outcome.baselineDefinition)
      ? `Baseline to improve: ${truncateText(source.outcome.baselineDefinition, 120)}`
      : "",
    linkedEpicKeys.length > 0 ? `Likely epic fit: ${linkedEpicKeys.join(", ")}` : "",
    linkedStoryIdeaKeys.length > 0 ? `Already related Story Ideas: ${linkedStoryIdeaKeys.join(", ")}` : ""
  ].filter(Boolean);

  return notes.length > 0
    ? `${storyTitle} was suggested after checking the journey against the current problem, outcome, baseline, Epics, and Story Ideas. ${notes.join(" | ")}.`
    : `${storyTitle} was suggested after checking the journey against the current Framing signals.`;
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
      score: overlapScore(
        `${epic.key} ${epic.title} ${epic.purpose ?? ""} ${epic.scopeBoundary ?? ""} ${source.outcome.outcomeStatement ?? ""}`,
        text
      )
    }))
    .sort((left, right) => right.score - left.score);

  return sorted[0]?.score && sorted[0].score > 0.15 ? sorted[0].id : source.epics[0]?.id ?? null;
}

function buildStoryIdeaFromJourney(input: {
  source: FramingAgentSourceOfTruth;
  journeyTitle?: string | null;
  title: string;
  description: string;
  basedOnJourneyIds: string[];
  basedOnStepIds: string[];
  expectedOutcome?: string | null;
  confidence?: number | null;
  suggestedEpicId?: string | null;
}): SuggestedStoryIdea & { suggestedEpicId?: string | null } {
  const journeyLabel = input.journeyTitle?.trim() || "the journey";
  const baselineGap = hasText(input.source.outcome.baselineDefinition)
    ? ` Improve on today's baseline where ${lowerFirst(stripTrailingPeriod(input.source.outcome.baselineDefinition ?? ""))}.`
    : "";
  const expectedOutcome =
    input.expectedOutcome?.trim() ||
    input.source.outcome.outcomeStatement?.trim() ||
    `Help ${journeyLabel.toLowerCase()} move toward the intended outcome without losing traceability.`;
  const contextualDescription = [
    input.description.trim(),
    hasText(input.source.outcome.problemStatement)
      ? `Address the current problem where ${lowerFirst(stripTrailingPeriod(input.source.outcome.problemStatement ?? ""))}.`
      : "",
    baselineGap
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: input.title,
    description: contextualDescription,
    valueIntent: input.source.outcome.outcomeStatement?.trim() || input.description,
    expectedOutcome,
    basedOnJourneyIds: input.basedOnJourneyIds,
    basedOnStepIds: input.basedOnStepIds,
    confidence: input.confidence ?? undefined,
    suggestedEpicId:
      input.suggestedEpicId ?? pickSuggestedEpicId(input.source, `${input.title} ${input.description} ${expectedOutcome}`)
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
      const matchingJourney = source.journeyContexts
        .flatMap((context) => context.journeys)
        .find((journey) => (suggestion.storyIdea.basedOnJourneyIds ?? []).includes(journey.id));
      const contextualStoryIdea = buildStoryIdeaFromJourney({
        source,
        journeyTitle: matchingJourney?.title ?? null,
        title: suggestion.storyIdea.title,
        description: suggestion.storyIdea.description,
        basedOnJourneyIds: suggestion.storyIdea.basedOnJourneyIds ?? [],
        basedOnStepIds: suggestion.storyIdea.basedOnStepIds ?? [],
        expectedOutcome: suggestion.storyIdea.expectedOutcome ?? null,
        confidence: suggestion.storyIdea.confidence ?? null,
        suggestedEpicId: suggestion.storyIdea.suggestedEpicId ?? null
      });

      suggestions.push(contextualStoryIdea);
      panelSuggestions.push({
        ...suggestion,
        description: buildStorySuggestionReason(source, contextualStoryIdea.title, contextualStoryIdea.basedOnJourneyIds ?? []),
        storyIdea: contextualStoryIdea
      });
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
        journeyTitle: journey.title,
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
        description: buildStorySuggestionReason(source, generated.title, generated.basedOnJourneyIds ?? []),
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
    warnings:
      suggestions.length === 0
        ? ["No clear new Story Idea candidates were found from the current Journey Context."]
        : [],
    toolTrace: [
      coverage.toolTrace[0] ?? {
        tool: "suggestStoryIdeas",
        summary: "Reused journey coverage analysis while generating Story Idea suggestions."
      },
      {
        tool: "suggestStoryIdeas",
        summary: `Generated ${suggestions.length} Story Idea candidate(s), ${splitCandidates.length} split candidate(s), and ${mergeCandidates.length} merge candidate(s).`
      }
    ]
  };
}
