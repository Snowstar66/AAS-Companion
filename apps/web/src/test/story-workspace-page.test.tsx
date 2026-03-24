import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StoryWorkspacePage from "@/app/(protected)/stories/[storyId]/page";

vi.mock("@/lib/auth/guards", () => ({
  requireOrganizationContext: vi.fn(async () => ({
    organizationId: "org_demo_control_plane",
    organizationName: "AAS Demo Organization"
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
          acceptanceCriteria: [],
          aiUsageScope: [],
          aiAccelerationLevel: "level_2",
          testDefinition: null,
          definitionOfDone: [],
          status: "definition_blocked",
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
            title: "Scoped native Framing"
          },
          epic: {
            id: "epic-native-1",
            key: "EPC-010",
            title: "Scoped native Epic",
            purpose: "Keep the branch explicit.",
            summary: null
          }
        },
        tollgate: {
          id: "tg-story-1",
          blockers: ["Test Definition is required before handoff."],
          approverRoles: ["delivery_lead", "builder"],
          comments: null,
          status: "blocked"
        },
        activities: [
          {
            id: "activity-story-created",
            eventType: "story_created",
            createdAt: new Date("2026-03-24T07:00:00.000Z")
          }
        ],
        readiness: {
          state: "blocked",
          reasons: [
            {
              code: "test_definition_missing",
              message: "Test Definition is required before handoff.",
              severity: "high"
            }
          ]
        },
        importedBuildBlockers: [],
        removal: {
          entityType: "story",
          entityId: "story-native-1",
          key: "STR-010",
          title: "Scoped native Story",
          activeChildren: [],
          decision: {
            objectType: "story",
            lifecycleState: "active",
            recommendedAction: "hard_delete",
            hardDelete: {
              kind: "hard_delete",
              allowed: true,
              reversible: false,
              reasonRequired: false,
              summary: "Story is still an eligible native draft.",
              blockers: [],
              affectedChildren: [],
              affectedActiveChildCount: 0,
              governanceImpact: {
                activityEventCount: 1,
                tollgateCount: 0,
                hasLineage: false,
                importedReadinessState: null
              }
            },
            archive: {
              kind: "archive",
              allowed: true,
              reversible: true,
              reasonRequired: true,
              summary: "Story can be archived.",
              blockers: [],
              affectedChildren: [],
              affectedActiveChildCount: 0,
              governanceImpact: {
                activityEventCount: 1,
                tollgateCount: 0,
                hasLineage: false,
                importedReadinessState: null
              }
            },
            restore: {
              kind: "restore",
              allowed: false,
              reversible: true,
              reasonRequired: false,
              summary: "Story is already active.",
              blockers: ["Restore becomes available only after archive."],
              affectedChildren: [],
              affectedActiveChildCount: 0,
              governanceImpact: {
                activityEventCount: 1,
                tollgateCount: 0,
                hasLineage: false,
                importedReadinessState: null
              }
            }
          }
        }
      }
    }))
  };
});

vi.mock("@/app/(protected)/stories/[storyId]/actions", () => ({
  archiveStoryAction: vi.fn(),
  hardDeleteStoryAction: vi.fn(),
  restoreStoryAction: vi.fn(),
  saveStoryWorkspaceAction: vi.fn(),
  submitStoryReadinessAction: vi.fn()
}));

describe("Story Workspace page", () => {
  it("shows the current Framing branch and scoped navigation for native story work", async () => {
    render(
      await StoryWorkspacePage({
        params: Promise.resolve({ storyId: "story-native-1" }),
        searchParams: Promise.resolve({ created: "1" })
      })
    );

    expect(screen.getByText("Native Story created and ready for design work.")).toBeDefined();
    expect(screen.getByText("Active Framing context")).toBeDefined();
    expect(screen.getByText("Framing-scoped Value Spine")).toBeDefined();
    expect(screen.getAllByText("Scoped native Framing").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Scoped native Epic").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Scoped native Story").length).toBeGreaterThan(0);
    expect(screen.getByText("Empty test branch")).toBeDefined();
    expect(screen.getByRole("link", { name: "Back to current Epic" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open current Framing" })).toBeDefined();
    expect(screen.getAllByText("Test Definition is required before handoff.").length).toBeGreaterThan(0);
  });
});
