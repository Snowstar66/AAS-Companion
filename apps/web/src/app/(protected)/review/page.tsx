import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, CircleAlert, CircleCheckBig, Clock3, FileSearch, GitBranch, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ContextHelp } from "@/components/shared/context-help";
import { getHelpPattern } from "@/lib/help/aas-help";
import { loadArtifactReviewQueue } from "@/lib/intake/review-queue";
import { loadOperationalReviewDashboard } from "@/lib/review/operational-review";
import { submitArtifactBulkReviewAction, submitArtifactCandidateReviewAction } from "./actions";

type ReviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ReviewQueue = Awaited<ReturnType<typeof loadArtifactReviewQueue>>;
type ReviewCandidate = ReviewQueue["items"][number];
type SelectedReviewCandidate = NonNullable<ReviewQueue["selectedCandidate"]>;
type ReviewFinding = NonNullable<SelectedReviewCandidate["complianceResult"]>["findings"][number];
type ReviewBacklogState = "needs_action" | "needs_confirmation" | "pending" | "approved" | "discarded";
type OperationalReviewDashboard = Awaited<ReturnType<typeof loadOperationalReviewDashboard>>;
type OperationalReviewItem = OperationalReviewDashboard["items"][number];

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getImportIntentLabel(importIntent: "framing" | "design" | string) {
  return importIntent === "design" ? "Design import" : "Framing import";
}

function getImportTargetLabel(importIntent: "framing" | "design" | string) {
  return importIntent === "design" ? "Delivery Stories in Design" : "Story Ideas in Framing";
}

function getCandidateObjectLabel(candidate: {
  type: ReviewCandidate["type"];
  intakeSession: {
    importIntent?: "framing" | "design" | string | null;
  };
}) {
  if (candidate.type !== "story") {
    return formatLabel(candidate.type);
  }

  return candidate.intakeSession?.importIntent === "design" ? "Delivery Story" : "Story Idea";
}

function getPromotedEntityLabel(
  candidateType: string,
  promotedEntityType: string | null | undefined,
  importIntent: "framing" | "design" | string
) {
  if (candidateType === "story" || promotedEntityType === "story") {
    return importIntent === "design" ? "Delivery Story" : "Story Idea";
  }

  return promotedEntityType ? formatLabel(promotedEntityType) : "record";
}

function getFindingClasses(category: "missing" | "uncertain" | "human_only" | "blocked") {
  if (category === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  if (category === "human_only") {
    return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900";
  }

  if (category === "uncertain") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-sky-200 bg-sky-50 text-sky-900";
}

function getBacklogState(candidate: Pick<ReviewCandidate, "reviewStatus" | "importedReadinessState" | "issueProgress">) {
  if (candidate.reviewStatus === "rejected" || candidate.importedReadinessState === "discarded") {
    return "discarded" as const;
  }

  if (candidate.reviewStatus === "promoted") {
    return "approved" as const;
  }

  if (
    candidate.reviewStatus === "follow_up_needed" ||
    candidate.issueProgress.categories.missing > 0 ||
    candidate.issueProgress.categories.blocked > 0
  ) {
    return "needs_action" as const;
  }

  if (
    candidate.issueProgress.categories.uncertain > 0 ||
    candidate.issueProgress.categories.humanOnly > 0 ||
    candidate.issueProgress.categories.unmapped > 0
  ) {
    return "needs_confirmation" as const;
  }

  return "pending" as const;
}

function getBacklogLabel(state: ReviewBacklogState) {
  if (state === "needs_action") {
    return "Needs action";
  }

  if (state === "needs_confirmation") {
    return "Needs confirmation";
  }

  if (state === "pending") {
    return "Pending";
  }

  if (state === "approved") {
    return "Approved";
  }

  return "Discarded";
}

function getBacklogDescription(state: ReviewBacklogState) {
  if (state === "needs_action") {
    return "Items with missing fields, blocked issues or open follow-up work.";
  }

  if (state === "needs_confirmation") {
    return "Items waiting on human confirmation or interpretation decisions.";
  }

  if (state === "pending") {
    return "Items that are cleaned up and waiting for the final approval step.";
  }

  if (state === "approved") {
    return "Items that were approved and promoted into project records.";
  }

  return "Items intentionally removed from the active review flow.";
}

function getBacklogBadgeClasses(state: ReviewBacklogState) {
  if (state === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (state === "discarded") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (state === "pending") {
    return "border-slate-200 bg-slate-50 text-slate-800";
  }

  if (state === "needs_confirmation") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-sky-200 bg-sky-50 text-sky-800";
}

function getDispositionLabel(action: string | undefined) {
  if (action === "corrected") {
    return "Fixed";
  }

  if (action === "confirmed") {
    return "Confirmed";
  }

  if (action === "not_relevant") {
    return "Not relevant";
  }

  if (action === "blocked") {
    return "Blocked";
  }

  if (action === "pending") {
    return "Pending";
  }

  return null;
}

function getDispositionClasses(action: string | undefined) {
  if (action === "corrected" || action === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (action === "not_relevant") {
    return "border-slate-200 bg-slate-50 text-slate-800";
  }

  if (action === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-border/70 bg-background text-muted-foreground";
}

function getActionVerb(category: "missing" | "uncertain" | "human_only" | "blocked") {
  if (category === "missing") {
    return "Fix";
  }

  if (category === "uncertain") {
    return "Confirm or correct";
  }

  if (category === "human_only") {
    return "Confirm";
  }

  return "Resolve";
}

function buildReviewHref(input: {
  candidateId?: string | undefined;
  reviewStatusFilter?: string | undefined;
  findingFilter?: string | undefined;
  importIntent?: string | undefined;
}) {
  const params = new URLSearchParams();

  if (input.candidateId) {
    params.set("candidateId", input.candidateId);
  }

  if (input.reviewStatusFilter && input.reviewStatusFilter !== "all") {
    params.set("reviewStatusFilter", input.reviewStatusFilter);
  }

  if (input.findingFilter && input.findingFilter !== "all") {
    params.set("findingFilter", input.findingFilter);
  }

  if (input.importIntent && input.importIntent !== "all") {
    params.set("importIntent", input.importIntent);
  }

  const query = params.toString();
  return query ? `/review?${query}` : "/review";
}

function getCandidatePreviewRows(candidate: ReviewCandidate) {
  const rows: Array<{ label: string; value: string }> = [];

  if (candidate.draftRecord?.key) {
    rows.push({ label: "Key", value: candidate.draftRecord.key });
  }

  rows.push({ label: "Title", value: candidate.draftRecord?.title ?? candidate.title });

  if (candidate.type === "outcome") {
    if (candidate.draftRecord?.outcomeStatement) {
      rows.push({ label: "Outcome statement", value: candidate.draftRecord.outcomeStatement });
    }
    if (candidate.draftRecord?.baselineDefinition) {
      rows.push({ label: "Baseline definition", value: candidate.draftRecord.baselineDefinition });
    }
  }

  if (candidate.type === "epic") {
    if (candidate.draftRecord?.purpose) {
      rows.push({ label: "Purpose", value: candidate.draftRecord.purpose });
    }
    if (candidate.draftRecord?.scopeBoundary) {
      rows.push({ label: "Scope boundary", value: candidate.draftRecord.scopeBoundary });
    }
  }

  if (candidate.type === "story") {
    const acceptanceCriteria = candidate.draftRecord?.acceptanceCriteria ?? [];

    if (candidate.draftRecord?.storyType) {
      rows.push({ label: "Story type", value: formatLabel(candidate.draftRecord.storyType) });
    }
    if (candidate.draftRecord?.valueIntent) {
      rows.push({ label: "Value intent", value: candidate.draftRecord.valueIntent });
    }
    if (candidate.draftRecord?.expectedBehavior) {
      rows.push({ label: "Expected behavior", value: candidate.draftRecord.expectedBehavior });
    }
    if (acceptanceCriteria.length > 0) {
      rows.push({ label: "Acceptance criteria", value: acceptanceCriteria.join(" | ") });
    }
  }

  if (candidate.humanDecisions?.aiAccelerationLevel) {
    rows.push({ label: "AI level", value: formatLabel(candidate.humanDecisions.aiAccelerationLevel) });
  }

  if (candidate.humanDecisions?.riskProfile) {
    rows.push({ label: "Risk profile", value: candidate.humanDecisions.riskProfile });
  }

  if (candidate.humanDecisions?.riskAcceptanceStatus) {
    rows.push({ label: "Risk acceptance", value: formatLabel(candidate.humanDecisions.riskAcceptanceStatus) });
  }

  return rows.slice(0, 8);
}

function CollapsibleSection(props: {
  title: string;
  description: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-background" open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{props.title}</p>
            {props.badge ? (
              <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {props.badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-4 py-4">{props.children}</div>
    </details>
  );
}

function FindingDispositionAction(props: {
  candidate: ReviewCandidate;
  issueId: string;
  issueAction: "confirmed" | "not_relevant";
  label: string;
}) {
  return (
    <form action={submitArtifactCandidateReviewAction}>
      <input name="candidateId" type="hidden" value={props.candidate.id} />
      <input name="candidateType" type="hidden" value={props.candidate.type} />
      <input name="intent" type="hidden" value="edit" />
      <input name="issueId" type="hidden" value={props.issueId} />
      <input name="issueAction" type="hidden" value={props.issueAction} />
      <Button size="sm" type="submit" variant="secondary">
        {props.label}
      </Button>
    </form>
  );
}

function getOperationalBadgeClasses(status: OperationalReviewItem["status"]) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "ready") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

function getOperationalStatusLabel(status: OperationalReviewItem["status"]) {
  if (status === "approved") {
    return "Ready to start build";
  }

  if (status === "ready") {
    return "Needs human review";
  }

  return "Blocked";
}

function getOperationalSectionLabel(workflow: OperationalReviewItem["workflow"]) {
  if (workflow === "outcome_tollgate") {
    return "Framing brief";
  }

  return "Delivery Story";
}

function ReviewSummaryCard(props: {
  label: string;
  count: number | string;
  description: string;
  className: string;
  actionHref?: string | undefined;
  actionLabel?: string | undefined;
}) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${props.className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{props.label}</p>
      <p className="mt-2 text-2xl font-semibold">{props.count}</p>
      <p className="mt-2 text-sm leading-6 opacity-90">{props.description}</p>
      {props.actionHref && props.actionLabel ? (
        <Button asChild className="mt-4 gap-2" size="sm" variant="secondary">
          <Link href={props.actionHref}>
            {props.actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const query = searchParams ? await searchParams : {};
  const candidateId = getParamValue(query.candidateId);
  const [queue, operationalReview] = await Promise.all([loadArtifactReviewQueue(candidateId), loadOperationalReviewDashboard()]);
  const message = getParamValue(query.message);
  const status = getParamValue(query.status);
  const reviewStatusFilter = getParamValue(query.reviewStatusFilter) ?? "all";
  const findingFilter = getParamValue(query.findingFilter) ?? "all";
  const importIntentFilter = getParamValue(query.importIntent) ?? "all";
  const reviewHelp = getHelpPattern("review.workspace", null);

  const backlogSummary = queue.items.reduce(
    (summary, candidate) => {
      const state = getBacklogState(candidate);
      summary[state] += 1;
      return summary;
    },
    {
      needs_action: 0,
      needs_confirmation: 0,
      pending: 0,
      approved: 0,
      discarded: 0
    }
  );

  const completedCount = backlogSummary.approved + backlogSummary.discarded;
  const remainingCount = Math.max(queue.summary.total - completedCount, 0);
  const completionPercent = queue.summary.total > 0 ? Math.round((completedCount / queue.summary.total) * 100) : 0;
  const visibleItems = queue.items.filter((candidate) => {
    if (importIntentFilter !== "all" && (candidate.intakeSession?.importIntent ?? "framing") !== importIntentFilter) {
      return false;
    }

    if (reviewStatusFilter === "all") {
      return true;
    }

    return getBacklogState(candidate) === reviewStatusFilter;
  });

  const selectedCandidate = queue.selectedCandidate;
  const selectedCandidateState = selectedCandidate ? getBacklogState(selectedCandidate) : null;
  const visibleFindings =
    selectedCandidate?.complianceResult?.findings.filter((finding: ReviewFinding) => {
      if (findingFilter === "all") {
        return true;
      }

      return finding.category === findingFilter;
    }) ?? [];

  const groupOrder: ReviewBacklogState[] = [
    "needs_action",
    "needs_confirmation",
    "pending",
    "approved",
    "discarded"
  ];

  const importIntentGroups = (["framing", "design"] as const)
    .map((importIntent) => {
      const items = visibleItems.filter((candidate) => (candidate.intakeSession?.importIntent ?? "framing") === importIntent);

      return {
        importIntent,
        label: getImportIntentLabel(importIntent),
        items,
        groups: groupOrder.map((state) => ({
          state,
          items: items.filter((candidate) => getBacklogState(candidate) === state)
        }))
      };
    })
    .filter((group) => group.items.length > 0);
  const operationalGroups: Array<{
    title: string;
    description: string;
    items: OperationalReviewItem[];
    defaultOpen: boolean;
  }> = [
    {
      title: "Framing approvals",
      description: "Framing briefs waiting on Tollgate 1 approvals. Story Ideas stay in Framing and Import, not in Delivery review.",
      items: operationalReview.items.filter((item) => item.workflow === "outcome_tollgate"),
      defaultOpen: false
    },
    {
      title: "Delivery review",
      description: "Individual Delivery Stories no longer use human approval lanes here. This stays empty until a future design-wide checkpoint is introduced.",
      items: operationalReview.items.filter((item) => item.workflow === "story_review" || item.workflow === "delivery_start"),
      defaultOpen: false
    }
  ];
  const framingReviewItems = operationalReview.items.filter((item) => item.workflow === "outcome_tollgate");
  const deliveryReviewItems = operationalReview.items.filter(
    (item) => item.workflow === "story_review" || item.workflow === "delivery_start"
  );
  const projectName =
    operationalReview.organizationName && operationalReview.organizationName !== "Unknown project"
      ? operationalReview.organizationName
      : queue.organizationName;
  const firstBlockedOperational = operationalReview.items.find((item) => item.status === "blocked") ?? null;
  const firstInProgressOperational = operationalReview.items.find((item) => item.status === "ready") ?? null;
  const firstReadyToStart = operationalReview.items.find((item) => item.workflow === "delivery_start") ?? null;
  const firstImportedCandidate =
    queue.items.find((candidate) => {
      const state = getBacklogState(candidate);
      return state === "needs_action" || state === "needs_confirmation" || state === "pending";
    }) ?? null;

  return (
    <AppShell
      topbarProps={{
        projectName,
        sectionLabel: "Human Review",
        badge: "Project section"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <FileSearch className="h-3.5 w-3.5 text-primary" />
            Human review command center
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Human Review dashboard</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Use this page whenever you want one answer to the question: what still needs a human decision right now?
            Framing and Value Spine hold the working context, while Human Review separates framing decisions from
            delivery checkpoints so you do not have to guess what kind of review you are looking at.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">Human Review</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start here when you want to know what a human must review, clarify or hand off next.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">Framing review</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Story Ideas stay in Framing, while Tollgate 1 approvals for the Framing brief are coordinated here. This is about intent and direction, not delivery execution.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">Delivery review</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Individual Delivery Stories do not use approval lanes here anymore. Use the Story pages for design completeness and Value Spine checks instead.
              </p>
            </div>
          </div>
          <div className="mt-5 max-w-4xl">
            <ContextHelp pattern={reviewHelp} summaryLabel="Open human review help" />
          </div>
        </div>

        {message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status === "error" || status === "blocked"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReviewSummaryCard
            actionHref={firstBlockedOperational?.href ?? firstInProgressOperational?.href ?? firstReadyToStart?.href}
            actionLabel={
              firstBlockedOperational
                ? "Open first blocked review"
                : firstInProgressOperational
                  ? "Open next review"
                  : firstReadyToStart
                    ? "Open ready Delivery Story"
                    : undefined
            }
            className="border-border/70 bg-background text-foreground"
            count={operationalReview.summary.total}
            description="All framing reviews and Delivery Story reviews that still need human attention."
            label="Needs human action now"
          />
          <ReviewSummaryCard
            actionHref={framingReviewItems[0]?.href}
            actionLabel={framingReviewItems[0] ? "Open framing review" : undefined}
            className="border-sky-200 bg-sky-50 text-sky-950"
            count={framingReviewItems.length}
            description="Outcome tollgates and framing decisions that still need a human reviewer."
            label="Framing approvals"
          />
          <ReviewSummaryCard
            actionHref={deliveryReviewItems[0]?.href}
            actionLabel={deliveryReviewItems[0] ? "Open delivery review" : undefined}
            className="border-indigo-200 bg-indigo-50 text-indigo-950"
            count={deliveryReviewItems.length}
            description="Reserved for a future design-wide checkpoint. Individual Delivery Stories are no longer approved here."
            label="Delivery review"
          />
          <ReviewSummaryCard
            actionHref={firstBlockedOperational?.href}
            actionLabel={firstBlockedOperational ? "Go to blocker" : undefined}
            className="border-rose-200 bg-rose-50 text-rose-950"
            count={operationalReview.summary.blocked}
            description="Human work cannot continue until these blockers are cleared in the linked workspace."
            label="Blocked reviews"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReviewSummaryCard
            actionHref={
              firstImportedCandidate
                ? buildReviewHref({
                    candidateId: firstImportedCandidate.id,
                    importIntent: firstImportedCandidate.intakeSession?.importIntent ?? "framing"
                  })
                : undefined
            }
            actionLabel={firstImportedCandidate ? "Open import approval" : undefined}
            className="border-border/70 bg-background text-foreground"
            count={queue.summary.total}
            description="Imported objects waiting to be approved into Framing or Design."
            label="Imported items to review"
          />
          <ReviewSummaryCard
            className="border-emerald-200 bg-emerald-50 text-emerald-950"
            count={completedCount}
            description="Imported candidates that already have a final human decision: approved into project records or discarded."
            label="Imported decisions done"
          />
          <ReviewSummaryCard
            actionHref={
              firstImportedCandidate
                ? buildReviewHref({
                    candidateId: firstImportedCandidate.id,
                    importIntent: firstImportedCandidate.intakeSession?.importIntent ?? "framing"
                  })
                : undefined
            }
            actionLabel={firstImportedCandidate ? "Resolve next import approval" : undefined}
            className="border-sky-200 bg-sky-50 text-sky-950"
            count={remainingCount}
            description="Imported objects that still need a human to fix, approve or reject."
            label="Imported decisions left"
          />
          <ReviewSummaryCard
            className="border-border/70 bg-background text-foreground"
            count={`${completionPercent}%`}
            description="How much of the imported review queue already has a final human disposition."
            label="Imported queue completed"
          />
        </div>

        <Card className="border-border/70 shadow-sm" id="operational-review">
          <CardHeader>
            <CardTitle>Human review lanes</CardTitle>
            <CardDescription>
              This page is split into Framing approvals and Delivery review. Story Ideas stay in Framing or Import. Individual Delivery Stories no longer require human approval lanes here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operationalReview.state === "unavailable" ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                {operationalReview.message}
              </div>
            ) : operationalReview.items.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                No Framing approvals are currently waiting for human action.
              </div>
            ) : (
              operationalGroups.map((group) => (
                <CollapsibleSection
                  badge={`${group.items.length}`}
                  defaultOpen={group.defaultOpen}
                  description={group.description}
                  key={group.title}
                  title={group.title}
                >
                  {group.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items are currently in this group.</p>
                  ) : (
                    <div className="grid gap-3">
                      {group.items.map((item) => (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item.id}>
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">{item.title}</p>
                                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                  {item.key}
                                </span>
                                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                  {getOperationalSectionLabel(item.workflow)}
                                </span>
                                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getOperationalBadgeClasses(item.status)}`}>
                                  {getOperationalStatusLabel(item.status)}
                                </span>
                              </div>
                              <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span>Context: {item.context}</span>
                                <span>Open lanes: {item.pendingLaneCount}</span>
                                {item.blocker ? <span>Primary blocker: {item.blocker}</span> : null}
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-2 sm:flex-row">
                              <Button asChild size="sm" variant="secondary">
                                <Link href={item.href}>
                                  {item.actionLabel}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleSection>
              ))
            )}
          </CardContent>
        </Card>

        {queue.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Imported review backlog is unavailable</CardTitle>
              <CardDescription>{queue.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>Imported review backlog</CardTitle>
                    <CardDescription>
                      Review imported objects here, then approve them into Framing or Design. If the import target was Framing, imported stories become Story Ideas.
                    </CardDescription>
                  </div>
                  {reviewStatusFilter !== "all" || importIntentFilter !== "all" ? (
                    <Button asChild className="gap-2" variant="secondary">
                      <Link href={buildReviewHref({ candidateId })}>
                        Clear filter
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {importIntentGroups.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    No imported candidates match the current review filter.
                  </div>
                ) : (
                  importIntentGroups.map((intentGroup) => (
                    <form action={submitArtifactBulkReviewAction} className="space-y-4" key={intentGroup.importIntent}>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">{intentGroup.label}</p>
                                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                  {intentGroup.items.length} {intentGroup.importIntent === "design" ? "Delivery" : "Story Idea"} candidate(s)
                                </span>
                              </div>
                              <p className="text-sm leading-6 text-muted-foreground">
                                {intentGroup.importIntent === "design"
                                  ? "Approve checked rows to create Delivery Stories in Design. Outcome and Epic records are linked or created as needed."
                                  : "Approve checked rows to create Framing records. Imported stories become Story Ideas, while Outcome and Epic records are linked or created as needed."}
                              </p>
                            </div>
                          <div className="flex flex-col gap-3 lg:min-w-[320px]">
                            <textarea
                              className="min-h-20 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                              name="bulkReviewComment"
                              placeholder="Optional decision note for all checked candidates"
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button className="gap-2" name="bulkIntent" type="submit" value="approve">
                                <ShieldCheck className="h-4 w-4" />
                                {intentGroup.importIntent === "design" ? "Approve selected as Delivery Stories" : "Approve selected as Story Ideas"}
                              </Button>
                              <Button className="gap-2" name="bulkIntent" type="submit" value="reject" variant="secondary">
                                <CircleAlert className="h-4 w-4" />
                                Reject selected
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {intentGroup.groups.map((group) => (
                        <CollapsibleSection
                          badge={`${group.items.length}`}
                          defaultOpen={false}
                          description={getBacklogDescription(group.state)}
                          key={`${intentGroup.importIntent}-${group.state}`}
                          title={getBacklogLabel(group.state)}
                        >
                          {group.items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No review items are currently in this group.</p>
                          ) : (
                            <div className="grid gap-3">
                              {group.items.map((candidate) => {
                                const candidateState = getBacklogState(candidate);
                                const isSelected = selectedCandidate?.id === candidate.id;
                                const isFinal = candidate.reviewStatus === "promoted" || candidate.reviewStatus === "rejected";

                                return (
                                  <div
                                    className={`rounded-2xl border p-4 transition ${
                                      isSelected ? "border-primary/40 bg-primary/5" : "border-border/70 bg-muted/20"
                                    }`}
                                    key={candidate.id}
                                  >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                      <div className="flex gap-3">
                                        <input
                                          className="mt-1 h-4 w-4 rounded border-border text-primary"
                                          defaultChecked={false}
                                          disabled={isFinal}
                                          name="candidateIds"
                                          type="checkbox"
                                          value={candidate.id}
                                        />
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-foreground">{candidate.title}</p>
                                            <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                              {getCandidateObjectLabel(candidate)}
                                            </span>
                                            <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                              {getImportIntentLabel(candidate.intakeSession?.importIntent ?? "framing")}
                                            </span>
                                            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900">
                                              {getImportTargetLabel(candidate.intakeSession?.importIntent ?? "framing")}
                                            </span>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getBacklogBadgeClasses(candidateState)}`}>
                                              {getBacklogLabel(candidateState)}
                                            </span>
                                          </div>
                                          <p className="text-sm leading-6 text-muted-foreground">{candidate.summary}</p>
                                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span>File: {candidate.file.fileName}</span>
                                            <span>Source: {candidate.sourceSectionMarker}</span>
                                            <span>
                                              Queue: {candidate.issueProgress.unresolved} open / {candidate.issueProgress.total} total
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-start gap-2 sm:flex-row">
                                        <Button asChild size="sm" variant={isSelected ? "default" : "secondary"}>
                                          <Link
                                            href={buildReviewHref({
                                              candidateId: candidate.id,
                                              reviewStatusFilter,
                                              findingFilter: "all",
                                              importIntent: importIntentFilter
                                            })}
                                          >
                                            {candidate.intakeSession?.importIntent === "design"
                                              ? "Open Delivery Story approval"
                                              : "Open Story Idea approval"}
                                          </Link>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </CollapsibleSection>
                      ))}
                    </form>
                  ))
                )}
              </CardContent>
            </Card>

            {!selectedCandidate ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Choose one item to start</CardTitle>
                  <CardDescription>
                    Select one imported candidate from the backlog to open its focused correction workspace.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-6 2xl:grid-cols-[minmax(340px,0.88fr)_minmax(0,1.12fr)]">
                <div className="space-y-6">
                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <CardTitle className="flex flex-wrap items-center gap-3">
                            <span>{selectedCandidate.title}</span>
                            <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {getCandidateObjectLabel(selectedCandidate)}
                            </span>
                            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {getImportIntentLabel(selectedCandidate.intakeSession?.importIntent ?? "framing")}
                            </span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBacklogBadgeClasses(selectedCandidateState ?? "needs_action")}`}>
                              {getBacklogLabel(selectedCandidateState ?? "needs_action")}
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Focus one imported item at a time. Review the source, inspect the parsed candidate, clear the correction queue, then approve or discard.
                          </CardDescription>
                        </div>
                        <Button asChild className="gap-2" variant="secondary">
                          <Link href={buildReviewHref({ reviewStatusFilter, findingFilter })}>
                            Back to backlog
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Issue progress</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {selectedCandidate.issueProgress.resolved} resolved / {selectedCandidate.issueProgress.unresolved} open
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Import context</p>
                        <p className="mt-2 text-sm leading-6 text-foreground">{selectedCandidate.intakeSession.label}</p>
                        <p className="text-sm leading-6 text-muted-foreground">{selectedCandidate.file.fileName}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Parsed candidate</CardTitle>
                      <CardDescription>
                        This is the current interpreted candidate record before it is approved into governed project data.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {getCandidatePreviewRows(selectedCandidate).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No interpreted fields are populated yet for this candidate.</p>
                      ) : (
                        getCandidatePreviewRows(selectedCandidate).map((row) => (
                          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={row.label}>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{row.label}</p>
                            <p className="mt-2 text-sm leading-6 text-foreground">{row.value}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Full source</CardTitle>
                      <CardDescription>Keep the original artifact visible while you review and correct the imported interpretation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Section:</strong> {selectedCandidate.sourceSectionMarker}
                        </p>
                        <p className="mt-2">
                          <strong className="text-foreground">Current summary:</strong> {selectedCandidate.summary}
                        </p>
                      </div>
                      <pre className="max-h-[520px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-xs leading-6 text-slate-100 2xl:max-h-[640px]">
                        {selectedCandidate.file.content}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <CardTitle>Correction queue</CardTitle>
                          <CardDescription>
                            Work through the open findings in order. Fix in the workspace, confirm interpretations, or mark irrelevant noise.
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant={findingFilter === "all" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "all" })}>
                              All
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant={findingFilter === "missing" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "missing" })}>
                              Missing
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant={findingFilter === "human_only" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "human_only" })}>
                              Human-only
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant={findingFilter === "blocked" ? "default" : "secondary"}>
                            <Link href={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "blocked" })}>
                              Blocked
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {visibleFindings.length === 0 ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                          No open findings match the current filter for this candidate.
                        </div>
                      ) : (
                        visibleFindings.map((finding: ReviewFinding) => {
                          const disposition = selectedCandidate.issueDispositions[finding.code];
                          const dispositionLabel = getDispositionLabel(disposition?.action);

                          return (
                            <div
                              className={`rounded-2xl border px-4 py-4 text-sm ${getFindingClasses(finding.category)}`}
                              key={`${selectedCandidate.id}-${finding.code}`}
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-current">
                                      {getActionVerb(finding.category)} {finding.fieldLabel ? finding.fieldLabel.toLowerCase() : "this issue"}
                                    </p>
                                    <span className="rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium">
                                      {formatLabel(finding.category)}
                                    </span>
                                    {dispositionLabel ? (
                                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getDispositionClasses(disposition?.action)}`}>
                                        {dispositionLabel}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-2 leading-6">{finding.message}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button asChild size="sm" variant="secondary">
                                    <Link href="#candidate-editor">Fix in workspace</Link>
                                  </Button>
                                  {finding.category === "uncertain" || finding.category === "human_only" ? (
                                    <FindingDispositionAction candidate={selectedCandidate} issueAction="confirmed" issueId={finding.code} label="Confirm" />
                                  ) : null}
                                  <FindingDispositionAction candidate={selectedCandidate} issueAction="not_relevant" issueId={finding.code} label="Mark not relevant" />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>

                  <form action={submitArtifactCandidateReviewAction} className="space-y-4" id="candidate-editor">
                    <input name="candidateId" type="hidden" value={selectedCandidate.id} />
                    <input name="candidateType" type="hidden" value={selectedCandidate.type} />
                    <input name="importIntent" type="hidden" value={selectedCandidate.intakeSession?.importIntent ?? "framing"} />

                    <Card className="border-border/70 shadow-sm">
                      <CardHeader>
                        <CardTitle>Focused correction workspace</CardTitle>
                        <CardDescription>
                          Update the parsed candidate, resolve human-only decisions, then send it onward with a clear disposition.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Key</span>
                            <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.key ?? ""} name="key" type="text" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Title</span>
                            <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.title ?? selectedCandidate.title} name="title" type="text" />
                          </label>
                        </div>

                        <CollapsibleSection badge={selectedCandidate.type} defaultOpen={false} description="Type-specific fields for the current candidate." title="Candidate fields">
                          <div className="grid gap-4">
                            {selectedCandidate.type === "outcome" ? (
                              <>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Outcome statement</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.outcomeStatement ?? ""} name="outcomeStatement" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Baseline definition</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.baselineDefinition ?? ""} name="baselineDefinition" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Baseline source</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.baselineSource ?? ""} name="baselineSource" />
                                </label>
                              </>
                            ) : null}

                            {selectedCandidate.type === "epic" ? (
                              <>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Purpose</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.purpose ?? ""} name="purpose" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Scope boundary</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.scopeBoundary ?? ""} name="scopeBoundary" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Risk note</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.riskNote ?? ""} name="riskNote" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Linked Outcome candidate ID</span>
                                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.outcomeCandidateId ?? ""} name="outcomeCandidateId" type="text" />
                                </label>
                              </>
                            ) : null}

                            {selectedCandidate.type === "story" ? (
                              <>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Story type</span>
                                  <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.storyType ?? "outcome_delivery"} name="storyType">
                                    <option value="outcome_delivery">Outcome delivery</option>
                                    <option value="governance">Governance</option>
                                    <option value="enablement">Enablement</option>
                                  </select>
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Value intent</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.valueIntent ?? ""} name="valueIntent" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Expected behavior</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.expectedBehavior ?? ""} name="expectedBehavior" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={(selectedCandidate.draftRecord?.acceptanceCriteria ?? []).join("\n")} name="acceptanceCriteria" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">AI usage scope</span>
                                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={(selectedCandidate.draftRecord?.aiUsageScope ?? []).join(", ")} name="aiUsageScope" type="text" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Test Definition</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.testDefinition ?? ""} name="testDefinition" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Definition of Done</span>
                                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={(selectedCandidate.draftRecord?.definitionOfDone ?? []).join("\n")} name="definitionOfDone" />
                                </label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Linked Outcome candidate ID</span>
                                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.outcomeCandidateId ?? ""} name="outcomeCandidateId" type="text" />
                                  </label>
                                  <label className="space-y-2">
                                    <span className="text-sm font-medium text-foreground">Linked Epic candidate ID</span>
                                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.epicCandidateId ?? ""} name="epicCandidateId" type="text" />
                                  </label>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection badge={`${selectedCandidate.issueProgress.categories.humanOnly} human-only`} defaultOpen={false} description="Resolve the decisions that explicitly require a human reviewer." title="Human-only decisions">
                          <div className="grid gap-4">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Value Owner</span>
                              <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.valueOwnerId ?? ""} name="valueOwnerId" type="text" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Baseline validity</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.baselineValidity ?? ""} name="baselineValidity">
                                <option value="">Unresolved</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="needs_follow_up">Needs follow-up</option>
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">AI level</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.aiAccelerationLevel ?? ""} name="aiAccelerationLevel">
                                <option value="">Unresolved</option>
                                <option value="level_1">Level 1</option>
                                <option value="level_2">Level 2</option>
                                <option value="level_3">Level 3</option>
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Risk profile</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.riskProfile ?? ""} name="riskProfile">
                                <option value="">Unresolved</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Risk acceptance status</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.humanDecisions?.riskAcceptanceStatus ?? ""} name="riskAcceptanceStatus">
                                <option value="">Unresolved</option>
                                <option value="accepted">Accepted</option>
                                <option value="needs_review">Needs review</option>
                              </select>
                            </label>
                          </div>
                        </CollapsibleSection>

                        <CollapsibleSection defaultOpen={false} description="Leave a short note and choose how this item should move through the backlog." title="Disposition">
                          <div className="space-y-4">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Review comment</span>
                              <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.reviewComment ?? ""} name="reviewComment" />
                            </label>

                            <div className="grid gap-3">
                              <Button className="gap-2" name="intent" type="submit" value="edit">
                                <GitBranch className="h-4 w-4" />
                                Fix and save
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="confirm" variant="secondary">
                                <CircleCheckBig className="h-4 w-4" />
                                Confirm interpretation
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="follow_up" variant="secondary">
                                <Clock3 className="h-4 w-4" />
                                Return to pending
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="reject" variant="secondary">
                                <CircleAlert className="h-4 w-4" />
                                Reject import
                              </Button>
                              <Button className="gap-2" name="intent" type="submit" value="promote" variant="secondary">
                                <ShieldCheck className="h-4 w-4" />
                                {selectedCandidate.intakeSession?.importIntent === "design"
                                  ? "Approve as Delivery Story"
                                  : "Approve as Story Idea"}
                              </Button>
                            </div>
                          </div>
                        </CollapsibleSection>

                        {selectedCandidate.promotedEntityId ? (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                            Approved and promoted into project{" "}
                            {getPromotedEntityLabel(
                              selectedCandidate.type,
                              selectedCandidate.promotedEntityType,
                              selectedCandidate.intakeSession?.importIntent ?? "framing"
                            )}{" "}
                            with ID {selectedCandidate.promotedEntityId}.
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}
