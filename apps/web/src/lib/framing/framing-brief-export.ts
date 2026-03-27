type FramingBriefOutcome = {
  id: string;
  key: string;
  title: string;
  problemStatement: string | null;
  outcomeStatement: string | null;
  baselineDefinition: string | null;
  baselineSource: string | null;
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
  stories: Array<{
    id: string;
    key: string;
    title: string;
    epicId?: string | null;
    acceptanceCriteria: string[];
    testDefinition?: string | null;
    definitionOfDone: string[];
    status: string;
    tollgateStatus?: string | null;
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
  };
  baseline: {
    definition: string | null;
    source: string | null;
    blockers: string[];
    readiness: "ready" | "blocked";
  };
  direction_seeds: {
    epic_count: number;
    story_count: number;
    epics: Array<{
      key: string;
      title: string;
      scope_boundary: string | null;
      story_count: number;
    }>;
    stories: Array<{
      key: string;
      title: string;
      epic_key: string | null;
      status: string;
      tollgate_status: string | null;
      acceptance_criteria: string[];
      test_definition: string | null;
      definition_of_done: string[];
    }>;
  };
  guidance_for_next_tool: {
    intended_use: string;
    notes: string[];
  };
  metadata: {
    outcome_id: string;
    value_owner_id: string | null;
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
      risk_profile: input.outcome.riskProfile
    },
    baseline: {
      definition: input.outcome.baselineDefinition,
      source: input.outcome.baselineSource,
      blockers: input.blockers,
      readiness: input.blockers.length === 0 ? "ready" : "blocked"
    },
    direction_seeds: {
      epic_count: input.outcome.epics.length,
      story_count: input.outcome.stories.length,
      epics: input.outcome.epics.map((epic) => ({
        key: epic.key,
        title: epic.title,
        scope_boundary: epic.scopeBoundary ?? null,
        story_count: input.outcome.stories.filter((story) => story.epicId === epic.id).length
      })),
      stories: input.outcome.stories.map((story) => ({
        key: story.key,
        title: story.title,
        epic_key: story.epicId ? epicKeyById.get(story.epicId) ?? null : null,
        status: story.status,
        tollgate_status: story.tollgateStatus ?? null,
        acceptance_criteria: story.acceptanceCriteria,
        test_definition: story.testDefinition ?? null,
        definition_of_done: story.definitionOfDone
      }))
    },
    guidance_for_next_tool: {
      intended_use:
        "Use this package to refine the customer handshake into a stronger outcome brief, better design direction, or a richer epic/story breakdown in external AI tooling such as BMAD.",
      notes: [
        "Treat the handshake and baseline as source truth unless you explicitly decide to rewrite them.",
        "Use the epic and story seeds as direction, not as mandatory final structure.",
        "Internal IDs are metadata only. Prefer the business keys and titles when reasoning in external tools."
      ]
    },
    metadata: {
      outcome_id: input.outcome.id,
      value_owner_id: input.outcome.valueOwnerId,
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
    "## Baseline",
    `- Readiness: ${payload.baseline.readiness === "ready" ? "Baseline ready" : "Baseline still blocked"}`,
    `- Definition: ${payload.baseline.definition ?? "Not captured yet"}`,
    `- Source: ${payload.baseline.source ?? "Not captured yet"}`,
    "",
    "## Visible Blockers",
    ...(payload.baseline.blockers.length > 0
      ? payload.baseline.blockers.map((blocker) => `- ${blocker}`)
      : ["- No visible baseline blockers at export time."]),
    "",
    "## Direction Seeds",
    `- Epics: ${payload.direction_seeds.epic_count}`,
    `- Stories: ${payload.direction_seeds.story_count}`,
    "",
    "### Epics",
    ...(payload.direction_seeds.epics.length > 0
      ? payload.direction_seeds.epics.flatMap((epic) => [
          `- ${epic.key}: ${epic.title}`,
          `  Scope boundary: ${epic.scope_boundary ?? "Not captured yet"}`,
          `  Story count: ${epic.story_count}`
        ])
      : ["- No epic seeds captured yet."]),
    "",
    "### Stories",
    ...(payload.direction_seeds.stories.length > 0
      ? payload.direction_seeds.stories.flatMap((story) => [
          `- ${story.key}: ${story.title}`,
          `  Epic: ${story.epic_key ?? "Unassigned"}`,
          `  Status: ${formatSentence(story.status)}`,
          `  Tollgate: ${story.tollgate_status ? formatSentence(story.tollgate_status) : "Not started"}`,
          `  Acceptance criteria: ${story.acceptance_criteria.length > 0 ? story.acceptance_criteria.join(" | ") : "Not captured yet"}`,
          `  Test definition: ${story.test_definition ?? "Not captured yet"}`,
          `  Definition of done: ${story.definition_of_done.length > 0 ? story.definition_of_done.join(" | ") : "Not captured yet"}`
        ])
      : ["- No story seeds captured yet."]),
    "",
    "## Suggested Use In The Next Tool",
    payload.guidance_for_next_tool.intended_use,
    "",
    ...(payload.guidance_for_next_tool.notes.map((note) => `- ${note}`)),
    "",
    "## Metadata",
    `- Outcome ID: ${payload.metadata.outcome_id}`,
    `- Value Owner ID: ${payload.metadata.value_owner_id ?? "None"}`,
    `- Lifecycle state: ${formatSentence(payload.metadata.lifecycle_state)}`,
    `- Origin type: ${formatSentence(payload.metadata.origin_type)}`,
    `- Exported at: ${payload.metadata.exported_at}`
  ].join("\n");

  return { payload, markdown };
}
