export type WorkspaceHelpKey =
  | "framing.handshake"
  | "framing.problem"
  | "framing.outcome"
  | "framing.baseline_definition"
  | "framing.baseline_source"
  | "framing.solution_context"
  | "framing.solution_constraints"
  | "framing.data_sensitivity"
  | "framing.delivery_type"
  | "framing.value_owner"
  | "framing.timeframe"
  | "framing.ai_level"
  | "framing.design_direction"
  | "outcome.authoring"
  | "import.workspace"
  | "review.workspace";

export type AiLevelKey = "level_1" | "level_2" | "level_3";

export type HelpPattern = {
  title: string;
  summary: string;
  purpose: string;
  belongs: string;
  avoid: string;
  nextStep?: string | undefined;
  aiLevelNotes?: Partial<Record<AiLevelKey, string>> | undefined;
};

const aiLevelNotes: Record<AiLevelKey, string> = {
  level_1: "Level 1 fits assisted delivery where AI supports a human interactively and humans make all decisions.",
  level_2: "Level 2 fits structured acceleration where AI produces one artifact step at a time with human review between steps.",
  level_3: "Level 3 fits orchestrated agentic delivery where multi-step flows are chained and must stay fully traceable."
};

const helpPatterns: Record<WorkspaceHelpKey, HelpPattern> = {
  "framing.handshake": {
    title: "Customer handshake",
    summary:
      "Use Framing to agree the business problem, target effect, baseline, owner, design direction and intended AI level before deeper design starts.",
    purpose: "Create a shared customer-delivery handshake for the current project and current business case.",
    belongs:
      "Problem statement, desired outcome, baseline, owner, rough functional direction and the intended AI acceleration level.",
    avoid: "Detailed user stories, detailed tests, implementation breakdown or approval mechanics.",
    nextStep: "When the handshake is stable, continue into Design / Value Spine to break the case down further.",
    aiLevelNotes
  },
  "framing.problem": {
    title: "Problem statement",
    summary: "Describe the business pain or missed opportunity that exists today, in plain language.",
    purpose: "Anchor the case in the customer's current reality.",
    belongs: "Current pain, friction, delay, cost, risk or missed value.",
    avoid: "Detailed solution ideas or feature lists."
  },
  "framing.outcome": {
    title: "Desired outcome",
    summary: "Describe the change the customer wants to achieve, not the detailed solution.",
    purpose: "Make the intended business effect explicit.",
    belongs: "Target effect, improved state, measurable change or operational shift.",
    avoid: "Implementation detail, delivery tasks or technical architecture."
  },
  "framing.baseline_definition": {
    title: "Baseline definition",
    summary: "Capture how the current situation is understood so later progress can be compared against it.",
    purpose: "Create the reference point for improvement.",
    belongs: "Current throughput, quality, cost, lead time, error rate or other starting-state description.",
    avoid: "Future-state ambition without the current-state anchor."
  },
  "framing.baseline_source": {
    title: "Baseline source",
    summary: "State where the baseline comes from so the starting point stays credible.",
    purpose: "Keep the baseline trustworthy and reviewable.",
    belongs: "Named report, dashboard, stakeholder source or observed operational evidence.",
    avoid: "Unsupported guesses with no source trail."
  },
  "framing.solution_context": {
    title: "Solution context",
    summary: "Capture the surrounding business, usage and system context that Design should inherit and that may affect scope, risk or AI posture.",
    purpose: "Make the framing conditions explicit without locking the solution design too early.",
    belongs:
      "Business context, usage context, existing landscape context, high-level integration expectations, operational expectations and compliance context.",
    avoid: "Architecture structure, technology choices, API contracts or implementation detail."
  },
  "framing.solution_constraints": {
    title: "Constraints",
    summary: "List the conditions Design must satisfy, not how the team should technically build the solution.",
    purpose: "Hold onto the important boundaries while keeping design options open.",
    belongs: "Operational constraints, business conditions, compliance limits, must-keep integrations and delivery-level constraints.",
    avoid: "Prescriptive implementation steps, frameworks, components or detailed technical patterns."
  },
  "framing.data_sensitivity": {
    title: "Data sensitivity",
    summary: "Capture only the relevant data categories and their sensitivity level at a business-facing level.",
    purpose: "Surface risk and governance needs early in framing.",
    belongs: "Personal data, commercial data, regulated data, internal data and their sensitivity.",
    avoid: "Schema design, storage details, field-by-field implementation or security architecture."
  },
  "framing.delivery_type": {
    title: "Delivery type",
    summary: "Choose the delivery posture that best fits the case so Design starts from the right context.",
    purpose: "Make the expected delivery mode explicit without slipping into solution design.",
    belongs: "Whether this is primarily Application Development, Application Transformation or Application Maintenance.",
    avoid: "Detailed delivery planning or execution workflow."
  },
  "framing.value_owner": {
    title: "Value owner",
    summary: "Choose the named person who owns the business value, baseline and Tollgate 1 decision for this case.",
    purpose: "Place business accountability on a real person.",
    belongs: "Customer-side person who can validate value, baseline, priority and whether the case is worth doing.",
    avoid: "Generic team names with no accountable human."
  },
  "framing.timeframe": {
    title: "Timeframe",
    summary: "Capture the business horizon for the outcome so the case stays decision-oriented.",
    purpose: "Set a realistic business window for the change.",
    belongs: "Pilot window, season, quarter, decision point or business timing expectation.",
    avoid: "Low-level sprint planning or delivery task sequencing."
  },
  "framing.ai_level": {
    title: "AI acceleration level",
    summary: "Determine the execution pattern first, let that map to the AI Acceleration Level, then describe the expected AI use across later phases.",
    purpose: "Classify AI use according to the AAS operating model before Tollgate 1.",
    belongs: "Execution pattern, derived AI level, expected BMAD lifecycle support, explicit risk and retained human decision authority.",
    avoid: "Tool-name classification, competing AI role taxonomies or treating risk as the thing that directly decides AI level.",
    aiLevelNotes
  },
  "framing.design_direction": {
    title: "High-level functional direction",
    summary: "Capture the rough functional direction as Epic seeds before detailed Story authoring begins.",
    purpose: "Bridge the handshake into Design without forcing full decomposition too early.",
    belongs: "A few Epic seeds, value areas or scope boundaries that describe where the solution likely goes.",
    avoid: "Full story decomposition, detailed acceptance criteria or implementation plans."
  },
  "outcome.authoring": {
    title: "Outcome authoring help",
    summary: "This Outcome page is still part of Framing. Keep it centered on handshake-level business clarity and baseline readiness.",
    purpose: "Help the team author the current Outcome without slipping into delivery detail too early.",
    belongs:
      "Business effect, current baseline, accountable owner, intended AI level and early design direction via Epics.",
    avoid: "Detailed Story/Test authoring or hidden governance assumptions.",
    nextStep: "Use Epic creation to seed direction. Use Value Spine once the handshake is stable."
  },
  "import.workspace": {
    title: "Import help",
    summary: "Import is for source interpretation and correction before anything is promoted into project records.",
    purpose: "Keep imported material traceable while humans correct uncertain or incomplete interpretation.",
    belongs: "Source context, interpretation quality, uncertainty, lineage and correction decisions.",
    avoid: "Treating imported text as approved project truth without review."
  },
  "review.workspace": {
    title: "Human review help",
    summary: "Human Review is where uncertain, missing and human-only decisions are resolved before promotion and approval readiness.",
    purpose: "Make explicit what a human must confirm, correct or reject.",
    belongs: "Corrections, confirmations, human-only decisions, follow-up calls and promotion decisions.",
    avoid: "Silent promotion of unresolved candidate content."
  }
};

export function getHelpPattern(key: WorkspaceHelpKey, aiLevel?: string | null) {
  const pattern = helpPatterns[key];
  const normalizedLevel = aiLevel === "level_1" || aiLevel === "level_2" || aiLevel === "level_3" ? aiLevel : null;

  return {
    ...pattern,
    aiLevelNote: normalizedLevel ? pattern.aiLevelNotes?.[normalizedLevel] ?? null : null
  };
}

export function getInlineGuidance(key: Extract<WorkspaceHelpKey, `framing.${string}`>) {
  const pattern = helpPatterns[key];
  return `${pattern.summary} Avoid: ${pattern.avoid}`;
}

export function formatAiLevelLabel(value: string | null | undefined) {
  if (!value) {
    return "AI level";
  }

  return value.replaceAll("_", " ").replace("level", "Level");
}

export function getAiLevelSummary(value: string | null | undefined) {
  if (value === "level_1" || value === "level_2" || value === "level_3") {
    return aiLevelNotes[value];
  }

  return null;
}
