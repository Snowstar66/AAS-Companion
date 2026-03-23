"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createOutcomeService } from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";
import {
  createDraftOutcomeSchema,
  type CreateOutcomeActionState
} from "@/lib/framing/create-outcome";

export async function createDraftOutcomeAction(
  _previousState: CreateOutcomeActionState,
  formData: FormData
): Promise<CreateOutcomeActionState> {
  const session = await requireProtectedSession();

  const parsed = createDraftOutcomeSchema.safeParse({
    key: formData.get("key"),
    title: formData.get("title")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Outcome input is invalid.",
      values: {
        key: String(formData.get("key") ?? ""),
        title: String(formData.get("title") ?? "")
      }
    };
  }

  const result = await createOutcomeService({
    organizationId: session.organization.organizationId,
    key: parsed.data.key,
    title: parsed.data.title,
    riskProfile: "medium",
    aiAccelerationLevel: "level_2",
    status: "draft",
    actorId: session.userId
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.errors[0]?.message ?? "Outcome could not be created.",
      values: parsed.data
    };
  }

  revalidatePath("/framing");
  revalidatePath("/");
  redirect(`/outcomes/${result.data.id}?created=1`);
}
