import { redirect } from "next/navigation";
import type { AppSession, OrganizationContext } from "@aas-companion/domain";
import { DEMO_ORGANIZATION, DEMO_SESSION } from "@aas-companion/domain";
import { getAppUserById, getOrganizationContextForUser } from "@aas-companion/db";
import { getOrganizationContextCookie } from "@/lib/org-context";
import { hasDemoSession } from "@/lib/auth/demo";
import { getLocalSessionUserId } from "@/lib/auth/local";
import { createServerSupabaseClient } from "@/lib/auth/supabase/server";

export type AccountIdentity = {
  authMode: "local" | "supabase";
  userId: string;
  email: string;
  displayName: string;
};

export type ViewerSession = Omit<AppSession, "organization"> & {
  organization: OrganizationContext | null;
};

export async function getSignedInAccountIdentity(): Promise<AccountIdentity | null> {
  const localUserId = await getLocalSessionUserId();

  if (localUserId) {
    const localUser = await getAppUserById(localUserId);

    if (localUser) {
      return {
        authMode: "local",
        userId: localUser.userId,
        email: localUser.email,
        displayName: localUser.fullName ?? localUser.email.split("@")[0] ?? "Operator"
      };
    }
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    authMode: "supabase",
    userId: user.id,
    email: user.email ?? "unknown@supabase.local",
    displayName: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "Operator"
  };
}

export async function getAppSession(): Promise<ViewerSession | null> {
  const organizationId = await getOrganizationContextCookie();
  const account = await getSignedInAccountIdentity();

  if (await hasDemoSession()) {
    return {
      ...(account
        ? {
            mode: "demo" as const,
            userId: account.userId,
            email: account.email,
            displayName: account.displayName
          }
        : DEMO_SESSION),
      organization:
        organizationId === null || organizationId === DEMO_ORGANIZATION.organizationId ? DEMO_ORGANIZATION : null
    };
  }

  if (!account) {
    return null;
  }

  const organization =
    organizationId && organizationId !== DEMO_ORGANIZATION.organizationId
      ? await getOrganizationContextForUser(account.userId, organizationId)
      : null;

  return {
    mode: account.authMode,
    userId: account.userId,
    email: account.email,
    displayName: account.displayName,
    organization
  };
}

export async function requireAppSession() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
