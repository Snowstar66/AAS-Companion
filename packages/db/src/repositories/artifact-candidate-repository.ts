import type { Prisma } from "../../generated/client";
import {
  analyzeArtifactCandidateCompliance,
  type ArtifactAasCandidate,
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
import { createOutcome } from "./outcome-repository";
import { createStory } from "./story-repository";

type DbClient = Prisma.TransactionClient | typeof prisma;

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

  const bulletList = (categories: Array<string>) =>
    mapping.data.carryForwardItems
      .filter((item) => categories.includes(item.category))
      .map((item) => `- ${item.title}: ${item.summary}`)
      .join("\n");

  const solutionContext = bulletList(["excluded_design"]);
  const solutionConstraints = serializeFramingConstraintBundle({
    generalConstraints: bulletList(["solution_constraint"]),
    uxPrinciples: bulletList(["ux_principle"]),
    nonFunctionalRequirements: bulletList(["nfr_constraint"]),
    additionalRequirements: bulletList(["additional_requirement"])
  });

  return {
    solutionContext: solutionContext || null,
    solutionConstraints
  };
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
}, db: DbClient = prisma) {
  const persisted = [];

  for (const candidate of input.candidates) {
    const sanitizedCandidate = sanitizeArtifactPersistenceValue(candidate);
    const draftRecord = sanitizeArtifactPersistenceValue(
      artifactCandidateDraftRecordSchema.parse({
        ...createArtifactCandidateDraftRecord(sanitizedCandidate),
        ...(sanitizedCandidate.draftRecord ?? {})
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

    const created = await db.artifactAasCandidate.create({
      data: {
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
        importedReadinessState: deriveImportedReadinessState({
          reviewStatus: "pending",
          complianceResult,
          candidateType: candidate.type,
          issueDispositions
        })
      }
    });

    await appendActivityEvent(
      {
        organizationId: input.organizationId,
        entityType: "artifact_aas_candidate",
        entityId: created.id,
        eventType: "artifact_candidate_compliance_analyzed",
        metadata: {
          intakeSessionId: input.intakeSessionId,
          fileId: sanitizedCandidate.source.fileId,
          type: sanitizedCandidate.type,
          summary: complianceResult.summary
        }
      },
      db
    );

    persisted.push(created);
  }

  return persisted;
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

export async function reviewArtifactCandidate(input: unknown) {
  const parsed = artifactCandidateReviewActionInputSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.artifactAasCandidate.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: parsed.candidateId
      }
    });

    if (!existing) {
      throw new Error("Artifact candidate was not found in organization scope.");
    }

    const file = await tx.artifactIntakeFile.findFirst({
      where: {
        organizationId: parsed.organizationId,
        id: existing.fileId
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
  });
}

export async function promoteArtifactCandidate(input: {
  organizationId: string;
  candidateId: string;
  actorId?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.artifactAasCandidate.findFirst({
      where: {
        organizationId: input.organizationId,
        id: input.candidateId
      },
      include: {
        intakeSession: {
          select: {
            importIntent: true
          }
        }
      }
    });

    if (!candidate) {
      throw new Error("Artifact candidate was not found in organization scope.");
    }

    const file = await tx.artifactIntakeFile.findFirst({
      where: {
        organizationId: input.organizationId,
        id: candidate.fileId
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
    const importedCarryForward = importIntent === "framing"
      ? buildImportedFramingCarryForwardBundle(file?.intakeSession.mappedArtifacts ?? null)
      : { solutionContext: null as string | null, solutionConstraints: null as string | null };

    let promotedEntityId = "";
    const promotedEntityType: "outcome" | "epic" | "story" = candidate.type;

    if (candidate.type === "outcome") {
      const created = await createOutcome({
        organizationId: candidate.organizationId,
        actorId: input.actorId ?? null,
        key: draftRecord.key ?? `IMP-OUT-${candidate.id.slice(0, 8).toUpperCase()}`,
        title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
        problemStatement: draftRecord.problemStatement ?? null,
        outcomeStatement: draftRecord.outcomeStatement ?? sanitizeArtifactPersistenceText(candidate.summary),
        baselineDefinition: draftRecord.baselineDefinition ?? null,
        baselineSource: draftRecord.baselineSource ?? null,
        solutionContext: importedCarryForward.solutionContext,
        solutionConstraints: importedCarryForward.solutionConstraints,
        timeframe: draftRecord.timeframe ?? null,
        valueOwnerId: humanDecisions.valueOwnerId ?? null,
        riskProfile: humanDecisions.riskProfile ?? "medium",
        aiAccelerationLevel: humanDecisions.aiAccelerationLevel ?? "level_2",
        status: promotedReadinessState === "imported_framing_ready" ? "ready_for_tg1" : "baseline_in_progress",
        originType: "imported",
        createdMode: "promotion",
        lineageReference,
        importedReadinessState: promotedReadinessState
      }, tx);
      promotedEntityId = created.id;
    }

    if (candidate.type === "epic") {
      const promotedOutcomeCandidate = draftRecord.outcomeCandidateId
        ? await tx.artifactAasCandidate.findFirst({
            where: {
              organizationId: candidate.organizationId,
              id: draftRecord.outcomeCandidateId
            }
          })
        : null;
      const linkedOutcome =
        promotedOutcomeCandidate?.promotedEntityId
          ? await tx.outcome.findFirst({
              where: {
                organizationId: candidate.organizationId,
                id: promotedOutcomeCandidate.promotedEntityId
              }
            })
          : draftRecord.outcomeCandidateId
            ? await tx.outcome.findFirst({
                where: {
                  organizationId: candidate.organizationId,
                  id: draftRecord.outcomeCandidateId
                }
              })
            : null;

      if (!linkedOutcome) {
        throw new Error("Select a valid project Outcome before promoting this Epic.");
      }

      const created = await createEpic({
        organizationId: candidate.organizationId,
        actorId: input.actorId ?? null,
        outcomeId: linkedOutcome.id,
        key: draftRecord.key ?? `IMP-EPC-${candidate.id.slice(0, 8).toUpperCase()}`,
        title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
        purpose: draftRecord.purpose ?? sanitizeArtifactPersistenceText(candidate.summary),
        scopeBoundary: draftRecord.scopeBoundary ?? null,
        riskNote: draftRecord.riskNote ?? null,
        status: "draft",
        originType: "imported",
        createdMode: "promotion",
        lineageReference,
        importedReadinessState: promotedReadinessState
      }, tx);
      promotedEntityId = created.id;
    }

    if (candidate.type === "story") {
      const promotedOutcomeCandidate = draftRecord.outcomeCandidateId
        ? await tx.artifactAasCandidate.findFirst({
            where: {
              organizationId: candidate.organizationId,
              id: draftRecord.outcomeCandidateId
            }
          })
        : null;
      const promotedEpicCandidate = draftRecord.epicCandidateId
        ? await tx.artifactAasCandidate.findFirst({
            where: {
              organizationId: candidate.organizationId,
              id: draftRecord.epicCandidateId
            }
          })
        : null;
      const linkedOutcome =
        promotedOutcomeCandidate?.promotedEntityId
          ? await tx.outcome.findFirst({
              where: {
                organizationId: candidate.organizationId,
                id: promotedOutcomeCandidate.promotedEntityId
              }
            })
          : draftRecord.outcomeCandidateId
            ? await tx.outcome.findFirst({
                where: {
                  organizationId: candidate.organizationId,
                  id: draftRecord.outcomeCandidateId
                }
              })
            : null;
      const linkedEpic =
        promotedEpicCandidate?.promotedEntityId
          ? await tx.epic.findFirst({
              where: {
                organizationId: candidate.organizationId,
                id: promotedEpicCandidate.promotedEntityId
              }
            })
          : draftRecord.epicCandidateId
            ? await tx.epic.findFirst({
                where: {
                  organizationId: candidate.organizationId,
                  id: draftRecord.epicCandidateId
                }
              })
            : null;

      if (!linkedOutcome || !linkedEpic) {
        throw new Error("Select a valid project Outcome and Epic before promoting this Story.");
      }

      const created =
        importIntent === "design"
          ? await createStory({
              organizationId: candidate.organizationId,
              actorId: input.actorId ?? null,
              outcomeId: linkedOutcome.id,
              epicId: linkedEpic.id,
              key: draftRecord.key ?? `IMP-STORY-${candidate.id.slice(0, 8).toUpperCase()}`,
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
            }, tx)
          : await createDirectionSeed({
              organizationId: candidate.organizationId,
              actorId: input.actorId ?? null,
              outcomeId: linkedOutcome.id,
              epicId: linkedEpic.id,
              key: draftRecord.key ?? `IMP-STORY-${candidate.id.slice(0, 8).toUpperCase()}`,
              title: draftRecord.title ?? sanitizeArtifactPersistenceText(candidate.title),
              shortDescription: draftRecord.valueIntent ?? sanitizeArtifactPersistenceText(candidate.summary),
              expectedBehavior: draftRecord.expectedBehavior ?? null,
              originType: "imported",
              createdMode: "promotion",
              lineageReference,
              importedReadinessState: promotedReadinessState
            }, tx);
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
  });
}
