import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspacePage from "@/app/(protected)/workspace/page";

const { getValueSpineServiceMock, requireActiveProjectSessionMock } = vi.hoisted(() => ({
  getValueSpineServiceMock: vi.fn(),
  requireActiveProjectSessionMock: vi.fn(async () => ({
    organization: {
      organizationId: "org-demo",
      organizationName: "AAS Demo Organization"
    }
  }))
}));

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: requireActiveProjectSessionMock
}));

vi.mock("@aas-companion/api/spine", () => ({
  getValueSpineService: getValueSpineServiceMock
}));

afterEach(() => {
  cleanup();
});

function createWorkspaceSnapshot(
  storyStatus: "definition_blocked" | "ready_for_handoff" | "draft",
  options?: {
    tollgateStatus?: "blocked" | "ready" | "approved" | null;
  }
) {
  return {
    ok: true,
    data: {
      organization: {
        outcomes: [
          {
            id: "outcome-imported",
            key: "IMP-OUT-1",
            title: "Imported Outcome",
            outcomeStatement: "Imported lineage stays visible",
            originType: "imported",
            lifecycleState: "active",
            importedReadinessState: "imported_framing_ready",
            lineageSourceType: "artifact_aas_candidate",
            lineageSourceId: "candidate-outcome-1",
            epics: [
              {
                id: "epic-imported",
                key: "IMP-EPC-1",
                title: "Imported Epic",
                purpose: "Preserve the Value Spine",
                scopeBoundary: null,
                riskNote: null,
                originType: "imported",
                lifecycleState: "active",
                importedReadinessState: "imported_framing_ready",
                lineageSourceType: "artifact_aas_candidate",
                lineageSourceId: "candidate-epic-1",
                stories: [
                  {
                    id: "story-imported",
                    key: "IMP-STORY-1",
                    title: "Imported Story",
                    status: storyStatus,
                    tollgateStatus: options?.tollgateStatus ?? null,
                    originType: "imported",
                    lifecycleState: "active",
                    importedReadinessState: "imported_design_ready",
                    lineageSourceType: "artifact_aas_candidate",
                    lineageSourceId: "candidate-story-1",
                    acceptanceCriteria: storyStatus === "ready_for_handoff" ? ["Accepted"] : [],
                    testDefinition: storyStatus === "ready_for_handoff" ? "Regression test" : null,
                    definitionOfDone: ["Human review complete"]
                  }
                ]
              }
            ]
          },
          {
            id: "outcome-native",
            key: "OUT-002",
            title: "Native Outcome",
            outcomeStatement: "Native planning continues",
            originType: "native",
            lifecycleState: "active",
            importedReadinessState: null,
            lineageSourceType: null,
            lineageSourceId: null,
            epics: []
          }
        ]
      }
    }
  };
}

describe("Value Spine page", () => {
  it("renders the current project through one selected Framing branch", async () => {
    getValueSpineServiceMock.mockResolvedValue(createWorkspaceSnapshot("definition_blocked"));

    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getByRole("heading", { name: "Project Value Spine", level: 1 })).toBeDefined();
    expect(screen.getByText("Current Framing: IMP-OUT-1")).toBeDefined();
    expect(screen.getAllByText("Imported Outcome").length).toBeGreaterThan(0);
    expect(screen.queryByText("Native Outcome")).toBeNull();
    expect(screen.getAllByRole("link", { name: /Open lineage/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("Missing Test Definition")).toBeDefined();
  });

  it("shows approved handoff stories as ready in the Value Spine summary and story card", async () => {
    getValueSpineServiceMock.mockResolvedValue(createWorkspaceSnapshot("ready_for_handoff"));

    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getAllByText("Ready for design").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ready for design")[0]?.parentElement?.textContent).toContain("1");
    expect(screen.queryByText("Missing Test Definition")).toBeNull();
  });

  it("prefers the shared tollgate approval status over a stale story status", async () => {
    getValueSpineServiceMock.mockResolvedValue(createWorkspaceSnapshot("draft", { tollgateStatus: "approved" }));

    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getAllByText("Ready for design").length).toBeGreaterThan(0);
    expect(screen.queryByText("This Story still needs key delivery inputs before review can start.")).toBeNull();
  });
});
