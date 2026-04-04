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
import {
  parseFramingConstraintBundle,
  serializeFramingConstraintBundle
} from "../../../../packages/domain/src/framing-constraint-bundle";
import { shouldPreferDeterministicFramingImport } from "../../../../packages/domain/src/artifact-intake";

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
    expect(mapping.candidates.some((candidate) => candidate.type === "outcome")).toBe(false);
    expect(storyCandidate?.draftRecord?.acceptanceCriteria).toEqual([]);
    expect(storyCandidate?.draftRecord?.testDefinition).toBeNull();
    expect(storyCandidate?.draftRecord?.valueIntent).toContain("complete a round without paper notes");
    expect(storyCandidate?.draftRecord?.valueIntent).not.toBe(storyCandidate?.draftRecord?.title);
    expect(storyCandidate?.draftRecord?.expectedBehavior).toContain("capture my score hole by hole");

    expect(mapping.carryForwardItems.map((item) => item.category)).toEqual(
      expect.arrayContaining(["ux_principle", "nfr_constraint", "additional_requirement"])
    );
    expect(mapping.unmappedSections).toHaveLength(0);
  });

  it("routes functional requirements into framing constraints instead of turning them into extra story ideas", () => {
    const parsed = parseMarkdownArtifact(
      "file-framing-functional-1",
      "functional-brief.md",
      [
        "# Outcome",
        "Outcome statement: make imported review faster.",
        "",
        "## Epic",
        "Epic title: Human review workflow",
        "",
        "## Functional requirements",
        "- As a reviewer I want to approve imported ideas in one queue so that triage stays fast.",
        "- Users can upload supporting evidence for an imported idea."
      ].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-framing-functional-1",
          fileName: "functional-brief.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ],
      importIntent: "framing"
    });

    const storyCandidates = mapping.candidates.filter((candidate) => candidate.type === "story");

    expect(storyCandidates).toHaveLength(0);
    expect(mapping.carryForwardItems.map((item) => item.category)).toEqual(
      expect.arrayContaining(["additional_requirement"])
    );
    expect(mapping.unmappedSections).toHaveLength(0);
  });

  it("keeps imported outcomes visible in framing imports so they can be approved or updated", () => {
    const parsed = parseMarkdownArtifact(
      "file-framing-outcome-1",
      "framing-outcome.md",
      [
        "# Outcome",
        "Outcome statement: reduce review lead time.",
        "Baseline definition: average approval lead time from upload to approve.",
        "Measurement method: weekly analytics export.",
        "",
        "## Epic",
        "Epic title: Simplify framing import review"
      ].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-framing-outcome-1",
          fileName: "framing-outcome.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ],
      importIntent: "framing"
    });

    const outcomeCandidate = mapping.candidates.find((candidate) => candidate.type === "outcome");
    const epicCandidate = mapping.candidates.find((candidate) => candidate.type === "epic");

    expect(outcomeCandidate).toBeDefined();
    expect(outcomeCandidate?.draftRecord?.outcomeStatement).toContain("reduce review lead time");
    expect(epicCandidate?.draftRecord?.outcomeCandidateId).toBe(outcomeCandidate?.id);
  });

  it("maps product vision text into the imported outcome description for framing", () => {
    const parsed = parseMarkdownArtifact(
      "file-framing-outcome-vision-1",
      "framing-outcome-vision.md",
      [
        "# Product vision",
        "Give value owners one simple framing import flow.",
        "",
        "## Outcome",
        "Outcome statement: reduce framing import cleanup time.",
        "Baseline definition: time from upload to approved framing material.",
        "Measurement method: weekly review sample."
      ].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-framing-outcome-vision-1",
          fileName: "framing-outcome-vision.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ],
      importIntent: "framing"
    });

    const outcomeCandidate = mapping.candidates.find((candidate) => candidate.type === "outcome");

    expect(outcomeCandidate?.draftRecord?.problemStatement).toContain("Give value owners one simple framing import flow.");
  });

  it("imports explicit value spine and delivery story sections from a framing document", () => {
    const parsed = parseMarkdownArtifact(
      "file-krisapp2-1",
      "Krisapp2.md",
      [
        "# AAS Framing Document",
        "",
        "# 4. Outcome",
        "## 4.2 Outcome statement",
        "Öka aktiv hemberedskap i hushåll genom att göra det enkelt att etablera, följa upp och underhålla hemberedskap i vardagen.",
        "",
        "# 17. Value Spine",
        "## 17.1 Outcome",
        "### OUT-001",
        "**Title:** Aktiv hemberedskap i vardagen",
        "**Statement:** Öka aktiv hemberedskap i hushåll genom enkel, vardagsnära och kontinuerlig uppföljning.",
        "**Baseline:** Not yet established",
        "",
        "## 17.2 Epics",
        "### EPIC-001 – Hushållsprofil och onboarding",
        "- **Outcome Link:** OUT-001",
        "- **Purpose:** göra det möjligt att snabbt skapa ett hushåll och anpassa rekommendationer utifrån hushållsstorlek och behov.",
        "",
        "### EPIC-002 – Inventering av hemberedskap",
        "- **Outcome Link:** OUT-001",
        "- **Purpose:** ge användaren möjlighet att registrera vad som finns hemma.",
        "",
        "# 18. Delivery Stories",
        "## 18.2 Stories",
        "### STORY-001 – Skapa hushållsprofil",
        "- **Story Type:** Feature",
        "- **Outcome Link:** OUT-001",
        "- **Epic Link:** EPIC-001",
        "- **Value Intent:** användaren ska snabbt kunna konfigurera sitt hushåll så att rekommendationer blir relevanta från start.",
        "- **Acceptance Criteria:**",
        "  - användaren kan ange hushållsnamn",
        "  - användaren kan spara hushållet",
        "",
        "### STORY-002 – Registrera artikel i förråd",
        "- **Story Type:** Feature",
        "- **Outcome Link:** OUT-001",
        "- **Epic Link:** EPIC-002",
        "- **Value Intent:** användaren ska kunna bygga upp en faktisk inventering.",
        "- **Acceptance Criteria:**",
        "  - användaren kan ange namn på artikel",
        "  - användaren kan spara artikeln",
        "",
        "# 9. Non-Functional Requirements at Framing Level",
        "## 9.1 Simplicity",
        "- användaren ska förstå appens huvudvärde direkt",
        "",
        "# 13. Architecture Intent",
        "## 13.1 Core principle",
        "Appen ska byggas med separation mellan produktmotor och land-/innehållsprofil"
      ].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-krisapp2-1",
          fileName: "Krisapp2.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ],
      importIntent: "framing"
    });

    const outcomeCandidates = mapping.candidates.filter((candidate) => candidate.type === "outcome");
    const epicCandidates = mapping.candidates.filter((candidate) => candidate.type === "epic");
    const storyCandidates = mapping.candidates.filter((candidate) => candidate.type === "story");

    expect(["bmad_prd", "mixed_markdown_bundle"]).toContain(parsed.classification.sourceType);
    expect(outcomeCandidates.length).toBeGreaterThanOrEqual(1);
    expect(epicCandidates.length).toBeGreaterThanOrEqual(2);
    expect(storyCandidates.length).toBeGreaterThanOrEqual(2);
    expect(storyCandidates.some((candidate) => candidate.title.includes("Skapa hushållsprofil"))).toBe(true);
    expect(storyCandidates.some((candidate) => candidate.title.includes("Registrera artikel i förråd"))).toBe(true);
    expect(storyCandidates.every((candidate) => Boolean(candidate.draftRecord?.epicCandidateId || candidate.inferredEpicCandidateId))).toBe(true);
    const epic001 = epicCandidates.find((candidate) => candidate.draftRecord?.key === "EPIC-001");
    const epic002 = epicCandidates.find((candidate) => candidate.draftRecord?.key === "EPIC-002");
    const story001 = storyCandidates.find((candidate) => candidate.draftRecord?.key === "STORY-001");
    const story002 = storyCandidates.find((candidate) => candidate.draftRecord?.key === "STORY-002");
    expect(story001?.draftRecord?.epicCandidateId ?? story001?.inferredEpicCandidateId).toBe(epic001?.id);
    expect(story002?.draftRecord?.epicCandidateId ?? story002?.inferredEpicCandidateId).toBe(epic002?.id);
    expect(mapping.carryForwardItems.map((item) => item.category)).toEqual(
      expect.arrayContaining(["nfr_constraint", "solution_constraint"])
    );
  });

  it("prefers deterministic framing import when AI under-reads explicit value spine counts", () => {
    expect(
      shouldPreferDeterministicFramingImport({
        importIntent: "framing",
        explicitValueSpineCounts: {
          outcomes: 1,
          epics: 7,
          stories: 18
        },
        aiCandidateCounts: {
          outcomes: 1,
          epics: 7,
          stories: 2
        },
        deterministicCandidateCounts: {
          outcomes: 1,
          epics: 7,
          stories: 18
        }
      })
    ).toBe(true);

    expect(
      shouldPreferDeterministicFramingImport({
        importIntent: "design",
        explicitValueSpineCounts: {
          outcomes: 1,
          epics: 7,
          stories: 18
        },
        aiCandidateCounts: {
          outcomes: 1,
          epics: 7,
          stories: 18
        },
        deterministicCandidateCounts: {
          outcomes: 1,
          epics: 7,
          stories: 18
        }
      })
    ).toBe(false);
  });

  it("collapses multiple framing outcomes from the same file into one merged outcome candidate", () => {
    const parsed = parseMarkdownArtifact(
      "file-framing-merged-outcome-1",
      "framing-merged-outcome.md",
      [
        "# Product vision",
        "Give reviewers one simpler import flow.",
        "",
        "## Outcome Alpha",
        "Outcome statement: reduce framing cleanup time.",
        "Baseline definition: clean-up is manual today.",
        "",
        "## Outcome Beta",
        "Outcome statement: make outcome updates easier to review.",
        "Measurement method: weekly import audit.",
        "",
        "## Epic",
        "Create one editable framing spine.",
        "",
        "## Story",
        "As a value owner I want one merged imported outcome so that I can complement the project outcome instead of creating many."
      ].join("\n")
    );

    const mapping = mapParsedArtifactsToAasCandidates({
      files: [
        {
          id: "file-framing-merged-outcome-1",
          fileName: "framing-merged-outcome.md",
          sourceType: parsed.classification.sourceType,
          parsedArtifacts: parsed
        }
      ],
      importIntent: "framing"
    });

    const outcomeCandidates = mapping.candidates.filter((candidate) => candidate.type === "outcome");
    const epicCandidate = mapping.candidates.find((candidate) => candidate.type === "epic");
    const storyCandidate = mapping.candidates.find((candidate) => candidate.type === "story");

    expect(outcomeCandidates).toHaveLength(1);
    expect(outcomeCandidates[0]?.draftRecord?.outcomeStatement).toContain("reduce framing cleanup time");
    expect(outcomeCandidates[0]?.draftRecord?.outcomeStatement).toContain("make outcome updates easier to review");
    expect(outcomeCandidates[0]?.draftRecord?.baselineSource).toContain("weekly import audit");
    expect(epicCandidate?.draftRecord?.outcomeCandidateId).toBe(outcomeCandidates[0]?.id);
    expect(storyCandidate?.draftRecord?.outcomeCandidateId).toBe(outcomeCandidates[0]?.id);
  });

  it("preserves explicit AI-assisted epic links instead of relying only on section order", () => {
    const parsed = parseMarkdownArtifact(
      "file-ai-epic-link",
      "epic-linked-intake.md",
      [
        "# Outcome",
        "Reduce onboarding delay for new supplier teams.",
        "",
        "## Epic Alpha",
        "Standardize onboarding checklist and handoff preparation.",
        "",
        "## Story Alpha 1",
        "As a delivery lead I want a shared onboarding checklist so that supplier teams start with fewer gaps.",
        "",
        "## Epic Beta",
        "Make reviewable import outputs visible before promotion.",
        "",
        "## Story Beta 1",
        "As a value owner I want to review imported story ideas in one queue so that framing approval stays fast."
      ].join("\n")
    );

    const outcomeSection = parsed.sections.find((section) => section.title === "Outcome");
    const epicAlphaSection = parsed.sections.find((section) => section.title === "Epic Alpha");
    const storyAlphaSection = parsed.sections.find((section) => section.title === "Story Alpha 1");
    const epicBetaSection = parsed.sections.find((section) => section.title === "Epic Beta");
    const storyBetaSection = parsed.sections.find((section) => section.title === "Story Beta 1");

    const result = buildAiAssistedArtifactProcessingResult({
      importIntent: "framing",
      files: [
        {
          id: "file-ai-epic-link",
          fileName: "epic-linked-intake.md",
          parsedArtifacts: parsed
        }
      ],
      interpretation: {
        files: [
          {
            fileName: "epic-linked-intake.md",
            sourceType: "mixed_markdown_bundle",
            confidence: "high",
            rationale: "The source contains one outcome, two epics and linked story sections.",
            sectionDecisions: [
              {
                sectionId: outcomeSection!.id,
                kind: "outcome_candidate",
                confidence: "high"
              },
              {
                sectionId: epicAlphaSection!.id,
                kind: "epic_candidate",
                confidence: "high"
              },
              {
                sectionId: storyAlphaSection!.id,
                kind: "story_candidate",
                confidence: "high"
              },
              {
                sectionId: epicBetaSection!.id,
                kind: "epic_candidate",
                confidence: "high"
              },
              {
                sectionId: storyBetaSection!.id,
                kind: "story_candidate",
                confidence: "high"
              }
            ],
            candidates: [
              {
                sectionId: outcomeSection!.id,
                type: "outcome",
                title: "Reduce onboarding delay",
                summary: "Reduce onboarding delay for new supplier teams.",
                draftRecord: {
                  title: "Reduce onboarding delay",
                  outcomeStatement: "Reduce onboarding delay for new supplier teams."
                }
              },
              {
                sectionId: epicAlphaSection!.id,
                type: "epic",
                title: "Standardize onboarding checklist",
                summary: "Standardize onboarding checklist and handoff preparation.",
                linkedOutcomeSectionId: outcomeSection!.id
              },
              {
                sectionId: storyAlphaSection!.id,
                type: "story",
                title: "Shared onboarding checklist",
                summary: "Create a framing-level story idea for a shared onboarding checklist.",
                linkedEpicSectionId: epicAlphaSection!.id,
                linkedOutcomeSectionId: outcomeSection!.id
              },
              {
                sectionId: epicBetaSection!.id,
                type: "epic",
                title: "Reviewable import outputs",
                summary: "Make reviewable import outputs visible before promotion.",
                linkedOutcomeSectionId: outcomeSection!.id
              },
              {
                sectionId: storyBetaSection!.id,
                type: "story",
                title: "Review imported story ideas in one queue",
                summary: "Review imported story ideas in one queue so framing approval stays fast.",
                linkedEpicSectionId: epicBetaSection!.id,
                linkedOutcomeSectionId: outcomeSection!.id
              }
            ],
            leftoverSectionIds: []
          }
        ]
      }
    });

    const epicAlphaCandidate = result.mappingResult.candidates.find((candidate) => candidate.title === "Standardize onboarding checklist");
    const epicBetaCandidate = result.mappingResult.candidates.find((candidate) => candidate.title === "Reviewable import outputs");
    const storyAlphaCandidate = result.mappingResult.candidates.find((candidate) => candidate.title === "Shared onboarding checklist");
    const storyBetaCandidate = result.mappingResult.candidates.find((candidate) => candidate.title === "Review imported story ideas in one queue");

    expect(storyAlphaCandidate?.inferredEpicCandidateId).toBe(epicAlphaCandidate?.id);
    expect(storyBetaCandidate?.inferredEpicCandidateId).toBe(epicBetaCandidate?.id);
    expect(storyAlphaCandidate?.draftRecord?.epicCandidateId).toBe(epicAlphaCandidate?.id);
    expect(storyBetaCandidate?.draftRecord?.epicCandidateId).toBe(epicBetaCandidate?.id);
  });

  it("uses acceptance criteria to improve framing value intent during AI-assisted imports", () => {
    const parsed = parseMarkdownArtifact(
      "file-ai-story-intent",
      "ai-story-intent.md",
      [
        "# Outcome",
        "Reduce import noise for value owners.",
        "",
        "## Epic",
        "Give reviewers one place to handle imported material.",
        "",
        "## Story",
        "Review imported leftovers",
        "",
        "## Acceptance Criteria",
        "- Decision makers can approve or reject summarized leftovers quickly",
        "- Leftovers are grouped instead of listed item by item"
      ].join("\n")
    );
    const outcomeSection = parsed.sections.find((section) => section.title === "Outcome");
    const epicSection = parsed.sections.find((section) => section.title === "Epic");
    const storySection = parsed.sections.find((section) => section.title === "Story");
    const acceptanceSection = parsed.sections.find((section) => section.title === "Acceptance Criteria");

    const result = buildAiAssistedArtifactProcessingResult({
      importIntent: "framing",
      files: [
        {
          id: "file-ai-story-intent",
          fileName: "ai-story-intent.md",
          parsedArtifacts: parsed
        }
      ],
      interpretation: {
        files: [
          {
            fileName: "ai-story-intent.md",
            sourceType: "mixed_markdown_bundle",
            confidence: "high",
            rationale: "Outcome, epic and story are clearly identifiable.",
            sectionDecisions: [
              {
                sectionId: outcomeSection!.id,
                kind: "outcome_candidate",
                confidence: "high"
              },
              {
                sectionId: epicSection!.id,
                kind: "epic_candidate",
                confidence: "high"
              },
              {
                sectionId: storySection!.id,
                kind: "story_candidate",
                confidence: "high"
              },
              {
                sectionId: acceptanceSection!.id,
                kind: "acceptance_criteria",
                confidence: "high"
              }
            ],
            candidates: [
              {
                sectionId: outcomeSection!.id,
                type: "outcome",
                title: "Reduce import noise",
                summary: "Reduce import noise for value owners."
              },
              {
                sectionId: epicSection!.id,
                type: "epic",
                title: "Review imported material in one place",
                summary: "Give reviewers one place to handle imported material.",
                linkedOutcomeSectionId: outcomeSection!.id
              },
              {
                sectionId: storySection!.id,
                type: "story",
                title: "Review imported leftovers",
                summary: "Review imported leftovers",
                linkedOutcomeSectionId: outcomeSection!.id,
                linkedEpicSectionId: epicSection!.id,
                acceptanceCriteria: [
                  "Decision makers can approve or reject summarized leftovers quickly",
                  "Leftovers are grouped instead of listed item by item"
                ],
                draftRecord: {
                  title: "Review imported leftovers",
                  valueIntent: "Review imported leftovers"
                }
              }
            ],
            leftoverSectionIds: []
          }
        ]
      }
    });

    const storyCandidate = result.mappingResult.candidates.find((candidate) => candidate.type === "story");

    expect(storyCandidate?.draftRecord?.valueIntent).toContain("approve or reject summarized leftovers quickly");
    expect(storyCandidate?.draftRecord?.valueIntent).not.toBe("Review imported leftovers");
    expect(storyCandidate?.draftRecord?.expectedBehavior).not.toBe(storyCandidate?.draftRecord?.valueIntent);
  });

  it("can reinterpret story-like AI candidates as story ideas during framing import", () => {
    const parsed = parseMarkdownArtifact(
      "file-ai-story-reinterpret",
      "ai-story-reinterpret.md",
      [
        "# Outcome",
        "Reduce framing cleanup time.",
        "",
        "## Candidate item",
        "As a value owner I want imported story ideas in one spine so that I can approve the right ones quickly."
      ].join("\n")
    );
    const outcomeSection = parsed.sections.find((section) => section.title === "Outcome");
    const candidateSection = parsed.sections.find((section) => section.title === "Candidate item");

    const result = buildAiAssistedArtifactProcessingResult({
      importIntent: "framing",
      files: [
        {
          id: "file-ai-story-reinterpret",
          fileName: "ai-story-reinterpret.md",
          parsedArtifacts: parsed
        }
      ],
      interpretation: {
        files: [
          {
            fileName: "ai-story-reinterpret.md",
            sourceType: "mixed_markdown_bundle",
            confidence: "medium",
            rationale: "The second section was interpreted too broadly.",
            sectionDecisions: [
              {
                sectionId: outcomeSection!.id,
                kind: "outcome_candidate",
                confidence: "high"
              },
              {
                sectionId: candidateSection!.id,
                kind: "epic_candidate",
                confidence: "medium"
              }
            ],
            candidates: [
              {
                sectionId: outcomeSection!.id,
                type: "outcome",
                title: "Reduce framing cleanup time",
                summary: "Reduce framing cleanup time."
              },
              {
                sectionId: candidateSection!.id,
                type: "epic",
                title: "Imported story ideas in one spine",
                summary: "As a value owner I want imported story ideas in one spine so that I can approve the right ones quickly."
              }
            ],
            leftoverSectionIds: []
          }
        ]
      }
    });

    const nonOutcomeCandidates = result.mappingResult.candidates.filter((candidate) => candidate.type !== "outcome");

    expect(nonOutcomeCandidates).toHaveLength(1);
    expect(nonOutcomeCandidates[0]?.type).toBe("story");
    expect(nonOutcomeCandidates[0]?.draftRecord?.valueIntent).toContain("approve the right ones quickly");
  });

  it("round-trips structured framing constraint bundles", () => {
    const serialized = serializeFramingConstraintBundle({
      generalConstraints: "- Keep data within approved tenant boundaries",
      uxPrinciples: "- Mobile first\n- Clear save feedback",
      nonFunctionalRequirements: "- Accessibility support is required",
      additionalRequirements: "- Support both 9-hole and 18-hole rounds"
    });

    expect(parseFramingConstraintBundle(serialized)).toEqual({
      generalConstraints: "- Keep data within approved tenant boundaries",
      uxPrinciples: "- Mobile first\n- Clear save feedback",
      nonFunctionalRequirements: "- Accessibility support is required",
      additionalRequirements: "- Support both 9-hole and 18-hole rounds"
    });
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
    expect(compliance.findings.some((finding) => finding.code === "story_expected_behavior_missing")).toBe(false);
  });

  it("keeps imported outcomes well-formed when they target an existing project outcome", () => {
    const compliance = analyzeArtifactCandidateCompliance({
      candidate: {
        id: "candidate-outcome-existing-1",
        type: "outcome",
        title: "Imported Outcome",
        summary: "Reduce framing cleanup time.",
        mappingState: "mapped",
        source: {
          fileId: "file-outcome-existing-1",
          fileName: "outcome-import.md",
          sectionId: "section-outcome",
          sectionTitle: "Outcome",
          sectionMarker: "## Outcome",
          sourceType: "mixed_markdown_bundle",
          confidence: "high"
        },
        inferredOutcomeCandidateId: null,
        inferredEpicCandidateId: null,
        relationshipState: "mapped",
        relationshipNote: null,
        acceptanceCriteria: [],
        testNotes: []
      },
      reviewStatus: "confirmed",
      draftRecord: {
        key: "OUT-001",
        title: "Imported Outcome",
        outcomeStatement: "Reduce framing cleanup time.",
        baselineDefinition: "Current cleanup is manual and slow.",
        baselineSource: "Import review notes",
        outcomeCandidateId: "project-outcome-1"
      },
      humanDecisions: {
        valueOwnerId: null,
        aiAccelerationLevel: null,
        riskProfile: null,
        baselineValidity: null
      }
    });

    expect(compliance.summary.missing).toBe(0);
    expect(compliance.findings.some((finding) => finding.code === "outcome_statement_missing")).toBe(false);
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
