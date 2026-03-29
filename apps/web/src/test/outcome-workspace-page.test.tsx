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
          stories: []
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
          reviewActions: [
            {
              decisionKind: "review",
              roleType: "architect",
              organizationSide: "supplier",
              label: "Architecture review",
              assignedPeople: [],
              completedRecords: [],
              pending: true,
              blockedReasons: ["No active architect is currently assigned on the supplier side."]
            }
          ],
          approvalActions: [
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
              label: "Architecture review",
              roleType: "architect",
              organizationSide: "supplier"
            }
          ],
          blockedActions: [
            {
              label: "Architecture review",
              blockedReasons: ["No active architect is currently assigned on the supplier side."]
            }
          ],
          signoffRecords: []
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

vi.mock("@/app/(protected)/outcomes/[outcomeId]/actions", () => ({
  archiveOutcomeAction: vi.fn(),
  createEpicFromOutcomeAction: vi.fn(),
  hardDeleteOutcomeAction: vi.fn(),
  initialReviewOutcomeFramingAiActionState: {
    status: "idle",
    message: null,
    report: null
  },
  recordOutcomeTollgateDecisionAction: vi.fn(),
  reviewOutcomeFramingWithAiAction: vi.fn(),
  restoreOutcomeAction: vi.fn(),
  saveOutcomeWorkspaceAction: vi.fn(),
  stageOutcomeAiSuggestionAction: vi.fn(),
  submitOutcomeTollgateAction: vi.fn(),
  validateOutcomeStatementAiAction: vi.fn(),
  validateBaselineDefinitionAiAction: vi.fn()
}));

describe("Outcome page", () => {
  it("shows native provenance and blocked TG1 posture for a clean draft case", async () => {
    render(
      await OutcomeWorkspacePage({
        params: Promise.resolve({ outcomeId: "outcome-native-1" }),
        searchParams: Promise.resolve({ created: "1" })
      })
    );

    expect(screen.getByText("Clean native case created and ready for framing work.")).toBeDefined();
    expect(screen.getByText("Case provenance")).toBeDefined();
    expect(screen.getByText("Active Framing context")).toBeDefined();
    expect(screen.getByText("Current native working scope")).toBeDefined();
    expect(screen.getAllByText("Origin: Native").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Project mode: Clean").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Status: draft").length).toBeGreaterThan(0);
    expect(screen.getByText("Framing value spine")).toBeDefined();
    expect(screen.getByText("Customer handshake")).toBeDefined();
    expect(screen.getAllByText("AI validate").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "AI review framing" })).toBeDefined();
    expect(screen.getAllByText("Export framing brief").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Copy Framing Markdown" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Copy Framing JSON" })).toBeDefined();
    expect(screen.getByText("AI and risk posture")).toBeDefined();
    expect(screen.getByRole("combobox", { name: /AI level/i })).toBeDefined();
    expect(screen.getByText("Design direction seeds")).toBeDefined();
    expect(screen.getByText("No Epics exist for this case yet.")).toBeDefined();
    expect(screen.getByText("No Epics are attached to this Framing yet.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create Epic" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open Governance readiness" })).toBeDefined();
    expect(screen.getByText("Framing tollgate")).toBeDefined();
    expect(screen.getByRole("button", { name: "Submit to Tollgate" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("Remove or archive in this project")).toBeDefined();
  });
});
