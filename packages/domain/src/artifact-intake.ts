import { z } from "zod";
import {
  aiAccelerationLevelSchema,
  artifactAasCandidateTypeSchema,
  artifactCandidateReviewStatusSchema,
  artifactComplianceFindingCategorySchema,
  artifactIssueDispositionActionSchema,
  artifactAasMappingStateSchema,
  artifactImportIntentSchema,
  artifactIntakeSessionStatusSchema,
  artifactParsedSectionKindSchema,
  artifactSourceTypeSchema,
  artifactSourceTypeStatusSchema,
  extractionConfidenceSchema,
  importedGovernedReadinessStateSchema,
  riskProfileSchema,
  storyTypeSchema
} from "./enums";

export const supportedArtifactExtensions = [".md", ".mdx", ".markdown", ".txt", ".json"] as const;

export const artifactIntakeProcessingModeSchema = z.enum(["deterministic", "ai_assisted"]);

export const artifactIntakeFileRecordSchema = z.object({
  id: z.string().min(1),
  intakeSessionId: z.string().min(1),
  organizationId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().nullish(),
  extension: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  content: z.string().min(1),
  sourceTypeStatus: artifactSourceTypeStatusSchema,
  sourceType: artifactSourceTypeSchema.nullish(),
  sourceTypeConfidence: extractionConfidenceSchema.nullish(),
  classifiedAt: z.date().nullish(),
  parsedAt: z.date().nullish(),
  parsedArtifacts: z.unknown().nullish(),
  sectionDispositions: z.unknown().nullish(),
  uploadedBy: z.string().nullish(),
  uploadedAt: z.date()
});

export const artifactIntakeSessionRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  label: z.string().min(1),
  importIntent: artifactImportIntentSchema,
  status: artifactIntakeSessionStatusSchema,
  mappedArtifacts: z.unknown().nullish(),
  mappingCompletedAt: z.date().nullish(),
  createdBy: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const artifactIntakeUploadFileSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().nullish(),
  sizeBytes: z.number().int().nonnegative(),
  content: z.string().min(1)
});

export const artifactIntakeUploadRequestSchema = z.object({
  organizationId: z.string().min(1),
  actorId: z.string().nullish(),
  label: z.string().trim().min(1).max(120).optional(),
  importIntent: artifactImportIntentSchema.default("framing"),
  processingMode: artifactIntakeProcessingModeSchema.default("ai_assisted"),
  files: z.array(artifactIntakeUploadFileSchema).min(1)
});

export const artifactIntakeRejectedFileSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().nullish(),
  reason: z.string().min(1)
});

export const artifactSourceClassificationSchema = z.object({
  sourceType: artifactSourceTypeSchema,
  confidence: extractionConfidenceSchema,
  rationale: z.string().min(1)
});

export const artifactSourceReferenceSchema = z.object({
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  sectionId: z.string().min(1),
  sectionTitle: z.string().min(1),
  sectionMarker: z.string().min(1),
  lineStart: z.number().int().positive(),
  lineEnd: z.number().int().positive()
});

export const artifactParsedSectionSchema = z.object({
  id: z.string().min(1),
  kind: artifactParsedSectionKindSchema,
  title: z.string().min(1),
  text: z.string().min(1),
  confidence: extractionConfidenceSchema,
  isUncertain: z.boolean(),
  sourceReference: artifactSourceReferenceSchema
});

export const artifactParseResultSchema = z.object({
  classification: artifactSourceClassificationSchema,
  sections: z.array(artifactParsedSectionSchema)
});

export const artifactAasCandidateSourceSchema = z.object({
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  sectionId: z.string().min(1),
  sectionTitle: z.string().min(1),
  sectionMarker: z.string().min(1),
  sourceType: artifactSourceTypeSchema,
  confidence: extractionConfidenceSchema
});

export const artifactCandidateHumanDecisionSchema = z.object({
  valueOwnerId: z.string().nullish(),
  baselineValidity: z.enum(["confirmed", "needs_follow_up"]).nullish(),
  aiAccelerationLevel: aiAccelerationLevelSchema.nullish(),
  riskProfile: riskProfileSchema.nullish(),
  riskAcceptanceStatus: z.enum(["accepted", "needs_review"]).nullish()
});

export const artifactCandidateDraftRecordSchema = z.object({
  key: z.string().nullish(),
  title: z.string().nullish(),
  problemStatement: z.string().nullish(),
  outcomeStatement: z.string().nullish(),
  baselineDefinition: z.string().nullish(),
  baselineSource: z.string().nullish(),
  timeframe: z.string().nullish(),
  purpose: z.string().nullish(),
  scopeBoundary: z.string().nullish(),
  riskNote: z.string().nullish(),
  storyType: storyTypeSchema.nullish(),
  valueIntent: z.string().nullish(),
  expectedBehavior: z.string().nullish(),
  acceptanceCriteria: z.array(z.string()).default([]),
  aiUsageScope: z.array(z.string()).default([]),
  testDefinition: z.string().nullish(),
  definitionOfDone: z.array(z.string()).default([]),
  outcomeCandidateId: z.string().nullish(),
  epicCandidateId: z.string().nullish()
});

export const artifactAasCandidateSchema = z.object({
  id: z.string().min(1),
  type: artifactAasCandidateTypeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  mappingState: artifactAasMappingStateSchema,
  source: artifactAasCandidateSourceSchema,
  inferredOutcomeCandidateId: z.string().nullish(),
  inferredEpicCandidateId: z.string().nullish(),
  relationshipState: artifactAasMappingStateSchema,
  relationshipNote: z.string().nullish(),
  acceptanceCriteria: z.array(z.string()),
  testNotes: z.array(z.string()),
  draftRecord: z.lazy(() => artifactCandidateDraftRecordSchema.partial()).optional()
});

export const artifactCarryForwardCategorySchema = z.enum([
  "ux_principle",
  "nfr_constraint",
  "solution_constraint",
  "additional_requirement",
  "excluded_design"
]);

export const artifactCarryForwardUseSchema = z.enum([
  "design_input",
  "framing_constraint",
  "cross_cutting_requirement"
]);

export const artifactCarryForwardItemSchema = z.object({
  id: z.string().min(1),
  category: artifactCarryForwardCategorySchema,
  recommendedUse: artifactCarryForwardUseSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  sourceSection: artifactParsedSectionSchema
});

export const artifactMappingResultSchema = z.object({
  candidates: z.array(artifactAasCandidateSchema),
  carryForwardItems: z.array(artifactCarryForwardItemSchema).default([]),
  unmappedSections: z.array(artifactParsedSectionSchema)
});

export const artifactComplianceFindingSchema = z.object({
  code: z.string().min(1),
  category: artifactComplianceFindingCategorySchema,
  message: z.string().min(1),
  fieldLabel: z.string().min(1).nullish()
});

export const artifactComplianceResultSchema = z.object({
  findings: z.array(artifactComplianceFindingSchema),
  summary: z.object({
    missing: z.number().int().nonnegative(),
    uncertain: z.number().int().nonnegative(),
    humanOnly: z.number().int().nonnegative(),
    blocked: z.number().int().nonnegative()
  }),
  promotionBlocked: z.boolean(),
  humanReviewRequired: z.boolean()
});

export const artifactIssueDispositionSchema = z.object({
  issueId: z.string().min(1),
  action: artifactIssueDispositionActionSchema,
  note: z.string().trim().max(500).nullish()
});

export const artifactIssueDispositionMapSchema = z.record(z.string(), artifactIssueDispositionSchema).default({});

export const artifactIssueProgressSchema = z.object({
  total: z.number().int().nonnegative(),
  resolved: z.number().int().nonnegative(),
  unresolved: z.number().int().nonnegative(),
  categories: z.object({
    missing: z.number().int().nonnegative(),
    uncertain: z.number().int().nonnegative(),
    humanOnly: z.number().int().nonnegative(),
    blocked: z.number().int().nonnegative(),
    unmapped: z.number().int().nonnegative()
  })
});

export const artifactCandidateRecordSchema = z.object({
  id: z.string().min(1),
  intakeSessionId: z.string().min(1),
  organizationId: z.string().min(1),
  fileId: z.string().min(1),
  type: artifactAasCandidateTypeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  mappingState: artifactAasMappingStateSchema,
  sourceType: artifactSourceTypeSchema,
  sourceConfidence: extractionConfidenceSchema,
  sourceSectionId: z.string().min(1),
  sourceSectionTitle: z.string().min(1),
  sourceSectionMarker: z.string().min(1),
  inferredOutcomeCandidateId: z.string().nullish(),
  inferredEpicCandidateId: z.string().nullish(),
  relationshipState: artifactAasMappingStateSchema,
  relationshipNote: z.string().nullish(),
  acceptanceCriteria: z.array(z.string()).default([]),
  testNotes: z.array(z.string()).default([]),
  draftRecord: artifactCandidateDraftRecordSchema,
  humanDecisions: artifactCandidateHumanDecisionSchema,
  complianceResult: artifactComplianceResultSchema,
  issueDispositions: artifactIssueDispositionMapSchema,
  reviewStatus: artifactCandidateReviewStatusSchema,
  reviewComment: z.string().nullish(),
  followUpNeeded: z.boolean(),
  importedReadinessState: importedGovernedReadinessStateSchema.nullish(),
  promotedEntityType: artifactAasCandidateTypeSchema.nullish(),
  promotedEntityId: z.string().nullish(),
  promotedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const artifactCandidateReviewActionInputSchema = z.object({
  organizationId: z.string().min(1),
  actorId: z.string().nullish(),
  candidateId: z.string().min(1),
  reviewStatus: artifactCandidateReviewStatusSchema,
  reviewComment: z.string().trim().max(1000).nullish(),
  draftRecord: artifactCandidateDraftRecordSchema.partial().optional(),
  humanDecisions: artifactCandidateHumanDecisionSchema.partial().optional(),
  issueDisposition: artifactIssueDispositionSchema.optional()
});

export const artifactFileSectionDispositionActionInputSchema = z.object({
  organizationId: z.string().min(1),
  actorId: z.string().nullish(),
  fileId: z.string().min(1),
  sectionId: z.string().min(1),
  action: artifactIssueDispositionActionSchema,
  note: z.string().trim().max(500).nullish()
});

export const artifactCandidatePromotionResultSchema = z.object({
  candidateId: z.string().min(1),
  promotedEntityType: artifactAasCandidateTypeSchema,
  promotedEntityId: z.string().min(1),
  importedReadinessState: importedGovernedReadinessStateSchema
});

export const artifactAiSectionDecisionSchema = z.object({
  sectionId: z.string().min(1),
  kind: artifactParsedSectionKindSchema,
  confidence: extractionConfidenceSchema
});

export const artifactAiCandidateInterpretationSchema = z.object({
  sectionId: z.string().min(1),
  type: artifactAasCandidateTypeSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  linkedOutcomeSectionId: z.string().min(1).nullish(),
  linkedEpicSectionId: z.string().min(1).nullish(),
  mappingState: artifactAasMappingStateSchema.optional(),
  relationshipState: artifactAasMappingStateSchema.optional(),
  relationshipNote: z.string().nullish(),
  acceptanceCriteria: z.array(z.string().min(1)).default([]),
  testNotes: z.array(z.string().min(1)).default([]),
  draftRecord: artifactCandidateDraftRecordSchema.partial().optional()
});

export const artifactAiFileInterpretationSchema = z.object({
  fileName: z.string().min(1),
  sourceType: artifactSourceTypeSchema,
  confidence: extractionConfidenceSchema,
  rationale: z.string().min(1),
  sectionDecisions: z.array(artifactAiSectionDecisionSchema).default([]),
  candidates: z.array(artifactAiCandidateInterpretationSchema).default([]),
  leftoverSectionIds: z.array(z.string().min(1)).default([])
});

export const artifactAiSessionInterpretationSchema = z.object({
  files: z.array(artifactAiFileInterpretationSchema)
});

export type ArtifactIntakeFileRecord = z.infer<typeof artifactIntakeFileRecordSchema>;
export type ArtifactIntakeSessionRecord = z.infer<typeof artifactIntakeSessionRecordSchema>;
export type ArtifactIntakeUploadRequest = z.infer<typeof artifactIntakeUploadRequestSchema>;
export type ArtifactIntakeProcessingMode = z.infer<typeof artifactIntakeProcessingModeSchema>;
export type ArtifactIntakeRejectedFile = z.infer<typeof artifactIntakeRejectedFileSchema>;
export type ArtifactSourceClassification = z.infer<typeof artifactSourceClassificationSchema>;
export type ArtifactParsedSection = z.infer<typeof artifactParsedSectionSchema>;
export type ArtifactParseResult = z.infer<typeof artifactParseResultSchema>;
export type ArtifactAasCandidate = z.infer<typeof artifactAasCandidateSchema>;
export type ArtifactCarryForwardCategory = z.infer<typeof artifactCarryForwardCategorySchema>;
export type ArtifactCarryForwardUse = z.infer<typeof artifactCarryForwardUseSchema>;
export type ArtifactCarryForwardItem = z.infer<typeof artifactCarryForwardItemSchema>;
export type ArtifactMappingResult = z.infer<typeof artifactMappingResultSchema>;
export type ArtifactCandidateHumanDecision = z.infer<typeof artifactCandidateHumanDecisionSchema>;
export type ArtifactCandidateDraftRecord = z.infer<typeof artifactCandidateDraftRecordSchema>;
export type ArtifactComplianceFinding = z.infer<typeof artifactComplianceFindingSchema>;
export type ArtifactComplianceResult = z.infer<typeof artifactComplianceResultSchema>;
export type ArtifactIssueDisposition = z.infer<typeof artifactIssueDispositionSchema>;
export type ArtifactIssueDispositionMap = z.infer<typeof artifactIssueDispositionMapSchema>;
export type ArtifactIssueProgress = z.infer<typeof artifactIssueProgressSchema>;
export type ArtifactCandidateRecord = z.infer<typeof artifactCandidateRecordSchema>;
export type ArtifactCandidateReviewActionInput = z.infer<typeof artifactCandidateReviewActionInputSchema>;
export type ArtifactFileSectionDispositionActionInput = z.infer<typeof artifactFileSectionDispositionActionInputSchema>;
export type ArtifactCandidatePromotionResult = z.infer<typeof artifactCandidatePromotionResultSchema>;
export type ArtifactAiSectionDecision = z.infer<typeof artifactAiSectionDecisionSchema>;
export type ArtifactAiCandidateInterpretation = z.infer<typeof artifactAiCandidateInterpretationSchema>;
export type ArtifactAiFileInterpretation = z.infer<typeof artifactAiFileInterpretationSchema>;
export type ArtifactAiSessionInterpretation = z.infer<typeof artifactAiSessionInterpretationSchema>;

export function getArtifactFileExtension(fileName: string) {
  const normalized = fileName.trim().toLowerCase();

  for (const extension of supportedArtifactExtensions) {
    if (normalized.endsWith(extension)) {
      return extension;
    }
  }

  return "";
}

export function isSupportedArtifactFile(fileName: string) {
  return getArtifactFileExtension(fileName).length > 0;
}

type MarkdownSection = {
  sectionId: string;
  title: string;
  marker: string;
  lineStart: number;
  lineEnd: number;
  text: string;
};

function normalizeMarkdownForParsing(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/&#x20;/gi, " ")
    .split("\n")
    .map((line) => line.replace(/^(\s*)\\(?=(#{1,6}\s|[-*]\s|>\s|\d+\.\s))/, "$1"))
    .join("\n");
}

function normalizeText(value: string) {
  return normalizeMarkdownForParsing(value).trim();
}

type JsonArtifactRecord = Record<string, unknown>;

function tryParseJsonArtifactDocument(content: string) {
  const trimmed = content.trim().replace(/^\uFEFF/, "");

  if (!trimmed.startsWith("{")) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as JsonArtifactRecord) : null;
  } catch {
    return null;
  }
}

function getJsonObjectArray(document: JsonArtifactRecord, key: string) {
  const value = document[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is JsonArtifactRecord => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry));
}

function getJsonString(record: JsonArtifactRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function getJsonNumber(record: JsonArtifactRecord, key: string) {
  const value = record[key];
  return typeof value === "number" ? value : null;
}

function getJsonStringArray(record: JsonArtifactRecord, key: string) {
  const value = record[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getJsonObject(record: JsonArtifactRecord, key: string) {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonArtifactRecord) : null;
}

function getJsonStringFromKeys(record: JsonArtifactRecord | null | undefined, keys: string[]) {
  if (!record) {
    return "";
  }

  for (const key of keys) {
    const value = getJsonString(record, key);

    if (value) {
      return value;
    }
  }

  return "";
}

function getJsonStringArrayFromKeys(record: JsonArtifactRecord | null | undefined, keys: string[]) {
  if (!record) {
    return [];
  }

  for (const key of keys) {
    const values = getJsonStringArray(record, key);

    if (values.length > 0) {
      return values;
    }
  }

  return [];
}

function stringifyJsonScalar(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function getJsonDisplayValue(record: JsonArtifactRecord | null | undefined, key: string) {
  if (!record) {
    return "";
  }

  const value = record[key];

  if (Array.isArray(value)) {
    const scalarValues = value.map((entry) => stringifyJsonScalar(entry)).filter(Boolean);
    return scalarValues.length > 0 ? scalarValues.join(" | ") : "";
  }

  if (value && typeof value === "object") {
    return Object.entries(value as JsonArtifactRecord)
      .map(([entryKey, entryValue]) => {
        const scalarValue = stringifyJsonScalar(entryValue);
        return scalarValue ? `${entryKey}: ${scalarValue}` : "";
      })
      .filter(Boolean)
      .join(" | ");
  }

  return stringifyJsonScalar(value);
}

function buildJsonBulletLines(label: string, values: string[]) {
  const normalizedValues = values.map((value) => value.trim()).filter(Boolean);

  if (normalizedValues.length === 0) {
    return [];
  }

  return [label, ...normalizedValues.map((value) => `- ${value}`)];
}

function joinTaggedValues(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean).join(" | ");
}

function findApproximateLineNumber(content: string, needle: string, fallback: number) {
  const normalizedLines = normalizeMarkdownForParsing(content).split("\n");
  const normalizedNeedle = needle.trim();

  if (!normalizedNeedle) {
    return fallback;
  }

  const index = normalizedLines.findIndex((line) => line.includes(normalizedNeedle));
  return index >= 0 ? index + 1 : fallback;
}

function buildJsonSection(input: {
  fileId: string;
  fileName: string;
  content: string;
  sectionId: string;
  title: string;
  marker: string;
  anchorNeedle: string;
  bodyLines: string[];
}) {
  const text = input.bodyLines.filter(Boolean).join("\n").trim();
  const lineStart = findApproximateLineNumber(input.content, input.anchorNeedle, 1);
  const lineEnd = Math.max(lineStart, lineStart + Math.max(text.split("\n").length - 1, 0));

  return {
    sectionId: input.sectionId,
    title: input.title,
    marker: input.marker,
    lineStart,
    lineEnd,
    text
  };
}

function splitMarkdownSections(content: string) {
  const lines = normalizeMarkdownForParsing(content).split("\n");
  const sections: MarkdownSection[] = [];
  let currentTitle = "Document introduction";
  let currentMarker = "intro";
  let currentStart = 1;
  let buffer: string[] = [];
  let counter = 0;

  const pushSection = (lineEnd: number) => {
    const text = normalizeText(buffer.join("\n"));

    if (!text) {
      return;
    }

    sections.push({
      sectionId: `section-${counter}`,
      title: currentTitle,
      marker: currentMarker,
      lineStart: currentStart,
      lineEnd,
      text
    });

    counter += 1;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*$/);

    if (headingMatch) {
      pushSection(index === 0 ? 1 : index);
      currentTitle = headingMatch[2]?.trim() ?? "Untitled section";
      currentMarker = `${headingMatch[1]} ${currentTitle}`;
      currentStart = index + 1;
      buffer = [line];
      continue;
    }

    buffer.push(line);
  }

  pushSection(lines.length);

  return sections.length > 0
    ? sections
    : [
        {
          sectionId: "section-0",
          title: "Document introduction",
          marker: "intro",
          lineStart: 1,
          lineEnd: Math.max(lines.length, 1),
          text: normalizeText(content)
        }
      ];
}

function normalizeHeading(value: string) {
  return value.trim().toLowerCase();
}

function detectStructuredJsonArtifactType(document: JsonArtifactRecord) {
  const outcomes = getJsonObjectArray(document, "outcomes");
  const epics = getJsonObjectArray(document, "epics");
  const stories = getJsonObjectArray(document, "stories");
  const documentType = getJsonString(document, "document_type").toLowerCase();
  const hasNestedStoryIdeas = epics.some((epic) => getJsonObjectArray(epic, "story_ideas").length > 0);

  if (
    documentType === "aas framing import package" ||
    (getJsonObject(document, "aas_context") &&
      getJsonObject(document, "problem_statement") &&
      outcomes.length > 0 &&
      epics.length > 0 &&
      hasNestedStoryIdeas)
  ) {
    return {
      sourceType: "mixed_markdown_bundle" as const,
      confidence: "high" as const,
      rationale: "Detected an AAS Framing Import Package with Outcome, Epic, Story Idea, governance, and risk records."
    };
  }

  if (outcomes.length > 0 && (epics.length > 0 || stories.length > 0)) {
    return {
      sourceType: "mixed_markdown_bundle" as const,
      confidence: "high" as const,
      rationale: "Detected a structured artifact package with linked Outcome, Epic, and Story records."
    };
  }

  if (stories.length > 0) {
    return {
      sourceType: "story_file" as const,
      confidence: "high" as const,
      rationale: "Detected a structured artifact package dominated by Story records."
    };
  }

  if (epics.length > 0) {
    return {
      sourceType: "epic_file" as const,
      confidence: "high" as const,
      rationale: "Detected a structured artifact package dominated by Epic records."
    };
  }

  if (outcomes.length > 0) {
    return {
      sourceType: "bmad_prd" as const,
      confidence: "high" as const,
      rationale: "Detected a structured artifact package with Outcome framing data."
    };
  }

  return null;
}

function isStructuredStorySpecArtifact(input: {
  fileName: string;
  content: string;
  sections?: Array<{ title: string }>;
}) {
  const normalizedFileName = input.fileName.toLowerCase();
  const normalizedContent = normalizeText(input.content).toLowerCase();
  const headings = new Set((input.sections ?? []).map((section) => normalizeHeading(section.title)));
  const hasStoryIdentity =
    /(^|[\\/])m\d+-story-\d+/.test(normalizedFileName) ||
    /#\s*m\d+-story-\d+/.test(normalizedContent) ||
    headings.has("story type");
  const requiredHeadings = [
    "title",
    "summary",
    "acceptance criteria",
    "test definition",
    "definition of done"
  ];

  return hasStoryIdentity && requiredHeadings.every((heading) => headings.has(heading));
}

function confidenceFromSignals(strongSignals: number, mediumSignals: number) {
  if (strongSignals > 0) {
    return "high" as const;
  }

  if (mediumSignals > 0) {
    return "medium" as const;
  }

  return "low" as const;
}

const artifactPersistenceReplacements: Array<[RegExp, string]> = [
  [/[→⇒➜➔➝]/g, "->"],
  [/[←⇐]/g, "<-"],
  [/[“”„‟]/g, "\""],
  [/[‘’‚‛]/g, "'"],
  [/[–—−]/g, "-"],
  [/…/g, "..."],
  [/[•◦▪]/g, "-"],
  [/\u00A0/g, " "]
];

export function sanitizeArtifactPersistenceText(value: string) {
  const normalized = value.normalize("NFKC");
  const replaced = artifactPersistenceReplacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    normalized
  );

  return Array.from(replaced, (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 0xff ? character : "?";
  }).join("");
}

export function sanitizeArtifactPersistenceValue<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeArtifactPersistenceText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeArtifactPersistenceValue(entry)) as T;
  }

  if (value instanceof Date || value === null || value === undefined) {
    return value;
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeArtifactPersistenceValue(entry)])
    ) as T;
  }

  return value;
}

function summarizeText(text: string, maxLength = 180) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3)}...` : normalized;
}

export function classifyArtifactSource(fileName: string, content: string): ArtifactSourceClassification {
  const normalizedFileName = fileName.toLowerCase();
  const normalized = normalizeText(content).toLowerCase();
  const jsonDocument = tryParseJsonArtifactDocument(content);

  if (jsonDocument) {
    const jsonClassification = detectStructuredJsonArtifactType(jsonDocument);

    if (jsonClassification) {
      return jsonClassification;
    }
  }

  const sections = splitMarkdownSections(content);

  if (isStructuredStorySpecArtifact({ fileName, content, sections })) {
    return {
      sourceType: "story_file",
      confidence: "high",
      rationale: "Detected a structured story specification with dedicated story headings and delivery fields."
    };
  }

  const hasStorySignals =
    /story[-\s]id|acceptance criteria|definition of done|test definition|as a .* i want .* so that/.test(normalized);
  const hasEpicSignals = /\bepic\b|epic file|epic workspace|epic title/.test(normalized);
  const hasOutcomeSignals = /\boutcome\b|goal|objective|problem statement|outcome statement|baseline/.test(normalized);
  const hasBmadSignals = /value intent|scope in|scope out|required evidence|story pack|product requirements/.test(normalized);

  if (normalized.includes("product requirements") || normalizedFileName.includes("prd") || (hasBmadSignals && hasOutcomeSignals)) {
    return {
      sourceType: "bmad_prd",
      confidence: "high",
      rationale: "Detected PRD or BMAD-style planning signals with outcome-oriented structure."
    };
  }

  if ((hasEpicSignals && hasStorySignals) || (hasOutcomeSignals && hasStorySignals)) {
    return {
      sourceType: "mixed_markdown_bundle",
      confidence: "medium",
      rationale: "Detected multiple artifact patterns in the same markdown bundle."
    };
  }

  if (hasStorySignals) {
    return {
      sourceType: "story_file",
      confidence: hasEpicSignals ? "medium" : "high",
      rationale: "Detected story-oriented structure such as acceptance criteria or test definition language."
    };
  }

  if (hasEpicSignals) {
    return {
      sourceType: "epic_file",
      confidence: "medium",
      rationale: "Detected epic-oriented headings or language without enough story detail to classify as a story file."
    };
  }

  return {
    sourceType: "unknown_artifact",
    confidence: "low",
    rationale: "The markdown did not clearly match a supported artifact pattern."
  };
}

function isAasFramingImportPackage(document: JsonArtifactRecord) {
  const documentType = getJsonString(document, "document_type").toLowerCase();

  if (documentType === "aas framing import package") {
    return true;
  }

  const aasContext = getJsonObject(document, "aas_context");

  return Boolean(
    aasContext &&
      getJsonString(aasContext, "phase").toLowerCase() === "framing" &&
      getJsonObject(document, "problem_statement") &&
      getJsonObjectArray(document, "outcomes").length > 0 &&
      getJsonObjectArray(document, "epics").some((epic) => getJsonObjectArray(epic, "story_ideas").length > 0)
  );
}

function parseAasFramingJsonArtifact(
  fileId: string,
  fileName: string,
  content: string,
  document: JsonArtifactRecord,
  classification: ArtifactSourceClassification
): ArtifactParseResult {
  const sections: ArtifactParseResult["sections"] = [];
  const aasContext = getJsonObject(document, "aas_context");
  const problemStatement = getJsonObject(document, "problem_statement");
  const scope = getJsonObject(document, "scope");
  const configurationDefaults = getJsonObject(document, "configuration_defaults");
  const dataModelCandidates = getJsonObject(document, "data_model_candidates");
  const referenceData = getJsonObject(document, "simplified_reference_data");
  const tollgateReadiness = getJsonObject(document, "tollgate_1_readiness");
  const outcomes = getJsonObjectArray(document, "outcomes");
  const epics = getJsonObjectArray(document, "epics");
  const journeyContexts = getJsonObjectArray(document, "journey_contexts");
  const aiRiskLedger = getJsonObjectArray(document, "initial_ai_risk_ledger");
  const defaultOutcomeId = getJsonStringFromKeys(outcomes[0], ["id", "outcome_id"]);
  const baselineSourceSummary = problemStatement
    ? getJsonObjectArray(problemStatement, "baseline_sources")
        .map((source) => joinTaggedValues([getJsonString(source, "name"), getJsonString(source, "format")]))
        .filter(Boolean)
    : [];

  const packageSection = buildJsonSection({
    fileId,
    fileName,
    content,
    sectionId: "json-aas-framing-package",
    title: getJsonString(document, "product_name") || "AAS Framing Import Package",
    marker: "AAS Framing Import Package",
    anchorNeedle: "\"document_type\"",
    bodyLines: [
      `Package Type: ${getJsonString(document, "document_type") || "AAS Framing Import Package"}`,
      `Product: ${getJsonString(document, "product_name") || fileName}`,
      `Version: ${getJsonString(document, "version") || "Not set"}`,
      `Language: ${getJsonString(document, "language") || "Not set"}`,
      aasContext ? `Phase: ${getJsonString(aasContext, "phase") || "Not set"}` : "",
      aasContext ? `Target Next Phase: ${getJsonString(aasContext, "target_next_phase") || "Not set"}` : "",
      aasContext ? `Domain: ${getJsonString(aasContext, "domain") || "Not set"}` : "",
      aasContext ? `AI Acceleration Level: ${String(getJsonNumber(aasContext, "ai_acceleration_level") ?? "Not set")}` : "",
      aasContext ? `Risk Profile: ${getJsonString(aasContext, "risk_profile") || "Not set"}` : "",
      aasContext ? `Human Mandate: ${getJsonString(aasContext, "human_mandate") || "Not set"}` : ""
    ]
  });
  sections.push(createParsedSection(fileId, fileName, packageSection, "problem_goal", "high"));

  if (problemStatement) {
    const baselineSources = getJsonObjectArray(problemStatement, "baseline_sources")
      .map((source) => {
        const sourceName = getJsonString(source, "name");
        const sourceFormat = getJsonString(source, "format");
        const sourceDescription = getJsonString(source, "description");
        return joinTaggedValues([sourceName, sourceFormat, sourceDescription]);
      })
      .filter(Boolean);
    const problemSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-problem-statement",
      title: "Problem statement",
      marker: "problem_statement",
      anchorNeedle: "\"problem_statement\"",
      bodyLines: [
        `Problem Statement ID: ${getJsonString(problemStatement, "id") || "Not set"}`,
        `Problem Statement: ${getJsonString(problemStatement, "text") || "Not set"}`,
        `Baseline: ${getJsonString(problemStatement, "current_baseline") || "Not set"}`,
        ...buildJsonBulletLines("Impact Areas", getJsonStringArray(problemStatement, "impact_areas")),
        ...buildJsonBulletLines("Baseline Sources", baselineSources)
      ]
    });
    sections.push(createParsedSection(fileId, fileName, problemSection, "problem_goal", "high"));
  }

  for (const [index, outcome] of outcomes.entries()) {
    const outcomeId = getJsonStringFromKeys(outcome, ["id", "outcome_id"]) || `O-${index + 1}`;
    const outcomeSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: `json-outcome-${index}`,
      title: getJsonString(outcome, "title") || `Outcome ${outcomeId}`,
      marker: `outcomes[${index}]`,
      anchorNeedle: outcomeId,
      bodyLines: [
        `Outcome ID: ${outcomeId}`,
        `Title: ${getJsonString(outcome, "title") || `Outcome ${outcomeId}`}`,
        `Outcome Statement: ${getJsonString(outcome, "statement") || "Not set"}`,
        `Baseline Definition: ${getJsonDisplayValue(outcome, "baseline") || "Not set"}`,
        `Baseline Source: ${joinTaggedValues(baselineSourceSummary) || "Not set"}`,
        `Measurement Method: ${joinTaggedValues(getJsonStringArrayFromKeys(outcome, ["measurement_method", "measurement_candidates"])) || "Not set"}`,
        configurationDefaults ? `Timeframe: ${getJsonDisplayValue(configurationDefaults, "forecast_horizon_months") || "Not set"}` : "",
        ...buildJsonBulletLines("Target Effects", getJsonStringArray(outcome, "target_effects"))
      ]
    });
    sections.push(createParsedSection(fileId, fileName, outcomeSection, "outcome_candidate", "high"));
  }

  for (const [index, epic] of epics.entries()) {
    const epicId = getJsonStringFromKeys(epic, ["id", "epic_id"]) || `E-${index + 1}`;
    const outcomeId = getJsonStringFromKeys(epic, ["outcome_id", "outcomeId"]) || defaultOutcomeId;
    const scopeIn = getJsonStringArrayFromKeys(epic, ["scope_in", "mvp_in_scope"]);
    const scopeOut = getJsonStringArrayFromKeys(epic, ["scope_out", "mvp_out_of_scope"]);
    const scopeText = getJsonString(epic, "scope");
    const epicSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: `json-epic-${index}`,
      title: getJsonString(epic, "title") || `Epic ${epicId}`,
      marker: `epics[${index}]`,
      anchorNeedle: epicId,
      bodyLines: [
        `Epic ID: ${epicId}`,
        `Title: ${getJsonString(epic, "title") || `Epic ${epicId}`}`,
        `Purpose: ${getJsonString(epic, "purpose") || "Not set"}`,
        `Outcome ID: ${outcomeId || "Not set"}`,
        `Outcome Link: ${outcomeId || "Not set"}`,
        `Scope In: ${scopeText || joinTaggedValues(scopeIn) || "Not set"}`,
        `Scope Out: ${joinTaggedValues(scopeOut) || "Not set"}`,
        `Risk Note: ${getJsonString(epic, "risk_note") || "Not set"}`
      ]
    });
    sections.push(createParsedSection(fileId, fileName, epicSection, "epic_candidate", "high"));

    for (const [storyIndex, story] of getJsonObjectArray(epic, "story_ideas").entries()) {
      const storyId = getJsonStringFromKeys(story, ["id", "story_id"]) || `${epicId}-SI${storyIndex + 1}`;
      const storyTitle = getJsonString(story, "title") || `Story Idea ${storyId}`;
      const storySection = buildJsonSection({
        fileId,
        fileName,
        content,
        sectionId: `json-epic-${index}-story-${storyIndex}`,
        title: storyTitle,
        marker: `epics[${index}].story_ideas[${storyIndex}]`,
        anchorNeedle: storyId,
        bodyLines: [
          `Story ID: ${storyId}`,
          `Title: ${storyTitle}`,
          "Story Type: Feature",
          `Value Intent: ${getJsonString(story, "value_intent") || "Not set"}`,
          `Expected Behavior: ${getJsonString(story, "expected_behavior") || "Not set"}`,
          `AI Usage Scope: ${joinTaggedValues(getJsonStringArray(story, "ai_usage_scope")) || "Not set"}`,
          `AI Acceleration Level: ${String(getJsonNumber(story, "ai_acceleration_level") ?? "Not set")}`,
          `Outcome ID: ${outcomeId || "Not set"}`,
          `Outcome Link: ${outcomeId || "Not set"}`,
          `Epic ID: ${epicId}`,
          `Epic Link: ${epicId}`,
          ...buildJsonBulletLines("Candidate Test Ideas", getJsonStringArray(story, "candidate_test_ideas"))
        ]
      });
      sections.push(createParsedSection(fileId, fileName, storySection, "story_candidate", "high"));
    }
  }

  if (scope) {
    const scopeSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-scope-constraints",
      title: "Additional requirements - MVP scope",
      marker: "scope",
      anchorNeedle: "\"scope\"",
      bodyLines: [
        ...buildJsonBulletLines("MVP In Scope", getJsonStringArray(scope, "mvp_in_scope")),
        ...buildJsonBulletLines("MVP Out Of Scope", getJsonStringArray(scope, "mvp_out_of_scope"))
      ]
    });
    sections.push(createParsedSection(fileId, fileName, scopeSection, "architecture_notes", "high"));
  }

  if (configurationDefaults) {
    const thresholdLines = getJsonObjectArray(configurationDefaults, "team_status_thresholds").map((threshold) =>
      joinTaggedValues([
        getJsonString(threshold, "status"),
        getJsonString(threshold, "range"),
        getJsonString(threshold, "color")
      ])
    );
    const flagLines = getJsonObjectArray(configurationDefaults, "flag_levels").map((flag) =>
      joinTaggedValues([getJsonString(flag, "id"), getJsonString(flag, "label"), getJsonString(flag, "icon")])
    );
    const configurationSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-configuration-constraints",
      title: "Configuration and planning constraints",
      marker: "configuration_defaults",
      anchorNeedle: "\"configuration_defaults\"",
      bodyLines: [
        `Planning Unit: ${getJsonString(configurationDefaults, "planning_unit") || "Not set"}`,
        `Calculation Granularity: ${getJsonString(configurationDefaults, "calculation_granularity") || "Not set"}`,
        `Reporting Granularity: ${getJsonString(configurationDefaults, "reporting_granularity") || "Not set"}`,
        `Forecast Horizon: ${getJsonDisplayValue(configurationDefaults, "forecast_horizon_months") || "Not set"}`,
        ...buildJsonBulletLines("Team Status Thresholds", thresholdLines),
        ...buildJsonBulletLines("Flag Levels", flagLines)
      ]
    });
    sections.push(createParsedSection(fileId, fileName, configurationSection, "architecture_notes", "high"));
  }

  if (dataModelCandidates) {
    const dataModelLines = Object.entries(dataModelCandidates).map(([entity, fields]) =>
      `${entity}: ${Array.isArray(fields) ? fields.map((field) => stringifyJsonScalar(field)).filter(Boolean).join(", ") : stringifyJsonScalar(fields)}`
    );
    const dataModelSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-data-model-constraints",
      title: "Data model constraints",
      marker: "data_model_candidates",
      anchorNeedle: "\"data_model_candidates\"",
      bodyLines: buildJsonBulletLines("Data Model Candidates", dataModelLines)
    });
    sections.push(createParsedSection(fileId, fileName, dataModelSection, "architecture_notes", "high"));
  }

  if (referenceData) {
    const referenceLines = Object.entries(referenceData).map(([key, value]) =>
      `${key}: ${Array.isArray(value) ? value.length : stringifyJsonScalar(value)} item(s)`
    );
    const referenceSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-reference-data",
      title: "Reference data constraints",
      marker: "simplified_reference_data",
      anchorNeedle: "\"simplified_reference_data\"",
      bodyLines: buildJsonBulletLines("Reference Data", referenceLines)
    });
    sections.push(createParsedSection(fileId, fileName, referenceSection, "architecture_notes", "medium"));
  }

  if (journeyContexts.length > 0) {
    const journeyLines = journeyContexts.map((journey) =>
      joinTaggedValues([
        getJsonString(journey, "id"),
        getJsonString(journey, "title"),
        getJsonString(journey, "primary_actor"),
        getJsonString(journey, "downstream_traceability")
      ])
    );
    const journeySection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-journey-contexts",
      title: "Journey context design input",
      marker: "journey_contexts",
      anchorNeedle: "\"journey_contexts\"",
      bodyLines: buildJsonBulletLines("Journey Contexts", journeyLines)
    });
    sections.push(createParsedSection(fileId, fileName, journeySection, "architecture_notes", "medium"));
  }

  if (aasContext || aiRiskLedger.length > 0 || tollgateReadiness) {
    const governanceRequirements = aasContext ? getJsonStringArray(aasContext, "governance_requirements") : [];
    const riskLines = aiRiskLedger.map((risk) =>
      joinTaggedValues([
        getJsonString(risk, "id"),
        getJsonString(risk, "risk"),
        getJsonString(risk, "mitigation"),
        getJsonString(risk, "owner_role"),
        getJsonString(risk, "status")
      ])
    );
    const remainingDecisionLines = tollgateReadiness ? getJsonStringArray(tollgateReadiness, "remaining_decisions") : [];
    const governanceSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-governance-risk-constraints",
      title: "AI governance and risk constraints",
      marker: "aas_context.initial_ai_risk_ledger",
      anchorNeedle: "\"initial_ai_risk_ledger\"",
      bodyLines: [
        aasContext ? `Human Mandate: ${getJsonString(aasContext, "human_mandate") || "Not set"}` : "",
        ...buildJsonBulletLines("Governance Requirements", governanceRequirements),
        ...buildJsonBulletLines("AI Risk Ledger", riskLines),
        ...buildJsonBulletLines("Remaining Tollgate Decisions", remainingDecisionLines)
      ]
    });
    sections.push(createParsedSection(fileId, fileName, governanceSection, "architecture_notes", "high"));
  }

  return {
    classification,
    sections
  };
}

function parseStructuredJsonArtifact(
  fileId: string,
  fileName: string,
  content: string,
  document: JsonArtifactRecord
): ArtifactParseResult | null {
  const classification = detectStructuredJsonArtifactType(document);

  if (!classification) {
    return null;
  }

  if (isAasFramingImportPackage(document)) {
    return parseAasFramingJsonArtifact(fileId, fileName, content, document, classification);
  }

  const sections: ArtifactParseResult["sections"] = [];
  const metadata = getJsonObject(document, "metadata");
  const governance = getJsonObject(document, "governance");
  const riskProfile = getJsonObject(document, "risk_profile");
  const phases = getJsonObjectArray(document, "phases");
  const tollgates = getJsonObjectArray(document, "tollgates");
  const outcomes = getJsonObjectArray(document, "outcomes");
  const epics = getJsonObjectArray(document, "epics");
  const stories = getJsonObjectArray(document, "stories");

  if (metadata) {
    const metadataSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-metadata",
      title: "Metadata",
      marker: "metadata",
      anchorNeedle: "\"metadata\"",
      bodyLines: [
        "Metadata",
        `Package: ${getJsonString(metadata, "package_name") || getJsonString(metadata, "system_name") || fileName}`,
        `Language: ${getJsonString(metadata, "language") || "Not set"}`,
        `AI Acceleration Level: ${String(getJsonNumber(metadata, "ai_acceleration_level") ?? "Not set")}`,
        `Status: ${getJsonString(metadata, "status") || "Not set"}`
      ]
    });
    sections.push(createParsedSection(fileId, fileName, metadataSection, "problem_goal", "medium"));
  }

  if (governance || riskProfile || phases.length > 0 || tollgates.length > 0) {
    const governanceSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: "json-governance-context",
      title: "Governance and delivery context",
      marker: "governance",
      anchorNeedle: "\"governance\"",
      bodyLines: [
        "Governance and delivery context",
        governance ? `Governance roles: ${Object.keys(governance).join(", ")}` : "",
        riskProfile ? `Risk profile: ${joinTaggedValues(Object.entries(riskProfile).map(([key, value]) => `${key}=${String(value)}`))}` : "",
        phases.length > 0 ? `Phases: ${joinTaggedValues(phases.map((phase) => getJsonString(phase, "phase_name")).filter(Boolean))}` : "",
        tollgates.length > 0 ? `Tollgates: ${joinTaggedValues(tollgates.map((tollgate) => getJsonString(tollgate, "name")).filter(Boolean))}` : ""
      ]
    });
    sections.push(createParsedSection(fileId, fileName, governanceSection, "architecture_notes", "medium"));
  }

  for (const [index, outcome] of outcomes.entries()) {
    const outcomeId = getJsonString(outcome, "outcome_id") || `O-${index + 1}`;
    const baseline = getJsonObject(outcome, "baseline");
    const targets = getJsonObject(outcome, "targets");
    const outcomeSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: `json-outcome-${index}`,
      title: getJsonString(outcome, "title") || `Outcome ${outcomeId}`,
      marker: `outcomes[${index}]`,
      anchorNeedle: outcomeId,
      bodyLines: [
        `Outcome ID: ${outcomeId}`,
        `Title: ${getJsonString(outcome, "title") || `Outcome ${outcomeId}`}`,
        `Outcome Statement: ${getJsonString(outcome, "statement") || "Not set"}`,
        baseline ? `Baseline Definition: ${joinTaggedValues(Object.entries(baseline).map(([key, value]) => `${key}=${String(value)}`))}` : "",
        targets ? `Target Definition: ${joinTaggedValues(Object.entries(targets).map(([key, value]) => `${key}=${String(value)}`))}` : "",
        `Measurement Method: ${joinTaggedValues(getJsonStringArray(outcome, "measurement_method"))}`,
        `Timeframe: ${String(getJsonNumber(outcome, "timebox_months") ?? "Not set")} months`,
        `Owner Role ID: ${getJsonString(outcome, "owner_role_id") || "Not set"}`
      ]
    });
    sections.push(createParsedSection(fileId, fileName, outcomeSection, "outcome_candidate", "high"));
  }

  for (const [index, epic] of epics.entries()) {
    const epicId = getJsonString(epic, "epic_id") || `E-${index + 1}`;
    const epicSection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: `json-epic-${index}`,
      title: getJsonString(epic, "title") || `Epic ${epicId}`,
      marker: `epics[${index}]`,
      anchorNeedle: epicId,
      bodyLines: [
        `Epic ID: ${epicId}`,
        `Title: ${getJsonString(epic, "title") || `Epic ${epicId}`}`,
        `Purpose: ${getJsonString(epic, "purpose") || "Not set"}`,
        `Outcome ID: ${getJsonString(epic, "outcome_id") || "Not set"}`,
        `Scope In: ${joinTaggedValues(getJsonStringArray(epic, "scope_in"))}`,
        `Scope Out: ${joinTaggedValues(getJsonStringArray(epic, "scope_out"))}`,
        `Risk Note: ${getJsonString(epic, "risk_note") || "Not set"}`
      ]
    });
    sections.push(createParsedSection(fileId, fileName, epicSection, "epic_candidate", "high"));
  }

  for (const [index, story] of stories.entries()) {
    const storyId = getJsonString(story, "story_id") || `S-${index + 1}`;
    const storyTitle = getJsonString(story, "title") || `Story ${storyId}`;
    const definitionOfDone = getJsonStringArray(story, "definition_of_done");
    const storySection = buildJsonSection({
      fileId,
      fileName,
      content,
      sectionId: `json-story-${index}`,
      title: storyTitle,
      marker: `stories[${index}]`,
      anchorNeedle: storyId,
      bodyLines: [
        `Story ID: ${storyId}`,
        `Title: ${storyTitle}`,
        `Story Type: ${getJsonString(story, "story_type") || "Feature"}`,
        `Value Intent: ${getJsonString(story, "value_intent") || "Not set"}`,
        `AI Usage Scope: ${joinTaggedValues(getJsonStringArray(story, "ai_usage_scope"))}`,
        `AI Acceleration Level: ${String(getJsonNumber(story, "ai_acceleration_level") ?? "Not set")}`,
        `Outcome ID: ${getJsonString(story, "outcome_id") || "Not set"}`,
        `Epic ID: ${getJsonString(story, "epic_id") || "Not set"}`,
        `Definition of Done: ${joinTaggedValues(definitionOfDone)}`
      ]
    });
    sections.push(createParsedSection(fileId, fileName, storySection, "story_candidate", "high"));

    const acceptanceCriteria = getJsonStringArray(story, "acceptance_criteria");
    if (acceptanceCriteria.length > 0) {
      const acceptanceSection = buildJsonSection({
        fileId,
        fileName,
        content,
        sectionId: `json-story-${index}-acceptance`,
        title: `${storyTitle} acceptance criteria`,
        marker: `stories[${index}].acceptance_criteria`,
        anchorNeedle: "\"acceptance_criteria\"",
        bodyLines: [
          "Acceptance Criteria",
          ...acceptanceCriteria.map((criterion) => `- ${criterion}`)
        ]
      });
      sections.push(createParsedSection(fileId, fileName, acceptanceSection, "acceptance_criteria", "high"));
    }

    const testDefinition = getJsonObject(story, "test_definition");
    const testDefinitionLines = testDefinition
      ? Object.entries(testDefinition).map(([key, value]) => `- ${key}: ${String(value)}`)
      : [];

    if (testDefinitionLines.length > 0 || getJsonString(story, "test_id")) {
      const testSection = buildJsonSection({
        fileId,
        fileName,
        content,
        sectionId: `json-story-${index}-test`,
        title: `${storyTitle} test definition`,
        marker: `stories[${index}].test_definition`,
        anchorNeedle: "\"test_definition\"",
        bodyLines: [
          `Test ID: ${getJsonString(story, "test_id") || "Not set"}`,
          "Test Definition",
          ...testDefinitionLines
        ]
      });
      sections.push(createParsedSection(fileId, fileName, testSection, "test_notes", "high"));
    }
  }

  return {
    classification,
    sections
  };
}

function createParsedSection(
  fileId: string,
  fileName: string,
  section: MarkdownSection,
  kind: ArtifactParsedSection["kind"],
  confidence: ArtifactParsedSection["confidence"]
): ArtifactParsedSection {
  return {
    id: `${section.sectionId}-${kind}`,
    kind,
    title: section.title,
    text: section.text,
    confidence,
    isUncertain: confidence === "low",
    sourceReference: {
      fileId,
      fileName,
      sectionId: section.sectionId,
      sectionTitle: section.title,
      sectionMarker: section.marker,
      lineStart: section.lineStart,
      lineEnd: section.lineEnd
    }
  };
}

export function parseMarkdownArtifact(fileId: string, fileName: string, content: string): ArtifactParseResult {
  const jsonDocument = tryParseJsonArtifactDocument(content);
  const structuredJsonResult = jsonDocument ? parseStructuredJsonArtifact(fileId, fileName, content, jsonDocument) : null;

  if (structuredJsonResult) {
    return structuredJsonResult;
  }

  const classification = classifyArtifactSource(fileName, content);
  const sections = splitMarkdownSections(content);
  const parsedSections: ArtifactParsedSection[] = [];
  const structuredStorySpec = isStructuredStorySpecArtifact({ fileName, content, sections });

  for (const section of sections) {
    const title = section.title.toLowerCase();
    const text = section.text.toLowerCase();
    const trimmedSectionTitle = section.title.trim();
    const hasExplicitOutcomeKey =
      Boolean(extractImportedCandidateKey("outcome", section.title)) || /^(?:OUT|OUTCOME)-\d+\b/i.test(trimmedSectionTitle);
    const hasExplicitEpicKey =
      Boolean(extractImportedCandidateKey("epic", section.title)) || /^(?:EPIC|EPC)-\d+\b/i.test(trimmedSectionTitle);
    const hasExplicitStoryKey =
      Boolean(extractImportedCandidateKey("story", section.title)) || /^(?:STORY|SC|STR)-\d+\b/i.test(trimmedSectionTitle);
    const hasExplicitEpicHeading = /^epic\s+\d+\b/i.test(section.title.trim());
    const hasExplicitStoryHeading = /^us\d+(?:\.\d+)+\b/i.test(section.title.trim());
    const hasExplicitOutcomeHeading = /^outcome\b/i.test(section.title.trim());
    const candidates: Array<{ kind: ArtifactParsedSection["kind"]; confidence: ArtifactParsedSection["confidence"] }> = [];

    if (/problem|goal|objective|vision/.test(title) || /problem statement|objective|goal|product vision|vision/.test(text)) {
      candidates.push({
        kind: "problem_goal",
        confidence: confidenceFromSignals(
          /problem|goal|objective|vision/.test(title) ? 1 : 0,
          /problem statement|objective|goal|product vision|vision/.test(text) ? 1 : 0
        )
      });
    }

    if (
      hasExplicitOutcomeKey ||
      hasExplicitOutcomeHeading ||
      /^baseline$/i.test(section.title.trim()) ||
      /outcome/.test(title) ||
      /outcome statement|expected outcome|success metric/.test(text)
    ) {
      candidates.push({
        kind: "outcome_candidate",
        confidence: confidenceFromSignals(
          hasExplicitOutcomeKey || hasExplicitOutcomeHeading || /^baseline$/i.test(section.title.trim()) || /outcome/.test(title) ? 1 : 0,
          /outcome statement|expected outcome|success metric/.test(text) ? 1 : 0
        )
      });
    }

    if (hasExplicitEpicKey || hasExplicitEpicHeading || /epic/.test(title) || /epic key|epic title/.test(text)) {
      candidates.push({
        kind: "epic_candidate",
        confidence: confidenceFromSignals(
          hasExplicitEpicKey || hasExplicitEpicHeading || /epic/.test(title) ? 1 : 0,
          /epic key|epic title/.test(text) ? 1 : 0
        )
      });
    }

    if (
      hasExplicitStoryKey ||
      hasExplicitStoryHeading ||
      /story/.test(title) ||
      /story[-\s]id|as a .* i want .* so that/.test(text) ||
      (structuredStorySpec && /^(title|summary|story type|value intent)$/i.test(section.title))
    ) {
      candidates.push({
        kind: "story_candidate",
        confidence: confidenceFromSignals(
          hasExplicitStoryKey || hasExplicitStoryHeading || /story/.test(title) ? 1 : 0,
          /story[-\s]id|as a .* i want .* so that/.test(text) ? 1 : 0
        )
      });
    }

    if (/acceptance criteria/.test(title) || /^[-*]\s+/.test(section.text) || /\bacceptance criteria\b/.test(text)) {
      candidates.push({
        kind: "acceptance_criteria",
        confidence: confidenceFromSignals(/acceptance criteria/.test(title) ? 1 : 0, /^[-*]\s+/.test(section.text) || /\bacceptance criteria\b/.test(text) ? 1 : 0)
      });
    }

    if (/test|qa|verification/.test(title) || /test definition|test plan|verification|regression/.test(text)) {
      candidates.push({
        kind: "test_notes",
        confidence: confidenceFromSignals(/test|qa|verification/.test(title) ? 1 : 0, /test definition|test plan|verification|regression/.test(text) ? 1 : 0)
      });
    }

    if (/architecture|design|technical/.test(title) || /architecture|design note|technical decision/.test(text)) {
      candidates.push({
        kind: "architecture_notes",
        confidence: confidenceFromSignals(/architecture|design|technical/.test(title) ? 1 : 0, /architecture|design note|technical decision/.test(text) ? 1 : 0)
      });
    }

    if (candidates.length === 0) {
      candidates.push({
        kind: "unmapped",
        confidence: "low"
      });
    }

    for (const candidate of candidates) {
      parsedSections.push(createParsedSection(fileId, fileName, section, candidate.kind, candidate.confidence));
    }
  }

  return {
    classification,
    sections: parsedSections
  };
}

function extractListItems(text: string) {
  return [...new Set(text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean))];
}

function buildArtifactCandidateId(input: {
  fileId: string;
  sectionId: string;
  candidateType: ArtifactAasCandidate["type"];
}) {
  return `mapped-${input.fileId}-${input.sectionId}-${input.candidateType}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeImportedReferenceKey(value: string | null | undefined) {
  const normalized = value?.replace(/[*_`]/g, "").replace(/\s+/g, " ").trim().toUpperCase() ?? "";

  if (!normalized) {
    return null;
  }

  return normalized
    .replace(/^OUTCOME-/, "OUT-")
    .replace(/^EPC-/, "EPIC-")
    .replace(/^STR-/, "STORY-")
    .replace(/^SC-(?=\d)/, "STORY-");
}

function buildImportedReferenceAliases(value: string | null | undefined) {
  const normalized = normalizeImportedReferenceKey(value);

  if (!normalized) {
    return [];
  }

  const aliases = [normalized];

  if (normalized.startsWith("OUT-")) {
    aliases.push(normalized.replace(/^OUT-/, "OUTCOME-"));
  }

  if (normalized.startsWith("EPIC-")) {
    aliases.push(normalized.replace(/^EPIC-/, "EPC-"));
  }

  if (normalized.startsWith("STORY-")) {
    aliases.push(normalized.replace(/^STORY-/, "SC-"));
    aliases.push(normalized.replace(/^STORY-/, "STR-"));
  }

  return [...new Set(aliases)];
}

function extractImportedCandidateKey(candidateType: ArtifactAasCandidate["type"], value: string | null | undefined) {
  const normalized = value?.replace(/[*_`]/g, "").trim() ?? "";

  if (!normalized) {
    return null;
  }

  const pattern =
    candidateType === "outcome"
      ? /\b(?:(?:OUT|OUTCOME)-\d+|[A-Z]{2,10}-O\d+)\b/i
      : candidateType === "epic"
        ? /\b(?:(?:EPIC|EPC)-\d+|[A-Z]{2,10}-E\d+)\b/i
        : /\b(?:(?:STORY|SC|STR)-\d+|[A-Z]{2,10}-E\d+-SI\d+)\b/i;
  const match = normalized.match(pattern);

  return normalizeImportedReferenceKey(match?.[0]);
}

function stripImportedCandidateKeyPrefix(candidateType: ArtifactAasCandidate["type"], value: string, key?: string | null) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "";
  }

  const resolvedKey = key ?? extractImportedCandidateKey(candidateType, normalizedValue);

  if (!resolvedKey) {
    return normalizedValue;
  }

  const withoutKey = normalizedValue.replace(new RegExp(`^${escapeRegExp(resolvedKey)}\\b`, "i"), "").trim();
  const withoutSeparator = withoutKey.replace(/^(?:(?:â€“|â€”)|[-–—:|])+[\s]*/u, "").trim();
  return withoutSeparator;
}

function findStructuredSection(
  sections: ArtifactParseResult["sections"],
  title: string
) {
  return sections.find((section) => normalizeHeading(section.title) === normalizeHeading(title));
}

function getStructuredSectionBody(section: ArtifactParseResult["sections"][number] | undefined | null) {
  if (!section) {
    return "";
  }

  const lines = section.text.split("\n");
  if (lines.length <= 1) {
    return section.text.trim();
  }

  return lines.slice(1).join("\n").trim();
}

function normalizeDraftText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function dedupeArtifactText(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeInlineText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

const structuredArtifactFieldLabels = [
  "Title",
  "Story Type",
  "Value Intent",
  "User Value",
  "Benefit",
  "Summary",
  "Intent",
  "Expected Behavior",
  "Behavior",
  "Förväntat beteende",
  "Acceptance Criteria",
  "Acceptanskriterier",
  "AI Usage Scope",
  "Test Definition",
  "Test Notes",
  "Definition of Done",
  "Problem Statement",
  "Product Vision",
  "Outcome Statement",
  "Statement",
  "Baseline Definition",
  "Baseline",
  "Measurement Method",
  "Baseline Source",
  "Timeframe",
  "Time Horizon",
  "Purpose",
  "Risk Note",
  "Scope In",
  "Scope Out",
  "Story ID",
  "Epic ID",
  "Outcome ID",
  "Outcome Link",
  "Epic Link"
] as const;

function parseTaggedFieldLine(line: string) {
  const normalizedLine = line
    .trim()
    .replace(/^[-*]\s+/, "")
    .replace(/[*_`]/g, "")
    .trim();
  const separatorIndex = normalizedLine.indexOf(":");

  if (separatorIndex <= 0) {
    return null;
  }

  return {
    label: normalizeHeading(normalizedLine.slice(0, separatorIndex)),
    value: normalizedLine.slice(separatorIndex + 1).trim()
  };
}

function extractTaggedBlockLines(text: string, labels: string[]) {
  const normalizedLabels = new Set(labels.map((label) => normalizeHeading(label)));
  const knownLabels = new Set(structuredArtifactFieldLabels.map((label) => normalizeHeading(label)));
  const capturedLines: string[] = [];
  let capturing = false;

  for (const rawLine of text.split("\n")) {
    const parsedField = parseTaggedFieldLine(rawLine);

    if (!capturing) {
      if (!parsedField || !normalizedLabels.has(parsedField.label)) {
        continue;
      }

      capturing = true;

      if (parsedField.value) {
        capturedLines.push(parsedField.value);
      }

      continue;
    }

    if (parsedField && knownLabels.has(parsedField.label) && !normalizedLabels.has(parsedField.label)) {
      break;
    }

    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      if (capturedLines.length > 0) {
        break;
      }

      continue;
    }

    capturedLines.push(trimmedLine.replace(/[*_`]/g, "").trim());
  }

  return capturedLines;
}

function extractTaggedBlockList(text: string, labels: string[]) {
  return [...new Set(
    extractTaggedBlockLines(text, labels)
      .map((line) => line.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean)
  )];
}

function extractTaggedBlockText(text: string, labels: string[]) {
  const lines = extractTaggedBlockList(text, labels);

  if (lines.length === 0) {
    return "";
  }

  return lines.join(" ");
}

function extractTaggedBlockMultilineText(text: string, labels: string[]) {
  const lines = extractTaggedBlockList(text, labels);

  if (lines.length === 0) {
    return "";
  }

  return lines.join("\n");
}

function stripStructuredHeadingPrefix(candidateType: ArtifactAasCandidate["type"], value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (candidateType === "epic") {
    return trimmed.replace(/^EPIC\s+\d+\s*[-–—:|]?\s*/i, "").trim();
  }

  if (candidateType === "story") {
    return trimmed.replace(/^US\d+(?:\.\d+)+\s*[-–—:|]?\s*/i, "").trim();
  }

  return trimmed;
}

function extractStoryNarrative(text: string) {
  const normalized = normalizeInlineText(text);
  const match = normalized.match(/as an?\s+(.+?)\s+i want\s+(.+?)(?:\s+so that\s+(.+?))?(?:[.!?]|$)/i);

  if (!match) {
    return null;
  }

  return {
    actor: match[1]?.trim() ?? "",
    intent: match[2]?.trim() ?? "",
    outcome: match[3]?.trim() ?? ""
  };
}

function upperCaseFirst(value: string) {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function lowerCaseFirst(value: string) {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function normalizeComparableStoryText(value: string | null | undefined) {
  return normalizeDraftText(value).toLowerCase();
}

function isDistinctStoryText(value: string | null | undefined, blockedValues: Array<string | null | undefined>) {
  const normalizedValue = normalizeComparableStoryText(value);

  if (!normalizedValue) {
    return false;
  }

  return blockedValues.every((blockedValue) => normalizeComparableStoryText(blockedValue) !== normalizedValue);
}

function summarizeAcceptanceCriteriaForStoryIdea(acceptanceCriteria: string[]) {
  const normalizedCriteria = dedupeArtifactText(acceptanceCriteria);

  if (normalizedCriteria.length === 0) {
    return "";
  }

  if (normalizedCriteria.length === 1) {
    return summarizeText(upperCaseFirst(normalizedCriteria[0] ?? ""), 180);
  }

  return summarizeText(
    `${upperCaseFirst(normalizedCriteria[0] ?? "")}; ${lowerCaseFirst(normalizedCriteria[1] ?? "")}`,
    180
  );
}

function mergeArtifactDraftParagraphs(values: Array<string | null | undefined>) {
  const paragraphs = values
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);

  return paragraphs.length > 0 ? [...new Set(paragraphs)].join("\n\n") : null;
}

function mergeArtifactTextLines(values: Array<string | null | undefined>) {
  const lines = values
    .flatMap((value) => (value ?? "").split(/\r?\n+/))
    .map((value) => value.trim())
    .filter(Boolean);

  return lines.length > 0 ? [...new Set(lines)].join("\n") : null;
}

function pickDistinctStoryText(input: {
  candidates: Array<string | null | undefined>;
  blockedValues: Array<string | null | undefined>;
  maxLength?: number;
}) {
  for (const candidate of input.candidates) {
    if (!isDistinctStoryText(candidate, input.blockedValues)) {
      continue;
    }

    return summarizeText(candidate ?? "", input.maxLength ?? 180);
  }

  return "";
}

function shouldReplaceStoryTextWithStrongerSignal(value: string | null | undefined, blockedValues: Array<string | null | undefined>) {
  if (!value?.trim()) {
    return true;
  }

  if (!isDistinctStoryText(value, blockedValues)) {
    return true;
  }

  return countMeaningfulWords(value) < 6;
}

export function shouldPreferDeterministicFramingImport(input: {
  importIntent: "framing" | "design";
  explicitValueSpineCounts: {
    outcomes: number;
    epics: number;
    stories: number;
  };
  aiCandidateCounts: {
    outcomes: number;
    epics: number;
    stories: number;
  };
  deterministicCandidateCounts: {
    outcomes: number;
    epics: number;
    stories: number;
  };
}) {
  if (input.importIntent !== "framing") {
    return false;
  }

  if (
    input.explicitValueSpineCounts.epics > 0 &&
    input.explicitValueSpineCounts.stories > 0 &&
    input.deterministicCandidateCounts.epics > 0 &&
    input.deterministicCandidateCounts.stories > 0
  ) {
    return true;
  }

  const comparisons = [
    {
      explicit: input.explicitValueSpineCounts.outcomes,
      ai: input.aiCandidateCounts.outcomes,
      deterministic: input.deterministicCandidateCounts.outcomes
    },
    {
      explicit: input.explicitValueSpineCounts.epics,
      ai: input.aiCandidateCounts.epics,
      deterministic: input.deterministicCandidateCounts.epics
    },
    {
      explicit: input.explicitValueSpineCounts.stories,
      ai: input.aiCandidateCounts.stories,
      deterministic: input.deterministicCandidateCounts.stories
    }
  ];

  return comparisons.some(({ explicit, ai, deterministic }) => {
    if (explicit <= 0) {
      return false;
    }

    const deterministicEvidenceFloor = Math.min(explicit, deterministic);

    if (deterministicEvidenceFloor <= 0) {
      return false;
    }

    return deterministic > ai && ai < deterministicEvidenceFloor;
  });
}

function deriveFramingStoryValueIntent(input: {
  section: ArtifactParsedSection;
  currentTitle: string | null | undefined;
  currentValueIntent: string | null | undefined;
  currentExpectedBehavior: string | null | undefined;
  acceptanceCriteria: string[];
  fallbackSummary: string;
}) {
  const narrative = extractStoryNarrative(input.section.text);
  const title = input.currentTitle?.trim() ?? input.section.title;
  const acceptanceSummary = summarizeAcceptanceCriteriaForStoryIdea(input.acceptanceCriteria);
  const taggedValueIntent =
    extractTaggedLineValue(input.section.text, "Value Intent") ||
    extractTaggedLineValue(input.section.text, "User Value") ||
    extractTaggedLineValue(input.section.text, "Benefit");
  const taggedSummary =
    extractTaggedLineValue(input.section.text, "Summary") ||
    extractTaggedLineValue(input.section.text, "Intent");
  const keepCurrentValueIntent = !shouldReplaceStoryTextWithStrongerSignal(input.currentValueIntent, [
    title,
    input.currentExpectedBehavior
  ]);

  if (keepCurrentValueIntent && input.currentValueIntent?.trim()) {
    return summarizeText(input.currentValueIntent.trim(), 180);
  }

  const valueIntent =
    pickDistinctStoryText({
      candidates: [
        taggedValueIntent,
        narrative?.outcome ? upperCaseFirst(narrative.outcome) : null,
        acceptanceSummary,
        taggedSummary,
        narrative?.intent ? upperCaseFirst(narrative.intent) : null,
        input.currentExpectedBehavior,
        input.currentValueIntent,
        input.fallbackSummary,
        input.section.text
      ],
      blockedValues: [title, input.currentExpectedBehavior]
    }) || summarizeText(input.fallbackSummary || input.section.text, 180);

  return isDistinctStoryText(valueIntent, [title]) ? valueIntent : summarizeText(input.section.text, 180);
}

function deriveFramingStoryExpectedBehavior(input: {
  section: ArtifactParsedSection;
  currentTitle: string | null | undefined;
  currentValueIntent: string | null | undefined;
  currentExpectedBehavior: string | null | undefined;
  acceptanceCriteria: string[];
  fallbackSummary: string;
}) {
  const narrative = extractStoryNarrative(input.section.text);
  const normalizedIntent = narrative?.intent?.replace(/^to\s+/i, "") ?? "";
  const title = input.currentTitle?.trim() ?? input.section.title;
  const acceptanceSummary = summarizeAcceptanceCriteriaForStoryIdea(input.acceptanceCriteria);
  const taggedExpectedBehavior =
    extractTaggedLineValue(input.section.text, "Expected Behavior") ||
    extractTaggedLineValue(input.section.text, "Summary") ||
    extractTaggedLineValue(input.section.text, "Behavior");

  if (
    input.currentExpectedBehavior?.trim() &&
    !shouldReplaceStoryTextWithStrongerSignal(input.currentExpectedBehavior, [title, input.currentValueIntent])
  ) {
    return summarizeText(input.currentExpectedBehavior.trim(), 180);
  }

  const expectedBehavior = pickDistinctStoryText({
    candidates: [
      taggedExpectedBehavior,
      narrative?.actor && normalizedIntent ? `${upperCaseFirst(narrative.actor)} can ${normalizedIntent}.` : null,
      acceptanceSummary,
      normalizedIntent ? upperCaseFirst(normalizedIntent) : null,
      input.currentValueIntent,
      input.fallbackSummary,
      input.section.text
    ],
    blockedValues: [title, input.currentValueIntent, input.fallbackSummary]
  });

  if (
    !expectedBehavior ||
    !isDistinctStoryText(expectedBehavior, [title, input.currentValueIntent, input.fallbackSummary]) ||
    countMeaningfulWords(expectedBehavior) < 5
  ) {
    return null;
  }

  return expectedBehavior;
}

function shouldTreatAiCandidateAsStoryIdea(input: {
  importIntent: "framing" | "design";
  interpretedCandidate: ArtifactAiCandidateInterpretation;
  sourceSection: ArtifactParsedSection;
}) {
  if (input.importIntent !== "framing" || input.interpretedCandidate.type === "outcome") {
    return false;
  }

  const combinedText = [
    input.interpretedCandidate.title,
    input.interpretedCandidate.summary,
    input.interpretedCandidate.draftRecord?.title,
    input.interpretedCandidate.draftRecord?.valueIntent,
    input.interpretedCandidate.draftRecord?.expectedBehavior,
    input.sourceSection.title,
    input.sourceSection.text
  ]
    .filter(Boolean)
    .join("\n");

  return Boolean(
    extractStoryNarrative(combinedText) ||
      /\bstory idea\b|\buser story\b/.test(normalizeHeading(combinedText)) ||
      input.interpretedCandidate.draftRecord?.storyType ||
      input.interpretedCandidate.draftRecord?.valueIntent
  );
}

function mergeFramingOutcomeCandidates(candidates: ArtifactAasCandidate[]) {
  const candidatesByFile = new Map<string, ArtifactAasCandidate[]>();

  for (const candidate of candidates) {
    const existing = candidatesByFile.get(candidate.source.fileId) ?? [];
    existing.push(candidate);
    candidatesByFile.set(candidate.source.fileId, existing);
  }

  const suppressedOutcomeIds = new Set<string>();
  const outcomeAliasMap = new Map<string, string>();
  const mergedPrimaryOutcomeById = new Map<string, ArtifactAasCandidate>();

  function scoreOutcomeCandidate(candidate: ArtifactAasCandidate) {
    const draft = artifactCandidateDraftRecordSchema.parse({
      ...createArtifactCandidateDraftRecord(candidate),
      ...(candidate.draftRecord ?? {})
    });

    let score = 0;

    if (draft.key?.trim()) {
      score += 10;
    }

    if (
      extractImportedCandidateKey("outcome", candidate.source.sectionTitle) ||
      extractImportedCandidateKey("outcome", candidate.source.sectionMarker)
    ) {
      score += 8;
    }

    if (draft.title?.trim() && !isGenericFramingCandidateTitle("outcome", draft.title)) {
      score += 6;
    }

    if (draft.problemStatement?.trim()) {
      score += 3;
    }

    if (draft.outcomeStatement?.trim()) {
      score += 4;
    }

    if (draft.baselineDefinition?.trim()) {
      score += 3;
    }

    if (draft.baselineSource?.trim()) {
      score += 3;
    }

    if (draft.timeframe?.trim()) {
      score += 1;
    }

    return score;
  }

  for (const fileCandidates of candidatesByFile.values()) {
    const outcomeCandidates = fileCandidates
      .filter((candidate) => candidate.type === "outcome")
      .sort((left, right) => scoreOutcomeCandidate(right) - scoreOutcomeCandidate(left));

    if (outcomeCandidates.length <= 1) {
      continue;
    }

    const primaryOutcome = outcomeCandidates[0]!;
    const primaryDraft = artifactCandidateDraftRecordSchema.parse({
      ...createArtifactCandidateDraftRecord(primaryOutcome),
      ...(primaryOutcome.draftRecord ?? {})
    });
    let mergedOutcome: ArtifactAasCandidate = {
      ...primaryOutcome,
      acceptanceCriteria: [...primaryOutcome.acceptanceCriteria],
      testNotes: [...primaryOutcome.testNotes],
      draftRecord: {
        ...primaryDraft,
        acceptanceCriteria: [...primaryDraft.acceptanceCriteria],
        aiUsageScope: [...primaryDraft.aiUsageScope],
        definitionOfDone: [...primaryDraft.definitionOfDone]
      }
    };

    for (const secondaryOutcome of outcomeCandidates.slice(1)) {
      suppressedOutcomeIds.add(secondaryOutcome.id);
      outcomeAliasMap.set(secondaryOutcome.id, primaryOutcome.id);
      const secondaryDraft = artifactCandidateDraftRecordSchema.parse({
        ...createArtifactCandidateDraftRecord(secondaryOutcome),
        ...(secondaryOutcome.draftRecord ?? {})
      });
      const mergedDraft = artifactCandidateDraftRecordSchema.parse({
        ...mergedOutcome.draftRecord,
        key:
          mergedOutcome.draftRecord?.key?.trim() ||
          extractImportedCandidateKey("outcome", mergedOutcome.source.sectionTitle) ||
          extractImportedCandidateKey("outcome", mergedOutcome.source.sectionMarker) ||
          secondaryDraft.key ||
          extractImportedCandidateKey("outcome", secondaryOutcome.source.sectionTitle) ||
          extractImportedCandidateKey("outcome", secondaryOutcome.source.sectionMarker) ||
          null,
        title:
          mergedOutcome.draftRecord?.title?.trim() &&
          !isGenericFramingCandidateTitle("outcome", mergedOutcome.draftRecord.title)
            ? mergedOutcome.draftRecord.title
            : secondaryDraft.title || secondaryOutcome.title,
        problemStatement: mergeArtifactDraftParagraphs([
          mergedOutcome.draftRecord?.problemStatement,
          secondaryDraft.problemStatement
        ]),
        outcomeStatement: mergeArtifactDraftParagraphs([
          mergedOutcome.draftRecord?.outcomeStatement,
          mergedOutcome.summary,
          secondaryDraft.outcomeStatement,
          secondaryOutcome.summary
        ]),
        baselineDefinition: mergeArtifactTextLines([
          mergedOutcome.draftRecord?.baselineDefinition,
          secondaryDraft.baselineDefinition
        ]),
        baselineSource: mergeArtifactTextLines([
          mergedOutcome.draftRecord?.baselineSource,
          secondaryDraft.baselineSource
        ]),
        timeframe: mergeArtifactTextLines([mergedOutcome.draftRecord?.timeframe, secondaryDraft.timeframe])
      });

      mergedOutcome = {
        ...mergedOutcome,
        title:
          mergedOutcome.title.trim() && !isGenericFramingCandidateTitle("outcome", mergedOutcome.title)
            ? mergedOutcome.title
            : secondaryOutcome.title,
        summary: summarizeText(
          mergedDraft.outcomeStatement || mergedOutcome.summary || secondaryOutcome.summary
        ),
        draftRecord: mergedDraft,
        mappingState:
          mergedOutcome.mappingState === "uncertain" || secondaryOutcome.mappingState === "uncertain"
            ? "uncertain"
            : mergedOutcome.mappingState,
        relationshipState:
          mergedOutcome.relationshipState === "uncertain" || secondaryOutcome.relationshipState === "uncertain"
            ? "uncertain"
            : mergedOutcome.relationshipState
      };
    }

    mergedPrimaryOutcomeById.set(primaryOutcome.id, mergedOutcome);
  }

  return candidates.flatMap((candidate) => {
    if (suppressedOutcomeIds.has(candidate.id)) {
      return [];
    }

    if (candidate.type === "outcome") {
      return [mergedPrimaryOutcomeById.get(candidate.id) ?? candidate];
    }

    const resolvedOutcomeCandidateId =
      candidate.draftRecord?.outcomeCandidateId && outcomeAliasMap.has(candidate.draftRecord.outcomeCandidateId)
        ? outcomeAliasMap.get(candidate.draftRecord.outcomeCandidateId) ?? candidate.draftRecord.outcomeCandidateId
        : candidate.draftRecord?.outcomeCandidateId ?? null;
    const resolvedInferredOutcomeCandidateId =
      candidate.inferredOutcomeCandidateId && outcomeAliasMap.has(candidate.inferredOutcomeCandidateId)
        ? outcomeAliasMap.get(candidate.inferredOutcomeCandidateId)
        : candidate.inferredOutcomeCandidateId;

    return [
      {
        ...candidate,
        inferredOutcomeCandidateId: resolvedInferredOutcomeCandidateId,
        draftRecord: candidate.draftRecord
          ? {
              ...candidate.draftRecord,
              outcomeCandidateId: resolvedOutcomeCandidateId
            }
          : candidate.draftRecord
      }
    ];
  });
}

function isGenericFramingCandidateTitle(candidateType: ArtifactAasCandidate["type"], value: string | null | undefined) {
  const normalized = normalizeHeading(value ?? "").replace(/^\d+(?:\.\d+)*\s+/, "").trim();

  if (!normalized) {
    return true;
  }

  if (candidateType === "outcome") {
    return normalized === "outcome" || normalized === "value spine";
  }

  if (candidateType === "epic") {
    return normalized === "epic" || normalized === "epics";
  }

  return normalized === "story" || normalized === "stories" || normalized === "story idea" || normalized === "story ideas";
}

function normalizeFramingCandidates(input: {
  candidates: ArtifactAasCandidate[];
  sections: ArtifactParsedSection[];
}) {
  function resolveSourceSection(candidate: ArtifactAasCandidate) {
    const preferredKind =
      candidate.type === "outcome"
        ? "outcome_candidate"
        : candidate.type === "epic"
          ? "epic_candidate"
          : "story_candidate";
    const candidateKey = candidate.draftRecord?.key?.trim() ?? "";

    if (candidateKey) {
      const matchedByExplicitKey = input.sections.find(
        (section) =>
          section.kind === preferredKind &&
          section.sourceReference.fileId === candidate.source.fileId &&
          extractImportedCandidateKey(candidate.type, section.title) === candidateKey
      );

      if (matchedByExplicitKey) {
        return matchedByExplicitKey;
      }
    }

    return (
      input.sections.find(
        (section) =>
          section.sourceReference.fileId === candidate.source.fileId &&
          section.sourceReference.sectionId === candidate.source.sectionId &&
          section.kind === preferredKind
      ) ??
      input.sections.find(
        (section) =>
          section.sourceReference.fileId === candidate.source.fileId &&
          section.sourceReference.sectionId === candidate.source.sectionId
      ) ??
      input.sections.find(
        (section) =>
          section.sourceReference.fileId === candidate.source.fileId &&
          section.id === candidate.source.sectionId
      ) ??
      null
    );
  }
  const outcomeCandidateIdByKey = new Map<string, string>();
  const epicCandidateIdByKey = new Map<string, string>();

  const normalizedCandidates = input.candidates.flatMap((candidate) => {
    const sourceSection = resolveSourceSection(candidate);

    if (!sourceSection) {
      return [candidate];
    }

    if (shouldSkipStructuralFramingCandidateSection(sourceSection, candidate.type)) {
      return [];
    }

    const baseDraftRecord = artifactCandidateDraftRecordSchema.parse({
      ...createArtifactCandidateDraftRecord(candidate),
      ...(candidate.draftRecord ?? {})
    });
    const resolvedKey = resolveImportedCandidateKey({
      candidateType: candidate.type,
      section: sourceSection,
      currentTitle: baseDraftRecord.title ?? candidate.title
    });
    const resolvedTitle = resolveImportedCandidateTitle({
      candidateType: candidate.type,
      section: sourceSection,
      currentTitle: baseDraftRecord.title ?? candidate.title,
      key: resolvedKey
    });
    const nextCandidate: ArtifactAasCandidate = {
      ...candidate,
      title: summarizeText(resolvedTitle || candidate.title, 80),
      draftRecord: {
        ...baseDraftRecord,
        key: resolvedKey ?? baseDraftRecord.key ?? null,
        title: resolvedTitle || baseDraftRecord.title || candidate.title
      }
    };

    if (nextCandidate.type === "outcome") {
      for (const alias of buildImportedReferenceAliases(nextCandidate.draftRecord?.key ?? null)) {
        outcomeCandidateIdByKey.set(alias, nextCandidate.id);
      }
    }

    if (nextCandidate.type === "epic") {
      for (const alias of buildImportedReferenceAliases(nextCandidate.draftRecord?.key ?? null)) {
        epicCandidateIdByKey.set(alias, nextCandidate.id);
      }
    }

    return [nextCandidate];
  });
  const filesWithExplicitOutcomeCandidates = new Set(
    normalizedCandidates
      .filter((candidate) => candidate.type === "outcome" && Boolean(candidate.draftRecord?.key?.trim()))
      .map((candidate) => candidate.source.fileId)
  );
  const prunedCandidates = normalizedCandidates.filter((candidate) => {
    if (candidate.type !== "outcome" || !filesWithExplicitOutcomeCandidates.has(candidate.source.fileId)) {
      return true;
    }

    if (candidate.draftRecord?.key?.trim()) {
      return true;
    }

    return !isGenericFramingCandidateTitle("outcome", candidate.draftRecord?.title ?? candidate.title);
  });

  return mergeFramingOutcomeCandidates(
    prunedCandidates.map((candidate) => {
      const sourceSection = resolveSourceSection(candidate);

      if (!sourceSection) {
        return candidate;
      }

      const explicitOutcomeLinkKey =
        candidate.type !== "outcome"
          ? normalizeImportedReferenceKey(extractTaggedReferenceValue(sourceSection.text, "Outcome Link"))
          : null;
      const explicitEpicLinkKey =
        candidate.type === "story"
          ? normalizeImportedReferenceKey(extractTaggedReferenceValue(sourceSection.text, "Epic Link"))
          : null;
      const resolvedOutcomeCandidateId =
        explicitOutcomeLinkKey
          ? outcomeCandidateIdByKey.get(explicitOutcomeLinkKey) ?? candidate.draftRecord?.outcomeCandidateId ?? candidate.inferredOutcomeCandidateId ?? null
          : candidate.draftRecord?.outcomeCandidateId ?? candidate.inferredOutcomeCandidateId ?? null;
      const resolvedEpicCandidateId =
        explicitEpicLinkKey
          ? epicCandidateIdByKey.get(explicitEpicLinkKey) ?? candidate.draftRecord?.epicCandidateId ?? candidate.inferredEpicCandidateId ?? null
          : candidate.draftRecord?.epicCandidateId ?? candidate.inferredEpicCandidateId ?? null;
      const resolvedCandidate: ArtifactAasCandidate = {
        ...candidate,
        inferredOutcomeCandidateId:
          candidate.type === "outcome" ? undefined : resolvedOutcomeCandidateId ?? candidate.inferredOutcomeCandidateId,
        inferredEpicCandidateId:
          candidate.type === "story" ? resolvedEpicCandidateId ?? candidate.inferredEpicCandidateId : undefined,
        relationshipState:
          candidate.type === "outcome"
            ? "mapped"
            : candidate.type === "epic"
              ? resolvedOutcomeCandidateId
                ? "mapped"
                : "missing"
              : resolvedEpicCandidateId
                ? "mapped"
                : "missing",
        relationshipNote:
          candidate.type === "outcome"
            ? candidate.relationshipNote
            : candidate.type === "epic"
              ? resolvedOutcomeCandidateId
                ? "Epic is linked to the imported Outcome from the explicit Value Spine."
                : candidate.relationshipNote
              : resolvedEpicCandidateId
                ? "Story Idea is linked to the imported Epic from the explicit Value Spine."
                : candidate.relationshipNote,
        draftRecord: candidate.draftRecord
          ? {
              ...candidate.draftRecord,
              outcomeCandidateId: candidate.type === "outcome" ? null : resolvedOutcomeCandidateId,
              epicCandidateId: candidate.type === "story" ? resolvedEpicCandidateId : null
            }
          : candidate.draftRecord
      };

      return adaptStoryCandidateForImportIntent({
        candidate: resolvedCandidate,
        section: sourceSection,
        importIntent: "framing"
      });
    })
  );
}

function relinkExplicitFramingCandidateReferences(input: {
  candidates: ArtifactAasCandidate[];
  sections: ArtifactParsedSection[];
}) {
  const epicCandidateIdByKey = new Map<string, string>();
  const outcomeCandidateIdByKey = new Map<string, string>();

  for (const candidate of input.candidates) {
    if (candidate.type === "outcome") {
      for (const alias of buildImportedReferenceAliases(candidate.draftRecord?.key ?? null)) {
        outcomeCandidateIdByKey.set(alias, candidate.id);
      }
    }

    if (candidate.type === "epic") {
      for (const alias of buildImportedReferenceAliases(candidate.draftRecord?.key ?? null)) {
        epicCandidateIdByKey.set(alias, candidate.id);
      }
    }
  }

  function findSectionForCandidate(candidate: ArtifactAasCandidate) {
    const preferredKind =
      candidate.type === "outcome"
        ? "outcome_candidate"
        : candidate.type === "epic"
          ? "epic_candidate"
          : "story_candidate";
    const candidateKey = candidate.draftRecord?.key?.trim() ?? "";

    if (candidateKey) {
      const matched = input.sections.find(
        (section) =>
          section.kind === preferredKind &&
          section.sourceReference.fileId === candidate.source.fileId &&
          extractImportedCandidateKey(candidate.type, section.title) === candidateKey
      );

      if (matched) {
        return matched;
      }
    }

    return input.sections.find(
      (section) =>
        section.kind === preferredKind &&
        section.sourceReference.fileId === candidate.source.fileId &&
        section.sourceReference.sectionId === candidate.source.sectionId
    );
  }

  return input.candidates.map((candidate) => {
    const sourceSection = findSectionForCandidate(candidate);

    if (!sourceSection) {
      return candidate;
    }

    const explicitOutcomeLinkKey =
      candidate.type !== "outcome"
        ? normalizeImportedReferenceKey(extractTaggedReferenceValue(sourceSection.text, "Outcome Link"))
        : null;
    const explicitEpicLinkKey =
      candidate.type === "story"
        ? normalizeImportedReferenceKey(extractTaggedReferenceValue(sourceSection.text, "Epic Link"))
        : null;
    const resolvedOutcomeCandidateId =
      explicitOutcomeLinkKey ? outcomeCandidateIdByKey.get(explicitOutcomeLinkKey) ?? null : null;
    const resolvedEpicCandidateId = explicitEpicLinkKey ? epicCandidateIdByKey.get(explicitEpicLinkKey) ?? null : null;

    if (!resolvedOutcomeCandidateId && !resolvedEpicCandidateId) {
      return candidate;
    }

    return {
      ...candidate,
      inferredOutcomeCandidateId:
        candidate.type === "outcome"
          ? undefined
          : resolvedOutcomeCandidateId ?? candidate.inferredOutcomeCandidateId,
      inferredEpicCandidateId:
        candidate.type === "story" ? resolvedEpicCandidateId ?? candidate.inferredEpicCandidateId : undefined,
      draftRecord: candidate.draftRecord
        ? {
            ...candidate.draftRecord,
            outcomeCandidateId:
              candidate.type === "outcome"
                ? null
                : resolvedOutcomeCandidateId ?? candidate.draftRecord.outcomeCandidateId ?? null,
            epicCandidateId:
              candidate.type === "story"
                ? resolvedEpicCandidateId ?? candidate.draftRecord.epicCandidateId ?? null
                : null
          }
        : candidate.draftRecord
    } satisfies ArtifactAasCandidate;
  });
}

function adaptStoryCandidateForImportIntent(input: {
  candidate: ArtifactAasCandidate;
  section: ArtifactParsedSection;
  importIntent: "framing" | "design";
}) {
  if (input.importIntent !== "framing" || input.candidate.type !== "story") {
    return input.candidate;
  }

  const baseDraftRecord = artifactCandidateDraftRecordSchema.parse({
    ...createArtifactCandidateDraftRecord(input.candidate),
    ...(input.candidate.draftRecord ?? {})
  });
  const valueIntent = deriveFramingStoryValueIntent({
    section: input.section,
    currentTitle: baseDraftRecord.title,
    currentValueIntent: baseDraftRecord.valueIntent,
    currentExpectedBehavior: baseDraftRecord.expectedBehavior,
    acceptanceCriteria: [...input.candidate.acceptanceCriteria, ...baseDraftRecord.acceptanceCriteria],
    fallbackSummary: input.candidate.summary
  });
  const expectedBehavior = deriveFramingStoryExpectedBehavior({
    section: input.section,
    currentTitle: baseDraftRecord.title,
    currentValueIntent: valueIntent,
    currentExpectedBehavior: baseDraftRecord.expectedBehavior,
    acceptanceCriteria: [...input.candidate.acceptanceCriteria, ...baseDraftRecord.acceptanceCriteria],
    fallbackSummary: input.candidate.summary
  });

  return {
    ...input.candidate,
    summary: summarizeText(valueIntent || input.candidate.summary),
    acceptanceCriteria: [],
    testNotes: [],
    draftRecord: {
      ...baseDraftRecord,
      valueIntent,
      expectedBehavior,
      acceptanceCriteria: [],
      aiUsageScope: [],
      testDefinition: null,
      definitionOfDone: []
    }
  } satisfies ArtifactAasCandidate;
}

function isFunctionalRequirementSection(section: ArtifactParsedSection) {
  const title = normalizeHeading(section.title);
  const text = normalizeHeading(section.text);
  const isClearlyNonFunctional = /\bnon[\s-]?functional\b|\bnfr\b/.test(title) || /\bnon[\s-]?functional\b|\bnfr\b/.test(text);

  if (isClearlyNonFunctional) {
    return false;
  }

  return (
    /\bfunctional requirement(s)?\b|\bfunctional req(s)?\b|\bfeature requirement(s)?\b/.test(title) ||
    (/\bfunctional requirement(s)?\b|\bfunctional req(s)?\b/.test(text) && /^[-*]\s+/m.test(section.text))
  );
}

function detectCarryForwardSection(section: ArtifactParsedSection) {
  const title = normalizeHeading(section.title);
  const text = normalizeHeading(section.text);

  if (/ux|user experience|usability|design principle/.test(title)) {
    return {
      category: "ux_principle" as const,
      recommendedUse: "design_input" as const
    };
  }

  if (/non[\s-]?functional|nfr|performance|security|availability|privacy|compliance|accessibility|reliability|governance|risk|tollgate/.test(title)) {
    return {
      category: "nfr_constraint" as const,
      recommendedUse: "cross_cutting_requirement" as const
    };
  }

  if (/additional requirement|additional req|functional requirement|functional req|feature requirement|open issue|assumption|dependency|reference data/.test(title)) {
    return {
      category: "additional_requirement" as const,
      recommendedUse: "framing_constraint" as const
    };
  }

  if (/constraint|integration|platform|technology|persistence|database|data model|api|hosting|architecture|configuration/.test(title)) {
    return {
      category: /wireframe|mockup|screen|page|flow|interaction/.test(text)
        ? ("excluded_design" as const)
        : ("solution_constraint" as const),
      recommendedUse: /wireframe|mockup|screen|page|flow|interaction/.test(text)
        ? ("design_input" as const)
        : ("framing_constraint" as const)
    };
  }

  if (/wireframe|mockup|screen flow|user flow|interaction pattern|page layout|ui flow|journey context/.test(title)) {
    return {
      category: "excluded_design" as const,
      recommendedUse: "design_input" as const
    };
  }

  if (/mobile-first|accessible|responsive|clear feedback|simple navigation/.test(text)) {
    return {
      category: "ux_principle" as const,
      recommendedUse: "design_input" as const
    };
  }

  if (/performance|security|availability|privacy|compliance|retention|audit|accessibility|reliability/.test(text)) {
    return {
      category: "nfr_constraint" as const,
      recommendedUse: "cross_cutting_requirement" as const
    };
  }

  if (/must integrate|must support|must persist|must run on|must comply|must avoid/.test(text)) {
    return {
      category: "solution_constraint" as const,
      recommendedUse: "framing_constraint" as const
    };
  }

  return null;
}

function createCarryForwardItem(section: ArtifactParsedSection) {
  const classification = detectCarryForwardSection(section);

  if (!classification) {
    return null;
  }

  return {
    id: `carry-forward-${section.sourceReference.fileId}-${section.id}`,
    category: classification.category,
    recommendedUse: classification.recommendedUse,
    title: section.title,
    summary: summarizeText(section.text, 220),
    sourceSection: section
  } satisfies ArtifactCarryForwardItem;
}

function isFramingOutcomeContextSection(section: ArtifactParsedSection) {
  const title = normalizeHeading(section.title);
  const text = normalizeHeading(section.text);

  return (
    /\bproduct vision\b|\bvision\b|\bproblem\b|\bgoal\b|\bobjective\b/.test(title) ||
    /\bproduct vision\b|\bvision\b|\bproblem statement\b|\bgoal\b|\bobjective\b/.test(text)
  );
}

function extractTaggedLineValue(text: string, label: string) {
  const normalizedLabel = normalizeHeading(label);

  for (const line of text.split("\n")) {
    const normalizedLine = line
      .trim()
      .replace(/^[-*]\s+/, "")
      .replace(/[*_`]/g, "")
      .trim();
    const [lineLabel, ...lineValue] = normalizedLine.split(":");

    if (normalizeHeading(lineLabel ?? "") !== normalizedLabel) {
      continue;
    }

    const resolvedValue = lineValue.join(":").trim();

    if (resolvedValue) {
      return resolvedValue;
    }
  }

  return "";
}

function extractTaggedReferenceValue(text: string, label: string) {
  const match = text.match(
    new RegExp(`(?:^|\\n)\\s*[-*]?\\s*(?:\\*\\*|__)?${escapeRegExp(label)}(?:\\*\\*|__)?\\s*:\\s*([^\\n]+)`, "i")
  );

  return match?.[1]?.replace(/[*_`]/g, "").trim() ?? "";
}

function extractTaggedLineList(text: string, label: string) {
  return extractTaggedLineValue(text, label)
    .split(/[|,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resolveImportedCandidateKey(input: {
  candidateType: ArtifactAasCandidate["type"];
  section: ArtifactParsedSection;
  currentTitle: string | null | undefined;
}) {
  const idLabel =
    input.candidateType === "outcome" ? "Outcome ID" : input.candidateType === "epic" ? "Epic ID" : "Story ID";

  return (
    extractImportedCandidateKey(input.candidateType, extractTaggedLineValue(input.section.text, idLabel)) ??
    extractImportedCandidateKey(input.candidateType, input.currentTitle) ??
    extractImportedCandidateKey(input.candidateType, input.section.title) ??
    extractImportedCandidateKey(input.candidateType, input.section.sourceReference.sectionMarker) ??
    extractImportedCandidateKey(input.candidateType, input.section.text)
  );
}

function resolveImportedCandidateTitle(input: {
  candidateType: ArtifactAasCandidate["type"];
  section: ArtifactParsedSection;
  currentTitle: string | null | undefined;
  key: string | null;
}) {
  const explicitTitle = extractTaggedLineValue(input.section.text, "Title");

  if (explicitTitle) {
    return explicitTitle;
  }

  const strippedCurrentTitle = stripImportedCandidateKeyPrefix(
    input.candidateType,
    input.currentTitle ?? "",
    input.key
  );

  const strippedStructuredCurrentTitle = stripStructuredHeadingPrefix(input.candidateType, strippedCurrentTitle);

  if (strippedStructuredCurrentTitle) {
    return strippedStructuredCurrentTitle;
  }

  const strippedSectionTitle = stripImportedCandidateKeyPrefix(input.candidateType, input.section.title, input.key);
  const strippedStructuredSectionTitle = stripStructuredHeadingPrefix(input.candidateType, strippedSectionTitle);

  if (strippedStructuredSectionTitle) {
    return strippedStructuredSectionTitle;
  }

  return stripStructuredHeadingPrefix(
    input.candidateType,
    input.currentTitle?.trim() || input.section.title.trim()
  );
}

function shouldSkipStructuralFramingCandidateSection(
  section: ArtifactParsedSection,
  candidateType: ArtifactAasCandidate["type"]
) {
  const title = normalizeHeading(section.title).replace(/^\d+(?:\.\d+)*\s+/, "").trim();
  const body = normalizeHeading(getStructuredSectionBody(section));

  if (/schema|template/.test(title)) {
    return true;
  }

  if (/^value spine$|^delivery stories$/.test(title)) {
    return true;
  }

  if (candidateType === "outcome") {
    return /^outcome$/.test(title) && body.length === 0;
  }

  if (candidateType === "epic") {
    return /^epics?$/.test(title) && body.length === 0;
  }

  if (candidateType === "story") {
    return (/^stories?$/.test(title) || /^story ideas?$/.test(title)) && body.length === 0;
  }

  return false;
}

function normalizeImportedStoryType(rawType: string, fallbackText: string) {
  const normalized = `${rawType} ${fallbackText}`.toLowerCase();

  if (/\b(governance|review|approval|audit|risk|compliance|evidence|signoff)\b/.test(normalized)) {
    return "governance" as const;
  }

  if (/\b(enablement|tooling|platform|workflow|runbook|migration|operational|support)\b/.test(normalized)) {
    return "enablement" as const;
  }

  return "outcome_delivery" as const;
}

function buildDraftRecordFromParsedSection(input: {
  candidateType: ArtifactAasCandidate["type"];
  section: ArtifactParsedSection;
  acceptanceCriteria: string[];
  testNotes: string[];
  inferredOutcomeCandidateId?: string | undefined;
  inferredEpicCandidateId?: string | undefined;
}) {
  const normalizedSectionTitle = normalizeHeading(input.section.title);
  const sectionBody = getStructuredSectionBody(input.section);
  const resolvedKey = resolveImportedCandidateKey({
    candidateType: input.candidateType,
    section: input.section,
    currentTitle: extractTaggedLineValue(input.section.text, "Title") || input.section.title
  });
  const resolvedTitle = resolveImportedCandidateTitle({
    candidateType: input.candidateType,
    section: input.section,
    currentTitle: extractTaggedLineValue(input.section.text, "Title") || input.section.title,
    key: resolvedKey
  });

  if (input.candidateType === "outcome") {
    return {
      key: resolvedKey,
      title: resolvedTitle,
      problemStatement:
        extractTaggedBlockText(input.section.text, ["Problem Statement", "Product Vision"]) ||
        extractTaggedLineValue(input.section.text, "Problem Statement") ||
        extractTaggedLineValue(input.section.text, "Product Vision") ||
        (/^problem statement$/.test(normalizedSectionTitle) ? sectionBody || input.section.text : "") ||
        null,
      outcomeStatement:
        extractTaggedBlockText(input.section.text, ["Outcome Statement", "Statement"]) ||
        extractTaggedLineValue(input.section.text, "Outcome Statement") ||
        extractTaggedLineValue(input.section.text, "Statement") ||
        (/^outcome$/.test(normalizedSectionTitle) ? sectionBody || input.section.text : "") ||
        summarizeText(input.section.text),
      baselineDefinition:
        extractTaggedBlockText(input.section.text, ["Baseline Definition", "Baseline"]) ||
        extractTaggedLineValue(input.section.text, "Baseline Definition") ||
        extractTaggedLineValue(input.section.text, "Baseline") ||
        (/^baseline$/.test(normalizedSectionTitle) ? sectionBody || input.section.text : "") ||
        null,
      baselineSource:
        extractTaggedBlockMultilineText(input.section.text, ["Measurement Method", "Baseline Source"]) ||
        extractTaggedLineValue(input.section.text, "Measurement Method") ||
        extractTaggedLineValue(input.section.text, "Baseline Source") ||
        null,
      timeframe:
        extractTaggedBlockText(input.section.text, ["Timeframe", "Time Horizon"]) ||
        extractTaggedLineValue(input.section.text, "Timeframe") ||
        extractTaggedLineValue(input.section.text, "Time Horizon") ||
        null,
      purpose: null,
      scopeBoundary: null,
      riskNote: null,
      storyType: null,
      valueIntent: null,
      expectedBehavior: null,
      acceptanceCriteria: [],
      aiUsageScope: [],
      testDefinition: null,
      definitionOfDone: [],
      outcomeCandidateId: null,
      epicCandidateId: null
    } satisfies ArtifactCandidateDraftRecord;
  }

  if (input.candidateType === "epic") {
    const scopeIn = extractTaggedLineValue(input.section.text, "Scope In");
    const scopeOut = extractTaggedLineValue(input.section.text, "Scope Out");
    const scopeBoundary = [scopeIn ? `Scope in: ${scopeIn}` : "", scopeOut ? `Scope out: ${scopeOut}` : ""]
      .filter(Boolean)
      .join("\n");

    return {
      key: resolvedKey,
      title: resolvedTitle,
      problemStatement: null,
      outcomeStatement: null,
      baselineDefinition: null,
      baselineSource: null,
      timeframe: null,
      purpose: extractTaggedLineValue(input.section.text, "Purpose") || summarizeText(input.section.text),
      scopeBoundary: scopeBoundary || null,
      riskNote: extractTaggedLineValue(input.section.text, "Risk Note") || null,
      storyType: null,
      valueIntent: null,
      expectedBehavior: null,
      acceptanceCriteria: [],
      aiUsageScope: [],
      testDefinition: null,
      definitionOfDone: [],
      outcomeCandidateId: input.inferredOutcomeCandidateId ?? null,
      epicCandidateId: null
    } satisfies ArtifactCandidateDraftRecord;
  }

  const valueIntent = extractTaggedLineValue(input.section.text, "Value Intent");
  const expectedBehavior =
    extractTaggedLineValue(input.section.text, "Expected Behavior") ||
    extractTaggedBlockText(input.section.text, ["Expected Behavior", "Behavior", "Förväntat beteende"]) ||
    extractTaggedLineValue(input.section.text, "Summary") ||
    null;
  const aiUsageScope = extractTaggedLineList(input.section.text, "AI Usage Scope");
  const definitionOfDone = extractTaggedLineList(input.section.text, "Definition of Done");
  const rawStoryType = extractTaggedLineValue(input.section.text, "Story Type");
  const explicitAcceptanceCriteria = extractTaggedBlockList(input.section.text, ["Acceptance Criteria", "Acceptanskriterier"]);

  return {
    key: resolvedKey,
    title: resolvedTitle,
    problemStatement: null,
    outcomeStatement: null,
    baselineDefinition: null,
    baselineSource: null,
    timeframe: null,
    purpose: null,
    scopeBoundary: null,
    riskNote: null,
    storyType: normalizeImportedStoryType(rawStoryType, input.section.text),
    valueIntent:
      valueIntent && isDistinctStoryText(valueIntent, [resolvedTitle || input.section.title])
        ? valueIntent
        : summarizeText(input.section.text),
    expectedBehavior,
    acceptanceCriteria: explicitAcceptanceCriteria.length > 0 ? explicitAcceptanceCriteria : input.acceptanceCriteria,
    aiUsageScope,
    testDefinition: input.testNotes.length > 0 ? input.testNotes.join("\n") : null,
    definitionOfDone,
    outcomeCandidateId: input.inferredOutcomeCandidateId ?? null,
    epicCandidateId: input.inferredEpicCandidateId ?? null
  } satisfies ArtifactCandidateDraftRecord;
}

function mergeDraftRecordValues(
  base: ArtifactCandidateDraftRecord,
  override: ArtifactAiCandidateInterpretation["draftRecord"] | undefined
) {
  if (!override) {
    return base;
  }

  const normalizedOverride = Object.fromEntries(
    Object.entries(override).filter(([, value]) => value !== undefined)
  ) as Partial<ArtifactCandidateDraftRecord>;

  return {
    ...base,
    ...normalizedOverride,
    acceptanceCriteria:
      normalizedOverride.acceptanceCriteria && normalizedOverride.acceptanceCriteria.length > 0
        ? normalizedOverride.acceptanceCriteria
        : base.acceptanceCriteria,
    aiUsageScope:
      normalizedOverride.aiUsageScope && normalizedOverride.aiUsageScope.length > 0
        ? normalizedOverride.aiUsageScope
        : base.aiUsageScope,
    definitionOfDone:
      normalizedOverride.definitionOfDone && normalizedOverride.definitionOfDone.length > 0
        ? normalizedOverride.definitionOfDone
        : base.definitionOfDone
  } satisfies ArtifactCandidateDraftRecord;
}

function resolveAiCandidateRelationshipState(input: {
  candidateType: ArtifactAasCandidate["type"];
  importIntent?: "framing" | "design";
  explicitRelationshipState?: ArtifactAasCandidate["relationshipState"] | undefined;
  explicitRelationshipNote?: string | null | undefined;
  inferredOutcomeCandidateId?: string | undefined;
  inferredEpicCandidateId?: string | undefined;
  confidence: ArtifactParsedSection["confidence"];
}) {
  if (input.explicitRelationshipState) {
    return {
      relationshipState: input.explicitRelationshipState,
      relationshipNote: input.explicitRelationshipNote ?? undefined
    };
  }

  if (input.candidateType === "outcome") {
    return {
      relationshipState: "mapped" as const,
      relationshipNote: undefined
    };
  }

  if (input.candidateType === "epic") {
    if (!input.inferredOutcomeCandidateId && input.importIntent !== "framing") {
      return {
        relationshipState: "missing" as const,
        relationshipNote: "No prior Outcome candidate was available to anchor this Epic relationship."
      };
    }

    if (input.confidence === "low") {
      return {
        relationshipState: "uncertain" as const,
        relationshipNote:
          input.importIntent === "framing"
            ? "Epic looks valid, but a reviewer should still sanity-check the import before approval."
            : "Epic likely belongs to the nearest Outcome candidate, but the relationship remains uncertain."
      };
    }

    return {
      relationshipState: "mapped" as const,
      relationshipNote:
        input.importIntent === "framing"
          ? "Epic is ready to be linked to the current project Outcome during framing approval."
          : "Epic relationship was inferred from nearby Outcome context."
    };
  }

  if ((!input.inferredOutcomeCandidateId && input.importIntent !== "framing") || !input.inferredEpicCandidateId) {
    return {
      relationshipState: "missing" as const,
      relationshipNote:
        input.importIntent === "framing"
          ? "Story Idea still needs an Epic destination before approval."
          : "Story relationship inference is incomplete because a prior Outcome or Epic candidate was not found."
    };
  }

  if (input.confidence === "low") {
    return {
      relationshipState: "uncertain" as const,
      relationshipNote: "Story relationship is inferred from nearby sections but remains uncertain."
    };
  }

  return {
    relationshipState: "mapped" as const,
    relationshipNote: undefined
  };
}

export function buildAiAssistedArtifactProcessingResult(input: {
  files: Array<{
    id: string;
    fileName: string;
    parsedArtifacts: ArtifactParseResult;
  }>;
  interpretation: ArtifactAiSessionInterpretation;
  importIntent?: "framing" | "design";
}) {
  const importIntent = input.importIntent ?? "design";
  const normalizedInterpretation = artifactAiSessionInterpretationSchema.parse(input.interpretation);
  const aiFilesByName = new Map<string, ArtifactAiFileInterpretation[]>();

  for (const file of normalizedInterpretation.files) {
    const key = file.fileName.trim().toLowerCase();
    const existing = aiFilesByName.get(key) ?? [];
    existing.push(file);
    aiFilesByName.set(key, existing);
  }

  const parseResults: Array<{
    fileId: string;
    fileName: string;
    sourceType: ArtifactSourceClassification["sourceType"];
    parseResult: ArtifactParseResult;
  }> = [];
  const candidates: ArtifactAasCandidate[] = [];
  const carryForwardItems: ArtifactCarryForwardItem[] = [];
  const unmappedSections: ArtifactParsedSection[] = [];
  let lastOutcomeCandidateId: string | undefined;
  let lastEpicCandidateId: string | undefined;
  const candidateIdBySectionAndType = new Map<string, string>();

  for (const file of input.files) {
    const fileKey = file.fileName.trim().toLowerCase();
    const aiMatch = aiFilesByName.get(fileKey)?.shift();

    if (!aiMatch) {
      throw new Error(`AI-assisted import did not return an interpretation for ${file.fileName}.`);
    }

    const decisionsBySectionId = new Map(aiMatch.sectionDecisions.map((decision) => [decision.sectionId, decision] as const));
    const nextSections = file.parsedArtifacts.sections.map((section) => {
      const decision = decisionsBySectionId.get(section.id);

      if (!decision) {
        return section;
      }

      return {
        ...section,
        kind: decision.kind,
        confidence: decision.confidence,
        isUncertain: decision.confidence === "low"
      };
    });
    const sectionById = new Map(nextSections.map((section) => [section.id, section] as const));
    const sourceType = aiMatch.sourceType;

    parseResults.push({
      fileId: file.id,
      fileName: file.fileName,
      sourceType,
      parseResult: {
        classification: {
          sourceType,
          confidence: aiMatch.confidence,
          rationale: aiMatch.rationale
        },
        sections: nextSections
      }
    });

    const usedSectionIds = new Set<string>();

    for (const interpretedCandidate of aiMatch.candidates) {
      const sourceSection = sectionById.get(interpretedCandidate.sectionId);

      if (!sourceSection) {
        continue;
      }

      usedSectionIds.add(sourceSection.id);
      const candidateType = shouldTreatAiCandidateAsStoryIdea({
        importIntent,
        interpretedCandidate,
        sourceSection
      })
        ? "story"
        : interpretedCandidate.type;
      const candidateId = buildArtifactCandidateId({
        fileId: file.id,
        sectionId: sourceSection.id,
        candidateType
      });
      candidateIdBySectionAndType.set(`${sourceSection.id}:${candidateType}`, candidateId);
      const explicitOutcomeCandidateId = interpretedCandidate.linkedOutcomeSectionId
        ? candidateIdBySectionAndType.get(`${interpretedCandidate.linkedOutcomeSectionId}:outcome`)
        : undefined;
      const explicitEpicCandidateId = interpretedCandidate.linkedEpicSectionId
        ? candidateIdBySectionAndType.get(`${interpretedCandidate.linkedEpicSectionId}:epic`)
        : undefined;
      const inferredOutcomeCandidateId =
        candidateType === "outcome"
          ? undefined
          : explicitOutcomeCandidateId ?? lastOutcomeCandidateId;
      const inferredEpicCandidateId =
        candidateType === "story" ? explicitEpicCandidateId ?? lastEpicCandidateId : undefined;
      const sourceConfidence =
        sourceType === "unknown_artifact" && sourceSection.confidence === "high" ? "medium" : sourceSection.confidence;
      const relationship = resolveAiCandidateRelationshipState({
        candidateType,
        importIntent,
        explicitRelationshipState: interpretedCandidate.relationshipState,
        explicitRelationshipNote: interpretedCandidate.relationshipNote,
        inferredOutcomeCandidateId,
        inferredEpicCandidateId,
        confidence: sourceSection.confidence
      });

      const nextCandidate = adaptStoryCandidateForImportIntent({
        candidate: {
        id: candidateId,
        type: candidateType,
        title: summarizeText(interpretedCandidate.title, 80),
        summary: summarizeText(interpretedCandidate.summary),
        mappingState:
          interpretedCandidate.mappingState ??
          (sourceType === "unknown_artifact" || sourceConfidence === "low" ? "uncertain" : "mapped"),
        source: {
          fileId: sourceSection.sourceReference.fileId,
          fileName: sourceSection.sourceReference.fileName,
          sectionId: sourceSection.sourceReference.sectionId,
          sectionTitle: sourceSection.sourceReference.sectionTitle,
          sectionMarker: sourceSection.sourceReference.sectionMarker,
          sourceType,
          confidence: sourceConfidence
        },
        inferredOutcomeCandidateId,
        inferredEpicCandidateId,
        relationshipState: relationship.relationshipState,
        relationshipNote: relationship.relationshipNote,
        acceptanceCriteria: dedupeArtifactText(interpretedCandidate.acceptanceCriteria),
        testNotes: dedupeArtifactText(interpretedCandidate.testNotes),
        draftRecord: mergeDraftRecordValues(
          buildDraftRecordFromParsedSection({
            candidateType: interpretedCandidate.type,
            section: sourceSection,
            acceptanceCriteria: dedupeArtifactText(interpretedCandidate.acceptanceCriteria),
            testNotes: dedupeArtifactText(interpretedCandidate.testNotes),
            inferredOutcomeCandidateId,
            inferredEpicCandidateId
          }),
          interpretedCandidate.draftRecord
        )
      },
        section: sourceSection,
        importIntent
      });

      candidates.push(nextCandidate);

      if (candidateType === "outcome") {
        lastOutcomeCandidateId = candidateId;
        lastEpicCandidateId = undefined;
      }

      if (candidateType === "epic") {
        lastEpicCandidateId = candidateId;
      }
    }

    if (importIntent === "framing") {
      const fileOutcomeCandidates = candidates.filter(
        (candidate) => candidate.type === "outcome" && candidate.source.fileId === file.id
      );
      const outcomeContextText = nextSections
        .filter(
          (section) =>
            section.kind === "problem_goal" ||
            (section.kind !== "outcome_candidate" && isFramingOutcomeContextSection(section))
        )
        .map((section) => section.text.trim())
        .filter(Boolean);

      if (fileOutcomeCandidates.length > 0 && outcomeContextText.length > 0) {
        const primaryOutcomeCandidate = fileOutcomeCandidates[0]!;
        primaryOutcomeCandidate.draftRecord = {
          ...primaryOutcomeCandidate.draftRecord,
          problemStatement: mergeArtifactDraftParagraphs([
            primaryOutcomeCandidate.draftRecord?.problemStatement ?? null,
            ...outcomeContextText
          ])
        };
      }
    }

    const leftoverSectionIds = new Set(aiMatch.leftoverSectionIds);

    for (const section of nextSections) {
      if (leftoverSectionIds.has(section.id) || (importIntent === "framing" && isFunctionalRequirementSection(section))) {
        const carryForwardItem = createCarryForwardItem(section);

        if (carryForwardItem) {
          carryForwardItems.push(carryForwardItem);
        } else {
          unmappedSections.push(section);
        }
        continue;
      }

      if (!usedSectionIds.has(section.id) && (section.kind === "unmapped" || section.kind === "architecture_notes")) {
        const carryForwardItem = createCarryForwardItem(section);

        if (carryForwardItem) {
          carryForwardItems.push(carryForwardItem);
        } else {
          unmappedSections.push(section);
        }
      }
    }
  }

  const normalizedCandidates =
    importIntent === "framing"
      ? relinkExplicitFramingCandidateReferences({
          candidates: normalizeFramingCandidates({
            candidates,
            sections: parseResults.flatMap((entry) => entry.parseResult.sections)
          }),
          sections: parseResults.flatMap((entry) => entry.parseResult.sections)
        })
      : candidates;

  return {
    files: parseResults,
    mappingResult: {
      candidates: normalizedCandidates,
      carryForwardItems,
      unmappedSections
    }
  };
}

export function createArtifactCandidateDraftRecord(candidate: ArtifactAasCandidate | ArtifactCandidateRecord): ArtifactCandidateDraftRecord {
  if (candidate.type === "outcome") {
    return {
      key: null,
      title: candidate.title,
      problemStatement: null,
      outcomeStatement: candidate.summary,
      baselineDefinition: null,
      baselineSource: null,
      timeframe: null,
      purpose: null,
      storyType: null,
      valueIntent: null,
      expectedBehavior: null,
      acceptanceCriteria: [],
      aiUsageScope: [],
      testDefinition: null,
      definitionOfDone: [],
      outcomeCandidateId: null,
      epicCandidateId: null
    };
  }

  if (candidate.type === "epic") {
    return {
      key: null,
      title: candidate.title,
      problemStatement: null,
      outcomeStatement: null,
      baselineDefinition: null,
      baselineSource: null,
      timeframe: null,
      purpose: candidate.summary,
      scopeBoundary: null,
      riskNote: null,
      storyType: null,
      valueIntent: null,
      expectedBehavior: null,
      acceptanceCriteria: [],
      aiUsageScope: [],
      testDefinition: null,
      definitionOfDone: [],
      outcomeCandidateId: candidate.inferredOutcomeCandidateId ?? null,
      epicCandidateId: null
    };
  }

  const uniqueStoryImportKey = `IMP-STR-${candidate.id.slice(-8).replace(/[^a-z0-9]/gi, "").toUpperCase()}`;

  return {
    key: uniqueStoryImportKey,
    title: candidate.title,
    problemStatement: null,
    outcomeStatement: null,
    baselineDefinition: null,
    baselineSource: null,
    timeframe: null,
    purpose: null,
    scopeBoundary: null,
    riskNote: null,
    storyType: "outcome_delivery",
    valueIntent: candidate.summary,
    expectedBehavior: null,
    acceptanceCriteria: candidate.acceptanceCriteria,
    aiUsageScope: [],
    testDefinition: candidate.testNotes.length > 0 ? candidate.testNotes.join("\n") : null,
    definitionOfDone: [],
    outcomeCandidateId: candidate.inferredOutcomeCandidateId ?? null,
    epicCandidateId: candidate.inferredEpicCandidateId ?? null
  };
}

function shouldSurfaceUncertainty(
  candidate: ArtifactAasCandidate | ArtifactCandidateRecord,
  reviewStatus: "pending" | "follow_up_needed" | "confirmed" | "edited" | "rejected" | "promoted"
) {
  return reviewStatus === "pending" || reviewStatus === "follow_up_needed";
}

function getCandidateSourceConfidence(candidate: ArtifactAasCandidate | ArtifactCandidateRecord) {
  return "source" in candidate ? candidate.source.confidence : candidate.sourceConfidence;
}

function countMeaningfulWords(value: string | null | undefined) {
  return normalizeDraftText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1).length;
}

function looksLikeActivityStatement(value: string | null | undefined) {
  const normalized = normalizeDraftText(value).toLowerCase();

  if (!normalized) {
    return false;
  }

  const activityStarts = /^(build|create|implement|set up|setup|design|develop|deliver|launch|roll out|rollout|document|configure)\b/;
  const effectSignals = /\b(reduce|increase|improve|decrease|shorten|raise|lower|stabilize|enable|faster|safer|better|more reliable|less)\b/;

  return activityStarts.test(normalized) && !effectSignals.test(normalized);
}

export function analyzeArtifactCandidateCompliance(input: {
  candidate: ArtifactAasCandidate | ArtifactCandidateRecord;
  reviewStatus?: ArtifactCandidateRecord["reviewStatus"];
  draftRecord?: Partial<ArtifactCandidateDraftRecord>;
  humanDecisions?: Partial<ArtifactCandidateHumanDecision>;
}): ArtifactComplianceResult {
  const draftRecord = artifactCandidateDraftRecordSchema.parse({
    ...createArtifactCandidateDraftRecord(input.candidate),
    ...(input.draftRecord ?? {})
  });
  const humanDecisions = artifactCandidateHumanDecisionSchema.parse({
    valueOwnerId: null,
    baselineValidity: null,
    aiAccelerationLevel: null,
    riskProfile: null,
    riskAcceptanceStatus: null,
    ...(input.humanDecisions ?? {})
  });
  const reviewStatus = input.reviewStatus ?? "pending";
  const findings: ArtifactComplianceFinding[] = [];

  if (shouldSurfaceUncertainty(input.candidate, reviewStatus)) {
    if (input.candidate.mappingState !== "mapped") {
      findings.push({
        code: "candidate_mapping_uncertain",
        category: "uncertain",
        message: "The imported candidate interpretation still needs human confirmation.",
        fieldLabel: "Candidate interpretation"
      });
    }

    if (input.candidate.relationshipState !== "mapped") {
      findings.push({
        code: "candidate_relationship_uncertain",
        category: input.candidate.relationshipState === "missing" ? "blocked" : "uncertain",
        message:
          input.candidate.relationshipState === "missing"
            ? input.candidate.relationshipNote ?? "A required Value Spine relationship is missing."
            : input.candidate.relationshipNote ?? "A Value Spine relationship remains uncertain.",
        fieldLabel: "Value Spine linkage"
      });
    }

    if (getCandidateSourceConfidence(input.candidate) !== "high") {
      findings.push({
        code: "source_confidence_below_high",
        category: "uncertain",
        message: "Source confidence is below high and should be checked by a reviewer.",
        fieldLabel: "Source confidence"
      });
    }
  }

  if (input.candidate.type === "outcome") {
    const isComplementingExistingOutcome = Boolean(draftRecord.outcomeCandidateId?.trim());

    if (!isComplementingExistingOutcome && !draftRecord.key?.trim()) {
      findings.push({
        code: "outcome_key_missing",
        category: "missing",
        message: "Outcome key is missing.",
        fieldLabel: "Outcome key"
      });
    }

    if (!isComplementingExistingOutcome && !draftRecord.outcomeStatement?.trim()) {
      findings.push({
        code: "outcome_statement_missing",
        category: "missing",
        message: "Outcome statement is missing.",
        fieldLabel: "Outcome statement"
      });
    }

    if (!isComplementingExistingOutcome && !draftRecord.baselineDefinition?.trim()) {
      findings.push({
        code: "baseline_definition_missing",
        category: "missing",
        message: "Baseline definition is missing.",
        fieldLabel: "Baseline definition"
      });
    }

    if (!isComplementingExistingOutcome && !draftRecord.baselineSource?.trim()) {
      findings.push({
        code: "baseline_source_missing",
        category: "missing",
        message: "Baseline source is missing.",
        fieldLabel: "Baseline source"
      });
    }

    if (draftRecord.outcomeStatement?.trim()) {
      if (looksLikeActivityStatement(draftRecord.outcomeStatement)) {
        findings.push({
          code: "outcome_statement_activity_shaped",
          category: "uncertain",
          message:
            "Outcome statement currently reads more like planned work than an observed effect. Reframe it around the result you want to see, for example: 'Reduce <problem> for <actor> by <metric or time horizon>'.",
          fieldLabel: "Outcome statement"
        });
      } else if (countMeaningfulWords(draftRecord.outcomeStatement) < 6) {
        findings.push({
          code: "outcome_statement_too_thin",
          category: "uncertain",
          message:
            "Outcome statement is present but too thin to confirm the intended effect. Strengthen it with the target change, affected actor, and preferably a measurable direction.",
          fieldLabel: "Outcome statement"
        });
      }
    }

    if (shouldSurfaceUncertainty(input.candidate, reviewStatus) && !isComplementingExistingOutcome && !humanDecisions.valueOwnerId) {
      findings.push({
        code: "value_owner_human_only",
        category: "human_only",
        message: "Value Owner must be confirmed by a human reviewer.",
        fieldLabel: "Value Owner"
      });
    }

    if (shouldSurfaceUncertainty(input.candidate, reviewStatus) && !isComplementingExistingOutcome && !humanDecisions.aiAccelerationLevel) {
      findings.push({
        code: "ai_level_human_only",
        category: "human_only",
        message: "AI level must be confirmed by a human reviewer.",
        fieldLabel: "AI level"
      });
    }

    if (shouldSurfaceUncertainty(input.candidate, reviewStatus) && !isComplementingExistingOutcome && !humanDecisions.riskProfile) {
      findings.push({
        code: "risk_profile_human_only",
        category: "human_only",
        message: "Risk profile must be confirmed by a human reviewer.",
        fieldLabel: "Risk profile"
      });
    }

    if (shouldSurfaceUncertainty(input.candidate, reviewStatus) && !isComplementingExistingOutcome && !humanDecisions.baselineValidity) {
      findings.push({
        code: "baseline_validity_human_only",
        category: "human_only",
        message: "Baseline validity must be explicitly confirmed by a human reviewer.",
        fieldLabel: "Baseline validity"
      });
    }
  }

  if (input.candidate.type === "epic") {
    if (!draftRecord.key?.trim()) {
      findings.push({
        code: "epic_key_missing",
        category: "missing",
        message: "Epic key is missing.",
        fieldLabel: "Epic key"
      });
    }

    if (!draftRecord.outcomeCandidateId?.trim()) {
      findings.push({
        code: "epic_outcome_link_missing",
        category: "blocked",
        message: "Outcome -> Epic linkage is missing.",
        fieldLabel: "Outcome linkage"
      });
    }

    if (shouldSurfaceUncertainty(input.candidate, reviewStatus) && draftRecord.purpose?.trim() && countMeaningfulWords(draftRecord.purpose) < 6) {
      findings.push({
        code: "epic_purpose_too_thin",
        category: "uncertain",
        message:
          "Epic purpose exists but is still too thin to guide decomposition. Strengthen it by naming the capability or business change this Epic delivers and its main boundary.",
        fieldLabel: "Epic purpose"
      });
    }

    if (
      shouldSurfaceUncertainty(input.candidate, reviewStatus) &&
      draftRecord.scopeBoundary?.trim() &&
      (countMeaningfulWords(draftRecord.scopeBoundary) < 4 ||
        normalizeDraftText(draftRecord.scopeBoundary).toLowerCase() === normalizeDraftText(draftRecord.title).toLowerCase())
    ) {
      findings.push({
        code: "epic_scope_boundary_weak",
        category: "uncertain",
        message:
          "Scope boundary is present but too weak to protect decomposition. Clarify what is explicitly in scope, out of scope, or otherwise constrained.",
        fieldLabel: "Scope boundary"
      });
    }
  }

  if (input.candidate.type === "story") {
    if (!draftRecord.valueIntent?.trim()) {
      findings.push({
        code: "story_value_intent_missing",
        category: "missing",
        message: "Value intent is missing.",
        fieldLabel: "Value intent"
      });
    } else if (
      shouldSurfaceUncertainty(input.candidate, reviewStatus) &&
      countMeaningfulWords(draftRecord.valueIntent) < 6
    ) {
      findings.push({
        code: "story_value_intent_too_thin",
        category: "uncertain",
        message:
          "Value intent exists but is too thin to explain why the Story matters. Strengthen it with who benefits, what change is expected, and why the work is valuable.",
        fieldLabel: "Value intent"
      });
    }

    if (
      draftRecord.expectedBehavior?.trim() &&
      shouldSurfaceUncertainty(input.candidate, reviewStatus) &&
      countMeaningfulWords(draftRecord.expectedBehavior) < 6
    ) {
      findings.push({
        code: "story_expected_behavior_too_thin",
        category: "uncertain",
        message:
          "Expected behavior exists but is still too thin to guide design and AI refinement. Describe roughly what should happen when this idea is implemented without turning it into detailed delivery requirements.",
        fieldLabel: "Expected behavior"
      });
    }

    if (!draftRecord.outcomeCandidateId?.trim()) {
      findings.push({
        code: "story_outcome_link_missing",
        category: "blocked",
        message: "Outcome -> Epic -> Story linkage is incomplete because the Outcome is missing.",
        fieldLabel: "Outcome linkage"
      });
    }

    if (!draftRecord.epicCandidateId?.trim()) {
      findings.push({
        code: "story_epic_link_missing",
        category: "blocked",
        message: "Epic -> Story linkage is missing.",
        fieldLabel: "Epic linkage"
      });
    }

  }

  const summary = {
    missing: findings.filter((finding) => finding.category === "missing").length,
    uncertain: findings.filter((finding) => finding.category === "uncertain").length,
    humanOnly: findings.filter((finding) => finding.category === "human_only").length,
    blocked: findings.filter((finding) => finding.category === "blocked").length
  };

  return {
    findings,
    summary,
    promotionBlocked: summary.blocked > 0 || summary.humanOnly > 0 || reviewStatus === "rejected" || reviewStatus === "follow_up_needed",
    humanReviewRequired: summary.uncertain > 0 || summary.humanOnly > 0 || reviewStatus === "pending" || reviewStatus === "follow_up_needed"
  };
}

function isFindingResolvedByDisposition(input: {
  finding: ArtifactComplianceFinding;
  disposition?: ArtifactIssueDisposition | undefined;
}) {
  const action = input.disposition?.action;

  if (!action || action === "pending" || action === "blocked") {
    return false;
  }

  if (input.finding.category === "human_only") {
    return false;
  }

  if (input.finding.category === "missing") {
    return action === "not_relevant";
  }

  if (input.finding.category === "blocked") {
    return action === "not_relevant";
  }

  return action === "confirmed" || action === "not_relevant";
}

function getFindingEffectiveCategory(input: {
  finding: ArtifactComplianceFinding;
  disposition?: ArtifactIssueDisposition | undefined;
}) {
  if (input.disposition?.action === "blocked") {
    return "blocked" as const;
  }

  return input.finding.category;
}

export function getArtifactCandidateIssueProgress(input: {
  complianceResult: ArtifactComplianceResult;
  issueDispositions?: ArtifactIssueDispositionMap | null | undefined;
  unmappedSectionCount?: number | undefined;
  sectionDispositions?: ArtifactIssueDispositionMap | null | undefined;
}): ArtifactIssueProgress {
  const issueDispositions = artifactIssueDispositionMapSchema.parse(input.issueDispositions ?? {});
  const sectionDispositions = artifactIssueDispositionMapSchema.parse(input.sectionDispositions ?? {});
  const categories = {
    missing: 0,
    uncertain: 0,
    humanOnly: 0,
    blocked: 0,
    unmapped: 0
  };
  let resolved = 0;

  for (const finding of input.complianceResult.findings) {
    const disposition = issueDispositions[finding.code];

    if (isFindingResolvedByDisposition({ finding, disposition })) {
      resolved += 1;
      continue;
    }

    const category = getFindingEffectiveCategory({ finding, disposition });

    if (category === "missing") {
      categories.missing += 1;
    } else if (category === "uncertain") {
      categories.uncertain += 1;
    } else if (category === "human_only") {
      categories.humanOnly += 1;
    } else {
      categories.blocked += 1;
    }
  }

  for (const [issueId, disposition] of Object.entries(sectionDispositions)) {
    if (!issueId || !disposition) {
      continue;
    }

    if (disposition.action === "blocked") {
      categories.blocked += 1;
      continue;
    }

    if (disposition.action === "pending") {
      categories.unmapped += 1;
      continue;
    }

    resolved += 1;
  }

  const unmappedSectionCount = input.unmappedSectionCount ?? 0;
  const untouchedUnmapped = Math.max(unmappedSectionCount - Object.keys(sectionDispositions).length, 0);
  categories.unmapped += untouchedUnmapped;

  const unresolved = categories.missing + categories.uncertain + categories.humanOnly + categories.blocked + categories.unmapped;

  return {
    total: input.complianceResult.findings.length + unmappedSectionCount,
    resolved,
    unresolved,
    categories
  };
}

export function inferImportedReadinessState(input: {
  type: ArtifactAasCandidate["type"];
  complianceResult: ArtifactComplianceResult;
  issueDispositions?: ArtifactIssueDispositionMap | null | undefined;
  reviewStatus?: z.infer<typeof artifactCandidateReviewStatusSchema> | null | undefined;
  unmappedSectionCount?: number | undefined;
  sectionDispositions?: ArtifactIssueDispositionMap | null | undefined;
}): z.infer<typeof importedGovernedReadinessStateSchema> {
  if (input.reviewStatus === "rejected") {
    return "discarded";
  }

  const progress = getArtifactCandidateIssueProgress({
    complianceResult: input.complianceResult,
    issueDispositions: input.issueDispositions,
    unmappedSectionCount: input.unmappedSectionCount,
    sectionDispositions: input.sectionDispositions
  });

  if (progress.categories.blocked > 0) {
    return "blocked";
  }

  if (progress.categories.humanOnly > 0) {
    return "imported_human_review_needed";
  }

  if (
    progress.categories.missing > 0 ||
    progress.categories.unmapped > 0 ||
    ((input.reviewStatus === "pending" || input.reviewStatus === "follow_up_needed") && progress.categories.uncertain > 0)
  ) {
    return "imported_incomplete";
  }

  if (input.reviewStatus === "pending" || input.reviewStatus === "follow_up_needed") {
    return "imported_human_review_needed";
  }

  return "imported_framing_ready";
}

export function mapParsedArtifactsToAasCandidates(input: {
  files: Array<{
    id: string;
    fileName: string;
    sourceType: ArtifactSourceClassification["sourceType"] | null | undefined;
    parsedArtifacts: ArtifactParseResult | null | undefined;
  }>;
  importIntent?: "framing" | "design";
}): ArtifactMappingResult {
  const importIntent = input.importIntent ?? "design";
  const candidates: ArtifactAasCandidate[] = [];
  const carryForwardItems: ArtifactCarryForwardItem[] = [];
  const unmappedSections: ArtifactParsedSection[] = [];
  const outcomeCandidateIdByAlias = new Map<string, string>();
  const epicCandidateIdByAlias = new Map<string, string>();
  let lastOutcomeCandidateId: string | null = null;
  let lastEpicCandidateId: string | null = null;
  let lastStoryCandidateIndex: number | null = null;
  let pendingOutcomeContextText: string[] = [];

  for (const file of input.files) {
    pendingOutcomeContextText = [];
    const parsedArtifacts = file.parsedArtifacts;

    if (!parsedArtifacts) {
      continue;
    }

    if (
      file.sourceType === "story_file" &&
      isStructuredStorySpecArtifact({
        fileName: file.fileName,
        content: parsedArtifacts.sections.map((section) => section.text).join("\n\n"),
        sections: parsedArtifacts.sections
      })
    ) {
      const titleSection =
        findStructuredSection(parsedArtifacts.sections, "Title") ??
        findStructuredSection(parsedArtifacts.sections, "Summary") ??
        parsedArtifacts.sections[0];
      const storyTypeSection = findStructuredSection(parsedArtifacts.sections, "Story Type");
      const valueIntentSection = findStructuredSection(parsedArtifacts.sections, "Value Intent");
      const summarySection =
        findStructuredSection(parsedArtifacts.sections, "Summary") ??
        findStructuredSection(parsedArtifacts.sections, "Value Intent") ??
        titleSection;
      const acceptanceCriteriaSection = findStructuredSection(parsedArtifacts.sections, "Acceptance Criteria");
      const aiUsageScopeSection = findStructuredSection(parsedArtifacts.sections, "AI Usage Scope");
      const testDefinitionSection = findStructuredSection(parsedArtifacts.sections, "Test Definition");
      const definitionOfDoneSection = findStructuredSection(parsedArtifacts.sections, "Definition of Done");
      const storyTypeBody = getStructuredSectionBody(storyTypeSection).toLowerCase();
      const storyType =
        storyTypeBody.includes("governance")
          ? "governance"
          : storyTypeBody.includes("enablement")
            ? "enablement"
            : "outcome_delivery";
      const titleText = getStructuredSectionBody(titleSection) || titleSection?.title || "Imported story";
      const summaryText = getStructuredSectionBody(summarySection) || summarySection?.text || titleText;
      const valueIntentText = getStructuredSectionBody(valueIntentSection) || summaryText;
      const acceptanceCriteria = acceptanceCriteriaSection ? extractListItems(acceptanceCriteriaSection.text) : [];
      const aiUsageScope = aiUsageScopeSection ? extractListItems(aiUsageScopeSection.text) : [];
      const testNotes = testDefinitionSection ? extractListItems(testDefinitionSection.text) : [];
      const definitionOfDone = definitionOfDoneSection ? extractListItems(definitionOfDoneSection.text) : [];

      if (titleSection && summarySection) {
        const nextCandidate = adaptStoryCandidateForImportIntent({
          candidate: {
          id: buildArtifactCandidateId({
            fileId: file.id,
            sectionId: titleSection.id,
            candidateType: "story"
          }),
          type: "story",
          title: summarizeText(titleText, 80),
          summary: summarizeText(summaryText),
          mappingState: "mapped",
          source: {
            fileId: titleSection.sourceReference.fileId,
            fileName: titleSection.sourceReference.fileName,
            sectionId: titleSection.sourceReference.sectionId,
            sectionTitle: titleSection.sourceReference.sectionTitle,
            sectionMarker: titleSection.sourceReference.sectionMarker,
            sourceType: file.sourceType,
            confidence: "high"
          },
          inferredOutcomeCandidateId: undefined,
          inferredEpicCandidateId: undefined,
          relationshipState: "missing",
          relationshipNote: "This story spec still needs explicit Outcome and Epic linkage inside the project Value Spine.",
          acceptanceCriteria,
          testNotes,
          draftRecord: {
            title: titleText,
            storyType,
            valueIntent: valueIntentText,
            acceptanceCriteria,
            aiUsageScope,
            testDefinition: testNotes.length > 0 ? testNotes.join("\n") : null,
            definitionOfDone,
            outcomeCandidateId: null,
            epicCandidateId: null
          }
        },
          section: titleSection,
          importIntent
        });

        candidates.push(nextCandidate);
      }

      const consumedTitles = new Set([
        "title",
        "story type",
        "value intent",
        "summary",
        "acceptance criteria",
        "ai usage scope",
        "test definition",
        "definition of done",
        "scope in",
        "scope out",
        "constraints",
        "required evidence"
      ]);

      for (const section of parsedArtifacts.sections) {
        if (consumedTitles.has(normalizeHeading(section.title))) {
          continue;
        }

        if (section.kind === "architecture_notes" || section.kind === "unmapped") {
          const carryForwardItem = createCarryForwardItem(section);

          if (carryForwardItem) {
            carryForwardItems.push(carryForwardItem);
          } else {
            unmappedSections.push(section);
          }
        }
      }

      continue;
    }

    for (const section of parsedArtifacts.sections) {
      if (section.kind === "unmapped" || section.kind === "architecture_notes" || (importIntent === "framing" && isFunctionalRequirementSection(section))) {
        const carryForwardItem = createCarryForwardItem(section);

        if (carryForwardItem) {
          carryForwardItems.push(carryForwardItem);
        } else {
          unmappedSections.push(section);
        }
        continue;
      }

      if (section.kind === "acceptance_criteria") {
        if (importIntent === "framing") {
          const carryForwardItem = createCarryForwardItem(section);

          if (carryForwardItem) {
            carryForwardItems.push(carryForwardItem);
            continue;
          }
        }

        if (lastStoryCandidateIndex !== null) {
          const listItems = extractListItems(section.text);

          if (listItems.length > 0) {
            const lastStoryCandidate = candidates[lastStoryCandidateIndex];

            if (lastStoryCandidate?.type === "story") {
              if (importIntent === "framing") {
                continue;
              }

              lastStoryCandidate.acceptanceCriteria = [...lastStoryCandidate.acceptanceCriteria, ...listItems];
              if (lastStoryCandidate.draftRecord) {
                lastStoryCandidate.draftRecord.acceptanceCriteria = [...lastStoryCandidate.acceptanceCriteria];
              }

              if (section.confidence === "low" && lastStoryCandidate.mappingState === "mapped") {
                lastStoryCandidate.mappingState = "uncertain";
              }
            }

            continue;
          }
        }

        unmappedSections.push(section);
        continue;
      }

      if (section.kind === "test_notes") {
        if (lastStoryCandidateIndex !== null) {
          const lastStoryCandidate = candidates[lastStoryCandidateIndex];

          if (lastStoryCandidate?.type === "story") {
            if (importIntent === "framing") {
              continue;
            }

            lastStoryCandidate.testNotes = [...lastStoryCandidate.testNotes, summarizeText(section.text, 120)];
            if (lastStoryCandidate.draftRecord) {
              lastStoryCandidate.draftRecord.testDefinition = lastStoryCandidate.testNotes.join("\n");
            }

            if (section.confidence === "low" && lastStoryCandidate.mappingState === "mapped") {
              lastStoryCandidate.mappingState = "uncertain";
            }

            continue;
          }
        }

        unmappedSections.push(section);
        continue;
      }

      if (
        section.kind === "problem_goal" ||
        (importIntent === "framing" &&
          section.kind !== "outcome_candidate" &&
          isFramingOutcomeContextSection(section))
      ) {
        if (importIntent === "framing") {
          const contextText = section.text.trim();

          if (lastOutcomeCandidateId) {
            const lastOutcomeCandidate = candidates.find((candidate) => candidate.id === lastOutcomeCandidateId);

            if (lastOutcomeCandidate?.type === "outcome") {
              lastOutcomeCandidate.draftRecord = {
                ...lastOutcomeCandidate.draftRecord,
                problemStatement: mergeArtifactDraftParagraphs([
                  lastOutcomeCandidate.draftRecord?.problemStatement ?? null,
                  contextText
                ])
              };
              continue;
            }
          }

          if (contextText) {
            pendingOutcomeContextText.push(contextText);
            continue;
          }
        }

        unmappedSections.push(section);
        continue;
      }

      const candidateType =
        section.kind === "outcome_candidate" ? "outcome" : section.kind === "epic_candidate" ? "epic" : "story";
      const candidateId = buildArtifactCandidateId({
        fileId: file.id,
        sectionId: section.id,
        candidateType
      });

      let relationshipState: ArtifactAasCandidate["relationshipState"] = "mapped";
      let relationshipNote: string | undefined;
      let inferredOutcomeCandidateId: string | undefined;
      let inferredEpicCandidateId: string | undefined;

      if (candidateType === "outcome") {
        lastOutcomeCandidateId = candidateId;
        lastEpicCandidateId = null;
        lastStoryCandidateIndex = null;
      }

      if (candidateType === "epic") {
        inferredOutcomeCandidateId = lastOutcomeCandidateId ?? undefined;
        const explicitOutcomeLinkKey = normalizeImportedReferenceKey(extractTaggedReferenceValue(section.text, "Outcome Link"));

        if (explicitOutcomeLinkKey) {
          inferredOutcomeCandidateId = outcomeCandidateIdByAlias.get(explicitOutcomeLinkKey) ?? inferredOutcomeCandidateId;
        }

        if (!inferredOutcomeCandidateId && importIntent !== "framing") {
          relationshipState = "missing";
          relationshipNote = "No prior Outcome candidate was available to anchor this Epic relationship.";
        } else {
          relationshipState = section.confidence === "high" ? "mapped" : "uncertain";
          relationshipNote =
            importIntent === "framing"
              ? "Epic is ready to be linked to the current project Outcome during framing approval."
              : relationshipState === "mapped"
              ? "Epic relationship was inferred from nearby Outcome context."
              : "Epic likely belongs to the nearest Outcome candidate, but the relationship remains uncertain.";
        }
        lastEpicCandidateId = candidateId;
        lastStoryCandidateIndex = null;
      }

      if (candidateType === "story") {
        inferredOutcomeCandidateId = lastOutcomeCandidateId ?? undefined;
        inferredEpicCandidateId = lastEpicCandidateId ?? undefined;
        const explicitOutcomeLinkKey = normalizeImportedReferenceKey(extractTaggedReferenceValue(section.text, "Outcome Link"));
        const explicitEpicLinkKey = normalizeImportedReferenceKey(extractTaggedReferenceValue(section.text, "Epic Link"));

        if (explicitOutcomeLinkKey) {
          inferredOutcomeCandidateId = outcomeCandidateIdByAlias.get(explicitOutcomeLinkKey) ?? inferredOutcomeCandidateId;
        }

        if (explicitEpicLinkKey) {
          inferredEpicCandidateId = epicCandidateIdByAlias.get(explicitEpicLinkKey) ?? inferredEpicCandidateId;
        }

        if (!inferredEpicCandidateId || (!inferredOutcomeCandidateId && importIntent !== "framing")) {
          relationshipState = "missing";
          relationshipNote =
            importIntent === "framing"
              ? "Story Idea still needs an Epic destination before approval."
              : "Story relationship inference is incomplete because a prior Outcome or Epic candidate was not found.";
        } else if (section.confidence === "low") {
          relationshipState = "uncertain";
          relationshipNote = "Story relationship is inferred from nearby sections but remains uncertain.";
        }
      }

      const sourceConfidence =
        file.sourceType === "unknown_artifact" && section.confidence === "high" ? "medium" : section.confidence;
      const mappingState =
        file.sourceType === "unknown_artifact" || sourceConfidence === "low" ? "uncertain" : "mapped";
      const acceptanceCriteria = candidateType === "story" ? extractListItems(section.text) : [];
      const testNotes =
        candidateType === "story" && /test|verification|qa/i.test(section.text) ? [summarizeText(section.text, 120)] : [];
      const draftRecord = buildDraftRecordFromParsedSection({
        candidateType,
        section,
        acceptanceCriteria,
        testNotes,
        inferredOutcomeCandidateId,
        inferredEpicCandidateId
      });

      if (candidateType === "outcome" && pendingOutcomeContextText.length > 0) {
        draftRecord.problemStatement = mergeArtifactDraftParagraphs([
          draftRecord.problemStatement ?? null,
          ...pendingOutcomeContextText
        ]);
        pendingOutcomeContextText = [];
      }

      const nextCandidate = adaptStoryCandidateForImportIntent({
        candidate: {
        id: candidateId,
        type: candidateType,
        title: summarizeText(draftRecord.title || section.title, 80),
        summary: summarizeText(
          candidateType === "outcome"
            ? draftRecord.outcomeStatement || section.text
            : candidateType === "epic"
              ? draftRecord.purpose || section.text
              : draftRecord.valueIntent || section.text
        ),
        mappingState,
        source: {
          fileId: section.sourceReference.fileId,
          fileName: section.sourceReference.fileName,
          sectionId: section.sourceReference.sectionId,
          sectionTitle: section.sourceReference.sectionTitle,
          sectionMarker: section.sourceReference.sectionMarker,
          sourceType: file.sourceType ?? "unknown_artifact",
          confidence: sourceConfidence
        },
        inferredOutcomeCandidateId,
        inferredEpicCandidateId,
        relationshipState,
        relationshipNote,
        acceptanceCriteria,
        testNotes,
        draftRecord
      },
        section,
        importIntent
      });

      candidates.push(nextCandidate);

      if (candidateType === "outcome") {
        for (const alias of buildImportedReferenceAliases(draftRecord.key)) {
          outcomeCandidateIdByAlias.set(alias, candidateId);
        }
      }

      if (candidateType === "epic") {
        for (const alias of buildImportedReferenceAliases(draftRecord.key)) {
          epicCandidateIdByAlias.set(alias, candidateId);
        }
      }

      if (candidateType === "story") {
        lastStoryCandidateIndex = candidates.length - 1;
      }
    }
  }

  const normalizedCandidates =
    importIntent === "framing"
      ? relinkExplicitFramingCandidateReferences({
          candidates: normalizeFramingCandidates({
            candidates,
            sections: input.files.flatMap((file) => file.parsedArtifacts?.sections ?? [])
          }),
          sections: input.files.flatMap((file) => file.parsedArtifacts?.sections ?? [])
        })
      : candidates;

  return {
    candidates: normalizedCandidates,
    carryForwardItems,
    unmappedSections
  };
}
