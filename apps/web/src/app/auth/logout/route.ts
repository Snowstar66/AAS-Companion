import type { NextRequest } from "next/server";
import { clearDemoSession } from "@/lib/auth/demo";
import { clearLocalSession } from "@/lib/auth/local";
import { createRouteHandlerSupabaseClient } from "@/lib/auth/supabase/server";
import { clearOrganizationContextCookie } from "@/lib/org-context";
import { redirectWithSearch } from "@/lib/auth/route-helpers";

export async function POST(request: NextRequest) {
  await clearDemoSession();
  await clearLocalSession();
  await clearOrganizationContextCookie();

  const response = redirectWithSearch(request, "/login", { signedOut: "1" });
  const supabase = createRouteHandlerSupabaseClient(request, response);

  if (supabase) {
    await supabase.auth.signOut();
  }

  return response;
}
