import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StoryIdeaWorkspacePage from "@/app/(protected)/story-ideas/[storyIdeaId]/page";

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
          expectedBehavior: "Capture a mushroom find quickly enough to guide later design decisions.",
          uxSketchName: "story-idea-sketch.png",
          uxSketchContentType: "image/png",
          uxSketchDataUrl: "data:image/png;base64,abc123",
          uxSketches: [
            {
              id: "sketch-1",
              name: "story-idea-sketch.png",
              contentType: "image/png",
              dataUrl: "data:image/png;base64,abc123"
            }
          ],
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
            title: "Scoped native Framing",
            outcomeStatement: "Make it easier to capture findings while still in the forest.",
            originType: "native",
            lifecycleState: "active",
            importedReadinessState: null,
            lineageSourceType: null,
            lineageSourceId: null
          },
          epic: {
            id: "epic-native-1",
            key: "EPC-010",
            title: "Scoped native Epic",
            purpose: "Keep the branch explicit.",
            scopeBoundary: null,
            riskNote: null,
            originType: "native",
            lifecycleState: "active",
            importedReadinessState: null,
            lineageSourceType: null,
            lineageSourceId: null
          }
        },
        tollgate: {
          id: "tg-story-1",
          blockers: ["Test Definition is required before handoff."],
          approverRoles: ["delivery_lead", "builder"],
          comments: null,
          status: "blocked"
        },
        tollgateReview: {
          status: "blocked",
          blockers: ["Test Definition is required before handoff."],
          comments: null,
          availablePeople: [
            {
              id: "party-dl",
              fullName: "Demo Delivery Lead",
              roleType: "delivery_lead",
              organizationSide: "supplier",
              roleTitle: "Delivery Lead"
            }
          ],
          reviewActions: [
            {
              decisionKind: "review",
              roleType: "aqa",
              organizationSide: "supplier",
              label: "Quality review",
              assignedPeople: [],
              completedRecords: [],
              pending: true,
              blockedReasons: ["No active aqa is currently assigned on the supplier side."]
            }
          ],
          approvalActions: [
            {
              decisionKind: "approval",
              roleType: "delivery_lead",
              organizationSide: "supplier",
              label: "Delivery approval",
              assignedPeople: [
                {
                  partyRoleEntryId: "party-dl",
                  fullName: "Demo Delivery Lead",
                  email: "delivery.lead@aas-companion.local",
                  roleTitle: "Delivery Lead"
                }
              ],
              completedRecords: [],
              pending: true,
              blockedReasons: []
            }
          ],
          pendingActions: [
            {
              label: "Quality review",
              roleType: "aqa",
              organizationSide: "supplier"
            }
          ],
          blockedActions: [
            {
              label: "Quality review",
              blockedReasons: ["No active aqa is currently assigned on the supplier side."]
            }
          ],
          signoffRecords: []
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
              message: "Test Definition is required before build progression.",
              severity: "high"
            }
          ]
        },
        valueSpineValidation: {
          state: "blocked",
          reasons: [
            {
              code: "test_definition_missing",
              message: "Test Definition is required before build progression.",
              severity: "high"
            },
            {
              code: "acceptance_criteria_missing",
              message: "At least one acceptance criterion is required.",
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
  recordStoryTollgateDecisionAction: vi.fn(),
  restoreStoryAction: vi.fn(),
  saveStoryWorkspaceInlineAction: vi.fn(),
  saveStoryWorkspaceAction: vi.fn(),
  submitStoryReadinessAction: vi.fn(),
  validateStoryExpectedBehaviorAiAction: vi.fn()
}));

describe("Story Workspace page", () => {
  it("keeps pre-approval story work focused on framing clarity instead of delivery workflow", async () => {
    render(
      await StoryIdeaWorkspacePage({
        params: Promise.resolve({ storyIdeaId: "story-native-1" }),
        searchParams: Promise.resolve({ created: "1" })
      })
    );

    expect(screen.getByText("Native Story Idea created inside the current Framing.")).toBeDefined();
    expect(screen.getAllByText("Scoped native Story").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Story Idea").length).toBeGreaterThan(0);
    expect(screen.getByText("Story idea definition")).toBeDefined();
    expect(screen.getByText(/This record is still framing-level intent\./i)).toBeDefined();
    expect(screen.getAllByText("Expected behavior").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AI validate").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Epic alignment").length).toBeGreaterThan(0);
    expect(screen.getByText("Branch context")).toBeDefined();
    expect(screen.getAllByText(/OUT-010\s+Scoped native Framing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/EPC-010\s+Scoped native Epic/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Keep Story work inside the active Framing branch.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("UX Sketch").length).toBeGreaterThan(0);
    expect(screen.getByText("UX Sketch Attached")).toBeDefined();
    expect(screen.getByText("Conceptual - subject to change")).toBeDefined();
    expect(screen.getByText("story-idea-sketch.png")).toBeDefined();
    expect(screen.queryByText(/Story path:/i)).toBeNull();
    expect(screen.queryByRole("link", { name: "Preview Execution Contract" })).toBeNull();
    expect(screen.getByRole("link", { name: "Back to current Epic" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open current Framing" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open Governance readiness" })).toBeDefined();
    expect(screen.getByText("Returned delivery traceability")).toBeDefined();
    expect(screen.getByText("Later delivery context")).toBeDefined();
    expect(screen.getAllByText("AI level").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Capture a mushroom find quickly enough to guide later design decisions.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Make it easier to capture findings while still in the forest.").length).toBeGreaterThan(0);
    expect(screen.queryByText("Value Spine validation")).toBeNull();
  });

  it("uses story lineage when opening source candidate review from a legacy Story Idea", async () => {
    const { getStoryWorkspaceService } = await import("@aas-companion/api");
    vi.mocked(getStoryWorkspaceService).mockResolvedValueOnce({
      ok: true,
      data: {
        story: {
          id: "story-imported-2",
          organizationId: "org_demo_control_plane",
          outcomeId: "outcome-native-1",
          epicId: "epic-native-1",
          key: "STR-011",
          title: "Imported story-backed idea",
          storyType: "outcome_delivery",
          valueIntent: "Keep imported source review reachable.",
          expectedBehavior: "The source review link points back to the imported story candidate.",
          uxSketchName: null,
          uxSketchContentType: null,
          uxSketchDataUrl: null,
          uxSketches: [],
          acceptanceCriteria: [],
          aiUsageScope: [],
          aiAccelerationLevel: "level_2",
          testDefinition: null,
          definitionOfDone: [],
          status: "definition_blocked",
          originType: "imported",
          createdMode: "shared",
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null,
          lineageSourceType: "artifact_aas_candidate",
          lineageSourceId: "candidate-story-2",
          lineageNote: null,
          importedReadinessState: "imported_design_ready",
          createdAt: new Date("2026-03-24T07:00:00.000Z"),
          updatedAt: new Date("2026-03-24T07:00:00.000Z"),
          outcome: {
            id: "outcome-native-1",
            key: "OUT-010",
            title: "Scoped native Framing",
            outcomeStatement: "Make it easier to capture findings while still in the forest.",
            originType: "native",
            lifecycleState: "active",
            importedReadinessState: null,
            lineageSourceType: null,
            lineageSourceId: null
          },
          epic: {
            id: "epic-native-1",
            key: "EPC-010",
            title: "Scoped native Epic",
            purpose: "Keep the branch explicit.",
            scopeBoundary: null,
            riskNote: null,
            originType: "native",
            lifecycleState: "active",
            importedReadinessState: null,
            lineageSourceType: null,
            lineageSourceId: null
          }
        },
        tollgate: null,
        tollgateReview: null,
        activities: [],
        readiness: {
          state: "blocked",
          reasons: []
        },
        valueSpineValidation: {
          state: "blocked",
          reasons: []
        },
        importedBuildBlockers: [],
        removal: {
          entityType: "story",
          entityId: "story-imported-2",
          key: "STR-011",
          title: "Imported story-backed idea",
          activeChildren: [],
          decision: {
            objectType: "story",
            lifecycleState: "active",
            recommendedAction: "archive",
            hardDelete: {
              kind: "hard_delete",
              allowed: true,
              reversible: false,
              reasonRequired: false,
              summary: "Story can be deleted.",
              blockers: [],
              affectedChildren: [],
              affectedActiveChildCount: 0,
              governanceImpact: {
                activityEventCount: 0,
                tollgateCount: 0,
                hasLineage: true,
                importedReadinessState: "imported_design_ready"
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
                activityEventCount: 0,
                tollgateCount: 0,
                hasLineage: true,
                importedReadinessState: "imported_design_ready"
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
                activityEventCount: 0,
                tollgateCount: 0,
                hasLineage: true,
                importedReadinessState: "imported_design_ready"
              }
            }
          }
        }
      }
    });

    render(
      await StoryIdeaWorkspacePage({
        params: Promise.resolve({ storyIdeaId: "story-imported-2" }),
        searchParams: Promise.resolve({})
      })
    );

    const link = screen.getByRole("link", { name: "Open source candidate review" });
    expect(link.getAttribute("href")).toBe("/intake?candidateId=candidate-story-2&entityId=story-imported-2&entityType=story");
    expect(screen.getByText("Imported source lineage")).toBeDefined();
  });
});
