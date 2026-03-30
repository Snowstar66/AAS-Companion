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
          expectedBehavior: "Capture a mushroom find quickly enough to guide later design decisions.",
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
  saveStoryWorkspaceAction: vi.fn(),
  submitStoryReadinessAction: vi.fn(),
  validateStoryExpectedBehaviorAiAction: vi.fn()
}));

describe("Story Workspace page", () => {
  it("keeps pre-approval story work focused on framing clarity instead of delivery workflow", async () => {
    render(
      await StoryWorkspacePage({
        params: Promise.resolve({ storyId: "story-native-1" }),
        searchParams: Promise.resolve({ created: "1" })
      })
    );

    expect(screen.getByText("Native Story idea created inside the current Framing.")).toBeDefined();
    expect(screen.getAllByText("Scoped native Story").length).toBeGreaterThan(0);
    expect(screen.getByText("Story idea")).toBeDefined();
    expect(screen.getByText("Story idea definition")).toBeDefined();
    expect(screen.getAllByText("Expected behavior").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "AI validate" })).toBeDefined();
    expect(screen.getAllByText("Epic alignment").length).toBeGreaterThan(0);
    expect(screen.getByText("Branch context")).toBeDefined();
    expect(screen.getAllByText(/OUT-010\s+Scoped native Framing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/EPC-010\s+Scoped native Epic/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Keep Story work inside the active Framing branch.").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Story path:/i)).toBeNull();
    expect(screen.queryByRole("link", { name: "Preview Execution Contract" })).toBeNull();
    expect(screen.getByRole("link", { name: "Back to current Epic" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open current Framing" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open Governance readiness" })).toBeDefined();
    expect(screen.getByText("Delivery review later")).toBeDefined();
    expect(screen.getByText("Delivery details later")).toBeDefined();
    expect(screen.getAllByText("AI level").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Capture a mushroom find quickly enough to guide later design decisions.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Make it easier to capture findings while still in the forest.").length).toBeGreaterThan(0);
    expect(screen.queryByText("Value Spine validation")).toBeNull();
  });
});
