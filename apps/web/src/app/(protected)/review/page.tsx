import Link from "next/link";
import { CircleAlert, CircleCheckBig, FileSearch, GitBranch, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
import { ContextHelp } from "@/components/shared/context-help";
import { getHelpPattern } from "@/lib/help/aas-help";
import { loadArtifactReviewQueue } from "@/lib/intake/review-queue";
import { submitArtifactCandidateReviewAction } from "./actions";

type ReviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getFindingClasses(category: "missing" | "uncertain" | "human_only" | "blocked") {
  if (category === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (category === "human_only") {
    return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800";
  }

  if (category === "uncertain") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-sky-200 bg-sky-50 text-sky-800";
}

function getReviewStatusClasses(status: string) {
  if (status === "promoted") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (status === "follow_up_needed") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "confirmed" || status === "edited") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-border/70 bg-muted text-muted-foreground";
}

function getActionVerb(category: "missing" | "uncertain" | "human_only" | "blocked") {
  if (category === "missing") {
    return "Complete";
  }

  if (category === "uncertain") {
    return "Confirm or correct";
  }

  if (category === "human_only") {
    return "Confirm";
  }

  return "Resolve dependency";
}

function buildReviewHref(input: {
  candidateId?: string | undefined;
  reviewStatusFilter?: string | undefined;
  findingFilter?: string | undefined;
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

  const query = params.toString();
  return query ? `/review?${query}` : "/review";
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const query = searchParams ? await searchParams : {};
  const queue = await loadArtifactReviewQueue();
  const message = getParamValue(query.message);
  const status = getParamValue(query.status);
  const candidateId = getParamValue(query.candidateId);
  const reviewStatusFilter = getParamValue(query.reviewStatusFilter) ?? "all";
  const findingFilter = getParamValue(query.findingFilter) ?? "all";
  const visibleItems = queue.items.filter((candidate) => {
    if (reviewStatusFilter === "all") {
      return true;
    }

    return candidate.reviewStatus === reviewStatusFilter;
  });
  const selectedCandidate = visibleItems.find((candidate) => candidate.id === candidateId) ?? visibleItems[0] ?? null;
  const totalFindings = selectedCandidate?.complianceResult?.findings.length ?? 0;
  const actionItems =
    selectedCandidate?.complianceResult?.findings.filter((finding) => {
      if (findingFilter === "all") {
        return true;
      }

      return finding.category === findingFilter;
    }) ?? [];
  const reviewHelp = getHelpPattern("review.workspace", selectedCandidate?.humanDecisions?.aiAccelerationLevel ?? null);

  return (
    <AppShell
      topbarProps={{
        projectName: queue.organizationName,
        sectionLabel: "Human Review",
        badge: "Project section"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <FileSearch className="h-3.5 w-3.5 text-primary" />
            Approval-readiness action list
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Human Review action list</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Review stays scoped to the current project and one imported candidate at a time. The page tells you what is
            still missing, uncertain, blocked, or waiting for explicit human confirmation before approval readiness.
          </p>
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <ActionSummaryCard actionHref={buildReviewHref({ reviewStatusFilter: "all" })} actionLabel="Open all candidates" className="border-border/70 shadow-sm" label="Total" value={queue.summary.total} />
          <ActionSummaryCard actionHref={queue.summary.pending > 0 ? buildReviewHref({ reviewStatusFilter: "pending" }) : undefined} actionLabel="Open pending candidates" className="border-border/70 shadow-sm" label="Pending" value={queue.summary.pending} />
          <ActionSummaryCard actionHref={queue.summary.followUpNeeded > 0 ? buildReviewHref({ reviewStatusFilter: "follow_up_needed" }) : undefined} actionLabel="Open follow-up list" className="border-border/70 shadow-sm" label="Follow-up" value={queue.summary.followUpNeeded} />
          <ActionSummaryCard actionHref={queue.summary.rejected > 0 ? buildReviewHref({ reviewStatusFilter: "rejected" }) : undefined} actionLabel="Open rejected candidates" className="border-border/70 shadow-sm" label="Rejected" value={queue.summary.rejected} />
          <ActionSummaryCard actionHref={queue.summary.promoted > 0 ? buildReviewHref({ reviewStatusFilter: "promoted" }) : undefined} actionLabel="Open promoted records" className="border-border/70 shadow-sm" label="Promoted" value={queue.summary.promoted} />
        </div>

        {queue.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Human Review is unavailable</CardTitle>
              <CardDescription>{queue.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : visibleItems.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No candidates match the current filter</CardTitle>
              <CardDescription>Try another review-status filter to continue work.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Current review context</CardTitle>
                <CardDescription>
                  Project: {queue.organizationName}. Pick one imported candidate to work through as an explicit action list.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="-mx-1 overflow-x-auto pb-1">
                  <div className="flex min-w-max gap-2 px-1">
                    {visibleItems.map((candidate) => (
                      <Button
                        asChild
                        key={candidate.id}
                        size="sm"
                        variant={selectedCandidate?.id === candidate.id ? "default" : "secondary"}
                      >
                        <Link href={buildReviewHref({ candidateId: candidate.id, reviewStatusFilter, findingFilter })}>
                          {candidate.type}: {candidate.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedCandidate ? (
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Imported artifact:</strong> {selectedCandidate.file.fileName}
                    </p>
                    <p className="mt-2">
                      <strong className="text-foreground">Source section:</strong> {selectedCandidate.sourceSectionMarker}
                    </p>
                    <p className="mt-2">
                      <strong className="text-foreground">Import session:</strong> {selectedCandidate.intakeSession.label}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {selectedCandidate ? (
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
                <div className="order-2 space-y-6 2xl:order-1">
                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <CardTitle className="flex flex-wrap items-center gap-3">
                            <span>{selectedCandidate.title}</span>
                            <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {selectedCandidate.type}
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-2">{selectedCandidate.summary}</CardDescription>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getReviewStatusClasses(selectedCandidate.reviewStatus)}`}
                          >
                            {formatLabel(selectedCandidate.reviewStatus)}
                          </span>
                          {selectedCandidate.importedReadinessState ? (
                            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                              {formatLabel(selectedCandidate.importedReadinessState)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <ActionSummaryCard actionHref={buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "all" })} actionLabel="Open all findings" className="border-border/70 bg-muted/20" label="Remaining" value={totalFindings} />
                      <ActionSummaryCard actionHref={(selectedCandidate.complianceResult?.summary.missing ?? 0) > 0 ? buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "missing" }) : undefined} actionLabel="Open missing fields" className="border-border/70 bg-muted/20" label="Missing" value={selectedCandidate.complianceResult?.summary.missing ?? 0} />
                      <ActionSummaryCard actionHref={(selectedCandidate.complianceResult?.summary.humanOnly ?? 0) > 0 ? buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "human_only" }) : undefined} actionLabel="Open human-only items" className="border-border/70 bg-muted/20" label="Human-only" value={selectedCandidate.complianceResult?.summary.humanOnly ?? 0} />
                      <ActionSummaryCard actionHref={(selectedCandidate.complianceResult?.summary.blocked ?? 0) > 0 ? buildReviewHref({ candidateId: selectedCandidate.id, reviewStatusFilter, findingFilter: "blocked" }) : undefined} actionLabel="Open blocked findings" className="border-border/70 bg-muted/20" label="Blocked" value={selectedCandidate.complianceResult?.summary.blocked ?? 0} />
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Approval-readiness action list</CardTitle>
                      <CardDescription>
                        Resolve these items one by one to move the current imported candidate toward approval readiness.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {actionItems.length === 0 ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                          No open review actions remain for this candidate.
                        </div>
                      ) : (
                        actionItems.map((finding) => (
                          <div
                            className={`rounded-2xl border px-4 py-4 text-sm ${getFindingClasses(finding.category)}`}
                            key={`${selectedCandidate.id}-${finding.code}`}
                          >
                            <p className="font-medium">
                              {getActionVerb(finding.category)} {finding.fieldLabel ? finding.fieldLabel.toLowerCase() : "this issue"}
                            </p>
                            <p className="mt-2 leading-6">{finding.message}</p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Original source artifact</CardTitle>
                      <CardDescription>
                        Source traceability stays visible while the interpretation is corrected and confirmed.
                      </CardDescription>
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

                <form action={submitArtifactCandidateReviewAction} className="order-1 space-y-4 2xl:order-2">
                  <input name="candidateId" type="hidden" value={selectedCandidate.id} />
                  <input name="candidateType" type="hidden" value={selectedCandidate.type} />

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle>Correct and confirm</CardTitle>
                      <CardDescription>
                        Update the interpretation, resolve human-only decisions, then explicitly confirm or promote.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Key</span>
                        <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.key ?? ""} name="key" type="text" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Title</span>
                        <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.draftRecord?.title ?? selectedCandidate.title} name="title" type="text" />
                      </label>

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

                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">Human-only decisions</p>
                        </div>
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
                      </div>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Review comment</span>
                        <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={selectedCandidate.reviewComment ?? ""} name="reviewComment" />
                      </label>

                      <div className="grid gap-3">
                        <Button className="gap-2" name="intent" type="submit" value="edit" variant="secondary">
                          <GitBranch className="h-4 w-4" />
                          Save corrections
                        </Button>
                        <Button className="gap-2" name="intent" type="submit" value="confirm">
                          <CircleCheckBig className="h-4 w-4" />
                          Confirm readiness
                        </Button>
                        <Button className="gap-2" name="intent" type="submit" value="follow_up" variant="secondary">
                          <CircleAlert className="h-4 w-4" />
                          Keep follow-up open
                        </Button>
                        <Button className="gap-2" name="intent" type="submit" value="reject" variant="secondary">
                          Discard or reject candidate
                        </Button>
                        <Button className="gap-2" name="intent" type="submit" value="promote">
                          Promote into project records
                        </Button>
                      </div>

                      {selectedCandidate.promotedEntityId ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                          Promoted into project {selectedCandidate.promotedEntityType} with ID {selectedCandidate.promotedEntityId}.
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </form>
              </div>
            ) : null}
          </>
        )}
      </section>
    </AppShell>
  );
}
