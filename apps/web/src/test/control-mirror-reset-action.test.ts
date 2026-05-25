import { describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  revalidatePathMock,
  requireActiveProjectSessionMock,
  resetControlMirrorWorkspaceServiceMock
} = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  revalidatePathMock: vi.fn(),
  requireActiveProjectSessionMock: vi.fn(),
  resetControlMirrorWorkspaceServiceMock: vi.fn()
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
    resetControlMirrorWorkspaceService: resetControlMirrorWorkspaceServiceMock
  };
});

import { resetControlMirrorWorkspaceAction } from "@/app/(protected)/control-mirror/actions";

function mockSession(input?: { mode?: string; organizationId?: string }) {
  requireActiveProjectSessionMock.mockResolvedValueOnce({
    mode: input?.mode ?? "project",
    userId: "user-1",
    organization: {
      organizationId: input?.organizationId ?? "org-demo",
      role: "delivery_lead"
    }
  });
}

describe("Control Mirror reset action", () => {
  it("fails closed in demo mode", async () => {
    mockSession({ mode: "demo" });

    await expect(resetControlMirrorWorkspaceAction()).rejects.toThrow("REDIRECT:");

    expect(resetControlMirrorWorkspaceServiceMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("Control+Mirror+reset+is+read-only+in+Demo"));
  });

  it("resets generated Control Mirror state for a normal project", async () => {
    mockSession();
    resetControlMirrorWorkspaceServiceMock.mockResolvedValueOnce({
      ok: true,
      data: {
        snapshotId: "reset-snapshot-1",
        label: "Reset baseline",
        clearedSnapshots: 2,
        clearedReviewItems: 3,
        clearedExports: 1
      }
    });

    await expect(resetControlMirrorWorkspaceAction()).rejects.toThrow("REDIRECT:");

    expect(resetControlMirrorWorkspaceServiceMock).toHaveBeenCalledWith({
      organizationId: "org-demo",
      actorId: "user-1"
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/control-mirror");
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("status=reset"));
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("Framing%2C+stories%2C+signoffs+and+project+imports+were+kept"));
  });
});
