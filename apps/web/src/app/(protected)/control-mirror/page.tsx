import Link from "next/link";
import { cookies } from "next/headers";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSearch,
  Gauge,
  GitBranch,
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

function getPercentTone(value: number) {
  if (value >= 90) return { fill: "#dcfce7", stroke: "#86efac", text: "#052e2b" };
  if (value >= 50) return { fill: "#fef3c7", stroke: "#fcd34d", text: "#422006" };
  return { fill: "#ffe4e6", stroke: "#fda4af", text: "#4c0519" };
}

function getAiLevelNumber(level: string) {
  if (level === "level_3") return 3;
  if (level === "level_2") return 2;
  return 1;
}

function ControlFlowDiagram({
  language,
  humanReviewHref,
  reportHref
}: {
  language: AppLanguage;
  humanReviewHref: string;
  reportHref: string;
}) {
  const steps = [
    t(language, "Source", "Källa"),
    t(language, "Snapshot", "Snapshot"),
    t(language, "Evidence", "Evidens"),
    t(language, "Conformance", "Kontroll"),
    t(language, "Human Review", "Human Review"),
    t(language, "Report", "Rapport")
  ];

  return (
    <svg aria-label={t(language, "Control flow diagram", "Diagram över kontrollflöde")} className="block h-auto w-full max-w-full" role="img" viewBox="0 0 820 300">
      <defs>
        <marker id="control-flow-arrow" markerHeight="10" markerWidth="10" orient="auto" refX="9" refY="3">
          <path d="M0,0 L9,3 L0,6 Z" fill="#64748b" />
        </marker>
      </defs>
      <rect fill="#f8fafc" height="260" rx="24" stroke="#dbe4ef" width="780" x="20" y="20" />
      <path d="M94 114 C150 62 212 62 268 114 S382 166 438 114 S552 62 608 114 S700 158 730 130" fill="none" markerEnd="url(#control-flow-arrow)" stroke="#64748b" strokeDasharray="6 8" strokeWidth="3" />
      {steps.map((step, index) => {
        const x = 42 + index * 121;
        const y = index % 2 === 0 ? 78 : 150;
        const href = index < 3 ? "#normalization" : index === 3 ? "#conformance" : index === 4 ? humanReviewHref : reportHref;
        return (
          <a aria-label={t(language, `Open ${step} evidence`, `Öppna ${step}-underlag`)} className="cursor-pointer" href={href} key={step}>
            <title>{t(language, `Open ${step} evidence`, `Öppna ${step}-underlag`)}</title>
            <rect fill="#eff6ff" height="84" rx="18" stroke="#bfdbfe" width="124" x={x} y={y} />
            <text fill="#0369a1" fontSize="13" fontWeight="700" textAnchor="middle" x={x + 62} y={y + 28}>
              {String(index + 1).padStart(2, "0")}
            </text>
            <text fill="#082f49" fontSize="16" fontWeight="650" textAnchor="middle" x={x + 62} y={y + 56}>
              {step}
            </text>
          </a>
        );
      })}
      <text fill="#475569" fontSize="14" textAnchor="middle" x="410" y="262">
        {t(language, "Files become evidence, evidence becomes a control decision.", "Filer blir evidens, evidens blir ett kontrollbeslut.")}
      </text>
    </svg>
  );
}

function ValueSpineDiagram({
  language,
  outsideSpineHref,
  steps,
  untracedCount
}: {
  language: AppLanguage;
  outsideSpineHref: string;
  steps: Array<{ href: string; label: string; percentage: number }>;
  untracedCount: number;
}) {
  return (
    <svg aria-label={t(language, "Value Spine coverage diagram", "Diagram över Value Spine-täckning")} className="block h-auto w-full max-w-full" role="img" viewBox="0 0 820 320">
      <defs>
        <marker id="value-spine-arrow" markerHeight="10" markerWidth="10" orient="auto" refX="9" refY="3">
          <path d="M0,0 L9,3 L0,6 Z" fill="#475569" />
        </marker>
      </defs>
      <rect fill="#f8fafc" height="284" rx="24" stroke="#dbe4ef" width="780" x="20" y="18" />
      <path d="M140 136 H690" markerEnd="url(#value-spine-arrow)" stroke="#475569" strokeWidth="4" />
      {steps.map((step, index) => {
        const x = 56 + index * 185;
        const tone = getPercentTone(step.percentage);
        return (
          <a aria-label={t(language, `Open ${step.label} traceability evidence`, `Öppna ${step.label}-spårbarhet`)} className="cursor-pointer" href={step.href} key={step.label}>
            <title>{t(language, `Open ${step.label} traceability evidence`, `Öppna ${step.label}-spårbarhet`)}</title>
            <circle cx={x + 66} cy="136" fill="#ffffff" r="74" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx={x + 66} cy="136" fill={tone.fill} r="62" stroke={tone.stroke} strokeWidth="2.5" />
            <text fill={tone.text} fontSize="17" fontWeight="700" textAnchor="middle" x={x + 66} y="122">
              {step.label}
            </text>
            <text fill={tone.text} fontSize="31" fontWeight="800" textAnchor="middle" x={x + 66} y="158">
              {step.percentage}%
            </text>
          </a>
        );
      })}
      <path d="M620 204 C654 242 684 240 716 206" fill="none" stroke="#ea580c" strokeDasharray="6 8" strokeWidth="2.5" />
      <a aria-label={t(language, "Open untraced artifacts", "Öppna ospårade artefakter")} className="cursor-pointer" href={outsideSpineHref}>
        <title>{t(language, "Open untraced artifacts", "Öppna ospårade artefakter")}</title>
      <rect fill="#fff7ed" height="58" rx="16" stroke="#fdba74" width="160" x="630" y="222" />
      <text fill="#7c2d12" fontSize="13" fontWeight="750" textAnchor="middle" x="710" y="246">
        {t(language, "Outside spine", "Utanför spine")}
      </text>
      <text fill="#7c2d12" fontSize="16" fontWeight="700" textAnchor="middle" x="710" y="267">
        {untracedCount} {t(language, "untraced", "ospårade")}
      </text>
      </a>
      <text fill="#475569" fontSize="14" textAnchor="middle" x="410" y="300">
        {t(language, "A weak link means value traceability breaks before release.", "En svag länk betyder att värdespårningen bryts före release.")}
      </text>
    </svg>
  );
}

function AiLevelDiagram({
  achievedAiLevel,
  evidenceHref,
  language,
  missingCount,
  requestedAiLevel
}: {
  achievedAiLevel: string;
  evidenceHref: string;
  language: AppLanguage;
  missingCount: number;
  requestedAiLevel: string;
}) {
  const requested = getAiLevelNumber(requestedAiLevel);
  const achieved = getAiLevelNumber(achievedAiLevel);

  return (
    <svg aria-label={t(language, "AI level ladder diagram", "Diagram över AI-nivåtrappa")} className="block h-auto w-full max-w-full" role="img" viewBox="0 0 820 320">
      <rect fill="#f8fafc" height="284" rx="24" stroke="#dbe4ef" width="780" x="20" y="18" />
      <path d="M78 252 H520" stroke="#cbd5e1" strokeWidth="2" />
      {[1, 2, 3].map((level, index) => {
        const height = 56 + level * 42;
        const x = 94 + index * 155;
        const y = 252 - height;
        const isAchieved = level <= achieved;
        const isRequested = level === requested;
        return (
          <g key={level}>
            <rect fill={isAchieved ? "#dbeafe" : "#ffffff"} height={height} rx="18" stroke={isRequested ? "#2563eb" : "#cbd5e1"} strokeWidth={isRequested ? "4" : "2"} width="126" x={x} y={y} />
            <text fill="#0f172a" fontSize="19" fontWeight="800" textAnchor="middle" x={x + 63} y={y + 36}>
              Level {level}
            </text>
            <text fill="#475569" fontSize="13" fontWeight="650" textAnchor="middle" x={x + 63} y={y + 60}>
              {isRequested ? t(language, "requested", "begärd") : isAchieved ? t(language, "achieved", "uppnådd") : t(language, "missing", "saknas")}
            </text>
          </g>
        );
      })}
      <a aria-label={t(language, "Open missing AI evidence", "Öppna saknad AI-evidens")} className="cursor-pointer" href={evidenceHref}>
        <title>{t(language, "Open missing AI evidence", "Öppna saknad AI-evidens")}</title>
      <path d="M600 72 H764 V252 H600 Z" fill="#fffbeb" stroke="#fcd34d" strokeWidth="2.5" />
      <path d="M632 208 H732" stroke="#f59e0b" strokeLinecap="round" strokeWidth="6" />
      <text fill="#713f12" fontSize="13" fontWeight="800" letterSpacing="3" textAnchor="middle" x="682" y="110">
        MISSING
      </text>
      <text fill="#713f12" fontSize="54" fontWeight="850" textAnchor="middle" x="682" y="170">
        {missingCount}
      </text>
      <text fill="#713f12" fontSize="14" textAnchor="middle" x="682" y="196">
        {t(language, "evidence items", "evidenspunkter")}
      </text>
      </a>
    </svg>
  );
}

function DecisionMapDiagram({
  activeHref,
  language,
  releaseReadiness
}: {
  activeHref: string;
  language: AppLanguage;
  releaseReadiness: string;
}) {
  const items = [
    ["ready", t(language, "Ready", "Redo")],
    ["conditional", t(language, "Conditional", "Villkor")],
    ["human_approval_required", t(language, "Review", "Review")],
    ["downgrade_required", t(language, "Downgrade", "Sänk")],
    ["blocked", t(language, "Pause", "Pausa")]
  ];
  const activeIndex = Math.max(items.findIndex(([status]) => status === releaseReadiness), 0);

  return (
    <svg aria-label={t(language, "Release decision map", "Beslutskarta för release")} className="block h-auto w-full max-w-full" role="img" viewBox="0 0 820 320">
      <rect fill="#f8fafc" height="284" rx="24" stroke="#dbe4ef" width="780" x="20" y="18" />
      <path d="M100 150 H720" stroke="#cbd5e1" strokeWidth="10" />
      <path d={`M100 150 H${100 + activeIndex * 155}`} stroke="#2563eb" strokeLinecap="round" strokeWidth="10" />
      {items.map(([status, label], index) => {
        const cx = 100 + index * 155;
        const active = status === releaseReadiness;
        const node = (
          <g>
            <circle cx={cx} cy="150" fill={active ? "#2563eb" : "#ffffff"} r="51" stroke={active ? "#1d4ed8" : "#cbd5e1"} strokeWidth="3" />
            <text fill={active ? "#ffffff" : "#334155"} fontSize="15" fontWeight="800" textAnchor="middle" x={cx} y="156">
              {label}
            </text>
          </g>
        );

        return (
          active ? (
            <a aria-label={t(language, "Open current release recommendation", "Öppna nuvarande release-rekommendation")} className="cursor-pointer" href={activeHref} key={status}>
              <title>{t(language, "Open current release recommendation", "Öppna nuvarande release-rekommendation")}</title>
              {node}
            </a>
          ) : (
            <g key={status}>{node}</g>
          )
        );
      })}
      <text fill="#475569" fontSize="14" textAnchor="middle" x="410" y="250">
        {t(language, "The highlighted stop is the current recommendation.", "Den markerade stationen är nuvarande rekommendation.")}
      </text>
    </svg>
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
  const framingMetric = data.metrics.find((metric) => metric.id === "framing-alignment");
  const valueSpineMetric = data.metrics.find((metric) => metric.id === "value-spine-coverage");
  const buildMetric = data.metrics.find((metric) => metric.id === "build-conformance");
  const testMetric = data.metrics.find((metric) => metric.id === "test-evidence");
  const topBlockers = [
    ...data.report.blockingGaps,
    ...data.guardrails.findings.map((finding) => finding.recommendedAction),
    ...data.conformance.findings.filter((finding) => finding.severity === "high").map((finding) => finding.recommendedAction)
  ].slice(0, 3);
  const humanReviewHref = "#human-review";
  const reportPreviewHref = "#control-report-preview";
  const currentRecommendationHref = data.releaseReadiness === "ready" ? reportPreviewHref : humanReviewHref;
  const valueSpineSteps = [
    { href: "#normalization", label: "Outcome", percentage: framingMetric?.percentage ?? 0 },
    { href: "#value-spine-coverage", label: "Epic", percentage: valueSpineMetric?.percentage ?? 0 },
    { href: "#conformance", label: "Story", percentage: buildMetric?.percentage ?? 0 },
    { href: "#value-spine-coverage", label: "Test", percentage: testMetric?.percentage ?? 0 }
  ];
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
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.16),_transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            {t(language, "Delivery conformance", "Leveranskontroll")}
          </div>
          <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">Control Mirror</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
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
                <div className={`min-h-[148px] rounded-2xl border p-4 ${toneClass}`} key={item.label}>
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{item.label}</p>
                      <p className="mt-2 break-words text-2xl font-semibold leading-tight">{item.value}</p>
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
                  <Link href="#control-diagrams">
                    <GitBranch className="h-4 w-4" />
                    {t(language, "View diagrams", "Visa diagram")}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2" id="control-diagrams">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Control flow", "Kontrollflöde")}</CardTitle>
              <CardDescription>{t(language, "How source material becomes a reviewable Control Mirror report.", "Hur källmaterial blir en granskningsbar Control Mirror-rapport.")}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden px-4 pb-5">
              <ControlFlowDiagram humanReviewHref={humanReviewHref} language={language} reportHref={reportPreviewHref} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Value Spine flow", "Value Spine-flöde")}</CardTitle>
              <CardDescription>{t(language, "Outcome to test coverage at a glance.", "Outcome till testevidens i ett svep.")}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden px-4 pb-5">
              <ValueSpineDiagram language={language} outsideSpineHref="#artifacts" steps={valueSpineSteps} untracedCount={untracedArtifacts.length} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "AI level ladder", "AI-nivåtrappa")}</CardTitle>
              <CardDescription>{t(language, "Requested level compared with evidence-backed achieved level.", "Begärd nivå jämfört med evidensstödd uppnådd nivå.")}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden px-4 pb-5">
              <AiLevelDiagram
                achievedAiLevel={data.achievedAiLevel}
                evidenceHref="#ai-level-evidence"
                language={language}
                missingCount={missingAiEvidence.length}
                requestedAiLevel={data.requestedAiLevel}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t(language, "Decision map", "Beslutskarta")}</CardTitle>
              <CardDescription>{t(language, "Where the current release recommendation lands.", "Var nuvarande rekommendation landar.")}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden px-4 pb-5">
              <DecisionMapDiagram activeHref={currentRecommendationHref} language={language} releaseReadiness={data.releaseReadiness} />
            </CardContent>
          </Card>
        </div>

        <details className="rounded-2xl border border-border/70 bg-background shadow-sm">
          <summary className="flex cursor-pointer list-none flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{t(language, "Evidence details", "Evidensdetaljer")}</p>
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
                <div className={`rounded-2xl border px-4 py-4 ${item.severity === "high" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-amber-200 bg-amber-50 text-amber-900"}`} key={item.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-75">{item.category}</p>
                      <p className="mt-2 font-medium">{item.decisionNeeded}</p>
                      <p className="mt-2 text-sm leading-6">{item.rationale}</p>
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
                        <Link href={item.reviewHref}>{t(language, "Open in Human Review", "Öppna i Human Review")}</Link>
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
