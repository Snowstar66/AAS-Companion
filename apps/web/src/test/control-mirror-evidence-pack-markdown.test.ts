import { describe, expect, it } from "vitest";
import {
  buildControlMirrorDashboard,
  buildControlMirrorEvidencePack,
  buildControlMirrorEvidencePackMarkdown
} from "@aas-companion/domain";

function createEvidencePackInput() {
  return {
    organizationName: "AAS Demo Organization",
    outcomes: [
      {
        id: "outcome-1",
        key: "OUT-CM-001",
        title: "Control Mirror",
        framingVersion: 1,
        valueOwnerId: "value-owner-1",
        outcomeStatement: "Verify AI delivery conformance.",
        baselineDefinition: "Current delivery lacks mirror control.",
        riskProfile: "medium",
        aiAccelerationLevel: "level_3" as const,
        status: "active",
        directionSeeds: [],
        epics: [
          {
            id: "epic-1",
            key: "CM-01",
            title: "Conformance dashboard",
            purpose: "Show evidence.",
            directionSeeds: [],
            stories: [
              {
                id: "story-1",
                key: "CM-01.1",
                title: "Open Control Mirror",
                outcomeId: "outcome-1",
                epicId: "epic-1",
                valueIntent: "Give delivery leaders evidence.",
                expectedBehavior: "Dashboard shows conformance state.",
                acceptanceCriteria: ["Given a project, then conformance is visible."],
                aiUsageScope: ["deterministic checks"],
                aiAccelerationLevel: "level_3" as const,
                testDefinition: "",
                definitionOfDone: ["Human review remains visible."],
                status: "ready_for_handoff" as const,
                tollgateStatus: "approved" as const
              }
            ]
          }
        ]
      }
    ],
    persistentSnapshot: {
      id: "snapshot-1",
      label: "Uploaded project snapshot",
      sourceType: "uploaded_zip",
      scanTime: "2026-05-22T00:00:00.000Z",
      fileCount: 1,
      acceptedCount: 1,
      rejectedCount: 0,
      unreadableCount: 0,
      unchangedCount: 0,
      newCount: 1,
      modifiedCount: 0,
      deletedCount: 0,
      artifacts: [
        {
          id: "artifact-1",
          fileName: "docs/runtime.ts",
          artifactType: "implementation_note" as const,
          lineageStatus: "missing" as const,
          parsingConfidence: "high" as const,
          changeStatus: "new" as const,
          storyId: null
        }
      ],
      normalizedEvidence: [
        {
          id: "evidence-1",
          artifactId: "artifact-1",
          fileName: "docs/runtime.ts",
          evidenceType: "implementation_evidence" as const,
          label: "Runtime",
          sourceSection: "full-file",
          storyClassification: "not_story_like" as const,
          readinessState: "not_story_like" as const,
          missingReadinessFields: [],
          storyId: null,
          retentionMode: "redacted_excerpts" as const,
          retentionDisclosure: "A redacted source excerpt was retained.",
          redactionApplied: true,
          sensitiveFindingCount: 1
        }
      ]
    },
    artifactSessions: [],
    tollgates: [],
    signoffRecords: []
  };
}

describe("Control Mirror evidence pack Markdown export", () => {
  it("renders readable report, evidence, findings and Human Review state without raw source text", () => {
    const dashboard = buildControlMirrorDashboard(createEvidencePackInput());
    const evidencePack = buildControlMirrorEvidencePack(dashboard, {
      generatedAt: "2026-05-22T08:00:00.000Z"
    });
    const markdown = buildControlMirrorEvidencePackMarkdown(evidencePack);

    expect(markdown).toContain("# Control Mirror Evidence Pack");
    expect(markdown).toContain("AAS Demo Organization");
    expect(markdown).toContain("control-mirror-evidence-pack/v1");
    expect(markdown).toContain("Uploaded project snapshot");
    expect(markdown).toContain("level_3");
    expect(markdown).toContain("## Report Summary");
    expect(markdown).toContain("Evidence retention");
    expect(markdown).toContain("A redacted source excerpt was retained.");
    expect(markdown).toContain("## Evidence");
    expect(markdown).toContain("docs/runtime.ts");
    expect(markdown).toContain("## Conformance Findings");
    expect(markdown).toContain("## Guardrail Findings");
    expect(markdown).toContain("## Human Review");
    expect(markdown).toContain("## Product/Security Acceptance");
    expect(markdown).toContain("requires_product_security_acceptance");
    expect(markdown).toContain("Product owner, Security/privacy reviewer, AQA reviewer");
    expect(markdown).toContain("Raw source text exclusion - verified");
    expect(markdown).toContain("Raw source text is not included.");
    expect(markdown).not.toContain("\"content\"");
    expect(markdown).not.toContain("retainedExcerpt");
    expect(markdown).not.toContain("super-secret");
    expect(markdown).not.toContain("Authorization: Bearer");
  });
});
