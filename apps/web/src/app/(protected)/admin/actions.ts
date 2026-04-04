"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hardDeleteOrganizationContextsForUser } from "@aas-companion/db";
import { clearOrganizationContextCookie } from "@/lib/org-context";
import { requireProjectAccountIdentity, requireProtectedSession } from "@/lib/auth/guards";

function buildAdminRedirect(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    query.set(key, value);
  }

  const serialized = query.toString();
  return serialized ? `/admin?${serialized}` : "/admin";
}

export async function hardDeleteProjectsAction(formData: FormData) {
  const session = await requireProtectedSession();
  const account = await requireProjectAccountIdentity();

  if (session.mode === "demo") {
    redirect(
      buildAdminRedirect({
        status: "blocked",
        message: "Admin cleanup is unavailable in Demo. Sign in with a normal account to remove test projects."
      })
    );
  }

  const selectedOrganizationIds = [...new Set(formData.getAll("organizationIds").map((value) => String(value).trim()).filter(Boolean))];

  if (selectedOrganizationIds.length === 0) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "Choose at least one project to delete."
      })
    );
  }

  const deletedProjects = await hardDeleteOrganizationContextsForUser({
    organizationIds: selectedOrganizationIds,
    userId: account.userId
  });

  if (deletedProjects.length === 0) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "No matching projects could be deleted."
      })
    );
  }

  if (
    session.organization?.organizationId &&
    deletedProjects.some((project) => project.organizationId === session.organization?.organizationId)
  ) {
    await clearOrganizationContextCookie();
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/framing");
  revalidatePath("/intake");
  revalidatePath("/workspace");

  redirect(
    buildAdminRedirect({
      status: "deleted",
      message:
        deletedProjects.length === 1
          ? `${deletedProjects[0]?.organizationName ?? "The selected project"} was deleted permanently.`
          : `${deletedProjects.length} projects were deleted permanently.`
    })
  );
}
