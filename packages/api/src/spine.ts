import { getProjectSpineSnapshot } from "@aas-companion/db";
import { withDevTiming } from "./dev-timing";
import { failure, success } from "./shared";

export async function getValueSpineService(organizationId: string) {
  return withDevTiming("api.getValueSpineService", async () => {
    try {
      const snapshot = await getProjectSpineSnapshot(organizationId);

      if (!snapshot) {
        return failure({
          code: "workspace_not_found",
          message: "No governed project snapshot was found for this organization."
        });
      }

      return success(snapshot);
    } catch (error) {
      return failure({
        code: "workspace_unavailable",
        message: error instanceof Error ? error.message : "Project snapshot is unavailable."
      });
    }
  }, `organizationId=${organizationId}`);
}
