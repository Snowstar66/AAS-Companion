"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAgentRegistryEntryService,
  createPartyRoleEntryService,
  updateAgentRegistryEntryService,
  updatePartyRoleEntryService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildRedirect(params: {
  view?: string | undefined;
  level?: string | undefined;
  sourceEntity?: string | undefined;
  sourceId?: string | undefined;
  status?: string | undefined;
  message?: string | undefined;
}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    query.set(key, value);
  }

  const queryString = query.toString();
  return queryString ? `/governance?${queryString}` : "/governance";
}

function readCsv(formData: FormData, name: string) {
  return String(formData.get(name) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getReturnParams(formData: FormData) {
  return {
    view: String(formData.get("returnView") ?? "") || undefined,
    level: String(formData.get("returnLevel") ?? "") || undefined,
    sourceEntity: String(formData.get("returnSourceEntity") ?? "") || undefined,
    sourceId: String(formData.get("returnSourceId") ?? "") || undefined
  };
}

export async function createPartyRoleEntryAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const returnParams = getReturnParams(formData);

  const result = await createPartyRoleEntryService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? "") || null,
    avatarUrl: String(formData.get("avatarUrl") ?? "") || null,
    organizationSide: String(formData.get("organizationSide") ?? "customer"),
    roleType: String(formData.get("roleType") ?? "value_owner"),
    roleTitle: String(formData.get("roleTitle") ?? ""),
    mandateNotes: String(formData.get("mandateNotes") ?? "") || null,
    isActive: true
  });

  revalidatePath("/governance");

  if (!result.ok) {
    redirect(
      buildRedirect({
        ...returnParams,
        status: "error",
        message: result.errors[0]?.message ?? "Party role entry could not be created."
      })
    );
  }

  redirect(
    buildRedirect({
      ...returnParams,
      status: "saved",
      message: "Party role entry created."
    })
  );
}

export async function updatePartyRoleEntryAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const returnParams = getReturnParams(formData);
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  const result = await updatePartyRoleEntryService({
    organizationId: session.organization.organizationId,
    id: String(formData.get("id") ?? ""),
    actorId: session.userId,
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? "") || null,
    avatarUrl: String(formData.get("avatarUrl") ?? "") || null,
    organizationSide: String(formData.get("organizationSide") ?? "customer"),
    roleType: String(formData.get("roleType") ?? "value_owner"),
    roleTitle: String(formData.get("roleTitle") ?? ""),
    mandateNotes: String(formData.get("mandateNotes") ?? "") || null,
    isActive
  });

  revalidatePath("/governance");

  if (!result.ok) {
    redirect(
      buildRedirect({
        ...returnParams,
        status: "error",
        message: result.errors[0]?.message ?? "Party role entry could not be updated."
      })
    );
  }

  redirect(
    buildRedirect({
      ...returnParams,
      status: "saved",
      message: isActive ? "Party role entry updated." : "Party role entry deactivated."
    })
  );
}

export async function createAgentRegistryEntryAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const returnParams = getReturnParams(formData);

  const result = await createAgentRegistryEntryService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    agentName: String(formData.get("agentName") ?? ""),
    agentType: String(formData.get("agentType") ?? "bmad_agent"),
    purpose: String(formData.get("purpose") ?? ""),
    scopeOfWork: String(formData.get("scopeOfWork") ?? ""),
    allowedArtifactTypes: readCsv(formData, "allowedArtifactTypes"),
    allowedActions: readCsv(formData, "allowedActions"),
    supervisingPartyRoleId: String(formData.get("supervisingPartyRoleId") ?? ""),
    isActive: true
  });

  revalidatePath("/governance");

  if (!result.ok) {
    redirect(
      buildRedirect({
        ...returnParams,
        status: "error",
        message: result.errors[0]?.message ?? "Agent registry entry could not be created."
      })
    );
  }

  redirect(
    buildRedirect({
      ...returnParams,
      status: "saved",
      message: "Agent registry entry created."
    })
  );
}

export async function updateAgentRegistryEntryAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const returnParams = getReturnParams(formData);
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  const result = await updateAgentRegistryEntryService({
    organizationId: session.organization.organizationId,
    id: String(formData.get("id") ?? ""),
    actorId: session.userId,
    agentName: String(formData.get("agentName") ?? ""),
    agentType: String(formData.get("agentType") ?? "bmad_agent"),
    purpose: String(formData.get("purpose") ?? ""),
    scopeOfWork: String(formData.get("scopeOfWork") ?? ""),
    allowedArtifactTypes: readCsv(formData, "allowedArtifactTypes"),
    allowedActions: readCsv(formData, "allowedActions"),
    supervisingPartyRoleId: String(formData.get("supervisingPartyRoleId") ?? ""),
    isActive
  });

  revalidatePath("/governance");

  if (!result.ok) {
    redirect(
      buildRedirect({
        ...returnParams,
        status: "error",
        message: result.errors[0]?.message ?? "Agent registry entry could not be updated."
      })
    );
  }

  redirect(
    buildRedirect({
      ...returnParams,
      status: "saved",
      message: isActive ? "Agent registry entry updated." : "Agent registry entry deactivated."
    })
  );
}
