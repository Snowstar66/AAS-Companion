import { z } from "zod";
import { isSupabaseConfigured } from "@aas-companion/config";
import { createRouteHandlerSupabaseClient } from "@/lib/auth/supabase/server";
import { getAppEnv } from "@/lib/env";
import { normalizeRedirectPath, redirectWithSearch } from "@/lib/auth/route-helpers";
import type { NextRequest } from "next/server";

const signInSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured(process.env)) {
    return redirectWithSearch(request, "/login", {
      error: "Supabase auth is not configured for this environment."
    });
  }

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

  const response = redirectWithSearch(request, "/login", {
    sent: "1",
    email: parsed.data.email
  });
  const supabase = createRouteHandlerSupabaseClient(request, response);

  if (!supabase) {
    return redirectWithSearch(request, "/login", {
      error: "Supabase auth client could not be created."
    });
  }

  const env = getAppEnv();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: new URL("/auth/callback", env.NEXT_PUBLIC_SITE_URL).toString()
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
