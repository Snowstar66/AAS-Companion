import { z } from "zod";
import {
  aiAccelerationLevelSchema,
  governedObjectCreatedModeSchema,
  governedLifecycleStateSchema,
  governedObjectOriginTypeSchema,
  importedGovernedReadinessStateSchema,
  storyStatusSchema,
  storyTypeSchema
} from "./enums";
import {
  createReadinessAssessment,
  governedLineageReferenceSchema,
  governedObjectProvenanceInputSchema,
  type ReadinessBlockReason
} from "./governed-object";

export const storyRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  outcomeId: z.string().min(1),
  epicId: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  storyType: storyTypeSchema,
  valueIntent: z.string().min(1),
  expectedBehavior: z.string().nullish(),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
  aiUsageScope: z.array(z.string().min(1)).default([]),
  aiAccelerationLevel: aiAccelerationLevelSchema,
  testDefinition: z.string().nullish(),
  definitionOfDone: z.array(z.string().min(1)).default([]),
  status: storyStatusSchema,
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

const storyCreateInputBaseSchema = storyRecordSchema
  .omit({
    id: true,
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

export const storyCreateInputSchema = storyCreateInputBaseSchema.superRefine((value, context) => {
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

export const storyUpdateInputSchema = storyCreateInputBaseSchema
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

export type StoryRecord = z.infer<typeof storyRecordSchema>;
export type StoryCreateInput = z.infer<typeof storyCreateInputSchema>;
export type StoryUpdateInput = z.infer<typeof storyUpdateInputSchema>;

type StoryReadinessFields = Pick<
  StoryRecord,
  "key" | "testDefinition" | "definitionOfDone" | "acceptanceCriteria" | "status"
>;

export function getStoryHandoffReadiness(story: StoryReadinessFields) {
  const reasons: ReadinessBlockReason[] = [];

  if (!story.key?.trim()) {
    reasons.push({
      code: "story_key_missing",
      message: "Story-ID is missing.",
      severity: "high"
    });
  }

  if (!story.testDefinition?.trim()) {
    reasons.push({
      code: "test_definition_missing",
      message: "Test Definition is required before handoff.",
      severity: "high"
    });
  }

  if (!story.definitionOfDone.length) {
    reasons.push({
      code: "definition_of_done_missing",
      message: "Definition of Done is required before handoff.",
      severity: "medium"
    });
  }

  if (!story.acceptanceCriteria.length) {
    reasons.push({
      code: "acceptance_criteria_missing",
      message: "At least one acceptance criterion is required.",
      severity: "high"
    });
  }

  return createReadinessAssessment({
    reasons,
    isReadyForProgression: story.status === "ready_for_handoff"
  });
}

export function getStoryReadinessBlockers(story: StoryReadinessFields) {
  return getStoryHandoffReadiness(story).reasons.map((reason) => reason.message);
}

export function isStoryReadyForHandoff(story: StoryReadinessFields) {
  return getStoryHandoffReadiness(story).state === "ready";
}
