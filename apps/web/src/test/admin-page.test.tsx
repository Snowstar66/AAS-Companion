import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/(protected)/admin/page";

vi.mock("@/lib/home/dashboard", () => ({
  loadHomeDashboard: vi.fn(async () => ({
    session: {
      mode: "local",
      userId: "user-1",
      email: "pontus@example.com",
      displayName: "Pontus",
      organization: {
        organizationId: "org-1",
        organizationName: "Hemmakoll",
        organizationSlug: "hemmakoll",
        role: "value_owner"
      }
    },
    dashboard: {
      state: "live",
      organizationName: "Hemmakoll",
      projectPhase: {
        key: "framing",
        label: "Framing phase",
        detail: "Active."
      },
      topBlockers: [],
      pendingActions: [],
      storyIdeaStats: {
        total: 0,
        started: 0,
        framingReady: 0
      },
      deliveryStoryStats: {
        total: 0,
        readyToStartBuild: 0
      }
    },
    projects: [
      {
        organizationId: "org-1",
        organizationName: "Hemmakoll",
        organizationSlug: "hemmakoll",
        role: "value_owner",
        counts: {
          outcomes: 1,
          epics: 7,
          stories: 18,
          activityEvents: 42
        },
        isActive: true
      },
      {
        organizationId: "org-2",
        organizationName: "Test Project",
        organizationSlug: "test-project",
        role: "value_owner",
        counts: {
          outcomes: 0,
          epics: 0,
          stories: 0,
          activityEvents: 3
        },
        isActive: false
      }
    ],
    activeProject: {
      organizationId: "org-1",
      organizationName: "Hemmakoll",
      organizationSlug: "hemmakoll",
      role: "value_owner"
    },
    hasAuthenticatedUser: true,
    canManageProjects: true,
    isDemoSession: false
  }))
}));

describe("Admin page", () => {
  it("renders a bulk cleanup surface for projects", async () => {
    render(await AdminPage({}));

    expect(screen.getByRole("heading", { name: "Aggressive project cleanup", level: 1 })).toBeDefined();
    expect(screen.getByText(/Hard delete removes the selected projects entirely/i)).toBeDefined();
    expect(screen.getByRole("checkbox", { name: /Hemmakoll/i })).toBeDefined();
    expect(screen.getByRole("checkbox", { name: /Test Project/i })).toBeDefined();
    expect(screen.getByRole("button", { name: "Hard delete selected projects" })).toBeDefined();
  });
});
