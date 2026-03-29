import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileSearch,
  GitBranch,
  Target,
  TestTube2
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { getStoryUxModel } from "@/lib/workspace/story-ux";

type TreeOutcome = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
  statement?: string | null;
  originType?: string | null;
  lifecycleState?: string | null;
  importedReadinessState?: string | null;
  lineageHref?: string | null;
};

type TreeStory = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
  valueIntent?: string | null | undefined;
  testDefinition: string | null;
  acceptanceCriteria?: string[] | undefined;
  definitionOfDone?: string[] | undefined;
  status?: string | undefined;
  lifecycleState?: string | undefined;
  tollgateStatus?: "blocked" | "ready" | "approved" | null | undefined;
  pendingActionCount?: number | undefined;
  blockedActionCount?: number | undefined;
  originType?: string | null | undefined;
  importedReadinessState?: string | null | undefined;
  lineageHref?: string | null | undefined;
};

type TreeEpic = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
  scopeBoundary: string | null;
  purpose?: string | null | undefined;
  originType?: string | null | undefined;
  lifecycleState?: string | null | undefined;
  importedReadinessState?: string | null | undefined;
  lineageHref?: string | null | undefined;
  stories: TreeStory[];
};

type FramingValueSpineTreeProps = {
  outcome: TreeOutcome;
  epics: TreeEpic[];
  emptyEpicMessage: string;
  emptyStoryMessage: string;
  title?: string | undefined;
  description?: string | undefined;
};

function formatLabel(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : null;
}

function getOriginLabel(originType: string | null | undefined) {
  if (originType === "seeded") {
    return "Demo";
  }

  if (originType === "native") {
    return "Native";
  }

  if (originType === "imported") {
    return "Imported";
  }

  return null;
}

function getMissingStoryInputs(story: Pick<TreeStory, "testDefinition" | "acceptanceCriteria" | "definitionOfDone">) {
  const missing: string[] = [];

  if (!story.acceptanceCriteria?.length) {
    missing.push("Acceptance criteria");
  }

  if (!story.testDefinition?.trim()) {
    missing.push("Test Definition");
  }

  if (!story.definitionOfDone?.length) {
    missing.push("Definition of Done");
  }

  return missing;
}

function joinMeta(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ");
}

function getStorySurfaceClasses(story: TreeStory, needsAttention: boolean, isReviewing: boolean, isReady: boolean) {
  if (story.isCurrent) {
    return "border-primary/30 bg-primary/5";
  }

  if (needsAttention) {
    return "border-amber-200 bg-amber-50/35";
  }

  if (isReviewing) {
    return "border-sky-200 bg-sky-50/35";
  }

  if (isReady) {
    return "border-emerald-200 bg-emerald-50/35";
  }

  return "border-border/70 bg-background";
}

function OutcomeRow({ outcome }: { outcome: TreeOutcome }) {
  return (
    <div className={`rounded-2xl border px-5 py-4 ${outcome.isCurrent ? "border-sky-200 bg-sky-50/55" : "border-border/70 bg-background"}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
              <Target className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Framing</p>
            <h3 className="text-sm font-semibold text-foreground">{outcome.key}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{outcome.title}</p>
          {outcome.statement ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{outcome.statement}</p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {joinMeta([
              getOriginLabel(outcome.originType),
              formatLabel(outcome.lifecycleState),
              formatLabel(outcome.importedReadinessState)
            ])}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {outcome.lineageHref ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={outcome.lineageHref}>
                <FileSearch className="mr-2 h-3.5 w-3.5" />
                Open lineage
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <Link href={outcome.href}>
              Open Framing
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function EpicRow({ epic, emptyStoryMessage }: { epic: TreeEpic; emptyStoryMessage: string }) {
  const storyCount = epic.stories.length;
  const storiesWithMissingInputs = epic.stories.filter((story) => getMissingStoryInputs(story).length > 0).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/55">
      <div className="px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600">
                <GitBranch className="h-4 w-4" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic</p>
              <h4 className="text-sm font-semibold text-foreground">{epic.key}</h4>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{epic.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{epic.scopeBoundary ?? epic.purpose ?? "Scope boundary is still missing."}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {joinMeta([
                getOriginLabel(epic.originType),
                formatLabel(epic.lifecycleState),
                `${storyCount} stor${storyCount === 1 ? "y" : "ies"} in branch`,
                storiesWithMissingInputs > 0 ? `${storiesWithMissingInputs} need attention` : null,
                formatLabel(epic.importedReadinessState)
              ])}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {epic.lineageHref ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={epic.lineageHref}>
                  <FileSearch className="mr-2 h-3.5 w-3.5" />
                  Open lineage
                </Link>
              </Button>
            ) : null}
            <Button asChild size="sm" variant="secondary">
              <Link href={epic.href}>
                Open Epic
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border/70">
        {epic.stories.length === 0 ? (
          <div className="px-5 py-4 text-sm text-muted-foreground">{emptyStoryMessage}</div>
        ) : (
          <div className="divide-y divide-border/70">
            {epic.stories.map((story) => (
              <StoryRow key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StoryRow({ story }: { story: TreeStory }) {
  const storyUx = getStoryUxModel({
    id: story.id,
    key: story.key,
    status: story.status ?? (story.testDefinition ? "ready_for_handoff" : "definition_blocked"),
    lifecycleState: story.lifecycleState ?? "active",
    testDefinition: story.testDefinition,
    acceptanceCriteria: story.acceptanceCriteria ?? [],
    definitionOfDone: story.definitionOfDone ?? [],
    tollgateStatus: story.tollgateStatus ?? null,
    pendingActionCount: story.pendingActionCount ?? 0,
    blockedActionCount: story.blockedActionCount ?? 0
  });
  const missingInputs = getMissingStoryInputs(story);
  const nextStep = storyUx.nextActions[0]?.label ?? storyUx.readinessLabel;
  const nextStepDetail = storyUx.nextActions[0]?.description ?? storyUx.readinessDetail;
  const needsAttention = storyUx.tone === "warning" || missingInputs.length > 0 || storyUx.blockers.length > 0;
  const isReviewing = storyUx.statusLabel === "Ready for review";
  const storySummary = story.valueIntent?.trim() || storyUx.statusDetail;
  const storyMeta = joinMeta([
    getOriginLabel(story.originType),
    formatLabel(story.lifecycleState),
    formatLabel(story.importedReadinessState)
  ]);
  const structureMeta = joinMeta([
    `Acceptance criteria: ${story.acceptanceCriteria?.length ?? 0}`,
    `DoD: ${story.definitionOfDone?.length ?? 0}`,
    story.testDefinition ? "Test path defined" : "Test path missing"
  ]);

  return (
    <div className={`border-l-4 px-5 py-4 ${getStorySurfaceClasses(story, needsAttention, isReviewing, storyUx.isReadyForHandoff)} ${needsAttention ? "border-l-amber-400" : isReviewing ? "border-l-sky-400" : storyUx.isReadyForHandoff ? "border-l-emerald-400" : "border-l-transparent"}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Story</p>
            <h5 className="text-sm font-semibold text-foreground">{story.key}</h5>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{story.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{storySummary}</p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">Story path:</span> {storyUx.statusLabel}
          </p>
          {needsAttention ? (
            <p className="mt-1 text-sm text-amber-900">
              <span className="font-medium">Attention:</span> {missingInputs.join(", ") || storyUx.blockers[0]}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-foreground">
            <span className="font-medium">Next step:</span> {nextStep}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{nextStepDetail}</p>
          {storyMeta ? <p className="mt-2 text-xs text-muted-foreground">{storyMeta}</p> : null}
          <p className="mt-1 text-xs text-muted-foreground">{structureMeta}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {story.lineageHref ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={story.lineageHref}>
                <FileSearch className="mr-2 h-3.5 w-3.5" />
                Open lineage
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <Link href={story.href}>
              Open Story
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <span className={`inline-flex items-center gap-2 ${story.testDefinition ? "text-emerald-800" : "text-amber-800"}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <TestTube2 className="h-3.5 w-3.5" />
          {story.testDefinition ? "Test path defined" : "Test path missing"}
        </span>
        {missingInputs.length > 0 ? (
          <span className="inline-flex items-center gap-2 text-amber-800">
            <CircleAlert className="h-3.5 w-3.5" />
            {missingInputs.join(", ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function FramingValueSpineTree({
  outcome,
  epics,
  emptyEpicMessage,
  emptyStoryMessage,
  title = "Framing-scoped Value Spine",
  description
}: FramingValueSpineTreeProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <OutcomeRow outcome={outcome} />

        {epics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No Epics are attached to this Framing yet.</p>
            <p className="mt-2">{emptyEpicMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {epics.map((epic) => (
              <EpicRow emptyStoryMessage={emptyStoryMessage} epic={epic} key={epic.id} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
