import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE_NAME, LOCAL_SESSION_COOKIE_NAME } from "@aas-companion/domain/session-constants";

function hasSupabaseCookies(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.NODE_ENV !== "production" && process.env.DEBUG_REQUEST_LOGS === "1") {
    console.warn(`[request] ${request.method} ${pathname}`);
  }

  const protectedPrefixes = ["/workspace", "/intake", "/review", "/framing", "/outcomes", "/epics", "/stories", "/handoff"];
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const hasDemoAccess = request.cookies.get(DEMO_SESSION_COOKIE_NAME)?.value === "demo";
  const hasLocalAccess = Boolean(request.cookies.get(LOCAL_SESSION_COOKIE_NAME)?.value);

  if (hasDemoAccess || hasLocalAccess || hasSupabaseCookies(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
