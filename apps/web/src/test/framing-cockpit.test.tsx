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
          title: "Close the governance readiness gap",
          status: "draft",
          statusLabel: "Draft",
          readinessLabel: "Blocked",
          readinessTone: "blocked",
          readinessDetail: "Baseline definition is missing.",
          isBlocked: true,
          blockers: ["Baseline definition is missing."],
          baselineComplete: false,
          ownerLabel: "Demo Value Owner",
          timeframe: "Q2 2026",
          epicCount: 0,
          storyCount: 0,
          updatedAtLabel: "Mar 23",
          detailHref: "/outcomes/outcome-1"
        },
        {
          id: "outcome-2",
          key: "OUT-002",
          title: "Make outcome delivery reviewable",
          status: "ready_for_tg1",
          statusLabel: "Ready For TG1",
          readinessLabel: "Ready for framing review",
          readinessTone: "ready",
          readinessDetail: "Baseline fields are present and the outcome can continue toward TG1.",
          isBlocked: false,
          blockers: [],
          baselineComplete: true,
          ownerLabel: "Demo Value Owner",
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

  it("renders outcomes and filters blocked items", async () => {
    render(await FramingPage());

    expect(screen.getByRole("heading", { name: "Framing Cockpit", level: 1 })).toBeDefined();
    expect(screen.getByText("Close the governance readiness gap")).toBeDefined();
    expect(screen.getByText("Make outcome delivery reviewable")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Blocked (1)" }));

    expect(screen.getByText("Close the governance readiness gap")).toBeDefined();
    expect(screen.queryByText("Make outcome delivery reviewable")).toBeNull();
  });

  it("supports search within the cockpit list", async () => {
    render(await FramingPage());

    fireEvent.change(screen.getByLabelText("Search outcomes"), {
      target: {
        value: "reviewable"
      }
    });

    expect(screen.getByText("Make outcome delivery reviewable")).toBeDefined();
    expect(screen.queryByText("Close the governance readiness gap")).toBeNull();
  });
});
