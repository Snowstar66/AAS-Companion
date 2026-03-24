import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GovernancePage from "@/app/(protected)/governance/page";

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
            supervisingPartyRoleId: "party-2",
            isActive: true,
            createdAt: new Date("2026-03-24T10:00:00.000Z"),
            updatedAt: new Date("2026-03-24T10:00:00.000Z"),
            supervisingPartyRole: {
              id: "party-2",
              fullName: "Demo Architect",
              isActive: true
            }
          }
        ],
        requirements: [],
        riskRules: [],
        sourceContext: {
          entityType: "story",
          entityId: "story-1",
          key: "M3-STORY-007",
          title: "Show governance readiness gaps",
          aiAccelerationLevel: "level_3"
        },
        selectedAiLevel: "level_3",
        readiness: {
          summaryStatus: "missing",
          coverage: [
            {
              aiAccelerationLevel: "level_3",
              organizationSide: "supplier",
              roleType: "ai_governance_lead",
              minimumCount: 1,
              matchedCount: 0,
              totalActiveRoleCount: 0,
              status: "missing",
              rationale: "Level 3 work requires a named AI governance lead.",
              message: "ai governance lead is missing for supplier coverage.",
              matchedPeople: []
            }
          ],
          riskFlags: []
        },
        authorityMatrix: [
          {
            responsibilityArea: "tollgate_approval",
            summaryLabel: "Tollgate approval",
            description: "Human authority required to move through formal tollgates.",
            customerAssignment: "approver",
            customerRoleTypes: ["customer_sponsor", "value_owner"],
            supplierAssignment: "reviewer",
            supplierRoleTypes: ["architect", "aqa"],
            aiGovernanceAssignment: "reviewer",
            aiGovernanceRoleTypes: ["ai_governance_lead"],
            customerAssignments: [],
            supplierAssignments: [
              {
                fullName: "Demo Architect"
              }
            ],
            aiGovernanceAssignments: [],
            isCovered: false
          }
        ],
        summaries: {
          activePeople: 2,
          customerPeople: 1,
          supplierPeople: 1,
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
  it("shows readiness gaps and linked source context for the active project", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          view: "readiness",
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getByRole("heading", { name: "Governance cockpit", level: 1 })).toBeDefined();
    expect(screen.getByText("Context linked from story M3-STORY-007")).toBeDefined();
    expect(screen.getByText("AI level readiness")).toBeDefined();
    expect(screen.getByText("ai governance lead is missing for supplier coverage.")).toBeDefined();
    expect(screen.getByText("No risky role combinations are currently detected for level 3.")).toBeDefined();
  });
});
