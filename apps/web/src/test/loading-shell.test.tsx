import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RootLoading from "@/app/loading";
import ProtectedLoading from "@/app/(protected)/loading";
import FramingLoading from "@/app/(protected)/framing/loading";

const { getLoadingProjectNameMock } = vi.hoisted(() => ({
  getLoadingProjectNameMock: vi.fn()
}));

vi.mock("@/lib/loading-project", () => ({
  getLoadingProjectName: getLoadingProjectNameMock
}));

vi.mock("@/components/layout/user-session-status", () => ({
  UserSessionStatus: () => null
}));

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
    }
  ]
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/framing")
}));

describe("project loading shells", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the active project visible in protected loading", async () => {
    getLoadingProjectNameMock.mockResolvedValue("Matraddaren");

    render(await ProtectedLoading());

    expect(screen.getByText("Current location")).toBeDefined();
    expect(screen.getByText("Matraddaren")).toBeDefined();
    expect(screen.queryByText("No project selected")).toBeNull();
  });

  it("keeps the active project visible in framing loading", async () => {
    getLoadingProjectNameMock.mockResolvedValue("Matraddaren");

    render(await FramingLoading());

    expect(screen.getByText("Matraddaren")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Framing" })).toBeDefined();
    expect(screen.queryByText("No project selected")).toBeNull();
  });

  it("keeps the active project visible in root loading", async () => {
    getLoadingProjectNameMock.mockResolvedValue("Matraddaren");

    render(await RootLoading());

    expect(screen.getByText("Matraddaren")).toBeDefined();
    expect(screen.queryByText("No project selected")).toBeNull();
  });
});
