"use server";

import { redirect } from "next/navigation";
import {
  appendActivityEvent,
  createOrganizationContextForUser,
  deleteOrganizationContextForUser,
  getOrganizationContextForUser,
  getWorkspaceSnapshot
} from "@aas-companion/db";
import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import { clearDemoSession, createDemoSession } from "@/lib/auth/demo";
import { requireActiveProjectSession, requireProjectAccountIdentity, requireProtectedSession } from "@/lib/auth/guards";
import { clearOrganizationContextCookie, setOrganizationContextCookie } from "@/lib/org-context";

function buildHomeRedirect(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    query.set(key, value);
  }

  const serialized = query.toString();
  return serialized ? `/?${serialized}` : "/";
}

export async function createProjectAction(formData: FormData) {
  const session = await requireProtectedSession();
  const account = await requireProjectAccountIdentity();
  const projectName = String(formData.get("projectName") ?? "").trim();

  if (!projectName) {
    redirect(buildHomeRedirect({ error: "Enter a project name before creating it." }));
  }

  if (session.mode === "demo") {
    await clearDemoSession();
  }

  const project = await createOrganizationContextForUser({
    userId: account.userId,
    email: account.email,
    fullName: account.displayName,
    organizationName: projectName
  });

  await setOrganizationContextCookie(project);

  redirect(`/framing?projectCreated=1`);
}

export async function openProjectAction(formData: FormData) {
  const session = await requireProtectedSession();
  const account = await requireProjectAccountIdentity();
  const organizationId = String(formData.get("organizationId") ?? "");

  if (!organizationId) {
    redirect(buildHomeRedirect({ error: "Choose a project before opening it." }));
  }

  if (session.mode === "demo") {
    await clearDemoSession();
  }

  const project = await getOrganizationContextForUser(account.userId, organizationId);

  if (!project) {
    redirect(buildHomeRedirect({ error: "That project is no longer available for this user." }));
  }

  await setOrganizationContextCookie(project);
  redirect("/framing");
}

export async function clearActiveProjectAction() {
  const session = await requireProtectedSession();

  if (session.mode === "demo") {
    await clearDemoSession();
  } else {
    await clearOrganizationContextCookie();
  }

  redirect(buildHomeRedirect({ status: "cleared", message: "Active project cleared. Choose a project to continue." }));
}

export async function openDemoProjectAction() {
  await createDemoSession();
  redirect("/framing");
}

export async function deleteCurrentProjectAction() {
  const session = await requireActiveProjectSession();
  const organization = session.organization;

  if (organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirect(buildHomeRedirect({ error: "Demo project cannot be deleted." }));
  }

  const snapshot = await getWorkspaceSnapshot(organization.organizationId);

  await appendActivityEvent({
    organizationId: organization.organizationId,
    entityType: "organization",
    entityId: organization.organizationId,
    eventType: "governed_removal_requested",
    actorId: session.userId,
    metadata: {
      projectName: organization.organizationName,
      counts: snapshot?.counts ?? null,
      reason: "project_deleted_from_home"
    }
  });

  const deleted = await deleteOrganizationContextForUser({
    organizationId: organization.organizationId,
    userId: session.userId
  });

  await clearOrganizationContextCookie();

  redirect(
    buildHomeRedirect({
      status: deleted ? "deleted" : "error",
      message: deleted
        ? `${organization.organizationName} was deleted and the tool returned to an empty Home state.`
        : "Project could not be deleted."
    })
  );
}
