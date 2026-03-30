type StoryIdeaStatusInput = {
  valueIntent?: string | null | undefined;
  shortDescription?: string | null | undefined;
  expectedBehavior?: string | null | undefined;
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

export function getStoryIdeaStatusText(input: StoryIdeaStatusInput) {
  if (isStoryIdeaReadyForFraming(input)) {
    return "Ready for framing";
  }

  if (isStoryIdeaStarted(input)) {
    return "In progress";
  }

  return "Not started";
}
