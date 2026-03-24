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
          status: "draft",
          originType: "native",
          createdMode: "clean",
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
        ]
      }
    }))
  };
});

vi.mock("@/app/(protected)/epics/[epicId]/actions", () => ({
  createStoryFromEpicAction: vi.fn()
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
    expect(screen.getByText("Origin")).toBeDefined();
    expect(screen.getByText("Clean")).toBeDefined();
    expect(screen.getByText("No Stories exist for this Epic yet.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create Story" })).toBeDefined();
    expect(screen.getByText("epic created")).toBeDefined();
  });
});
