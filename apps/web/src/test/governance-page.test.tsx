import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GovernancePage from "@/app/(protected)/governance/page";

const { cookiesMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(async () => ({
    get: vi.fn(() => undefined)
  }))
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock
}));

vi.mock("@/lib/auth/guards", () => ({
  requireOrganizationContext: vi.fn(async () => ({
    organizationId: "org_demo_control_plane",
    organizationName: "AAS Demo Organization"
  }))
}));

vi.mock("@aas-companion/api", async () => {
  const actual = await vi.importActual<object>("@aas-companion/api");

  return {
    ...actual,
    getGovernanceWorkspaceService: vi.fn(async () => ({
      ok: true,
      data: {
        people: [
          {
            id: "party-1",
            organizationId: "org_demo_control_plane",
            fullName: "Demo Value Owner",
            email: "value.owner@aas-companion.local",
            phoneNumber: null,
            avatarUrl: null,
            organizationSide: "customer",
            roleType: "value_owner",
            roleTitle: "Value Owner",
            mandateNotes: "Owns business value.",
            isActive: true,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
            updatedAt: new Date("2026-03-24T10:00:00.000Z")
          },
          {
            id: "party-2",
            organizationId: "org_demo_control_plane",
            fullName: "Demo Delivery Lead",
            email: "delivery.lead@aas-companion.local",
            phoneNumber: null,
            avatarUrl: null,
            organizationSide: "supplier",
            roleType: "delivery_lead",
            roleTitle: "Delivery Lead",
            mandateNotes: "Owns delivery coordination.",
            isActive: true,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
            updatedAt: new Date("2026-03-24T10:00:00.000Z")
          },
          {
            id: "party-3",
            organizationId: "org_demo_control_plane",
            fullName: "Demo Architect",
            email: "architect@aas-companion.local",
            phoneNumber: null,
            avatarUrl: null,
            organizationSide: "supplier",
            roleType: "architect",
            roleTitle: "Solution Architect",
            mandateNotes: "Owns architecture review.",
            isActive: true,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
            updatedAt: new Date("2026-03-24T10:00:00.000Z")
          }
        ],
        agents: [
          {
            id: "agent-1",
            organizationId: "org_demo_control_plane",
            agentName: "Governance Review Agent",
            agentType: "governance_agent",
            purpose: "Flags governance gaps.",
            scopeOfWork: "Review-only checks.",
            allowedArtifactTypes: ["story"],
            allowedActions: ["review"],
            supervisingPartyRoleId: "party-3",
            isActive: true,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
            updatedAt: new Date("2026-03-24T10:00:00.000Z"),
            supervisingPartyRole: {
              id: "party-3",
              fullName: "Demo Architect",
              roleType: "architect",
              isActive: true
            }
          }
        ],
        requirements: [],
        riskRules: [],
        signoffRecords: [],
        sourceContext: {
          entityType: "story",
          entityId: "story-1",
          key: "M3-STORY-007",
          title: "Show governance readiness gaps",
          aiAccelerationLevel: "level_3"
        },
        selectedAiLevel: "level_3",
        adaptive: {
          levelDefinition: {
            title: "Level 3 - Agentic",
            description: "High AI automation with explicit supervision and traceability."
          },
          cockpit: {
            selectedAiLevel: "level_3",
            readiness: "partial",
            readinessLabel: "Partial",
            readinessDetail: "Required roles are covered, but some governance warnings still need attention.",
            keyMissingItems: [
              "AI Governance Lead is recommended for level 3 but not yet named."
            ]
          },
          roleBuckets: [
            {
              category: "required",
              title: "Required",
              items: [
                {
                  roleType: "value_owner",
                  organizationSide: "customer",
                  category: "required",
                  label: "Value Owner",
                  assignedPeople: [{ id: "party-1", fullName: "Demo Value Owner", email: "value.owner@aas-companion.local", roleTitle: "Value Owner" }],
                  status: "covered"
                },
                {
                  roleType: "delivery_lead",
                  organizationSide: "supplier",
                  category: "required",
                  label: "Delivery Lead",
                  assignedPeople: [{ id: "party-2", fullName: "Demo Delivery Lead", email: "delivery.lead@aas-companion.local", roleTitle: "Delivery Lead" }],
                  status: "covered"
                }
              ]
            },
            {
              category: "recommended",
              title: "Recommended",
              items: [
                {
                  roleType: "ai_governance_lead",
                  organizationSide: "supplier",
                  category: "recommended",
                  label: "AI Governance Lead",
                  assignedPeople: [],
                  status: "warning"
                }
              ]
            },
            {
              category: "optional",
              title: "Optional",
              items: []
            }
          ],
          agentGuidance: {
            allowedAgents: [
              {
                label: "Agent workflows",
                purpose: "Coordinates multi-step governed AI work."
              }
            ],
            rules: [
              "Every active agent must be registered",
              "Each active agent needs a named supervisor"
            ]
          },
          readinessGaps: [
            {
              id: "recommended-role-supplier-ai_governance_lead",
              status: "warning",
              message: "AI Governance Lead is recommended for level 3 but not yet named.",
              guidance: "Add this role if you want clearer governance coverage.",
              targetSection: "human_roles"
            }
          ]
        },
        readiness: {
          summaryStatus: "partially_covered",
          coverage: [],
          riskFlags: [],
          supervisionGaps: [],
          validation: {
            selectedAiLevel: "level_3",
            status: "needs_attention",
            summaryTitle: "Staffing still needs attention",
            summaryMessage: "The selected AI level has some coverage, but gaps still need to be closed before trusting the staffing picture.",
            staffingSupportsSelectedLevel: false,
            missingRoleCount: 0,
            riskyCombinationCount: 0,
            supervisionGapCount: 0,
            furtherGovernanceRequired: true,
            recommendations: []
          }
        },
        authorityMatrix: [],
        summaries: {
          activePeople: 3,
          customerPeople: 1,
          supplierPeople: 2,
          activeAgents: 1,
          supervisedAgents: 1
        }
      }
    }))
  };
});

vi.mock("@/app/(protected)/governance/actions", () => ({
  createAgentRegistryEntryAction: vi.fn(),
  createPartyRoleEntryAction: vi.fn(),
  updateAgentRegistryEntryAction: vi.fn(),
  updatePartyRoleEntryAction: vi.fn()
}));

describe("Governance page", () => {
  it("localizes role titles and mandate notes when Swedish is selected", async () => {
    cookiesMock.mockResolvedValueOnce({
      get: vi.fn((name: string) => (name === "aas-app-language" ? { value: "sv" } : undefined))
    });

    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getAllByText("Värdeägare").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Leveransledare").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Lösningsarkitekt").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Äger affärsvärdet.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Äger leveranskoordineringen.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Äger arkitekturgranskningen.").length).toBeGreaterThan(0);
  });

  it("shows the simplified governance cockpit with level-aware summary and gaps", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getByRole("heading", { name: "Governance cockpit", level: 1 })).toBeDefined();
    expect(screen.getAllByText("Selected AI level").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 3 - Agentic").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Overall readiness").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Partial").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Key missing items").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AI Governance Lead is recommended for level 3 but not yet named.").length).toBeGreaterThan(0);
  });

  it("shows level-aware role categories and keeps directory editing available", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getAllByText("Human roles").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Required").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recommended").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Optional").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Value Owner").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Delivery Lead").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AI Governance Lead").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Party and role directory").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByText("Demo Value Owner")[0]!);
    expect(screen.getAllByDisplayValue("Demo Value Owner").length).toBeGreaterThan(0);
  });

  it("shows level-aware AI agent setup and supervisor visibility", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getAllByText("AI agent setup").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Allowed for this level").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Agent workflows").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Current setup").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Agent registry").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Governance Review Agent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Supervisor: Demo Architect").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByText("Governance Review Agent")[0]!);
    expect(screen.getAllByDisplayValue("Governance Review Agent").length).toBeGreaterThan(0);
  });

  it("shows plain-language readiness gaps with direct section links", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getAllByText("Readiness gaps").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Auto-generated, plain-language gaps for the currently selected AI level.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open relevant section").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Add this role if you want clearer governance coverage.").length).toBeGreaterThan(0);
  });
});
