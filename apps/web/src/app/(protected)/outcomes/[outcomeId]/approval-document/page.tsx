import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, CircleAlert, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@aas-companion/ui";
import { AasBrandMark } from "@/components/shared/aas-brand-mark";
import { ApprovalDocumentPrintButton } from "@/components/workspace/approval-document-print-button";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOutcomeTollgateReviewData } from "@/lib/cache/project-data";
import { formatAiLevelLabel, getAiLevelSummary } from "@/lib/help/aas-help";

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
    return t(language, "Not captured", "Ej fångat");
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return t(language, "Not captured", "Ej fångat");
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
  return value ? value.replaceAll("_", " ") : t(language, "Not captured", "Ej fångat");
}

function parseRiskRationale(value: string | null, language: AppLanguage) {
  if (!value) {
    return {
      level: null,
      rationale: t(language, "Not captured", "Ej fångat")
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
    rationale: rationale || t(language, "Not captured", "Ej fångat")
  };
}

function getRiskDisplay(level: "low" | "medium" | "high" | null, language: AppLanguage) {
  if (level === "low") {
    return {
      label: t(language, "Risk: Low", "Risk: Låg"),
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
      label: t(language, "Risk: High", "Risk: Hög"),
      icon: <CircleAlert className="h-4 w-4 text-rose-700" />
    };
  }

  return {
    label: t(language, "Risk: Not captured", "Risk: Ej fångat"),
    icon: <CircleAlert className="h-4 w-4 text-slate-500" />
  };
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
  params
}: {
  params: Promise<{ outcomeId: string }>;
}) {
  const language = await getServerLanguage();
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
          <AasBrandMark subtitle={t(language, "Approved framing document", "Godkänt framingdokument")} />
          <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={`/outcomes/${outcomeId}`}>
            {t(language, "Back to Framing", "Tillbaka till Framing")}
          </Link>
        </div>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <h1 className="text-xl font-semibold text-foreground">{t(language, "No approved framing document available", "Inget godkänt framingdokument finns tillgängligt")}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {t(language, "Tollgate 1 needs a completed approval before a framing approval document can be opened or printed.", "Tollgate 1 behöver ett slutfört godkännande innan ett framingdokument kan öppnas eller skrivas ut.")}
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

  return (
    <section className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-white px-6 py-5 shadow-sm print:hidden lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <AasBrandMark subtitle={t(language, "Approved framing document", "Godkänt framingdokument")} />
          <div className="text-sm text-muted-foreground">
            {t(language, "Approved framing version", "Godkänd framingversion")} {snapshot.approvedVersion} {t(language, "on", "den")} {formatDate(snapshot.approvedAt, language)}
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

      <article className="rounded-[32px] border border-border/70 bg-white p-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)] print:border-0 print:p-0 print:shadow-none">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <AasBrandMark subtitle={t(language, "Controlled framing approval record", "Styrt godkännandespår för framing")} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Tollgate 1 approval record", "Tollgate 1-godkännandepost")}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{snapshot.outcome.title}</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t(language, "This document captures the approved customer handshake, framing direction and sign-off trail for the approved Framing version.", "Det här dokumentet fångar den godkända kundhandshake:n, framingriktningen och sign-off-spåret för den godkända Framing-versionen.")}
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">{t(language, "Framing status", "Framingstatus")}</p>
                <p className="mt-2 text-2xl font-semibold text-sky-950">{t(language, "Approved", "Godkänd")}</p>
                <p className="mt-2 text-sm text-sky-900">{t(language, "Version", "Version")} {snapshot.approvedVersion}</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">{t(language, "Approved at", "Godkänd den")}</p>
                <p className="mt-2 text-sm font-medium text-emerald-950">{formatDate(snapshot.approvedAt, language)}</p>
              </div>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Business case", "Business case")}</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-800">
                <p><span className="font-semibold">{t(language, "Outcome key:", "Outcome-nyckel:")}</span> {snapshot.outcome.key}</p>
                <p><span className="font-semibold">{t(language, "Timeframe:", "Tidsram:")}</span> {snapshot.outcome.timeframe ?? t(language, "Not captured", "Ej fångat")}</p>
                <p><span className="font-semibold">{t(language, "Value Owner:", "Value Owner:")}</span> {snapshot.outcome.valueOwner ?? t(language, "Unassigned", "Ej tilldelad")}</p>
                <div>
                  <p className="font-semibold">{t(language, "Problem statement", "Problemformulering")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.problemStatement ?? t(language, "Not captured", "Ej fångat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Outcome statement", "Outcome-formulering")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.outcomeStatement ?? t(language, "Not captured", "Ej fångat")}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Baseline", "Baseline")}</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-800">
                <div>
                  <p className="font-semibold">{t(language, "Definition", "Definition")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.baselineDefinition ?? t(language, "Not captured", "Ej fångat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Source", "Källa")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.baselineSource ?? t(language, "Not captured", "Ej fångat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Solution context", "Lösningskontext")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.solutionContext ?? t(language, "Not captured", "Ej fångat")}</p>
                </div>
                <div>
                  <p className="font-semibold">{t(language, "Constraints", "Constraints")}</p>
                  <p className="mt-1 text-slate-700">{snapshot.outcome.constraints ?? t(language, "Not captured", "Ej fångat")}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "AI and risk", "AI och risk")}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800">
                <p><span className="font-semibold">{t(language, "AI Level:", "AI-nivå:")}</span> {formatAiLevelLabel(snapshot.outcome.aiLevel)}</p>
                <p className="mt-2 text-slate-700">{getAiLevelSummary(snapshot.outcome.aiLevel) ?? t(language, "Not captured", "Ej fångat")}</p>
                <div className="mt-3 flex items-center gap-2">
                  {getRiskDisplay(snapshot.outcome.riskProfile, language).icon}
                  <p><span className="font-semibold">{getRiskDisplay(snapshot.outcome.riskProfile, language).label}</span></p>
                </div>
                <p><span className="font-semibold">{t(language, "Data sensitivity:", "Datakänslighet:")}</span> {snapshot.outcome.dataSensitivity ?? t(language, "Not captured", "Ej fångat")}</p>
                <p><span className="font-semibold">{t(language, "Delivery type:", "Leveranstyp:")}</span> {snapshot.outcome.deliveryType ?? t(language, "Not captured", "Ej fångat")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Risk summary", "Risksammanfattning")}</p>
                <p className="mt-2 text-slate-700">
                  {t(language, "This risk posture was classified in Framing and approved as part of Tollgate 1 for the recorded Framing version.", "Den här riskpositionen klassificerades i Framing och godkändes som del av Tollgate 1 för den registrerade Framing-versionen.")}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Business impact", "Affärspåverkan")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(businessImpact.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(businessImpact.level, language).label}</p>
                </div>
                <p className="mt-2">{businessImpact.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe what happens to the business if the system or AI output is wrong.", "Motiveringen bör beskriva vad som händer med verksamheten om systemet eller AI-utdata blir fel.")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Data sensitivity rationale", "Motivering för datakänslighet")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(dataSensitivityRationale.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(dataSensitivityRationale.level, language).label}</p>
                </div>
                <p className="mt-2">{dataSensitivityRationale.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe what kind of data is involved and whether it is personal, sensitive or regulated.", "Motiveringen bör beskriva vilken typ av data som ingår och om den är personlig, känslig eller reglerad.")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Blast radius", "Sprängradie")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(blastRadius.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(blastRadius.level, language).label}</p>
                </div>
                <p className="mt-2">{blastRadius.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe how many users, teams or systems are affected if something goes wrong.", "Motiveringen bör beskriva hur många användare, team eller system som påverkas om något går fel.")}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4 text-sm leading-6 text-slate-800">
                <p className="font-semibold text-slate-950">{t(language, "Decision impact", "Beslutspåverkan")}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getRiskDisplay(decisionImpact.level, language).icon}
                  <p className="font-medium text-slate-950">{getRiskDisplay(decisionImpact.level, language).label}</p>
                </div>
                <p className="mt-2">{decisionImpact.rationale}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{t(language, "Rationale should describe whether AI only assists, influences decisions, or automates them.", "Motiveringen bör beskriva om AI bara assisterar, påverkar beslut eller automatiserar dem.")}</p>
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
                    <p className="mt-2 text-sm text-slate-700"><span className="font-medium">{t(language, "Purpose:", "Syfte:")}</span> {epic.purpose ?? t(language, "Not captured", "Ej fångat")}</p>
                    <p className="mt-1 text-sm text-slate-700"><span className="font-medium">{t(language, "Scope boundary:", "Scope-gräns:")}</span> {epic.scopeBoundary ?? t(language, "Not captured", "Ej fångat")}</p>

                    <div className="mt-4 rounded-2xl border border-border/70 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Story Ideas", "Story Ideas")}</p>
                      {epicStoryIdeas.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {epicStoryIdeas.map((storyIdea) => (
                            <div className="rounded-2xl border border-border/70 bg-background p-4" key={`${storyIdea.sourceType}:${storyIdea.key}`}>
                              <p className="font-semibold text-slate-950">{storyIdea.key} {storyIdea.title}</p>
                              <p className="mt-2 text-sm text-slate-700"><span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span> {storyIdea.valueIntent ?? t(language, "Not captured", "Ej fångat")}</p>
                              <p className="mt-1 text-sm text-slate-700"><span className="font-medium">{t(language, "Expected behavior:", "Förväntat beteende:")}</span> {storyIdea.expectedBehavior ?? t(language, "Not captured", "Ej fångat")}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">{t(language, "No Story Ideas were linked to this Epic.", "Inga Story Ideas var länkade till denna Epic.")}</p>
                      )}
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-slate-600">{t(language, "No Epics were captured.", "Inga Epics fångades.")}</p>}

              {unassignedStoryIdeas.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">{t(language, "Unassigned Story Ideas", "Otilldelade Story Ideas")}</p>
                  <div className="mt-3 space-y-3">
                    {unassignedStoryIdeas.map((storyIdea) => (
                      <div className="rounded-2xl border border-amber-200 bg-white/90 p-4" key={`${storyIdea.sourceType}:${storyIdea.key}`}>
                        <p className="font-semibold text-slate-950">{storyIdea.key} {storyIdea.title}</p>
                        <p className="mt-2 text-sm text-slate-700"><span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span> {storyIdea.valueIntent ?? t(language, "Not captured", "Ej fångat")}</p>
                        <p className="mt-1 text-sm text-slate-700"><span className="font-medium">{t(language, "Expected behavior:", "Förväntat beteende:")}</span> {storyIdea.expectedBehavior ?? t(language, "Not captured", "Ej fångat")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t(language, "Approval trail", "Godkännandespår")}</p>
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
