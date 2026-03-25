import { z } from "zod";
import { isLocalAuthEnabled, isSupabaseConfigured } from "@aas-companion/config";
import { getAppUserByEmail } from "@aas-companion/db";
import { clearDemoSession } from "@/lib/auth/demo";
import { createLocalSession } from "@/lib/auth/local";
import { clearOrganizationContextCookie } from "@/lib/org-context";
import { createRouteHandlerSupabaseClient } from "@/lib/auth/supabase/server";
import { normalizeRedirectPath, redirectWithSearch } from "@/lib/auth/route-helpers";
import { resolveAuthCallbackUrl } from "@/lib/auth/public-site-url";
import type { NextRequest } from "next/server";

const signInSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = signInSchema.safeParse({
    email: formData.get("email")
  });
  const redirectTo = normalizeRedirectPath(String(formData.get("redirectTo") ?? "/"));

  if (!parsed.success) {
    return redirectWithSearch(request, "/login", {
      error: "Enter a valid email address."
    });
  }

  const localAuthEnabled = isLocalAuthEnabled(process.env);
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  if (localAuthEnabled) {
    const existingUser = await getAppUserByEmail(normalizedEmail);

    if (existingUser) {
      await clearDemoSession();
      await clearOrganizationContextCookie();
      await createLocalSession(existingUser.userId);

      return redirectWithSearch(request, redirectTo);
    }
  }

  if (!isSupabaseConfigured(process.env)) {
    return redirectWithSearch(request, "/login", {
      error: localAuthEnabled
        ? "No matching internal user was found, and magic link sign-in is not configured in this environment."
        : "Supabase auth is not configured for this environment."
    });
  }

  const response = redirectWithSearch(request, "/login", {
    sent: "1",
    email: normalizedEmail
  });
  const supabase = createRouteHandlerSupabaseClient(request, response);

  if (!supabase) {
    return redirectWithSearch(request, "/login", {
      error: "Supabase auth client could not be created."
    });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: resolveAuthCallbackUrl({
        requestUrl: request.url,
        configuredSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        nodeEnv: process.env.NODE_ENV
      })
    }
  });

  if (error) {
    return redirectWithSearch(request, "/login", {
      error: error.message
    });
  }

  response.cookies.set("aas-post-auth-redirect", redirectTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });

  return response;
}
