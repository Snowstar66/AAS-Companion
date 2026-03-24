"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCleanDraftOutcomeFromFramingService } from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { type CreateOutcomeActionState } from "@/lib/framing/create-outcome";

export async function createDraftOutcomeAction(
  previousState: CreateOutcomeActionState,
  formData: FormData
): Promise<CreateOutcomeActionState> {
  void previousState;
  void formData;
  const session = await requireActiveProjectSession();
  const result = await createCleanDraftOutcomeFromFramingService({
    organizationId: session.organization.organizationId,
    actorId: session.userId
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.errors[0]?.message ?? "Outcome could not be created."
    };
  }

  revalidatePath("/framing");
  revalidatePath("/");
  redirect(`/outcomes/${result.data.id}?created=1`);
}
