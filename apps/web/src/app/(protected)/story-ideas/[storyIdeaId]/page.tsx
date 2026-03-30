import { notFound, redirect } from "next/navigation";
import { getStoryReadinessBlockers } from "@aas-companion/domain";
import { getStoryWorkspaceService } from "@aas-companion/api";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { StoryIdeaWorkspace } from "@/components/workspace/story-idea-workspace";
import { requireOrganizationContext } from "@/lib/auth/guards";

type StoryIdeaWorkspacePageProps = {
  params: Promise<{
    storyIdeaId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildQueryString(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
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
    notFound();
  }

  const { story, tollgate, tollgateReview } = storyResult.data;
  const computedBlockers = getStoryReadinessBlockers(story);
  const importedBuildBlockers = storyResult.data.importedBuildBlockers ?? [];
  const blockers =
    blockersFromQuery.length > 0
      ? blockersFromQuery
      : tollgateReview?.blockers ?? [...new Set([...(tollgate?.blockers ?? computedBlockers), ...importedBuildBlockers])];
  const isArchived = story.lifecycleState === "archived";
  const tollgateStatus = tollgateReview?.status ?? tollgate?.status ?? null;
  const isDeliveryMode = Boolean(story.sourceDirectionSeedId) || tollgateStatus === "approved" || story.status === "in_progress";

  if (isDeliveryMode) {
    redirect(`/stories/${story.id}${buildQueryString(query)}`);
  }

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

        <StoryIdeaWorkspace blockers={blockers} data={storyResult.data} isArchived={isArchived} />
      </section>
    </AppShell>
  );
}
