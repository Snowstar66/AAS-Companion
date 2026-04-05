import { createOutcome, getOutcomeById, listOutcomeReferences, updateOutcome } from "@aas-companion/db";
import { outcomeCreateInputSchema, outcomeUpdateInputSchema } from "@aas-companion/domain";
import { failure, success, type ApiResult } from "./shared";

export async function listOutcomesService(
  organizationId: string
): Promise<ApiResult<Awaited<ReturnType<typeof listOutcomeReferences>>>> {
  return success(await listOutcomeReferences(organizationId));
}

export async function getOutcomeService(
  organizationId: string,
  id: string
): Promise<ApiResult<Awaited<ReturnType<typeof getOutcomeById>>>> {
  return success(await getOutcomeById(organizationId, id));
}

export async function createOutcomeService(input: unknown) {
  const parsed = outcomeCreateInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_outcome",
      message: parsed.error.issues[0]?.message ?? "Outcome input is invalid."
    });
  }

  return success(await createOutcome(parsed.data));
}

export async function updateOutcomeService(input: unknown) {
  const parsed = outcomeUpdateInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_outcome_update",
      message: parsed.error.issues[0]?.message ?? "Outcome update input is invalid."
    });
  }

  return success(await updateOutcome(parsed.data));
}
