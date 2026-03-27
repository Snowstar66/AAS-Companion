import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AppSession } from "@aas-companion/domain/auth";
import type { OrganizationContext } from "@aas-companion/domain/organization";
import { DEMO_ORGANIZATION, DEMO_SESSION } from "@aas-companion/domain/demo";
import {
  DEMO_SESSION_COOKIE_NAME,
  LOCAL_SESSION_COOKIE_NAME,
  ORG_CONTEXT_COOKIE_NAME
} from "@aas-companion/domain/session-constants";
import { ensureAppUser, getAppUserById, getOrganizationContextForUser } from "@aas-companion/db/organization-repository";
import { createServerSupabaseClient } from "@/lib/auth/supabase/server";
import { withDevTiming } from "@/lib/dev-timing";

export type AccountIdentity = {
  authMode: "local" | "supabase";
  userId: string;
  email: string;
  displayName: string;
};

export type ViewerSession = Omit<AppSession, "organization"> & {
  organization: OrganizationContext | null;
};

const getRequestAuthCookieState = cache(async () => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  return {
    organizationId: cookieStore.get(ORG_CONTEXT_COOKIE_NAME)?.value ?? null,
    hasDemoSession: cookieStore.get(DEMO_SESSION_COOKIE_NAME)?.value === "demo",
    localUserId: cookieStore.get(LOCAL_SESSION_COOKIE_NAME)?.value ?? null,
    hasSupabaseCookies: allCookies.some((cookie) => cookie.name.startsWith("sb-"))
  };
});

export const getSignedInAccountIdentity = cache(async (): Promise<AccountIdentity | null> =>
  withDevTiming("web.auth.getSignedInAccountIdentity", async () => {
    const { localUserId, hasSupabaseCookies } = await getRequestAuthCookieState();

    if (localUserId) {
      const localUser = await withDevTiming("web.auth.getAppUserById", () => getAppUserById(localUserId));

      if (localUser) {
        return {
          authMode: "local",
          userId: localUser.userId,
          email: localUser.email,
          displayName: localUser.fullName ?? localUser.email.split("@")[0] ?? "Operator"
        };
      }
    }

    if (!hasSupabaseCookies) {
      return null;
    }

    const supabase = await createServerSupabaseClient();

    if (!supabase) {
      return null;
    }

    const {
      data: { user }
    } = await withDevTiming("web.auth.supabase.getUser", () => supabase.auth.getUser());

    if (!user) {
      return null;
    }

    await withDevTiming("web.auth.ensureAppUser", () =>
      ensureAppUser({
        userId: user.id,
        email: user.email ?? "unknown@supabase.local",
        fullName: user.user_metadata.full_name ?? null
      })
    );

    return {
      authMode: "supabase",
      userId: user.id,
      email: user.email ?? "unknown@supabase.local",
      displayName: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "Operator"
    };
  })
);

export const getAppSession = cache(async (): Promise<ViewerSession | null> =>
  withDevTiming("web.auth.getAppSession", async () => {
    const [{ organizationId, hasDemoSession }, account] = await Promise.all([
      getRequestAuthCookieState(),
      getSignedInAccountIdentity()
    ]);

    if (hasDemoSession) {
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
        ? await withDevTiming("web.auth.getOrganizationContextForUser", () =>
            getOrganizationContextForUser(account.userId, organizationId)
          )
        : null;

    return {
      mode: account.authMode,
      userId: account.userId,
      email: account.email,
      displayName: account.displayName,
      organization
    };
  })
);

export async function requireAppSession() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
