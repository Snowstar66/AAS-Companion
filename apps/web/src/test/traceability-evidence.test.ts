import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildTraceabilityEvidenceSnapshotFromCsv,
  getNfrTraceabilityRows,
  getOutsideHandshakeTraceabilityRows,
  getStoredTraceabilityEvidenceSnapshot,
  getTraceabilityRowsForOrigin,
  loadTraceabilityEvidenceForOutcome
} from "@/lib/outcomes/traceability-evidence";

const tempDirs: string[] = [];

afterEach(async () => {
  delete process.env.AAS_TRACEABILITY_EXPORT_CSV;

  await Promise.all(
    tempDirs.splice(0).map(async (directory) => {
      await rm(directory, { recursive: true, force: true });
    })
  );
});

describe("traceability evidence", () => {
  it("normalizes uploaded csv content into an evidence snapshot", () => {
    const snapshot = buildTraceabilityEvidenceSnapshotFromCsv({
      content: [
        '"match_key","outcome_key","source_origin_ids","source_origin_note","refined_story_id","refined_story_title","epic_id","epic_story_id","epic_story_title","implementation_artifacts","implementation_status","source_value_intent","source_expected_behavior","acceptance_criteria_summary","test_evidence","code_evidence","definition_of_done"',
        '"OUT-001::STORY-001::US-01::1.2","OUT-001","STORY-001","Direct mapping.","US-01","Registrera hushallsprofil","E1","1.2","Registrera hushallsprofil","artifact-one.md | artifact-two.md","review","Value","Behavior","AC","test-one.ts | test-two.ts","code-one.ts","DoD"'
      ].join("\n"),
      outcomeKey: "OUT-001",
      sourcePath: "traceability-export.csv",
      uploadedAt: "2026-04-10T08:00:00.000Z"
    });

    expect(snapshot?.sourcePath).toBe("traceability-export.csv");
    expect(snapshot?.uploadedAt).toBe("2026-04-10T08:00:00.000Z");
    expect(snapshot?.rows).toHaveLength(1);
    expect(snapshot?.rows[0]?.implementationArtifacts).toEqual(["artifact-one.md", "artifact-two.md"]);
  });

  it("normalizes implementation traceability-pack csv content into an evidence snapshot", () => {
    const snapshot = buildTraceabilityEvidenceSnapshotFromCsv({
      content: [
        '"row_type","outcome_id","outcome_title","epic_or_refinement","source_story_ideas","source_story_idea_title","delivery_story_id","delivery_story_title","requirements","implementation_files","implementation_symbols","tests_or_verification","coverage_status","traceability_status","notes"',
        '"delivery_story","OUT-001","Gemensam överblick","SC-E01","SC-E01-SI01","Importera tjänstgöringsgrad","Story 1.1","Importera månadsbeläggning från Excel","FR1; NFR5","apps/web/src/app/api/import/monthly-allocation/route.ts; apps/web/src/domain/baseline-import/import-validator.ts","POST monthly-allocation; validateMonthlyAllocationImport","pnpm build","implemented_for_csv_tsv","traced_to_original_story_idea","Runtime stöder CSV/TSV."',
        '"unmapped_new_code","OUT-001","Gemensam överblick","Recommended SC-E06-SI04","","Importera debiteringsutfall","","","TBD","apps/web/src/app/page.tsx","billing actual import","pnpm build","implemented_but_story_missing","requires_new_or_updated_story","Ursprunglig story saknas."',
        '"delivery_story","OUT-999","Other outcome","SC-E99","SC-E99-SI01","Other","Story 9.9","Other","FR99","other.ts","OtherSymbol","pnpm test","implemented","traced","Other outcome row."'
      ].join("\n"),
      outcomeKey: "OUT-001",
      sourcePath: "traceability-pack.csv"
    });

    expect(snapshot?.rows).toHaveLength(2);
    expect(snapshot?.rows[0]?.outcomeKey).toBe("OUT-001");
    expect(snapshot?.rows[0]?.sourceOriginIds).toEqual(["SC-E01-SI01"]);
    expect(snapshot?.rows[0]?.refinedStoryId).toBe("Story 1.1");
    expect(snapshot?.rows[0]?.implementationArtifacts).toEqual([
      "apps/web/src/app/api/import/monthly-allocation/route.ts",
      "apps/web/src/domain/baseline-import/import-validator.ts"
    ]);
    expect(snapshot?.rows[0]?.codeEvidence).toEqual(["POST monthly-allocation", "validateMonthlyAllocationImport"]);
    expect(snapshot?.rows[0]?.testEvidence).toEqual(["pnpm build"]);
    expect(snapshot?.rows[1]?.sourceOriginIds).toEqual(["ADDED"]);
    expect(snapshot?.rows[1]?.definitionOfDone).toContain("requires_new_or_updated_story");
  });

  it("reads stored traceability evidence from an approval snapshot", () => {
    const snapshot = getStoredTraceabilityEvidenceSnapshot(
      {
        traceabilityEvidence: {
          sourcePath: "traceability-export.csv",
          uploadedAt: "2026-04-10T08:00:00.000Z",
          rows: [
            {
              matchKey: "OUT-001::STORY-001::US-01::1.2",
              outcomeKey: "OUT-001",
              sourceOriginIds: ["STORY-001"],
              sourceOriginNote: "Direct mapping.",
              refinedStoryId: "US-01",
              refinedStoryTitle: "Registrera hushallsprofil",
              epicId: "E1",
              epicStoryIds: ["1.2"],
              epicStoryTitle: "Registrera hushallsprofil",
              implementationArtifacts: ["artifact-one.md"],
              implementationStatus: "review",
              sourceValueIntent: "Value",
              sourceExpectedBehavior: "Behavior",
              acceptanceCriteriaSummary: "AC",
              testEvidence: ["test-one.ts"],
              codeEvidence: ["code-one.ts"],
              definitionOfDone: "DoD"
            }
          ]
        }
      },
      "OUT-001"
    );

    expect(snapshot?.sourcePath).toBe("traceability-export.csv");
    expect(snapshot?.rows).toHaveLength(1);
    expect(snapshot?.rows[0]?.refinedStoryId).toBe("US-01");
  });

  it("loads and filters BMAD traceability rows from csv", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "aas-traceability-"));
    tempDirs.push(directory);
    const csvPath = path.join(directory, "traceability-export.csv");

    await writeFile(
      csvPath,
      [
        '"match_key","outcome_key","source_origin_ids","source_origin_note","refined_story_id","refined_story_title","epic_id","epic_story_id","epic_story_title","implementation_artifacts","implementation_status","source_value_intent","source_expected_behavior","acceptance_criteria_summary","test_evidence","code_evidence","definition_of_done"',
        '"OUT-001::STORY-001::US-01::1.2","OUT-001","STORY-001","Direct mapping.","US-01","Registrera hushallsprofil","E1","1.2","Registrera hushallsprofil","_bmad-output/implementation-artifacts/1-2-register-household-profile.md","review","Value","Behavior","AC","test-one.ts | test-two.ts","code-one.ts","DoD"',
        '"OUT-001::ADDED::US-14::4.1","OUT-001","ADDED","Added during refinement.","US-14","Snabbhjalpslage","E4","4.1","Quick help","_bmad-output/implementation-artifacts/4-1-open-quick-help-from-home-screen.md","review","Value","Behavior","AC","quick-help.test.ts","quick-help.tsx","DoD"',
        '"OUT-001::NFR-001::US-17::6.1|6.2","OUT-001","NFR-001","Derived from NFR.","US-17","Offline","E6","6.1 | 6.2","Offline support","_bmad-output/implementation-artifacts/6-1-preserve-core-flows-locally-between-sessions.md","review","Value","Behavior","AC","offline.test.ts","offline.tsx","DoD"',
        '"OUT-999::STORY-999::US-99::9.9","OUT-999","STORY-999","Other outcome.","US-99","Other","E9","9.9","Other","artifact.md","review","Value","Behavior","AC","test.ts","code.ts","DoD"'
      ].join("\n"),
      "utf8"
    );

    process.env.AAS_TRACEABILITY_EXPORT_CSV = csvPath;

    const snapshot = await loadTraceabilityEvidenceForOutcome("OUT-001");

    expect(snapshot?.rows).toHaveLength(3);
    expect(getTraceabilityRowsForOrigin(snapshot?.rows ?? [], "STORY-001")).toHaveLength(1);
    expect(getOutsideHandshakeTraceabilityRows(snapshot?.rows ?? [])).toHaveLength(1);
    expect(getNfrTraceabilityRows(snapshot?.rows ?? [])).toHaveLength(1);
    expect(snapshot?.rows[0]?.implementationArtifacts[0]).toContain("1-2-register-household-profile.md");
    expect(snapshot?.rows[0]?.testEvidence).toEqual(["test-one.ts", "test-two.ts"]);
    expect(snapshot?.rows[2]?.epicStoryIds).toEqual(["6.1", "6.2"]);
  });
});
