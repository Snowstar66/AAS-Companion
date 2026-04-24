import { beforeEach, describe, expect, it, vi } from "vitest";
import { recordTollgateDecisionService } from "@aas-companion/api";

const dbMocks = vi.hoisted(() => ({
  createSignoffRecord: vi.fn(),
  getPartyRoleEntryById: vi.fn(),
  getStoryById: vi.fn(),
  getTollgate: vi.fn(),
  listPartyRoleEntries: vi.fn(),
  listSignoffRecordsForEntity: vi.fn(),
  listSignoffRecordsForTollgate: vi.fn(),
  updateStory: vi.fn(),
  upsertTollgate: vi.fn()
}));

vi.mock("@aas-companion/db", () => dbMocks);

describe("recordTollgateDecisionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    dbMocks.getTollgate.mockResolvedValue({
      id: "tg-story-1",
      organizationId: "org-1",
      entityType: "story",
      entityId: "story-1",
      tollgateType: "story_readiness",
      status: "ready",
      blockers: [],
      approverRoles: ["delivery_lead"],
      decidedBy: null,
      decidedAt: null,
      comments: null
    });
    dbMocks.listPartyRoleEntries.mockResolvedValue([
      {
        id: "party-aqa",
        isActive: true,
        roleType: "aqa",
        organizationSide: "supplier",
        fullName: "AQA Reviewer",
        email: "aqa@example.com",
        roleTitle: "AQA"
      },
      {
        id: "party-dl",
        isActive: true,
        roleType: "delivery_lead",
        organizationSide: "supplier",
        fullName: "Delivery Lead",
        email: "delivery@example.com",
        roleTitle: "Delivery Lead"
      }
    ]);
    dbMocks.getPartyRoleEntryById.mockImplementation(async (_organizationId: string, id: string) =>
      [
        {
          id: "party-aqa",
          isActive: true,
          roleType: "aqa",
          organizationSide: "supplier",
          fullName: "AQA Reviewer",
          email: "aqa@example.com",
          roleTitle: "AQA"
        },
        {
          id: "party-dl",
          isActive: true,
          roleType: "delivery_lead",
          organizationSide: "supplier",
          fullName: "Delivery Lead",
          email: "delivery@example.com",
          roleTitle: "Delivery Lead"
        }
      ].find((person) => person.id === id) ?? null
    );
    dbMocks.upsertTollgate.mockImplementation(async (input) => ({
      id: "tg-story-1",
      ...input
    }));
    dbMocks.getStoryById.mockResolvedValue({
      id: "story-1",
      organizationId: "org-1",
      key: "STR-001",
      status: "definition_blocked"
    });
    dbMocks.updateStory.mockResolvedValue({
      id: "story-1",
      status: "ready_for_handoff"
    });
  });

  it("syncs story status to ready_for_handoff when required sign-offs approve the tollgate", async () => {
    dbMocks.createSignoffRecord.mockResolvedValue({
      id: "signoff-approval-1"
    });
    dbMocks.listSignoffRecordsForTollgate.mockResolvedValue([
      {
        id: "signoff-review-1",
        organizationId: "org-1",
        entityType: "story",
        entityId: "story-1",
        tollgateId: "tg-story-1",
        tollgateType: "story_readiness",
        decisionKind: "review",
        requiredRoleType: "aqa",
        organizationSide: "supplier",
        decisionStatus: "approved",
        actualPartyRoleEntryId: "party-aqa",
        actualPersonName: "AQA Reviewer",
        actualPersonEmail: "aqa@example.com",
        actualRoleTitle: "AQA",
        note: null,
        evidenceReference: null,
        createdBy: "user-1",
        createdAt: new Date("2026-03-25T08:00:00.000Z"),
        updatedAt: new Date("2026-03-25T08:00:00.000Z")
      },
      {
        id: "signoff-approval-1",
        organizationId: "org-1",
        entityType: "story",
        entityId: "story-1",
        tollgateId: "tg-story-1",
        tollgateType: "story_readiness",
        decisionKind: "approval",
        requiredRoleType: "delivery_lead",
        organizationSide: "supplier",
        decisionStatus: "approved",
        actualPartyRoleEntryId: "party-dl",
        actualPersonName: "Delivery Lead",
        actualPersonEmail: "delivery@example.com",
        actualRoleTitle: "Delivery Lead",
        note: null,
        evidenceReference: null,
        createdBy: "user-1",
        createdAt: new Date("2026-03-25T08:05:00.000Z"),
        updatedAt: new Date("2026-03-25T08:05:00.000Z")
      }
    ]);

    const result = await recordTollgateDecisionService({
      organizationId: "org-1",
      entityType: "story",
      entityId: "story-1",
      tollgateType: "story_readiness",
      aiAccelerationLevel: "level_2",
      actorId: "user-1",
      actualPartyRoleEntryId: "party-dl",
      decisionKind: "approval",
      requiredRoleType: "delivery_lead",
      organizationSide: "supplier",
      decisionStatus: "approved"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe("approved");
    }
    expect(dbMocks.updateStory).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        id: "story-1",
        status: "ready_for_handoff"
      })
    );
  });

  it("blocks duplicate approved sign-off records for the same tollgate lane", async () => {
    dbMocks.createSignoffRecord.mockRejectedValue(
      new Error("Delivery Lead has already recorded approved approval for delivery_lead on the supplier side.")
    );

    const result = await recordTollgateDecisionService({
      organizationId: "org-1",
      entityType: "story",
      entityId: "story-1",
      tollgateType: "story_readiness",
      aiAccelerationLevel: "level_2",
      actorId: "user-1",
      actualPartyRoleEntryId: "party-dl",
      decisionKind: "approval",
      requiredRoleType: "delivery_lead",
      organizationSide: "supplier",
      decisionStatus: "approved"
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.code).toBe("duplicate_signoff");
      expect(result.errors[0]?.message).toContain("already recorded approved approval");
    }
    expect(dbMocks.updateStory).not.toHaveBeenCalled();
  });
});
