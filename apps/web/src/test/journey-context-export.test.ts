import { describe, expect, it } from "vitest";
import { analyzeJourneyCoverage } from "@aas-companion/domain";
import type { JourneyContext } from "@aas-companion/domain";
import { buildFramingBriefExport } from "@/lib/framing/framing-brief-export";

describe("journey context export", () => {
  it("includes journey contexts in the framing export payload and markdown", () => {
    const journeyContext: JourneyContext = {
      id: "jc-1",
      outcomeId: "outcome-1",
      initiativeType: "AT",
      title: "Case handling flow",
      description: "How a case moves through the current operation.",
      journeys: [
        {
          id: "journey-1",
          title: "Handle incoming case",
          type: "operational",
          primaryActor: "Case worker",
          supportingActors: ["Team lead"],
          goal: "Resolve the incoming case safely",
          trigger: "A new case arrives",
          currentState: "Manual triage and fragmented follow-up",
          desiredFutureState: "Guided handling with clear support",
          steps: [
            {
              id: "step-1",
              title: "Review intake",
              actor: "Case worker",
              description: "Review the incoming case details.",
              currentPain: "Context is incomplete",
              desiredSupport: "Better intake summary",
              decisionPoint: true
            }
          ],
          painPoints: ["Missing context"],
          desiredSupport: ["Guided triage"],
          exceptions: ["Urgent escalations"],
          notes: "Important when workload is high",
          linkedEpicIds: ["epic-1"],
          linkedStoryIdeaIds: ["seed-1"],
          linkedFigmaRefs: ["seed-1:figma"],
          coverage: {
            status: "partially_covered",
            suggestedEpicIds: ["epic-1"],
            suggestedStoryIdeaIds: ["seed-1"],
            suggestedNewStoryIdeas: [
              {
                title: "Support guided case intake",
                description: "Summarize intake and clarify missing context.",
                valueIntent: "Reduce intake ambiguity",
                expectedOutcome: "Faster and safer triage",
                basedOnJourneyIds: ["journey-1"],
                basedOnStepIds: ["step-1"],
                confidence: 0.72
              }
            ],
            notes: "AI-generated recommendation scaffold based on Journey text overlap with current Epics and Story Ideas. Review before accepting."
          }
        }
      ],
      notes: "Optional context for later refinement"
    };

    const exportResult = buildFramingBriefExport({
      outcome: {
        id: "outcome-1",
        key: "OUT-001",
        title: "Improve case handling",
        problemStatement: "Case handling is fragmented.",
        outcomeStatement: "Reduce handling delay.",
        baselineDefinition: "Current average delay is 3 days.",
        baselineSource: "Ops report",
        solutionContext: "Existing support application",
        solutionConstraints: "Keep audit trail intact",
        dataSensitivity: "Personal data",
        journeyContexts: [journeyContext],
        deliveryType: "AT",
        aiExecutionPattern: "step_by_step",
        aiUsageIntent: "Refine framing and story ideas",
        businessImpactLevel: "high",
        businessImpactRationale: "Large operational benefit",
        dataSensitivityLevel: "medium",
        dataSensitivityRationale: "Contains personal data",
        blastRadiusLevel: "medium",
        blastRadiusRationale: "Impacts current operations",
        decisionImpactLevel: "medium",
        decisionImpactRationale: "Needs human oversight",
        aiLevelJustification: null,
        timeframe: "Q3 2026",
        aiAccelerationLevel: "level_2",
        riskProfile: "medium",
        lifecycleState: "active",
        originType: "native",
        valueOwnerId: "owner-1",
        valueOwner: {
          fullName: "Case Owner",
          email: "owner@example.com"
        },
        epics: [
          {
            id: "epic-1",
            key: "E-1",
            title: "Improve triage",
            scopeBoundary: "Triage and routing"
          }
        ],
        directionSeeds: [
          {
            id: "seed-1",
            key: "SI-1",
            title: "Guided intake summary",
            epicId: "epic-1",
            shortDescription: "Summarize case intake",
            expectedBehavior: "Show missing information",
            sourceStoryId: null,
            uxSketchName: "Intake reference",
            uxSketchContentType: "image/png",
            uxSketchDataUrl: "data:image/png;base64,ZmFrZQ==",
            uxSketches: null
          }
        ]
      },
      blockers: []
    });

    expect(exportResult.payload.version).toBe(4);
    expect(exportResult.payload.journey_contexts).toHaveLength(1);
    expect(exportResult.payload.journey_contexts[0]?.journeys[0]?.coverage?.status).toBe("partially_covered");
    expect(exportResult.markdown).toContain("## Journey Context");
    expect(exportResult.markdown).toContain("Handle incoming case");
    expect(exportResult.markdown).toContain("Coverage status: partially_covered");
  });

  it("analyzes journeys against epics and story ideas with reviewable suggestions", () => {
    const analyzed = analyzeJourneyCoverage({
      journeyContext: {
        id: "jc-2",
        outcomeId: "outcome-2",
        initiativeType: "AD",
        title: "Onboarding flow",
        journeys: [
          {
            id: "journey-2",
            title: "Onboard customer",
            primaryActor: "Account manager",
            goal: "Complete onboarding quickly",
            trigger: "Customer signs contract",
            steps: [
              {
                id: "step-2",
                title: "Collect onboarding data",
                description: "Collect onboarding data from the customer."
              }
            ]
          }
        ]
      },
      epics: [
        {
          id: "epic-2",
          key: "E-2",
          title: "Onboarding support",
          purpose: "Support onboarding",
          scopeBoundary: "Customer onboarding"
        }
      ],
      storyIdeas: [
        {
          id: "seed-2",
          key: "SI-2",
          title: "Collect onboarding data",
          valueIntent: "Reduce manual follow-up",
          expectedBehavior: "Guide data collection",
          epicId: "epic-2"
        }
      ]
    });

    expect(analyzed.journeys).toHaveLength(1);
    expect(analyzed.journeys[0]?.coverage?.status).not.toBe("unanalysed");
    expect(analyzed.journeys[0]?.coverage?.notes).toContain("AI-generated recommendation scaffold");
  });
});
