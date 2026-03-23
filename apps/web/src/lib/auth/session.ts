import { redirect } from "next/navigation";
import type { AppSession } from "@aas-companion/domain";
import { DEMO_ORGANIZATION, DEMO_SESSION } from "@aas-companion/domain";
import { getOrganizationContextCookie } from "@/lib/org-context";
import { hasDemoSession } from "@/lib/auth/demo";
import { createServerSupabaseClient } from "@/lib/auth/supabase/server";

function resolveOrganizationContext(organizationId: string | null) {
  if (!organizationId || organizationId === DEMO_ORGANIZATION.organizationId) {
    return DEMO_ORGANIZATION;
  }

  return {
    ...DEMO_ORGANIZATION,
    organizationId,
    organizationSlug: organizationId
  };
}

export async function getAppSession(): Promise<AppSession | null> {
  const organizationId = await getOrganizationContextCookie();

  if (await hasDemoSession()) {
    return {
      ...DEMO_SESSION,
      organization: resolveOrganizationContext(organizationId)
    };
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
    mode: "supabase",
    userId: user.id,
    email: user.email ?? "unknown@supabase.local",
    displayName: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? "Operator",
    organization: resolveOrganizationContext(organizationId)
  };
}

export async function requireAppSession() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
