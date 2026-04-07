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
          id: "story-delivery-1",
          organizationId: "org_demo_control_plane",
          outcomeId: "outcome-native-1",
          epicId: "epic-native-1",
          key: "STR-001",
          title: "Create weekly delivery summary",
          storyType: "outcome_delivery",
          valueIntent: "Turn one approved Story Idea into a buildable delivery unit.",
          expectedBehavior: "A delivery-ready summary can be exported and reviewed.",
          uxSketchName: null,
          uxSketchContentType: null,
          uxSketchDataUrl: null,
          uxSketches: [],
          acceptanceCriteria: ["Summary exports without missing fields."],
          aiUsageScope: [],
          aiAccelerationLevel: "level_2",
          testDefinition: "Verify export payload and review visibility.",
          definitionOfDone: ["Export passes review", "Traceability remains visible"],
          sourceDirectionSeedId: "seed-1",
          status: "draft",
          originType: "imported",
          createdMode: "shared",
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null,
          lineageSourceType: "artifact_aas_candidate",
          lineageSourceId: "candidate-story-1",
          lineageNote: null,
          importedReadinessState: "ready_for_review",
          outcome: {
            id: "outcome-native-1",
            key: "OUT-010",
            title: "Scoped native Framing",
            problemStatement: "Weekly reporting still requires manual consolidation.",
            outcomeStatement: "Make weekly reporting easier to review and hand off.",
            originType: "native",
            lifecycleState: "active",
            importedReadinessState: null,
            lineageSourceType: null,
            lineageSourceId: null
          },
          epic: {
            id: "epic-native-1",
            key: "EPC-010",
            title: "Reporting",
            purpose: "Package reporting work into reviewable delivery slices.",
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
          blockers: [],
          approverRoles: ["delivery_lead"],
          comments: null,
          status: "ready"
        },
        tollgateReview: {
          status: "ready",
          blockers: [],
          comments: null,
          availablePeople: [],
          reviewActions: [],
          approvalActions: [],
          pendingActions: [],
          blockedActions: [],
          signoffRecords: []
        },
        activities: [
          {
            id: "activity-story-created",
            eventType: "story_created",
            createdAt: new Date("2026-04-07T07:00:00.000Z")
          }
        ],
        readiness: {
          state: "ready",
          reasons: []
        },
        valueSpineValidation: {
          state: "ready",
          reasons: []
        },
        importedBuildBlockers: [],
        originStoryIdea: {
          seedId: "seed-1",
          storyId: null,
          key: "SC-001",
          title: "Weekly summary",
          epicId: "epic-native-1",
          outcomeId: "outcome-native-1",
          valueIntent: "Give reviewers a clear weekly summary.",
          expectedBehavior: "The summary is visible and complete."
        },
        derivedDeliveryStories: [],
        removal: {
          entityType: "story",
          entityId: "story-delivery-1",
          key: "STR-001",
          title: "Create weekly delivery summary",
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
                activityEventCount: 1,
                tollgateCount: 1,
                hasLineage: true,
                importedReadinessState: "ready_for_review"
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
                tollgateCount: 1,
                hasLineage: true,
                importedReadinessState: "ready_for_review"
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
                tollgateCount: 1,
                hasLineage: true,
                importedReadinessState: "ready_for_review"
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
  saveStoryWorkspaceInlineAction: vi.fn(),
  saveStoryWorkspaceAction: vi.fn(),
  validateStoryExpectedBehaviorAiAction: vi.fn()
}));

describe("Delivery Story page", () => {
  it("renders a created delivery story without crashing", async () => {
    render(
      await StoryWorkspacePage({
        params: Promise.resolve({ storyId: "story-delivery-1" }),
        searchParams: Promise.resolve({ created: "1", createdAs: "delivery" })
      })
    );

    expect(screen.getByText("Delivery Story created from the selected Story Idea.")).toBeDefined();
    expect(screen.getAllByText("Delivery Story").length).toBeGreaterThan(0);
    expect(screen.getByText("Delivery Story definition")).toBeDefined();
    expect(screen.getByRole("link", { name: "Open build package" })).toBeDefined();
    expect(screen.getByText("Origin Story Idea")).toBeDefined();
    expect(screen.getAllByText("Create weekly delivery summary").length).toBeGreaterThan(0);
  });
});
