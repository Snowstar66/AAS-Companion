import { clearOperationalActivityEventsForOrganization, listOperationalActivityEventsForOrganization } from "@aas-companion/db";
import { success } from "./shared";

export async function listOperationalActivityEventsService(input: {
  organizationId: string;
  limit?: number;
}) {
  return success(await listOperationalActivityEventsForOrganization(input));
}

export async function clearOperationalActivityEventsService(input: {
  organizationId: string;
}) {
  return success(await clearOperationalActivityEventsForOrganization(input));
}
