"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCleanDraftOutcomeFromFramingService } from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";
import { type CreateOutcomeActionState } from "@/lib/framing/create-outcome";

export async function createDraftOutcomeAction(
  _previousState: CreateOutcomeActionState,
  _formData: FormData
): Promise<CreateOutcomeActionState> {
  const session = await requireProtectedSession();
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
