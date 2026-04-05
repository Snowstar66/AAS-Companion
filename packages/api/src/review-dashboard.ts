import { getHumanReviewSnapshot } from "@aas-companion/db";
import {
  getOutcomeFramingReadiness,
  getTollgateDecisionProfile,
  summarizeTollgateFromSignoffs,
  type SignoffDecisionRequirement
} from "@aas-companion/domain";
import { withDevTiming } from "./dev-timing";
import { failure, success } from "./shared";

type HumanReviewDashboardItem = {
  id: string;
  workflow: "outcome_tollgate" | "story_review" | "delivery_start";
  entityType: "outcome" | "story";
  entityId: string;
  key: string;
  title: string;
  status: "blocked" | "ready" | "approved";
  tone: "blocked" | "progress" | "success";
  actionLabel: string;
  href: string;
  description: string;
  context: string;
  blocker: string | null;
  pendingLaneCount: number;
  updatedAt: Date;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function normalizeAiUsageRole(value: string | null | undefined) {
  return value === "support" ||
    value === "generation" ||
    value === "validation" ||
    value === "decision_support" ||
    value === "automation"
    ? value
    : null;
}

function normalizeAiExecutionPattern(value: string | null | undefined) {
  return value === "assisted" || value === "step_by_step" || value === "orchestrated" ? value : null;
}

function getPendingRoleGap(
  pendingRequirements: SignoffDecisionRequirement[],
  partyRoleEntries: Array<{
    roleType: string;
    organizationSide: string;
    roleTitle: string;
  }>
) {
  for (const requirement of pendingRequirements) {
    const matchingPeople = partyRoleEntries.filter(
      (entry) => entry.roleType === requirement.roleType && entry.organizationSide === requirement.organizationSide
    );

    if (matchingPeople.length === 0) {
      return `${formatLabel(requirement.roleType)} is not assigned on the ${requirement.organizationSide} side.`;
    }
  }

  return null;
}

function getTone(status: "blocked" | "ready" | "approved") {
  if (status === "blocked") {
    return "blocked" as const;
  }

  if (status === "approved") {
    return "success" as const;
  }

  return "progress" as const;
}

function getRelevantOutcomeSignoffs<
  T extends {
    entityVersion?: number | null;
    id: string;
    organizationId: string;
    entityType: "outcome" | "story";
    entityId: string;
    createdAt: Date;
    organizationSide: "customer" | "supplier";
    decisionKind: "review" | "approval" | "escalation";
    requiredRoleType: string;
    actualPartyRoleEntryId: string;
    actualPersonName: string;
    actualPersonEmail: string;
    actualRoleTitle: string;
    decisionStatus: string;
    tollgateType?: string | null;
    tollgateId?: string | null;
    note?: string | null;
    evidenceReference?: string | null;
    createdBy?: string | null;
  }
>(
  signoffRecords: T[],
  submissionVersion?: number | null
) {
  if (!submissionVersion) {
    return [];
  }

  return signoffRecords.filter((record) => record.entityVersion === submissionVersion);
}

function getSortWeight(item: HumanReviewDashboardItem) {
  if (item.status === "blocked") {
    return 0;
  }

  if (item.status === "ready") {
    return 1;
  }

  return 2;
}

export async function getHumanReviewDashboardService(organizationId: string) {
  return withDevTiming("api.getHumanReviewDashboardService", async () => {
    const snapshot = await getHumanReviewSnapshot(organizationId);

    if (!snapshot) {
      return failure({
        code: "review_dashboard_unavailable",
        message: "Human Review could not load the current project context."
      });
    }

    const tollgatesByEntityKey = new Map<string, typeof snapshot.tollgates[number]>();

    for (const tollgate of snapshot.tollgates) {
      const key = `${tollgate.entityType}:${tollgate.entityId}:${tollgate.tollgateType}`;

      if (!tollgatesByEntityKey.has(key)) {
        tollgatesByEntityKey.set(key, tollgate);
      }
    }

    const signoffsByTollgateId = new Map<string, typeof snapshot.signoffRecords>();
    const signoffsByEntityId = new Map<string, typeof snapshot.signoffRecords>();

    for (const signoff of snapshot.signoffRecords) {
      const entityScoped = signoffsByEntityId.get(signoff.entityId) ?? [];
      entityScoped.push(signoff);
      signoffsByEntityId.set(signoff.entityId, entityScoped);

      if (!signoff.tollgateId) {
        continue;
      }

      const existing = signoffsByTollgateId.get(signoff.tollgateId) ?? [];
      existing.push(signoff);
      signoffsByTollgateId.set(signoff.tollgateId, existing);
    }

    const outcomeItems: HumanReviewDashboardItem[] = snapshot.outcomes.flatMap<HumanReviewDashboardItem>((outcome) => {
      const tollgate = tollgatesByEntityKey.get(`outcome:${outcome.id}:tg1_baseline`);
      const fallbackBlockers = getOutcomeFramingReadiness({
        title: outcome.title,
        outcomeStatement: outcome.outcomeStatement,
        baselineDefinition: outcome.baselineDefinition,
        valueOwnerId: outcome.valueOwnerId,
        riskProfile: outcome.riskProfile,
        aiAccelerationLevel: outcome.aiAccelerationLevel,
        status: outcome.status,
        aiUsageRole: normalizeAiUsageRole(outcome.aiUsageRole),
        aiExecutionPattern: normalizeAiExecutionPattern(outcome.aiExecutionPattern),
        aiUsageIntent: outcome.aiUsageIntent,
        businessImpactLevel: outcome.businessImpactLevel,
        businessImpactRationale: outcome.businessImpactRationale,
        dataSensitivityLevel: outcome.dataSensitivityLevel,
        dataSensitivityRationale: outcome.dataSensitivityRationale,
        blastRadiusLevel: outcome.blastRadiusLevel,
        blastRadiusRationale: outcome.blastRadiusRationale,
        decisionImpactLevel: outcome.decisionImpactLevel,
        decisionImpactRationale: outcome.decisionImpactRationale,
        aiLevelJustification: outcome.aiLevelJustification,
        riskAcceptedAt: null,
        riskAcceptedByValueOwnerId: null,
        epicCount: outcome._count.epics
      }).reasons.map((reason) => reason.message);
      const profile = getTollgateDecisionProfile({
        tollgateType: "tg1_baseline",
        aiAccelerationLevel: outcome.aiAccelerationLevel
      });
      const relevantSignoffs = getRelevantOutcomeSignoffs(
        tollgate?.id ? signoffsByTollgateId.get(tollgate.id) ?? [] : signoffsByEntityId.get(outcome.id) ?? [],
        tollgate?.submissionVersion ?? outcome.framingVersion
      );
      const signoffs = relevantSignoffs.map((record) => ({
        ...record,
        tollgateType: record.tollgateType ?? undefined,
        tollgateId: record.tollgateId ?? undefined,
        note: record.note ?? undefined,
        evidenceReference: record.evidenceReference ?? undefined,
        createdBy: record.createdBy ?? undefined
      }));
      const summary = summarizeTollgateFromSignoffs({
        blockers: tollgate?.blockers ?? fallbackBlockers,
        profile,
        ignoreBlockers: true,
        signoffs
      });

      if (summary.status === "approved") {
        return [];
      }

      const roleGap = getPendingRoleGap(summary.pendingRequirements, snapshot.partyRoleEntries);
      const blocker = tollgate?.blockers[0] ?? fallbackBlockers[0] ?? roleGap ?? null;

      return [
        {
          id: `outcome-${outcome.id}`,
          workflow: "outcome_tollgate",
          entityType: "outcome",
          entityId: outcome.id,
          key: outcome.key,
          title: outcome.title,
          status: summary.status,
          tone: getTone(summary.status),
          actionLabel: "Open approval workspace",
          href: `/review?reviewOutcomeId=${outcome.id}#approval-workspace`,
          description:
            summary.status === "blocked"
              ? blocker ?? "A recorded approval requested changes before Tollgate 1 can be completed."
              : blocker
                ? `${summary.pendingRequirements.length} approval role${summary.pendingRequirements.length === 1 ? "" : "s"} still remain. Framing also has open recommendations.`
                : `${summary.pendingRequirements.length} approval role${summary.pendingRequirements.length === 1 ? "" : "s"} still remain before Tollgate 1 is approved.`,
          context: "Framing / Tollgate 1 approvals",
          blocker,
          pendingLaneCount: summary.pendingRequirements.length,
          updatedAt: tollgate?.updatedAt ?? outcome.updatedAt
        }
      ];
    });

    const items = [...outcomeItems].sort((left, right) => {
      const weightDifference = getSortWeight(left) - getSortWeight(right);

      if (weightDifference !== 0) {
        return weightDifference;
      }

      return right.updatedAt.getTime() - left.updatedAt.getTime();
    });

    return success({
      organizationName: snapshot.organization.name,
      items,
      summary: {
        total: items.length,
        blocked: items.filter((item) => item.status === "blocked").length,
        inProgress: items.filter((item) => item.status === "ready").length,
        deliveryStartReady: 0,
        outcomeTollgates: items.filter((item) => item.workflow === "outcome_tollgate").length,
        storyReviews: 0
      }
    });
  }, `organizationId=${organizationId}`);
}
