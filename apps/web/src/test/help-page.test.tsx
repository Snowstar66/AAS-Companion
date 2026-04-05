import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HelpPage from "@/app/help/page";
import { Sidebar } from "@/components/layout/sidebar";

vi.mock("@aas-companion/domain/navigation", () => ({
  primaryNavigation: [
    {
      label: "Home",
      href: "/",
      description: "Choose, resume, or create a project."
    },
    {
      label: "Framing",
      href: "/framing",
      description: "Define the business case and baseline for the active project."
    },
    {
      label: "Help",
      href: "/help",
      description: "Understand what the tool is for and how Framing, Design and AI Build fit together."
    }
  ]
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/review"),
}));

describe("Help page", () => {
  it("shows the global help entry in sidebar navigation", () => {
    render(<Sidebar activeProjectName="AAS Demo Organization" activeSectionLabel="Human Review" />);

    expect(screen.getByText("Help")).toBeDefined();
    expect(screen.getByText("Understand what the tool is for and how Framing, Design and AI Build fit together.")).toBeDefined();
  });

  it("shows the intro help content and a return path to current work", async () => {
    render(
      await HelpPage({
        searchParams: Promise.resolve({
          returnTo: "/review"
        })
      })
    );

    expect(screen.getAllByRole("heading", { name: "What is this tool?" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Framing -> Delivery -> Feedback loop")).toBeDefined();
    expect(screen.getByText("Framing roundtrip")).toBeDefined();
    expect(screen.getByText("Story Idea content")).toBeDefined();
    expect(screen.getByText("Roundtrip in plain language")).toBeDefined();
    expect(screen.getByText("Outcome before output")).toBeDefined();
    expect(screen.getByText("It does not generate code.")).toBeDefined();
    expect(screen.getByText("AAS method deep dive")).toBeDefined();
    expect(screen.getByText("Choosing AD, AT or AM in Framing")).toBeDefined();
    expect(screen.getByText("Primary question in Framing")).toBeDefined();
    expect(screen.getByText("What should we build to create new value?")).toBeDefined();
    expect(screen.getByText("Failed transformation (expensive)")).toBeDefined();
    expect(screen.getByText("AI levels and human mandate")).toBeDefined();
    expect(screen.getByText("How this app is built")).toBeDefined();
    expect(screen.getByRole("link", { name: /Back to work/i }).getAttribute("href")).toBe("/review");
  });
});
