import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OutcomeWorkspacePage from "@/app/(protected)/outcomes/[outcomeId]/page";

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
    getOutcomeWorkspaceService: vi.fn(async () => ({
      ok: true,
      data: {
        outcome: {
          id: "outcome-native-1",
          organizationId: "org_demo_control_plane",
          key: "OUT-003",
          title: "New customer case",
          problemStatement: null,
          outcomeStatement: null,
          baselineDefinition: null,
          baselineSource: null,
          timeframe: null,
          valueOwnerId: null,
          valueOwner: null,
          riskProfile: "medium",
          aiAccelerationLevel: "level_2",
          status: "draft",
          originType: "native",
          createdMode: "clean",
          lineageSourceType: null,
          lineageSourceId: null,
          lineageNote: null,
          importedReadinessState: null,
          createdAt: new Date("2026-03-23T20:00:00.000Z"),
          updatedAt: new Date("2026-03-23T20:00:00.000Z"),
          epics: [],
          stories: []
        },
        tollgate: {
          id: "tg-1",
          blockers: ["Baseline definition is missing.", "Baseline source is missing."],
          approverRoles: ["value_owner", "architect"],
          comments: null,
          status: "blocked"
        },
        activities: [
          {
            id: "activity-1",
            eventType: "outcome_created",
            createdAt: new Date("2026-03-23T20:00:00.000Z")
          }
        ],
        readiness: {
          state: "blocked",
          reasons: [
            {
              code: "baseline_definition_missing",
              message: "Baseline definition is missing.",
              severity: "high"
            }
          ]
        }
      }
    }))
  };
});

vi.mock("@/app/(protected)/outcomes/[outcomeId]/actions", () => ({
  createEpicFromOutcomeAction: vi.fn(),
  saveOutcomeWorkspaceAction: vi.fn(),
  submitOutcomeTollgateAction: vi.fn()
}));

describe("Outcome Workspace page", () => {
  it("shows native provenance and blocked TG1 posture for a clean draft case", async () => {
    render(
      await OutcomeWorkspacePage({
        params: Promise.resolve({ outcomeId: "outcome-native-1" }),
        searchParams: Promise.resolve({ created: "1" })
      })
    );

    expect(screen.getByText("Clean native case created and ready for framing work.")).toBeDefined();
    expect(screen.getByText("Case provenance")).toBeDefined();
    expect(screen.getByText("Origin: Native")).toBeDefined();
    expect(screen.getByText("Workspace: Clean")).toBeDefined();
    expect(screen.getByText("Status: draft")).toBeDefined();
    expect(screen.getByText("No Epics exist for this case yet.")).toBeDefined();
    expect(screen.getByText("No Stories exist for this case yet.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create Epic" })).toBeDefined();
    expect(screen.getByText("Baseline definition is missing.")).toBeDefined();
  });
});
