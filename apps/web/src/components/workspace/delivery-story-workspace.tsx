import Link from "next/link";
import { ArrowRight, FileJson2, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { InlineTermHelp } from "@/components/shared/inline-term-help";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { StoryIdeaAiValidatedTextarea } from "@/components/workspace/story-idea-ai-validated-textarea";
import { getStoryToneClasses, getStoryUxModel } from "@/lib/workspace/story-ux";
import {
  archiveStoryAction,
  hardDeleteStoryAction,
  restoreStoryAction,
  saveStoryWorkspaceInlineAction,
  saveStoryWorkspaceAction,
  validateStoryExpectedBehaviorAiAction
} from "@/app/(protected)/stories/[storyId]/actions";
import {
  formatAiLevel,
  getReadinessFieldStatus,
  SecondaryPanel,
  type StoryWorkspaceData,
  WorkspaceStatusSummary
} from "./story-workspace-shared";

type DeliveryStoryWorkspaceProps = {
  blockers: string[];
  data: StoryWorkspaceData;
  isArchived: boolean;
};

export function DeliveryStoryWorkspace({ blockers, data, isArchived }: DeliveryStoryWorkspaceProps) {
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
  const { activities, importedBuildBlockers, originStoryIdea, removal, story, valueSpineValidation } = data;
  const valueSpineBlockers = valueSpineValidation.reasons.map((reason) => reason.message);
  const storyUx = getStoryUxModel({
    id: story.id,
    key: story.key,
    status: story.status,
    lifecycleState: story.lifecycleState,
    testDefinition: story.testDefinition ?? null,
    acceptanceCriteria: story.acceptanceCriteria,
    definitionOfDone: story.definitionOfDone,
    tollgateStatus: null,
    blockers,
    pendingActionCount: 0,
    blockedActionCount: 0
  });
  const readinessFields = getReadinessFieldStatus(story);
  const missingReadinessFields = readinessFields.filter((field) => !field.complete);
  const primaryNextStepLabel = storyUx.nextActions[0]?.label ?? t("Continue Story", "Fortsatt storyarbete");
  const primaryNextStepDetail =
    storyUx.nextActions[0]?.description ?? t("Continue working in the Story workspace.", "Fortsatt arbeta i story-workspacen.");
  const epicAlignmentText =
    story.epic.purpose?.trim() ||
    story.epic.scopeBoundary?.trim() ||
    t(
      `This delivery story should contribute clearly to Epic ${story.epic.key} ${story.epic.title}.`,
      `Den har delivery storyn ska tydligt bidra till Epic ${story.epic.key} ${story.epic.title}.`
    );
  const statusTone = storyUx.statusLabel === "Approved" ? "approved" : storyUx.statusLabel === "Ready for review" ? "ready_for_review" : "needs_action";
  const completeItems = [
    valueSpineValidation.state === "ready" ? t("Value Spine validation is complete", "Value Spine-valideringen ar klar") : null,
    story.acceptanceCriteria.length > 0 ? t("Acceptance criteria are present", "Acceptanskriterier finns") : null,
    story.testDefinition?.trim() ? t("Test definition is present", "Testdefinition finns") : null,
    story.definitionOfDone.length > 0 ? t("Definition of Done is present", "Definition of Done finns") : null,
    story.status === "in_progress" ? t("Build is already in progress", "Build ar redan igang") : null
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {story.key}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                    <ShieldCheck className="h-4 w-4" />
                    {t("Delivery Story", "Delivery Story")}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStoryToneClasses(storyUx.tone)}`}
                  >
                    {storyUx.statusLabel}
                  </span>
                  <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {story.storyType === "outcome_delivery"
                      ? t("Outcome delivery", "Outcome-leverans")
                      : story.storyType === "governance"
                        ? t("Governance", "Governance")
                        : t("Enablement", "Enablement")}
                  </span>
                  {story.sourceDirectionSeedId ? (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800">
                      {t("Linked to Story Idea", "Lankad till Story Idea")}
                    </span>
                  ) : null}
                </div>
                <div>
                  <CardTitle>{story.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-4xl">{storyUx.statusDetail}</CardDescription>
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
                    {t(
                      "This record is an execution unit for design and build. Keep Value Spine integrity, delivery inputs and build-start clarity explicit.",
                      "Den har posten ar en exekveringsenhet for design och build. Hall Value Spine-integritet, leveransindata och build-starttydlighet explicita."
                    )}
                  </p>
                </div>
              </div>

              {!isArchived ? (
                <Button asChild className="gap-2" variant={blockers.length === 0 ? "default" : "secondary"}>
                  <Link href={`/handoff/${story.id}`}>
                    {t("Open build package", "Oppna build package")}
                    <FileJson2 className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <WorkspaceStatusSummary
              blockerEmptyText={t("No Delivery Story blockers are visible right now.", "Inga blockerare for Delivery Story syns just nu.")}
              blockers={blockers}
              completeItems={completeItems}
              nextActionDetail={primaryNextStepDetail}
              nextActionLabel={primaryNextStepLabel}
              statusLabel={storyUx.statusLabel}
              statusTone={statusTone}
            />
          </CardContent>
        </Card>

        <form action={saveStoryWorkspaceAction} className="space-y-6">
          <input name="storyId" type="hidden" value={story.id} />
          <input name="epicId" type="hidden" value={story.epicId} />
          <input name="outcomeId" type="hidden" value={story.outcomeId} />
          <input name="epicTitle" type="hidden" value={story.epic.title} />
          <input name="epicPurpose" type="hidden" value={story.epic.purpose ?? ""} />
          <input name="epicScopeBoundary" type="hidden" value={story.epic.scopeBoundary ?? ""} />
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t("Delivery Story definition", "Delivery Story-definition")}</CardTitle>
              <CardDescription>
                {t(
                  "Keep this focused on one testable delivery unit and the inputs needed before build starts.",
                  "Hall den har fokuserad pa en testbar leveransenhet och den indata som behovs innan build startar."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm" id="story-ai-level">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("AI level", "AI-niva")}</p>
                <p className="mt-2 font-semibold text-foreground">{formatAiLevel(story.aiAccelerationLevel)}</p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  {t(
                    "This comes from the current Framing and affects governance requirements for the Story.",
                    "Det har kommer fran aktuell Framing och paverkar governancekraven for storyn."
                  )}
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("Title", "Titel")}</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.title}
                  disabled={isArchived}
                  name="title"
                  type="text"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("Story type", "Storytyp")}</span>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.storyType}
                  disabled={isArchived}
                  name="storyType"
                >
                  <option value="outcome_delivery">{t("Outcome delivery", "Outcome-leverans")}</option>
                  <option value="governance">{t("Governance", "Governance")}</option>
                  <option value="enablement">{t("Enablement", "Enablement")}</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("Value intent", "Value intent")}</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.valueIntent}
                  disabled={isArchived}
                  name="valueIntent"
                />
              </label>
              <StoryIdeaAiValidatedTextarea
                disabled={isArchived}
                initialValue={story.expectedBehavior ?? ""}
                label={t("Expected behavior", "Forvantat beteende")}
                name="expectedBehavior"
                saveAction={saveStoryWorkspaceInlineAction}
                validateAction={validateStoryExpectedBehaviorAiAction}
              />
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Epic alignment", "Epic-anpassning")}</p>
                <p className="mt-2 font-semibold text-foreground">
                  {story.epic.key} {story.epic.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm" id="story-blockers">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Blocking items", "Blockerande punkter")}</p>
                {blockers.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-foreground">
                    {blockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {t("No blockers remain. This Delivery Story is ready for review.", "Inga blockerare aterstar. Den har Delivery Storyn ar redo for review.")}
                  </p>
                )}
                {valueSpineBlockers.length > 0 ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {t("Value Spine", "Value Spine")}: {valueSpineBlockers.join(" ")}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <SecondaryPanel
            description={
              missingReadinessFields.length === 0
                ? t(
                    "All required design inputs are present. Review and approval can continue without more field edits.",
                    "All obligatorisk designindata finns. Review och godkannande kan fortsatta utan fler faltandringar."
                  )
                : t(
                    "Fields highlighted below still need input before the Story can move forward.",
                    "Falten nedan behover fortfarande fyllas i innan storyn kan ga vidare."
                  )
            }
            id="story-handoff-inputs"
            title={t("Required design inputs", "Obligatorisk designindata")}
          >
            <div className="grid gap-4">
              <label className="space-y-2" id="story-acceptance-criteria">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{t("Acceptance criteria", "Acceptanskriterier")}</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[0].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[0].complete ? t("Ready", "Redo") : t("Missing", "Saknas")}
                  </span>
                </div>
                <textarea
                  className={`min-h-28 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                    readinessFields[0].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                  }`}
                  defaultValue={story.acceptanceCriteria.join("\n")}
                  disabled={isArchived}
                  name="acceptanceCriteria"
                />
                {!readinessFields[0].complete ? <p className="text-sm text-amber-800">{readinessFields[0].help}</p> : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t("AI Usage Scope", "AI-anvandningsomfang")}</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.aiUsageScope.join(", ")}
                  disabled={isArchived}
                  name="aiUsageScope"
                  type="text"
                />
              </label>
              <label className="space-y-2" id="story-test-definition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{t("Test Definition", "Testdefinition")}</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[1].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[1].complete ? t("Ready", "Redo") : t("Missing", "Saknas")}
                  </span>
                </div>
                <textarea
                  className={`min-h-24 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                    readinessFields[1].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                  }`}
                  defaultValue={story.testDefinition ?? ""}
                  disabled={isArchived}
                  name="testDefinition"
                />
                {!readinessFields[1].complete ? <p className="text-sm text-amber-800">{readinessFields[1].help}</p> : null}
              </label>
              <label className="space-y-2" id="story-definition-of-done">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{t("Definition of Done", "Definition of Done")}</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[2].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[2].complete ? t("Ready", "Redo") : t("Missing", "Saknas")}
                  </span>
                </div>
                <textarea
                  className={`min-h-28 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30 ${
                    readinessFields[2].complete ? "border-border" : "border-amber-300 bg-amber-50/30"
                  }`}
                  defaultValue={story.definitionOfDone.join("\n")}
                  disabled={isArchived}
                  name="definitionOfDone"
                />
                {!readinessFields[2].complete ? <p className="text-sm text-amber-800">{readinessFields[2].help}</p> : null}
              </label>
            </div>
          </SecondaryPanel>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isArchived ? (
              <PendingFormButton
                className="gap-2"
                icon={<ArrowRight className="h-4 w-4" />}
                label={t("Save Story changes", "Spara storyandringar")}
                pendingLabel={t("Saving Story...", "Sparar story...")}
              />
            ) : null}
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/epics/${story.epicId}`}>{t("Back to current Epic", "Tillbaka till aktuell Epic")}</Link>
            </Button>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/framing?outcomeId=${story.outcomeId}`}>{t("Open current Framing", "Oppna aktuell Framing")}</Link>
            </Button>
          </div>
        </form>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Keep the connection back to the framing-level Story Idea visible, but secondary to delivery execution.",
            "Behall kopplingen tillbaka till Story Idean pa framingniva synlig, men sekundar i forhallande till leveransexekveringen."
          )}
          title={t("Origin Story Idea", "Ursprunglig Story Idea")}
        >
          {originStoryIdea ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/55 p-4 text-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Story Idea", "Story Idea")}</p>
                  <p className="mt-2 font-semibold text-foreground">
                    {originStoryIdea.key} {originStoryIdea.title}
                  </p>
                  <p className="mt-2 text-foreground">
                    <span className="font-medium">{t("Value intent", "Value intent")}:</span>{" "}
                    {originStoryIdea.valueIntent || t("No framing-level value intent is currently stored.", "Inget value intent pa framingniva finns sparat just nu.")}
                  </p>
                  <p className="mt-2 text-foreground">
                    <span className="font-medium">{t("Expected behavior", "Forvantat beteende")}:</span>{" "}
                    {originStoryIdea.expectedBehavior || t("No framing-level expected behavior is currently stored.", "Inget expected behavior pa framingniva finns sparat just nu.")}
                  </p>
                </div>
                <Button asChild className="gap-2" size="sm" variant="secondary">
                  <Link
                    href={
                      originStoryIdea.storyId
                        ? `/story-ideas/${originStoryIdea.storyId}`
                        : `/story-ideas/${originStoryIdea.seedId}`
                    }
                  >
                    {t("Open Story Idea", "Oppna Story Idea")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
              {t(
                "No direct Story Idea link is recorded for this Delivery Story. It still remains valid as long as Outcome and Epic links are present.",
                "Ingen direkt Story Idea-lank ar registrerad for den har Delivery Storyn. Den ar fortfarande giltig sa lange Outcome- och Epic-lankar finns."
              )}
            </div>
          )}
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Open this only when you need to check where the Delivery Story sits in the current branch.",
            "Oppna detta bara nar du behover kontrollera var Delivery Storyn ligger i den aktuella grenen."
          )}
          title={t("Branch context", "Grenkontext")}
        >
          <div id="story-value-spine">
            <FramingValueSpineTree
              emptyEpicMessage={t(
                "This Story is already inside an active Framing branch, so no sibling Framing branches are shown here.",
                "Den har storyn ligger redan i en aktiv Framing-gren, sa inga syskon-grenar visas har."
              )}
              emptyStoryMessage={t(
                "This view is already scoped to the current Story branch.",
                "Den har vyn ar redan avgransad till den aktuella storygrenen."
              )}
              epics={[
                {
                  id: story.epic.id,
                  key: story.epic.key,
                  title: story.epic.title,
                  href: `/epics/${story.epicId}`,
                  isCurrent: false,
                  scopeBoundary: story.epic.scopeBoundary ?? null,
                  purpose: story.epic.purpose ?? null,
                  originType: story.epic.originType,
                  lifecycleState: story.epic.lifecycleState,
                  importedReadinessState: story.epic.importedReadinessState ?? null,
                  lineageHref:
                    story.epic.lineageSourceType === "artifact_aas_candidate" && story.epic.lineageSourceId
                      ? `/review?candidateId=${story.epic.lineageSourceId}`
                      : null,
                  stories: [
                    {
                      id: story.id,
                      key: story.key,
                      title: story.title,
                      href: `/stories/${story.id}`,
                      isCurrent: true,
                      valueIntent: story.valueIntent ?? null,
                      testDefinition: story.testDefinition ?? null,
                      acceptanceCriteria: story.acceptanceCriteria,
                      definitionOfDone: story.definitionOfDone,
                      status: story.status,
                      originType: story.originType,
                      lifecycleState: story.lifecycleState,
                      tollgateStatus: null,
                      pendingActionCount: 0,
                      blockedActionCount: 0,
                      importedReadinessState: story.importedReadinessState ?? null,
                      lineageHref:
                        story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId
                          ? `/review?candidateId=${story.lineageSourceId}`
                          : null
                    }
                  ]
                }
              ]}
              outcome={{
                id: story.outcome.id,
                key: story.outcome.key,
                title: story.outcome.title,
                href: `/framing?outcomeId=${story.outcomeId}`,
                isCurrent: false,
                statement: story.outcome.outcomeStatement ?? null,
                originType: story.outcome.originType,
                lifecycleState: story.outcome.lifecycleState,
                importedReadinessState: story.outcome.importedReadinessState ?? null,
                lineageHref:
                  story.outcome.lineageSourceType === "artifact_aas_candidate" && story.outcome.lineageSourceId
                    ? `/review?candidateId=${story.outcome.lineageSourceId}`
                    : null
              }}
            />
          </div>
        </SecondaryPanel>
      </div>

      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm" id="story-design-readiness">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("Design readiness", "Designberedskap")}
              <InlineTermHelp term="Readiness" />
            </CardTitle>
            <CardDescription>
              {t(
                "This tool keeps Delivery Stories as a design and traceability view. Per-story human approval lanes are not used here.",
                "Det har verktyget behaller Delivery Stories som en design- och sparbarhetsvy. Per-story-lanes for manskligt godkannande används inte har."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
              <p className="font-medium text-foreground">{storyUx.readinessLabel}</p>
              <p className="mt-2 leading-6 text-muted-foreground">{storyUx.readinessDetail}</p>
            </div>
            {blockers.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                {t(
                  "Clear the remaining blockers before relying on this Delivery Story as a complete design input for BMAD or downstream build tooling.",
                  "Los kvarvarande blockerare innan du lutar dig mot den har Delivery Storyn som komplett designindata for BMAD eller nedstroms build-verktyg."
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                {t(
                  "This Delivery Story is complete enough to export into external build work or AI-assisted implementation.",
                  "Den har Delivery Storyn ar tillrackligt komplett for att exporteras till externt build-arbete eller AI-assisterad implementation."
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="story-governance">
          <CardHeader>
            <CardTitle>{t("Governance readiness", "Governance readiness")}</CardTitle>
            <CardDescription>
              {t(
                "Check whether the project is staffed strongly enough for this Story's AI level.",
                "Kontrollera om projektet ar tillrackligt bemannat for den har storyns AI-niva."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/governance?view=readiness&sourceEntity=story&sourceId=${story.id}&level=${story.aiAccelerationLevel}`}>
                {t("Open Governance readiness", "Oppna Governance readiness")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Operational history is useful, but not usually the first thing needed to move work forward.",
            "Operativ historik ar anvandbar, men oftast inte det forsta som behovs for att fora arbetet framat."
          )}
          title={t("Latest activity", "Senaste aktivitet")}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            {activities.length === 0 ? (
              <p>{t("No activity has been recorded yet for this Story.", "Ingen aktivitet har registrerats annu for den har storyn.")}</p>
            ) : (
              activities.map((activity) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={activity.id}>
                  <p className="font-medium text-foreground">{activity.eventType.replaceAll("_", " ")}</p>
                  <p className="mt-1">{new Date(activity.createdAt).toLocaleString(language === "sv" ? "sv-SE" : "en-US")}</p>
                </div>
              ))
            )}
          </div>
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description={t(
            "Archive, restore and delete controls stay available without displacing primary Story work.",
            "Arkivera-, aterstall- och delete-kontroller finns kvar utan att tranga undan det primara storyarbetet."
          )}
          id="story-lifecycle"
          title={t("Lifecycle controls", "Livscykelkontroller")}
        >
          <GovernedLifecycleCard
            archiveAction={archiveStoryAction}
            decision={removal?.decision ?? null}
            entityId={story.id}
            entityLabel="Story"
            hardDeleteAction={hardDeleteStoryAction}
            hiddenFields={[
              { name: "epicId", value: story.epicId },
              { name: "outcomeId", value: story.outcomeId }
            ]}
            restoreAction={restoreStoryAction}
          />
        </SecondaryPanel>

        {story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId ? (
          <SecondaryPanel
            defaultOpen={false}
            description={t(
              "Imported lineage is still accessible when you need to trace the source material.",
              "Importerad lineage ar fortfarande tillganglig nar du behover spåra kallmaterialet."
            )}
            title={t("Imported lineage", "Importerad lineage")}
          >
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/review?candidateId=${story.lineageSourceId}`}>{t("Open source candidate review", "Oppna kallkandidatens review")}</Link>
            </Button>
          </SecondaryPanel>
        ) : null}

        {importedBuildBlockers.length > 0 ? (
          <SecondaryPanel
            defaultOpen={false}
            description={t(
              "Imported build blockers remain visible here until the linked source material is fully resolved.",
              "Importerade build-blockerare forblir synliga har tills det lankade kallmaterialet ar helt utrett."
            )}
            title={t("Imported build blockers", "Importerade build-blockerare")}
          >
            <div className="space-y-3 text-sm text-muted-foreground">
              {importedBuildBlockers.map((blocker) => (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900" key={blocker}>
                  {blocker}
                </div>
              ))}
            </div>
          </SecondaryPanel>
        ) : null}
      </div>
    </div>
  );
}
