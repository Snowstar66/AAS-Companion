import { notFound, redirect } from "next/navigation";
import { getStoryReadinessBlockers } from "@aas-companion/domain";
import { getStoryWorkspaceService } from "@aas-companion/api";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { DeliveryStoryWorkspace } from "@/components/workspace/delivery-story-workspace";
import { requireOrganizationContext } from "@/lib/auth/guards";

type StoryWorkspacePageProps = {
  params: Promise<{
    storyId: string;
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

export default async function StoryWorkspacePage({ params, searchParams }: StoryWorkspacePageProps) {
  const organization = await requireOrganizationContext();
  const { storyId } = await params;
  const query = searchParams ? await searchParams : {};
  const created = getParamValue(query.created) === "1";
  const saveState = getParamValue(query.save);
  const readyState = getParamValue(query.ready);
  const lifecycleState = getParamValue(query.lifecycle);
  const createdAs = getParamValue(query.createdAs);
  const saveMessage = getParamValue(query.message);
  const blockersFromQuery = getParamValue(query.blockers)?.split(" | ").filter(Boolean) ?? [];
  const storyResult = await getStoryWorkspaceService(organization.organizationId, storyId);

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

  if (!isDeliveryMode) {
    redirect(`/story-ideas/${story.id}${buildQueryString(query)}`);
  }

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Delivery Story",
        badge: story.key
      }}
    >
      <PageViewAnalytics
        eventName="story_workspace_viewed"
        properties={{
          storyId: story.id,
          storyKey: story.key
        }}
      />
      <section className="space-y-6">
        {created ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {createdAs === "delivery" ? "Delivery Story created from the selected Story Idea." : "Native Delivery Story created and ready for design work."}
          </div>
        ) : null}
        {saveState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Story changes were saved successfully.
          </div>
        ) : null}
        {saveState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {readyState === "blocked" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Build review is blocked. Fill the missing fields listed below and try again.
          </div>
        ) : null}
        {readyState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Build review opened. This Delivery Story is now ready for human review.
          </div>
        ) : null}
        {readyState === "duplicate" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This approval was already recorded. Duplicate sign-offs are blocked so the Story status stays trustworthy.
          </div>
        ) : null}
        {readyState === "approved" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Required sign-offs are complete. This Delivery Story is now ready to start build.
          </div>
        ) : null}
        {lifecycleState === "archived" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Story archived. It is now removed from active working views but remains traceable.
          </div>
        ) : null}
        {lifecycleState === "restored" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Story restored to active work.
          </div>
        ) : null}
        {lifecycleState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {isArchived ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            This Story is archived and currently read-only. Restore it to continue active design work.
          </div>
        ) : null}

        <DeliveryStoryWorkspace blockers={blockers} data={storyResult.data} isArchived={isArchived} />
      </section>
    </AppShell>
  );
}
