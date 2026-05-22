import { describe, expect, it } from "vitest";
import { getStoryUxModel } from "@/lib/workspace/story-ux";

describe("story ux", () => {
  it("keeps readiness authoritative even if a stale ready_for_handoff status is stored", () => {
    const storyUx = getStoryUxModel({
      id: "story-1",
      key: "STR-001",
      status: "ready_for_handoff",
      lifecycleState: "active",
      testDefinition: null,
      acceptanceCriteria: ["A visible outcome exists."],
      definitionOfDone: ["Reviewed by delivery."]
    });

    expect(storyUx.statusLabel).toBe("Needs action");
    expect(storyUx.readinessLabel).toBe("Needs action");
    expect(storyUx.isReadyForHandoff).toBe(false);
    expect(storyUx.tone).toBe("warning");
  });

  it("shows one consistent ready signal when all handoff inputs are present", () => {
    const storyUx = getStoryUxModel({
      id: "story-2",
      key: "STR-002",
      status: "draft",
      lifecycleState: "active",
      testDefinition: "Verify the exported package and traceability links.",
      acceptanceCriteria: ["The exported package is complete."],
      definitionOfDone: ["Human review complete."],
      blockers: []
    });

    expect(storyUx.statusLabel).toBe("Design ready");
    expect(storyUx.readinessLabel).toBe("Design ready");
    expect(storyUx.statusDetail).toBe(storyUx.readinessDetail);
    expect(storyUx.isReadyForHandoff).toBe(true);
  });
});
