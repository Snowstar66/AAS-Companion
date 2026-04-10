import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OutcomeApprovalDocumentPage from "@/app/(protected)/outcomes/[outcomeId]/approval-document/page";

vi.mock("@/app/(protected)/outcomes/[outcomeId]/approval-document/actions", () => ({
  uploadOutcomeTraceabilityEvidenceAction: vi.fn(async () => {})
}));

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: vi.fn(async () => ({
    organization: {
      organizationId: "org-demo",
      organizationName: "AAS Demo Organization"
    }
  }))
}));

vi.mock("@/lib/cache/project-data", () => ({
  getCachedOutcomeTollgateReviewData: vi.fn(async () => ({
    ok: true,
    data: {
      tollgateReview: {
        approvalSnapshot: {
          kind: "framing_approval_document",
          version: 1,
          approvedVersion: 30,
          approvedAt: "2026-04-08T14:56:14.315Z",
          outcome: {
            outcomeId: "outcome-1",
            key: "OUT-001",
            title: "Preparedness app",
            problemStatement: "Users need a calmer preparation flow.",
            outcomeStatement: "Users can understand and improve their readiness.",
            timeframe: "Q2 2026",
            valueOwner: "Anne Hathaway",
            baselineDefinition: "Checklist completion and inventory confidence.",
            baselineSource: "Approved Framing",
            solutionContext: null,
            constraints: null,
            dataSensitivity: "Low",
            deliveryType: "AD",
            aiLevel: "level_2",
            riskProfile: "medium",
            riskRationale: {
              businessImpact: "medium: Missing scope would reduce customer trust.",
              dataSensitivity: "low: Demo-level household data only.",
              blastRadius: "low: Standalone app.",
              decisionImpact: "low: AI assists but does not decide."
            }
          },
          epics: [
            {
              key: "EPIC-001",
              title: "Household profile",
              purpose: "Capture the household setup.",
              scopeBoundary: "MVP only"
            },
            {
              key: "EPIC-002",
              title: "Inventory",
              purpose: "Track current inventory.",
              scopeBoundary: "MVP only"
            }
          ],
          storyIdeas: [
            {
              key: "STORY-001",
              title: "Capture household profile",
              linkedEpic: "EPIC-001",
              valueIntent: "Understand the household composition.",
              expectedBehavior: "The app stores the household profile.",
              sourceType: "direction_seed"
            },
            {
              key: "STORY-002",
              title: "Create reminder",
              linkedEpic: "EPIC-002",
              valueIntent: "Bring users back to maintain data.",
              expectedBehavior: "The app lets users set a reminder.",
              sourceType: "direction_seed"
            }
          ],
          traceabilityEvidence: {
            sourcePath: "traceability-export.csv",
            uploadedAt: "2026-04-10T08:00:00.000Z",
            rows: [
              {
                matchKey: "OUT-001::STORY-001::US-01::1.2",
                outcomeKey: "OUT-001",
                sourceOriginIds: ["STORY-001"],
                sourceOriginNote: "Direct mapping from approved idea.",
                refinedStoryId: "US-01",
                refinedStoryTitle: "Registrera hushallsprofil",
                epicId: "E1",
                epicStoryIds: ["1.2"],
                epicStoryTitle: "Registrera hushallsprofil",
                implementationArtifacts: ["_bmad-output/implementation-artifacts/1-2-register-household-profile.md"],
                implementationStatus: "review",
                sourceValueIntent: "Capture household composition.",
                sourceExpectedBehavior: "The app stores the profile.",
                acceptanceCriteriaSummary: "Profile persists locally.",
                testEvidence: ["apps/web/src/features/household-profile/__tests__/household-profile-form.test.tsx"],
                codeEvidence: ["apps/web/src/features/household-profile/components/household-profile-form.tsx"],
                definitionOfDone: "Tests pass."
              },
              {
                matchKey: "OUT-001::ADDED::US-14::4.1",
                outcomeKey: "OUT-001",
                sourceOriginIds: ["ADDED"],
                sourceOriginNote: "Added during refinement to guarantee direct guide access from the home screen.",
                refinedStoryId: "US-14",
                refinedStoryTitle: "Snabbhjalpslage fran startsidan",
                epicId: "E4",
                epicStoryIds: ["4.1"],
                epicStoryTitle: "Oppna snabbhjalp fran startskarmen",
                implementationArtifacts: ["_bmad-output/implementation-artifacts/4-1-open-quick-help-from-home-screen.md"],
                implementationStatus: "review",
                sourceValueIntent: "Enable direct guide access under stress.",
                sourceExpectedBehavior: "The app opens quick help from home.",
                acceptanceCriteriaSummary: "Quick help remains available without profile setup.",
                testEvidence: ["apps/web/src/features/guides/__tests__/quick-help-route.test.tsx"],
                codeEvidence: ["apps/web/src/app/routes/quick-help-route.tsx"],
                definitionOfDone: "Quick help flow works."
              },
              {
                matchKey: "OUT-001::NFR-001::US-17::6.1|6.2",
                outcomeKey: "OUT-001",
                sourceOriginIds: ["NFR-001"],
                sourceOriginNote: "Derived from offline non-functional requirement.",
                refinedStoryId: "US-17",
                refinedStoryTitle: "Anvand karnfloden offline",
                epicId: "E6",
                epicStoryIds: ["6.1", "6.2"],
                epicStoryTitle: "Offline support",
                implementationArtifacts: ["_bmad-output/implementation-artifacts/6-1-preserve-core-flows-locally-between-sessions.md"],
                implementationStatus: "review",
                sourceValueIntent: "Keep core flows available offline.",
                sourceExpectedBehavior: "The app works from local data when offline.",
                acceptanceCriteriaSummary: "Offline state remains visible.",
                testEvidence: ["apps/web/src/features/offline-sync/__tests__/offline-state-banner.test.tsx"],
                codeEvidence: ["apps/web/src/features/offline-sync/components/offline-state-banner.tsx"],
                definitionOfDone: "Offline banner and persistence work."
              },
              {
                matchKey: "OUT-001::STORY-002::US-18::2.1|2.2",
                outcomeKey: "OUT-001",
                sourceOriginIds: ["STORY-002"],
                sourceOriginNote: "Split into two implementation slices during refinement.",
                refinedStoryId: "US-18",
                refinedStoryTitle: "Paminn om uppdatering",
                epicId: "E2",
                epicStoryIds: ["2.1", "2.2"],
                epicStoryTitle: "Reminder flow",
                implementationArtifacts: ["_bmad-output/implementation-artifacts/2-1-reminder-flow.md"],
                implementationStatus: "review",
                sourceValueIntent: "Bring users back to maintain data.",
                sourceExpectedBehavior: "The app lets users set reminder schedules.",
                acceptanceCriteriaSummary: "Users can create and edit reminders.",
                testEvidence: ["apps/web/src/features/reminders/__tests__/reminder-settings.test.tsx"],
                codeEvidence: ["apps/web/src/features/reminders/components/reminder-settings.tsx"],
                definitionOfDone: "Reminder flow works."
              }
            ]
          },
          signoffs: []
        }
      }
    }
  })),
  getCachedOutcomeWorkspaceData: vi.fn(async () => ({
    ok: true,
    data: {
      outcome: {
        id: "outcome-1",
        epics: [
          {
            id: "epic-1",
            key: "EPIC-001",
            title: "Household profile"
          },
          {
            id: "epic-3",
            key: "EPIC-003",
            title: "Quick help"
          }
        ],
        directionSeeds: [
          {
            id: "seed-1",
            key: "STORY-001",
            title: "Capture household profile",
            sourceStoryId: null,
            lifecycleState: "active"
          },
          {
            id: "seed-2",
            key: "STORY-002",
            title: "Create reminder",
            sourceStoryId: null,
            lifecycleState: "active"
          }
        ],
        stories: [
          {
            id: "delivery-1",
            key: "DST-001",
            title: "Profile delivery story",
            epicId: "epic-1",
            sourceDirectionSeedId: "seed-1",
            status: "ready_for_handoff",
            acceptanceCriteria: ["Criterion"],
            definitionOfDone: ["Done"],
            testDefinition: "Tests",
            lifecycleState: "active"
          },
          {
            id: "delivery-extra",
            key: "DST-099",
            title: "Quick help shortcut",
            epicId: "epic-3",
            sourceDirectionSeedId: null,
            status: "ready_for_handoff",
            acceptanceCriteria: ["Criterion"],
            definitionOfDone: [],
            testDefinition: null,
            lifecycleState: "active"
          }
        ]
      }
    }
  }))
}));

vi.mock("@/lib/outcomes/traceability-evidence", () => ({
  getStoredTraceabilityEvidenceSnapshot: vi.fn((approvalSnapshot) => approvalSnapshot.traceabilityEvidence ?? null),
  loadTraceabilityEvidenceForOutcome: vi.fn(async () => null),
  getTraceabilityRowsForOrigin: vi.fn((rows, originId: string) => rows.filter((row: { sourceOriginIds: string[] }) => row.sourceOriginIds.includes(originId))),
  getOutsideHandshakeTraceabilityRows: vi.fn((rows) => rows.filter((row: { sourceOriginIds: string[] }) => row.sourceOriginIds.includes("ADDED"))),
  getNfrTraceabilityRows: vi.fn((rows) => rows.filter((row: { sourceOriginIds: string[] }) => row.sourceOriginIds.some((id) => id.startsWith("NFR-"))))
}));

afterEach(() => {
  cleanup();
});

describe("Outcome approval document page", () => {
  it("counts imported BMAD evidence in handshake coverage and summary cards", async () => {
    render(await OutcomeApprovalDocumentPage({ params: Promise.resolve({ outcomeId: "outcome-1" }) }));

    expect(screen.getByText("Handshake delivery coverage")).toBeDefined();
    expect(screen.getByText("Approved ideas")).toBeDefined();
    expect(screen.getByText("BMAD traceability evidence")).toBeDefined();
    expect(screen.getAllByText("Covered").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Reshaped").length).toBeGreaterThan(0);
    expect(screen.queryByText("Not implemented")).toBeNull();
    expect(screen.getByText("Additional delivery outside the approved handshake")).toBeDefined();
    expect(screen.getByText(/DST-099/i)).toBeDefined();
    expect(screen.getAllByText(/STORY-002 Create reminder/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/US-01 Registrera hushallsprofil/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/US-18 Paminn om uppdatering/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/US-14 Snabbhjalpslage fran startsidan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Approved value intent:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Approved expected behavior:/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Import BMAD traceability CSV")).toBeDefined();
    expect(screen.getByText("Replace traceability CSV")).toBeDefined();
    expect(screen.getByText(/The imported CSV is the saved source material/i)).toBeDefined();
    expect(screen.getByText(/Imported BMAD rows are shown directly under the approved Story Idea/i)).toBeDefined();
    expect(screen.getByText(/No current AAS Delivery Story is linked directly yet/i)).toBeDefined();
    expect(screen.getAllByText(/BMAD rows:/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Acceptance and done").length).toBeGreaterThan(0);
  });
});
