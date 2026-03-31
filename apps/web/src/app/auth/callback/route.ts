import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEMO_SESSION_COOKIE_NAME,
  LOCAL_SESSION_COOKIE_NAME,
  ORG_CONTEXT_COOKIE_NAME
} from "@aas-companion/domain/session-constants";
import { ensureAppUser } from "@aas-companion/db";
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

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await ensureAppUser({
      userId: user.id,
      email: user.email ?? "unknown@supabase.local",
      fullName: user.user_metadata.full_name ?? null
    });

    response.cookies.set(LOCAL_SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
  }

  response.cookies.delete(DEMO_SESSION_COOKIE_NAME);
  response.cookies.delete(ORG_CONTEXT_COOKIE_NAME);
  response.cookies.delete("aas-post-auth-redirect");

  return response;
}
