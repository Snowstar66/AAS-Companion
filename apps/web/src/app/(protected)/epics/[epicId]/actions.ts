"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNativeStoryFromEpicService } from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";

function buildEpicRedirect(epicId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/epics/${epicId}${query ? `?${query}` : ""}`;
}

export async function createStoryFromEpicAction(formData: FormData) {
  const session = await requireProtectedSession();
  const epicId = String(formData.get("epicId") ?? "");
  const result = await createNativeStoryFromEpicService({
    organizationId: session.organization.organizationId,
    epicId,
    actorId: session.userId
  });

  revalidatePath(`/epics/${epicId}`);
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
