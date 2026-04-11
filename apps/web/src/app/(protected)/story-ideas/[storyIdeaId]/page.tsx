import { notFound } from "next/navigation";
import { cookies } from "next/headers";
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

type AppLanguage = "en" | "sv";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function StoryIdeaWorkspacePage({ params, searchParams }: StoryIdeaWorkspacePageProps) {
  const emptySearchParams: Record<string, string | string[] | undefined> = {};
  const [language, organization, resolvedParams, query] = await Promise.all([
    getServerLanguage(),
    requireOrganizationContext(),
    params,
    searchParams ? searchParams : Promise.resolve(emptySearchParams)
  ]);
  const { storyIdeaId } = resolvedParams;
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
          sectionLabel: t(language, "Story Idea", "Story Idea"),
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
              {t(language, "Native Story Idea created inside the current Framing.", "Native Story Idea skapades i aktuell Framing.")}
            </div>
          ) : null}
          {saveState === "success" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {t(language, "Story Idea changes were saved successfully.", "Andringar i Story Idea sparades.")} 
            </div>
          ) : null}
          {saveState === "error" && saveMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
          ) : null}
          {lifecycleState === "archived" ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              {t(language, "Story Idea archived. It is now removed from active working views but remains traceable.", "Story Idea arkiverades. Den ar nu borttagen fran aktiva arbetsvyer men ar fortfarande sparbar.")}
            </div>
          ) : null}
          {lifecycleState === "restored" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {t(language, "Story Idea restored to active work.", "Story Idea aterstalldes till aktivt arbete.")}
            </div>
          ) : null}
          {lifecycleState === "error" && saveMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
          ) : null}
          {isArchived ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              {t(language, "This Story Idea is archived and currently read-only. Restore it to continue active framing work.", "Den har Story Idean ar arkiverad och lasbar. Aterstall den for att fortsatta aktivt framingarbete.")}
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
        sectionLabel: t(language, "Story Idea", "Story Idea"),
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
            {t(language, "Native Story Idea created inside the current Framing.", "Native Story Idea skapades i aktuell Framing.")}
          </div>
        ) : null}
        {saveState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {t(language, "Story Idea changes were saved successfully.", "Andringar i Story Idea sparades.")}
          </div>
        ) : null}
        {saveState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {lifecycleState === "archived" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {t(language, "Story Idea archived. It is now removed from active working views but remains traceable.", "Story Idea arkiverades. Den ar nu borttagen fran aktiva arbetsvyer men ar fortfarande sparbar.")}
          </div>
        ) : null}
        {lifecycleState === "restored" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {t(language, "Story Idea restored to active work.", "Story Idea aterstalldes till aktivt arbete.")}
          </div>
        ) : null}
        {lifecycleState === "error" && saveMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveMessage}</div>
        ) : null}
        {isArchived ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {t(language, "This Story Idea is archived and currently read-only. Restore it to continue active framing work.", "Den har Story Idean ar arkiverad och lasbar. Aterstall den for att fortsatta aktivt framingarbete.")}
          </div>
        ) : null}
        {canAlsoOpenDeliveryView ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            {t(language, "You opened the Story Idea view. This record also has a Delivery Story view for later design and build work.", "Du oppnade Story Idea-vyn. Den har posten har ocksa en Delivery Story-vy for senare design- och buildarbete.")}
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
