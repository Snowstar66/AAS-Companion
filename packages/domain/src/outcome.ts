import { z } from "zod";
import {
  aiAccelerationLevelSchema,
  governedObjectCreatedModeSchema,
  governedLifecycleStateSchema,
  governedObjectOriginTypeSchema,
  importedGovernedReadinessStateSchema,
  outcomeStatusSchema,
  riskProfileSchema
} from "./enums";
import { downstreamAiInstructionsSchema } from "./downstream-ai-instructions";
import { journeyContextCollectionSchema } from "./journey-context";
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
  framingVersion: z.number().int().positive().default(1),
  problemStatement: z.string().nullish(),
  outcomeStatement: z.string().nullish(),
  baselineDefinition: z.string().nullish(),
  baselineSource: z.string().nullish(),
  solutionContext: z.string().nullish(),
  solutionConstraints: z.string().nullish(),
  dataSensitivity: z.string().nullish(),
  journeyContexts: journeyContextCollectionSchema.nullish(),
  downstreamAiInstructions: downstreamAiInstructionsSchema.nullish(),
  deliveryType: z.enum(["AD", "AT", "AM"]).nullish(),
  aiUsageRole: z.enum(["support", "generation", "validation", "decision_support", "automation"]).nullish(),
  aiExecutionPattern: z.enum(["assisted", "step_by_step", "orchestrated"]).nullish(),
  aiUsageIntent: z.string().nullish(),
  businessImpactLevel: riskProfileSchema.nullish(),
  businessImpactRationale: z.string().nullish(),
  dataSensitivityLevel: riskProfileSchema.nullish(),
  dataSensitivityRationale: z.string().nullish(),
  blastRadiusLevel: riskProfileSchema.nullish(),
  blastRadiusRationale: z.string().nullish(),
  decisionImpactLevel: riskProfileSchema.nullish(),
  decisionImpactRationale: z.string().nullish(),
  aiLevelJustification: z.string().nullish(),
  riskAcceptedAt: z.date().nullish(),
  riskAcceptedByValueOwnerId: z.string().nullish(),
  timeframe: z.string().nullish(),
  valueOwnerId: z.string().nullish(),
  riskProfile: riskProfileSchema,
  aiAccelerationLevel: aiAccelerationLevelSchema,
  status: outcomeStatusSchema,
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

const outcomeCreateInputBaseSchema = outcomeRecordSchema
  .omit({
    id: true,
    framingVersion: true,
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

function normalizeOutcomeMergeValue(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function mergeOutcomeParagraphText(existingValue: string | null | undefined, importedValue: string | null | undefined) {
  const normalizedExisting = normalizeOutcomeMergeValue(existingValue);
  const normalizedImported = normalizeOutcomeMergeValue(importedValue);

  if (!normalizedExisting) {
    return normalizedImported;
  }

  if (!normalizedImported) {
    return normalizedExisting;
  }

  if (normalizedExisting === normalizedImported) {
    return normalizedExisting;
  }

  return `${normalizedExisting}\n\n${normalizedImported}`;
}

function mergeOutcomeLineText(existingValue: string | null | undefined, importedValue: string | null | undefined) {
  const mergedLines = [...new Set(
    [existingValue, importedValue]
      .flatMap((value) => (value ?? "").split(/\r?\n+/))
      .map((value) => value.trim())
      .filter(Boolean)
  )];

  return mergedLines.length > 0 ? mergedLines.join("\n") : null;
}

export function mergeImportedOutcomeIntoExistingOutcome(input: {
  existing: Pick<
    OutcomeRecord,
    | "title"
    | "problemStatement"
    | "outcomeStatement"
    | "baselineDefinition"
    | "baselineSource"
    | "timeframe"
  >;
  imported: {
    title?: string | null | undefined;
    problemStatement?: string | null | undefined;
    outcomeStatement?: string | null | undefined;
    baselineDefinition?: string | null | undefined;
    baselineSource?: string | null | undefined;
    timeframe?: string | null | undefined;
  };
}) {
  return {
    title: normalizeOutcomeMergeValue(input.imported.title) ?? normalizeOutcomeMergeValue(input.existing.title) ?? "",
    problemStatement: mergeOutcomeParagraphText(input.existing.problemStatement, input.imported.problemStatement),
    outcomeStatement: mergeOutcomeParagraphText(input.existing.outcomeStatement, input.imported.outcomeStatement),
    baselineDefinition: mergeOutcomeParagraphText(input.existing.baselineDefinition, input.imported.baselineDefinition),
    baselineSource: mergeOutcomeLineText(input.existing.baselineSource, input.imported.baselineSource),
    timeframe: mergeOutcomeLineText(input.existing.timeframe, input.imported.timeframe)
  };
}

type OutcomeBaselineFields = Pick<OutcomeRecord, "baselineDefinition" | "baselineSource" | "status">;
type OutcomeFramingFields = Pick<
  OutcomeRecord,
  | "title"
  | "outcomeStatement"
  | "baselineDefinition"
  | "valueOwnerId"
  | "riskProfile"
  | "aiAccelerationLevel"
  | "status"
  | "aiUsageRole"
  | "aiExecutionPattern"
  | "aiUsageIntent"
  | "businessImpactLevel"
  | "businessImpactRationale"
  | "dataSensitivityLevel"
  | "dataSensitivityRationale"
  | "blastRadiusLevel"
  | "blastRadiusRationale"
  | "decisionImpactLevel"
  | "decisionImpactRationale"
  | "aiLevelJustification"
  | "riskAcceptedAt"
  | "riskAcceptedByValueOwnerId"
> & {
  epicCount: number;
};

type RiskDimensionLevel = z.infer<typeof riskProfileSchema>;
export type AiExecutionPattern = NonNullable<OutcomeRecord["aiExecutionPattern"]>;

function getRiskWeight(level: RiskDimensionLevel) {
  if (level === "high") {
    return 3;
  }

  if (level === "medium") {
    return 2;
  }

  return 1;
}

function getHighestRiskProfile(levels: Array<RiskDimensionLevel | null | undefined>) {
  const presentLevels = levels.filter((level): level is RiskDimensionLevel => Boolean(level));
  const [firstLevel, ...remainingLevels] = presentLevels;

  if (!firstLevel) {
    return null;
  }

  return remainingLevels.reduce<RiskDimensionLevel>(
    (highest, current) => (getRiskWeight(current) > getRiskWeight(highest) ? current : highest),
    firstLevel
  );
}

export function deriveAiLevelFromExecutionPattern(pattern: AiExecutionPattern | null | undefined) {
  if (pattern === "assisted") {
    return "level_1" as const;
  }

  if (pattern === "step_by_step") {
    return "level_2" as const;
  }

  if (pattern === "orchestrated") {
    return "level_3" as const;
  }

  return null;
}

export function deriveExecutionPatternFromAiLevel(level: OutcomeRecord["aiAccelerationLevel"] | null | undefined) {
  if (level === "level_1") {
    return "assisted" as const;
  }

  if (level === "level_2") {
    return "step_by_step" as const;
  }

  if (level === "level_3") {
    return "orchestrated" as const;
  }

  return null;
}

export function deriveOutcomeRiskProfile(outcome: Pick<
  OutcomeRecord,
  "businessImpactLevel" | "dataSensitivityLevel" | "blastRadiusLevel" | "decisionImpactLevel"
>) {
  return getHighestRiskProfile([
    outcome.businessImpactLevel,
    outcome.dataSensitivityLevel,
    outcome.blastRadiusLevel,
    outcome.decisionImpactLevel
  ]);
}

export function getOutcomeAiAndRiskBlockers(outcome: Pick<
  OutcomeRecord,
  | "aiUsageRole"
  | "aiExecutionPattern"
  | "aiUsageIntent"
  | "businessImpactLevel"
  | "businessImpactRationale"
  | "dataSensitivityLevel"
  | "dataSensitivityRationale"
  | "blastRadiusLevel"
  | "blastRadiusRationale"
  | "decisionImpactLevel"
  | "decisionImpactRationale"
  | "riskProfile"
  | "aiAccelerationLevel"
  | "aiLevelJustification"
>) {
  const reasons: ReadinessBlockReason[] = [];
  const derivedRiskProfile = deriveOutcomeRiskProfile(outcome);
  const derivedAiLevel = deriveAiLevelFromExecutionPattern(outcome.aiExecutionPattern);

  if (!outcome.aiExecutionPattern) {
    reasons.push({
      code: "ai_execution_pattern_missing",
      message: "Missing AI execution pattern.",
      severity: "high"
    });
  }

  if (!outcome.aiUsageIntent?.trim()) {
    reasons.push({
      code: "ai_usage_intent_missing",
      message: "Missing AI usage across lifecycle.",
      severity: "high"
    });
  }

  if (!outcome.businessImpactLevel) {
    reasons.push({
      code: "business_impact_level_missing",
      message: "Missing business impact classification.",
      severity: "high"
    });
  }

  if (!outcome.businessImpactRationale?.trim()) {
    reasons.push({
      code: "business_impact_rationale_missing",
      message: "Missing business impact rationale.",
      severity: "medium"
    });
  }

  if (!outcome.dataSensitivityLevel) {
    reasons.push({
      code: "data_sensitivity_level_missing",
      message: "Missing data sensitivity classification.",
      severity: "high"
    });
  }

  if (!outcome.dataSensitivityRationale?.trim()) {
    reasons.push({
      code: "data_sensitivity_rationale_missing",
      message: "Missing data sensitivity rationale.",
      severity: "medium"
    });
  }

  if (!outcome.blastRadiusLevel) {
    reasons.push({
      code: "blast_radius_level_missing",
      message: "Missing blast radius classification.",
      severity: "high"
    });
  }

  if (!outcome.blastRadiusRationale?.trim()) {
    reasons.push({
      code: "blast_radius_rationale_missing",
      message: "Missing blast radius rationale.",
      severity: "medium"
    });
  }

  if (!outcome.decisionImpactLevel) {
    reasons.push({
      code: "decision_impact_level_missing",
      message: "Missing decision impact classification.",
      severity: "high"
    });
  }

  if (!outcome.decisionImpactRationale?.trim()) {
    reasons.push({
      code: "decision_impact_rationale_missing",
      message: "Missing decision impact rationale.",
      severity: "medium"
    });
  }

  if (!derivedRiskProfile) {
    reasons.push({
      code: "risk_profile_unresolved",
      message: "Risk profile cannot be determined until all four risk dimensions are classified.",
      severity: "high"
    });
  } else if (outcome.riskProfile !== derivedRiskProfile) {
    reasons.push({
      code: "risk_profile_mismatch",
      message: `Risk profile must match the highest classified dimension (${derivedRiskProfile}).`,
      severity: "high"
    });
  }

  if (derivedAiLevel && outcome.aiAccelerationLevel !== derivedAiLevel) {
    reasons.push({
      code: "ai_level_execution_pattern_mismatch",
      message: `Selected AI level does not match the declared execution pattern. This case maps to ${derivedAiLevel.replaceAll("_", " ")}.`,
      severity: "high"
    });
  }

  if (outcome.aiAccelerationLevel === "level_3" && !outcome.aiLevelJustification?.trim()) {
    reasons.push({
      code: "ai_level_justification_missing",
      message: "Level 3 requires explicit governance justification.",
      severity: "high"
    });
  }

  return reasons;
}

export function getOutcomeAiAndRiskWarnings(outcome: Pick<
  OutcomeRecord,
  | "aiExecutionPattern"
  | "businessImpactLevel"
  | "dataSensitivityLevel"
  | "blastRadiusLevel"
  | "decisionImpactLevel"
  | "aiAccelerationLevel"
>) {
  const warnings: string[] = [];
  const derivedRiskProfile = deriveOutcomeRiskProfile(outcome);

  if (derivedRiskProfile === "high" && outcome.aiAccelerationLevel === "level_2") {
    warnings.push("High risk with Level 2 requires structured human validation after each step and reproducible outputs.");
  }

  if (derivedRiskProfile === "high" && outcome.aiAccelerationLevel === "level_3") {
    warnings.push("High risk with Level 3 requires full traceability, logged orchestration and explicit human approval before autonomous decisions.");
  }

  if (derivedRiskProfile === "medium" && outcome.aiAccelerationLevel === "level_3") {
    warnings.push("Medium risk with Level 3 should have explicit orchestration boundaries, human supervision and clear traceability.");
  }

  if (outcome.decisionImpactLevel === "high" && outcome.aiAccelerationLevel !== "level_1") {
    warnings.push("Human decision authority must stay explicit when AI influences or automates high-impact decisions.");
  }

  if (outcome.aiExecutionPattern === "orchestrated") {
    warnings.push("Orchestrated agentic delivery requires logs and step traceability across the full execution chain.");
  }

  return [...new Set(warnings)];
}

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

export function getOutcomeFramingReadiness(outcome: OutcomeFramingFields) {
  const reasons: ReadinessBlockReason[] = [];

  if (!outcome.title?.trim()) {
    reasons.push({
      code: "outcome_title_missing",
      message: "Outcome title is missing.",
      severity: "high"
    });
  }

  if (!outcome.outcomeStatement?.trim()) {
    reasons.push({
      code: "outcome_statement_missing",
      message: "Outcome statement is missing.",
      severity: "high"
    });
  }

  if (!outcome.baselineDefinition?.trim()) {
    reasons.push({
      code: "baseline_missing",
      message: "Baseline is missing.",
      severity: "high"
    });
  }

  if (!outcome.valueOwnerId?.trim()) {
    reasons.push({
      code: "value_owner_missing",
      message: "Value owner is missing.",
      severity: "high"
    });
  }

  reasons.push(...getOutcomeAiAndRiskBlockers(outcome));

  if (outcome.epicCount < 1) {
    reasons.push({
      code: "epic_direction_missing",
      message: "At least one Epic direction is required.",
      severity: "high"
    });
  }

  return createReadinessAssessment({
    reasons,
    isReadyForProgression: outcome.status === "ready_for_tg1"
  });
}

export function getOutcomeFramingBlockers(outcome: OutcomeFramingFields) {
  return getOutcomeFramingReadiness(outcome).reasons.map((reason) => reason.message);
}

export function isOutcomeFramingReadyForTollgate(outcome: OutcomeFramingFields) {
  return getOutcomeFramingReadiness(outcome).state === "ready";
}
