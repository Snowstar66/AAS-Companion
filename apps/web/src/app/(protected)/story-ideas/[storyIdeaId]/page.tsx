import { notFound } from "next/navigation";
import { getDirectionSeedWorkspaceService, getStoryWorkspaceService } from "@aas-companion/api";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import {
  createDeliveryStoryFromStoryIdeaSeedAction,
  saveLegacyStoryIdeaWorkspaceAction,
  saveLegacyStoryIdeaWorkspaceInlineAction,
  saveStoryIdeaSeedWorkspaceAction,
  saveStoryIdeaSeedWorkspaceInlineAction,
  validateLegacyStoryIdeaExpectedBehaviorAiAction,
  validateStoryIdeaSeedExpectedBehaviorAiAction
} from "@/app/(protected)/story-ideas/[storyIdeaId]/actions";
import { DirectionSeedWorkspace } from "@/components/workspace/direction-seed-workspace";
import { StoryIdeaWorkspace } from "@/components/workspace/story-idea-workspace";
import { requireOrganizationContext } from "@/lib/auth/guards";
import { getStoryIdeaBlockers } from "@/lib/framing/story-idea-status";

type StoryIdeaWorkspacePageProps = {
  params: Promise<{
    storyIdeaId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StoryIdeaWorkspacePage({ params, searchParams }: StoryIdeaWorkspacePageProps) {
  const organization = await requireOrganizationContext();
  const { storyIdeaId } = await params;
  const query = searchParams ? await searchParams : {};
  const created = getParamValue(query.created) === "1";
  const saveState = getParamValue(query.save);
  const lifecycleState = getParamValue(query.lifecycle);
  const saveMessage = getParamValue(query.message);
  const blockersFromQuery = getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [];
  const storyResult = await getStoryWorkspaceService(organization.organizationId, storyIdeaId);

  if (!storyResult.ok) {
    const directionSeedResult = await getDirectionSeedWorkspaceService(organization.organizationId, storyIdeaId);

    if (!directionSeedResult.ok) {
      notFound();
    }

    const isArchived = directionSeedResult.data.seed.lifecycleState === "archived";

    return (
      <AppShell
        hideRightRail
        topbarProps={{
          eyebrow: "AAS Companion",
          projectName: organization.organizationName,
          sectionLabel: "Story Idea",
          badge: directionSeedResult.data.seed.key
        }}
      >
        <PageViewAnalytics
          eventName="story_idea_workspace_viewed"
          properties={{
            storyIdeaId: directionSeedResult.data.seed.id,
            storyIdeaKey: directionSeedResult.data.seed.key,
            storyIdeaSource: "direction_seed"
          }}
        />
        <section className="space-y-6">
          {created ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Native Story Idea created inside the current Framing.
            </div>
          ) : null}
          {saveState === "success" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Story Idea changes were saved successfully.
            </div>
          ) : null}
          {saveState === "error" && saveMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
          ) : null}
          {lifecycleState === "archived" ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              Story Idea archived. It is now removed from active working views but remains traceable.
            </div>
          ) : null}
          {lifecycleState === "restored" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Story Idea restored to active work.
            </div>
          ) : null}
          {lifecycleState === "error" && saveMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
          ) : null}
          {isArchived ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              This Story Idea is archived and currently read-only. Restore it to continue active framing work.
            </div>
          ) : null}

          <DirectionSeedWorkspace
            createDeliveryStoryAction={createDeliveryStoryFromStoryIdeaSeedAction}
            data={directionSeedResult.data}
            isArchived={isArchived}
            saveAction={saveStoryIdeaSeedWorkspaceAction}
            saveInlineAction={saveStoryIdeaSeedWorkspaceInlineAction}
            validateAction={validateStoryIdeaSeedExpectedBehaviorAiAction}
          />
        </section>
      </AppShell>
    );
  }

  const { story, tollgate, tollgateReview } = storyResult.data;
  const blockers =
    blockersFromQuery.length > 0
      ? blockersFromQuery
      : getStoryIdeaBlockers({
          valueIntent: story.valueIntent,
          expectedBehavior: story.expectedBehavior,
          hasEpicLink: Boolean(story.epicId),
          parentApproved: story.outcome.status === "active"
        });
  const isArchived = story.lifecycleState === "archived";
  const tollgateStatus = tollgateReview?.status ?? tollgate?.status ?? null;
  const canAlsoOpenDeliveryView = Boolean(story.sourceDirectionSeedId) || tollgateStatus === "approved" || story.status === "in_progress";

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Story Idea",
        badge: story.key
      }}
    >
      <PageViewAnalytics
        eventName="story_idea_workspace_viewed"
        properties={{
          storyId: story.id,
          storyKey: story.key
        }}
      />
      <section className="space-y-6">
        {created ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Native Story Idea created inside the current Framing.
          </div>
        ) : null}
        {saveState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Story Idea changes were saved successfully.
          </div>
        ) : null}
        {saveState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {lifecycleState === "archived" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Story Idea archived. It is now removed from active working views but remains traceable.
          </div>
        ) : null}
        {lifecycleState === "restored" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Story Idea restored to active work.
          </div>
        ) : null}
        {lifecycleState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {isArchived ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            This Story Idea is archived and currently read-only. Restore it to continue active framing work.
          </div>
        ) : null}
        {canAlsoOpenDeliveryView ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            You opened the Story Idea view. This record also has a Delivery Story view for later design and build work.
          </div>
        ) : null}

        <StoryIdeaWorkspace
          blockers={blockers}
          data={storyResult.data}
          deliveryViewHref={canAlsoOpenDeliveryView ? `/stories/${story.id}` : null}
          isArchived={isArchived}
          saveAction={saveLegacyStoryIdeaWorkspaceAction}
          saveInlineAction={saveLegacyStoryIdeaWorkspaceInlineAction}
          validateAction={validateLegacyStoryIdeaExpectedBehaviorAiAction}
        />
      </section>
    </AppShell>
  );
}
