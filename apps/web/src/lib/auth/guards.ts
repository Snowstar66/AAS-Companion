import { redirect } from "next/navigation";
import { getAppSession, getSignedInAccountIdentity } from "./server";

export async function requireProtectedSession() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireActiveProjectSession() {
  const session = await requireProtectedSession();

  if (!session.organization?.organizationId) {
    redirect("/?error=Select%20or%20create%20a%20project%20before%20entering%20work.");
  }

  return session as typeof session & {
    organization: NonNullable<typeof session.organization>;
  };
}

export async function requireOrganizationContext() {
  const session = await requireActiveProjectSession();
  return session.organization;
}

export async function requireProjectAccountIdentity() {
  const account = await getSignedInAccountIdentity();

  if (!account) {
    redirect("/login?redirectTo=%2F");
  }

  return account;
}
