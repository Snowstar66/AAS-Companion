import { unstable_rethrow } from "next/navigation";
import { cookies } from "next/headers";
import { getHumanReviewDashboardService } from "@aas-companion/api";
import { requireOrganizationContext } from "@/lib/auth/guards";

type AppLanguage = "en" | "sv";

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export async function loadOperationalReviewDashboard() {
  try {
    const language = await getServerLanguage();
    const organization = await requireOrganizationContext();
    const result = await getHumanReviewDashboardService(organization.organizationId);

    if (!result.ok) {
      return {
        state: "unavailable" as const,
        organizationName: organization.organizationName,
        items: [],
        summary: {
          total: 0,
          blocked: 0,
          inProgress: 0,
          deliveryStartReady: 0,
          outcomeTollgates: 0,
          storyReviews: 0
        },
        message: result.errors[0]?.message ?? t(language, "Operational review could not be loaded.", "Operativ review kunde inte laddas.")
      };
    }

    return {
      state: "ready" as const,
      organizationName: result.data.organizationName,
      items: result.data.items,
      summary: result.data.summary,
      message:
        result.data.items.length > 0
          ? t(language, "Framing approvals and Delivery Story reviews with human work are collected here.", "Framing-godkannanden och Delivery Story-granskningar med manskligt arbete samlas har.")
          : t(language, "No Framing approvals or Delivery Story reviews are currently waiting for human action.", "Inga Framing-godkannanden eller Delivery Story-granskningar vantar just nu pa mansklig hantering.")
    };
  } catch (error) {
    unstable_rethrow(error);
    const language = await getServerLanguage();

    return {
      state: "unavailable" as const,
      organizationName: t(language, "Unknown project", "Okant projekt"),
      items: [],
      summary: {
        total: 0,
        blocked: 0,
        inProgress: 0,
        deliveryStartReady: 0,
        outcomeTollgates: 0,
        storyReviews: 0
      },
      message:
        error instanceof Error
          ? t(language, `Operational review is unavailable right now: ${error.message}`, `Operativ review ar inte tillganglig just nu: ${error.message}`)
          : t(language, "Operational review is unavailable right now.", "Operativ review ar inte tillganglig just nu.")
    };
  }
}
