import { notFound } from "next/navigation";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { FramingOutcomeSection } from "@/components/framing/framing-outcome-section";
import { AppShell } from "@/components/layout/app-shell";
import { requireOrganizationContext } from "@/lib/auth/guards";
import { getCachedOutcomeWorkspaceData } from "@/lib/cache/project-data";
import { runFramingAgentAction } from "../../framing/actions";
import {
  archiveOutcomeAction,
  createEpicFromOutcomeAction,
  createStoryIdeaFromOutcomeAction,
  hardDeleteOutcomeAction,
  recordOutcomeTollgateDecisionAction,
  reviewOutcomeFramingWithAiAction,
  restoreOutcomeAction,
  saveOutcomeWorkspaceInlineAction,
  saveOutcomeWorkspaceAction,
  validateBaselineDefinitionAiAction,
  validateOutcomeStatementAiAction
} from "./actions";

type OutcomeWorkspacePageProps = {
  params: Promise<{ outcomeId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OutcomeWorkspacePage({ params, searchParams }: OutcomeWorkspacePageProps) {
  const organization = await requireOrganizationContext();
  const { outcomeId } = await params;
  const query = searchParams ? await searchParams : {};
  const outcomeResult = await getCachedOutcomeWorkspaceData(organization.organizationId, outcomeId);

  if (!outcomeResult.ok) {
    notFound();
  }

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Outcome",
        badge: outcomeResult.data.outcome.key
      }}
    >
      <PageViewAnalytics
        eventName="outcome_workspace_viewed"
        properties={{ outcomeId: outcomeResult.data.outcome.id, outcomeKey: outcomeResult.data.outcome.key }}
      />
      <FramingOutcomeSection
          archiveAction={archiveOutcomeAction}
          createEpicAction={createEpicFromOutcomeAction}
          createStoryIdeaAction={createStoryIdeaFromOutcomeAction}
          data={outcomeResult.data}
        hardDeleteAction={hardDeleteOutcomeAction}
        recordTollgateDecisionAction={recordOutcomeTollgateDecisionAction}
        restoreAction={restoreOutcomeAction}
        runAgentAction={runFramingAgentAction}
        saveAction={saveOutcomeWorkspaceAction}
        saveInlineAction={saveOutcomeWorkspaceInlineAction}
        search={{
          aiConfidence: (getParamValue(query.aiConfidence) as "high" | "medium" | "low" | null) ?? null,
          aiError: getParamValue(query.aiError) ?? null,
          aiField: (getParamValue(query.aiField) as "outcome_statement" | "baseline_definition" | null) ?? null,
          aiReason: getParamValue(query.aiReason) ?? null,
          aiSuggestion: getParamValue(query.aiSuggestion) ?? null,
          aiVerdict: (getParamValue(query.aiVerdict) as "good" | "needs_revision" | "unclear" | null) ?? null,
          blockersFromQuery: getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [],
          created: getParamValue(query.created) === "1",
          draftBaselineDefinition: getParamValue(query.draftBaselineDefinition) ?? null,
          draftOutcomeStatement: getParamValue(query.draftOutcomeStatement) ?? null,
          lifecycleState: getParamValue(query.lifecycle) ?? null,
          saveMessage: getParamValue(query.message) ?? null,
          saveState: getParamValue(query.save) ?? null,
          submitState: getParamValue(query.submit) ?? null
        }}
        initialReviewFramingState={{ status: "idle", message: null, report: null }}
        reviewFramingAction={reviewOutcomeFramingWithAiAction}
        validateBaselineDefinitionAiAction={validateBaselineDefinitionAiAction}
        validateOutcomeStatementAiAction={validateOutcomeStatementAiAction}
      />
    </AppShell>
  );
}
