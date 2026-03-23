import { cookies } from "next/headers";
import { DEMO_SESSION, DEMO_SESSION_COOKIE_NAME } from "@aas-companion/domain";
import { clearOrganizationContextCookie, setOrganizationContextCookie } from "@/lib/org-context";

const oneWeekInSeconds = 60 * 60 * 24 * 7;

export async function hasDemoSession() {
  const cookieStore = await cookies();

  return cookieStore.get(DEMO_SESSION_COOKIE_NAME)?.value === "demo";
}

export async function createDemoSession() {
  const cookieStore = await cookies();

  cookieStore.set(DEMO_SESSION_COOKIE_NAME, "demo", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneWeekInSeconds
  });

  await setOrganizationContextCookie(DEMO_SESSION.organization.organizationId);
}

export async function clearDemoSession() {
  const cookieStore = await cookies();

  cookieStore.delete(DEMO_SESSION_COOKIE_NAME);
  await clearOrganizationContextCookie();
}
