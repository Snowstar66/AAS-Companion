import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArtifactIntakePage from "@/app/(protected)/intake/page";

const { requireProtectedSessionMock, loadArtifactIntakeWorkspaceMock } = vi.hoisted(() => ({
  requireProtectedSessionMock: vi.fn(async () => ({
    mode: "local" as const,
    userId: "user-1",
    email: "pontus@example.com",
    displayName: "Pontus",
    organization: {
      organizationId: "org-1",
      organizationName: "Customer Project",
      organizationSlug: "customer-project",
      role: "value_owner" as const
    }
  })),
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
        id: "candidate-epic",
        key: "EPC-001",
        title: "Imported Epic",
        outcomeId: "project-outcome-1"
      }
    ],
    summary: {
      sessions: 1,
      files: 1,
      pendingClassification: 0,
      parsedSections: 3,
      candidateObjects: 1,
      humanReviewRequired: 1
    },
    message: "Uploaded markdown artifacts are now classified, parsed into candidate sections, and mapped into reviewable AAS candidates.",
    sessions: [
      {
        id: "session-1",
        label: "Artifact intake 2026-03-24 10:10",
        importIntent: "framing",
        status: "human_review_required",
        createdAt: new Date("2026-03-24T09:10:00.000Z"),
        creator: {
          fullName: "Demo Value Owner",
          email: "value.owner@aas-companion.local"
        },
        candidateCount: 1,
        blockedCandidateCount: 1,
        pendingReviewCount: 1,
        uncertainCandidateCount: 1,
        unmappedSectionCount: 1,
        candidates: [
          {
            id: "candidate-1",
            fileId: "file-1",
            type: "story",
            title: "Imported Story",
            summary: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
            mappingState: "mapped",
            relationshipState: "uncertain",
            relationshipNote: "Story likely belongs to the nearest Epic candidate, but the relationship remains uncertain.",
            acceptanceCriteria: ["Candidate objects show source lineage"],
            testNotes: ["Regression should verify candidate relationships."],
            draftRecord: {
              key: null,
              title: "Imported Story",
              problemStatement: null,
              outcomeStatement: null,
              baselineDefinition: null,
              baselineSource: null,
              timeframe: null,
              purpose: null,
              storyType: "outcome_delivery",
              valueIntent: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
              expectedBehavior: null,
              acceptanceCriteria: ["Candidate objects show source lineage"],
              aiUsageScope: [],
              testDefinition: null,
              definitionOfDone: [],
              outcomeCandidateId: "project-outcome-1",
              epicCandidateId: null
            },
            humanDecisions: {
              valueOwnerId: null,
              baselineValidity: null,
              aiAccelerationLevel: null,
              riskProfile: null,
              riskAcceptanceStatus: null
            },
            complianceResult: {
              findings: [
                {
                  code: "story_expected_behavior_missing",
                  category: "missing",
                  message: "Expected behavior is missing.",
                  fieldLabel: "Expected behavior"
                }
              ],
              summary: {
                missing: 1,
                uncertain: 1,
                humanOnly: 0,
                blocked: 0
              },
              promotionBlocked: true,
              humanReviewRequired: true
            },
            issueDispositions: {},
            reviewStatus: "pending",
            importedReadinessState: "imported_incomplete",
            source: {
              fileId: "file-1",
              fileName: "story-pack.md",
              sectionId: "section-1",
              sectionTitle: "Story",
              sectionMarker: "## Story",
              sourceType: "story_file",
              confidence: "medium"
            }
          }
        ],
        allCandidates: [
          {
            id: "candidate-outcome",
            fileId: "file-1",
            type: "outcome",
            title: "Imported Outcome",
            summary: "Outcome framing for the imported story.",
            mappingState: "mapped",
            relationshipState: "mapped",
            relationshipNote: null,
            acceptanceCriteria: [],
            testNotes: [],
            draftRecord: {
              key: "OUT-001",
              title: "Imported Outcome",
              problemStatement: null,
              outcomeStatement: "Outcome framing for the imported story.",
              baselineDefinition: "Baseline exists.",
              baselineSource: "Imported notes",
              timeframe: null,
              purpose: null,
              scopeBoundary: null,
              riskNote: null,
              storyType: null,
              valueIntent: null,
              expectedBehavior: null,
              acceptanceCriteria: [],
              aiUsageScope: [],
              testDefinition: null,
              definitionOfDone: [],
              outcomeCandidateId: null,
              epicCandidateId: null
            },
            humanDecisions: {
              valueOwnerId: "value-owner-1",
              baselineValidity: "confirmed",
              aiAccelerationLevel: "level_2",
              riskProfile: "medium",
              riskAcceptanceStatus: null
            },
            complianceResult: {
              findings: [],
              summary: {
                missing: 0,
                uncertain: 0,
                humanOnly: 0,
                blocked: 0
              },
              promotionBlocked: false,
              humanReviewRequired: false
            },
            issueDispositions: {},
            reviewStatus: "promoted",
            importedReadinessState: "imported_framing_ready",
            promotedEntityId: "OUT-001",
            promotedEntityType: "outcome",
            source: {
              fileId: "file-1",
              fileName: "story-pack.md",
              sectionId: "section-outcome",
              sectionTitle: "Outcome",
              sectionMarker: "## Outcome",
              sourceType: "story_file",
              confidence: "high"
            }
          },
          {
            id: "candidate-epic",
            fileId: "file-1",
            type: "epic",
            title: "Imported Epic",
            summary: "Epic framing for the imported story.",
            mappingState: "mapped",
            relationshipState: "mapped",
            relationshipNote: null,
            acceptanceCriteria: [],
            testNotes: [],
            draftRecord: {
              key: "EPC-001",
              title: "Imported Epic",
              problemStatement: null,
              outcomeStatement: null,
              baselineDefinition: null,
              baselineSource: null,
              timeframe: null,
              purpose: "Epic framing for the imported story.",
              scopeBoundary: "Within story delivery",
              riskNote: null,
              storyType: null,
              valueIntent: null,
              expectedBehavior: null,
              acceptanceCriteria: [],
              aiUsageScope: [],
              testDefinition: null,
              definitionOfDone: [],
              outcomeCandidateId: "candidate-outcome",
              epicCandidateId: null
            },
            humanDecisions: {
              valueOwnerId: null,
              baselineValidity: null,
              aiAccelerationLevel: null,
              riskProfile: null,
              riskAcceptanceStatus: null
            },
            complianceResult: {
              findings: [],
              summary: {
                missing: 0,
                uncertain: 0,
                humanOnly: 0,
                blocked: 0
              },
              promotionBlocked: false,
              humanReviewRequired: false
            },
            issueDispositions: {},
            reviewStatus: "promoted",
            importedReadinessState: "imported_framing_ready",
            promotedEntityId: "EPC-001",
            promotedEntityType: "epic",
            source: {
              fileId: "file-1",
              fileName: "story-pack.md",
              sectionId: "section-epic",
              sectionTitle: "Epic",
              sectionMarker: "## Epic",
              sourceType: "story_file",
              confidence: "high"
            }
          },
          {
            id: "candidate-1",
            fileId: "file-1",
            type: "story",
            title: "Imported Story",
            summary: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
            mappingState: "mapped",
            relationshipState: "uncertain",
            relationshipNote: "Story likely belongs to the nearest Epic candidate, but the relationship remains uncertain.",
            acceptanceCriteria: ["Candidate objects show source lineage"],
            testNotes: ["Regression should verify candidate relationships."],
            draftRecord: {
              key: null,
              title: "Imported Story",
              problemStatement: null,
              outcomeStatement: null,
              baselineDefinition: null,
              baselineSource: null,
              timeframe: null,
              purpose: null,
              storyType: "outcome_delivery",
              valueIntent: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
              expectedBehavior: null,
              acceptanceCriteria: ["Candidate objects show source lineage"],
              aiUsageScope: [],
              testDefinition: null,
              definitionOfDone: [],
              outcomeCandidateId: "project-outcome-1",
              epicCandidateId: null
            },
            humanDecisions: {
              valueOwnerId: null,
              baselineValidity: null,
              aiAccelerationLevel: null,
              riskProfile: null,
              riskAcceptanceStatus: null
            },
            complianceResult: {
              findings: [
                {
                  code: "story_expected_behavior_missing",
                  category: "missing",
                  message: "Expected behavior is missing.",
                  fieldLabel: "Expected behavior"
                }
              ],
              summary: {
                missing: 1,
                uncertain: 1,
                humanOnly: 0,
                blocked: 0
              },
              promotionBlocked: true,
              humanReviewRequired: true
            },
            issueDispositions: {},
            reviewStatus: "pending",
            importedReadinessState: "imported_incomplete",
            source: {
              fileId: "file-1",
              fileName: "story-pack.md",
              sectionId: "section-1",
              sectionTitle: "Story",
              sectionMarker: "## Story",
              sourceType: "story_file",
              confidence: "medium"
            }
          }
        ],
        displayCandidates: [],
        mappedArtifacts: {
          candidates: [],
          unmappedSections: [
            {
              id: "section-2-architecture",
              kind: "architecture_notes",
              title: "Architecture Notes",
              text: "Leave promotion outside this story.",
              confidence: "medium",
              isUncertain: false,
              sourceReference: {
                fileId: "file-1",
                fileName: "story-pack.md",
                sectionId: "section-2",
                sectionTitle: "Architecture Notes",
                sectionMarker: "## Architecture Notes",
                lineStart: 8,
                lineEnd: 10
              }
            }
          ]
        },
        files: [
          {
            id: "file-1",
            fileName: "story-pack.md",
            extension: ".md",
            uploadedAt: new Date("2026-03-24T09:10:00.000Z"),
            uploader: {
              fullName: "Demo Value Owner",
              email: "value.owner@aas-companion.local"
            },
            sourceTypeStatus: "classified",
            sourceType: "story_file",
            sourceTypeConfidence: "medium",
            sectionDispositions: {},
            sizeBytes: 1024,
            content: "# Imported artifact\n\n## Story\n\nAs a delivery lead I want candidate mapping so that ambiguity stays visible.\n\n## Architecture Notes\n\nLeave promotion outside this story.",
            parsedSectionCount: 2,
            uncertainSectionCount: 1,
            parsedArtifacts: {
              classification: {
                sourceType: "story_file",
                confidence: "medium",
                rationale: "Detected story-oriented structure."
              },
              sections: [
                {
                  id: "section-1-story",
                  kind: "story_candidate",
                  title: "Story",
                  text: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
                  confidence: "medium",
                  isUncertain: false,
                  sourceReference: {
                    fileId: "file-1",
                    fileName: "story-pack.md",
                    sectionId: "section-1",
                    sectionTitle: "Story",
                    sectionMarker: "## Story",
                    lineStart: 3,
                    lineEnd: 4
                  }
                },
                {
                  id: "section-2-architecture",
                  kind: "architecture_notes",
                  title: "Architecture Notes",
                  text: "Leave promotion outside this story.",
                  confidence: "medium",
                  isUncertain: false,
                  sourceReference: {
                    fileId: "file-1",
                    fileName: "story-pack.md",
                    sectionId: "section-2",
                    sectionTitle: "Architecture Notes",
                    sectionMarker: "## Architecture Notes",
                    lineStart: 8,
                    lineEnd: 10
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  }))
}));

vi.mock("@/lib/auth/guards", () => ({
  requireProtectedSession: requireProtectedSessionMock
}));

vi.mock("@/lib/intake/workspace", () => ({
  loadArtifactIntakeWorkspace: loadArtifactIntakeWorkspaceMock
}));

describe("Import page", () => {
  it("renders full source, structured candidate view, and correction queue for the selected artifact", async () => {
    render(
      await ArtifactIntakePage({
        searchParams: Promise.resolve({
          sessionId: "session-1",
          fileId: "file-1",
          candidateId: "candidate-1"
        })
      })
    );

    expect(screen.getByRole("heading", { name: "Project Import", level: 1 })).toBeDefined();
    expect(screen.getByRole("button", { name: "Import" })).toBeDefined();
    expect(screen.queryByRole("button", { name: /AI-assisted import/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Create import session/i })).toBeNull();
    expect(screen.getByRole("heading", { name: "Full imported source artifact" })).toBeDefined();
    expect(screen.getAllByText("# Imported artifact", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Framing value spine" }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("heading", { name: "Imported candidates" })).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Approve" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDefined();
    expect(screen.getByRole("combobox", { name: "Linked Epic" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Project Epic: EPC-AUTO - Fallback Epic" })).toBeDefined();
    expect(screen.getByText(/Review imported framing content directly in one spine/i)).toBeDefined();
    expect(screen.queryByText("Missing required fields")).toBeNull();
    expect(screen.queryByText("Story type")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Review leftovers" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Save and approve Story Idea import" })).toBeNull();
  });

  it("shows Demo as read-only and disables new uploads", async () => {
    requireProtectedSessionMock.mockResolvedValueOnce({
      mode: "demo",
      userId: "user-demo",
      email: "value.owner@aas-companion.local",
      displayName: "Demo Value Owner",
      organization: {
        organizationId: "org_demo_control_plane",
        organizationName: "AAS Demo Organization",
        organizationSlug: "aas-demo-org",
        role: "value_owner"
      }
    });

    render(await ArtifactIntakePage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText(/Import writes persisted intake sessions and is therefore disabled in Demo/i)).toBeDefined();
    expect(screen.getAllByRole("button", { name: "Import" }).some((button) => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.getByRole("link", { name: /Leave Demo and choose project/i })).toBeDefined();
  });

  it("keeps the explicitly selected framing session visible even when no active work remains", async () => {
    loadArtifactIntakeWorkspaceMock.mockResolvedValueOnce({
      state: "ready",
      organizationName: "AAS Demo Organization",
      projectOutcomes: [
        {
          id: "project-outcome-1",
          key: "OUT-001",
          title: "Primary project outcome"
        }
      ],
      projectEpics: [],
      summary: {
        sessions: 2,
        files: 2,
        pendingClassification: 0,
        parsedSections: 4,
        candidateObjects: 1,
        humanReviewRequired: 1
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-design",
          label: "Older design import",
          importIntent: "design",
          status: "human_review_required",
          createdAt: new Date("2026-03-24T09:10:00.000Z"),
          creator: null,
          candidateCount: 1,
          blockedCandidateCount: 0,
          pendingReviewCount: 1,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [
            {
              id: "design-candidate-1",
              fileId: "design-file-1",
              type: "story",
              title: "Older design story",
              summary: "This should not steal focus from the selected framing session.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: null,
                title: "Older design story",
                storyType: "outcome_delivery",
                valueIntent: "Older design story",
                acceptanceCriteria: [],
                aiUsageScope: [],
                definitionOfDone: [],
                outcomeCandidateId: null,
                epicCandidateId: null
              },
              humanDecisions: {},
              complianceResult: {
                findings: [],
                summary: { missing: 0, uncertain: 0, humanOnly: 0, blocked: 0 },
                promotionBlocked: false,
                humanReviewRequired: false
              },
              issueDispositions: {},
              reviewStatus: "pending",
              importedReadinessState: "imported_incomplete",
              source: {
                fileId: "design-file-1",
                fileName: "older-design.md",
                sectionId: "section-1",
                sectionTitle: "Story",
                sectionMarker: "## Story",
                sourceType: "story_file",
                confidence: "high"
              }
            }
          ],
          allCandidates: [],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "design-file-1",
              fileName: "older-design.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-24T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "story_file",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 256,
              content: "# Older design import",
              parsedSectionCount: 1,
              uncertainSectionCount: 0,
              activeImportWorkCount: 1,
              parsedArtifacts: {
                classification: {
                  sourceType: "story_file",
                  confidence: "high",
                  rationale: "Story file."
                },
                sections: []
              }
            }
          ],
          activeImportWorkCount: 1
        },
        {
          id: "session-empty-framing",
          label: "Selected framing import",
          importIntent: "framing",
          status: "human_review_required",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 0,
          blockedCandidateCount: 0,
          pendingReviewCount: 0,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [],
          allCandidates: [],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "framing-file-1",
              fileName: "selected-framing.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 512,
              content: "# Selected framing import",
              parsedSectionCount: 1,
              uncertainSectionCount: 0,
              activeImportWorkCount: 0,
              parsedArtifacts: {
                classification: {
                  sourceType: "bmad_prd",
                  confidence: "high",
                  rationale: "Framing file."
                },
                sections: []
              }
            }
          ],
          activeImportWorkCount: 0
        }
      ]
    });

    render(
      await ArtifactIntakePage({
        searchParams: Promise.resolve({
          sessionId: "session-empty-framing",
          fileId: "framing-file-1"
        })
      })
    );

    expect(screen.getAllByRole("heading", { name: "Framing value spine" }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("heading", { name: "Imported candidates" })).toHaveLength(0);
    expect(screen.getByText(/No hidden leftovers remain for this imported file/i)).toBeDefined();
  });
});
