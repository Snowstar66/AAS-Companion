import { generateDesignHandover } from "@/lib/framing/designHandoverAgent";
import type { DesignHandoverResult } from "@/lib/framing/agentStructuredOutputs";
import type { FramingAgentSourceOfTruth } from "@/lib/framing/agentTypes";

export function generateBmadExport(source: FramingAgentSourceOfTruth): DesignHandoverResult {
  const handover = generateDesignHandover(source);
  const markdown = [
    "# BMAD Prepared Framing Package",
    "",
    "This profile reformats the current Framing package for BMAD-style downstream usage. It does not change the internal Source of Truth or governance model.",
    "",
    "## BMAD handling rules",
    "- Start from Outcome, Epics and Story Ideas before creating or refining Delivery Stories.",
    "- Preserve Outcome -> Epic -> Story Idea traceability and extend it forward into Delivery Stories and tests when later steps generate them.",
    "- Do not replace the original Framing package with generated delivery artifacts. Bring later delivery evidence back through the feedback loop instead.",
    "- Carry approval context, AI level, Journey Context and UX references through later BMAD steps.",
    "",
    `Outcome: ${source.outcome.key} - ${source.outcome.title}`,
    `Initiative type: ${source.outcome.deliveryType ?? "Not captured yet"}`,
    `AI level: ${source.outcome.aiLevel}`,
    "",
    "## Core Product Brief",
    `Problem: ${source.outcome.problemStatement ?? "Not captured yet"}`,
    `Outcome: ${source.outcome.outcomeStatement ?? "Not captured yet"}`,
    `Baseline: ${source.outcome.baselineDefinition ?? "Not captured yet"}`,
    "",
    "## Design Inheritance",
    `Solution Context: ${source.outcome.solutionContext ?? "Not captured yet"}`,
    `Constraints: ${source.outcome.constraints ?? "Not captured yet"}`,
    `UX Principles: ${source.outcome.structuredConstraints.uxPrinciples || "Not captured yet"}`,
    `NFRs: ${source.outcome.structuredConstraints.nonFunctionalRequirements || "Not captured yet"}`,
    `Additional Requirements: ${source.outcome.structuredConstraints.additionalRequirements || "Not captured yet"}`,
    `Data Sensitivity: ${source.outcome.dataSensitivity ?? "Not captured yet"}`,
    "",
    "## Delivery Spine",
    ...source.epics.flatMap((epic) => [
      `### ${epic.key} - ${epic.title}`,
      ...(source.storyIdeas.filter((storyIdea) => storyIdea.epicId === epic.id).map((storyIdea) => `- ${storyIdea.key} - ${storyIdea.title}`) ||
      [])
    ]),
    "",
    "## Journey Context",
    ...(source.journeyContexts.length > 0
      ? source.journeyContexts.flatMap((context) => [
          `### ${context.title || context.id}`,
          ...context.journeys.map((journey) => `- ${journey.title || journey.id}: ${journey.goal || "Goal not captured yet"}`)
        ])
      : ["No Journey Context present."]),
    "",
    "## BMAD Handover Payload",
    handover.markdown
  ].join("\n");

  return {
    summary: `BMAD-prepared export generated for ${source.outcome.key}.`,
    markdown,
    json: {
      profile: "bmad_prepared",
      guidance: [
        "Start from Outcome, Epics and Story Ideas before creating or refining Delivery Stories.",
        "Preserve Outcome -> Epic -> Story Idea traceability through later BMAD steps.",
        "Treat generated delivery artifacts as feedback-loop evidence, not as replacements for Framing."
      ],
      sourceOfTruth: {
        outcomeKey: source.outcome.key,
        initiativeType: source.outcome.deliveryType,
        aiLevel: source.outcome.aiLevel
      },
      handover: handover.json
    }
  };
}
