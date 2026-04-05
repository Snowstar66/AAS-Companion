import Link from "next/link";
import { CircleAlert, CircleCheckBig, Clock3 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOutcomeTollgateReviewData } from "@/lib/cache/project-data";

function formatRoleLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("sv-SE");
}

export async function OutcomeTollgateApprovalSection(props: {
  outcomeId: string;
  isArchived: boolean;
  defaultBlockers: string[];
  recordTollgateDecisionAction: (formData: FormData) => void | Promise<void>;
  returnPath?: string | null;
}) {
  const session = await requireActiveProjectSession();
  const tollgateResult = await getCachedOutcomeTollgateReviewData(
    session.organization.organizationId,
    props.outcomeId
  );

  if (!tollgateResult.ok) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Tollgate follow-up is unavailable</CardTitle>
          <CardDescription>
            {tollgateResult.errors[0]?.message ?? "The Tollgate workspace could not be loaded right now."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { outcome, blockers, tollgateReview } = tollgateResult.data;
  const visibleBlockers = blockers.length > 0 ? blockers : props.defaultBlockers;
  const hasApprovedDocument = Boolean(tollgateReview.approvalSnapshot);
  const approvedVersion = tollgateReview.approvedVersion ?? null;
  const currentFramingVersion = outcome.framingVersion;
  const currentVersionApproved = approvedVersion === currentFramingVersion && tollgateReview.status === "approved";
  const completedApprovals = tollgateReview.approvalActions.filter((action) => action.completedRecords.length > 0);
  const hasPartialApprovals = !currentVersionApproved && completedApprovals.length > 0;
  const versionRecommendationVisible = Boolean(approvedVersion && approvedVersion !== currentFramingVersion);
  const latestApprovalRecord =
    completedApprovals
      .flatMap((action) => action.completedRecords)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null;
  const primaryStatusClasses = currentVersionApproved
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : visibleBlockers.length > 0 || versionRecommendationVisible
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-sky-200 bg-sky-50 text-sky-900";
  const primaryStatusIcon = currentVersionApproved ? (
    <CircleCheckBig className="h-4 w-4" />
  ) : visibleBlockers.length > 0 || versionRecommendationVisible ? (
    <CircleAlert className="h-4 w-4" />
  ) : (
    <Clock3 className="h-4 w-4" />
  );
  const primaryStatusTitle = currentVersionApproved
    ? "Tollgate 1 is approved for the current Framing version."
    : hasPartialApprovals
      ? "Framing approvals are in progress for the current version."
      : "Tollgate 1 approvals can be recorded now.";
  const primaryStatusDetail = currentVersionApproved
    ? `The required approval roles for the current AI level signed off on Framing version ${currentFramingVersion}${latestApprovalRecord ? ` on ${formatDateTime(latestApprovalRecord.createdAt)}` : ""}.`
    : versionRecommendationVisible
      ? `Framing changed after version ${approvedVersion}. A fresh approval is recommended for version ${currentFramingVersion}.`
      : visibleBlockers.length > 0
        ? "Approvals are still allowed, but the open warnings below should be reviewed before you rely on this Framing as a stable baseline."
        : "The Framing looks complete enough. Record the required approvals for the current AI level below.";
  const riskSummaryRows = [
    {
      label: "AI Level",
      value: outcome.aiAccelerationLevel.replaceAll("_", " ")
    },
    {
      label: "Risk profile",
      value: outcome.riskProfile ? outcome.riskProfile.charAt(0).toUpperCase() + outcome.riskProfile.slice(1) : "Not determined"
    },
    {
      label: "Business impact",
      value: outcome.businessImpactLevel
        ? `${outcome.businessImpactLevel.charAt(0).toUpperCase() + outcome.businessImpactLevel.slice(1)}${outcome.businessImpactRationale ? ` - ${outcome.businessImpactRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Data sensitivity",
      value: outcome.dataSensitivityLevel
        ? `${outcome.dataSensitivityLevel.charAt(0).toUpperCase() + outcome.dataSensitivityLevel.slice(1)}${outcome.dataSensitivityRationale ? ` - ${outcome.dataSensitivityRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Blast radius",
      value: outcome.blastRadiusLevel
        ? `${outcome.blastRadiusLevel.charAt(0).toUpperCase() + outcome.blastRadiusLevel.slice(1)}${outcome.blastRadiusRationale ? ` - ${outcome.blastRadiusRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Decision impact",
      value: outcome.decisionImpactLevel
        ? `${outcome.decisionImpactLevel.charAt(0).toUpperCase() + outcome.decisionImpactLevel.slice(1)}${outcome.decisionImpactRationale ? ` - ${outcome.decisionImpactRationale}` : ""}`
        : "Not classified"
    }
  ];

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Tollgate 1 approval</CardTitle>
          <CardDescription>
            Tollgate 1 applies to the Framing brief as a whole. Record approvals directly from the required roles for the current AI level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`rounded-2xl border px-4 py-4 text-sm ${primaryStatusClasses}`}>
            <div className="flex items-center gap-2 font-medium">
              {primaryStatusIcon}
              {primaryStatusTitle}
            </div>
            <p className="mt-2 leading-6">{primaryStatusDetail}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Approval overview</p>
                  <p className="mt-2 leading-6 text-foreground">
                    Version {currentFramingVersion} and {completedApprovals.length} of {tollgateReview.approvalActions.length} approvals recorded
                  </p>
                </div>
                {versionRecommendationVisible ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                    New approval recommended
                  </span>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                {tollgateReview.approvalActions.map((action) => {
                  const assignedPeopleLabel =
                    action.assignedPeople.length > 0
                      ? action.assignedPeople.map((person) => person.fullName).join(", ")
                      : "No active assignee";

                  return (
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={`required-${action.roleType}-${action.organizationSide}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{action.label}</p>
                        <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {formatRoleLabel(action.roleType)}
                        </span>
                        <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {action.organizationSide}
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground">{assignedPeopleLabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50/55 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI and risk summary for approval</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {riskSummaryRows.map((row) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={row.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{row.label}</p>
                    <p className="mt-2 leading-6 text-foreground">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {visibleBlockers.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
              <p className="font-medium">Warnings before relying on this approval</p>
              <ul className="mt-3 space-y-2">
                {visibleBlockers.map((blocker) => (
                  <li key={blocker}>• {blocker}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasApprovedDocument ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="gap-2" variant="secondary">
                <Link href={`/outcomes/${props.outcomeId}/approval-document`}>
                  {approvedVersion === currentFramingVersion ? "Open approved framing document" : "Open last approved framing document"}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Open the saved approval record and print it as a PDF with the full Framing, approvals and dates.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4" id="tollgate-review">
        {tollgateReview.approvalActions.map((action) => {
          const completedRecord = action.completedRecords[0] ?? null;
          const hasAssignedPeople = action.assignedPeople.length > 0;

          return (
            <div
              className="rounded-2xl border border-border/70 bg-background px-4 py-4 shadow-sm"
              key={`${action.decisionKind}:${action.roleType}:${action.organizationSide}`}
            >
              <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{action.label}</p>
                    <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {formatRoleLabel(action.roleType)}
                    </span>
                    <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {action.organizationSide}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {hasAssignedPeople
                      ? action.assignedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                      : "No active person is assigned for this approval role yet."}
                  </p>
                </div>

                <div className="text-sm">
                  {completedRecord ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950">
                      <div className="flex items-center gap-2 font-medium">
                        <CircleCheckBig className="h-4 w-4" />
                        Approved by {completedRecord.actualPersonName}
                      </div>
                      <p className="mt-2 leading-6">{formatDateTime(completedRecord.createdAt)}</p>
                      {completedRecord.note ? <p className="mt-2 leading-6">Motivation: {completedRecord.note}</p> : null}
                    </div>
                  ) : props.isArchived ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-muted-foreground">
                      Restore the Framing brief to continue approvals.
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">Pending approval</p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                    completedRecord
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {completedRecord ? "Approved" : "Pending"}
                </span>
              </div>

              {!completedRecord && !props.isArchived ? (
                hasAssignedPeople ? (
                  <form action={props.recordTollgateDecisionAction} className="mt-4 space-y-3 border-t border-border/70 pt-4">
                    <input name="outcomeId" type="hidden" value={props.outcomeId} />
                    <input name="entityId" type="hidden" value={props.outcomeId} />
                    <input name="aiAccelerationLevel" type="hidden" value={outcome.aiAccelerationLevel} />
                    <input name="returnPath" type="hidden" value={props.returnPath ?? ""} />
                    <input
                      name="decisionKey"
                      type="hidden"
                      value={`approval|${action.roleType}|${action.organizationSide}`}
                    />
                    <input name="decisionStatus" type="hidden" value="approved" />
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Approver</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={action.assignedPeople[0]?.partyRoleEntryId ?? ""}
                          name="actualPartyRoleEntryId"
                        >
                          {action.assignedPeople.map((person) => (
                            <option key={person.partyRoleEntryId} value={person.partyRoleEntryId}>
                              {person.fullName} - {person.roleTitle}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Motivation</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          name="note"
                          required
                          type="text"
                        />
                      </label>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-sm">
                        <input className="mt-1 h-4 w-4" name="confirmApproval" required type="checkbox" value="yes" />
                        <span className="leading-6 text-foreground">
                          I confirm that the named role reviewed this Framing version and approves moving it through Tollgate 1.
                        </span>
                      </label>
                      <Button className="gap-2" type="submit">
                        <CircleCheckBig className="h-4 w-4" />
                        Record approval
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    Assign an active human role for this approval lane before recording the decision.
                  </div>
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function OutcomeTollgateSectionFallback() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Loading tollgate follow-up</CardTitle>
        <CardDescription>Approval roles and current Framing sign-offs are loading separately.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
      </CardContent>
    </Card>
  );
}
