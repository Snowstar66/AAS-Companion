import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FramingPage from "@/app/(protected)/framing/page";

vi.mock("@/lib/framing/cockpit", () => ({
  loadFramingCockpit: vi.fn(async () => ({
    session: {
      organization: {
        organizationId: "org_demo_control_plane"
      }
    },
    cockpit: {
      state: "live",
      organizationName: "AAS Demo Organization",
      message: "Outcome framing data is available and filterable.",
      summary: {
        total: 2,
        blocked: 1,
        ready: 1
      },
      items: [
        {
          id: "outcome-1",
          key: "OUT-001",
          title: "New customer case",
          status: "draft",
          statusLabel: "Draft",
          readinessLabel: "Blocked",
          readinessTone: "blocked",
          readinessDetail: "Baseline definition is missing.",
          isBlocked: true,
          blockers: ["Baseline definition is missing."],
          baselineComplete: false,
          ownerLabel: "Demo Value Owner",
          originType: "native",
          importedReadinessState: null,
          lineageHref: null,
          timeframe: "Q2 2026",
          epicCount: 0,
          storyCount: 0,
          updatedAtLabel: "Mar 23",
          detailHref: "/outcomes/outcome-1"
        },
        {
          id: "outcome-2",
          key: "OUT-002",
          title: "Close the governance readiness gap",
          status: "ready_for_tg1",
          statusLabel: "Ready For TG1",
          readinessLabel: "Ready for framing review",
          readinessTone: "ready",
          readinessDetail: "Baseline fields are present and the outcome can continue toward TG1.",
          isBlocked: false,
          blockers: [],
          baselineComplete: true,
          ownerLabel: "Demo Value Owner",
          originType: "seeded",
          importedReadinessState: null,
          lineageHref: null,
          timeframe: "Q2 2026",
          epicCount: 1,
          storyCount: 3,
          updatedAtLabel: "Mar 23",
          detailHref: "/outcomes/outcome-2"
        }
      ]
    }
  }))
}));

vi.mock("@/app/(protected)/framing/actions", () => ({
  createDraftOutcomeAction: vi.fn()
}));

describe("Framing cockpit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders native-first entry actions and defaults to native work", async () => {
    render(await FramingPage({}));

    expect(screen.getByRole("heading", { name: "Framing Cockpit", level: 1 })).toBeDefined();
    expect(screen.getByText("Customer handshake inside project")).toBeDefined();
    expect(screen.getByText("Handshake in this project")).toBeDefined();
    expect(screen.getByRole("link", { name: "Open active framing" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Create project for new case" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Open demo case" })).toBeDefined();
    expect(screen.getByText("New customer case")).toBeDefined();
    expect(screen.queryByText("Close the governance readiness gap")).toBeNull();
    expect(screen.getAllByText("Native").length).toBeGreaterThan(0);
  });

  it("supports switching to demo cases intentionally", async () => {
    render(await FramingPage({}));

    fireEvent.click(screen.getByRole("button", { name: "Demo (1)" }));

    expect(screen.getByText("Close the governance readiness gap")).toBeDefined();
    expect(screen.queryByText("New customer case")).toBeNull();
    expect(screen.getAllByText("Demo").length).toBeGreaterThan(0);
  });
});
