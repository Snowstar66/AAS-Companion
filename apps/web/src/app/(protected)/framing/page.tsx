import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { FramingOutcomeSection } from "@/components/framing/framing-outcome-section";
import { AppShell } from "@/components/layout/app-shell";
import { getCachedOutcomeWorkspaceData } from "@/lib/cache/project-data";
import { FramingCockpit } from "@/components/framing/framing-cockpit";
import { DownstreamAiInstructionsPage } from "@/components/framing/downstream-ai-instructions-page";
import { FramingSubpageNav } from "@/components/framing/framing-subpage-nav";
import { JourneyContextPage } from "@/components/framing/journey-context-page";
import { FramingRightRail } from "@/components/framing/framing-right-rail";
import { LocalizedText } from "@/components/shared/localized-text";
import { loadFramingCockpit } from "@/lib/framing/cockpit";
import { withDevTiming } from "@/lib/dev-timing";
import {
  analyzeJourneyCoverageAction,
  createDraftOutcomeAction,
  runFramingAgentAction,
  saveDownstreamAiInstructionsAction,
  saveJourneyContextsAction
} from "./actions";
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
} from "../outcomes/[outcomeId]/actions";

type FramingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const emptySearchParams: Record<string, string | string[] | undefined> = {};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getServerLanguage() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

function isDynamicServerUsageError(error: unknown) {
  return (
    error instanceof Error &&
    ("digest" in error ? (error as Error & { digest?: string }).digest === "DYNAMIC_SERVER_USAGE" : false)
  );
}

function FramingRouteFallback() {
  return (
    <AppShell
      topbarProps={{
        projectName: "AAS Companion",
        sectionLabel: "Framing",
        badge: "Unavailable"
      }}
    >
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>
            <LocalizedText en="Framing is temporarily unavailable" sv="Framing ar tillfalligt otillganglig" />
          </CardTitle>
          <CardDescription>
            <LocalizedText
              en="The route hit a server-side rendering problem before the workspace could load."
              sv="Sidan stotte pa ett serverfel innan arbetsytan hann laddas."
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            <LocalizedText
              en="The framing route now stays online and shows this fallback instead of crashing the full page."
              sv="Framing-routen halls nu uppe och visar denna fallback i stallet for att krascha hela sidan."
            />
          </p>
          <Button asChild className="gap-2" variant="secondary">
            <Link href="/">
              <LocalizedText en="Back to Home" sv="Tillbaka till Hem" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function SelectedFramingOutcomeErrorCard() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>
          <LocalizedText en="Selected Framing could not be loaded" sv="Vald Framing kunde inte laddas" />
        </CardTitle>
        <CardDescription>
          <LocalizedText
            en="The active framing workspace hit a server-side loading problem."
            sv="Den aktiva framing-arbetsytan stotte pa ett serverfel vid inlasning."
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <LocalizedText
          en="Try opening the cockpit view or another framing while we keep the route available."
          sv="Prova att oppna cockpit-vyn eller en annan framing medan routen fortsatter vara tillganglig."
        />
      </CardContent>
    </Card>
  );
}

function SelectedFramingContentErrorCard() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>
          <LocalizedText en="Framing content could not be rendered" sv="Framing-innehallet kunde inte renderas" />
        </CardTitle>
        <CardDescription>
          <LocalizedText
            en="The workspace loaded, but one of the Framing sections hit a server-side rendering problem."
            sv="Arbetsytan laddades, men en av Framing-sektionerna stotte pa ett serverfel under renderingen."
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <LocalizedText
          en="Try the Journey Context subpage or return to the cockpit while we keep this route available."
          sv="Prova Journey Context-undesidan eller ga tillbaka till cockpit-vyn medan routen fortfarande halls uppe."
        />
      </CardContent>
    </Card>
  );
}

function FramingUxPreviewCard() {
  return (
    <Card className="border-violet-200 bg-[linear-gradient(135deg,rgba(245,243,255,0.98),rgba(255,255,255,0.96))] shadow-sm">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
            <LocalizedText en="New UX Direction Preview" sv="Ny UX Direction Preview" />
          </p>
          <p className="mt-2 text-base font-semibold text-foreground">
            <LocalizedText
              en="Compare reference styles before you choose what to send downstream."
              sv="Jamfor referensstilar innan du valjer vad som ska skickas downstream."
            />
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            <LocalizedText
              en="Start here to see Enterprise control plane, Workflow, Customer portal, Creative workspace, Knowledge hub, and Minimal utility previews."
              sv="Borja har for att se previews for Enterprise control plane, Workflow, Customer portal, Creative workspace, Knowledge hub och Minimal utility."
            />
          </p>
        </div>
        <Button asChild className="shrink-0 border-violet-300 bg-white text-violet-900 hover:border-violet-400 hover:bg-violet-50" variant="secondary">
          <Link href="/framing/ux-preview">
            <LocalizedText en="Preview UX profiles" sv="Forhandsgranska UX-profiler" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function FramingPage({ searchParams }: FramingPageProps) {
  return withDevTiming("web.page.framing", async () => {
    try {
      const [query, serverLanguage] = await Promise.all([
        searchParams ? searchParams : Promise.resolve(emptySearchParams),
        getServerLanguage()
      ]);
      const requestedOutcomeId = getParamValue(query.outcomeId) ?? null;
      const requestedView = getParamValue(query.view) ?? null;
      const requestedSubpage = getParamValue(query.subpage) ?? null;
      const { cockpit, session, resolvedOutcomeId } = await loadFramingCockpit(requestedOutcomeId);
      const originFilter = getParamValue(query.origin) ?? "native";
      const readinessFilter = getParamValue(query.readiness) ?? "all";
      const defaultOutcomeId =
        resolvedOutcomeId ??
        cockpit.items.find((item) => item.originType === "native")?.id ??
        cockpit.items[0]?.id;
      const outcomeId = requestedView === "cockpit" ? null : requestedOutcomeId ?? defaultOutcomeId;
      const operationalItems = cockpit.items.filter((item) => item.originType !== "seeded");
      const hasDemoItems = cockpit.items.some((item) => item.originType === "seeded");
      const showCompactSwitcher = cockpit.state === "live" && Boolean(outcomeId) && (operationalItems.length > 1 || hasDemoItems);
      const demoItem = cockpit.items.find((item) => item.originType === "seeded") ?? null;
      const parsedSearch = {
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
      };

      return (
        <AppShell
          hideRightRail={Boolean(outcomeId)}
          rightRail={outcomeId ? undefined : <FramingRightRail summary={cockpit.summary} />}
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
          <FramingUxPreviewCard />
          {cockpit.state === "unavailable" ? (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>
                  <LocalizedText en="Framing data is unavailable" sv="Framingdata ar inte tillganglig" />
                </CardTitle>
                <CardDescription>
                  <LocalizedText
                    en="The route is online, but the cockpit could not load its organization data."
                    sv="Sidan ar tillganglig, men cockpit-vyn kunde inte ladda organisationens data."
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{cockpit.message}</p>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/">
                    <LocalizedText en="Back to Home" sv="Tillbaka till Hem" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {outcomeId ? (
                <Suspense fallback={<FramingWorkspaceFallback />}>
                  <SelectedFramingOutcomeSection
                    activeSubpage={
                      requestedSubpage === "journey-context"
                        ? "journey-context"
                        : requestedSubpage === "downstream-ai-instructions"
                          ? "downstream-ai-instructions"
                          : "overview"
                    }
                    language={serverLanguage}
                    organizationId={session.organization.organizationId}
                    outcomeId={outcomeId}
                    search={parsedSearch}
                    journeyFlash={{
                      analyze: (getParamValue(query.journeyAnalyze) as "success" | "error" | null) ?? null,
                      message: getParamValue(query.journeyMessage) ?? null,
                      save: (getParamValue(query.journeySave) as "success" | "error" | null) ?? null
                    }}
                    downstreamFlash={{
                      message: getParamValue(query.downstreamMessage) ?? null,
                      save: (getParamValue(query.downstreamSave) as "success" | "error" | null) ?? null
                    }}
                  />
                </Suspense>
              ) : (
                <FramingCockpit
                  createAction={createDraftOutcomeAction}
                  initialOriginFilter={originFilter}
                  initialReadinessFilter={readinessFilter}
                  items={cockpit.items}
                  message={cockpit.message}
                  state={cockpit.state}
                  suggestedOutcomeId={defaultOutcomeId ?? null}
                />
              )}
              {showCompactSwitcher ? (
                <Card className="border-border/70 shadow-sm">
                  <CardHeader>
                    <CardTitle>
                      <LocalizedText en="Switch Framing" sv="Byt Framing" />
                    </CardTitle>
                    <CardDescription>
                      <LocalizedText
                        en="The active framing is already open. Use this only when you intentionally want to switch branch or open Demo."
                        sv="Den aktiva framingen ar redan oppen. Anvand detta bara nar du medvetet vill byta gren eller oppna Demo."
                      />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {operationalItems.length > 1 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          <LocalizedText en="Available project framings" sv="Tillgangliga framings i projektet" />
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
                          <p className="font-medium text-foreground">
                            <LocalizedText en="Demo stays available separately" sv="Demo finns kvar separat" />
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <LocalizedText
                              en="Open Demo only when you intentionally want to compare against reference content."
                              sv="Oppna Demo bara nar du medvetet vill jamfora mot referensinnehall."
                            />
                          </p>
                        </div>
                        <Button asChild className="gap-2" variant="secondary">
                          <Link href={demoItem.detailHref}>
                            <LocalizedText en="Open Demo Framing" sv="Oppna demo-framing" />
                          </Link>
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
    } catch (error) {
      if (isDynamicServerUsageError(error)) {
        throw error;
      }

      console.error("Failed to render Framing route", error);
      return <FramingRouteFallback />;
    }
  });
}

function FramingWorkspaceFallback() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>
          <LocalizedText en="Loading current framing" sv="Laddar aktuell framing" />
        </CardTitle>
        <CardDescription>
          <LocalizedText
            en="The active framing brief is loading while the cockpit stays available."
            sv="Den aktiva framingbriefen laddas medan cockpit-vyn fortfarande ar tillganglig."
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
          <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
          <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
        </div>
      </CardContent>
    </Card>
  );
}

async function SelectedFramingOutcomeSection(props: {
  activeSubpage: "overview" | "journey-context" | "downstream-ai-instructions";
  language: "en" | "sv";
  organizationId: string;
  outcomeId: string;
  search: {
    created?: boolean;
    saveState?: string | null;
    submitState?: string | null;
    lifecycleState?: string | null;
    saveMessage?: string | null;
    blockersFromQuery?: string[];
    aiField?: "outcome_statement" | "baseline_definition" | null;
    aiVerdict?: "good" | "needs_revision" | "unclear" | null;
    aiConfidence?: "high" | "medium" | "low" | null;
    aiReason?: string | null;
    aiSuggestion?: string | null;
    aiError?: string | null;
    draftOutcomeStatement?: string | null;
    draftBaselineDefinition?: string | null;
  };
  journeyFlash: {
    save?: "success" | "error" | null;
    analyze?: "success" | "error" | null;
    message?: string | null;
  };
  downstreamFlash: {
    save?: "success" | "error" | null;
    message?: string | null;
  };
}) {
  let selectedOutcome: Awaited<ReturnType<typeof getCachedOutcomeWorkspaceData>>;

  try {
    selectedOutcome = await getCachedOutcomeWorkspaceData(props.organizationId, props.outcomeId);
  } catch (error) {
    console.error("Failed to load selected Framing outcome", error);
    return <SelectedFramingOutcomeErrorCard />;
  }

  if (!selectedOutcome.ok) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>
            <LocalizedText en="Selected Framing could not be loaded" sv="Vald Framing kunde inte laddas" />
          </CardTitle>
          <CardDescription>
            {selectedOutcome.errors[0]?.message ?? (
              <LocalizedText en="The selected framing is unavailable right now." sv="Den valda framingen ar inte tillganglig just nu." />
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (props.activeSubpage === "journey-context") {
    return (
      <div className="space-y-6">
        <FramingSubpageNav
          activeSubpage={props.activeSubpage}
          customInstructionCount={selectedOutcome.data.outcome.downstreamAiInstructions?.customInstructions.length ?? 0}
          journeyContextCount={selectedOutcome.data.outcome.journeyContexts?.length ?? 0}
          language={props.language}
          outcomeId={props.outcomeId}
        />
        <JourneyContextPage
          analyzeAction={analyzeJourneyCoverageAction}
          data={selectedOutcome.data}
          flash={props.journeyFlash}
          saveAction={saveJourneyContextsAction}
        />
      </div>
    );
  }

  if (props.activeSubpage === "downstream-ai-instructions") {
    return (
      <div className="space-y-6">
        <FramingSubpageNav
          activeSubpage={props.activeSubpage}
          customInstructionCount={selectedOutcome.data.outcome.downstreamAiInstructions?.customInstructions.length ?? 0}
          journeyContextCount={selectedOutcome.data.outcome.journeyContexts?.length ?? 0}
          language={props.language}
          outcomeId={props.outcomeId}
        />
        <DownstreamAiInstructionsPage
          data={selectedOutcome.data}
          flash={props.downstreamFlash}
          runAgentAction={runFramingAgentAction}
          saveAction={saveDownstreamAiInstructionsAction}
        />
      </div>
    );
  }

  let content: ReturnType<typeof FramingOutcomeSection>;

  try {
    content = FramingOutcomeSection({
      archiveAction: archiveOutcomeAction,
      createEpicAction: createEpicFromOutcomeAction,
      createStoryIdeaAction: createStoryIdeaFromOutcomeAction,
      data: selectedOutcome.data,
      embeddedInFraming: true,
      hardDeleteAction: hardDeleteOutcomeAction,
      initialReviewFramingState: { status: "idle", message: null, report: null },
      language: props.language,
      recordTollgateDecisionAction: recordOutcomeTollgateDecisionAction,
      restoreAction: restoreOutcomeAction,
      reviewFramingAction: reviewOutcomeFramingWithAiAction,
      runAgentAction: runFramingAgentAction,
      saveAction: saveOutcomeWorkspaceAction,
      saveInlineAction: saveOutcomeWorkspaceInlineAction,
      search: props.search,
      validateBaselineDefinitionAiAction: validateBaselineDefinitionAiAction,
      validateOutcomeStatementAiAction: validateOutcomeStatementAiAction
    });
  } catch (error) {
    console.error("Failed to render selected Framing content", error);

    return (
      <div className="space-y-6">
        <FramingSubpageNav
          activeSubpage={props.activeSubpage}
          customInstructionCount={selectedOutcome.data.outcome.downstreamAiInstructions?.customInstructions.length ?? 0}
          journeyContextCount={selectedOutcome.data.outcome.journeyContexts?.length ?? 0}
          language={props.language}
          outcomeId={props.outcomeId}
        />
        <SelectedFramingContentErrorCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FramingSubpageNav
        activeSubpage={props.activeSubpage}
        customInstructionCount={selectedOutcome.data.outcome.downstreamAiInstructions?.customInstructions.length ?? 0}
        journeyContextCount={selectedOutcome.data.outcome.journeyContexts?.length ?? 0}
        language={props.language}
        outcomeId={props.outcomeId}
      />
      {content}
    </div>
  );
}
