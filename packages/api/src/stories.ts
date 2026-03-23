import { createStory, getStoryById, listStories, updateStory } from "@aas-companion/db";
import { storyCreateInputSchema, storyUpdateInputSchema } from "@aas-companion/domain";
import { failure, success, type ApiResult } from "./shared";

export async function listStoriesService(organizationId: string): Promise<ApiResult<Awaited<ReturnType<typeof listStories>>>> {
  return success(await listStories(organizationId));
}

export async function getStoryService(
  organizationId: string,
  id: string
): Promise<ApiResult<Awaited<ReturnType<typeof getStoryById>>>> {
  return success(await getStoryById(organizationId, id));
}

export async function createStoryService(input: unknown) {
  const parsed = storyCreateInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_story",
      message: parsed.error.issues[0]?.message ?? "Story input is invalid."
    });
  }

  return success(await createStory(parsed.data));
}

export async function updateStoryService(input: unknown) {
  const parsed = storyUpdateInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_story_update",
      message: parsed.error.issues[0]?.message ?? "Story update input is invalid."
    });
  }

  return success(await updateStory(parsed.data));
}
