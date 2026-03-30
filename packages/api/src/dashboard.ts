import { getStoryHandoffReadiness, validateStoryAgainstValueSpine } from "@aas-companion/domain";
import { getHomeDashboardSnapshot } from "@aas-companion/db";

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

export type HomeProjectPhase = {
  key: "framing" | "design";
  label: string;
  detail: string;
};

export type HomeDashboardData =
  | {
      state: "live";
      organizationName: string;
      projectPhase: HomeProjectPhase;
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
      projectPhase: HomeProjectPhase;
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
  demo_seeded: "Demo project prepared",
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

function getDashboardStoryModel(input: {
  key: string;
  outcomeId: string;
  epicId: string;
  status: string;
  lifecycleState: string;
  testDefinition: string | null;
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  tollgateStatus?: "blocked" | "ready" | "approved" | null;
}) {
  const readiness = getStoryHandoffReadiness({
    key: input.key,
    outcomeId: input.outcomeId,
    epicId: input.epicId,
    testDefinition: input.testDefinition,
    definitionOfDone: input.definitionOfDone,
    acceptanceCriteria: input.acceptanceCriteria,
    status: input.status as "draft" | "definition_blocked" | "ready_for_handoff" | "in_progress"
  });
  const valueSpine = validateStoryAgainstValueSpine({
    outcomeId: input.outcomeId,
    epicId: input.epicId,
    testDefinition: input.testDefinition,
    acceptanceCriteria: input.acceptanceCriteria
  });

  const blockers = readiness.reasons.map((reason) => reason.message);
  const valueSpineBlockers = valueSpine.reasons.map((reason) => reason.message);
  const hasTollgateStatus =
    input.tollgateStatus === "blocked" || input.tollgateStatus === "ready" || input.tollgateStatus === "approved";
  const isReadyForHandoff = hasTollgateStatus ? input.tollgateStatus === "approved" : input.status === "ready_for_handoff";
  const isReviewReady = readiness.state === "ready" && !hasTollgateStatus && !isReadyForHandoff;

  if (input.tollgateStatus === "blocked" || input.tollgateStatus === "ready") {
    return {
      blockers,
      isReadyForHandoff: false,
      nextStep: "Record remaining sign-offs",
      needsAttention: true
    };
  }

  if (isReadyForHandoff) {
    return {
      blockers: [],
      isReadyForHandoff: true,
      nextStep: "Open ready story",
      needsAttention: false
    };
  }

  return {
    blockers,
    isReadyForHandoff: false,
    nextStep:
      !input.testDefinition?.trim()
        ? "Add test definition"
        : input.acceptanceCriteria.length === 0
          ? "Add acceptance criteria"
          : input.definitionOfDone.length === 0
            ? "Add definition of done"
            : isReviewReady
              ? "Submit for sign-off"
              : blockers[0] ?? "Complete story readiness",
    needsAttention: blockers.length > 0 || valueSpineBlockers.length > 0 || isReviewReady
  };
}

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
    projectPhase: {
      key: "framing",
      label: "Framing phase",
      detail: "The project stays in framing until Tollgate 1 for the framing brief is approved."
    },
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
  organizationId: string
): Promise<HomeDashboardData> {
  try {
    const snapshot = await getHomeDashboardSnapshot(organizationId);

    if (!snapshot) {
      return createFallbackDashboard(
        "empty",
        "Unknown project",
        "No project data was found for this organization yet."
      );
    }

    const { organization, counts } = snapshot;
    const blockedTollgates = snapshot.tollgates.filter((item) => item.status === "blocked");
    const pendingTollgates = snapshot.tollgates.filter((item) => item.status !== "approved");
    const storyModels = snapshot.stories.map((story) => ({
      story,
      model: getDashboardStoryModel({
        key: story.key,
        outcomeId: story.outcomeId,
        epicId: story.epicId,
        status: story.status,
        lifecycleState: story.lifecycleState,
        testDefinition: story.testDefinition,
        acceptanceCriteria: story.acceptanceCriteria,
        definitionOfDone: story.definitionOfDone,
        tollgateStatus: story.tollgateStatus ?? null
      })
    }));
    const hasApprovedFramingTollgate = snapshot.tollgates.some(
      (item) => item.entityType === "outcome" && item.tollgateType === "tg1_baseline" && item.status === "approved"
    );
    const projectPhase: HomeProjectPhase = hasApprovedFramingTollgate
      ? {
          key: "design",
          label: "Design phase",
          detail: "At least one framing brief has passed Tollgate 1, so the project can now move into design work."
        }
      : {
          key: "framing",
          label: "Framing phase",
          detail: "The project remains in framing until a framing brief is approved at Tollgate 1."
        };

    const outcomesByStatus = Object.entries(
      snapshot.outcomeStatuses.reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.status] = (accumulator[item.status] ?? 0) + 1;
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

    const storyDefinitionBlockers: HomeBlocker[] = storyModels.flatMap(({ story, model }) => {
      if (story.tollgateStatus) {
        return [];
      }

      return model.blockers.map((blocker) => ({
        id: `${story.id}-${blocker}`,
        title: `${story.key} needs attention`,
        detail: blocker,
        severity: "medium",
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
      ...storyModels
        .filter(({ story, model }) => !story.tollgateStatus && !model.isReadyForHandoff)
        .map(({ story, model }) => ({
          id: `${story.id}-action`,
          title: `Complete ${story.key}`,
          detail: `Next step: ${model.nextStep}`,
          href: "/stories"
        }))
    ];

    const recentActivity: HomeActivityItem[] = snapshot.activityEvents.map((event) => ({
      id: event.id,
      title: activityLabels[event.eventType] ?? event.eventType,
      detail: `${event.entityType} ${event.entityId}`,
      timestamp: formatDate(event.createdAt)
    }));

    const summary: HomeSummaryMetric[] = [
      {
        label: "Outcomes",
        value: String(snapshot.outcomeStatuses.length),
        tone: snapshot.outcomeStatuses.length > 0 ? "default" : "warning",
        description: "Active outcomes in the current project scope."
      },
      {
        label: "Stories Ready",
        value: String(storyModels.filter(({ model }) => model.isReadyForHandoff).length),
        tone: storyModels.some(({ model }) => model.isReadyForHandoff) ? "success" : "warning",
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

    if (snapshot.outcomeStatuses.length === 0 && snapshot.stories.length === 0 && counts.tollgates === 0 && counts.activityEvents === 0) {
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
      projectPhase,
      summary,
      outcomesByStatus,
      topBlockers: [...topBlockers, ...storyDefinitionBlockers],
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
      "Unknown project",
      error instanceof Error
        ? `Dashboard data is unavailable right now: ${error.message}`
        : "Dashboard data is unavailable right now."
    );
  }
}
