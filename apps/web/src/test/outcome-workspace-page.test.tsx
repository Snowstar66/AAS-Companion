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
          lifecycleState: "active",
          archivedAt: null,
          archiveReason: null,
          lineageSourceType: null,
          lineageSourceId: null,
          lineageNote: null,
          importedReadinessState: null,
          createdAt: new Date("2026-03-23T20:00:00.000Z"),
          updatedAt: new Date("2026-03-23T20:00:00.000Z"),
          epics: [],
          stories: [],
          directionSeeds: []
        },
        tollgate: {
          id: "tg-1",
          blockers: ["Baseline definition is missing.", "Baseline source is missing."],
          approverRoles: ["value_owner", "architect"],
          comments: null,
          status: "blocked"
        },
        tollgateReview: {
          status: "blocked",
          blockers: ["Baseline definition is missing.", "Baseline source is missing."],
          comments: null,
          availablePeople: [
            {
              id: "party-vo",
              fullName: "Demo Value Owner",
              roleType: "value_owner",
              organizationSide: "customer",
              roleTitle: "Value Owner"
            }
          ],
          reviewActions: [],
          approvalActions: [
            {
              decisionKind: "approval",
              roleType: "architect",
              organizationSide: "supplier",
              label: "Architecture approval",
              assignedPeople: [],
              completedRecords: [],
              pending: true,
              blockedReasons: ["No active architect is currently assigned on the supplier side."]
            },
            {
              decisionKind: "approval",
              roleType: "value_owner",
              organizationSide: "customer",
              label: "Business value approval",
              assignedPeople: [
                {
                  partyRoleEntryId: "party-vo",
                  fullName: "Demo Value Owner",
                  email: "value.owner@aas-companion.local",
                  roleTitle: "Value Owner"
                }
              ],
              completedRecords: [],
              pending: true,
              blockedReasons: []
            }
          ],
          pendingActions: [
            {
              label: "Architecture approval",
              roleType: "architect",
              organizationSide: "supplier"
            }
          ],
          blockedActions: [
            {
              label: "Architecture approval",
              blockedReasons: ["No active architect is currently assigned on the supplier side."]
            }
          ],
          signoffRecords: [],
          requiredReviewRoles: [],
          requiredApprovalRoles: [
            {
              decisionKind: "approval",
              roleType: "architect",
              organizationSide: "supplier",
              label: "Architecture approval"
            },
            {
              decisionKind: "approval",
              roleType: "value_owner",
              organizationSide: "customer",
              label: "Business value approval"
            }
          ]
        },
        activities: [
          {
            id: "activity-1",
            eventType: "outcome_created",
            createdAt: new Date("2026-03-23T20:00:00.000Z")
          }
        ],
        availableOwners: [],
        readiness: {
          state: "blocked",
          reasons: [
            {
              code: "baseline_definition_missing",
              message: "Baseline definition is missing.",
              severity: "high"
            }
          ]
        },
        removal: {
          entityType: "outcome",
          entityId: "outcome-native-1",
          key: "OUT-003",
          title: "New customer case",
          activeChildren: [],
          decision: {
            objectType: "outcome",
            lifecycleState: "active",
            recommendedAction: "hard_delete",
            hardDelete: {
              kind: "hard_delete",
              allowed: true,
              reversible: false,
              reasonRequired: false,
              summary: "Outcome is still an eligible native draft.",
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
              summary: "Outcome can be archived.",
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
              summary: "Outcome is already active.",
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

vi.mock("@/lib/cache/project-data", () => ({
  getCachedOrganizationUsersData: vi.fn(async () => ({
    ok: true,
    data: []
  })),
  getCachedOrganizationValueOwnersData: vi.fn(async () => ({
    ok: true,
    data: []
  })),
  getCachedOutcomeTollgateReviewData: vi.fn(async () => ({
    ok: true,
    data: {
      outcome: {
        id: "outcome-native-1",
        framingVersion: 1
      },
      blockers: ["Baseline definition is missing.", "Baseline source is missing."],
      tollgateReview: {
        status: "blocked",
        blockers: ["Baseline definition is missing.", "Baseline source is missing."],
        approvalSnapshot: null,
        approvedVersion: null,
        approvalActions: [],
        reviewActions: [],
        blockedActions: [],
        pendingActions: [],
        approvalDocument: null
      }
    }
  })),
  getCachedOutcomeWorkspaceData: vi.fn(async () => ({
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
        lifecycleState: "active",
        archivedAt: null,
        archiveReason: null,
        lineageSourceType: null,
        lineageSourceId: null,
        lineageNote: null,
        importedReadinessState: null,
        createdAt: new Date("2026-03-23T20:00:00.000Z"),
        updatedAt: new Date("2026-03-23T20:00:00.000Z"),
        epics: [],
        stories: [],
        directionSeeds: []
      },
      tollgate: {
        id: "tg-1",
        blockers: ["Baseline definition is missing.", "Baseline source is missing."],
        approverRoles: ["value_owner", "architect"],
        comments: null,
        status: "blocked"
      },
      tollgateReview: {
        status: "blocked",
        blockers: ["Baseline definition is missing.", "Baseline source is missing."],
        comments: null,
        availablePeople: [
          {
            id: "party-vo",
            fullName: "Demo Value Owner",
            roleType: "value_owner",
            organizationSide: "customer",
            roleTitle: "Value Owner"
          }
        ],
        reviewActions: [],
        approvalActions: [
          {
            decisionKind: "approval",
            roleType: "architect",
            organizationSide: "supplier",
            label: "Architecture approval",
            assignedPeople: [],
            completedRecords: [],
            pending: true,
            blockedReasons: ["No active architect is currently assigned on the supplier side."]
          },
          {
            decisionKind: "approval",
            roleType: "value_owner",
            organizationSide: "customer",
            label: "Business value approval",
            assignedPeople: [
              {
                partyRoleEntryId: "party-vo",
                fullName: "Demo Value Owner",
                email: "value.owner@aas-companion.local",
                roleTitle: "Value Owner"
              }
            ],
            completedRecords: [],
            pending: true,
            blockedReasons: []
          }
        ],
        pendingActions: [
          {
            label: "Architecture approval",
            roleType: "architect",
            organizationSide: "supplier"
          }
        ],
        blockedActions: [
          {
            label: "Architecture approval",
            blockedReasons: ["No active architect is currently assigned on the supplier side."]
          }
        ],
        signoffRecords: [],
        requiredReviewRoles: [],
        requiredApprovalRoles: [
          {
            decisionKind: "approval",
            roleType: "architect",
            organizationSide: "supplier",
            label: "Architecture approval"
          },
          {
            decisionKind: "approval",
            roleType: "value_owner",
            organizationSide: "customer",
            label: "Business value approval"
          }
        ]
      },
      activities: [
        {
          id: "activity-1",
          eventType: "outcome_created",
          createdAt: new Date("2026-03-23T20:00:00.000Z")
        }
      ],
      availableOwners: [],
      readiness: {
        state: "blocked",
        reasons: [
          {
            code: "baseline_definition_missing",
            message: "Baseline definition is missing.",
            severity: "high"
          }
        ]
      },
      removal: {
        entityType: "outcome",
        entityId: "outcome-native-1",
        key: "OUT-003",
        title: "New customer case",
        activeChildren: [],
        decision: {
          objectType: "outcome",
          lifecycleState: "active",
          recommendedAction: "hard_delete",
          hardDelete: {
            kind: "hard_delete",
            allowed: true,
            reversible: false,
            reasonRequired: false,
            summary: "Outcome is still an eligible native draft.",
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
            summary: "Outcome can be archived.",
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
            summary: "Outcome is already active.",
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
}));

vi.mock("@/app/(protected)/outcomes/[outcomeId]/actions", () => ({
  archiveOutcomeAction: vi.fn(),
  createEpicFromOutcomeAction: vi.fn(),
  createStoryIdeaFromOutcomeAction: vi.fn(),
  hardDeleteOutcomeAction: vi.fn(),
  initialReviewOutcomeFramingAiActionState: {
    status: "idle",
    message: null,
    report: null
  },
  recordOutcomeTollgateDecisionAction: vi.fn(),
  reviewOutcomeFramingWithAiAction: vi.fn(),
  restoreOutcomeAction: vi.fn(),
  saveOutcomeWorkspaceInlineAction: vi.fn(),
  saveOutcomeWorkspaceAction: vi.fn(),
  stageOutcomeAiSuggestionAction: vi.fn(),
  submitOutcomeTollgateAction: vi.fn(),
  validateOutcomeStatementAiAction: vi.fn(),
  validateBaselineDefinitionAiAction: vi.fn()
}));

describe("Outcome page", () => {
  it(
    "shows native provenance and blocked TG1 posture for a clean draft case",
    async () => {
    render(
      await OutcomeWorkspacePage({
        params: Promise.resolve({ outcomeId: "outcome-native-1" }),
        searchParams: Promise.resolve({ created: "1" })
      })
    );

    expect(await screen.findByText("Clean native case created and ready for framing work.")).toBeDefined();
    expect(await screen.findByText("Case provenance")).toBeDefined();
    expect(await screen.findByText("Active Framing context")).toBeDefined();
    expect(await screen.findByText("Current native working scope")).toBeDefined();
    expect((await screen.findAllByText("Origin: Native")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Project mode: Clean")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Status: Needs action")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("AI validate")).length).toBeGreaterThan(0);
    expect(await screen.findByRole("button", { name: "AI review framing" })).toBeDefined();
    expect((await screen.findAllByText("Export framing packages")).length).toBeGreaterThan(0);
    expect(await screen.findByRole("button", { name: "Copy Framing Brief" })).toBeDefined();
    expect(await screen.findByRole("button", { name: "Copy AI Handoff JSON" })).toBeDefined();
    expect(await screen.findByText("AI and risk")).toBeDefined();
    expect(await screen.findByText("No Epics exist for this case yet.")).toBeDefined();
    expect(await screen.findByRole("button", { name: "Create Epic" })).toBeDefined();
    expect((await screen.findByRole("button", { name: "Create Story Idea" })).hasAttribute("disabled")).toBe(true);
    expect(await screen.findByText("Remove or archive in this project")).toBeDefined();
    },
    15000
  );
});
