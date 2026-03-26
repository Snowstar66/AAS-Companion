"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { markStoryHandoffCompleteService } from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildHandoffRedirect(storyId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/handoff/${storyId}${query ? `?${query}` : ""}`;
}

export async function markStoryHandoffCompleteAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const storyId = String(formData.get("storyId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await markStoryHandoffCompleteService({
    organizationId: session.organization.organizationId,
    storyId,
    actorId: session.userId
  });

  revalidatePath(`/handoff/${storyId}`);
  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/stories");
  revalidatePath("/workspace");
  revalidatePath("/");
  if (epicId) {
    revalidatePath(`/epics/${epicId}`);
  }
  if (outcomeId) {
    revalidatePath(`/outcomes/${outcomeId}`);
    revalidatePath("/framing");
  }

  if (!result.ok) {
    redirect(
      buildHandoffRedirect(storyId, {
        handoff: "error",
        message: result.errors[0]?.message ?? "Handoff completion could not be recorded."
      })
    );
  }

  redirect(
    buildHandoffRedirect(storyId, {
      handoff: result.data.alreadyCompleted ? "already" : "success"
    })
  );
}
