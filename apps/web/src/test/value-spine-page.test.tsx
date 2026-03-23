import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkspacePage from "@/app/(protected)/workspace/page";

vi.mock("@/lib/auth/guards", () => ({
  requireProtectedSession: vi.fn(async () => ({
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
              importedReadinessState: "imported_framing_ready",
              lineageSourceType: "artifact_aas_candidate",
              lineageSourceId: "candidate-outcome-1",
              epics: [
                {
                  id: "epic-imported",
                  key: "IMP-EPC-1",
                  title: "Imported Epic",
                  purpose: "Preserve the Value Spine",
                  originType: "imported",
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
  it("renders imported objects and lineage links when filtered to imported origin", async () => {
    render(await WorkspacePage({ searchParams: Promise.resolve({ origin: "imported" }) }));

    expect(screen.getByRole("heading", { name: "Value Spine and readiness view", level: 1 })).toBeDefined();
    expect(screen.getByText("Imported Outcome")).toBeDefined();
    expect(screen.queryByText("Native Outcome")).toBeNull();
    expect(screen.getAllByText("imported design ready").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Open lineage" })).toBeDefined();
    expect(screen.getByText("Missing Test Definition")).toBeDefined();
  });
});
