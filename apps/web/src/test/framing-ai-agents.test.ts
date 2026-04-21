import { describe, expect, it } from "vitest";
import { createDefaultDownstreamAiInstructions } from "@/lib/framing/downstreamInstructionCatalog";
import { generateBmadExport } from "@/lib/framing/bmadAdapter";
import { generateDesignHandover } from "@/lib/framing/designHandoverAgent";
import { runStorySuggestionAgent } from "@/lib/framing/storySuggestionAgent";
import type { FramingAgentSourceOfTruth } from "@/lib/framing/agentTypes";

function createSource(): FramingAgentSourceOfTruth {
  return {
    outcome: {
      id: "outcome-1",
      key: "OUT-1",
      title: "Improve intake flow",
      deliveryType: "AT",
      aiLevel: 2,
      aiAccelerationLevel: "level_2",
      problemStatement: "Case intake is fragmented and hard to trace.",
      outcomeStatement: "Reduce intake lead time and improve traceability.",
      baselineDefinition: "Current lead time is 5 days and handoffs are manual.",
      baselineSource: "Service desk data",
      solutionContext: "Existing intake spans email, portal, and operations handoff.",
      constraints: "## UX principles\nKeep continuity visible.\n\n## Non-functional requirements\nAuditability is required.\n\n## Additional requirements\nPreserve coexistence during rollout.",
      structuredConstraints: {
        uxPrinciples: "Keep continuity visible.",
        nonFunctionalRequirements: "Auditability is required.",
        additionalRequirements: "Preserve coexistence during rollout."
      },
      dataSensitivity: "Contains customer and incident data.",
      dataSensitivityLevel: "high",
      dataSensitivityRationale: "Customer-linked incident history must remain controlled.",
      timeframe: "Q3",
      riskProfile: "high"
    },
    epics: [
      {
        id: "epic-1",
        key: "EPC-1",
        title: "Unified intake handling",
        purpose: "Create one coherent intake capability.",
        scopeBoundary: "Capture, route, and track incoming cases."
      }
    ],
    storyIdeas: [
      {
        id: "seed-1",
        key: "SEED-1",
        title: "Capture incoming case context",
        epicId: "epic-1",
        epicKey: "EPC-1",
        shortDescription: "Preserve intake context when a case arrives.",
        expectedBehavior: "",
        uxSketchName: null,
        uxSketchDataUrl: null
      }
    ],
    journeyContexts: [
      {
        id: "jc-1",
        outcomeId: "outcome-1",
        initiativeType: "AT",
        title: "Case intake",
        description: "From first signal to accepted intake record.",
        journeys: [
          {
            id: "journey-1",
            title: "Handle incoming case",
            primaryActor: "Service coordinator",
            goal: "Register and route the case correctly",
            trigger: "A new case arrives",
            steps: [
              {
                id: "step-1",
                title: "Review incoming material",
                description: "Coordinator reviews the incoming case information and decides what is missing.",
                decisionPoint: true
              }
            ],
            desiredSupport: ["Make missing context visible before routing."],
            linkedEpicIds: [],
            linkedStoryIdeaIds: [],
            linkedFigmaRefs: [],
            coverage: {
              status: "uncovered",
              suggestedEpicIds: ["epic-1"],
              suggestedStoryIdeaIds: [],
              suggestedNewStoryIdeas: [
                {
                  title: "Flag missing intake data before routing",
                  description: "Help the coordinator see missing context before the case moves forward.",
                  basedOnJourneyIds: ["journey-1"],
                  basedOnStepIds: ["step-1"],
                  confidence: 0.77
                }
              ]
            }
          }
        ]
      }
    ],
    downstreamAiInstructions: createDefaultDownstreamAiInstructions({
      initiativeType: "AT",
      aiLevel: 2
    })
  };
}

describe("framing ai agents", () => {
  it("generates structured story suggestions from journey context", () => {
    const result = runStorySuggestionAgent(createSource());

    expect(result.result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.some((suggestion) => suggestion.kind === "story_idea_candidate")).toBe(true);
  });

  it("generates design and bmad handover artifacts", () => {
    const source = createSource();
    const handover = generateDesignHandover(source);
    const bmad = generateBmadExport(source);

    expect(handover.markdown).toContain("# Design / Build Handover");
    expect(handover.markdown).toContain("## Downstream AI Instructions");
    expect(handover.json).toHaveProperty("aiDeliveryHandoff");
    expect(bmad.markdown).toContain("# BMAD Prepared Framing Package");
    expect(bmad.json).toHaveProperty("profile", "bmad_prepared");
  });
});
