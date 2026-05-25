import Link from "next/link";
import { cookies } from "next/headers";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  FileSearch,
  Gauge,
  GitBranch,
  ListChecks,
  MessageSquareText,
  RotateCw,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import {
  getControlMirrorDashboardService,
  listControlMirrorEvidencePackExportsService
} from "@aas-companion/api";
import {
  buildControlMirrorEvidencePackAcceptancePolicy,
  type ControlMirrorDashboard
} from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
import { ContextHelp } from "@/components/shared/context-help";
import { requireOrganizationContext } from "@/lib/auth/guards";
import { ControlMirrorAnchorOpener } from "./control-mirror-anchor-opener";
import {
  archiveControlMirrorEvidencePackExportAction,
  recordControlMirrorEvidencePackExportAcceptanceAction,
  recordControlMirrorHumanReviewDecisionAction,
  refreshControlMirrorSnapshotAction,
  submitControlMirrorUploadedSnapshotAction
} from "./actions";

type AppLanguage = "en" | "sv";

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .toLowerCase();
}

function getHumanDecisionLabel(value: string) {
  if (value === "approve") return "Approve";
  if (value === "approve_with_controls") return "Approve with controls";
  if (value === "reject") return "Reject";
  if (value === "defer") return "Defer";
  if (value === "downgrade") return "Downgrade";
  if (value === "request_exception") return "Request exception";
  if (value === "request_rework") return "Request rework";
  return formatLabel(value);
}

function formatDate(value: string | null) {
  if (!value) return "Current records";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatOptionalDate(value: string | null | undefined) {
  return value ? formatDate(value) : "n/a";
}

function isRetentionReviewOverdue(reviewDueAt: string | null | undefined, reviewedAt: string | null | undefined) {
  if (!reviewDueAt || reviewedAt) return false;
  const dueDate = new Date(reviewDueAt);

  return !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now();
}

function getMetricClasses(status: string) {
  if (status === "aligned") return "border-emerald-200 bg-emerald-50/80 shadow-sm";
  if (status === "partial") return "border-sky-200 bg-sky-50/80 shadow-sm";
  if (status === "gap") return "border-amber-200 bg-amber-50/80 shadow-sm";
  return "border-rose-200 bg-rose-50/80 shadow-sm";
}

function getReadinessClasses(status: string) {
  if (status === "ready") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "conditional") return "border-sky-200 bg-sky-50 text-sky-900";
  if (status === "human_approval_required") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-rose-200 bg-rose-50 text-rose-900";
}

function getAcceptanceReadinessClasses(status: string) {
  if (status === "share_ready") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "changes_requested") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function getAcceptanceReadinessLabel(status: string) {
  if (status === "share_ready") return "Share ready";
  if (status === "changes_requested") return "Changes requested";
  return "Acceptance pending";
}

function formatRoleList(roles: string[]) {
  if (roles.length === 0) return "None";

  return roles.map(formatLabel).join(", ");
}

function getArtifactTypeLabel(type: string) {
  return formatLabel(type).replace(/\b\w/g, (match) => match.toUpperCase());
}

function readSearchParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getDecisionLabel(status: string, language: AppLanguage) {
  if (status === "ready") return t(language, "Proceed", "Fortsätt");
  if (status === "conditional") return t(language, "Proceed with conditions", "Fortsätt med villkor");
  if (status === "human_approval_required") return t(language, "Needs Human Review", "Kräver Human Review");
  if (status === "downgrade_required") return t(language, "Downgrade AI claim", "Sänk AI-anspråk");
  return t(language, "Pause", "Pausa");
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function percentageOf(value: number, total: number) {
  return total > 0 ? clampPercent((value / total) * 100) : 0;
}

function getSignalClasses(tone: "good" | "warn" | "stop" | "neutral") {
  if (tone === "good") return "border-emerald-200 bg-emerald-50/85 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50/85 text-amber-950";
  if (tone === "stop") return "border-rose-200 bg-rose-50/85 text-rose-950";
  return "border-slate-200 bg-slate-50/80 text-slate-950";
}

function getBadgeClasses(tone: "good" | "warn" | "stop" | "neutral") {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "stop") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-slate-50 text-slate-950";
}

function getBarClasses(tone: "good" | "warn" | "stop" | "neutral") {
  if (tone === "good") return "bg-emerald-500";
  if (tone === "warn") return "bg-amber-500";
  if (tone === "stop") return "bg-rose-500";
  return "bg-sky-500";
}

function MetricBar({
  detail,
  href,
  label,
  max,
  tone,
  value
}: {
  detail?: string;
  href?: string;
  label: string;
  max: number;
  tone: "good" | "warn" | "stop" | "neutral";
  value: number;
}) {
  const percent = percentageOf(value, max);
  const content = (
    <div className={`rounded-2xl border p-4 ${getSignalClasses(tone)}`}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/70">
        <div className={`h-2 rounded-full ${getBarClasses(tone)}`} style={{ width: `${percent}%` }} />
      </div>
      {detail ? <p className="mt-2 text-xs leading-5 opacity-80">{detail}</p> : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a aria-label={`Open ${label}`} className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" href={href}>
      {content}
    </a>
  );
}

function KnownDeliveryProgressChart({
  language,
  progressPercent,
  stages
}: {
  language: AppLanguage;
  progressPercent: number | null;
  stages: Array<{ count: number; href: string; label: string }>;
}) {
  const max = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{t(language, "Known delivery progress", "Känd leveransprogress")}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              {t(language, "Calculated only from visible planned chunks and evidence.", "Beräknas bara från synliga planerade chunks och evidens.")}
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-right text-sky-950">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-900/80">{t(language, "Known", "Känd")}</p>
            <p className="text-2xl font-semibold">{progressPercent === null ? "n/a" : `${progressPercent}%`}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {progressPercent === null ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950">
            {t(language, "No reliable slice plan is visible yet, so Control Mirror will not guess progress.", "Ingen tillförlitlig slice-plan syns än, så Control Mirror gissar inte progress.")}
          </div>
        ) : null}
        {stages.map((stage) => (
          <a className="block" href={stage.href} key={stage.label}>
            <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)_48px] sm:items-center">
              <p className="text-sm font-medium text-foreground">{stage.label}</p>
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-sky-500" style={{ width: `${percentageOf(stage.count, max)}%` }} />
              </div>
              <p className="text-right text-sm font-semibold tabular-nums text-foreground">{stage.count}</p>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

function HandshakeCoverageChart({
  covered,
  language,
  missing,
  outside,
  reshaped,
  total
}: {
  covered: number;
  language: AppLanguage;
  missing: number;
  outside: number;
  reshaped: number;
  total: number;
}) {
  const hasPlan = total > 0;

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t(language, "Handshake coverage", "Handshake coverage")}</CardTitle>
        <CardDescription className="mt-1 text-sm">
          {t(language, "Shows how much of the approved handshake has visible delivery evidence.", "Visar hur mycket av godkänt handshake som har synlig leveransevidens.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPlan ? (
          <>
            <div aria-label={t(language, "Handshake coverage stacked bar", "Staplad handshake-täckning")} className="flex h-5 overflow-hidden rounded-full bg-slate-100">
              <a className="bg-emerald-500" href="#conformance" style={{ width: `${percentageOf(covered, total)}%` }} title={t(language, "Covered", "Täckt")} />
              <a className="bg-sky-500" href="#conformance" style={{ width: `${percentageOf(reshaped, total)}%` }} title={t(language, "Reshaped", "Omformat")} />
              <a className="bg-amber-500" href="#human-review" style={{ width: `${percentageOf(missing, total)}%` }} title={t(language, "Missing", "Saknas")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricBar detail={t(language, "Ready for build", "Redo för build")} href="#conformance" label={t(language, "Covered", "Täckt")} max={total} tone="good" value={covered} />
              <MetricBar detail={t(language, "Partial delivery evidence", "Delvis leveransevidens")} href="#conformance" label={t(language, "Reshaped", "Omformat")} max={total} tone="neutral" value={reshaped} />
              <MetricBar detail={t(language, "No proof yet", "Saknar bevis än")} href="#human-review" label={t(language, "Missing", "Saknas")} max={total} tone={missing > 0 ? "warn" : "good"} value={missing} />
              <MetricBar detail={t(language, "Outside approved scope", "Utanför godkänt scope")} href="#artifacts" label={t(language, "Outside", "Utanför")} max={Math.max(total, outside, 1)} tone={outside > 0 ? "stop" : "good"} value={outside} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950">
            {t(language, "No approved Story Idea baseline is visible yet, so coverage cannot be calculated fairly.", "Ingen godkänd Story Idea-baseline syns än, så täckning kan inte beräknas rättvist.")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BlockerDistributionChart({
  items,
  language
}: {
  items: Array<{ href: string; label: string; tone: "good" | "warn" | "stop" | "neutral"; value: number }>;
  language: AppLanguage;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const cardTone = total > 0 ? "border-amber-200 bg-amber-50/35" : "border-emerald-200 bg-emerald-50/45";

  return (
    <Card className={`shadow-sm ${cardTone}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-lg">{t(language, "Actionable blockers", "Atgardbara blockerare")}</CardTitle>
            <CardDescription className="mt-1 text-sm">
              {t(language, "Filled bars are unresolved risk. Good means every row is empty and shows 0.", "Fyllda staplar ar olost risk. Bra betyder att varje rad ar tom och visar 0.")}
            </CardDescription>
          </div>
          <div className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${total > 0 ? getBadgeClasses("warn") : getBadgeClasses("good")}`}>
            {total > 0 ? t(language, "Target: 0 blockers", "Mal: 0 blockerare") : t(language, "Target met", "Malet uppnatt")}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t(language, "Threshold: any value above 0 needs action.", "Threshold: varje varde over 0 kraver atgard.")}</span>
          <span aria-hidden="true">/</span>
          <span>{t(language, "Scale: bars are relative to the largest current blocker count.", "Skala: staplarna ar relativa till storsta aktuella blockerarantalet.")}</span>
        </div>
        {items.map((item) => (
          <a className="block" href={item.href} key={item.label}>
            <div className="grid gap-2 rounded-xl px-2 py-1 transition hover:bg-background/70 sm:grid-cols-[190px_minmax(0,1fr)_118px] sm:items-center">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <div className="h-3 rounded-full bg-slate-100" title={item.value === 0 ? t(language, "Clear", "Klar") : t(language, "Needs action", "Kraver atgard")}>
                <div
                  aria-label={`${item.label}: ${item.value}`}
                  className={`h-3 rounded-full ${item.value === 0 ? "bg-emerald-500" : getBarClasses(item.tone)}`}
                  style={{ width: `${item.value === 0 ? 0 : percentageOf(item.value, max)}%` }}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${item.value === 0 ? getBadgeClasses("good") : getBadgeClasses(item.tone)}`}>
                  {item.value === 0 ? t(language, "Clear", "Klar") : t(language, "Action", "Atgard")}
                </span>
                <p className="w-5 text-right text-sm font-semibold tabular-nums text-foreground">{item.value}</p>
              </div>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

type DecisionPromptLogEntry = {
  answer: string;
  href: string;
  impact: string;
  key: string;
  nextActionHref: string;
  nextActionLabel: string;
  question: string;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
  source: string;
  status: string;
  statusTone: "good" | "warn" | "stop" | "neutral";
  time: string | null;
  type: string;
};

function DecisionPromptLog({
  entries,
  helpPattern,
  language
}: {
  entries: DecisionPromptLogEntry[];
  helpPattern: Parameters<typeof ContextHelp>[0]["pattern"];
  language: AppLanguage;
}) {
  const openEntries = entries.filter((entry) => entry.statusTone === "warn" || entry.statusTone === "stop").length;

  return (
    <Card className="border-border/70 bg-background shadow-sm" id="decision-prompt-log">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{t(language, "Decision & prompt log", "Besluts- och promptlogg")}</CardTitle>
            </div>
            <CardDescription className="mt-2 max-w-3xl text-sm">
              {t(
                language,
                "A backlog-style trail of the questions Control Mirror raised, the answer recorded so far, and what each answer changes.",
                "En backlog-liknande logg over fragorna Control Mirror stallt, svaret som finns registrerat och vad svaret andrar."
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:items-start">
            <div className={`rounded-2xl border px-4 py-3 text-sm ${openEntries > 0 ? getBadgeClasses("warn") : getBadgeClasses("good")}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{t(language, "Open", "Oppna")}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{openEntries}</p>
            </div>
            <ContextHelp className="lg:max-w-xl" pattern={helpPattern} summaryLabel={t(language, "Show log guidance", "Visa logg-hjalp")} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950">
            {t(language, "No decision prompts or acceptance questions are visible in the current evidence.", "Inga beslutsfragor eller acceptansfragor syns i nuvarande evidens.")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <div className="hidden grid-cols-[120px_minmax(240px,1.1fr)_minmax(240px,1fr)_minmax(190px,0.85fr)_minmax(160px,0.65fr)_96px] gap-3 border-b border-border/70 bg-muted/25 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground xl:grid">
              <span>{t(language, "Type", "Typ")}</span>
              <span>{t(language, "Question", "Fraga")}</span>
              <span>{t(language, "Where from", "Varifran")}</span>
              <span>{t(language, "Answer", "Svar")}</span>
              <span>{t(language, "Next", "Nasta")}</span>
              <span className="text-right">{t(language, "Status", "Status")}</span>
            </div>
            <div className="divide-y divide-border/70">
              {entries.map((entry) => (
                <div
                  className="grid gap-3 px-4 py-4 transition hover:bg-muted/20 xl:grid-cols-[120px_minmax(240px,1.1fr)_minmax(240px,1fr)_minmax(190px,0.85fr)_minmax(160px,0.65fr)_96px]"
                  key={entry.key}
                >
                  <div>
                    <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/20 px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {entry.type}
                    </span>
                    <p className="mt-2 text-xs text-muted-foreground">{formatOptionalDate(entry.time)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground xl:hidden">{t(language, "Question", "Fraga")}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-foreground xl:mt-0">{entry.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.key}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground xl:hidden">{t(language, "Where from", "Varifran")}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground xl:mt-0">{entry.source}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground xl:hidden">{t(language, "Answer", "Svar")}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground xl:mt-0">{entry.answer}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{entry.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground xl:hidden">{t(language, "Next", "Nasta")}</p>
                    <div className="mt-1 flex flex-col gap-2 xl:mt-0">
                      <Button asChild size="sm" variant={entry.statusTone === "good" ? "secondary" : "default"}>
                        <Link href={entry.nextActionHref}>{entry.nextActionLabel}</Link>
                      </Button>
                      {entry.secondaryActionHref && entry.secondaryActionLabel ? (
                        <Button asChild size="sm" variant="secondary">
                          <Link href={entry.secondaryActionHref}>{entry.secondaryActionLabel}</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-start justify-start xl:justify-end">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${getBadgeClasses(entry.statusTone)}`}>
                      <MessageSquareText className="h-3.5 w-3.5" />
                      {entry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function ControlMirrorPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [organization, language] = await Promise.all([requireOrganizationContext(), getServerLanguage()]);
  const [result, exportHistoryResult] = await Promise.all([
    getControlMirrorDashboardService(organization.organizationId),
    listControlMirrorEvidencePackExportsService({
      organizationId: organization.organizationId,
      take: 5
    })
  ]);

  if (!result.ok) {
    throw new Error(result.errors[0]?.message ?? "Control Mirror could not be loaded.");
  }

  const data: ControlMirrorDashboard = result.data;
  const exportHistory = exportHistoryResult.ok ? exportHistoryResult.data : [];
  const exportAcceptancePolicy = buildControlMirrorEvidencePackAcceptancePolicy({
    rawSourceTextIncluded: false,
    sensitiveFindingCount: data.normalizedEvidence.reduce((sum, item) => sum + (item.sensitiveFindingCount ?? 0), 0)
  });
  const blockingItems = data.humanReviewItems.filter((item) => item.blocksRelease && (item.reviewState ?? "open") === "open");
  const reviewStateCounts: Array<[string, number]> = [
    ["open", data.reviewStateSummary.open],
    ["decided", data.reviewStateSummary.decided],
    ["deferred", data.reviewStateSummary.deferred],
    ["superseded", data.reviewStateSummary.superseded]
  ];
  const untracedArtifacts = data.artifacts.filter((artifact) => artifact.lineageStatus === "missing");
  const visibleArtifacts = data.artifacts.slice(0, 8);
  const visibleNormalizedEvidence = data.normalizedEvidence.slice(0, 8);
  const visibleConformanceFindings = data.conformance.findings.slice(0, 8);
  const visibleValueSpineCoverage = data.testEvidence.valueSpineCoverage.slice(0, 8);
  const visibleMappedTestEvidence = data.testEvidence.mappedEvidence.slice(0, 8);
  const visibleUntracedImplementationArtifacts = data.testEvidence.untracedImplementationArtifacts.slice(0, 6);
  const visibleGuardrailFindings = data.guardrails.findings.slice(0, 8);
  const missingAiEvidence = data.aiEvidence.filter((item) => !item.present);
  const topBlockers = [
    ...data.report.blockingGaps,
    ...data.guardrails.findings.map((finding) => finding.recommendedAction),
    ...data.conformance.findings.filter((finding) => finding.severity === "high").map((finding) => finding.recommendedAction)
  ].slice(0, 3);
  const humanReviewHref = "#human-review";
  const approvedChunkCount = data.designProgress.storyIdeas;
  const coveredHandshakeCount = Math.min(data.designProgress.readyForBuild, approvedChunkCount);
  const reshapedHandshakeCount = Math.min(data.buildConformance.partiallyBuilt, Math.max(approvedChunkCount - coveredHandshakeCount, 0));
  const missingHandshakeCount = Math.max(approvedChunkCount - coveredHandshakeCount - reshapedHandshakeCount, 0);
  const outsideHandshakeCount = untracedArtifacts.length + data.normalization.outOfScopeItems;
  const knownProgressPercent = approvedChunkCount > 0 ? percentageOf(data.designProgress.readyForBuild, approvedChunkCount) : null;
  const progressStages = [
    { href: "#normalization", label: t(language, "Story Ideas", "Story Ideas"), count: data.designProgress.storyIdeas },
    { href: "#normalization", label: t(language, "Classified", "Klassade"), count: data.designProgress.classifiedItems },
    { href: "#conformance", label: t(language, "Delivery Stories", "Delivery Stories"), count: data.designProgress.refinedDeliveryStories },
    { href: "#conformance", label: t(language, "Acceptance criteria", "Acceptanskriterier"), count: data.designProgress.storiesWithAcceptanceCriteria },
    { href: "#value-spine-coverage", label: t(language, "Test definition", "Testdefinition"), count: data.designProgress.storiesWithTestDefinition },
    { href: "#conformance", label: t(language, "Ready for build", "Redo för build"), count: data.designProgress.readyForBuild }
  ];
  const testGapCount = data.testEvidence.storiesWithNoTest + data.testEvidence.storiesWithTestDefinitionOnly + data.testEvidence.brokenValueSpineLinks;
  const blockerChartItems = [
    { href: humanReviewHref, label: t(language, "Human review", "Human review"), tone: blockingItems.length > 0 ? "stop" as const : "good" as const, value: blockingItems.length },
    { href: "#ai-level-evidence", label: t(language, "AI evidence", "AI-evidens"), tone: missingAiEvidence.length > 0 ? "warn" as const : "good" as const, value: missingAiEvidence.length },
    { href: "#value-spine-coverage", label: t(language, "Test gaps", "Testgap"), tone: testGapCount > 0 ? "warn" as const : "good" as const, value: testGapCount },
    { href: "#artifacts", label: t(language, "Untraced scope", "Ospårat scope"), tone: untracedArtifacts.length > 0 ? "stop" as const : "good" as const, value: untracedArtifacts.length }
  ];
  const dashboardHelp = {
    title: t(language, "Control Mirror dashboard", "Control Mirror-dashboard"),
    summary: t(
      language,
      "Use the first view for decisions only: recommendation, handshake coverage, known progress and blockers.",
      "Använd första vyn bara för beslut: rekommendation, handshake-täckning, känd progress och blockerare."
    ),
    purpose: t(
      language,
      "Separate what is proven from what is planned so the release recommendation is not inflated by intended work.",
      "Separera det som är bevisat från det som är planerat så att release-rekommendationen inte blåses upp av tänkt arbete."
    ),
    belongs: t(
      language,
      "Actionable gaps, linked evidence, known chunks, review decisions and report-ready status.",
      "Åtgärdbara gap, länkad evidens, kända chunks, review-beslut och rapportklar status."
    ),
    avoid: t(
      language,
      "Raw scan counters, storage policy detail and technical metadata unless you open the audit section.",
      "Råa scan-räknare, lagringspolicy och teknisk metadata om du inte öppnar audit-delen."
    ),
    nextStep: t(
      language,
      "Open the largest blocker first, then refresh the snapshot after new evidence has been imported.",
      "Öppna största blockeraren först och uppdatera sedan snapshot efter att ny evidens importerats."
    )
  };
  const decisionLogHelp = {
    title: t(language, "Decision and prompt log", "Besluts- och promptlogg"),
    summary: t(
      language,
      "Use this as the audit-friendly backlog of questions, answers and consequences.",
      "Anvand detta som en audit-vanlig backlogg med fragor, svar och konsekvenser."
    ),
    purpose: t(
      language,
      "Make every human or customer-facing control decision visible: what was asked, what was answered, and what the answer changed.",
      "Gor varje manskligt eller kundnara kontrollbeslut synligt: vad som fragades, vad som svarades och vad svaret andrade."
    ),
    belongs: t(
      language,
      "Human Review decisions, export acceptance decisions, open approval questions and the current decision impact.",
      "Human Review-beslut, exportacceptans, oppna godkannandefragor och aktuell beslutspaverkan."
    ),
    avoid: t(
      language,
      "Raw source dumps, implementation noise and counters that do not change a decision.",
      "Ra kalltext, implementationsbrus och raknare som inte andrar ett beslut."
    ),
    nextStep: t(
      language,
      "Start with rows marked Action or Pending, record the answer, then refresh Control Mirror.",
      "Börja med rader markerade Action eller Pending, registrera svaret och uppdatera sedan Control Mirror."
    )
  };
  const getReviewCardHref = (itemId: string) => `#review-item-${itemId}`;
  const getHumanReviewSource = (item: ControlMirrorDashboard["humanReviewItems"][number]) => {
    if (item.sourceFindingId === "guardrail-governance-funding") {
      return t(
        language,
        "Generated by the Commercial governance guardrail: requested AI level is Level 2/3, but no funding, Margin Gate, commercial or governance-funding evidence was found in imported artifacts or signoff references.",
        "Skapad av Commercial governance-regeln: begard AI-niva ar Level 2/3, men Control Mirror hittade ingen funding-, Margin Gate-, commercial- eller governance-funding-evidens i importerade filer eller signoff-referenser."
      );
    }

    if (item.sourceFindingId === "guardrail-test-evidence") {
      return t(
        language,
        "Generated by the Test evidence guardrail: at least one release-impacting Story lacks mapped implemented or manual verification evidence.",
        "Skapad av Test evidence-regeln: minst en releasepaverkande Story saknar mappad implementerad eller manuell verifieringsevidens."
      );
    }

    if (item.sourceFindingId === "untraced-artifacts") {
      return t(
        language,
        "Generated from the artifact manifest: implementation or test artifacts were found without Story-ID lineage.",
        "Skapad fran artifact manifest: implementation eller testartefakter hittades utan Story-ID lineage."
      );
    }

    if (item.sourceFindingId === "ai-level-recommendation") {
      return t(
        language,
        "Generated from the AI-level calculation: requested AI level is higher than the evidence-backed achieved level.",
        "Skapad fran AI-nivaberakningen: begard AI-niva ar hogre an evidensbaserad uppnadd niva."
      );
    }

    return `${item.sourceFindingId ?? item.category}: ${item.rationale}`;
  };
  const getHumanReviewNextAction = (item: ControlMirrorDashboard["humanReviewItems"][number]) => {
    const reviewHref = getReviewCardHref(item.id);

    if (item.sourceFindingId === "guardrail-governance-funding") {
      return {
        nextActionHref: "/intake?source=control-mirror",
        nextActionLabel: t(language, "Import funding evidence", "Importera funding-evidens"),
        secondaryActionHref: reviewHref,
        secondaryActionLabel: t(language, "Record exception", "Registrera undantag")
      };
    }

    if (item.sourceFindingId === "guardrail-test-evidence") {
      return {
        nextActionHref: "/intake?source=control-mirror",
        nextActionLabel: t(language, "Import test evidence", "Importera testevidens"),
        secondaryActionHref: reviewHref,
        secondaryActionLabel: t(language, "Record decision", "Registrera beslut")
      };
    }

    if (item.sourceFindingId === "untraced-artifacts") {
      return {
        nextActionHref: "#artifacts",
        nextActionLabel: t(language, "Inspect artifacts", "Granska artefakter"),
        secondaryActionHref: reviewHref,
        secondaryActionLabel: t(language, "Record decision", "Registrera beslut")
      };
    }

    return {
      nextActionHref: reviewHref,
      nextActionLabel: t(language, "Open review card", "Oppna review-kort")
    };
  };
  const humanReviewDecisionLogEntries: DecisionPromptLogEntry[] = data.humanReviewItems.map((item) => {
    const hasDecision = Boolean(item.latestHumanDecision);
    const reviewState = item.reviewState ?? "open";
    const statusTone = hasDecision ? "good" : item.blocksRelease ? "stop" : "warn";
    const nextAction = getHumanReviewNextAction(item);

    return {
      answer: hasDecision
        ? `${getHumanDecisionLabel(item.latestHumanDecision?.decisionType ?? "")}: ${item.latestHumanDecision?.rationale ?? ""}`
        : `${t(language, "Awaiting answer", "Invantar svar")}. ${t(language, "Suggested", "Forslag")}: ${item.suggestedResponse}`,
      href: getReviewCardHref(item.id),
      impact: hasDecision
        ? t(language, "Updates the release recommendation and evidence pack review state.", "Uppdaterar release-rekommendationen och review-status i evidenspaketet.")
        : item.blocksRelease
          ? t(language, "Blocks release or higher AI-level claims until answered.", "Blockerar release eller hogre AI-nivaansprak tills fragan ar besvarad.")
          : t(language, "Can change the recommendation if the answer confirms a gap.", "Kan andra rekommendationen om svaret bekraftar ett gap."),
      key: item.persistedReviewItemId ?? item.id,
      ...nextAction,
      question: item.decisionNeeded,
      source: getHumanReviewSource(item),
      status: hasDecision ? getHumanDecisionLabel(item.latestHumanDecision?.decisionType ?? "") : reviewState === "open" ? t(language, "Action", "Atgard") : formatLabel(reviewState),
      statusTone,
      time: item.latestHumanDecision?.createdAt ?? item.persistedUpdatedAt ?? null,
      type: t(language, "Human Review", "Human Review")
    };
  });
  const exportAcceptanceDecisionLogEntries: DecisionPromptLogEntry[] = exportHistory.flatMap((record) => {
    const decisionEntries = record.acceptanceSummary.latestDecisions.map((decision) => ({
      answer: `${formatLabel(decision.decisionType)}: ${decision.rationale}`,
      href: `/control-mirror/export/${record.id}`,
      impact: `${t(language, "Evidence pack sharing status", "Delningsstatus for evidenspaket")}: ${formatLabel(record.acceptanceSummary.shareReadiness)}`,
      key: decision.id,
      nextActionHref: `/control-mirror/export/${record.id}`,
      nextActionLabel: t(language, "Open export", "Oppna export"),
      question: `${formatLabel(decision.reviewerRole)} ${t(language, "acceptance for", "acceptans for")} ${record.fileName}`,
      source: t(language, "Recorded from Product/Security acceptance on a generated Control Mirror evidence pack export.", "Registrerad fran Product/Security-acceptans pa en genererad Control Mirror evidence pack-export."),
      status: formatLabel(decision.decisionType),
      statusTone: decision.decisionType === "changes_requested" || decision.decisionType === "revoked" ? "stop" as const : decision.decisionType === "accepted_with_conditions" ? "warn" as const : "good" as const,
      time: decision.createdAt,
      type: t(language, "Export acceptance", "Exportacceptans")
    }));

    if (decisionEntries.length > 0 || record.acceptanceSummary.shareReadiness === "share_ready") {
      return decisionEntries;
    }

    return [{
      answer: `${t(language, "Awaiting required roles", "Invantar obligatoriska roller")}: ${formatRoleList(record.acceptanceSummary.missingRoles)}`,
      href: `/control-mirror/export/${record.id}`,
      impact: t(language, "Prevents broad governance or external sharing until accepted.", "Hindrar bred governance- eller extern delning tills acceptans finns."),
      key: `${record.id}-acceptance-pending`,
      nextActionHref: "#control-report-preview",
      nextActionLabel: t(language, "Record acceptance", "Registrera acceptans"),
      question: `${t(language, "Can this evidence pack be shared", "Kan detta evidenspaket delas")}: ${record.fileName}?`,
      source: t(language, "Generated from evidence pack sharing policy because required acceptance roles are missing.", "Skapad fran evidence pack-delningens policy eftersom obligatoriska acceptansroller saknas."),
      status: t(language, "Pending", "Vantar"),
      statusTone: "warn" as const,
      time: record.generatedAt,
      type: t(language, "Export acceptance", "Exportacceptans")
    }];
  });
  const decisionPromptLogEntries = [...humanReviewDecisionLogEntries, ...exportAcceptanceDecisionLogEntries].sort((a, b) => {
    if (a.statusTone !== "good" && b.statusTone === "good") return -1;
    if (a.statusTone === "good" && b.statusTone !== "good") return 1;

    return new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime();
  });
  const firstViewportSignals = [
    {
      label: t(language, "Source judged", "Bedömd källa"),
      value: data.snapshot.label,
      detail: `${data.snapshot.fileCount} ${t(language, "files", "filer")} · ${formatDate(data.snapshot.scanTime)}`,
      tone: "neutral"
    },
    {
      label: t(language, "Control posture", "Kontrolläge"),
      value: getDecisionLabel(data.releaseReadiness, language),
      detail: data.report.recommendedNextStep,
      tone: data.releaseReadiness === "ready" ? "good" : data.releaseReadiness === "blocked" ? "stop" : "warn"
    },
    {
      label: t(language, "Human decisions", "Mänskliga beslut"),
      value: String(blockingItems.length),
      detail:
        blockingItems.length > 0
          ? t(language, "blocking review items before release", "blockerande review-poster före release")
          : t(language, "no blocking review decisions visible", "inga blockerande review-beslut synliga"),
      tone: blockingItems.length > 0 ? "stop" : "good"
    },
    {
      label: t(language, "Evidence gaps", "Evidensgap"),
      value: String(missingAiEvidence.length + untracedArtifacts.length + data.testEvidence.brokenValueSpineLinks),
      detail: t(language, "AI, lineage and Value Spine gaps treated as risk", "AI-, lineage- och Value Spine-gap behandlas som risk"),
      tone: missingAiEvidence.length + untracedArtifacts.length + data.testEvidence.brokenValueSpineLinks > 0 ? "warn" : "good"
    }
  ];
  const statusMessage = readSearchParam(resolvedSearchParams, "message");
  const statusType = readSearchParam(resolvedSearchParams, "status");
  const selectedSource = readSearchParam(resolvedSearchParams, "source");
  const showUploadedSnapshotPanel = selectedSource === "uploaded-snapshot";
  const testEvidenceSummaryItems: Array<[string, number]> = [
    ["storiesWithNoTest", data.testEvidence.storiesWithNoTest],
    ["storiesWithTestDefinitionOnly", data.testEvidence.storiesWithTestDefinitionOnly],
    ["storiesWithImplementedTests", data.testEvidence.storiesWithImplementedTests],
    ["storiesWithPassingTests", data.testEvidence.storiesWithPassingTests],
    ["storiesWithFailingTests", data.testEvidence.storiesWithFailingTests],
    ["manualVerificationOnly", data.testEvidence.manualVerificationOnly],
    ["behaviouralContractTests", data.testEvidence.behaviouralContractTests],
    ["brokenValueSpineLinks", data.testEvidence.brokenValueSpineLinks]
  ];

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Control Mirror",
        badge: formatLabel(data.releaseReadiness)
      }}
    >
      <ControlMirrorAnchorOpener />
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            {t(language, "Delivery conformance", "Leveranskontroll")}
          </div>
          <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Control Mirror</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {t(
                  language,
                  "A parallel control view that checks whether design, build, tests and AI level evidence still follow approved Framing and the Value Spine.",
                  "En parallell kontrollvy som kontrollerar om design, bygg, tester och AI-nivåevidens fortfarande följer godkänd Framing och Value Spine."
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild className="gap-2">
                  <Link href="/intake?source=control-mirror">
                    <FileSearch className="h-4 w-4" />
                    {t(language, "Connect project evidence", "Koppla projektunderlag")}
                  </Link>
                </Button>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/review">
                    <ShieldCheck className="h-4 w-4" />
                    {t(language, "Open Human Review", "Öppna mänsklig granskning")}
                  </Link>
                </Button>
              </div>
            </div>
            <div className={`rounded-3xl border p-5 ${getReadinessClasses(data.releaseReadiness)}`}>
              <div className="flex items-start gap-3">
                {data.releaseReadiness === "ready" ? <CheckCircle2 className="mt-1 h-5 w-5" /> : <ShieldAlert className="mt-1 h-5 w-5" />}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{t(language, "Release readiness", "Releaseberedskap")}</p>
                  <p className="mt-2 text-2xl font-semibold">{formatLabel(data.releaseReadiness)}</p>
                  <p className="mt-3 text-sm leading-6">{data.report.recommendedNextStep}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {firstViewportSignals.map((item) => {
              const toneClass =
                item.tone === "good"
                  ? "border-emerald-200 bg-emerald-50/85 text-emerald-950"
                  : item.tone === "stop"
                    ? "border-rose-200 bg-rose-50/85 text-rose-950"
                    : item.tone === "warn"
                      ? "border-amber-200 bg-amber-50/85 text-amber-950"
                      : "border-slate-200 bg-white/75 text-slate-950";
              const Icon = item.tone === "good" ? CheckCircle2 : item.tone === "stop" ? ShieldAlert : item.tone === "warn" ? AlertTriangle : FileSearch;

              return (
                <div className={`min-h-[118px] rounded-2xl border p-4 ${toneClass}`} key={item.label}>
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{item.label}</p>
                      <p className="mt-2 break-words text-xl font-semibold leading-tight">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 opacity-80">{item.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Card className={`border shadow-sm ${getReadinessClasses(data.releaseReadiness)}`}>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="text-2xl">{t(language, "Executive summary", "Ledningssammanfattning")}</CardTitle>
                <CardDescription className="mt-2 max-w-3xl text-current opacity-80">
                  {t(
                    language,
                    "Start here: the recommendation, the reason, and the next control action.",
                    "Börja här: rekommendationen, orsaken och nästa kontrollåtgärd."
                  )}
                </CardDescription>
              </div>
              <form action={refreshControlMirrorSnapshotAction}>
                <Button className="gap-2" type="submit" variant="secondary">
                  <RotateCw className="h-4 w-4" />
                  {t(language, "Refresh snapshot", "Uppdatera snapshot")}
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
            <div className="rounded-2xl border border-current/15 bg-white/55 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">{t(language, "Recommendation", "Rekommendation")}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{getDecisionLabel(data.releaseReadiness, language)}</p>
              <p className="mt-3 text-sm leading-6">{data.report.recommendedNextStep}</p>
            </div>
            <div className="rounded-2xl border border-current/15 bg-white/55 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">{t(language, "Why", "Varför")}</p>
              {topBlockers.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {topBlockers.map((blocker) => (
                    <div className="rounded-xl border border-current/15 bg-white/60 px-3 py-2 text-sm leading-6" key={blocker}>
                      {blocker}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6">{t(language, "No blocking control gaps are visible in the current evidence.", "Inga blockerande kontrollgap syns i nuvarande evidens.")}</p>
              )}
            </div>
            <div className="rounded-2xl border border-current/15 bg-white/55 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">{t(language, "Next action", "Nästa steg")}</p>
              <div className="mt-3 grid gap-2">
                <Button asChild className="gap-2">
                  <Link href={humanReviewHref}>
                    <ShieldCheck className="h-4 w-4" />
                    {t(language, "Review blockers", "Granska blockerare")}
                  </Link>
                </Button>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="#control-dashboard">
                    <BarChart3 className="h-4 w-4" />
                    {t(language, "View evidence dashboard", "Visa evidensdashboard")}
                  </Link>
                </Button>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="#decision-prompt-log">
                    <ListChecks className="h-4 w-4" />
                    {t(language, "Open decision log", "Oppna beslutslogg")}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4" id="control-dashboard">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Evidence dashboard", "Evidensdashboard")}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">{t(language, "What changes the recommendation", "Det som ändrar rekommendationen")}</h2>
            </div>
            <ContextHelp className="md:max-w-xl" pattern={dashboardHelp} summaryLabel={t(language, "Show dashboard guidance", "Visa dashboard-hjälp")} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <HandshakeCoverageChart
              covered={coveredHandshakeCount}
              language={language}
              missing={missingHandshakeCount}
              outside={outsideHandshakeCount}
              reshaped={reshapedHandshakeCount}
              total={approvedChunkCount}
            />
            <KnownDeliveryProgressChart language={language} progressPercent={knownProgressPercent} stages={progressStages} />
          </div>

          <BlockerDistributionChart items={blockerChartItems} language={language} />

          <DecisionPromptLog entries={decisionPromptLogEntries} helpPattern={decisionLogHelp} language={language} />
        </div>

        <details className="rounded-2xl border border-border/70 bg-background shadow-sm">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{t(language, "Technical audit details", "Tekniska auditdetaljer")}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t(
                  language,
                  "Open this when you need the full audit trail behind the recommendation.",
                  "Öppna detta när du behöver hela spårbarheten bakom rekommendationen."
                )}
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-border/70 bg-muted/10 px-3 py-1 text-xs font-semibold text-muted-foreground">
              {t(language, "Snapshot, evidence, review and report", "Snapshot, evidens, review och rapport")}
            </span>
          </summary>
          <div className="space-y-6 border-t border-border/70 p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ActionSummaryCard
            className={data.requestedAiLevel === data.achievedAiLevel ? "border-emerald-200 bg-emerald-50/80 shadow-sm" : "border-amber-200 bg-amber-50/80 shadow-sm"}
            description={t(language, "Requested by active project evidence.", "Begärd av aktivt projektunderlag.")}
            label={t(language, "Requested AI level", "Begärd AI-nivå")}
            value={formatLabel(data.requestedAiLevel)}
          />
          <ActionSummaryCard
            className={data.requestedAiLevel === data.achievedAiLevel ? "border-emerald-200 bg-emerald-50/80 shadow-sm" : "border-rose-200 bg-rose-50/80 shadow-sm"}
            description={t(language, "Calculated from visible evidence.", "Beräknad från synlig evidens.")}
            label={t(language, "Achieved AI level", "Uppnådd AI-nivå")}
            value={formatLabel(data.achievedAiLevel)}
          />
          <ActionSummaryCard
            actionHref="#human-review"
            actionLabel={t(language, "Open review items", "Öppna review")}
            className={blockingItems.length > 0 ? "border-rose-200 bg-rose-50/80 shadow-sm" : "border-emerald-200 bg-emerald-50/80 shadow-sm"}
            description={t(language, "Blocking control decisions.", "Blockerande kontrollbeslut.")}
            label={t(language, "Human Review blockers", "Human Review-blockerare")}
            value={blockingItems.length}
          />
          <ActionSummaryCard
            actionHref="#artifacts"
            actionLabel={t(language, "Open artifacts", "Öppna artefakter")}
            className={untracedArtifacts.length > 0 ? "border-amber-200 bg-amber-50/80 shadow-sm" : "border-sky-200 bg-sky-50/80 shadow-sm"}
            description={t(language, "Files lacking Story-ID lineage.", "Filer utan Story-ID-spårbarhet.")}
            label={t(language, "Untraced artifacts", "Ospårade artefakter")}
            value={untracedArtifacts.length}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {data.metrics.map((metric) => (
            <ActionSummaryCard
              className={getMetricClasses(metric.status)}
              description={metric.description}
              key={metric.id}
              label={metric.label}
              value={`${metric.percentage}%`}
            />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                <FileSearch className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t(language, "Snapshot and manifest", "Snapshot och manifest")}</CardTitle>
                  <CardDescription>
                    {t(language, "Current source summary from existing project records and imported artifacts.", "Aktuell källsammanfattning från projektposter och importerade artefakter.")}
                  </CardDescription>
                </div>
                </div>
                <form action={refreshControlMirrorSnapshotAction}>
                  <Button className="gap-2" type="submit" variant="secondary">
                    <RotateCw className="h-4 w-4" />
                    {t(language, "Refresh snapshot", "Uppdatera snapshot")}
                  </Button>
                </form>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusMessage ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    statusType === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"
                  }`}
                >
                  {statusMessage}
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Source", data.snapshot.sourceType],
                ["Scan time", formatDate(data.snapshot.scanTime)],
                ["Sessions", String(data.snapshot.sessionCount)],
                ["Files", String(data.snapshot.fileCount)],
                ["Candidates", String(data.snapshot.candidateCount)],
                ["Unchanged", String(data.snapshot.unchangedCount)],
                ["New", String(data.snapshot.newCount)],
                ["Modified", String(data.snapshot.modifiedCount)],
                ["Deleted", String(data.snapshot.deletedCount)],
                ["Unreadable", String(data.snapshot.unreadableCount)],
                ["Rejected", String(data.snapshot.rejectedCount)],
                ["Snapshot", data.snapshot.label]
              ].map(([label, value]) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
              </div>
              {data.uploadSummary.isUploadedSnapshot ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">Uploaded snapshot result</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ["Accepted", data.uploadSummary.acceptedCount],
                      ["Rejected", data.uploadSummary.rejectedCount],
                      ["Unreadable", data.uploadSummary.unreadableCount],
                      ["Unchanged", data.uploadSummary.unchangedCount],
                      ["New", data.uploadSummary.newCount],
                      ["Modified", data.uploadSummary.modifiedCount],
                      ["Deleted", data.uploadSummary.deletedCount]
                    ].map(([label, value]) => (
                      <div className="rounded-xl border border-sky-200 bg-white/70 p-3" key={label}>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-800">{label}</p>
                        <p className="mt-1 text-lg font-semibold text-sky-950">{value}</p>
                      </div>
                    ))}
                  </div>
                  {data.uploadSummary.rejectedFiles.length > 0 || data.uploadSummary.unreadableFiles.length > 0 ? (
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      {data.uploadSummary.rejectedFiles.length > 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
                          <p className="font-medium">Rejected files</p>
                          <div className="mt-2 space-y-1 text-xs leading-5">
                            {data.uploadSummary.rejectedFiles.slice(0, 5).map((file) => (
                              <p key={`${file.originalPath}-${file.reason}`}>{file.normalizedPath ?? file.originalPath}: {formatLabel(file.reason)}</p>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {data.uploadSummary.unreadableFiles.length > 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
                          <p className="font-medium">Unreadable files</p>
                          <div className="mt-2 space-y-1 text-xs leading-5">
                            {data.uploadSummary.unreadableFiles.slice(0, 5).map((file) => (
                              <p key={file.filePath}>{file.filePath}: unreadable</p>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="mt-3 text-xs leading-5">{data.report.evidenceRetentionSummary}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Source modes", "Källor")}</CardTitle>
              <CardDescription>{t(language, "Manual upload is active; richer refresh sources are planned controls.", "Manuell upload är aktiv; rikare refresh-källor är planerade kontroller.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-sm text-foreground">
                {data.sourcePolicy.summary}
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-950">
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Evidence retention</p>
                <p className="mt-1">{formatLabel(data.sourcePolicy.retentionDefault)} by default until a source-specific policy says otherwise.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-950">
                Uploaded snapshots are explicit user-provided evidence. Folder and repository sources stay non-actionable until a real connector or browser-authorized selection exists.
              </div>
              {data.sourcePolicy.modes.map((mode) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 px-3 py-3 text-sm" key={mode.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{mode.label}</p>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${mode.supportStatus === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : mode.supportStatus === "planned" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                      {formatLabel(mode.supportStatus)}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-muted-foreground">
                    <p>Refresh: {mode.refreshSupported ? "supported" : "not supported"}</p>
                    <p>Retention: {formatLabel(mode.retentionMode)}</p>
                    <p>{mode.constraints[0]}</p>
                  </div>
                  {mode.actionHref && mode.supportStatus === "active" ? (
                    <Button asChild className="mt-3" size="sm" variant="secondary">
                      <Link href={mode.actionHref}>{t(language, "Open source action", "Öppna källåtgärd")}</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
              {showUploadedSnapshotPanel ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">Uploaded snapshot preparation</p>
                  <p className="mt-2 leading-6">
                    Uploads must be explicitly selected by the user. Control Mirror will not scan local folders or repositories.
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-emerald-200 bg-white/70 p-3">
                      <p className="font-medium">Allowed files</p>
                      <p className="mt-1 text-xs leading-5">Markdown, text, JSON, CSV, YAML, logs and common source/test files.</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-white/70 p-3">
                      <p className="font-medium">Safety limits</p>
                      <p className="mt-1 text-xs leading-5">Unsafe paths, absolute paths, unsupported files and unreadable content are rejected or isolated.</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-white/70 p-3">
                      <p className="font-medium">Retention</p>
                      <p className="mt-1 text-xs leading-5">Source excerpts are redacted before storage; metadata-only modes omit source text.</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
                    Submission uses the Control Mirror uploaded snapshot adapter. Files are validated again on the server before any evidence is stored.
                  </div>
                  <form action={submitControlMirrorUploadedSnapshotAction} className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em]" htmlFor="control-mirror-upload-label">
                        Snapshot label
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-foreground"
                        id="control-mirror-upload-label"
                        name="label"
                        placeholder="Uploaded project snapshot"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em]" htmlFor="control-mirror-upload-files">
                        Snapshot files
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-emerald-950"
                        id="control-mirror-upload-files"
                        multiple
                        name="files"
                        type="file"
                      />
                    </div>
                    <Button type="submit" size="sm">
                      Submit uploaded snapshot
                    </Button>
                  </form>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Design progress", "Designprogress")}</CardTitle>
              <CardDescription>{t(language, "Story Ideas moving toward build-ready Delivery Stories.", "Story Ideas på väg mot byggklara Delivery Stories.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(data.designProgress).map(([key, value]) => (
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-3" key={key}>
                  <span className="text-sm text-muted-foreground">{formatLabel(key)}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Build conformance", "Byggkonformitet")}</CardTitle>
              <CardDescription>{t(language, "Whether implementation evidence is right-built and traced.", "Om implementationsevidens är rätt byggd och spårad.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(data.buildConformance).map(([key, value]) => (
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-3" key={key}>
                  <span className="text-sm text-muted-foreground">{formatLabel(key)}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Test evidence", "Testevidens")}</CardTitle>
              <CardDescription>{t(language, "Verification mapped back to stories and artifacts.", "Verifiering spårad tillbaka till stories och artefakter.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testEvidenceSummaryItems.map(([key, value]) => (
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-3" key={key}>
                  <span className="text-sm text-muted-foreground">{formatLabel(key)}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm" id="value-spine-coverage">
          <CardHeader>
            <CardTitle>{t(language, "Value Spine test coverage", "Value Spine-testtÃ¤ckning")}</CardTitle>
            <CardDescription>{t(language, "Test evidence mapped to Outcome, Epic and Story coverage.", "Testevidens mappad till Outcome, Epic och Story-tÃ¤ckning.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Story</th>
                    <th className="px-3 py-2">Coverage</th>
                    <th className="px-3 py-2">Evidence</th>
                    <th className="px-3 py-2">Passing</th>
                    <th className="px-3 py-2">Failing</th>
                    <th className="px-3 py-2">Missing links</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleValueSpineCoverage.map((item) => (
                    <tr className="border-t border-border/70" key={item.id}>
                      <td className="max-w-[260px] truncate px-3 py-3 font-medium">{item.storyKey} - {item.storyTitle}</td>
                      <td className="px-3 py-3">{formatLabel(item.coverageState)}</td>
                      <td className="px-3 py-3">{item.testEvidenceCount}</td>
                      <td className="px-3 py-3">{item.passingEvidenceCount}</td>
                      <td className="px-3 py-3">{item.failingEvidenceCount}</td>
                      <td className="px-3 py-3">{item.missingLinks.length > 0 ? item.missingLinks.join(", ") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visibleMappedTestEvidence.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Test evidence</th>
                      <th className="px-3 py-2">Story-ID</th>
                      <th className="px-3 py-2">Epic</th>
                      <th className="px-3 py-2">Outcome</th>
                      <th className="px-3 py-2">Level</th>
                      <th className="px-3 py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMappedTestEvidence.map((item) => (
                      <tr className="border-t border-border/70" key={item.id}>
                        <td className="max-w-[260px] truncate px-3 py-3 font-medium">{item.fileName}</td>
                        <td className="px-3 py-3">{item.storyId ?? "-"}</td>
                        <td className="px-3 py-3">{item.epicId ?? "-"}</td>
                        <td className="px-3 py-3">{item.outcomeId ?? "-"}</td>
                        <td className="px-3 py-3">{formatLabel(item.testLevel)}</td>
                        <td className="px-3 py-3">{item.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {visibleUntracedImplementationArtifacts.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                <p className="font-medium">{t(language, "Untraced implementation artifacts outside the Value Spine", "OspÃ¥rade implementationsartefakter utanfÃ¶r Value Spine")}</p>
                <p className="mt-2">{visibleUntracedImplementationArtifacts.map((artifact) => artifact.fileName).join(", ")}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="normalization">
          <CardHeader>
            <CardTitle>{t(language, "AAS normalization", "AAS-normalisering")}</CardTitle>
            <CardDescription>{t(language, "Normalized evidence keeps lineage to the original snapshot and source artifact.", "Normaliserad evidens behÃ¥ller lineage till ursprunglig snapshot och kÃ¤llartefakt.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Evidence items", String(data.normalization.evidenceCount)],
                ["Story-like items", String(data.normalization.storyLikeItems)],
                ["Delivery story candidates", String(data.normalization.candidateDeliveryStories)],
                ["Story ideas", String(data.normalization.storyIdeas)],
                ["Exploration stories", String(data.normalization.explorationStories)],
                ["Out of scope", String(data.normalization.outOfScopeItems)],
                ["Ready for build", String(data.normalization.readyForBuild)],
                ["Needs refinement", String(data.normalization.needsRefinement)]
              ].map(([label, value]) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
            {visibleNormalizedEvidence.length === 0 ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                {t(language, "No normalized evidence exists for the current snapshot yet.", "Ingen normaliserad evidens finns fÃ¶r aktuell snapshot Ã¤nnu.")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Evidence</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Story class</th>
                      <th className="px-3 py-2">Readiness</th>
                      <th className="px-3 py-2">Retention</th>
                      <th className="px-3 py-2">Missing fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleNormalizedEvidence.map((evidence) => (
                      <tr className="border-t border-border/70" key={evidence.id}>
                        <td className="max-w-[260px] truncate px-3 py-3 font-medium">{evidence.fileName}</td>
                        <td className="px-3 py-3">{formatLabel(evidence.evidenceType)}</td>
                        <td className="px-3 py-3">{formatLabel(evidence.storyClassification)}</td>
                        <td className="px-3 py-3">{formatLabel(evidence.readinessState)}</td>
                        <td className="max-w-[260px] px-3 py-3 text-muted-foreground">
                          {evidence.retentionDisclosure ?? formatLabel(evidence.retentionMode ?? data.sourcePolicy.retentionDefault)}
                        </td>
                        <td className="px-3 py-3">{evidence.missingReadinessFields.length > 0 ? evidence.missingReadinessFields.join(", ") : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="conformance">
          <CardHeader>
            <CardTitle>{t(language, "Framing cross-reference", "Framing-korsreferens")}</CardTitle>
            <CardDescription>{t(language, "Design and build evidence checked against approved Framing, Value Spine and AI-level evidence.", "Design- och byggelegens kontrolleras mot godkÃ¤nd Framing, Value Spine och AI-nivÃ¥evidens.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["Aligned design", String(data.conformance.framingAligned)],
                ["Weak alignment", String(data.conformance.weakValueAlignment)],
                ["Scope drift", String(data.conformance.scopeDrift)],
                ["Out of scope", String(data.conformance.outOfScope)],
                ["Right built", String(data.conformance.rightBuilt)],
                ["Weakly traced build", String(data.conformance.weaklyTracedBuild)],
                ["Untraced build", String(data.conformance.untracedBuildArtifacts)],
                ["Release risk", String(data.conformance.releaseRisk)],
                ["AI recommendation", formatLabel(data.conformance.aiLevelRecommendation)]
              ].map(([label, value]) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
            {visibleConformanceFindings.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                {t(language, "No Control Mirror conformance findings are visible in the current evidence.", "Inga Control Mirror-konformitetsfynd syns i nuvarande evidens.")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Finding</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Severity</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleConformanceFindings.map((finding) => (
                      <tr className="border-t border-border/70" key={finding.id}>
                        <td className="max-w-[240px] truncate px-3 py-3 font-medium">{finding.label}</td>
                        <td className="px-3 py-3">{formatLabel(finding.category)}</td>
                        <td className="px-3 py-3">{formatLabel(finding.status)}</td>
                        <td className="px-3 py-3">{finding.severity}</td>
                        <td className="max-w-[320px] px-3 py-3 text-muted-foreground">{finding.recommendedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="guardrails">
          <CardHeader>
            <CardTitle>{t(language, "Commercial guardrails", "Kommersiella guardrails")}</CardTitle>
            <CardDescription>{t(language, "Level 2 and Level 3 claims are blocked when mandate, evidence or governance prerequisites are missing.", "Level 2- och Level 3-anspråk blockeras när mandat, evidens eller styrningsförutsättningar saknas.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Checked", String(data.guardrails.checked)],
                ["Passed", String(data.guardrails.passed)],
                ["Flagged", String(data.guardrails.flagged)]
              ].map(([label, value]) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
            {visibleGuardrailFindings.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                {t(language, "No missing commercial guardrails are visible for the requested AI level.", "Inga saknade kommersiella guardrails syns för begärd AI-nivå.")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Guardrail</th>
                      <th className="px-3 py-2">Required</th>
                      <th className="px-3 py-2">Severity</th>
                      <th className="px-3 py-2">Affected</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleGuardrailFindings.map((finding) => (
                      <tr className="border-t border-border/70" key={finding.id}>
                        <td className="px-3 py-3 font-medium">{finding.label}</td>
                        <td className="px-3 py-3">{formatLabel(finding.requiredFor)}</td>
                        <td className="px-3 py-3">{finding.severity}</td>
                        <td className="max-w-[240px] truncate px-3 py-3">{finding.affectedObject}</td>
                        <td className="max-w-[360px] px-3 py-3 text-muted-foreground">{finding.recommendedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="ai-level-evidence">
          <CardHeader>
            <div className="flex items-start gap-3">
              <GitBranch className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t(language, "AI level evidence", "AI-nivåevidens")}</CardTitle>
                <CardDescription>{t(language, "Missing required evidence lowers the achieved level.", "Saknad obligatorisk evidens sänker uppnådd nivå.")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {data.aiEvidence.map((item) => (
              <div
                className={`rounded-2xl border px-4 py-4 ${item.present ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}
                key={item.id}
              >
                <div className="flex items-start gap-3">
                  {item.present ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertTriangle className="mt-0.5 h-4 w-4" />}
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] opacity-75">Required for {formatLabel(item.requiredFor)}</p>
                    <p className="mt-2 text-sm leading-6">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="artifacts">
          <CardHeader>
            <CardTitle>{t(language, "Artifact manifest", "Artefaktmanifest")}</CardTitle>
            <CardDescription>{t(language, "First Control Mirror manifest from imported project artifacts.", "Första Control Mirror-manifestet från importerade projektartefakter.")}</CardDescription>
          </CardHeader>
          <CardContent>
            {visibleArtifacts.length === 0 ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                {t(language, "No imported artifacts yet. Use Import to add BMAD/AAS source files.", "Inga importerade artefakter ännu. Använd Import för att lägga till BMAD/AAS-källfiler.")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">File</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Change</th>
                      <th className="px-3 py-2">Lineage</th>
                      <th className="px-3 py-2">Story-ID</th>
                      <th className="px-3 py-2">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleArtifacts.map((artifact) => (
                      <tr className="border-t border-border/70" key={artifact.id}>
                        <td className="max-w-[260px] truncate px-3 py-3 font-medium">{artifact.fileName}</td>
                        <td className="px-3 py-3">{getArtifactTypeLabel(artifact.artifactType)}</td>
                        <td className="px-3 py-3">{artifact.changeStatus ? formatLabel(artifact.changeStatus) : "-"}</td>
                        <td className="px-3 py-3">{formatLabel(artifact.lineageStatus)}</td>
                        <td className="px-3 py-3">{artifact.storyId ?? "-"}</td>
                        <td className="px-3 py-3">{artifact.parsingConfidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="human-review">
          <CardHeader>
            <CardTitle>{t(language, "Human Review items", "Human Review-poster")}</CardTitle>
            <CardDescription>{t(language, "Generated from conformance gaps. These are recommendations, not automatic approvals.", "Skapade från konformitetsgap. Detta är rekommendationer, inte automatiska godkännanden.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {reviewStateCounts.map(([state, count]) => (
                <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-3" key={state}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{formatLabel(state)}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{count}</p>
                </div>
              ))}
            </div>
            {data.reviewStateSummary.items.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border/70">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">State</th>
                      <th className="px-3 py-2">Finding</th>
                      <th className="px-3 py-2">Affected</th>
                      <th className="px-3 py-2">Outcome/Epic/Story</th>
                      <th className="px-3 py-2">Latest decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reviewStateSummary.items.slice(0, 6).map((item) => (
                      <tr className="border-t border-border/70" key={item.persistedReviewItemId ?? item.id}>
                        <td className="px-3 py-3">{formatLabel(item.state)}</td>
                        <td className="px-3 py-3 font-medium">{item.category}</td>
                        <td className="px-3 py-3">{item.affectedObject}</td>
                        <td className="px-3 py-3">{[item.affectedOutcomeId, item.affectedEpicId, item.affectedStoryId].filter(Boolean).join(" / ") || "-"}</td>
                        <td className="px-3 py-3">{item.latestDecisionType ? getHumanDecisionLabel(item.latestDecisionType) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {data.humanReviewItems.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                {t(language, "No Control Mirror review blockers are visible in the current evidence.", "Inga Control Mirror-reviewblockerare syns i nuvarande evidens.")}
              </div>
            ) : (
              data.humanReviewItems.map((item) => (
                <div className={`rounded-2xl border px-4 py-4 ${item.severity === "high" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-amber-200 bg-amber-50 text-amber-900"}`} id={`review-item-${item.id}`} key={item.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">{item.category}</p>
                      <p className="mt-2 font-medium">{item.decisionNeeded}</p>
                      <p className="mt-2 text-sm leading-6">{item.rationale}</p>
                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border border-current/15 bg-background/70 px-3 py-3 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">{t(language, "Where this came from", "Var detta kommer fran")}</p>
                          <p className="mt-2 leading-6">{getHumanReviewSource(item)}</p>
                        </div>
                        <div className="rounded-xl border border-current/15 bg-background/70 px-3 py-3 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">{t(language, "What to do now", "Vad du gor nu")}</p>
                          <p className="mt-2 leading-6">
                            {item.sourceFindingId === "guardrail-governance-funding"
                              ? t(language, "Attach a funding, Margin Gate or commercial governance file, then refresh Control Mirror. If this project has no such gate, record a controlled exception here.", "Ladda upp en funding-, Margin Gate- eller commercial governance-fil och uppdatera Control Mirror. Om projektet saknar sadan gate, registrera ett kontrollerat undantag har.")
                              : item.sourceFindingId === "guardrail-test-evidence"
                                ? t(language, "Import mapped test evidence or a BMAD comparison matrix with test_ids and verification_result, then refresh Control Mirror.", "Importera mappad testevidens eller en BMAD comparison matrix med test_ids och verification_result och uppdatera Control Mirror.")
                                : t(language, "Use the recommendation and alternatives below to either add evidence or record a human decision.", "Anvand rekommendationen och alternativen nedan for att antingen lagga till evidens eller registrera ett manskligt beslut.")}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm">Affected: {item.affectedObject}</p>
                      <p className="mt-2 text-sm">Value: {item.valueRationale}</p>
                      <p className="mt-2 text-sm">Risk if approved: {item.riskIfApproved}</p>
                      <p className="mt-2 text-sm">Risk if not approved: {item.riskIfNotApproved}</p>
                      <p className="mt-2 text-sm">Alternatives: {item.alternatives.join(", ")}</p>
                      <p className="mt-2 text-sm">Queue state: {item.reviewState ? formatLabel(item.reviewState) : "generated"}</p>
                      {item.latestHumanDecision ? (
                        <div className="mt-3 rounded-xl border border-current/15 bg-background/70 px-3 py-3 text-sm">
                          <p className="font-medium">Latest human decision: {getHumanDecisionLabel(item.latestHumanDecision.decisionType)}</p>
                          <p className="mt-1 leading-6">{item.latestHumanDecision.rationale}</p>
                          <p className="mt-1 opacity-75">Recorded {item.latestHumanDecision.createdAt}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className="inline-flex w-fit items-center rounded-full border border-current/20 px-3 py-1 text-xs font-semibold">
                        Recommendation: {item.recommendedOption}
                      </span>
                      <Button asChild size="sm" variant="secondary">
                        <Link href={getHumanReviewNextAction(item).nextActionHref}>{getHumanReviewNextAction(item).nextActionLabel}</Link>
                      </Button>
                      {item.persistedReviewItemId && item.reviewState !== "decided" && item.reviewState !== "deferred" ? (
                        <form action={recordControlMirrorHumanReviewDecisionAction} className="mt-2 grid w-full min-w-[260px] gap-2 rounded-xl border border-current/15 bg-background/70 p-3 text-sm md:w-[300px]">
                          <input name="reviewItemId" type="hidden" value={item.persistedReviewItemId} />
                          <label className="grid gap-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">Human decision</span>
                            <select className="rounded-lg border border-current/20 bg-background px-3 py-2 text-foreground" name="decisionType" required>
                              <option value="approve_with_controls">Approve with controls</option>
                              <option value="downgrade">Downgrade</option>
                              <option value="defer">Defer</option>
                              <option value="request_exception">Request exception</option>
                              <option value="request_rework">Request rework</option>
                              <option value="reject">Reject</option>
                            </select>
                          </label>
                          <label className="grid gap-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">Rationale</span>
                            <textarea className="min-h-20 rounded-lg border border-current/20 bg-background px-3 py-2 text-foreground" name="rationale" required />
                          </label>
                          <Button size="sm" type="submit">
                            Record human decision
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="control-report-preview">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>{t(language, "Control report preview", "Control report-preview")}</CardTitle>
                <CardDescription>{data.report.executionStatement}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="w-fit gap-2">
                  <Link href="/control-mirror/customer-report">
                    <Download className="h-4 w-4" />
                    {t(language, "Download customer PDF", "Ladda ner kund-PDF")}
                  </Link>
                </Button>
                <Button asChild className="w-fit gap-2" variant="secondary">
                  <Link href="/control-mirror/export">
                    <Download className="h-4 w-4" />
                    {t(language, "Download evidence pack", "Ladda ner evidenspaket")}
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Active project", data.report.activeProject],
                ["Framing version", data.report.approvedFramingVersion],
                ["Snapshot id", data.report.snapshotId],
                ["Release readiness", formatLabel(data.report.releaseReadiness)],
                ["Open Human Review", String(data.report.openHumanReviewItems)],
                ["Blocking decisions", String(data.report.blockingHumanReviewItems)],
                ["Scope drift", String(data.report.scopeDriftItems)],
                ["Untraced artifacts", String(data.report.untracedArtifacts)]
              ].map(([label, value]) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="mt-2 break-words text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI Risk Ledger</p>
                <p className="mt-2 text-sm leading-6">{data.report.aiRiskLedgerSummary}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Decision Log</p>
                <p className="mt-2 text-sm leading-6">{data.report.decisionLogSummary}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-950">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Source evidence retention</p>
              <p className="mt-2 leading-6">{data.report.evidenceRetentionSummary}</p>
              <p className="mt-2 leading-6">{t(language, "Evidence pack export includes summaries, findings and review state; raw source text is not included.", "Evidenspaketet innehåller sammanfattningar, fynd och review-status; rå källtext inkluderas inte.")}</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Evidence pack includes", "Evidenspaketet innehåller")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    t(language, "Snapshot metadata", "Snapshotmetadata"),
                    t(language, "Report summary", "Rapportsammanfattning"),
                    t(language, "Evidence summaries", "Evidenssammanfattningar"),
                    t(language, "Conformance findings", "Konformitetsfynd"),
                    t(language, "Guardrail findings", "Guardrail-fynd"),
                    t(language, "Human Review state", "Human Review-status")
                  ].map((item) => (
                    <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-foreground" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Review state in export", "Review-status i export")}</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{data.report.openHumanReviewItems} open</p>
                <p className="mt-1 text-sm text-muted-foreground">{data.report.blockingHumanReviewItems} blocking decision{data.report.blockingHumanReviewItems === 1 ? "" : "s"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">{t(language, "Product/Security acceptance", "Product/Security-acceptance")}</p>
                  <p className="mt-2 text-sm leading-6">{exportAcceptancePolicy.disclosure}</p>
                </div>
                <span className="w-fit rounded-full border border-amber-300 bg-white/70 px-3 py-1 text-xs font-semibold">
                  {formatLabel(exportAcceptancePolicy.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-xl border border-amber-200 bg-white/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{t(language, "Required reviewers", "Obligatoriska granskare")}</p>
                  <p className="mt-2 text-sm font-medium">{exportAcceptancePolicy.requiredReviewers.join(", ")}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{t(language, "Acceptance checklist", "Acceptance-checklista")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {exportAcceptancePolicy.checklist.map((item) => (
                      <span className="rounded-full border border-amber-200 bg-background px-3 py-1 text-xs font-medium text-foreground" key={item.id}>
                        {item.label}: {formatLabel(item.status)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Recent evidence pack exports", "Senaste evidenspaket-exporter")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(language, "Successful downloads are recorded here as audit history.", "Lyckade nedladdningar sparas hÃ¤r som audithistorik.")}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-foreground">
                  {exportHistory.length} {t(language, "recorded", "sparade")}
                </span>
              </div>
              {exportHistory.length === 0 ? (
                <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                  {t(language, "No evidence pack exports have been recorded yet.", "Inga evidenspaket-exporter har sparats Ã¤nnu.")}
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Generated</th>
                        <th className="px-3 py-2">Format</th>
                        <th className="px-3 py-2">Filename</th>
                        <th className="px-3 py-2">Snapshot</th>
                        <th className="px-3 py-2">Retention</th>
                        <th className="px-3 py-2">Acceptance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportHistory.map((record) => (
                        <tr className="border-t border-border/70" key={record.id}>
                          <td className="px-3 py-3">{formatDate(record.generatedAt)}</td>
                          <td className="px-3 py-3">{formatLabel(record.format)}</td>
                          <td className="max-w-[320px] truncate px-3 py-3 font-medium">
                            <Link className="text-primary underline-offset-4 hover:underline" href={`/control-mirror/export/${record.id}`}>
                              {record.fileName}
                            </Link>
                          </td>
                          <td className="px-3 py-3">{record.snapshotId ?? "-"}</td>
                          <td className="min-w-[190px] px-3 py-3">
                            <div className={`${record.retention?.state === "archived" ? "border-slate-300 bg-slate-100 text-slate-900" : "border-sky-200 bg-sky-50 text-sky-900"} rounded-xl border px-3 py-2`}>
                              <p className="text-sm font-medium">{formatLabel(record.retention?.state ?? "active")}</p>
                              <p className="mt-1 text-xs">{formatLabel(record.retention?.policyLabel ?? "governance_audit_artifact")}</p>
                              {record.retention?.state === "archived" ? (
                                <div className="mt-2 grid gap-1 text-xs">
                                  <p>Archived by {record.retention.archivedByDisplayName ?? record.retention.archivedBy ?? "unknown"}</p>
                                  <p>{formatOptionalDate(record.retention.archivedAt)}</p>
                                  <p>{record.retention.archiveReason ?? "No archive reason recorded."}</p>
                                </div>
                              ) : (
                                <form action={archiveControlMirrorEvidencePackExportAction} className="mt-2 grid gap-2">
                                  <input name="exportId" type="hidden" value={record.id} />
                                  <textarea className="min-h-14 rounded-lg border border-border bg-background px-2 py-2 text-xs text-foreground" name="archiveReason" placeholder="Archive reason" required />
                                  <Button size="sm" type="submit" variant="secondary">
                                    Archive export
                                  </Button>
                                </form>
                              )}
                              {record.retention?.reviewDueAt ? (
                                <p className={`mt-2 text-xs font-medium ${isRetentionReviewOverdue(record.retention.reviewDueAt, record.retention.reviewedAt) ? "text-amber-800" : ""}`}>
                                  {isRetentionReviewOverdue(record.retention.reviewDueAt, record.retention.reviewedAt) ? "Review overdue" : "Review due"}: {formatOptionalDate(record.retention.reviewDueAt)}
                                </p>
                              ) : null}
                              {record.retention?.reviewedAt ? (
                                <p className="mt-1 text-xs">Reviewed: {formatOptionalDate(record.retention.reviewedAt)}</p>
                              ) : null}
                              {record.latestDownloadEvent ? (
                                <p className="mt-2 text-xs">
                                  Last downloaded by {record.latestDownloadEvent.actorDisplayName ?? record.latestDownloadEvent.actorId} at {formatOptionalDate(record.latestDownloadEvent.createdAt)}
                                </p>
                              ) : (
                                <p className="mt-2 text-xs">No re-downloads recorded.</p>
                              )}
                            </div>
                          </td>
                          <td className="min-w-[280px] px-3 py-3">
                            <div className="grid gap-2">
                              <div className={`rounded-xl border px-3 py-2 ${getAcceptanceReadinessClasses(record.acceptanceSummary?.shareReadiness ?? "acceptance_pending")}`}>
                                <p className="text-sm font-medium">{getAcceptanceReadinessLabel(record.acceptanceSummary?.shareReadiness ?? "acceptance_pending")}</p>
                                {record.acceptanceSummary?.shareReadiness === "share_ready" ? (
                                  <p className="mt-1 text-xs">All required acceptance roles recorded for governance sharing.</p>
                                ) : record.acceptanceSummary?.shareReadiness === "changes_requested" ? (
                                  <p className="mt-1 text-xs">Resolve requested changes before broad sharing.</p>
                                ) : (
                                  <p className="mt-1 text-xs">Product/Security review required before broad sharing.</p>
                                )}
                                <div className="mt-2 grid gap-1 text-xs">
                                  {record.acceptanceSummary && record.acceptanceSummary.acceptedRoles.length > 0 ? (
                                    <p>Accepted roles: {formatRoleList(record.acceptanceSummary.acceptedRoles)}</p>
                                  ) : null}
                                  {record.acceptanceSummary && record.acceptanceSummary.missingRoles.length > 0 ? (
                                    <p>Missing roles: {formatRoleList(record.acceptanceSummary.missingRoles)}</p>
                                  ) : null}
                                  {record.acceptanceSummary && record.acceptanceSummary.blockingRoles.length > 0 ? (
                                    <p>Blocking roles: {formatRoleList(record.acceptanceSummary.blockingRoles)}</p>
                                  ) : null}
                                  {record.latestAcceptanceDecision ? (
                                    <p>
                                      Latest decision: {formatLabel(record.latestAcceptanceDecision.decisionType)} by {formatLabel(record.latestAcceptanceDecision.reviewerRole)} ({record.latestAcceptanceDecision.actorId})
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              {(record.acceptanceSummary?.shareReadiness ?? "acceptance_pending") !== "share_ready" ? (
                                <form action={recordControlMirrorEvidencePackExportAcceptanceAction} className="grid gap-2 rounded-xl border border-border/70 bg-background/80 p-3">
                                  <input name="exportId" type="hidden" value={record.id} />
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <select className="rounded-lg border border-border bg-background px-2 py-2 text-xs" name="reviewerRole" required>
                                      <option value="product_owner">Product owner</option>
                                      <option value="security_privacy">Security/privacy</option>
                                      <option value="aqa">AQA</option>
                                    </select>
                                    <select className="rounded-lg border border-border bg-background px-2 py-2 text-xs" name="decisionType" required>
                                      <option value="accepted">Accepted</option>
                                      <option value="accepted_with_conditions">Accepted with conditions</option>
                                      <option value="changes_requested">Changes requested</option>
                                      <option value="revoked">Revoked</option>
                                    </select>
                                  </div>
                                  <textarea className="min-h-16 rounded-lg border border-border bg-background px-2 py-2 text-xs" name="rationale" placeholder="Acceptance rationale" required />
                                  <Button size="sm" type="submit" variant="secondary">
                                    Record acceptance
                                  </Button>
                                </form>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Evidence summary</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.report.evidenceSummaries.map((item) => (
                    <tr className="border-t border-border/70" key={item.id}>
                      <td className="px-3 py-3 font-medium">{item.label}</td>
                      <td className="px-3 py-3">{item.value}</td>
                      <td className="px-3 py-3">{formatLabel(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.report.blockingGaps.length > 0 ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
                <p className="font-medium">{t(language, "Blocking gaps", "Blockerande gap")}</p>
                <p className="mt-2">{data.report.blockingGaps.slice(0, 5).join(" | ")}</p>
              </div>
            ) : null}
            <Button asChild className="gap-2" variant="secondary">
              <Link href="/governance">
                {t(language, "Continue to Governance", "Fortsätt till styrning")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
          </div>
        </details>
      </section>
    </AppShell>
  );
}
