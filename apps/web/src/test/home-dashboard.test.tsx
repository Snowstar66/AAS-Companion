import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("@/lib/home/dashboard", () => ({
  loadHomeDashboard: vi.fn(async () => ({
    session: {
      mode: "demo",
      userId: "user-demo",
      email: "value.owner@aas-companion.local",
      displayName: "Demo Value Owner",
      organization: {
        organizationId: "org_demo_control_plane",
        organizationName: "AAS Demo Organization",
        organizationSlug: "aas-demo-org",
        role: "value_owner"
      }
    },
    projects: [],
    activeProject: {
      organizationId: "org_demo_control_plane",
      organizationName: "AAS Demo Organization",
      organizationSlug: "aas-demo-org",
      role: "value_owner"
    },
    hasAuthenticatedUser: true,
    isDemoSession: true,
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
  it("renders active project signals ahead of switching controls on Home", async () => {
    render(await HomePage({}));

    expect(screen.getByRole("heading", { name: "Project Home", level: 1 })).toBeDefined();
    expect(screen.getByText("Project overview")).toBeDefined();
    expect(screen.getAllByRole("link", { name: "Open Framing" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: "Open project" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Create project" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Open demo project" })).toBeDefined();
    expect(screen.queryByText("Project status at a glance")).toBeNull();
  });
});
