import Link from "next/link";
import { ArrowRight, FileJson2, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { InlineTermHelp } from "@/components/shared/inline-term-help";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { StoryIdeaAiValidatedTextarea } from "@/components/workspace/story-idea-ai-validated-textarea";
import { TollgateDecisionCard } from "@/components/workspace/tollgate-decision-card";
import { getStoryToneClasses, getStoryUxModel } from "@/lib/workspace/story-ux";
import {
  archiveStoryAction,
  hardDeleteStoryAction,
  recordStoryTollgateDecisionAction,
  restoreStoryAction,
  saveStoryWorkspaceInlineAction,
  saveStoryWorkspaceAction,
  submitStoryReadinessAction,
  validateStoryExpectedBehaviorAiAction
} from "@/app/(protected)/stories/[storyId]/actions";
import { formatAiLevel, getReadinessFieldStatus, SecondaryPanel, type StoryWorkspaceData } from "./story-workspace-shared";

type DeliveryStoryWorkspaceProps = {
  blockers: string[];
  data: StoryWorkspaceData;
  isArchived: boolean;
};

export function DeliveryStoryWorkspace({ blockers, data, isArchived }: DeliveryStoryWorkspaceProps) {
  const { activities, importedBuildBlockers, removal, story, tollgate, tollgateReview, valueSpineValidation } = data;
  const valueSpineBlockers = valueSpineValidation.reasons.map((reason) => reason.message);
  const storyUx = getStoryUxModel({
    id: story.id,
    key: story.key,
    status: story.status,
    lifecycleState: story.lifecycleState,
    testDefinition: story.testDefinition ?? null,
    acceptanceCriteria: story.acceptanceCriteria,
    definitionOfDone: story.definitionOfDone,
    tollgateStatus: tollgateReview?.status ?? tollgate?.status ?? null,
    blockers,
    pendingActionCount: tollgateReview?.pendingActions.length ?? 0,
    blockedActionCount: tollgateReview?.blockedActions.length ?? 0
  });
  const readinessFields = getReadinessFieldStatus(story);
  const missingReadinessFields = readinessFields.filter((field) => !field.complete);
  const primaryNextStepLabel = storyUx.nextActions[0]?.label ?? "Continue Story";
  const primaryNextStepDetail = storyUx.nextActions[0]?.description ?? "Continue working in the Story workspace.";
  const epicAlignmentText =
    story.epic.purpose?.trim() ||
    story.epic.scopeBoundary?.trim() ||
    `This delivery story should contribute clearly to Epic ${story.epic.key} ${story.epic.title}.`;
  const tollgateStatus = tollgateReview?.status ?? tollgate?.status ?? null;

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
                    Delivery Story
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStoryToneClasses(storyUx.tone)}`}
                  >
                    {storyUx.statusLabel}
                  </span>
                  <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {story.storyType.replaceAll("_", " ")}
                  </span>
                  {story.sourceDirectionSeedId ? (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800">
                      Linked to Story Idea
                    </span>
                  ) : null}
                </div>
                <div>
                  <CardTitle>{story.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-4xl">{storyUx.statusDetail}</CardDescription>
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
                    This record is an execution unit for design and build. Keep Value Spine integrity, delivery inputs and
                    handoff clarity explicit.
                  </p>
                </div>
              </div>

              {!isArchived ? (
                <Button asChild className="gap-2" variant={blockers.length === 0 ? "default" : "secondary"}>
                  <Link href={`/handoff/${story.id}`}>
                    Open handoff package
                    <FileJson2 className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className={`rounded-2xl border px-4 py-4 text-sm ${getStoryToneClasses(storyUx.tone)}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Readiness</p>
              <p className="mt-2 font-semibold">{storyUx.readinessLabel}</p>
              <p className="mt-2 leading-6">{storyUx.readinessDetail}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Value Spine validation</p>
              <p className="mt-2 font-semibold text-foreground">
                {valueSpineValidation.state === "ready" ? "Valid against Value Spine" : "Value Spine still blocked"}
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">
                {valueSpineBlockers.length === 0
                  ? "Outcome link, Epic link, Acceptance Criteria, and Test Definition are all present."
                  : valueSpineBlockers[0]}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {valueSpineBlockers.length > 1
                  ? `${valueSpineBlockers.length - 1} more Value Spine blocker${valueSpineBlockers.length - 1 === 1 ? "" : "s"} remain.`
                  : "This check stays informational until the Story moves into build handoff."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next step</p>
              <p className="mt-2 font-semibold text-foreground">{primaryNextStepLabel}</p>
              <p className="mt-2 leading-6 text-muted-foreground">{primaryNextStepDetail}</p>
            </div>
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
              <CardTitle>Delivery Story definition</CardTitle>
              <CardDescription>Keep this focused on one testable delivery unit and the inputs needed before build handoff.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm" id="story-ai-level">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI level</p>
                <p className="mt-2 font-semibold text-foreground">{formatAiLevel(story.aiAccelerationLevel)}</p>
                <p className="mt-2 leading-6 text-muted-foreground">
                  This comes from the current Framing and affects governance requirements for the Story.
                </p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Title</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.title}
                  disabled={isArchived}
                  name="title"
                  type="text"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Story type</span>
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                  defaultValue={story.storyType}
                  disabled={isArchived}
                  name="storyType"
                >
                  <option value="outcome_delivery">Outcome delivery</option>
                  <option value="governance">Governance</option>
                  <option value="enablement">Enablement</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Value intent</span>
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
                label="Expected behavior"
                name="expectedBehavior"
                saveAction={saveStoryWorkspaceInlineAction}
                validateAction={validateStoryExpectedBehaviorAiAction}
              />
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic alignment</p>
                <p className="mt-2 font-semibold text-foreground">
                  {story.epic.key} {story.epic.title}
                </p>
                <p className="mt-2 leading-6 text-muted-foreground">{epicAlignmentText}</p>
              </div>
            </CardContent>
          </Card>

          <SecondaryPanel
            defaultOpen
            description={
              missingReadinessFields.length === 0
                ? "All required design inputs are present. Review and approval can continue without more field edits."
                : "Fields highlighted below still need input before the Story can move forward."
            }
            id="story-handoff-inputs"
            title="Required design inputs"
          >
            <div className="grid gap-4">
              <label className="space-y-2" id="story-acceptance-criteria">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[0].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[0].complete ? "Ready" : "Missing"}
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
                <span className="text-sm font-medium text-foreground">AI Usage Scope</span>
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
                  <span className="text-sm font-medium text-foreground">Test Definition</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[1].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[1].complete ? "Ready" : "Missing"}
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
                  <span className="text-sm font-medium text-foreground">Definition of Done</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      readinessFields[2].complete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {readinessFields[2].complete ? "Ready" : "Missing"}
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
                label="Save Story changes"
                pendingLabel="Saving Story..."
              />
            ) : null}
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/epics/${story.epicId}`}>Back to current Epic</Link>
            </Button>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/framing?outcomeId=${story.outcomeId}`}>Open current Framing</Link>
            </Button>
          </div>
        </form>

        <SecondaryPanel
          defaultOpen={false}
          description="Open this only when you need to check where the Delivery Story sits in the current branch."
          title="Branch context"
        >
          <div id="story-value-spine">
            <FramingValueSpineTree
              emptyEpicMessage="This Story is already inside an active Framing branch, so no sibling Framing branches are shown here."
              emptyStoryMessage="This view is already scoped to the current Story branch."
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
                      tollgateStatus,
                      pendingActionCount: tollgateReview?.pendingActions.length ?? 0,
                      blockedActionCount: tollgateReview?.blockedActions.length ?? 0,
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
        <SecondaryPanel
          defaultOpen
          description="Server-backed delivery review, sign-off and escalation trail before handoff."
          title="Delivery review"
        >
          <div id="story-signoff-history">
            <div id="story-signoff">
              <TollgateDecisionCard
                aiAccelerationLevel={story.aiAccelerationLevel}
                approvalActions={tollgateReview?.approvalActions ?? []}
                availablePeople={tollgateReview?.availablePeople ?? []}
                blockers={blockers}
                blockedActions={tollgateReview?.blockedActions ?? []}
                comments={tollgateReview?.comments ?? tollgate?.comments ?? null}
                description="Server-backed delivery review, sign-off and escalation trail before handoff."
                entityId={story.id}
                entityType="story"
                formAction={recordStoryTollgateDecisionAction}
                hiddenFields={[
                  { name: "storyId", value: story.id },
                  { name: "epicId", value: story.epicId },
                  { name: "outcomeId", value: story.outcomeId }
                ]}
                pendingActions={tollgateReview?.pendingActions ?? []}
                reviewActions={tollgateReview?.reviewActions ?? []}
                signoffRecords={
                  tollgateReview?.signoffRecords.map((record) => ({
                    id: record.id,
                    decisionKind: record.decisionKind,
                    requiredRoleType: record.requiredRoleType,
                    actualPersonName: record.actualPersonName,
                    actualRoleTitle: record.actualRoleTitle,
                    organizationSide: record.organizationSide,
                    decisionStatus: record.decisionStatus,
                    note: record.note,
                    evidenceReference: record.evidenceReference,
                    createdAt: record.createdAt
                  })) ?? []
                }
                status={tollgateReview?.status ?? (blockers.length === 0 ? "ready" : "blocked")}
                title="Delivery review"
                tollgateType="story_readiness"
              />
            </div>
          </div>
        </SecondaryPanel>

        {!isArchived ? (
          <Card className="border-border/70 shadow-sm" id="story-readiness">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Start delivery review
                <InlineTermHelp term="Readiness" />
              </CardTitle>
              <CardDescription>Freeze the current blockers and open the formal delivery review for this Delivery Story.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={submitStoryReadinessAction} className="space-y-4">
                <input name="storyId" type="hidden" value={story.id} />
                <input name="epicId" type="hidden" value={story.epicId} />
                <input name="outcomeId" type="hidden" value={story.outcomeId} />
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Readiness note</span>
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                    defaultValue={tollgate?.comments ?? ""}
                    name="comments"
                  />
                </label>
                <PendingFormButton
                  className="gap-2"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Start delivery review"
                  pendingLabel="Starting review..."
                />
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border/70 shadow-sm" id="story-governance">
          <CardHeader>
            <CardTitle>Governance readiness</CardTitle>
            <CardDescription>Check whether the project is staffed strongly enough for this Story's AI level.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/governance?view=readiness&sourceEntity=story&sourceId=${story.id}&level=${story.aiAccelerationLevel}`}>
                Open Governance readiness
              </Link>
            </Button>
          </CardContent>
        </Card>

        <SecondaryPanel
          defaultOpen={false}
          description="Operational history is useful, but not usually the first thing needed to move work forward."
          title="Latest activity"
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            {activities.length === 0 ? (
              <p>No activity has been recorded yet for this Story.</p>
            ) : (
              activities.map((activity) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={activity.id}>
                  <p className="font-medium text-foreground">{activity.eventType.replaceAll("_", " ")}</p>
                  <p className="mt-1">{new Date(activity.createdAt).toLocaleString("en-US")}</p>
                </div>
              ))
            )}
          </div>
        </SecondaryPanel>

        <SecondaryPanel
          defaultOpen={false}
          description="Archive, restore and delete controls stay available without displacing primary Story work."
          id="story-lifecycle"
          title="Lifecycle controls"
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
            description="Imported lineage is still accessible when you need to trace the source material."
            title="Imported lineage"
          >
            <Button asChild className="gap-2" variant="secondary">
              <Link href={`/review?candidateId=${story.lineageSourceId}`}>Open source candidate review</Link>
            </Button>
          </SecondaryPanel>
        ) : null}

        {importedBuildBlockers.length > 0 ? (
          <SecondaryPanel
            defaultOpen={false}
            description="Imported build blockers remain visible here until the linked source material is fully resolved."
            title="Imported build blockers"
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
