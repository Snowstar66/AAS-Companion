"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveOutcomeWorkspaceService, submitOutcomeTollgateService } from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";

function buildOutcomeRedirect(outcomeId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/outcomes/${outcomeId}${query ? `?${query}` : ""}`;
}

export async function saveOutcomeWorkspaceAction(formData: FormData) {
  const session = await requireProtectedSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");

  const result = await saveOutcomeWorkspaceService({
    organizationId: session.organization.organizationId,
    id: outcomeId,
    actorId: session.userId,
    title: String(formData.get("title") ?? ""),
    problemStatement: String(formData.get("problemStatement") ?? "") || null,
    outcomeStatement: String(formData.get("outcomeStatement") ?? "") || null,
    baselineDefinition: String(formData.get("baselineDefinition") ?? "") || null,
    baselineSource: String(formData.get("baselineSource") ?? "") || null,
    timeframe: String(formData.get("timeframe") ?? "") || null,
    riskProfile: (String(formData.get("riskProfile") ?? "medium") as "low" | "medium" | "high") ?? "medium"
  });

  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        save: "error",
        message: result.errors[0]?.message ?? "Outcome could not be saved."
      })
    );
  }

  redirect(
    buildOutcomeRedirect(outcomeId, {
      save: "success"
    })
  );
}

export async function submitOutcomeTollgateAction(formData: FormData) {
  const session = await requireProtectedSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const comments = String(formData.get("comments") ?? "") || null;
  const result = await submitOutcomeTollgateService({
    organizationId: session.organization.organizationId,
    outcomeId,
    actorId: session.userId,
    comments
  });

  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        submit: "error",
        message: result.errors[0]?.message ?? "Tollgate submission failed."
      })
    );
  }

  if (result.data.blockers.length > 0) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        submit: "blocked",
        blockers: result.data.blockers.join(" | ")
      })
    );
  }

  redirect(
    buildOutcomeRedirect(outcomeId, {
      submit: "ready"
    })
  );
}
