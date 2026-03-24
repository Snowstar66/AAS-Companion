import {
  archiveGovernedObject,
  getGovernedRemovalState,
  hardDeleteGovernedObject,
  restoreGovernedObject
} from "@aas-companion/db";
import { failure, success, type ApiResult } from "./shared";

type GovernedEntityType = "outcome" | "epic" | "story";

export async function getGovernedRemovalStateService(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
}) {
  const state = await getGovernedRemovalState(input);

  if (!state) {
    return failure({
      code: "governed_object_not_found",
      message: "Governed object was not found in the current organization."
    });
  }

  return success(state);
}

export async function hardDeleteGovernedObjectService(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
  actorId?: string | null;
}): Promise<ApiResult<Awaited<ReturnType<typeof hardDeleteGovernedObject>>>> {
  try {
    return success(await hardDeleteGovernedObject(input));
  } catch (error) {
    return failure({
      code: "hard_delete_failed",
      message: error instanceof Error ? error.message : "Hard delete could not be completed."
    });
  }
}

export async function archiveGovernedObjectService(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
  actorId?: string | null;
  reason: string;
}): Promise<ApiResult<Awaited<ReturnType<typeof archiveGovernedObject>>>> {
  try {
    return success(await archiveGovernedObject(input));
  } catch (error) {
    return failure({
      code: "archive_failed",
      message: error instanceof Error ? error.message : "Archive could not be completed."
    });
  }
}

export async function restoreGovernedObjectService(input: {
  organizationId: string;
  entityType: GovernedEntityType;
  entityId: string;
  actorId?: string | null;
}): Promise<ApiResult<Awaited<ReturnType<typeof restoreGovernedObject>>>> {
  try {
    return success(await restoreGovernedObject(input));
  } catch (error) {
    return failure({
      code: "restore_failed",
      message: error instanceof Error ? error.message : "Restore could not be completed."
    });
  }
}
