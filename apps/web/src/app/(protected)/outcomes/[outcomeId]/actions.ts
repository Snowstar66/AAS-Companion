"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveGovernedObjectService,
  createNativeEpicFromOutcomeService,
  createNativeDirectionSeedFromEpicService,
  hardDeleteGovernedObjectService,
  recordTollgateDecisionService,
  reviewOutcomeFramingWithAiService,
  restoreGovernedObjectService,
  saveOutcomeWorkspaceService,
  submitOutcomeTollgateService,
  validateOutcomeFieldWithAiService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import {
  revalidateFramingCockpitCache,
  revalidateOutcomeTollgateReviewCache,
  revalidateOutcomeWorkspaceCache
} from "@/lib/cache/project-data";

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

function copyIfPresent(target: Record<string, string>, key: string, value: FormDataEntryValue | null) {
  if (typeof value === "string" && value.trim()) {
    target[key] = value;
  }
}

function requireExplicitConfirmation(formData: FormData) {
  return String(formData.get("confirmAction") ?? "") === "yes";
}

function parseOptionalRiskLevel(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "");
  return value === "low" || value === "medium" || value === "high" ? value : null;
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
    solutionContext: String(formData.get("solutionContext") ?? "") || null,
    solutionConstraints: String(formData.get("solutionConstraints") ?? "") || null,
    dataSensitivity: String(formData.get("dataSensitivity") ?? "") || null,
    deliveryType: (String(formData.get("deliveryType") ?? "") as "AD" | "AT" | "AM") || null,
    aiUsageRole: null,
    aiExecutionPattern:
      (String(formData.get("aiExecutionPattern") ?? "") as "assisted" | "step_by_step" | "orchestrated") || null,
    aiUsageIntent: String(formData.get("aiUsageIntent") ?? "") || null,
    businessImpactLevel: parseOptionalRiskLevel(formData, "businessImpactLevel"),
    businessImpactRationale: String(formData.get("businessImpactRationale") ?? "") || null,
    dataSensitivityLevel: parseOptionalRiskLevel(formData, "dataSensitivityLevel"),
    dataSensitivityRationale: String(formData.get("dataSensitivityRationale") ?? "") || null,
    blastRadiusLevel: parseOptionalRiskLevel(formData, "blastRadiusLevel"),
    blastRadiusRationale: String(formData.get("blastRadiusRationale") ?? "") || null,
    decisionImpactLevel: parseOptionalRiskLevel(formData, "decisionImpactLevel"),
    decisionImpactRationale: String(formData.get("decisionImpactRationale") ?? "") || null,
    aiLevelJustification: String(formData.get("aiLevelJustification") ?? "") || null,
    timeframe: String(formData.get("timeframe") ?? "") || null,
    valueOwnerId: String(formData.get("valueOwnerId") ?? "") || null,
    riskProfile: (String(formData.get("riskProfile") ?? "medium") as "low" | "medium" | "high") ?? "medium",
    aiAccelerationLevel:
      (String(formData.get("aiAccelerationLevel") ?? "level_2") as "level_1" | "level_2" | "level_3") ?? "level_2"
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
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

export type OutcomeInlineSaveActionState =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function saveOutcomeWorkspaceInlineAction(formData: FormData): Promise<OutcomeInlineSaveActionState> {
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
    solutionContext: String(formData.get("solutionContext") ?? "") || null,
    solutionConstraints: String(formData.get("solutionConstraints") ?? "") || null,
    dataSensitivity: String(formData.get("dataSensitivity") ?? "") || null,
    deliveryType: (String(formData.get("deliveryType") ?? "") as "AD" | "AT" | "AM") || null,
    aiUsageRole: null,
    aiExecutionPattern:
      (String(formData.get("aiExecutionPattern") ?? "") as "assisted" | "step_by_step" | "orchestrated") || null,
    aiUsageIntent: String(formData.get("aiUsageIntent") ?? "") || null,
    businessImpactLevel: parseOptionalRiskLevel(formData, "businessImpactLevel"),
    businessImpactRationale: String(formData.get("businessImpactRationale") ?? "") || null,
    dataSensitivityLevel: parseOptionalRiskLevel(formData, "dataSensitivityLevel"),
    dataSensitivityRationale: String(formData.get("dataSensitivityRationale") ?? "") || null,
    blastRadiusLevel: parseOptionalRiskLevel(formData, "blastRadiusLevel"),
    blastRadiusRationale: String(formData.get("blastRadiusRationale") ?? "") || null,
    decisionImpactLevel: parseOptionalRiskLevel(formData, "decisionImpactLevel"),
    decisionImpactRationale: String(formData.get("decisionImpactRationale") ?? "") || null,
    aiLevelJustification: String(formData.get("aiLevelJustification") ?? "") || null,
    timeframe: String(formData.get("timeframe") ?? "") || null,
    valueOwnerId: String(formData.get("valueOwnerId") ?? "") || null,
    riskProfile: (String(formData.get("riskProfile") ?? "medium") as "low" | "medium" | "high") ?? "medium",
    aiAccelerationLevel:
      (String(formData.get("aiAccelerationLevel") ?? "level_2") as "level_1" | "level_2" | "level_3") ?? "level_2"
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
  revalidatePath("/framing");
  revalidatePath("/");

  if (!result.ok) {
    return {
      status: "error",
      message: result.errors[0]?.message ?? "Outcome could not be saved."
    };
  }

  return {
    status: "success",
    message: "Suggestion saved to the Framing."
  };
}

export type OutcomeFieldAiActionState =
  | {
      status: "success";
      field: "outcome_statement" | "baseline_definition";
      verdict: "good" | "needs_revision" | "unclear";
      confidence: "high" | "medium" | "low";
      rationale: string;
      suggestedRewrite: string | null;
    }
  | {
      status: "error";
      field: "outcome_statement" | "baseline_definition";
      error: string;
    };

async function validateOutcomeFieldAiAction(
  formData: FormData,
  field: "outcome_statement" | "baseline_definition"
) : Promise<OutcomeFieldAiActionState> {
  const session = await requireActiveProjectSession();
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
    return {
      status: "error",
      field,
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

export async function validateOutcomeStatementAiAction(formData: FormData) {
  return validateOutcomeFieldAiAction(formData, "outcome_statement");
}

export async function validateBaselineDefinitionAiAction(formData: FormData) {
  return validateOutcomeFieldAiAction(formData, "baseline_definition");
}

export async function stageOutcomeAiSuggestionAction(formData: FormData) {
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "") || null;
  const suggestionField = String(formData.get("suggestionField") ?? "");
  const suggestedText = String(formData.get("suggestedText") ?? "");
  const search: Record<string, string> = {};

  if (suggestionField === "outcome_statement" && suggestedText.trim()) {
    search.draftOutcomeStatement = suggestedText;
  }

  if (suggestionField === "baseline_definition" && suggestedText.trim()) {
    search.draftBaselineDefinition = suggestedText;
  }

  copyIfPresent(search, "aiField", formData.get("aiField"));
  copyIfPresent(search, "aiVerdict", formData.get("aiVerdict"));
  copyIfPresent(search, "aiConfidence", formData.get("aiConfidence"));
  copyIfPresent(search, "aiReason", formData.get("aiReason"));
  copyIfPresent(search, "aiSuggestion", formData.get("aiSuggestion"));
  copyIfPresent(search, "aiError", formData.get("aiError"));

  redirect(
    buildOutcomeReturnRedirect({
      outcomeId,
      returnPath,
      search
    })
  );
}

export type ReviewOutcomeFramingAiActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  report:
    | {
        outcomeQuality: {
          status: "ok" | "needs_improvement";
          comment: string;
          suggestedImprovement: string;
        };
        problemAlignment: {
          status: "strong" | "weak";
          comment: string;
        };
        epicCoverage: {
          status: "complete" | "partial";
          comment: string;
          missingAreas: string[];
        };
        storyCoverage: {
          status: "good" | "partial";
          comment: string;
          gapsOrOverlaps: string[];
        };
        riskOverview: {
          topRisks: string[];
          expansionRisk: "low" | "medium" | "high";
          misalignmentRisk: "low" | "medium" | "high";
        };
        aiLevel: {
          assessment: "appropriate" | "too_high" | "too_low";
          suggestedLevel: "level_1" | "level_2" | "level_3" | null;
          comment: string;
        };
        framingReadiness: {
          score: number;
          interpretation: "ready_for_tollgate" | "needs_refinement" | "not_ready";
        };
      }
    | null;
};

export async function reviewOutcomeFramingWithAiAction(
  previousState: ReviewOutcomeFramingAiActionState,
  formData: FormData
): Promise<ReviewOutcomeFramingAiActionState> {
  void previousState;
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const result = await reviewOutcomeFramingWithAiService({
    organizationId: session.organization.organizationId,
    outcomeId
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.errors[0]?.message ?? "AI framing review failed.",
      report: null
    };
  }

  return {
    status: "success",
    message: null,
    report: result.data
  };
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

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
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
  const parsedDecision = parseDecisionKey(String(formData.get("decisionKey") ?? "approval|value_owner|customer"));
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

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/review");
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

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
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

export async function createStoryIdeaFromOutcomeAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const epicId = String(formData.get("quickStoryIdeaEpicId") ?? "");
  const title = String(formData.get("quickStoryIdeaTitle") ?? "") || null;

  const result = await createNativeDirectionSeedFromEpicService({
    organizationId: session.organization.organizationId,
    epicId,
    actorId: session.userId,
    title
  });

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
  revalidatePath("/framing");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildFramingRedirect(outcomeId, {
        save: "error",
        message: result.errors[0]?.message ?? "Story Idea could not be created."
      })
    );
  }

  redirect(`/story-ideas/${result.data.id}?created=1`);
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

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
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

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
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

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidateOutcomeWorkspaceCache(session.organization.organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(session.organization.organizationId, outcomeId);
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
