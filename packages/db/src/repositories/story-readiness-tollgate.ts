export type StoryReadinessTollgateStatus = "blocked" | "ready" | "approved";

export function mapStoryReadinessTollgateStatusByEntityId(
  tollgates: Array<{
    entityId: string;
    status: StoryReadinessTollgateStatus;
  }>
) {
  const statuses = new Map<string, StoryReadinessTollgateStatus>();

  for (const tollgate of tollgates) {
    if (!statuses.has(tollgate.entityId)) {
      statuses.set(tollgate.entityId, tollgate.status);
    }
  }

  return statuses;
}

export function attachStoryReadinessTollgateStatus<T extends { id: string }>(
  stories: T[],
  statuses: Map<string, StoryReadinessTollgateStatus>
) {
  return stories.map((story) => ({
    ...story,
    tollgateStatus: statuses.get(story.id) ?? null
  }));
}
