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
});
