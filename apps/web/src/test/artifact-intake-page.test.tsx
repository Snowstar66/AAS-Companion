import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArtifactIntakePage from "@/app/(protected)/intake/page";

vi.mock("@/lib/intake/workspace", () => ({
  loadArtifactIntakeWorkspace: vi.fn(async () => ({
    state: "ready",
    organizationName: "AAS Demo Organization",
    summary: {
      sessions: 1,
      files: 2,
      pendingClassification: 0,
      parsedSections: 6,
      candidateObjects: 3,
      humanReviewRequired: 1
    },
    message: "Uploaded markdown artifacts are now classified, parsed into candidate sections, and mapped into reviewable AAS candidates.",
    sessions: [
      {
        id: "session-1",
        label: "Artifact intake 2026-03-23 20:10",
        status: "human_review_required",
        createdAt: new Date("2026-03-23T20:10:00.000Z"),
        creator: {
          fullName: "Demo Value Owner",
          email: "value.owner@aas-companion.local"
        },
        candidateCount: 3,
        blockedCandidateCount: 0,
        pendingReviewCount: 1,
        uncertainCandidateCount: 1,
        unmappedSectionCount: 1,
        displayCandidates: [
          {
            id: "candidate-1",
            type: "story",
            title: "Story",
            summary: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
            mappingState: "mapped",
            relationshipState: "uncertain",
            relationshipNote: "Story likely belongs to the nearest Epic candidate, but the relationship remains uncertain.",
            inferredOutcomeCandidateId: "candidate-outcome",
            inferredEpicCandidateId: "candidate-epic",
            acceptanceCriteria: ["Candidate objects show source lineage"],
            testNotes: ["Regression should verify candidate relationships."],
            draftRecord: null,
            humanDecisions: null,
            complianceResult: null,
            reviewStatus: "pending",
            source: {
              fileId: "file-1",
              fileName: "story-pack.md",
              sectionId: "section-1",
              sectionTitle: "Story",
              sectionMarker: "## Story",
              sourceType: "story_file",
              confidence: "high"
            }
          }
        ],
        mappedArtifacts: {
          candidates: [
            {
              id: "candidate-1",
              type: "story",
              title: "Story",
              summary: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
              mappingState: "mapped",
              relationshipState: "uncertain",
              relationshipNote: "Story likely belongs to the nearest Epic candidate, but the relationship remains uncertain.",
              inferredOutcomeCandidateId: "candidate-outcome",
              inferredEpicCandidateId: "candidate-epic",
              acceptanceCriteria: ["Candidate objects show source lineage"],
              testNotes: ["Regression should verify candidate relationships."],
              source: {
                fileId: "file-1",
                fileName: "story-pack.md",
                sectionId: "section-1",
                sectionTitle: "Story",
                sectionMarker: "## Story",
                sourceType: "story_file",
                confidence: "high"
              }
            }
          ],
          unmappedSections: [
            {
              id: "section-2-architecture",
              kind: "architecture_notes",
              title: "Architecture Notes",
              text: "Leave promotion outside this story.",
              confidence: "medium",
              isUncertain: false,
              sourceReference: {
                fileId: "file-2",
                fileName: "epic-pack.mdx",
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
            uploadedAt: new Date("2026-03-23T20:10:00.000Z"),
            uploader: {
              fullName: "Demo Value Owner",
              email: "value.owner@aas-companion.local"
            },
            sourceTypeStatus: "classified",
            sourceType: "story_file",
            sourceTypeConfidence: "high",
            sizeBytes: 1024,
            parsedSectionCount: 4,
            uncertainSectionCount: 0,
            parsedArtifacts: {
              classification: {
                sourceType: "story_file",
                confidence: "high",
                rationale: "Detected story-oriented structure."
              },
              sections: [
                {
                  id: "section-1-story",
                  kind: "story_candidate",
                  title: "Story",
                  text: "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
                  confidence: "high",
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
                }
              ]
            }
          },
          {
            id: "file-2",
            fileName: "epic-pack.mdx",
            extension: ".mdx",
            uploadedAt: new Date("2026-03-23T20:11:00.000Z"),
            uploader: {
              fullName: "Demo Value Owner",
              email: "value.owner@aas-companion.local"
            },
            sourceTypeStatus: "classified",
            sourceType: "mixed_markdown_bundle",
            sourceTypeConfidence: "medium",
            sizeBytes: 2048,
            parsedSectionCount: 2,
            uncertainSectionCount: 1,
            parsedArtifacts: {
              classification: {
                sourceType: "mixed_markdown_bundle",
                confidence: "medium",
                rationale: "Detected multiple artifact patterns in the same markdown bundle."
              },
              sections: [
                {
                  id: "section-2-epic",
                  kind: "epic_candidate",
                  title: "Epic",
                  text: "Epic title: Artifact intake mapping",
                  confidence: "medium",
                  isUncertain: false,
                  sourceReference: {
                    fileId: "file-2",
                    fileName: "epic-pack.mdx",
                    sectionId: "section-2",
                    sectionTitle: "Epic",
                    sectionMarker: "## Epic",
                    lineStart: 1,
                    lineEnd: 2
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

describe("Artifact Intake page", () => {
  it("renders classified files, candidate objects, and unmapped sections", async () => {
    render(await ArtifactIntakePage({}));

    expect(screen.getByRole("heading", { name: "Artifact Intake workspace", level: 1 })).toBeDefined();
    expect(screen.getAllByText("story-pack.md").length).toBeGreaterThan(0);
    expect(screen.getAllByText("story file").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Candidate AAS objects" })).toBeDefined();
    expect(screen.getByText("Candidate objects show source lineage")).toBeDefined();
    expect(screen.getByText("Unmapped source sections")).toBeDefined();
    expect(screen.getByText("Leave promotion outside this story.")).toBeDefined();
  });
});
