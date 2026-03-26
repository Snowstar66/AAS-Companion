import type { AiAccelerationLevel } from "./enums";
import type { GovernanceStaffingValidationStatus } from "./governance";

export type PricingClassificationKey = "existing_delivery" | "new_build" | "uncertain_fallback";
export type PricingModelKey = "controlled_efficiency_share" | "accelerated_build_contract" | "structured_tm";
export type PricingReadinessState = "not_ready" | "conditionally_ready" | "ready";

export type PricingSignalSnapshot = {
  hasBaseline: boolean;
  outcomeClear: boolean;
  scopeStable: boolean;
  aiAccelerationLevel: AiAccelerationLevel | null;
  governanceStatus: GovernanceStaffingValidationStatus | null;
  hasValueSpineContext: boolean;
  importedLineageCount: number;
};

export type PricingAssessmentItem = {
  key: string;
  title: string;
  description: string;
};

export type PricingModelDescriptor = {
  key: PricingModelKey;
  title: string;
  tagline: string;
  whenToUse: string;
  strengths: string[];
  risks: string[];
};

export type PricingClassification = {
  key: PricingClassificationKey;
  label: string;
  description: string;
};

export type PricingRecommendation = {
  modelKey: PricingModelKey;
  label: string;
  rationale: string[];
};

export type PricingReadiness = {
  state: PricingReadinessState;
  label: string;
  description: string;
};

export type PricingGuardrail = {
  key: string;
  title: string;
  status: "covered" | "attention";
  description: string;
};

export type PricingEvaluation = {
  classification: PricingClassification;
  recommendation: PricingRecommendation;
  readiness: PricingReadiness;
  blockers: PricingAssessmentItem[];
  risks: PricingAssessmentItem[];
  models: PricingModelDescriptor[];
  guardrails: PricingGuardrail[];
};

function hasSupportedAccelerationLevel(level: AiAccelerationLevel | null) {
  return level === "level_2" || level === "level_3";
}

export const pricingModelCatalog: PricingModelDescriptor[] = [
  {
    key: "controlled_efficiency_share",
    title: "Controlled Efficiency Share",
    tagline: "Best when a measurable baseline already exists and efficiency gains can be verified.",
    whenToUse: "Use when the project improves an existing delivery context with stable scope, clear outcome and a credible baseline.",
    strengths: [
      "Links price to measurable improvement instead of only time spent.",
      "Works well when AAS governance and AI acceleration are already credible.",
      "Keeps commercial upside aligned with demonstrated delivery effect."
    ],
    risks: [
      "Falls apart when baseline quality is weak or disputed.",
      "Needs tighter governance and traceability than a loose delivery model.",
      "Not ideal when scope is still moving materially."
    ]
  },
  {
    key: "accelerated_build_contract",
    title: "Accelerated Build Contract",
    tagline: "Best when the project is a new build with clear target effect and bounded scope.",
    whenToUse: "Use when the business effect is clear, the scope is sufficiently bounded and the team wants a build-focused commercial frame.",
    strengths: [
      "Gives a clear commercial frame for new capability creation.",
      "Matches bounded design and build work better than pure T&M.",
      "Works well when AI acceleration is intended but still governed."
    ],
    risks: [
      "Can become fragile if scope boundaries are not respected.",
      "Still needs governance readiness before high acceleration is trusted.",
      "Less suitable when baseline-linked gain sharing is the main commercial story."
    ]
  },
  {
    key: "structured_tm",
    title: "Structured T&M",
    tagline: "Safest fallback when framing is incomplete, scope is unstable or governance still needs work.",
    whenToUse: "Use when the commercial shape should stay flexible while Framing, governance or scope certainty is still maturing.",
    strengths: [
      "Absorbs uncertainty better than gain-share or contract-heavy models.",
      "Reduces pressure to over-commit before AAS prerequisites are real.",
      "Useful as a temporary commercial fallback while the project stabilizes."
    ],
    risks: [
      "Provides weaker commercial leverage around efficiency outcomes.",
      "Can hide weak framing if it stays in place for too long.",
      "Needs active governance discipline to avoid drift."
    ]
  }
];

export function classifyPricingProject(input: PricingSignalSnapshot): PricingClassification {
  if (input.outcomeClear && input.scopeStable && input.hasBaseline) {
    return {
      key: "existing_delivery",
      label: "Existing delivery",
      description: "The project looks like an improvement of an existing delivery context with enough baseline and scope structure to compare before and after states."
    };
  }

  if (input.outcomeClear && input.scopeStable && !input.hasBaseline) {
    return {
      key: "new_build",
      label: "New build",
      description: "The project has a clear target effect and bounded scope, but lacks a credible baseline that would support a gain-share style comparison."
    };
  }

  return {
    key: "uncertain_fallback",
    label: "Uncertain / fallback",
    description: "The commercial shape should stay conservative because the project context is still too unclear, unstable or governance-sensitive."
  };
}

export function recommendPricingModel(input: {
  classification: PricingClassification;
  signals: PricingSignalSnapshot;
}): PricingRecommendation {
  const aiLevelLabel = input.signals.aiAccelerationLevel?.replaceAll("_", " ") ?? "not selected yet";
  const baselineLabel = input.signals.hasBaseline ? "Baseline is present." : "Baseline is still missing.";
  const scopeLabel = input.signals.scopeStable ? "Scope looks sufficiently bounded." : "Scope still looks unstable.";

  if (input.classification.key === "existing_delivery" && hasSupportedAccelerationLevel(input.signals.aiAccelerationLevel)) {
    return {
      modelKey: "controlled_efficiency_share",
      label: "Controlled Efficiency Share",
      rationale: [
        baselineLabel,
        scopeLabel,
        `AI level is ${aiLevelLabel}, which is compatible with a more performance-linked model.`,
        "The project resembles measurable improvement work rather than an unconstrained new build."
      ]
    };
  }

  if (input.classification.key === "new_build" && input.signals.outcomeClear && input.signals.scopeStable) {
    return {
      modelKey: "accelerated_build_contract",
      label: "Accelerated Build Contract",
      rationale: [
        baselineLabel,
        scopeLabel,
        `AI level is ${aiLevelLabel}, so the commercial shape should support accelerated build without pretending pricing is governance approval.`,
        "The project looks like bounded capability creation rather than measurable gain-share delivery."
      ]
    };
  }

  return {
    modelKey: "structured_tm",
    label: "Structured T&M",
    rationale: [
      baselineLabel,
      scopeLabel,
      `AI level is ${aiLevelLabel}, so a conservative commercial fallback is safer while framing and governance still mature.`,
      "The project context is not yet stable enough to anchor a stronger pricing commitment."
    ]
  };
}

export function buildPricingEvaluation(input: PricingSignalSnapshot): PricingEvaluation {
  const classification = classifyPricingProject(input);
  const recommendation = recommendPricingModel({ classification, signals: input });
  const blockers: PricingAssessmentItem[] = [];
  const risks: PricingAssessmentItem[] = [];

  if (!input.hasValueSpineContext) {
    blockers.push({
      key: "value_spine_missing",
      title: "No active Framing branch",
      description: "Pricing can be reviewed before design is complete, but it still needs an active Framing branch so the commercial discussion is attached to a real project context."
    });
  }

  if (!input.hasBaseline) {
    blockers.push({
      key: "missing_baseline",
      title: "Baseline is missing",
      description: "AAS pricing guidance is weaker until the current state is captured credibly. Without that baseline, stronger commercial models should stay blocked."
    });
  }

  if (!input.outcomeClear) {
    blockers.push({
      key: "unclear_outcome",
      title: "Outcome is unclear",
      description: "Pricing should not harden while the business problem and intended effect are still ambiguous."
    });
  }

  if (!input.scopeStable) {
    blockers.push({
      key: "unstable_scope",
      title: "Scope is unstable",
      description: "The visible scope boundaries are still too loose for a strong commercial recommendation."
    });
  }

  if (input.governanceStatus === "does_not_support_selected_level") {
    blockers.push({
      key: "governance_gap",
      title: "Governance does not yet support the selected AI level",
      description: "Pricing stays advisory only, and stronger pricing confidence should remain blocked until governance coverage supports the chosen acceleration level."
    });
  }

  if (input.governanceStatus === "needs_attention") {
    risks.push({
      key: "governance_attention",
      title: "Governance still needs attention",
      description: "Named staffing or supervision partly exists, but the AI level is not yet clean enough to treat pricing as commercially confident."
    });
  }

  if (recommendation.modelKey === "controlled_efficiency_share" && !hasSupportedAccelerationLevel(input.aiAccelerationLevel)) {
    risks.push({
      key: "ai_level_mismatch",
      title: "AI level is light for an efficiency-share model",
      description: "Controlled Efficiency Share is more credible when the project intends at least level 2 acceleration with explicit governance."
    });
  }

  if (recommendation.modelKey === "structured_tm" && input.aiAccelerationLevel === "level_3") {
    risks.push({
      key: "high_ai_low_commercial_certainty",
      title: "High AI ambition with conservative pricing fallback",
      description: "Level 3 ambition is visible, but pricing certainty is still low. That mismatch should be resolved through clearer framing or lower stated acceleration."
    });
  }

  const readiness: PricingReadiness =
    blockers.length > 0
      ? {
          state: "not_ready",
          label: "Not ready",
          description: "Pricing can be discussed, but AAS prerequisites still block commercial confidence."
        }
      : risks.length > 0
        ? {
            state: "conditionally_ready",
            label: "Conditionally ready",
            description: "Pricing guidance is usable, but there are still risks that should stay explicit."
          }
        : {
            state: "ready",
            label: "Ready",
            description: "Framing and governance signals currently support a clear pricing recommendation."
          };

  const guardrails: PricingGuardrail[] = [
    {
      key: "human_review",
      title: "Human Review stays separate",
      status: input.importedLineageCount > 0 ? "attention" : "covered",
      description:
        input.importedLineageCount > 0
          ? "Imported lineage is visible in this branch. Pricing does not replace the Human Review gate before promotion."
          : "Pricing does not create an approval path around Human Review when import is involved later."
    },
    {
      key: "governance",
      title: "Governance validation stays separate",
      status: input.governanceStatus === "supports_selected_level" ? "covered" : "attention",
      description:
        input.governanceStatus === "supports_selected_level"
          ? "Current governance coverage supports the selected AI level, but pricing is still only advisory."
          : "Governance validation still has open concerns. Pricing guidance cannot override them."
    },
    {
      key: "value_spine",
      title: "Value Spine completeness stays separate",
      status: input.hasValueSpineContext ? "covered" : "attention",
      description:
        input.hasValueSpineContext
          ? "The pricing view is anchored to an active branch, but promotion and build still depend on Value Spine and tollgate progression."
          : "Pricing does not create a shortcut around Framing, Value Spine or tollgate progression."
    }
  ];

  return {
    classification,
    recommendation,
    readiness,
    blockers,
    risks,
    models: pricingModelCatalog,
    guardrails
  };
}
