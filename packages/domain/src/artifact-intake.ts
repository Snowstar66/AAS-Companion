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

export const supportedArtifactExtensions = [".md", ".mdx", ".markdown", ".txt"] as const;

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
  processingMode: artifactIntakeProcessingModeSchema.default("deterministic"),
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
    const candidates: Array<{ kind: ArtifactParsedSection["kind"]; confidence: ArtifactParsedSection["confidence"] }> = [];

    if (/problem|goal|objective/.test(title) || /problem statement|objective|goal/.test(text)) {
      candidates.push({
        kind: "problem_goal",
        confidence: confidenceFromSignals(/problem|goal|objective/.test(title) ? 1 : 0, /problem statement|objective|goal/.test(text) ? 1 : 0)
      });
    }

    if (/outcome/.test(title) || /outcome statement|expected outcome|success metric/.test(text)) {
      candidates.push({
        kind: "outcome_candidate",
        confidence: confidenceFromSignals(/outcome/.test(title) ? 1 : 0, /outcome statement|expected outcome|success metric/.test(text) ? 1 : 0)
      });
    }

    if (/epic/.test(title) || /epic key|epic title/.test(text)) {
      candidates.push({
        kind: "epic_candidate",
        confidence: confidenceFromSignals(/epic/.test(title) ? 1 : 0, /epic key|epic title/.test(text) ? 1 : 0)
      });
    }

    if (
      /story/.test(title) ||
      /story[-\s]id|as a .* i want .* so that/.test(text) ||
      (structuredStorySpec && /^(title|summary|story type|value intent)$/i.test(section.title))
    ) {
      candidates.push({
        kind: "story_candidate",
        confidence: confidenceFromSignals(/story/.test(title) ? 1 : 0, /story[-\s]id|as a .* i want .* so that/.test(text) ? 1 : 0)
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

function deriveFramingStoryValueIntent(input: {
  section: ArtifactParsedSection;
  currentValueIntent: string | null | undefined;
  fallbackSummary: string;
}) {
  if (input.currentValueIntent?.trim()) {
    return input.currentValueIntent.trim();
  }

  const narrative = extractStoryNarrative(input.section.text);

  if (narrative?.outcome) {
    return summarizeText(upperCaseFirst(narrative.outcome), 180);
  }

  if (narrative?.intent) {
    return summarizeText(upperCaseFirst(narrative.intent), 180);
  }

  return summarizeText(input.fallbackSummary || input.section.text, 180);
}

function deriveFramingStoryExpectedBehavior(input: {
  section: ArtifactParsedSection;
  currentExpectedBehavior: string | null | undefined;
  fallbackSummary: string;
}) {
  if (input.currentExpectedBehavior?.trim()) {
    return input.currentExpectedBehavior.trim();
  }

  const narrative = extractStoryNarrative(input.section.text);
  const normalizedIntent = narrative?.intent?.replace(/^to\s+/i, "") ?? "";

  if (narrative?.actor && normalizedIntent) {
    return summarizeText(`${upperCaseFirst(narrative.actor)} can ${normalizedIntent}.`, 180);
  }

  if (normalizedIntent) {
    return summarizeText(upperCaseFirst(normalizedIntent), 180);
  }

  return summarizeText(input.fallbackSummary || input.section.text, 180);
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
    currentValueIntent: baseDraftRecord.valueIntent,
    fallbackSummary: input.candidate.summary
  });
  const expectedBehavior = deriveFramingStoryExpectedBehavior({
    section: input.section,
    currentExpectedBehavior: baseDraftRecord.expectedBehavior,
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

function detectCarryForwardSection(section: ArtifactParsedSection) {
  const title = normalizeHeading(section.title);
  const text = normalizeHeading(section.text);

  if (/additional requirement|additional req|open issue|assumption|dependency/.test(title)) {
    return {
      category: "additional_requirement" as const,
      recommendedUse: "design_input" as const
    };
  }

  if (/ux|user experience|usability|design principle/.test(title)) {
    return {
      category: "ux_principle" as const,
      recommendedUse: "design_input" as const
    };
  }

  if (/non[\s-]?functional|nfr|performance|security|availability|privacy|compliance|accessibility|reliability/.test(title)) {
    return {
      category: "nfr_constraint" as const,
      recommendedUse: "cross_cutting_requirement" as const
    };
  }

  if (/constraint|integration|platform|technology|persistence|database|api|hosting|architecture/.test(title)) {
    return {
      category: /wireframe|mockup|screen|page|flow|interaction/.test(text)
        ? ("excluded_design" as const)
        : ("solution_constraint" as const),
      recommendedUse: /wireframe|mockup|screen|page|flow|interaction/.test(text)
        ? ("design_input" as const)
        : ("framing_constraint" as const)
    };
  }

  if (/wireframe|mockup|screen flow|user flow|interaction pattern|page layout|ui flow/.test(title)) {
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

function extractTaggedLineValue(text: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^${escapedLabel}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() ?? "";
}

function extractTaggedLineList(text: string, label: string) {
  return extractTaggedLineValue(text, label)
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
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
  const taggedTitle = extractTaggedLineValue(input.section.text, "Title");

  if (input.candidateType === "outcome") {
    return {
      key: null,
      title: taggedTitle || input.section.title,
      problemStatement: null,
      outcomeStatement: extractTaggedLineValue(input.section.text, "Outcome Statement") || summarizeText(input.section.text),
      baselineDefinition: extractTaggedLineValue(input.section.text, "Baseline Definition") || null,
      baselineSource: extractTaggedLineValue(input.section.text, "Measurement Method") || null,
      timeframe: extractTaggedLineValue(input.section.text, "Timeframe") || null,
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
      key: null,
      title: taggedTitle || input.section.title,
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
    extractTaggedLineValue(input.section.text, "Summary") ||
    null;
  const aiUsageScope = extractTaggedLineList(input.section.text, "AI Usage Scope");
  const definitionOfDone = extractTaggedLineList(input.section.text, "Definition of Done");
  const rawStoryType = extractTaggedLineValue(input.section.text, "Story Type");

  return {
    key: null,
    title: taggedTitle || input.section.title,
    problemStatement: null,
    outcomeStatement: null,
    baselineDefinition: null,
    baselineSource: null,
    timeframe: null,
    purpose: null,
    scopeBoundary: null,
    riskNote: null,
    storyType: normalizeImportedStoryType(rawStoryType, input.section.text),
    valueIntent: valueIntent || summarizeText(input.section.text),
    expectedBehavior,
    acceptanceCriteria: input.acceptanceCriteria,
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
    if (!input.inferredOutcomeCandidateId) {
      return {
        relationshipState: "missing" as const,
        relationshipNote: "No prior Outcome candidate was available to anchor this Epic relationship."
      };
    }

    if (input.confidence === "low") {
      return {
        relationshipState: "uncertain" as const,
        relationshipNote: "Epic likely belongs to the nearest Outcome candidate, but the relationship remains uncertain."
      };
    }

    return {
      relationshipState: "mapped" as const,
      relationshipNote: "Epic relationship was inferred from nearby Outcome context."
    };
  }

  if (!input.inferredOutcomeCandidateId || !input.inferredEpicCandidateId) {
    return {
      relationshipState: "missing" as const,
      relationshipNote: "Story relationship inference is incomplete because a prior Outcome or Epic candidate was not found."
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
      const candidateId = buildArtifactCandidateId({
        fileId: file.id,
        sectionId: sourceSection.id,
        candidateType: interpretedCandidate.type
      });
      candidateIdBySectionAndType.set(`${sourceSection.id}:${interpretedCandidate.type}`, candidateId);
      const explicitOutcomeCandidateId = interpretedCandidate.linkedOutcomeSectionId
        ? candidateIdBySectionAndType.get(`${interpretedCandidate.linkedOutcomeSectionId}:outcome`)
        : undefined;
      const explicitEpicCandidateId = interpretedCandidate.linkedEpicSectionId
        ? candidateIdBySectionAndType.get(`${interpretedCandidate.linkedEpicSectionId}:epic`)
        : undefined;
      const inferredOutcomeCandidateId =
        interpretedCandidate.type === "outcome" ? undefined : explicitOutcomeCandidateId ?? lastOutcomeCandidateId;
      const inferredEpicCandidateId =
        interpretedCandidate.type === "story" ? explicitEpicCandidateId ?? lastEpicCandidateId : undefined;
      const sourceConfidence =
        sourceType === "unknown_artifact" && sourceSection.confidence === "high" ? "medium" : sourceSection.confidence;
      const relationship = resolveAiCandidateRelationshipState({
        candidateType: interpretedCandidate.type,
        explicitRelationshipState: interpretedCandidate.relationshipState,
        explicitRelationshipNote: interpretedCandidate.relationshipNote,
        inferredOutcomeCandidateId,
        inferredEpicCandidateId,
        confidence: sourceSection.confidence
      });

      const nextCandidate = adaptStoryCandidateForImportIntent({
        candidate: {
        id: candidateId,
        type: interpretedCandidate.type,
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

      if (interpretedCandidate.type === "outcome") {
        lastOutcomeCandidateId = candidateId;
        lastEpicCandidateId = undefined;
      }

      if (interpretedCandidate.type === "epic") {
        lastEpicCandidateId = candidateId;
      }
    }

    const leftoverSectionIds = new Set(aiMatch.leftoverSectionIds);

    for (const section of nextSections) {
      if (leftoverSectionIds.has(section.id)) {
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
      ? candidates.map((candidate) => {
          const sourceSection = parseResults
            .flatMap((entry) => entry.parseResult.sections)
            .find((section) => section.sourceReference.fileId === candidate.source.fileId && section.id === candidate.source.sectionId);

          return sourceSection
            ? adaptStoryCandidateForImportIntent({
                candidate,
                section: sourceSection,
                importIntent
              })
            : candidate;
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
    if (!draftRecord.key?.trim()) {
      findings.push({
        code: "outcome_key_missing",
        category: "missing",
        message: "Outcome key is missing.",
        fieldLabel: "Outcome key"
      });
    }

    if (!draftRecord.outcomeStatement?.trim()) {
      findings.push({
        code: "outcome_statement_missing",
        category: "missing",
        message: "Outcome statement is missing.",
        fieldLabel: "Outcome statement"
      });
    }

    if (!draftRecord.baselineDefinition?.trim()) {
      findings.push({
        code: "baseline_definition_missing",
        category: "missing",
        message: "Baseline definition is missing.",
        fieldLabel: "Baseline definition"
      });
    }

    if (!draftRecord.baselineSource?.trim()) {
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

    if (!humanDecisions.valueOwnerId) {
      findings.push({
        code: "value_owner_human_only",
        category: "human_only",
        message: "Value Owner must be confirmed by a human reviewer.",
        fieldLabel: "Value Owner"
      });
    }

    if (!humanDecisions.aiAccelerationLevel) {
      findings.push({
        code: "ai_level_human_only",
        category: "human_only",
        message: "AI level must be confirmed by a human reviewer.",
        fieldLabel: "AI level"
      });
    }

    if (!humanDecisions.riskProfile) {
      findings.push({
        code: "risk_profile_human_only",
        category: "human_only",
        message: "Risk profile must be confirmed by a human reviewer.",
        fieldLabel: "Risk profile"
      });
    }

    if (!humanDecisions.baselineValidity) {
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

    if (!draftRecord.scopeBoundary?.trim()) {
      findings.push({
        code: "epic_scope_boundary_missing",
        category: "missing",
        message: "Scope boundary is missing.",
        fieldLabel: "Scope boundary"
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

    if (!draftRecord.expectedBehavior?.trim()) {
      findings.push({
        code: "story_expected_behavior_missing",
        category: "missing",
        message: "Expected behavior is missing.",
        fieldLabel: "Expected behavior"
      });
    } else if (
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

  if (progress.categories.missing > 0 || progress.categories.uncertain > 0 || progress.categories.unmapped > 0) {
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
  let lastOutcomeCandidateId: string | null = null;
  let lastEpicCandidateId: string | null = null;
  let lastStoryCandidateIndex: number | null = null;

  for (const file of input.files) {
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
      if (section.kind === "unmapped" || section.kind === "architecture_notes") {
        const carryForwardItem = createCarryForwardItem(section);

        if (carryForwardItem) {
          carryForwardItems.push(carryForwardItem);
        } else {
          unmappedSections.push(section);
        }
        continue;
      }

      if (section.kind === "acceptance_criteria") {
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

      if (section.kind === "problem_goal") {
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
        if (!inferredOutcomeCandidateId) {
          relationshipState = "missing";
          relationshipNote = "No prior Outcome candidate was available to anchor this Epic relationship.";
        } else {
          relationshipState = section.confidence === "high" ? "mapped" : "uncertain";
          relationshipNote =
            relationshipState === "mapped"
              ? "Epic relationship was inferred from nearby Outcome context."
              : "Epic likely belongs to the nearest Outcome candidate, but the relationship remains uncertain.";
        }
        lastEpicCandidateId = candidateId;
        lastStoryCandidateIndex = null;
      }

      if (candidateType === "story") {
        inferredOutcomeCandidateId = lastOutcomeCandidateId ?? undefined;
        inferredEpicCandidateId = lastEpicCandidateId ?? undefined;

        if (!inferredEpicCandidateId || !inferredOutcomeCandidateId) {
          relationshipState = "missing";
          relationshipNote = "Story relationship inference is incomplete because a prior Outcome or Epic candidate was not found.";
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

      if (candidateType === "story") {
        lastStoryCandidateIndex = candidates.length - 1;
      }
    }
  }

  const normalizedCandidates =
    importIntent === "framing"
      ? candidates.map((candidate) => {
          const sourceSection = input.files
            .flatMap((file) => file.parsedArtifacts?.sections ?? [])
            .find((section) => section.sourceReference.fileId === candidate.source.fileId && section.id === candidate.source.sectionId);

          return sourceSection
            ? adaptStoryCandidateForImportIntent({
                candidate,
                section: sourceSection,
                importIntent
              })
            : candidate;
        })
      : candidates;

  return {
    candidates: normalizedCandidates,
    carryForwardItems,
    unmappedSections
  };
}
