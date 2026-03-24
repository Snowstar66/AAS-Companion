import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE_NAME, LOCAL_SESSION_COOKIE_NAME, ORG_CONTEXT_COOKIE_NAME } from "@aas-companion/domain";
import { createRouteHandlerSupabaseClient } from "@/lib/auth/supabase/server";
import { normalizeRedirectPath, redirectWithSearch } from "@/lib/auth/route-helpers";

export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return redirectWithSearch(request, "/login", {
      error: "Missing Supabase auth code."
    });
  }

  const postAuthRedirect = normalizeRedirectPath(request.cookies.get("aas-post-auth-redirect")?.value ?? "/");
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

  response.cookies.delete(DEMO_SESSION_COOKIE_NAME);
  response.cookies.delete(LOCAL_SESSION_COOKIE_NAME);
  response.cookies.delete(ORG_CONTEXT_COOKIE_NAME);
  response.cookies.delete("aas-post-auth-redirect");

  return response;
}
