import { unstable_rethrow } from "next/navigation";
import { listOperationalActivityEventsService } from "@aas-companion/api";
import { requireOrganizationContext } from "@/lib/auth/guards";

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function loadOperationalLogs(limit = 40) {
  try {
    const organization = await requireOrganizationContext();
    const result = await listOperationalActivityEventsService({
      organizationId: organization.organizationId,
      limit
    });

    if (!result.ok) {
      return {
        state: "unavailable" as const,
        organizationName: organization.organizationName,
        items: [],
        message: result.errors[0]?.message ?? "Operational logs could not be loaded."
      };
    }

    return {
      state: "ready" as const,
      organizationName: organization.organizationName,
      items: result.data.map((event) => {
        const metadata = event.metadata ?? {};
        return {
          id: event.id,
          entityType: event.entityType,
          entityId: event.entityId,
          createdAt: event.createdAt,
          actorName: event.actor?.fullName ?? event.actor?.email ?? null,
          scope: readString(metadata.scope) ?? "operation",
          action: readString(metadata.action) ?? "unnamed_action",
          status: readString(metadata.status) ?? "info",
          summary: readString(metadata.summary) ?? "Operational event",
          detail: readString(metadata.detail) ?? null,
          durationMs: readNumber(metadata.durationMs),
          itemCount: readNumber(metadata.itemCount)
        };
      }),
      message: "Recent operational activity for the active project."
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      state: "unavailable" as const,
      organizationName: "Unknown project",
      items: [],
      message:
        error instanceof Error ? `Operational logs are unavailable right now: ${error.message}` : "Operational logs are unavailable right now."
    };
  }
}
