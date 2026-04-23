import { describe, expect, it } from "vitest";
import {
  buildGovernedRemovalDecision,
  createImportedPromotionProvenance,
  createNativeProvenance,
  createReadinessAssessment,
  executionContractToMarkdown,
  getOutcomeBaselineBlockers,
  getOutcomeBaselineReadiness,
  getStoryHandoffReadiness,
  getStoryReadinessBlockers,
  getStoryValueSpineBlockers,
  governedObjectProvenanceSchema,
  isOutcomeReadyForTollgateOne,
  isStoryReadyForHandoff,
  isStoryValidAgainstValueSpine
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
      outcomeId: "outcome-1",
      epicId: "epic-1",
      acceptanceCriteria: [],
      testDefinition: null,
      definitionOfDone: [],
      status: "definition_blocked"
    });

    expect(blockers).toContain("Test Definition is required before build progression.");
    expect(blockers).toContain("Definition of Done is required before handoff.");
    expect(blockers).toContain("At least one acceptance criterion is required.");
    expect(
      isStoryReadyForHandoff({
        key: "M1-STORY-007",
        outcomeId: "outcome-1",
        epicId: "epic-1",
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
        outcomeId: "outcome-2",
        epicId: "epic-2",
        acceptanceCriteria: ["One criterion"],
        testDefinition: "Run smoke coverage",
        definitionOfDone: ["Reviewed"],
        status: "ready_for_handoff"
      }).state
    ).toBe("ready");

    expect(
      isStoryValidAgainstValueSpine({
        outcomeId: "outcome-2",
        epicId: "epic-2",
        acceptanceCriteria: ["One criterion"],
        testDefinition: "Run smoke coverage"
      })
    ).toBe(true);

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

  it("validates delivery stories directly against the Value Spine", () => {
    const blockers = getStoryValueSpineBlockers({
      outcomeId: "",
      epicId: "",
      acceptanceCriteria: [],
      testDefinition: null
    });

    expect(blockers).toContain("Outcome link is required for Value Spine traceability.");
    expect(blockers).toContain("Epic link is required for Value Spine traceability.");
    expect(blockers).toContain("At least one acceptance criterion is required.");
    expect(blockers).toContain("Test Definition is required before build progression.");
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
      outcome_title: "Outcome title",
      outcome_statement: "Outcome statement",
      epic_id: "epic-1",
      epic_title: "Epic title",
      story_id: "story-1",
      story_key: "M1-STORY-008",
      story_title: "Story title",
      value_intent: "Value intent",
      expected_behavior: "Expected behavior",
      ai_level: "level_2",
      ai_usage_scope: ["Drafting"],
      framing_version: 12,
      acceptance_criteria: ["Preview shows required fields"],
      test_definition: "Run smoke coverage",
      definition_of_done: ["Preview can be copied"]
    });

    expect(markdown).toContain("# Build Start Package");
    expect(markdown).toContain("Story Key: M1-STORY-008");
    expect(markdown).toContain("Outcome Title: Outcome title");
    expect(markdown).toContain("## Test Definition");
  });

  it("distinguishes hard delete, archive, and restore using shared governed lifecycle policy", () => {
    const draftDelete = buildGovernedRemovalDecision({
      objectType: "epic",
      key: "EPC-100",
      title: "Draft Epic",
      originType: "native",
      createdMode: "clean",
      lifecycleState: "active",
      status: "draft",
      activityEventCount: 1,
      tollgateCount: 0,
      activeChildren: []
    });

    expect(draftDelete.recommendedAction).toBe("hard_delete");
    expect(draftDelete.hardDelete.allowed).toBe(true);

    const governedArchive = buildGovernedRemovalDecision({
      objectType: "story",
      key: "STR-200",
      title: "Governed Story",
      originType: "imported",
      createdMode: "promotion",
      lifecycleState: "active",
      status: "ready_for_handoff",
      activityEventCount: 4,
      tollgateCount: 1,
      activeChildren: [],
      importedReadinessState: "imported_design_ready"
    });

    expect(governedArchive.recommendedAction).toBe("archive");
    expect(governedArchive.hardDelete.allowed).toBe(false);
    expect(governedArchive.archive.allowed).toBe(true);

    const blockedRestore = buildGovernedRemovalDecision({
      objectType: "story",
      key: "STR-201",
      title: "Archived Story",
      originType: "native",
      createdMode: "clean",
      lifecycleState: "archived",
      status: "draft",
      activityEventCount: 2,
      tollgateCount: 0,
      activeChildren: [],
      archivedAncestorLabels: ["Epic EPC-200"]
    });

    expect(blockedRestore.recommendedAction).toBe("blocked");
    expect(blockedRestore.restore.allowed).toBe(false);
  });
});
