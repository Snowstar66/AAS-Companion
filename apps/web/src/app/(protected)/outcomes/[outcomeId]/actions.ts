"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveGovernedObjectService,
  createNativeEpicFromOutcomeService,
  hardDeleteGovernedObjectService,
  restoreGovernedObjectService,
  saveOutcomeWorkspaceService,
  submitOutcomeTollgateService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildOutcomeRedirect(outcomeId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/outcomes/${outcomeId}${query ? `?${query}` : ""}`;
}

function requireExplicitConfirmation(formData: FormData) {
  return String(formData.get("confirmAction") ?? "") === "yes";
}

export async function saveOutcomeWorkspaceAction(formData: FormData) {
  const session = await requireActiveProjectSession();
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
  const session = await requireActiveProjectSession();
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

export async function createEpicFromOutcomeAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await createNativeEpicFromOutcomeService({
    organizationId: session.organization.organizationId,
    outcomeId,
    actorId: session.userId
  });

  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        save: "error",
        message: result.errors[0]?.message ?? "Epic could not be created."
      })
    );
  }

  redirect(`/epics/${result.data.id}?created=1`);
}

export async function hardDeleteOutcomeAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before hard delete."
      })
    );
  }

  const result = await hardDeleteGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "outcome",
    entityId: outcomeId,
    actorId: session.userId
  });

  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Outcome could not be deleted."
      })
    );
  }

  redirect("/framing");
}

export async function archiveOutcomeAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const reason = String(formData.get("archiveReason") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before archive."
      })
    );
  }

  const result = await archiveGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "outcome",
    entityId: outcomeId,
    actorId: session.userId,
    reason
  });

  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Outcome could not be archived."
      })
    );
  }

  redirect(
    buildOutcomeRedirect(outcomeId, {
      lifecycle: "archived"
    })
  );
}

export async function restoreOutcomeAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        lifecycle: "error",
        message: "Explicit confirmation is required before restore."
      })
    );
  }

  const result = await restoreGovernedObjectService({
    organizationId: session.organization.organizationId,
    entityType: "outcome",
    entityId: outcomeId,
    actorId: session.userId
  });

  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/stories");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildOutcomeRedirect(outcomeId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Outcome could not be restored."
      })
    );
  }

  redirect(
    buildOutcomeRedirect(outcomeId, {
      lifecycle: "restored"
    })
  );
}
