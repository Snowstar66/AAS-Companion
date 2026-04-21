import type { Journey, JourneyContext, JourneyStep } from "@/lib/framing/journeyContextTypes";

export type JourneyReferenceOption = {
  id: string;
  label: string;
  description?: string;
  valueIntent?: string;
  expectedBehavior?: string;
  purpose?: string;
  scopeBoundary?: string;
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

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function validateJourneyStep(step: JourneyStep): JourneyStepValidation {
  return {
    title: hasText(step.title) ? undefined : "Stegtitel krävs.",
    description: hasText(step.description) ? undefined : "Stegbeskrivning krävs."
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
  const steps = Object.fromEntries(journey.steps.map((step) => [step.id, validateJourneyStep(step)] as const));
  const linkErrors: string[] = [];
  const missingEpicIds = missingReferences(journey.linkedEpicIds, references.epics);
  const missingStoryIdeaIds = missingReferences(journey.linkedStoryIdeaIds, references.storyIdeas);
  const missingFigmaRefs = missingReferences(journey.linkedFigmaRefs, references.figmaRefs);

  if (missingEpicIds.length > 0) {
    linkErrors.push(`Länkade Epic-referenser saknas: ${missingEpicIds.join(", ")}.`);
  }

  if (missingStoryIdeaIds.length > 0) {
    linkErrors.push(`Länkade Story Idea-referenser saknas: ${missingStoryIdeaIds.join(", ")}.`);
  }

  if (missingFigmaRefs.length > 0) {
    linkErrors.push(`Länkade Figma-referenser saknas: ${missingFigmaRefs.join(", ")}.`);
  }

  return {
    title: hasText(journey.title) ? undefined : "Journey-titel krävs.",
    primaryActor: hasText(journey.primaryActor) ? undefined : "Huvudaktör krävs.",
    goal: hasText(journey.goal) ? undefined : "Mål krävs.",
    trigger: hasText(journey.trigger) ? undefined : "Trigger krävs.",
    stepsSummary:
      journey.steps.length > 0 ? undefined : "Inga steg tillagda ännu. Det är okej om du inte behöver mer detaljerad täckningsanalys.",
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
    journeysSummary: context.journeys.length > 0 ? undefined : "Lägg till minst en Journey här.",
    journeys: Object.fromEntries(context.journeys.map((journey) => [journey.id, validateJourney(journey, references)] as const))
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

export function getCoverageSummaryLabel(context: JourneyContext, language: "en" | "sv" = "sv") {
  const journeysWithCoverage = context.journeys.filter((journey) => journey.coverage);

  if (journeysWithCoverage.length === 0) {
    return t(language, "No coverage analysis yet", "Ingen täckningsanalys ännu");
  }

  const uncovered = journeysWithCoverage.filter((journey) => journey.coverage?.status === "uncovered").length;
  const partial = journeysWithCoverage.filter((journey) => journey.coverage?.status === "partially_covered").length;
  const covered = journeysWithCoverage.filter((journey) => journey.coverage?.status === "covered").length;

  return language === "sv"
    ? `${covered} täckta, ${partial} delvis täckta, ${uncovered} otäckta`
    : `${covered} covered, ${partial} partially covered, ${uncovered} uncovered`;
}
