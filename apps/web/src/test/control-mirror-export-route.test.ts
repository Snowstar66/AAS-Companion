import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/(protected)/control-mirror/export/route";

const { createControlMirrorEvidencePackExportServiceMock, requireActiveProjectSessionMock } = vi.hoisted(() => ({
  createControlMirrorEvidencePackExportServiceMock: vi.fn(),
  requireActiveProjectSessionMock: vi.fn()
}));

vi.mock("@aas-companion/api", () => ({
  createControlMirrorEvidencePackExportService: createControlMirrorEvidencePackExportServiceMock
}));

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: requireActiveProjectSessionMock
}));

function createRequest(url = "http://localhost/control-mirror/export") {
  return new NextRequest(url);
}

function createEvidencePack() {
  return {
    schemaVersion: "control-mirror-evidence-pack/v1",
    generatedAt: "2026-05-22T08:00:00.000Z",
    activeProject: "AAS Demo Organization",
    snapshot: {
      id: "Snapshot 01 / Upload",
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
      deletedCount: 0
    },
    aiLevel: {
      requested: "level_3",
      achieved: "level_2",
      releaseReadiness: "downgrade_required"
    },
    source: {
      summary: "Control Mirror reads only user-authorized evidence.",
      retentionDefault: "metadata_and_excerpts",
      activeModeLabel: "Uploaded snapshot",
      activeModeRetention: "redacted_excerpts"
    },
    report: {
      approvedFramingVersion: "1",
      summaryItems: [
        {
          id: "release-readiness",
          label: "Release readiness",
          value: "downgrade_required",
          status: "downgrade_required"
        }
      ],
      requiredApprovals: ["AI level evidence mismatch"],
      blockingGaps: ["Downgrade the achieved AI level or add the missing evidence."],
      residualRisks: ["Level 3 claims require visible role separation."],
      recommendedNextStep: "Downgrade the achieved AI level or add missing evidence.",
      executionStatement: "Control Mirror is calculated from existing AAS Companion records.",
      evidenceRetentionSummary: "1 excerpt retained, 1 redacted, 0 metadata-only or omitted."
    },
    evidence: {
      artifacts: [
        {
          id: "artifact-1",
          fileName: "docs/runtime.ts",
          artifactType: "implementation_note",
          lineageStatus: "missing",
          parsingConfidence: "high",
          changeStatus: "new",
          storyId: null
        }
      ],
      normalizedEvidence: [
        {
          id: "evidence-1",
          artifactId: "artifact-1",
          fileName: "docs/runtime.ts",
          evidenceType: "implementation_evidence",
          label: "Runtime",
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
    },
    findings: {
      conformance: [],
      guardrails: []
    },
    humanReview: {
      summary: {
        open: 1,
        decided: 0,
        deferred: 0,
        superseded: 0,
        openBlocking: 1,
        items: []
      },
      items: [
        {
          id: "ai-level-mismatch",
          reviewState: "open",
          category: "AI level evidence mismatch",
          severity: "high",
          decisionNeeded: "Downgrade the achieved AI level or add the missing evidence.",
          recommendedOption: "DEFER",
          affectedObject: "Requested level_3, achieved level_2",
          blocksRelease: true
        }
      ]
    },
    safety: {
      rawSourceTextIncluded: false,
      disclosure: "Raw source text is not included."
    }
  };
}

function createExportServiceResult(format: "json" | "markdown" = "json") {
  const evidencePack = createEvidencePack();

  return {
    ok: true,
    data: {
      id: "export-1",
      format,
      fileName: format === "markdown"
        ? "aas-demo-organization-snapshot-01-upload-evidence-pack.md"
        : "aas-demo-organization-snapshot-01-upload-evidence-pack.json",
      contentType: format === "markdown" ? "text/markdown; charset=utf-8" : "application/json; charset=utf-8",
      body: format === "markdown" ? "# Control Mirror Evidence Pack\n\nAAS Demo Organization\n\nRaw source text is not included.\n" : JSON.stringify(evidencePack, null, 2),
      evidencePack
    }
  };
}

describe("Control Mirror evidence pack export route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns JSON with download headers for the active organization", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      organization: {
        organizationId: "org-demo"
      }
    });
    createControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce(createExportServiceResult());

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="aas-demo-organization-snapshot-01-upload-evidence-pack.json"'
    );
    expect(body).toMatchObject({
      schemaVersion: "control-mirror-evidence-pack/v1",
      activeProject: "AAS Demo Organization",
      safety: {
        rawSourceTextIncluded: false
      }
    });
    expect(createControlMirrorEvidencePackExportServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      actorId: undefined,
      format: "json"
    });
  });

  it("redirects back with fail-closed copy when the evidence pack service fails", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      organization: {
        organizationId: "org-demo"
      }
    });
    createControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce({
      ok: false,
      errors: [
        {
          code: "control_mirror_unavailable",
          message: "Control Mirror export is unavailable."
        }
      ]
    });

    const response = await GET(createRequest());
    const location = response.headers.get("location");

    expect(response.status).toBe(307);
    expect(location).not.toBeNull();

    const redirect = new URL(location ?? "");

    expect(redirect.pathname).toBe("/control-mirror");
    expect(redirect.searchParams.get("status")).toBe("error");
    expect(redirect.searchParams.get("message")).toBe(
      "Export failed. No evidence pack was created. Control Mirror export is unavailable."
    );
  });

  it("returns Markdown with download headers when markdown format is requested", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      organization: {
        organizationId: "org-demo"
      }
    });
    createControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce(createExportServiceResult("markdown"));

    const response = await GET(createRequest("http://localhost/control-mirror/export?format=markdown"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="aas-demo-organization-snapshot-01-upload-evidence-pack.md"'
    );
    expect(body).toContain("# Control Mirror Evidence Pack");
    expect(body).toContain("AAS Demo Organization");
    expect(body).toContain("Raw source text is not included.");
    expect(body).not.toContain("retainedExcerpt");
  });

  it("treats the md format alias as a Markdown export", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      organization: {
        organizationId: "org-demo"
      }
    });
    createControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce(createExportServiceResult("markdown"));

    const response = await GET(createRequest("http://localhost/control-mirror/export?format=md"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="aas-demo-organization-snapshot-01-upload-evidence-pack.md"'
    );
  });

  it("redirects back when persisted export creation fails", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      userId: "user-1",
      organization: {
        organizationId: "org-demo"
      }
    });
    createControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce({
      ok: false,
      errors: [
        {
          code: "control_mirror_export_persist_failed",
          message: "Control Mirror export could not be saved."
        }
      ]
    });

    const response = await GET(createRequest());
    const redirect = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(307);
    expect(redirect.pathname).toBe("/control-mirror");
    expect(redirect.searchParams.get("message")).toBe(
      "Export failed. No evidence pack was created. Control Mirror export could not be saved."
    );
    expect(createControlMirrorEvidencePackExportServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      actorId: "user-1",
      format: "json"
    });
  });
});
