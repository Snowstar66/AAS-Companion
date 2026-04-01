import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReviewPage from "@/app/(protected)/review/page";

vi.mock("@/lib/intake/review-queue", () => ({
  loadArtifactReviewQueue: vi.fn(async () => ({
    state: "ready",
    organizationName: "AAS Demo Organization",
    summary: {
      total: 1,
      pending: 0,
      followUpNeeded: 0,
      rejected: 0,
      promoted: 0
    },
    message: "Imported candidates are ready for human review.",
    items: [
      {
        id: "candidate-story-1",
        type: "story",
        title: "Imported reviewable story",
        summary: "As a builder I want imported candidates to stay traceable.",
        reviewStatus: "edited",
        importedReadinessState: "imported_human_review_needed",
        sourceSectionMarker: "## Story",
        draftRecord: {
          key: "IMP-STORY-1",
          title: "Imported reviewable story",
          storyType: "outcome_delivery",
          valueIntent: "Keep imported work traceable",
          acceptanceCriteria: ["Trace lineage in review"],
          aiUsageScope: ["Drafting"],
          testDefinition: "Review queue renders source traceability",
          definitionOfDone: ["Human review confirmed"],
          outcomeCandidateId: "candidate-outcome-1",
          epicCandidateId: "candidate-epic-1"
        },
        humanDecisions: {
          aiAccelerationLevel: "level_2",
          riskAcceptanceStatus: "needs_review",
          valueOwnerId: null,
          baselineValidity: null,
          riskProfile: null
        },
        complianceResult: {
          findings: [
            {
              code: "risk_acceptance_human_only",
              category: "human_only",
              message: "Risk acceptance status must be confirmed by a human reviewer.",
              fieldLabel: "Risk acceptance"
            }
          ],
          summary: {
            missing: 0,
            uncertain: 0,
            humanOnly: 1,
            blocked: 0
          },
          promotionBlocked: true,
          humanReviewRequired: true
        },
        issueDispositions: {},
        issueProgress: {
          total: 1,
          resolved: 0,
          unresolved: 1,
          categories: {
            missing: 0,
            uncertain: 0,
            humanOnly: 1,
            blocked: 0,
            unmapped: 0
          }
        },
        intakeSession: {
          id: "session-1",
          label: "Artifact intake 2026-03-23 21:00"
        },
        file: {
          id: "file-1",
          fileName: "story-pack.md",
          content: "# Story\n\nImported reviewable story",
          parsedArtifacts: {
            classification: {
              sourceType: "story_file",
              confidence: "high",
              rationale: "Detected story structure."
            },
            sections: [
              {
                id: "section-story",
                kind: "story_candidate",
                title: "Story",
                text: "Imported reviewable story",
                confidence: "high",
                isUncertain: false,
                sourceReference: {
                  fileId: "file-1",
                  fileName: "story-pack.md",
                  sectionId: "section-story",
                  sectionTitle: "Story",
                  sectionMarker: "## Story",
                  lineStart: 1,
                  lineEnd: 2
                }
              }
            ]
          }
        }
      }
    ]
  }))
}));

vi.mock("@/lib/review/operational-review", () => ({
  loadOperationalReviewDashboard: vi.fn(async () => ({
    state: "ready",
    organizationName: "AAS Demo Organization",
    summary: {
      total: 3,
      blocked: 1,
      inProgress: 1,
      deliveryStartReady: 1,
      outcomeTollgates: 1,
      storyReviews: 1
    },
    message: "Framing approvals and Delivery Story reviews with human work are collected here.",
    items: [
      {
        id: "outcome-1",
        workflow: "outcome_tollgate",
        entityType: "outcome",
        entityId: "outcome-1",
        key: "OUT-001",
        title: "Outcome tollgate approval",
        status: "blocked",
        tone: "blocked",
        actionLabel: "Open Framing approval",
        href: "/outcomes/outcome-1#tollgate-review",
        description: "Value owner is not assigned on the customer side.",
        context: "Outcome framing tollgate",
        blocker: "Value owner is not assigned on the customer side.",
        pendingLaneCount: 2,
        updatedAt: new Date("2026-03-27T08:00:00.000Z")
      },
      {
        id: "story-1",
        workflow: "story_review",
        entityType: "story",
        entityId: "story-1",
        key: "STR-003",
        title: "Delivery Story review",
        status: "ready",
        tone: "progress",
        actionLabel: "Open Delivery Story review",
        href: "/stories/story-1#story-signoff",
        description: "1 sign-off lane still remains before this Delivery Story is ready to start build.",
        context: "OUT-001 / EPC-001",
        blocker: null,
        pendingLaneCount: 1,
        updatedAt: new Date("2026-03-27T08:05:00.000Z")
      },
      {
        id: "handoff-1",
        workflow: "delivery_start",
        entityType: "story",
        entityId: "story-2",
        key: "STR-004",
        title: "Ready Delivery Story",
        status: "approved",
        tone: "success",
        actionLabel: "Open delivery start",
        href: "/handoff/story-2",
        description: "Delivery review is complete. Open the delivery start page to finalize the build package.",
        context: "OUT-001 / EPC-001",
        blocker: null,
        pendingLaneCount: 0,
        updatedAt: new Date("2026-03-27T08:10:00.000Z")
      }
    ]
  }))
}));

vi.mock("@/app/(protected)/review/actions", () => ({
  submitArtifactCandidateReviewAction: vi.fn()
}));

describe("Review queue page", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens as a backlog instead of a default full form", async () => {
    render(await ReviewPage({}));

    expect(screen.getByRole("heading", { name: "Human Review dashboard", level: 1 })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Human review lanes" })).toBeDefined();
    expect(screen.getAllByText("Framing approvals").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Delivery review").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Imported review backlog" })).toBeDefined();
    expect(screen.getByText(/Use this page whenever you want one answer to the question/i)).toBeDefined();
    expect(screen.getByText("Needs human action now")).toBeDefined();
    expect(screen.getByText("Imported decisions left")).toBeDefined();
    expect(screen.getByText("Outcome tollgate approval")).toBeDefined();
    expect(screen.getByText("Delivery Story review")).toBeDefined();
    expect(screen.getAllByRole("link", { name: "Open delivery start" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Choose one item to start")).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Focused correction workspace" })).toBeNull();
  });

  it("opens a focused correction workspace for the selected imported candidate", async () => {
    render(await ReviewPage({ searchParams: Promise.resolve({ candidateId: "candidate-story-1" }) }));

    expect(screen.getAllByRole("heading", { name: "Human Review dashboard", level: 1 }).length).toBeGreaterThan(0);
    expect(screen.getByText("Open human review help")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Parsed candidate" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Correction queue" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Focused correction workspace" })).toBeDefined();
    expect(screen.getAllByText("Imported reviewable story").length).toBeGreaterThan(0);
    expect(screen.getByText(/Risk acceptance status must be confirmed by a human reviewer\./)).toBeDefined();
    expect(screen.getByRole("button", { name: "Approve into project records" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Mark not relevant" })).toBeDefined();
    expect(screen.getByDisplayValue("IMP-STORY-1")).toBeDefined();
  });
});
