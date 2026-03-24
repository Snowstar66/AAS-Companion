import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("@/lib/home/dashboard", () => ({
  loadHomeDashboard: vi.fn(async () => ({
    session: null,
    projects: [],
    activeProject: null,
    hasAuthenticatedUser: false,
    isDemoSession: false,
    dashboard: {
      state: "unavailable",
      organizationName: "No project selected",
      message: "Dashboard data is unavailable right now.",
      summary: [],
      outcomesByStatus: [],
      topBlockers: [],
      pendingActions: [],
      recentActivity: [],
      rightRail: {
        blockers: [],
        nextActions: []
      }
    }
  }))
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the degraded dashboard state", async () => {
    render(await HomePage({}));

    expect(
      screen.getByRole("heading", {
        name: "Choose how to enter work",
        level: 1
      })
    ).toBeDefined();
    expect(screen.getByText("Choose or create a project before any operational data is shown.")).toBeDefined();
  });
});
