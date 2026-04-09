import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/(protected)/admin/page";
import { demoRoleSeeds } from "@/lib/admin/demo-role-catalog";

vi.mock("@aas-companion/db", () => ({
  listOrganizationProjectUsers: vi.fn(async () => [
    {
      userId: "user-1",
      email: "pontus@example.com",
      fullName: "Pontus",
      role: "value_owner",
      activeOutcomeOwnerCount: 1
    },
    {
      userId: "user-2",
      email: "aqa@example.com",
      fullName: "AQA Reviewer",
      role: "aqa",
      activeOutcomeOwnerCount: 0
    }
  ]),
  listPartyRoleEntries: vi.fn(async () => [
    {
      id: "party-role-1",
      organizationId: "org-1",
      fullName: "Meryl Streep",
      email: "meryl.streep+customer-sponsor@demo.aas.local",
      phoneNumber: null,
      avatarUrl: "data:image/svg+xml;base64,AAA",
      organizationSide: "customer",
      roleType: "customer_sponsor",
      roleTitle: "Executive Sponsor",
      mandateNotes: "Owns sponsor authority, escalation ownership and tollgate sponsorship for the project.",
      isActive: true,
      createdAt: new Date("2026-04-01T00:00:00.000Z"),
      updatedAt: new Date("2026-04-01T00:00:00.000Z")
    }
  ])
}));

vi.mock("@/lib/home/dashboard", () => ({
  loadHomeDashboard: vi.fn(async () => ({
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
    hasAuthenticatedUser: true,
    canManageProjects: true,
    isDemoSession: false
  }))
}));

vi.mock("@/lib/admin/operational-logs", () => ({
  loadOperationalLogs: vi.fn(async () => ({
    state: "ready",
    organizationName: "Hemmakoll",
    message: "Recent operational activity for the active project.",
    items: [
      {
        id: "log-1",
        entityType: "artifact_intake_file",
        entityId: "file-1",
        createdAt: new Date("2026-04-04T11:30:00.000Z"),
        actorName: "Pontus",
        scope: "approval",
        action: "framing_bulk_approve",
        status: "error",
        summary: "Approval stalled while promoting imported framing items.",
        detail: "Transaction API error: Unable to start a transaction in the given time.",
        durationMs: 48123,
        itemCount: 12
      }
    ]
  }))
}));

describe("Admin page", () => {
  it("renders project user admin, bulk cleanup, and operational logs", async () => {
    render(await AdminPage({}));
    const merylSeed = demoRoleSeeds.find((seed) => seed.id === "customer_sponsor");
    const emilySeed = demoRoleSeeds.find((seed) => seed.id === "customer_domain_owner");

    expect(screen.getByRole("heading", { name: "Aggressive project cleanup", level: 1 })).toBeDefined();
    expect(screen.getByText("Internal users in active project")).toBeDefined();
    expect(screen.getByText("Demo role bulk tools")).toBeDefined();
    expect(screen.getByText("Meryl Streep")).toBeDefined();
    expect(screen.getByText("Demo role created")).toBeDefined();
    expect(screen.getAllByText("Not created").length).toBeGreaterThan(0);
    expect(screen.getByText("Pontus")).toBeDefined();
    expect(screen.getAllByRole("button", { name: "Save user" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("checkbox", { name: "Create" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("checkbox", { name: "Remove" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Remove from active project" }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Hard delete removes the selected projects entirely/i)).toBeDefined();
    expect(screen.getByRole("checkbox", { name: /Hemmakoll/i })).toBeDefined();
    expect(screen.getByRole("checkbox", { name: /Test Project/i })).toBeDefined();
    expect(screen.getByRole("button", { name: "Hard delete selected projects" })).toBeDefined();
    expect(screen.getByText("Operational logs")).toBeDefined();
    expect(screen.getByRole("button", { name: "Clear all logs" })).toBeDefined();
    expect(screen.getByText(/Transaction API error: Unable to start a transaction in the given time\./i)).toBeDefined();
    expect(screen.getByAltText("Meryl Streep").getAttribute("src")).toBe(merylSeed?.avatarUrl);
    expect(screen.getByAltText("Emily Blunt").getAttribute("src")).toBe(emilySeed?.previewAvatarUrl);
  });
});
