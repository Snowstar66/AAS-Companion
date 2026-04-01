import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@aas-companion/ui";
import { AasBrandMark } from "@/components/shared/aas-brand-mark";
import { ApprovalDocumentPrintButton } from "@/components/workspace/approval-document-print-button";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOutcomeTollgateReviewData } from "@/lib/cache/project-data";
import { formatAiLevelLabel, getAiLevelSummary } from "@/lib/help/aas-help";

type ApprovalSnapshot = {
  kind: "framing_approval_document";
  version: 1;
  approvedVersion: number;
  approvedAt: string;
  outcome: {
    outcomeId: string;
    key: string;
    title: string;
    problemStatement: string | null;
    outcomeStatement: string | null;
    timeframe: string | null;
    valueOwner: string | null;
    baselineDefinition: string | null;
    baselineSource: string | null;
    solutionContext: string | null;
    constraints: string | null;
    dataSensitivity: string | null;
    deliveryType: "AD" | "AT" | "AM" | null;
    aiLevel: "level_1" | "level_2" | "level_3";
    riskProfile: "low" | "medium" | "high";
    riskRationale: {
      businessImpact: string | null;
      dataSensitivity: string | null;
      blastRadius: string | null;
      decisionImpact: string | null;
    };
  };
  epics: Array<{
    key: string;
    title: string;
    purpose: string | null;
    scopeBoundary: string | null;
  }>;
  storyIdeas: Array<{
    key: string;
    title: string;
    linkedEpic: string | null;
    valueIntent: string | null;
    expectedBehavior: string | null;
    sourceType: "direction_seed" | "legacy_story_idea";
  }>;
  signoffs: Array<{
    id: string;
    decisionKind: string;
    requiredRoleType: string;
    actualPersonName: string;
    actualRoleTitle: string;
    organizationSide: string;
    decisionStatus: string;
    note: string | null;
    evidenceReference: string | null;
    createdAt: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not captured";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not captured";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function formatLabel(value: string | null) {
  return value ? value.replaceAll("_", " ") : "Not captured";
}

export default async function OutcomeApprovalDocumentPage({
  params
}: {
  params: Promise<{ outcomeId: string }>;
}) {
  const { outcomeId } = await params;
  const session = await requireActiveProjectSession();
  const reviewResult = await getCachedOutcomeTollgateReviewData(session.organization.organizationId, outcomeId);

  if (!reviewResult.ok) {
    notFound();
  }

  const snapshot = reviewResult.data.tollgateReview.approvalSnapshot as ApprovalSnapshot | null;

  if (!snapshot) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <AasBrandMark subtitle="Approved framing document" />
          <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={`/outcomes/${outcomeId}`}>
            Back to Framing
          </Link>
        </div>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <h1 className="text-xl font-semibold text-foreground">No approved framing document available</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Tollgate 1 needs a completed approval before a framing approval document can be opened or printed.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const storyIdeasByEpic = new Map<string, ApprovalSnapshot["storyIdeas"]>();

  for (const storyIdea of snapshot.storyIdeas) {
    const epicKey = storyIdea.linkedEpic ?? "__unassigned__";
    const existing = storyIdeasByEpic.get(epicKey) ?? [];
    existing.push(storyIdea);
    storyIdeasByEpic.set(epicKey, existing);
  }

  const unassignedStoryIdeas = storyIdeasByEpic.get("__unassigned__") ?? [];

  return (
    <section className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-white px-6 py-5 shadow-sm print:hidden lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <AasBrandMark subtitle="Approved framing document" />
          <div className="text-sm text-muted-foreground">
            Approved framing version {snapshot.approvedVersion} on {formatDate(snapshot.approvedAt)}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ApprovalDocumentPrintButton />
          <Link
            className="inline-flex items-center rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
            href={`/outcomes/${outcomeId}`}
          >
            Back to Framing
          </Link>
        </div>
      </div>

      <article className="rounded-[32px] border border-border/70 bg-white p-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)] print:border-0 print:p-0 print:shadow-none">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <AasBrandMark subtitle="Controlled framing approval record" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tollgate 1 approval record</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{snapshot.outcome.title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This document captures the approved customer handshake, framing direction and sign-off trail for the
                  approved Framing version.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">Framing status</p>
                <p className="mt-2 text-2xl font-semibold text-sky-950">Approved</p>
                <p className="mt-2 text-sm text-sky-900">Version {snapshot.approvedVersion}</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">Approved at</p>
                <p className="mt-2 text-sm font-medium text-emerald-950">{formatDate(snapshot.approvedAt)}</p>
              </div>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Business case</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-800">
                <p><span className="font-semibold">Outcome key:</span> {snapshot.outcome.key}</p>
                <p><span className="font-semibold">Timeframe:</span> {snapshot.outcome.timeframe ?? "Not captured"}</p>
                <p><span className="font-semibold">Value Owner:</span> {snapshot.outcome.valueOwner ?? "Unassigned"}</p>
                <div>
                  <p className="font-semibold">Problem statement</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.problemStatement ?? "Not captured"}</p>
                </div>
                <div>
                  <p className="font-semibold">Outcome statement</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.outcomeStatement ?? "Not captured"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Baseline</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-800">
                <div>
                  <p className="font-semibold">Definition</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.baselineDefinition ?? "Not captured"}</p>
                </div>
                <div>
                  <p className="font-semibold">Source</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.baselineSource ?? "Not captured"}</p>
                </div>
                <div>
                  <p className="font-semibold">Solution context</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.solutionContext ?? "Not captured"}</p>
                </div>
                <div>
                  <p className="font-semibold">Constraints</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.constraints ?? "Not captured"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">AI and risk</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800">
                <p><span className="font-semibold">AI Level:</span> {formatAiLevelLabel(snapshot.outcome.aiLevel)}</p>
                <p className="mt-2 text-slate-700">{getAiLevelSummary(snapshot.outcome.aiLevel) ?? "Not captured"}</p>
                <p className="mt-3"><span className="font-semibold">Risk profile:</span> {formatLabel(snapshot.outcome.riskProfile)}</p>
                <p><span className="font-semibold">Data sensitivity:</span> {snapshot.outcome.dataSensitivity ?? "Not captured"}</p>
                <p><span className="font-semibold">Delivery type:</span> {snapshot.outcome.deliveryType ?? "Not captured"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">Risk summary</p>
                <p className="mt-2 text-slate-700">
                  This risk posture was classified in Framing and approved as part of Tollgate 1 for the recorded Framing version.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">Business impact</p>
                <p className="mt-2">{snapshot.outcome.riskRationale.businessImpact ?? "Not captured"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">Data sensitivity rationale</p>
                <p className="mt-2">{snapshot.outcome.riskRationale.dataSensitivity ?? "Not captured"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">Blast radius</p>
                <p className="mt-2">{snapshot.outcome.riskRationale.blastRadius ?? "Not captured"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">Decision impact</p>
                <p className="mt-2">{snapshot.outcome.riskRationale.decisionImpact ?? "Not captured"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Epics and Story Ideas</p>
            <div className="mt-4 space-y-5">
              {snapshot.epics.length > 0 ? snapshot.epics.map((epic) => {
                const epicStoryIdeas = storyIdeasByEpic.get(epic.key) ?? [];

                return (
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={epic.key}>
                    <p className="font-semibold text-slate-950">{epic.key} {epic.title}</p>
                    <p className="mt-2 text-sm text-slate-700"><span className="font-medium">Purpose:</span> {epic.purpose ?? "Not captured"}</p>
                    <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Scope boundary:</span> {epic.scopeBoundary ?? "Not captured"}</p>

                    <div className="mt-4 rounded-2xl border border-border/70 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Story Ideas</p>
                      {epicStoryIdeas.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {epicStoryIdeas.map((storyIdea) => (
                            <div className="rounded-2xl border border-border/70 bg-background p-4" key={`${storyIdea.sourceType}:${storyIdea.key}`}>
                              <p className="font-semibold text-slate-950">{storyIdea.key} {storyIdea.title}</p>
                              <p className="mt-2 text-sm text-slate-700"><span className="font-medium">Value intent:</span> {storyIdea.valueIntent ?? "Not captured"}</p>
                              <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Expected behavior:</span> {storyIdea.expectedBehavior ?? "Not captured"}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">No Story Ideas were linked to this Epic.</p>
                      )}
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-slate-600">No Epics were captured.</p>}

              {unassignedStoryIdeas.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Unassigned Story Ideas</p>
                  <div className="mt-3 space-y-3">
                    {unassignedStoryIdeas.map((storyIdea) => (
                      <div className="rounded-2xl border border-amber-200 bg-white/90 p-4" key={`${storyIdea.sourceType}:${storyIdea.key}`}>
                        <p className="font-semibold text-slate-950">{storyIdea.key} {storyIdea.title}</p>
                        <p className="mt-2 text-sm text-slate-700"><span className="font-medium">Value intent:</span> {storyIdea.valueIntent ?? "Not captured"}</p>
                        <p className="mt-1 text-sm text-slate-700"><span className="font-medium">Expected behavior:</span> {storyIdea.expectedBehavior ?? "Not captured"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approval trail</p>
            <div className="mt-4 space-y-4">
              {snapshot.signoffs.map((record) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800" key={record.id}>
                  <p className="font-semibold text-slate-950">
                    {formatLabel(record.decisionKind)} by {record.actualPersonName}
                  </p>
                  <p className="mt-1">
                    {formatLabel(record.requiredRoleType)} / {record.organizationSide} / {formatLabel(record.decisionStatus)}
                  </p>
                  <p className="mt-1">Recorded at {formatDate(record.createdAt)}</p>
                  {record.note ? <p className="mt-2">Note: {record.note}</p> : null}
                  {record.evidenceReference ? <p className="mt-1">Evidence: {record.evidenceReference}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </section>
  );
}
