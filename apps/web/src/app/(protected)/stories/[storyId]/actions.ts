"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveGovernedObjectService,
  hardDeleteGovernedObjectService,
  recordTollgateDecisionService,
  restoreGovernedObjectService,
  saveStoryWorkspaceService,
  submitStoryReadinessService,
  validateStoryExpectedBehaviorWithAiService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildStoryRedirect(storyId: string, search: Record<string, string>) {
  const params = new URLSearchParams(search);
  const query = params.toString();

  return `/stories/${storyId}${query ? `?${query}` : ""}`;
}

function requireExplicitConfirmation(formData: FormData) {
  return String(formData.get("confirmAction") ?? "") === "yes";
}

function parseDecisionKey(value: string) {
  if (value === "escalation") {
    return {
      decisionKind: "escalation" as const,
      requiredRoleType: String("delivery_lead"),
      organizationSide: String("supplier")
    };
  }

  const [decisionKind, requiredRoleType, organizationSide] = value.split("|");

  return {
    decisionKind: (decisionKind || "review") as "review" | "approval" | "escalation",
    requiredRoleType: requiredRoleType || "delivery_lead",
    organizationSide: organizationSide || "supplier"
  };
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

export type StoryExpectedBehaviorAiActionState =
  | {
      status: "success";
      field: "story_expected_behavior";
      verdict: "good" | "needs_revision" | "unclear";
      confidence: "high" | "medium" | "low";
      rationale: string;
      suggestedRewrite: string | null;
    }
  | {
      status: "error";
      field: "story_expected_behavior";
      error: string;
    };

export async function validateStoryExpectedBehaviorAiAction(
  formData: FormData
): Promise<StoryExpectedBehaviorAiActionState> {
  const session = await requireActiveProjectSession();
  const result = await validateStoryExpectedBehaviorWithAiService({
    organizationId: session.organization.organizationId,
    title: String(formData.get("title") ?? "") || null,
    valueIntent: String(formData.get("valueIntent") ?? "") || null,
    expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null,
    epicTitle: String(formData.get("epicTitle") ?? "") || null,
    epicPurpose: String(formData.get("epicPurpose") ?? "") || null,
    epicScopeBoundary: String(formData.get("epicScopeBoundary") ?? "") || null
  });

  if (!result.ok) {
    return {
      status: "error",
      field: "story_expected_behavior",
      error: result.errors[0]?.message ?? "AI validation failed."
    };
  }

  return {
    status: "success",
    field: result.data.field,
    verdict: result.data.verdict,
    confidence: result.data.confidence,
    rationale: result.data.rationale,
    suggestedRewrite: result.data.suggestedRewrite ?? null
  };
}

export async function saveStoryWorkspaceAction(formData: FormData) {
  const session = await requireActiveProjectSession();
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
    expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null,
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
  const session = await requireActiveProjectSession();
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

export async function recordStoryTollgateDecisionAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const storyId = String(formData.get("entityId") ?? formData.get("storyId") ?? "");
  const epicId = String(formData.get("epicId") ?? "");
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const parsedDecision = parseDecisionKey(String(formData.get("decisionKey") ?? "review|aqa|supplier"));
  const result = await recordTollgateDecisionService({
    organizationId: session.organization.organizationId,
    entityType: "story",
    entityId: storyId,
    tollgateType: "story_readiness",
    aiAccelerationLevel: String(formData.get("aiAccelerationLevel") ?? "level_2"),
    actorId: session.userId,
    actualPartyRoleEntryId: String(formData.get("actualPartyRoleEntryId") ?? ""),
    decisionKind: parsedDecision.decisionKind,
    requiredRoleType: parsedDecision.decisionKind === "escalation" ? String(formData.get("escalationRoleType") ?? parsedDecision.requiredRoleType) : parsedDecision.requiredRoleType,
    organizationSide: parsedDecision.decisionKind === "escalation" ? String(formData.get("escalationOrganizationSide") ?? parsedDecision.organizationSide) : parsedDecision.organizationSide,
    decisionStatus: String(formData.get("decisionStatus") ?? "approved"),
    note: String(formData.get("note") ?? "") || null,
    evidenceReference: String(formData.get("evidenceReference") ?? "") || null,
    createdBy: session.userId
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
    const errorCode = result.errors[0]?.code;
    redirect(
      buildStoryRedirect(storyId, {
        ready: errorCode === "duplicate_signoff" ? "duplicate" : "error",
        message: result.errors[0]?.message ?? "Tollgate decision could not be recorded."
      })
    );
  }

  redirect(
    buildStoryRedirect(storyId, {
      ready: result.data.status === "approved" ? "approved" : result.data.status === "blocked" ? "blocked" : "success"
    })
  );
}

export async function hardDeleteStoryAction(formData: FormData) {
  const session = await requireActiveProjectSession();
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
  const session = await requireActiveProjectSession();
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
  const session = await requireActiveProjectSession();
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
