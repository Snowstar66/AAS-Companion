"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { membershipRoleSchema } from "@aas-companion/domain";
import { clearOperationalActivityEventsService } from "@aas-companion/api";
import {
  createPartyRoleEntry,
  hardDeletePartyRoleEntry,
  hardDeleteOrganizationContextsForUser,
  listPartyRoleEntries,
  removeOrganizationProjectUser,
  updatePartyRoleEntry,
  updateOrganizationProjectUser
} from "@aas-companion/db";
import { z } from "zod";
import { clearOrganizationContextCookie } from "@/lib/org-context";
import { requireActiveProjectSession, requireProjectAccountIdentity, requireProtectedSession } from "@/lib/auth/guards";
import { getDemoRoleSeedById } from "@/lib/admin/demo-role-catalog";

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

const updateProjectUserSchema = z.object({
  userId: z.string().trim().min(1),
  email: z.string().trim().email(),
  fullName: z.string().trim().optional(),
  role: membershipRoleSchema
});

const removeProjectUserSchema = z.object({
  userId: z.string().trim().min(1)
});

const demoRoleIdsSchema = z.array(z.string().trim().min(1));

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string" &&
      "name" in error &&
      error.name === "PrismaClientKnownRequestError"
  );
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

export async function clearOperationalLogsAction() {
  const session = await requireProtectedSession();
  const activeProjectSession = await requireActiveProjectSession();

  if (session.mode === "demo") {
    redirect(
      buildAdminRedirect({
        status: "blocked",
        message: "Operational log cleanup is unavailable in Demo."
      })
    );
  }

  const result = await clearOperationalActivityEventsService({
    organizationId: activeProjectSession.organization.organizationId
  });

  revalidatePath("/admin");

  redirect(
    buildAdminRedirect({
      status: result.ok ? "cleared" : "error",
      message: result.ok
        ? result.data.deletedCount > 0
          ? `Cleared ${result.data.deletedCount} operational log event(s).`
          : "No operational logs needed clearing."
        : result.errors[0]?.message ?? "Operational logs could not be cleared."
      })
  );
}

export async function updateProjectUserAction(formData: FormData) {
  const session = await requireProtectedSession();
  const activeProjectSession = await requireActiveProjectSession();

  if (session.mode === "demo") {
    redirect(
      buildAdminRedirect({
        status: "blocked",
        message: "Project user admin is unavailable in Demo."
      })
    );
  }

  const parsed = updateProjectUserSchema.safeParse({
    userId: formData.get("userId"),
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "Enter a valid email, choose a role, and try again."
      })
    );
  }

  try {
    const updatedUser = await updateOrganizationProjectUser({
      organizationId: activeProjectSession.organization.organizationId,
      userId: parsed.data.userId,
      email: parsed.data.email,
      fullName: parsed.data.fullName ?? null,
      role: parsed.data.role
    });

    if (!updatedUser) {
      redirect(
        buildAdminRedirect({
          status: "error",
          message: "That project user could not be found."
        })
      );
    }
  } catch (error) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: isUniqueConstraintError(error)
          ? "That email is already used by another internal user."
          : error instanceof Error
            ? error.message
            : "The project user could not be updated."
      })
    );
  }

  revalidatePath("/admin");
  revalidatePath("/login");
  revalidatePath("/");
  revalidatePath("/framing");
  revalidatePath("/workspace");

  redirect(
    buildAdminRedirect({
      status: "saved",
      message: "Project user updated."
    })
  );
}

export async function removeProjectUserAction(formData: FormData) {
  const session = await requireProtectedSession();
  const activeProjectSession = await requireActiveProjectSession();

  if (session.mode === "demo") {
    redirect(
      buildAdminRedirect({
        status: "blocked",
        message: "Project user admin is unavailable in Demo."
      })
    );
  }

  const parsed = removeProjectUserSchema.safeParse({
    userId: formData.get("userId")
  });

  if (!parsed.success) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "Choose a valid project user to remove."
      })
    );
  }

  const result = await removeOrganizationProjectUser({
    organizationId: activeProjectSession.organization.organizationId,
    userId: parsed.data.userId
  });

  if (result.status === "not_found") {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "That project user could not be found."
      })
    );
  }

  if (result.status === "blocked_last_member") {
    redirect(
      buildAdminRedirect({
        status: "blocked",
        message: "The last remaining project member cannot be removed."
      })
    );
  }

  if (parsed.data.userId === session.userId) {
    await clearOrganizationContextCookie();
  }

  revalidatePath("/admin");
  revalidatePath("/login");
  revalidatePath("/");
  revalidatePath("/framing");
  revalidatePath("/workspace");

  redirect(
    buildAdminRedirect({
      status: "removed",
      message:
        result.clearedOutcomeAssignments > 0
          ? `Project user removed and ${result.clearedOutcomeAssignments} outcome owner assignment(s) were cleared.`
          : "Project user removed."
    })
  );
}

export async function applyDemoRoleBulkAction(formData: FormData) {
  const session = await requireProtectedSession();
  const activeProjectSession = await requireActiveProjectSession();

  if (session.mode === "demo") {
    redirect(
      buildAdminRedirect({
        status: "blocked",
        message: "Demo role bulk tools are unavailable in Demo."
      })
    );
  }

  const createRoleIds = demoRoleIdsSchema.parse(
    formData.getAll("createRoleIds").map((value) => String(value).trim()).filter(Boolean)
  );
  const removeRoleIds = demoRoleIdsSchema.parse(
    formData.getAll("removeRoleIds").map((value) => String(value).trim()).filter(Boolean)
  );
  const overlappingIds = createRoleIds.filter((id) => removeRoleIds.includes(id));

  if (createRoleIds.length === 0 && removeRoleIds.length === 0) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "Select at least one demo role to create or remove."
      })
    );
  }

  if (overlappingIds.length > 0) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "A role cannot be marked for both create and remove in the same bulk action."
      })
    );
  }

  const createSeeds = createRoleIds
    .map((id) => getDemoRoleSeedById(id))
    .filter((seed): seed is NonNullable<typeof seed> => Boolean(seed));
  const removeSeeds = removeRoleIds
    .map((id) => getDemoRoleSeedById(id))
    .filter((seed): seed is NonNullable<typeof seed> => Boolean(seed));

  if (createSeeds.length !== createRoleIds.length || removeSeeds.length !== removeRoleIds.length) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message: "One or more selected demo roles were invalid."
      })
    );
  }

  const organizationId = activeProjectSession.organization.organizationId;
  let createdCount = 0;
  let updatedCount = 0;
  let removedCount = 0;

  try {
    const existingRoles = await listPartyRoleEntries(organizationId, { includeInactive: true });

    for (const seed of createSeeds) {
      const existing = existingRoles.find(
        (entry) =>
          entry.organizationSide === seed.organizationSide &&
          entry.roleType === seed.roleType &&
          entry.email.trim().toLowerCase() === seed.email.trim().toLowerCase()
      );

      if (existing) {
        await updatePartyRoleEntry({
          organizationId,
          id: existing.id,
          actorId: session.userId,
          fullName: seed.fullName,
          email: seed.email,
          phoneNumber: null,
          avatarUrl: seed.avatarUrl,
          organizationSide: seed.organizationSide,
          roleType: seed.roleType,
          roleTitle: seed.roleTitle,
          mandateNotes: seed.mandateNotes,
          isActive: true
        });
        updatedCount += 1;
      } else {
        await createPartyRoleEntry({
          organizationId,
          actorId: session.userId,
          fullName: seed.fullName,
          email: seed.email,
          phoneNumber: null,
          avatarUrl: seed.avatarUrl,
          organizationSide: seed.organizationSide,
          roleType: seed.roleType,
          roleTitle: seed.roleTitle,
          mandateNotes: seed.mandateNotes,
          isActive: true
        });
        createdCount += 1;
      }
    }

    if (removeSeeds.length > 0) {
      const refreshedRoles = await listPartyRoleEntries(organizationId, { includeInactive: true });

      for (const seed of removeSeeds) {
        const matches = refreshedRoles.filter(
          (entry) =>
            entry.organizationSide === seed.organizationSide &&
            entry.roleType === seed.roleType
        );

        for (const match of matches) {
          await hardDeletePartyRoleEntry({
            organizationId,
            id: match.id,
            actorId: session.userId
          });
          removedCount += 1;
        }
      }
    }
  } catch (error) {
    redirect(
      buildAdminRedirect({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The selected demo role changes could not be applied."
      })
    );
  }

  revalidatePath("/admin");
  revalidatePath("/governance");
  revalidatePath("/framing");
  revalidatePath("/outcomes");
  revalidatePath("/workspace");

  const parts = [
    createdCount > 0 ? `created ${createdCount}` : null,
    updatedCount > 0 ? `updated ${updatedCount}` : null,
    removedCount > 0 ? `removed ${removedCount}` : null
  ].filter(Boolean);

  redirect(
    buildAdminRedirect({
      status: "saved",
      message:
        parts.length > 0
          ? `Demo role bulk action complete: ${parts.join(", ")}.`
          : "Demo role bulk action completed with no matching changes."
    })
  );
}
