"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Bot, CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { InlineFieldGuidance } from "@/components/shared/context-help";
import { formatAiLevelLabel } from "@/lib/help/aas-help";

type RiskLevel = "low" | "medium" | "high";
type AiLevel = "level_1" | "level_2" | "level_3";
type AiExecutionPattern = "assisted" | "step_by_step" | "orchestrated";

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

type OutcomeAiRiskPostureCardProps = {
  defaultAiLevel: AiLevel;
  defaultRiskProfile: RiskLevel;
  defaultAiExecutionPattern: AiExecutionPattern | null;
  defaultAiUsageIntent: string | null;
  defaultBusinessImpactLevel: RiskLevel | null;
  defaultBusinessImpactRationale: string | null;
  defaultDataSensitivityLevel: RiskLevel | null;
  defaultDataSensitivityRationale: string | null;
  defaultBlastRadiusLevel: RiskLevel | null;
  defaultBlastRadiusRationale: string | null;
  defaultDecisionImpactLevel: RiskLevel | null;
  defaultDecisionImpactRationale: string | null;
  defaultAiLevelJustification: string | null;
  embedded?: boolean | undefined;
  disabled?: boolean | undefined;
};

function deriveAiLevelFromExecutionPattern(pattern: AiExecutionPattern | null) {
  if (pattern === "assisted") {
    return "level_1" as const;
  }

  if (pattern === "step_by_step") {
    return "level_2" as const;
  }

  if (pattern === "orchestrated") {
    return "level_3" as const;
  }

  return null;
}

function deriveExecutionPatternFromAiLevel(level: AiLevel) {
  if (level === "level_1") {
    return "assisted" as const;
  }

  if (level === "level_2") {
    return "step_by_step" as const;
  }

  return "orchestrated" as const;
}

function formatExecutionPattern(value: AiExecutionPattern | null, language: "en" | "sv") {
  if (value === "assisted") {
    return t(language, "Assisted delivery", "Assisterad leverans");
  }

  if (value === "step_by_step") {
    return t(language, "Structured acceleration", "Strukturerad acceleration");
  }

  if (value === "orchestrated") {
    return t(language, "Orchestrated agentic delivery", "Orkestrerad agentisk leverans");
  }

  return t(language, "Not determined", "Inte fastställd");
}

function getExecutionPatternGuidance(value: AiExecutionPattern | null, language: "en" | "sv") {
  if (value === "assisted") {
    return t(language, "AI supports a human interactively. No workflow automation. Human makes all decisions.", "AI stöttar en människa interaktivt. Ingen arbetsflödesautomation. Människan fattar alla beslut.");
  }

  if (value === "step_by_step") {
    return t(language, "AI produces artifacts one step at a time. Human review happens between each step.", "AI producerar artefakter ett steg i taget. Mänsklig granskning sker mellan varje steg.");
  }

  if (value === "orchestrated") {
    return t(language, "AI executes multiple chained steps through workflows or agents with stronger governance.", "AI kör flera kedjade steg genom arbetsflöden eller agenter med starkare governance.");
  }

  return t(language, "Select the execution pattern that best describes how AI will actually be used.", "Välj det exekveringsmönster som bäst beskriver hur AI faktiskt ska användas.");
}

function getAiLevelLifecycleExample(value: AiLevel, language: "en" | "sv") {
  if (value === "level_1") {
    return t(language, "Level 1 is light BMAD-style support: clarification, drafting, limited refinement and light validation under direct human control.", "Nivå 1 är lätt BMAD-liknande stöd: förtydligande, utkast, begränsad förfining och lätt validering under direkt mänsklig kontroll.");
  }

  if (value === "level_2") {
    return t(language, "Level 2 fits structured BMAD support across story refinement, design support, code generation and test support under human governance.", "Nivå 2 passar strukturerat BMAD-stöd över story refinement, designstöd, kodgenerering och teststöd under mänsklig governance.");
  }

  return t(language, "Level 3 fits agentic or semi-automated BMAD-style workflows where AI can drive multi-step refinement, design, build and test activities with stronger governance.", "Nivå 3 passar agentiska eller semiautomatiserade BMAD-liknande arbetsflöden där AI kan driva flerstegsarbete inom refinement, design, build och test med starkare governance.");
}

function getAiUsageIntentPlaceholder(value: AiLevel, language: "en" | "sv") {
  if (value === "level_1") {
    return t(language, "Example: AI will be used lightly for framing support, clarification and limited refinement under direct human control.", "Exempel: AI används lätt för framingstöd, förtydligande och begränsad förfining under direkt mänsklig kontroll.");
  }

  if (value === "level_2") {
    return t(language, "Example: AI will be used across story refinement, design support, code generation and test support under human governance.", "Exempel: AI används över story refinement, designstöd, kodgenerering och teststöd under mänsklig governance.");
  }

  return t(language, "Example: AI will support and partially automate refinement, design, code generation and test workflows with explicit human supervision and governance.", "Exempel: AI ska stödja och delvis automatisera refinement-, design-, kodgenererings- och testflöden med explicit mänsklig tillsyn och governance.");
}

function getRiskWeight(level: RiskLevel) {
  if (level === "high") {
    return 3;
  }

  if (level === "medium") {
    return 2;
  }

  return 1;
}

function deriveRiskProfile(levels: Array<RiskLevel | null>) {
  const presentLevels = levels.filter((level): level is RiskLevel => Boolean(level));
  const [firstLevel, ...remainingLevels] = presentLevels;

  if (levels.some((level) => !level) || !firstLevel) {
    return null;
  }

  return remainingLevels.reduce<RiskLevel>(
    (highest, current) => (getRiskWeight(current) > getRiskWeight(highest) ? current : highest),
    firstLevel
  );
}

function formatRiskLevel(value: RiskLevel | null, language: "en" | "sv") {
  if (!value) {
    return t(language, "Not determined", "Inte fastställd");
  }

  if (language === "sv") {
    if (value === "low") return "Låg";
    if (value === "medium") return "Medel";
    return "Hög";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatAiLevel(value: AiLevel) {
  return formatAiLevelLabel(value);
}

function getStatusTone(blockerCount: number, derivedRisk: RiskLevel | null, aiLevel: AiLevel) {
  if (blockerCount > 0) {
    return {
      label: "Needs action",
      classes: "border-amber-200 bg-amber-50 text-amber-900",
      icon: <TriangleAlert className="h-4 w-4" />
    };
  }

  if (derivedRisk && aiLevel === "level_3") {
    return {
      label: "Ready for review",
      classes: "border-sky-200 bg-sky-50 text-sky-900",
      icon: <ShieldAlert className="h-4 w-4" />
    };
  }

  return {
    label: "Ready for review",
    classes: "border-sky-200 bg-sky-50 text-sky-900",
    icon: <CheckCircle2 className="h-4 w-4" />
  };
}

function StepCard(props: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{props.title}</p>
      <p className="framing-guidance-copy mt-2 text-sm leading-6 text-muted-foreground">{props.description}</p>
      <div className="mt-4">{props.children}</div>
    </div>
  );
}

function RiskDimensionFields(props: {
  label: string;
  levelName: string;
  rationaleName: string;
  defaultLevel: RiskLevel | null;
  defaultRationale: string | null;
  disabled: boolean;
  onLevelChange: (value: RiskLevel | null) => void;
  onRationaleChange: (value: string) => void;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/10 p-3.5">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{props.label}</p>
      <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Level</span>
          <select
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
            defaultValue={props.defaultLevel ?? ""}
            disabled={props.disabled}
            name={props.levelName}
            onChange={(event) => {
              const value = event.target.value;
              props.onLevelChange(value === "low" || value === "medium" || value === "high" ? value : null);
            }}
          >
            <option value="">Select level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Rationale</span>
          <span className="framing-guidance-copy block text-xs leading-5 text-muted-foreground">{props.helper}</span>
          <textarea
            className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
            defaultValue={props.defaultRationale ?? ""}
            disabled={props.disabled}
            name={props.rationaleName}
            onChange={(event) => props.onRationaleChange(event.target.value)}
            placeholder={props.helper}
          />
        </label>
      </div>
    </div>
  );
}

export function OutcomeAiRiskPostureCard({
  defaultAiLevel,
  defaultRiskProfile,
  defaultAiExecutionPattern,
  defaultAiUsageIntent,
  defaultBusinessImpactLevel,
  defaultBusinessImpactRationale,
  defaultDataSensitivityLevel,
  defaultDataSensitivityRationale,
  defaultBlastRadiusLevel,
  defaultBlastRadiusRationale,
  defaultDecisionImpactLevel,
  defaultDecisionImpactRationale,
  defaultAiLevelJustification,
  embedded = false,
  disabled = false
}: OutcomeAiRiskPostureCardProps) {
  const { language } = useAppChromeLanguage();
  const [aiExecutionPattern, setAiExecutionPattern] = useState<AiExecutionPattern | null>(
    defaultAiExecutionPattern ?? deriveExecutionPatternFromAiLevel(defaultAiLevel)
  );
  const [aiUsageIntent, setAiUsageIntent] = useState(defaultAiUsageIntent ?? "");
  const [businessImpactLevel, setBusinessImpactLevel] = useState<RiskLevel | null>(defaultBusinessImpactLevel);
  const [businessImpactRationale, setBusinessImpactRationale] = useState(defaultBusinessImpactRationale ?? "");
  const [dataSensitivityLevel, setDataSensitivityLevel] = useState<RiskLevel | null>(defaultDataSensitivityLevel);
  const [dataSensitivityRationale, setDataSensitivityRationale] = useState(defaultDataSensitivityRationale ?? "");
  const [blastRadiusLevel, setBlastRadiusLevel] = useState<RiskLevel | null>(defaultBlastRadiusLevel);
  const [blastRadiusRationale, setBlastRadiusRationale] = useState(defaultBlastRadiusRationale ?? "");
  const [decisionImpactLevel, setDecisionImpactLevel] = useState<RiskLevel | null>(defaultDecisionImpactLevel);
  const [decisionImpactRationale, setDecisionImpactRationale] = useState(defaultDecisionImpactRationale ?? "");
  const [aiLevelJustification, setAiLevelJustification] = useState(defaultAiLevelJustification ?? "");
  const aiLevel = deriveAiLevelFromExecutionPattern(aiExecutionPattern) ?? defaultAiLevel;

  const derivedRisk = useMemo(
    () =>
      deriveRiskProfile([
        businessImpactLevel,
        dataSensitivityLevel,
        blastRadiusLevel,
        decisionImpactLevel
      ]),
    [businessImpactLevel, dataSensitivityLevel, blastRadiusLevel, decisionImpactLevel]
  );

  const blockers = useMemo(() => {
    const items: string[] = [];

    if (!aiExecutionPattern) {
      items.push(t(language, "Missing AI execution pattern.", "AI-exekveringsmönster saknas."));
    }

    if (!aiUsageIntent.trim()) {
      items.push(t(language, "Missing AI usage across lifecycle.", "AI-användning över livscykeln saknas."));
    }

    if (!businessImpactLevel) {
      items.push(t(language, "Missing business impact classification.", "Klassificering av affärspåverkan saknas."));
    }

    if (!businessImpactRationale.trim()) {
      items.push(t(language, "Missing business impact rationale.", "Motivering för affärspåverkan saknas."));
    }

    if (!dataSensitivityLevel) {
      items.push(t(language, "Missing data sensitivity classification.", "Klassificering av datakänslighet saknas."));
    }

    if (!dataSensitivityRationale.trim()) {
      items.push(t(language, "Missing data sensitivity rationale.", "Motivering för datakänslighet saknas."));
    }

    if (!blastRadiusLevel) {
      items.push(t(language, "Missing blast radius classification.", "Klassificering av sprängradie saknas."));
    }

    if (!blastRadiusRationale.trim()) {
      items.push(t(language, "Missing blast radius rationale.", "Motivering för sprängradie saknas."));
    }

    if (!decisionImpactLevel) {
      items.push(t(language, "Missing decision impact classification.", "Klassificering av beslutspåverkan saknas."));
    }

    if (!decisionImpactRationale.trim()) {
      items.push(t(language, "Missing decision impact rationale.", "Motivering för beslutspåverkan saknas."));
    }

    if (!derivedRisk) {
      items.push(t(language, "Risk profile cannot be determined until all four risk dimensions are classified.", "Riskprofil kan inte fastställas förrän alla fyra riskdimensioner är klassificerade."));
    }

    if (aiLevel === "level_3" && !aiLevelJustification.trim()) {
      items.push(t(language, "Level 3 requires explicit governance justification.", "Nivå 3 kräver en explicit governance-motivering."));
    }

    return items;
  }, [
    aiExecutionPattern,
    aiLevel,
    aiLevelJustification,
    aiUsageIntent,
    blastRadiusLevel,
    blastRadiusRationale,
    businessImpactLevel,
    businessImpactRationale,
    dataSensitivityLevel,
    dataSensitivityRationale,
    decisionImpactLevel,
    decisionImpactRationale,
    derivedRisk,
    language
  ]);

  const governanceWarnings = useMemo(() => {
    const items: string[] = [];

    if (derivedRisk === "high" && aiLevel === "level_2") {
      items.push(t(language, "High risk with Level 2 requires structured human validation after each step and reproducible outputs.", "Hög risk med nivå 2 kräver strukturerad mänsklig validering efter varje steg och reproducerbara utdata."));
    }

    if (derivedRisk === "high" && aiLevel === "level_3") {
      items.push(t(language, "High risk with Level 3 requires full traceability, logged orchestration and explicit human approval before autonomous decisions.", "Hög risk med nivå 3 kräver full spårbarhet, loggad orkestrering och explicit mänskligt godkännande före autonoma beslut."));
    }

    if (derivedRisk === "medium" && aiLevel === "level_3") {
      items.push(t(language, "Medium risk with Level 3 should have explicit orchestration boundaries, human supervision and clear traceability.", "Medelhög risk med nivå 3 bör ha explicita orkestreringsgränser, mänsklig tillsyn och tydlig spårbarhet."));
    }

    if (decisionImpactLevel === "high" && aiLevel !== "level_1") {
      items.push(t(language, "Human decision authority must stay explicit when AI influences or automates high-impact decisions.", "Mänsklig beslutsauktoritet måste vara explicit när AI påverkar eller automatiserar beslut med hög påverkan."));
    }

    if (aiExecutionPattern === "orchestrated") {
      items.push(t(language, "Orchestrated agentic delivery requires logs and step traceability across the full execution chain.", "Orkestrerad agentisk leverans kräver loggar och stegvis spårbarhet genom hela exekveringskedjan."));
    }

    return [...new Set(items)];
  }, [aiExecutionPattern, aiLevel, decisionImpactLevel, derivedRisk, language]);

  const nextBestAction =
    blockers[0] ??
    (governanceWarnings[0] ??
      (aiLevel === "level_3"
      ? t(language, "Review the Level 3 justification and then continue toward Tollgate 1 approval.", "Granska motiveringen för nivå 3 och fortsätt sedan mot Tollgate 1-godkännande.")
      : t(language, "AI and risk posture is complete. Continue into Epics and Story Ideas or move into Tollgate 1 approval.", "AI- och riskpositionen är komplett. Fortsätt till Epics och Story Ideas eller gå vidare till Tollgate 1-godkännande.")));

  const statusTone = getStatusTone(blockers.length, derivedRisk, aiLevel);

  const content = (
    <CardContent className={embedded ? "space-y-5 p-0" : "space-y-5"}>
        <input name="aiAccelerationLevel" type="hidden" value={aiLevel} />
        <input name="riskProfile" type="hidden" value={derivedRisk ?? defaultRiskProfile} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-sky-200 bg-[linear-gradient(135deg,rgba(239,246,255,0.94),rgba(255,255,255,0.94))] p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-950">
                <Bot className="h-4 w-4" />
                {t(language, "AI execution, risk and governance fit", "AI-exekvering, risk och governance-passform")}
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone.classes}`}>
                {statusTone.icon}
                {statusTone.label}
              </div>
            </div>
            <p className="framing-guidance-copy mt-4 text-sm leading-6 text-slate-700">
              {t(language, "Keep this at framing level. Capture how AI will be used, what risk exists and what control model is needed. Do not name tools, models or technical solution design here.", "Håll detta på framingnivå. Fånga hur AI ska användas, vilken risk som finns och vilken kontrollmodell som behövs. Nämn inte verktyg, modeller eller teknisk lösningsdesign här.")}
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Next best action", "Bästa nästa steg")}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{nextBestAction}</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Derived risk profile", "Härledd riskprofil")}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formatRiskLevel(derivedRisk, language)}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Selected AI Level", "Vald AI-nivå")}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formatAiLevel(aiLevel)}</p>
              </div>
            </div>
          </div>
        </div>

        <StepCard
          title={t(language, "Step 1 - Determine execution pattern and AI level", "Steg 1 - Bestäm exekveringsmönster och AI-nivå")}
          description={t(language, "Choose the AAS execution pattern first. The AI Acceleration Level is then derived automatically from that pattern.", "Välj först AAS-exekveringsmönster. AI-accelerationsnivån härleds sedan automatiskt från det mönstret.")}
        >
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "Execution pattern", "Exekveringsmönster")}</span>
              <select
                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                defaultValue={aiExecutionPattern ?? ""}
                disabled={disabled}
                name="aiExecutionPattern"
                onChange={(event) => {
                  const value = event.target.value;
                  setAiExecutionPattern(
                    value === "assisted" || value === "step_by_step" || value === "orchestrated" ? value : null
                  );
                }}
              >
                <option value="">{t(language, "Select execution pattern", "Välj exekveringsmönster")}</option>
                <option value="assisted">{t(language, "Assisted delivery", "Assisterad leverans")}</option>
                <option value="step_by_step">{t(language, "Structured acceleration", "Strukturerad acceleration")}</option>
                <option value="orchestrated">{t(language, "Orchestrated agentic delivery", "Orkestrerad agentisk leverans")}</option>
              </select>
              <InlineFieldGuidance guidance={t(language, "Choose how AI will actually execute work: interactive support, one step at a time with human review, or orchestrated multi-step flow.", "Välj hur AI faktiskt ska utföra arbetet: interaktivt stöd, ett steg i taget med mänsklig granskning eller ett orkestrerat fler-stegsflöde.")} />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{t(language, "Expected AI use across lifecycle", "Förväntad AI-användning över livscykeln")}</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                defaultValue={defaultAiUsageIntent ?? ""}
                disabled={disabled}
                name="aiUsageIntent"
                onChange={(event) => setAiUsageIntent(event.target.value)}
                placeholder={getAiUsageIntentPlaceholder(aiLevel, language)}
              />
              <InlineFieldGuidance guidance={t(language, "Describe how AI is expected to support the BMAD flow across framing, refinement, design, build or test at the selected acceleration level. Keep it broad, operational and non-technical.", "Beskriv hur AI förväntas stödja BMAD-flödet över framing, refinement, design, build eller test på vald accelerationsnivå. Håll det brett, operativt och icke-tekniskt.")} />
            </label>
          </div>
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-4 text-sm leading-6 text-sky-950">
            <p className="font-semibold">{formatExecutionPattern(aiExecutionPattern, language)} {"->"} {formatAiLevel(aiLevel)}</p>
            <p className="framing-guidance-copy mt-2">{getExecutionPatternGuidance(aiExecutionPattern, language)}</p>
            <p className="framing-guidance-copy mt-3">{getAiLevelLifecycleExample(aiLevel, language)}</p>
          </div>
        </StepCard>

        <StepCard
          title={t(language, "Step 2 and 3 - Assess and classify risk", "Steg 2 och 3 - Bedöm och klassificera risk")}
          description={t(language, "Classify each dimension as Low, Medium or High, then explain the reasoning in one short business-facing statement.", "Klassificera varje dimension som Low, Medium eller High och förklara sedan resonemanget i en kort affärsnära formulering.")}
        >
          <div className="space-y-3">
            <RiskDimensionFields
              defaultLevel={defaultBusinessImpactLevel}
              defaultRationale={defaultBusinessImpactRationale}
              disabled={disabled}
              helper="What happens if the system or AI produces incorrect results?"
              label="Business impact"
              levelName="businessImpactLevel"
              onLevelChange={setBusinessImpactLevel}
              onRationaleChange={setBusinessImpactRationale}
              rationaleName="businessImpactRationale"
            />
            <RiskDimensionFields
              defaultLevel={defaultDataSensitivityLevel}
              defaultRationale={defaultDataSensitivityRationale}
              disabled={disabled}
              helper="What data category is involved: no personal data, personal data, or sensitive/regulated data?"
              label="Data sensitivity"
              levelName="dataSensitivityLevel"
              onLevelChange={setDataSensitivityLevel}
              onRationaleChange={setDataSensitivityRationale}
              rationaleName="dataSensitivityRationale"
            />
            <RiskDimensionFields
              defaultLevel={defaultBlastRadiusLevel}
              defaultRationale={defaultBlastRadiusRationale}
              disabled={disabled}
              helper="How widely would the impact spread if something goes wrong?"
              label="Blast radius"
              levelName="blastRadiusLevel"
              onLevelChange={setBlastRadiusLevel}
              onRationaleChange={setBlastRadiusRationale}
              rationaleName="blastRadiusRationale"
            />
            <RiskDimensionFields
              defaultLevel={defaultDecisionImpactLevel}
              defaultRationale={defaultDecisionImpactRationale}
              disabled={disabled}
              helper="Does AI only assist, or does it influence or automate meaningful decisions?"
              label="Decision impact"
              levelName="decisionImpactLevel"
              onLevelChange={setDecisionImpactLevel}
              onRationaleChange={setDecisionImpactRationale}
              rationaleName="decisionImpactRationale"
            />
          </div>
        </StepCard>

        <StepCard
          title={t(language, "Step 4 and 5 - Determine overall risk and assess governance fit", "Steg 4 och 5 - Bestäm total risk och bedöm governance-passform")}
          description={t(language, "Overall risk must equal the highest classified dimension. Then check whether the derived AI level has the right governance for that risk.", "Total risk måste motsvara den högst klassificerade dimensionen. Kontrollera sedan om den härledda AI-nivån har rätt governance för den risken.")}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Overall risk rule</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {t(language, "Overall risk is derived automatically from the highest level across business impact, data sensitivity, blast radius and decision impact.", "Total risk härleds automatiskt från den högsta nivån över affärspåverkan, datakänslighet, sprängradie och beslutspåverkan.")}
              </p>
              <p className="mt-4 text-lg font-semibold text-foreground">{formatRiskLevel(derivedRisk, language)}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Selected AI level", "Vald AI-nivå")}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatAiLevel(aiLevel)}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(language, "The AI level is derived from the execution pattern in Step 1 and then checked here against the risk posture.", "AI-nivån härleds från exekveringsmönstret i steg 1 och kontrolleras sedan här mot riskpositionen.")}
              </p>
            </div>
          </div>
          <div className="framing-guidance-copy rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-foreground">
            {getAiLevelLifecycleExample(aiLevel, language)}
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "Level 3 governance justification", "Governance-motivering för nivå 3")}</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
              defaultValue={defaultAiLevelJustification ?? ""}
              disabled={disabled}
              name="aiLevelJustification"
              onChange={(event) => setAiLevelJustification(event.target.value)}
              placeholder={t(language, "If Level 3 is selected, explain the governance and control rationale briefly.", "Om nivå 3 är vald, förklara kort governance- och kontrollmotiveringen.")}
            />
          </label>
        </StepCard>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Blockers", "Blockerare")}</p>
            {blockers.length > 0 ? (
              <ul className="mt-2 space-y-2 text-foreground">
                {blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 leading-6 text-muted-foreground">{t(language, "No AI or risk blockers are visible right now.", "Inga AI- eller riskblockerare är synliga just nu.")}</p>
            )}
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Governance fit", "Governance-passform")}</p>
            {governanceWarnings.length > 0 ? (
              <ul className="mt-2 space-y-2 text-foreground">
                {governanceWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 leading-6 text-muted-foreground">{t(language, "The current AI level and risk posture do not expose any additional governance warnings.", "Den aktuella AI-nivån och riskpositionen visar inga ytterligare governance-varningar.")}</p>
            )}
          </div>
        </div>
      </CardContent>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{t(language, "AI and risk", "AI och risk")}</CardTitle>
            <CardDescription>
              {t(language, "Guide the framing decision with explicit AI intent, four risk dimensions and one derived risk profile before Tollgate 1.", "Styr framingbeslutet med explicit AI-intention, fyra riskdimensioner och en härledd riskprofil före Tollgate 1.")}
            </CardDescription>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone.classes}`}>
            {statusTone.icon}
            {statusTone.label}
          </div>
        </div>
      </CardHeader>
      {content}
    </Card>
  );
}
