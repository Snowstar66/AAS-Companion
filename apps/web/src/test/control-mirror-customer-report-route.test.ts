import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/(protected)/control-mirror/customer-report/route";

const { getControlMirrorDashboardServiceMock, requireActiveProjectSessionMock } = vi.hoisted(() => ({
  getControlMirrorDashboardServiceMock: vi.fn(),
  requireActiveProjectSessionMock: vi.fn()
}));

vi.mock("@aas-companion/api", () => ({
  getControlMirrorDashboardService: getControlMirrorDashboardServiceMock
}));

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: requireActiveProjectSessionMock
}));

function createRequest(url = "http://localhost/control-mirror/customer-report") {
  return new NextRequest(url);
}

function createDashboard() {
  return {
    releaseReadiness: "downgrade_required",
    requestedAiLevel: "level_3",
    achievedAiLevel: "level_2",
    snapshot: {
      id: "snapshot-1",
      label: "Uploaded project snapshot",
      sourceType: "manual_artifact_upload",
      scanTime: "2026-05-22T08:00:00.000Z",
      fileCount: 4,
      acceptedCount: 4,
      rejectedCount: 0,
      unreadableCount: 0
    },
    metrics: [
      { id: "framing-alignment", percentage: 100 },
      { id: "value-spine-coverage", percentage: 88 },
      { id: "build-conformance", percentage: 72 },
      { id: "test-evidence", percentage: 64 }
    ],
    aiEvidence: [
      { present: true },
      { present: false }
    ],
    normalizedEvidence: [
      {
        label: "PRD baseline",
        evidenceType: "framing_design_evidence",
        fileName: "prd.md"
      },
      {
        label: "Release tests",
        evidenceType: "test_evidence",
        fileName: "qa-results.json"
      }
    ],
    reviewStateSummary: {
      open: 2,
      openBlocking: 1,
      decided: 0,
      deferred: 0
    },
    report: {
      activeProject: "AAS Demo Organization",
      releaseReadiness: "downgrade_required",
      approvedFramingVersion: "1",
      snapshotId: "snapshot-1",
      openHumanReviewItems: 2,
      blockingHumanReviewItems: 1,
      scopeDriftItems: 0,
      untracedArtifacts: 1,
      recommendedNextStep: "Downgrade the AI claim or add missing evidence before customer release.",
      executionStatement: "Control Mirror is calculated from approved project records.",
      evidenceRetentionSummary: "Raw source text is excluded; summaries and metadata are retained.",
      evidenceSummaries: [
        {
          label: "Framing alignment",
          value: "100%",
          status: "aligned"
        },
        {
          label: "Test evidence",
          value: "64%",
          status: "partial"
        }
      ],
      blockingGaps: ["AI level 3 claim lacks supporting evidence."],
      residualRisks: ["Customer presentation should not claim level 3 automation yet."],
      requiredApprovals: ["Product owner", "Security/privacy reviewer"]
    }
  };
}

describe("Control Mirror customer report route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a customer PDF report for the active organization", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      organization: {
        organizationId: "org-demo"
      }
    });
    getControlMirrorDashboardServiceMock.mockResolvedValueOnce({
      ok: true,
      data: createDashboard()
    });

    const response = await GET(createRequest());
    const body = Buffer.from(await response.arrayBuffer()).toString("ascii", 0, 8);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="aas-demo-organization-control-mirror-customer-report.pdf"'
    );
    expect(body).toBe("%PDF-1.4");
    expect(getControlMirrorDashboardServiceMock).toHaveBeenCalledWith("org-demo");
  });

  it("redirects back when the Control Mirror report cannot be built", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      organization: {
        organizationId: "org-demo"
      }
    });
    getControlMirrorDashboardServiceMock.mockResolvedValueOnce({
      ok: false,
      errors: [
        {
          message: "Control Mirror report is unavailable."
        }
      ]
    });

    const response = await GET(createRequest());
    const redirect = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(307);
    expect(redirect.pathname).toBe("/control-mirror");
    expect(redirect.searchParams.get("status")).toBe("error");
    expect(redirect.searchParams.get("message")).toBe(
      "Customer PDF export failed. Control Mirror report is unavailable."
    );
  });
});
