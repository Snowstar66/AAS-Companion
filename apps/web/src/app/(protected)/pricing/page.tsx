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
  return value ? value.replaceAll("_", " ") : language === "sv" ? "Inte vald ännu" : "Not selected yet";
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

function formatRiskProfile(value: string, language: AppLanguage) {
  if (language !== "sv") return value;
  if (value === "low") return "låg";
  if (value === "medium") return "medel";
  if (value === "high") return "hög";
  return value;
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
      unavailable: "Ej tillgänglig",
      unavailableTitle: "Pricing är inte tillgänglig",
      unavailableDescription: "Pricing-arbetsytan kunde inte laddas.",
      backHome: "Tillbaka till Hem",
      projectSection: "Projektsektion",
      heroBadge: "Commercial fit",
      heroTitle: "Pricing guidance",
      heroDescription:
        "Pricing är enbart vägledande. Den här sidan använder aktiv projektkontext för att föreslå en lämplig AAS-prismodell och visa vad som fortfarande blockerar kommersiell trygghet.",
      warningTitle: "Pricing är inte samma sak som approval",
      warningBody:
        "Human Review, governance-validering, Value Spine-progression och tollgates ligger fortfarande separat. Pricing rekommenderar en modell, men skapar ingen genväg runt AAS-kontroller.",
      classification: "Projektklassificering",
      readiness: "Pricing-readiness",
      recommended: "Rekommenderad modell",
      currentAi: "Nuvarande AI-nivå",
      pricingContext: "Pricing-kontext",
      anchoredTo: (key: string) => `Kommersiell vägledning är just nu förankrad i ${key} i det aktiva projektet.`,
      contextFallback:
        "Pricing kan laddas innan Framing är klar, men den förblir konservativ tills en projektgren finns.",
      openFraming: "Öppna Framing",
      openValueSpine: "Öppna Value Spine",
      openGovernance: "Öppna Governance",
      riskProfile: "riskprofil",
      missingOutcome: "Outcome-beskrivning saknas fortfarande.",
      noActiveFraming: "Ingen aktiv Framing-gren ännu",
      noActiveFramingBody:
        "Pricing visas fortfarande, men faller tillbaka till en försiktig rekommendation tills en riktig projektgren finns.",
      governanceSignal: "Nuvarande governance-signal",
      switchBranch: "Byt pricing-gren",
      baselineExists: "Baseline finns",
      outcomeClarity: "Outcome-tydlighet",
      scopeStability: "Scope-stabilitet",
      importedLineage: "Importerad lineage",
      lineageDescription: (epics: number, stories: number) => `Synligt i vald gren: ${epics} epics, ${stories} stories.`,
      whyRecommended: "Varför denna modell rekommenderas",
      whyRecommendedBody:
        "Rekommendationen uppdateras med Framing-, Value Spine- och governance-signaler, men väljer inget automatiskt.",
      simpleFlow: "Enkel väljlogik",
      processGuardrails: "Processräcken",
      processGuardrailsBody: "Dessa AAS-kontroller gäller fortfarande även när pricing-vägledningen ser stark ut.",
      blockingItems: "Blockerande punkter",
      blockingItemsBody: "Dessa frågor gör att pricing-läget inte är i ett rent grönt tillstånd.",
      noBlocking: "Inga blockerande pricing-frågor är synliga just nu.",
      visibleRisks: "Risker att hålla synliga",
      visibleRisksBody: "Dessa punkter blockerar inte all pricing-diskussion, men de ska förbli explicita.",
      noVisibleRisks: "Inga ytterligare pricing-risker är synliga just nu.",
      models: "Prismodeller",
      modelsBody: "Alla tre modellerna visas fortfarande så att rekommendationen blir förklarbar i stället för dold i en svart låda.",
      recommendedChip: "Rekommenderad",
      whenToUse: "När den passar",
      strengths: "Styrkor",
      risks: "Risker",
      yes: "Ja",
      no: "Nej",
      framingSignals: "Framing-signaler",
      projectClassification: "Projektklassificering",
      advisoryPricingModel: "Vägledande prismodell",
      recommendedNotEnforced: "Rekommenderad, men inte framtvingad."
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
    risks: "Risks",
    yes: "Yes",
    no: "No",
    framingSignals: "Framing signals",
    projectClassification: "Project classification",
    advisoryPricingModel: "Advisory pricing model",
    recommendedNotEnforced: "Recommended, but not enforced."
  };
}

function translateClassification(input: { key: string; label: string; description: string }, language: AppLanguage) {
  if (language !== "sv") return input;

  const translations: Record<string, { label: string; description: string }> = {
    existing_delivery: {
      label: "Befintlig leverans",
      description:
        "Projektet ser ut som en förbättring av en befintlig leveranskontext med tillräcklig baseline och scopestruktur för att jämföra före- och efterläge."
    },
    new_build: {
      label: "Nyutveckling",
      description:
        "Projektet har tydlig måleffekt och avgränsat scope, men saknar en trovärdig baseline som skulle stödja en gain-share-lik jämförelse."
    },
    uncertain_fallback: {
      label: "Osäkert / fallback",
      description:
        "Den kommersiella formen bör förbli konservativ eftersom projektkontexten fortfarande är för otydlig, instabil eller governance-känslig."
    }
  };

  return translations[input.key] ?? input;
}

function translateReadiness(input: { state: string; label: string; description: string }, language: AppLanguage) {
  if (language !== "sv") return input;

  const translations: Record<string, { label: string; description: string }> = {
    ready: {
      label: "Redo",
      description: "Framing- och governance-signaler stöder just nu en tydlig pricing-rekommendation."
    },
    conditionally_ready: {
      label: "Villkorat redo",
      description: "Pricing-vägledningen går att använda, men det finns fortfarande risker som ska hållas explicita."
    },
    not_ready: {
      label: "Inte redo",
      description: "Pricing kan diskuteras, men AAS-förutsättningarna blockerar fortfarande kommersiell trygghet."
    }
  };

  return translations[input.state] ?? input;
}

function translateRecommendationLabel(label: string, language: AppLanguage) {
  if (language !== "sv") return label;
  return label;
}

function translateRecommendationReason(reason: string, language: AppLanguage) {
  if (language !== "sv") return reason;

  if (reason === "Baseline is present.") return "Baseline finns.";
  if (reason === "Baseline is still missing.") return "Baseline saknas fortfarande.";
  if (reason === "Scope looks sufficiently bounded.") return "Scopet ser tillräckligt avgränsat ut.";
  if (reason === "Scope still looks unstable.") return "Scopet ser fortfarande instabilt ut.";
  if (reason === "The project resembles measurable improvement work rather than an unconstrained new build.") {
    return "Projektet liknar mätbart förbättringsarbete snarare än ett obundet nybygge.";
  }
  if (reason === "The project looks like bounded capability creation rather than measurable gain-share delivery.") {
    return "Projektet ser ut som avgränsad kapabilitetsutveckling snarare än mätbar gain-share-leverans.";
  }
  if (reason === "The project context is not yet stable enough to anchor a stronger pricing commitment.") {
    return "Projektkontexten är ännu inte stabil nog för att bära ett starkare pricing-åtagande.";
  }

  const aiLevelMatch = reason.match(/^AI level is (.+), which is compatible with a more performance-linked model\.$/);
  if (aiLevelMatch) {
    return `AI-nivån är ${aiLevelMatch[1]}, vilket är förenligt med en mer prestationskopplad modell.`;
  }

  const aiBuildMatch = reason.match(/^AI level is (.+), so the commercial shape should support accelerated build without pretending pricing is governance approval\.$/);
  if (aiBuildMatch) {
    return `AI-nivån är ${aiBuildMatch[1]}, så den kommersiella formen bör stödja accelererad utveckling utan att låtsas att pricing är governance-approval.`;
  }

  const aiFallbackMatch = reason.match(/^AI level is (.+), so a conservative commercial fallback is safer while framing and governance still mature\.$/);
  if (aiFallbackMatch) {
    return `AI-nivån är ${aiFallbackMatch[1]}, så en konservativ kommersiell fallback är säkrare medan framing och governance fortfarande mognar.`;
  }

  return reason;
}

function translateSignalDetail(detail: string, language: AppLanguage) {
  if (language !== "sv") return detail;

  const translations: Record<string, string> = {
    "Baseline definition and source are both present.": "Baseline-definition och källa finns båda på plats.",
    "Baseline definition and source are not yet both visible.": "Baseline-definition och källa är ännu inte båda synliga.",
    "Problem statement and outcome statement are both visible.": "Problem statement och outcome statement är båda synliga.",
    "The business problem and intended effect are not yet clear enough together.":
      "Affärsproblemet och den avsedda effekten är ännu inte tillräckligt tydliga tillsammans.",
    "Timeframe is visible and the current epics all carry explicit scope boundaries without open risk notes.":
      "Timeframe är synlig och de aktuella epicsen har explicita scope-gränser utan öppna risknoteringar.",
    "Scope still looks unstable because timeframe, scope boundaries or risk notes are not yet clean.":
      "Scopet ser fortfarande instabilt ut eftersom timeframe, scope-gränser eller risknoteringar ännu inte är rena.",
    "No active Framing branch is selected yet, so pricing falls back to a cautious posture.":
      "Ingen aktiv Framing-gren är vald ännu, så pricing faller tillbaka till en försiktig hållning."
  };

  if (translations[detail]) {
    return translations[detail];
  }

  const currentBranchMatch = detail.match(/^Current Framing branch is set to (.+)\.$/);
  if (currentBranchMatch) {
    return `Aktuell Framing-gren är satt till ${currentBranchMatch[1]}.`;
  }

  return detail;
}

function translateGovernanceSummary(input: { summaryTitle: string; summaryMessage: string }, language: AppLanguage) {
  if (language !== "sv") return input;

  const titleMap: Record<string, string> = {
    "Staffing supports selected AI level": "Bemanningen stöder vald AI-nivå",
    "Staffing still needs attention": "Bemanningen behöver fortfarande uppmärksamhet"
  };

  const messageMap: Record<string, string> = {
    "Named staffing, role separation and agent supervision support level 2.":
      "Namngiven bemanning, rollseparation och agenttillsyn stöder nivå 2.",
    "The selected AI level has some coverage, but gaps still need to be closed.":
      "Den valda AI-nivån har viss täckning, men luckor behöver fortfarande stängas."
  };

  return {
    summaryTitle: titleMap[input.summaryTitle] ?? input.summaryTitle,
    summaryMessage: messageMap[input.summaryMessage] ?? input.summaryMessage
  };
}

function translatePricingItem(input: { key: string; title: string; description: string }, language: AppLanguage) {
  if (language !== "sv") {
    return input;
  }

  const translations: Record<string, { title: string; description: string }> = {
    value_spine_missing: {
      title: "Ingen aktiv Framing-gren",
      description:
        "Pricing kan granskas innan designen är klar, men den behöver fortfarande en aktiv Framing-gren så att den kommersiella diskussionen är kopplad till en riktig projektkontext."
    },
    missing_baseline: {
      title: "Baseline saknas",
      description:
        "AAS pricing-vägledning är svagare tills nuläget är fångat på ett trovärdigt sätt. Utan baseline bör starkare kommersiella modeller förbli blockerade."
    },
    unclear_outcome: {
      title: "Outcome är otydligt",
      description: "Pricing bör inte hårdna medan affärsproblemet och den avsedda effekten fortfarande är tvetydiga."
    },
    unstable_scope: {
      title: "Scopet är instabilt",
      description: "De synliga scope-gränserna är fortfarande för lösa för en stark kommersiell rekommendation."
    },
    governance_gap: {
      title: "Governance stöder ännu inte vald AI-nivå",
      description:
        "Pricing förblir endast vägledande, och starkare kommersiell trygghet bör förbli blockerad tills governance-täckningen stöder vald accelerationsnivå."
    },
    governance_attention: {
      title: "Governance behöver fortfarande uppmärksamhet",
      description:
        "Namngiven bemanning eller supervision finns delvis, men AI-nivån är inte tillräckligt ren för att pricing ska betraktas som kommersiellt trygg."
    },
    ai_level_mismatch: {
      title: "AI-nivån är låg för en efficiency-share-modell",
      description:
        "Controlled Efficiency Share är mer trovärdig när projektet siktar på minst level 2-acceleration med explicit governance."
    },
    high_ai_low_commercial_certainty: {
      title: "Hög AI-ambition med konservativ pricing-fallback",
      description:
        "Level 3-ambition är synlig, men pricing-säkerheten är fortfarande låg. Den mismatchen bör lösas genom tydligare framing eller lägre uttalad acceleration."
    }
  };

  return translations[input.key] ?? input;
}

function translateGuardrail(input: { key: string; title: string; description: string }, language: AppLanguage) {
  if (language !== "sv") {
    return input;
  }

  const translations: Record<string, { title: string; description: string }> = {
    human_review: {
      title: "Human Review ligger separat",
      description: "Pricing ersätter inte Human Review-gaten före promotion, även om importerad lineage är synlig i grenen."
    },
    governance: {
      title: "Governance-validering ligger separat",
      description: "Pricing-vägledning kan inte åsidosätta governance-validering eller öppna concerns."
    },
    value_spine: {
      title: "Value Spine-fullständighet ligger separat",
      description: "Pricing skapar ingen genväg runt Framing, Value Spine eller tollgate-progression."
    }
  };

  return translations[input.key] ?? input;
}

function translateModel(
  input: { key: string; title: string; tagline: string; whenToUse: string; strengths: string[]; risks: string[] },
  language: AppLanguage
) {
  if (language !== "sv") {
    return input;
  }

  const translations: Record<string, typeof input> = {
    controlled_efficiency_share: {
      key: input.key,
      title: "Controlled Efficiency Share",
      tagline: "Bäst när en mätbar baseline redan finns och effektivitetsvinster kan verifieras.",
      whenToUse: "Använd när projektet förbättrar en befintlig leveranskontext med stabilt scope, tydligt outcome och trovärdig baseline.",
      strengths: [
        "Kopplar pris till mätbar förbättring i stället för bara nedlagd tid.",
        "Fungerar väl när AAS-governance och AI-acceleration redan är trovärdiga.",
        "Håller kommersiell uppsida i linje med demonstrerad leveranseffekt."
      ],
      risks: [
        "Faller snabbt om baseline-kvaliteten är svag eller ifrågasatt.",
        "Kräver tajtare governance och spårbarhet än en lös leveransmodell.",
        "Passar dåligt när scopet fortfarande rör sig mycket."
      ]
    },
    accelerated_build_contract: {
      key: input.key,
      title: "Accelerated Build Contract",
      tagline: "Bäst när projektet är ett nybygge med tydlig måleffekt och avgränsat scope.",
      whenToUse: "Använd när affärseffekten är tydlig, scopet är tillräckligt avgränsat och teamet vill ha en byggfokuserad kommersiell ram.",
      strengths: [
        "Ger en tydlig kommersiell ram för skapande av ny kapabilitet.",
        "Matchar avgränsat design- och byggarbete bättre än ren T&M.",
        "Fungerar bra när AI-acceleration är avsedd men fortfarande styrd."
      ],
      risks: [
        "Blir skört om scope-gränserna inte respekteras.",
        "Behöver fortfarande governance-readiness innan hög acceleration är trovärdig.",
        "Mindre lämplig när baseline-kopplad gain share är huvudlogiken."
      ]
    },
    structured_tm: {
      key: input.key,
      title: "Structured T&M",
      tagline: "Säkrast som fallback när framing är ofullständig, scope är instabilt eller governance fortfarande behöver arbete.",
      whenToUse: "Använd när den kommersiella formen ska vara flexibel medan Framing, governance eller scope-säkerhet fortfarande mognar.",
      strengths: [
        "Absorberar osäkerhet bättre än gain-share eller kontraktstunga modeller.",
        "Minskar trycket att överlova innan AAS-förutsättningarna är verkliga.",
        "Är användbar som tillfällig kommersiell fallback medan projektet stabiliseras."
      ],
      risks: [
        "Ger svagare kommersiell hävstång runt effektivitetsoutcomes.",
        "Kan dölja svag framing om den ligger kvar för länge.",
        "Kräver aktiv governance-disciplin för att undvika drift."
      ]
    }
  };

  return translations[input.key] ?? input;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const emptySearchParams: Record<string, string | string[] | undefined> = {};
  const [organization, language, query] = await Promise.all([
    requireOrganizationContext(),
    getServerLanguage(),
    searchParams ? searchParams : Promise.resolve(emptySearchParams)
  ]);
  const copy = getCopy(language);
  const outcomeId = getParamValue(query.outcomeId);
  const pricing = await getProjectPricingWorkspaceService({
    organizationId: organization.organizationId,
    ...(outcomeId ? { outcomeId } : {})
  });

  if (!pricing.ok) {
    return (
      <AppShell topbarProps={{ projectName: organization.organizationName, sectionLabel: copy.sectionLabel, badge: copy.unavailable }}>
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{copy.unavailableTitle}</CardTitle>
            <CardDescription>{pricing.errors[0]?.message ?? copy.unavailableDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/">{copy.backHome}</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const data = pricing.data;
  const translatedClassification = translateClassification(data.evaluation.classification, language);
  const translatedReadiness = translateReadiness(data.evaluation.readiness, language);
  const translatedGovernance = translateGovernanceSummary(data.governance, language);
  const selectedOutcome = data.selectedOutcome;
  const classificationTone = data.evaluation.classification.key === "uncertain_fallback" ? "risk" : "neutral";
  const readinessTone =
    data.evaluation.readiness.state === "ready"
      ? "ready"
      : data.evaluation.readiness.state === "conditionally_ready"
        ? "risk"
        : "blocked";

  return (
    <AppShell topbarProps={{ projectName: organization.organizationName, sectionLabel: copy.sectionLabel, badge: copy.projectSection }}>
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(24,63,94,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,248,252,0.94))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.85fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                {copy.heroBadge}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">{copy.heroTitle}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{copy.heroDescription}</p>
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/85 p-4 text-sm text-sky-950">
                <p className="font-medium">{copy.warningTitle}</p>
                <p className="mt-2">{copy.warningBody}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses({ tone: classificationTone })}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.classification}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{translatedClassification.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{translatedClassification.description}</p>
              </div>
              <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses({ tone: readinessTone })}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.readiness}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{translatedReadiness.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{translatedReadiness.description}</p>
              </div>
              <div className="rounded-3xl border border-sky-200 bg-sky-50/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{copy.recommended}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-sky-950">
                  {translateRecommendationLabel(data.evaluation.recommendation.label, language)}
                </p>
                <p className="mt-2 text-sm leading-6 text-sky-900/80">{copy.recommendedNotEnforced}</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.currentAi}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                  {formatAiLevel(data.signals.aiLevel.value, language)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {translateSignalDetail(data.signals.aiLevel.detail, language)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))] shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>{copy.pricingContext}</CardTitle>
                <CardDescription>{selectedOutcome ? copy.anchoredTo(selectedOutcome.key) : copy.contextFallback}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={selectedOutcome ? `/framing?outcomeId=${selectedOutcome.id}` : "/framing"}>
                    <Compass className="mr-2 h-4 w-4" />
                    {copy.openFraming}
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={selectedOutcome ? `/workspace?framing=${selectedOutcome.id}` : "/workspace"}>
                    <Workflow className="mr-2 h-4 w-4" />
                    {copy.openValueSpine}
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
                    {copy.openGovernance}
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
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {selectedOutcome.key}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatAiLevel(selectedOutcome.aiAccelerationLevel, language)}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatRiskProfile(selectedOutcome.riskProfile, language)} {copy.riskProfile}
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-foreground">{selectedOutcome.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {selectedOutcome.outcomeStatement ?? copy.missingOutcome}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-foreground">{copy.noActiveFraming}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.noActiveFramingBody}</p>
                  </>
                )}
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/15 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.governanceSignal}</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{translatedGovernance.summaryTitle}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{translatedGovernance.summaryMessage}</p>
              </div>
            </div>

            {data.availableOutcomes.length > 1 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.switchBranch}</p>
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
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={translateSignalDetail(data.signals.baseline.detail, language)}
                label={copy.baselineExists}
                value={data.signals.baseline.value === "yes" ? copy.yes : copy.no}
              />
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={translateSignalDetail(data.signals.outcomeClarity.detail, language)}
                label={copy.outcomeClarity}
                value={formatSignalValue(data.signals.outcomeClarity.value, language)}
              />
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={translateSignalDetail(data.signals.scopeStability.detail, language)}
                label={copy.scopeStability}
                value={formatSignalValue(data.signals.scopeStability.value, language)}
              />
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={copy.lineageDescription(data.summary.epicCount, data.summary.storyCount)}
                label={copy.importedLineage}
                value={data.summary.importedLineageCount}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{copy.whyRecommended}</CardTitle>
              <CardDescription>{copy.whyRecommendedBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.evaluation.recommendation.rationale.map((reason) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground" key={reason}>
                  {translateRecommendationReason(reason, language)}
                </div>
              ))}

              <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
                <p className="font-medium">{copy.simpleFlow}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">{copy.framingSignals}</span>
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">{copy.projectClassification}</span>
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">{copy.advisoryPricingModel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{copy.processGuardrails}</CardTitle>
              <CardDescription>{copy.processGuardrailsBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.guardrails.map((guardrail) => {
                const translated = translateGuardrail(guardrail, language);
                return (
                  <div
                    className={`rounded-2xl border px-4 py-4 text-sm ${
                      guardrail.status === "covered"
                        ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                        : "border-amber-200 bg-amber-50/80 text-amber-950"
                    }`}
                    key={guardrail.key}
                  >
                    <p className="font-medium">{translated.title}</p>
                    <p className="mt-2">{translated.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{copy.blockingItems}</CardTitle>
              <CardDescription>{copy.blockingItemsBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.blockers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-950">
                  {copy.noBlocking}
                </div>
              ) : (
                data.evaluation.blockers.map((item) => {
                  const translated = translatePricingItem(item, language);
                  return (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4 text-sm text-rose-950" key={item.key}>
                      <p className="font-medium">{translated.title}</p>
                      <p className="mt-2">{translated.description}</p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{copy.visibleRisks}</CardTitle>
              <CardDescription>{copy.visibleRisksBody}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.risks.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-950">
                  {copy.noVisibleRisks}
                </div>
              ) : (
                data.evaluation.risks.map((item) => {
                  const translated = translatePricingItem(item, language);
                  return (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-950" key={item.key}>
                      <p className="font-medium">{translated.title}</p>
                      <p className="mt-2">{translated.description}</p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{copy.models}</CardTitle>
            <CardDescription>{copy.modelsBody}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-3">
            {data.evaluation.models.map((model) => {
              const recommended = model.key === data.evaluation.recommendation.modelKey;
              const translated = translateModel(model, language);

              return (
                <div
                  className={`rounded-3xl border p-5 ${recommended ? "border-sky-300 bg-sky-50/80 shadow-sm" : "border-border/70 bg-muted/15"}`}
                  key={model.key}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{translated.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{translated.tagline}</p>
                    </div>
                    {recommended ? (
                      <span className="inline-flex rounded-full border border-sky-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
                        {copy.recommendedChip}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-4 text-sm">
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">{copy.whenToUse}</p>
                      <p className="mt-2 leading-6 text-muted-foreground">{translated.whenToUse}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">{copy.strengths}</p>
                      <div className="mt-2 space-y-2 text-muted-foreground">
                        {translated.strengths.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">{copy.risks}</p>
                      <div className="mt-2 space-y-2 text-muted-foreground">
                        {translated.risks.map((item) => (
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
