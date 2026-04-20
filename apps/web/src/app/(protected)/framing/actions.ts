"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  revalidateFramingCockpitCache,
  revalidateOutcomeTollgateReviewCache,
  revalidateOutcomeWorkspaceCache
} from "@/lib/cache/project-data";
import { type CreateOutcomeActionState } from "@/lib/framing/create-outcome";
import {
  analyzeOutcomeJourneyCoverageService,
  createCleanDraftOutcomeFromFramingService,
  getOutcomeWorkspaceService,
  saveOutcomeDownstreamAiInstructionsService,
  saveOutcomeJourneyContextsService
} from "@aas-companion/api";
import { downstreamAiInstructionsSchema, journeyContextCollectionSchema } from "@aas-companion/domain";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { runFramingAgentOrchestrator } from "@/lib/framing/agentOrchestrator";
import type { FramingAgentActionResult } from "@/lib/framing/agentStructuredOutputs";

function buildFramingRedirect(input: {
  outcomeId: string;
  subpage?: string;
  search?: Record<string, string>;
}) {
  const params = new URLSearchParams();
  params.set("outcomeId", input.outcomeId);

  if (input.subpage?.trim()) {
    params.set("subpage", input.subpage);
  }

  for (const [key, value] of Object.entries(input.search ?? {})) {
    if (value.trim()) {
      params.set(key, value);
    }
  }

  return `/framing?${params.toString()}`;
}

function revalidateFramingWorkspaceRoutes(organizationId: string, outcomeId: string) {
  revalidateFramingCockpitCache(organizationId);
  revalidateOutcomeWorkspaceCache(organizationId, outcomeId);
  revalidateOutcomeTollgateReviewCache(organizationId, outcomeId);
  revalidatePath("/framing");
  revalidatePath(`/outcomes/${outcomeId}`);
  revalidatePath(`/outcomes/${outcomeId}/approval-document`);
  revalidatePath("/");
}

function readJourneyContextsJson(formData: FormData) {
  const raw = String(formData.get("journeyContextsJson") ?? "[]");

  try {
    const parsed = journeyContextCollectionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function readDownstreamAiInstructionsJson(formData: FormData) {
  const raw = String(formData.get("downstreamAiInstructionsJson") ?? "null");

  try {
    const parsed = downstreamAiInstructionsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function readAgentScopeKind(formData: FormData) {
  const value = String(formData.get("scopeKind") ?? "");

  return value === "journey-context" ||
    value === "story-ideas" ||
    value === "downstream-ai-instructions" ||
    value === "export" ||
    value === "full-framing"
    ? value
    : "full-framing";
}

function readAgentMode(formData: FormData) {
  const value = String(formData.get("mode") ?? "");

  return value === "ask" || value === "analyze" || value === "refine" || value === "export" ? value : "ask";
}

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

  revalidateFramingCockpitCache(session.organization.organizationId);
  revalidatePath("/framing");
  revalidatePath("/");
  redirect(`/framing?outcomeId=${result.data.id}&created=1`);
}

export async function saveJourneyContextsAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const journeyContexts = readJourneyContextsJson(formData);

  if (!journeyContexts) {
    redirect(
      buildFramingRedirect({
        outcomeId,
        subpage: "journey-context",
        search: {
          journeySave: "error",
          journeyMessage: "Journey Context data could not be parsed."
        }
      })
    );
  }

  const result = await saveOutcomeJourneyContextsService({
    organizationId: session.organization.organizationId,
    outcomeId,
    actorId: session.userId,
    journeyContexts
  });

  revalidateFramingWorkspaceRoutes(session.organization.organizationId, outcomeId);

  if (!result.ok) {
    redirect(
      buildFramingRedirect({
        outcomeId,
        subpage: "journey-context",
        search: {
          journeySave: "error",
          journeyMessage: result.errors[0]?.message ?? "Journey Context could not be saved."
        }
      })
    );
  }

  redirect(
    buildFramingRedirect({
      outcomeId,
      subpage: "journey-context",
      search: {
        journeySave: "success"
      }
    })
  );
}

export async function analyzeJourneyCoverageAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const journeyContextId = String(formData.get("journeyContextId") ?? "");
  const journeyContexts = readJourneyContextsJson(formData);

  if (!journeyContexts) {
    redirect(
      buildFramingRedirect({
        outcomeId,
        subpage: "journey-context",
        search: {
          journeyAnalyze: "error",
          journeyMessage: "Journey Context data could not be parsed before analysis."
        }
      })
    );
  }

  const result = await analyzeOutcomeJourneyCoverageService({
    organizationId: session.organization.organizationId,
    outcomeId,
    journeyContextId,
    actorId: session.userId,
    journeyContexts
  });

  revalidateFramingWorkspaceRoutes(session.organization.organizationId, outcomeId);

  if (!result.ok) {
    redirect(
      buildFramingRedirect({
        outcomeId,
        subpage: "journey-context",
        search: {
          journeyAnalyze: "error",
          journeyMessage: result.errors[0]?.message ?? "Journey coverage analysis failed."
        }
      })
    );
  }

  redirect(
    buildFramingRedirect({
      outcomeId,
      subpage: "journey-context",
      search: {
        journeyAnalyze: "success"
      }
    })
  );
}

export async function saveDownstreamAiInstructionsAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const downstreamAiInstructions = readDownstreamAiInstructionsJson(formData);

  if (!downstreamAiInstructions) {
    redirect(
      buildFramingRedirect({
        outcomeId,
        subpage: "downstream-ai-instructions",
        search: {
          downstreamSave: "error",
          downstreamMessage: "Downstream AI Instructions could not be parsed."
        }
      })
    );
  }

  const result = await saveOutcomeDownstreamAiInstructionsService({
    organizationId: session.organization.organizationId,
    outcomeId,
    actorId: session.userId,
    downstreamAiInstructions
  });

  revalidateFramingWorkspaceRoutes(session.organization.organizationId, outcomeId);

  if (!result.ok) {
    redirect(
      buildFramingRedirect({
        outcomeId,
        subpage: "downstream-ai-instructions",
        search: {
          downstreamSave: "error",
          downstreamMessage: result.errors[0]?.message ?? "Downstream AI Instructions could not be saved."
        }
      })
    );
  }

  redirect(
    buildFramingRedirect({
      outcomeId,
      subpage: "downstream-ai-instructions",
      search: {
        downstreamSave: "success"
      }
    })
  );
}

export async function runFramingAgentAction(formData: FormData): Promise<FramingAgentActionResult> {
  const session = await requireActiveProjectSession();
  const outcomeId = String(formData.get("outcomeId") ?? "");
  const scopeKind = readAgentScopeKind(formData);
  const mode = readAgentMode(formData);
  const prompt = String(formData.get("prompt") ?? "").trim();
  const scopeLabel = String(formData.get("scopeLabel") ?? "Current Framing package").trim() || "Current Framing package";
  const scopeEntityId = String(formData.get("scopeEntityId") ?? "").trim() || null;
  const quickActionId = String(formData.get("quickActionId") ?? "").trim() || null;

  if (!outcomeId) {
    return {
      ok: false,
      error: "Outcome id is required before the AI assistant can run."
    };
  }

  if (!prompt) {
    return {
      ok: false,
      error: "A prompt is required before the AI assistant can run."
    };
  }

  const workspace = await getOutcomeWorkspaceService(session.organization.organizationId, outcomeId);

  if (!workspace.ok) {
    return {
      ok: false,
      error: workspace.errors[0]?.message ?? "The Framing workspace could not be loaded for AI assistance."
    };
  }

  try {
    return await runFramingAgentOrchestrator({
      data: workspace.data,
      mode,
      scope: {
        kind: scopeKind,
        label: scopeLabel,
        entityId: scopeEntityId
      },
      prompt,
      quickActionId,
      journeyContextsOverride: formData.has("journeyContextsJson") ? readJourneyContextsJson(formData) : null,
      downstreamAiInstructionsOverride: formData.has("downstreamAiInstructionsJson")
        ? readDownstreamAiInstructionsJson(formData)
        : null
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The AI assistant could not complete the request."
    };
  }
}
