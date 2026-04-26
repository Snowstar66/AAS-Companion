import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieMocks = vi.hoisted(() => ({
  cookies: vi.fn()
}));

const orgRepositoryMocks = vi.hoisted(() => ({
  ensureAppUser: vi.fn(),
  getAppUserById: vi.fn(),
  getOrganizationContextForUser: vi.fn()
}));

const supabaseMocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn()
}));

vi.mock("next/headers", () => cookieMocks);
vi.mock("@aas-companion/db/organization-repository", () => orgRepositoryMocks);
vi.mock("@/lib/auth/supabase/server", () => supabaseMocks);
vi.mock("@/lib/dev-timing", () => ({
  withDevTiming: async (_label: string, callback: () => Promise<unknown>) => callback()
}));

describe("auth session", () => {
  beforeEach(() => {
    vi.resetModules();
    cookieMocks.cookies.mockResolvedValue({
      get: vi.fn(() => undefined),
      getAll: vi.fn(() => [{ name: "sb-test-auth-token", value: "token" }])
    });
    orgRepositoryMocks.ensureAppUser.mockReset();
    orgRepositoryMocks.getAppUserById.mockReset();
    orgRepositoryMocks.getOrganizationContextForUser.mockReset();
    supabaseMocks.createServerSupabaseClient.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("treats Supabase network failures as signed out instead of throwing a route error", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    supabaseMocks.createServerSupabaseClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => {
          throw new TypeError("Failed to fetch");
        })
      }
    });

    const { getSignedInAccountIdentity } = await import("@/lib/auth/session");

    await expect(getSignedInAccountIdentity()).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "[auth] Supabase session lookup failed; treating the request as signed out.",
      expect.any(TypeError)
    );
  });
});
