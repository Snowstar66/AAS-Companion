import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileSearch,
  GitBranch,
  Lightbulb,
  Target,
  TestTube2
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import {
  getStoryIdeaBlockers,
  getStoryIdeaIntentText,
  isStoryIdeaReadyForFraming,
  isStoryIdeaStarted
} from "@/lib/framing/story-idea-status";
import {
  isLikelyDeliveryStory
} from "@/lib/framing/story-idea-delivery-feedback";
import { getStoryUxModel } from "@/lib/workspace/story-ux";

type TreeOutcome = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
  problemStatement?: string | null;
  outcomeStatement?: string | null;
  originType?: string | null;
  lifecycleState?: string | null;
  importedReadinessState?: string | null;
  lineageHref?: string | null;
};

type TreeDirectionSeed = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
  shortDescription?: string | null;
  expectedBehavior?: string | null;
  uxSketchName?: string | null;
  uxSketchDataUrl?: string | null;
  sourceStoryId?: string | null;
  lifecycleState?: string | null;
  originType?: string | null;
  importedReadinessState?: string | null;
  lineageHref?: string | null;
};

type TreeStory = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
  sourceDirectionSeedId?: string | null | undefined;
  valueIntent?: string | null | undefined;
  expectedBehavior?: string | null | undefined;
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
  directionSeeds?: TreeDirectionSeed[];
  stories?: TreeStory[];
};

type FramingValueSpineTreeProps = {
  outcome: TreeOutcome;
  epics: TreeEpic[];
  emptyEpicMessage: string;
  emptyStoryMessage: string;
  mode?: "delivery" | "framing";
  title?: string | undefined;
  description?: string | undefined;
  embedded?: boolean | undefined;
  language?: "en" | "sv" | undefined;
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
  return parts.filter(Boolean).join(" | ");
}

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
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

function DeliveryStoryChildRow({
  story,
  emphasis = "linked",
  language
}: {
  story: TreeStory;
  emphasis?: "linked" | "additional";
  language: "en" | "sv";
}) {
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
  }, language);
  const missingInputs = getMissingStoryInputs(story);
  const deliveryDescription = story.expectedBehavior?.trim() || storyUx.statusDetail;
  const structureMeta = joinMeta([
    t(language, `Acceptance criteria: ${story.acceptanceCriteria?.length ?? 0}`, `Acceptanskriterier: ${story.acceptanceCriteria?.length ?? 0}`),
    `DoD: ${story.definitionOfDone?.length ?? 0}`,
    story.testDefinition ? t(language, "Test path defined", "Testspår definierat") : t(language, "Test path missing", "Testspår saknas")
  ]);

  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        emphasis === "linked" ? "border-emerald-200 bg-emerald-50/45" : "border-amber-200 bg-amber-50/45"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Delivery Story", "Delivery Story")}</p>
            <h6 className="text-sm font-semibold text-foreground">{story.key}</h6>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                emphasis === "linked"
                  ? "border-emerald-200 bg-white text-emerald-800"
                  : "border-amber-200 bg-white text-amber-900"
              }`}
            >
              {emphasis === "linked" ? t(language, "Derived from this idea", "Härledd från den här idén") : t(language, "Additional in this Epic", "Ytterligare i detta epic")}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{story.title}</p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span>{" "}
            {story.valueIntent?.trim() || t(language, "This Delivery Story still needs a clearer value intent.", "Den här delivery storyn behöver fortfarande ett tydligare value intent.")}
          </p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Delivery description:", "Leveransbeskrivning:")}</span> {deliveryDescription}
          </p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Delivery status:", "Leveransstatus:")}</span> {storyUx.statusLabel}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{storyUx.readinessDetail}</p>
          <p className="mt-2 text-xs text-muted-foreground">{structureMeta}</p>
          {missingInputs.length > 0 ? (
            <p className="mt-2 text-xs text-amber-900">
              <span className="font-medium">{t(language, "Needs attention:", "Behöver uppmärksamhet:")}</span> {missingInputs.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href={story.href}>
              {t(language, "Open Delivery Story", "Öppna Delivery Story")}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function OutcomeRow({ outcome, mode, language }: { outcome: TreeOutcome; mode: "delivery" | "framing"; language: "en" | "sv" }) {
  const hasProblemStatement = Boolean(outcome.problemStatement?.trim());
  const hasOutcomeStatement = Boolean(outcome.outcomeStatement?.trim());

  return (
    <div className={`rounded-2xl border px-5 py-4 ${outcome.isCurrent ? "border-sky-200 bg-sky-50/55" : "border-border/70 bg-background"}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
              <Target className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {mode === "framing" ? t(language, "Framing brief", "Framingbrief") : t(language, "Framing", "Framing")}
            </p>
            <h3 className="text-sm font-semibold text-foreground">{outcome.key}</h3>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{outcome.title}</p>
          {hasProblemStatement ? (
            <p className="mt-2 text-sm text-foreground">
              <span className="font-medium">{t(language, "Problem statement:", "Problem statement:")}</span>{" "}
              {outcome.problemStatement}
            </p>
          ) : null}
          {hasOutcomeStatement ? (
            <p className="mt-2 text-sm text-foreground">
              <span className="font-medium">{t(language, "Outcome statement:", "Outcome statement:")}</span>{" "}
              {outcome.outcomeStatement}
            </p>
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
                {t(language, "Open lineage", "Öppna lineage")}
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <Link href={outcome.href}>
              {t(language, "Open Framing", "Öppna Framing")}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DirectionSeedRow({
  seed,
  derivedStories,
  language
}: {
  seed: TreeDirectionSeed;
  derivedStories: TreeStory[];
  language: "en" | "sv";
}) {
  const intentText = getStoryIdeaIntentText({
    shortDescription: seed.shortDescription,
    expectedBehavior: seed.expectedBehavior
  });
  const isReady = isStoryIdeaReadyForFraming({
    shortDescription: seed.shortDescription,
    expectedBehavior: seed.expectedBehavior
  });
  const isStarted = isStoryIdeaStarted({
    shortDescription: seed.shortDescription,
    expectedBehavior: seed.expectedBehavior
  });
  const needsAttention = !isReady;
  const valueIntent = intentText?.trim();
  const ideaBlockers = getStoryIdeaBlockers({
    shortDescription: seed.shortDescription,
    expectedBehavior: seed.expectedBehavior,
    hasEpicLink: true
  });

  return (
    <div
      className={`border-l-4 px-5 py-4 ${
        needsAttention ? "border-l-amber-400 border-amber-200 bg-amber-50/35" : "border-l-transparent border-border/70 bg-background"
      }`}
      id={`seed-${seed.id}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-700">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Story idea", "Story idea")}</p>
            <h5 className="text-sm font-semibold text-foreground">{seed.key}</h5>
            {isReady ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t(language, "Ready for review", "Redo för granskning")}
              </span>
            ) : isStarted ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                <CircleAlert className="h-3.5 w-3.5" />
                {t(language, "Needs action", "Behöver åtgärd")}
              </span>
            ) : null}
            {seed.uxSketchDataUrl?.trim() ? (
              <span className="inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-medium text-sky-900">
                {t(language, "UX Sketch Attached", "UX-skiss bifogad")}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{seed.title}</p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span>{" "}
            {valueIntent || t(language, "Add Value Intent so this story idea explains what user or business value it should create.", "Lägg till Value Intent så att story idean förklarar vilket användar- eller affärsvärde den ska skapa.")}
          </p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Expected behavior:", "Förväntat beteende:")}</span>{" "}
            {seed.expectedBehavior?.trim() || t(language, "Optional and not captured yet.", "Valfritt och ännu inte fångat.")}
          </p>
          {ideaBlockers.length > 0 ? (
            <p className="mt-1 text-sm text-amber-900">
              <span className="font-medium">{t(language, "Needs attention:", "Behöver uppmärksamhet:")}</span> {ideaBlockers.join(" ")}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {joinMeta([
              getOriginLabel(seed.originType),
              formatLabel(seed.lifecycleState),
              seed.sourceStoryId ? t(language, `Legacy source ${seed.sourceStoryId}`, `Legacy-källa ${seed.sourceStoryId}`) : null,
              formatLabel(seed.importedReadinessState)
            ])}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {seed.lineageHref ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={seed.lineageHref}>
                <FileSearch className="mr-2 h-3.5 w-3.5" />
                {t(language, "Open lineage", "Öppna lineage")}
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <Link href={seed.href}>
              {t(language, "Open Story idea", "Öppna Story idea")}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
      {derivedStories.length > 0 ? (
        <div className="mt-4 space-y-3 rounded-2xl border border-emerald-200/70 bg-white/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t(language, "Delivery Stories", "Delivery Stories")}
            </p>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
              {derivedStories.length}
            </span>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {t(language, "These Delivery Stories realize this Story Idea in design and build.", "De här Delivery Stories realiserar den här Story Idean i design och build.")}
          </p>
          <div className="space-y-3">
            {derivedStories.map((story) => (
              <DeliveryStoryChildRow key={story.id} language={language} story={story} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
          {t(language, "No Delivery Stories have been created from this Story Idea yet.", "Inga Delivery Stories har skapats från den här Story Idean ännu.")}
        </div>
      )}
    </div>
  );
}

function StoryIdeaRow({ story, language }: { story: TreeStory; language: "en" | "sv" }) {
  const isReady = isStoryIdeaReadyForFraming({
    valueIntent: story.valueIntent,
    expectedBehavior: story.expectedBehavior
  });
  const isStarted = isStoryIdeaStarted({
    valueIntent: story.valueIntent,
    expectedBehavior: story.expectedBehavior
  });
  const needsAttention = !isReady;
  const ideaBlockers = getStoryIdeaBlockers({
    valueIntent: story.valueIntent,
    expectedBehavior: story.expectedBehavior,
    hasEpicLink: true
  });

  return (
    <div
      className={`border-l-4 px-5 py-4 ${
        needsAttention ? "border-l-amber-400 border-amber-200 bg-amber-50/35" : "border-l-transparent border-border/70 bg-background"
      }`}
      id={`story-idea-${story.id}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Story idea", "Story idea")}</p>
            <h5 className="text-sm font-semibold text-foreground">{story.key}</h5>
            {isReady ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t(language, "Ready for review", "Redo för granskning")}
              </span>
            ) : isStarted ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                <CircleAlert className="h-3.5 w-3.5" />
                {t(language, "Needs action", "Behöver åtgärd")}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{story.title}</p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span>{" "}
            {story.valueIntent?.trim() || t(language, "Add Value Intent so this story idea explains what user or business value it should create.", "Lägg till Value Intent så att story idean förklarar vilket användar- eller affärsvärde den ska skapa.")}
          </p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Expected behavior:", "Förväntat beteende:")}</span>{" "}
            {story.expectedBehavior?.trim() || t(language, "Not described yet.", "Inte beskrivet ännu.")}
          </p>
          {ideaBlockers.length > 0 ? (
            <p className="mt-1 text-sm text-amber-900">
              <span className="font-medium">{t(language, "Needs attention:", "Behöver uppmärksamhet:")}</span> {ideaBlockers.join(" ")}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {joinMeta([
              getOriginLabel(story.originType),
              formatLabel(story.lifecycleState),
              t(language, "Legacy story source", "Legacy story-källa"),
              formatLabel(story.importedReadinessState)
            ])}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {story.lineageHref ? (
            <Button asChild size="sm" variant="secondary">
              <Link href={story.lineageHref}>
                <FileSearch className="mr-2 h-3.5 w-3.5" />
                {t(language, "Open lineage", "Öppna lineage")}
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <Link href={story.href}>
              {t(language, "Open Story idea", "Öppna Story idea")}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StoryRow({ story, language }: { story: TreeStory; language: "en" | "sv" }) {
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
  }, language);
  const missingInputs = getMissingStoryInputs(story);
  const nextStep = storyUx.nextActions[0]?.label ?? storyUx.readinessLabel;
  const nextStepDetail = storyUx.nextActions[0]?.description ?? storyUx.readinessDetail;
  const needsAttention = storyUx.tone === "warning" || missingInputs.length > 0 || storyUx.blockers.length > 0;
  const isReviewing = storyUx.readinessLabel === t(language, "Design ready", "Designredo");
  const storySummary = story.valueIntent?.trim() || storyUx.statusDetail;
  const storyMeta = joinMeta([
    getOriginLabel(story.originType),
    formatLabel(story.lifecycleState),
    formatLabel(story.importedReadinessState)
  ]);
  const structureMeta = joinMeta([
    t(language, `Acceptance criteria: ${story.acceptanceCriteria?.length ?? 0}`, `Acceptanskriterier: ${story.acceptanceCriteria?.length ?? 0}`),
    `DoD: ${story.definitionOfDone?.length ?? 0}`,
    story.testDefinition ? t(language, "Test path defined", "Testspår definierat") : t(language, "Test path missing", "Testspår saknas")
  ]);

  const showReviewingTone = isReviewing;
  const showReadyTone = storyUx.isReadyForHandoff;

  return (
    <div
      className={`border-l-4 px-5 py-4 ${getStorySurfaceClasses(story, needsAttention, showReviewingTone, showReadyTone)} ${
        needsAttention
          ? "border-l-amber-400"
          : showReviewingTone
            ? "border-l-sky-400"
            : showReadyTone
              ? "border-l-emerald-400"
              : "border-l-transparent"
      }`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Story", "Story")}</p>
            <h5 className="text-sm font-semibold text-foreground">{story.key}</h5>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{story.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{storySummary}</p>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-medium">{t(language, "Current status:", "Aktuell status:")}</span> {storyUx.statusLabel}
          </p>
          {needsAttention ? (
            <p className="mt-1 text-sm text-amber-900">
              <span className="font-medium">{t(language, "Blockers:", "Blockerare:")}</span> {missingInputs.join(", ") || storyUx.blockers[0]}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-foreground">
            <span className="font-medium">{t(language, "Next best action:", "Bästa nästa steg:")}</span> {nextStep}
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
                {t(language, "Open lineage", "Öppna lineage")}
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="secondary">
            <Link href={story.href}>
              {t(language, "Open Story", "Öppna Story")}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
        <span className={`inline-flex items-center gap-2 ${story.testDefinition ? "text-emerald-800" : "text-amber-800"}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          <TestTube2 className="h-3.5 w-3.5" />
          {story.testDefinition ? t(language, "Test path defined", "Testspår definierat") : t(language, "Test path missing", "Testspår saknas")}
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

function EpicRow({
  epic,
  emptyStoryMessage,
  mode,
  language
}: {
  epic: TreeEpic;
  emptyStoryMessage: string;
  mode: "delivery" | "framing";
  language: "en" | "sv";
}) {
  const directionSeeds = epic.directionSeeds ?? [];
  const stories = epic.stories ?? [];
  const mappedSourceStoryIds = new Set(directionSeeds.map((seed) => seed.sourceStoryId).filter(Boolean));
  const hasExplicitStoryIdeas = directionSeeds.length > 0;
  const framingStories = stories.filter(
    (story) =>
      !story.sourceDirectionSeedId &&
      (!hasExplicitStoryIdeas
        ? story.status === "draft" || story.status === "definition_blocked" || !isLikelyDeliveryStory(story, mappedSourceStoryIds)
        : !isLikelyDeliveryStory(story, mappedSourceStoryIds))
  );
  const framingStoryIds = new Set(framingStories.map((story) => story.id));
  const additionalDeliveryStories = stories.filter(
    (story) => !story.sourceDirectionSeedId && !framingStoryIds.has(story.id) && isLikelyDeliveryStory(story, mappedSourceStoryIds)
  );
  const itemCount = mode === "framing" ? directionSeeds.length + framingStories.length : stories.length;
  const framingNeedsAttention = directionSeeds.filter(
    (seed) =>
      !isStoryIdeaReadyForFraming({
        shortDescription: seed.shortDescription,
        expectedBehavior: seed.expectedBehavior
      })
  ).length;
  const deliveryNeedsAttention = stories.filter((story) => getMissingStoryInputs(story).length > 0).length;
  const framingStoryNeedsAttention = framingStories.filter(
    (story) =>
      !isStoryIdeaReadyForFraming({
        valueIntent: story.valueIntent,
        expectedBehavior: story.expectedBehavior
      })
  ).length;
  const storyIdeaCount = directionSeeds.length + framingStories.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/55">
      <div className="px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600">
                <GitBranch className="h-4 w-4" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Epic", "Epic")}</p>
              <h4 className="text-sm font-semibold text-foreground">{epic.key}</h4>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{epic.title}</p>
            {epic.purpose?.trim() ? (
              <p className="mt-2 text-sm text-foreground">
                <span className="font-medium">{t(language, "Purpose:", "Purpose:")}</span> {epic.purpose}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {epic.scopeBoundary?.trim() ?? t(language, "Scope boundary is still missing.", "Scope-gräns saknas fortfarande.")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {joinMeta([
                getOriginLabel(epic.originType),
                formatLabel(epic.lifecycleState),
                mode === "framing"
                  ? t(language, `${itemCount} story idea${itemCount === 1 ? "" : "s"}`, `${itemCount} story idea`)
                  : t(language, `${itemCount} stor${itemCount === 1 ? "y" : "ies"} in branch`, `${itemCount} stories i grenen`),
                mode === "framing"
                  ? framingNeedsAttention + framingStoryNeedsAttention > 0
                    ? t(language, `${framingNeedsAttention + framingStoryNeedsAttention} need clearer descriptions`, `${framingNeedsAttention + framingStoryNeedsAttention} behöver tydligare beskrivningar`)
                    : null
                  : deliveryNeedsAttention > 0
                    ? t(language, `${deliveryNeedsAttention} need attention`, `${deliveryNeedsAttention} behöver uppmärksamhet`)
                    : null,
                formatLabel(epic.importedReadinessState)
              ])}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {epic.lineageHref ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={epic.lineageHref}>
                  <FileSearch className="mr-2 h-3.5 w-3.5" />
                  {t(language, "Open lineage", "Öppna lineage")}
                </Link>
              </Button>
            ) : null}
            <Button asChild size="sm" variant="secondary">
              <Link href={epic.href}>
                {t(language, "Open Epic", "Öppna Epic")}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border/70">
        {mode === "framing" && storyIdeaCount === 0 && additionalDeliveryStories.length === 0 ? (
          <div className="px-5 py-4 text-sm text-muted-foreground">{emptyStoryMessage}</div>
        ) : mode !== "framing" && itemCount === 0 ? (
          <div className="px-5 py-4 text-sm text-muted-foreground">{emptyStoryMessage}</div>
        ) : (
          <div className="space-y-4 p-4">
            {mode === "framing" ? (
              <>
                <div className="rounded-2xl border border-border/70 bg-background/90">
                  <div className="border-b border-border/70 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Story Ideas", "Story Ideas")}</p>
                      <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {storyIdeaCount}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t(language, "Story Ideas define intent, value and expected behavior. They guide design but are not delivery specifications.", "Story Ideas definierar intent, värde och expected behavior. De vägleder design men är inte leveransspecifikationer.")}
                    </p>
                  </div>
                  {storyIdeaCount === 0 ? (
                    <div className="px-5 py-4 text-sm text-muted-foreground">{t(language, "No Story Ideas are currently visible in this Epic.", "Inga Story Ideas syns just nu i det här epicet.")}</div>
                  ) : (
                    <div className="divide-y divide-border/70">
                      {directionSeeds.map((seed) => (
                        <DirectionSeedRow
                          derivedStories={stories.filter((story) => story.sourceDirectionSeedId === seed.id)}
                          key={`seed-${seed.id}`}
                          seed={seed}
                          language={language}
                        />
                      ))}
                      {framingStories.map((story) => (
                        <StoryIdeaRow key={`legacy-story-${story.id}`} language={language} story={story} />
                      ))}
                    </div>
                  )}
                </div>

                {additionalDeliveryStories.length > 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {t(language, "Additional Delivery Stories", "Ytterligare Delivery Stories")}
                      </p>
                      <span className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900">
                        {additionalDeliveryStories.length}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t(language, "These Delivery Stories belong to the same Epic, but were added during design or delivery rather than directly created from one Story Idea.", "De här Delivery Stories hör till samma epic, men lades till under design eller leverans i stället för att skapas direkt från en Story Idea.")}
                    </p>
                    <div className="mt-4 space-y-3">
                      {additionalDeliveryStories.map((story) => (
                        <DeliveryStoryChildRow emphasis="additional" key={`additional-${story.id}`} language={language} story={story} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="divide-y divide-border/70 rounded-2xl border border-border/70 bg-background/90">
                {stories.map((story) => (
                  <StoryRow key={story.id} language={language} story={story} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function FramingValueSpineTree({
  outcome,
  epics,
  emptyEpicMessage,
  emptyStoryMessage,
  mode = "delivery",
  title = "Framing-scoped Value Spine",
  description,
  embedded = false,
  language = "en"
}: FramingValueSpineTreeProps) {
  const treeContent = (
    <>
      {!embedded ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
      ) : null}
      <CardContent className={embedded ? "space-y-4 p-0" : "space-y-4"}>
        {embedded && description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <OutcomeRow language={language} mode={mode} outcome={outcome} />

        {epics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t(language, "No Epics are attached to this Framing yet.", "Inga Epics är kopplade till den här Framingen ännu.")}</p>
            <p className="mt-2">{emptyEpicMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {epics.map((epic) => (
              <EpicRow emptyStoryMessage={emptyStoryMessage} epic={epic} key={epic.id} language={language} mode={mode} />
            ))}
          </div>
        )}
      </CardContent>
    </>
  );

  if (embedded) {
    return treeContent;
  }

  return <Card className="border-border/70 shadow-sm">{treeContent}</Card>;
}

