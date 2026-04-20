import { z } from "zod";

export const journeyInitiativeTypeSchema = z.enum(["AD", "AT", "AM"]);
export const journeyTypeSchema = z.enum(["business", "user", "operational", "support", "transformation"]);
export const journeyCoverageStatusSchema = z.enum(["unanalysed", "covered", "partially_covered", "uncovered"]);

export const suggestedStoryIdeaSchema = z.object({
  title: z.string(),
  description: z.string(),
  valueIntent: z.string().optional(),
  expectedOutcome: z.string().optional(),
  basedOnJourneyIds: z.array(z.string()).optional(),
  basedOnStepIds: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional()
});

export const journeyCoverageSchema = z.object({
  status: journeyCoverageStatusSchema,
  suggestedEpicIds: z.array(z.string()).optional(),
  suggestedStoryIdeaIds: z.array(z.string()).optional(),
  suggestedNewStoryIdeas: z.array(suggestedStoryIdeaSchema).optional(),
  notes: z.string().optional()
});

export const journeyStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  actor: z.string().optional(),
  description: z.string(),
  currentPain: z.string().optional(),
  desiredSupport: z.string().optional(),
  decisionPoint: z.boolean().optional()
});

export const journeySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: journeyTypeSchema.optional(),
  primaryActor: z.string(),
  supportingActors: z.array(z.string()).optional(),
  goal: z.string(),
  trigger: z.string(),
  currentState: z.string().optional(),
  desiredFutureState: z.string().optional(),
  steps: z.array(journeyStepSchema),
  painPoints: z.array(z.string()).optional(),
  desiredSupport: z.array(z.string()).optional(),
  exceptions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  linkedEpicIds: z.array(z.string()).optional(),
  linkedStoryIdeaIds: z.array(z.string()).optional(),
  linkedFigmaRefs: z.array(z.string()).optional(),
  coverage: journeyCoverageSchema.optional()
});

export const journeyContextSchema = z.object({
  id: z.string(),
  outcomeId: z.string(),
  initiativeType: journeyInitiativeTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  journeys: z.array(journeySchema),
  notes: z.string().optional()
});

export const journeyContextCollectionSchema = z.array(journeyContextSchema);

export type JourneyInitiativeType = z.infer<typeof journeyInitiativeTypeSchema>;
export type JourneyType = z.infer<typeof journeyTypeSchema>;
export type JourneyCoverageStatus = z.infer<typeof journeyCoverageStatusSchema>;
export type SuggestedStoryIdea = z.infer<typeof suggestedStoryIdeaSchema>;
export type JourneyCoverage = z.infer<typeof journeyCoverageSchema>;
export type JourneyStep = z.infer<typeof journeyStepSchema>;
export type Journey = z.infer<typeof journeySchema>;
export type JourneyContext = z.infer<typeof journeyContextSchema>;

export function parseJourneyContexts(value: unknown): JourneyContext[] {
  const parsed = journeyContextCollectionSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}
