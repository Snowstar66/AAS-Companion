import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EpicWorkspacePage from "@/app/(protected)/epics/[epicId]/page";

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
    getEpicWorkspaceService: vi.fn(async () => ({
      ok: true,
      data: {
        epic: {
          id: "epic-native-1",
          organizationId: "org_demo_control_plane",
          outcomeId: "outcome-native-1",
          key: "EPC-002",
          title: "New epic",
          purpose: "Describe the value slice for this outcome.",
          summary: null,
          status: "draft",
          originType: "native",
          createdMode: "clean",
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null,
          lineageSourceType: null,
          lineageSourceId: null,
          lineageNote: null,
          importedReadinessState: null,
          createdAt: new Date("2026-03-23T20:10:00.000Z"),
          updatedAt: new Date("2026-03-23T20:10:00.000Z"),
          outcome: {
            id: "outcome-native-1",
            key: "OUT-003",
            title: "New customer case"
          },
          stories: []
        },
        activities: [
          {
            id: "activity-epic-created",
            eventType: "epic_created",
            createdAt: new Date("2026-03-23T20:10:00.000Z")
          }
        ],
        removal: {
          entityType: "epic",
          entityId: "epic-native-1",
          key: "EPC-002",
          title: "New epic",
          activeChildren: [],
          decision: {
            objectType: "epic",
            lifecycleState: "active",
            recommendedAction: "hard_delete",
            hardDelete: {
              kind: "hard_delete",
              allowed: true,
              reversible: false,
              reasonRequired: false,
              summary: "Epic is still an eligible native draft.",
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
              summary: "Epic can be archived.",
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
              summary: "Epic is already active.",
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

vi.mock("@/app/(protected)/epics/[epicId]/actions", () => ({
  archiveEpicAction: vi.fn(),
  createStoryFromEpicAction: vi.fn()
  ,
  hardDeleteEpicAction: vi.fn(),
  restoreEpicAction: vi.fn(),
  saveEpicWorkspaceAction: vi.fn()
}));

describe("Epic Workspace page", () => {
  it("shows a clean epic workspace with native story creation", async () => {
    render(
      await EpicWorkspacePage({
        params: Promise.resolve({ epicId: "epic-native-1" }),
        searchParams: Promise.resolve({ created: "1" })
      })
    );

    expect(screen.getByText("Native Epic created and ready for Story breakdown.")).toBeDefined();
    expect(screen.getByText("Active Framing context")).toBeDefined();
    expect(screen.getByText("Framing-scoped Value Spine")).toBeDefined();
    expect(screen.getByText("Origin")).toBeDefined();
    expect(screen.getByText("Clean")).toBeDefined();
    expect(screen.getByText("No Stories exist for this Epic yet.")).toBeDefined();
    expect(screen.getByText("No Stories are attached to this Epic yet.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create Story" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Back to current Framing" })).toBeDefined();
    expect(screen.getByText("epic created")).toBeDefined();
    expect(screen.getByText("Removal and recovery")).toBeDefined();
  });
});
