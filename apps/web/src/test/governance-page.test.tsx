import { fireEvent, render, screen } from "@testing-library/react";
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
        signoffRecords: [
          {
            id: "signoff-1",
            entityType: "story",
            entityId: "story-1",
            decisionKind: "approval",
            requiredRoleType: "delivery_lead",
            actualPersonName: "Demo Delivery Lead",
            actualRoleTitle: "Delivery Lead",
            organizationSide: "supplier",
            decisionStatus: "approved",
            note: "Ready to proceed.",
            evidenceReference: "demo://story-1/approval",
            createdAt: new Date("2026-03-24T12:00:00.000Z")
          }
        ],
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
          riskFlags: [],
          supervisionGaps: [],
          validation: {
            selectedAiLevel: "level_3",
            status: "does_not_support_selected_level",
            summaryTitle: "Staffing does not support selected AI level",
            summaryMessage: "Missing roles, risky combinations or weak supervision mean the current staffing does not yet support level 3.",
            staffingSupportsSelectedLevel: false,
            missingRoleCount: 1,
            riskyCombinationCount: 0,
            supervisionGapCount: 0,
            furtherGovernanceRequired: true,
            recommendations: [
              {
                kind: "assign_missing_role",
                priority: "high",
                title: "Assign supplier ai governance lead",
                description: "The selected AI level still needs a named supplier ai governance lead."
              },
              {
                kind: "keep_level_blocked",
                priority: "high",
                title: "Keep level_3 blocked for now",
                description: "Current staffing and separation do not yet justify a green light for this AI level."
              },
              {
                kind: "downgrade_ai_level",
                priority: "medium",
                title: "Consider downgrading to level_2",
                description: "Until the missing roles, risky combinations or supervision gaps are resolved, level 2 is the safer AAS-aligned fallback."
              }
            ]
          }
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
  it("shows compact grouped directory rows with progressive editing and identity markers", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          view: "directory",
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getByText("Customer")).toBeDefined();
    expect(screen.getByText("Supplier")).toBeDefined();
    expect(screen.getByText("Who is named in the human role model?")).toBeDefined();
    expect(
      screen.getByText(/Which named people are carrying the required roles on the customer and supplier sides\?/)
    ).toBeDefined();
    expect(screen.getByText("Demo Value Owner")).toBeDefined();
    expect(screen.getByText("Demo Architect")).toBeDefined();
    expect(screen.getAllByText("Add role").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("Demo Value Owner"));
    expect(screen.getByDisplayValue("Demo Value Owner")).toBeDefined();
    expect(screen.getByDisplayValue("Value Owner")).toBeDefined();
  });

  it("shows compact agent registry rows with expandable editing", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          view: "agents",
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getByText("Agent registry")).toBeDefined();
    expect(screen.getByText("Governance Review Agent")).toBeDefined();
    expect(screen.getByText("Supervisor: Demo Architect")).toBeDefined();

    fireEvent.click(screen.getByText("Governance Review Agent"));
    expect(screen.getByDisplayValue("Governance Review Agent")).toBeDefined();
    expect(screen.getByDisplayValue("Flags governance gaps.")).toBeDefined();
  });

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

    expect(screen.getAllByRole("heading", { name: "Governance cockpit", level: 1 }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Context linked from story M3-STORY-007").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Named people for required roles").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Separation of duties").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Human supervision of agents").length).toBeGreaterThan(0);
    expect(screen.getByText("What currently blocks this AI level from being governance-ready?")).toBeDefined();
    expect(
      screen.getAllByText("Higher AI acceleration raises the governance bar, even when the rest of the screen looks familiar.").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Level 3").length).toBeGreaterThan(0);
    expect(screen.getByText("AI level staffing validation")).toBeDefined();
    expect(screen.getByText("Staffing does not support selected AI level")).toBeDefined();
    expect(screen.getByText("ai governance lead is missing for supplier coverage.")).toBeDefined();
    expect(screen.getByText("Assign supplier ai governance lead")).toBeDefined();
    expect(screen.getByText("Staffing validation is distinct from final approval")).toBeDefined();
    expect(screen.getByText("No risky role combinations are currently detected for level 3.")).toBeDefined();
  });

  it("shows sign-off traceability with evidence references", async () => {
    render(
      await GovernancePage({
        searchParams: Promise.resolve({
          view: "signoffs",
          sourceEntity: "story",
          sourceId: "story-1",
          level: "level_3"
        })
      })
    );

    expect(screen.getByText("Sign-off traceability")).toBeDefined();
    expect(screen.getByText("Approval and review history")).toBeDefined();
    expect(screen.getByText("Signed by: Demo Delivery Lead (Delivery Lead)")).toBeDefined();
    expect(screen.getByText("Evidence: demo://story-1/approval")).toBeDefined();
  });
});
