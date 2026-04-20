import type { Journey, JourneyContext, JourneyStep } from "@/lib/framing/journeyContextTypes";

export type JourneyReferenceOption = {
  id: string;
  label: string;
};

export type JourneyStepValidation = {
  title: string | undefined;
  description: string | undefined;
};

export type JourneyValidation = {
  title: string | undefined;
  primaryActor: string | undefined;
  goal: string | undefined;
  trigger: string | undefined;
  stepsSummary: string | undefined;
  steps: Record<string, JourneyStepValidation>;
  linkErrors: string[];
};

export type JourneyContextValidation = {
  journeysSummary: string | undefined;
  journeys: Record<string, JourneyValidation>;
};

export type JourneyContextCounts = {
  contextCount: number;
  journeyCount: number;
  uncoveredJourneyCount: number;
  suggestedStoryIdeaCount: number;
};

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function validateJourneyStep(step: JourneyStep): JourneyStepValidation {
  return {
    title: hasText(step.title) ? undefined : "Step title is required.",
    description: hasText(step.description) ? undefined : "Step description is required."
  };
}

function missingReferences(ids: string[] | undefined, options: JourneyReferenceOption[]) {
  if (!ids || ids.length === 0) {
    return [];
  }

  const knownIds = new Set(options.map((option) => option.id));
  return ids.filter((id) => !knownIds.has(id));
}

export function validateJourney(
  journey: Journey,
  references: {
    epics: JourneyReferenceOption[];
    storyIdeas: JourneyReferenceOption[];
    figmaRefs: JourneyReferenceOption[];
  }
): JourneyValidation {
  const steps = Object.fromEntries(
    journey.steps.map((step) => [step.id, validateJourneyStep(step)] as const)
  );
  const linkErrors: string[] = [];
  const missingEpicIds = missingReferences(journey.linkedEpicIds, references.epics);
  const missingStoryIdeaIds = missingReferences(journey.linkedStoryIdeaIds, references.storyIdeas);
  const missingFigmaRefs = missingReferences(journey.linkedFigmaRefs, references.figmaRefs);

  if (missingEpicIds.length > 0) {
    linkErrors.push(`Linked Epic references are missing: ${missingEpicIds.join(", ")}.`);
  }

  if (missingStoryIdeaIds.length > 0) {
    linkErrors.push(`Linked Story Idea references are missing: ${missingStoryIdeaIds.join(", ")}.`);
  }

  if (missingFigmaRefs.length > 0) {
    linkErrors.push(`Linked Figma references are missing: ${missingFigmaRefs.join(", ")}.`);
  }

  return {
    title: hasText(journey.title) ? undefined : "Journey title is required.",
    primaryActor: hasText(journey.primaryActor) ? undefined : "Primary Actor is required.",
    goal: hasText(journey.goal) ? undefined : "Goal is required.",
    trigger: hasText(journey.trigger) ? undefined : "Trigger is required.",
    stepsSummary:
      journey.steps.length > 0 ? undefined : "No detailed Steps added yet. That is okay unless you want finer-grained coverage analysis.",
    steps,
    linkErrors
  };
}

export function validateJourneyContext(
  context: JourneyContext,
  references: {
    epics: JourneyReferenceOption[];
    storyIdeas: JourneyReferenceOption[];
    figmaRefs: JourneyReferenceOption[];
  }
): JourneyContextValidation {
  return {
    journeysSummary: context.journeys.length > 0 ? undefined : "Add at least one Journey to this Journey Context.",
    journeys: Object.fromEntries(
      context.journeys.map((journey) => [journey.id, validateJourney(journey, references)] as const)
    )
  };
}

export function journeyContextHasBlockingValidation(validation: JourneyContextValidation | undefined) {
  if (!validation) {
    return false;
  }

  if (validation.journeysSummary) {
    return true;
  }

  return Object.values(validation.journeys).some(
    (journey) =>
      Boolean(journey.title || journey.primaryActor || journey.goal || journey.trigger) ||
      Object.values(journey.steps).some((step) => Boolean(step.title || step.description))
  );
}

export function getJourneyContextCounts(contexts: JourneyContext[]): JourneyContextCounts {
  return contexts.reduce<JourneyContextCounts>(
    (counts, context) => {
      const journeys = context.journeys;
      const uncoveredJourneyCount = journeys.filter((journey) => journey.coverage?.status === "uncovered").length;
      const suggestedStoryIdeaCount = journeys.reduce((sum, journey) => {
        return sum + (journey.coverage?.suggestedNewStoryIdeas?.length ?? 0);
      }, 0);

      return {
        contextCount: counts.contextCount + 1,
        journeyCount: counts.journeyCount + journeys.length,
        uncoveredJourneyCount: counts.uncoveredJourneyCount + uncoveredJourneyCount,
        suggestedStoryIdeaCount: counts.suggestedStoryIdeaCount + suggestedStoryIdeaCount
      };
    },
    {
      contextCount: 0,
      journeyCount: 0,
      uncoveredJourneyCount: 0,
      suggestedStoryIdeaCount: 0
    }
  );
}

export function getCoverageSummaryLabel(context: JourneyContext) {
  const journeysWithCoverage = context.journeys.filter((journey) => journey.coverage);

  if (journeysWithCoverage.length === 0) {
    return "No coverage analysis yet";
  }

  const uncovered = journeysWithCoverage.filter((journey) => journey.coverage?.status === "uncovered").length;
  const partial = journeysWithCoverage.filter((journey) => journey.coverage?.status === "partially_covered").length;
  const covered = journeysWithCoverage.filter((journey) => journey.coverage?.status === "covered").length;

  return `${covered} covered, ${partial} partial, ${uncovered} uncovered`;
}
