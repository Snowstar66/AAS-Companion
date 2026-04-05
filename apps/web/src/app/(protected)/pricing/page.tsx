import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BriefcaseBusiness, Compass, Shield, Workflow } from "lucide-react";
import { getProjectPricingWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
import { requireOrganizationContext } from "@/lib/auth/guards";

type PricingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AppLanguage = "en" | "sv";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

function formatAiLevel(value: string | null | undefined, language: AppLanguage) {
  return value ? value.replaceAll("_", " ") : language === "sv" ? "Inte vald annu" : "Not selected yet";
}

function formatSignalValue(value: string, language: AppLanguage) {
  if (language === "sv") {
    if (value === "clear") return "Tydligt";
    if (value === "unclear") return "Otydligt";
    if (value === "stable") return "Stabilt";
    if (value === "unstable") return "Instabilt";
  }

  return value.replaceAll("_", " ");
}

function toneClasses(input: { tone: "neutral" | "ready" | "risk" | "blocked" }) {
  if (input.tone === "ready") return "border-emerald-200 bg-emerald-50/80 text-emerald-950";
  if (input.tone === "risk") return "border-amber-200 bg-amber-50/80 text-amber-950";
  if (input.tone === "blocked") return "border-rose-200 bg-rose-50/80 text-rose-950";
  return "border-border/70 bg-muted/20 text-foreground";
}

function getCopy(language: AppLanguage) {
  if (language === "sv") {
    return {
      sectionLabel: "Pricing",
      unavailable: "Ej tillganglig",
      unavailableTitle: "Pricing ar inte tillganglig",
      unavailableDescription: "Pricing-arbetsytan kunde inte laddas.",
      backHome: "Tillbaka till Home",
      projectSection: "Projektsektion",
      heroBadge: "Commercial fit",
      heroTitle: "Pricing guidance",
      heroDescription:
        "Pricing ar enbart vagledande. Den har sidan anvander aktiv projektkontext for att foresla en lamplig AAS-prismodell och visa vad som fortfarande blockerar kommersiell trygghet.",
      warningTitle: "Pricing ar inte samma sak som approval",
      warningBody:
        "Human Review, governance-validering, Value Spine-progression och tollgates ligger fortfarande separat. Pricing rekommenderar en modell, men skapar ingen genvag runt AAS-kontroller.",
      classification: "Projektklassificering",
      readiness: "Pricing-readiness",
      recommended: "Rekommenderad modell",
      currentAi: "Nuvarande AI-niva",
      pricingContext: "Pricing-kontext",
      anchoredTo: (key: string) => `Kommersiell vagledning ar just nu forankrad i ${key} i det aktiva projektet.`,
      contextFallback:
        "Pricing kan laddas innan Framing ar klar, men den forblir konservativ tills en projektgren finns.",
      openFraming: "Oppna Framing",
      openValueSpine: "Oppna Value Spine",
      openGovernance: "Oppna Governance",
      riskProfile: "riskprofil",
      missingOutcome: "Outcome-beskrivning saknas fortfarande.",
      noActiveFraming: "Ingen aktiv Framing-gren annu",
      noActiveFramingBody:
        "Pricing visas fortfarande, men faller tillbaka till en forsiktig rekommendation tills en riktig projektgren finns.",
      governanceSignal: "Nuvarande governance-signal",
      switchBranch: "Byt pricing-gren",
      baselineExists: "Baseline finns",
      outcomeClarity: "Outcome-tydlighet",
      scopeStability: "Scope-stabilitet",
      importedLineage: "Importerad lineage",
      lineageDescription: (epics: number, stories: number) => `Synligt i vald gren: ${epics} epics, ${stories} stories.`,
      whyRecommended: "Varfor denna modell rekommenderas",
      whyRecommendedBody:
        "Rekommendationen uppdateras med Framing-, Value Spine- och governance-signaler, men valjer inget automatiskt.",
      simpleFlow: "Enkel valjlogik",
      processGuardrails: "Processracken",
      processGuardrailsBody: "Dessa AAS-kontroller galler fortfarande aven nar pricing-vagledningen ser stark ut.",
      blockingItems: "Blockerande punkter",
      blockingItemsBody: "Dessa fragor gor att pricing-laget inte ar i ett rent gront tillstand.",
      noBlocking: "Inga blockerande pricing-fragor ar synliga just nu.",
      visibleRisks: "Risker att halla synliga",
      visibleRisksBody: "Dessa punkter blockerar inte all pricing-diskussion, men de ska forbli explicita.",
      noVisibleRisks: "Inga ytterligare pricing-risker ar synliga just nu.",
      models: "Prismodeller",
      modelsBody: "Alla tre modellerna visas fortfarande sa att rekommendationen blir forklarbar i stallet for dold i en svart lada.",
      recommendedChip: "Rekommenderad",
      whenToUse: "Nar den passar",
      strengths: "Styrkor",
      risks: "Risker"
    };
  }

  return {
    sectionLabel: "Pricing",
    unavailable: "Unavailable",
    unavailableTitle: "Pricing is unavailable",
    unavailableDescription: "The pricing workspace could not be loaded.",
    backHome: "Back to Home",
    projectSection: "Project section",
    heroBadge: "Commercial fit",
    heroTitle: "Pricing guidance",
    heroDescription:
      "Pricing is advisory only. This page uses the active project context to suggest a suitable AAS pricing model and show what still blocks commercial confidence.",
    warningTitle: "Pricing does not equal approval",
    warningBody:
      "Human Review, governance validation, Value Spine progression and tollgates remain separate. Pricing recommends a model, but it does not create a bypass around AAS controls.",
    classification: "Project classification",
    readiness: "Pricing readiness",
    recommended: "Recommended model",
    currentAi: "Current AI level",
    pricingContext: "Pricing context",
    anchoredTo: (key: string) => `Commercial guidance is currently anchored to ${key} inside the active project.`,
    contextFallback: "Pricing can load before Framing is complete, but it will stay conservative until a project branch exists.",
    openFraming: "Open Framing",
    openValueSpine: "Open Value Spine",
    openGovernance: "Open Governance",
    riskProfile: "risk profile",
    missingOutcome: "Outcome statement is still missing.",
    noActiveFraming: "No active Framing branch yet",
    noActiveFramingBody: "Pricing still renders, but it falls back to a cautious recommendation until a real project branch is available.",
    governanceSignal: "Current governance signal",
    switchBranch: "Switch pricing branch",
    baselineExists: "Baseline exists",
    outcomeClarity: "Outcome clarity",
    scopeStability: "Scope stability",
    importedLineage: "Imported lineage",
    lineageDescription: (epics: number, stories: number) => `Visible in the selected branch: ${epics} epics, ${stories} stories.`,
    whyRecommended: "Why this model is recommended",
    whyRecommendedBody: "The recommendation updates with Framing, Value Spine and governance signals, but it does not auto-select anything.",
    simpleFlow: "Simple selection flow",
    processGuardrails: "Process guardrails",
    processGuardrailsBody: "These AAS controls remain in force even when pricing guidance looks strong.",
    blockingItems: "Blocking items",
    blockingItemsBody: "These issues keep the pricing posture out of a clean green state.",
    noBlocking: "No blocking pricing issues are currently visible.",
    visibleRisks: "Risks to keep visible",
    visibleRisksBody: "These items do not block all pricing discussion, but they should stay explicit.",
    noVisibleRisks: "No additional pricing risks are currently visible.",
    models: "Pricing models",
    modelsBody: "All three models stay visible so the recommendation is explainable rather than hidden inside a black box.",
    recommendedChip: "Recommended",
    whenToUse: "When to use",
    strengths: "Strengths",
    risks: "Risks"
  };
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const organization = await requireOrganizationContext();
  const language = await getServerLanguage();
  const t = getCopy(language);
  const query = searchParams ? await searchParams : {};
  const outcomeId = getParamValue(query.outcomeId);
  const pricing = await getProjectPricingWorkspaceService({
    organizationId: organization.organizationId,
    ...(outcomeId ? { outcomeId } : {})
  });

  if (!pricing.ok) {
    return (
      <AppShell topbarProps={{ projectName: organization.organizationName, sectionLabel: t.sectionLabel, badge: t.unavailable }}>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{t.unavailableTitle}</CardTitle>
            <CardDescription>{pricing.errors[0]?.message ?? t.unavailableDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/">{t.backHome}</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const data = pricing.data;
  const selectedOutcome = data.selectedOutcome;
  const classificationTone = data.evaluation.classification.key === "uncertain_fallback" ? "risk" : "neutral";
  const readinessTone =
    data.evaluation.readiness.state === "ready"
      ? "ready"
      : data.evaluation.readiness.state === "conditionally_ready"
        ? "risk"
        : "blocked";

  return (
    <AppShell topbarProps={{ projectName: organization.organizationName, sectionLabel: t.sectionLabel, badge: t.projectSection }}>
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(24,63,94,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,248,252,0.94))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.85fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                {t.heroBadge}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">{t.heroTitle}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{t.heroDescription}</p>
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/85 p-4 text-sm text-sky-950">
                <p className="font-medium">{t.warningTitle}</p>
                <p className="mt-2">{t.warningBody}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses({ tone: classificationTone })}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.classification}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{data.evaluation.classification.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.evaluation.classification.description}</p>
              </div>
              <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses({ tone: readinessTone })}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.readiness}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{data.evaluation.readiness.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.evaluation.readiness.description}</p>
              </div>
              <div className="rounded-3xl border border-sky-200 bg-sky-50/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{t.recommended}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-sky-950">{data.evaluation.recommendation.label}</p>
                <p className="mt-2 text-sm leading-6 text-sky-900/80">{language === "sv" ? "Rekommenderad, men inte framtvingad." : "Recommended, but not enforced."}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.currentAi}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">{formatAiLevel(data.signals.aiLevel.value, language)}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.signals.aiLevel.detail}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))] shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>{t.pricingContext}</CardTitle>
                <CardDescription>{selectedOutcome ? t.anchoredTo(selectedOutcome.key) : t.contextFallback}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={selectedOutcome ? `/framing?outcomeId=${selectedOutcome.id}` : "/framing"}>
                    <Compass className="mr-2 h-4 w-4" />
                    {t.openFraming}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={selectedOutcome ? `/workspace?framing=${selectedOutcome.id}` : "/workspace"}>
                    <Workflow className="mr-2 h-4 w-4" />
                    {t.openValueSpine}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link
                    href={
                      selectedOutcome
                        ? `/governance?view=readiness&sourceEntity=outcome&sourceId=${selectedOutcome.id}&level=${data.governance.selectedAiLevel}`
                        : `/governance?view=readiness&level=${data.governance.selectedAiLevel}`
                    }
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {t.openGovernance}
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
              <div className="rounded-3xl border border-border/70 bg-background/90 p-5">
                {selectedOutcome ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">{selectedOutcome.key}</span>
                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatAiLevel(selectedOutcome.aiAccelerationLevel, language)}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {selectedOutcome.riskProfile} {t.riskProfile}
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-foreground">{selectedOutcome.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedOutcome.outcomeStatement ?? t.missingOutcome}</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-foreground">{t.noActiveFraming}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.noActiveFramingBody}</p>
                  </>
                )}
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/15 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.governanceSignal}</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{data.governance.summaryTitle}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.governance.summaryMessage}</p>
              </div>
            </div>

            {data.availableOutcomes.length > 1 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t.switchBranch}</p>
                <div className="-mx-1 overflow-x-auto pb-1">
                  <div className="flex min-w-max gap-2 px-1">
                    {data.availableOutcomes.map((outcome) => (
                      <Button asChild key={outcome.id} size="sm" variant={selectedOutcome?.id === outcome.id ? "default" : "secondary"}>
                        <Link href={`/pricing?outcomeId=${outcome.id}`}>{outcome.key}: {outcome.title}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ActionSummaryCard className="border-border/70 bg-background/90 shadow-sm" description={data.signals.baseline.detail} label={t.baselineExists} value={data.signals.baseline.value === "yes" ? "Yes" : "No"} />
              <ActionSummaryCard className="border-border/70 bg-background/90 shadow-sm" description={data.signals.outcomeClarity.detail} label={t.outcomeClarity} value={formatSignalValue(data.signals.outcomeClarity.value, language)} />
              <ActionSummaryCard className="border-border/70 bg-background/90 shadow-sm" description={data.signals.scopeStability.detail} label={t.scopeStability} value={formatSignalValue(data.signals.scopeStability.value, language)} />
              <ActionSummaryCard className="border-border/70 bg-background/90 shadow-sm" description={t.lineageDescription(data.summary.epicCount, data.summary.storyCount)} label={t.importedLineage} value={data.summary.importedLineageCount} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t.whyRecommended}</CardTitle>
              <CardDescription>{t.whyRecommendedBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.evaluation.recommendation.rationale.map((reason) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground" key={reason}>
                  {reason}
                </div>
              ))}

              <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
                <p className="font-medium">{t.simpleFlow}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">{language === "sv" ? "Framing-signaler" : "Framing signals"}</span>
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">{language === "sv" ? "Projektklassificering" : "Project classification"}</span>
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">{language === "sv" ? "Vagledande prismodell" : "Advisory pricing model"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t.processGuardrails}</CardTitle>
              <CardDescription>{t.processGuardrailsBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.guardrails.map((guardrail) => (
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm ${guardrail.status === "covered" ? "border-emerald-200 bg-emerald-50/80 text-emerald-950" : "border-amber-200 bg-amber-50/80 text-amber-950"}`}
                  key={guardrail.key}
                >
                  <p className="font-medium">{guardrail.title}</p>
                  <p className="mt-2">{guardrail.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t.blockingItems}</CardTitle>
              <CardDescription>{t.blockingItemsBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.blockers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-950">{t.noBlocking}</div>
              ) : (
                data.evaluation.blockers.map((item) => (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4 text-sm text-rose-950" key={item.key}>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-2">{item.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t.visibleRisks}</CardTitle>
              <CardDescription>{t.visibleRisksBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.risks.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-950">{t.noVisibleRisks}</div>
              ) : (
                data.evaluation.risks.map((item) => (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-950" key={item.key}>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-2">{item.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{t.models}</CardTitle>
            <CardDescription>{t.modelsBody}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-3">
            {data.evaluation.models.map((model) => {
              const recommended = model.key === data.evaluation.recommendation.modelKey;

              return (
                <div className={`rounded-3xl border p-5 ${recommended ? "border-sky-300 bg-sky-50/80 shadow-sm" : "border-border/70 bg-muted/15"}`} key={model.key}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{model.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{model.tagline}</p>
                    </div>
                    {recommended ? (
                      <span className="inline-flex rounded-full border border-sky-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
                        {t.recommendedChip}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-4 text-sm">
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">{t.whenToUse}</p>
                      <p className="mt-2 leading-6 text-muted-foreground">{model.whenToUse}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">{t.strengths}</p>
                      <div className="mt-2 space-y-2 text-muted-foreground">
                        {model.strengths.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">{t.risks}</p>
                      <div className="mt-2 space-y-2 text-muted-foreground">
                        {model.risks.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
