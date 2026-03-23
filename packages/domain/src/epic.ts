import { z } from "zod";
import {
  epicStatusSchema,
  governedObjectCreatedModeSchema,
  governedObjectOriginTypeSchema,
  importedGovernedReadinessStateSchema
} from "./enums";
import { governedLineageReferenceSchema } from "./governed-object";

export const epicRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  outcomeId: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  purpose: z.string().min(1),
  status: epicStatusSchema,
  originType: governedObjectOriginTypeSchema,
  createdMode: governedObjectCreatedModeSchema,
  lineageReference: governedLineageReferenceSchema.nullish(),
  importedReadinessState: importedGovernedReadinessStateSchema.nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const epicCreateInputSchema = epicRecordSchema
  .omit({
    id: true,
    originType: true,
    createdMode: true,
    lineageReference: true,
    importedReadinessState: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    originType: governedObjectOriginTypeSchema.optional(),
    createdMode: governedObjectCreatedModeSchema.optional(),
    lineageReference: governedLineageReferenceSchema.nullish(),
    importedReadinessState: importedGovernedReadinessStateSchema.nullish(),
    actorId: z.string().nullish()
  });

export type EpicRecord = z.infer<typeof epicRecordSchema>;
export type EpicCreateInput = z.infer<typeof epicCreateInputSchema>;
