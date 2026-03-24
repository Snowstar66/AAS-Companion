import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("@/lib/home/dashboard", () => ({
  loadHomeDashboard: vi.fn(async () => ({
    session: null,
    dashboard: {
      state: "unavailable",
      organizationName: "AAS Demo Organization",
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
    render(await HomePage());

    expect(
      screen.getByRole("heading", {
        name: "Choose or resume work",
        level: 1
      })
    ).toBeDefined();
    expect(screen.getAllByText("Dashboard data is unavailable right now.").length).toBeGreaterThan(0);
  });
});
