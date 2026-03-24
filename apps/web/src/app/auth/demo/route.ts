import type { NextRequest } from "next/server";
import { normalizeRedirectPath, redirectWithSearch } from "@/lib/auth/route-helpers";
import { createDemoSession } from "@/lib/auth/demo";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const redirectTo = normalizeRedirectPath(String(formData.get("redirectTo") ?? "/"));

  await createDemoSession();

  return redirectWithSearch(request, redirectTo);
}
