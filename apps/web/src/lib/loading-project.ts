import { getOrganizationContextCookie, parseOrganizationContextCookie } from "@/lib/org-context";

export async function getLoadingProjectName() {
  const serializedContext = await getOrganizationContextCookie();
  return parseOrganizationContextCookie(serializedContext)?.organizationName ?? null;
}
