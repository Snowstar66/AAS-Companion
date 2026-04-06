import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import {
  analyzeArtifactCandidateCompliance,
  type ArtifactAasCandidate,
  parseFramingConstraintBundle,
  artifactMappingResultSchema,
  artifactCandidateDraftRecordSchema,
  artifactCandidateHumanDecisionSchema,
  artifactIssueDispositionMapSchema,
  artifactCandidateRecordSchema,
  artifactCandidateReviewActionInputSchema,
  createArtifactCandidateDraftRecord,
  getArtifactCandidateIssueProgress,
  inferImportedReadinessState,
  serializeFramingConstraintBundle,
  sanitizeArtifactPersistenceText,
  sanitizeArtifactPersistenceValue
} from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import { createDirectionSeed } from "./direction-seed-repository";
import { createEpic } from "./epic-repository";
import { createOutcome, updateOutcome } from "./outcome-repository";
import { createStory } from "./story-repository";

type DbClient = Prisma.TransactionClient | typeof prisma;
type ParsedArtifactCandidateReviewActionInput = ReturnType<typeof artifactCandidateReviewActionInputSchema.parse>;
const BULK_REVIEW_CHUNK_SIZE = 8;

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getUnmappedSectionContext(input: {
  mappedArtifacts: unknown;
  fileId: string;
  sectionDispositions: unknown;
}) {
  const mapping = artifactMappingResultSchema.safeParse(input.mappedArtifacts);
  const unmappedSectionCount = mapping.success
    ? mapping.data.unmappedSections.filter((section) => section.sourceReference.fileId === input.fileId).length
    : 0;

  return {
    unmappedSectionCount,
    sectionDispositions: artifactIssueDispositionMapSchema.parse(input.sectionDispositions ?? {})
  };
}

function buildImportedFramingCarryForwardBundle(mappedArtifacts: unknown) {
  const mapping = artifactMappingResultSchema.safeParse(mappedArtifacts);

  if (!mapping.success) {
    return {
      solutionContext: null as string | null,
      solutionConstraints: null as string | null
    };
  }

  const sectionedBulletList = (title: string, categories: Array<string>) => {
    const lines = mapping.data.carryForwardItems
      .filter((item) => categories.includes(item.category))
      .map((item) => `- ${item.title}: ${item.summary}`);

    if (lines.length === 0) {
      return "";
    }

    return [`${title}`, ...lines].join("\n");
  };
  const solutionConstraints = serializeFramingConstraintBundle({
    generalConstraints: [sectionedBulletList("Imported constraints", ["solution_constraint"]), sectionedBulletList("Imported design notes", ["excluded_design"])]
      .filter(Boolean)
      .join("\n\n"),
    uxPrinciples: sectionedBulletList("Imported UX input", ["ux_principle"]),
    nonFunctionalRequirements: sectionedBulletList("Imported non-functional requirements", ["nfr_constraint"]),
    additionalRequirements: sectionedBulletList("Imported additional requirements", ["additional_requirement"])
  });

  return {
    solutionContext: null,
    solutionConstraints
  };
}

function lineList(value: string | null | undefined) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function mergeUniqueLines(existingValue: string | null | undefined, nextValue: string | null | undefined) {
  const merged = [...new Set([...lineList(existingValue), ...lineList(nextValue)])];
  return merged.length > 0 ? merged.join("\n") : "";
}

function isCarryForwardApproved(action: string | undefined) {
  return action === "confirmed" || action === "corrected";
}

function recommendedUseForCarryForwardCategory(category: "ux_principle" | "nfr_constraint" | "solution_constraint" | "additional_requirement" | "excluded_design") {
  if (category === "ux_principle" || category === "excluded_design") {
    return "design_input" as const;
  }

  if (category === "nfr_constraint") {
    return "cross_cutting_requirement" as const;
  }

  return "framing_constraint" as const;
}

function buildImportedFramingCarryForwardBundleForFile(input: {
  mappedArtifacts: unknown;
  fileId: string;
  sectionDispositions: unknown;
}) {
  const mapping = artifactMappingResultSchema.safeParse(input.mappedArtifacts);
  const sectionDispositions = artifactIssueDispositionMapSchema.parse(input.sectionDispositions ?? {});

  if (!mapping.success) {
    return {
      solutionContext: null as string | null,
      solutionConstraints: null as string | null
    };
  }

  const fileItems = mapping.data.carryForwardItems.filter(
    (item) => item.sourceSection.sourceReference.fileId === input.fileId
  );

  if (fileItems.length === 0) {
    return {
      solutionContext: null as string | null,
      solutionConstraints: null as string | null
    };
  }

  const includedItems = fileItems.filter((item) => isCarryForwardApproved(sectionDispositions[item.sourceSection.id]?.action));

  const scopedMapping = {
    ...mapping.data,
    carryForwardItems: includedItems
  };

  return buildImportedFramingCarryForwardBundle(scopedMapping);
}

function mergeFramingConstraintBundleText(input: {
  existing: string | null | undefined;
  next: string | null | undefined;
}) {
  const existingBundle = parseFramingConstraintBundle(input.existing);
  const nextBundle = parseFramingConstraintBundle(input.next);

  return serializeFramingConstraintBundle({
    generalConstraints: mergeUniqueLines(existingBundle.generalConstraints, nextBundle.generalConstraints),
    uxPrinciples: mergeUniqueLines(existingBundle.uxPrinciples, nextBundle.uxPrinciples),
    nonFunctionalRequirements: mergeUniqueLines(
      existingBundle.nonFunctionalRequirements,
      nextBundle.nonFunctionalRequirements
    ),
    additionalRequirements: mergeUniqueLines(
      existingBundle.additionalRequirements,
      nextBundle.additionalRequirements
    )
  });
}

function buildNextSimpleKey(existingKeys: string[], prefix: string) {
  const numericKeys = existingKeys
    .map((key) => new RegExp(`^${prefix}-(\\d+)$`, "i").exec(key)?.[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  const nextNumber = (numericKeys.length > 0 ? Math.max(...numericKeys) : 0) + 1;
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

function getSimpleKeyPrefix(input: {
  type: "outcome" | "epic" | "story";
  importIntent?: "framing" | "design" | undefined;
}) {
  if (input.type === "outcome") {
    return "OUT";
  }

  if (input.type === "epic") {
    return "EPC";
  }

  return input.importIntent === "framing" ? "SC" : "STR";
}

function isLegacyImportKey(value: string | null | undefined) {
  return /^IMP-(OUT|EPC|STR|STORY)-/i.test(value?.trim() ?? "");
}

async function resolvePreferredProjectOutcomeId(db: DbClient, organizationId: string) {
  const outcomes = await db.outcome.findMany({
    where: {
      organizationId,
      lifecycleState: "active"
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      originType: true
    }
  });

  return outcomes.find((outcome) => outcome.originType === "native")?.id ?? outcomes[0]?.id ?? null;
}

async function resolveNextGovernedKey(input: {
  db: DbClient;
  organizationId: string;
  entityType: "outcome" | "epic" | "story" | "direction_seed";
  requestedKey: string | null | undefined;
  importIntent?: "framing" | "design";
}) {
  const normalizedRequestedKey = input.requestedKey?.trim() ?? "";
  const isLegacyImportKey = /^IMP-(OUT|EPC|STR|STORY)-/i.test(normalizedRequestedKey);

  const prefix =
    input.entityType === "outcome"
      ? "OUT"
      : input.entityType === "epic"
        ? "EPC"
        : input.entityType === "direction_seed"
          ? "SC"
          : "STR";

  const existingKeys =
    input.entityType === "outcome"
      ? (
          await input.db.outcome.findMany({
            where: { organizationId: input.organizationId },
            select: { key: true }
          })
        ).map((record) => record.key)
      : input.entityType === "epic"
        ? (
            await input.db.epic.findMany({
              where: { organizationId: input.organizationId },
              select: { key: true }
            })
          ).map((record) => record.key)
        : input.entityType === "direction_seed"
          ? (
              await input.db.directionSeed.findMany({
                where: { organizationId: input.organizationId },
                select: { key: true }
              })
            ).map((record) => record.key)
          : (
              await input.db.story.findMany({
                where: { organizationId: input.organizationId },
                select: { key: true }
              })
            ).map((record) => record.key);

  if (normalizedRequestedKey && !isLegacyImportKey && !existingKeys.includes(normalizedRequestedKey)) {
    return normalizedRequestedKey;
  }

  return buildNextSimpleKey(existingKeys, prefix);
}

async function mergeApprovedCarryForwardIntoOutcome(input: {
  db: DbClient;
  organizationId: string;
  outcomeId: string;
  mappedArtifacts: unknown;
  fileId: string;
  sectionDispositions: unknown;
}) {
  const importedCarryForward = buildImportedFramingCarryForwardBundleForFile({
    mappedArtifacts: input.mappedArtifacts,
    fileId: input.fileId,
    sectionDispositions: input.sectionDispositions
  });

  if (!importedCarryForward.solutionConstraints) {
    return;
  }

  const existingOutcome = await input.db.outcome.findFirst({
    where: {
      organizationId: input.organizationId,
      id: input.outcomeId
    },
    select: {
      id: true,
      solutionConstraints: true
    }
  });

  if (!existingOutcome) {
    return;
  }

  const mergedConstraints = mergeFramingConstraintBundleText({
    existing: existingOutcome.solutionConstraints,
    next: importedCarryForward.solutionConstraints
  });

  if (mergedConstraints === existingOutcome.solutionConstraints) {
    return;
  }

  await input.db.outcome.update({
    where: {
      id: existingOutcome.id
    },
    data: {
      solutionConstraints: mergedConstraints
    }
  });
}

export async function applyApprovedArtifactFileCarryForwardToOutcome(input: {
  organizationId: string;
  outcomeId: string;
  fileId: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const file = await tx.artifactIntakeFile.findFirst({
      where: {
        organizationId: input.organizationId,
        id: input.fileId
      },
      select: {
        id: true,
        sectionDispositions: true,
        intakeSession: {
          select: {
            mappedArtifacts: true
          }
        }
      }
    });

    if (!file) {
      throw new Error("Artifact file was not found in organization scope.");
    }

    await mergeApprovedCarryForwardIntoOutcome({
      db: tx,
      organizationId: input.organizationId,
      outcomeId: input.outcomeId,
      mappedArtifacts: file.intakeSession.mappedArtifacts ?? null,
      fileId: file.id,
      sectionDispositions: file.sectionDispositions ?? null
    });

    await appendActivityEvent(
      {
        organizationId: input.organizationId,
        entityType: "artifact_intake_file",
        entityId: file.id,
        eventType: "artifact_file_carry_forward_applied",
        actorId: input.actorId ?? null,
        metadata: {
          outcomeId: input.outcomeId
        }
      },
      tx
    );

    return {
      ok: true as const,
      outcomeId: input.outcomeId,
      fileId: file.id
    };
  });
}

export async function updateArtifactFileCarryForwardItems(input: {
  organizationId: string;
  fileId: string;
  updates: Array<{
    sectionId: string;
    title: string;
    summary: string;
    category: "ux_principle" | "nfr_constraint" | "solution_constraint" | "additional_requirement" | "excluded_design";
  }>;
}) {
  return prisma.$transaction(async (tx) => {
    const file = await tx.artifactIntakeFile.findFirst({
      where: {
        organizationId: input.organizationId,
        id: input.fileId
      },
      select: {
        intakeSessionId: true,
        intakeSession: {
          select: {
            mappedArtifacts: true
          }
        }
      }
    });

    if (!file) {
      throw new Error("Artifact file was not found in organization scope.");
    }

    const mapping = artifactMappingResultSchema.safeParse(file.intakeSession.mappedArtifacts);

    if (!mapping.success) {
      return {
        ok: true as const,
        updatedCount: 0
      };
    }

    const updatesBySectionId = new Map(
      input.updates
        .filter((update) => update.sectionId.trim() && update.title.trim() && update.summary.trim())
        .map((update) => [update.sectionId, update] as const)
    );

    let updatedCount = 0;
    const carryForwardItems = mapping.data.carryForwardItems.map((item) => {
      if (item.sourceSection.sourceReference.fileId !== input.fileId) {
        return item;
      }

      const update = updatesBySectionId.get(item.sourceSection.id);

      if (!update) {
        return item;
      }

      updatedCount += 1;

      return sanitizeArtifactPersistenceValue({
        ...item,
        title: sanitizeArtifactPersistenceText(update.title),
        summary: sanitizeArtifactPersistenceText(update.summary),
        category: update.category,
        recommendedUse: recommendedUseForCarryForwardCategory(update.category)
      });
    });

    if (updatedCount === 0) {
      return {
        ok: true as const,
        updatedCount
      };
    }

    await tx.artifactIntakeSession.update({
      where: {
        id: file.intakeSessionId
      },
      data: {
        mappedArtifacts: sanitizeArtifactPersistenceValue({
          ...mapping.data,
          carryForwardItems
        }) as Prisma.InputJsonValue
      }
    });

    return {
      ok: true as const,
      updatedCount
    };
  });
}

function clearPendingUnmappedSectionsForRejectedFile(input: {
  mappedArtifacts: unknown;
  fileId: string;
  sectionDispositions: unknown;
}) {
  const mapping = artifactMappingResultSchema.safeParse(input.mappedArtifacts);
  const sectionDispositions = artifactIssueDispositionMapSchema.parse(input.sectionDispositions ?? {});

  if (!mapping.success) {
    return {
      changed: false,
      sectionDispositions
    };
  }

  let changed = false;
  const next = { ...sectionDispositions };

  for (const section of mapping.data.unmappedSections) {
    if (section.sourceReference.fileId !== input.fileId) {
      continue;
    }

    const existing = next[section.id];
    if (existing && existing.action !== "pending" && existing.action !== "blocked") {
      continue;
    }

    next[section.id] = sanitizeArtifactPersistenceValue({
      issueId: section.id,
      action: "not_relevant",
      note: "Cleared when the final active candidate for this artifact was rejected."
    });
    changed = true;
  }

  return {
    changed,
    sectionDispositions: artifactIssueDispositionMapSchema.parse(next)
  };
}

function parseCandidateRecord(candidate: {
  id: string;
  intakeSessionId: string;
  organizationId: string;
  fileId: string;
  type: "outcome" | "epic" | "story";
  title: string;
  summary: string;
  mappingState: "mapped" | "uncertain" | "missing";
  sourceType: "bmad_prd" | "epic_file" | "story_file" | "mixed_markdown_bundle" | "unknown_artifact";
  sourceConfidence: "high" | "medium" | "low";
  sourceSectionId: string;
  sourceSectionTitle: string;
  sourceSectionMarker: string;
  inferredOutcomeCandidateId: string | null;
  inferredEpicCandidateId: string | null;
  relationshipState: "mapped" | "uncertain" | "missing";
  relationshipNote: string | null;
  acceptanceCriteria: string[];
  testNotes: string[];
  draftRecord: unknown;
  humanDecisions: unknown;
  complianceResult: unknown;
  issueDispositions: unknown;
  reviewStatus: "pending" | "confirmed" | "edited" | "rejected" | "follow_up_needed" | "promoted";
  reviewComment: string | null;
  followUpNeeded: boolean;
  importedReadinessState:
    | "imported"
    | "imported_incomplete"
    | "imported_human_review_needed"
    | "imported_framing_ready"
    | "imported_design_ready"
    | "blocked"
    | "discarded"
    | null;
  promotedEntityType: "outcome" | "epic" | "story" | null;
  promotedEntityId: string | null;
  promotedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return artifactCandidateRecordSchema.parse({
    ...candidate,
    draftRecord: artifactCandidateDraftRecordSchema.parse(candidate.draftRecord),
    humanDecisions: artifactCandidateHumanDecisionSchema.parse(candidate.humanDecisions),
    complianceResult: candidate.complianceResult,
    issueDispositions: artifactIssueDispositionMapSchema.parse(candidate.issueDispositions ?? {})
  });
}

function deriveImportedReadinessState(input: {
  reviewStatus: "pending" | "confirmed" | "edited" | "rejected" | "follow_up_needed" | "promoted";
  complianceResult: ReturnType<typeof analyzeArtifactCandidateCompliance>;
  candidateType: "outcome" | "epic" | "story";
  issueDispositions?: Record<string, unknown> | null;
  unmappedSectionCount?: number | undefined;
  sectionDispositions?: Record<string, unknown> | null;
}) {
  return inferImportedReadinessState({
    type: input.candidateType,
    complianceResult: input.complianceResult,
    issueDispositions: artifactIssueDispositionMapSchema.parse(input.issueDispositions ?? {}),
    reviewStatus: input.reviewStatus,
    unmappedSectionCount: input.unmappedSectionCount,
    sectionDispositions: artifactIssueDispositionMapSchema.parse(input.sectionDispositions ?? {})
  });
}

export async function createPersistedArtifactCandidates(input: {
  organizationId: string;
  intakeSessionId: string;
  candidates: ArtifactAasCandidate[];
  importIntent?: "framing" | "design";
}, db: DbClient = prisma) {
  const importIntent = input.importIntent ?? "framing";
  const preferredOutcomeId =
    importIntent === "framing" ? await resolvePreferredProjectOutcomeId(db, input.organizationId) : null;
  const [existingOutcomeKeys, existingEpicKeys, existingStoryIdeaKeys, existingStoryKeys] = await Promise.all([
    db.outcome.findMany({
      where: { organizationId: input.organizationId },
      select: { key: true }
    }),
    db.epic.findMany({
      where: { organizationId: input.organizationId },
      select: { key: true }
    }),
    db.directionSeed.findMany({
      where: { organizationId: input.organizationId },
      select: { key: true }
    }),
    db.story.findMany({
      where: { organizationId: input.organizationId },
      select: { key: true }
    })
  ]);
  const reservedKeysByPrefix = {
    OUT: new Set(existingOutcomeKeys.map((record) => record.key)),
    EPC: new Set(existingEpicKeys.map((record) => record.key)),
    SC: new Set(existingStoryIdeaKeys.map((record) => record.key)),
    STR: new Set(existingStoryKeys.map((record) => record.key))
  };
  const candidateRows: Prisma.ArtifactAasCandidateUncheckedCreateInput[] = [];
  const activityRows: Prisma.ActivityEventUncheckedCreateInput[] = [];

  function assignDraftKey(inputKey: {
    type: "outcome" | "epic" | "story";
    requestedKey: string | null | undefined;
  }) {
    const prefix = getSimpleKeyPrefix({
      type: inputKey.type,
      importIntent
    });
    const reservedKeys = reservedKeysByPrefix[prefix];
    const normalizedRequestedKey = inputKey.requestedKey?.trim() ?? "";

    if (normalizedRequestedKey && !isLegacyImportKey(normalizedRequestedKey) && !reservedKeys.has(normalizedRequestedKey)) {
      reservedKeys.add(normalizedRequestedKey);
      return normalizedRequestedKey;
    }

    const nextKey = buildNextSimpleKey([...reservedKeys], prefix);
    reservedKeys.add(nextKey);
    return nextKey;
  }

  for (const candidate of input.candidates) {
    const sanitizedCandidate = sanitizeArtifactPersistenceValue(candidate);
    const draftRecord = sanitizeArtifactPersistenceValue(
      artifactCandidateDraftRecordSchema.parse({
        ...createArtifactCandidateDraftRecord(sanitizedCandidate),
        ...(sanitizedCandidate.draftRecord ?? {}),
        ...(
          importIntent === "framing" &&
          preferredOutcomeId &&
          sanitizedCandidate.type !== "outcome" &&
          !sanitizedCandidate.inferredOutcomeCandidateId &&
          !(sanitizedCandidate.draftRecord?.outcomeCandidateId?.trim())
            ? {
                outcomeCandidateId: preferredOutcomeId
              }
            : {}
        ),
        key: assignDraftKey({
          type: sanitizedCandidate.type,
          requestedKey: sanitizedCandidate.draftRecord?.key ?? null
        })
      })
    );
    const humanDecisions = sanitizeArtifactPersistenceValue(artifactCandidateHumanDecisionSchema.parse({
      valueOwnerId: null,
      baselineValidity: null,
      aiAccelerationLevel: null,
      riskProfile: null,
      riskAcceptanceStatus: null
    }));
    const issueDispositions = artifactIssueDispositionMapSchema.parse({});
    const complianceResult = analyzeArtifactCandidateCompliance({
      candidate: sanitizedCandidate,
      draftRecord,
      humanDecisions,
      reviewStatus: "pending"
    });
    const importedReadinessState = deriveImportedReadinessState({
      reviewStatus: "pending",
      complianceResult,
      candidateType: candidate.type,
      issueDispositions
    });

    candidateRows.push({
      id: candidate.id,
      organizationId: input.organizationId,
      intakeSessionId: input.intakeSessionId,
      fileId: sanitizedCandidate.source.fileId,
      type: sanitizedCandidate.type,
      title: sanitizedCandidate.title,
      summary: sanitizedCandidate.summary,
      mappingState: sanitizedCandidate.mappingState,
      sourceType: sanitizedCandidate.source.sourceType,
      sourceConfidence: sanitizedCandidate.source.confidence,
      sourceSectionId: sanitizedCandidate.source.sectionId,
      sourceSectionTitle: sanitizedCandidate.source.sectionTitle,
      sourceSectionMarker: sanitizedCandidate.source.sectionMarker,
      inferredOutcomeCandidateId: sanitizedCandidate.inferredOutcomeCandidateId ?? null,
      inferredEpicCandidateId: sanitizedCandidate.inferredEpicCandidateId ?? null,
      relationshipState: sanitizedCandidate.relationshipState,
      relationshipNote: sanitizedCandidate.relationshipNote ?? null,
      acceptanceCriteria: sanitizedCandidate.acceptanceCriteria,
      testNotes: sanitizedCandidate.testNotes,
      draftRecord: draftRecord as Prisma.InputJsonValue,
      humanDecisions: humanDecisions as Prisma.InputJsonValue,
      complianceResult: complianceResult as Prisma.InputJsonValue,
      issueDispositions: issueDispositions as Prisma.InputJsonValue,
      reviewStatus: "pending",
      reviewComment: null,
      followUpNeeded: false,
      importedReadinessState
    });
    activityRows.push({
      id: randomUUID(),
      organizationId: input.organizationId,
      entityType: "artifact_aas_candidate",
      entityId: candidate.id,
      eventType: "artifact_candidate_compliance_analyzed",
      actorId: null,
      metadata: {
        intakeSessionId: input.intakeSessionId,
        fileId: sanitizedCandidate.source.fileId,
        type: sanitizedCandidate.type,
        summary: complianceResult.summary
      } as Prisma.InputJsonValue
    });
  }

  if (candidateRows.length === 0) {
    return [];
  }

  await db.artifactAasCandidate.createMany({
    data: candidateRows
  });

  await db.activityEvent.createMany({
    data: activityRows
  });
}

export async function listArtifactCandidatesForOrganization(organizationId: string) {
  return prisma.artifactAasCandidate.findMany({
    where: { organizationId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      intakeSessionId: true,
      organizationId: true,
      fileId: true,
      type: true,
      title: true,
      summary: true,
      mappingState: true,
      sourceType: true,
      sourceConfidence: true,
      sourceSectionId: true,
      sourceSectionTitle: true,
      sourceSectionMarker: true,
      inferredOutcomeCandidateId: true,
      inferredEpicCandidateId: true,
      relationshipState: true,
      relationshipNote: true,
      acceptanceCriteria: true,
      testNotes: true,
      draftRecord: true,
      humanDecisions: true,
      complianceResult: true,
      issueDispositions: true,
      reviewStatus: true,
      reviewComment: true,
      followUpNeeded: true,
      importedReadinessState: true,
      promotedEntityType: true,
      promotedEntityId: true,
      promotedAt: true,
      createdAt: true,
      updatedAt: true,
      intakeSession: {
        select: {
          id: true,
          label: true,
          importIntent: true
        }
      },
      file: {
        select: {
          id: true,
          fileName: true
        }
      }
    }
  });
}

export async function getArtifactCandidateById(organizationId: string, candidateId: string) {
  return prisma.artifactAasCandidate.findFirst({
    where: {
      organizationId,
      id: candidateId
    },
    include: {
      intakeSession: true,
      file: true
    }
  });
}

async function loadReviewCandidate(
  tx: Prisma.TransactionClient,
  organizationId: string,
  candidateId: string
) {
  return tx.artifactAasCandidate.findFirst({
    where: {
      organizationId,
      id: candidateId
    }
  });
}

async function loadReviewFile(
  tx: Prisma.TransactionClient,
  organizationId: string,
  fileId: string
) {
  return tx.artifactIntakeFile.findFirst({
    where: {
      organizationId,
      id: fileId
    },
    select: {
      id: true,
      sectionDispositions: true,
      intakeSession: {
        select: {
          mappedArtifacts: true
        }
      }
    }
  });
}

type ReviewCandidateRecord = NonNullable<Awaited<ReturnType<typeof loadReviewCandidate>>>;
type ReviewFileRecord = NonNullable<Awaited<ReturnType<typeof loadReviewFile>>>;
type PromotionCandidateRecord = Prisma.ArtifactAasCandidateGetPayload<{
  include: {
    intakeSession: {
      select: {
        importIntent: true;
      };
    };
  };
}>;
type PromoteArtifactCandidateInput = {
  organizationId: string;
  candidateId: string;
  actorId?: string | null;
  disableAutoPromoteDependencies?: boolean;
};
type PromotionState = {
  seen: Set<string>;
  candidateCache: Map<string, PromotionCandidateRecord | null>;
  outcomeCache: Map<string, Awaited<ReturnType<Prisma.TransactionClient["outcome"]["findFirst"]>> | null>;
  epicCache: Map<string, Awaited<ReturnType<Prisma.TransactionClient["epic"]["findFirst"]>> | null>;
  fileCache: Map<string, ReviewFileRecord | null>;
  preferredProjectOutcomeId: string | null | undefined;
};

function createPromotionState(): PromotionState {
  return {
    seen: new Set<string>(),
    candidateCache: new Map<string, PromotionCandidateRecord | null>(),
    outcomeCache: new Map<string, Awaited<ReturnType<Prisma.TransactionClient["outcome"]["findFirst"]>> | null>(),
    epicCache: new Map<string, Awaited<ReturnType<Prisma.TransactionClient["epic"]["findFirst"]>> | null>(),
    fileCache: new Map<string, ReviewFileRecord | null>(),
    preferredProjectOutcomeId: undefined
  };
}

async function reviewArtifactCandidateWithinTransaction(
  parsed: ParsedArtifactCandidateReviewActionInput,
  tx: Prisma.TransactionClient,
  preloaded?: {
    existing?: ReviewCandidateRecord | null;
    file?: ReviewFileRecord | null;
  }
) {
    const existing = preloaded?.existing ?? await loadReviewCandidate(tx, parsed.organizationId, parsed.candidateId);

    if (!existing) {
      throw new Error("Artifact candidate was not found in organization scope.");
    }

    const file =
      preloaded?.file !== undefined
        ? preloaded.file
        : await loadReviewFile(tx, parsed.organizationId, existing.fileId);

    const draftRecord = sanitizeArtifactPersistenceValue(artifactCandidateDraftRecordSchema.parse({
      ...artifactCandidateDraftRecordSchema.parse(existing.draftRecord),
      ...(parsed.draftRecord ?? {})
    }));
    const humanDecisions = sanitizeArtifactPersistenceValue(artifactCandidateHumanDecisionSchema.parse({
      ...artifactCandidateHumanDecisionSchema.parse(existing.humanDecisions),
      ...(parsed.humanDecisions ?? {})
    }));
    const issueDispositions = artifactIssueDispositionMapSchema.parse({
      ...(artifactIssueDispositionMapSchema.parse(existing.issueDispositions ?? {})),
      ...(parsed.issueDisposition
        ? {
            [parsed.issueDisposition.issueId]: sanitizeArtifactPersistenceValue(parsed.issueDisposition)
          }
        : {})
    });
    const candidateShape = sanitizeArtifactPersistenceValue({
      id: existing.id,
      type: existing.type,
      title: existing.title,
      summary: existing.summary,
      mappingState: existing.mappingState,
      source: {
        fileId: existing.fileId,
        fileName: existing.sourceSectionTitle,
        sectionId: existing.sourceSectionId,
        sectionTitle: existing.sourceSectionTitle,
        sectionMarker: existing.sourceSectionMarker,
        sourceType: existing.sourceType,
        confidence: existing.sourceConfidence
      },
      inferredOutcomeCandidateId: existing.inferredOutcomeCandidateId,
      inferredEpicCandidateId: existing.inferredEpicCandidateId,
      relationshipState: existing.relationshipState,
      relationshipNote: existing.relationshipNote,
      acceptanceCriteria: existing.acceptanceCriteria,
      testNotes: existing.testNotes
    } as const);
    const complianceResult = analyzeArtifactCandidateCompliance({
      candidate: candidateShape,
      reviewStatus: parsed.reviewStatus,
      draftRecord,
      humanDecisions
    });
    let effectiveSectionDispositions = artifactIssueDispositionMapSchema.parse(file?.sectionDispositions ?? {});

    if (parsed.reviewStatus === "rejected" && file) {
      const otherActiveCandidates = await tx.artifactAasCandidate.count({
        where: {
          organizationId: parsed.organizationId,
          fileId: existing.fileId,
          id: { not: existing.id },
          reviewStatus: {
            notIn: ["rejected", "promoted"]
          }
        }
      });

      if (otherActiveCandidates === 0) {
        const clearedSections = clearPendingUnmappedSectionsForRejectedFile({
          mappedArtifacts: file.intakeSession.mappedArtifacts ?? null,
          fileId: existing.fileId,
          sectionDispositions: effectiveSectionDispositions
        });

        effectiveSectionDispositions = clearedSections.sectionDispositions;

        if (clearedSections.changed) {
          await tx.artifactIntakeFile.update({
            where: { id: file.id },
            data: {
              sectionDispositions: effectiveSectionDispositions as Prisma.InputJsonValue
            }
          });
        }
      }
    }

    const unmappedSectionContext = getUnmappedSectionContext({
      mappedArtifacts: file?.intakeSession.mappedArtifacts ?? null,
      fileId: existing.fileId,
      sectionDispositions: effectiveSectionDispositions
    });
    const reviewComment = parsed.reviewComment ? sanitizeArtifactPersistenceText(parsed.reviewComment) : null;
    const importedReadinessState = deriveImportedReadinessState({
      reviewStatus: parsed.reviewStatus,
      complianceResult,
      candidateType: existing.type,
      issueDispositions,
      unmappedSectionCount: unmappedSectionContext.unmappedSectionCount,
      sectionDispositions: unmappedSectionContext.sectionDispositions
    });
    const issueProgress = getArtifactCandidateIssueProgress({
      complianceResult,
      issueDispositions,
      unmappedSectionCount: unmappedSectionContext.unmappedSectionCount,
      sectionDispositions: unmappedSectionContext.sectionDispositions
    });

    const updated = await tx.artifactAasCandidate.update({
      where: { id: existing.id },
      data: {
        draftRecord: draftRecord as Prisma.InputJsonValue,
        humanDecisions: humanDecisions as Prisma.InputJsonValue,
        complianceResult: complianceResult as Prisma.InputJsonValue,
        issueDispositions: issueDispositions as Prisma.InputJsonValue,
        reviewStatus: parsed.reviewStatus,
        reviewComment,
        followUpNeeded: parsed.reviewStatus === "follow_up_needed",
        importedReadinessState
      }
    });

    const eventType =
      parsed.reviewStatus === "confirmed"
        ? "artifact_candidate_confirmed"
        : parsed.reviewStatus === "edited"
          ? "artifact_candidate_edited"
          : parsed.reviewStatus === "rejected"
            ? "artifact_candidate_rejected"
            : "artifact_candidate_follow_up_marked";

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "artifact_aas_candidate",
        entityId: updated.id,
        eventType,
        actorId: parsed.actorId ?? null,
        metadata: {
          reviewStatus: updated.reviewStatus,
          complianceSummary: complianceResult.summary,
          importedReadinessState,
          issueProgress
        }
      },
      tx
    );

    if (parsed.issueDisposition) {
      await appendActivityEvent(
        {
          organizationId: parsed.organizationId,
          entityType: "artifact_aas_candidate",
          entityId: updated.id,
          eventType: "artifact_candidate_issue_disposition_recorded",
          actorId: parsed.actorId ?? null,
          metadata: {
            issueId: parsed.issueDisposition.issueId,
            action: parsed.issueDisposition.action,
            note: parsed.issueDisposition.note ?? null,
            importedReadinessState
          }
        },
        tx
      );
    }

    return parseCandidateRecord(updated);
}

export async function reviewArtifactCandidate(input: unknown) {
  const parsed = artifactCandidateReviewActionInputSchema.parse(input);

  return prisma.$transaction(async (tx) => reviewArtifactCandidateWithinTransaction(parsed, tx));
}

export async function reviewArtifactCandidatesBulk(inputs: unknown[]) {
  const parsedInputs = inputs.map((input) => artifactCandidateReviewActionInputSchema.parse(input));
  let processedCount = 0;

  for (const chunk of chunkArray(parsedInputs, BULK_REVIEW_CHUNK_SIZE)) {
    await prisma.$transaction(async (tx) => {
      const organizationId = chunk[0]!.organizationId;
      const candidateIds = [...new Set(chunk.map((parsed) => parsed.candidateId))];
      const existingCandidates = await tx.artifactAasCandidate.findMany({
        where: {
          organizationId,
          id: {
            in: candidateIds
          }
        }
      });
      const existingCandidatesById = new Map(existingCandidates.map((candidate) => [candidate.id, candidate] as const));

      if (existingCandidatesById.size !== candidateIds.length) {
        throw new Error("Artifact candidate was not found in organization scope.");
      }

      const fileIds = [...new Set(existingCandidates.map((candidate) => candidate.fileId))];
      const files = await tx.artifactIntakeFile.findMany({
        where: {
          organizationId,
          id: {
            in: fileIds
          }
        },
        select: {
          id: true,
          sectionDispositions: true,
          intakeSession: {
            select: {
              mappedArtifacts: true
            }
          }
        }
      });
      const filesById = new Map<string, ReviewFileRecord>(files.map((file) => [file.id, file]));

      for (const parsed of chunk) {
        const existing = existingCandidatesById.get(parsed.candidateId);

        if (!existing) {
          throw new Error("Artifact candidate was not found in organization scope.");
        }

        await reviewArtifactCandidateWithinTransaction(parsed, tx, {
          existing,
          file: filesById.get(existing.fileId) ?? null
        });
        processedCount += 1;
      }
    });
  }

  return {
    processedCount
  };
}

export async function promoteArtifactCandidate(
  input: PromoteArtifactCandidateInput,
  db: Prisma.TransactionClient | typeof prisma = prisma,
  sharedState?: PromotionState
) {
  const run = async (tx: Prisma.TransactionClient) => {
      const state = sharedState ?? createPromotionState();
      const seen = state.seen;
      const candidateCache = state.candidateCache;
      const outcomeCache = state.outcomeCache;
      const epicCache = state.epicCache;
      const fileCache = state.fileCache;

      async function loadCandidate(candidateId: string) {
        if (candidateCache.has(candidateId)) {
          return candidateCache.get(candidateId) ?? null;
        }

        const candidate = await tx.artifactAasCandidate.findFirst({
          where: {
            organizationId: input.organizationId,
            id: candidateId
          },
          include: {
            intakeSession: {
              select: {
                importIntent: true
              }
            }
          }
        });

        candidateCache.set(candidateId, candidate);
        return candidate;
      }

      async function loadOutcome(outcomeId: string | null | undefined) {
        if (!outcomeId) {
          return null;
        }

        if (outcomeCache.has(outcomeId)) {
          return outcomeCache.get(outcomeId) ?? null;
        }

        const outcome = await tx.outcome.findFirst({
          where: {
            organizationId: input.organizationId,
            id: outcomeId
          }
        });

        outcomeCache.set(outcomeId, outcome);
        return outcome;
      }

      async function loadEpic(epicId: string | null | undefined) {
        if (!epicId) {
          return null;
        }

        if (epicCache.has(epicId)) {
          return epicCache.get(epicId) ?? null;
        }

        const epic = await tx.epic.findFirst({
          where: {
            organizationId: input.organizationId,
            id: epicId
          }
        });

        epicCache.set(epicId, epic);
        return epic;
      }

      async function loadFile(fileId: string) {
        if (fileCache.has(fileId)) {
          return fileCache.get(fileId) ?? null;
        }

        const file = await tx.artifactIntakeFile.findFirst({
          where: {
            organizationId: input.organizationId,
            id: fileId
          },
          select: {
            id: true,
            sectionDispositions: true,
            intakeSession: {
              select: {
                mappedArtifacts: true
              }
            }
          }
        });

        fileCache.set(fileId, file);
        return file;
      }

      async function loadPreferredProjectOutcomeId() {
        if (state.preferredProjectOutcomeId !== undefined) {
          return state.preferredProjectOutcomeId;
        }

        state.preferredProjectOutcomeId = await resolvePreferredProjectOutcomeId(tx, input.organizationId);
        return state.preferredProjectOutcomeId;
      }

    async function autoPromoteDependencyCandidate(dependencyCandidateId: string | null | undefined, label: string) {
      if (!dependencyCandidateId) {
        return null;
      }

      const dependencyCandidate = await loadCandidate(dependencyCandidateId);

      if (!dependencyCandidate) {
        return null;
      }

      if (dependencyCandidate.reviewStatus === "rejected") {
        throw new Error(`Linked ${label} was rejected and cannot be promoted automatically.`);
      }

      if (!dependencyCandidate.promotedEntityId) {
        if (input.disableAutoPromoteDependencies) {
          return dependencyCandidate;
        }

        if (dependencyCandidate.reviewStatus !== "confirmed" && dependencyCandidate.reviewStatus !== "edited") {
          await tx.artifactAasCandidate.update({
            where: { id: dependencyCandidate.id },
            data: {
              reviewStatus: "confirmed",
              reviewComment:
                dependencyCandidate.reviewComment ??
                `Auto-confirmed while promoting linked ${label.toLowerCase()} dependency.`
            }
          });
          candidateCache.set(dependencyCandidate.id, {
            ...dependencyCandidate,
            reviewStatus: "confirmed",
            reviewComment:
              dependencyCandidate.reviewComment ??
              `Auto-confirmed while promoting linked ${label.toLowerCase()} dependency.`
          });
        }

        await promoteCandidateWithinTransaction(dependencyCandidate.id);
      }

      const refreshedDependencyCandidate = await loadCandidate(dependencyCandidateId);
      return refreshedDependencyCandidate;
    }

    async function promoteCandidateWithinTransaction(candidateId: string) {
      if (seen.has(candidateId)) {
        throw new Error("A cyclic import dependency was detected while promoting linked candidates.");
      }

      seen.add(candidateId);

      try {
        const candidate = await loadCandidate(candidateId);

        if (!candidate) {
          throw new Error("Artifact candidate was not found in organization scope.");
        }

        const file = await loadFile(candidate.fileId);

        if (candidate.promotedEntityId) {
          return {
            candidateId: candidate.id,
            promotedEntityType: candidate.promotedEntityType ?? candidate.type,
            promotedEntityId: candidate.promotedEntityId,
            importedReadinessState: candidate.importedReadinessState ?? "imported"
          };
        }

        const draftRecord = sanitizeArtifactPersistenceValue(artifactCandidateDraftRecordSchema.parse(candidate.draftRecord));
        const humanDecisions = sanitizeArtifactPersistenceValue(artifactCandidateHumanDecisionSchema.parse(candidate.humanDecisions));
        const issueDispositions = artifactIssueDispositionMapSchema.parse(candidate.issueDispositions ?? {});
        const complianceResult = analyzeArtifactCandidateCompliance({
          candidate: sanitizeArtifactPersistenceValue({
            id: candidate.id,
            type: candidate.type,
            title: candidate.title,
            summary: candidate.summary,
            mappingState: candidate.mappingState,
            source: {
              fileId: candidate.fileId,
              fileName: candidate.sourceSectionTitle,
              sectionId: candidate.sourceSectionId,
              sectionTitle: candidate.sourceSectionTitle,
              sectionMarker: candidate.sourceSectionMarker,
              sourceType: candidate.sourceType,
              confidence: candidate.sourceConfidence
            },
            inferredOutcomeCandidateId: candidate.inferredOutcomeCandidateId,
            inferredEpicCandidateId: candidate.inferredEpicCandidateId,
            relationshipState: candidate.relationshipState,
            relationshipNote: candidate.relationshipNote,
            acceptanceCriteria: candidate.acceptanceCriteria,
            testNotes: candidate.testNotes
          }),
          reviewStatus: candidate.reviewStatus,
          draftRecord,
          humanDecisions
        });
        const unmappedSectionContext = getUnmappedSectionContext({
          mappedArtifacts: file?.intakeSession.mappedArtifacts ?? null,
          fileId: candidate.fileId,
          sectionDispositions: file?.sectionDispositions ?? null
        });
        const importedReadinessState = deriveImportedReadinessState({
          reviewStatus: candidate.reviewStatus,
          complianceResult,
          candidateType: candidate.type,
          issueDispositions,
          unmappedSectionCount: unmappedSectionContext.unmappedSectionCount,
          sectionDispositions: unmappedSectionContext.sectionDispositions
        });
        const issueProgress = getArtifactCandidateIssueProgress({
          complianceResult,
          issueDispositions,
          unmappedSectionCount: unmappedSectionContext.unmappedSectionCount,
          sectionDispositions: unmappedSectionContext.sectionDispositions
        });

        if (candidate.reviewStatus !== "confirmed" && candidate.reviewStatus !== "edited") {
          throw new Error("Candidate must be confirmed or edited before promotion can continue.");
        }

        if (importedReadinessState === "discarded") {
          throw new Error("Rejected or discarded candidates cannot be promoted.");
        }

        if (importedReadinessState !== "imported_framing_ready" && importedReadinessState !== "imported_design_ready") {
          await appendActivityEvent(
            {
              organizationId: candidate.organizationId,
              entityType: "artifact_aas_candidate",
              entityId: candidate.id,
              eventType: "imported_progression_blocked",
              actorId: input.actorId ?? null,
              metadata: {
                importedReadinessState,
                issueProgress
              }
            },
            tx
          );

          throw new Error("Promotion is blocked until import readiness is green and human confirmation work is complete.");
        }

        const promotedReadinessState = deriveImportedReadinessState({
          reviewStatus: "promoted",
          complianceResult,
          candidateType: candidate.type,
          issueDispositions,
          unmappedSectionCount: unmappedSectionContext.unmappedSectionCount,
          sectionDispositions: unmappedSectionContext.sectionDispositions
        });
        const lineageReference = {
          sourceType: "artifact_aas_candidate" as const,
          sourceId: candidate.id,
          note: `Promoted from intake session ${candidate.intakeSessionId}`
        };
        const importIntent = candidate.intakeSession.importIntent;
        let promotedEntityId = "";
        const promotedEntityType: "outcome" | "epic" | "story" = candidate.type;

        if (candidate.type === "outcome") {
          const targetOutcomeId = draftRecord.outcomeCandidateId?.trim() ?? "";

          if (targetOutcomeId) {
            const existingOutcome = await tx.outcome.findFirst({
              where: {
                organizationId: candidate.organizationId,
                id: targetOutcomeId
              },
              select: {
                id: true
              }
            });

            if (!existingOutcome) {
              throw new Error("Select a valid project Outcome before approving this imported Outcome.");
            }

            const updated = await updateOutcome({
              organizationId: candidate.organizationId,
              actorId: input.actorId ?? null,
              id: existingOutcome.id,
              key: draftRecord.key ?? undefined,
              title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
              problemStatement: draftRecord.problemStatement ?? null,
              outcomeStatement: draftRecord.outcomeStatement ?? sanitizeArtifactPersistenceText(candidate.summary),
              baselineDefinition: draftRecord.baselineDefinition ?? null,
              baselineSource: draftRecord.baselineSource ?? null,
              timeframe: draftRecord.timeframe ?? null,
              valueOwnerId: humanDecisions.valueOwnerId ?? null,
              riskProfile: humanDecisions.riskProfile ?? "medium",
              aiAccelerationLevel: humanDecisions.aiAccelerationLevel ?? "level_2",
              importedReadinessState: promotedReadinessState,
              originType: "imported",
              createdMode: "promotion",
              lineageReference
            }, tx);
            promotedEntityId = updated.id;
            outcomeCache.set(updated.id, updated);
          } else {
            const outcomeKey = await resolveNextGovernedKey({
              db: tx,
              organizationId: candidate.organizationId,
              entityType: "outcome",
              requestedKey: draftRecord.key ?? null,
              importIntent
            });
            const created = await createOutcome(
              {
                organizationId: candidate.organizationId,
                actorId: input.actorId ?? null,
                key: outcomeKey,
                title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
                problemStatement: draftRecord.problemStatement ?? null,
                outcomeStatement: draftRecord.outcomeStatement ?? sanitizeArtifactPersistenceText(candidate.summary),
                baselineDefinition: draftRecord.baselineDefinition ?? null,
                baselineSource: draftRecord.baselineSource ?? null,
                solutionContext: null,
                solutionConstraints: null,
                timeframe: draftRecord.timeframe ?? null,
                valueOwnerId: humanDecisions.valueOwnerId ?? null,
                riskProfile: humanDecisions.riskProfile ?? "medium",
                aiAccelerationLevel: humanDecisions.aiAccelerationLevel ?? "level_2",
                status: promotedReadinessState === "imported_framing_ready" ? "ready_for_tg1" : "baseline_in_progress",
                originType: "imported",
                createdMode: "promotion",
                lineageReference,
                importedReadinessState: promotedReadinessState
              },
              tx
            );
            promotedEntityId = created.id;
            outcomeCache.set(created.id, created);
          }
        }

        if (candidate.type === "epic") {
          const promotedOutcomeCandidate = await autoPromoteDependencyCandidate(draftRecord.outcomeCandidateId, "Outcome");
          const linkedOutcome = promotedOutcomeCandidate?.promotedEntityId
            ? await loadOutcome(promotedOutcomeCandidate.promotedEntityId)
            : await loadOutcome(draftRecord.outcomeCandidateId);

          const fallbackOutcome =
            linkedOutcome ??
            (await loadPreferredProjectOutcomeId().then((outcomeId) => loadOutcome(outcomeId)));

          if (!fallbackOutcome) {
            throw new Error("Select or link a valid project Outcome before promoting this Epic.");
          }

          const epicKey = await resolveNextGovernedKey({
            db: tx,
            organizationId: candidate.organizationId,
            entityType: "epic",
            requestedKey: draftRecord.key ?? null,
            importIntent
          });
          const created = await createEpic(
            {
              organizationId: candidate.organizationId,
              actorId: input.actorId ?? null,
              outcomeId: fallbackOutcome.id,
              key: epicKey,
              title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
              purpose: draftRecord.purpose ?? sanitizeArtifactPersistenceText(candidate.summary),
              scopeBoundary: draftRecord.scopeBoundary ?? null,
              riskNote: draftRecord.riskNote ?? null,
              status: "draft",
              originType: "imported",
              createdMode: "promotion",
              lineageReference,
              importedReadinessState: promotedReadinessState
            },
            tx
          );
          promotedEntityId = created.id;
          epicCache.set(created.id, created);
        }

        if (candidate.type === "story") {
          const promotedOutcomeCandidate = await autoPromoteDependencyCandidate(draftRecord.outcomeCandidateId, "Outcome");
          const promotedEpicCandidate = await autoPromoteDependencyCandidate(draftRecord.epicCandidateId, "Epic");
          let linkedOutcome = promotedOutcomeCandidate?.promotedEntityId
            ? await loadOutcome(promotedOutcomeCandidate.promotedEntityId)
            : await loadOutcome(draftRecord.outcomeCandidateId);
          const linkedEpic = promotedEpicCandidate?.promotedEntityId
            ? await loadEpic(promotedEpicCandidate.promotedEntityId)
            : await loadEpic(draftRecord.epicCandidateId);

          const preferredOutcomeId = await loadPreferredProjectOutcomeId();
          if (!linkedOutcome || !linkedEpic) {
            const fallbackOutcome =
              linkedOutcome ??
              (linkedEpic
                ? await loadOutcome(linkedEpic.outcomeId)
                : preferredOutcomeId
                  ? await loadOutcome(preferredOutcomeId)
                  : null);

            if (!fallbackOutcome || !linkedEpic) {
              throw new Error("Select or link a valid Outcome and Epic before promoting this Story Idea.");
            }

            linkedOutcome = fallbackOutcome;
          }

          const storyIdeaKey =
            importIntent === "framing"
              ? await resolveNextGovernedKey({
                  db: tx,
                  organizationId: candidate.organizationId,
                  entityType: "direction_seed",
                  requestedKey: draftRecord.key ?? null,
                  importIntent
                })
              : await resolveNextGovernedKey({
                  db: tx,
                  organizationId: candidate.organizationId,
                  entityType: "story",
                  requestedKey: draftRecord.key ?? null,
                  importIntent
                });
          const created =
            importIntent === "design"
              ? await createStory(
                  {
                    organizationId: candidate.organizationId,
                    actorId: input.actorId ?? null,
                    outcomeId: linkedOutcome.id,
                    epicId: linkedEpic.id,
                    key: storyIdeaKey,
                    title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
                    storyType: draftRecord.storyType ?? "outcome_delivery",
                    valueIntent:
                      draftRecord.valueIntent ??
                      draftRecord.expectedBehavior ??
                      sanitizeArtifactPersistenceText(candidate.summary),
                    expectedBehavior: draftRecord.expectedBehavior ?? null,
                    acceptanceCriteria: draftRecord.acceptanceCriteria,
                    aiUsageScope: draftRecord.aiUsageScope,
                    aiAccelerationLevel: humanDecisions.aiAccelerationLevel ?? "level_2",
                    testDefinition: draftRecord.testDefinition ?? null,
                    definitionOfDone: draftRecord.definitionOfDone,
                    status: "draft",
                    originType: "imported",
                    createdMode: "promotion",
                    lineageReference,
                    importedReadinessState: promotedReadinessState
                  },
                  tx
                )
              : await createDirectionSeed(
                  {
                    organizationId: candidate.organizationId,
                    actorId: input.actorId ?? null,
                    outcomeId: linkedOutcome.id,
                    epicId: linkedEpic.id,
                    key: storyIdeaKey,
                    title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
                    shortDescription: draftRecord.valueIntent ?? sanitizeArtifactPersistenceText(candidate.summary),
                    expectedBehavior: draftRecord.expectedBehavior ?? null,
                    originType: "imported",
                    createdMode: "promotion",
                    lineageReference,
                    importedReadinessState: promotedReadinessState
                  },
                  tx
                );
          promotedEntityId = created.id;
        }

        const promotedAt = new Date();
        await tx.artifactAasCandidate.update({
          where: { id: candidate.id },
          data: {
            reviewStatus: "promoted",
            promotedEntityType,
            promotedEntityId,
            promotedAt,
            importedReadinessState: promotedReadinessState
          }
        });
        candidateCache.set(candidate.id, {
          ...candidate,
          reviewStatus: "promoted",
          promotedEntityType,
          promotedEntityId,
          promotedAt,
          importedReadinessState: promotedReadinessState
          });

        await appendActivityEvent(
          {
            organizationId: candidate.organizationId,
            entityType: "artifact_aas_candidate",
            entityId: candidate.id,
            eventType: "artifact_candidate_promoted",
            actorId: input.actorId ?? null,
            metadata: {
              promotedEntityType,
              promotedEntityId,
              importedReadinessState: promotedReadinessState
            }
          },
          tx
        );

        await appendActivityEvent(
          {
            organizationId: candidate.organizationId,
            entityType: "artifact_aas_candidate",
            entityId: candidate.id,
            eventType: "imported_progression_allowed",
            actorId: input.actorId ?? null,
            metadata: {
              promotedEntityType,
              promotedEntityId,
              importedReadinessState: promotedReadinessState
            }
          },
          tx
        );

        return {
          candidateId: candidate.id,
          promotedEntityType,
          promotedEntityId,
          importedReadinessState: promotedReadinessState
        };
      } finally {
        seen.delete(candidateId);
      }
    }

      return promoteCandidateWithinTransaction(input.candidateId);
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => run(tx), {
      maxWait: 10_000,
      timeout: 60_000
    });
  }

  return run(db);
}

export async function promoteArtifactCandidatesBulk(input: {
  organizationId: string;
  candidateIds: string[];
  actorId?: string | null;
  disableAutoPromoteDependencies?: boolean;
}) {
  if (input.candidateIds.length === 0) {
    return [];
  }

  return prisma.$transaction(
    async (tx) => {
      const sharedState = createPromotionState();
      const results = [];

      for (const candidateId of input.candidateIds) {
        results.push(
          await promoteArtifactCandidate(
            {
              organizationId: input.organizationId,
              candidateId,
              actorId: input.actorId ?? null,
              disableAutoPromoteDependencies: input.disableAutoPromoteDependencies ?? false
            },
            tx,
            sharedState
          )
        );
      }

      return results;
    },
    {
      maxWait: 10_000,
      timeout: 120_000
    }
  );
}
