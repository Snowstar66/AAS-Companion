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
    expect(screen.getByText((_, element) => element?.textContent === "Outcomes: 0")).toBeDefined();
    expect(screen.getByText((_, element) => element?.textContent === "Epics: 0")).toBeDefined();
    expect(screen.getByText((_, element) => element?.textContent === "Story ideas: 1")).toBeDefined();
    expect(screen.getByDisplayValue("section-2-architecture")).toBeDefined();
    expect(screen.queryByText("Story type")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Review leftovers" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Save and approve Story Idea import" })).toBeNull();
  }, 15000);

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
  }, 15000);

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
                sections: [
                  {
                    id: "parsed-section-origin-only",
                    title: "Imported Story",
                    kind: "story",
                    confidence: "high",
                    isUncertain: false,
                    text: "Handled story source section body.",
                    sourceReference: {
                      fileId: "file-origin-only",
                      fileName: "origin.md",
                      sectionId: "section-origin-only",
                      lineStart: 1,
                      lineEnd: 6,
                      sectionMarker: "### SC-001"
                    }
                  }
                ]
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
    expect(
      screen.getByText(
        /All imported framing objects in this file are already processed\. Only hidden leftovers remain, and they stay out of the active spine\./i
      )
    ).toBeDefined();
  });

  it("shows story ideas under imported epics even when the draft outcome points at the project outcome", async () => {
    loadArtifactIntakeWorkspaceMock.mockResolvedValueOnce({
      state: "ready",
      organizationName: "AAS Demo Organization",
      projectOutcomes: [
        {
          id: "project-outcome-1",
          key: "OUT-PRJ-001",
          title: "Existing project outcome"
        }
      ],
      projectEpics: [],
      summary: {
        sessions: 1,
        files: 1,
        pendingClassification: 0,
        parsedSections: 5,
        candidateObjects: 3,
        humanReviewRequired: 1
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-framing-linked",
          label: "Framing import with inferred story linkage",
          importIntent: "framing",
          status: "human_review_required",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 3,
          blockedCandidateCount: 0,
          pendingReviewCount: 3,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [
            {
              id: "candidate-outcome",
              fileId: "file-framing-linked",
              type: "outcome",
              title: "Imported Outcome",
              summary: "Imported outcome summary.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "OUT-001",
                title: "Imported Outcome",
                outcomeStatement: "Imported outcome summary.",
                baselineDefinition: "Baseline exists.",
                baselineSource: "Imported notes",
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
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-framing-linked",
                fileName: "krisapp2.md",
                sectionId: "section-outcome",
                sectionTitle: "OUT-001",
                sectionMarker: "### OUT-001",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            },
            {
              id: "candidate-epic",
              fileId: "file-framing-linked",
              type: "epic",
              title: "Imported Epic",
              summary: "Epic summary.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "EPIC-001",
                title: "Imported Epic",
                purpose: "Epic summary.",
                outcomeCandidateId: "candidate-outcome",
                acceptanceCriteria: [],
                aiUsageScope: [],
                definitionOfDone: [],
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
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-framing-linked",
                fileName: "krisapp2.md",
                sectionId: "section-epic",
                sectionTitle: "EPIC-001",
                sectionMarker: "### EPIC-001",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            },
            {
              id: "candidate-story",
              fileId: "file-framing-linked",
              type: "story",
              title: "Imported Story Idea",
              summary: "Story idea summary.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              inferredOutcomeCandidateId: "candidate-outcome",
              inferredEpicCandidateId: "candidate-epic",
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "STORY-001",
                title: "Imported Story Idea",
                valueIntent: "Story idea summary.",
                outcomeCandidateId: "project-outcome-1",
                epicCandidateId: null,
                acceptanceCriteria: [],
                aiUsageScope: [],
                definitionOfDone: []
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
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-framing-linked",
                fileName: "krisapp2.md",
                sectionId: "section-story",
                sectionTitle: "STORY-001",
                sectionMarker: "### STORY-001",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            }
          ],
          allCandidates: [],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "file-framing-linked",
              fileName: "krisapp2.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 1024,
              content: "# Imported artifact",
              parsedSectionCount: 3,
              uncertainSectionCount: 0,
              activeImportWorkCount: 3,
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
          activeImportWorkCount: 3
        }
      ]
    });

    render(
      await ArtifactIntakePage({
        searchParams: Promise.resolve({
          sessionId: "session-framing-linked",
          fileId: "file-framing-linked"
        })
      })
    );

    expect(screen.getByText(/Imported Story Idea/i)).toBeDefined();
    expect(screen.getByText(/Linked to imported Epic Imported Epic/i)).toBeDefined();
  });

  it("can resolve the correct import workspace from candidateId alone", async () => {
    render(
      await ArtifactIntakePage({
        searchParams: Promise.resolve({
          candidateId: "candidate-1"
        })
      })
    );

    expect(screen.getAllByRole("heading", { name: "Framing value spine" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Approve" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Imported Story/i).length).toBeGreaterThan(0);
  });

  it("can resolve the correct import workspace from promoted entity fallback when candidateId is stale", async () => {
    loadArtifactIntakeWorkspaceMock.mockResolvedValueOnce({
      state: "ready",
      organizationName: "AAS Demo Organization",
      projectOutcomes: [],
      projectEpics: [],
      summary: {
        sessions: 1,
        files: 1,
        pendingClassification: 0,
        parsedSections: 1,
        candidateObjects: 1,
        humanReviewRequired: 1
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-origin-fallback",
          label: "Artifact intake fallback",
          importIntent: "framing",
          status: "human_review_required",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 1,
          blockedCandidateCount: 0,
          pendingReviewCount: 0,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [],
          allCandidates: [
            {
              id: "candidate-story-promoted",
              fileId: "file-origin-fallback",
              type: "story",
              title: "Imported Story Fallback",
              summary: "Source object should still resolve.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "SC-002",
                title: "Imported Story Fallback",
                valueIntent: "Source object should still resolve.",
                expectedBehavior: "",
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
              reviewStatus: "promoted",
              importedReadinessState: "imported_framing_ready",
              promotedEntityId: "seed-promoted-1",
              promotedEntityType: "story",
              source: {
                fileId: "file-origin-fallback",
                fileName: "origin.md",
                sectionId: "section-origin-fallback",
                sectionTitle: "US1.1",
                sectionMarker: "### US1.1",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            }
          ],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "file-origin-fallback",
              fileName: "origin.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 1024,
              content: "# Imported artifact",
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
          candidateId: "stale-candidate-id",
          entityId: "seed-promoted-1",
          entityType: "direction_seed"
        })
      })
    );

    expect(screen.getAllByText("Source object").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SC-002 Imported Story Fallback").length).toBeGreaterThan(0);
  });

  it("includes suppressed merged outcomes in framing bulk approval form data", async () => {
    loadArtifactIntakeWorkspaceMock.mockResolvedValueOnce({
      state: "ready",
      organizationName: "AAS Demo Organization",
      projectOutcomes: [],
      projectEpics: [],
      summary: {
        sessions: 1,
        files: 1,
        pendingClassification: 0,
        parsedSections: 3,
        candidateObjects: 2,
        humanReviewRequired: 1
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-merged-outcomes",
          label: "Framing import with merged outcomes",
          importIntent: "framing",
          status: "human_review_required",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 2,
          blockedCandidateCount: 0,
          pendingReviewCount: 2,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [
            {
              id: "candidate-outcome-1",
              fileId: "file-merged-outcomes",
              type: "outcome",
              title: "Imported Outcome 1",
              summary: "Primary outcome.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "OUT-001",
                title: "Imported Outcome 1",
                outcomeStatement: "Primary outcome.",
                baselineDefinition: "",
                baselineSource: "",
                timeframe: "",
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
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-merged-outcomes",
                fileName: "merged.md",
                sectionId: "section-outcome-1",
                sectionTitle: "OUT-001",
                sectionMarker: "### OUT-001",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            },
            {
              id: "candidate-outcome-2",
              fileId: "file-merged-outcomes",
              type: "outcome",
              title: "Imported Outcome 2",
              summary: "Secondary outcome supplement.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "OUT-002",
                title: "Imported Outcome 2",
                outcomeStatement: "Secondary outcome supplement.",
                baselineDefinition: "",
                baselineSource: "",
                timeframe: "",
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
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-merged-outcomes",
                fileName: "merged.md",
                sectionId: "section-outcome-2",
                sectionTitle: "OUT-002",
                sectionMarker: "### OUT-002",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            }
          ],
          allCandidates: [],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "file-merged-outcomes",
              fileName: "merged.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 1024,
              content: "# Imported artifact",
              parsedSectionCount: 2,
              uncertainSectionCount: 0,
              activeImportWorkCount: 2,
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
          activeImportWorkCount: 2
        }
      ]
    });

    render(
      await ArtifactIntakePage({
        searchParams: Promise.resolve({
          sessionId: "session-merged-outcomes",
          fileId: "file-merged-outcomes"
        })
      })
    );

    const hiddenSuppressedOutcome = document.querySelector(
      'input[name="suppressedCandidateIds"][value="candidate-outcome-2"]'
    );

    expect(hiddenSuppressedOutcome).not.toBeNull();
  });

  it("keeps story ideas selectable when they already point to a project epic", async () => {
    loadArtifactIntakeWorkspaceMock.mockResolvedValueOnce({
      state: "ready",
      organizationName: "AAS Demo Organization",
      projectOutcomes: [
        {
          id: "project-outcome-1",
          key: "OUT-002",
          title: "Outcome"
        }
      ],
      projectEpics: [
        {
          id: "project-epic-1",
          key: "EPC-004",
          title: "Påminnelser",
          outcomeId: "project-outcome-1"
        }
      ],
      summary: {
        sessions: 1,
        files: 1,
        pendingClassification: 0,
        parsedSections: 1,
        candidateObjects: 1,
        humanReviewRequired: 1
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-project-epic-link",
          label: "Framing import with project epic link",
          importIntent: "framing",
          status: "human_review_required",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 1,
          blockedCandidateCount: 0,
          pendingReviewCount: 1,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [
            {
              id: "candidate-story-project-epic",
              fileId: "file-project-epic-link",
              type: "story",
              title: "Lageralert",
              summary: "Kontinuitet",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              inferredOutcomeCandidateId: null,
              inferredEpicCandidateId: "project-epic-1",
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "SC-032",
                title: "Lageralert",
                valueIntent: "Kontinuitet",
                expectedBehavior: "Alert vid låg nivå",
                outcomeCandidateId: "project-outcome-1",
                epicCandidateId: "project-epic-1",
                acceptanceCriteria: [],
                aiUsageScope: [],
                definitionOfDone: []
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
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-project-epic-link",
                fileName: "krisapp2.md",
                sectionId: "section-story-project-epic",
                sectionTitle: "SC-032",
                sectionMarker: "### SC-032",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            }
          ],
          allCandidates: [],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "file-project-epic-link",
              fileName: "krisapp2.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 1024,
              content: "# Imported artifact",
              parsedSectionCount: 1,
              uncertainSectionCount: 0,
              activeImportWorkCount: 1,
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
          activeImportWorkCount: 1
        }
      ]
    });

    render(
      await ArtifactIntakePage({
        searchParams: Promise.resolve({
          sessionId: "session-project-epic-link",
          fileId: "file-project-epic-link"
        })
      })
    );

    expect(
      document.querySelector('input[name="candidateIds"][value="candidate-story-project-epic"]')
    ).not.toBeNull();
  });

  it("can open origin for a handled candidate that only remains in allCandidates", async () => {
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
        sessions: 1,
        files: 1,
        pendingClassification: 0,
        parsedSections: 1,
        candidateObjects: 1,
        humanReviewRequired: 0
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-origin-only",
          label: "Handled import session",
          importIntent: "framing",
          status: "completed",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 1,
          blockedCandidateCount: 0,
          pendingReviewCount: 0,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [],
          allCandidates: [
            {
              id: "candidate-origin-only",
              fileId: "file-origin-only",
              type: "story",
              title: "Imported Story",
              summary: "Handled story source.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "SC-001",
                title: "Imported Story",
                valueIntent: "Handled story source.",
                expectedBehavior: "Visible through origin.",
                outcomeCandidateId: "project-outcome-1",
                epicCandidateId: null,
                acceptanceCriteria: [],
                aiUsageScope: [],
                definitionOfDone: []
              },
              humanDecisions: {},
              complianceResult: {
                findings: [],
                summary: { missing: 0, uncertain: 0, humanOnly: 0, blocked: 0 },
                promotionBlocked: false,
                humanReviewRequired: false
              },
              issueDispositions: {},
              reviewStatus: "promoted",
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-origin-only",
                fileName: "origin.md",
                sectionId: "section-origin-only",
                sectionTitle: "SC-001",
                sectionMarker: "### SC-001",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            }
          ],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "file-origin-only",
              fileName: "origin.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 1024,
              content: "# Imported artifact",
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
          candidateId: "candidate-origin-only"
        })
      })
    );

    expect(screen.getAllByRole("heading", { name: "Framing value spine" }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/No active import work remains/i)).toBeNull();
    expect(screen.queryByText(/No import sessions yet/i)).toBeNull();
    expect(screen.getAllByText("Source object").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SC-001 Imported Story").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Handled story source section body.").length).toBeGreaterThan(0);
    const sourceSectionLinks = screen.getAllByRole("link", { name: /Open source section/i });
    expect(
      sourceSectionLinks.some(
        (link) =>
          link.getAttribute("href") ===
          "/intake?sessionId=session-origin-only&fileId=file-origin-only&candidateId=candidate-origin-only&sourceSectionId=section-origin-only#source-section-section-origin-only"
      )
    ).toBe(true);
  });

  it("shows problem statement and timeframe fields for outcome approval", async () => {
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
        sessions: 1,
        files: 1,
        pendingClassification: 0,
        parsedSections: 1,
        candidateObjects: 1,
        humanReviewRequired: 1
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-outcome-fields",
          label: "Outcome import session",
          importIntent: "framing",
          status: "human_review_required",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 1,
          blockedCandidateCount: 0,
          pendingReviewCount: 1,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [
            {
              id: "candidate-outcome-fields",
              fileId: "file-outcome-fields",
              type: "outcome",
              title: "Imported outcome",
              summary: "Imported outcome summary.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              inferredOutcomeCandidateId: null,
              inferredEpicCandidateId: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "OUT-009",
                title: "Imported outcome",
                problemStatement: "Imported problem statement.",
                outcomeStatement: "Imported outcome summary.",
                baselineDefinition: "Imported baseline definition.",
                baselineSource: "Imported baseline source",
                timeframe: "6-24 månader",
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
                outcomeCandidateId: "project-outcome-1",
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
              importedReadinessState: "imported_framing_ready",
              source: {
                fileId: "file-outcome-fields",
                fileName: "outcome.md",
                sectionId: "section-outcome-fields",
                sectionTitle: "OUT-009",
                sectionMarker: "### OUT-009",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            }
          ],
          allCandidates: [],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "file-outcome-fields",
              fileName: "outcome.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 512,
              content: "# Outcome",
              parsedSectionCount: 1,
              uncertainSectionCount: 0,
              activeImportWorkCount: 1,
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
          activeImportWorkCount: 1
        }
      ]
    });

    render(
      await ArtifactIntakePage({
        searchParams: Promise.resolve({
          sessionId: "session-outcome-fields",
          fileId: "file-outcome-fields",
          candidateId: "candidate-outcome-fields"
        })
      })
    );

    expect(screen.getAllByLabelText(/Problem statement/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/Timeframe/i).length).toBeGreaterThan(0);
  });

  it("opens parsed sections and highlights the requested source section", async () => {
    loadArtifactIntakeWorkspaceMock.mockResolvedValueOnce({
      state: "ready",
      organizationName: "AAS Demo Organization",
      projectOutcomes: [],
      projectEpics: [],
      summary: {
        sessions: 1,
        files: 1,
        pendingClassification: 0,
        parsedSections: 1,
        candidateObjects: 1,
        humanReviewRequired: 0
      },
      message: "Workspace loaded.",
      sessions: [
        {
          id: "session-source-focus",
          label: "Source focus session",
          importIntent: "framing",
          status: "completed",
          createdAt: new Date("2026-03-25T09:10:00.000Z"),
          creator: null,
          candidateCount: 1,
          blockedCandidateCount: 0,
          pendingReviewCount: 0,
          uncertainCandidateCount: 0,
          unmappedSectionCount: 0,
          candidates: [],
          allCandidates: [
            {
              id: "candidate-source-focus",
              fileId: "file-source-focus",
              type: "story",
              title: "Focused source story",
              summary: "Focus source.",
              mappingState: "mapped",
              relationshipState: "mapped",
              relationshipNote: null,
              acceptanceCriteria: [],
              testNotes: [],
              draftRecord: {
                key: "SC-051",
                title: "Focused source story",
                valueIntent: "Focus source.",
                expectedBehavior: "",
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
              reviewStatus: "promoted",
              importedReadinessState: "imported_framing_ready",
              promotedEntityId: "seed-focus-1",
              promotedEntityType: "story",
              source: {
                fileId: "file-source-focus",
                fileName: "source.md",
                sectionId: "section-source-focus",
                sectionTitle: "US6.1",
                sectionMarker: "## US6.1",
                sourceType: "bmad_prd",
                confidence: "high"
              }
            }
          ],
          displayCandidates: [],
          mappedArtifacts: { candidates: [], unmappedSections: [] },
          files: [
            {
              id: "file-source-focus",
              fileName: "source.md",
              extension: ".md",
              uploadedAt: new Date("2026-03-25T09:10:00.000Z"),
              uploader: null,
              sourceTypeStatus: "classified",
              sourceType: "bmad_prd",
              sourceTypeConfidence: "high",
              sectionDispositions: {},
              sizeBytes: 1024,
              content: "# Imported artifact",
              parsedSectionCount: 1,
              uncertainSectionCount: 0,
              activeImportWorkCount: 0,
              parsedArtifacts: {
                classification: {
                  sourceType: "bmad_prd",
                  confidence: "high",
                  rationale: "Framing file."
                },
                sections: [
                  {
                    id: "parsed-source-focus",
                    title: "US6.1 Optimera inköp",
                    kind: "story",
                    confidence: "high",
                    isUncertain: false,
                    text: "Focused section body.",
                    sourceReference: {
                      fileId: "file-source-focus",
                      fileName: "source.md",
                      sectionId: "section-source-focus",
                      lineStart: 10,
                      lineEnd: 20,
                      sectionMarker: "## US6.1"
                    }
                  }
                ]
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
          candidateId: "candidate-source-focus",
          sourceSectionId: "section-source-focus"
        })
      })
    );

    const focusedSection = document.getElementById("source-section-section-source-focus");
    expect(focusedSection).not.toBeNull();
    expect(focusedSection?.className).toContain("border-sky-300");
    expect(screen.getByText("Focused source section")).toBeDefined();
    expect(screen.getAllByText("Focused section body.").length).toBeGreaterThan(0);
  });
});
