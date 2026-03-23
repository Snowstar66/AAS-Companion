import type { NextRequest } from "next/server";
import { clearDemoSession } from "@/lib/auth/demo";
import { createRouteHandlerSupabaseClient } from "@/lib/auth/supabase/server";
import { redirectWithSearch } from "@/lib/auth/route-helpers";

export async function POST(request: NextRequest) {
  await clearDemoSession();

  const response = redirectWithSearch(request, "/login", { signedOut: "1" });
  const supabase = createRouteHandlerSupabaseClient(request, response);

  if (supabase) {
    await supabase.auth.signOut();
  }

  return response;
}
