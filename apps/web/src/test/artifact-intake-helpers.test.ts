import { describe, expect, it } from "vitest";
import {
  classifyArtifactSource,
  getArtifactFileExtension,
  isSupportedArtifactFile,
  mapParsedArtifactsToAasCandidates,
  parseMarkdownArtifact
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
});
