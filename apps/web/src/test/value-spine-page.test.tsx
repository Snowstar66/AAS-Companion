import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkspacePage from "@/app/(protected)/workspace/page";

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: vi.fn(async () => ({
    organization: {
      organizationId: "org-demo",
      organizationName: "AAS Demo Organization"
    }
  }))
}));

vi.mock("@aas-companion/api", async () => {
  const actual = await vi.importActual<object>("@aas-companion/api");

  return {
    ...actual,
    getValueSpineService: vi.fn(async () => ({
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
                      status: "definition_blocked",
                      originType: "imported",
                      lifecycleState: "active",
                      importedReadinessState: "imported_design_ready",
                      lineageSourceType: "artifact_aas_candidate",
                      lineageSourceId: "candidate-story-1",
                      acceptanceCriteria: [],
                      testDefinition: null,
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
    }))
  };
});

describe("Value Spine page", () => {
  it("renders the current project through one selected Framing branch", async () => {
    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getByRole("heading", { name: "Project Value Spine", level: 1 })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Project context" })).toBeDefined();
    expect(screen.getAllByText("Imported Outcome").length).toBeGreaterThan(0);
    expect(screen.queryByText("Native Outcome")).toBeNull();
    expect(screen.getAllByRole("link", { name: "Open Outcome" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Open review lineage/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("Missing Test Definition")).toBeDefined();
  });
});
