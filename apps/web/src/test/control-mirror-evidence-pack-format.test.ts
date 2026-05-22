import { describe, expect, it } from "vitest";
import {
  buildControlMirrorDashboard,
  buildControlMirrorEvidencePack,
  buildControlMirrorEvidencePackFileName
} from "@aas-companion/domain";

function createFormatInput() {
  return {
    organizationName: "AAS Demo Organization",
    outcomes: [
      {
        id: "outcome-1",
        key: "OUT-CM-001",
        title: "Control Mirror",
        framingVersion: 2,
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
            stories: []
          }
        ]
      }
    ],
    persistentSnapshot: {
      id: "snapshot-1",
      label: "Uploaded project snapshot",
      sourceType: "uploaded_zip",
      scanTime: "2026-05-22T00:00:00.000Z",
      fileCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      unreadableCount: 0,
      unchangedCount: 0,
      newCount: 0,
      modifiedCount: 0,
      deletedCount: 0,
      artifacts: [],
      normalizedEvidence: []
    },
    artifactSessions: [],
    tollgates: [],
    signoffRecords: []
  };
}

describe("Control Mirror evidence pack format metadata", () => {
  it("builds sanitized and stable export filenames", () => {
    expect(buildControlMirrorEvidencePackFileName({
      activeProject: " AAS Demo / North: Team!! ",
      snapshotId: "Snapshot #42 / May",
      extension: "json"
    })).toBe("aas-demo-north-team-snapshot-42-may-evidence-pack.json");

    expect(buildControlMirrorEvidencePackFileName({
      activeProject: "   ",
      snapshotId: "",
      extension: "md"
    })).toBe("control-mirror-snapshot-evidence-pack.md");
  });

  it("keeps schema version and deterministic generatedAt metadata", () => {
    const dashboard = buildControlMirrorDashboard(createFormatInput());
    const stringTimestampPack = buildControlMirrorEvidencePack(dashboard, {
      generatedAt: "2026-05-22T09:00:00.000Z"
    });
    const dateTimestampPack = buildControlMirrorEvidencePack(dashboard, {
      generatedAt: new Date("2026-05-22T09:15:00.000Z")
    });

    expect(stringTimestampPack.schemaVersion).toBe("control-mirror-evidence-pack/v1");
    expect(stringTimestampPack.generatedAt).toBe("2026-05-22T09:00:00.000Z");
    expect(dateTimestampPack.schemaVersion).toBe("control-mirror-evidence-pack/v1");
    expect(dateTimestampPack.generatedAt).toBe("2026-05-22T09:15:00.000Z");
  });
});
