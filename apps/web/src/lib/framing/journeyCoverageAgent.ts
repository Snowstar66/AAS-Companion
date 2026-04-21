import { analyzeJourneyCoverage } from "@aas-companion/domain";
import type { CoverageAnalysisResult } from "@/lib/framing/agentStructuredOutputs";
import {
  buildFramingAgentSuggestionId,
  type FramingAgentSourceOfTruth,
  type FramingAgentSuggestion,
  type FramingAgentToolTrace
} from "@/lib/framing/agentTypes";

type JourneyCoverageAgentResult = {
  coverageResults: CoverageAnalysisResult[];
  suggestions: FramingAgentSuggestion[];
  warnings: string[];
  toolTrace: FramingAgentToolTrace[];
};

function buildCoverageNotes(baseNotes: string | undefined, inheritedNotes: string[]) {
  return [baseNotes?.trim(), ...inheritedNotes].filter(Boolean).join(" ");
}

export function runJourneyCoverageAgent(input: {
  source: FramingAgentSourceOfTruth;
  journeyContextId?: string | null;
}): JourneyCoverageAgentResult {
  const matchingContexts = input.journeyContextId
    ? input.source.journeyContexts.filter((context) => context.id === input.journeyContextId)
    : input.source.journeyContexts;

  if (matchingContexts.length === 0) {
    return {
      coverageResults: [],
      suggestions: [],
      warnings: ["Journey Context exists in this flow only if one or more Journey Context items are captured first."],
      toolTrace: [
        {
          tool: "analyzeJourneyCoverage",
          summary: "No Journey Context was available for coverage analysis."
        }
      ]
    };
  }

  const coverageResults: CoverageAnalysisResult[] = [];
  const suggestions: FramingAgentSuggestion[] = [];
  const warnings: string[] = [];
  const inheritedNotes = [
    input.source.outcome.structuredConstraints.uxPrinciples
      ? "Keep UX principles inherited when reviewing coverage."
      : "",
    input.source.outcome.structuredConstraints.nonFunctionalRequirements
      ? "Keep non-functional requirements inherited when reviewing coverage."
      : "",
    input.source.outcome.dataSensitivity
      ? `Data sensitivity remains active: ${input.source.outcome.dataSensitivity}.`
      : ""
  ].filter(Boolean);

  for (const context of matchingContexts) {
    const analyzedContext = analyzeJourneyCoverage({
      journeyContext: context,
      epics: input.source.epics.map((epic) => ({
        id: epic.id,
        key: epic.key,
        title: epic.title,
        purpose: epic.purpose,
        scopeBoundary: epic.scopeBoundary
      })),
      storyIdeas: input.source.storyIdeas.map((storyIdea) => ({
        id: storyIdea.id,
        key: storyIdea.key,
        title: storyIdea.title,
        valueIntent: storyIdea.shortDescription,
        expectedBehavior: storyIdea.expectedBehavior,
        epicId: storyIdea.epicId
      }))
    });

    for (const journey of analyzedContext.journeys) {
      const coverage = journey.coverage;

      if (!coverage || coverage.status === "unanalysed") {
        warnings.push(`Journey "${journey.title || journey.id}" remains unanalysed.`);
        continue;
      }

      const nextCoverage = {
        ...coverage,
        notes: buildCoverageNotes(coverage.notes, inheritedNotes)
      };

      coverageResults.push({
        journeyId: journey.id,
        status: nextCoverage.status === "covered" || nextCoverage.status === "partially_covered" || nextCoverage.status === "uncovered"
          ? nextCoverage.status
          : "uncovered",
        suggestedEpicIds: nextCoverage.suggestedEpicIds ?? [],
        suggestedStoryIdeaIds: nextCoverage.suggestedStoryIdeaIds ?? [],
        suggestedNewStoryIdeas: nextCoverage.suggestedNewStoryIdeas ?? [],
        notes: nextCoverage.notes
      });

      suggestions.push({
        id: buildFramingAgentSuggestionId(["coverage", context.id, journey.id, nextCoverage.status]),
        kind: "apply_journey_coverage",
        title: `Använd täckningsanalys för ${journey.title || journey.id}`,
        description: "AI-förslag baserade på journeyn, dess steg, Epics, Story Ideas och ärvda ramar. Granska innan du accepterar.",
        contextId: context.id,
        journeyId: journey.id,
        coverage: nextCoverage,
        confidence:
          nextCoverage.status === "covered" ? 0.84 : nextCoverage.status === "partially_covered" ? 0.68 : 0.56
      });

      for (const epicId of nextCoverage.suggestedEpicIds ?? []) {
        suggestions.push({
          id: buildFramingAgentSuggestionId(["link-epic", context.id, journey.id, epicId]),
          kind: "link_epic_to_journey",
          title: `Koppla trolig Epic till ${journey.title || journey.id}`,
          description: "AI-förslag: den här Epicen ser relevant ut för journeyresultatet.",
          contextId: context.id,
          journeyId: journey.id,
          epicId
        });
      }

      for (const storyIdeaId of nextCoverage.suggestedStoryIdeaIds ?? []) {
        suggestions.push({
          id: buildFramingAgentSuggestionId(["link-story", context.id, journey.id, storyIdeaId]),
          kind: "link_story_idea_to_journey",
          title: `Koppla trolig Story Idea till ${journey.title || journey.id}`,
          description: "AI-förslag: den här Story Idean ser relevant ut för journeyresultatet.",
          contextId: context.id,
          journeyId: journey.id,
          storyIdeaId
        });
      }

      for (const storyIdea of nextCoverage.suggestedNewStoryIdeas ?? []) {
        suggestions.push({
          id: buildFramingAgentSuggestionId(["story-idea-candidate", journey.id, storyIdea.title]),
          kind: "story_idea_candidate",
          title: `Skapa föreslagen Story Idea: ${storyIdea.title}`,
          description: storyIdea.description,
          storyIdea,
          confidence: storyIdea.confidence ?? null
        });
      }
    }
  }

  return {
    coverageResults,
    suggestions,
    warnings: [...new Set(warnings)],
    toolTrace: [
      {
        tool: "analyzeJourneyCoverage",
        summary: `Analyserade ${matchingContexts.length} Journey Context-ytor och tog fram ${coverageResults.length} täckningsresultat.`
      }
    ]
  };
}
