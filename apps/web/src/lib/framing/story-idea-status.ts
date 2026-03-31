type StoryIdeaStatusInput = {
  valueIntent?: string | null | undefined;
  shortDescription?: string | null | undefined;
  expectedBehavior?: string | null | undefined;
  hasEpicLink?: boolean | null | undefined;
  parentApproved?: boolean | null | undefined;
};

function normalize(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function getStoryIdeaIntentText(input: StoryIdeaStatusInput) {
  return normalize(input.valueIntent) || normalize(input.shortDescription);
}

export function isStoryIdeaStarted(input: StoryIdeaStatusInput) {
  return Boolean(getStoryIdeaIntentText(input) || normalize(input.expectedBehavior));
}

export function isStoryIdeaReadyForFraming(input: StoryIdeaStatusInput) {
  return Boolean(getStoryIdeaIntentText(input) && normalize(input.expectedBehavior));
}

export function getStoryIdeaBlockers(input: StoryIdeaStatusInput) {
  const blockers: string[] = [];

  if (input.hasEpicLink === false) {
    blockers.push("Story Idea is not linked to an Epic.");
  }

  if (!getStoryIdeaIntentText(input)) {
    blockers.push("Missing value intent.");
  }

  if (!normalize(input.expectedBehavior)) {
    blockers.push("Missing expected behavior.");
  }

  return blockers;
}

export function getStoryIdeaStatusText(input: StoryIdeaStatusInput) {
  const blockers = getStoryIdeaBlockers(input);

  if (blockers.length > 0) {
    return "Needs action";
  }

  if (input.parentApproved) {
    return "Approved";
  }

  return "Ready for review";
}
