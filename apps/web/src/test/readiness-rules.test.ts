import { describe, expect, it } from "vitest";
import {
  executionContractToMarkdown,
  getOutcomeBaselineBlockers,
  getStoryReadinessBlockers,
  isOutcomeReadyForTollgateOne,
  isStoryReadyForHandoff
} from "@aas-companion/domain";

describe("M1 readiness rules", () => {
  it("flags missing baseline fields for Tollgate 1", () => {
    const blockers = getOutcomeBaselineBlockers({
      baselineDefinition: null,
      baselineSource: ""
    });

    expect(blockers).toEqual(["Baseline definition is missing.", "Baseline source is missing."]);
    expect(
      isOutcomeReadyForTollgateOne({
        baselineDefinition: "Defined baseline",
        baselineSource: "Trusted source"
      })
    ).toBe(true);
  });

  it("flags missing story readiness inputs", () => {
    const blockers = getStoryReadinessBlockers({
      key: "M1-STORY-007",
      acceptanceCriteria: [],
      testDefinition: null,
      definitionOfDone: []
    });

    expect(blockers).toContain("Test Definition is required before handoff.");
    expect(blockers).toContain("Definition of Done is required before handoff.");
    expect(blockers).toContain("At least one acceptance criterion is required.");
    expect(
      isStoryReadyForHandoff({
        key: "M1-STORY-007",
        acceptanceCriteria: ["A valid criterion"],
        testDefinition: "Smoke plus regression plan",
        definitionOfDone: ["Demo reviewed"]
      })
    ).toBe(true);
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
