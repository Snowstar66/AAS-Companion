"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveGovernedObjectService,
  createNativeEpicFromOutcomeService,
  hardDeleteGovernedObjectService,
  recordTollgateDecisionService,
  restoreGovernedObjectService,
  saveOutcomeWorkspaceService,
  submitOutcomeTollgateService,
  validateOutcomeFieldWithAiService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildFramingRedirect(outcomeId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  params.set("outcomeId", outcomeId);
  const query = params.toString();

  return `/framing${query ? `?${query}` : ""}`;
}

function buildOutcomeReturnRedirect(input: {
  outcomeId: string;
  returnPath?: string | null;
  search: Record<string, string>;
}) {
  const path = input.returnPath?.trim() || `/outcomes/${input.outcomeId}`;
  const params = new URLSearchParams(input.search);

  if (path === "/framing") {
    params.set("outcomeId", input.outcomeId);
  }

  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

function requireExplicitConfirmation(formData: FormData) {
  return String(formData.get("confirmAction") ?? "") === "yes";
}

function parseDecisionKey(value: string) {
  if (value === "escalation") {
    return {
      decisionKind: "escalation" as const,
      requiredRoleType: String("value_owner"),
      organizationSide: String("customer")
    };
  }

  const [decisionKind, requiredRoleType, organizationSide] = value.split("|");

  return {
    decisionKind: (decisionKind || "review") as "review" | "approval" | "escalation",
    requiredRoleType: requiredRoleType || "value_owner",
    organizationSide: organizationSide || "customer"
  };
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
    valueOwnerId: String(formData.get("valueOwnerId") ?? "") || null,
    riskProfile: (String(formData.get("riskProfile") ?? "medium") as "low" | "medium" | "high") ?? "medium",
    aiAccelerationLevel:
      (String(formData.get("aiAccelerationLevel") ?? "level_2") as "level_1" | "level_2" | "level_3") ?? "level_2"
  });

  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildFramingRedirect(outcomeId, {
        save: "error",
        message: result.errors[0]?.message ?? "Outcome could not be saved."
      })
    );
  }

  redirect(
    buildFramingRedirect(outcomeId, {
      save: "success"
    })
  );
}

async function validateOutcomeFieldAiAction(
  formData: FormData,
  field: "outcome_statement" | "baseline_definition"
) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "") || null;
  const result = await validateOutcomeFieldWithAiService({
    organizationId: session.organization.organizationId,
    field,
    title: String(formData.get("title") ?? "") || null,
    problemStatement: String(formData.get("problemStatement") ?? "") || null,
    outcomeStatement: String(formData.get("outcomeStatement") ?? "") || null,
    baselineDefinition: String(formData.get("baselineDefinition") ?? "") || null,
    baselineSource: String(formData.get("baselineSource") ?? "") || null,
    timeframe: String(formData.get("timeframe") ?? "") || null
  });

  if (!result.ok) {
    redirect(
      buildOutcomeReturnRedirect({
        outcomeId,
        returnPath,
        search: {
          aiField: field,
          aiError: result.errors[0]?.message ?? "AI validation failed."
        }
      })
    );
  }

  redirect(
    buildOutcomeReturnRedirect({
      outcomeId,
      returnPath,
      search: {
        aiField: result.data.field,
        aiVerdict: result.data.verdict,
        aiConfidence: result.data.confidence,
        aiReason: result.data.rationale,
        aiSuggestion: result.data.suggestedRewrite ?? ""
      }
    })
  );
}

export async function validateOutcomeStatementAiAction(formData: FormData) {
  return validateOutcomeFieldAiAction(formData, "outcome_statement");
}

export async function validateBaselineDefinitionAiAction(formData: FormData) {
  return validateOutcomeFieldAiAction(formData, "baseline_definition");
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
      buildFramingRedirect(outcomeId, {
        submit: "error",
        message: result.errors[0]?.message ?? "Tollgate submission failed."
      })
    );
  }

  if (result.data.blockers.length > 0) {
    redirect(
      buildFramingRedirect(outcomeId, {
        submit: "blocked",
        blockers: result.data.blockers.join(" | ")
      })
    );
  }

  redirect(
    buildFramingRedirect(outcomeId, {
      submit: "ready"
    })
  );
}

export async function recordOutcomeTollgateDecisionAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("entityId") ?? formData.get("outcomeId") ?? "");
  const parsedDecision = parseDecisionKey(String(formData.get("decisionKey") ?? "review|architect|supplier"));
  const actualPartyRoleEntryId = String(formData.get("actualPartyRoleEntryId") ?? "");
  const evidenceReference = String(formData.get("evidenceReference") ?? "") || null;
  const note = String(formData.get("note") ?? "") || null;
  const result = await recordTollgateDecisionService({
    organizationId: session.organization.organizationId,
    entityType: "outcome",
    entityId: outcomeId,
    tollgateType: "tg1_baseline",
    aiAccelerationLevel: String(formData.get("aiAccelerationLevel") ?? "level_2"),
    actorId: session.userId,
    actualPartyRoleEntryId,
    decisionKind: parsedDecision.decisionKind,
    requiredRoleType: parsedDecision.decisionKind === "escalation" ? String(formData.get("escalationRoleType") ?? parsedDecision.requiredRoleType) : parsedDecision.requiredRoleType,
    organizationSide: parsedDecision.decisionKind === "escalation" ? String(formData.get("escalationOrganizationSide") ?? parsedDecision.organizationSide) : parsedDecision.organizationSide,
    decisionStatus: String(formData.get("decisionStatus") ?? "approved"),
    note,
    evidenceReference,
    createdBy: session.userId
  });

  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildFramingRedirect(outcomeId, {
        submit: "error",
        message: result.errors[0]?.message ?? "Tollgate decision could not be recorded."
      })
    );
  }

  redirect(
    buildFramingRedirect(outcomeId, {
      submit: result.data.status === "approved" ? "approved" : result.data.status === "blocked" ? "blocked" : "ready"
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
      buildFramingRedirect(outcomeId, {
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
      buildFramingRedirect(outcomeId, {
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
      buildFramingRedirect(outcomeId, {
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
      buildFramingRedirect(outcomeId, {
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
      buildFramingRedirect(outcomeId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Outcome could not be archived."
      })
    );
  }

  redirect(
    buildFramingRedirect(outcomeId, {
      lifecycle: "archived"
    })
  );
}

export async function restoreOutcomeAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");

  if (!requireExplicitConfirmation(formData)) {
    redirect(
      buildFramingRedirect(outcomeId, {
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
      buildFramingRedirect(outcomeId, {
        lifecycle: "error",
        message: result.errors[0]?.message ?? "Outcome could not be restored."
      })
    );
  }

  redirect(
    buildFramingRedirect(outcomeId, {
      lifecycle: "restored"
    })
  );
}
