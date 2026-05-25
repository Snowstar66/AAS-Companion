import { describe, expect, it, vi } from "vitest";

const {
  archiveExportServiceMock,
  redirectMock,
  revalidatePathMock,
  requireActiveProjectSessionMock
} = vi.hoisted(() => ({
  archiveExportServiceMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  revalidatePathMock: vi.fn(),
  requireActiveProjectSessionMock: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock
}));

vi.mock("@/lib/auth/guards", () => ({
  requireActiveProjectSession: requireActiveProjectSessionMock
}));

vi.mock("@aas-companion/api", async () => {
  const actual = await vi.importActual<object>("@aas-companion/api");

  return {
    ...actual,
    archiveControlMirrorEvidencePackExportService: archiveExportServiceMock,
    createControlMirrorUploadedSnapshotService: vi.fn(),
    recordControlMirrorEvidencePackExportAcceptanceDecisionService: vi.fn(),
    recordControlMirrorHumanReviewDecisionService: vi.fn(),
    resetControlMirrorWorkspaceService: vi.fn(),
    refreshControlMirrorCurrentImportsSnapshotService: vi.fn()
  };
});

import { archiveControlMirrorEvidencePackExportAction } from "@/app/(protected)/control-mirror/actions";

function createFormData(input: {
  exportId?: string;
  archiveReason?: string;
}) {
  const formData = new FormData();

  formData.set("exportId", input.exportId ?? "export-1");
  formData.set("archiveReason", input.archiveReason ?? "Superseded by a newer evidence pack export.");

  return formData;
}

function mockSession(role: string) {
  requireActiveProjectSessionMock.mockResolvedValueOnce({
    userId: "user-1",
    organization: {
      organizationId: "org-demo",
      role
    }
  });
}

describe("Control Mirror export retention action", () => {
  it("fails closed before persistence when archive authority is missing", async () => {
    mockSession("builder");

    await expect(
      archiveControlMirrorEvidencePackExportAction(createFormData({}))
    ).rejects.toThrow("REDIRECT:");

    expect(archiveExportServiceMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("Archive+authority+is+required"));
  });

  it("archives an export when the active membership role has archive authority", async () => {
    mockSession("delivery_lead");
    archiveExportServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        exportId: "export-1"
      }
    });

    await expect(
      archiveControlMirrorEvidencePackExportAction(createFormData({
        archiveReason: "Superseded by a newer evidence pack export."
      }))
    ).rejects.toThrow("REDIRECT:");

    expect(archiveExportServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      actorId: "user-1",
      exportId: "export-1",
      reason: "Superseded by a newer evidence pack export."
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/control-mirror");
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("export-archived"));
  });
});
