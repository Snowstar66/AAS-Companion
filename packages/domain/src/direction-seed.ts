import { z } from "zod";
import {
  governedObjectCreatedModeSchema,
  governedLifecycleStateSchema,
  governedObjectOriginTypeSchema,
  importedGovernedReadinessStateSchema
} from "./enums";
import { governedLineageReferenceSchema, governedObjectProvenanceInputSchema } from "./governed-object";

export const directionSeedRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  outcomeId: z.string().min(1),
  epicId: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  expectedBehavior: z.string().nullish(),
  sourceStoryId: z.string().nullish(),
  originType: governedObjectOriginTypeSchema,
  createdMode: governedObjectCreatedModeSchema,
  lifecycleState: governedLifecycleStateSchema,
  archivedAt: z.date().nullish(),
  archiveReason: z.string().nullish(),
  lineageReference: governedLineageReferenceSchema.nullish(),
  importedReadinessState: importedGovernedReadinessStateSchema.nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const directionSeedCreateInputBaseSchema = directionSeedRecordSchema
  .omit({
    id: true,
    sourceStoryId: true,
    originType: true,
    createdMode: true,
    lifecycleState: true,
    archivedAt: true,
    archiveReason: true,
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

export const directionSeedCreateInputSchema = directionSeedCreateInputBaseSchema.superRefine((value, context) => {
  const parsed = governedObjectProvenanceInputSchema.safeParse({
    originType: value.originType,
    createdMode: value.createdMode,
    lineageReference: value.lineageReference
  });

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      context.addIssue(issue);
    }
  }
});

export const directionSeedUpdateInputSchema = directionSeedCreateInputBaseSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    id: z.string().min(1),
    actorId: z.string().nullish()
  })
  .superRefine((value, context) => {
    const parsed = governedObjectProvenanceInputSchema.safeParse({
      originType: value.originType,
      createdMode: value.createdMode,
      lineageReference: value.lineageReference
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        context.addIssue(issue);
      }
    }
  });

export type DirectionSeedRecord = z.infer<typeof directionSeedRecordSchema>;
export type DirectionSeedCreateInput = z.infer<typeof directionSeedCreateInputSchema>;
export type DirectionSeedUpdateInput = z.infer<typeof directionSeedUpdateInputSchema>;
