import { prisma } from "../client";

export async function getHumanReviewSnapshot(organizationId: string) {
  const [organization, outcomes, tollgates, signoffRecords, partyRoleEntries] = await prisma.$transaction([
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
        updatedAt: "desc"
      },
      select: {
        id: true,
        key: true,
        title: true,
        framingVersion: true,
        outcomeStatement: true,
        baselineDefinition: true,
        valueOwnerId: true,
        riskProfile: true,
        aiAccelerationLevel: true,
        aiUsageRole: true,
        aiExecutionPattern: true,
        aiUsageIntent: true,
        businessImpactLevel: true,
        businessImpactRationale: true,
        dataSensitivityLevel: true,
        dataSensitivityRationale: true,
        blastRadiusLevel: true,
        blastRadiusRationale: true,
        decisionImpactLevel: true,
        decisionImpactRationale: true,
        aiLevelJustification: true,
        status: true,
        updatedAt: true,
        _count: {
          select: {
            epics: {
              where: {
                lifecycleState: "active"
              }
            }
          }
        }
      }
    }),
    prisma.tollgate.findMany({
      where: {
        organizationId,
        entityType: "outcome",
        tollgateType: "tg1_baseline"
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
        submissionVersion: true,
        approvedVersion: true,
        blockers: true,
        comments: true,
        updatedAt: true
      }
    }),
    prisma.signoffRecord.findMany({
      where: {
        organizationId,
        entityType: "outcome"
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        organizationId: true,
        entityType: true,
        entityId: true,
        entityVersion: true,
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
    tollgates,
    signoffRecords,
    partyRoleEntries
  };
}
