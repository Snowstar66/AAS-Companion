import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE_NAME } from "@aas-companion/domain";

function hasSupabaseCookies(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/workspace")) {
    return NextResponse.next();
  }

  const hasDemoAccess = request.cookies.get(DEMO_SESSION_COOKIE_NAME)?.value === "demo";

  if (hasDemoAccess || hasSupabaseCookies(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/workspace/:path*"]
};
