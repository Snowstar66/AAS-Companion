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

function splitFlexibleListField(value: string | null | undefined) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(/\s*(?:\||;)\s*/)
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
    result[header.replace(/^\uFEFF/, "").trim()] = row[index] ?? "";
    return result;
  }, {});
}

function isTraceabilityPackRecord(record: Record<string, string>) {
  return (
    "row_type" in record &&
    "outcome_id" in record &&
    "source_story_ideas" in record &&
    "delivery_story_id" in record &&
    "requirements" in record &&
    "implementation_files" in record &&
    "tests_or_verification" in record
  );
}

function isTraceabilityMatrixRecord(record: Record<string, string>) {
  return (
    "trace_id" in record &&
    "source_ref" in record &&
    "source_intent" in record &&
    "implementation_artifacts" in record &&
    "verification" in record &&
    "status" in record
  );
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

function readRecordField(record: Record<string, string>, field: string) {
  return record[field]?.trim() ?? "";
}

function normalizeTraceabilityPackRow(record: Record<string, string>, index: number): TraceabilityEvidenceRow {
  const outcomeKey = readRecordField(record, "outcome_id");
  const sourceOriginIds = splitFlexibleListField(readRecordField(record, "source_story_ideas"));
  const normalizedSourceOriginIds = sourceOriginIds.length > 0 ? sourceOriginIds : ["ADDED"];
  const sourceStoryIdeaTitle = readRecordField(record, "source_story_idea_title");
  const deliveryStoryId = readRecordField(record, "delivery_story_id");
  const deliveryStoryTitle = readRecordField(record, "delivery_story_title");
  const epicOrRefinement = readRecordField(record, "epic_or_refinement");
  const requirements = splitFlexibleListField(readRecordField(record, "requirements")).filter(
    (entry) => entry.toUpperCase() !== "TBD"
  );
  const implementationFiles = splitFlexibleListField(readRecordField(record, "implementation_files"));
  const implementationSymbols = splitFlexibleListField(readRecordField(record, "implementation_symbols"));
  const testEvidence = splitFlexibleListField(readRecordField(record, "tests_or_verification"));
  const coverageStatus = readRecordField(record, "coverage_status");
  const traceabilityStatus = readRecordField(record, "traceability_status");
  const notes = readRecordField(record, "notes");
  const refinedStoryId =
    deliveryStoryId ||
    normalizedSourceOriginIds[0] ||
    epicOrRefinement ||
    `TRACEABILITY-ROW-${index + 1}`;
  const refinedStoryTitle =
    deliveryStoryTitle ||
    sourceStoryIdeaTitle ||
    epicOrRefinement ||
    `Traceability row ${index + 1}`;

  return {
    matchKey: [
      outcomeKey,
      normalizedSourceOriginIds.join("|"),
      refinedStoryId,
      epicOrRefinement || `row-${index + 1}`
    ].join("::"),
    outcomeKey,
    sourceOriginIds: normalizedSourceOriginIds,
    sourceOriginNote: [traceabilityStatus, sourceStoryIdeaTitle, notes].filter(Boolean).join(" - ") || null,
    refinedStoryId,
    refinedStoryTitle,
    epicId: epicOrRefinement || null,
    epicStoryIds: normalizedSourceOriginIds,
    epicStoryTitle: sourceStoryIdeaTitle || null,
    implementationArtifacts: implementationFiles,
    implementationStatus: coverageStatus || null,
    sourceValueIntent: sourceStoryIdeaTitle || null,
    sourceExpectedBehavior: notes || null,
    acceptanceCriteriaSummary: requirements.length > 0 ? requirements.join("; ") : readRecordField(record, "requirements") || null,
    testEvidence,
    codeEvidence: implementationSymbols,
    definitionOfDone:
      [traceabilityStatus ? `Traceability status: ${traceabilityStatus}` : "", coverageStatus ? `Coverage status: ${coverageStatus}` : ""]
        .filter(Boolean)
        .join(" | ") || null
  };
}

function expandTraceabilityReference(value: string) {
  const normalized = value.trim();
  const rangeMatch = normalized.match(/^([A-Za-z]+)-(\d+)\.\.([A-Za-z]+)-(\d+)$/);

  if (!rangeMatch) {
    return normalized ? [normalized] : [];
  }

  const [, startPrefix, rawStart, endPrefix, rawEnd] = rangeMatch;

  if (!startPrefix || !rawStart || !endPrefix || !rawEnd) {
    return [normalized];
  }

  if (startPrefix.toUpperCase() !== endPrefix.toUpperCase()) {
    return [normalized];
  }

  const start = Number.parseInt(rawStart, 10);
  const end = Number.parseInt(rawEnd, 10);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || end - start > 100) {
    return [normalized];
  }

  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const value = String(start + offset).padStart(rawStart.length, "0");
    return `${startPrefix.toUpperCase()}-${value}`;
  });
}

function splitTraceabilityReferences(value: string | null | undefined) {
  return splitFlexibleListField(value).flatMap(expandTraceabilityReference);
}

function normalizeTraceabilityMatrixRow(
  record: Record<string, string>,
  index: number,
  outcomeKey: string
): TraceabilityEvidenceRow {
  const traceId = readRecordField(record, "trace_id") || `TRACEABILITY-MATRIX-ROW-${index + 1}`;
  const sourceRefs = splitTraceabilityReferences(readRecordField(record, "source_ref"));
  const sourceIntent = readRecordField(record, "source_intent");
  const notes = readRecordField(record, "notes");
  const status = readRecordField(record, "status");
  const implementationArtifacts = splitFlexibleListField(readRecordField(record, "implementation_artifacts"));
  const verification = splitFlexibleListField(readRecordField(record, "verification"));
  const commits = splitFlexibleListField(readRecordField(record, "commits"));
  const sourceOriginIds = sourceRefs.length > 0 ? sourceRefs : ["ADDED"];
  const epicRef = sourceRefs.find((ref) => /^(?:EP|EPC|EPIC)-/i.test(ref)) ?? null;

  return {
    matchKey: [outcomeKey, sourceOriginIds.join("|"), traceId].join("::"),
    outcomeKey,
    sourceOriginIds,
    sourceOriginNote: [readRecordField(record, "source_ref"), notes].filter(Boolean).join(" - ") || null,
    refinedStoryId: traceId,
    refinedStoryTitle: sourceIntent || traceId,
    epicId: epicRef,
    epicStoryIds: sourceOriginIds,
    epicStoryTitle: epicRef,
    implementationArtifacts,
    implementationStatus: status || null,
    sourceValueIntent: sourceIntent || null,
    sourceExpectedBehavior: notes || null,
    acceptanceCriteriaSummary: sourceIntent || null,
    testEvidence: verification,
    codeEvidence: commits,
    definitionOfDone: [status ? `Status: ${status}` : "", notes].filter(Boolean).join(" | ") || null
  };
}

function normalizeTraceabilityEvidenceRow(record: Record<string, string>, index: number, outcomeKey: string) {
  if (isTraceabilityPackRecord(record)) {
    return normalizeTraceabilityPackRow(record, index);
  }

  if (isTraceabilityMatrixRecord(record)) {
    return normalizeTraceabilityMatrixRow(record, index, outcomeKey);
  }

  return normalizeTraceabilityRow(record);
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
    .map((row, index) => normalizeTraceabilityEvidenceRow(row, index, input.outcomeKey))
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
