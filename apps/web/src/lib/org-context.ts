import { cookies } from "next/headers";
import { ORG_CONTEXT_COOKIE_NAME } from "@aas-companion/domain";

const oneWeekInSeconds = 60 * 60 * 24 * 7;

export async function getOrganizationContextCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(ORG_CONTEXT_COOKIE_NAME)?.value ?? null;
}

export async function setOrganizationContextCookie(organizationId: string) {
  const cookieStore = await cookies();

  cookieStore.set(ORG_CONTEXT_COOKIE_NAME, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: oneWeekInSeconds
  });
}

export async function clearOrganizationContextCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ORG_CONTEXT_COOKIE_NAME);
}
