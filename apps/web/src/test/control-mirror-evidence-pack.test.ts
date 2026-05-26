import { describe, expect, it } from "vitest";
import {
  applyControlMirrorHumanReviewStateToDashboard,
  buildControlMirrorDashboard,
  buildControlMirrorEvidencePack
} from "@aas-companion/domain";

function createEvidencePackInput() {
  return {
    organizationName: "AAS Demo Organization",
    outcomes: [
      {
        id: "outcome-1",
        key: "OUT-CM-001",
        title: "Control Mirror",
        framingVersion: 1,
        valueOwnerId: "value-owner-1",
        outcomeStatement: "Verify AI delivery conformance.",
        baselineDefinition: "Current delivery lacks mirror control.",
        riskProfile: "medium",
        aiAccelerationLevel: "level_3" as const,
        status: "active",
        directionSeeds: [],
        epics: [
          {
            id: "epic-1",
            key: "CM-01",
            title: "Conformance dashboard",
            purpose: "Show evidence.",
            directionSeeds: [
              {
                id: "SC-001",
                key: "SC-001",
                title: "Open Control Mirror idea",
                shortDescription: "Give delivery leaders evidence.",
                expectedBehavior: "Dashboard shows conformance state.",
                sourceStoryId: null
              }
            ],
            stories: [
              {
                id: "story-1",
                key: "CM-01.1",
                title: "Open Control Mirror",
                outcomeId: "outcome-1",
                epicId: "epic-1",
                valueIntent: "Give delivery leaders evidence.",
                expectedBehavior: "Dashboard shows conformance state.",
                acceptanceCriteria: ["Given a project, then conformance is visible."],
                aiUsageScope: ["deterministic checks"],
                aiAccelerationLevel: "level_3" as const,
                testDefinition: "",
                definitionOfDone: ["Human review remains visible."],
                status: "ready_for_handoff" as const,
                tollgateStatus: "approved" as const
              }
            ]
          }
        ]
      }
    ],
    persistentSnapshot: {
      id: "snapshot-1",
      label: "Uploaded project snapshot",
      sourceType: "uploaded_zip",
      scanTime: "2026-05-22T00:00:00.000Z",
      fileCount: 1,
      acceptedCount: 1,
      rejectedCount: 0,
      unreadableCount: 0,
      unchangedCount: 0,
      newCount: 1,
      modifiedCount: 0,
      deletedCount: 0,
      artifacts: [
        {
          id: "artifact-1",
          fileName: "docs/runtime.ts",
          artifactType: "implementation_note" as const,
          lineageStatus: "missing" as const,
          parsingConfidence: "high" as const,
          changeStatus: "new" as const,
          storyId: null
        }
      ],
      normalizedEvidence: [
        {
          id: "evidence-1",
          artifactId: "artifact-1",
          fileName: "docs/runtime.ts",
          evidenceType: "implementation_evidence" as const,
          label: "Runtime",
          sourceSection: "full-file",
          storyClassification: "not_story_like" as const,
          readinessState: "not_story_like" as const,
          missingReadinessFields: [],
          storyId: null,
          retentionMode: "redacted_excerpts" as const,
          retentionDisclosure: "A redacted source excerpt was retained.",
          redactionApplied: true,
          sensitiveFindingCount: 1
        }
      ]
    },
    artifactSessions: [],
    tollgates: [],
    signoffRecords: []
  };
}

describe("Control Mirror evidence pack export model", () => {
  it("builds an audit payload from the dashboard without raw source text", () => {
    const dashboard = buildControlMirrorDashboard(createEvidencePackInput());
    const evidencePack = buildControlMirrorEvidencePack(dashboard, {
      generatedAt: "2026-05-22T01:00:00.000Z"
    });
    const serialized = JSON.stringify(evidencePack);

    expect(evidencePack).toMatchObject({
      schemaVersion: "control-mirror-evidence-pack/v1",
      generatedAt: "2026-05-22T01:00:00.000Z",
      activeProject: "AAS Demo Organization",
      snapshot: {
        id: "snapshot-1",
        sourceType: "uploaded_zip",
        acceptedCount: 1,
        newCount: 1
      },
      aiLevel: {
        requested: "level_3"
      },
      source: {
        activeModeLabel: "Uploaded snapshot",
        activeModeRetention: "redacted_excerpts"
      },
      safety: {
        rawSourceTextIncluded: false
      },
      acceptance: {
        status: "requires_product_security_acceptance",
        shareReadiness: "acceptance_required",
        requiredReviewers: ["Product owner", "Security/privacy reviewer", "AQA reviewer"]
      }
    });

    expect(evidencePack.report.summaryItems.map((item) => item.id)).toContain("release-readiness");
    expect(evidencePack.evidence.storyIdeas[0]).toMatchObject({
      originalStoryIdeaId: "SC-001",
      originalEpicId: "epic-1",
      title: "Open Control Mirror idea",
      valueIntent: "Give delivery leaders evidence.",
      expectedBehavior: "Dashboard shows conformance state.",
      implementationStatus: "partial"
    });
    expect(evidencePack.validation.status).toBe("invalid");
    expect(evidencePack.validation.issues.map((issue) => issue.id)).toContain("missing-baseline-evidence-SC-001");
    expect(evidencePack.report.assurance).toMatchObject({
      releaseApprovalStatus: "blocked"
    });
    expect(evidencePack.report.recommendedNextStep).toBe("Resolve blocking Human Review items before release or higher AI-level claims.");
    expect(evidencePack.evidence.artifacts[0]).toMatchObject({
      fileName: "docs/runtime.ts",
      artifactType: "implementation_note",
      lineageStatus: "missing"
    });
    expect(evidencePack.evidence.normalizedEvidence[0]).toMatchObject({
      retentionMode: "redacted_excerpts",
      retentionDisclosure: "A redacted source excerpt was retained.",
      redactionApplied: true,
      sensitiveFindingCount: 1
    });
    expect(evidencePack.findings.conformance.length).toBeGreaterThan(0);
    expect(evidencePack.humanReview.summary.openBlocking).toBeGreaterThan(0);
    expect(evidencePack.acceptance.checklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "raw-source-exclusion",
          status: "verified"
        }),
        expect.objectContaining({
          id: "retention-disclosure-review",
          status: "requires_review"
        })
      ])
    );

    expect(serialized).toContain("Source text policy is disclosed");
    expect(serialized).toContain("Product/Security acceptance is required");
    expect(serialized).not.toContain("\"content\"");
    expect(serialized).not.toContain("retainedExcerpt");
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("Authorization: Bearer");
  });

  it("preserves Human Review decision state and latest rationale in the export", () => {
    const dashboard = buildControlMirrorDashboard(createEvidencePackInput());
    const decidedDashboard = applyControlMirrorHumanReviewStateToDashboard(
      dashboard,
      dashboard.humanReviewItems.map((item) => ({
        ...item,
        reviewState: "decided" as const,
        latestHumanDecision: {
          id: `decision-${item.id}`,
          decisionType: "request_rework" as const,
          rationale: "Attach Story-ID evidence before export.",
          actorId: "user-1",
          createdAt: "2026-05-22T01:15:00.000Z"
        }
      }))
    );

    const evidencePack = buildControlMirrorEvidencePack(decidedDashboard, {
      generatedAt: "2026-05-22T01:20:00.000Z"
    });

    expect(evidencePack.humanReview.summary.decided).toBe(decidedDashboard.humanReviewItems.length);
    expect(evidencePack.humanReview.summary.open).toBe(0);
    expect(evidencePack.report.blockingGaps).toEqual([]);
    expect(evidencePack.humanReview.items[0]?.latestHumanDecision).toMatchObject({
      decisionType: "request_rework",
      rationale: "Attach Story-ID evidence before export.",
      actorId: "user-1"
    });
  });

  it("validates one evidence row per original Story Idea and flags incomplete implementation evidence", () => {
    const input = createEvidencePackInput();

    input.outcomes[0]!.epics[0]!.directionSeeds = [
      {
        id: "SC-001",
        key: "SC-001",
        title: "Fully verified idea",
        shortDescription: "Keep a complete trace.",
        expectedBehavior: "Runtime and test evidence are visible.",
        sourceStoryId: null
      },
      {
        id: "SC-002",
        key: "SC-002",
        title: "Missing runtime idea",
        shortDescription: "Expose missing runtime.",
        expectedBehavior: "Validation blocks incomplete evidence.",
        sourceStoryId: null
      },
      {
        id: "SC-003",
        key: "SC-003",
        title: "Missing test idea",
        shortDescription: "Expose missing tests.",
        expectedBehavior: "Validation blocks untested implementation.",
        sourceStoryId: null
      },
      {
        id: "SC-004",
        key: "SC-004",
        title: "Missing metadata idea",
        shortDescription: "Expose stale verification.",
        expectedBehavior: "Validation blocks stale metadata.",
        sourceStoryId: null
      },
      {
        id: "SC-005",
        key: "SC-005",
        title: "Scope-out idea",
        shortDescription: "Expose missing approval.",
        expectedBehavior: "Scope-out needs human approval.",
        sourceStoryId: null
      },
      {
        id: "SC-006",
        key: "SC-006",
        title: "Missing accountability idea",
        shortDescription: "Expose missing rows.",
        expectedBehavior: "Every baseline idea is accounted for.",
        sourceStoryId: null
      }
    ];
    const accountabilityInput = {
      ...input,
      persistentSnapshot: null,
      artifactSessions: [
        {
          id: "session-bmad",
          label: "BMAD comparison",
          importIntent: "design" as const,
          status: "completed",
          createdAt: "2026-05-26T08:00:00.000Z",
          updatedAt: "2026-05-26T08:30:00.000Z",
          files: [
            {
              id: "file-bmad",
              fileName: "docs/control-mirror/bmad-comparison-matrix.csv",
              sourceType: "mixed_markdown_bundle",
              sourceConfidence: "high" as const,
              sizeBytes: 512,
              content: [
                "artifact_path,artifact_type,evidence_state,source_outcome_id,source_epic_id,source_story_idea_id,delivery_story_id,test_ids,verification_result,remaining_gap,decision_id",
                "apps/web/src/app/control-mirror/page.tsx,implementation,implemented,outcome-1,epic-1,SC-001,CM-01.1,,,",
                "apps/web/src/test/control-mirror-page.test.tsx,test,tested,outcome-1,epic-1,SC-001,CM-01.1,CM-01.1-test,passing,,",
                "apps/web/src/test/missing-runtime.test.tsx,test,tested,outcome-1,epic-1,SC-002,CM-01.2,CM-01.2-test,passing,,",
                "apps/web/src/app/runtime-only.tsx,implementation,implemented,outcome-1,epic-1,SC-003,CM-01.3,,,",
                "apps/web/src/app/stale.tsx,implementation,implemented,outcome-1,epic-1,SC-004,CM-01.4,,,",
                "apps/web/src/app/scope-out.tsx,implementation,implemented,outcome-1,epic-1,SC-005,CM-01.5,,passing,out_of_scope item,"
              ].join("\n")
            }
          ],
          candidates: []
        }
      ]
    };

    const dashboard = buildControlMirrorDashboard(accountabilityInput);
    const evidencePack = buildControlMirrorEvidencePack(dashboard, {
      generatedAt: "2026-05-26T09:00:00.000Z"
    });
    const issueIds = evidencePack.validation.issues.map((issue) => issue.id);

    expect(evidencePack.evidence.storyIdeas.map((row) => row.originalStoryIdeaId)).toEqual([
      "SC-001",
      "SC-002",
      "SC-003",
      "SC-004",
      "SC-005",
      "SC-006"
    ]);
    expect(evidencePack.evidence.storyIdeas[0]).toMatchObject({
      originalEpicId: "epic-1",
      mappedDeliveryStoryId: "CM-01.1",
      runtimeArtifacts: ["apps/web/src/app/control-mirror/page.tsx"],
      testArtifacts: ["apps/web/src/test/control-mirror-page.test.tsx"],
      testIds: ["CM-01.1-test"],
      latestTestResult: "passing",
      machineVerified: true
    });
    expect(evidencePack.report.assurance.machineVerifiedEvidence).toContain("SC-001: passing");
    expect(issueIds).toContain("implemented-without-runtime-artifacts-SC-002");
    expect(issueIds).toContain("implemented-without-test-evidence-SC-003");
    expect(issueIds).toContain("stale-or-inconsistent-metadata-SC-004");
    expect(issueIds).toContain("scope-out-implemented-without-approval-SC-005");
    expect(issueIds).toContain("missing-baseline-evidence-SC-006");
  });

  it("accounts for Story Ideas when BMAD evidence uses grouped IDs and story_idea matrix rows", () => {
    const input = createEvidencePackInput();
    const storyIdeas = Array.from({ length: 9 }, (_, index) => {
      const id = `SC-${String(index + 1).padStart(3, "0")}`;

      return {
        id,
        key: id,
        title: `Story Idea ${index + 1}`,
        shortDescription: `Value intent ${index + 1}`,
        expectedBehavior: `Expected behavior ${index + 1}`,
        sourceStoryId: null
      };
    });
    const deliveryByStoryIdea = new Map([
      ["SC-001", "DS-001"],
      ["SC-002", "DS-001"],
      ["SC-003", "DS-002"],
      ["SC-004", "DS-002"],
      ["SC-005", "DS-003"],
      ["SC-006", "DS-003"],
      ["SC-007", "DS-004"],
      ["SC-008", "DS-004"],
      ["SC-009", "DS-005"]
    ]);

    input.outcomes[0]!.epics[0]!.directionSeeds = storyIdeas;
    input.persistentSnapshot = null;
    input.artifactSessions = [
      {
        id: "session-matsvinn",
        label: "Matsvinn Control Mirror docs",
        importIntent: "design" as const,
        status: "completed",
        createdAt: "2026-05-26T06:29:00.000Z",
        updatedAt: "2026-05-26T06:29:00.000Z",
        files: [
          {
            id: "file-manifest",
            fileName: "docs/control-mirror/bmad-comparison-manifest.json",
            sourceType: "mixed_markdown_bundle",
            sourceConfidence: "high" as const,
            sizeBytes: 1024,
            content: JSON.stringify({
              entries: [
                {
                  artifact_path: "app/index.html",
                  artifact_type: "runtime_ui",
                  evidence_state: "implemented_and_tested",
                  source_outcome_id: "OUT-001",
                  source_epic_id: "EPIC-001,EPIC-002,EPIC-003,EPIC-004,EPIC-005",
                  source_story_idea_id: storyIdeas.map((idea) => idea.id).join(","),
                  delivery_story_id: "DS-001,DS-002,DS-003,DS-004,DS-005",
                  decision_id: "TECH-022",
                  test_ids: ["tests/story-idea-coverage.test.js"],
                  verification_result: "passed",
                  remaining_gap: "Human release review still required."
                },
                {
                  artifact_path: "tests/story-idea-coverage.test.js",
                  artifact_type: "automated_story_idea_coverage_test",
                  evidence_state: "tested",
                  source_outcome_id: "OUT-001",
                  source_epic_id: "EPIC-001,EPIC-002,EPIC-003,EPIC-004,EPIC-005",
                  source_story_idea_id: storyIdeas.map((idea) => idea.id).join(","),
                  delivery_story_id: "DS-001,DS-002,DS-003,DS-004,DS-005",
                  decision_id: "TECH-022",
                  test_ids: ["tests/story-idea-coverage.test.js"],
                  verification_result: "passed",
                  remaining_gap: "Human release review still required."
                }
              ]
            })
          },
          {
            id: "file-matrix",
            fileName: "docs/control-mirror/bmad-comparison-matrix.csv",
            sourceType: "mixed_markdown_bundle",
            sourceConfidence: "high" as const,
            sizeBytes: 1024,
            content: [
              "row_type,id,baseline_scope,refined_scope,extra_scope,dropped_or_deferred,implementation_artifacts,verification_evidence,customer_decision_needed",
              ...storyIdeas.map((idea) => [
                "story_idea",
                idea.id,
                idea.title,
                deliveryByStoryIdea.get(idea.id),
                "none",
                "none",
                "app/index.html; app/app-core.js; app/app.js",
                "core test and browser smoke passed",
                "no"
              ].join(","))
            ].join("\n")
          }
        ],
        candidates: []
      }
    ];

    const dashboard = buildControlMirrorDashboard(input);
    const evidencePack = buildControlMirrorEvidencePack(dashboard, {
      generatedAt: "2026-05-26T07:00:00.000Z"
    });
    const issueIds = evidencePack.validation.issues.map((issue) => issue.id);

    expect(evidencePack.evidence.storyIdeas).toHaveLength(9);
    expect(evidencePack.evidence.storyIdeas.map((row) => row.originalStoryIdeaId)).toEqual(storyIdeas.map((idea) => idea.id));
    expect(evidencePack.evidence.storyIdeas[0]).toMatchObject({
      originalStoryIdeaId: "SC-001",
      mappedDeliveryStoryId: "DS-001",
      implementationStatus: "implemented",
      runtimeArtifacts: expect.arrayContaining(["app/index.html"]),
      testArtifacts: expect.arrayContaining(["tests/story-idea-coverage.test.js"]),
      testIds: expect.arrayContaining(["tests/story-idea-coverage.test.js"]),
      latestTestResult: "core test and browser smoke passed",
      machineVerified: true
    });
    expect(evidencePack.evidence.storyIdeas[8]).toMatchObject({
      originalStoryIdeaId: "SC-009",
      mappedDeliveryStoryId: "DS-005",
      implementationStatus: "implemented"
    });
    expect(issueIds.some((id) => id.startsWith("missing-baseline-evidence-"))).toBe(false);
    expect(issueIds.some((id) => id.startsWith("implemented-without-runtime-artifacts-"))).toBe(false);
    expect(issueIds.some((id) => id.startsWith("implemented-without-test-evidence-"))).toBe(false);
  });
});
