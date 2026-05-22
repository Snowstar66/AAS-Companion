import { describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  revalidatePathMock,
  recordAcceptanceDecisionServiceMock,
  requireActiveProjectSessionMock
} = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  revalidatePathMock: vi.fn(),
  recordAcceptanceDecisionServiceMock: vi.fn(),
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
    createControlMirrorUploadedSnapshotService: vi.fn(),
    recordControlMirrorEvidencePackExportAcceptanceDecisionService: recordAcceptanceDecisionServiceMock,
    recordControlMirrorHumanReviewDecisionService: vi.fn(),
    refreshControlMirrorCurrentImportsSnapshotService: vi.fn()
  };
});

import { recordControlMirrorEvidencePackExportAcceptanceAction } from "@/app/(protected)/control-mirror/actions";

function createFormData(input: {
  exportId?: string;
  reviewerRole?: string;
  decisionType?: string;
  rationale?: string;
}) {
  const formData = new FormData();

  formData.set("exportId", input.exportId ?? "export-1");
  formData.set("reviewerRole", input.reviewerRole ?? "aqa");
  formData.set("decisionType", input.decisionType ?? "accepted");
  formData.set("rationale", input.rationale ?? "Accepted after role review.");

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

describe("Control Mirror export acceptance action", () => {
  it("fails closed before persistence when the active membership role cannot record the selected reviewer role", async () => {
    mockSession("delivery_lead");

    await expect(
      recordControlMirrorEvidencePackExportAcceptanceAction(createFormData({
        reviewerRole: "aqa"
      }))
    ).rejects.toThrow("REDIRECT:");

    expect(recordAcceptanceDecisionServiceMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("Reviewer+authority+is+required"));
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("AQA+reviewer"));
  });

  it("records acceptance when the active membership role matches the selected reviewer role", async () => {
    mockSession("aqa");
    recordAcceptanceDecisionServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        exportId: "export-1"
      }
    });

    await expect(
      recordControlMirrorEvidencePackExportAcceptanceAction(createFormData({
        reviewerRole: "aqa",
        decisionType: "revoked",
        rationale: "Acceptance revoked after evidence changed."
      }))
    ).rejects.toThrow("REDIRECT:");

    expect(recordAcceptanceDecisionServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      actorId: "user-1",
      exportId: "export-1",
      reviewerRole: "aqa",
      decisionType: "revoked",
      rationale: "Acceptance revoked after evidence changed."
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/control-mirror");
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("acceptance-recorded"));
  });
});
