import { getOutcomeFramingReadiness } from "@aas-companion/domain";
import { createOutcome, getPreferredFramingOutcomeId, listOutcomeCockpitEntries, listOutcomes } from "@aas-companion/db";
import { logDevTiming, withDevTiming } from "./dev-timing";
import { success, type ApiResult } from "./shared";

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
  directionSeedCount: number;
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

function buildNextOutcomeKey(existingKeys: string[]) {
  const numericKeys = existingKeys
    .map((key) => /^OUT-(\d+)$/.exec(key)?.[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  const nextNumber = (numericKeys.length > 0 ? Math.max(...numericKeys) : 0) + 1;
  return `OUT-${String(nextNumber).padStart(3, "0")}`;
}

export async function createCleanDraftOutcomeFromFramingService(input: {
  organizationId: string;
  actorId?: string | null;
}): Promise<ApiResult<Awaited<ReturnType<typeof createOutcome>>>> {
  const existingOutcomes = await listOutcomes(input.organizationId, { includeArchived: true });
  const key = buildNextOutcomeKey(existingOutcomes.map((outcome) => outcome.key));

  return success(
    await createOutcome({
      organizationId: input.organizationId,
      key,
      title: "New customer case",
      riskProfile: "medium",
      aiAccelerationLevel: "level_2",
      status: "draft",
      originType: "native",
      createdMode: "clean",
      actorId: input.actorId ?? null
    })
  );
}

export async function getPreferredFramingOutcomeIdService(organizationId: string) {
  return withDevTiming("api.getPreferredFramingOutcomeIdService", () => getPreferredFramingOutcomeId(organizationId), `organizationId=${organizationId}`);
}

export async function getFramingCockpitData(
  organizationId: string,
  organizationName: string
): Promise<FramingCockpitData> {
  return withDevTiming("api.getFramingCockpitData", async () => {
    try {
      const entries = await listOutcomeCockpitEntries(organizationId);
      const mapStartedAt = Date.now();
      const items: FramingOutcomeItem[] = entries.map((entry) => {
        const readiness = getOutcomeFramingReadiness({
          title: entry.title,
          outcomeStatement: entry.outcomeStatement ?? null,
          baselineDefinition: entry.baselineDefinition ?? null,
          valueOwnerId: entry.valueOwnerId ?? null,
          aiUsageRole:
            entry.aiUsageRole === "support" ||
            entry.aiUsageRole === "generation" ||
            entry.aiUsageRole === "validation" ||
            entry.aiUsageRole === "decision_support" ||
            entry.aiUsageRole === "automation"
              ? entry.aiUsageRole
              : null,
          aiExecutionPattern:
            entry.aiExecutionPattern === "assisted" ||
            entry.aiExecutionPattern === "step_by_step" ||
            entry.aiExecutionPattern === "orchestrated"
              ? entry.aiExecutionPattern
              : null,
          aiUsageIntent: entry.aiUsageIntent ?? null,
          businessImpactLevel: entry.businessImpactLevel ?? null,
          businessImpactRationale: entry.businessImpactRationale ?? null,
          dataSensitivityLevel: entry.dataSensitivityLevel ?? null,
          dataSensitivityRationale: entry.dataSensitivityRationale ?? null,
          blastRadiusLevel: entry.blastRadiusLevel ?? null,
          blastRadiusRationale: entry.blastRadiusRationale ?? null,
          decisionImpactLevel: entry.decisionImpactLevel ?? null,
          decisionImpactRationale: entry.decisionImpactRationale ?? null,
          aiLevelJustification: entry.aiLevelJustification ?? null,
          riskAcceptedAt: entry.riskAcceptedAt ?? null,
          riskAcceptedByValueOwnerId: entry.riskAcceptedByValueOwnerId ?? null,
          riskProfile: entry.riskProfile,
          aiAccelerationLevel: entry.aiAccelerationLevel,
          status: entry.status,
          epicCount: entry._count.epics
        });
        const tollgateBlockers = entry.tollgates
          .filter((tollgate) => tollgate.status === "blocked")
          .flatMap((tollgate) => tollgate.blockers);
        const blockers = [...new Set([...readiness.reasons.map((reason) => reason.message), ...tollgateBlockers])];
        const missingBaselineFields = countMissingBaselineFields(entry);
        const isBlocked = blockers.length > 0 || readiness.state === "blocked";

        let readinessLabel = "Ready for framing review";
        let readinessTone: FramingReadinessTone = "ready";
        let readinessDetail = "Framing brief is complete enough to continue toward Tollgate review.";

        if (isBlocked) {
          readinessLabel = "Blocked";
          readinessTone = "blocked";
          readinessDetail =
            blockers[0] ??
            `${missingBaselineFields} baseline field${missingBaselineFields === 1 ? "" : "s"} still missing.`;
        } else if (readiness.state === "in_progress") {
          readinessLabel = "In progress";
          readinessTone = "progress";
          readinessDetail = "Framing has started, but the brief is not yet complete enough for Tollgate submission.";
        }

        return {
          id: entry.id,
          key: entry.key,
          title: entry.title,
          originType: entry.originType,
          importedReadinessState: entry.importedReadinessState ?? null,
          lineageHref:
            entry.lineageSourceType === "artifact_aas_candidate" && entry.lineageSourceId
              ? `/intake?candidateId=${entry.lineageSourceId}&entityId=${entry.id}&entityType=outcome`
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
          directionSeedCount: entry._count.directionSeeds,
          updatedAtLabel: formatUpdatedAt(entry.updatedAt),
          detailHref: `/framing?outcomeId=${entry.id}`
        };
      });
      logDevTiming("api.getFramingCockpitData.mapItems", mapStartedAt, `count=${items.length}`);

      if (items.length === 0) {
        return {
          state: "empty",
          organizationName,
          message: "Start a clean native case from Framing to begin work in this project.",
          items,
          summary: createSummary(items)
        };
      }

      return {
        state: "live",
        organizationName,
        message: "Framing stays isolated to the active project and only shows work that belongs here.",
        items,
        summary: createSummary(items)
      };
    } catch (error) {
      return {
        state: "unavailable",
        organizationName,
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
  }, `organizationId=${organizationId}`);
}
