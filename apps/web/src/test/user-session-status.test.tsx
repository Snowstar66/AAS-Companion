import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserSessionStatus } from "@/components/layout/user-session-status";

describe("User session status", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          authenticated: true,
          user: {
            displayName: "Pontus Hellgren",
            email: "pontus.hellgren@cgi.com",
            mode: "local"
          }
        })
      }))
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the signed-in user and a sign-out action in the header", async () => {
    render(<UserSessionStatus />);

    await waitFor(() => {
      expect(screen.getByText("Pontus Hellgren")).toBeDefined();
    });

    expect(screen.getByText("pontus.hellgren@cgi.com")).toBeDefined();
    expect(screen.getByText("Direct sign-in")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeDefined();
  });
});
