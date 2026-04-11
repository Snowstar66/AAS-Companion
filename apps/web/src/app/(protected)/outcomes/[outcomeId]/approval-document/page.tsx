import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronDown, CircleAlert, TriangleAlert } from "lucide-react";
import { parseFramingConstraintBundle } from "@aas-companion/domain";
import { Card, CardContent } from "@aas-companion/ui";
import { AasBrandMark } from "@/components/shared/aas-brand-mark";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { ApprovalDocumentPrintButton } from "@/components/workspace/approval-document-print-button";
import { uploadOutcomeTraceabilityEvidenceAction } from "@/app/(protected)/outcomes/[outcomeId]/approval-document/actions";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOutcomeTollgateReviewData, getCachedOutcomeWorkspaceData } from "@/lib/cache/project-data";
import { formatAiLevelLabel, getAiLevelSummary } from "@/lib/help/aas-help";
import { buildHandshakeDeliveryReport, type HandshakeCoverageStatus } from "@/lib/outcomes/handshake-delivery-report";
import {
  getStoredTraceabilityEvidenceSnapshot,
  getNfrTraceabilityRows,
  getOutsideHandshakeTraceabilityRows,
  getTraceabilityRowsForOrigin,
  loadTraceabilityEvidenceForOutcome,
  type TraceabilityEvidenceRow
} from "@/lib/outcomes/traceability-evidence";

type AppLanguage = "en" | "sv";

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

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function formatDate(value: string | null, language: AppLanguage) {
  if (!value) {
    return t(language, "Not captured", "Ej fÃ¥ngat");
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return t(language, "Not captured", "Ej fÃ¥ngat");
  }

  return new Intl.DateTimeFormat(language === "sv" ? "sv-SE" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

function formatLabel(value: string | null, language: AppLanguage) {
  return value ? value.replaceAll("_", " ") : t(language, "Not captured", "Ej fÃ¥ngat");
}

function parseRiskRationale(value: string | null, language: AppLanguage) {
  if (!value) {
    return {
      level: null,
      rationale: t(language, "Not captured", "Ej fÃ¥ngat")
    };
  }

  const match = value.match(/^(low|medium|high):\s*(.*)$/i);

  if (!match) {
    return {
      level: null,
      rationale: value
    };
  }

  const level = match[1];
  const rationale = match[2];

  return {
    level: (level ? level.toLowerCase() : "low") as "low" | "medium" | "high",
    rationale: rationale || t(language, "Not captured", "Ej fÃ¥ngat")
  };
}

function getRiskDisplay(level: "low" | "medium" | "high" | null, language: AppLanguage) {
  if (level === "low") {
    return {
      label: t(language, "Risk: Low", "Risk: LÃ¥g"),
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-700" />
    };
  }

  if (level === "medium") {
    return {
      label: t(language, "Risk: Medium", "Risk: Medel"),
      icon: <TriangleAlert className="h-4 w-4 text-amber-700" />
    };
  }

  if (level === "high") {
    return {
      label: t(language, "Risk: High", "Risk: HÃ¶g"),
      icon: <CircleAlert className="h-4 w-4 text-rose-700" />
    };
  }

  return {
    label: t(language, "Risk: Not captured", "Risk: Ej fÃ¥ngat"),
    icon: <CircleAlert className="h-4 w-4 text-slate-500" />
  };
}

function getHandshakeStatusCopy(status: HandshakeCoverageStatus, language: AppLanguage) {
  switch (status) {
    case "covered":
      return {
        label: t(language, "Covered", "TÃ¤ckt"),
        classes: "border-emerald-200 bg-emerald-50 text-emerald-900",
        description: t(
          language,
          "At least one current Delivery Story or imported BMAD evidence row traces back to this approved Story Idea.",
          "Minst en nuvarande Delivery Story eller importerad BMAD-evidensrad spÃ¥rar tillbaka till den hÃ¤r godkÃ¤nda Story Idean."
        )
      };
    case "reshaped_within_handshake":
      return {
        label: t(language, "Reshaped within handshake", "Omformad inom handslaget"),
        classes: "border-sky-200 bg-sky-50 text-sky-900",
        description: t(
          language,
          "Delivery evidence exists, but it has been split, duplicated or otherwise reshaped compared with the approved Story Idea.",
          "Det finns leveransevidens, men den har delats upp, duplicerats eller pÃ¥ annat sÃ¤tt omformats jÃ¤mfÃ¶rt med den godkÃ¤nda Story Idean."
        )
      };
    default:
      return {
        label: t(language, "Not implemented", "Inte implementerad"),
        classes: "border-amber-200 bg-amber-50 text-amber-900",
        description: t(
          language,
          "No current Delivery Story or imported BMAD evidence row currently traces back to this approved Story Idea.",
          "Ingen nuvarande Delivery Story eller importerad BMAD-evidensrad spÃ¥rar just nu tillbaka till den hÃ¤r godkÃ¤nda Story Idean."
        )
      };
  }
}

function getMergedHandshakeCoverageStatus(input: {
  baseStatus: HandshakeCoverageStatus;
  linkedDeliveryStoryCount: number;
  evidenceRows: TraceabilityEvidenceRow[];
}): HandshakeCoverageStatus {
  if (input.baseStatus === "reshaped_within_handshake") {
    return input.baseStatus;
  }

  const evidenceSuggestsReshape =
    input.evidenceRows.length > 1 ||
    input.evidenceRows.some((row) => row.epicStoryIds.length > 1);

  if (input.linkedDeliveryStoryCount > 1 || evidenceSuggestsReshape) {
    return "reshaped_within_handshake";
  }

  if (input.baseStatus === "covered" || input.evidenceRows.length > 0) {
    return "covered";
  }

  return "not_implemented";
}

function hasConstraintContent(value: string) {
  return value.trim().length > 0;
}

function getSingleSearchParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];

  if (typeof value === "string") {
    return value;
  }

  return Array.isArray(value) ? value[0] ?? null : null;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function OutcomeApprovalDocumentPage({
  params,
  searchParams
}: {
  params: Promise<{ outcomeId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const language = await getServerLanguage();
  const { outcomeId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const session = await requireActiveProjectSession();
  const [reviewResult, workspaceResult] = await Promise.all([
    getCachedOutcomeTollgateReviewData(session.organization.organizationId, outcomeId),
    getCachedOutcomeWorkspaceData(session.organization.organizationId, outcomeId)
  ]);

  if (!reviewResult.ok) {
    notFound();
  }

  const snapshot = reviewResult.data.tollgateReview.approvalSnapshot as ApprovalSnapshot | null;

  if (!snapshot) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <AasBrandMark subtitle={t(language, "Approved framing document", "GodkÃ¤nt framingdokument")} />
          <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={`/outcomes/${outcomeId}`}>
            {t(language, "Back to Framing", "Tillbaka till Framing")}
          </Link>
        </div>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <h1 className="text-xl font-semibold text-foreground">{t(language, "No approved framing document available", "Inget godkÃ¤nt framingdokument finns tillgÃ¤ngligt")}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {t(language, "Tollgate 1 needs a completed approval before a framing approval document can be opened or printed.", "Tollgate 1 behÃ¶ver ett slutfÃ¶rt godkÃ¤nnande innan ett framingdokument kan Ã¶ppnas eller skrivas ut.")}
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
  const businessImpact = parseRiskRationale(snapshot.outcome.riskRationale.businessImpact, language);
  const dataSensitivityRationale = parseRiskRationale(snapshot.outcome.riskRationale.dataSensitivity, language);
  const blastRadius = parseRiskRationale(snapshot.outcome.riskRationale.blastRadius, language);
  const decisionImpact = parseRiskRationale(snapshot.outcome.riskRationale.decisionImpact, language);
  const structuredConstraints = parseFramingConstraintBundle(snapshot.outcome.constraints);
  const constraintSections = [
    {
      key: "general",
      label: t(language, "General constraints", "Generella constraints"),
      value: structuredConstraints.generalConstraints
    },
    {
      key: "ux",
      label: t(language, "UX principles", "UX-principer"),
      value: structuredConstraints.uxPrinciples
    },
    {
      key: "nfr",
      label: t(language, "Non-functional requirements", "Icke-funktionella krav"),
      value: structuredConstraints.nonFunctionalRequirements
    },
    {
      key: "additional",
      label: t(language, "Additional requirements", "Ytterligare krav"),
      value: structuredConstraints.additionalRequirements
    }
  ].filter((section) => hasConstraintContent(section.value));
  const storedTraceabilityEvidence = getStoredTraceabilityEvidenceSnapshot(snapshot, snapshot.outcome.key);
  const traceabilityEvidence = storedTraceabilityEvidence ?? (await loadTraceabilityEvidenceForOutcome(snapshot.outcome.key));
  const outsideHandshakeTraceabilityRows = traceabilityEvidence
    ? getOutsideHandshakeTraceabilityRows(traceabilityEvidence.rows)
    : [];
  const nfrTraceabilityRows = traceabilityEvidence ? getNfrTraceabilityRows(traceabilityEvidence.rows) : [];
  const traceabilityUploadStatus = getSingleSearchParamValue(resolvedSearchParams, "traceabilityUpload");
  const traceabilityUploadMessage = getSingleSearchParamValue(resolvedSearchParams, "traceabilityMessage");
  const handshakeReport =
    workspaceResult.ok
      ? buildHandshakeDeliveryReport({
          approvedStoryIdeas: snapshot.storyIdeas,
          currentSeeds: workspaceResult.data.outcome.directionSeeds
            .filter((seed) => seed.lifecycleState === "active")
            .map((seed) => ({
              id: seed.id,
              key: seed.key,
              title: seed.title,
              sourceStoryId: seed.sourceStoryId ?? null
            })),
          currentStories: workspaceResult.data.outcome.stories
            .filter((story) => story.lifecycleState === "active")
            .map((story) => {
              const epic = workspaceResult.data.outcome.epics.find((candidate) => candidate.id === story.epicId) ?? null;

              return {
                id: story.id,
                key: story.key,
                title: story.title,
                epicKey: epic?.key ?? null,
                epicTitle: epic?.title ?? null,
                sourceDirectionSeedId: story.sourceDirectionSeedId ?? null,
                status: story.status,
                acceptanceCriteria: story.acceptanceCriteria,
                definitionOfDone: story.definitionOfDone,
                testDefinition: story.testDefinition ?? null,
                tollgateStatus: null
              };
            })
        })
      : null;
  const handshakeCoverageRows = handshakeReport
    ? handshakeReport.coverageRows.map((row) => {
        const evidenceRows = traceabilityEvidence ? getTraceabilityRowsForOrigin(traceabilityEvidence.rows, row.idea.key) : [];
        const mergedStatus = getMergedHandshakeCoverageStatus({
          baseStatus: row.status,
          linkedDeliveryStoryCount: row.linkedDeliveryStories.length,
          evidenceRows
        });

        return {
          ...row,
          status: mergedStatus,
          evidenceRows
        };
      })
    : [];
  const handshakeDisplaySummary = handshakeReport
    ? {
        approvedIdeaCount: handshakeCoverageRows.length,
        coveredCount: handshakeCoverageRows.filter((row) => row.status === "covered").length,
        reshapedCount: handshakeCoverageRows.filter((row) => row.status === "reshaped_within_handshake").length,
        notImplementedCount: handshakeCoverageRows.filter((row) => row.status === "not_implemented").length,
        outsideHandshakeCount: handshakeReport.outsideHandshakeStories.length + outsideHandshakeTraceabilityRows.length
      }
    : null;

  return (
    <section className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-white px-6 py-5 shadow-sm print:hidden lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <AasBrandMark subtitle={t(language, "Approved framing document", "GodkÃ¤nt framingdokument")} />
          <div className="text-sm text-muted-foreground">
            {t(language, "Approved framing version", "GodkÃ¤nd framingversion")} {snapshot.approvedVersion} {t(language, "on", "den")} {formatDate(snapshot.approvedAt, language)}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ApprovalDocumentPrintButton />
          <Link
            className="inline-flex items-center rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
            href={`/outcomes/${outcomeId}`}
          >
            {t(language, "Back to Framing", "Tillbaka till Framing")}
          </Link>
        </div>
      </div>

      {traceabilityUploadStatus && traceabilityUploadMessage ? (
        <div
          className={`rounded-3xl border px-5 py-4 text-sm leading-6 print:hidden ${
            traceabilityUploadStatus === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-rose-200 bg-rose-50 text-rose-950"
          }`}
        >
          {traceabilityUploadMessage}
        </div>
      ) : null}

      <article className="rounded-[32px] border border-border/70 bg-white p-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)] print:border-0 print:p-0 print:shadow-none">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <AasBrandMark subtitle={t(language, "Controlled framing approval record", "Styrt godkÃ¤nnandespÃ¥r fÃ¶r framing")} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Tollgate 1 approval record", "Tollgate 1-godkÃ¤nnandepost")}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{snapshot.outcome.title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t(language, "This document captures the approved customer handshake, framing direction and sign-off trail for the approved Framing version.", "Det hÃ¤r dokumentet fÃ¥ngar den godkÃ¤nda kundhandshake:n, framingriktningen och sign-off-spÃ¥ret fÃ¶r den godkÃ¤nda Framing-versionen.")}
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">{t(language, "Framing status", "Framingstatus")}</p>
                <p className="mt-2 text-2xl font-semibold text-sky-950">{t(language, "Approved", "GodkÃ¤nd")}</p>
                <p className="mt-2 text-sm text-sky-900">{t(language, "Version", "Version")} {snapshot.approvedVersion}</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">{t(language, "Approved at", "GodkÃ¤nd den")}</p>
                <p className="mt-2 text-sm font-medium text-emerald-950">{formatDate(snapshot.approvedAt, language)}</p>
              </div>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Business case", "Business case")}</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-800">
                <p><span className="font-semibold">{t(language, "Outcome key:", "Outcome-nyckel:")}</span> {snapshot.outcome.key}</p>
                <p><span className="font-semibold">{t(language, "Timeframe:", "Tidsram:")}</span> {snapshot.outcome.timeframe ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                <p><span className="font-semibold">{t(language, "Value Owner:", "Value Owner:")}</span> {snapshot.outcome.valueOwner ?? t(language, "Unassigned", "Ej tilldelad")}</p>
                <div>
                  <p className="font-semibold">{t(language, "Problem statement", "Problemformulering")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.problemStatement ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Outcome statement", "Outcome-formulering")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.outcomeStatement ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Baseline", "Baseline")}</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-800">
                <div>
                  <p className="font-semibold">{t(language, "Definition", "Definition")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.baselineDefinition ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Source", "KÃ¤lla")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.baselineSource ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Solution context", "LÃ¶sningskontext")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.solutionContext ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Constraints", "Constraints")}</p>
                  {constraintSections.length > 0 ? (
                    <div className="mt-2 space-y-3">
                      {constraintSections.map((section) => (
                        <div key={section.key}>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{section.label}</p>
                          <p className="mt-1 whitespace-pre-line text-slate-700">{section.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-700">{snapshot.outcome.constraints ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "AI and risk", "AI och risk")}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800">
                <p><span className="font-semibold">{t(language, "AI Level:", "AI-nivÃ¥:")}</span> {formatAiLevelLabel(snapshot.outcome.aiLevel)}</p>
                <p className="mt-2 text-slate-700">{getAiLevelSummary(snapshot.outcome.aiLevel) ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                <div className="mt-3 flex items-center gap-2">
                  {getRiskDisplay(snapshot.outcome.riskProfile, language).icon}
                  <p><span className="font-semibold">{getRiskDisplay(snapshot.outcome.riskProfile, language).label}</span></p>
                </div>
                <p><span className="font-semibold">{t(language, "Data sensitivity:", "DatakÃ¤nslighet:")}</span> {snapshot.outcome.dataSensitivity ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                <p><span className="font-semibold">{t(language, "Delivery type:", "Leveranstyp:")}</span> {snapshot.outcome.deliveryType ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Risk summary", "Risksammanfattning")}</p>
                <p className="mt-2 text-slate-700">
                  {t(language, "This risk posture was classified in Framing and approved as part of Tollgate 1 for the recorded Framing version.", "Den hÃ¤r riskpositionen klassificerades i Framing och godkÃ¤ndes som del av Tollgate 1 fÃ¶r den registrerade Framing-versionen.")}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Business impact", "AffÃ¤rspÃ¥verkan")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(businessImpact.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(businessImpact.level, language).label}</p>
                </div>
                <p className="mt-2">{businessImpact.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe what happens to the business if the system or AI output is wrong.", "Motiveringen bÃ¶r beskriva vad som hÃ¤nder med verksamheten om systemet eller AI-utdata blir fel.")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Data sensitivity rationale", "Motivering fÃ¶r datakÃ¤nslighet")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(dataSensitivityRationale.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(dataSensitivityRationale.level, language).label}</p>
                </div>
                <p className="mt-2">{dataSensitivityRationale.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe what kind of data is involved and whether it is personal, sensitive or regulated.", "Motiveringen bÃ¶r beskriva vilken typ av data som ingÃ¥r och om den Ã¤r personlig, kÃ¤nslig eller reglerad.")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Blast radius", "SprÃ¤ngradie")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(blastRadius.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(blastRadius.level, language).label}</p>
                </div>
                <p className="mt-2">{blastRadius.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe how many users, teams or systems are affected if something goes wrong.", "Motiveringen bÃ¶r beskriva hur mÃ¥nga anvÃ¤ndare, team eller system som pÃ¥verkas om nÃ¥got gÃ¥r fel.")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Decision impact", "BeslutspÃ¥verkan")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(decisionImpact.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(decisionImpact.level, language).label}</p>
                </div>
                <p className="mt-2">{decisionImpact.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe whether AI only assists, influences decisions, or automates them.", "Motiveringen bÃ¶r beskriva om AI bara assisterar, pÃ¥verkar beslut eller automatiserar dem.")}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Epics and Story Ideas", "Epics och Story Ideas")}</p>
            <div className="mt-4 space-y-5">
              {snapshot.epics.length > 0 ? snapshot.epics.map((epic) => {
                const epicStoryIdeas = storyIdeasByEpic.get(epic.key) ?? [];

                return (
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={epic.key}>
                    <p className="font-semibold text-slate-950">{epic.key} {epic.title}</p>
                    <p className="mt-2 text-sm text-slate-700"><span className="font-medium">{t(language, "Purpose:", "Syfte:")}</span> {epic.purpose ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                    <p className="mt-1 text-sm text-slate-700"><span className="font-medium">{t(language, "Scope boundary:", "Scope-grÃ¤ns:")}</span> {epic.scopeBoundary ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>

                    <div className="mt-4 rounded-2xl border border-border/70 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Story Ideas", "Story Ideas")}</p>
                      {epicStoryIdeas.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {epicStoryIdeas.map((storyIdea) => (
                            <div className="rounded-2xl border border-border/70 bg-background p-4" key={`${storyIdea.sourceType}:${storyIdea.key}`}>
                              <p className="font-semibold text-slate-950">{storyIdea.key} {storyIdea.title}</p>
                              <p className="mt-2 text-sm text-slate-700"><span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span> {storyIdea.valueIntent ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                              <p className="mt-1 text-sm text-slate-700"><span className="font-medium">{t(language, "Expected behavior:", "FÃ¶rvÃ¤ntat beteende:")}</span> {storyIdea.expectedBehavior ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">{t(language, "No Story Ideas were linked to this Epic.", "Inga Story Ideas var lÃ¤nkade till denna Epic.")}</p>
                      )}
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-slate-600">{t(language, "No Epics were captured.", "Inga Epics fÃ¥ngades.")}</p>}

              {unassignedStoryIdeas.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">{t(language, "Unassigned Story Ideas", "Otilldelade Story Ideas")}</p>
                  <div className="mt-3 space-y-3">
                    {unassignedStoryIdeas.map((storyIdea) => (
                      <div className="rounded-2xl border border-amber-200 bg-white/90 p-4" key={`${storyIdea.sourceType}:${storyIdea.key}`}>
                        <p className="font-semibold text-slate-950">{storyIdea.key} {storyIdea.title}</p>
                        <p className="mt-2 text-sm text-slate-700"><span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span> {storyIdea.valueIntent ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                        <p className="mt-1 text-sm text-slate-700"><span className="font-medium">{t(language, "Expected behavior:", "FÃ¶rvÃ¤ntat beteende:")}</span> {storyIdea.expectedBehavior ?? t(language, "Not captured", "Ej fÃ¥ngat")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t(language, "Handshake delivery coverage", "LeveranstÃ¤ckning mot handslaget")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {t(
                language,
                "This first compliance view compares the approved Story Ideas with current traced Delivery Stories in AAS. It shows what is covered, what has been reshaped within the handshake, and what currently sits outside the approved framing.",
                "Den hÃ¤r fÃ¶rsta compliance-vyn jÃ¤mfÃ¶r de godkÃ¤nda Story Ideas med nuvarande spÃ¥rade Delivery Stories i AAS. Den visar vad som Ã¤r tÃ¤ckt, vad som har omformats inom handslaget och vad som just nu ligger utanfÃ¶r den godkÃ¤nda framingen."
              )}
            </p>

            {handshakeReport ? (
              <div className="mt-4 space-y-5">
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Approved ideas", "GodkÃ¤nda idÃ©er")}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{handshakeDisplaySummary?.approvedIdeaCount ?? handshakeReport.summary.approvedIdeaCount}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">{t(language, "Covered", "TÃ¤ckta")}</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-950">{handshakeDisplaySummary?.coveredCount ?? handshakeReport.summary.coveredCount}</p>
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">{t(language, "Reshaped", "Omformade")}</p>
                    <p className="mt-2 text-2xl font-semibold text-sky-950">{handshakeDisplaySummary?.reshapedCount ?? handshakeReport.summary.reshapedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">{t(language, "Outside handshake", "UtanfÃ¶r handslag")}</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-950">{handshakeDisplaySummary?.outsideHandshakeCount ?? handshakeReport.summary.outsideHandshakeCount}</p>
                  </div>
                </div>

                {traceabilityEvidence ? (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">
                          {t(language, "BMAD traceability evidence", "BMAD-spÃ¥rbarhet som evidens")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {t(
                            language,
                            storedTraceabilityEvidence
                              ? "Evidence was imported into this approved framing document and is now used as a supplemental proof layer in this report."
                              : "Evidence was loaded from the configured BMAD traceability export and is now used as a supplemental proof layer in this report.",
                            storedTraceabilityEvidence
                              ? "Evidens importerades till det hÃ¤r godkÃ¤nda framingdokumentet och anvÃ¤nds nu som ett kompletterande bevislager i den hÃ¤r rapporten."
                              : "Evidens lÃ¤stes in frÃ¥n den konfigurerade BMAD-traceability-exporten och anvÃ¤nds nu som ett kompletterande bevislager i den hÃ¤r rapporten."
                          )}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">{traceabilityEvidence.sourcePath}</p>
                        {traceabilityEvidence.uploadedAt ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {t(language, "Imported at:", "Importerad:")} {formatDate(traceabilityEvidence.uploadedAt, language)}
                          </p>
                        ) : null}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl border border-sky-200 bg-white/80 px-3 py-2 text-sm text-slate-700">
                          {t(language, "Traced rows:", "SpÃ¥rade rader:")} {traceabilityEvidence.rows.length}
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-white/80 px-3 py-2 text-sm text-slate-700">
                          {t(language, "ADDED rows:", "ADDED-rader:")} {outsideHandshakeTraceabilityRows.length}
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-white/80 px-3 py-2 text-sm text-slate-700">
                          {t(language, "NFR rows:", "NFR-rader:")} {nfrTraceabilityRows.length}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-border/70 bg-white/80 p-4 print:hidden">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {t(language, "Import BMAD traceability CSV", "Importera BMAD-traceability-CSV")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {t(
                          language,
                          "Upload the exported traceability CSV here to bind implementation evidence to this approved handshake. The imported rows are stored with the approval document for this outcome.",
                          "Ladda upp den exporterade traceability-CSV:n hÃ¤r fÃ¶r att binda implementationsevidens till det hÃ¤r godkÃ¤nda handslaget. De importerade raderna sparas tillsammans med approval-dokumentet fÃ¶r det hÃ¤r outcome:t."
                        )}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {t(
                          language,
                          "The imported CSV is the saved source material. Use Print to PDF when you want a human-readable evidence package to share outside the tool.",
                          "Den importerade CSV:n Ã¤r det sparade kÃ¤llunderlaget. AnvÃ¤nd Skriv ut till PDF nÃ¤r du vill dela ett mÃ¤nskligt lÃ¤sbart evidenspaket utanfÃ¶r verktyget."
                        )}
                      </p>
                    </div>
                    <form action={uploadOutcomeTraceabilityEvidenceAction} className="flex w-full max-w-xl flex-col gap-3 lg:items-end">
                      <input name="outcomeId" type="hidden" value={outcomeId} />
                      <input
                        accept=".csv,text/csv"
                        className="w-full rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                        name="traceabilityCsv"
                        required
                        type="file"
                      />
                      <PendingFormButton
                        className="rounded-full"
                        label={t(language, traceabilityEvidence ? "Replace traceability CSV" : "Import traceability CSV", traceabilityEvidence ? "Byt traceability-CSV" : "Importera traceability-CSV")}
                        pendingLabel={t(language, "Importing traceability...", "Importerar traceability...")}
                      />
                    </form>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-sm leading-6 text-slate-700">
                    {t(
                      language,
                      "Imported BMAD rows are shown directly under the approved Story Idea they map to. The separate imported-story library was removed to avoid repeating the same traceability twice.",
                      "Importerade BMAD-rader visas nu direkt under den godkÃ¤nda Story Idea som de mappar till. Den separata importerade story-listan togs bort fÃ¶r att inte upprepa samma spÃ¥rbarhet tvÃ¥ gÃ¥nger."
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  {handshakeCoverageRows.map((row) => {
                    const statusCopy = getHandshakeStatusCopy(row.status, language);
                    const evidenceRows = row.evidenceRows;

                    return (
                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={`${row.idea.sourceType}:${row.idea.key}`}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950">{row.idea.key} {row.idea.title}</p>
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusCopy.classes}`}>
                                {statusCopy.label}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-700">
                              <span className="font-medium">{t(language, "Approved Epic:", "GodkÃ¤nd Epic:")}</span> {row.idea.linkedEpic ?? t(language, "Unassigned", "Otilldelad")}
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              <span className="font-medium">{t(language, "Approved value intent:", "Godkänd value intent:")}</span>{" "}
                              {row.idea.valueIntent ?? t(language, "Not captured", "Ej fångat")}
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              <span className="font-medium">{t(language, "Approved expected behavior:", "Godkänt förväntat beteende:")}</span>{" "}
                              {row.idea.expectedBehavior ?? t(language, "Not captured", "Ej fångat")}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-700">{statusCopy.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <div className="rounded-2xl border border-border/70 bg-white/80 px-3 py-2 text-sm text-slate-700">
                              {t(language, "Linked Delivery Stories:", "LÃ¤nkade Delivery Stories:")} {row.linkedDeliveryStories.length}
                            </div>
                            <div className="rounded-2xl border border-sky-200 bg-white/80 px-3 py-2 text-sm text-slate-700">
                              {t(language, "BMAD rows:", "BMAD-rader:")} {evidenceRows.length}
                            </div>
                          </div>
                        </div>

                        {row.linkedDeliveryStories.length > 0 ? (
                          <div className="mt-4 space-y-3">
                            {row.linkedDeliveryStories.map((story) => (
                              <div className="rounded-2xl border border-border/70 bg-white/80 p-4" key={story.id}>
                                <p className="font-semibold text-slate-950">{story.key} {story.title}</p>
                                <p className="mt-2 text-sm text-slate-700">
                                  <span className="font-medium">{t(language, "Current Epic:", "Nuvarande Epic:")}</span>{" "}
                                  {story.epicKey && story.epicTitle ? `${story.epicKey} ${story.epicTitle}` : t(language, "Not captured", "Ej fÃ¥ngat")}
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                  <span className="font-medium">{t(language, "Delivery status:", "Leveransstatus:")}</span>{" "}
                                  {formatLabel(story.status ?? null, language)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : evidenceRows.length > 0 ? (
                          <p className="mt-4 text-sm text-slate-600">
                            {t(
                              language,
                              "No current AAS Delivery Story is linked directly yet, but the imported BMAD evidence below still traces implementation back to this approved Story Idea.",
                              "Ingen nuvarande AAS-Delivery Story Ã¤r lÃ¤nkad direkt Ã¤nnu, men den importerade BMAD-evidensen nedan spÃ¥rar fortfarande implementation tillbaka till den hÃ¤r godkÃ¤nda Story Idean."
                            )}
                          </p>
                        ) : (
                          <p className="mt-4 text-sm text-slate-600">
                            {t(
                              language,
                              "No traced Delivery Story currently proves implementation of this approved Story Idea.",
                              "Ingen spÃ¥rad Delivery Story bevisar just nu implementation av den hÃ¤r godkÃ¤nda Story Idean."
                            )}
                          </p>
                        )}

                        {evidenceRows.length > 0 ? (
                          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/35 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">
                              {t(language, "Traceability evidence", "SpÃ¥rbarhetsevidens")}
                            </p>
                            <div className="mt-3 space-y-3">
                              {evidenceRows.map((evidenceRow, evidenceIndex) => (
                                <details
                                  className="group rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-sm open:bg-sky-50/20"
                                  key={evidenceRow.matchKey}
                                  open={evidenceIndex === 0}
                                >
                                  <summary className="cursor-pointer list-none">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-950">
                                          {evidenceRow.refinedStoryId} {evidenceRow.refinedStoryTitle}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">
                                          <span className="font-medium">{t(language, "Implemented as:", "Implementerad som:")}</span>{" "}
                                          {evidenceRow.epicStoryIds.join(" | ") || t(language, "Not captured", "Ej fÃ¥ngat")}
                                          {evidenceRow.epicStoryTitle ? ` - ${evidenceRow.epicStoryTitle}` : ""}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="rounded-2xl border border-sky-200 bg-sky-50/60 px-3 py-2 text-sm text-slate-700">
                                          {t(language, "Artifacts:", "Artefakter:")} {evidenceRow.implementationArtifacts.length}
                                          {" · "}
                                          {t(language, "Tests:", "Tester:")} {evidenceRow.testEvidence.length}
                                        </div>
                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-900 shadow-sm">
                                          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                                        </div>
                                      </div>
                                    </div>
                                  </summary>
                                  <div className="mt-4 space-y-3">
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Approved source:", "Godkänd källa:")}</span>{" "}
                                      {row.idea.key} {row.idea.title}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Why it maps here:", "Varför den mappar hit:")}</span>{" "}
                                      {evidenceRow.sourceOriginNote ??
                                        t(language, "Mapped directly from the approved Story Idea.", "Mappad direkt från den godkända Story Idean.")}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span>{" "}
                                      {evidenceRow.sourceValueIntent ?? t(language, "Not captured", "Ej fångat")}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Expected behavior:", "Förväntat beteende:")}</span>{" "}
                                      {evidenceRow.sourceExpectedBehavior ?? t(language, "Not captured", "Ej fångat")}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Acceptance summary:", "Acceptanssammanfattning:")}</span>{" "}
                                      {evidenceRow.acceptanceCriteriaSummary ?? t(language, "Not captured", "Ej fångat")}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Definition of done:", "Definition of done:")}</span>{" "}
                                      {evidenceRow.definitionOfDone ?? t(language, "Not captured", "Ej fångat")}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Implementation artifacts:", "Implementation artifacts:")}</span>{" "}
                                      {evidenceRow.implementationArtifacts
                                        .map((artifact) => artifact.split("/").pop() ?? artifact)
                                        .join(" | ") || t(language, "Not captured", "Ej fÃ¥ngat")}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">{t(language, "Test evidence items:", "Testevidensposter:")}</span>{" "}
                                      {evidenceRow.testEvidence.length}
                                    </p>
                                  </div>
                                </details>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
                    {t(language, "Additional delivery outside the approved handshake", "Ytterligare leverans utanfÃ¶r godkÃ¤nt handslag")}
                  </p>
                  {handshakeReport.outsideHandshakeStories.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {handshakeReport.outsideHandshakeStories.map((story) => (
                        <div className="rounded-2xl border border-amber-200 bg-white/90 p-4" key={story.id}>
                          <p className="font-semibold text-slate-950">{story.key} {story.title}</p>
                          <p className="mt-2 text-sm text-slate-700">
                            <span className="font-medium">{t(language, "Epic:", "Epic:")}</span>{" "}
                            {story.epicKey && story.epicTitle ? `${story.epicKey} ${story.epicTitle}` : t(language, "Not captured", "Ej fÃ¥ngat")}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {t(
                              language,
                              "This Delivery Story currently has no direct trace back to an approved Story Idea in the handshake.",
                              "Den hÃ¤r Delivery Storyn har just nu ingen direkt spÃ¥rning tillbaka till en godkÃ¤nd Story Idea i handslaget."
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-700">
                      {t(
                        language,
                        "No additional Delivery Stories outside the approved handshake are currently visible.",
                        "Inga ytterligare Delivery Stories utanfÃ¶r det godkÃ¤nda handslaget Ã¤r just nu synliga."
                      )}
                    </p>
                  )}

                  {outsideHandshakeTraceabilityRows.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {outsideHandshakeTraceabilityRows.map((row) => (
                        <div className="rounded-2xl border border-amber-200 bg-white/90 p-4" key={row.matchKey}>
                          <p className="font-semibold text-slate-950">
                            {row.refinedStoryId} {row.refinedStoryTitle}
                          </p>
                          <p className="mt-2 text-sm text-slate-700">
                            <span className="font-medium">{t(language, "Implementation story:", "Implementationsstory:")}</span>{" "}
                            {row.epicStoryIds.join(" | ") || t(language, "Not captured", "Ej fÃ¥ngat")}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            <span className="font-medium">{t(language, "Why outside handshake:", "VarfÃ¶r utanfÃ¶r handslaget:")}</span>{" "}
                            {row.sourceOriginNote ?? t(language, "Marked as ADDED in BMAD traceability.", "Markerad som ADDED i BMAD-spÃ¥rbarheten.")}
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            <span className="font-medium">{t(language, "Implementation artifacts:", "Implementation artifacts:")}</span>{" "}
                            {row.implementationArtifacts
                              .map((artifact) => artifact.split("/").pop() ?? artifact)
                              .join(" | ") || t(language, "Not captured", "Ej fÃ¥ngat")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-700">
                {t(
                  language,
                  "Current project data could not be loaded, so delivery coverage cannot yet be compared against the approved handshake.",
                  "Nuvarande projektdata kunde inte laddas, sÃ¥ leveranstÃ¤ckningen kan Ã¤nnu inte jÃ¤mfÃ¶ras mot det godkÃ¤nda handslaget."
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Approval trail", "GodkÃ¤nnandespÃ¥r")}</p>
            <div className="mt-4 space-y-4">
              {snapshot.signoffs.map((record) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800" key={record.id}>
                  <p className="font-semibold text-slate-950">
                    {formatLabel(record.decisionKind, language)} {t(language, "by", "av")} {record.actualPersonName}
                  </p>
                  <p className="mt-1">
                    {formatLabel(record.requiredRoleType, language)} / {record.organizationSide} / {formatLabel(record.decisionStatus, language)}
                  </p>
                  <p className="mt-1">{t(language, "Recorded at", "Registrerad den")} {formatDate(record.createdAt, language)}</p>
                  {record.note ? <p className="mt-2">{t(language, "Note:", "Notering:")} {record.note}</p> : null}
                  {record.evidenceReference ? <p className="mt-1">{t(language, "Evidence:", "Evidens:")} {record.evidenceReference}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </article>
    </section>
  );
}

