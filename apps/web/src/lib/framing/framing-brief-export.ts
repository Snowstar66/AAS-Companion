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
    uxSketchName?: string | null;
    uxSketchContentType?: string | null;
    uxSketchDataUrl?: string | null;
    uxSketches?: Array<{
      name: string;
      contentType: string;
      dataUrl: string;
    }> | null;
  }>;
};

type FramingApprovalSnapshot = {
  approvedVersion: number | null;
  approvedAt: string | null;
  signoffs: Array<{
    requiredRoleType: string | null;
    actualPersonName: string | null;
    actualRoleTitle: string | null;
    organizationSide: string | null;
    note: string | null;
    createdAt: string | null;
  }>;
};

export type FramingBriefExportPayload = {
  kind: "framing_brief";
  version: 3;
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
    delivery_type_description: string;
  };
  baseline: {
    definition: string | null;
    source: string | null;
    warnings: string[];
    readiness: "ready" | "warning";
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
  };
  framing_structure: {
    epic_count: number;
    story_idea_count: number;
    epics: Array<{
      key: string;
      title: string;
      scope_boundary: string | null;
      story_ideas: Array<{
        key: string;
        title: string;
        value_intent: string | null;
        expected_behavior: string | null;
        ux_sketches: Array<{
          name: string;
          content_type: string | null;
          data_url: string | null;
          file_path: string | null;
        }>;
      }>;
    }>;
    unassigned_story_ideas: Array<{
      key: string;
      title: string;
      value_intent: string | null;
      expected_behavior: string | null;
      ux_sketches: Array<{
        name: string;
        content_type: string | null;
        data_url: string | null;
        file_path: string | null;
      }>;
    }>;
  };
  approvals: {
    status: "approved" | "not_approved";
    approved_version: number | null;
    approved_at: string | null;
    signoffs: Array<{
      role: string | null;
      person: string | null;
      role_title: string | null;
      side: string | null;
      note: string | null;
      approved_at: string | null;
    }>;
  };
  next_step_handoff: {
    recommended_use: string;
    references: string[];
  };
  metadata: {
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

function getDeliveryTypeDescription(value: "AD" | "AT" | "AM" | null) {
  if (value === "AD") {
    return "Application Development: frame a new application, service or meaningful functional expansion. Keep focus on outcome, scope and why the capability should exist.";
  }

  if (value === "AT") {
    return "Application Transformation: frame a larger change in an existing landscape or operating model. Keep focus on what must change, what must stay safe and why the shift matters.";
  }

  if (value === "AM") {
    return "Application Maintenance: frame change in an existing application with continuity in mind. Keep focus on operational constraints, preservation needs and safe improvement.";
  }

  return "Not captured yet.";
}

function getAiLevelSummary(value: "level_1" | "level_2" | "level_3") {
  if (value === "level_1") {
    return "Level 1 means assisted delivery: AI supports a human interactively, no workflow automation, and humans make all decisions.";
  }

  if (value === "level_2") {
    return "Level 2 means structured acceleration: AI produces artifacts step-by-step and humans review between each step.";
  }

  return "Level 3 means orchestrated agentic delivery: AI executes multiple chained steps through workflows or agents with stronger governance.";
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildSketchFilePath(input: {
  epicKey?: string | null;
  storyIdeaKey: string;
  storyIdeaTitle: string;
  sketchName: string;
  index: number;
}) {
  const epicSegment = sanitizePathSegment(input.epicKey ?? "unassigned");
  const storySegment = sanitizePathSegment(`${input.storyIdeaKey}-${input.storyIdeaTitle}`) || sanitizePathSegment(input.storyIdeaKey);
  const sketchSegment = sanitizePathSegment(input.sketchName) || `sketch-${input.index + 1}`;

  return `ux-sketches/${epicSegment}/${storySegment}/${String(input.index + 1).padStart(2, "0")}-${sketchSegment}`;
}

function parseApprovalSnapshot(value: unknown): FramingApprovalSnapshot {
  if (!value || typeof value !== "object") {
    return {
      approvedVersion: null,
      approvedAt: null,
      signoffs: []
    };
  }

  const record = value as {
    approvedVersion?: unknown;
    approvedAt?: unknown;
    signoffs?: unknown;
  };

  const signoffs = Array.isArray(record.signoffs)
    ? record.signoffs.map((item) => {
        const signoff = item as {
          requiredRoleType?: unknown;
          actualPersonName?: unknown;
          actualRoleTitle?: unknown;
          organizationSide?: unknown;
          note?: unknown;
          createdAt?: unknown;
        };

        return {
          requiredRoleType: typeof signoff.requiredRoleType === "string" ? signoff.requiredRoleType : null,
          actualPersonName: typeof signoff.actualPersonName === "string" ? signoff.actualPersonName : null,
          actualRoleTitle: typeof signoff.actualRoleTitle === "string" ? signoff.actualRoleTitle : null,
          organizationSide: typeof signoff.organizationSide === "string" ? signoff.organizationSide : null,
          note: typeof signoff.note === "string" ? signoff.note : null,
          createdAt: typeof signoff.createdAt === "string" ? signoff.createdAt : null
        };
      })
    : [];

  return {
    approvedVersion: typeof record.approvedVersion === "number" ? record.approvedVersion : null,
    approvedAt: typeof record.approvedAt === "string" ? record.approvedAt : null,
    signoffs
  };
}

function getSketches(
  seed: FramingBriefOutcome["directionSeeds"][number],
  context: {
    epicKey?: string | null;
    storyIdeaKey: string;
    storyIdeaTitle: string;
  }
) {
  const sketches =
    seed.uxSketches && seed.uxSketches.length > 0
      ? seed.uxSketches.map((sketch) => ({
          name: sketch.name,
          content_type: sketch.contentType,
          data_url: sketch.dataUrl,
          file_path: null as string | null
        }))
      : hasText(seed.uxSketchDataUrl)
        ? [
            {
              name: seed.uxSketchName ?? "Concept sketch attached",
              content_type: seed.uxSketchContentType ?? null,
              data_url: seed.uxSketchDataUrl ?? null,
              file_path: null as string | null
            }
          ]
        : [];

  return sketches.map((sketch, index) => ({
    ...sketch,
    file_path: sketch.data_url
      ? buildSketchFilePath({
          epicKey: context.epicKey ?? null,
          storyIdeaKey: context.storyIdeaKey,
          storyIdeaTitle: context.storyIdeaTitle,
          sketchName: sketch.name,
          index
        })
      : null
  }));
}

export function buildFramingBriefExport(input: {
  outcome: FramingBriefOutcome;
  blockers: string[];
  tollgate?: {
    approvalSnapshot?: unknown;
    status?: string | null;
    approvedVersion?: number | null;
  } | null;
  exportedAt?: Date;
}) {
  const exportedAt = (input.exportedAt ?? new Date()).toISOString();
  const valueOwner =
    input.outcome.valueOwner?.fullName ??
    input.outcome.valueOwner?.email ??
    (input.outcome.valueOwnerId ? input.outcome.valueOwnerId : null);
  const deliveryType = normalizeDeliveryType(input.outcome.deliveryType);
  const approvalSnapshot = parseApprovalSnapshot(input.tollgate?.approvalSnapshot);
  const epicsWithSeeds = input.outcome.epics.map((epic) => ({
    key: epic.key,
    title: epic.title,
    scope_boundary: epic.scopeBoundary ?? null,
    story_ideas: input.outcome.directionSeeds
      .filter((seed) => seed.epicId === epic.id)
      .map((seed) => ({
        key: seed.key,
        title: seed.title,
        value_intent: seed.shortDescription?.trim() || null,
        expected_behavior: seed.expectedBehavior?.trim() || null,
        ux_sketches: getSketches(seed, {
          epicKey: epic.key,
          storyIdeaKey: seed.key,
          storyIdeaTitle: seed.title
        })
      }))
  }));
  const unassignedStoryIdeas = input.outcome.directionSeeds
    .filter((seed) => !seed.epicId)
    .map((seed) => ({
      key: seed.key,
      title: seed.title,
      value_intent: seed.shortDescription?.trim() || null,
      expected_behavior: seed.expectedBehavior?.trim() || null,
      ux_sketches: getSketches(seed, {
        epicKey: null,
        storyIdeaKey: seed.key,
        storyIdeaTitle: seed.title
      })
    }));

  const payload: FramingBriefExportPayload = {
    kind: "framing_brief",
    version: 3,
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
      delivery_type: deliveryType,
      delivery_type_description: getDeliveryTypeDescription(deliveryType)
    },
    baseline: {
      definition: input.outcome.baselineDefinition,
      source: input.outcome.baselineSource,
      warnings: input.blockers,
      readiness: input.blockers.length === 0 ? "ready" : "warning"
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
      level_3_justification: input.outcome.aiLevelJustification
    },
    framing_structure: {
      epic_count: input.outcome.epics.length,
      story_idea_count: input.outcome.directionSeeds.length,
      epics: epicsWithSeeds,
      unassigned_story_ideas: unassignedStoryIdeas
    },
    approvals: {
      status: input.tollgate?.status === "approved" ? "approved" : "not_approved",
      approved_version: approvalSnapshot.approvedVersion ?? input.tollgate?.approvedVersion ?? null,
      approved_at: approvalSnapshot.approvedAt,
      signoffs: approvalSnapshot.signoffs.map((signoff) => ({
        role: signoff.requiredRoleType ? formatSentence(signoff.requiredRoleType) : null,
        person: signoff.actualPersonName,
        role_title: signoff.actualRoleTitle,
        side: signoff.organizationSide ? formatSentence(signoff.organizationSide) : null,
        note: signoff.note,
        approved_at: signoff.createdAt
      }))
    },
    next_step_handoff: {
      recommended_use:
        "Use this Framing package as input for BMAD or another controlled AI tool when you move into design, story refinement or structured delivery planning.",
      references: [
        "Treat the customer handshake, baseline and AI/risk posture as the framing source of truth.",
        "Treat Epics and Story Ideas as directional input for design and delivery refinement, not as fixed implementation steps.",
        "Use the approval section to understand whether this Framing version is already signed off for Tollgate 1.",
        "Use the UX sketch references where they exist to preserve visual intent in the next step."
      ]
    },
    metadata: {
      lifecycle_state: input.outcome.lifecycleState,
      origin_type: input.outcome.originType,
      exported_at: exportedAt
    }
  };

  const markdown = [
    "# Framing Brief",
    "",
    "This package is intended as input to the next controlled AI-assisted step, for example BMAD-based design or structured refinement.",
    "",
    "## Customer Handshake",
    `Outcome key: ${payload.handshake.outcome_key}`,
    `Outcome title: ${payload.handshake.outcome_title}`,
    `Timeframe: ${payload.handshake.timeframe ?? "Not captured yet"}`,
    `Value owner: ${payload.handshake.value_owner ?? "Unassigned"}`,
    "",
    "### Problem Statement",
    hasText(payload.handshake.problem_statement) ? payload.handshake.problem_statement ?? "" : "Not captured yet.",
    "",
    "### Outcome Statement",
    hasText(payload.handshake.outcome_statement) ? payload.handshake.outcome_statement ?? "" : "Not captured yet.",
    "",
    "### Solution Context & Constraints",
    `Solution context: ${payload.handshake.solution_context ?? "Not captured yet"}`,
    `Constraints: ${payload.handshake.constraints ?? "Not captured yet"}`,
    `Data sensitivity: ${payload.handshake.data_sensitivity ?? "Not captured yet"}`,
    `Delivery type: ${payload.handshake.delivery_type ?? "Not captured yet"}`,
    payload.handshake.delivery_type_description,
    "",
    "## Baseline",
    `Readiness: ${payload.baseline.readiness === "ready" ? "Ready" : "Warnings present"}`,
    `Definition: ${payload.baseline.definition ?? "Not captured yet"}`,
    `Source: ${payload.baseline.source ?? "Not captured yet"}`,
    "",
    "## AI and Risk",
    `Execution pattern: ${payload.ai_and_risk.execution_pattern?.replaceAll("_", " ") ?? "Not captured yet"}`,
    `AI level: ${formatAiLevel(payload.ai_and_risk.ai_level)}`,
    getAiLevelSummary(payload.ai_and_risk.ai_level),
    `Expected AI use across lifecycle: ${payload.ai_and_risk.ai_usage_intent ?? "Not captured yet"}`,
    `Risk profile: ${payload.ai_and_risk.risk_profile}`,
    `Business impact: ${payload.ai_and_risk.risk_rationale.business_impact ?? "Not captured yet"}`,
    `Data sensitivity: ${payload.ai_and_risk.risk_rationale.data_sensitivity ?? "Not captured yet"}`,
    `Blast radius: ${payload.ai_and_risk.risk_rationale.blast_radius ?? "Not captured yet"}`,
    `Decision impact: ${payload.ai_and_risk.risk_rationale.decision_impact ?? "Not captured yet"}`,
    `Level 3 justification: ${payload.ai_and_risk.level_3_justification ?? "Not captured yet"}`,
    "",
    "## Framing Warnings",
    ...(payload.baseline.warnings.length > 0
      ? payload.baseline.warnings.map((warning) => `- ${warning}`)
      : ["- No warnings were visible at export time."]),
    "",
    "## Epics and Story Ideas",
    ...(payload.framing_structure.epics.length > 0
      ? payload.framing_structure.epics.flatMap((epic) => [
          `### ${epic.key} - ${epic.title}`,
          `Scope boundary: ${epic.scope_boundary ?? "Not captured yet"}`,
          ...(epic.story_ideas.length > 0
            ? epic.story_ideas.flatMap((storyIdea) => [
                `- Story Idea ${storyIdea.key}: ${storyIdea.title}`,
                `  Value intent: ${storyIdea.value_intent ?? "Not captured yet"}`,
                `  Expected behavior: ${storyIdea.expected_behavior ?? "Not captured yet"}`,
                `  UX sketches: ${
                  storyIdea.ux_sketches.length > 0
                    ? storyIdea.ux_sketches
                        .map((sketch) => `${sketch.name}${sketch.file_path ? ` -> ${sketch.file_path}` : ""}`)
                        .join(", ")
                    : "None attached"
                }`
              ])
            : ["- No Story Ideas are linked to this Epic yet."]),
          ""
        ])
      : ["No Epics captured yet.", ""]),
    ...(payload.framing_structure.unassigned_story_ideas.length > 0
      ? [
          "## Unassigned Story Ideas",
          ...payload.framing_structure.unassigned_story_ideas.flatMap((storyIdea) => [
            `- ${storyIdea.key}: ${storyIdea.title}`,
            `  Value intent: ${storyIdea.value_intent ?? "Not captured yet"}`,
            `  Expected behavior: ${storyIdea.expected_behavior ?? "Not captured yet"}`,
            `  UX sketches: ${
              storyIdea.ux_sketches.length > 0
                ? storyIdea.ux_sketches
                    .map((sketch) => `${sketch.name}${sketch.file_path ? ` -> ${sketch.file_path}` : ""}`)
                    .join(", ")
                : "None attached"
            }`
          ]),
          ""
        ]
      : []),
    "## Tollgate 1 Approval Context",
    `Approval status: ${payload.approvals.status === "approved" ? "Approved" : "Not yet approved"}`,
    `Approved version: ${payload.approvals.approved_version ?? "Not captured yet"}`,
    `Approved at: ${payload.approvals.approved_at ?? "Not captured yet"}`,
    ...(payload.approvals.signoffs.length > 0
      ? payload.approvals.signoffs.flatMap((signoff) => [
          `- ${signoff.role ?? "Approval role"} (${signoff.side ?? "side not captured"})`,
          `  Person: ${signoff.person ?? "Not captured yet"}`,
          `  Role title: ${signoff.role_title ?? "Not captured yet"}`,
          `  Approved at: ${signoff.approved_at ?? "Not captured yet"}`,
          `  Motivation: ${signoff.note ?? "Not captured yet"}`
        ])
      : ["- No Tollgate 1 signoffs are recorded yet."]),
    "",
    "## Recommended Use In The Next Step",
    payload.next_step_handoff.recommended_use,
    ...payload.next_step_handoff.references.map((reference) => `- ${reference}`),
    "",
    "## Export Metadata",
    `Lifecycle state: ${formatSentence(payload.metadata.lifecycle_state)}`,
    `Origin type: ${formatSentence(payload.metadata.origin_type)}`,
    `Exported at: ${payload.metadata.exported_at}`
  ].join("\n");

  return { payload, markdown };
}
