import { z } from "zod";
import {
  aiAccelerationLevelSchema,
  artifactAasCandidateTypeSchema,
  artifactCandidateReviewStatusSchema,
  artifactComplianceFindingCategorySchema,
  artifactAasMappingStateSchema,
  artifactIntakeSessionStatusSchema,
  artifactParsedSectionKindSchema,
  artifactSourceTypeSchema,
  artifactSourceTypeStatusSchema,
  extractionConfidenceSchema,
  importedGovernedReadinessStateSchema,
  riskProfileSchema,
  storyTypeSchema
} from "./enums";

export const supportedArtifactExtensions = [".md", ".mdx", ".markdown"] as const;

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
  uploadedBy: z.string().nullish(),
  uploadedAt: z.date()
});

export const artifactIntakeSessionRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  label: z.string().min(1),
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
  testNotes: z.array(z.string())
});

export const artifactMappingResultSchema = z.object({
  candidates: z.array(artifactAasCandidateSchema),
  unmappedSections: z.array(artifactParsedSectionSchema)
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
  storyType: storyTypeSchema.nullish(),
  valueIntent: z.string().nullish(),
  acceptanceCriteria: z.array(z.string()).default([]),
  aiUsageScope: z.array(z.string()).default([]),
  testDefinition: z.string().nullish(),
  definitionOfDone: z.array(z.string()).default([]),
  outcomeCandidateId: z.string().nullish(),
  epicCandidateId: z.string().nullish()
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
  humanDecisions: artifactCandidateHumanDecisionSchema.partial().optional()
});

export const artifactCandidatePromotionResultSchema = z.object({
  candidateId: z.string().min(1),
  promotedEntityType: artifactAasCandidateTypeSchema,
  promotedEntityId: z.string().min(1),
  importedReadinessState: importedGovernedReadinessStateSchema
});

export type ArtifactIntakeFileRecord = z.infer<typeof artifactIntakeFileRecordSchema>;
export type ArtifactIntakeSessionRecord = z.infer<typeof artifactIntakeSessionRecordSchema>;
export type ArtifactIntakeUploadRequest = z.infer<typeof artifactIntakeUploadRequestSchema>;
export type ArtifactIntakeRejectedFile = z.infer<typeof artifactIntakeRejectedFileSchema>;
export type ArtifactSourceClassification = z.infer<typeof artifactSourceClassificationSchema>;
export type ArtifactParsedSection = z.infer<typeof artifactParsedSectionSchema>;
export type ArtifactParseResult = z.infer<typeof artifactParseResultSchema>;
export type ArtifactAasCandidate = z.infer<typeof artifactAasCandidateSchema>;
export type ArtifactMappingResult = z.infer<typeof artifactMappingResultSchema>;
export type ArtifactCandidateHumanDecision = z.infer<typeof artifactCandidateHumanDecisionSchema>;
export type ArtifactCandidateDraftRecord = z.infer<typeof artifactCandidateDraftRecordSchema>;
export type ArtifactComplianceFinding = z.infer<typeof artifactComplianceFindingSchema>;
export type ArtifactComplianceResult = z.infer<typeof artifactComplianceResultSchema>;
export type ArtifactCandidateRecord = z.infer<typeof artifactCandidateRecordSchema>;
export type ArtifactCandidateReviewActionInput = z.infer<typeof artifactCandidateReviewActionInputSchema>;
export type ArtifactCandidatePromotionResult = z.infer<typeof artifactCandidatePromotionResultSchema>;

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

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function splitMarkdownSections(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
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
  const classification = classifyArtifactSource(fileName, content);
  const sections = splitMarkdownSections(content);
  const parsedSections: ArtifactParsedSection[] = [];

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

    if (/story/.test(title) || /story[-\s]id|acceptance criteria|as a .* i want .* so that/.test(text)) {
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
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

function buildArtifactCandidateId(input: {
  fileId: string;
  sectionId: string;
  candidateType: ArtifactAasCandidate["type"];
}) {
  return `mapped-${input.fileId}-${input.sectionId}-${input.candidateType}`;
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
      storyType: null,
      valueIntent: null,
      acceptanceCriteria: [],
      aiUsageScope: [],
      testDefinition: null,
      definitionOfDone: [],
      outcomeCandidateId: candidate.inferredOutcomeCandidateId ?? null,
      epicCandidateId: null
    };
  }

  return {
    key: null,
    title: candidate.title,
    problemStatement: null,
    outcomeStatement: null,
    baselineDefinition: null,
    baselineSource: null,
    timeframe: null,
    purpose: null,
    storyType: "outcome_delivery",
    valueIntent: candidate.summary,
    acceptanceCriteria: candidate.acceptanceCriteria,
    aiUsageScope: [],
    testDefinition: candidate.testNotes[0] ?? null,
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
  }

  if (input.candidate.type === "story") {
    if (!draftRecord.key?.trim()) {
      findings.push({
        code: "story_key_missing",
        category: "missing",
        message: "Story-ID is missing.",
        fieldLabel: "Story-ID"
      });
    }

    if (!draftRecord.acceptanceCriteria.length) {
      findings.push({
        code: "story_acceptance_criteria_missing",
        category: "missing",
        message: "Acceptance criteria are missing.",
        fieldLabel: "Acceptance criteria"
      });
    }

    if (!draftRecord.testDefinition?.trim()) {
      findings.push({
        code: "story_test_definition_missing",
        category: "missing",
        message: "Test Definition is missing.",
        fieldLabel: "Test Definition"
      });
      findings.push({
        code: "story_test_link_missing",
        category: "blocked",
        message: "Story -> Test-related definition linkage is missing.",
        fieldLabel: "Test linkage"
      });
    }

    if (!draftRecord.definitionOfDone.length) {
      findings.push({
        code: "story_definition_of_done_missing",
        category: "missing",
        message: "Definition of Done is missing.",
        fieldLabel: "Definition of Done"
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

    if (!humanDecisions.aiAccelerationLevel) {
      findings.push({
        code: "story_ai_level_human_only",
        category: "human_only",
        message: "AI level must be confirmed by a human reviewer.",
        fieldLabel: "AI level"
      });
    }

    if (!humanDecisions.riskAcceptanceStatus) {
      findings.push({
        code: "risk_acceptance_human_only",
        category: "human_only",
        message: "Risk acceptance status must be confirmed by a human reviewer.",
        fieldLabel: "Risk acceptance status"
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

export function inferImportedReadinessState(input: {
  type: ArtifactAasCandidate["type"];
  complianceResult: ArtifactComplianceResult;
}): z.infer<typeof importedGovernedReadinessStateSchema> {
  if (input.complianceResult.summary.blocked > 0) {
    return "blocked";
  }

  if (input.complianceResult.summary.humanOnly > 0) {
    return "imported_human_review_needed";
  }

  if (input.complianceResult.summary.missing > 0 || input.complianceResult.summary.uncertain > 0) {
    return "imported_incomplete";
  }

  return input.type === "story" ? "imported_design_ready" : "imported_framing_ready";
}

export function mapParsedArtifactsToAasCandidates(input: {
  files: Array<{
    id: string;
    fileName: string;
    sourceType: ArtifactSourceClassification["sourceType"] | null | undefined;
    parsedArtifacts: ArtifactParseResult | null | undefined;
  }>;
}): ArtifactMappingResult {
  const candidates: ArtifactAasCandidate[] = [];
  const unmappedSections: ArtifactParsedSection[] = [];
  let lastOutcomeCandidateId: string | null = null;
  let lastEpicCandidateId: string | null = null;
  let lastStoryCandidateIndex: number | null = null;

  for (const file of input.files) {
    const parsedArtifacts = file.parsedArtifacts;

    if (!parsedArtifacts) {
      continue;
    }

    for (const section of parsedArtifacts.sections) {
      if (section.kind === "unmapped" || section.kind === "architecture_notes") {
        unmappedSections.push(section);
        continue;
      }

      if (section.kind === "acceptance_criteria") {
        if (lastStoryCandidateIndex !== null) {
          const listItems = extractListItems(section.text);

          if (listItems.length > 0) {
            const lastStoryCandidate = candidates[lastStoryCandidateIndex];

            if (lastStoryCandidate?.type === "story") {
              lastStoryCandidate.acceptanceCriteria = [...lastStoryCandidate.acceptanceCriteria, ...listItems];

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
            lastStoryCandidate.testNotes = [...lastStoryCandidate.testNotes, summarizeText(section.text, 120)];

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

      candidates.push({
        id: candidateId,
        type: candidateType,
        title: summarizeText(section.title, 80),
        summary: summarizeText(section.text),
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
        testNotes
      });

      if (candidateType === "story") {
        lastStoryCandidateIndex = candidates.length - 1;
      }
    }
  }

  return {
    candidates,
    unmappedSections
  };
}
