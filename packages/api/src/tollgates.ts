import { getTollgate, upsertTollgate } from "@aas-companion/db";
import { tollgateUpsertInputSchema } from "@aas-companion/domain";
import { failure, success, type ApiResult } from "./shared";

export async function getTollgateService(
  organizationId: string,
  entityType: string,
  entityId: string,
  tollgateType: string
): Promise<ApiResult<Awaited<ReturnType<typeof getTollgate>>>> {
  return success(await getTollgate(organizationId, entityType, entityId, tollgateType));
}

export async function recordTollgateService(input: unknown) {
  const parsed = tollgateUpsertInputSchema.safeParse(input);

  if (!parsed.success) {
    return failure({
      code: "invalid_tollgate",
      message: parsed.error.issues[0]?.message ?? "Tollgate input is invalid."
    });
  }

  return success(await upsertTollgate(parsed.data));
}
