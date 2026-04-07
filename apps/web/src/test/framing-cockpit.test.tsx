import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FramingPage from "@/app/(protected)/framing/page";

vi.mock("@aas-companion/api", async () => {
  const actual = await vi.importActual<object>("@aas-companion/api");

  return {
    ...actual,
    getOutcomeWorkspaceService: vi.fn(async () => ({
      ok: true,
      data: {
        outcome: {
          id: "outcome-1",
          organizationId: "org_demo_control_plane",
          key: "OUT-001",
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
          blockers: ["Baseline definition is missing."],
          approverRoles: ["value_owner", "architect"],
          comments: null,
          status: "blocked"
        },
        tollgateReview: {
          status: "blocked",
          blockers: ["Baseline definition is missing."],
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
          approvalActions: [],
          pendingActions: [],
          blockedActions: [],
          signoffRecords: []
        },
        activities: [],
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
          entityId: "outcome-1",
          key: "OUT-001",
          title: "New customer case",
          activeChildren: [],
          decision: null
        }
      }
    }))
  };
});

vi.mock("@/lib/framing/cockpit", () => ({
  loadFramingCockpit: vi.fn(async () => ({
    session: {
      organization: {
        organizationId: "org_demo_control_plane",
        organizationName: "AAS Demo Organization"
      }
    },
    cockpit: {
      state: "live",
      organizationName: "AAS Demo Organization",
      message: "Outcome framing data is available and filterable.",
      summary: {
        total: 2,
        blocked: 1,
        ready: 1
      },
      items: [
        {
          id: "outcome-1",
          key: "OUT-001",
          title: "New customer case",
          status: "draft",
          statusLabel: "Draft",
          readinessLabel: "Blocked",
          readinessTone: "blocked",
          readinessDetail: "Baseline definition is missing.",
          isBlocked: true,
          blockers: ["Baseline definition is missing."],
          baselineComplete: false,
          ownerLabel: "Demo Value Owner",
          originType: "native",
          importedReadinessState: null,
          lineageHref: null,
          timeframe: "Q2 2026",
          epicCount: 0,
          directionSeedCount: 0,
          updatedAtLabel: "Mar 23",
          detailHref: "/framing?outcomeId=outcome-1"
        },
        {
          id: "outcome-2",
          key: "OUT-002",
          title: "Close the governance readiness gap",
          status: "ready_for_tg1",
          statusLabel: "Ready For TG1",
          readinessLabel: "Ready for framing review",
          readinessTone: "ready",
          readinessDetail: "Baseline fields are present and the outcome can continue toward TG1.",
          isBlocked: false,
          blockers: [],
          baselineComplete: true,
          ownerLabel: "Demo Value Owner",
          originType: "seeded",
          importedReadinessState: null,
          lineageHref: null,
          timeframe: "Q2 2026",
          epicCount: 1,
          directionSeedCount: 3,
          updatedAtLabel: "Mar 23",
          detailHref: "/framing?outcomeId=outcome-2"
        }
      ]
    }
  }))
}));

vi.mock("@/lib/cache/project-data", () => ({
  getCachedOutcomeWorkspaceData: vi.fn(async () => ({
    ok: true,
    data: {
      outcome: {
        id: "outcome-1",
        organizationId: "org_demo_control_plane",
        key: "OUT-001",
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
        blockers: ["Baseline definition is missing."],
        approverRoles: ["value_owner", "architect"],
        comments: null,
        status: "blocked"
      },
      tollgateReview: {
        status: "blocked",
        blockers: ["Baseline definition is missing."],
        comments: null,
        availablePeople: [],
        reviewActions: [],
        approvalActions: [],
        pendingActions: [],
        blockedActions: [],
        signoffRecords: []
      },
      activities: [],
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
        entityId: "outcome-1",
        key: "OUT-001",
        title: "New customer case",
        activeChildren: [],
        decision: null
      }
    }
  })),
  getCachedOutcomeTollgateReviewData: vi.fn(async () => ({
    ok: true,
    data: {
      outcome: {
        id: "outcome-1",
        aiAccelerationLevel: "level_2",
        framingVersion: 1,
        riskProfile: "medium",
        businessImpactLevel: null,
        businessImpactRationale: null,
        dataSensitivityLevel: null,
        dataSensitivityRationale: null,
        blastRadiusLevel: null,
        blastRadiusRationale: null,
        decisionImpactLevel: null,
        decisionImpactRationale: null
      },
      tollgate: {
        id: "tg-1",
        blockers: ["Baseline definition is missing."],
        approverRoles: ["value_owner", "architect"],
        comments: null,
        status: "blocked"
      },
      blockers: ["Baseline definition is missing."],
      framingComplete: false,
      tollgateReview: {
        status: "blocked",
        blockers: ["Baseline definition is missing."],
        comments: null,
        availablePeople: [],
        reviewActions: [],
        approvalActions: [],
        pendingActions: [],
        blockedActions: [],
        signoffRecords: []
      }
    }
  })),
  getCachedOrganizationUsersData: vi.fn(async () => ({ ok: true, data: [] })),
  getCachedOrganizationValueOwnersData: vi.fn(async () => ({ ok: true, data: [] }))
}));

vi.mock("@/app/(protected)/framing/actions", () => ({
  createDraftOutcomeAction: vi.fn()
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
  saveOutcomeWorkspaceAction: vi.fn(),
  stageOutcomeAiSuggestionAction: vi.fn(),
  submitOutcomeTollgateAction: vi.fn(),
  validateOutcomeStatementAiAction: vi.fn(),
  validateBaselineDefinitionAiAction: vi.fn()
}));

describe("Framing page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("opens the active framing directly again by default", async () => {
    render(await FramingPage({}));

    expect(await screen.findByText("Loading current framing")).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Framing Cockpit" })).toBeNull();
  });

  it("can still show the cockpit explicitly when requested", async () => {
    render(
      await FramingPage({
        searchParams: Promise.resolve({
          view: "cockpit"
        })
      })
    );

    expect(await screen.findByRole("heading", { name: "Framing Cockpit" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open active framing" })).toBeDefined();
  });

  it("shows a compact switcher instead of a full duplicate cockpit when demo content exists", async () => {
    render(
      await FramingPage({
        searchParams: Promise.resolve({
          outcomeId: "outcome-1"
        })
      })
    );

    expect(screen.getByRole("heading", { name: "Switch Framing" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open Demo Framing" })).toBeDefined();
    expect(screen.queryByRole("link", { name: "OUT-001: New customer case" })).toBeNull();
    expect(screen.getByText("The active framing is already open. Use this only when you intentionally want to switch branch or open Demo.")).toBeDefined();
  });
});
