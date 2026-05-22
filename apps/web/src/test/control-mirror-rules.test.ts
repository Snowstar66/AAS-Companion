import { describe, expect, it } from "vitest";
import {
  applyControlMirrorEvidenceRetentionPolicy,
  applyControlMirrorHumanReviewStateToDashboard,
  buildControlMirrorDashboard,
  classifyControlMirrorArtifact,
  getControlMirrorRetentionModeForSourceType,
  getControlMirrorSourcePolicy,
  normalizeControlMirrorArtifact
} from "@aas-companion/domain";

function createBaseInput() {
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
        directionSeeds: [
          {
            id: "seed-1",
            key: "SC-001",
            title: "Show conformance",
            shortDescription: "Make delivery conformance visible.",
            expectedBehavior: "Leaders see gaps before release."
          }
        ],
        epics: [
          {
            id: "epic-1",
            key: "CM-01",
            title: "Conformance dashboard",
            purpose: "Show evidence.",
            directionSeeds: [],
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
                testDefinition: "Render dashboard test.",
                definitionOfDone: ["Human review remains visible."],
                status: "ready_for_handoff" as const,
                tollgateStatus: "approved" as const
              }
            ]
          }
        ]
      }
    ],
    artifactSessions: [],
    tollgates: [],
    signoffRecords: []
  };
}

describe("Control Mirror rules", () => {
  it("does not claim the requested Level 3 when required evidence is missing", () => {
    const dashboard = buildControlMirrorDashboard(createBaseInput());

    expect(dashboard.requestedAiLevel).toBe("level_3");
    expect(dashboard.achievedAiLevel).toBe("level_1");
    expect(dashboard.releaseReadiness).toBe("blocked");
    expect(dashboard.sourcePolicy.summary).toContain("user-authorized evidence");
    expect(dashboard.conformance.aiLevelRecommendation).toBe("downgrade");
    expect(dashboard.humanReviewItems.some((item) => item.id === "ai-level-mismatch")).toBe(true);
  });

  it("exposes source modes with explicit support and retention policy", () => {
    const policy = getControlMirrorSourcePolicy();

    expect(policy.retentionDefault).toBe("metadata_and_excerpts");
    expect(policy.modes.find((mode) => mode.id === "current_imports")).toMatchObject({
      supportStatus: "active",
      refreshSupported: true,
      retentionMode: "metadata_and_excerpts"
    });
    expect(policy.modes.find((mode) => mode.id === "uploaded_zip")).toMatchObject({
      supportStatus: "active",
      refreshSupported: true,
      actionHref: "/control-mirror?source=uploaded-snapshot",
      retentionMode: "redacted_excerpts"
    });
    expect(policy.modes.find((mode) => mode.id === "folder_snapshot")).toMatchObject({
      supportStatus: "planned",
      actionHref: null
    });
    expect(policy.modes.find((mode) => mode.id === "git_repository_root")).toMatchObject({
      supportStatus: "unsupported",
      actionHref: null,
      retentionMode: "not_retained"
    });
  });

  it("applies retention and redaction policy before evidence storage", () => {
    expect(getControlMirrorRetentionModeForSourceType("uploaded_zip")).toBe("redacted_excerpts");
    expect(getControlMirrorRetentionModeForSourceType("folder_snapshot")).toBe("metadata_only");

    const redacted = applyControlMirrorEvidenceRetentionPolicy({
      retentionMode: "redacted_excerpts",
      content: "Build log\nTOKEN=super-secret\nAuthorization: Bearer abc123"
    });

    expect(redacted.retainedExcerpt).toContain("TOKEN=[REDACTED]");
    expect(redacted.retainedExcerpt).toContain("Authorization: Bearer [REDACTED]");
    expect(redacted.retainedExcerpt).not.toContain("super-secret");
    expect(redacted.retainedExcerpt).not.toContain("abc123");
    expect(redacted.sensitiveFindingCount).toBe(2);
    expect(redacted.humanReviewRecommended).toBe(true);

    const metadataOnly = applyControlMirrorEvidenceRetentionPolicy({
      retentionMode: "metadata_only",
      content: "password=hunter2"
    });

    expect(metadataOnly.retainedExcerpt).toBeNull();
    expect(metadataOnly.humanReviewRecommended).toBe(true);
  });

  it("uses persisted Human Review state for report blockers and readiness", () => {
    const dashboard = buildControlMirrorDashboard(createBaseInput());
    const decidedItems = dashboard.humanReviewItems.map((item) => ({
      ...item,
      persistedReviewItemId: `queue-${item.id}`,
      reviewState: "decided" as const,
      latestHumanDecision: {
        id: `decision-${item.id}`,
        decisionType: "downgrade" as const,
        rationale: "Human decision recorded before release.",
        actorId: "user-1",
        createdAt: "2026-05-21T20:00:00.000Z"
      }
    }));

    const resolvedDashboard = applyControlMirrorHumanReviewStateToDashboard(dashboard, decidedItems);

    expect(resolvedDashboard.reviewStateSummary.decided).toBe(decidedItems.length);
    expect(resolvedDashboard.report.openHumanReviewItems).toBe(0);
    expect(resolvedDashboard.report.blockingHumanReviewItems).toBe(0);
    expect(resolvedDashboard.report.requiredApprovals).toEqual([]);
    expect(resolvedDashboard.report.decisionLogSummary).toContain("Human decision recorded before release.");
    expect(resolvedDashboard.releaseReadiness).toBe("downgrade_required");
  });

  it("flags missing commercial guardrails and links them to Human Review decisions", () => {
    const input = createBaseInput();
    input.outcomes[0]!.baselineDefinition = "";
    input.outcomes[0]!.valueOwnerId = "";
    input.outcomes[0]!.riskProfile = "";
    input.outcomes[0]!.epics[0]!.stories[0]!.testDefinition = "";

    const dashboard = buildControlMirrorDashboard(input);

    expect(dashboard.guardrails.flagged).toBeGreaterThanOrEqual(4);
    expect(dashboard.guardrails.findings.map((item) => item.category)).toContain("baseline");
    expect(dashboard.guardrails.findings.map((item) => item.category)).toContain("risk_ledger");
    expect(dashboard.guardrails.findings.map((item) => item.category)).toContain("mandate");
    expect(dashboard.guardrails.findings.map((item) => item.category)).toContain("test_evidence");
    expect(dashboard.humanReviewItems.some((item) => item.sourceFindingId === "guardrail-baseline" && item.reviewHref.includes("/review"))).toBe(true);
    expect(dashboard.report.activeProject).toBe("AAS Demo Organization");
    expect(dashboard.report.approvedFramingVersion).toBe("1");
    expect(dashboard.report.blockingGaps.length).toBeGreaterThan(0);
  });

  it("does not treat an Outcome risk profile as AI Risk Ledger guardrail evidence", () => {
    const dashboard = buildControlMirrorDashboard(createBaseInput());

    expect(dashboard.aiEvidence.find((item) => item.id === "risk-ledger")?.present).toBe(true);
    expect(dashboard.guardrails.findings.map((item) => item.category)).toContain("risk_ledger");
  });

  it("flags implementation artifacts without Story-ID lineage as release risk", () => {
    const input = createBaseInput();
    input.artifactSessions = [
      {
        id: "session-1",
        label: "Build notes",
        importIntent: "design",
        status: "human_review_required",
        createdAt: "2026-05-21T10:00:00.000Z",
        updatedAt: "2026-05-21T10:00:00.000Z",
        files: [
          {
            id: "file-1",
            fileName: "apps/web/src/app/new-runtime/page.tsx",
            sourceType: "unknown_artifact",
            sourceConfidence: "medium",
            sizeBytes: 1200,
            content: "Implementation note without a story link."
          }
        ],
        candidates: []
      }
    ];

    const dashboard = buildControlMirrorDashboard(input);

    expect(dashboard.buildConformance.untracedArtifacts).toBe(1);
    expect(dashboard.conformance.untracedBuildArtifacts).toBe(1);
    expect(dashboard.conformance.releaseRisk).toBeGreaterThan(0);
    expect(dashboard.conformance.findings.some((item) => item.status === "untraced_artifact")).toBe(true);
    expect(dashboard.conformance.aiLevelRecommendation).toBe("pause");
    expect(dashboard.humanReviewItems.some((item) => item.id === "untraced-artifacts")).toBe(true);
  });

  it("does not report an achieved level above the requested level", () => {
    const input = createBaseInput();
    input.outcomes[0]!.aiAccelerationLevel = "level_1";
    input.outcomes[0]!.epics[0]!.stories[0]!.aiAccelerationLevel = "level_1";
    input.artifactSessions = [
      {
        id: "session-1",
        label: "Complete evidence pack",
        importIntent: "design",
        status: "human_review_required",
        createdAt: "2026-05-21T10:00:00.000Z",
        updatedAt: "2026-05-21T10:00:00.000Z",
        files: [
          { id: "file-1", fileName: "decision-log.md", sourceType: "mixed_markdown_bundle", sourceConfidence: "high", sizeBytes: 1, content: "Decision log" },
          { id: "file-2", fileName: "risk-ledger.md", sourceType: "mixed_markdown_bundle", sourceConfidence: "high", sizeBytes: 1, content: "AI Risk Ledger" },
          { id: "file-3", fileName: "qa-review.md", sourceType: "mixed_markdown_bundle", sourceConfidence: "high", sizeBytes: 1, content: "AQA review evidence" },
          { id: "file-4", fileName: "final-report.md", sourceType: "mixed_markdown_bundle", sourceConfidence: "high", sizeBytes: 1, content: "Final delivery report" },
          { id: "file-5", fileName: "workflow-log-simulated.md", sourceType: "mixed_markdown_bundle", sourceConfidence: "high", sizeBytes: 1, content: "Workflow log with simulated execution statement and downgrade rule." },
          { id: "file-6", fileName: "architecture-blueprint.md", sourceType: "mixed_markdown_bundle", sourceConfidence: "high", sizeBytes: 1, content: "AI Delivery Blueprint" },
          { id: "file-7", fileName: "downgrade-rule.md", sourceType: "mixed_markdown_bundle", sourceConfidence: "high", sizeBytes: 1, content: "Downgrade rule evaluation" }
        ],
        candidates: []
      }
    ];
    input.signoffRecords = [
      {
        id: "signoff-1",
        entityType: "story",
        entityId: "story-1",
        decisionKind: "qa",
        decisionStatus: "approved",
        evidenceReference: "AQA independence statement"
      },
      {
        id: "signoff-2",
        entityType: "story",
        entityId: "story-1",
        decisionKind: "review",
        decisionStatus: "approved",
        evidenceReference: "role handoff"
      }
    ];

    const dashboard = buildControlMirrorDashboard(input);

    expect(dashboard.requestedAiLevel).toBe("level_1");
    expect(dashboard.achievedAiLevel).toBe("level_1");
  });

  it("uses persistent snapshot artifacts and change counts when available", () => {
    const input = createBaseInput();

    const dashboard = buildControlMirrorDashboard({
      ...input,
      artifactSessions: [],
      persistentSnapshot: {
        id: "snapshot-1",
        label: "Current imports 2026-05-21 10:00",
        sourceType: "current imports",
        scanTime: "2026-05-21T10:00:00.000Z",
        sessionCount: 1,
        fileCount: 2,
        candidateCount: 0,
        unchangedCount: 1,
        newCount: 1,
        modifiedCount: 0,
        deletedCount: 0,
        unreadableCount: 0,
        acceptedCount: 1,
        rejectedCount: 1,
        rejectedFiles: [
          {
            originalPath: "scripts/run.exe",
            normalizedPath: "scripts/run.exe",
            reason: "unsupported_extension"
          }
        ],
        artifacts: [
          {
            id: "artifact-1",
            fileName: "artifact-intake/session-1/CM-01.1-report.md",
            artifactType: "final_report",
            lineageStatus: "traced",
            parsingConfidence: "high",
            changeStatus: "new",
            storyId: "CM-01.1"
          }
        ],
        normalizedEvidence: [
          {
            id: "normalized-1",
            artifactId: "artifact-1",
            fileName: "artifact-intake/session-1/CM-01.1-report.md",
            evidenceType: "final_report",
            label: "CM-01.1 report",
            sourceSection: "full-file",
            storyClassification: "candidate_delivery_story",
            readinessState: "ready_for_build",
            missingReadinessFields: [],
            storyId: "CM-01.1"
          }
        ]
      }
    });

    expect(dashboard.snapshot.id).toBe("snapshot-1");
    expect(dashboard.snapshot.newCount).toBe(1);
    expect(dashboard.artifacts).toHaveLength(1);
    expect(dashboard.artifacts[0]!.changeStatus).toBe("new");
    expect(dashboard.normalization.evidenceCount).toBe(1);
    expect(dashboard.normalization.readyForBuild).toBe(1);
    expect(dashboard.uploadSummary).toMatchObject({
      acceptedCount: 1,
      rejectedCount: 1,
      rejectedFiles: [
        {
          normalizedPath: "scripts/run.exe",
          reason: "unsupported_extension"
        }
      ]
    });
  });

  it("discloses redacted source evidence and marks sensitive findings for Human Review", () => {
    const input = createBaseInput();

    const dashboard = buildControlMirrorDashboard({
      ...input,
      artifactSessions: [],
      persistentSnapshot: {
        id: "snapshot-1",
        label: "Uploaded snapshot",
        sourceType: "uploaded zip",
        scanTime: "2026-05-21T10:00:00.000Z",
        fileCount: 1,
        artifacts: [
          {
            id: "artifact-1",
            fileName: "logs/build.log",
            artifactType: "workflow_log",
            lineageStatus: "weak",
            parsingConfidence: "medium",
            changeStatus: "new",
            storyId: null
          }
        ],
        normalizedEvidence: [
          {
            id: "normalized-1",
            artifactId: "artifact-1",
            fileName: "logs/build.log",
            evidenceType: "workflow_log",
            label: "Build log",
            sourceSection: "full-file",
            storyClassification: "not_story_like",
            readinessState: "not_story_like",
            missingReadinessFields: [],
            storyId: null,
            retentionMode: "redacted_excerpts",
            retentionDisclosure: "A redacted source excerpt was retained.",
            redactionApplied: true,
            sensitiveFindingCount: 1
          }
        ]
      }
    });

    expect(dashboard.report.evidenceRetentionSummary).toContain("1 redacted");
    expect(dashboard.report.evidenceSummaries.some((item) => item.id === "evidence-retention" && item.status === "human_approval_required")).toBe(true);
    expect(dashboard.humanReviewItems.some((item) => item.id === "evidence-retention-sensitive-content")).toBe(true);
  });

  it("flags unlinked delivery candidates as potential scope drift", () => {
    const input = createBaseInput();
    const dashboard = buildControlMirrorDashboard({
      ...input,
      persistentSnapshot: {
        id: "snapshot-1",
        label: "Current imports",
        sourceType: "current imports",
        scanTime: "2026-05-21T10:00:00.000Z",
        fileCount: 1,
        artifacts: [
          {
            id: "artifact-1",
            fileName: "new-payment-flow-story.md",
            artifactType: "delivery_story",
            lineageStatus: "weak",
            parsingConfidence: "medium",
            changeStatus: "new",
            storyId: null
          }
        ],
        normalizedEvidence: [
          {
            id: "normalized-1",
            artifactId: "artifact-1",
            fileName: "new-payment-flow-story.md",
            evidenceType: "delivery_story_candidate",
            label: "New payment flow story",
            sourceSection: "full-file",
            storyClassification: "framing_story_idea",
            readinessState: "needs_refinement",
            missingReadinessFields: ["linked outcome", "linked epic", "story id", "test definition"],
            storyId: null
          }
        ]
      }
    });

    expect(dashboard.conformance.scopeDrift).toBe(1);
    expect(dashboard.conformance.findings.some((item) => item.status === "potential_scope_drift")).toBe(true);
    expect(dashboard.humanReviewItems.some((item) => item.id === "scope-drift-control")).toBe(true);
  });

  it("maps test evidence to Value Spine coverage", () => {
    const input = createBaseInput();
    input.outcomes[0]!.epics[0]!.stories[0]!.testDefinition = "";
    const dashboard = buildControlMirrorDashboard({
      ...input,
      persistentSnapshot: {
        id: "snapshot-1",
        label: "Current imports",
        sourceType: "current imports",
        scanTime: "2026-05-21T10:00:00.000Z",
        fileCount: 1,
        artifacts: [
          {
            id: "artifact-test-1",
            fileName: "CM-01.1-control-mirror.spec.ts",
            artifactType: "test_evidence",
            lineageStatus: "traced",
            parsingConfidence: "high",
            changeStatus: "new",
            storyId: "CM-01.1"
          }
        ],
        normalizedEvidence: [
          {
            id: "normalized-test-1",
            artifactId: "artifact-test-1",
            fileName: "CM-01.1-control-mirror.spec.ts passed unit test",
            evidenceType: "test_evidence",
            label: "CM-01.1 control mirror passed unit test",
            sourceSection: "full-file",
            storyClassification: "candidate_delivery_story",
            readinessState: "ready_for_build",
            missingReadinessFields: [],
            storyId: "CM-01.1"
          }
        ]
      }
    });

    expect(dashboard.testEvidence.mappedEvidence).toHaveLength(1);
    expect(dashboard.testEvidence.mappedEvidence[0]!.storyId).toBe("CM-01.1");
    expect(dashboard.testEvidence.mappedEvidence[0]!.epicId).toBe("epic-1");
    expect(dashboard.testEvidence.mappedEvidence[0]!.outcomeId).toBe("outcome-1");
    expect(dashboard.testEvidence.storiesWithPassingTests).toBe(1);
    expect(dashboard.testEvidence.valueSpineCoverage[0]!.coverageState).toBe("passing_tests");
    expect(dashboard.metrics.find((metric) => metric.id === "test-evidence")).toMatchObject({
      value: 1,
      percentage: 100
    });
    expect(dashboard.metrics.find((metric) => metric.id === "build-conformance")).toMatchObject({
      value: 1,
      percentage: 100
    });
    expect(dashboard.buildConformance.builtButUnverified).toBe(0);
    expect(dashboard.humanReviewItems.some((item) => item.id === "missing-test-evidence")).toBe(false);
  });

  it("classifies known evidence artifact types from file names and content", () => {
    expect(classifyControlMirrorArtifact({ fileName: "qa-review.md", content: "AQA review evidence" })).toBe("qa_review");
    expect(classifyControlMirrorArtifact({ fileName: "decision-log.md", content: "Decision log" })).toBe("decision_log");
    expect(classifyControlMirrorArtifact({ fileName: "risk-ledger.md", content: "AI Risk Ledger" })).toBe("ai_risk_ledger");
  });

  it("normalizes story-like artifacts and reports missing build-readiness fields", () => {
    const evidence = normalizeControlMirrorArtifact({
      artifactId: "artifact-1",
      fileName: "story-idea.md",
      artifactType: "delivery_story",
      content: "As a Delivery Lead I want Control Mirror insight so that I can govern delivery."
    });

    expect(evidence.evidenceType).toBe("delivery_story_candidate");
    expect(evidence.storyClassification).toBe("framing_story_idea");
    expect(evidence.readinessState).toBe("needs_refinement");
    expect(evidence.missingReadinessFields).toContain("test definition");
    expect(evidence.missingReadinessFields).toContain("ai usage scope");
  });
});
