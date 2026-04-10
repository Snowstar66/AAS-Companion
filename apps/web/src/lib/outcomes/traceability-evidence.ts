import { access, readFile } from "node:fs/promises";

export type TraceabilityEvidenceRow = {
  matchKey: string;
  outcomeKey: string;
  sourceOriginIds: string[];
  sourceOriginNote: string | null;
  refinedStoryId: string;
  refinedStoryTitle: string;
  epicId: string | null;
  epicStoryIds: string[];
  epicStoryTitle: string | null;
  implementationArtifacts: string[];
  implementationStatus: string | null;
  sourceValueIntent: string | null;
  sourceExpectedBehavior: string | null;
  acceptanceCriteriaSummary: string | null;
  testEvidence: string[];
  codeEvidence: string[];
  definitionOfDone: string | null;
};

export type TraceabilityEvidenceSnapshot = {
  sourcePath: string;
  uploadedAt?: string | null;
  rows: TraceabilityEvidenceRow[];
};

function splitListField(value: string | null | undefined) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(/\s+\|\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function splitOriginIds(value: string | null | undefined) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseCsv(content: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentField += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
      continue;
    }

    currentField += character;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((field) => field.trim().length > 0));
}

function toRecord(headers: string[], row: string[]) {
  return headers.reduce<Record<string, string>>((result, header, index) => {
    result[header] = row[index] ?? "";
    return result;
  }, {});
}

function normalizeTraceabilityRow(record: Record<string, string>): TraceabilityEvidenceRow {
  return {
    matchKey: record.match_key ?? "",
    outcomeKey: record.outcome_key ?? "",
    sourceOriginIds: splitOriginIds(record.source_origin_ids),
    sourceOriginNote: record.source_origin_note?.trim() || null,
    refinedStoryId: record.refined_story_id ?? "",
    refinedStoryTitle: record.refined_story_title ?? "",
    epicId: record.epic_id?.trim() || null,
    epicStoryIds: splitListField(record.epic_story_id),
    epicStoryTitle: record.epic_story_title?.trim() || null,
    implementationArtifacts: splitListField(record.implementation_artifacts),
    implementationStatus: record.implementation_status?.trim() || null,
    sourceValueIntent: record.source_value_intent?.trim() || null,
    sourceExpectedBehavior: record.source_expected_behavior?.trim() || null,
    acceptanceCriteriaSummary: record.acceptance_criteria_summary?.trim() || null,
    testEvidence: splitListField(record.test_evidence),
    codeEvidence: splitListField(record.code_evidence),
    definitionOfDone: record.definition_of_done?.trim() || null
  };
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => (typeof entry === "string" ? entry.trim() : "")).filter(Boolean);
}

function normalizeStoredTraceabilityRow(value: unknown): TraceabilityEvidenceRow | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const matchKey = typeof record.matchKey === "string" ? record.matchKey : null;
  const outcomeKey = typeof record.outcomeKey === "string" ? record.outcomeKey : null;
  const refinedStoryId = typeof record.refinedStoryId === "string" ? record.refinedStoryId : null;
  const refinedStoryTitle = typeof record.refinedStoryTitle === "string" ? record.refinedStoryTitle : null;

  if (!matchKey || !outcomeKey || !refinedStoryId || !refinedStoryTitle) {
    return null;
  }

  return {
    matchKey,
    outcomeKey,
    sourceOriginIds: normalizeStringArray(record.sourceOriginIds),
    sourceOriginNote: typeof record.sourceOriginNote === "string" ? record.sourceOriginNote : null,
    refinedStoryId,
    refinedStoryTitle,
    epicId: typeof record.epicId === "string" ? record.epicId : null,
    epicStoryIds: normalizeStringArray(record.epicStoryIds),
    epicStoryTitle: typeof record.epicStoryTitle === "string" ? record.epicStoryTitle : null,
    implementationArtifacts: normalizeStringArray(record.implementationArtifacts),
    implementationStatus: typeof record.implementationStatus === "string" ? record.implementationStatus : null,
    sourceValueIntent: typeof record.sourceValueIntent === "string" ? record.sourceValueIntent : null,
    sourceExpectedBehavior: typeof record.sourceExpectedBehavior === "string" ? record.sourceExpectedBehavior : null,
    acceptanceCriteriaSummary:
      typeof record.acceptanceCriteriaSummary === "string" ? record.acceptanceCriteriaSummary : null,
    testEvidence: normalizeStringArray(record.testEvidence),
    codeEvidence: normalizeStringArray(record.codeEvidence),
    definitionOfDone: typeof record.definitionOfDone === "string" ? record.definitionOfDone : null
  };
}

async function canReadFile(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveTraceabilityExportCsvPath() {
  const configured = process.env.AAS_TRACEABILITY_EXPORT_CSV?.trim();
  const candidates = [configured].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    if (await canReadFile(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function buildTraceabilityEvidenceSnapshotFromCsv(input: {
  content: string;
  outcomeKey: string;
  sourcePath: string;
  uploadedAt?: string | null;
}): TraceabilityEvidenceSnapshot | null {
  const [headerRow = [], ...dataRows] = parseCsv(input.content);

  if (headerRow.length === 0) {
    return null;
  }

  const rows = dataRows
    .map((row) => toRecord(headerRow, row))
    .map(normalizeTraceabilityRow)
    .filter((row) => row.outcomeKey === input.outcomeKey);

  return {
    sourcePath: input.sourcePath,
    uploadedAt: input.uploadedAt ?? null,
    rows
  };
}

export function getStoredTraceabilityEvidenceSnapshot(
  approvalSnapshot: unknown,
  outcomeKey: string
): TraceabilityEvidenceSnapshot | null {
  if (!approvalSnapshot || typeof approvalSnapshot !== "object") {
    return null;
  }

  const traceabilityEvidence = (approvalSnapshot as { traceabilityEvidence?: unknown }).traceabilityEvidence;

  if (!traceabilityEvidence || typeof traceabilityEvidence !== "object") {
    return null;
  }

  const stored = traceabilityEvidence as Record<string, unknown>;
  const sourcePath = typeof stored.sourcePath === "string" ? stored.sourcePath : null;

  if (!sourcePath) {
    return null;
  }

  const rawRows = Array.isArray(stored.rows) ? stored.rows : [];
  const rows = rawRows
    .map(normalizeStoredTraceabilityRow)
    .filter((row): row is TraceabilityEvidenceRow => Boolean(row))
    .filter((row) => row.outcomeKey === outcomeKey);

  return {
    sourcePath,
    uploadedAt: typeof stored.uploadedAt === "string" ? stored.uploadedAt : null,
    rows
  };
}

export async function loadTraceabilityEvidenceForOutcome(outcomeKey: string): Promise<TraceabilityEvidenceSnapshot | null> {
  const sourcePath = await resolveTraceabilityExportCsvPath();

  if (!sourcePath) {
    return null;
  }

  const content = await readFile(sourcePath, "utf8");
  return buildTraceabilityEvidenceSnapshotFromCsv({
    content,
    outcomeKey,
    sourcePath
  });
}

export function getTraceabilityRowsForOrigin(rows: TraceabilityEvidenceRow[], originId: string) {
  return rows.filter((row) => row.sourceOriginIds.includes(originId));
}

export function getOutsideHandshakeTraceabilityRows(rows: TraceabilityEvidenceRow[]) {
  return rows.filter((row) => row.sourceOriginIds.includes("ADDED"));
}

export function getNfrTraceabilityRows(rows: TraceabilityEvidenceRow[]) {
  return rows.filter((row) => row.sourceOriginIds.some((originId) => originId.startsWith("NFR-")));
}
