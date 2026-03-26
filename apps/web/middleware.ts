import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE_NAME, LOCAL_SESSION_COOKIE_NAME } from "@aas-companion/domain/session-constants";

function hasSupabaseCookies(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  if (process.env.NODE_ENV !== "production" && process.env.DEBUG_REQUEST_LOGS === "1") {
    console.warn(`[request] ${requestId} ${request.method} ${pathname}`);
  }

  const protectedPrefixes = ["/workspace", "/intake", "/review", "/framing", "/outcomes", "/epics", "/stories", "/handoff"];
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const hasDemoAccess = request.cookies.get(DEMO_SESSION_COOKIE_NAME)?.value === "demo";
  const hasLocalAccess = Boolean(request.cookies.get(LOCAL_SESSION_COOKIE_NAME)?.value);

  if (hasDemoAccess || hasLocalAccess || hasSupabaseCookies(request)) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);

  const response = NextResponse.redirect(loginUrl);
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
