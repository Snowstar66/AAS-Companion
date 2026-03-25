import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

const configMocks = vi.hoisted(() => ({
  isDemoAuthEnabled: vi.fn(() => true),
  isLocalAuthEnabled: vi.fn(() => false),
  isSupabaseConfigured: vi.fn(() => true)
}));

const dbMocks = vi.hoisted(() => ({
  listAppUsers: vi.fn(async () => [])
}));

const authMocks = vi.hoisted(() => ({
  getAppSession: vi.fn(async () => null),
  getSignedInAccountIdentity: vi.fn(async () => null)
}));

vi.mock("@aas-companion/config", () => configMocks);
vi.mock("@aas-companion/db", () => dbMocks);
vi.mock("@/lib/auth/server", () => authMocks);
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => "/login")
}));

describe("Login page", () => {
  beforeEach(() => {
    configMocks.isDemoAuthEnabled.mockReturnValue(true);
    configMocks.isLocalAuthEnabled.mockReturnValue(false);
    configMocks.isSupabaseConfigured.mockReturnValue(true);
    dbMocks.listAppUsers.mockResolvedValue([]);
    authMocks.getAppSession.mockResolvedValue(null);
    authMocks.getSignedInAccountIdentity.mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  it("explains that known users still use magic link when direct sign-in is disabled", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Direct sign-in is off here")).toBeDefined();
    expect(screen.getByText("Known users still use email verification here because direct sign-in is disabled.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Send magic link" })).toBeDefined();
  });

  it("surfaces internal direct sign-in and clearer fallback messaging when local auth is enabled", async () => {
    configMocks.isLocalAuthEnabled.mockReturnValue(true);
    dbMocks.listAppUsers.mockResolvedValue([
      {
        userId: "user-1",
        email: "pontus.hellgren@cgi.com",
        fullName: "Pontus Hellgren"
      }
    ]);

    render(
      await LoginPage({
        searchParams: Promise.resolve({
          sent: "1",
          email: "unknown.user@cgi.com"
        })
      })
    );

    expect(screen.getByText("Internal direct sign-in")).toBeDefined();
    expect(screen.getByText("Known internal users can sign in immediately in this environment.")).toBeDefined();
    expect(screen.getByText("Known internal users")).toBeDefined();
    expect(screen.getByRole("button", { name: "Continue with email" })).toBeDefined();
    expect(screen.getByText(/No direct internal user matched/)).toBeDefined();
  });
});
