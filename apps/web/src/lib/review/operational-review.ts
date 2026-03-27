import { unstable_rethrow } from "next/navigation";
import { getHumanReviewDashboardService } from "@aas-companion/api";
import { requireOrganizationContext } from "@/lib/auth/guards";

export async function loadOperationalReviewDashboard() {
  try {
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
          handoffReady: 0,
          outcomeTollgates: 0,
          storyReviews: 0
        },
        message: result.errors[0]?.message ?? "Operational review could not be loaded."
      };
    }

    return {
      state: "ready" as const,
      organizationName: result.data.organizationName,
      items: result.data.items,
      summary: result.data.summary,
      message:
        result.data.items.length > 0
          ? "Stories, handoffs and tollgates with human work are collected here."
          : "No story approvals, handoffs or tollgates are currently waiting for human action."
    };
  } catch (error) {
    unstable_rethrow(error);

    return {
      state: "unavailable" as const,
      organizationName: "Unknown project",
      items: [],
      summary: {
        total: 0,
        blocked: 0,
        inProgress: 0,
        handoffReady: 0,
        outcomeTollgates: 0,
        storyReviews: 0
      },
      message:
        error instanceof Error ? `Operational review is unavailable right now: ${error.message}` : "Operational review is unavailable right now."
    };
  }
}
