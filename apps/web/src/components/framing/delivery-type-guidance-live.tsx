"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";

type DeliveryTypeValue = "AD" | "AT" | "AM";

type DeliveryTypeProfile = {
  label: string;
  primaryQuestion: string;
  changeType: string;
  baselinePosition: string;
  baselineExamples: string;
  outcomeType: string;
  outcomeExample: string;
  evidenceNeed: string;
  problemDefinition: string;
  epicCharacter: string;
  epicExamples: string;
  riskType: string;
  riskLevel: string;
  scopeStability: string;
  aiLevel: string;
  aiRole: string;
  governanceNeeds: string;
  commonFailure: string;
  aasProtection: string;
  framingWeight: string;
  poorFramingImpact: string;
};

type DeliveryTypeGuidance = {
  businessCaseDescription: string;
  timeframeDescription: string;
  valueOwnerDescription: string;
  problemDescription: string;
  outcomeDescription: string;
  solutionContextDescription: string;
  solutionContextFieldDescription: string;
  constraintsDescription: string;
  uxDescription: string;
  nfrDescription: string;
  additionalRequirementsDescription: string;
  dataSensitivityDescription: string;
  baselineCardDescription: string;
  baselineSourceDescription: string;
  aiRiskDescription: string;
  structureDescription: string;
  quickEpicDescription: string;
  quickStoryIdeaDescription: string;
};

type DeliveryTypeGuidanceSlot = keyof DeliveryTypeGuidance;

const deliveryTypeProfiles: Record<DeliveryTypeValue, DeliveryTypeProfile> = {
  AD: {
    label: "Application Development",
    primaryQuestion: "What should we build to create new value?",
    changeType: "New capability or new functionality.",
    baselinePosition: "Baseline can be lighter and may start from a weaker current-state picture.",
    baselineExamples: "Current manual work, spreadsheet process, workaround, or no usable digital flow.",
    outcomeType: "Business value or user value.",
    outcomeExample: '"Increase conversion by 15%."',
    evidenceNeed: "A strong hypothesis and reasonable value logic may be enough at Framing.",
    problemDefinition: "Problem framing can start hypothesis-driven, but it must still be explicit about value.",
    epicCharacter: "Functional capabilities.",
    epicExamples: "Onboarding, self-service, reporting, mobile flow, API enablement.",
    riskType: "Building the wrong thing or ending up with low adoption.",
    riskLevel: "Usually medium.",
    scopeStability: "Can be more exploratory early on.",
    aiLevel: "Usually AI Level 1-2, sometimes 3.",
    aiRole: "Support ideation, structuring, and refinement.",
    governanceNeeds: "Outcome and Value Owner must be clear before the case leaves Framing.",
    commonFailure: "Building features without a real outcome.",
    aasProtection: "AAS protects against output without value.",
    framingWeight: "Medium.",
    poorFramingImpact: "You risk shipping the wrong product."
  },
  AT: {
    label: "Application Transformation",
    primaryQuestion: "What in the current system is blocking value?",
    changeType: "Structural change in an existing landscape.",
    baselinePosition: "Baseline should be mandatory and data-driven.",
    baselineExamples: "Lead time, tech debt, incident load, change failure rate, cost, dependency friction.",
    outcomeType: "Structural effect on speed, cost, risk, or resilience.",
    outcomeExample: '"Cut lead time in half."',
    evidenceNeed: "Measured problem verification is expected.",
    problemDefinition: "Problem framing should be factual and quantified.",
    epicCharacter: "Structural transformation moves.",
    epicExamples: "Modularization, CI/CD uplift, dependency cleanup, platform migration.",
    riskType: "Operational regression, migration risk, and system impact.",
    riskLevel: "Usually the highest.",
    scopeStability: "Needs early stabilization.",
    aiLevel: "Usually AI Level 1-2. Level 3 only with strong control.",
    aiRole: "Analyze code, dependencies, architecture debt, and migration patterns.",
    governanceNeeds: "Outcome, baseline, risk posture, and AI level need tighter discipline.",
    commonFailure: "Modernizing without a measurable effect target.",
    aasProtection: "AAS protects against technology-driven transformation without outcome logic.",
    framingWeight: "Highest.",
    poorFramingImpact: "You risk an expensive failed transformation."
  },
  AM: {
    label: "Application Management",
    primaryQuestion: "How do we improve the existing service delivery?",
    changeType: "Continuous improvement in an active service.",
    baselinePosition: "Baseline should be operational and object-specific.",
    baselineExamples: "SLA, incident data, MTTR, case cost, support load, repeat failure patterns.",
    outcomeType: "Stability, efficiency, service quality, or cost effect.",
    outcomeExample: '"Reduce MTTR from 6h to 2h."',
    evidenceNeed: "Operational data and recurring patterns should support the case.",
    problemDefinition: "Problem framing should be data-driven and repeatable.",
    epicCharacter: "Improvement and automation themes.",
    epicExamples: "Monitoring, triage automation, support flow, incident prevention, knowledge capture.",
    riskType: "Optimizing the wrong thing or automating weak operational logic.",
    riskLevel: "Usually low to medium.",
    scopeStability: "Continuous and iterative.",
    aiLevel: "Usually AI Level 1-3 with strong improvement potential.",
    aiRole: "Find patterns, summarize incidents, and support service improvement analysis.",
    governanceNeeds: "Outcome and operational baseline should stay visible, even for smaller improvements.",
    commonFailure: "Running support without an improvement target.",
    aasProtection: "AAS protects against reactive service work without development intent.",
    framingWeight: "Medium.",
    poorFramingImpact: "You risk an inefficient service model."
  }
};

const defaultGuidance: DeliveryTypeGuidance = {
  businessCaseDescription:
    "Describe the case so the value question, current reality, and intended change are clear before design starts.",
  timeframeDescription:
    "Describe the business window for this case, for example a pilot season, quarter, budget window, or launch horizon. This is business timing, not sprint planning.",
  valueOwnerDescription:
    "Choose the named person on the customer side who owns the business value, baseline, and Tollgate 1 decision.",
  problemDescription:
    "State the problem clearly enough that the team understands why this case exists before discussing solutions.",
  outcomeDescription:
    "Write the effect that should become true if this Framing succeeds. Keep it outcome-oriented, not solution-oriented.",
  solutionContextDescription:
    "Capture only the context and constraints Design should inherit. Carry forward business realities and boundaries without slipping into detailed solution design.",
  solutionContextFieldDescription:
    "Include the surrounding business and landscape context that should shape Design, such as who is affected, what already exists, and major dependencies.",
  constraintsDescription:
    "Capture what Design must respect, not how to implement it. Good constraints are operational, compliance, rollout, or continuity boundaries.",
  uxDescription:
    "Put design-driving UX constraints here, not wireframes or page-by-page solutions. This should guide Design without freezing the answer too early.",
  nfrDescription:
    "Use this for cross-cutting quality requirements such as performance, security, availability, compliance, accessibility, or privacy.",
  additionalRequirementsDescription:
    "Use this for important imported material that should survive into Design, but does not belong as Outcome, Epic, or Story Idea content.",
  dataSensitivityDescription:
    "List the data types involved and why they matter for risk, compliance, supervision, and delivery control.",
  baselineCardDescription: "These fields help ground the Framing before approval is recorded.",
  baselineSourceDescription:
    "Record where the baseline comes from so the team can trace the claim back to evidence.",
  aiRiskDescription:
    "Define AI usage intent, classify risk, and record the framing-level AI decision before Tollgate 1.",
  structureDescription:
    "Capture scope boundaries through Epics and lightweight Story Ideas. Keep them directional, not operational.",
  quickEpicDescription:
    "Create the next scope boundary directly from Framing before you break it down into Story Ideas.",
  quickStoryIdeaDescription:
    "Create a new Story Idea directly from Framing and assign its Epic now, without opening the Epic first."
};

function getDeliveryTypeProfile(value: DeliveryTypeValue | null | undefined) {
  return value ? deliveryTypeProfiles[value] : null;
}

function getDeliveryTypeHelper(value: DeliveryTypeValue | null | undefined) {
  const profile = getDeliveryTypeProfile(value);

  if (!profile) {
    return "Choose the delivery posture that best describes this case so Framing can guide the business case, baseline, risks, and hierarchy the right way from the start.";
  }

  return `${profile.label}: ${profile.primaryQuestion} ${profile.governanceNeeds}`;
}

function getDeliveryTypeContextualGuidance(value: DeliveryTypeValue | null | undefined): DeliveryTypeGuidance {
  const profile = getDeliveryTypeProfile(value);

  if (!profile) {
    return defaultGuidance;
  }

  return {
    businessCaseDescription: `${profile.primaryQuestion} ${profile.changeType} ${profile.outcomeType}`,
    timeframeDescription:
      value === "AM"
        ? "Describe the operating cadence or improvement window this work belongs to, such as service month, stabilization period, or contract horizon."
        : value === "AT"
          ? "Describe the transformation or migration window this case must fit into, such as modernization phase, dependency cutover, or stabilization horizon."
          : "Describe the business window for the new value, such as pilot, launch horizon, funding window, or adoption milestone.",
    valueOwnerDescription: `${profile.governanceNeeds} This person should be able to stand behind the effect, the baseline, and the Tollgate 1 decision.`,
    problemDescription: `${profile.problemDefinition} ${profile.commonFailure}`,
    outcomeDescription: `${profile.outcomeType} Example: ${profile.outcomeExample}`,
    solutionContextDescription: `Let the context and constraints reflect ${profile.label.toLowerCase()} work. ${profile.aasProtection}`,
    solutionContextFieldDescription: `${profile.changeType} Typical examples: ${profile.epicExamples}`,
    constraintsDescription: `${profile.riskType} ${profile.aasProtection}`,
    uxDescription:
      value === "AD"
        ? "Use UX principles to steer the new experience without locking the solution too early."
        : value === "AT"
          ? "Use UX principles to protect continuity where users move between old and transformed experiences."
          : "Use UX principles to protect continuity, clarity, and low-friction operational support flows.",
    nfrDescription: `${profile.riskLevel} ${profile.evidenceNeed}`,
    additionalRequirementsDescription:
      value === "AT"
        ? "Use this for migration dependencies, platform assumptions, or transformation conditions that Design must inherit."
        : value === "AM"
          ? "Use this for operational assumptions, support boundaries, or service rules that must not be lost."
          : "Use this for business rules, assumptions, or external dependencies that still matter in Design.",
    dataSensitivityDescription:
      value === "AT"
        ? "Call out data that increases migration, regression, or compliance risk across the current landscape."
        : value === "AM"
          ? "Call out operational data, support data, and incident-related data that shape the service model."
          : "Call out the data involved in the new value flow and the sensitivity implications early.",
    baselineCardDescription: `${profile.baselinePosition} ${profile.baselineExamples}`,
    baselineSourceDescription: `${profile.evidenceNeed} Typical examples: ${profile.baselineExamples}`,
    aiRiskDescription: `${profile.aiRole} ${profile.riskType}`,
    structureDescription: `${profile.epicCharacter} Examples: ${profile.epicExamples}`,
    quickEpicDescription: `${profile.epicCharacter} Start by naming one scope boundary that moves the case toward the intended outcome.`,
    quickStoryIdeaDescription:
      value === "AT"
        ? "Create a directional Story Idea that clarifies one transformation effect or one risk-reducing move under the chosen Epic."
        : value === "AM"
          ? "Create a directional Story Idea that improves service behavior, support flow, or operational automation under the chosen Epic."
          : "Create a directional Story Idea that expresses one user-value move under the chosen Epic."
  };
}

type DeliveryTypeGuidanceContextValue = {
  value: DeliveryTypeValue | null;
  guidance: DeliveryTypeGuidance;
  helperText: string;
  setValue: (value: DeliveryTypeValue | null) => void;
};

const DeliveryTypeGuidanceContext = createContext<DeliveryTypeGuidanceContextValue | null>(null);

function useDeliveryTypeGuidance() {
  const context = useContext(DeliveryTypeGuidanceContext);

  if (!context) {
    throw new Error("DeliveryTypeGuidance components must be used inside DeliveryTypeGuidanceProvider.");
  }

  return context;
}

export function DeliveryTypeGuidanceProvider(props: {
  children: ReactNode;
  initialValue: DeliveryTypeValue | null;
}) {
  const [value, setValue] = useState<DeliveryTypeValue | null>(props.initialValue);
  const contextValue = useMemo<DeliveryTypeGuidanceContextValue>(
    () => ({
      value,
      guidance: getDeliveryTypeContextualGuidance(value),
      helperText: getDeliveryTypeHelper(value),
      setValue
    }),
    [value]
  );

  return <DeliveryTypeGuidanceContext.Provider value={contextValue}>{props.children}</DeliveryTypeGuidanceContext.Provider>;
}

export function DeliveryTypeGuidanceText(props: { slot: DeliveryTypeGuidanceSlot }) {
  const { guidance } = useDeliveryTypeGuidance();
  return <>{guidance[props.slot]}</>;
}

export function DeliveryTypeHelperText() {
  const { helperText } = useDeliveryTypeGuidance();
  return <>{helperText}</>;
}

export function DeliveryTypeSelect(props: {
  defaultValue: string;
  disabled?: boolean | undefined;
  id?: string | undefined;
  name: string;
}) {
  const { setValue } = useDeliveryTypeGuidance();

  return (
    <select
      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      id={props.id}
      name={props.name}
      onChange={(event) => {
        const nextValue = event.currentTarget.value;
        setValue(nextValue === "AD" || nextValue === "AT" || nextValue === "AM" ? nextValue : null);
      }}
    >
      <option value="">Select delivery type</option>
      <option value="AD">Application Development (AD)</option>
      <option value="AT">Application Transformation (AT)</option>
      <option value="AM">Application Management (AM)</option>
    </select>
  );
}

export function DeliveryTypeHelpCard() {
  const { value } = useDeliveryTypeGuidance();
  const selectedProfile = getDeliveryTypeProfile(value);

  return (
    <details className="group rounded-2xl border border-border/70 bg-background/85 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30">
        <span className="inline-flex rounded-full border border-border/70 bg-background/90 p-1 text-muted-foreground">
          <CircleHelp className="h-3.5 w-3.5" />
        </span>
        <span>What project type means in Framing</span>
        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-border/70 px-4 py-4">
        <p className="text-sm leading-6 text-muted-foreground">
          The selected project type changes how Framing should approach baseline, outcomes, evidence, risk, and the shape of Epics.
          {selectedProfile ? ` Current selection: ${selectedProfile.label}.` : ""}
        </p>
        <div className="grid gap-4 xl:grid-cols-3">
          {(Object.entries(deliveryTypeProfiles) as Array<[DeliveryTypeValue, DeliveryTypeProfile]>).map(([key, profile]) => (
            <div
              className={`rounded-2xl border p-4 ${
                key === value ? "border-sky-300 bg-sky-50/80 text-sky-950 shadow-sm" : "border-border/70 bg-muted/15 text-foreground"
              }`}
              key={key}
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{key}</p>
                  <h4 className="font-semibold">{profile.label}</h4>
                  <p className="text-sm leading-6">{profile.primaryQuestion}</p>
                </div>
                <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Baseline:</strong> {profile.baselinePosition}
                  </p>
                  <p>
                    <strong className="text-foreground">Outcome:</strong> {profile.outcomeType}
                  </p>
                  <p>
                    <strong className="text-foreground">Evidence:</strong> {profile.evidenceNeed}
                  </p>
                  <p>
                    <strong className="text-foreground">Epics:</strong> {profile.epicExamples}
                  </p>
                  <p>
                    <strong className="text-foreground">Risk:</strong> {profile.riskType}
                  </p>
                  <p>
                    <strong className="text-foreground">Governance:</strong> {profile.governanceNeeds}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
