import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
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

function BacklogChip(props: { children: React.ReactNode; tone?: string | undefined }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${props.tone ?? "border-border/70 bg-background text-muted-foreground"}`}>
      {props.children}
    </span>
  );
}

function OutcomeRow({ outcome }: { outcome: TreeOutcome }) {
  return (
    <div className={`rounded-2xl border px-5 py-4 ${outcome.isCurrent ? "border-[#2f5f98] bg-[#2f5f98] text-white" : "border-border/70 bg-background"}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${outcome.isCurrent ? "border-white/20 bg-white/10 text-white" : "border-sky-200 bg-sky-50 text-sky-700"}`}>
              <Target className="h-4 w-4" />
            </span>
            <BacklogChip tone={outcome.isCurrent ? "border-white/20 bg-white/10 text-white/85" : "border-border/70 bg-muted text-muted-foreground"}>
              Framing
            </BacklogChip>
            <h3 className={`text-sm font-semibold ${outcome.isCurrent ? "text-white" : "text-foreground"}`}>{outcome.key}</h3>
          </div>
          <p className={`mt-2 text-sm font-semibold ${outcome.isCurrent ? "text-white" : "text-foreground"}`}>{outcome.title}</p>
          {outcome.statement ? (
            <p className={`mt-2 text-sm leading-6 ${outcome.isCurrent ? "text-white/85" : "text-muted-foreground"}`}>{outcome.statement}</p>
          ) : null}
          <div className={`mt-2 flex flex-wrap gap-2 text-xs ${outcome.isCurrent ? "text-white/80" : "text-muted-foreground"}`}>
            {getOriginLabel(outcome.originType) ? <span>{getOriginLabel(outcome.originType)}</span> : null}
            {formatLabel(outcome.lifecycleState) ? <span>{formatLabel(outcome.lifecycleState)}</span> : null}
            {formatLabel(outcome.importedReadinessState) ? <span>{formatLabel(outcome.importedReadinessState)}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {outcome.lineageHref ? (
            <Button asChild size="sm" variant={outcome.isCurrent ? "secondary" : "secondary"}>
              <Link href={outcome.lineageHref}>
                <FileSearch className="mr-2 h-3.5 w-3.5" />
                Open lineage
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant={outcome.isCurrent ? "secondary" : "secondary"}>
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
    <div className="rounded-2xl border border-border/70 bg-background">
      <div className="px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                <GitBranch className="h-4 w-4" />
              </span>
              <BacklogChip tone="border-border/70 bg-muted text-muted-foreground">Epic</BacklogChip>
              <h4 className="text-sm font-semibold text-foreground">{epic.key}</h4>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{epic.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{epic.scopeBoundary ?? epic.purpose ?? "Scope boundary is still missing."}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {storyCount} stor{storyCount === 1 ? "y" : "ies"} in branch
              {storiesWithMissingInputs > 0 ? ` - ${storiesWithMissingInputs} need more definition` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {formatLabel(epic.lifecycleState) ? <BacklogChip>{formatLabel(epic.lifecycleState)}</BacklogChip> : null}
              {getOriginLabel(epic.originType) ? <BacklogChip>{getOriginLabel(epic.originType)}</BacklogChip> : null}
              {formatLabel(epic.importedReadinessState) ? <BacklogChip tone="border-sky-200 bg-sky-50 text-sky-800">{formatLabel(epic.importedReadinessState)}</BacklogChip> : null}
            </div>
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
  const reviewText =
    missingInputs.length > 0
      ? `Needs review: ${missingInputs.join(", ")}`
      : storyUx.nextActions[0]?.description ?? storyUx.readinessDetail;

  return (
    <div className={`px-5 py-4 ${story.isCurrent ? "bg-[#2f5f98]/6" : "bg-background"}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <BacklogChip tone="border-border/70 bg-muted text-muted-foreground">Story</BacklogChip>
            <h5 className="text-sm font-semibold text-foreground">{story.key}</h5>
            <BacklogChip tone={storyUx.isReadyForHandoff ? "border-emerald-200 bg-emerald-50 text-emerald-800" : missingInputs.length > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-border/70 bg-background text-muted-foreground"}>
              {storyUx.statusLabel}
            </BacklogChip>
            {formatLabel(story.lifecycleState) ? <BacklogChip>{formatLabel(story.lifecycleState)}</BacklogChip> : null}
            {getOriginLabel(story.originType) ? <BacklogChip>{getOriginLabel(story.originType)}</BacklogChip> : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{story.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{reviewText}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>{story.testDefinition ? "Test definition captured" : "Test definition missing"}</span>
            <span>
              Acceptance criteria: {story.acceptanceCriteria?.length ?? 0}
            </span>
            <span>
              DoD: {story.definitionOfDone?.length ?? 0}
            </span>
            {formatLabel(story.importedReadinessState) ? <span>{formatLabel(story.importedReadinessState)}</span> : null}
          </div>
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

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${story.testDefinition ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          {story.testDefinition ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
          <TestTube2 className="h-3.5 w-3.5" />
          {story.testDefinition ? "Test branch defined" : "Test branch missing"}
        </span>
        {missingInputs.length > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
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
