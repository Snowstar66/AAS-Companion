import { getHumanReviewSnapshot } from "@aas-companion/db";
import {
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

    for (const signoff of snapshot.signoffRecords) {
      if (!signoff.tollgateId) {
        continue;
      }

      const existing = signoffsByTollgateId.get(signoff.tollgateId) ?? [];
      existing.push(signoff);
      signoffsByTollgateId.set(signoff.tollgateId, existing);
    }

    const outcomeItems: HumanReviewDashboardItem[] = snapshot.outcomes.flatMap<HumanReviewDashboardItem>((outcome) => {
      const tollgate = tollgatesByEntityKey.get(`outcome:${outcome.id}:tg1_baseline`);

      if (!tollgate) {
        return [];
      }

      const profile = getTollgateDecisionProfile({
        tollgateType: "tg1_baseline",
        aiAccelerationLevel: outcome.aiAccelerationLevel
      });
      const signoffs = (tollgate.id ? signoffsByTollgateId.get(tollgate.id) ?? [] : []).map((record) => ({
        ...record,
        tollgateType: record.tollgateType ?? undefined,
        tollgateId: record.tollgateId ?? undefined,
        note: record.note ?? undefined,
        evidenceReference: record.evidenceReference ?? undefined,
        createdBy: record.createdBy ?? undefined
      }));
      const summary = summarizeTollgateFromSignoffs({
        blockers: tollgate.blockers,
        profile,
        ignoreBlockers: true,
        signoffs
      });

      if (summary.status === "approved") {
        return [];
      }

      const roleGap = getPendingRoleGap(summary.pendingRequirements, snapshot.partyRoleEntries);
      const blocker = tollgate.blockers[0] ?? roleGap ?? null;

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
          actionLabel: "Open Framing approval",
          href: `/framing?outcomeId=${outcome.id}#tollgate-review`,
          description:
            summary.status === "blocked"
              ? blocker ?? "A recorded approval requested changes before Tollgate 1 can be completed."
              : blocker
                ? `${summary.pendingRequirements.length} approval role${summary.pendingRequirements.length === 1 ? "" : "s"} still remain. Framing also has open recommendations.`
                : `${summary.pendingRequirements.length} approval role${summary.pendingRequirements.length === 1 ? "" : "s"} still remain before Tollgate 1 is approved.`,
          context: "Framing / Tollgate 1 approvals",
          blocker,
          pendingLaneCount: summary.pendingRequirements.length,
          updatedAt: tollgate.updatedAt
        }
      ];
    });

    const storyItems: HumanReviewDashboardItem[] = snapshot.stories.flatMap<HumanReviewDashboardItem>((story) => {
      const tollgate = tollgatesByEntityKey.get(`story:${story.id}:story_readiness`);

      if (!tollgate) {
        return [];
      }

      const profile = getTollgateDecisionProfile({
        tollgateType: "story_readiness",
        aiAccelerationLevel: story.aiAccelerationLevel
      });
      const signoffs = (tollgate.id ? signoffsByTollgateId.get(tollgate.id) ?? [] : []).map((record) => ({
        ...record,
        tollgateType: record.tollgateType ?? undefined,
        tollgateId: record.tollgateId ?? undefined,
        note: record.note ?? undefined,
        evidenceReference: record.evidenceReference ?? undefined,
        createdBy: record.createdBy ?? undefined
      }));
      const summary = summarizeTollgateFromSignoffs({
        blockers: tollgate.blockers,
        profile,
        signoffs
      });
      const context = `${story.outcome.key} / ${story.epic.key}`;

      if (summary.status === "approved" && story.status !== "in_progress") {
        return [
          {
            id: `handoff-${story.id}`,
            workflow: "delivery_start",
            entityType: "story",
            entityId: story.id,
            key: story.key,
            title: story.title,
            status: "approved",
            tone: "success",
            actionLabel: "Open delivery start",
            href: `/handoff/${story.id}`,
            description: "Delivery review is complete. Open the delivery start page to finalize the build package.",
            context,
            blocker: null,
            pendingLaneCount: 0,
            updatedAt: tollgate.updatedAt
          }
        ];
      }

      if (summary.status === "approved") {
        return [];
      }

      const roleGap = getPendingRoleGap(summary.pendingRequirements, snapshot.partyRoleEntries);
      const blocker = tollgate.blockers[0] ?? roleGap ?? null;

      return [
        {
          id: `story-${story.id}`,
          workflow: "story_review",
          entityType: "story",
          entityId: story.id,
          key: story.key,
          title: story.title,
          status: summary.status,
          tone: getTone(summary.status),
          actionLabel: "Open Delivery Story review",
          href: `/stories/${story.id}#story-signoff`,
          description:
            summary.status === "blocked"
              ? blocker ?? "Delivery review still has blockers before build can start."
              : `${summary.pendingRequirements.length} sign-off lane${summary.pendingRequirements.length === 1 ? "" : "s"} still remain before this Delivery Story is ready to start build.`,
          context,
          blocker,
          pendingLaneCount: summary.pendingRequirements.length,
          updatedAt: tollgate.updatedAt
        }
      ];
    });

    const items = [...outcomeItems, ...storyItems].sort((left, right) => {
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
        deliveryStartReady: items.filter((item) => item.workflow === "delivery_start").length,
        outcomeTollgates: items.filter((item) => item.workflow === "outcome_tollgate").length,
        storyReviews: items.filter((item) => item.workflow === "story_review").length
      }
    });
  }, `organizationId=${organizationId}`);
}
