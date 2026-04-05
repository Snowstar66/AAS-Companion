import { unstable_rethrow } from "next/navigation";
import { listOperationalActivityEventsService } from "@aas-companion/api";
import { requireOrganizationContext } from "@/lib/auth/guards";

type AppLanguage = "en" | "sv";

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function translate(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

export async function loadOperationalLogs(limit = 40, language: AppLanguage = "en") {
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
        message: result.errors[0]?.message ?? translate(language, "Operational logs could not be loaded.", "Operativa loggar kunde inte laddas.")
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
          scope: readString(metadata.scope) ?? translate(language, "operation", "operation"),
          action: readString(metadata.action) ?? translate(language, "unnamed_action", "namnlös_åtgärd"),
          status: readString(metadata.status) ?? translate(language, "info", "info"),
          summary: readString(metadata.summary) ?? translate(language, "Operational event", "Operativ händelse"),
          detail: readString(metadata.detail) ?? null,
          durationMs: readNumber(metadata.durationMs),
          itemCount: readNumber(metadata.itemCount)
        };
      }),
      message: translate(language, "Recent operational activity for the active project.", "Senaste operativa aktiviteten för det aktiva projektet.")
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      state: "unavailable" as const,
      organizationName: translate(language, "Unknown project", "Okänt projekt"),
      items: [],
      message:
        error instanceof Error
          ? translate(language, `Operational logs are unavailable right now: ${error.message}`, `Operativa loggar är inte tillgängliga just nu: ${error.message}`)
          : translate(language, "Operational logs are unavailable right now.", "Operativa loggar är inte tillgängliga just nu.")
    };
  }
}
