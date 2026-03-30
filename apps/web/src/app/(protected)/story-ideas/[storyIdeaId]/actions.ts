"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDeliveryStoryFromDirectionSeedService,
  saveDirectionSeedService,
  validateDirectionSeedExpectedBehaviorWithAiService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildStoryIdeaRedirect(storyIdeaId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/story-ideas/${storyIdeaId}${query ? `?${query}` : ""}`;
}

export type StoryIdeaSeedExpectedBehaviorAiActionState =
  | {
      status: "success";
      field: "story_expected_behavior";
      verdict: "good" | "needs_revision" | "unclear";
      confidence: "high" | "medium" | "low";
      rationale: string;
      suggestedRewrite: string | null;
    }
  | {
      status: "error";
      field: "story_expected_behavior";
      error: string;
    };

export type StoryIdeaSeedInlineSaveActionState =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function validateStoryIdeaSeedExpectedBehaviorAiAction(
  formData: FormData
): Promise<StoryIdeaSeedExpectedBehaviorAiActionState> {
  const session = await requireActiveProjectSession();
  const result = await validateDirectionSeedExpectedBehaviorWithAiService({
    organizationId: session.organization.organizationId,
    title: String(formData.get("title") ?? "") || null,
    shortDescription: String(formData.get("shortDescription") ?? "") || null,
    expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null,
    epicTitle: String(formData.get("epicTitle") ?? "") || null,
    epicPurpose: String(formData.get("epicPurpose") ?? "") || null,
    epicScopeBoundary: String(formData.get("epicScopeBoundary") ?? "") || null
  });

  if (!result.ok) {
    return {
      status: "error",
      field: "story_expected_behavior",
      error: result.errors[0]?.message ?? "AI validation failed."
    };
  }

  return {
    status: "success",
    field: result.data.field,
    verdict: result.data.verdict,
    confidence: result.data.confidence,
    rationale: result.data.rationale,
    suggestedRewrite: result.data.suggestedRewrite ?? null
  };
}

export async function saveStoryIdeaSeedWorkspaceAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const storyIdeaId = String(formData.get("storyIdeaId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");

  const result = await saveDirectionSeedService({
    organizationId: session.organization.organizationId,
    id: storyIdeaId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null
  });

  revalidatePath(`/story-ideas/${storyIdeaId}`);
  revalidatePath(`/epics/${epicId}`);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildStoryIdeaRedirect(storyIdeaId, {
        save: "error",
        message: result.errors[0]?.message ?? "Story Idea could not be saved."
      })
    );
  }

  redirect(
    buildStoryIdeaRedirect(storyIdeaId, {
      save: "success"
    })
  );
}

export async function saveStoryIdeaSeedWorkspaceInlineAction(
  formData: FormData
): Promise<StoryIdeaSeedInlineSaveActionState> {
  const session = await requireActiveProjectSession();
  const storyIdeaId = String(formData.get("storyIdeaId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");

  const result = await saveDirectionSeedService({
    organizationId: session.organization.organizationId,
    id: storyIdeaId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null
  });

  revalidatePath(`/story-ideas/${storyIdeaId}`);
  revalidatePath(`/epics/${epicId}`);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    return {
      status: "error",
      message: result.errors[0]?.message ?? "Story Idea could not be saved."
    };
  }

  return {
    status: "success",
    message: "Suggestion saved to the Story Idea."
  };
}

export async function createDeliveryStoryFromStoryIdeaSeedAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const storyIdeaId = String(formData.get("storyIdeaId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");

  const result = await createDeliveryStoryFromDirectionSeedService({
    organizationId: session.organization.organizationId,
    directionSeedId: storyIdeaId,
    actorId: session.userId
  });

  revalidatePath(`/story-ideas/${storyIdeaId}`);
  revalidatePath(`/epics/${epicId}`);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildStoryIdeaRedirect(storyIdeaId, {
        save: "error",
        message: result.errors[0]?.message ?? "Delivery Story could not be created."
      })
    );
  }

  redirect(`/stories/${result.data.story.id}?created=1&createdAs=delivery`);
}
