import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleAlert, FileJson2, Rocket } from "lucide-react";
import { getStoryWorkspaceService, previewExecutionContractService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { ExecutionContractPreview } from "@/components/handoff/execution-contract-preview";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { markStoryHandoffCompleteAction } from "./actions";

type HandoffPageProps = {
  params: Promise<{
    storyId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HandoffPage({ params, searchParams }: HandoffPageProps) {
  const session = await requireActiveProjectSession();
  const { storyId } = await params;
  const query = searchParams ? await searchParams : {};
  const handoffState = getParamValue(query.handoff);
  const message = getParamValue(query.message);
  const storyResult = await getStoryWorkspaceService(session.organization.organizationId, storyId);

  if (!storyResult.ok) {
    notFound();
  }

  const previewResult = await previewExecutionContractService({
    organizationId: session.organization.organizationId,
    storyId,
    actorId: session.userId
  });

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: session.organization.organizationName,
        sectionLabel: "Build Start",
        badge: storyResult.data.story.key
      }}
    >
      <PageViewAnalytics
        eventName="execution_contract_viewed"
        properties={{
          storyId: storyResult.data.story.id,
          storyKey: storyResult.data.story.key,
          previewState: previewResult.ok ? "ready" : "blocked"
        }}
      />
      <section className="space-y-6">
        {handoffState === "success" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Build start recorded. This Delivery Story is now marked as in progress.
          </div>
        ) : null}
        {handoffState === "already" ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Build was already started for this Delivery Story. Work can continue.
          </div>
        ) : null}
        {handoffState === "error" && message ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
        ) : null}

        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <FileJson2 className="h-3.5 w-3.5 text-primary" />
            Build package preview
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{storyResult.data.story.key}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Governed build package preview built from the persisted Story, Outcome, and Epic records.
          </p>
          {storyResult.data.story.originType === "imported" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                Imported origin
              </span>
              {storyResult.data.story.importedReadinessState ? (
                <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                  {storyResult.data.story.importedReadinessState.replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {!previewResult.ok ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleAlert className="h-5 w-5 text-amber-600" />
                Contract generation is blocked
              </CardTitle>
              <CardDescription>This Story still misses required readiness inputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{previewResult.errors[0]?.message ?? "Contract generation is currently unavailable."}</p>
              {storyResult.data.story.lineageSourceType === "artifact_aas_candidate" && storyResult.data.story.lineageSourceId ? (
                <Button asChild className="gap-2" variant="secondary">
                  <Link href={`/intake?candidateId=${storyResult.data.story.lineageSourceId}`}>Open import source</Link>
                </Button>
              ) : null}
              <Button asChild className="gap-2" variant="secondary">
                <Link href={`/stories/${storyId}`}>Open Story</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Start build
                </CardTitle>
                <CardDescription>Export the build package below, then explicitly record that build has started.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
                  <p className="font-medium text-foreground">
                    {storyResult.data.story.status === "in_progress" ? "Build is active" : "Build can start now"}
                  </p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {storyResult.data.story.status === "in_progress"
                      ? "This Delivery Story has already moved into build. Reuse the package whenever the delivery team needs it again."
                      : "The package below is ready. Export it, then record build start so the Story moves from planning into active implementation."}
                  </p>
                </div>
                {storyResult.data.story.status === "in_progress" ? (
                  <Button asChild className="gap-2 self-start" variant="secondary">
                    <Link href={`/stories/${storyId}`}>
                      Open Story
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <form action={markStoryHandoffCompleteAction}>
                    <input name="storyId" type="hidden" value={storyResult.data.story.id} />
                    <input name="epicId" type="hidden" value={storyResult.data.story.epicId} />
                    <input name="outcomeId" type="hidden" value={storyResult.data.story.outcomeId} />
                    <PendingFormButton
                      className="gap-2"
                      icon={<ArrowRight className="h-4 w-4" />}
                      label="Mark build started"
                      pendingLabel="Starting build..."
                    />
                  </form>
                )}
                <Button asChild className="gap-2 self-start" variant="secondary">
                  <Link href={`/stories/${storyId}`}>
                    Back to Story
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <ExecutionContractPreview contract={previewResult.data.contract} markdown={previewResult.data.markdown} />
          </div>
        )}
      </section>
    </AppShell>
  );
}
