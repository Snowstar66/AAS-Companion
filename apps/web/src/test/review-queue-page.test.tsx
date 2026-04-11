import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReviewPage from "@/app/(protected)/review/page";
import { loadArtifactReviewQueue } from "@/lib/intake/review-queue";

const { loadArtifactIntakeWorkspaceMock } = vi.hoisted(() => ({
  loadArtifactIntakeWorkspaceMock: vi.fn(async () => ({
    state: "ready",
    organizationName: "AAS Demo Organization",
    projectOutcomes: [
      {
        id: "project-outcome-1",
        key: "OUT-001",
        title: "Primary project outcome"
      }
    ],
    projectEpics: [
      {
        id: "candidate-epic-1",
        key: "EPC-001",
        title: "Imported epic",
        outcomeId: "project-outcome-1"
      }
    ],
    sessions: [
      {
        id: "session-1",
        label: "Artifact intake 2026-03-23 21:00",
        importIntent: "framing",
        files: [
          {
            id: "file-1",
            fileName: "story-pack.md"
          }
        ],
        candidates: [
          {
            id: "candidate-story-1",
            fileId: "file-1",
            type: "story",
            title: "Imported reviewable story",
            reviewStatus: "edited",
            draftRecord: {
              key: "SC-001",
              title: "Imported reviewable story",
              valueIntent: "Keep imported work traceable",
              expectedBehavior: null,
              acceptanceCriteria: [],
              storyType: "outcome_delivery",
              outcomeCandidateId: "project-outcome-1",
              epicCandidateId: "candidate-epic-1"
            },
            complianceResult: {
              findings: []
            },
            issueProgress: {
              total: 0,
              resolved: 0,
              unresolved: 0,
              categories: {
                missing: 0,
                uncertain: 0,
                humanOnly: 0,
                blocked: 0,
                unmapped: 0
              }
            },
            file: {
              id: "file-1",
              fileName: "story-pack.md"
            }
          }
        ]
      }
    ]
  }))
}));

vi.mock("@/lib/intake/review-queue", () => ({
  loadArtifactReviewQueue: vi.fn(async () => ({
    state: "ready",
    organizationName: "AAS Demo Organization",
    selectedCandidate: null,
    projectOutcomes: [
      {
        id: "project-outcome-1",
        key: "OUT-001",
        title: "Primary project outcome"
      }
    ],
    projectEpics: [
      {
        id: "candidate-epic-1",
        key: "EPC-001",
        title: "Imported epic",
        outcomeId: "project-outcome-1"
      }
    ],
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
          outcomeCandidateId: "project-outcome-1",
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
          label: "Artifact intake 2026-03-23 21:00",
          importIntent: "framing"
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

vi.mock("@/lib/intake/workspace", () => ({
  loadArtifactIntakeWorkspace: loadArtifactIntakeWorkspaceMock
}));

vi.mock("@/components/intake/artifact-intake-review-workspace", () => ({
  ArtifactIntakeReviewWorkspace: ({
    session,
    selectedFile,
    selectedCandidate
  }: {
    session: { label: string };
    selectedFile: { fileName: string };
    selectedCandidate: { title: string };
  }) => (
    <div>
      <h2>Framing import workspace</h2>
      <p>{session.label}</p>
      <p>{selectedFile.fileName}</p>
      <p>{selectedCandidate.title}</p>
    </div>
  )
}));

vi.mock("@/components/review/outcome-tollgate-approval-section", () => ({
  OutcomeTollgateApprovalSection: ({ outcomeId }: { outcomeId: string }) => (
    <div>
      <h2>Human review approval workspace</h2>
      <p>{outcomeId}</p>
    </div>
  ),
  OutcomeTollgateSectionFallback: () => <div>Loading tollgate follow-up</div>
}));

vi.mock("@/lib/review/operational-review", () => ({
  loadOperationalReviewDashboard: vi.fn(async () => ({
    state: "ready",
    organizationName: "AAS Demo Organization",
    summary: {
      total: 1,
      blocked: 1,
      inProgress: 0,
      deliveryStartReady: 0,
      outcomeTollgates: 1,
      storyReviews: 0
    },
    message: "Framing approvals with human work are collected here.",
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
        actionLabel: "Open approval workspace",
        href: "/review?reviewOutcomeId=outcome-1#approval-workspace",
        description: "Value owner is not assigned on the customer side.",
        context: "Outcome framing tollgate",
        blocker: "Value owner is not assigned on the customer side.",
        pendingLaneCount: 2,
        updatedAt: new Date("2026-03-27T08:00:00.000Z")
      }
    ]
  }))
}));

vi.mock("@/app/(protected)/review/actions", () => ({
  deleteArtifactIntakeSessionAction: vi.fn(),
  submitArtifactCandidateReviewAction: vi.fn(),
  submitArtifactBulkReviewAction: vi.fn()
}));

vi.mock("@/app/(protected)/outcomes/[outcomeId]/actions", () => ({
  recordOutcomeTollgateDecisionAction: vi.fn()
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
    expect(screen.getByRole("heading", { name: "Import object review" })).toBeDefined();
    expect(screen.getByText(/Use this page whenever you want one answer to the question/i)).toBeDefined();
    expect(screen.getByText("Needs human action now")).toBeDefined();
    expect(screen.getByText("Imported decisions left")).toBeDefined();
    expect(screen.getByText("Import objects to review")).toBeDefined();
    expect(screen.getByText("Outcome tollgate approval")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Human review approval workspace" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete import session" })).toBeDefined();
    expect(screen.getAllByRole("link", { name: /Open/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Individual Delivery Stories no longer use human approval lanes here/i)).toBeDefined();
    expect(screen.getByText(/this section only covers imported objects from Import/i)).toBeDefined();
    expect(screen.getByRole("heading", { name: "Loading framing review workspace" })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Focused correction workspace" })).toBeNull();
  });

  it("opens a focused correction workspace for the selected imported candidate", async () => {
    vi.mocked(loadArtifactReviewQueue).mockResolvedValueOnce({
      state: "ready",
      organizationName: "AAS Demo Organization",
      projectOutcomes: [
        {
          id: "project-outcome-1",
          key: "OUT-001",
          title: "Primary project outcome"
        }
      ],
      projectEpics: [
        {
          id: "candidate-epic-1",
          key: "EPC-001",
          title: "Imported epic",
          outcomeId: "project-outcome-1"
        }
      ],
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
            outcomeCandidateId: "project-outcome-1",
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
          label: "Artifact intake 2026-03-23 21:00",
          importIntent: "framing"
        },
        file: {
          id: "file-1",
          fileName: "story-pack.md"
        }
        }
      ],
      selectedCandidate: {
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
          outcomeCandidateId: "project-outcome-1",
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
          label: "Artifact intake 2026-03-23 21:00",
          importIntent: "framing"
        },
        file: {
          id: "file-1",
          fileName: "story-pack.md",
          content: "# Story\n\nImported reviewable story"
        },
        promotedEntityType: null,
        promotedEntityId: null,
        reviewComment: null
      }
    } as Awaited<ReturnType<typeof loadArtifactReviewQueue>>);

    render(await ReviewPage({ searchParams: Promise.resolve({ candidateId: "candidate-story-1" }) }));

    expect(screen.getAllByRole("heading", { name: "Human Review dashboard", level: 1 }).length).toBeGreaterThan(0);
    expect(screen.getByText("Open human review help")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Loading framing review workspace" })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Focused correction workspace" })).toBeNull();
  });
});
