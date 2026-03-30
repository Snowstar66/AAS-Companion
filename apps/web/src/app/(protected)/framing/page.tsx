import Link from "next/link";
import { getOutcomeWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { FramingOutcomeSection } from "@/components/framing/framing-outcome-section";
import { AppShell } from "@/components/layout/app-shell";
import { FramingCockpit } from "@/components/framing/framing-cockpit";
import { FramingRightRail } from "@/components/framing/framing-right-rail";
import { loadFramingCockpit } from "@/lib/framing/cockpit";
import { withDevTiming } from "@/lib/dev-timing";
import { createDraftOutcomeAction } from "./actions";
import {
  archiveOutcomeAction,
  createEpicFromOutcomeAction,
  hardDeleteOutcomeAction,
  reviewOutcomeFramingWithAiAction,
  restoreOutcomeAction,
  saveOutcomeWorkspaceInlineAction,
  saveOutcomeWorkspaceAction,
  submitOutcomeTollgateAction,
  validateBaselineDefinitionAiAction,
  validateOutcomeStatementAiAction
} from "../outcomes/[outcomeId]/actions";

type FramingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FramingPage({ searchParams }: FramingPageProps) {
  return withDevTiming("web.page.framing", async () => {
    const query = searchParams ? await searchParams : {};
    const requestedOutcomeId = getParamValue(query.outcomeId) ?? null;
    const { cockpit, session, requestedOutcome, resolvedOutcomeId } = await loadFramingCockpit(requestedOutcomeId);
    const originFilter = getParamValue(query.origin) ?? "native";
    const readinessFilter = getParamValue(query.readiness) ?? "all";
    const outcomeId =
      resolvedOutcomeId ??
      cockpit.items.find((item) => item.originType === "native")?.id ??
      cockpit.items[0]?.id;
    const selectedOutcome =
      requestedOutcome ??
      (outcomeId ? await getOutcomeWorkspaceService(session.organization.organizationId, outcomeId) : null);
    const selectedOutcomeData = selectedOutcome?.ok ? selectedOutcome.data : null;
    const selectedOutcomeError = selectedOutcome && !selectedOutcome.ok ? selectedOutcome.errors[0]?.message : null;
    const operationalItems = cockpit.items.filter((item) => item.originType !== "seeded");
    const hasDemoItems = cockpit.items.some((item) => item.originType === "seeded");
    const showCompactSwitcher = cockpit.state === "live" && (operationalItems.length > 1 || hasDemoItems);
    const demoItem = cockpit.items.find((item) => item.originType === "seeded") ?? null;

    return (
      <AppShell
        hideRightRail={Boolean(selectedOutcomeData)}
        rightRail={selectedOutcomeData ? undefined : <FramingRightRail summary={cockpit.summary} />}
        topbarProps={{
          projectName: cockpit.organizationName,
          sectionLabel: "Framing",
          badge: cockpit.state === "live" ? "Project section" : "Unavailable"
        }}
      >
        <PageViewAnalytics
          eventName="framing_cockpit_viewed"
          properties={{
            organizationName: cockpit.organizationName,
            state: cockpit.state
          }}
        />
        {cockpit.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Framing data is unavailable</CardTitle>
              <CardDescription>The route is online, but the cockpit could not load its organization data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{cockpit.message}</p>
              <Button asChild className="gap-2" variant="secondary">
                <Link href="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedOutcomeError ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Selected Framing could not be loaded</CardTitle>
                  <CardDescription>{selectedOutcomeError}</CardDescription>
                </CardHeader>
              </Card>
            ) : null}
            {selectedOutcomeData ? (
              <FramingOutcomeSection
                archiveAction={archiveOutcomeAction}
                createEpicAction={createEpicFromOutcomeAction}
                data={selectedOutcomeData}
                embeddedInFraming
                hardDeleteAction={hardDeleteOutcomeAction}
                restoreAction={restoreOutcomeAction}
                saveAction={saveOutcomeWorkspaceAction}
                saveInlineAction={saveOutcomeWorkspaceInlineAction}
                search={{
                  aiConfidence: (getParamValue(query.aiConfidence) as "high" | "medium" | "low" | null) ?? null,
                  aiError: getParamValue(query.aiError) ?? null,
                  aiField: (getParamValue(query.aiField) as "outcome_statement" | "baseline_definition" | null) ?? null,
                  aiReason: getParamValue(query.aiReason) ?? null,
                  aiSuggestion: getParamValue(query.aiSuggestion) ?? null,
                  aiVerdict: (getParamValue(query.aiVerdict) as "good" | "needs_revision" | "unclear" | null) ?? null,
                  draftBaselineDefinition: getParamValue(query.draftBaselineDefinition) ?? null,
                  draftOutcomeStatement: getParamValue(query.draftOutcomeStatement) ?? null,
                  blockersFromQuery: getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [],
                  created: getParamValue(query.created) === "1",
                  lifecycleState: getParamValue(query.lifecycle) ?? null,
                  saveMessage: getParamValue(query.message) ?? null,
                  saveState: getParamValue(query.save) ?? null,
                  submitState: getParamValue(query.submit) ?? null
                }}
                submitTollgateAction={submitOutcomeTollgateAction}
                initialReviewFramingState={{ status: "idle", message: null, report: null }}
                reviewFramingAction={reviewOutcomeFramingWithAiAction}
                validateBaselineDefinitionAiAction={validateBaselineDefinitionAiAction}
                validateOutcomeStatementAiAction={validateOutcomeStatementAiAction}
              />
            ) : null}
            {!selectedOutcomeData ? (
              <FramingCockpit
                createAction={createDraftOutcomeAction}
                initialOriginFilter={originFilter}
                initialReadinessFilter={readinessFilter}
                items={cockpit.items}
                message={cockpit.message}
                state={cockpit.state}
              />
            ) : null}
            {showCompactSwitcher ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Switch Framing</CardTitle>
                  <CardDescription>
                    The active framing is already open. Use this only when you intentionally want to switch branch or open Demo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {operationalItems.length > 1 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Available project framings
                      </p>
                      <div className="-mx-1 overflow-x-auto pb-1">
                        <div className="flex min-w-max gap-2 px-1">
                          {operationalItems.map((item) => (
                            <Button asChild key={item.id} size="sm" variant={item.id === outcomeId ? "default" : "secondary"}>
                              <Link href={`/framing?outcomeId=${item.id}`}>{item.key}: {item.title}</Link>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {demoItem ? (
                    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">Demo stays available separately</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Open Demo only when you intentionally want to compare against reference content.
                        </p>
                      </div>
                      <Button asChild className="gap-2" variant="secondary">
                        <Link href={demoItem.detailHref}>Open Demo Framing</Link>
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </AppShell>
    );
  });
}
