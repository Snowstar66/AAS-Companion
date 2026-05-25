import { describe, expect, it, vi } from "vitest";

const {
  getControlMirrorDashboardSnapshotMock,
  syncControlMirrorHumanReviewQueueItemsMock
} = vi.hoisted(() => ({
  getControlMirrorDashboardSnapshotMock: vi.fn(),
  syncControlMirrorHumanReviewQueueItemsMock: vi.fn()
}));

vi.mock("@aas-companion/db", () => ({
  archiveControlMirrorEvidencePackExportRecord: vi.fn(),
  createControlMirrorEvidencePackExportRecord: vi.fn(),
  createControlMirrorUploadedSnapshot: vi.fn(),
  getControlMirrorDashboardSnapshot: getControlMirrorDashboardSnapshotMock,
  getControlMirrorEvidencePackExportRecordById: vi.fn(),
  listControlMirrorEvidencePackExportRecords: vi.fn(),
  mergeControlMirrorHumanReviewItemsWithQueueState: vi.fn(),
  recordControlMirrorEvidencePackExportAcceptanceDecision: vi.fn(),
  recordControlMirrorEvidencePackExportDownloadEvent: vi.fn(),
  recordControlMirrorHumanReviewDecision: vi.fn(),
  resetControlMirrorWorkspace: vi.fn(),
  refreshControlMirrorCurrentImportsSnapshot: vi.fn(),
  syncControlMirrorHumanReviewQueueItems: syncControlMirrorHumanReviewQueueItemsMock
}));

import { getControlMirrorDashboardService } from "../../../../packages/api/src/control-mirror";

function createResetBaselineDashboard() {
  return {
    snapshot: {
      id: "reset-snapshot-1",
      isPersistent: true,
      label: "Reset baseline 2026-05-25 18:22",
      fileCount: 0
    },
    artifacts: [],
    normalizedEvidence: [],
    metrics: [{ id: "test-evidence", label: "Test Evidence", value: 0, total: 4, percentage: 0, status: "blocked", description: "Old generated metric." }],
    normalization: {
      evidenceCount: 3,
      storyLikeItems: 3,
      candidateDeliveryStories: 0,
      storyIdeas: 9,
      explorationStories: 0,
      outOfScopeItems: 0,
      readyForBuild: 0,
      needsRefinement: 0
    },
    conformance: {
      framingAligned: 0,
      framingPartial: 0,
      weakValueAlignment: 0,
      scopeDrift: 0,
      outOfScope: 0,
      rightBuilt: 0,
      weaklyTracedBuild: 0,
      untracedBuildArtifacts: 0,
      releaseRisk: 3,
      aiLevelRecommendation: "pause",
      findings: [{ id: "ai-level-recommendation", severity: "high" }]
    },
    guardrails: {
      checked: 7,
      passed: 1,
      flagged: 6,
      findings: [{ id: "guardrail-risk-ledger", severity: "high" }]
    },
    designProgress: {
      storyIdeas: 9,
      classifiedItems: 28,
      refinedDeliveryStories: 0,
      storiesWithAcceptanceCriteria: 0,
      storiesWithTestDefinition: 0,
      readyForBuild: 0,
      blockedStories: 0
    },
    buildConformance: {
      rightBuilt: 0,
      partiallyBuilt: 0,
      builtButUnverified: 0,
      weaklyTraced: 0,
      untracedArtifacts: 0,
      releaseRisk: 3
    },
    testEvidence: {
      storiesWithNoTest: 3,
      storiesWithTestDefinitionOnly: 1,
      storiesWithImplementedTests: 0,
      storiesWithPassingTests: 0,
      storiesWithFailingTests: 0,
      manualVerificationOnly: 0,
      behaviouralContractTests: 0,
      brokenValueSpineLinks: 2,
      mappedEvidence: [{ id: "old-test" }],
      valueSpineCoverage: [{ id: "old-coverage" }],
      untracedImplementationArtifacts: []
    },
    aiEvidence: [{ id: "risk-ledger", present: false }],
    humanReviewItems: [{ id: "old-blocker", blocksRelease: true }],
    reviewStateSummary: {
      open: 6,
      decided: 0,
      deferred: 0,
      superseded: 0,
      openBlocking: 6,
      items: [{ id: "old-blocker" }]
    },
    releaseReadiness: "blocked",
    report: {
      releaseReadiness: "blocked",
      evidenceSummaries: [{ id: "old-summary" }],
      openHumanReviewItems: 6,
      blockingHumanReviewItems: 6,
      scopeDriftItems: 0,
      untracedArtifacts: 0,
      requiredApprovals: ["Old approval"],
      blockingGaps: ["Old blocker"],
      residualRisks: ["Old risk"],
      decisionLogSummary: "Old generated decision log.",
      recommendedNextStep: "Resolve old blockers."
    }
  };
}

describe("Control Mirror dashboard service", () => {
  it("keeps a reset baseline clear until new evidence is imported or refreshed", async () => {
    getControlMirrorDashboardSnapshotMock.mockResolvedValueOnce(createResetBaselineDashboard());
    syncControlMirrorHumanReviewQueueItemsMock.mockResolvedValueOnce([]);

    const result = await getControlMirrorDashboardService("org-demo");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(syncControlMirrorHumanReviewQueueItemsMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      snapshotId: "reset-snapshot-1",
      items: []
    });
    expect(result.data.releaseReadiness).toBe("conditional");
    expect(result.data.humanReviewItems).toEqual([]);
    expect(result.data.guardrails.findings).toEqual([]);
    expect(result.data.aiEvidence).toEqual([]);
    expect(result.data.designProgress.storyIdeas).toBe(0);
    expect(result.data.report.blockingHumanReviewItems).toBe(0);
    expect(result.data.report.recommendedNextStep).toBe("Import or refresh Control Mirror evidence to evaluate the current Framing baseline.");
  });
});
