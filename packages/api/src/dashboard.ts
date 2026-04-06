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

export type HomeStoryIdeaStats = {
  total: number;
  started: number;
  framingReady: number;
};

export type HomeDeliveryStoryStats = {
  total: number;
  readyToStartBuild: number;
};

export type HomeDashboardData =
  | {
      state: "live";
      organizationName: string;
      projectPhase: HomeProjectPhase;
      storyIdeaStats: HomeStoryIdeaStats;
      deliveryStoryStats: HomeDeliveryStoryStats;
      topBlockers: HomeBlocker[];
      pendingActions: HomePendingAction[];
    }
  | {
      state: "empty" | "unavailable";
      organizationName: string;
      message: string;
      projectPhase: HomeProjectPhase;
      storyIdeaStats: HomeStoryIdeaStats;
      deliveryStoryStats: HomeDeliveryStoryStats;
      topBlockers: HomeBlocker[];
      pendingActions: HomePendingAction[];
    };

type AppLanguage = "en" | "sv";

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function formatTollgateLabel(value: string, language: AppLanguage) {
  switch (value) {
    case "tg1_baseline":
      return t(language, "tg1 baseline", "TG1-baseline");
    case "story_readiness":
      return t(language, "story readiness", "story readiness");
    default:
      return value.replaceAll("_", " ");
  }
}

function translateTollgateBlocker(blocker: string, language: AppLanguage) {
  const reframingMatch = blocker.match(
    /^Framing changed after version (\d+)\. Submit version (\d+) to Tollgate 1 for a new approval\.$/
  );

  if (reframingMatch) {
    return t(
      language,
      blocker,
      `Framing ändrades efter version ${reframingMatch[1]}. Skicka in version ${reframingMatch[2]} till Tollgate 1 för ett nytt godkännande.`
    );
  }

  return blocker;
}

function describeTollgateContext(
  input: {
    entityType: string;
    tollgateType: string;
  },
  language: AppLanguage
) {
  if (input.entityType === "outcome" && input.tollgateType === "tg1_baseline") {
    return t(
      language,
      "The active Framing needs an updated Tollgate 1 submission.",
      "Den aktiva framingen behöver en uppdaterad inlämning till Tollgate 1."
    );
  }

  if (input.entityType === "story" && input.tollgateType === "story_readiness") {
    return t(
      language,
      "A delivery story still needs readiness work before it can move forward.",
      "En leveransstory behöver fortfarande readiness-arbete innan den kan gå vidare."
    );
  }

  return t(
    language,
    `${formatTollgateLabel(input.tollgateType, language)} still needs attention.`,
    `${formatTollgateLabel(input.tollgateType, language)} kräver fortfarande uppmärksamhet.`
  );
}

function isStoryIdeaStarted(input: { valueIntent?: string | null; shortDescription?: string | null; expectedBehavior?: string | null }) {
  return Boolean(input.valueIntent?.trim() || input.shortDescription?.trim() || input.expectedBehavior?.trim());
}

function isStoryIdeaReady(input: { valueIntent?: string | null; shortDescription?: string | null; expectedBehavior?: string | null }) {
  return Boolean((input.valueIntent?.trim() || input.shortDescription?.trim()) && input.expectedBehavior?.trim());
}

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
  language: AppLanguage;
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
      nextStep: t(input.language, "Record remaining sign-offs", "Registrera återstående godkännanden"),
      needsAttention: true
    };
  }

  if (isReadyForHandoff) {
    return {
      blockers: [],
      isReadyForHandoff: true,
      nextStep: t(input.language, "Open ready story", "Öppna redo story"),
      needsAttention: false
    };
  }

  return {
    blockers,
    isReadyForHandoff: false,
    nextStep:
      !input.testDefinition?.trim()
        ? t(input.language, "Add test definition", "Lägg till testdefinition")
        : input.acceptanceCriteria.length === 0
          ? t(input.language, "Add acceptance criteria", "Lägg till acceptanskriterier")
          : input.definitionOfDone.length === 0
            ? t(input.language, "Add definition of done", "Lägg till definition of done")
            : isReviewReady
              ? t(input.language, "Submit for sign-off", "Skicka för godkännande")
              : blockers[0] ?? t(input.language, "Complete story readiness", "Slutför story readiness"),
    needsAttention: blockers.length > 0 || valueSpineBlockers.length > 0 || isReviewReady
  };
}

function createFallbackDashboard(
  state: "empty" | "unavailable",
  organizationName: string,
  message: string,
  language: AppLanguage
): HomeDashboardData {
  return {
    state,
    organizationName,
    message,
    projectPhase: {
      key: "framing",
      label: t(language, "Framing phase", "Framingfas"),
      detail: t(
        language,
        "The project stays in framing until Tollgate 1 for the framing brief is approved.",
        "Projektet stannar i framing tills Tollgate 1 för framing-briefen är godkänd."
      )
    },
    storyIdeaStats: {
      total: 0,
      started: 0,
      framingReady: 0
    },
    deliveryStoryStats: {
      total: 0,
      readyToStartBuild: 0
    },
    topBlockers: [],
    pendingActions: []
  };
}

export async function getHomeDashboardData(
  organizationId: string,
  language: AppLanguage = "en"
): Promise<HomeDashboardData> {
  try {
    const snapshot = await getHomeDashboardSnapshot(organizationId);

    if (!snapshot) {
      return createFallbackDashboard(
        "empty",
        t(language, "Unknown project", "Okänt projekt"),
        t(language, "No project data was found for this organization yet.", "Ingen projektdata hittades för den här organisationen ännu."),
        language
      );
    }

    const { organization } = snapshot;
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
        tollgateStatus: story.tollgateStatus ?? null,
        language
      })
    }));
    const explicitSourceStoryIds = new Set(snapshot.directionSeeds.map((seed) => seed.sourceStoryId).filter(Boolean));
    const legacyStoryIdeas = snapshot.stories.filter(
      (story) =>
        !story.sourceDirectionSeedId &&
        !explicitSourceStoryIds.has(story.id) &&
        (story.status === "draft" || story.status === "definition_blocked")
    );
    const storyIdeaStats: HomeStoryIdeaStats = {
      total: snapshot.directionSeeds.length + legacyStoryIdeas.length,
      started:
        snapshot.directionSeeds.filter((seed) =>
          isStoryIdeaStarted({
            shortDescription: seed.shortDescription,
            expectedBehavior: seed.expectedBehavior
          })
        ).length +
        legacyStoryIdeas.filter((story) =>
          isStoryIdeaStarted({
            valueIntent: story.valueIntent,
            expectedBehavior: story.expectedBehavior
          })
        ).length,
      framingReady:
        snapshot.directionSeeds.filter((seed) =>
          isStoryIdeaReady({
            shortDescription: seed.shortDescription,
            expectedBehavior: seed.expectedBehavior
          })
        ).length +
        legacyStoryIdeas.filter((story) =>
          isStoryIdeaReady({
            valueIntent: story.valueIntent,
            expectedBehavior: story.expectedBehavior
          })
        ).length
    };
    const deliveryStoryStats: HomeDeliveryStoryStats = {
      total: storyModels.length,
      readyToStartBuild: storyModels.filter(({ model }) => model.isReadyForHandoff).length
    };
    const hasApprovedFramingTollgate = snapshot.tollgates.some(
      (item) => item.entityType === "outcome" && item.tollgateType === "tg1_baseline" && item.status === "approved"
    );
    const projectPhase: HomeProjectPhase = hasApprovedFramingTollgate
      ? {
          key: "design",
          label: t(language, "Design phase", "Designfas"),
          detail: t(
            language,
            "At least one framing brief has passed Tollgate 1, so the project can now move into design work.",
            "Minst en framing-brief har passerat Tollgate 1, så projektet kan nu gå vidare in i designarbete."
          )
        }
      : {
          key: "framing",
          label: t(language, "Framing phase", "Framingfas"),
          detail: t(
            language,
            "The project remains in framing until a framing brief is approved at Tollgate 1.",
            "Projektet ligger kvar i framing tills en framing-brief har godkänts i Tollgate 1."
          )
        };

    const topBlockers: HomeBlocker[] = blockedTollgates.flatMap((tollgate) =>
      tollgate.blockers.map((blocker, index) => ({
        id: `${tollgate.id}-${index}`,
        title: translateTollgateBlocker(blocker, language),
        detail: describeTollgateContext(
          {
            entityType: tollgate.entityType,
            tollgateType: tollgate.tollgateType
          },
          language
        ),
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
        title: `${story.key} ${t(language, "needs attention", "behöver uppmärksamhet")}`,
        detail: blocker,
        severity: "medium",
        href: "/stories"
      }));
    });

    const pendingActions: HomePendingAction[] = [
      ...pendingTollgates.map((tollgate) => ({
        id: tollgate.id,
        title: `${formatTollgateLabel(tollgate.tollgateType, language)} ${t(language, "requires attention", "kräver uppmärksamhet")}`,
        detail:
          language === "sv"
            ? `${tollgate.blockers.length || 1} blockerare att rensa`
            : `${tollgate.blockers.length || 1} blocker${tollgate.blockers.length === 1 ? "" : "s"} to clear`,
        href: tollgate.entityType === "outcome" ? "/framing" : "/stories"
      })),
      ...storyModels
        .filter(({ story, model }) => !story.tollgateStatus && !model.isReadyForHandoff)
        .map(({ story, model }) => ({
          id: `${story.id}-action`,
          title: language === "sv" ? `Slutför ${story.key}` : `Complete ${story.key}`,
          detail: language === "sv" ? `Nästa steg: ${model.nextStep}` : `Next step: ${model.nextStep}`,
          href: "/stories"
        }))
    ];

    if (
      snapshot.outcomeStatuses.length === 0 &&
      snapshot.directionSeeds.length === 0 &&
      snapshot.stories.length === 0 &&
      snapshot.tollgates.length === 0
    ) {
      return {
        ...createFallbackDashboard(
          "empty",
          organization.name,
          t(language, "The dashboard is connected, but no M1 records were returned yet.", "Dashboarden är ansluten, men inga M1-poster har returnerats ännu."),
          language
        ),
        storyIdeaStats,
        deliveryStoryStats
      };
    }

    return {
      state: "live",
      organizationName: organization.name,
      projectPhase,
      storyIdeaStats,
      deliveryStoryStats,
      topBlockers: [...topBlockers, ...storyDefinitionBlockers],
      pendingActions
    };
  } catch (error) {
    return createFallbackDashboard(
      "unavailable",
      t(language, "Unknown project", "Okänt projekt"),
      error instanceof Error
        ? t(language, `Dashboard data is unavailable right now: ${error.message}`, `Dashboarddata är inte tillgänglig just nu: ${error.message}`)
        : t(language, "Dashboard data is unavailable right now.", "Dashboarddata är inte tillgänglig just nu."),
      language
    );
  }
}
