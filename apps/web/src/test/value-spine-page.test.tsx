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

function createWorkspaceSnapshot(options?: {
  seedDescription?: string | null;
  expectedBehavior?: string | null;
  tollgateStatus?: "blocked" | "ready" | "approved" | null;
  includeAdditionalDeliveryStory?: boolean;
}) {
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
                directionSeeds: [
                  {
                    id: "seed-imported",
                    epicId: "epic-imported",
                    key: "IMP-SEED-1",
                    title: "Imported Direction Seed",
                    shortDescription: options?.seedDescription ?? null,
                    expectedBehavior: options?.expectedBehavior ?? null,
                    sourceStoryId: "story-imported",
                    originType: "imported",
                    lifecycleState: "active",
                    importedReadinessState: "imported_framing_ready",
                    lineageSourceType: "artifact_aas_candidate",
                    lineageSourceId: "candidate-story-1"
                  }
                ],
                stories: [
                  {
                    id: "story-imported",
                    key: "IMP-STORY-1",
                    title: "Imported Story",
                    status: "draft",
                    tollgateStatus: options?.tollgateStatus ?? null,
                    originType: "imported",
                    lifecycleState: "active",
                    importedReadinessState: "imported_design_ready",
                    lineageSourceType: "artifact_aas_candidate",
                    lineageSourceId: "candidate-story-1",
                    acceptanceCriteria: ["Accepted"],
                    testDefinition: "Regression test",
                    definitionOfDone: ["Human review complete"]
                  },
                  ...(options?.includeAdditionalDeliveryStory
                    ? [
                        {
                          id: "story-extra-1",
                          key: "STR-099",
                          title: "Extra delivery scope",
                          status: "ready_for_handoff",
                          tollgateStatus: "ready",
                          originType: "native",
                          lifecycleState: "active",
                          importedReadinessState: null,
                          lineageSourceType: null,
                          lineageSourceId: null,
                          acceptanceCriteria: ["Extra acceptance"],
                          testDefinition: "Extra verification",
                          definitionOfDone: ["Extra done condition"]
                        }
                      ]
                    : [])
                ]
              }
            ],
            directionSeeds: [
              {
                id: "seed-imported",
                epicId: "epic-imported",
                key: "IMP-SEED-1",
                title: "Imported Direction Seed",
                shortDescription: options?.seedDescription ?? null,
                expectedBehavior: options?.expectedBehavior ?? null,
                sourceStoryId: "story-imported",
                originType: "imported",
                lifecycleState: "active",
                importedReadinessState: "imported_framing_ready",
                lineageSourceType: "artifact_aas_candidate",
                lineageSourceId: "candidate-story-1"
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
            epics: [],
            directionSeeds: []
          }
        ]
      }
    }
  };
}

describe("Value Spine page", () => {
  it("renders the current project through one selected Framing branch", async () => {
    getValueSpineServiceMock.mockResolvedValue(createWorkspaceSnapshot());

    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getByRole("heading", { name: "Project Value Spine", level: 1 })).toBeDefined();
    expect(screen.getAllByRole("heading", { name: "Project Value Spine" }).length).toBeGreaterThan(1);
    expect(screen.getAllByText("IMP-OUT-1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Imported Outcome").length).toBeGreaterThan(0);
    expect(screen.queryByText("Native Outcome")).toBeNull();
    expect(screen.getAllByRole("link", { name: /Open lineage/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("Visible Story Ideas")).toBeDefined();
    expect(screen.getByText(/Framing status:/i)).toBeDefined();
    expect(screen.getByText(/Needs refinement/i)).toBeDefined();
  });

  it("shows direction seeds as clear when framing descriptions and expected behavior exist", async () => {
    getValueSpineServiceMock.mockResolvedValue(
      createWorkspaceSnapshot({
        seedDescription: "Keep the imported branch as an AI-usable framing seed.",
        expectedBehavior: "Imported lineage stays visible during framing export."
      })
    );

    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getByText("Visible Story Ideas")).toBeDefined();
    expect(screen.getByText("Ready for framing")).toBeDefined();
    expect(screen.getByText(/Expected behavior:/i)).toBeDefined();
    expect(screen.queryByText("Short description is still missing.")).toBeNull();
  });

  it("keeps the framing value spine free from delivery readiness language even if stories exist underneath", async () => {
    getValueSpineServiceMock.mockResolvedValue(createWorkspaceSnapshot({ tollgateStatus: "approved" }));

    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getAllByText("Project Value Spine").length).toBeGreaterThan(0);
    expect(screen.queryByText("Ready for design")).toBeNull();
    expect(screen.queryByText("This Story still needs key delivery inputs before review can start.")).toBeNull();
  });

  it("shows lightweight delivery feedback on story ideas without surfacing unlinked delivery stories as framing ideas", async () => {
    getValueSpineServiceMock.mockResolvedValue(
      createWorkspaceSnapshot({
        seedDescription: "Keep the imported branch as an AI-usable framing seed.",
        expectedBehavior: "Imported lineage stays visible during framing export.",
        includeAdditionalDeliveryStory: true
      })
    );

    render(await WorkspacePage({ searchParams: Promise.resolve({ framing: "outcome-imported" }) }));

    expect(screen.getByText(/Delivery feedback: Expanded/i)).toBeDefined();
    expect(screen.getByText(/Derived Delivery Stories: 0/i)).toBeDefined();
    expect(screen.getByText(/Additional: 1/i)).toBeDefined();
    expect(screen.queryByText("Extra delivery scope")).toBeNull();
  });
});
