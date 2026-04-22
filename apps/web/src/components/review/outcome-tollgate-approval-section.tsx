import Link from "next/link";
import { cookies } from "next/headers";
import { CircleAlert, CircleCheckBig, Clock3 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { LocalizedText } from "@/components/shared/localized-text";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOutcomeTollgateReviewData } from "@/lib/cache/project-data";

type AppLanguage = "en" | "sv";

function formatRoleLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("sv-SE");
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

function localizeTollgateBlocker(blocker: string, language: AppLanguage) {
  const reframingMatch = blocker.match(
    /^Framing changed after version (\d+)\. Submit version (\d+) to Tollgate 1 for a new approval\.$/
  );

  if (!reframingMatch) {
    return blocker;
  }

  return language === "sv"
    ? `Framing ändrades efter version ${reframingMatch[1]}. Skicka in version ${reframingMatch[2]} till Tollgate 1 för ett nytt godkännande.`
    : blocker;
}

export async function OutcomeTollgateApprovalSection(props: {
  outcomeId: string;
  isArchived: boolean;
  defaultBlockers: string[];
  recordTollgateDecisionAction: (formData: FormData) => void | Promise<void>;
  returnPath?: string | null;
}) {
  const language = await getServerLanguage();
  const session = await requireActiveProjectSession();
  const tollgateResult = await getCachedOutcomeTollgateReviewData(
    session.organization.organizationId,
    props.outcomeId
  );

  if (!tollgateResult.ok) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900">
              <LocalizedText en="Framing handshake" sv="Framing-handshake" />
            </span>
          </div>
          <CardTitle>
            <LocalizedText en="Tollgate follow-up is unavailable" sv="Tollgate-uppfoljning ar inte tillganglig" />
          </CardTitle>
          <CardDescription>
            {tollgateResult.errors[0]?.message ?? (
              <LocalizedText en="The Tollgate workspace could not be loaded right now." sv="Tollgate-arbetsytan kunde inte laddas just nu." />
            )}
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
  const activeSubmissionVersion = tollgateReview.activeSubmissionVersion ?? currentFramingVersion;
  const approvedSnapshotVersion =
    tollgateReview.approvalSnapshot &&
    typeof tollgateReview.approvalSnapshot === "object" &&
    typeof (tollgateReview.approvalSnapshot as { approvedVersion?: unknown }).approvedVersion === "number"
      ? ((tollgateReview.approvalSnapshot as { approvedVersion: number }).approvedVersion)
      : approvedVersion;
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
    ? language === "sv"
        ? "Tollgate 1 är godkänd för aktuell Framing-version."
      : "Tollgate 1 is approved for the current Framing version."
    : hasPartialApprovals
      ? language === "sv"
        ? "Framing-godkännanden pågår för aktuell version."
        : "Framing approvals are in progress for the current version."
      : language === "sv"
        ? "Tollgate 1-godkännanden kan registreras nu."
        : "Tollgate 1 approvals can be recorded now.";
  const primaryStatusDetail = currentVersionApproved
    ? language === "sv"
      ? `De godkännanderoller som krävs för aktuell AI-nivå har signerat Framing-version ${currentFramingVersion}${latestApprovalRecord ? ` den ${formatDateTime(latestApprovalRecord.createdAt)}` : ""}.`
      : `The required approval roles for the current AI level signed off on Framing version ${currentFramingVersion}${latestApprovalRecord ? ` on ${formatDateTime(latestApprovalRecord.createdAt)}` : ""}.`
    : versionRecommendationVisible
      ? language === "sv"
        ? `Framing ändrades efter version ${approvedVersion}. Ett nytt godkännande rekommenderas för version ${currentFramingVersion}.`
        : `Framing changed after version ${approvedVersion}. A fresh approval is recommended for version ${currentFramingVersion}.`
      : visibleBlockers.length > 0
        ? language === "sv"
          ? "Godkannanden ar fortfarande tillatna, men de oppna varningarna nedan bor granskas innan du forlitar dig pa denna Framing som stabil baseline."
          : "Approvals are still allowed, but the open warnings below should be reviewed before you rely on this Framing as a stable baseline."
        : language === "sv"
          ? "Framingen ser tillräckligt komplett ut. Registrera de godkännanden som krävs för aktuell AI-nivå nedan."
          : "The Framing looks complete enough. Record the required approvals for the current AI level below.";
  const riskSummaryRows = [
    {
      label: language === "sv" ? "AI-nivå" : "AI Level",
      value: outcome.aiAccelerationLevel.replaceAll("_", " ")
    },
    {
      label: language === "sv" ? "Riskprofil" : "Risk profile",
      value: outcome.riskProfile ? outcome.riskProfile.charAt(0).toUpperCase() + outcome.riskProfile.slice(1) : language === "sv" ? "Inte faststalld" : "Not determined"
    },
    {
      label: language === "sv" ? "Affarspaverkan" : "Business impact",
      value: outcome.businessImpactLevel
        ? `${outcome.businessImpactLevel.charAt(0).toUpperCase() + outcome.businessImpactLevel.slice(1)}${outcome.businessImpactRationale ? ` - ${outcome.businessImpactRationale}` : ""}`
        : language === "sv" ? "Inte klassificerad" : "Not classified"
    },
    {
      label: language === "sv" ? "Datakanslighet" : "Data sensitivity",
      value: outcome.dataSensitivityLevel
        ? `${outcome.dataSensitivityLevel.charAt(0).toUpperCase() + outcome.dataSensitivityLevel.slice(1)}${outcome.dataSensitivityRationale ? ` - ${outcome.dataSensitivityRationale}` : ""}`
        : language === "sv" ? "Inte klassificerad" : "Not classified"
    },
    {
      label: language === "sv" ? "Sprangradie" : "Blast radius",
      value: outcome.blastRadiusLevel
        ? `${outcome.blastRadiusLevel.charAt(0).toUpperCase() + outcome.blastRadiusLevel.slice(1)}${outcome.blastRadiusRationale ? ` - ${outcome.blastRadiusRationale}` : ""}`
        : language === "sv" ? "Inte klassificerad" : "Not classified"
    },
    {
      label: language === "sv" ? "Beslutspaverkan" : "Decision impact",
      value: outcome.decisionImpactLevel
        ? `${outcome.decisionImpactLevel.charAt(0).toUpperCase() + outcome.decisionImpactLevel.slice(1)}${outcome.decisionImpactRationale ? ` - ${outcome.decisionImpactRationale}` : ""}`
        : language === "sv" ? "Inte klassificerad" : "Not classified"
    }
  ];

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>
                <LocalizedText en="Tollgate 1 approval" sv="Tollgate 1-godkännande" />
          </CardTitle>
          <CardDescription>
            <LocalizedText
              en="Tollgate 1 applies to the Framing brief as a whole. Record approvals directly from the required roles for the current AI level."
              sv="Tollgate 1 gäller hela Framing-briefen. Registrera godkännanden direkt från de roller som krävs för aktuell AI-nivå."
            />
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <LocalizedText en="Approval overview" sv="Översikt över godkännanden" />
                  </p>
                  <p className="mt-2 leading-6 text-foreground">
                    {language === "sv"
                      ? `${completedApprovals.length} av ${tollgateReview.approvalActions.length} godkannanden registrerade for submissionsversion ${activeSubmissionVersion}`
                      : `${completedApprovals.length} of ${tollgateReview.approvalActions.length} approvals recorded for submission version ${activeSubmissionVersion}`}
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {language === "sv" ? "Inskickad framing" : "Submitted framing"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{`Version ${activeSubmissionVersion}`}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {language === "sv" ? "Godkand baseline" : "Approved baseline"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {approvedSnapshotVersion ? `Version ${approvedSnapshotVersion}` : language === "sv" ? "Inte sparad annu" : "Not stored yet"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {language === "sv" ? "Nuvarande arbetsframing" : "Current working framing"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{`Version ${currentFramingVersion}`}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {approvedSnapshotVersion
                      ? approvedSnapshotVersion === currentFramingVersion
                        ? language === "sv"
                          ? "Den godkanda baselinen och aktuell arbetsframing ar samma version."
                          : "The approved baseline and the current working Framing are the same version."
                        : language === "sv"
                          ? "Det sparade godkannandet pekar pa en tidigare godkand baseline an den nuvarande arbetsframingen."
                          : "The saved approval record points to an earlier approved baseline than the current working Framing."
                      : language === "sv"
                        ? "Ingen godkand baseline finns annu sparad for den har framingen."
                        : "No approved baseline is stored yet for this Framing."}
                  </p>
                </div>
                {versionRecommendationVisible ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                    <LocalizedText en="New approval recommended" sv="Nytt godkännande rekommenderas" />
                  </span>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                {tollgateReview.approvalActions.map((action) => {
                  const assignedPeopleLabel =
                    action.assignedPeople.length > 0
                      ? action.assignedPeople.map((person) => person.fullName).join(", ")
                      : language === "sv"
                        ? "Ingen aktiv tilldelad"
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <LocalizedText en="AI and risk summary for approval" sv="AI- och risksammanfattning för godkännande" />
              </p>
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
              <p className="font-medium">
                <LocalizedText en="Warnings before relying on this approval" sv="Varningar innan du förlitar dig på detta godkännande" />
              </p>
              <ul className="mt-3 space-y-2">
                {visibleBlockers.map((blocker) => (
                  <li key={blocker}>• {localizeTollgateBlocker(blocker, language)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasApprovedDocument ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="gap-2" variant="secondary">
                <Link href={`/outcomes/${props.outcomeId}/approval-document`}>
                  {approvedVersion === currentFramingVersion
                    ? (language === "sv" ? "Öppna godkänt framingdokument" : "Open approved framing document")
                    : (language === "sv" ? "Öppna senast godkända framingdokumentet" : "Open last approved framing document")}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                <LocalizedText
                  en="Open the saved approval record and print it as a PDF with the full Framing, approvals and dates."
                  sv="Öppna det sparade godkännandet och skriv ut det som PDF med full Framing, godkännanden och datum."
                />
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
                      : language === "sv"
                        ? "Ingen aktiv person är tilldelad den här godkännanderollen ännu."
                        : "No active person is assigned for this approval role yet."}
                  </p>
                </div>

                <div className="text-sm">
                  {completedRecord ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950">
                      <div className="flex items-center gap-2 font-medium">
                        <CircleCheckBig className="h-4 w-4" />
                        {language === "sv" ? "Godkand av" : "Approved by"} {completedRecord.actualPersonName}
                      </div>
                      <p className="mt-2 leading-6">{formatDateTime(completedRecord.createdAt)}</p>
                      {completedRecord.note ? <p className="mt-2 leading-6">{language === "sv" ? "Motivering" : "Motivation"}: {completedRecord.note}</p> : null}
                    </div>
                  ) : props.isArchived ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-muted-foreground">
                      <LocalizedText en="Restore the Framing brief to continue approvals." sv="Återställ Framing-briefen för att fortsätta godkännanden." />
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
                      <LocalizedText en="Pending approval" sv="Väntar på godkännande" />
                    </p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                    completedRecord
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {completedRecord ? (language === "sv" ? "Godkand" : "Approved") : (language === "sv" ? "Vantar" : "Pending")}
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
                        <span className="text-sm font-medium text-foreground">
                          <LocalizedText en="Approver" sv="Godkannare" />
                        </span>
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
                        <span className="text-sm font-medium text-foreground">
                          <LocalizedText en="Motivation" sv="Motivering" />
                        </span>
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
                          <LocalizedText
                            en="I confirm that the named role reviewed this Framing version and approves moving it through Tollgate 1."
                            sv="Jag bekräftar att den namngivna rollen har granskat denna Framing-version och godkänner att den passerar Tollgate 1."
                          />
                        </span>
                      </label>
                      <PendingFormButton
                        className="gap-2"
                        icon={<CircleCheckBig className="h-4 w-4" />}
                        label={language === "sv" ? "Registrera godkännande" : "Record approval"}
                        pendingLabel={language === "sv" ? "Registrerar godkännande..." : "Recording approval..."}
                        showPendingCursor
                      />
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <LocalizedText
                      en="Assign an active human role for this approval lane before recording the decision."
                      sv="Tilldela en aktiv mänsklig roll till detta godkännandespår innan beslutet registreras."
                    />
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
        <CardTitle>
          <LocalizedText en="Loading tollgate follow-up" sv="Laddar Tollgate-uppfoljning" />
        </CardTitle>
        <CardDescription>
          <LocalizedText en="Approval roles and current Framing sign-offs are loading separately." sv="Godkannanderoller och aktuella Framing-signoffs laddas separat." />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
      </CardContent>
    </Card>
  );
}
