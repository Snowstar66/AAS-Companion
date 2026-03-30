type DeliveryStoryLike = {
  id: string;
  sourceDirectionSeedId?: string | null | undefined;
  status?: string | null | undefined;
  acceptanceCriteria?: string[] | undefined;
  definitionOfDone?: string[] | undefined;
  testDefinition?: string | null | undefined;
  tollgateStatus?: "blocked" | "ready" | "approved" | null | undefined;
};

export type StoryIdeaDeliveryFeedbackStatus = "not_realized" | "stable" | "expanded" | "misaligned";

function isDeliveryCompletionStatus(status: string | null | undefined) {
  const normalized = status?.trim().toLowerCase();
  return normalized === "done" || normalized === "completed";
}

export function isLikelyDeliveryStory(
  story: DeliveryStoryLike,
  legacySourceStoryIds?: Iterable<string | null | undefined>
) {
  const legacySourceStoryIdSet = new Set(
    Array.from(legacySourceStoryIds ?? []).filter((value): value is string => Boolean(value))
  );

  if (legacySourceStoryIdSet.has(story.id)) {
    return false;
  }

  if (story.sourceDirectionSeedId) {
    return true;
  }

  if ((story.acceptanceCriteria?.length ?? 0) > 0) {
    return true;
  }

  if ((story.definitionOfDone?.length ?? 0) > 0) {
    return true;
  }

  if (story.testDefinition?.trim()) {
    return true;
  }

  if (story.status === "ready_for_handoff" || story.status === "in_progress") {
    return true;
  }

  return story.tollgateStatus === "ready" || story.tollgateStatus === "approved";
}

export function getStoryIdeaDeliveryFeedback(input: {
  seedId: string;
  stories: DeliveryStoryLike[];
  allSeedSourceStoryIds?: Array<string | null | undefined>;
  misaligned?: boolean;
}) {
  const legacySourceStoryIds = new Set((input.allSeedSourceStoryIds ?? []).filter((value): value is string => Boolean(value)));
  const derivedStories = input.stories.filter((story) => story.sourceDirectionSeedId === input.seedId);
  const additionalStories = input.stories.filter(
    (story) => !story.sourceDirectionSeedId && isLikelyDeliveryStory(story, legacySourceStoryIds)
  );
  const completedDeliveryStoryCount = derivedStories.filter((story) => isDeliveryCompletionStatus(story.status)).length;

  let status: StoryIdeaDeliveryFeedbackStatus;

  if (input.misaligned) {
    status = "misaligned";
  } else if (additionalStories.length > 0) {
    status = "expanded";
  } else if (derivedStories.length === 0) {
    status = "not_realized";
  } else {
    status = "stable";
  }

  return {
    status,
    deliveryStoryCount: derivedStories.length,
    completedDeliveryStoryCount,
    additionalStoryCount: additionalStories.length
  };
}

export function getStoryIdeaDeliveryFeedbackLabel(status: StoryIdeaDeliveryFeedbackStatus) {
  switch (status) {
    case "stable":
      return "Stable";
    case "expanded":
      return "Expanded";
    case "misaligned":
      return "Misaligned";
    default:
      return "Not Realized";
  }
}

export function getStoryIdeaDeliveryFeedbackSummary(input: {
  status: StoryIdeaDeliveryFeedbackStatus;
  deliveryStoryCount: number;
  additionalStoryCount: number;
}) {
  if (input.status === "misaligned") {
    return "Delivery has diverged from this Story Idea and needs human interpretation.";
  }

  if (input.status === "expanded") {
    return input.deliveryStoryCount > 0
      ? "Delivery has expanded beyond this Story Idea with additional stories in the same Epic."
      : "Delivery has started in this Epic without tracing back to this Story Idea.";
  }

  if (input.status === "stable") {
    return "Delivery is following this Story Idea without extra expansion in the same Epic.";
  }

  return "No traced Delivery Stories exist for this Story Idea yet.";
}
