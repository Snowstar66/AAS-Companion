import { DEMO_ORGANIZATION, getOutcomeBaselineReadiness } from "@aas-companion/domain";
import { listOutcomeCockpitEntries } from "@aas-companion/db";

export type FramingReadinessTone = "blocked" | "progress" | "ready";

export type FramingOutcomeItem = {
  id: string;
  key: string;
  title: string;
  originType: string;
  importedReadinessState: string | null;
  lineageHref: string | null;
  status: string;
  statusLabel: string;
  readinessLabel: string;
  readinessTone: FramingReadinessTone;
  readinessDetail: string;
  isBlocked: boolean;
  blockers: string[];
  baselineComplete: boolean;
  ownerLabel: string;
  timeframe: string | null;
  epicCount: number;
  storyCount: number;
  updatedAtLabel: string;
  detailHref: string;
};

export type FramingSummary = {
  total: number;
  blocked: number;
  ready: number;
};

export type FramingCockpitData =
  | {
      state: "live" | "empty";
      organizationName: string;
      message: string;
      items: FramingOutcomeItem[];
      summary: FramingSummary;
    }
  | {
      state: "unavailable";
      organizationName: string;
      message: string;
      items: FramingOutcomeItem[];
      summary: FramingSummary;
    };

const statusLabels: Record<string, string> = {
  draft: "Draft",
  baseline_in_progress: "Baseline In Progress",
  ready_for_tg1: "Ready For TG1",
  active: "Active"
};

function formatUpdatedAt(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(value);
}

function countMissingBaselineFields(item: {
  baselineDefinition: string | null;
  baselineSource: string | null;
}) {
  return [item.baselineDefinition, item.baselineSource].filter((value) => !value).length;
}

function createSummary(items: FramingOutcomeItem[]): FramingSummary {
  return {
    total: items.length,
    blocked: items.filter((item) => item.isBlocked).length,
    ready: items.filter((item) => item.readinessTone === "ready").length
  };
}

export async function getFramingCockpitData(
  organizationId: string = DEMO_ORGANIZATION.organizationId
): Promise<FramingCockpitData> {
  try {
    const entries = await listOutcomeCockpitEntries(organizationId);

    const items: FramingOutcomeItem[] = entries.map((entry) => {
      const readiness = getOutcomeBaselineReadiness(entry);
      const tollgateBlockers = entry.tollgates
        .filter((tollgate) => tollgate.status === "blocked")
        .flatMap((tollgate) => tollgate.blockers);
      const blockers = [...new Set([...readiness.reasons.map((reason) => reason.message), ...tollgateBlockers])];
      const missingBaselineFields = countMissingBaselineFields(entry);
      const isBlocked = blockers.length > 0 || readiness.state === "blocked";

      let readinessLabel = "Ready for framing review";
      let readinessTone: FramingReadinessTone = "ready";
      let readinessDetail = "Baseline fields are present and the outcome can continue toward TG1.";

      if (isBlocked) {
        readinessLabel = "Blocked";
        readinessTone = "blocked";
        readinessDetail =
          blockers[0] ??
          `${missingBaselineFields} baseline field${missingBaselineFields === 1 ? "" : "s"} still missing.`;
      } else if (readiness.state === "in_progress") {
        readinessLabel = "In progress";
        readinessTone = "progress";
        readinessDetail = "Framing has started, but the outcome is not yet marked ready for TG1.";
      }

      return {
        id: entry.id,
        key: entry.key,
        title: entry.title,
        originType: entry.originType,
        importedReadinessState: entry.importedReadinessState ?? null,
        lineageHref:
          entry.lineageSourceType === "artifact_aas_candidate" && entry.lineageSourceId
            ? `/review?candidateId=${entry.lineageSourceId}`
            : null,
        status: entry.status,
        statusLabel: statusLabels[entry.status] ?? entry.status,
        readinessLabel,
        readinessTone,
        readinessDetail,
        isBlocked,
        blockers,
        baselineComplete: missingBaselineFields === 0,
        ownerLabel: entry.valueOwner?.fullName ?? entry.valueOwner?.email ?? "Unassigned",
        timeframe: entry.timeframe,
        epicCount: entry._count.epics,
        storyCount: entry._count.stories,
        updatedAtLabel: formatUpdatedAt(entry.updatedAt),
        detailHref: `/outcomes/${entry.id}`
      };
    });

    if (items.length === 0) {
      return {
        state: "empty",
        organizationName: DEMO_ORGANIZATION.organizationName,
        message: "No outcomes exist yet. Create the first framing record to start the cockpit.",
        items,
        summary: createSummary(items)
      };
    }

    return {
      state: "live",
      organizationName: DEMO_ORGANIZATION.organizationName,
      message: "Outcome framing data is available and filterable.",
      items,
      summary: createSummary(items)
    };
  } catch (error) {
    return {
      state: "unavailable",
      organizationName: DEMO_ORGANIZATION.organizationName,
      message:
        error instanceof Error
          ? `Framing data is unavailable right now: ${error.message}`
          : "Framing data is unavailable right now.",
      items: [],
      summary: {
        total: 0,
        blocked: 0,
        ready: 0
      }
    };
  }
}
