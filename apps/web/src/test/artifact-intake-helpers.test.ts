import { describe, expect, it } from "vitest";
import {
  analyzeArtifactCandidateCompliance,
  classifyArtifactSource,
  getArtifactCandidateIssueProgress,
  getArtifactFileExtension,
  inferImportedReadinessState,
  isSupportedArtifactFile,
  mapParsedArtifactsToAasCandidates,
  parseMarkdownArtifact,
  sanitizeArtifactPersistenceText,
  sanitizeArtifactPersistenceValue
} from "@aas-companion/domain";

describe("artifact intake helpers", () => {
  it("accepts markdown-based artifact files", () => {
    expect(isSupportedArtifactFile("story-pack.md")).toBe(true);
    expect(isSupportedArtifactFile("epic-pack.MDX")).toBe(true);
    expect(getArtifactFileExtension("brief.markdown")).toBe(".markdown");
  });

  it("rejects unsupported artifact file types", () => {
    expect(isSupportedArtifactFile("diagram.pdf")).toBe(false);
    expect(getArtifactFileExtension("notes.txt")).toBe("");
  });

  it("classifies BMAD-style planning markdown with high confidence", () => {
    const classification = classifyArtifactSource(
      "product-requirements.md",
      "# Product Requirements\n\n## Outcome\n\nOutcome statement for the team.\n"
    );

    expect(classification.sourceType).toBe("bmad_prd");
    expect(classification.confidence).toBe("high");
  });

  it("parses source references and candidate sections from markdown", () => {
    const parsed = parseMarkdownArtifact(
      "file-1",
      "delivery-note.md",
      [
        "# Imported artifact",
        "",
        "## Story",
        "As a value owner I want a governed import path so that story intake stays reviewable.",
        "",
        "## Acceptance Criteria",
        "- Candidate Outcome is visible",
        "- Candidate Story is visible",
        "",
        "## Test Notes",
        "Verification should confirm source lineage."
      ].join("\n")
    );

    expect(["story_file", "mixed_markdown_bundle"]).toContain(parsed.classification.sourceType);
    expect(parsed.sections.some((section) => section.kind === "story_candidate")).toBe(true);
    expect(parsed.sections.some((section) => section.kind === "acceptance_criteria")).toBe(true);
    expect(parsed.sections.some((section) => section.kind === "test_notes")).toBe(true);

    const storySection = parsed.sections.find((section) => section.kind === "story_candidate");
    expect(storySection?.sourceReference.fileName).toBe("delivery-note.md");
    expect(storySection?.sourceReference.sectionMarker).toContain("Story");
  });

  it("maps parsed sections into reviewable AAS candidates while preserving unmapped content", () => {
    const parsed = parseMarkdownArtifact(
      "file-2",
      "delivery-plan.md",
      [
        "# Outcome",
        "Outcome statement: improve intake traceability.",
        "",
        "## Epic",
        "Epic title: Artifact intake mapping",
        "",
        "## Story",
        "Story-ID: M2-003",
        "As a delivery lead I want candidate mapping so that ambiguity stays visible.",
        "",
        "## Acceptance Criteria",
        "- Candidate objects show source lineage",
        "- Unmapped sections remain visible",
        "",
        "## Test Notes",
        "Regression should verify candidate relationships.",
        "",
        "## Architecture Notes",
        "Leave promotion outside this story."
      ].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-2",
          fileName: "delivery-plan.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ]
    });

    expect(mapping.candidates.some((candidate) => candidate.type === "outcome")).toBe(true);
    expect(mapping.candidates.some((candidate) => candidate.type === "epic")).toBe(true);
    expect(mapping.candidates.some((candidate) => candidate.type === "story")).toBe(true);

    const storyCandidate = mapping.candidates.find((candidate) => candidate.type === "story");
    expect(storyCandidate).toBeDefined();
    expect(storyCandidate?.relationshipState).toBe("mapped");
    expect(storyCandidate?.source.fileName).toBe("delivery-plan.md");
    expect(mapping.unmappedSections.some((section) => section.kind === "architecture_notes")).toBe(true);
  });

  it("maps structured story spec files into one story candidate instead of fragmented outcome-like candidates", () => {
    const content = [
      "# M1-STORY-006",
      "",
      "## Title",
      "Build Outcome Workspace with Tollgate 1 validation",
      "",
      "## Story Type",
      "UI + Domain Feature",
      "",
      "## Value Intent",
      "Make AAS Framing discipline visible and enforceable in the product.",
      "",
      "## Summary",
      "Build the Outcome Workspace with baseline validation and a Tollgate 1 panel.",
      "",
      "## Acceptance Criteria",
      "- Outcome Workspace shows:",
      "  - summary",
      "  - baseline",
      "- user can edit outcome statement",
      "- user can edit baseline definition",
      "",
      "## AI Usage Scope",
      "- CODE",
      "- TEST",
      "",
      "## Test Definition",
      "- unit",
      "- integration",
      "- e2e",
      "",
      "## Definition of Done",
      "- validation is enforced server-side",
      "- blocked and valid states are both demonstrable",
      "",
      "## Scope In",
      "- Outcome detail route",
      "- summary form"
    ].join("\n");

    const parsed = parseMarkdownArtifact("file-story-006", "M1-STORY-006.md", content);
    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-story-006",
          fileName: "M1-STORY-006.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ]
    });

    expect(parsed.classification.sourceType).toBe("story_file");
    expect(parsed.classification.confidence).toBe("high");
    expect(mapping.candidates).toHaveLength(1);
    expect(mapping.candidates[0]?.type).toBe("story");
    expect(mapping.candidates[0]?.title).toContain("Build Outcome Workspace");
    expect(mapping.candidates[0]?.summary).toContain("baseline validation");
    expect(mapping.candidates[0]?.acceptanceCriteria).toEqual([
      "Outcome Workspace shows:",
      "summary",
      "baseline",
      "user can edit outcome statement",
      "user can edit baseline definition"
    ]);
    expect(mapping.candidates[0]?.testNotes).toEqual(["unit", "integration", "e2e"]);
  });

  it("creates unique candidate ids across different files with the same section structure", () => {
    const outcomeA = parseMarkdownArtifact(
      "file-a",
      "outcome-a.md",
      ["# Outcome", "Outcome statement: improve first workflow."].join("\n")
    );
    const outcomeB = parseMarkdownArtifact(
      "file-b",
      "outcome-b.md",
      ["# Outcome", "Outcome statement: improve second workflow."].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-a",
          fileName: "outcome-a.md",
          sourceType: outcomeA.classification.sourceType,
          parsedArtifacts: outcomeA
        },
        {
          id: "file-b",
          fileName: "outcome-b.md",
          sourceType: outcomeB.classification.sourceType,
          parsedArtifacts: outcomeB
        }
      ]
    });

    const ids = mapping.candidates.map((candidate) => candidate.id);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(ids[0]).toContain("file-a");
    expect(ids[1]).toContain("file-b");
  });

  it("sanitizes persisted intake text into Windows-safe characters", () => {
    expect(sanitizeArtifactPersistenceText("Outcome → Story… café")).toBe("Outcome -> Story... café");

    expect(
      sanitizeArtifactPersistenceValue({
        title: "Roadmap → Delivery",
        notes: ["Review…", "Keep café wording"],
        nested: {
          marker: "## Scope • Risks"
        }
      })
    ).toEqual({
      title: "Roadmap -> Delivery",
      notes: ["Review...", "Keep café wording"],
      nested: {
        marker: "## Scope - Risks"
      }
    });
  });

  it("keeps imported stories in human review until human-only decisions are resolved", () => {
    const compliance = analyzeArtifactCandidateCompliance({
      candidate: {
        id: "candidate-story-1",
        type: "story",
        title: "Imported Story",
        summary: "As a builder I want imported work to stay reviewable.",
        mappingState: "mapped",
        source: {
          fileId: "file-1",
          fileName: "story-pack.md",
          sectionId: "section-story",
          sectionTitle: "Story",
          sectionMarker: "## Story",
          sourceType: "story_file",
          confidence: "high"
        },
        inferredOutcomeCandidateId: "candidate-outcome-1",
        inferredEpicCandidateId: "candidate-epic-1",
        relationshipState: "mapped",
        relationshipNote: null,
        acceptanceCriteria: ["Candidate is traceable"],
        testNotes: ["Add regression coverage for promotion"]
      },
      reviewStatus: "edited",
      draftRecord: {
        key: "IMP-STORY-1",
        title: "Imported Story",
        storyType: "outcome_delivery",
        valueIntent: "Keep imported work reviewable",
        acceptanceCriteria: ["Candidate is traceable"],
        aiUsageScope: ["Summarization only"],
        testDefinition: "Regression covers promotion gating",
        definitionOfDone: ["Review complete"],
        outcomeCandidateId: "candidate-outcome-1",
        epicCandidateId: "candidate-epic-1"
      },
      humanDecisions: {
        aiAccelerationLevel: null,
        riskAcceptanceStatus: null
      }
    });

    expect(compliance.summary.humanOnly).toBe(2);
    expect(compliance.humanReviewRequired).toBe(true);
    expect(inferImportedReadinessState({ type: "story", complianceResult: compliance })).toBe("imported_human_review_needed");
  });

  it("marks imported stories as design-ready once required fields and decisions are confirmed", () => {
    const compliance = analyzeArtifactCandidateCompliance({
      candidate: {
        id: "candidate-story-2",
        type: "story",
        title: "Ready Imported Story",
        summary: "As a builder I want imported work to progress into handoff safely.",
        mappingState: "mapped",
        source: {
          fileId: "file-2",
          fileName: "story-pack.md",
          sectionId: "section-story",
          sectionTitle: "Story",
          sectionMarker: "## Story",
          sourceType: "story_file",
          confidence: "high"
        },
        inferredOutcomeCandidateId: "candidate-outcome-2",
        inferredEpicCandidateId: "candidate-epic-2",
        relationshipState: "mapped",
        relationshipNote: null,
        acceptanceCriteria: ["Story stays linked to lineage"],
        testNotes: ["Execution contract remains blocked until ready"]
      },
      reviewStatus: "confirmed",
      draftRecord: {
        key: "IMP-STORY-2",
        title: "Ready Imported Story",
        storyType: "outcome_delivery",
        valueIntent: "Progress into build handoff safely",
        acceptanceCriteria: ["Story stays linked to lineage"],
        aiUsageScope: ["Drafting"],
        testDefinition: "Contract preview remains gated",
        definitionOfDone: ["Human review complete"],
        outcomeCandidateId: "candidate-outcome-2",
        epicCandidateId: "candidate-epic-2"
      },
      humanDecisions: {
        aiAccelerationLevel: "level_2",
        riskAcceptanceStatus: "accepted"
      }
    });

    expect(compliance.summary.missing).toBe(0);
    expect(compliance.summary.humanOnly).toBe(0);
    expect(compliance.promotionBlocked).toBe(false);
    expect(
      inferImportedReadinessState({
        type: "story",
        complianceResult: compliance,
        reviewStatus: "confirmed"
      })
    ).toBe("imported_design_ready");
  });

  it("tracks explicit issue dispositions and progress for import readiness", () => {
    const compliance = analyzeArtifactCandidateCompliance({
      candidate: {
        id: "candidate-story-4",
        type: "story",
        title: "Disposition Story",
        summary: "As a builder I want import issues to be worked off explicitly.",
        mappingState: "mapped",
        source: {
          fileId: "file-4",
          fileName: "story-pack.md",
          sectionId: "section-story",
          sectionTitle: "Story",
          sectionMarker: "## Story",
          sourceType: "story_file",
          confidence: "medium"
        },
        inferredOutcomeCandidateId: "candidate-outcome-4",
        inferredEpicCandidateId: "candidate-epic-4",
        relationshipState: "mapped",
        relationshipNote: null,
        acceptanceCriteria: ["Candidate keeps lineage"],
        testNotes: []
      },
      reviewStatus: "edited",
      draftRecord: {
        key: "IMP-STORY-4",
        title: "Disposition Story",
        storyType: "outcome_delivery",
        valueIntent: "Work issues off explicitly",
        acceptanceCriteria: ["Candidate keeps lineage"],
        aiUsageScope: ["Drafting"],
        testDefinition: "Review captures issue state",
        definitionOfDone: ["Dispositions persisted"],
        outcomeCandidateId: "candidate-outcome-4",
        epicCandidateId: "candidate-epic-4"
      },
      humanDecisions: {
        aiAccelerationLevel: "level_2",
        riskAcceptanceStatus: "accepted"
      }
    });

    const progress = getArtifactCandidateIssueProgress({
      complianceResult: compliance,
      issueDispositions: {
        source_confidence_below_high: {
          issueId: "source_confidence_below_high",
          action: "confirmed",
          note: null
        }
      },
      unmappedSectionCount: 1,
      sectionDispositions: {
        "section-raw": {
          issueId: "section-raw",
          action: "not_relevant",
          note: null
        }
      }
    });

    expect(progress.resolved).toBe(1);
    expect(progress.categories.uncertain).toBe(0);
    expect(progress.categories.unmapped).toBe(0);
    expect(
      inferImportedReadinessState({
        type: "story",
        complianceResult: compliance,
        issueDispositions: {
          source_confidence_below_high: {
            issueId: "source_confidence_below_high",
            action: "confirmed",
            note: null
          }
        },
        reviewStatus: "rejected"
      })
    ).toBe("discarded");
  });

  it("uses ASCII linkage messages in compliance findings", () => {
    const compliance = analyzeArtifactCandidateCompliance({
      candidate: {
        id: "candidate-story-3",
        type: "story",
        title: "Imported Story",
        summary: "Story imported from markdown.",
        mappingState: "mapped",
        source: {
          fileId: "file-3",
          fileName: "story-pack.md",
          sectionId: "section-story",
          sectionTitle: "Story",
          sectionMarker: "## Story",
          sourceType: "story_file",
          confidence: "high"
        },
        inferredOutcomeCandidateId: null,
        inferredEpicCandidateId: null,
        relationshipState: "missing",
        relationshipNote: "Missing upstream linkage.",
        acceptanceCriteria: ["Candidate is traceable"],
        testNotes: []
      },
      reviewStatus: "edited",
      draftRecord: {
        key: "IMP-STORY-3",
        title: "Imported Story",
        storyType: "outcome_delivery",
        valueIntent: "Keep linkage explicit",
        acceptanceCriteria: ["Candidate is traceable"],
        aiUsageScope: ["Drafting"],
        testDefinition: null,
        definitionOfDone: [],
        outcomeCandidateId: null,
        epicCandidateId: null
      },
      humanDecisions: {
        aiAccelerationLevel: "level_2",
        riskAcceptanceStatus: "accepted"
      }
    });

    expect(compliance.findings.some((finding) => finding.message.includes("->"))).toBe(true);
    expect(compliance.findings.some((finding) => finding.message.includes("→"))).toBe(false);
  });
});
