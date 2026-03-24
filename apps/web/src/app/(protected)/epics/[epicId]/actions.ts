"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveGovernedObjectService,
  createNativeStoryFromEpicService,
  hardDeleteGovernedObjectService,
  restoreGovernedObjectService,
  saveEpicWorkspaceService
} from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";

function buildEpicRedirect(epicId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/epics/${epicId}${query ? `?${query}` : ""}`;
}

function requireExplicitConfirmation(formData: FormData) {
  return String(formData.get("confirmAction") ?? "") === "yes";
}

export async function saveEpicWorkspaceAction(formData: FormData) {
  const session = await requireProtectedSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await saveEpicWorkspaceService({
    organizationId: session.organization.organizationId,
    id: epicId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    summary: String(formData.get("summary") ?? "") || null
  });

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

export async function createStoryFromEpicAction(formData: FormData) {
  const session = await requireProtectedSession();
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await createNativeStoryFromEpicService({
    organizationId: session.organization.organizationId,
    epicId,
    actorId: session.userId
  });

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
        error: result.errors[0]?.message ?? "Story could not be created."
      })
    );
  }

  redirect(`/stories/${result.data.id}?created=1`);
}

export async function hardDeleteEpicAction(formData: FormData) {
  const session = await requireProtectedSession();
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
  const session = await requireProtectedSession();
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
  const session = await requireProtectedSession();
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
