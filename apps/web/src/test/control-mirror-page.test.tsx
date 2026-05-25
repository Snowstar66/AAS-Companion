import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getControlMirrorSourcePolicy } from "@aas-companion/domain";
import ControlMirrorPage from "@/app/(protected)/control-mirror/page";

const { cookiesMock, getControlMirrorDashboardServiceMock, listControlMirrorEvidencePackExportsServiceMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(async () => ({
    get: vi.fn(() => undefined)
  })),
  getControlMirrorDashboardServiceMock: vi.fn(),
  listControlMirrorEvidencePackExportsServiceMock: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock
}));

vi.mock("@/lib/auth/guards", () => ({
  requireOrganizationContext: vi.fn(async () => ({
    organizationId: "org-demo",
    organizationName: "AAS Demo Organization"
  }))
}));

vi.mock("@/app/(protected)/control-mirror/actions", () => ({
  archiveControlMirrorEvidencePackExportAction: vi.fn(),
  recordControlMirrorEvidencePackExportAcceptanceAction: vi.fn(),
  recordControlMirrorHumanReviewDecisionAction: vi.fn(),
  refreshControlMirrorSnapshotAction: vi.fn(),
  submitControlMirrorUploadedSnapshotAction: vi.fn()
}));

vi.mock("@aas-companion/api", async () => {
  const actual = await vi.importActual<object>("@aas-companion/api");

  return {
    ...actual,
    getControlMirrorDashboardService: getControlMirrorDashboardServiceMock,
    listControlMirrorEvidencePackExportsService: listControlMirrorEvidencePackExportsServiceMock
  };
});

function createDashboard() {
  return {
    organizationName: "AAS Demo Organization",
    snapshot: {
      id: "session-1",
      isPersistent: true,
      label: "Control Mirror test import",
      sourceType: "Manual artifact upload",
      scanTime: "2026-05-21T10:00:00.000Z",
      sessionCount: 1,
      fileCount: 2,
      candidateCount: 3,
      unchangedCount: 0,
      newCount: 1,
      modifiedCount: 1,
      deletedCount: 0,
      unreadableCount: 0,
      rejectedCount: 1,
      acceptedCount: 2
    },
    uploadSummary: {
      isUploadedSnapshot: true,
      acceptedCount: 2,
      rejectedCount: 1,
      unreadableCount: 1,
      unchangedCount: 0,
      newCount: 1,
      modifiedCount: 1,
      deletedCount: 0,
      rejectedFiles: [
        {
          originalPath: "scripts/run.exe",
          normalizedPath: "scripts/run.exe",
          reason: "unsupported_extension"
        }
      ],
      unreadableFiles: [
        {
          fileName: "build.log",
          filePath: "logs/build.log"
        }
      ]
    },
    sourcePolicy: getControlMirrorSourcePolicy(),
    requestedAiLevel: "level_3",
    achievedAiLevel: "level_2",
    releaseReadiness: "downgrade_required",
    metrics: [
      {
        id: "framing-alignment",
        label: "Framing Alignment",
        value: 1,
        total: 1,
        percentage: 100,
        status: "aligned",
        description: "Outcomes with baseline and outcome statement evidence."
      },
      {
        id: "build-conformance",
        label: "Build Conformance",
        value: 1,
        total: 2,
        percentage: 50,
        status: "gap",
        description: "Stories with traceability, acceptance criteria and test definition."
      }
    ],
    artifacts: [
      {
        id: "file-1",
        fileName: "control-mirror-report.md",
        artifactType: "final_report",
        lineageStatus: "traced",
        parsingConfidence: "high",
        changeStatus: "new",
        storyId: "CM-01.1"
      },
      {
        id: "file-2",
        fileName: "apps/web/src/app/new-runtime/page.tsx",
        artifactType: "implementation_note",
        lineageStatus: "missing",
        parsingConfidence: "medium",
        changeStatus: "modified",
        storyId: null
      }
    ],
    normalizedEvidence: [
      {
        id: "normalized-1",
        artifactId: "file-1",
        fileName: "control-mirror-report.md",
        evidenceType: "final_report",
        label: "Control mirror report",
        sourceSection: "full-file",
        storyClassification: "candidate_delivery_story",
        readinessState: "ready_for_build",
        missingReadinessFields: [],
        storyId: "CM-01.1",
        retentionMode: "metadata_and_excerpts",
        retentionDisclosure: "A source excerpt was retained.",
        redactionApplied: false,
        sensitiveFindingCount: 0
      },
      {
        id: "normalized-2",
        artifactId: "file-2",
        fileName: "apps/web/src/app/new-runtime/page.tsx",
        evidenceType: "implementation_evidence",
        label: "New runtime page",
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
    ],
    normalization: {
      evidenceCount: 2,
      storyLikeItems: 1,
      candidateDeliveryStories: 1,
      storyIdeas: 0,
      explorationStories: 0,
      outOfScopeItems: 0,
      readyForBuild: 1,
      needsRefinement: 0
    },
    conformance: {
      framingAligned: 1,
      framingPartial: 0,
      weakValueAlignment: 0,
      scopeDrift: 0,
      outOfScope: 0,
      rightBuilt: 1,
      weaklyTracedBuild: 0,
      untracedBuildArtifacts: 1,
      releaseRisk: 1,
      aiLevelRecommendation: "downgrade",
      findings: [
        {
          id: "build-normalized-2",
          category: "build_conformance",
          severity: "high",
          status: "untraced_artifact",
          artifactId: "file-2",
          evidenceId: "normalized-2",
          label: "New runtime page",
          affectedObject: "apps/web/src/app/new-runtime/page.tsx",
          recommendedAction: "Map this artifact to an approved Story or classify it as scope drift before release.",
          rationale: "Build artifacts are acceptable only when they trace to Story, Epic, Outcome, acceptance criteria and verification evidence."
        },
        {
          id: "ai-level-recommendation",
          category: "ai_level_evidence",
          severity: "high",
          status: "downgrade",
          label: "Requested vs achieved AI level",
          affectedObject: "Requested level_3, achieved level_2",
          recommendedAction: "Downgrade the achieved AI level or add missing evidence.",
          rationale: "AAS Companion must not overstate Level 2 or Level 3 readiness without required evidence."
        }
      ]
    },
    guardrails: {
      checked: 7,
      passed: 5,
      flagged: 2,
      findings: [
        {
          id: "guardrail-aida-aqa-capacity",
          category: "aida_aqa_capacity",
          label: "AIDA/AQA capacity",
          requiredFor: "level_3",
          present: false,
          severity: "high",
          affectedObject: "Independent AI delivery and quality capacity",
          recommendedAction: "Add AIDA/AQA review evidence or downgrade the requested AI level.",
          rationale: "Level 3 claims require visible role separation, execution capacity and quality review."
        },
        {
          id: "guardrail-governance-funding",
          category: "governance_funding",
          label: "Governance funding evidence",
          requiredFor: "level_2",
          present: false,
          severity: "medium",
          affectedObject: "Commercial governance",
          recommendedAction: "Attach funding or commercial governance evidence before making a commercial Level 2/3 claim.",
          rationale: "Commercial guardrails prevent unsupported AI-level commitments."
        }
      ]
    },
    designProgress: {
      storyIdeas: 2,
      classifiedItems: 3,
      refinedDeliveryStories: 2,
      storiesWithAcceptanceCriteria: 1,
      storiesWithTestDefinition: 1,
      readyForBuild: 1,
      blockedStories: 0
    },
    buildConformance: {
      rightBuilt: 1,
      partiallyBuilt: 1,
      builtButUnverified: 1,
      weaklyTraced: 0,
      untracedArtifacts: 1,
      releaseRisk: 1
    },
    testEvidence: {
      storiesWithNoTest: 1,
      storiesWithTestDefinitionOnly: 1,
      storiesWithImplementedTests: 0,
      storiesWithPassingTests: 1,
      storiesWithFailingTests: 0,
      manualVerificationOnly: 0,
      behaviouralContractTests: 0,
      brokenValueSpineLinks: 0,
      mappedEvidence: [
        {
          id: "normalized-test-1",
          testId: "CM-01.1",
          fileName: "control-mirror-report.spec.ts",
          storyId: "CM-01.1",
          epicId: "epic-1",
          outcomeId: "outcome-1",
          testLevel: "unit",
          result: "passing",
          automationStatus: "automated",
          evidenceSource: "full-file"
        }
      ],
      valueSpineCoverage: [
        {
          id: "coverage-story-1",
          storyId: "story-1",
          storyKey: "CM-01.1",
          storyTitle: "Open Control Mirror",
          epicId: "epic-1",
          outcomeId: "outcome-1",
          coverageState: "passing_tests",
          testEvidenceCount: 1,
          passingEvidenceCount: 1,
          failingEvidenceCount: 0,
          missingLinks: []
        }
      ],
      untracedImplementationArtifacts: [
        {
          id: "file-2",
          fileName: "apps/web/src/app/new-runtime/page.tsx",
          artifactType: "implementation_note",
          lineageStatus: "missing",
          parsingConfidence: "medium",
          changeStatus: "modified",
          storyId: null
        }
      ]
    },
    aiEvidence: [
      {
        id: "requirements-baseline",
        label: "Requirements baseline",
        requiredFor: "level_2",
        present: true,
        detail: "Approved framing needs outcome statement and baseline evidence."
      },
      {
        id: "qa-independence",
        label: "QA/AQA independence statement",
        requiredFor: "level_3",
        present: false,
        detail: "Level 3 should not imply independent QA without evidence."
      }
    ],
    humanReviewItems: [
      {
        id: "ai-level-mismatch",
        persistedReviewItemId: "queue-1",
        stableFindingKey: "ai-level-recommendation|ai-level-evidence-mismatch|outcome-1||",
        reviewState: "open",
        persistedUpdatedAt: "2026-05-21T18:05:00.000Z",
        sourceFindingId: "ai-level-recommendation",
        severity: "high",
        category: "AI level evidence mismatch",
        decisionNeeded: "Downgrade the achieved AI level or add the missing evidence.",
        recommendedOption: "DEFER",
        affectedObject: "Requested level_3, achieved level_2",
        blocksRelease: true,
        reviewHref: "/review?source=control-mirror&reviewItem=ai-level-mismatch#operational-review",
        valueRationale: "Keeps decisions traceable to approved Framing and evidence.",
        alternatives: ["Resolve the evidence gap", "Downgrade the AI-level claim"],
        riskIfApproved: "The team may proceed with an unsupported control claim.",
        riskIfNotApproved: "Delivery may pause while evidence is restored.",
        suggestedResponse: "DEFER",
        rationale: "AAS Companion must not overstate Level 2 or Level 3 readiness."
      }
    ],
    reviewStateSummary: {
      open: 1,
      decided: 0,
      deferred: 0,
      superseded: 0,
      openBlocking: 1,
      items: [
        {
          id: "ai-level-mismatch",
          persistedReviewItemId: "queue-1",
          state: "open",
          category: "AI level evidence mismatch",
          affectedObject: "Requested level_3, achieved level_2",
          affectedOutcomeId: "outcome-1",
          affectedEpicId: null,
          affectedStoryId: null,
          blocksRelease: true,
          latestDecisionRationale: null
        }
      ]
    },
    report: {
      activeProject: "AAS Demo Organization",
      approvedFramingVersion: "1",
      snapshotId: "session-1",
      requestedAiLevel: "level_3",
      achievedAiLevel: "level_2",
      releaseReadiness: "downgrade_required",
      evidenceSummaries: [
        {
          id: "framing-alignment",
          label: "Framing Alignment",
          value: "100%",
          status: "aligned"
        }
      ],
      openHumanReviewItems: 1,
      blockingHumanReviewItems: 1,
      scopeDriftItems: 0,
      untracedArtifacts: 1,
      aiRiskLedgerSummary: "AI Risk Ledger evidence is present.",
      decisionLogSummary: "Decision evidence is missing or only implied.",
      requiredApprovals: ["AI level evidence mismatch"],
      blockingGaps: ["Downgrade the achieved AI level or add the missing evidence."],
      residualRisks: ["Level 3 claims require visible role separation, execution capacity and quality review."],
      recommendedNextStep: "Downgrade the achieved AI level or add missing evidence.",
      executionStatement: "Control Mirror is calculated from existing AAS Companion records.",
      evidenceRetentionSummary: "2 excerpts retained, 1 redacted, 0 metadata-only or omitted."
    }
  };
}

describe("Control Mirror page", () => {
  it("renders conformance summary, AI level mismatch, artifact manifest and Human Review items", async () => {
    getControlMirrorDashboardServiceMock.mockResolvedValueOnce({
      ok: true,
      data: createDashboard()
    });
    listControlMirrorEvidencePackExportsServiceMock.mockResolvedValueOnce({
      ok: true,
      data: [
        {
          id: "export-1",
          snapshotId: "session-1",
          format: "json",
          schemaVersion: "control-mirror-evidence-pack/v1",
          fileName: "aas-demo-session-1-evidence-pack.json",
          contentType: "application/json; charset=utf-8",
          generatedAt: "2026-05-22T10:00:00.000Z",
          createdBy: "user-1",
          createdAt: "2026-05-22T10:01:00.000Z",
          retention: {
            state: "archived",
            policyLabel: "governance_audit_artifact",
            reviewDueAt: "2026-01-01T09:00:00.000Z",
            reviewedAt: null,
            archivedAt: "2026-05-22T10:10:00.000Z",
            archivedBy: "delivery-lead-1",
            archivedByDisplayName: "Dee Lead",
            archiveReason: "Superseded by a newer evidence pack export."
          },
          acceptanceSummary: {
            shareReadiness: "acceptance_pending",
            requiredRoles: ["product_owner", "security_privacy", "aqa"],
            acceptedRoles: [],
            missingRoles: ["product_owner", "security_privacy", "aqa"],
            blockingRoles: [],
            latestDecisions: []
          },
          latestDownloadEvent: null,
          latestAcceptanceDecision: null
        },
        {
          id: "export-2",
          snapshotId: "session-1",
          format: "markdown",
          schemaVersion: "control-mirror-evidence-pack/v1",
          fileName: "aas-demo-session-1-evidence-pack.md",
          contentType: "text/markdown; charset=utf-8",
          generatedAt: "2026-05-22T10:05:00.000Z",
          createdBy: "user-1",
          createdAt: "2026-05-22T10:06:00.000Z",
          retention: {
            state: "active",
            policyLabel: "governance_audit_artifact",
            reviewDueAt: "2099-01-01T09:00:00.000Z",
            reviewedAt: "2026-05-22T10:20:00.000Z",
            archivedAt: null,
            archivedBy: null,
            archiveReason: null
          },
          acceptanceSummary: {
            shareReadiness: "share_ready",
            requiredRoles: ["product_owner", "security_privacy", "aqa"],
            acceptedRoles: ["product_owner", "security_privacy", "aqa"],
            missingRoles: [],
            blockingRoles: [],
            latestDecisions: [
              {
                id: "acceptance-product",
                exportId: "export-2",
                reviewerRole: "product_owner",
                decisionType: "accepted",
                rationale: "Product accepted.",
                actorId: "product-1",
                createdAt: "2026-05-22T10:07:00.000Z"
              },
              {
                id: "acceptance-1",
                exportId: "export-2",
                reviewerRole: "security_privacy",
                decisionType: "accepted_with_conditions",
                rationale: "Accepted for governance sharing after retention disclosure review.",
                actorId: "user-1",
                createdAt: "2026-05-22T10:08:00.000Z"
              },
              {
                id: "acceptance-aqa",
                exportId: "export-2",
                reviewerRole: "aqa",
                decisionType: "accepted",
                rationale: "AQA accepted.",
                actorId: "aqa-1",
                createdAt: "2026-05-22T10:09:00.000Z"
              }
            ]
          },
          latestDownloadEvent: {
            id: "download-1",
            exportId: "export-2",
            actorId: "user-2",
            actorDisplayName: "Dana Download",
            createdAt: "2026-05-22T10:12:00.000Z"
          },
          latestAcceptanceDecision: {
            id: "acceptance-1",
            exportId: "export-2",
            reviewerRole: "security_privacy",
            decisionType: "accepted_with_conditions",
            rationale: "Accepted for governance sharing after retention disclosure review.",
            actorId: "user-1",
            createdAt: "2026-05-22T10:07:00.000Z"
          }
        }
      ]
    });

    render(await ControlMirrorPage({
      searchParams: Promise.resolve({
        source: "uploaded-snapshot",
        status: "error",
        message: "Upload failed. No snapshot was created."
      })
    }));

    expect(screen.getByRole("heading", { name: "Control Mirror", level: 1 })).toBeDefined();
    expect(screen.getByRole("link", { name: /Connect project evidence/i }).getAttribute("href")).toBe("/intake?source=control-mirror");
    expect(screen.getByText("Source judged")).toBeDefined();
    expect(screen.getByText("Control posture")).toBeDefined();
    expect(screen.getByText("Human decisions")).toBeDefined();
    expect(screen.getByText("Evidence gaps")).toBeDefined();
    expect(screen.getByText("AI, lineage and Value Spine gaps treated as risk")).toBeDefined();
    expect(screen.getByText("Executive summary")).toBeDefined();
    expect(screen.getAllByText("Downgrade AI claim").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /review blockers/i }).getAttribute("href")).toBe("#human-review");
    expect(screen.getByRole("link", { name: /view evidence dashboard/i }).getAttribute("href")).toBe("#control-dashboard");
    expect(screen.getByText("Evidence dashboard")).toBeDefined();
    expect(screen.getByText("What changes the recommendation")).toBeDefined();
    expect(screen.getByText("Handshake coverage")).toBeDefined();
    expect(screen.getByLabelText("Handshake coverage stacked bar")).toBeDefined();
    expect(screen.getByText("Known delivery progress")).toBeDefined();
    expect(screen.getAllByText("50%").length).toBeGreaterThan(0);
    expect(screen.getByText("Actionable blockers")).toBeDefined();
    expect(screen.getByText("Show dashboard guidance")).toBeDefined();
    expect(document.getElementById("human-review")).not.toBeNull();
    expect(document.getElementById("control-report-preview")).not.toBeNull();
    expect(screen.getByText("Upload failed. No snapshot was created.")).toBeDefined();
    expect(screen.getByText("Requested AI level")).toBeDefined();
    expect(screen.getAllByText("level 3").length).toBeGreaterThan(0);
    expect(screen.getByText("Achieved AI level")).toBeDefined();
    expect(screen.getAllByText("level 2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Framing Alignment").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Build Conformance").length).toBeGreaterThan(0);
    expect(screen.getByText("Value Spine test coverage")).toBeDefined();
    expect(screen.getByText("passing tests")).toBeDefined();
    expect(screen.getByText("control-mirror-report.spec.ts")).toBeDefined();
    expect(screen.getAllByRole("button", { name: /Refresh snapshot/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("AAS normalization")).toBeDefined();
    expect(screen.getByText("Delivery story candidates")).toBeDefined();
    expect(screen.getAllByText("ready for build").length).toBeGreaterThan(0);
    expect(screen.getByText("Framing cross-reference")).toBeDefined();
    expect(screen.getByText("AI recommendation")).toBeDefined();
    expect(screen.getByText("Commercial guardrails")).toBeDefined();
    expect(screen.getByText("AIDA/AQA capacity")).toBeDefined();
    expect(screen.getAllByText("untraced artifact").length).toBeGreaterThan(0);
    expect(screen.getByText("Artifact manifest")).toBeDefined();
    expect(screen.getByText("Change")).toBeDefined();
    expect(screen.getByText("modified")).toBeDefined();
    expect(screen.getAllByText("apps/web/src/app/new-runtime/page.tsx").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AI level evidence mismatch").length).toBeGreaterThan(0);
    expect(screen.getByText("Recommendation: DEFER")).toBeDefined();
    expect(screen.getByText("Queue state: open")).toBeDefined();
    expect(screen.getByText("Control Mirror reads only user-authorized evidence. Local folders and repositories are never scanned silently.")).toBeDefined();
    expect(screen.getByText("Uploaded snapshot")).toBeDefined();
    expect(screen.getByText("Git/repository root")).toBeDefined();
    expect(screen.getAllByText("planned").length).toBeGreaterThan(0);
    expect(screen.getByText("unsupported")).toBeDefined();
    expect(screen.getByText("Uploaded snapshot preparation")).toBeDefined();
    expect(screen.getByText("Allowed files")).toBeDefined();
    expect(screen.getByText("Safety limits")).toBeDefined();
    expect(screen.getByText("Submission uses the Control Mirror uploaded snapshot adapter. Files are validated again on the server before any evidence is stored.")).toBeDefined();
    expect(screen.getByText("Snapshot files")).toBeDefined();
    expect(screen.getByRole("button", { name: /Submit uploaded snapshot/i })).toBeDefined();
    expect(screen.getAllByRole("link", { name: /Open source action/i }).some((link) => link.getAttribute("href") === "/control-mirror?source=uploaded-snapshot")).toBe(true);
    expect(screen.getByText("Uploaded snapshot result")).toBeDefined();
    expect(screen.getByText("Rejected files")).toBeDefined();
    expect(screen.getByText("scripts/run.exe: unsupported extension")).toBeDefined();
    expect(screen.getByText("Unreadable files")).toBeDefined();
    expect(screen.getByText("logs/build.log: unreadable")).toBeDefined();
    expect(screen.getAllByText("open").length).toBeGreaterThan(0);
    expect(screen.getByText("Outcome/Epic/Story")).toBeDefined();
    expect(screen.getAllByText("outcome-1").length).toBeGreaterThan(0);
    expect(screen.getByText("Record human decision")).toBeDefined();
    expect(screen.getByText("Open in Human Review")).toBeDefined();
    expect(screen.getByText("Control report preview")).toBeDefined();
    expect(screen.getByRole("link", { name: /download customer pdf/i }).getAttribute("href")).toBe("/control-mirror/customer-report");
    expect(screen.getAllByRole("link", { name: /download evidence pack/i }).some((link) => link.getAttribute("href") === "/control-mirror/export")).toBe(true);
    expect(screen.getByText("Active project")).toBeDefined();
    expect(screen.getByText("Evidence summary")).toBeDefined();
    expect(screen.getByText("Source evidence retention")).toBeDefined();
    expect(screen.getAllByText(/raw source text is not included/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Evidence pack includes")).toBeDefined();
    expect(screen.getByText("Product/Security acceptance")).toBeDefined();
    expect(screen.getByText(/Product\/Security acceptance is required before broad governance or external sharing/i)).toBeDefined();
    expect(screen.getByText("Product owner, Security/privacy reviewer, AQA reviewer")).toBeDefined();
    expect(screen.getByText(/Raw source text exclusion:/i)).toBeDefined();
    expect(screen.getByText(/Retention and redaction disclosure review:/i)).toBeDefined();
    expect(screen.getByText("Recent evidence pack exports")).toBeDefined();
    expect(screen.getByRole("link", { name: "aas-demo-session-1-evidence-pack.json" }).getAttribute("href")).toBe("/control-mirror/export/export-1");
    expect(screen.getByRole("link", { name: "aas-demo-session-1-evidence-pack.md" }).getAttribute("href")).toBe("/control-mirror/export/export-2");
    expect(screen.getAllByText("governance audit artifact").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Archive export" })).toBeDefined();
    expect(screen.getByText("archived")).toBeDefined();
    expect(screen.getByText("Archived by Dee Lead")).toBeDefined();
    expect(screen.getByText("Superseded by a newer evidence pack export.")).toBeDefined();
    expect(screen.getByText(/Review overdue:/)).toBeDefined();
    expect(screen.getByText(/Review due:/)).toBeDefined();
    expect(screen.getByText(/Reviewed:/)).toBeDefined();
    expect(screen.getByText("No re-downloads recorded.")).toBeDefined();
    expect(screen.getByText(/Last downloaded by Dana Download/)).toBeDefined();
    expect(screen.getByText("Acceptance pending")).toBeDefined();
    expect(screen.getByText("Product/Security review required before broad sharing.")).toBeDefined();
    expect(screen.getByText("Missing roles: product owner, security privacy, aqa")).toBeDefined();
    expect(screen.getByText("Share ready")).toBeDefined();
    expect(screen.getByText("All required acceptance roles recorded for governance sharing.")).toBeDefined();
    expect(screen.getByText("Accepted roles: product owner, security privacy, aqa")).toBeDefined();
    expect(screen.getByText("Latest decision: accepted with conditions by security privacy (user-1)")).toBeDefined();
    expect(screen.getByRole("button", { name: "Record acceptance" })).toBeDefined();
    expect(screen.getAllByText("session-1").length).toBeGreaterThan(0);
    expect(listControlMirrorEvidencePackExportsServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      take: 5
    });
    expect(screen.getByText("Technical audit details")).toBeDefined();
    expect(screen.getByText("Snapshot metadata")).toBeDefined();
    expect(screen.getByText("Report summary")).toBeDefined();
    expect(screen.getByText("Conformance findings")).toBeDefined();
    expect(screen.getByText("Human Review state")).toBeDefined();
    expect(screen.getByText("Review state in export")).toBeDefined();
    expect(screen.getByText("1 open")).toBeDefined();
    expect(screen.getByText("1 blocking decision")).toBeDefined();
    expect(screen.getAllByText("2 excerpts retained, 1 redacted, 0 metadata-only or omitted.").length).toBeGreaterThan(1);
    expect(screen.getByText("A redacted source excerpt was retained.")).toBeDefined();
    expect(screen.getAllByText("Downgrade the achieved AI level or add missing evidence.").length).toBeGreaterThan(0);
  }, 10000);

  it("renders fail-closed export error state", async () => {
    getControlMirrorDashboardServiceMock.mockResolvedValueOnce({
      ok: true,
      data: createDashboard()
    });
    listControlMirrorEvidencePackExportsServiceMock.mockResolvedValueOnce({
      ok: true,
      data: []
    });

    render(await ControlMirrorPage({
      searchParams: Promise.resolve({
        status: "error",
        message: "Export failed. No evidence pack was created. Control Mirror export is unavailable."
      })
    }));

    expect(screen.getByText("Export failed. No evidence pack was created. Control Mirror export is unavailable.")).toBeDefined();
    expect(screen.getByText("No evidence pack exports have been recorded yet.")).toBeDefined();
    expect(screen.getAllByRole("link", { name: /download evidence pack/i }).some((link) => link.getAttribute("href") === "/control-mirror/export")).toBe(true);
    expect(screen.getAllByText(/raw source text is not included/i).length).toBeGreaterThan(0);
  });
});
