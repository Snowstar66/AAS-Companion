import { DEMO_ORGANIZATION, getStoryHandoffReadiness } from "@aas-companion/domain";
import { getWorkspaceSnapshot } from "@aas-companion/db";

export type HomeSummaryMetric = {
  label: string;
  value: string;
  tone: "default" | "warning" | "success";
  description: string;
};

export type HomeOutcomeStatusStat = {
  status: string;
  count: number;
  label: string;
};

export type HomeBlocker = {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium";
  href?: string;
};

export type HomePendingAction = {
  id: string;
  title: string;
  detail: string;
  href?: string;
};

export type HomeActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

export type HomeDashboardData =
  | {
      state: "live";
      organizationName: string;
      summary: HomeSummaryMetric[];
      outcomesByStatus: HomeOutcomeStatusStat[];
      topBlockers: HomeBlocker[];
      pendingActions: HomePendingAction[];
      recentActivity: HomeActivityItem[];
      rightRail: {
        blockers: HomeBlocker[];
        nextActions: HomePendingAction[];
      };
    }
  | {
      state: "empty" | "unavailable";
      organizationName: string;
      message: string;
      summary: HomeSummaryMetric[];
      outcomesByStatus: HomeOutcomeStatusStat[];
      topBlockers: HomeBlocker[];
      pendingActions: HomePendingAction[];
      recentActivity: HomeActivityItem[];
      rightRail: {
        blockers: HomeBlocker[];
        nextActions: HomePendingAction[];
      };
    };

const outcomeStatusLabels: Record<string, string> = {
  draft: "Draft",
  baseline_in_progress: "Baseline In Progress",
  ready_for_tg1: "Ready For TG1",
  active: "Active"
};

const activityLabels: Record<string, string> = {
  demo_seeded: "Demo workspace seeded",
  outcome_created: "Outcome created",
  outcome_updated: "Outcome updated",
  epic_created: "Epic created",
  story_created: "Story created",
  story_updated: "Story updated",
  tollgate_recorded: "Tollgate updated",
  artifact_candidate_promoted: "Imported candidate promoted",
  imported_progression_blocked: "Imported build progression blocked",
  imported_progression_allowed: "Imported build progression allowed"
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function createFallbackDashboard(
  state: "empty" | "unavailable",
  organizationName: string,
  message: string
): HomeDashboardData {
  return {
    state,
    organizationName,
    message,
    summary: [],
    outcomesByStatus: [],
    topBlockers: [],
    pendingActions: [],
    recentActivity: [],
    rightRail: {
      blockers: [],
      nextActions: []
    }
  };
}

export async function getHomeDashboardData(
  organizationId: string = DEMO_ORGANIZATION.organizationId
): Promise<HomeDashboardData> {
  try {
    const snapshot = await getWorkspaceSnapshot(organizationId);

    if (!snapshot) {
      return createFallbackDashboard(
        "empty",
        DEMO_ORGANIZATION.organizationName,
        "No seeded dashboard data was found for this organization yet."
      );
    }

    const { organization, counts } = snapshot;
    const blockedTollgates = organization.tollgates.filter((item) => item.status === "blocked");
    const pendingTollgates = organization.tollgates.filter((item) => item.status !== "approved");

    const outcomesByStatus = Object.entries(
      organization.outcomes.reduce<Record<string, number>>((accumulator, outcome) => {
        accumulator[outcome.status] = (accumulator[outcome.status] ?? 0) + 1;
        return accumulator;
      }, {})
    ).map(([status, count]) => ({
      status,
      count,
      label: outcomeStatusLabels[status] ?? status
    }));

    const topBlockers: HomeBlocker[] = blockedTollgates.flatMap((tollgate) =>
      tollgate.blockers.map((blocker, index) => ({
        id: `${tollgate.id}-${index}`,
        title: blocker,
        detail: `${tollgate.tollgateType.replaceAll("_", " ")} on ${tollgate.entityType} ${tollgate.entityId}`,
        severity: "high",
        href: tollgate.entityType === "outcome" ? "/framing" : "/stories"
      }))
    );

    const storyDefinitionBlockers: HomeBlocker[] = organization.stories.flatMap((story) => {
      const readiness = getStoryHandoffReadiness(story);

      return readiness.reasons.map((reason) => ({
        id: `${story.id}-${reason.code}`,
        title: `${story.key} is blocked`,
        detail: reason.message,
        severity: reason.severity,
        href: "/stories"
      }));
    });

    const pendingActions: HomePendingAction[] = [
      ...pendingTollgates.map((tollgate) => ({
        id: tollgate.id,
        title: `${tollgate.tollgateType.replaceAll("_", " ")} requires attention`,
        detail: `${tollgate.blockers.length || 1} blocker${tollgate.blockers.length === 1 ? "" : "s"} to clear`,
        href: tollgate.entityType === "outcome" ? "/framing" : "/stories"
      })),
      ...organization.stories
        .filter((story) => getStoryHandoffReadiness(story).state !== "ready")
        .map((story) => ({
          id: `${story.id}-action`,
          title: `Complete ${story.key}`,
          detail:
            getStoryHandoffReadiness(story).reasons[0]?.message ?? "Story still needs readiness work before handoff.",
          href: "/stories"
        }))
    ].slice(0, 5);

    const recentActivity: HomeActivityItem[] = organization.activityEvents.map((event) => ({
      id: event.id,
      title: activityLabels[event.eventType] ?? event.eventType,
      detail: `${event.entityType} ${event.entityId}`,
      timestamp: formatDate(event.createdAt)
    }));

    const summary: HomeSummaryMetric[] = [
      {
        label: "Outcomes",
        value: String(counts.outcomes),
        tone: counts.outcomes > 0 ? "default" : "warning",
        description: "Tracked outcomes in the current organization scope."
      },
      {
        label: "Stories Ready",
        value: String(organization.stories.filter((story) => getStoryHandoffReadiness(story).state === "ready").length),
        tone: organization.stories.some((story) => getStoryHandoffReadiness(story).state === "ready") ? "success" : "warning",
        description: "Stories that can move toward execution handoff."
      },
      {
        label: "Blocked Items",
        value: String(topBlockers.length + storyDefinitionBlockers.length),
        tone: topBlockers.length + storyDefinitionBlockers.length > 0 ? "warning" : "success",
        description: "Tollgate blockers and story readiness gaps."
      },
      {
        label: "Recent Events",
        value: String(counts.activityEvents),
        tone: counts.activityEvents > 0 ? "default" : "warning",
        description: "Append-only activity entries available for review."
      }
    ];

    if (counts.outcomes === 0 && counts.stories === 0 && counts.tollgates === 0 && counts.activityEvents === 0) {
      return {
        ...createFallbackDashboard(
          "empty",
          organization.name,
          "The dashboard is connected, but no M1 records were returned yet."
        ),
        summary
      };
    }

    return {
      state: "live",
      organizationName: organization.name,
      summary,
      outcomesByStatus,
      topBlockers: [...topBlockers, ...storyDefinitionBlockers].slice(0, 5),
      pendingActions,
      recentActivity,
      rightRail: {
        blockers: [...topBlockers, ...storyDefinitionBlockers].slice(0, 3),
        nextActions: pendingActions.slice(0, 3)
      }
    };
  } catch (error) {
    return createFallbackDashboard(
      "unavailable",
      DEMO_ORGANIZATION.organizationName,
      error instanceof Error
        ? `Dashboard data is unavailable right now: ${error.message}`
        : "Dashboard data is unavailable right now."
    );
  }
}
