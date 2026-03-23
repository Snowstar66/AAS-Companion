import { redirect } from "next/navigation";
import { getAppSession } from "./server";

export async function requireProtectedSession() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireOrganizationContext() {
  const session = await requireProtectedSession();

  if (!session.organization.organizationId) {
    redirect("/login?error=Missing%20organization%20context.");
  }

  return session.organization;
}
