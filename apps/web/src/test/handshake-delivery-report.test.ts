import { describe, expect, it } from "vitest";
import { buildHandshakeDeliveryReport } from "@/lib/outcomes/handshake-delivery-report";

describe("buildHandshakeDeliveryReport", () => {
  it("classifies covered, reshaped, not implemented and outside-handshake delivery", () => {
    const report = buildHandshakeDeliveryReport({
      approvedStoryIdeas: [
        {
          key: "STORY-001",
          title: "Approved profile story",
          linkedEpic: "EPIC-001",
          sourceType: "direction_seed"
        },
        {
          key: "STORY-002",
          title: "Approved reminder story",
          linkedEpic: "EPIC-001",
          sourceType: "direction_seed"
        },
        {
          key: "STORY-003",
          title: "Approved split story",
          linkedEpic: "EPIC-001",
          sourceType: "direction_seed"
        }
      ],
      currentSeeds: [
        {
          id: "seed-1",
          key: "STORY-001",
          title: "Approved profile story"
        },
        {
          id: "seed-3",
          key: "STORY-003",
          title: "Approved split story"
        }
      ],
      currentStories: [
        {
          id: "delivery-1",
          key: "DST-001",
          title: "Profile delivery",
          epicKey: "EPIC-001",
          epicTitle: "Profile epic",
          sourceDirectionSeedId: "seed-1",
          status: "ready_for_handoff",
          acceptanceCriteria: ["Has AC"],
          definitionOfDone: ["Has DoD"],
          testDefinition: "Has tests"
        },
        {
          id: "delivery-2",
          key: "DST-002",
          title: "Split delivery part 1",
          epicKey: "EPIC-001",
          epicTitle: "Profile epic",
          sourceDirectionSeedId: "seed-3",
          status: "ready_for_handoff",
          acceptanceCriteria: ["Has AC"],
          definitionOfDone: ["Has DoD"],
          testDefinition: "Has tests"
        },
        {
          id: "delivery-3",
          key: "DST-003",
          title: "Split delivery part 2",
          epicKey: "EPIC-002",
          epicTitle: "Follow-up epic",
          sourceDirectionSeedId: "seed-3",
          status: "ready_for_handoff",
          acceptanceCriteria: ["Has AC"],
          definitionOfDone: ["Has DoD"],
          testDefinition: "Has tests"
        },
        {
          id: "delivery-extra",
          key: "DST-099",
          title: "Extra delivery",
          epicKey: "EPIC-009",
          epicTitle: "Outside scope",
          sourceDirectionSeedId: null,
          status: "ready_for_handoff",
          acceptanceCriteria: ["Has AC"],
          definitionOfDone: [],
          testDefinition: null
        }
      ]
    });

    expect(report.summary.approvedIdeaCount).toBe(3);
    expect(report.summary.coveredCount).toBe(1);
    expect(report.summary.reshapedCount).toBe(1);
    expect(report.summary.notImplementedCount).toBe(1);
    expect(report.summary.outsideHandshakeCount).toBe(1);
    expect(report.coverageRows.find((row) => row.idea.key === "STORY-001")?.status).toBe("covered");
    expect(report.coverageRows.find((row) => row.idea.key === "STORY-002")?.status).toBe("not_implemented");
    expect(report.coverageRows.find((row) => row.idea.key === "STORY-003")?.status).toBe("reshaped_within_handshake");
    expect(report.outsideHandshakeStories.map((story) => story.key)).toContain("DST-099");
  });
});
