"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveGovernedObjectService,
  createDeliveryStoryFromDirectionSeedService,
  createNativeDirectionSeedFromEpicService,
  hardDeleteGovernedObjectService,
  restoreGovernedObjectService,
  saveDirectionSeedService,
  saveEpicWorkspaceService,
  validateDirectionSeedExpectedBehaviorWithAiService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import {
  revalidateFramingCockpitCache,
  revalidateOutcomeWorkspaceCache
} from "@/lib/cache/project-data";

function buildEpicRedirect(epicId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/epics/${epicId}${query ? `?${query}` : ""}`;
}

function requireExplicitConfirmation(formData: FormData) {
  return String(formData.get("confirmAction") ?? "") === "yes";
}

export type StoryExpectedBehaviorAiActionState =
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

export type DirectionSeedInlineSaveActionState =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function validateDirectionSeedExpectedBehaviorAiAction(
  formData: FormData
): Promise<StoryExpectedBehaviorAiActionState> {
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

export async function saveEpicWorkspaceAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await saveEpicWorkspaceService({
    organizationId: session.organization.organizationId,
    id: epicId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    scopeBoundary: String(formData.get("scopeBoundary") ?? "") || null,
    riskNote: String(formData.get("riskNote") ?? "") || null
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/epics/${epicId}`);
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildEpicRedirect(epicId, {
        save: "error",
        message: result.errors[0]?.message ?? "Epic could not be saved."
      })
    );
  }

  redirect(
    buildEpicRedirect(epicId, {
      save: "success"
    })
  );
}

export async function createDirectionSeedFromEpicAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await createNativeDirectionSeedFromEpicService({
    organizationId: session.organization.organizationId,
    epicId,
    actorId: session.userId
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/epics/${epicId}`);
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildEpicRedirect(epicId, {
        error: result.errors[0]?.message ?? "Direction seed could not be created."
      })
    );
  }

  redirect(
    buildEpicRedirect(epicId, {
      save: "success"
    }) + `#seed-${result.data.id}`
  );
}

export async function createDeliveryStoryFromDirectionSeedAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const seedId = String(formData.get("seedId") ?? "");
  const result = await createDeliveryStoryFromDirectionSeedService({
    organizationId: session.organization.organizationId,
    directionSeedId: seedId,
    actorId: session.userId
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidatePath(`/epics/${epicId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildEpicRedirect(epicId, {
        save: "error",
        message: result.errors[0]?.message ?? "Delivery Story could not be created."
      }) + `#seed-${seedId}`
    );
  }

  redirect(`/stories/${result.data.story.id}?created=1&createdAs=delivery`);
}

export async function saveDirectionSeedAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const seedId = String(formData.get("seedId") ?? "");

  const result = await saveDirectionSeedService({
    organizationId: session.organization.organizationId,
    id: seedId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/epics/${epicId}`);
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildEpicRedirect(epicId, {
        save: "error",
        message: result.errors[0]?.message ?? "Direction seed could not be saved."
      }) + `#seed-${seedId}`
    );
  }

  redirect(
    buildEpicRedirect(epicId, {
      save: "success"
    }) + `#seed-${seedId}`
  );
}

export async function saveDirectionSeedInlineAction(formData: FormData): Promise<DirectionSeedInlineSaveActionState> {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const seedId = String(formData.get("seedId") ?? "");

  const result = await saveDirectionSeedService({
    organizationId: session.organization.organizationId,
    id: seedId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/epics/${epicId}`);
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
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

export async function hardDeleteEpicAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildEpicRedirect(epicId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before hard delete."
      })
    );
  }

  const result = await hardDeleteGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "epic",
    entityId: epicId,
    actorId: session.userId
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildEpicRedirect(epicId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Epic could not be deleted."
      })
    );
  }

  redirect(`/outcomes/${outcomeId}`);
}

export async function archiveEpicAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const reason = String(formData.get("archiveReason") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildEpicRedirect(epicId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before archive."
      })
    );
  }

  const result = await archiveGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "epic",
    entityId: epicId,
    actorId: session.userId,
    reason
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/epics/${epicId}`);
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildEpicRedirect(epicId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Epic could not be archived."
      })
    );
  }

  redirect(
    buildEpicRedirect(epicId, {
      lifecycle: "archived"
    })
  );
}

export async function restoreEpicAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildEpicRedirect(epicId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before restore."
      })
    );
  }

  const result = await restoreGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "epic",
    entityId: epicId,
    actorId: session.userId
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/epics/${epicId}`);
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildEpicRedirect(epicId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Epic could not be restored."
      })
    );
  }

  redirect(
    buildEpicRedirect(epicId, {
      lifecycle: "restored"
    })
  );
}
