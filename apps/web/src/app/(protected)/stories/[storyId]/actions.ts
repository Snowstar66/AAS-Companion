"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveGovernedObjectService,
  hardDeleteGovernedObjectService,
  restoreGovernedObjectService,
  saveStoryWorkspaceService,
  submitStoryReadinessService
} from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";

function buildStoryRedirect(storyId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/stories/${storyId}${query ? `?${query}` : ""}`;
}

function requireExplicitConfirmation(formData: FormData) {
  return String(formData.get("confirmAction") ?? "") === "yes";
}

function readMultilineValues(formData: FormData, fieldName: string) {
  return String(formData.get(fieldName) ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readCommaValues(formData: FormData, fieldName: string) {
  return String(formData.get(fieldName) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveStoryWorkspaceAction(formData: FormData) {
  const session = await requireProtectedSession();
  const storyId = String(formData.get("storyId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await saveStoryWorkspaceService({
    organizationId: session.organization.organizationId,
    id: storyId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    storyType: String(formData.get("storyType") ?? "outcome_delivery") as "outcome_delivery" | "governance" | "enablement",
    valueIntent: String(formData.get("valueIntent") ?? ""),
    acceptanceCriteria: readMultilineValues(formData, "acceptanceCriteria"),
    aiUsageScope: readCommaValues(formData, "aiUsageScope"),
    testDefinition: String(formData.get("testDefinition") ?? "") || null,
    definitionOfDone: readMultilineValues(formData, "definitionOfDone")
  });

  revalidatePath(`/stories/${storyId}`);
  if (epicId) {
    revalidatePath(`/epics/${epicId}`);
  }
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildStoryRedirect(storyId, {
        save: "error",
        message: result.errors[0]?.message ?? "Story could not be saved."
      })
    );
  }

  redirect(
    buildStoryRedirect(storyId, {
      save: "success"
    })
  );
}

export async function submitStoryReadinessAction(formData: FormData) {
  const session = await requireProtectedSession();
  const storyId = String(formData.get("storyId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const comments = String(formData.get("comments") ?? "") || null;
  const result = await submitStoryReadinessService({
    organizationId: session.organization.organizationId,
    storyId,
    actorId: session.userId,
    comments
  });

  revalidatePath(`/stories/${storyId}`);
  if (epicId) {
    revalidatePath(`/epics/${epicId}`);
  }
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildStoryRedirect(storyId, {
        ready: "error",
        message: result.errors[0]?.message ?? "Story readiness could not be recorded."
      })
    );
  }

  if (result.data.blockers.length > 0) {
    redirect(
      buildStoryRedirect(storyId, {
        ready: "blocked",
        blockers: result.data.blockers.join(" | ")
      })
    );
  }

  redirect(
    buildStoryRedirect(storyId, {
      ready: "success"
    })
  );
}

export async function hardDeleteStoryAction(formData: FormData) {
  const session = await requireProtectedSession();
  const storyId = String(formData.get("storyId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildStoryRedirect(storyId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before hard delete."
      })
    );
  }

  const result = await hardDeleteGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "story",
    entityId: storyId,
    actorId: session.userId
  });

  if (epicId) {
    revalidatePath(`/epics/${epicId}`);
  }
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildStoryRedirect(storyId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Story could not be deleted."
      })
    );
  }

  redirect(epicId ? `/epics/${epicId}` : outcomeId ? `/outcomes/${outcomeId}` : "/stories");
}

export async function archiveStoryAction(formData: FormData) {
  const session = await requireProtectedSession();
  const storyId = String(formData.get("storyId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const reason = String(formData.get("archiveReason") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildStoryRedirect(storyId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before archive."
      })
    );
  }

  const result = await archiveGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "story",
    entityId: storyId,
    actorId: session.userId,
    reason
  });

  revalidatePath(`/stories/${storyId}`);
  if (epicId) {
    revalidatePath(`/epics/${epicId}`);
  }
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildStoryRedirect(storyId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Story could not be archived."
      })
    );
  }

  redirect(
    buildStoryRedirect(storyId, {
      lifecycle: "archived"
    })
  );
}

export async function restoreStoryAction(formData: FormData) {
  const session = await requireProtectedSession();
  const storyId = String(formData.get("storyId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildStoryRedirect(storyId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before restore."
      })
    );
  }

  const result = await restoreGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "story",
    entityId: storyId,
    actorId: session.userId
  });

  revalidatePath(`/stories/${storyId}`);
  if (epicId) {
    revalidatePath(`/epics/${epicId}`);
  }
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildStoryRedirect(storyId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Story could not be restored."
      })
    );
  }

  redirect(
    buildStoryRedirect(storyId, {
      lifecycle: "restored"
    })
  );
}
