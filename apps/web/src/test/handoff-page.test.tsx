import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HandoffPage from "@/app/(protected)/handoff/[storyId]/page";

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: vi.fn(async () => ({
    userId: "user-demo-1",
    organization: {
      organizationId: "org_demo_control_plane",
      organizationName: "AAS Demo Organization"
    }
  }))
}));

vi.mock("@aas-companion/api", async () => {
  const actual = await vi.importActual<object>("@aas-companion/api");

  return {
    ...actual,
    getStoryWorkspaceService: vi.fn(async () => ({
      ok: true,
      data: {
        story: {
          id: "story-native-1",
          organizationId: "org_demo_control_plane",
          outcomeId: "outcome-native-1",
          epicId: "epic-native-1",
          key: "STR-010",
          title: "Scoped native Story",
          storyType: "outcome_delivery",
          valueIntent: "Keep Story work inside the active Framing branch.",
          acceptanceCriteria: ["The package is visible"],
          aiUsageScope: [],
          aiAccelerationLevel: "level_2",
          testDefinition: "Smoke plus regression plan",
          definitionOfDone: ["Reviewed by delivery"],
          status: "ready_for_handoff",
          originType: "native",
          createdMode: "clean",
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null,
          lineageSourceType: null,
          lineageSourceId: null,
          lineageNote: null,
          importedReadinessState: null,
          createdAt: new Date("2026-03-24T07:00:00.000Z"),
          updatedAt: new Date("2026-03-24T07:00:00.000Z"),
          outcome: {
            id: "outcome-native-1",
            key: "OUT-010",
            title: "Scoped native Framing",
            lifecycleState: "active"
          },
          epic: {
            id: "epic-native-1",
            key: "EPC-010",
            title: "Scoped native Epic",
            purpose: "Keep the branch explicit.",
            scopeBoundary: null,
            riskNote: null,
            lifecycleState: "active"
          }
        }
      }
    })),
    previewExecutionContractService: vi.fn(async () => ({
      ok: true,
      data: {
        contract: {
          outcome_id: "outcome-native-1",
          epic_id: "epic-native-1",
          story_id: "story-native-1",
          story_key: "STR-010",
          ai_level: "level_2",
          acceptance_criteria: ["The package is visible"],
          test_definition: "Smoke plus regression plan",
          definition_of_done: ["Reviewed by delivery"]
        },
        markdown: "# Execution Contract"
      }
    }))
  };
});

vi.mock("@/app/(protected)/handoff/[storyId]/actions", () => ({
  markStoryHandoffCompleteAction: vi.fn()
}));

describe("Handoff page", () => {
  it("shows concrete export and build start actions once the contract is ready", async () => {
    render(await HandoffPage({ params: Promise.resolve({ storyId: "story-native-1" }) }));

    expect(screen.getByText("Start build")).toBeDefined();
    expect(screen.getByRole("button", { name: "Mark build started" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Download JSON" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Download Markdown" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Back to Story" })).toBeDefined();
  });
});
