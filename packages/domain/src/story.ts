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
  uxSketchName: z.string().nullish(),
  uxSketchContentType: z.string().nullish(),
  uxSketchDataUrl: z.string().nullish(),
  uxSketches: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        contentType: z.string().min(1),
        dataUrl: z.string().min(1)
      })
    )
    .nullish(),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
  aiUsageScope: z.array(z.string().min(1)).default([]),
  aiAccelerationLevel: aiAccelerationLevelSchema,
  testDefinition: z.string().nullish(),
  definitionOfDone: z.array(z.string().min(1)).default([]),
  sourceDirectionSeedId: z.string().nullish(),
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
  "key" | "outcomeId" | "epicId" | "testDefinition" | "definitionOfDone" | "acceptanceCriteria" | "status"
>;

type StoryValueSpineFields = Pick<StoryRecord, "outcomeId" | "epicId" | "acceptanceCriteria" | "testDefinition">;

export function validateStoryAgainstValueSpine(story: StoryValueSpineFields) {
  const reasons: ReadinessBlockReason[] = [];

  if (!story.outcomeId?.trim()) {
    reasons.push({
      code: "outcome_link_missing",
      message: "Outcome link is required for Value Spine traceability.",
      severity: "high"
    });
  }

  if (!story.epicId?.trim()) {
    reasons.push({
      code: "epic_link_missing",
      message: "Epic link is required for Value Spine traceability.",
      severity: "high"
    });
  }

  if (!story.acceptanceCriteria.length) {
    reasons.push({
      code: "acceptance_criteria_missing",
      message: "At least one acceptance criterion is required.",
      severity: "high"
    });
  }

  if (!story.testDefinition?.trim()) {
    reasons.push({
      code: "test_definition_missing",
      message: "Test Definition is required before build progression.",
      severity: "high"
    });
  }

  return createReadinessAssessment({
    reasons,
    isReadyForProgression: reasons.length === 0
  });
}

export function getStoryHandoffReadiness(story: StoryReadinessFields) {
  const reasons = [...validateStoryAgainstValueSpine(story).reasons];

  if (!story.key?.trim()) {
    reasons.push({
      code: "story_key_missing",
      message: "Story-ID is missing.",
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

  return createReadinessAssessment({
    reasons,
    isReadyForProgression: story.status === "ready_for_handoff"
  });
}

export function getStoryValueSpineBlockers(story: StoryValueSpineFields) {
  return validateStoryAgainstValueSpine(story).reasons.map((reason) => reason.message);
}

export function isStoryValidAgainstValueSpine(story: StoryValueSpineFields) {
  return validateStoryAgainstValueSpine(story).state === "ready";
}

export function getStoryReadinessBlockers(story: StoryReadinessFields) {
  return getStoryHandoffReadiness(story).reasons.map((reason) => reason.message);
}

export function isStoryReadyForHandoff(story: StoryReadinessFields) {
  return getStoryHandoffReadiness(story).state === "ready";
}
