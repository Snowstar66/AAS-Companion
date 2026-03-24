import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

vi.mock("@/app/(protected)/review/actions", () => ({
  submitArtifactCandidateReviewAction: vi.fn()
}));

describe("Review queue page", () => {
  it("renders Human Review as an action list for the selected imported candidate", async () => {
    render(await ReviewPage({ searchParams: Promise.resolve({ candidateId: "candidate-story-1" }) }));

    expect(screen.getByRole("heading", { name: "Human Review action list", level: 1 })).toBeDefined();
    expect(screen.getByText("Open human review help")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Current review context" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Approval-readiness action list" })).toBeDefined();
    expect(screen.getAllByText("Imported reviewable story").length).toBeGreaterThan(0);
    expect(screen.getByText(/Risk acceptance status must be confirmed by a human reviewer\./)).toBeDefined();
    expect(screen.getByRole("button", { name: "Promote into project records" })).toBeDefined();
    expect(screen.getByDisplayValue("IMP-STORY-1")).toBeDefined();
  });
});
