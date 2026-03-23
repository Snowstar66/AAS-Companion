import { z } from "zod";
import { membershipRoleSchema, tollgateEntityTypeSchema, tollgateStatusSchema, tollgateTypeSchema } from "./enums";

export const tollgateRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  entityType: tollgateEntityTypeSchema,
  entityId: z.string().min(1),
  tollgateType: tollgateTypeSchema,
  status: tollgateStatusSchema,
  blockers: z.array(z.string().min(1)).default([]),
  approverRoles: z.array(membershipRoleSchema).default([]),
  decidedBy: z.string().nullish(),
  decidedAt: z.date().nullish(),
  comments: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const tollgateUpsertInputSchema = tollgateRecordSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    actorId: z.string().nullish()
  });

export type TollgateRecord = z.infer<typeof tollgateRecordSchema>;
export type TollgateUpsertInput = z.infer<typeof tollgateUpsertInputSchema>;
