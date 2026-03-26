import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, GitBranch, Target, TestTube2 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { InlineTermHelp } from "@/components/shared/inline-term-help";
import { getStoryToneClasses, getStoryUxModel } from "@/lib/workspace/story-ux";

type TreeOutcome = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
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
};

type TreeEpic = {
  id: string;
  key: string;
  title: string;
  href: string;
  isCurrent?: boolean;
  scopeBoundary: string | null;
  stories: TreeStory[];
};

type FramingValueSpineTreeProps = {
  outcome: TreeOutcome;
  epics: TreeEpic[];
  emptyEpicMessage: string;
  emptyStoryMessage: string;
};

function CurrentBadge({ show = false }: { show?: boolean | undefined }) {
  if (!show) {
    return null;
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
      Current
    </span>
  );
}

export function FramingValueSpineTree({
  outcome,
  epics,
  emptyEpicMessage,
  emptyStoryMessage
}: FramingValueSpineTreeProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Framing-scoped Value Spine</CardTitle>
        <CardDescription>
          This hierarchy shows only the Outcome, Epics, Stories, and test readiness that belong to the current Framing branch.
          {" "}
          <InlineTermHelp term="Value Spine" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-border/70 bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Framing</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{outcome.key}</p>
                <p className="mt-1 text-sm text-muted-foreground">{outcome.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CurrentBadge show={outcome.isCurrent} />
              <Button asChild size="sm" variant="secondary">
                <Link href={outcome.href}>
                  Open Framing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {epics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No Epics are attached to this Framing yet.</p>
            <p className="mt-2">{emptyEpicMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {epics.map((epic) => (
              <div className="rounded-[28px] border border-border/70 bg-muted/15 p-4" key={epic.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <GitBranch className="mt-0.5 h-5 w-5 text-sky-700" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{epic.key}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{epic.title}</p>
                      {epic.scopeBoundary ? (
                        <div className="mt-2 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Scope:</span> {epic.scopeBoundary}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrentBadge show={epic.isCurrent} />
                    <Button asChild size="sm" variant="secondary">
                      <Link href={epic.href}>
                        Open Epic
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-l border-border/70 pl-4">
                  {epic.stories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">No Stories are attached to this Epic yet.</p>
                      <p className="mt-2">{emptyStoryMessage}</p>
                    </div>
                  ) : (
                    epic.stories.map((story) => (
                      (() => {
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

                        return (
                          <div className="rounded-2xl border border-border/70 bg-background p-4" key={story.id}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Story</p>
                                <p className="mt-1 text-sm font-semibold text-foreground">{story.key}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{story.title}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <CurrentBadge show={story.isCurrent} />
                                <Button asChild size="sm" variant="secondary">
                                  <Link href={story.href}>
                                    Open Story
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 xl:grid-cols-3">
                              <div className={`rounded-2xl border px-3 py-3 text-sm ${getStoryToneClasses(storyUx.tone)}`}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Operational status</p>
                                <p className="mt-2 font-semibold">{storyUx.statusLabel}</p>
                                <p className="mt-2 leading-6">{storyUx.statusDetail}</p>
                              </div>
                              <div className="rounded-2xl border border-border/70 bg-muted/10 px-3 py-3 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Open actions</p>
                                <p className="mt-2 font-semibold text-foreground">{storyUx.openActionCount}</p>
                                <p className="mt-2 leading-6 text-muted-foreground">
                                  {storyUx.missingSignoffCount > 0
                                    ? `${storyUx.missingSignoffCount} sign-off action${storyUx.missingSignoffCount === 1 ? "" : "s"} still missing.`
                                    : "No missing sign-offs are currently visible."}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-border/70 bg-muted/10 px-3 py-3 text-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Handoff state</p>
                                <p className="mt-2 font-semibold text-foreground">
                                  {storyUx.isReadyForHandoff ? "Ready for handoff" : storyUx.readinessLabel}
                                </p>
                                <p className="mt-2 leading-6 text-muted-foreground">{storyUx.readinessDetail}</p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-border/70 bg-muted/10 p-4">
                              <div className="flex items-start gap-3">
                                <TestTube2 className="mt-0.5 h-5 w-5 text-violet-700" />
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Test branch</p>
                                  {story.testDefinition ? (
                                    <>
                                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Test Definition captured
                                      </div>
                                      <p className="mt-3 text-sm text-muted-foreground">{story.testDefinition}</p>
                                    </>
                                  ) : (
                                    <>
                                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                                        <CircleDashed className="h-3.5 w-3.5" />
                                        Empty test branch
                                      </div>
                                      <p className="mt-3 text-sm text-muted-foreground">
                                        No Test Definition is attached yet. The branch stays empty instead of showing unrelated demo data.
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
