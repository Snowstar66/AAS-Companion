import { z } from "zod";
import {
  aiAccelerationLevelSchema,
  governedObjectCreatedModeSchema,
  governedObjectOriginTypeSchema,
  importedGovernedReadinessStateSchema,
  outcomeStatusSchema,
  riskProfileSchema
} from "./enums";
import {
  createReadinessAssessment,
  governedLineageReferenceSchema,
  governedObjectProvenanceInputSchema,
  type ReadinessBlockReason
} from "./governed-object";

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
  originType: governedObjectOriginTypeSchema,
  createdMode: governedObjectCreatedModeSchema,
  lineageReference: governedLineageReferenceSchema.nullish(),
  importedReadinessState: importedGovernedReadinessStateSchema.nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const outcomeCreateInputBaseSchema = outcomeRecordSchema
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

export const outcomeCreateInputSchema = outcomeCreateInputBaseSchema.superRefine((value, context) => {
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

export const outcomeUpdateInputSchema = outcomeCreateInputBaseSchema
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

export type OutcomeRecord = z.infer<typeof outcomeRecordSchema>;
export type OutcomeCreateInput = z.infer<typeof outcomeCreateInputSchema>;
export type OutcomeUpdateInput = z.infer<typeof outcomeUpdateInputSchema>;

type OutcomeBaselineFields = Pick<OutcomeRecord, "baselineDefinition" | "baselineSource" | "status">;

export function getOutcomeBaselineReadiness(outcome: OutcomeBaselineFields) {
  const reasons: ReadinessBlockReason[] = [];

  if (!outcome.baselineDefinition?.trim()) {
    reasons.push({
      code: "baseline_definition_missing",
      message: "Baseline definition is missing.",
      severity: "high"
    });
  }

  if (!outcome.baselineSource?.trim()) {
    reasons.push({
      code: "baseline_source_missing",
      message: "Baseline source is missing.",
      severity: "high"
    });
  }

  return createReadinessAssessment({
    reasons,
    isReadyForProgression: outcome.status === "ready_for_tg1"
  });
}

export function getOutcomeBaselineBlockers(outcome: OutcomeBaselineFields) {
  return getOutcomeBaselineReadiness(outcome).reasons.map((reason) => reason.message);
}

export function isOutcomeReadyForTollgateOne(outcome: OutcomeBaselineFields) {
  return getOutcomeBaselineReadiness(outcome).state === "ready";
}
