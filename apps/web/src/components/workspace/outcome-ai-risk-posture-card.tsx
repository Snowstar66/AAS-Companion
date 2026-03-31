"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Bot, CheckCircle2, ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { InlineFieldGuidance } from "@/components/shared/context-help";
import { formatAiLevelLabel } from "@/lib/help/aas-help";

type RiskLevel = "low" | "medium" | "high";
type AiLevel = "level_1" | "level_2" | "level_3";
type AiExecutionPattern = "assisted" | "step_by_step" | "orchestrated";

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
  defaultRiskAccepted: boolean;
  defaultRiskAcceptedAt: string | null;
  defaultRiskAcceptedByValueOwnerId: string | null;
  valueOwnerLabel: string | null;
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

function formatExecutionPattern(value: AiExecutionPattern | null) {
  if (value === "assisted") {
    return "Assisted delivery";
  }

  if (value === "step_by_step") {
    return "Structured acceleration";
  }

  if (value === "orchestrated") {
    return "Orchestrated agentic delivery";
  }

  return "Not determined";
}

function getExecutionPatternGuidance(value: AiExecutionPattern | null) {
  if (value === "assisted") {
    return "AI supports a human interactively. No workflow automation. Human makes all decisions.";
  }

  if (value === "step_by_step") {
    return "AI produces artifacts one step at a time. Human review happens between each step.";
  }

  if (value === "orchestrated") {
    return "AI executes multiple chained steps through workflows or agents with stronger governance.";
  }

  return "Select the execution pattern that best describes how AI will actually be used.";
}

function getAiLevelLifecycleExample(value: AiLevel) {
  if (value === "level_1") {
    return "Level 1 is light BMAD-style support: clarification, drafting, limited refinement and light validation under direct human control.";
  }

  if (value === "level_2") {
    return "Level 2 fits structured BMAD support across story refinement, design support, code generation and test support under human governance.";
  }

  return "Level 3 fits agentic or semi-automated BMAD-style workflows where AI can drive multi-step refinement, design, build and test activities with stronger governance.";
}

function getAiUsageIntentPlaceholder(value: AiLevel) {
  if (value === "level_1") {
    return "Example: AI will be used lightly for framing support, clarification and limited refinement under direct human control.";
  }

  if (value === "level_2") {
    return "Example: AI will be used across story refinement, design support, code generation and test support under human governance.";
  }

  return "Example: AI will support and partially automate refinement, design, code generation and test workflows with explicit human supervision and governance.";
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

function formatRiskLevel(value: RiskLevel | null) {
  if (!value) {
    return "Not determined";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatAiLevel(value: AiLevel) {
  return formatAiLevelLabel(value);
}

function formatAcceptanceDate(value: string | null) {
  if (!value) {
    return "Not captured yet";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not captured yet";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(parsed);
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
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{props.description}</p>
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
    <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{props.label}</span>
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
          <span className="text-sm font-medium text-foreground">{props.label} rationale</span>
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
  defaultRiskAccepted,
  defaultRiskAcceptedAt,
  defaultRiskAcceptedByValueOwnerId,
  valueOwnerLabel,
  embedded = false,
  disabled = false
}: OutcomeAiRiskPostureCardProps) {
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
  const [riskAccepted, setRiskAccepted] = useState(defaultRiskAccepted);
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
      items.push("Missing AI execution pattern.");
    }

    if (!aiUsageIntent.trim()) {
      items.push("Missing AI usage across lifecycle.");
    }

    if (!businessImpactLevel) {
      items.push("Missing business impact classification.");
    }

    if (!businessImpactRationale.trim()) {
      items.push("Missing business impact rationale.");
    }

    if (!dataSensitivityLevel) {
      items.push("Missing data sensitivity classification.");
    }

    if (!dataSensitivityRationale.trim()) {
      items.push("Missing data sensitivity rationale.");
    }

    if (!blastRadiusLevel) {
      items.push("Missing blast radius classification.");
    }

    if (!blastRadiusRationale.trim()) {
      items.push("Missing blast radius rationale.");
    }

    if (!decisionImpactLevel) {
      items.push("Missing decision impact classification.");
    }

    if (!decisionImpactRationale.trim()) {
      items.push("Missing decision impact rationale.");
    }

    if (!derivedRisk) {
      items.push("Risk profile cannot be determined until all four risk dimensions are classified.");
    }

    if (aiLevel === "level_3" && !aiLevelJustification.trim()) {
      items.push("Level 3 requires explicit governance justification.");
    }

    if (!valueOwnerLabel) {
      items.push("Risk acceptance requires a named Value Owner.");
    } else if (!riskAccepted) {
      items.push("Risk not accepted by Value Owner.");
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
    riskAccepted,
    valueOwnerLabel
  ]);

  const governanceWarnings = useMemo(() => {
    const items: string[] = [];

    if (derivedRisk === "high" && aiLevel === "level_2") {
      items.push("High risk with Level 2 requires structured human validation after each step and reproducible outputs.");
    }

    if (derivedRisk === "high" && aiLevel === "level_3") {
      items.push("High risk with Level 3 requires full traceability, logged orchestration and explicit human approval before autonomous decisions.");
    }

    if (derivedRisk === "medium" && aiLevel === "level_3") {
      items.push("Medium risk with Level 3 should have explicit orchestration boundaries, human supervision and clear traceability.");
    }

    if (decisionImpactLevel === "high" && aiLevel !== "level_1") {
      items.push("Human decision authority must stay explicit when AI influences or automates high-impact decisions.");
    }

    if (aiExecutionPattern === "orchestrated") {
      items.push("Orchestrated agentic delivery requires logs and step traceability across the full execution chain.");
    }

    return [...new Set(items)];
  }, [aiExecutionPattern, aiLevel, decisionImpactLevel, derivedRisk]);

  const nextBestAction =
    blockers[0] ??
    (governanceWarnings[0] ??
      (aiLevel === "level_3"
      ? "Review the Level 3 justification and confirm the risk acceptance before Tollgate 1."
      : "AI and risk posture is complete. Continue into Epics and Story Ideas or submit to Tollgate."));

  const statusTone = getStatusTone(blockers.length, derivedRisk, aiLevel);

  const content = (
    <>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>AI and risk</CardTitle>
            <CardDescription>
              Guide the framing decision with explicit AI intent, four risk dimensions and one derived risk profile before Tollgate 1.
            </CardDescription>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone.classes}`}>
            {statusTone.icon}
            {statusTone.label}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <input name="aiAccelerationLevel" type="hidden" value={aiLevel} />
        <input name="riskProfile" type="hidden" value={derivedRisk ?? defaultRiskProfile} />
        <input name="existingRiskAcceptedAt" type="hidden" value={defaultRiskAcceptedAt ?? ""} />
        <input name="existingRiskAcceptedByValueOwnerId" type="hidden" value={defaultRiskAcceptedByValueOwnerId ?? ""} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-sky-200 bg-[linear-gradient(135deg,rgba(239,246,255,0.94),rgba(255,255,255,0.94))] p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">
                Structured framing decision
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-950">
                <Bot className="h-4 w-4" />
                AI Acceleration Level and Risk Profile
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Keep this at framing level. Capture why AI is used, what risk exists and who accepts that risk. Do not name tools,
              models or technical solution design here.
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next best action</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{nextBestAction}</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Derived risk profile</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formatRiskLevel(derivedRisk)}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected AI Level</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formatAiLevel(aiLevel)}</p>
              </div>
            </div>
          </div>
        </div>

        <StepCard
          title="Step 1 - Determine execution pattern and AI level"
          description="Choose the AAS execution pattern first. The AI Acceleration Level is then derived automatically from that pattern."
        >
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Execution pattern</span>
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
                <option value="">Select execution pattern</option>
                <option value="assisted">Assisted delivery</option>
                <option value="step_by_step">Structured acceleration</option>
                <option value="orchestrated">Orchestrated agentic delivery</option>
              </select>
              <InlineFieldGuidance guidance="Choose how AI will actually execute work: interactive support, one step at a time with human review, or orchestrated multi-step flow." />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Expected AI use across lifecycle</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                defaultValue={defaultAiUsageIntent ?? ""}
                disabled={disabled}
                name="aiUsageIntent"
                onChange={(event) => setAiUsageIntent(event.target.value)}
                placeholder={getAiUsageIntentPlaceholder(aiLevel)}
              />
              <InlineFieldGuidance guidance="Describe how AI is expected to support the BMAD flow across framing, refinement, design, build or test at the selected acceleration level. Keep it broad, operational and non-technical." />
            </label>
          </div>
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-4 text-sm leading-6 text-sky-950">
            <p className="font-semibold">{formatExecutionPattern(aiExecutionPattern)} {"->"} {formatAiLevel(aiLevel)}</p>
            <p className="mt-2">{getExecutionPatternGuidance(aiExecutionPattern)}</p>
            <p className="mt-3">{getAiLevelLifecycleExample(aiLevel)}</p>
          </div>
        </StepCard>

        <StepCard
          title="Step 2 and 3 - Assess and classify risk"
          description="Classify each dimension as Low, Medium or High, then explain the reasoning in one short business-facing statement."
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
              helper="What type of data is handled: no personal data, personal data or sensitive / regulated data?"
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
              helper="If something goes wrong, how many users, teams or systems are affected?"
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
              helper="Does AI only assist, or does it influence or automate decisions?"
              label="Decision impact"
              levelName="decisionImpactLevel"
              onLevelChange={setDecisionImpactLevel}
              onRationaleChange={setDecisionImpactRationale}
              rationaleName="decisionImpactRationale"
            />
          </div>
        </StepCard>

        <StepCard
          title="Step 4 and 5 - Determine overall risk and assess governance fit"
          description="Overall risk must equal the highest classified dimension. Then check whether the derived AI level has the right governance for that risk."
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Overall risk rule</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Overall risk is derived automatically from the highest level across business impact, data sensitivity, blast radius and
                decision impact.
              </p>
              <p className="mt-4 text-lg font-semibold text-foreground">{formatRiskLevel(derivedRisk)}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected AI level</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatAiLevel(aiLevel)}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The AI level is derived from the execution pattern in Step 1 and then checked here against the risk posture.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm leading-6 text-foreground">
            {getAiLevelLifecycleExample(aiLevel)}
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-foreground">Level 3 governance justification</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
              defaultValue={defaultAiLevelJustification ?? ""}
              disabled={disabled}
              name="aiLevelJustification"
              onChange={(event) => setAiLevelJustification(event.target.value)}
              placeholder="If Level 3 is selected, explain the governance and control rationale briefly."
            />
          </label>
        </StepCard>

        <StepCard
          title="Step 6 - Capture decision output"
          description="This summary reflects what will be carried forward in Framing and checked before Tollgate 1."
        >
          <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-950">
              <Sparkles className="h-4 w-4" />
              Completed AI Level and Risk section
            </div>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-800">
              <p>
                <span className="font-semibold">AI Level:</span> {formatAiLevel(aiLevel)}
              </p>
              <p>
                <span className="font-semibold">Risk profile:</span> {formatRiskLevel(derivedRisk)}
              </p>
              <div>
                <p className="font-semibold">Risk rationale:</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    Business impact: {formatRiskLevel(businessImpactLevel)}{businessImpactRationale.trim() ? ` - ${businessImpactRationale.trim()}` : ""}
                  </li>
                  <li>
                    Data sensitivity: {formatRiskLevel(dataSensitivityLevel)}{dataSensitivityRationale.trim() ? ` - ${dataSensitivityRationale.trim()}` : ""}
                  </li>
                  <li>
                    Blast radius: {formatRiskLevel(blastRadiusLevel)}{blastRadiusRationale.trim() ? ` - ${blastRadiusRationale.trim()}` : ""}
                  </li>
                  <li>
                    Decision impact: {formatRiskLevel(decisionImpactLevel)}{decisionImpactRationale.trim() ? ` - ${decisionImpactRationale.trim()}` : ""}
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Risk acceptance:</p>
                <ul className="mt-2 space-y-1">
                  <li>Accepted by: {valueOwnerLabel ?? "Value Owner not selected yet"}</li>
                  <li>Date: {riskAccepted ? defaultRiskAcceptedAt ? formatAcceptanceDate(defaultRiskAcceptedAt) : "Captured on next save" : "Not captured yet"}</li>
                </ul>
              </div>
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm">
            <input
              checked={riskAccepted}
              className="mt-1 h-4 w-4 rounded border-border"
              disabled={disabled}
              name="riskAcceptanceConfirmed"
              onChange={(event) => setRiskAccepted(event.target.checked)}
              type="checkbox"
              value="yes"
            />
            <span className="leading-6 text-foreground">
              Record risk acceptance from the current Value Owner.
              <span className="block text-muted-foreground">
                Accepted by: {valueOwnerLabel ?? "Select a Value Owner first"}.
              </span>
            </span>
          </label>
        </StepCard>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Blockers</p>
            {blockers.length > 0 ? (
              <ul className="mt-2 space-y-2 text-foreground">
                {blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 leading-6 text-muted-foreground">No AI or risk blockers are visible right now.</p>
            )}
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Governance fit</p>
            {governanceWarnings.length > 0 ? (
              <ul className="mt-2 space-y-2 text-foreground">
                {governanceWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 leading-6 text-muted-foreground">The current AI level and risk posture do not expose any additional governance warnings.</p>
            )}
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next best action</p>
            <p className="mt-2 font-semibold text-foreground">{nextBestAction}</p>
          </div>
        </div>
      </CardContent>
    </>
  );

  if (embedded) {
    return <div className="space-y-5">{content}</div>;
  }

  return (
    <Card className="border-border/70 shadow-sm">
      {content}
    </Card>
  );
}
