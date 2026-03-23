import { z } from "zod";
import { aiAccelerationLevelSchema, outcomeStatusSchema, riskProfileSchema } from "./enums";

export const outcomeRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  problemStatement: z.string().nullish(),
  outcomeStatement: z.string().nullish(),
  baselineDefinition: z.string().nullish(),
  baselineSource: z.string().nullish(),
  timeframe: z.string().nullish(),
  valueOwnerId: z.string().nullish(),
  riskProfile: riskProfileSchema,
  aiAccelerationLevel: aiAccelerationLevelSchema,
  status: outcomeStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

export const outcomeCreateInputSchema = outcomeRecordSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    actorId: z.string().nullish()
  });

export const outcomeUpdateInputSchema = outcomeCreateInputSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    id: z.string().min(1),
    actorId: z.string().nullish()
  });

export type OutcomeRecord = z.infer<typeof outcomeRecordSchema>;
export type OutcomeCreateInput = z.infer<typeof outcomeCreateInputSchema>;
export type OutcomeUpdateInput = z.infer<typeof outcomeUpdateInputSchema>;
