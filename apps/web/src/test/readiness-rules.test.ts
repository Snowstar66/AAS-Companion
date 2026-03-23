import { describe, expect, it } from "vitest";
import {
  createImportedPromotionProvenance,
  createNativeProvenance,
  createReadinessAssessment,
  executionContractToMarkdown,
  getOutcomeBaselineBlockers,
  getOutcomeBaselineReadiness,
  getStoryHandoffReadiness,
  getStoryReadinessBlockers,
  governedObjectProvenanceSchema,
  isOutcomeReadyForTollgateOne,
  isStoryReadyForHandoff
} from "@aas-companion/domain";

describe("M1 readiness rules", () => {
  it("flags missing baseline fields for Tollgate 1", () => {
    const blockers = getOutcomeBaselineBlockers({
      baselineDefinition: null,
      baselineSource: "",
      status: "draft"
    });

    expect(blockers).toEqual(["Baseline definition is missing.", "Baseline source is missing."]);
    expect(
      isOutcomeReadyForTollgateOne({
        baselineDefinition: "Defined baseline",
        baselineSource: "Trusted source",
        status: "ready_for_tg1"
      })
    ).toBe(true);
  });

  it("flags missing story readiness inputs", () => {
    const blockers = getStoryReadinessBlockers({
      key: "M1-STORY-007",
      acceptanceCriteria: [],
      testDefinition: null,
      definitionOfDone: [],
      status: "definition_blocked"
    });

    expect(blockers).toContain("Test Definition is required before handoff.");
    expect(blockers).toContain("Definition of Done is required before handoff.");
    expect(blockers).toContain("At least one acceptance criterion is required.");
    expect(
      isStoryReadyForHandoff({
        key: "M1-STORY-007",
        acceptanceCriteria: ["A valid criterion"],
        testDefinition: "Smoke plus regression plan",
        definitionOfDone: ["Demo reviewed"],
        status: "ready_for_handoff"
      })
    ).toBe(true);
  });

  it("models shared readiness states consistently", () => {
    expect(
      getOutcomeBaselineReadiness({
        baselineDefinition: "Defined baseline",
        baselineSource: "Trusted source",
        status: "draft"
      }).state
    ).toBe("in_progress");

    expect(
      getStoryHandoffReadiness({
        key: "M2-STORY-001",
        acceptanceCriteria: ["One criterion"],
        testDefinition: "Run smoke coverage",
        definitionOfDone: ["Reviewed"],
        status: "ready_for_handoff"
      }).state
    ).toBe("ready");

    expect(
      createReadinessAssessment({
        reasons: [
          {
            code: "missing_field",
            message: "Something is missing.",
            severity: "high"
          }
        ]
      }).state
    ).toBe("blocked");
  });

  it("creates governed provenance with required lineage rules", () => {
    expect(createNativeProvenance({ organizationId: "org_demo_control_plane" })).toEqual({
      originType: "native",
      createdMode: "demo",
      lineageReference: null
    });

    expect(
      createImportedPromotionProvenance({
        sourceType: "artifact_aas_candidate",
        sourceId: "candidate-123",
        note: "Promoted from intake review"
      })
    ).toEqual({
      originType: "imported",
      createdMode: "promotion",
      lineageReference: {
        sourceType: "artifact_aas_candidate",
        sourceId: "candidate-123",
        note: "Promoted from intake review"
      }
    });

    expect(() =>
      governedObjectProvenanceSchema.parse({
        originType: "imported",
        createdMode: "promotion",
        lineageReference: null
      })
    ).toThrow("Imported governed objects require a lineage reference.");
  });

  it("formats execution contract markdown from typed contract data", () => {
    const markdown = executionContractToMarkdown({
      outcome_id: "outcome-1",
      epic_id: "epic-1",
      story_id: "story-1",
      story_key: "M1-STORY-008",
      ai_level: "level_2",
      acceptance_criteria: ["Preview shows required fields"],
      test_definition: "Run smoke coverage",
      definition_of_done: ["Preview can be copied"]
    });

    expect(markdown).toContain("# Execution Contract");
    expect(markdown).toContain("Story Key: M1-STORY-008");
    expect(markdown).toContain("## Test Definition");
  });
});
