import { describe, expect, it } from "vitest";
import {
  buildControlMirrorReportSummaryItems,
  createControlMirrorHumanReviewStableKey,
  enrichControlMirrorHumanReviewItem,
  getControlMirrorSourcePolicy,
  normalizeControlMirrorUploadedSnapshotPath,
  summarizeControlMirrorEvidenceRetention,
  summarizeControlMirrorHumanReviewState,
  validateControlMirrorUploadedSnapshotFiles
} from "@aas-companion/domain";

describe("Control Mirror module boundaries", () => {
  it("exposes source policy and uploaded snapshot validation helpers directly", () => {
    const policy = getControlMirrorSourcePolicy();
    const uploadedSnapshot = policy.modes.find((mode) => mode.id === "uploaded_zip");

    expect(uploadedSnapshot).toMatchObject({
      supportStatus: "active",
      refreshSupported: true,
      retentionMode: "redacted_excerpts",
      actionHref: "/control-mirror?source=uploaded-snapshot"
    });

    expect(normalizeControlMirrorUploadedSnapshotPath(".\\docs\\runtime.ts")).toMatchObject({
      ok: true,
      normalizedPath: "docs/runtime.ts",
      fileName: "runtime.ts",
      extension: ".ts"
    });

    const validation = validateControlMirrorUploadedSnapshotFiles([
      {
        path: "docs/runtime.ts",
        content: "Story-ID: STORY-1",
        sizeBytes: 17
      },
      {
        path: "bin/tool.exe",
        content: "binary"
      },
      {
        path: "docs/unreadable.md",
        content: null
      }
    ]);

    expect(validation).toMatchObject({
      acceptedCount: 1,
      rejectedCount: 1,
      unreadableCount: 1
    });
    expect(validation.accepted[0]).toMatchObject({
      normalizedPath: "docs/runtime.ts",
      extension: "ts"
    });
    expect(validation.rejected[0]?.reason).toBe("unsupported_extension");
    expect(validation.unreadable[0]?.reason).toBe("unreadable");
  });

  it("exposes Human Review stable identity and state helpers directly", () => {
    const generated = enrichControlMirrorHumanReviewItem({
      id: "untraced-uploaded-docs-runtime-ts",
      sourceFindingId: "uploaded:docs/runtime.ts",
      severity: "high",
      category: "Untraced artifact",
      decisionNeeded: "Classify implementation artifacts that lack Story-ID evidence.",
      recommendedOption: "REQUEST CHANGE",
      affectedObject: "docs/runtime.ts in snapshot-2",
      affectedOutcomeId: null,
      affectedEpicId: null,
      affectedStoryId: null,
      blocksRelease: true,
      rationale: "Runtime evidence without traceability is a release risk."
    });
    const decided = {
      ...generated,
      id: "untraced-uploaded-docs-runtime-ts-decided",
      reviewState: "decided" as const,
      latestHumanDecision: {
        id: "decision-1",
        decisionType: "request_rework" as const,
        rationale: "Attach the missing Story-ID.",
        actorId: "user-1",
        createdAt: "2026-05-22T00:00:00.000Z"
      }
    };

    expect(createControlMirrorHumanReviewStableKey(generated)).toBe("uploaded-docs-runtime-ts|untraced-artifact|||");
    expect(generated.reviewHref).toBe("/review?source=control-mirror&reviewItem=untraced-uploaded-docs-runtime-ts#operational-review");
    expect(generated.suggestedResponse).toBe("REQUEST CHANGE");

    const summary = summarizeControlMirrorHumanReviewState([generated, decided]);

    expect(summary).toMatchObject({
      open: 1,
      decided: 1,
      deferred: 0,
      superseded: 0,
      openBlocking: 1
    });
    expect(summary.items[1]).toMatchObject({
      latestDecisionType: "request_rework",
      latestDecisionRationale: "Attach the missing Story-ID."
    });
  });

  it("exposes report and retention summary helpers directly", () => {
    const retention = summarizeControlMirrorEvidenceRetention([
      {
        id: "evidence-1",
        artifactId: "artifact-1",
        fileName: "docs/runtime.ts",
        evidenceType: "implementation_evidence",
        label: "Runtime",
        sourceSection: "excerpt",
        storyClassification: "not_story_like",
        readinessState: "not_story_like",
        missingReadinessFields: [],
        storyId: null,
        retentionMode: "redacted_excerpts",
        redactionApplied: true,
        sensitiveFindingCount: 1
      },
      {
        id: "evidence-2",
        artifactId: "artifact-2",
        fileName: "logs/runtime.log",
        evidenceType: "workflow_log",
        label: "Runtime log",
        sourceSection: "metadata",
        storyClassification: "not_story_like",
        readinessState: "not_story_like",
        missingReadinessFields: [],
        storyId: null,
        retentionMode: "metadata_only",
        redactionApplied: false,
        sensitiveFindingCount: 0
      }
    ]);

    expect(retention).toMatchObject({
      redactedCount: 1,
      omittedCount: 1,
      sensitiveFindingCount: 1,
      status: "human_approval_required"
    });
    expect(retention.summary).toBe("1 excerpt retained, 1 redacted, 1 metadata-only or omitted. Source text policy is disclosed per normalized evidence item.");

    const reportItems = buildControlMirrorReportSummaryItems({
      metrics: [
        {
          id: "build-conformance",
          label: "Build Conformance",
          value: 2,
          total: 4,
          percentage: 50,
          status: "gap",
          description: "Stories with traceability, acceptance criteria and test definition."
        }
      ],
      releaseReadiness: "blocked",
      requestedAiLevel: "level_3",
      achievedAiLevel: "level_2",
      openHumanReviewItems: 2,
      blockingHumanReviewItems: 1,
      evidenceRetentionSummary: retention.summary,
      evidenceRetentionStatus: retention.status
    });

    expect(reportItems.map((item) => item.id)).toEqual([
      "build-conformance",
      "requested-ai-level",
      "achieved-ai-level",
      "open-human-review-items",
      "evidence-retention",
      "release-readiness"
    ]);
    expect(reportItems.find((item) => item.id === "achieved-ai-level")).toMatchObject({
      value: "level_2",
      status: "downgrade_required"
    });
    expect(reportItems.find((item) => item.id === "open-human-review-items")).toMatchObject({
      value: 2,
      status: "blocked"
    });
  });
});
