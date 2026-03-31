type FramingBriefOutcome = {
  id: string;
  key: string;
  title: string;
  problemStatement: string | null;
  outcomeStatement: string | null;
  baselineDefinition: string | null;
  baselineSource: string | null;
  solutionContext: string | null;
  solutionConstraints: string | null;
  dataSensitivity: string | null;
  deliveryType: string | null;
  aiExecutionPattern: string | null;
  aiUsageIntent: string | null;
  businessImpactLevel: "low" | "medium" | "high" | null;
  businessImpactRationale: string | null;
  dataSensitivityLevel: "low" | "medium" | "high" | null;
  dataSensitivityRationale: string | null;
  blastRadiusLevel: "low" | "medium" | "high" | null;
  blastRadiusRationale: string | null;
  decisionImpactLevel: "low" | "medium" | "high" | null;
  decisionImpactRationale: string | null;
  aiLevelJustification: string | null;
  riskAcceptedAt: Date | null;
  timeframe: string | null;
  aiAccelerationLevel: "level_1" | "level_2" | "level_3";
  riskProfile: "low" | "medium" | "high";
  lifecycleState: string;
  originType: string;
  valueOwnerId: string | null;
  valueOwner?: {
    fullName?: string | null;
    email?: string | null;
  } | null;
  epics: Array<{
    id: string;
    key: string;
    title: string;
    scopeBoundary?: string | null;
  }>;
  directionSeeds: Array<{
    id: string;
    key: string;
    title: string;
    epicId?: string | null;
    shortDescription?: string | null;
    expectedBehavior?: string | null;
    sourceStoryId?: string | null;
  }>;
};

export type FramingBriefExportPayload = {
  kind: "framing_brief";
  version: 1;
  handshake: {
    outcome_key: string;
    outcome_title: string;
    problem_statement: string | null;
    outcome_statement: string | null;
    timeframe: string | null;
    value_owner: string | null;
    ai_level: "level_1" | "level_2" | "level_3";
    risk_profile: "low" | "medium" | "high";
    solution_context: string | null;
    constraints: string | null;
    data_sensitivity: string | null;
    delivery_type: "AD" | "AT" | "AM" | null;
  };
  baseline: {
    definition: string | null;
    source: string | null;
    blockers: string[];
    readiness: "ready" | "blocked";
  };
  ai_and_risk: {
    execution_pattern: "assisted" | "step_by_step" | "orchestrated" | null;
    ai_usage_intent: string | null;
    ai_level: "level_1" | "level_2" | "level_3";
    risk_profile: "low" | "medium" | "high";
    risk_rationale: {
      business_impact: string | null;
      data_sensitivity: string | null;
      blast_radius: string | null;
      decision_impact: string | null;
    };
    level_3_justification: string | null;
    risk_acceptance: {
      accepted_by: string | null;
      accepted_at: string | null;
    };
  };
  direction_seeds: {
    epic_count: number;
    seed_count: number;
    epics: Array<{
      key: string;
      title: string;
      scope_boundary: string | null;
      seed_count: number;
    }>;
    seeds: Array<{
      seed_id: string;
      title: string;
      linked_epic: string | null;
      short_description: string | null;
      expected_behavior: string | null;
    }>;
  };
  guidance_for_next_tool: {
    intended_use: string;
    notes: string[];
  };
  metadata: {
    outcome_id: string;
    value_owner_id: string | null;
    epics: Array<{
      key: string;
      epic_id: string;
    }>;
    direction_seeds: Array<{
      seed_id: string;
      legacy_source_reference: string;
      linked_epic_id: string | null;
    }>;
    lifecycle_state: string;
    origin_type: string;
    exported_at: string;
  };
};

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function formatAiLevel(value: "level_1" | "level_2" | "level_3") {
  return value.replace("_", " ").toUpperCase();
}

function formatSentence(value: string) {
  return value.replaceAll("_", " ");
}

function normalizeDeliveryType(value: string | null | undefined): "AD" | "AT" | "AM" | null {
  return value === "AD" || value === "AT" || value === "AM" ? value : null;
}

function normalizeExecutionPattern(value: string | null | undefined): "assisted" | "step_by_step" | "orchestrated" | null {
  return value === "assisted" || value === "step_by_step" || value === "orchestrated" ? value : null;
}

function formatRiskRationale(level: "low" | "medium" | "high" | null, rationale: string | null | undefined) {
  if (!level && !hasText(rationale)) {
    return null;
  }

  return `${level ? `${level}: ` : ""}${rationale?.trim() || "Not captured yet"}`;
}

export function buildFramingBriefExport(input: {
  outcome: FramingBriefOutcome;
  blockers: string[];
  exportedAt?: Date;
}) {
  const exportedAt = (input.exportedAt ?? new Date()).toISOString();
  const valueOwner =
    input.outcome.valueOwner?.fullName ??
    input.outcome.valueOwner?.email ??
    (input.outcome.valueOwnerId ? input.outcome.valueOwnerId : null);
  const epicKeyById = new Map(input.outcome.epics.map((epic) => [epic.id, epic.key] as const));

  const payload: FramingBriefExportPayload = {
    kind: "framing_brief",
    version: 1,
    handshake: {
      outcome_key: input.outcome.key,
      outcome_title: input.outcome.title,
      problem_statement: input.outcome.problemStatement,
      outcome_statement: input.outcome.outcomeStatement,
      timeframe: input.outcome.timeframe,
      value_owner: valueOwner,
      ai_level: input.outcome.aiAccelerationLevel,
      risk_profile: input.outcome.riskProfile,
      solution_context: input.outcome.solutionContext,
      constraints: input.outcome.solutionConstraints,
      data_sensitivity: input.outcome.dataSensitivity,
      delivery_type: normalizeDeliveryType(input.outcome.deliveryType)
    },
    baseline: {
      definition: input.outcome.baselineDefinition,
      source: input.outcome.baselineSource,
      blockers: input.blockers,
      readiness: input.blockers.length === 0 ? "ready" : "blocked"
    },
    ai_and_risk: {
      execution_pattern: normalizeExecutionPattern(input.outcome.aiExecutionPattern),
      ai_usage_intent: input.outcome.aiUsageIntent,
      ai_level: input.outcome.aiAccelerationLevel,
      risk_profile: input.outcome.riskProfile,
      risk_rationale: {
        business_impact: formatRiskRationale(input.outcome.businessImpactLevel, input.outcome.businessImpactRationale),
        data_sensitivity: formatRiskRationale(input.outcome.dataSensitivityLevel, input.outcome.dataSensitivityRationale),
        blast_radius: formatRiskRationale(input.outcome.blastRadiusLevel, input.outcome.blastRadiusRationale),
        decision_impact: formatRiskRationale(input.outcome.decisionImpactLevel, input.outcome.decisionImpactRationale)
      },
      level_3_justification: input.outcome.aiLevelJustification,
      risk_acceptance: {
        accepted_by: valueOwner,
        accepted_at: input.outcome.riskAcceptedAt ? input.outcome.riskAcceptedAt.toISOString() : null
      }
    },
    direction_seeds: {
      epic_count: input.outcome.epics.length,
      seed_count: input.outcome.directionSeeds.length,
      epics: input.outcome.epics.map((epic) => ({
        key: epic.key,
        title: epic.title,
        scope_boundary: epic.scopeBoundary ?? null,
        seed_count: input.outcome.directionSeeds.filter((seed) => seed.epicId === epic.id).length
      })),
      seeds: input.outcome.directionSeeds.map((seed) => ({
        seed_id: seed.key,
        title: seed.title,
        linked_epic: seed.epicId ? epicKeyById.get(seed.epicId) ?? null : null,
        short_description: seed.shortDescription?.trim() || null,
        expected_behavior: seed.expectedBehavior?.trim() || null
      }))
    },
    guidance_for_next_tool: {
      intended_use:
        "Use this package to refine the customer handshake into a stronger framing brief, clearer epic direction, or better solution seeds in external AI tooling such as BMAD or Codex.",
      notes: [
        "Treat the handshake and baseline as source truth unless you explicitly decide to rewrite them.",
        "Treat epics and direction seeds as guidance only, not as locked delivery structure.",
        "Internal IDs are metadata only. Prefer the business keys and titles when reasoning in external tools."
      ]
    },
    metadata: {
      outcome_id: input.outcome.id,
      value_owner_id: input.outcome.valueOwnerId,
      epics: input.outcome.epics.map((epic) => ({
        key: epic.key,
        epic_id: epic.id
      })),
      direction_seeds: input.outcome.directionSeeds.map((seed) => ({
        seed_id: seed.key,
        legacy_source_reference: seed.sourceStoryId ?? seed.id,
        linked_epic_id: seed.epicId ?? null
      })),
      lifecycle_state: input.outcome.lifecycleState,
      origin_type: input.outcome.originType,
      exported_at: exportedAt
    }
  };

  const markdown = [
    "# Framing Brief",
    "",
    "This export is designed for further refinement in external AI tooling such as BMAD.",
    "Business fields come first. Internal IDs are included only as metadata at the end.",
    "",
    "## Customer Handshake",
    `- Outcome key: ${payload.handshake.outcome_key}`,
    `- Outcome title: ${payload.handshake.outcome_title}`,
    `- Timeframe: ${payload.handshake.timeframe ?? "Not captured yet"}`,
    `- Value owner: ${payload.handshake.value_owner ?? "Unassigned"}`,
    `- AI level: ${formatAiLevel(payload.handshake.ai_level)}`,
    `- Risk profile: ${payload.handshake.risk_profile}`,
    "",
    "### Problem Statement",
    hasText(payload.handshake.problem_statement) ? payload.handshake.problem_statement ?? "" : "Not captured yet.",
    "",
    "### Outcome Statement",
    hasText(payload.handshake.outcome_statement) ? payload.handshake.outcome_statement ?? "" : "Not captured yet.",
    "",
    "### Solution Context & Constraints",
    `- Solution context: ${payload.handshake.solution_context ?? "Not captured yet"}`,
    `- Constraints: ${payload.handshake.constraints ?? "Not captured yet"}`,
    `- Data sensitivity: ${payload.handshake.data_sensitivity ?? "Not captured yet"}`,
    `- Delivery type: ${payload.handshake.delivery_type ?? "Not captured yet"}`,
    "",
    "## Baseline",
    `- Readiness: ${payload.baseline.readiness === "ready" ? "Baseline ready" : "Baseline still blocked"}`,
    `- Definition: ${payload.baseline.definition ?? "Not captured yet"}`,
    `- Source: ${payload.baseline.source ?? "Not captured yet"}`,
    "",
    "## AI Level and Risk",
    `- Execution pattern: ${payload.ai_and_risk.execution_pattern?.replaceAll("_", " ") ?? "Not captured yet"}`,
    `- Expected AI use across lifecycle: ${payload.ai_and_risk.ai_usage_intent ?? "Not captured yet"}`,
    `- AI level: ${formatAiLevel(payload.ai_and_risk.ai_level)}`,
    `- Risk profile: ${payload.ai_and_risk.risk_profile}`,
    `- Business impact: ${payload.ai_and_risk.risk_rationale.business_impact ?? "Not captured yet"}`,
    `- Data sensitivity: ${payload.ai_and_risk.risk_rationale.data_sensitivity ?? "Not captured yet"}`,
    `- Blast radius: ${payload.ai_and_risk.risk_rationale.blast_radius ?? "Not captured yet"}`,
    `- Decision impact: ${payload.ai_and_risk.risk_rationale.decision_impact ?? "Not captured yet"}`,
    `- Level 3 justification: ${payload.ai_and_risk.level_3_justification ?? "Not captured yet"}`,
    `- Risk accepted by: ${payload.ai_and_risk.risk_acceptance.accepted_by ?? "Not captured yet"}`,
    `- Risk accepted at: ${payload.ai_and_risk.risk_acceptance.accepted_at ?? "Not captured yet"}`,
    "",
    "## Visible Blockers",
    ...(payload.baseline.blockers.length > 0
      ? payload.baseline.blockers.map((blocker) => `- ${blocker}`)
      : ["- No visible baseline blockers at export time."]),
    "",
    "## Direction Seeds",
    `- Epics: ${payload.direction_seeds.epic_count}`,
    `- Direction seeds: ${payload.direction_seeds.seed_count}`,
    "",
    "### Epics",
    ...(payload.direction_seeds.epics.length > 0
      ? payload.direction_seeds.epics.flatMap((epic) => [
          `- ${epic.key}: ${epic.title}`,
          `  Scope boundary: ${epic.scope_boundary ?? "Not captured yet"}`,
          `  Direction seed count: ${epic.seed_count}`
        ])
      : ["- No epic seeds captured yet."]),
    "",
    "### Direction Seeds",
    ...(payload.direction_seeds.seeds.length > 0
      ? payload.direction_seeds.seeds.flatMap((seed) => [
          `- ${seed.seed_id}: ${seed.title}`,
          `  Linked epic: ${seed.linked_epic ?? "Unassigned"}`,
          `  Short description: ${seed.short_description ?? "Not captured yet"}`,
          `  Expected behavior: ${seed.expected_behavior ?? "Optional and not captured yet"}`
        ])
      : ["- No direction seeds captured yet."]),
    "",
    "## Suggested Use In The Next Tool",
    payload.guidance_for_next_tool.intended_use,
    "",
    ...(payload.guidance_for_next_tool.notes.map((note) => `- ${note}`)),
    "",
    "## Metadata",
    `- Outcome ID: ${payload.metadata.outcome_id}`,
    `- Value Owner ID: ${payload.metadata.value_owner_id ?? "None"}`,
    ...(payload.metadata.epics.length > 0
      ? payload.metadata.epics.map((epic) => `- Epic metadata: ${epic.key} -> ${epic.epic_id}`)
      : ["- Epic metadata: None"]),
    ...(payload.metadata.direction_seeds.length > 0
      ? payload.metadata.direction_seeds.map(
          (seed) =>
            `- Direction seed metadata: ${seed.seed_id} -> legacy source ${seed.legacy_source_reference} (epic ${seed.linked_epic_id ?? "none"})`
        )
      : ["- Direction seed metadata: None"]),
    `- Lifecycle state: ${formatSentence(payload.metadata.lifecycle_state)}`,
    `- Origin type: ${formatSentence(payload.metadata.origin_type)}`,
    `- Exported at: ${payload.metadata.exported_at}`
  ].join("\n");

  return { payload, markdown };
}
