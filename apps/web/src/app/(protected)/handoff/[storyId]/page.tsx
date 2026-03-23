import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleAlert, FileJson2 } from "lucide-react";
import { getStoryWorkspaceService, previewExecutionContractService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { ExecutionContractPreview } from "@/components/handoff/execution-contract-preview";
import { requireProtectedSession } from "@/lib/auth/guards";

type HandoffPageProps = {
  params: Promise<{
    storyId: string;
  }>;
};

export default async function HandoffPage({ params }: HandoffPageProps) {
  const session = await requireProtectedSession();
  const { storyId } = await params;
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
        title: "Build Handoff",
        badge: "Story M1-008"
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
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <FileJson2 className="h-3.5 w-3.5 text-primary" />
            Execution Contract preview
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{storyResult.data.story.key}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Governed handoff preview built from the persisted Story, Outcome, and Epic records.
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
                  <Link href={`/review?candidateId=${storyResult.data.story.lineageSourceId}`}>Open import lineage review</Link>
                </Button>
              ) : null}
              <Button asChild className="gap-2" variant="secondary">
                <Link href={`/stories/${storyId}`}>Open Story Workspace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ExecutionContractPreview contract={previewResult.data.contract} markdown={previewResult.data.markdown} />
        )}
      </section>
    </AppShell>
  );
}
