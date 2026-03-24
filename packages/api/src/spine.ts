import { DEMO_ORGANIZATION } from "@aas-companion/domain";
import { getWorkspaceSnapshot } from "@aas-companion/db";
import { failure, success } from "./shared";

export async function getValueSpineService(organizationId: string = DEMO_ORGANIZATION.organizationId) {
  try {
    const snapshot = await getWorkspaceSnapshot(organizationId);

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
}
