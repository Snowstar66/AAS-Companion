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
      projectPhase: {
        key: "framing",
        label: "Framing phase",
        detail: "The project remains in framing until a framing brief is approved at Tollgate 1."
      },
      storyIdeaStats: {
        total: 4,
        started: 2,
        framingReady: 1
      },
      deliveryStoryStats: {
        total: 3,
        readyToStartBuild: 1
      },
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
      ]
    }
  }))
}));

describe("Home dashboard", () => {
  it("renders active project signals ahead of switching controls on Home", async () => {
    render(await HomePage({}));

    expect(screen.getByRole("heading", { name: "Project dashboard", level: 1 })).toBeDefined();
    expect(screen.getAllByText("Needs attention").length).toBeGreaterThan(0);
    expect(screen.getByText("Framing phase")).toBeDefined();
    expect(screen.getAllByRole("link", { name: "Open Framing" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Project access" })).toBeDefined();
    expect(screen.getByText("Create project")).toBeDefined();
    expect(screen.getAllByText("Demo access").length).toBeGreaterThan(0);
    expect(screen.getByText("Current project")).toBeDefined();
    expect(screen.queryByText("Outcome spread")).toBeNull();
  });
});
