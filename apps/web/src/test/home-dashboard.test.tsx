import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("@/lib/home/dashboard", () => ({
  loadHomeDashboard: vi.fn(async () => ({
    session: {
      organization: {
        organizationId: "org_demo_control_plane"
      }
    },
    dashboard: {
      state: "live",
      organizationName: "AAS Demo Organization",
      summary: [
        {
          label: "Outcomes",
          value: "2",
          tone: "default",
          description: "Tracked outcomes."
        }
      ],
      outcomesByStatus: [
        {
          status: "draft",
          count: 1,
          label: "Draft"
        }
      ],
      topBlockers: [
        {
          id: "blocker-1",
          title: "Baseline definition is missing.",
          detail: "tg1 baseline on outcome OUT-001",
          severity: "high",
          href: "/outcomes"
        }
      ],
      pendingActions: [
        {
          id: "action-1",
          title: "Complete M1-STORY-004",
          detail: "Add a test definition before handoff.",
          href: "/stories"
        }
      ],
      recentActivity: [
        {
          id: "activity-1",
          title: "Demo project prepared",
          detail: "organization org_demo_control_plane",
          timestamp: "Mar 23, 10:00"
        }
      ],
      rightRail: {
        blockers: [],
        nextActions: []
      }
    }
  }))
}));

describe("Home dashboard", () => {
  it("renders Home as a project selector and return point", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { name: "Choose or resume work", level: 1 })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Resume current project" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Start a new project" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Open Demo explicitly" })).toBeDefined();
    expect(screen.getByText("Project status at a glance")).toBeDefined();
  });
});
