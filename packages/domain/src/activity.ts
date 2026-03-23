import { z } from "zod";
import { activityEntityTypeSchema, activityEventTypeSchema } from "./enums";

export const activityEventRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  entityType: activityEntityTypeSchema,
  entityId: z.string().min(1),
  eventType: activityEventTypeSchema,
  actorId: z.string().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  createdAt: z.date()
});

export const activityEventCreateInputSchema = activityEventRecordSchema.omit({
  id: true,
  createdAt: true
});

export type ActivityEventRecord = z.infer<typeof activityEventRecordSchema>;
export type ActivityEventCreateInput = z.infer<typeof activityEventCreateInputSchema>;
