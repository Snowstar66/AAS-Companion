import {
  getProjectSpineSnapshot,
  listAgentRegistryEntries,
  listGovernanceRiskCombinationRules,
  listGovernanceRoleRequirements,
  listPartyRoleEntries
} from "@aas-companion/db";
import {
  buildGovernanceCoverageAssessment,
  buildPricingEvaluation,
  type AiAccelerationLevel
} from "@aas-companion/domain";
import { failure, success } from "./shared";

export type PricingWorkspaceData = {
  organizationId: string;
  selectedOutcome: {
    id: string;
    key: string;
    title: string;
    problemStatement: string | null;
    outcomeStatement: string | null;
    baselineDefinition: string | null;
    baselineSource: string | null;
    timeframe: string | null;
    aiAccelerationLevel: AiAccelerationLevel;
    riskProfile: string;
  } | null;
  availableOutcomes: Array<{
    id: string;
    key: string;
    title: string;
    aiAccelerationLevel: AiAccelerationLevel;
  }>;
  summary: {
    outcomeCount: number;
    epicCount: number;
    storyCount: number;
    importedLineageCount: number;
  };
  signals: {
    baseline: {
      value: "yes" | "no";
      detail: string;
    };
    outcomeClarity: {
      value: "clear" | "unclear";
      detail: string;
    };
    scopeStability: {
      value: "stable" | "unstable";
      detail: string;
    };
    aiLevel: {
      value: AiAccelerationLevel | null;
      detail: string;
    };
  };
  governance: {
    selectedAiLevel: AiAccelerationLevel;
    status: "supports_selected_level" | "needs_attention" | "does_not_support_selected_level";
    summaryTitle: string;
    summaryMessage: string;
  };
  evaluation: ReturnType<typeof buildPricingEvaluation>;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function countImportedLineage(input: {
  lineageSourceType: string | null | undefined;
  stories?: Array<{ lineageSourceType: string | null | undefined }>;
  epics?: Array<{
    lineageSourceType: string | null | undefined;
    stories?: Array<{ lineageSourceType: string | null | undefined }>;
  }>;
}) {
  let count = input.lineageSourceType === "artifact_aas_candidate" ? 1 : 0;

  for (const epic of input.epics ?? []) {
    if (epic.lineageSourceType === "artifact_aas_candidate") {
      count += 1;
    }

    for (const story of epic.stories ?? []) {
      if (story.lineageSourceType === "artifact_aas_candidate") {
        count += 1;
      }
    }
  }

  for (const story of input.stories ?? []) {
    if (story.lineageSourceType === "artifact_aas_candidate") {
      count += 1;
    }
  }

  return count;
}

function getSelectedOutcome<T extends { id: string; lifecycleState: string }>(input: {
  outcomes: T[];
  outcomeId?: string;
}) {
  return (
    input.outcomes.find((outcome) => outcome.id === input.outcomeId) ??
    input.outcomes.find((outcome) => outcome.lifecycleState === "active") ??
    input.outcomes[0] ??
    null
  );
}

export async function getProjectPricingWorkspaceService(input: {
  organizationId: string;
  outcomeId?: string;
}) {
  try {
    const snapshot = await getProjectSpineSnapshot(input.organizationId);

    if (!snapshot) {
      return failure({
        code: "workspace_not_found",
        message: "No governed project snapshot was found for this organization."
      });
    }

    const selectedOutcome = getSelectedOutcome({
      outcomes: snapshot.organization.outcomes,
      ...(input.outcomeId ? { outcomeId: input.outcomeId } : {})
    });

    const governanceAiLevel = selectedOutcome?.aiAccelerationLevel ?? "level_2";
    const [people, agents, requirements, riskRules] = await Promise.all([
      listPartyRoleEntries(input.organizationId, { includeInactive: true }),
      listAgentRegistryEntries(input.organizationId, { includeInactive: true }),
      listGovernanceRoleRequirements(input.organizationId),
      listGovernanceRiskCombinationRules(input.organizationId)
    ]);
    const governance = buildGovernanceCoverageAssessment({
      aiAccelerationLevel: governanceAiLevel,
      requirements,
      riskRules,
      people,
      agents
    });

    const selectedEpics = selectedOutcome?.epics ?? [];
    const selectedStories =
      selectedEpics.flatMap((epic) => epic.stories) ??
      [];
    const baselineComplete = Boolean(
      selectedOutcome && hasText(selectedOutcome.baselineDefinition) && hasText(selectedOutcome.baselineSource)
    );
    const outcomeClear = Boolean(
      selectedOutcome && hasText(selectedOutcome.problemStatement) && hasText(selectedOutcome.outcomeStatement)
    );
    const stableEpicCount = selectedEpics.filter((epic) => hasText(epic.scopeBoundary)).length;
    const riskyEpicCount = selectedEpics.filter((epic) => hasText(epic.riskNote)).length;
    const scopeStable = Boolean(
      selectedOutcome &&
        hasText(selectedOutcome.timeframe) &&
        selectedEpics.length > 0 &&
        stableEpicCount === selectedEpics.length &&
        riskyEpicCount === 0
    );
    const importedLineageCount = selectedOutcome
      ? countImportedLineage({
          lineageSourceType: selectedOutcome.lineageSourceType,
          epics: selectedEpics,
          stories: selectedOutcome.stories
        })
      : 0;

    const evaluation = buildPricingEvaluation({
      hasBaseline: baselineComplete,
      outcomeClear,
      scopeStable,
      aiAccelerationLevel: selectedOutcome?.aiAccelerationLevel ?? null,
      governanceStatus: governance.validation.status,
      hasValueSpineContext: Boolean(selectedOutcome),
      importedLineageCount
    });

    return success<PricingWorkspaceData>({
      organizationId: input.organizationId,
      selectedOutcome: selectedOutcome
        ? {
            id: selectedOutcome.id,
            key: selectedOutcome.key,
            title: selectedOutcome.title,
            problemStatement: selectedOutcome.problemStatement ?? null,
            outcomeStatement: selectedOutcome.outcomeStatement ?? null,
            baselineDefinition: selectedOutcome.baselineDefinition ?? null,
            baselineSource: selectedOutcome.baselineSource ?? null,
            timeframe: selectedOutcome.timeframe ?? null,
            aiAccelerationLevel: selectedOutcome.aiAccelerationLevel,
            riskProfile: selectedOutcome.riskProfile
          }
        : null,
      availableOutcomes: snapshot.organization.outcomes.map((outcome) => ({
        id: outcome.id,
        key: outcome.key,
        title: outcome.title,
        aiAccelerationLevel: outcome.aiAccelerationLevel
      })),
      summary: {
        outcomeCount: snapshot.organization.outcomes.length,
        epicCount: selectedEpics.length,
        storyCount: selectedStories.length,
        importedLineageCount
      },
      signals: {
        baseline: {
          value: baselineComplete ? "yes" : "no",
          detail: baselineComplete
            ? "Baseline definition and source are both present."
            : "Baseline definition and source are not yet both visible."
        },
        outcomeClarity: {
          value: outcomeClear ? "clear" : "unclear",
          detail: outcomeClear
            ? "Problem statement and outcome statement are both visible."
            : "The business problem and intended effect are not yet clear enough together."
        },
        scopeStability: {
          value: scopeStable ? "stable" : "unstable",
          detail: scopeStable
            ? "Timeframe is visible and the current epics all carry explicit scope boundaries without open risk notes."
            : "Scope still looks unstable because timeframe, scope boundaries or risk notes are not yet clean."
        },
        aiLevel: {
          value: selectedOutcome?.aiAccelerationLevel ?? null,
          detail: selectedOutcome
            ? `Current Framing branch is set to ${selectedOutcome.aiAccelerationLevel.replaceAll("_", " ")}.`
            : "No active Framing branch is selected yet, so pricing falls back to a cautious posture."
        }
      },
      governance: {
        selectedAiLevel: governanceAiLevel,
        status: governance.validation.status,
        summaryTitle: governance.validation.summaryTitle,
        summaryMessage: governance.validation.summaryMessage
      },
      evaluation
    });
  } catch (error) {
    return failure({
      code: "pricing_unavailable",
      message: error instanceof Error ? error.message : "Pricing workspace is unavailable."
    });
  }
}
