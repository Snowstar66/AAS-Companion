import { z } from "zod";
import { journeyInitiativeTypeSchema } from "./journey-context";

export const downstreamAiLevelSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
export const downstreamPreferenceValueSchema = z.enum(["YES", "NO", "N/A"]);
export const downstreamPreferenceGroupSchema = z.enum(["epic", "story", "journey", "design", "build"]);
export const customInstructionCategorySchema = z.enum(["General", "Epic", "Story", "Journey", "Design", "Build"]);
export const customInstructionPrioritySchema = z.enum(["Normal", "High"]);

export const mandatoryControlSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  enabled: z.literal(true)
});

export const refinementPreferenceSelectionSchema = z.object({
  id: z.string(),
  group: downstreamPreferenceGroupSchema,
  title: z.string(),
  description: z.string().optional(),
  defaultByMode: z.object({
    AD: downstreamPreferenceValueSchema,
    AT: downstreamPreferenceValueSchema,
    AM: downstreamPreferenceValueSchema
  }),
  allowNa: z.boolean(),
  selectedValue: downstreamPreferenceValueSchema,
  rationale: z.string().optional()
});

export const customInstructionSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  category: customInstructionCategorySchema,
  priority: customInstructionPrioritySchema
});

export const downstreamAiInstructionsSchema = z.object({
  initiativeType: journeyInitiativeTypeSchema,
  aiLevel: downstreamAiLevelSchema,
  mandatoryControls: z.array(mandatoryControlSchema),
  refinementPreferences: z.array(refinementPreferenceSelectionSchema),
  customInstructions: z.array(customInstructionSchema)
});

export type DownstreamAiLevel = z.infer<typeof downstreamAiLevelSchema>;
export type DownstreamPreferenceValue = z.infer<typeof downstreamPreferenceValueSchema>;
export type DownstreamPreferenceGroup = z.infer<typeof downstreamPreferenceGroupSchema>;
export type CustomInstructionCategory = z.infer<typeof customInstructionCategorySchema>;
export type CustomInstructionPriority = z.infer<typeof customInstructionPrioritySchema>;
export type MandatoryControl = z.infer<typeof mandatoryControlSchema>;
export type RefinementPreferenceSelection = z.infer<typeof refinementPreferenceSelectionSchema>;
export type CustomInstruction = z.infer<typeof customInstructionSchema>;
export type DownstreamAiInstructions = z.infer<typeof downstreamAiInstructionsSchema>;

export type RefinementPreferenceCatalogEntry = {
  id: string;
  group: DownstreamPreferenceGroup;
  title: string;
  description: string;
  defaultByMode: {
    AD: DownstreamPreferenceValue;
    AT: DownstreamPreferenceValue;
    AM: DownstreamPreferenceValue;
  };
  allowNa: boolean;
  meaning: {
    YES: string;
    NO: string;
    "N/A": string;
  };
};

export const downstreamPreferenceGroupLabels: Record<DownstreamPreferenceGroup, string> = {
  epic: "Epic Refinement",
  story: "Story Idea Refinement",
  journey: "Journey Usage",
  design: "Design Guidance",
  build: "Build Guidance"
};

export const seededMandatoryControls: MandatoryControl[] = [
  {
    id: "MC-1",
    title: "Preserve Epic -> Story -> Test traceability",
    description: "Keep downstream AI outputs linked from Epic through Story to later test intent.",
    enabled: true
  },
  {
    id: "MC-2",
    title: "Preserve AI-level-specific review expectations",
    description: "Keep review strictness aligned with the current AI level.",
    enabled: true
  },
  {
    id: "MC-3",
    title: "Preserve human approval on critical decisions",
    description: "Do not let downstream AI remove human approval where decision impact or governance requires it.",
    enabled: true
  },
  {
    id: "MC-4",
    title: "Preserve security/privacy/compliance constraints",
    description: "Carry security, privacy, compliance, and data sensitivity constraints forward into downstream AI behavior.",
    enabled: true
  },
  {
    id: "MC-5",
    title: "Preserve testability and binary acceptance intent",
    description: "Keep downstream refinement tied to later testability and acceptance clarity.",
    enabled: true
  },
  {
    id: "MC-6",
    title: "Preserve reproducibility expectations at higher AI levels",
    description: "At higher AI levels, keep logs, reproducibility, and reviewability expectations visible in downstream work.",
    enabled: true
  }
];

export const seededRefinementPreferenceCatalog: RefinementPreferenceCatalogEntry[] = [
  {
    id: "E1",
    group: "epic",
    title: "Keep each Epic centered on one coherent capability/value area",
    description: "Prefer clear scope and one main value center per Epic",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should refine Epics into coherent value/capability containers",
      NO: "AI may keep broader or mixed-scope Epics",
      "N/A": "AI may choose Epic breadth contextually"
    }
  },
  {
    id: "E2",
    group: "epic",
    title: "Separate user-facing Epics from enabling/platform/compliance Epics",
    description: "Avoid mixing visible user change with enabling work unless needed",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should split enabling work into distinct Epics",
      NO: "AI may blend enabling work into user-facing Epics",
      "N/A": "AI may decide case by case"
    }
  },
  {
    id: "E3",
    group: "epic",
    title: "Minimize cross-Epic dependencies",
    description: "Prefer decomposition that reduces orchestration overhead",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should reduce coupling between Epics",
      NO: "AI may accept more dependency-heavy Epic structures",
      "N/A": "AI may balance dependency vs. cohesion contextually"
    }
  },
  {
    id: "E4",
    group: "epic",
    title: "Preserve Journey Context during Epic refinement",
    description: "Keep flow context visible when Journey Context exists",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should preserve journey influence in Epic refinement",
      NO: "AI may refine Epics more abstractly",
      "N/A": "AI may use Journey Context only when helpful"
    }
  },
  {
    id: "E5",
    group: "epic",
    title: "Prefer standard patterns before variants",
    description: "Reuse common refinement patterns before special cases",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should challenge local variants and seek reusable Epic patterns",
      NO: "AI may accept more specialized Epic variants",
      "N/A": "AI may choose based on domain complexity"
    }
  },
  {
    id: "E6",
    group: "epic",
    title: "Model transition/coexistence work as explicit Epics",
    description: "Separate migration/coexistence concerns when needed",
    defaultByMode: { AD: "NO", AT: "YES", AM: "NO" },
    allowNa: true,
    meaning: {
      YES: "AI should isolate transition/coexistence work into explicit Epics",
      NO: "AI may mix transition work into target-state Epics",
      "N/A": "AI may decide whether explicit transition Epics are needed"
    }
  },
  {
    id: "E7",
    group: "epic",
    title: "Model operability/stability work as explicit Epics",
    description: "Make runability/stability visible as delivery structure when useful",
    defaultByMode: { AD: "NO", AT: "NO", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should create explicit stability/operability Epics where relevant",
      NO: "AI may keep focus on visible change only",
      "N/A": "AI may decide whether operability should be explicit"
    }
  },
  {
    id: "S1",
    group: "story",
    title: "Keep each Story Idea centered on one primary intent",
    description: "Prefer one main intent per Story Idea",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should split oversized Story Ideas into focused candidates",
      NO: "AI may keep broader multi-intent Story Ideas",
      "N/A": "AI may decide based on flow cohesion"
    }
  },
  {
    id: "S2",
    group: "story",
    title: "Tie each Story Idea to an actor, journey step, or trigger",
    description: "Preserve context when refining Story Ideas",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should preserve role/flow/trigger context",
      NO: "AI may allow more abstract Story Ideas",
      "N/A": "AI may decide whether explicit contextual anchoring is needed"
    }
  },
  {
    id: "S3",
    group: "story",
    title: "Split large Story Ideas before Design if verification would be hard",
    description: "Prefer refinement into verifiable units",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should split Story Ideas that would be hard to verify",
      NO: "AI may keep broader Story Ideas longer",
      "N/A": "AI may decide how early splitting should happen"
    }
  },
  {
    id: "S4",
    group: "story",
    title: "Require future testability when refining Story Ideas",
    description: "Keep refined Story Ideas mappable to later testable delivery",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI must reformulate Story Ideas so they can become testable later",
      NO: "AI may weaken downstream Story quality",
      "N/A": "Not allowed"
    }
  },
  {
    id: "S5",
    group: "story",
    title: "Keep architecture direction lightweight at Story Idea level",
    description: "Avoid locking technical design too early",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should avoid premature architecture lock-in",
      NO: "AI may produce more prescriptive Story wording",
      "N/A": "AI may decide case by case"
    }
  },
  {
    id: "S6",
    group: "story",
    title: "Force Story Type classification during refinement",
    description: "Preserve explicit Story category such as Feature, Refactor, Bugfix, Exploration",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should classify Story Ideas explicitly",
      NO: "AI may leave Story type implicit",
      "N/A": "AI may classify only when useful"
    }
  },
  {
    id: "S7",
    group: "story",
    title: "Force AI Usage Scope visibility when downstream AI is expected",
    description: "Preserve visibility of intended AI usage",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should mark expected AI usage scope explicitly",
      NO: "AI may leave AI usage implicit",
      "N/A": "AI may surface usage only when valuable"
    }
  },
  {
    id: "S8",
    group: "story",
    title: "Require rollback/fallback thinking for risky Story Ideas",
    description: "Preserve reversibility thinking for risky work",
    defaultByMode: { AD: "NO", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should surface rollback/fallback expectations",
      NO: "AI may postpone rollback/fallback thinking",
      "N/A": "AI may decide based on perceived risk"
    }
  },
  {
    id: "J1",
    group: "journey",
    title: "Use Journey Context as a primary refinement source when present",
    description: "Let Journey Context actively influence refinement",
    defaultByMode: { AD: "YES", AT: "YES", AM: "NO" },
    allowNa: true,
    meaning: {
      YES: "AI should actively use Journey Context to refine Epics and Story Ideas",
      NO: "AI may treat Journey Context as secondary reference only",
      "N/A": "AI may decide when Journey Context is useful"
    }
  },
  {
    id: "J2",
    group: "journey",
    title: "Preserve journey-to-story traceability when Journey Context exists",
    description: "Preserve explainability between Journeys and Story Ideas",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should preserve visible traceability between Journey elements and Story Ideas",
      NO: "AI may avoid maintaining explicit traceability",
      "N/A": "AI may decide whether traceability needs to be explicit"
    }
  },
  {
    id: "J3",
    group: "journey",
    title: "Allow AI to suggest missing journey/story mappings",
    description: "Enable AI-assisted mapping support",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should propose likely Story/Epic mappings where missing",
      NO: "AI should avoid mapping suggestions unless user adds links manually",
      "N/A": "AI may suggest mappings only in uncertain cases"
    }
  },
  {
    id: "J4",
    group: "journey",
    title: "Prefer actor and flow continuity when Journey Context exists",
    description: "Preserve flow continuity in refinement",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should favor actor/flow continuity when refining",
      NO: "AI may prioritize structural grouping over flow continuity",
      "N/A": "AI may decide balance by context"
    }
  },
  {
    id: "J5",
    group: "journey",
    title: "Allow Story Ideas to stand without Journey Context when Journey Context is absent",
    description: "Keep tool useful without Journey Context",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI should proceed normally even if no Journey Context exists",
      NO: "AI may over-assume Journey Context is required",
      "N/A": "Not allowed"
    }
  },
  {
    id: "D1",
    group: "design",
    title: "Optimize for modularity and future changeability",
    description: "Favor low coupling and evolvable structure",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should prefer changeable modular structures",
      NO: "AI may optimize for short-term convenience",
      "N/A": "AI may choose a balance contextually"
    }
  },
  {
    id: "D2",
    group: "design",
    title: "Prefer reuse when fit-for-purpose",
    description: "Evaluate existing assets before new build-out",
    defaultByMode: { AD: "NO", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should evaluate reuse first",
      NO: "AI may propose more net-new implementation",
      "N/A": "AI may decide reuse vs. new build case by case"
    }
  },
  {
    id: "D3",
    group: "design",
    title: "Prefer integration discipline over shortcuts",
    description: "Avoid tactical and opaque integration design",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should avoid tactical shortcuts in integration design",
      NO: "AI may allow expedient integration choices",
      "N/A": "AI may choose based on speed/risk context"
    }
  },
  {
    id: "D4",
    group: "design",
    title: "Make data ownership and classification explicit",
    description: "Preserve data boundaries and source-of-truth clarity",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI must keep data ownership/classification explicit",
      NO: "AI may under-specify data boundaries",
      "N/A": "Not allowed"
    }
  },
  {
    id: "D5",
    group: "design",
    title: "Preserve security/privacy/compliance in design proposals",
    description: "Keep compliance and sensitive-data rules active in Design",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI must embed security/privacy/compliance constraints in design proposals",
      NO: "AI may defer them too late",
      "N/A": "Not allowed"
    }
  },
  {
    id: "D6",
    group: "design",
    title: "Make observability and operability part of Design",
    description: "Keep runability and diagnostics as design concerns",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should include observability/operability in design thinking",
      NO: "AI may focus mainly on functionality",
      "N/A": "AI may decide level of explicitness"
    }
  },
  {
    id: "D7",
    group: "design",
    title: "Separate experimentation zones from stable zones",
    description: "Preserve experimentation boundary where relevant",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should preserve exploration vs. stable separation",
      NO: "AI may blur those zones",
      "N/A": "AI may decide whether explicit boundary is needed"
    }
  },
  {
    id: "D8",
    group: "design",
    title: "Prefer continuity over architectural purity when needed",
    description: "Favor safer transition when context requires it",
    defaultByMode: { AD: "NO", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should choose lower-risk continuity-friendly design paths where needed",
      NO: "AI may favor cleaner target architecture over safer transition",
      "N/A": "AI may decide case by case"
    }
  },
  {
    id: "D9",
    group: "design",
    title: "Prefer phased rollout over big bang",
    description: "Preserve controlled rollout thinking",
    defaultByMode: { AD: "NO", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should propose phased rollout/controlled activation",
      NO: "AI may allow larger cutover plans",
      "N/A": "AI may decide rollout style by context"
    }
  },
  {
    id: "B1",
    group: "build",
    title: "Require Story and Epic traceability for all implementation work",
    description: "Preserve implementation lineage",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI must preserve explicit Story/Epic traceability",
      NO: "AI may weaken traceability",
      "N/A": "Not allowed"
    }
  },
  {
    id: "B2",
    group: "build",
    title: "Require traceability for AI-generated implementation artifacts",
    description: "Keep AI-generated artifacts linked to Story/Test context",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI output must remain traceable",
      NO: "AI may treat AI output more informally",
      "N/A": "Not allowed"
    }
  },
  {
    id: "B3",
    group: "build",
    title: "Enforce AI-level-specific review and reproducibility rules",
    description: "Keep review/reproducibility aligned with AI level",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI must tailor Build guidance to AI level",
      NO: "AI may under-specify governance",
      "N/A": "Not allowed"
    }
  },
  {
    id: "B4",
    group: "build",
    title: "Require test strategy proportional to Story risk/type",
    description: "Preserve verification expectations",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI must require verification proportional to risk and type",
      NO: "AI may allow weaker verification",
      "N/A": "Not allowed"
    }
  },
  {
    id: "B5",
    group: "build",
    title: "Require architecture/security checks in review or CI/CD",
    description: "Keep structural and security controls active in Build",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should include structural/security checks in Build guidance",
      NO: "AI may leave more control to later manual review",
      "N/A": "AI may choose the degree of explicitness"
    }
  },
  {
    id: "B6",
    group: "build",
    title: "Prefer automatically generated release evidence",
    description: "Favor generated evidence/logging where feasible",
    defaultByMode: { AD: "YES", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should assume evidence generation where practical",
      NO: "AI may rely more on manual reporting",
      "N/A": "AI may decide based on delivery context"
    }
  },
  {
    id: "B7",
    group: "build",
    title: "Treat support/runbook/handover updates as part of done",
    description: "Preserve operational readiness in completion rules",
    defaultByMode: { AD: "NO", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should include support/handover updates in completion thinking",
      NO: "AI may focus mainly on code/test",
      "N/A": "AI may decide based on initiative type"
    }
  },
  {
    id: "B8",
    group: "build",
    title: "Prefer low blast radius and reversibility in rollout",
    description: "Favor smaller and safer release mechanics",
    defaultByMode: { AD: "NO", AT: "YES", AM: "YES" },
    allowNa: true,
    meaning: {
      YES: "AI should favor low-blast-radius reversible rollout",
      NO: "AI may allow broader-impact changes",
      "N/A": "AI may decide based on change risk"
    }
  },
  {
    id: "B9",
    group: "build",
    title: "Allow emergency handling only with retroactive traceability",
    description: "Preserve control in urgent cases",
    defaultByMode: { AD: "NO", AT: "NO", AM: "YES" },
    allowNa: false,
    meaning: {
      YES: "AI may support emergency action only if retrospective traceability/review is preserved",
      NO: "AI may normalize emergency shortcuts",
      "N/A": "Not allowed"
    }
  }
];

function normalizeInitiativeType(value: unknown) {
  return value === "AD" || value === "AT" || value === "AM" ? value : null;
}

export function mapAiAccelerationLevelToDownstreamAiLevel(value: unknown): DownstreamAiLevel {
  if (value === "level_1") {
    return 1;
  }

  if (value === "level_2") {
    return 2;
  }

  if (value === "level_3") {
    return 3;
  }

  return 0;
}

function normalizeDownstreamAiLevel(value: unknown) {
  return value === 0 || value === 1 || value === 2 || value === 3 ? value : null;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function createDefaultDownstreamAiInstructions(input: {
  initiativeType: "AD" | "AT" | "AM";
  aiLevel: DownstreamAiLevel;
}): DownstreamAiInstructions {
  return {
    initiativeType: input.initiativeType,
    aiLevel: input.aiLevel,
    mandatoryControls: seededMandatoryControls.map((control) => control),
    refinementPreferences: seededRefinementPreferenceCatalog.map((preference) => ({
      id: preference.id,
      group: preference.group,
      title: preference.title,
      description: preference.description,
      defaultByMode: preference.defaultByMode,
      allowNa: preference.allowNa,
      selectedValue: preference.defaultByMode[input.initiativeType],
      rationale: ""
    })),
    customInstructions: []
  };
}

export function parseDownstreamAiInstructions(
  value: unknown,
  context?: {
    initiativeType?: unknown;
    aiLevel?: unknown;
  }
): DownstreamAiInstructions | null {
  const parsed = downstreamAiInstructionsSchema.safeParse(value);
  const parsedInitiativeType = normalizeInitiativeType(parsed.success ? parsed.data.initiativeType : undefined);
  const parsedAiLevel = normalizeDownstreamAiLevel(parsed.success ? parsed.data.aiLevel : undefined);
  const contextInitiativeType = normalizeInitiativeType(context?.initiativeType);
  const contextAiLevel = normalizeDownstreamAiLevel(context?.aiLevel);
  const initiativeType = contextInitiativeType ?? parsedInitiativeType ?? "AD";
  const aiLevel = contextAiLevel ?? parsedAiLevel ?? 0;
  const defaults = createDefaultDownstreamAiInstructions({
    initiativeType,
    aiLevel
  });

  if (!parsed.success) {
    return value === null || value === undefined ? null : defaults;
  }

  const storedControls = new Map(parsed.data.mandatoryControls.map((control) => [control.id, control] as const));
  const storedPreferences = new Map(parsed.data.refinementPreferences.map((preference) => [preference.id, preference] as const));

  return {
    initiativeType,
    aiLevel,
    mandatoryControls: seededMandatoryControls.map((control) => ({
      ...control,
      enabled: true
    })),
    refinementPreferences: seededRefinementPreferenceCatalog.map((preference) => {
      const stored = storedPreferences.get(preference.id);

      return {
        id: preference.id,
        group: preference.group,
        title: preference.title,
        description: preference.description,
        defaultByMode: preference.defaultByMode,
        allowNa: preference.allowNa,
        selectedValue: stored?.selectedValue ?? preference.defaultByMode[initiativeType],
        rationale: normalizeString(stored?.rationale).trim()
      };
    }),
    customInstructions: parsed.data.customInstructions.map((instruction) => ({
      ...instruction,
      title: normalizeString(instruction.title),
      body: normalizeString(instruction.body)
    }))
  };
}
