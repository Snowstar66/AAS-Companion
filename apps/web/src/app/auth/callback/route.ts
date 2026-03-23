import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEMO_ORGANIZATION, ORG_CONTEXT_COOKIE_NAME } from "@aas-companion/domain";
import { createRouteHandlerSupabaseClient } from "@/lib/auth/supabase/server";
import { normalizeRedirectPath, redirectWithSearch } from "@/lib/auth/route-helpers";

export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return redirectWithSearch(request, "/login", {
      error: "Missing Supabase auth code."
    });
  }

  const postAuthRedirect = normalizeRedirectPath(request.cookies.get("aas-post-auth-redirect")?.value ?? "/workspace");
  const response = NextResponse.redirect(new URL(postAuthRedirect, request.url));
  const supabase = createRouteHandlerSupabaseClient(request, response);

  if (!supabase) {
    return redirectWithSearch(request, "/login", {
      error: "Supabase auth is not configured."
    });
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithSearch(request, "/login", {
      error: error.message
    });
  }

  response.cookies.set(ORG_CONTEXT_COOKIE_NAME, DEMO_ORGANIZATION.organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  response.cookies.delete("aas-post-auth-redirect");

  return response;
}
