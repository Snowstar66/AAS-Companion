import { z } from "zod";
import { aiAccelerationLevelSchema, storyStatusSchema, storyTypeSchema } from "./enums";

export const storyRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  outcomeId: z.string().min(1),
  epicId: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  storyType: storyTypeSchema,
  valueIntent: z.string().min(1),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
  aiUsageScope: z.array(z.string().min(1)).default([]),
  aiAccelerationLevel: aiAccelerationLevelSchema,
  testDefinition: z.string().nullish(),
  definitionOfDone: z.array(z.string().min(1)).default([]),
  status: storyStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

export const storyCreateInputSchema = storyRecordSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    actorId: z.string().nullish()
  });

export const storyUpdateInputSchema = storyCreateInputSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    id: z.string().min(1),
    actorId: z.string().nullish()
  });

export type StoryRecord = z.infer<typeof storyRecordSchema>;
export type StoryCreateInput = z.infer<typeof storyCreateInputSchema>;
export type StoryUpdateInput = z.infer<typeof storyUpdateInputSchema>;
