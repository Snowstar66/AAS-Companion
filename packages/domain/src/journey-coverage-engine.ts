import type { Journey, JourneyContext, JourneyCoverage, SuggestedStoryIdea } from "./journey-context";

type CoverageEpic = {
  id: string;
  key: string;
  title: string;
  purpose?: string | null;
  scopeBoundary?: string | null;
};

type CoverageStoryIdea = {
  id: string;
  key: string;
  title: string;
  valueIntent?: string | null;
  expectedBehavior?: string | null;
  epicId?: string | null;
};

type AnalyzeJourneyCoverageInput = {
  journeyContext: JourneyContext;
  epics: CoverageEpic[];
  storyIdeas: CoverageStoryIdea[];
};

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "with",
  "att",
  "av",
  "den",
  "det",
  "de",
  "en",
  "ett",
  "för",
  "från",
  "hur",
  "i",
  "inom",
  "med",
  "och",
  "om",
  "på",
  "som",
  "ska",
  "till",
  "utan",
  "vid"
]);

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function tokenize(value: string | null | undefined) {
  return normalizeText(value)
    .split(/[^\p{L}\p{N}]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3 && !stopWords.has(part));
}

function uniqueTokens(parts: Array<string | null | undefined>) {
  return [...new Set(parts.flatMap((part) => tokenize(part)))];
}

function scoreOverlap(sourceTokens: string[], candidateTokens: string[]) {
  if (sourceTokens.length === 0 || candidateTokens.length === 0) {
    return 0;
  }

  const candidateSet = new Set(candidateTokens);
  return sourceTokens.reduce((score, token) => score + (candidateSet.has(token) ? 1 : 0), 0);
}

function pickTopIds(matches: Array<{ id: string; score: number }>, limit: number) {
  const bestScore = matches[0]?.score ?? 0;

  if (bestScore <= 0) {
    return [];
  }

  return matches
    .filter((match) => match.score >= Math.max(2, bestScore - 1))
    .slice(0, limit)
    .map((match) => match.id);
}

function summarizeSupport(matchCount: number, bestStoryScore: number, bestEpicScore: number): JourneyCoverage["status"] {
  if (matchCount === 0 || (bestStoryScore === 0 && bestEpicScore === 0)) {
    return "uncovered";
  }

  if ((matchCount >= 2 && bestStoryScore >= 4) || (matchCount >= 1 && bestStoryScore >= 5 && bestEpicScore >= 3)) {
    return "covered";
  }

  return "partially_covered";
}

function toJourneySearchText(journey: Journey) {
  return uniqueTokens([
    journey.title,
    journey.type,
    journey.primaryActor,
    ...(journey.supportingActors ?? []),
    journey.goal,
    journey.trigger,
    journey.currentState,
    journey.desiredFutureState,
    ...(journey.painPoints ?? []),
    ...(journey.desiredSupport ?? []),
    ...(journey.exceptions ?? []),
    journey.notes,
    ...journey.steps.flatMap((step) => [step.title, step.actor, step.description, step.currentPain, step.desiredSupport])
  ]);
}

function cleanJourneyLabel(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();

  if (!trimmed) {
    return "journeyn";
  }

  return trimmed.replace(/^(title|titel)\s*:\s*/i, "").trim() || "journeyn";
}

function buildSuggestedStoryIdea(journey: Journey, missingStepIds: string[]): SuggestedStoryIdea {
  const focusStep = journey.steps.find((step) => missingStepIds.includes(step.id)) ?? journey.steps[0];
  const valueIntent = journey.desiredSupport?.find((item) => item.trim()) ?? focusStep?.desiredSupport ?? undefined;
  const expectedOutcome = journey.desiredFutureState?.trim() || journey.goal.trim() || undefined;
  const journeyLabel = cleanJourneyLabel(journey.title);

  return {
    title: `Stöd för ${journeyLabel}`,
    description: `Skapa bättre stöd för ${journey.primaryActor.trim() || "huvudaktören"} i ${journeyLabel}, särskilt där dagens friktion bromsar framdriften.`,
    valueIntent,
    expectedOutcome,
    basedOnJourneyIds: [journey.id],
    basedOnStepIds: missingStepIds,
    confidence: 0.62
  };
}

export function analyzeJourneyCoverage(input: AnalyzeJourneyCoverageInput): JourneyContext {
  const storyIdeasWithTokens = input.storyIdeas.map((storyIdea) => ({
    ...storyIdea,
    tokens: uniqueTokens([storyIdea.key, storyIdea.title, storyIdea.valueIntent, storyIdea.expectedBehavior])
  }));
  const epicTokensById = new Map<string, string[]>();

  for (const storyIdea of storyIdeasWithTokens) {
    if (!storyIdea.epicId) {
      continue;
    }

    const current = epicTokensById.get(storyIdea.epicId) ?? [];
    epicTokensById.set(storyIdea.epicId, [...new Set([...current, ...storyIdea.tokens])]);
  }

  const epicsWithTokens = input.epics.map((epic) => ({
    ...epic,
    tokens: uniqueTokens([epic.key, epic.title, epic.purpose, epic.scopeBoundary, ...(epicTokensById.get(epic.id) ?? [])])
  }));

  return {
    ...input.journeyContext,
    journeys: input.journeyContext.journeys.map((journey) => {
      const journeyTokens = toJourneySearchText(journey);
      const linkedEpicSet = new Set(journey.linkedEpicIds ?? []);
      const linkedStoryIdeaSet = new Set(journey.linkedStoryIdeaIds ?? []);
      const rankedEpics = epicsWithTokens
        .map((epic) => ({
          id: epic.id,
          score: scoreOverlap(journeyTokens, epic.tokens) + (linkedEpicSet.has(epic.id) ? 3 : 0)
        }))
        .filter((epic) => epic.score > 0)
        .sort((left, right) => right.score - left.score);
      const rankedStoryIdeas = storyIdeasWithTokens
        .map((storyIdea) => ({
          id: storyIdea.id,
          score: scoreOverlap(journeyTokens, storyIdea.tokens) + (linkedStoryIdeaSet.has(storyIdea.id) ? 3 : 0)
        }))
        .filter((storyIdea) => storyIdea.score > 0)
        .sort((left, right) => right.score - left.score);
      const missingSteps = journey.steps.filter((step) => {
        const stepTokens = uniqueTokens([step.title, step.actor, step.description, step.currentPain, step.desiredSupport]);
        const strongestStoryScore = storyIdeasWithTokens.reduce((best, storyIdea) => {
          return Math.max(best, scoreOverlap(stepTokens, storyIdea.tokens));
        }, 0);

        return strongestStoryScore < 2;
      });
      const topEpicIds = pickTopIds(rankedEpics, 3);
      const topStoryIdeaIds = pickTopIds(rankedStoryIdeas, 4);
      const bestEpicScore = rankedEpics[0]?.score ?? 0;
      const bestStoryScore = rankedStoryIdeas[0]?.score ?? 0;
      const coverageStatus = summarizeSupport(topStoryIdeaIds.length, bestStoryScore, bestEpicScore);
      const suggestedNewStoryIdeas =
        coverageStatus === "covered"
          ? []
          : [buildSuggestedStoryIdea(journey, missingSteps.map((step) => step.id))];

      return {
        ...journey,
        coverage: {
          status: coverageStatus,
          suggestedEpicIds: topEpicIds.length > 0 ? topEpicIds : undefined,
          suggestedStoryIdeaIds: topStoryIdeaIds.length > 0 ? topStoryIdeaIds : undefined,
          suggestedNewStoryIdeas: suggestedNewStoryIdeas.length > 0 ? suggestedNewStoryIdeas : undefined,
          notes:
            "AI-förslag baserat på journeytext, steg, nuvarande Story Ideas och tillhörande Epic-spår. Granska innan du accepterar."
        }
      };
    })
  };
}
