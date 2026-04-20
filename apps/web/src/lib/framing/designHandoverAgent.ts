import { analyzeDownstreamAiInstructions, mapAiAccelerationLevelToDownstreamAiLevel, parseDownstreamAiInstructions } from "@aas-companion/domain";
import type { DesignHandoverResult } from "@/lib/framing/agentStructuredOutputs";
import type { FramingAgentSourceOfTruth } from "@/lib/framing/agentTypes";
import { buildFramingBriefExport, buildHumanFramingBriefExport } from "@/lib/framing/framing-brief-export";

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

export function collectFramingAgentWarnings(source: FramingAgentSourceOfTruth) {
  const warnings: string[] = [];

  if (source.journeyContexts.length > 0) {
    const allJourneys = source.journeyContexts.flatMap((context) => context.journeys);
    const hasCoverage = allJourneys.some((journey) => journey.coverage && journey.coverage.status !== "unanalysed");

    if (!hasCoverage) {
      warnings.push("Journey Context exists but no coverage analysis has been run yet.");
    }
  }

  if (source.downstreamAiInstructions) {
    const naCount = source.downstreamAiInstructions.refinementPreferences.filter(
      (preference) => preference.selectedValue === "N/A"
    ).length;

    if (naCount >= 8) {
      warnings.push("Downstream AI Instructions contain many N/A selections, so downstream AI may be underconstrained.");
    }
  }

  if (!hasText(source.outcome.solutionContext)) {
    warnings.push("Solution Context is still empty.");
  }

  if (!hasText(source.outcome.structuredConstraints.uxPrinciples)) {
    warnings.push("UX Principles are still empty.");
  }

  if (!hasText(source.outcome.structuredConstraints.nonFunctionalRequirements)) {
    warnings.push("Non-functional Requirements are still empty.");
  }

  if (source.epics.length === 0) {
    warnings.push("No Epics are captured yet.");
  }

  if (source.storyIdeas.length === 0) {
    warnings.push("No Story Ideas are captured yet.");
  }

  return warnings;
}

function buildOutcomeExportShape(source: FramingAgentSourceOfTruth) {
  return {
    id: source.outcome.id,
    key: source.outcome.key,
    title: source.outcome.title,
    problemStatement: source.outcome.problemStatement,
    outcomeStatement: source.outcome.outcomeStatement,
    baselineDefinition: source.outcome.baselineDefinition,
    baselineSource: source.outcome.baselineSource,
    solutionContext: source.outcome.solutionContext,
    solutionConstraints: source.outcome.constraints,
    dataSensitivity: source.outcome.dataSensitivity,
    journeyContexts: source.journeyContexts,
    downstreamAiInstructions: source.downstreamAiInstructions,
    deliveryType: source.outcome.deliveryType,
    aiExecutionPattern: null,
    aiUsageIntent: null,
    businessImpactLevel: null,
    businessImpactRationale: null,
    dataSensitivityLevel: source.outcome.dataSensitivityLevel,
    dataSensitivityRationale: source.outcome.dataSensitivityRationale,
    blastRadiusLevel: null,
    blastRadiusRationale: null,
    decisionImpactLevel: null,
    decisionImpactRationale: null,
    aiLevelJustification: null,
    timeframe: source.outcome.timeframe,
    aiAccelerationLevel: source.outcome.aiAccelerationLevel,
    riskProfile: source.outcome.riskProfile,
    lifecycleState: "active",
    originType: "native",
    valueOwnerId: null,
    valueOwner: null,
    epics: source.epics.map((epic) => ({
      id: epic.id,
      key: epic.key,
      title: epic.title,
      scopeBoundary: epic.scopeBoundary
    })),
    directionSeeds: source.storyIdeas.map((storyIdea) => ({
      id: storyIdea.id,
      key: storyIdea.key,
      title: storyIdea.title,
      epicId: storyIdea.epicId,
      shortDescription: storyIdea.shortDescription,
      expectedBehavior: storyIdea.expectedBehavior,
      sourceStoryId: null,
      uxSketchName: storyIdea.uxSketchName,
      uxSketchContentType: null,
      uxSketchDataUrl: storyIdea.uxSketchDataUrl,
      uxSketches: null
    }))
  };
}

export function generateDesignHandover(source: FramingAgentSourceOfTruth): DesignHandoverResult {
  const warnings = collectFramingAgentWarnings(source);
  const exportInput = {
    outcome: buildOutcomeExportShape(source),
    blockers: warnings,
    tollgate: null,
    exportedAt: new Date()
  };
  const aiBrief = buildFramingBriefExport(exportInput);
  const humanBrief = buildHumanFramingBriefExport(exportInput);
  const instructions =
    parseDownstreamAiInstructions(source.downstreamAiInstructions, {
      initiativeType: source.outcome.deliveryType ?? "AD",
      aiLevel: mapAiAccelerationLevelToDownstreamAiLevel(source.outcome.aiAccelerationLevel)
    }) ?? null;
  const downstreamAnalysis = instructions
    ? analyzeDownstreamAiInstructions({
        instructions,
        hasJourneyContext: source.journeyContexts.length > 0
      })
    : null;
  const summary = `${source.outcome.key} includes ${source.epics.length} Epics, ${source.storyIdeas.length} Story Ideas, ${source.journeyContexts.length} Journey Context item(s), and ${warnings.length} current handover warning(s).`;

  const markdown = [
    "# Design / Build Handover",
    "",
    `Outcome: ${source.outcome.key} - ${source.outcome.title}`,
    `Initiative type: ${source.outcome.deliveryType ?? "Not captured yet"}`,
    `AI level: ${source.outcome.aiLevel}`,
    "",
    "## Inheritance Summary",
    `Problem: ${source.outcome.problemStatement ?? "Not captured yet"}`,
    `Outcome: ${source.outcome.outcomeStatement ?? "Not captured yet"}`,
    `Solution Context: ${source.outcome.solutionContext ?? "Not captured yet"}`,
    `Constraints: ${source.outcome.constraints ?? "Not captured yet"}`,
    `UX Principles: ${source.outcome.structuredConstraints.uxPrinciples || "Not captured yet"}`,
    `Non-functional Requirements: ${source.outcome.structuredConstraints.nonFunctionalRequirements || "Not captured yet"}`,
    `Additional Requirements: ${source.outcome.structuredConstraints.additionalRequirements || "Not captured yet"}`,
    `Data Sensitivity: ${source.outcome.dataSensitivity ?? "Not captured yet"}`,
    "",
    "## Journey Context and Coverage",
    ...(source.journeyContexts.length > 0
      ? source.journeyContexts.flatMap((context) => [
          `### ${context.title || context.id}`,
          ...(context.journeys.length > 0
            ? context.journeys.map(
                (journey) =>
                  `- ${journey.title || journey.id}: coverage ${journey.coverage?.status ?? "unanalysed"}`
              )
            : ["- No Journeys captured yet."])
        ])
      : ["No Journey Context present."]),
    "",
    "## Downstream AI Instructions",
    ...(downstreamAnalysis
      ? [
          ...downstreamAnalysis.generatedGuidance.epicRefinementGuide.map((line) => `- ${line}`),
          ...downstreamAnalysis.generatedGuidance.storyIdeaRefinementGuide.map((line) => `- ${line}`),
          ...downstreamAnalysis.generatedGuidance.designAiGuidance.map((line) => `- ${line}`),
          ...downstreamAnalysis.generatedGuidance.buildAiGuidance.map((line) => `- ${line}`)
        ]
      : ["No Downstream AI Instructions were configured."]),
    "",
    "## Handover Warnings",
    ...(warnings.length > 0 ? warnings.map((warning) => `- ${warning}`) : ["- No active handover warnings."]),
    "",
    "## Structured AI Delivery Handoff",
    aiBrief.markdown,
    "",
    "## Human Framing Brief",
    humanBrief.markdown
  ].join("\n");

  return {
    summary,
    markdown,
    json: {
      summary,
      warnings,
      aiDeliveryHandoff: aiBrief.payload,
      humanFramingBrief: {
        title: humanBrief.title,
        filename: humanBrief.filename,
        markdown: humanBrief.markdown
      }
    }
  };
}
