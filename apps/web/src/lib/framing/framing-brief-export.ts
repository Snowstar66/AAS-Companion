import {
  analyzeDownstreamAiInstructions,
  mapAiAccelerationLevelToDownstreamAiLevel,
  parseDownstreamAiInstructions,
  type DownstreamAiInstructions,
  type JourneyContext
} from "@aas-companion/domain";

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
  journeyContexts: JourneyContext[];
  downstreamAiInstructions?: DownstreamAiInstructions | null;
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
  version: 6;
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
  journey_contexts: Array<{
    id: string;
    outcome_id: string;
    initiative_type: "AD" | "AT" | "AM";
    title: string;
    description: string | null;
    notes: string | null;
    journeys: Array<{
      id: string;
      title: string;
      type: string | null;
      primary_actor: string;
      supporting_actors: string[];
      goal: string;
      trigger: string;
      narrative: string | null;
      value_moment: string | null;
      success_signals: string[];
      current_state: string | null;
      desired_future_state: string | null;
      pain_points: string[];
      desired_support: string[];
      exceptions: string[];
      notes: string | null;
      linked_epic_ids: string[];
      linked_story_idea_ids: string[];
      linked_figma_refs: string[];
      steps: Array<{
        id: string;
        title: string;
        actor: string | null;
        description: string;
        current_pain: string | null;
        desired_support: string | null;
        decision_point: boolean;
      }>;
      coverage: {
        status: "unanalysed" | "covered" | "partially_covered" | "uncovered";
        suggested_epic_ids: string[];
        suggested_story_idea_ids: string[];
        suggested_new_story_ideas: Array<{
          title: string;
          description: string;
          value_intent: string | null;
          expected_outcome: string | null;
          based_on_journey_ids: string[];
          based_on_step_ids: string[];
          confidence: number | null;
        }>;
        notes: string | null;
      } | null;
    }>;
  }>;
  downstream_ai_instructions: {
    initiativeType: "AD" | "AT" | "AM";
    aiLevel: 0 | 1 | 2 | 3;
    mandatoryControls: Array<{
      id: string;
      title: string;
      description: string;
      enabled: true;
    }>;
    refinementPreferences: Array<{
      id: string;
      group: "epic" | "story" | "journey" | "design" | "build";
      title: string;
      description: string | null;
      recommended: "YES" | "NO" | "N/A";
      selectedValue: "YES" | "NO" | "N/A";
      allowNa: boolean;
      rationale: string | null;
    }>;
    customInstructions: Array<{
      id: string;
      title: string;
      body: string;
      category: "General" | "Epic" | "Story" | "Journey" | "Design" | "Build";
      priority: "Normal" | "High";
    }>;
    deviations: Array<{
      id: string;
      group: "epic" | "story" | "journey" | "design" | "build";
      title: string;
      recommended: "YES" | "NO" | "N/A";
      selected: "YES" | "NO" | "N/A";
      rationale: string | null;
    }>;
    warnings: string[];
    hard_validation_issues: string[];
    generatedGuidance: {
      epicRefinementGuide: string[];
      storyIdeaRefinementGuide: string[];
      journeyUsageGuide: string[];
      designAiGuidance: string[];
      buildAiGuidance: string[];
      customInstructionAppendix: Array<{
        title: string;
        category: string;
        priority: string;
        body: string;
      }>;
      deviationsSummary: string[];
      warningValidationNotes: string[];
    };
  } | null;
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

export type HumanFramingBriefExport = {
  title: string;
  markdown: string;
  filename: string;
};

export type FramingAiHandoffProfile = "neutral_governed" | "bmad_prepared";

export type ProfiledFramingAiHandoff = {
  profile: FramingAiHandoffProfile;
  label: string;
  description: string;
  payload: FramingBriefExportPayload;
  markdown: string;
  json: {
    profile: FramingAiHandoffProfile;
    intent: string;
    guidance: string[];
    source_of_truth: FramingBriefExportPayload;
  };
  markdownFilename: string;
  jsonFilename: string;
  packageFilename: string;
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

function mapJourneyContexts(outcome: FramingBriefOutcome) {
  return outcome.journeyContexts.map((context) => ({
    id: context.id,
    outcome_id: context.outcomeId,
    initiative_type: context.initiativeType,
    title: context.title,
    description: context.description ?? null,
    notes: context.notes ?? null,
    journeys: context.journeys.map((journey) => ({
      id: journey.id,
      title: journey.title,
      type: journey.type ?? null,
      primary_actor: journey.primaryActor,
      supporting_actors: journey.supportingActors ?? [],
      goal: journey.goal,
      trigger: journey.trigger,
      narrative: journey.narrative ?? null,
      value_moment: journey.valueMoment ?? null,
      success_signals: journey.successSignals ?? [],
      current_state: journey.currentState ?? null,
      desired_future_state: journey.desiredFutureState ?? null,
      pain_points: journey.painPoints ?? [],
      desired_support: journey.desiredSupport ?? [],
      exceptions: journey.exceptions ?? [],
      notes: journey.notes ?? null,
      linked_epic_ids: journey.linkedEpicIds ?? [],
      linked_story_idea_ids: journey.linkedStoryIdeaIds ?? [],
      linked_figma_refs: journey.linkedFigmaRefs ?? [],
      steps: journey.steps.map((step) => ({
        id: step.id,
        title: step.title,
        actor: step.actor ?? null,
        description: step.description,
        current_pain: step.currentPain ?? null,
        desired_support: step.desiredSupport ?? null,
        decision_point: Boolean(step.decisionPoint)
      })),
      coverage: journey.coverage
        ? {
            status: journey.coverage.status,
            suggested_epic_ids: journey.coverage.suggestedEpicIds ?? [],
            suggested_story_idea_ids: journey.coverage.suggestedStoryIdeaIds ?? [],
            suggested_new_story_ideas: (journey.coverage.suggestedNewStoryIdeas ?? []).map((idea) => ({
              title: idea.title,
              description: idea.description,
              value_intent: idea.valueIntent ?? null,
              expected_outcome: idea.expectedOutcome ?? null,
              based_on_journey_ids: idea.basedOnJourneyIds ?? [],
              based_on_step_ids: idea.basedOnStepIds ?? [],
              confidence: idea.confidence ?? null
            })),
            notes: journey.coverage.notes ?? null
          }
        : null
    }))
  }));
}

function mapDownstreamAiInstructions(outcome: FramingBriefOutcome) {
  const deliveryType =
    outcome.deliveryType === "AD" || outcome.deliveryType === "AT" || outcome.deliveryType === "AM" ? outcome.deliveryType : "AD";
  const instructions =
    parseDownstreamAiInstructions(outcome.downstreamAiInstructions, {
      initiativeType: deliveryType,
      aiLevel: mapAiAccelerationLevelToDownstreamAiLevel(outcome.aiAccelerationLevel)
    }) ?? null;

  if (!instructions) {
    return null;
  }

  const analysis = analyzeDownstreamAiInstructions({
    instructions,
    hasJourneyContext: outcome.journeyContexts.length > 0
  });

  return {
    initiativeType: instructions.initiativeType,
    aiLevel: instructions.aiLevel,
    mandatoryControls: instructions.mandatoryControls.map((control) => ({
      id: control.id,
      title: control.title,
      description: control.description,
      enabled: true as const
    })),
    refinementPreferences: instructions.refinementPreferences.map((preference) => ({
      id: preference.id,
      group: preference.group,
      title: preference.title,
      description: preference.description ?? null,
      recommended: preference.defaultByMode[instructions.initiativeType],
      selectedValue: preference.selectedValue,
      allowNa: preference.allowNa,
      rationale: preference.rationale?.trim() || null
    })),
    customInstructions: instructions.customInstructions.map((instruction) => ({
      id: instruction.id,
      title: instruction.title,
      body: instruction.body,
      category: instruction.category,
      priority: instruction.priority
    })),
    deviations: analysis.deviations.map((deviation) => ({
      id: deviation.id,
      group: deviation.group,
      title: deviation.title,
      recommended: deviation.recommended,
      selected: deviation.selected,
      rationale: deviation.rationale
    })),
    warnings: analysis.warnings,
    hard_validation_issues: analysis.hardIssues,
    generatedGuidance: analysis.generatedGuidance
  };
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
  const journeyContexts = mapJourneyContexts(input.outcome);
  const downstreamAiInstructions = mapDownstreamAiInstructions(input.outcome);

  const payload: FramingBriefExportPayload = {
    kind: "framing_brief",
    version: 6,
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
    journey_contexts: journeyContexts,
    downstream_ai_instructions: downstreamAiInstructions,
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
        "Use this Framing package as the governed source of truth when you move into design, story refinement or structured delivery planning with BMAD or another AI tool.",
      references: [
        "Treat the customer handshake, baseline and AI/risk posture as the framing source of truth.",
        "Treat Epics and Story Ideas as directional input for design and later delivery refinement, not as fixed implementation steps.",
        "If later steps create Delivery Stories or extra work items, keep them traceable back to this Framing package or record them explicitly as feedback-loop additions.",
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
    ...(payload.journey_contexts.length > 0
      ? [
          "## Journey Context",
          ...payload.journey_contexts.flatMap((context) => [
            `### ${context.title || context.id}`,
            `ID: ${context.id}`,
            `Outcome ID: ${context.outcome_id}`,
            `Initiative type: ${context.initiative_type}`,
            `Description: ${context.description ?? "Not captured yet"}`,
            `Notes: ${context.notes ?? "Not captured yet"}`,
            ...(context.journeys.length > 0
              ? context.journeys.flatMap((journey) => [
                  `#### Journey ${journey.id}: ${journey.title || "Untitled Journey"}`,
                  `Type: ${journey.type ?? "Not captured yet"}`,
                  `Primary actor: ${journey.primary_actor || "Not captured yet"}`,
                  `Supporting actors: ${journey.supporting_actors.length > 0 ? journey.supporting_actors.join(", ") : "None captured"}`,
                  `Goal: ${journey.goal || "Not captured yet"}`,
                  `Trigger: ${journey.trigger || "Not captured yet"}`,
                  `Journey narrative: ${journey.narrative ?? "Not captured yet"}`,
                  `Value moment: ${journey.value_moment ?? "Not captured yet"}`,
                  `Success signals: ${journey.success_signals.length > 0 ? journey.success_signals.join(" | ") : "None captured"}`,
                  `Current state: ${journey.current_state ?? "Not captured yet"}`,
                  `Desired future state: ${journey.desired_future_state ?? "Not captured yet"}`,
                  `Pain points: ${journey.pain_points.length > 0 ? journey.pain_points.join(" | ") : "None captured"}`,
                  `Desired support: ${journey.desired_support.length > 0 ? journey.desired_support.join(" | ") : "None captured"}`,
                  `Exceptions: ${journey.exceptions.length > 0 ? journey.exceptions.join(" | ") : "None captured"}`,
                  `Notes: ${journey.notes ?? "Not captured yet"}`,
                  `Linked Epics: ${journey.linked_epic_ids.length > 0 ? journey.linked_epic_ids.join(", ") : "None"}`,
                  `Linked Story Ideas: ${journey.linked_story_idea_ids.length > 0 ? journey.linked_story_idea_ids.join(", ") : "None"}`,
                  `Linked Figma refs: ${journey.linked_figma_refs.length > 0 ? journey.linked_figma_refs.join(", ") : "None"}`,
                  ...(journey.steps.length > 0
                    ? journey.steps.flatMap((step) => [
                        `- Step ${step.id}: ${step.title || "Untitled Step"}`,
                        `  Actor: ${step.actor ?? "Not captured yet"}`,
                        `  Description: ${step.description || "Not captured yet"}`,
                        `  Current pain: ${step.current_pain ?? "Not captured yet"}`,
                        `  Desired support: ${step.desired_support ?? "Not captured yet"}`,
                        `  Decision point: ${step.decision_point ? "Yes" : "No"}`
                      ])
                    : ["- No Steps captured yet."]),
                  ...(journey.coverage
                    ? [
                        `Coverage status: ${journey.coverage.status}`,
                        `Coverage suggested Epics: ${journey.coverage.suggested_epic_ids.length > 0 ? journey.coverage.suggested_epic_ids.join(", ") : "None"}`,
                        `Coverage suggested Story Ideas: ${journey.coverage.suggested_story_idea_ids.length > 0 ? journey.coverage.suggested_story_idea_ids.join(", ") : "None"}`,
                        ...(journey.coverage.suggested_new_story_ideas.length > 0
                          ? journey.coverage.suggested_new_story_ideas.flatMap((idea) => [
                              `- Suggested Story Idea: ${idea.title}`,
                              `  Description: ${idea.description}`,
                              `  Value intent: ${idea.value_intent ?? "Not captured yet"}`,
                              `  Expected outcome: ${idea.expected_outcome ?? "Not captured yet"}`,
                              `  Based on journey IDs: ${idea.based_on_journey_ids.length > 0 ? idea.based_on_journey_ids.join(", ") : "None"}`,
                              `  Based on step IDs: ${idea.based_on_step_ids.length > 0 ? idea.based_on_step_ids.join(", ") : "None"}`,
                              `  Confidence: ${idea.confidence ?? "Not captured yet"}`
                            ])
                          : ["Coverage suggested new Story Ideas: None"]),
                        `Coverage notes: ${journey.coverage.notes ?? "Not captured yet"}`
                      ]
                    : ["Coverage status: unanalysed"]),
                  ""
                ])
              : ["No Journeys captured yet.", ""]),
            ""
          ])
        ]
      : []),
    ...(payload.downstream_ai_instructions
      ? [
          "## Downstream AI Instructions",
          "",
          "### Always-on Controls",
          ...payload.downstream_ai_instructions.mandatoryControls.map(
            (control) => `- ${control.title}: ${control.description}`
          ),
          "",
          "### Epic Refinement",
          ...payload.downstream_ai_instructions.refinementPreferences
            .filter((preference) => preference.group === "epic")
            .map(
              (preference) =>
                `- ${preference.id} ${preference.title}: ${preference.selectedValue} (recommended ${preference.recommended})${preference.rationale ? ` - ${preference.rationale}` : ""}`
            ),
          "",
          "### Story Idea Refinement",
          ...payload.downstream_ai_instructions.refinementPreferences
            .filter((preference) => preference.group === "story")
            .map(
              (preference) =>
                `- ${preference.id} ${preference.title}: ${preference.selectedValue} (recommended ${preference.recommended})${preference.rationale ? ` - ${preference.rationale}` : ""}`
            ),
          "",
          "### Journey Usage",
          ...payload.downstream_ai_instructions.refinementPreferences
            .filter((preference) => preference.group === "journey")
            .map(
              (preference) =>
                `- ${preference.id} ${preference.title}: ${preference.selectedValue} (recommended ${preference.recommended})${preference.rationale ? ` - ${preference.rationale}` : ""}`
            ),
          "",
          "### Design Guidance",
          ...payload.downstream_ai_instructions.refinementPreferences
            .filter((preference) => preference.group === "design")
            .map(
              (preference) =>
                `- ${preference.id} ${preference.title}: ${preference.selectedValue} (recommended ${preference.recommended})${preference.rationale ? ` - ${preference.rationale}` : ""}`
            ),
          "",
          "### Build Guidance",
          ...payload.downstream_ai_instructions.refinementPreferences
            .filter((preference) => preference.group === "build")
            .map(
              (preference) =>
                `- ${preference.id} ${preference.title}: ${preference.selectedValue} (recommended ${preference.recommended})${preference.rationale ? ` - ${preference.rationale}` : ""}`
            ),
          "",
          "### Custom Instructions",
          ...(payload.downstream_ai_instructions.customInstructions.length > 0
            ? payload.downstream_ai_instructions.customInstructions.flatMap((instruction) => [
                `- ${instruction.priority} ${instruction.category}: ${instruction.title}`,
                `  ${instruction.body}`
              ])
            : ["- No custom instructions added."]),
          "",
          "### Deviations from Recommended Defaults",
          ...payload.downstream_ai_instructions.generatedGuidance.deviationsSummary.map((line) => `- ${line}`),
          "",
          "### Warnings / Validation Notes",
          ...payload.downstream_ai_instructions.generatedGuidance.warningValidationNotes.map((line) => `- ${line}`),
          "",
          "### Generated Downstream Guidance",
          "#### Epic Refinement Guide",
          ...payload.downstream_ai_instructions.generatedGuidance.epicRefinementGuide.map((line) => `- ${line}`),
          "#### Story Idea Refinement Guide",
          ...payload.downstream_ai_instructions.generatedGuidance.storyIdeaRefinementGuide.map((line) => `- ${line}`),
          "#### Journey Usage Guide",
          ...payload.downstream_ai_instructions.generatedGuidance.journeyUsageGuide.map((line) => `- ${line}`),
          "#### Design AI Guidance",
          ...payload.downstream_ai_instructions.generatedGuidance.designAiGuidance.map((line) => `- ${line}`),
          "#### Build AI Guidance",
          ...payload.downstream_ai_instructions.generatedGuidance.buildAiGuidance.map((line) => `- ${line}`),
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

export function buildHumanFramingBriefExport(input: {
  outcome: FramingBriefOutcome;
  blockers: string[];
  tollgate?: {
    approvalSnapshot?: unknown;
    status?: string | null;
    approvedVersion?: number | null;
  } | null;
  exportedAt?: Date;
}): HumanFramingBriefExport {
  const aiExport = buildFramingBriefExport(input);
  const payload = aiExport.payload;
  const key = payload.handshake.outcome_key;
  const title = payload.handshake.outcome_title;
  const epics = payload.framing_structure.epics;
  const storyIdeaCount = payload.framing_structure.story_idea_count;
  const signoffs = payload.approvals.signoffs;
  const exportedAt = payload.metadata.exported_at;
  const filename = `${key.toLowerCase()}-framing-brief-human.md`;
  const markdown = [
    "# Framing Brief",
    "",
    `${key} - ${title}`,
    "",
    "## Outcome",
    payload.handshake.outcome_statement ?? payload.handshake.problem_statement ?? "Outcome statement is not captured yet.",
    "",
    "## Why this matters",
    payload.handshake.problem_statement ?? "Problem statement is not captured yet.",
    "",
    "## Baseline",
    `Definition: ${payload.baseline.definition ?? "Not captured yet"}`,
    `Source: ${payload.baseline.source ?? "Not captured yet"}`,
    "",
    "## Framing constraints",
    payload.handshake.constraints ?? "No consolidated framing constraints are captured yet.",
    "",
    "## Value spine",
    `Epics: ${epics.length}`,
    `Story Ideas: ${storyIdeaCount}`,
    "",
    ...(epics.length > 0
      ? epics.flatMap((epic) => [
          `### ${epic.key} - ${epic.title}`,
          `Scope boundary: ${epic.scope_boundary ?? "Not captured yet"}`,
          ...(epic.story_ideas.length > 0
            ? epic.story_ideas.map(
                (storyIdea) =>
                  `- ${storyIdea.key} - ${storyIdea.title}${storyIdea.value_intent ? `: ${storyIdea.value_intent}` : ""}`
              )
            : ["- No Story Ideas are linked yet."]),
          ""
        ])
      : ["No Epics are captured yet.", ""]),
    ...(payload.framing_structure.unassigned_story_ideas.length > 0
      ? [
          "## Story Ideas still without Epic",
          ...payload.framing_structure.unassigned_story_ideas.map(
            (storyIdea) =>
              `- ${storyIdea.key} - ${storyIdea.title}${storyIdea.value_intent ? `: ${storyIdea.value_intent}` : ""}`
          ),
          ""
        ]
      : []),
    ...(payload.journey_contexts.length > 0
      ? [
          "## Journey Context",
          ...payload.journey_contexts.flatMap((context) => [
            `### ${context.title || context.id} (${context.initiative_type})`,
            context.description ?? "No description captured yet.",
            ...(context.journeys.length > 0
              ? context.journeys.flatMap((journey) => [
                  `- Journey ${journey.id}: ${journey.title || "Untitled Journey"}`,
                  `  Primary actor: ${journey.primary_actor || "Not captured yet"}`,
                  `  Goal: ${journey.goal || "Not captured yet"}`,
                  `  Trigger: ${journey.trigger || "Not captured yet"}`,
                  `  Journey narrative: ${journey.narrative ?? "Not captured yet"}`,
                  `  Value moment: ${journey.value_moment ?? "Not captured yet"}`,
                  ...(journey.success_signals.length > 0
                    ? journey.success_signals.map((signal) => `  Success signal: ${signal}`)
                    : ["  Success signal: Not captured yet"]),
                  `  Coverage: ${journey.coverage?.status ?? "unanalysed"}`,
                  ...(journey.coverage?.suggested_new_story_ideas?.length
                    ? journey.coverage.suggested_new_story_ideas.map(
                        (idea) => `  Suggested Story Idea: ${idea.title} - ${idea.description}`
                      )
                    : [])
                ])
              : ["- No Journeys are captured yet."]),
            ""
          ])
        ]
      : []),
    ...(payload.downstream_ai_instructions
      ? [
          "## Downstream AI Instructions",
          `Initiative type: ${payload.downstream_ai_instructions.initiativeType}`,
          `AI level: ${payload.downstream_ai_instructions.aiLevel}`,
          ...payload.downstream_ai_instructions.generatedGuidance.deviationsSummary.map((line) => `- ${line}`),
          ...payload.downstream_ai_instructions.generatedGuidance.warningValidationNotes.map((line) => `- ${line}`),
          ""
        ]
      : []),
    "## Approval context",
    `Status: ${payload.approvals.status === "approved" ? "Approved" : "Not yet approved"}`,
    `Approved version: ${payload.approvals.approved_version ?? "Not captured yet"}`,
    `Approved at: ${payload.approvals.approved_at ?? "Not captured yet"}`,
    ...(signoffs.length > 0
      ? signoffs.map(
          (signoff) =>
            `- ${signoff.role ?? "Approval role"}: ${signoff.person ?? "Unknown"} (${signoff.side ?? "side not captured"})`
        )
      : ["- No signoffs are recorded yet."]),
    "",
    "## Notes for the next conversation",
    "- Treat this brief as framing guidance, not as final implementation detail.",
    "- Preserve the value spine links when you refine Epics and Story Ideas further.",
    "- If later steps generate Delivery Stories or extra work items, bring them back as traceable feedback-loop evidence instead of replacing the original Framing brief.",
    ...(payload.baseline.warnings.length > 0 ? payload.baseline.warnings.map((warning) => `- Warning: ${warning}`) : []),
    "",
    "## Export metadata",
    `Exported at: ${exportedAt}`
  ].join("\n");

  return {
    title: `${key} - ${title}`,
    markdown,
    filename
  };
}

function getProfileMetadata(profile: FramingAiHandoffProfile) {
  if (profile === "bmad_prepared") {
    return {
      label: "BMAD Prepared",
      description:
        "Prepared for BMAD-style downstream refinement while keeping Framing as the governed source of truth.",
      intent: "BMAD-prepared governed AI handoff",
      guidance: [
        "Start from Outcome, Epics and Story Ideas before creating or refining Delivery Stories.",
        "Preserve Outcome -> Epic -> Story Idea traceability and extend it forward into Delivery Stories and tests when later steps generate them.",
        "Do not replace the Framing source of truth with generated delivery artifacts. Bring later delivery evidence back through the feedback loop instead.",
        "Keep approval context, AI level, constraints, Journey Context and UX references attached through later BMAD steps."
      ],
      markdownTitle: "# BMAD Prepared AI Handoff",
      markdownIntro:
        "This package is prepared for BMAD-style downstream refinement while keeping the governed Framing package intact as the source of truth.",
      stemSuffix: "bmad-prepared-framing-handoff"
    } as const;
  }

  return {
    label: "Neutral Governed",
    description:
      "General-purpose handoff for AI tools that should inherit the framing structure, governance envelope and traceability rules.",
    intent: "Neutral governed AI handoff",
    guidance: [
      "Treat this Framing package as the source of truth for outcome, scope, constraints, AI level and approval context.",
      "Use Story Ideas as framing-level intent for refinement. Do not force them into Delivery Story shape too early.",
      "If later steps create Delivery Stories or extra work items, keep them traceable to the original Story Ideas or record them as explicit feedback-loop additions.",
      "Carry Journey Context and UX references forward when they clarify user value, but do not overwrite the underlying Framing package."
    ],
    markdownTitle: "# Neutral Governed AI Handoff",
    markdownIntro:
      "This package is a general-purpose governed handoff for downstream AI tools that should preserve Framing structure, approval context and traceability.",
    stemSuffix: "neutral-governed-framing-handoff"
  } as const;
}

export function buildProfiledFramingAiHandoff(input: {
  payload: FramingBriefExportPayload;
  markdown: string;
  profile: FramingAiHandoffProfile;
}): ProfiledFramingAiHandoff {
  const metadata = getProfileMetadata(input.profile);
  const fileBaseName = input.payload.handshake.outcome_key.toLowerCase();
  const markdown = [
    metadata.markdownTitle,
    "",
    metadata.markdownIntro,
    "",
    "## Handling rules",
    ...metadata.guidance.map((line) => `- ${line}`),
    "",
    "## Structured Framing Payload",
    input.markdown
  ].join("\n");

  return {
    profile: input.profile,
    label: metadata.label,
    description: metadata.description,
    payload: input.payload,
    markdown,
    json: {
      profile: input.profile,
      intent: metadata.intent,
      guidance: [...metadata.guidance],
      source_of_truth: input.payload
    },
    markdownFilename: `${fileBaseName}-${metadata.stemSuffix}.md`,
    jsonFilename: `${fileBaseName}-${metadata.stemSuffix}.json`,
    packageFilename: `${fileBaseName}-${metadata.stemSuffix}-package.zip`
  };
}
