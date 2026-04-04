import { listOperationalActivityEventsForOrganization } from "@aas-companion/db";
import { success } from "./shared";

export async function listOperationalActivityEventsService(input: {
  organizationId: string;
  limit?: number;
}) {
  return success(await listOperationalActivityEventsForOrganization(input));
}
