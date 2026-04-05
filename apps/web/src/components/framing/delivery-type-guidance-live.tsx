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
    "Frame the case at decision level: why it matters, what should improve, and what kind of change this is.",
  timeframeDescription:
    "Use this field to explain why the timing matters now. Keep it at business window level, not sprint planning.",
  valueOwnerDescription:
    "The value owner should be able to say yes, this outcome matters, this baseline is credible, and this case is worth approving.",
  problemDescription:
    "Describe the current pain, not the target state. If the problem disappeared tomorrow, what would be better?",
  outcomeDescription:
    "Write one effect worth achieving. A strong outcome tells you what should be measurably different after the work lands.",
  solutionContextDescription:
    "Pass forward only the context Design needs in order to make good choices later.",
  solutionContextFieldDescription:
    "Start from usage, landscape and dependencies. Do not start designing the solution here.",
  constraintsDescription:
    "Write only the non-negotiables. If Design ignored this, what would break, violate policy, or create delivery risk?",
  uxDescription:
    "Use UX guidance to preserve intent and continuity, not to lock screens or flows too early.",
  nfrDescription:
    "Capture quality demands that should shape design and risk posture across the whole case.",
  additionalRequirementsDescription:
    "Use this for important carry-forward material that matters, but should not pretend to be an Outcome, Epic or Story Idea.",
  dataSensitivityDescription:
    "Call out the data that changes governance expectations. If sensitivity goes up, control usually must go up too.",
  baselineCardDescription: "These fields help ground the Framing before approval is recorded.",
  baselineSourceDescription:
    "Make the starting point defendable. The stronger the case, the easier later approvals and follow-up become.",
  aiRiskDescription:
    "Use this area to make the AI posture explicit instead of leaving it implicit in delivery later.",
  structureDescription:
    "Use Epics and Story Ideas to shape direction and scope, not to create a delivery backlog too early.",
  quickEpicDescription:
    "An Epic should name a meaningful scope boundary, not a to-do bucket.",
  quickStoryIdeaDescription:
    "A Story Idea should express intent and expected effect. Save delivery detail for later."
};

function getDeliveryTypeProfile(value: DeliveryTypeValue | null | undefined) {
  return value ? deliveryTypeProfiles[value] : null;
}

function getDeliveryTypeHelper(value: DeliveryTypeValue | null | undefined) {
  const profile = getDeliveryTypeProfile(value);

  if (!profile) {
    return "Choose the delivery posture that best describes this case so Framing can guide the business case, baseline, risks, and hierarchy the right way from the start.";
  }

  return `${profile.label}: ${profile.primaryQuestion} Expect Framing to emphasize ${profile.governanceNeeds.toLowerCase()}`;
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
        ? "Explain the service or improvement window this belongs to, for example an operational period, support cycle, or cost-reduction horizon."
        : value === "AT"
          ? "Explain the transformation window this must fit into, such as migration phase, dependency cutover, or stabilization horizon."
          : "Explain the value window for the new capability, such as pilot, launch horizon, funding window, or adoption milestone.",
    valueOwnerDescription: `${profile.governanceNeeds} This person should be able to defend the case if challenged by both business and delivery.`,
    problemDescription: `${profile.problemDefinition} ${profile.commonFailure}`,
    outcomeDescription: `${profile.outcomeType} A good statement makes the effect visible without naming the build. Example: ${profile.outcomeExample}`,
    solutionContextDescription: `Let the surrounding context reflect ${profile.label.toLowerCase()} work. ${profile.aasProtection}`,
    solutionContextFieldDescription: `${profile.changeType} Useful context examples: ${profile.epicExamples}`,
    constraintsDescription: `${profile.riskType} If a boundary changes governance, continuity, or approval confidence, capture it here.`,
    uxDescription:
      value === "AD"
        ? "Use UX principles to steer the new experience toward adoption and clarity without prescribing screens."
        : value === "AT"
          ? "Use UX principles to protect continuity when users move between current and transformed experiences."
          : "Use UX principles to protect continuity, clarity, and low-friction service behavior in daily operations.",
    nfrDescription: `${profile.riskLevel} These requirements should raise design rigor, not become an afterthought. ${profile.evidenceNeed}`,
    additionalRequirementsDescription:
      value === "AT"
        ? "Use this for migration dependencies, platform assumptions, or transformation conditions Design must inherit."
        : value === "AM"
          ? "Use this for operational assumptions, support boundaries, or service rules that must not disappear between Framing and Design."
          : "Use this for business rules, assumptions, or external dependencies that still matter in Design.",
    dataSensitivityDescription:
      value === "AT"
        ? "Call out data that increases migration, regression, or compliance risk across the current landscape."
        : value === "AM"
          ? "Call out operational data, support data, and incident-related data that shape the service model."
          : "Call out the data involved in the new value flow and the sensitivity implications early.",
    baselineCardDescription: `${profile.baselinePosition} In this project type, baseline quality strongly affects how convincing the Framing is.`,
    baselineSourceDescription: `${profile.evidenceNeed} Typical evidence: ${profile.baselineExamples}`,
    aiRiskDescription: `${profile.aiRole} ${profile.riskType} Use this section to make that explicit before Tollgate 1.`,
    structureDescription: `${profile.epicCharacter} Use structure to express direction. Examples: ${profile.epicExamples}`,
    quickEpicDescription: `${profile.epicCharacter} Start by naming one scope boundary that moves the case toward the intended outcome.`,
    quickStoryIdeaDescription:
      value === "AT"
        ? "Create a directional Story Idea that clarifies one transformation effect or one risk-reducing move under the chosen Epic."
        : value === "AM"
          ? "Create a directional Story Idea that improves service behavior, support flow, or operational automation under the chosen Epic."
          : "Create a directional Story Idea that expresses one concrete user-value move under the chosen Epic."
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
