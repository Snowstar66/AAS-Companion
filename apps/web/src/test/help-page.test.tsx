import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HelpPage from "@/app/help/page";
import { HelpPageContent } from "@/components/help/help-page-content";
import { AppLanguageProvider } from "@/components/layout/app-language";
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
  usePathname: vi.fn(() => "/review")
}));

describe("Help page", () => {
  it("shows the global help entry in sidebar navigation", () => {
    render(
      <AppLanguageProvider>
        <Sidebar activeProjectName="AAS Demo Organization" activeSectionLabel="Human Review" />
      </AppLanguageProvider>
    );

    expect(screen.getByText("Help")).toBeDefined();
    expect(screen.getByText("Method guide, process flow, and key concepts.")).toBeDefined();
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
    expect(screen.getByText("AAS is NOT Waterfall")).toBeDefined();
    expect(screen.getByText("AAS - Frequently Asked Questions")).toBeDefined();
    expect(screen.getByText("Outcome before output")).toBeDefined();
    expect(screen.getByText("It does not generate code.")).toBeDefined();
    expect(screen.getByText("Waterfall vs AAS")).toBeDefined();
    expect(screen.getByText("1. Is AAS waterfall?")).toBeDefined();
    expect(screen.getByText("Choosing AD, AT or AM in Framing")).toBeDefined();
    expect(screen.getByText("Primary question in Framing")).toBeDefined();
    expect(screen.getByText("What should we build to create new value?")).toBeDefined();
    expect(screen.getByText("Failed transformation (expensive)")).toBeDefined();
    expect(screen.getByText("AI levels and human mandate")).toBeDefined();
    expect(screen.queryByText("Framing roundtrip")).toBeNull();
    expect(screen.queryByText("AAS method deep dive")).toBeNull();
    expect(screen.queryByText("How this app is built")).toBeNull();
    expect(screen.getByRole("link", { name: /Back to work/i }).getAttribute("href")).toBe("/review");
  });

  it("switches help language and remembers the selected language", async () => {
    cleanup();
    window.localStorage.clear();

    const { unmount } = render(
      <AppLanguageProvider>
        <HelpPageContent returnTo="/review" />
      </AppLanguageProvider>
    );

    expect(screen.getAllByRole("heading", { name: "What is this tool?" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /svenska/i }));

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: /Vad/i }).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/vattenfall/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Vanliga/i).length).toBeGreaterThan(0);
    expect(window.localStorage.getItem("aas-help-language")).toBe("sv");

    unmount();

    render(
      <AppLanguageProvider>
        <HelpPageContent returnTo="/review" />
      </AppLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: /Vad/i }).length).toBeGreaterThan(0);
    });
  });
});
