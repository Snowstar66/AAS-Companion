import { prisma } from "../client";

export async function getHumanReviewSnapshot(organizationId: string) {
  const [organization, outcomes, stories, tollgates, signoffRecords, partyRoleEntries] = await prisma.$transaction([
    prisma.organization.findUnique({
      where: {
        id: organizationId
      },
      select: {
        id: true,
        name: true
      }
    }),
    prisma.outcome.findMany({
      where: {
        organizationId,
        lifecycleState: "active"
      },
      orderBy: {
        createdAt: "asc"
      },
      select: {
        id: true,
        key: true,
        title: true,
        aiAccelerationLevel: true,
        status: true
      }
    }),
    prisma.story.findMany({
      where: {
        organizationId,
        lifecycleState: "active"
      },
      orderBy: {
        createdAt: "asc"
      },
      select: {
        id: true,
        key: true,
        title: true,
        status: true,
        aiAccelerationLevel: true,
        outcomeId: true,
        epicId: true,
        outcome: {
          select: {
            key: true,
            title: true
          }
        },
        epic: {
          select: {
            key: true,
            title: true
          }
        }
      }
    }),
    prisma.tollgate.findMany({
      where: {
        organizationId,
        entityType: {
          in: ["outcome", "story"]
        },
        tollgateType: {
          in: ["tg1_baseline", "story_readiness"]
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        tollgateType: true,
        status: true,
        blockers: true,
        comments: true,
        updatedAt: true
      }
    }),
    prisma.signoffRecord.findMany({
      where: {
        organizationId,
        entityType: {
          in: ["outcome", "story"]
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        organizationId: true,
        entityType: true,
        entityId: true,
        tollgateId: true,
        tollgateType: true,
        decisionKind: true,
        requiredRoleType: true,
        actualPartyRoleEntryId: true,
        organizationSide: true,
        decisionStatus: true,
        actualPersonName: true,
        actualPersonEmail: true,
        actualRoleTitle: true,
        note: true,
        evidenceReference: true,
        createdBy: true,
        createdAt: true
      }
    }),
    prisma.partyRoleEntry.findMany({
      where: {
        organizationId,
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        roleType: true,
        organizationSide: true,
        roleTitle: true
      }
    })
  ]);

  if (!organization) {
    return null;
  }

  return {
    organization,
    outcomes,
    stories,
    tollgates,
    signoffRecords,
    partyRoleEntries
  };
}
