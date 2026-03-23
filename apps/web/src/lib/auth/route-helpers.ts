import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function normalizeRedirectPath(candidate: string | null | undefined) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/workspace";
  }

  return candidate;
}

export function redirectWithSearch(request: NextRequest, pathname: string, search?: Record<string, string>) {
  const url = new URL(normalizeRedirectPath(pathname), request.url);

  if (search) {
    Object.entries(search).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return NextResponse.redirect(url);
}
