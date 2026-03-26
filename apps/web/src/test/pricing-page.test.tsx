import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PricingPage from "@/app/(protected)/pricing/page";

const { getProjectPricingWorkspaceServiceMock } = vi.hoisted(() => ({
  getProjectPricingWorkspaceServiceMock: vi.fn()
}));

vi.mock("@/lib/auth/guards", () => ({
  requireOrganizationContext: vi.fn(async () => ({
    organizationId: "org-demo",
    organizationName: "Svamp1.0"
  }))
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/pricing")
}));

vi.mock("@aas-companion/api", async () => {
  const actual = await vi.importActual<object>("@aas-companion/api");

  return {
    ...actual,
    getProjectPricingWorkspaceService: getProjectPricingWorkspaceServiceMock
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Pricing page", () => {
  it("renders project-scoped pricing guidance with a highlighted recommendation", async () => {
    getProjectPricingWorkspaceServiceMock.mockResolvedValue({
      ok: true,
      data: {
        organizationId: "org-demo",
        selectedOutcome: {
          id: "outcome-1",
          key: "OUT-001",
          title: "Mushroom Find Journal",
          problemStatement: "People forget valuable mushroom spots.",
          outcomeStatement: "Make repeated foraging easier.",
          baselineDefinition: "Current rediscovery rate is low.",
          baselineSource: "User interviews",
          timeframe: "Spring release",
          aiAccelerationLevel: "level_2",
          riskProfile: "medium"
        },
        availableOutcomes: [
          {
            id: "outcome-1",
            key: "OUT-001",
            title: "Mushroom Find Journal",
            aiAccelerationLevel: "level_2"
          },
          {
            id: "outcome-2",
            key: "OUT-002",
            title: "Ops Dashboard",
            aiAccelerationLevel: "level_1"
          }
        ],
        summary: {
          outcomeCount: 2,
          epicCount: 2,
          storyCount: 6,
          importedLineageCount: 1
        },
        signals: {
          baseline: {
            value: "yes",
            detail: "Baseline definition and source are both present."
          },
          outcomeClarity: {
            value: "clear",
            detail: "Problem statement and outcome statement are both visible."
          },
          scopeStability: {
            value: "stable",
            detail: "Timeframe is visible and the current epics all carry explicit scope boundaries without open risk notes."
          },
          aiLevel: {
            value: "level_2",
            detail: "Current Framing branch is set to level 2."
          }
        },
        governance: {
          selectedAiLevel: "level_2",
          status: "supports_selected_level",
          summaryTitle: "Staffing supports selected AI level",
          summaryMessage: "Named staffing, role separation and agent supervision support level 2."
        },
        evaluation: {
          classification: {
            key: "existing_delivery",
            label: "Existing delivery",
            description: "The project looks like an improvement of an existing delivery context."
          },
          recommendation: {
            modelKey: "controlled_efficiency_share",
            label: "Controlled Efficiency Share",
            rationale: [
              "Baseline is present.",
              "Scope looks sufficiently bounded.",
              "AI level is level 2, which is compatible with a more performance-linked model."
            ]
          },
          readiness: {
            state: "ready",
            label: "Ready",
            description: "Framing and governance signals currently support a clear pricing recommendation."
          },
          blockers: [],
          risks: [],
          guardrails: [
            {
              key: "human_review",
              title: "Human Review stays separate",
              status: "attention",
              description: "Imported lineage is visible in this branch. Pricing does not replace the Human Review gate before promotion."
            },
            {
              key: "governance",
              title: "Governance validation stays separate",
              status: "covered",
              description: "Current governance coverage supports the selected AI level, but pricing is still only advisory."
            },
            {
              key: "value_spine",
              title: "Value Spine completeness stays separate",
              status: "covered",
              description: "The pricing view is anchored to an active branch, but promotion and build still depend on Value Spine and tollgate progression."
            }
          ],
          models: [
            {
              key: "controlled_efficiency_share",
              title: "Controlled Efficiency Share",
              tagline: "Best when a measurable baseline already exists.",
              whenToUse: "Use when measurable improvement work is visible.",
              strengths: ["Links price to measurable improvement."],
              risks: ["Needs stronger traceability."]
            },
            {
              key: "accelerated_build_contract",
              title: "Accelerated Build Contract",
              tagline: "Best for bounded new capability creation.",
              whenToUse: "Use when scope is bounded.",
              strengths: ["Clear build frame."],
              risks: ["Needs stable scope."]
            },
            {
              key: "structured_tm",
              title: "Structured T&M",
              tagline: "Fallback when certainty is lower.",
              whenToUse: "Use when framing is still maturing.",
              strengths: ["Handles uncertainty."],
              risks: ["Can hide weak framing if it stays too long."]
            }
          ]
        }
      }
    });

    render(await PricingPage({ searchParams: Promise.resolve({ outcomeId: "outcome-1" }) }));

    expect(screen.getByRole("heading", { name: "Pricing guidance", level: 1 })).toBeDefined();
    expect(screen.getByText("Pricing does not equal approval")).toBeDefined();
    expect(screen.getAllByText("Controlled Efficiency Share").length).toBeGreaterThan(0);
    expect(screen.getByText("Recommended")).toBeDefined();
    expect(screen.getByText("Process guardrails")).toBeDefined();
    expect(screen.getByText("Human Review stays separate")).toBeDefined();
    expect(screen.getAllByText("Pricing").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Open Governance/i })).toBeDefined();
  });

  it("stays usable even when no Framing branch exists yet", async () => {
    getProjectPricingWorkspaceServiceMock.mockResolvedValue({
      ok: true,
      data: {
        organizationId: "org-demo",
        selectedOutcome: null,
        availableOutcomes: [],
        summary: {
          outcomeCount: 0,
          epicCount: 0,
          storyCount: 0,
          importedLineageCount: 0
        },
        signals: {
          baseline: {
            value: "no",
            detail: "Baseline definition and source are not yet both visible."
          },
          outcomeClarity: {
            value: "unclear",
            detail: "The business problem and intended effect are not yet clear enough together."
          },
          scopeStability: {
            value: "unstable",
            detail: "Scope still looks unstable because timeframe, scope boundaries or risk notes are not yet clean."
          },
          aiLevel: {
            value: null,
            detail: "No active Framing branch is selected yet, so pricing falls back to a cautious posture."
          }
        },
        governance: {
          selectedAiLevel: "level_2",
          status: "needs_attention",
          summaryTitle: "Staffing still needs attention",
          summaryMessage: "The selected AI level has some coverage, but gaps still need to be closed."
        },
        evaluation: {
          classification: {
            key: "uncertain_fallback",
            label: "Uncertain / fallback",
            description: "The commercial shape should stay conservative."
          },
          recommendation: {
            modelKey: "structured_tm",
            label: "Structured T&M",
            rationale: ["Baseline is still missing.", "Scope still looks unstable."]
          },
          readiness: {
            state: "not_ready",
            label: "Not ready",
            description: "Pricing can be discussed, but AAS prerequisites still block commercial confidence."
          },
          blockers: [
            {
              key: "value_spine_missing",
              title: "No active Framing branch",
              description: "Pricing still needs an active Framing branch."
            }
          ],
          risks: [],
          guardrails: [],
          models: [
            {
              key: "structured_tm",
              title: "Structured T&M",
              tagline: "Fallback when certainty is lower.",
              whenToUse: "Use when framing is still maturing.",
              strengths: ["Handles uncertainty."],
              risks: ["Can hide weak framing if it stays too long."]
            }
          ]
        }
      }
    });

    render(await PricingPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("No active Framing branch yet")).toBeDefined();
    expect(screen.getAllByText("Structured T&M").length).toBeGreaterThan(0);
    expect(screen.getByText("No active Framing branch")).toBeDefined();
  });
});
