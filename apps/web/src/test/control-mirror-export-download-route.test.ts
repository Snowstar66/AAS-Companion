import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/(protected)/control-mirror/export/[exportId]/route";

const {
  getPersistedControlMirrorEvidencePackExportServiceMock,
  recordControlMirrorEvidencePackExportDownloadEventServiceMock,
  requireActiveProjectSessionMock
} = vi.hoisted(() => ({
  getPersistedControlMirrorEvidencePackExportServiceMock: vi.fn(),
  recordControlMirrorEvidencePackExportDownloadEventServiceMock: vi.fn(),
  requireActiveProjectSessionMock: vi.fn()
}));

vi.mock("@aas-companion/api", () => ({
  getPersistedControlMirrorEvidencePackExportService: getPersistedControlMirrorEvidencePackExportServiceMock,
  recordControlMirrorEvidencePackExportDownloadEventService: recordControlMirrorEvidencePackExportDownloadEventServiceMock
}));

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: requireActiveProjectSessionMock
}));

function createRequest() {
  return new NextRequest("http://localhost/control-mirror/export/export-1");
}

function createContext(exportId?: string) {
  return {
    params: Promise.resolve({
      exportId
    })
  };
}

describe("Control Mirror persisted export download route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns stored export content with stored download headers for the active organization", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      userId: "user-1",
      organization: {
        organizationId: "org-demo"
      }
    });
    getPersistedControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        id: "export-1",
        format: "json",
        fileName: "aas-demo-session-1-evidence-pack.json",
        contentType: "application/json; charset=utf-8",
        body: "{\n  \"schemaVersion\": \"control-mirror-evidence-pack/v1\",\n  \"acceptance\": {\n    \"disclosure\": \"Evidence packs are generated audit artifacts. Product/Security acceptance is required before broad governance or external sharing.\"\n  }\n}",
        generatedAt: "2026-05-22T10:00:00.000Z",
        createdAt: "2026-05-22T10:01:00.000Z",
        retention: {
          state: "active",
          policyLabel: "governance_audit_artifact",
          reviewDueAt: null,
          reviewedAt: null,
          archivedAt: null,
          archivedBy: null,
          archiveReason: null
        }
      }
    });
    recordControlMirrorEvidencePackExportDownloadEventServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        eventId: "download-1",
        exportId: "export-1",
        actorId: "user-1",
        downloadedAt: "2026-05-22T10:02:00.000Z"
      }
    });

    const response = await GET(createRequest(), createContext("export-1"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="aas-demo-session-1-evidence-pack.json"');
    expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("X-Control-Mirror-Retention-State")).toBe("active");
    expect(body).toContain("control-mirror-evidence-pack/v1");
    expect(body).toContain("Product/Security acceptance is required before broad governance or external sharing");
    expect(getPersistedControlMirrorEvidencePackExportServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      exportId: "export-1"
    });
    expect(recordControlMirrorEvidencePackExportDownloadEventServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      exportId: "export-1",
      actorId: "user-1"
    });
  });

  it("serves archived exports with archive disclosure headers while keeping the stored body downloadable", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      userId: "user-1",
      organization: {
        organizationId: "org-demo"
      }
    });
    getPersistedControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        id: "export-archived",
        format: "markdown",
        fileName: "aas-demo-session-1-evidence-pack.md",
        contentType: "text/markdown; charset=utf-8",
        body: "# Control Mirror Evidence Pack\n",
        generatedAt: "2026-05-22T10:00:00.000Z",
        createdAt: "2026-05-22T10:01:00.000Z",
        retention: {
          state: "archived",
          policyLabel: "governance_audit_artifact",
          reviewDueAt: null,
          reviewedAt: null,
          archivedAt: "2026-05-22T11:00:00.000Z",
          archivedBy: "delivery-lead-1",
          archiveReason: "Superseded by a newer evidence pack export."
        }
      }
    });
    recordControlMirrorEvidencePackExportDownloadEventServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        eventId: "download-archived",
        exportId: "export-archived",
        actorId: "user-1",
        downloadedAt: "2026-05-22T10:12:00.000Z"
      }
    });

    const response = await GET(createRequest(), createContext("export-archived"));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="aas-demo-session-1-evidence-pack.md"');
    expect(response.headers.get("X-Control-Mirror-Retention-State")).toBe("archived");
    expect(response.headers.get("X-Control-Mirror-Archive-Disclosure")).toBe("Archived: Superseded by a newer evidence pack export.");
    expect(body).toContain("# Control Mirror Evidence Pack");
    expect(recordControlMirrorEvidencePackExportDownloadEventServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      exportId: "export-archived",
      actorId: "user-1"
    });
  });

  it("redirects with fail-closed copy when the export is missing for the organization", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      userId: "user-1",
      organization: {
        organizationId: "org-demo"
      }
    });
    getPersistedControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce({
      ok: false,
      errors: [
        {
          code: "control_mirror_export_not_found",
          message: "Persisted Control Mirror export was not found for this project."
        }
      ]
    });

    const response = await GET(createRequest(), createContext("other-org-export"));
    const redirect = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(307);
    expect(redirect.pathname).toBe("/control-mirror");
    expect(redirect.searchParams.get("message")).toBe(
      "Export download failed. Persisted Control Mirror export was not found for this project."
    );
    expect(recordControlMirrorEvidencePackExportDownloadEventServiceMock).not.toHaveBeenCalled();
  });

  it("redirects fail-closed when a successful lookup cannot be audited", async () => {
    requireActiveProjectSessionMock.mockResolvedValueOnce({
      userId: "user-1",
      organization: {
        organizationId: "org-demo"
      }
    });
    getPersistedControlMirrorEvidencePackExportServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        id: "export-1",
        format: "json",
        fileName: "aas-demo-session-1-evidence-pack.json",
        contentType: "application/json; charset=utf-8",
        body: "{}",
        generatedAt: "2026-05-22T10:00:00.000Z",
        createdAt: "2026-05-22T10:01:00.000Z",
        retention: {
          state: "active",
          policyLabel: "governance_audit_artifact",
          reviewDueAt: null,
          reviewedAt: null,
          archivedAt: null,
          archivedBy: null,
          archiveReason: null
        }
      }
    });
    recordControlMirrorEvidencePackExportDownloadEventServiceMock.mockResolvedValueOnce({
      ok: false,
      errors: [
        {
          code: "control_mirror_export_download_audit_failed",
          message: "Control Mirror export download could not be audited."
        }
      ]
    });

    const response = await GET(createRequest(), createContext("export-1"));
    const redirect = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(307);
    expect(redirect.pathname).toBe("/control-mirror");
    expect(redirect.searchParams.get("message")).toBe(
      "Export download failed. Control Mirror export download could not be audited."
    );
  });
});
