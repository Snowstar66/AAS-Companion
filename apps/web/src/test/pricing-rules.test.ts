import { describe, expect, it } from "vitest";
import { buildPricingEvaluation, classifyPricingProject, recommendPricingModel } from "@aas-companion/domain";

describe("pricing rules", () => {
  it("classifies stable baseline-backed work as existing delivery and recommends efficiency share", () => {
    const classification = classifyPricingProject({
      hasBaseline: true,
      outcomeClear: true,
      scopeStable: true,
      aiAccelerationLevel: "level_2",
      governanceStatus: "supports_selected_level",
      hasValueSpineContext: true,
      importedLineageCount: 0
    });

    const recommendation = recommendPricingModel({
      classification,
      signals: {
        hasBaseline: true,
        outcomeClear: true,
        scopeStable: true,
        aiAccelerationLevel: "level_2",
        governanceStatus: "supports_selected_level",
        hasValueSpineContext: true,
        importedLineageCount: 0
      }
    });

    const evaluation = buildPricingEvaluation({
      hasBaseline: true,
      outcomeClear: true,
      scopeStable: true,
      aiAccelerationLevel: "level_2",
      governanceStatus: "supports_selected_level",
      hasValueSpineContext: true,
      importedLineageCount: 0
    });

    expect(classification.key).toBe("existing_delivery");
    expect(recommendation.modelKey).toBe("controlled_efficiency_share");
    expect(evaluation.readiness.state).toBe("ready");
    expect(evaluation.blockers).toHaveLength(0);
  });

  it("keeps unstable or unclear work in the fallback model", () => {
    const evaluation = buildPricingEvaluation({
      hasBaseline: false,
      outcomeClear: false,
      scopeStable: false,
      aiAccelerationLevel: "level_3",
      governanceStatus: "does_not_support_selected_level",
      hasValueSpineContext: false,
      importedLineageCount: 2
    });

    expect(evaluation.classification.key).toBe("uncertain_fallback");
    expect(evaluation.recommendation.modelKey).toBe("structured_tm");
    expect(evaluation.readiness.state).toBe("not_ready");
    expect(evaluation.blockers.map((item) => item.key)).toEqual(
      expect.arrayContaining(["value_spine_missing", "missing_baseline", "unclear_outcome", "unstable_scope", "governance_gap"])
    );
  });

  it("shows conditional readiness when governance still needs attention", () => {
    const evaluation = buildPricingEvaluation({
      hasBaseline: true,
      outcomeClear: true,
      scopeStable: true,
      aiAccelerationLevel: "level_3",
      governanceStatus: "needs_attention",
      hasValueSpineContext: true,
      importedLineageCount: 0
    });

    expect(evaluation.recommendation.modelKey).toBe("controlled_efficiency_share");
    expect(evaluation.readiness.state).toBe("conditionally_ready");
    expect(evaluation.risks.map((item) => item.key)).toContain("governance_attention");
  });
});
