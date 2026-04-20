import {
  downstreamPreferenceGroupLabels,
  seededMandatoryControls,
  seededRefinementPreferenceCatalog,
  type CustomInstruction,
  type DownstreamAiInstructions,
  type DownstreamPreferenceGroup,
  type DownstreamPreferenceValue
} from "./downstream-ai-instructions";

export type DownstreamPreferenceDeviation = {
  id: string;
  group: DownstreamPreferenceGroup;
  title: string;
  recommended: DownstreamPreferenceValue;
  selected: DownstreamPreferenceValue;
  rationale: string | null;
};

export type DownstreamValidationResult = {
  hardIssues: string[];
  warnings: string[];
  deviations: DownstreamPreferenceDeviation[];
};

export type DownstreamGeneratedGuidance = {
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

export type DownstreamAiInstructionsAnalysis = DownstreamValidationResult & {
  generatedGuidance: DownstreamGeneratedGuidance;
};

const hardNoNaPreferenceIds = new Set(["S4", "J5", "D4", "D5", "B1", "B2", "B3", "B4", "B9"]);

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function groupPreferenceIds(group: DownstreamPreferenceGroup) {
  return seededRefinementPreferenceCatalog.filter((preference) => preference.group === group).map((preference) => preference.id);
}

function getPreferenceById(instructions: DownstreamAiInstructions, id: string) {
  return instructions.refinementPreferences.find((preference) => preference.id === id) ?? null;
}

function getRecommendedValue(instructions: DownstreamAiInstructions, preferenceId: string) {
  const catalogEntry = seededRefinementPreferenceCatalog.find((preference) => preference.id === preferenceId);
  return catalogEntry ? catalogEntry.defaultByMode[instructions.initiativeType] : null;
}

function formatPreferenceInstruction(
  instructions: DownstreamAiInstructions,
  preferenceId: string
) {
  const preference = getPreferenceById(instructions, preferenceId);
  const catalogEntry = seededRefinementPreferenceCatalog.find((entry) => entry.id === preferenceId);

  if (!preference || !catalogEntry) {
    return null;
  }

  const meaning = catalogEntry.meaning[preference.selectedValue];
  const rationaleSuffix = hasText(preference.rationale) ? ` Rationale: ${preference.rationale?.trim()}` : "";
  return `${catalogEntry.title}: ${meaning}.${rationaleSuffix}`;
}

function formatCustomInstructions(customInstructions: CustomInstruction[]) {
  return [...customInstructions]
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority === "High" ? -1 : 1;
      }

      return left.title.localeCompare(right.title, "en");
    })
    .map((instruction) => ({
      title: instruction.title,
      category: instruction.category,
      priority: instruction.priority,
      body: instruction.body
    }));
}

export function validateDownstreamAiInstructions(input: {
  instructions: DownstreamAiInstructions;
  hasJourneyContext: boolean;
}): DownstreamValidationResult {
  const { instructions } = input;
  const hardIssues: string[] = [];
  const warnings: string[] = [];
  const deviations: DownstreamPreferenceDeviation[] = [];
  const recommendationById = new Map(
    seededRefinementPreferenceCatalog.map((preference) => [preference.id, preference.defaultByMode[instructions.initiativeType]] as const)
  );

  for (const control of instructions.mandatoryControls) {
    if (control.enabled !== true) {
      hardIssues.push(`Always-on control "${control.title}" must remain enabled.`);
    }
  }

  for (const preference of instructions.refinementPreferences) {
    const recommended = recommendationById.get(preference.id);

    if (!recommended) {
      continue;
    }

    if ((!preference.allowNa || hardNoNaPreferenceIds.has(preference.id)) && preference.selectedValue === "N/A") {
      hardIssues.push(`Preference ${preference.id} cannot be set to N/A.`);
    }

    if (preference.selectedValue !== recommended) {
      deviations.push({
        id: preference.id,
        group: preference.group,
        title: preference.title,
        recommended,
        selected: preference.selectedValue,
        rationale: hasText(preference.rationale) ? preference.rationale!.trim() : null
      });
    }
  }

  const naSelections = instructions.refinementPreferences.filter((preference) => preference.selectedValue === "N/A");
  if (naSelections.length >= 8 || naSelections.length > Math.floor(instructions.refinementPreferences.length * 0.25)) {
    warnings.push("Many refinement preferences are set to N/A, so downstream AI may become underconstrained.");
  }

  if (input.hasJourneyContext) {
    const journeyUsageSelections = ["J1", "J2", "J3", "J4"]
      .map((id) => getPreferenceById(instructions, id))
      .filter((preference): preference is NonNullable<typeof preference> => Boolean(preference));
    const disabledJourneySelections = journeyUsageSelections.filter((preference) => preference.selectedValue === "NO").length;

    if (disabledJourneySelections >= 3) {
      warnings.push("Journey Context exists, but journey usage preferences are mostly disabled. Downstream AI may underuse the available flow context.");
    }
  }

  if (instructions.aiLevel >= 2) {
    const weakenedTraceability = ["B1", "B2", "B3", "B4", "B5"].some((id) => {
      const preference = getPreferenceById(instructions, id);
      return preference?.selectedValue === "NO" || preference?.selectedValue === "N/A";
    });

    if (weakenedTraceability) {
      warnings.push("AI level is high while traceability or review controls are weakened. Downstream Build guidance may become too loose for the selected AI level.");
    }
  }

  if (instructions.initiativeType === "AT") {
    const continuitySelections = ["E6", "D8", "D9", "B8"].filter((id) => getPreferenceById(instructions, id)?.selectedValue === "YES");
    if (continuitySelections.length === 0) {
      warnings.push("AT currently has no continuity-oriented preferences enabled. Transition and coexistence risk may be underrepresented.");
    }
  }

  if (instructions.initiativeType === "AM") {
    if (getPreferenceById(instructions, "B7")?.selectedValue !== "YES" || getPreferenceById(instructions, "B8")?.selectedValue !== "YES") {
      warnings.push("AM currently weakens handover or low-blast-radius thinking. Operational readiness may be underconstrained.");
    }
  }

  if (getPreferenceById(instructions, "E5")?.selectedValue === "NO" && getPreferenceById(instructions, "E3")?.selectedValue === "YES") {
    warnings.push("Standardization is rejected while dependency minimization is still desired. Downstream AI may receive conflicting Epic-shaping signals.");
  }

  return {
    hardIssues,
    warnings,
    deviations
  };
}

export function generateDownstreamGuidance(input: {
  instructions: DownstreamAiInstructions;
  hasJourneyContext: boolean;
  validation: DownstreamValidationResult;
}): DownstreamGeneratedGuidance {
  const { instructions, validation } = input;
  const alwaysOnControlSummary = seededMandatoryControls.map((control) => control.title).join("; ");
  const customInstructionAppendix = formatCustomInstructions(instructions.customInstructions);
  const deviationsSummary =
    validation.deviations.length > 0
      ? validation.deviations.map(
          (deviation) =>
            `${downstreamPreferenceGroupLabels[deviation.group]}: ${deviation.title} is set to ${deviation.selected} instead of the recommended ${deviation.recommended}.${deviation.rationale ? ` Rationale: ${deviation.rationale}` : ""}`
        )
      : ["No preferences currently deviate from the recommended defaults."];
  const warningValidationNotes = [...validation.hardIssues, ...validation.warnings];

  return {
    epicRefinementGuide: [
      `Interpret Epic refinement through the ${instructions.initiativeType} delivery posture at AI Level ${instructions.aiLevel}.`,
      "Keep the main delivery structure Outcome -> Epic -> Story -> Test intact.",
      formatPreferenceInstruction(instructions, "E1"),
      formatPreferenceInstruction(instructions, "E2"),
      formatPreferenceInstruction(instructions, "E3"),
      formatPreferenceInstruction(instructions, "E4"),
      formatPreferenceInstruction(instructions, "E5"),
      formatPreferenceInstruction(instructions, "E6"),
      formatPreferenceInstruction(instructions, "E7"),
      `Always-on controls remain active: ${alwaysOnControlSummary}.`
    ].filter((value): value is string => Boolean(value)),
    storyIdeaRefinementGuide: [
      "Refine Story Ideas so they remain mappable to later implementation and test intent.",
      formatPreferenceInstruction(instructions, "S1"),
      formatPreferenceInstruction(instructions, "S2"),
      formatPreferenceInstruction(instructions, "S3"),
      formatPreferenceInstruction(instructions, "S4"),
      formatPreferenceInstruction(instructions, "S5"),
      formatPreferenceInstruction(instructions, "S6"),
      formatPreferenceInstruction(instructions, "S7"),
      formatPreferenceInstruction(instructions, "S8"),
      "Do not let downstream AI remove testability, traceability, or human review expectations."
    ].filter((value): value is string => Boolean(value)),
    journeyUsageGuide: [
      input.hasJourneyContext
        ? "Journey Context exists and should be considered when refining Epics, Story Ideas, Design guidance, and Build guidance."
        : "No Journey Context is present. Downstream AI should still proceed using Outcome, Epics, Story Ideas, constraints, and other Framing inputs.",
      formatPreferenceInstruction(instructions, "J1"),
      formatPreferenceInstruction(instructions, "J2"),
      formatPreferenceInstruction(instructions, "J3"),
      formatPreferenceInstruction(instructions, "J4"),
      formatPreferenceInstruction(instructions, "J5"),
      "If Journey Context is absent, do not block Story Idea refinement solely because journey data is missing."
    ].filter((value): value is string => Boolean(value)),
    designAiGuidance: [
      "In Design, inherit the Source of Truth from Outcome, Problem, Baseline, Solution Context, Constraints, UX Principles, Non-functional Requirements, Additional Requirements, Data Sensitivity, Journey Context when present, Epics, Story Ideas, and optional references.",
      formatPreferenceInstruction(instructions, "D1"),
      formatPreferenceInstruction(instructions, "D2"),
      formatPreferenceInstruction(instructions, "D3"),
      formatPreferenceInstruction(instructions, "D4"),
      formatPreferenceInstruction(instructions, "D5"),
      formatPreferenceInstruction(instructions, "D6"),
      formatPreferenceInstruction(instructions, "D7"),
      formatPreferenceInstruction(instructions, "D8"),
      formatPreferenceInstruction(instructions, "D9"),
      "Security, privacy, compliance, and data classification constraints must stay active in every design proposal."
    ].filter((value): value is string => Boolean(value)),
    buildAiGuidance: [
      "In Build, preserve Story and Epic lineage, review discipline, test expectations, release evidence, and rollout control.",
      formatPreferenceInstruction(instructions, "B1"),
      formatPreferenceInstruction(instructions, "B2"),
      formatPreferenceInstruction(instructions, "B3"),
      formatPreferenceInstruction(instructions, "B4"),
      formatPreferenceInstruction(instructions, "B5"),
      formatPreferenceInstruction(instructions, "B6"),
      formatPreferenceInstruction(instructions, "B7"),
      formatPreferenceInstruction(instructions, "B8"),
      formatPreferenceInstruction(instructions, "B9"),
      `Review strictness and reproducibility must remain aligned with AI Level ${instructions.aiLevel}.`
    ].filter((value): value is string => Boolean(value)),
    customInstructionAppendix,
    deviationsSummary,
    warningValidationNotes:
      warningValidationNotes.length > 0
        ? warningValidationNotes
        : ["No hard validation issues or warnings are currently active."]
  };
}

export function analyzeDownstreamAiInstructions(input: {
  instructions: DownstreamAiInstructions;
  hasJourneyContext: boolean;
}): DownstreamAiInstructionsAnalysis {
  const validation = validateDownstreamAiInstructions(input);

  return {
    ...validation,
    generatedGuidance: generateDownstreamGuidance({
      instructions: input.instructions,
      hasJourneyContext: input.hasJourneyContext,
      validation
    })
  };
}

export function getRefinementPreferencesByGroup(
  instructions: DownstreamAiInstructions,
  group: DownstreamPreferenceGroup
) {
  const ids = new Set(groupPreferenceIds(group));
  return instructions.refinementPreferences.filter((preference) => ids.has(preference.id));
}
