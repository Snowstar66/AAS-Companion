import { z } from "zod";
import { isLocalAuthEnabled } from "@aas-companion/config";
import { upsertAppUserByEmail } from "@aas-companion/db";
import { clearDemoSession } from "@/lib/auth/demo";
import { createLocalSession } from "@/lib/auth/local";
import { clearOrganizationContextCookie } from "@/lib/org-context";
import { normalizeRedirectPath, redirectWithSearch } from "@/lib/auth/route-helpers";
import type { NextRequest } from "next/server";

const localSignInSchema = z.object({
  email: z.string().email(),
  fullName: z.string().trim().optional()
});

export async function POST(request: NextRequest) {
  if (!isLocalAuthEnabled(process.env)) {
    return redirectWithSearch(request, "/login", {
      error: "Local auth is disabled in this environment."
    });
  }

  const formData = await request.formData();
  const parsed = localSignInSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName")
  });
  const redirectTo = normalizeRedirectPath(String(formData.get("redirectTo") ?? "/"));

  if (!parsed.success) {
    return redirectWithSearch(request, "/login", {
      error: "Enter a valid email address for local sign-in."
    });
  }

  const user = await upsertAppUserByEmail({
    email: parsed.data.email,
    ...(parsed.data.fullName ? { fullName: parsed.data.fullName } : {})
  });

  await clearDemoSession();
  await clearOrganizationContextCookie();
  await createLocalSession(user.id);

  return redirectWithSearch(request, redirectTo);
}
