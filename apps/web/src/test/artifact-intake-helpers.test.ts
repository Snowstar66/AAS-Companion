import { describe, expect, it } from "vitest";
import {
  analyzeArtifactCandidateCompliance,
  buildAiAssistedArtifactProcessingResult,
  classifyArtifactSource,
  createArtifactCandidateDraftRecord,
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
    expect(getArtifactFileExtension("notes.txt")).toBe(".txt");
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
    expect(mapping.carryForwardItems.some((item) => item.category === "solution_constraint")).toBe(true);
  });

  it("builds AI-assisted import results on top of the existing intake model", () => {
    const parsed = parseMarkdownArtifact(
      "file-ai-1",
      "messy-intake.txt",
      [
        "# Workshop notes",
        "",
        "## Desired change",
        "Reduce onboarding delay for supplier teams within the first month.",
        "",
        "## Delivery slice",
        "Create intake cues and a review inbox for weakly structured material.",
        "",
        "## Candidate story",
        "Let a value owner review AI-imported leftovers before promotion."
      ].join("\n")
    );
    const desiredChangeSection = parsed.sections.find((section) => section.title === "Desired change");
    const deliverySliceSection = parsed.sections.find((section) => section.title === "Delivery slice");
    const candidateStorySection = parsed.sections.find((section) => section.title === "Candidate story");

    const result = buildAiAssistedArtifactProcessingResult({
      files: [
        {
          id: "file-ai-1",
          fileName: "messy-intake.txt",
          parsedArtifacts: parsed
        }
      ],
      interpretation: {
        files: [
          {
            fileName: "messy-intake.txt",
            sourceType: "mixed_markdown_bundle",
            confidence: "medium",
            rationale: "Loose notes contain outcome, epic, and story material.",
            sectionDecisions: [
              {
                sectionId: desiredChangeSection!.id,
                kind: "outcome_candidate",
                confidence: "medium"
              },
              {
                sectionId: deliverySliceSection!.id,
                kind: "epic_candidate",
                confidence: "medium"
              },
              {
                sectionId: candidateStorySection!.id,
                kind: "story_candidate",
                confidence: "medium"
              }
            ],
            candidates: [
              {
                sectionId: desiredChangeSection!.id,
                type: "outcome",
                title: "Reduce onboarding delay",
                summary: "Reduce onboarding delay for supplier teams within the first month.",
                draftRecord: {
                  title: "Reduce onboarding delay",
                  outcomeStatement: "Reduce onboarding delay for supplier teams within the first month."
                }
              },
              {
                sectionId: deliverySliceSection!.id,
                type: "epic",
                title: "Create intake cues and review inbox",
                summary: "Create intake cues and a review inbox for weakly structured material.",
                draftRecord: {
                  title: "Create intake cues and review inbox",
                  purpose: "Create intake cues and a review inbox for weakly structured material.",
                  scopeBoundary: "Covers import interpretation and manual review, not downstream promotion."
                }
              },
              {
                sectionId: candidateStorySection!.id,
                type: "story",
                title: "Review AI-imported leftovers before promotion",
                summary: "Let a value owner review AI-imported leftovers before promotion.",
                acceptanceCriteria: ["Leftovers remain visible in a slask"],
                testNotes: ["Verify leftover sections stay reviewable"],
                draftRecord: {
                  title: "Review AI-imported leftovers before promotion",
                  storyType: "outcome_delivery",
                  valueIntent: "Let a value owner review AI-imported leftovers before promotion.",
                  acceptanceCriteria: ["Leftovers remain visible in a slask"],
                  testDefinition: "Verify leftover sections stay reviewable",
                  definitionOfDone: ["Human review can clear or keep leftovers pending"]
                }
              }
            ],
            leftoverSectionIds: [deliverySliceSection!.id]
          }
        ]
      }
    });

    expect(result.files[0]?.parseResult.classification.sourceType).toBe("mixed_markdown_bundle");
    expect(result.mappingResult.candidates).toHaveLength(3);
    expect(result.mappingResult.candidates[2]?.draftRecord?.definitionOfDone).toEqual([
      "Human review can clear or keep leftovers pending"
    ]);
    expect(result.mappingResult.unmappedSections.map((section) => section.id)).toContain(deliverySliceSection!.id);
  });

  it("parses structured JSON artifact packages into outcome, epic, and story candidates", () => {
    const content = JSON.stringify(
      {
        metadata: {
          package_name: "OrderFlow_AAS_Seed_Package",
          ai_acceleration_level: 2,
          status: "framing_design_ready"
        },
        outcomes: [
          {
            outcome_id: "O-001",
            title: "Reduce change lead time and incidents",
            statement: "Reduce lead time from 20 days to 8 days within 9 months.",
            baseline: {
              change_lead_time_days_median: 20,
              production_incidents_per_month: 35
            },
            measurement_method: ["commit_to_production_lead_time"],
            timebox_months: 9,
            owner_role_id: "VO-001"
          }
        ],
        epics: [
          {
            epic_id: "E-005",
            outcome_id: "O-001",
            title: "Introduce controlled AI support in development and testing",
            purpose: "Use AI to accelerate code and test delivery with governance.",
            scope_in: ["prompt_library", "ai_usage_logging"],
            scope_out: ["autonomous_production_deployment"],
            risk_note: "AI-generated artifacts require mandatory review."
          }
        ],
        stories: [
          {
            story_id: "S-015",
            epic_id: "E-005",
            outcome_id: "O-001",
            title: "Log all AI usage by story and model version",
            story_type: "Feature",
            value_intent: "Make AI usage auditable and reproducible.",
            ai_usage_scope: ["CONTENT", "CODE", "TEST"],
            ai_acceleration_level: 2,
            acceptance_criteria: [
              "log includes prompt id and model version",
              "history is linked to story id and release"
            ],
            test_id: "T-015",
            test_definition: {
              test_level: "integration",
              test_type: "audit_log_validation",
              automation: "high"
            },
            definition_of_done: [
              "usage log persisted",
              "history is searchable by story id"
            ]
          }
        ]
      },
      null,
      2
    );

    const parsed = parseMarkdownArtifact("file-json-1", "AAS-Testdata.txt", content);
    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-json-1",
          fileName: "AAS-Testdata.txt",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ]
    });

    expect(parsed.classification.sourceType).toBe("mixed_markdown_bundle");
    expect(parsed.classification.confidence).toBe("high");
    expect(mapping.candidates.some((candidate) => candidate.type === "outcome")).toBe(true);
    expect(mapping.candidates.some((candidate) => candidate.type === "epic")).toBe(true);
    expect(mapping.candidates.some((candidate) => candidate.type === "story")).toBe(true);

    const storyCandidate = mapping.candidates.find((candidate) => candidate.type === "story");
    expect(storyCandidate?.title).toContain("Log all AI usage");
    expect(storyCandidate?.draftRecord?.valueIntent).toBe("Make AI usage auditable and reproducible.");
    expect(storyCandidate?.draftRecord?.aiUsageScope).toEqual(["CONTENT", "CODE", "TEST"]);
    expect(storyCandidate?.draftRecord?.definitionOfDone).toEqual([
      "usage log persisted",
      "history is searchable by story id"
    ]);
    expect(storyCandidate?.draftRecord?.testDefinition).toContain("test_level: integration");
    expect(storyCandidate?.acceptanceCriteria).toEqual([
      "log includes prompt id and model version",
      "history is linked to story id and release"
    ]);
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
    expect(mapping.candidates[0]?.draftRecord?.storyType).toBe("outcome_delivery");
    expect(mapping.candidates[0]?.draftRecord?.aiUsageScope).toEqual(["CODE", "TEST"]);
    expect(mapping.candidates[0]?.draftRecord?.testDefinition).toBe("unit\nintegration\ne2e");
    expect(mapping.candidates[0]?.draftRecord?.definitionOfDone).toEqual([
      "validation is enforced server-side",
      "blocked and valid states are both demonstrable"
    ]);
  });

  it("distills framing imports into story ideas and carries forward UX, NFR, and additional requirements", () => {
    const parsed = parseMarkdownArtifact(
      "file-framing-1",
      "golf-brief.md",
      [
        "# Epic",
        "Epic title: Guided score capture",
        "",
        "## Story 1.1",
        "As a golfer I want to capture my score hole by hole so that I can complete a round without paper notes.",
        "",
        "## Acceptance Criteria",
        "- Hole score can be entered quickly",
        "- The round can be saved",
        "",
        "## UX Principles",
        "- mobile-first",
        "- clear feedback after save",
        "",
        "## Non-functional requirements",
        "- data must be retained across sessions",
        "- accessibility support is required",
        "",
        "## Additional requirements",
        "- support 9-hole and 18-hole rounds"
      ].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-framing-1",
          fileName: "golf-brief.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ],
      importIntent: "framing"
    });

    const storyCandidate = mapping.candidates.find((candidate) => candidate.type === "story");

    expect(storyCandidate).toBeDefined();
    expect(storyCandidate?.draftRecord?.acceptanceCriteria).toEqual([]);
    expect(storyCandidate?.draftRecord?.testDefinition).toBeNull();
    expect(storyCandidate?.draftRecord?.expectedBehavior).toContain("capture my score hole by hole");

    expect(mapping.carryForwardItems.map((item) => item.category)).toEqual(
      expect.arrayContaining(["ux_principle", "nfr_constraint", "additional_requirement"])
    );
    expect(mapping.unmappedSections).toHaveLength(0);
  });

  it("assigns an automatic unique-looking import key for story candidates", () => {
    const draftRecord = createArtifactCandidateDraftRecord({
      id: "mapped-file-1-section-1-story",
      type: "story",
      title: "Imported Story",
      summary: "Imported Story summary",
      mappingState: "mapped",
      source: {
        fileId: "file-1",
        fileName: "story.md",
        sectionId: "section-1",
        sectionTitle: "Story",
        sectionMarker: "## Story",
        sourceType: "story_file",
        confidence: "high"
      },
      inferredOutcomeCandidateId: null,
      inferredEpicCandidateId: null,
      relationshipState: "missing",
      relationshipNote: null,
      acceptanceCriteria: [],
      testNotes: []
    });

    expect(draftRecord.key).toMatch(/^IMP-STR-/);
  });

  it("maps escaped structured story spec markdown into one story candidate", () => {
    const content = [
      "\\# M2-STORY-005",
      "",
      "\\## Title",
      "Create Human Review and Confirmation queue for imported artifacts",
      "",
      "\\## Story Type",
      "Feature",
      "",
      "\\## Value Intent",
      "Ensure imported and interpreted content is confirmed by the right humans before it becomes governed AAS work.",
      "",
      "\\## Summary",
      "Create a review queue where humans can inspect imported candidate objects, confirm or edit interpretations, and explicitly resolve human-only decisions without yet promoting them into governed workspaces.",
      "",
      "\\## Acceptance Criteria",
      "\\- a dedicated Human Review queue exists for imported candidate objects",
      "\\- reviewer can inspect:",
      "&#x20; - source artifact",
      "&#x20; - parsed sections",
      "\\- review actions are persisted",
      "",
      "\\## AI Usage Scope",
      "\\- CODE",
      "\\- TEST",
      "",
      "\\## Test Definition",
      "\\- unit",
      "\\- integration",
      "\\- e2e",
      "",
      "\\## Definition of Done",
      "\\- human review queue is usable in end-to-end flow",
      "\\- confirmed and rejected paths are both demonstrable"
    ].join("\n");

    const parsed = parseMarkdownArtifact("file-story-escaped", "M2-STORY-005.md", content);
    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-story-escaped",
          fileName: "M2-STORY-005.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ]
    });

    expect(parsed.classification.sourceType).toBe("story_file");
    expect(mapping.candidates).toHaveLength(1);
    expect(mapping.candidates[0]?.type).toBe("story");
    expect(mapping.candidates[0]?.title).toContain("Human Review and Confirmation");
    expect(mapping.candidates[0]?.acceptanceCriteria).toEqual([
      "a dedicated Human Review queue exists for imported candidate objects",
      "reviewer can inspect:",
      "source artifact",
      "parsed sections",
      "review actions are persisted"
    ]);
    expect(mapping.candidates[0]?.testNotes).toEqual(["unit", "integration", "e2e"]);
    expect(mapping.candidates[0]?.draftRecord?.aiUsageScope).toEqual(["CODE", "TEST"]);
    expect(mapping.candidates[0]?.draftRecord?.definitionOfDone).toEqual([
      "human review queue is usable in end-to-end flow",
      "confirmed and rejected paths are both demonstrable"
    ]);
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
        expectedBehavior: null,
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

    expect(compliance.summary.humanOnly).toBe(0);
    expect(compliance.summary.missing).toBe(1);
    expect(compliance.findings.some((finding) => finding.code === "story_expected_behavior_missing")).toBe(true);
    expect(inferImportedReadinessState({ type: "story", complianceResult: compliance })).toBe("imported_incomplete");
  });

  it("marks imported stories as framing-ready once required framing fields are confirmed", () => {
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
        expectedBehavior: "Capture the imported story idea clearly enough that it can guide later delivery design.",
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
    ).toBe("imported_framing_ready");
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
        expectedBehavior: "Keep the imported story idea clear while issue dispositions are worked off.",
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
        expectedBehavior: "Keep the story idea aligned to one epic and one outcome before design starts.",
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
  it("flags activity-shaped outcomes for human strengthening without blocking them", () => {
    const compliance = analyzeArtifactCandidateCompliance({
      candidate: {
        id: "candidate-outcome-ai-1",
        type: "outcome",
        title: "New dashboard",
        summary: "Implement a new dashboard for suppliers.",
        mappingState: "mapped",
        source: {
          fileId: "file-outcome-ai-1",
          fileName: "messy-intake.txt",
          sectionId: "section-outcome",
          sectionTitle: "Desired change",
          sectionMarker: "## Desired change",
          sourceType: "mixed_markdown_bundle",
          confidence: "medium"
        },
        inferredOutcomeCandidateId: null,
        inferredEpicCandidateId: null,
        relationshipState: "mapped",
        relationshipNote: null,
        acceptanceCriteria: [],
        testNotes: []
      },
      reviewStatus: "edited",
      draftRecord: {
        key: "OUT-NEW",
        title: "New dashboard",
        outcomeStatement: "Implement a new dashboard for suppliers.",
        baselineDefinition: "Current onboarding takes too long.",
        baselineSource: "Workshop notes"
      },
      humanDecisions: {
        valueOwnerId: "user-1",
        aiAccelerationLevel: "level_2",
        riskProfile: "medium",
        baselineValidity: "confirmed"
      }
    });

    expect(compliance.findings.some((finding) => finding.code === "outcome_statement_activity_shaped")).toBe(true);
    expect(compliance.summary.uncertain).toBeGreaterThan(0);
    expect(compliance.summary.blocked).toBe(0);
  });
});
