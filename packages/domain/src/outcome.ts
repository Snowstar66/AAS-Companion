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
  solutionContext: z.string().nullish(),
  solutionConstraints: z.string().nullish(),
  dataSensitivity: z.string().nullish(),
  deliveryType: z.enum(["AD", "AT", "AM"]).nullish(),
  aiUsageRole: z.enum(["support", "generation", "validation", "decision_support", "automation"]).nullish(),
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

function getMaxAiLevelForRisk(riskProfile: RiskDimensionLevel) {
  if (riskProfile === "low") {
    return "level_1";
  }

  if (riskProfile === "medium") {
    return "level_2";
  }

  return "level_3";
}

function isAiLevelAllowedForRisk(aiLevel: OutcomeRecord["aiAccelerationLevel"], riskProfile: RiskDimensionLevel) {
  return getRiskWeight(riskProfile) >= getRiskWeight(
    aiLevel === "level_3" ? "high" : aiLevel === "level_2" ? "medium" : "low"
  );
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
  | "valueOwnerId"
  | "riskAcceptedAt"
  | "riskAcceptedByValueOwnerId"
>) {
  const reasons: ReadinessBlockReason[] = [];
  const derivedRiskProfile = deriveOutcomeRiskProfile(outcome);

  if (!outcome.aiUsageRole) {
    reasons.push({
      code: "ai_usage_role_missing",
      message: "Missing AI usage role.",
      severity: "high"
    });
  }

  if (!outcome.aiUsageIntent?.trim()) {
    reasons.push({
      code: "ai_usage_intent_missing",
      message: "Missing intended AI usage classification.",
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

  if (derivedRiskProfile && !isAiLevelAllowedForRisk(outcome.aiAccelerationLevel, derivedRiskProfile)) {
    reasons.push({
      code: "ai_level_exceeds_risk_profile",
      message: `AI level exceeds the current risk profile. Highest allowed level is ${getMaxAiLevelForRisk(derivedRiskProfile).replaceAll("_", " ")}.`,
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

  if (!outcome.valueOwnerId?.trim()) {
    reasons.push({
      code: "risk_acceptance_owner_missing",
      message: "Risk acceptance requires a named Value Owner.",
      severity: "high"
    });
  } else if (!outcome.riskAcceptedAt || outcome.riskAcceptedByValueOwnerId !== outcome.valueOwnerId) {
    reasons.push({
      code: "risk_not_accepted",
      message: "Risk not accepted by Value Owner.",
      severity: "high"
    });
  }

  return reasons;
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
