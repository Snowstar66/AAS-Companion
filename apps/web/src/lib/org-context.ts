import { cookies } from "next/headers";
import type { OrganizationContext } from "@aas-companion/domain/organization";
import { ORG_CONTEXT_COOKIE_NAME } from "@aas-companion/domain/session-constants";

const oneWeekInSeconds = 60 * 60 * 24 * 7;

export function parseOrganizationContextCookie(value: string | null): OrganizationContext | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<OrganizationContext>;

    if (
      typeof parsed.organizationId === "string" &&
      typeof parsed.organizationName === "string" &&
      typeof parsed.organizationSlug === "string" &&
      typeof parsed.role === "string"
    ) {
      return {
        organizationId: parsed.organizationId,
        organizationName: parsed.organizationName,
        organizationSlug: parsed.organizationSlug,
        role: parsed.role as OrganizationContext["role"]
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function getOrganizationContextCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(ORG_CONTEXT_COOKIE_NAME)?.value ?? null;
}

export async function setOrganizationContextCookie(organization: string | OrganizationContext) {
  const cookieStore = await cookies();
  const serialized =
    typeof organization === "string"
      ? organization
      : JSON.stringify({
          organizationId: organization.organizationId,
          organizationName: organization.organizationName,
          organizationSlug: organization.organizationSlug,
          role: organization.role
        });

  cookieStore.set(ORG_CONTEXT_COOKIE_NAME, serialized, {
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
