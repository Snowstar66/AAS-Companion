import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ViewerSessionProvider } from "@/components/auth/viewer-session-provider";
import { UserSessionStatus } from "@/components/layout/user-session-status";

describe("User session status", () => {
  it("shows the signed-in user and a sign-out action in the header", () => {
    render(
      <ViewerSessionProvider
        session={{
          mode: "local",
          userId: "user-1",
          email: "pontus.hellgren@cgi.com",
          displayName: "Pontus Hellgren",
          organization: null
        }}
      >
        <UserSessionStatus />
      </ViewerSessionProvider>
    );

    expect(screen.getByText("Pontus Hellgren")).toBeDefined();
    expect(screen.getByText("pontus.hellgren@cgi.com")).toBeDefined();
    expect(screen.getByText("Direct sign-in")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeDefined();
  });
});
