import { CircleAlert, CircleCheckBig, FileSearch, GitBranch, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { loadArtifactReviewQueue } from "@/lib/intake/review-queue";
import { submitArtifactCandidateReviewAction } from "./actions";

type ReviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const query = searchParams ? await searchParams : {};
  const queue = await loadArtifactReviewQueue();
  const message = getParamValue(query.message);
  const status = getParamValue(query.status);
  const candidateId = getParamValue(query.candidateId);

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Human Review Queue",
        badge: "Stories M2-004 / M2-005 / M2-006"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <FileSearch className="h-3.5 w-3.5 text-primary" />
            Imported candidate governance
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Human Review queue</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Review imported candidate objects with deterministic compliance findings, preserve source traceability, and
            confirm or reject interpretations before promotion into governed AAS work.
          </p>
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

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{queue.summary.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pending</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{queue.summary.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Follow-up</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{queue.summary.followUpNeeded}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Rejected</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{queue.summary.rejected}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Promoted</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{queue.summary.promoted}</p>
            </CardContent>
          </Card>
        </div>

        {queue.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Review queue unavailable</CardTitle>
              <CardDescription>{queue.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : queue.items.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No candidates are waiting for review</CardTitle>
              <CardDescription>{queue.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            {queue.items.map((candidate) => (
              <Card
                className={`border-border/70 shadow-sm ${candidateId === candidate.id ? "ring-2 ring-primary/30" : ""}`}
                key={candidate.id}
              >
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-3">
                        <span>{candidate.title}</span>
                        <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {candidate.type}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {candidate.file.fileName} • {candidate.sourceSectionMarker} • {candidate.intakeSession.label}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getReviewStatusClasses(candidate.reviewStatus)}`}>
                        {formatLabel(candidate.reviewStatus)}
                      </span>
                      {candidate.importedReadinessState ? (
                        <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                          {formatLabel(candidate.importedReadinessState)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Missing</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{candidate.complianceResult?.summary.missing ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Uncertain</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{candidate.complianceResult?.summary.uncertain ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Human-only</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{candidate.complianceResult?.summary.humanOnly ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Blocked</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{candidate.complianceResult?.summary.blocked ?? 0}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-4">
                      <Card className="border-border/70 shadow-none">
                        <CardHeader>
                          <CardTitle>Compliance findings</CardTitle>
                          <CardDescription>Deterministic, explainable checks across missing, uncertain, human-only, and blocked categories.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {candidate.complianceResult?.findings.length ? (
                            candidate.complianceResult.findings.map((finding) => (
                              <div className={`rounded-2xl border px-4 py-4 text-sm ${getFindingClasses(finding.category)}`} key={`${candidate.id}-${finding.code}`}>
                                <p className="font-medium">
                                  {finding.fieldLabel ? `${finding.fieldLabel}: ` : ""}
                                  {finding.message}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                              No compliance findings remain for this candidate.
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-border/70 shadow-none">
                        <CardHeader>
                          <CardTitle>Original source artifact</CardTitle>
                          <CardDescription>Source traceability stays visible while the interpretation is being reviewed.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                            <p>
                              <strong className="text-foreground">Section:</strong> {candidate.sourceSectionMarker}
                            </p>
                            <p className="mt-2">
                              <strong className="text-foreground">Summary:</strong> {candidate.summary}
                            </p>
                          </div>
                          <pre className="max-h-[320px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                            {candidate.file.content}
                          </pre>
                        </CardContent>
                      </Card>

                      <Card className="border-border/70 shadow-none">
                        <CardHeader>
                          <CardTitle>Parsed sections</CardTitle>
                          <CardDescription>Relevant extracted sections remain visible during review.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {candidate.file.parsedArtifacts?.sections.map((section) => (
                            <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={section.id}>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-medium text-foreground">{section.title}</p>
                                <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                  {formatLabel(section.kind)}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.text}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    <form action={submitArtifactCandidateReviewAction} className="space-y-4">
                      <input name="candidateId" type="hidden" value={candidate.id} />
                      <input name="candidateType" type="hidden" value={candidate.type} />

                      <Card className="border-border/70 shadow-none">
                        <CardHeader>
                          <CardTitle>Review and confirmation</CardTitle>
                          <CardDescription>Confirm, edit, reject, or mark follow-up before promotion.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Key</span>
                            <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.key ?? ""} name="key" type="text" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Title</span>
                            <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.title ?? candidate.title} name="title" type="text" />
                          </label>

                          {candidate.type === "outcome" ? (
                            <>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Outcome statement</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.outcomeStatement ?? ""} name="outcomeStatement" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Baseline definition</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.baselineDefinition ?? ""} name="baselineDefinition" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Baseline source</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.baselineSource ?? ""} name="baselineSource" />
                              </label>
                            </>
                          ) : null}

                          {candidate.type === "epic" ? (
                            <>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Purpose</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.purpose ?? ""} name="purpose" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Linked Outcome candidate ID</span>
                                <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.outcomeCandidateId ?? ""} name="outcomeCandidateId" type="text" />
                              </label>
                            </>
                          ) : null}

                          {candidate.type === "story" ? (
                            <>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Story type</span>
                                <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.storyType ?? "outcome_delivery"} name="storyType">
                                  <option value="outcome_delivery">Outcome delivery</option>
                                  <option value="governance">Governance</option>
                                  <option value="enablement">Enablement</option>
                                </select>
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Value intent</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.valueIntent ?? ""} name="valueIntent" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={(candidate.draftRecord?.acceptanceCriteria ?? []).join("\n")} name="acceptanceCriteria" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">AI usage scope</span>
                                <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={(candidate.draftRecord?.aiUsageScope ?? []).join(", ")} name="aiUsageScope" type="text" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Test Definition</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.testDefinition ?? ""} name="testDefinition" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Definition of Done</span>
                                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={(candidate.draftRecord?.definitionOfDone ?? []).join("\n")} name="definitionOfDone" />
                              </label>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Linked Outcome candidate ID</span>
                                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.outcomeCandidateId ?? ""} name="outcomeCandidateId" type="text" />
                                </label>
                                <label className="space-y-2">
                                  <span className="text-sm font-medium text-foreground">Linked Epic candidate ID</span>
                                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.draftRecord?.epicCandidateId ?? ""} name="epicCandidateId" type="text" />
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
                                <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.humanDecisions?.valueOwnerId ?? ""} name="valueOwnerId" type="text" />
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Baseline validity</span>
                                <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.humanDecisions?.baselineValidity ?? ""} name="baselineValidity">
                                  <option value="">Unresolved</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="needs_follow_up">Needs follow-up</option>
                                </select>
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">AI level</span>
                                <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.humanDecisions?.aiAccelerationLevel ?? ""} name="aiAccelerationLevel">
                                  <option value="">Unresolved</option>
                                  <option value="level_2">Level 2</option>
                                </select>
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Risk profile</span>
                                <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.humanDecisions?.riskProfile ?? ""} name="riskProfile">
                                  <option value="">Unresolved</option>
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </label>
                              <label className="space-y-2">
                                <span className="text-sm font-medium text-foreground">Risk acceptance status</span>
                                <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={candidate.humanDecisions?.riskAcceptanceStatus ?? ""} name="riskAcceptanceStatus">
                                  <option value="">Unresolved</option>
                                  <option value="accepted">Accepted</option>
                                  <option value="needs_review">Needs review</option>
                                </select>
                              </label>
                            </div>
                          </div>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Review comment</span>
                            <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={candidate.reviewComment ?? ""} name="reviewComment" />
                          </label>

                          <div className="grid gap-3">
                            <Button className="gap-2" name="intent" type="submit" value="edit" variant="secondary">
                              <GitBranch className="h-4 w-4" />
                              Save edits
                            </Button>
                            <Button className="gap-2" name="intent" type="submit" value="confirm">
                              <CircleCheckBig className="h-4 w-4" />
                              Confirm interpretation
                            </Button>
                            <Button className="gap-2" name="intent" type="submit" value="follow_up" variant="secondary">
                              <CircleAlert className="h-4 w-4" />
                              Mark follow-up needed
                            </Button>
                            <Button className="gap-2" name="intent" type="submit" value="reject" variant="secondary">
                              Reject candidate
                            </Button>
                            <Button className="gap-2" name="intent" type="submit" value="promote">
                              Promote into governed workspace
                            </Button>
                          </div>

                          {candidate.promotedEntityId ? (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                              Promoted into governed {candidate.promotedEntityType} with ID {candidate.promotedEntityId}.
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
