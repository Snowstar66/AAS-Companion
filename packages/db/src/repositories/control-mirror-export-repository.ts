import { randomUUID } from "node:crypto";
import { Prisma } from "../../generated/client";
import type { ControlMirrorEvidencePack } from "@aas-companion/domain";
import { prisma } from "../client";

type DbClient = Prisma.TransactionClient | typeof prisma;

export type ControlMirrorEvidencePackExportFormat = "json" | "markdown";
export type ControlMirrorEvidencePackExportRetentionState = "active" | "archived";
export type ControlMirrorEvidencePackExportAcceptanceReviewerRole = "product_owner" | "security_privacy" | "aqa";
export type ControlMirrorEvidencePackExportAcceptanceDecisionType = "accepted" | "accepted_with_conditions" | "changes_requested" | "revoked";

type ControlMirrorExportActorIdentity = {
  fullName: string | null;
  email: string | null;
};

export type ControlMirrorEvidencePackExportAcceptanceDecisionRecord = {
  id: string;
  exportId: string;
  reviewerRole: ControlMirrorEvidencePackExportAcceptanceReviewerRole;
  decisionType: ControlMirrorEvidencePackExportAcceptanceDecisionType;
  rationale: string;
  actorId: string;
  createdAt: Date;
};

export type ControlMirrorEvidencePackExportDownloadEventRecord = {
  id: string;
  exportId: string;
  actorId: string;
  actorDisplayName?: string;
  createdAt: Date;
};

export type ControlMirrorEvidencePackExportAcceptanceSummary = {
  shareReadiness: "acceptance_pending" | "changes_requested" | "share_ready";
  requiredRoles: ControlMirrorEvidencePackExportAcceptanceReviewerRole[];
  acceptedRoles: ControlMirrorEvidencePackExportAcceptanceReviewerRole[];
  missingRoles: ControlMirrorEvidencePackExportAcceptanceReviewerRole[];
  blockingRoles: ControlMirrorEvidencePackExportAcceptanceReviewerRole[];
  latestDecisions: ControlMirrorEvidencePackExportAcceptanceDecisionRecord[];
};

export type ControlMirrorEvidencePackExportRecord = {
  id: string;
  organizationId: string;
  snapshotId: string | null;
  format: ControlMirrorEvidencePackExportFormat;
  schemaVersion: string;
  fileName: string;
  contentType: string;
  generatedAt: Date;
  createdBy: string | null;
  createdAt: Date;
  retentionState: ControlMirrorEvidencePackExportRetentionState;
  retentionPolicyLabel: string;
  retentionReviewDueAt: Date | null;
  retentionReviewedAt: Date | null;
  archivedAt: Date | null;
  archivedBy: string | null;
  archivedByDisplayName?: string | null;
  archiveReason: string | null;
  latestDownloadEvent?: ControlMirrorEvidencePackExportDownloadEventRecord | null;
  latestAcceptanceDecision?: ControlMirrorEvidencePackExportAcceptanceDecisionRecord | null;
  acceptanceSummary: ControlMirrorEvidencePackExportAcceptanceSummary;
};

export type ControlMirrorEvidencePackExportDownloadRecord = ControlMirrorEvidencePackExportRecord & {
  payload: unknown;
  markdownContent: string | null;
};

function assertOrganizationScope(organizationId: string) {
  if (!organizationId.trim()) {
    throw new Error("organizationId is required for Control Mirror export history.");
  }
}

function assertEvidencePackSafety(evidencePack: ControlMirrorEvidencePack) {
  if (evidencePack.safety.rawSourceTextIncluded) {
    throw new Error("Control Mirror export history cannot persist raw source text.");
  }
}

function assertAcceptanceDecisionInput(input: {
  actorId?: string | null;
  rationale?: string | null;
}) {
  if (!input.actorId?.trim()) {
    throw new Error("A human actor is required before a Control Mirror export acceptance decision can be recorded.");
  }

  if (!input.rationale?.trim()) {
    throw new Error("Acceptance decision rationale is required before a Control Mirror export acceptance decision can be recorded.");
  }
}

function assertArchiveInput(input: {
  actorId?: string | null;
  reason?: string | null;
}) {
  if (!input.actorId?.trim()) {
    throw new Error("A human actor is required before a Control Mirror export can be archived.");
  }

  if (!input.reason?.trim()) {
    throw new Error("Archive reason is required before a Control Mirror export can be archived.");
  }
}

function assertDownloadAuditInput(input: {
  actorId?: string | null;
}) {
  if (!input.actorId?.trim()) {
    throw new Error("A human actor is required before a Control Mirror export download can be audited.");
  }
}

function mapLatestAcceptanceDecision(record: {
  acceptanceDecisions?: ControlMirrorEvidencePackExportAcceptanceDecisionRecord[];
}) {
  return record.acceptanceDecisions?.[0] ?? null;
}

function mapLatestDownloadEvent(record: {
  downloadEvents?: Array<Omit<ControlMirrorEvidencePackExportDownloadEventRecord, "actorDisplayName"> & {
    actor?: ControlMirrorExportActorIdentity | null;
  }>;
}) {
  const event = record.downloadEvents?.[0];

  return event
    ? {
        id: event.id,
        exportId: event.exportId,
        actorId: event.actorId,
        actorDisplayName: formatActorDisplayName(event.actorId, event.actor),
        createdAt: event.createdAt
      }
    : null;
}

function formatActorDisplayName(actorId: string, actor?: ControlMirrorExportActorIdentity | null) {
  return actor?.fullName?.trim() || actor?.email?.trim() || actorId;
}

const REQUIRED_ACCEPTANCE_REVIEWER_ROLES: ControlMirrorEvidencePackExportAcceptanceReviewerRole[] = [
  "product_owner",
  "security_privacy",
  "aqa"
];

function buildAcceptanceSummary(record: {
  acceptanceDecisions?: ControlMirrorEvidencePackExportAcceptanceDecisionRecord[];
}): ControlMirrorEvidencePackExportAcceptanceSummary {
  const latestByRole = new Map<ControlMirrorEvidencePackExportAcceptanceReviewerRole, ControlMirrorEvidencePackExportAcceptanceDecisionRecord>();

  for (const decision of record.acceptanceDecisions ?? []) {
    if (REQUIRED_ACCEPTANCE_REVIEWER_ROLES.includes(decision.reviewerRole) && !latestByRole.has(decision.reviewerRole)) {
      latestByRole.set(decision.reviewerRole, decision);
    }
  }

  const acceptedRoles = REQUIRED_ACCEPTANCE_REVIEWER_ROLES.filter((role) => {
    const decision = latestByRole.get(role);

    return decision?.decisionType === "accepted" || decision?.decisionType === "accepted_with_conditions";
  });
  const blockingRoles = REQUIRED_ACCEPTANCE_REVIEWER_ROLES.filter((role) => latestByRole.get(role)?.decisionType === "changes_requested");
  const missingRoles = REQUIRED_ACCEPTANCE_REVIEWER_ROLES.filter((role) => {
    const decision = latestByRole.get(role);

    return !decision || decision.decisionType === "revoked";
  });
  const shareReadiness = blockingRoles.length > 0
    ? "changes_requested"
    : acceptedRoles.length === REQUIRED_ACCEPTANCE_REVIEWER_ROLES.length
      ? "share_ready"
      : "acceptance_pending";

  return {
    shareReadiness,
    requiredRoles: [...REQUIRED_ACCEPTANCE_REVIEWER_ROLES],
    acceptedRoles,
    missingRoles,
    blockingRoles,
    latestDecisions: REQUIRED_ACCEPTANCE_REVIEWER_ROLES.flatMap((role) => {
      const decision = latestByRole.get(role);

      return decision ? [decision] : [];
    })
  };
}

export async function createControlMirrorEvidencePackExportRecord(input: {
  organizationId: string;
  format: ControlMirrorEvidencePackExportFormat;
  fileName: string;
  contentType: string;
  evidencePack: ControlMirrorEvidencePack;
  markdownContent?: string | null;
  createdBy?: string | null;
  createdAt?: Date;
}, db: DbClient = prisma): Promise<ControlMirrorEvidencePackExportRecord> {
  assertOrganizationScope(input.organizationId);
  assertEvidencePackSafety(input.evidencePack);

  const data = {
    id: randomUUID(),
    organizationId: input.organizationId,
    snapshotId: input.evidencePack.snapshot.id || null,
    format: input.format,
    schemaVersion: input.evidencePack.schemaVersion,
    fileName: input.fileName,
    contentType: input.contentType,
    payload: input.evidencePack as unknown as Prisma.InputJsonValue,
    markdownContent: input.format === "markdown" ? input.markdownContent ?? "" : null,
    generatedAt: new Date(input.evidencePack.generatedAt),
    createdBy: input.createdBy?.trim() || null,
    retentionState: "active" as const,
    retentionPolicyLabel: "governance_audit_artifact",
    ...(input.createdAt ? { createdAt: input.createdAt } : {})
  };

  const record = await db.controlMirrorEvidencePackExport.create({
    data,
    select: {
      id: true,
      organizationId: true,
      snapshotId: true,
      format: true,
      schemaVersion: true,
      fileName: true,
      contentType: true,
      generatedAt: true,
      createdBy: true,
      createdAt: true,
      retentionState: true,
      retentionPolicyLabel: true,
      retentionReviewDueAt: true,
      retentionReviewedAt: true,
      archivedAt: true,
      archivedBy: true,
      archiveReason: true
    }
  });

  return {
    ...record,
    acceptanceSummary: buildAcceptanceSummary({})
  };
}

export async function listControlMirrorEvidencePackExportRecords(input: {
  organizationId: string;
  take?: number;
}, db: DbClient = prisma): Promise<ControlMirrorEvidencePackExportRecord[]> {
  assertOrganizationScope(input.organizationId);

  const records = await db.controlMirrorEvidencePackExport.findMany({
    where: {
      organizationId: input.organizationId
    },
    orderBy: {
      createdAt: "desc"
    },
    take: input.take ?? 10,
    select: {
      id: true,
      organizationId: true,
      snapshotId: true,
      format: true,
      schemaVersion: true,
      fileName: true,
      contentType: true,
      generatedAt: true,
      createdBy: true,
      createdAt: true,
      retentionState: true,
      retentionPolicyLabel: true,
      retentionReviewDueAt: true,
      retentionReviewedAt: true,
      archivedAt: true,
      archivedBy: true,
      archiveReason: true,
      acceptanceDecisions: {
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          exportId: true,
          reviewerRole: true,
          decisionType: true,
          rationale: true,
          actorId: true,
          createdAt: true
        }
      },
      downloadEvents: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1,
        select: {
          id: true,
          exportId: true,
          actorId: true,
          actor: {
            select: {
              fullName: true,
              email: true
            }
          },
          createdAt: true
        }
      }
    }
  });

  const archivedActorIds = [...new Set(records.flatMap((record) => (record.archivedBy ? [record.archivedBy] : [])))];
  const archivedActors = archivedActorIds.length > 0
    ? await db.appUser.findMany({
        where: {
          id: {
            in: archivedActorIds
          }
        },
        select: {
          id: true,
          fullName: true,
          email: true
        }
      })
    : [];
  const archivedActorById = new Map(archivedActors.map((actor) => [actor.id, actor]));

  return records.map(({ acceptanceDecisions, downloadEvents, ...record }) => ({
    ...record,
    archivedByDisplayName: record.archivedBy
      ? formatActorDisplayName(record.archivedBy, archivedActorById.get(record.archivedBy))
      : null,
    latestAcceptanceDecision: mapLatestAcceptanceDecision({ acceptanceDecisions }),
    latestDownloadEvent: mapLatestDownloadEvent({ downloadEvents }),
    acceptanceSummary: buildAcceptanceSummary({ acceptanceDecisions })
  }));
}

export async function getControlMirrorEvidencePackExportRecordById(input: {
  organizationId: string;
  exportId: string;
}, db: DbClient = prisma): Promise<ControlMirrorEvidencePackExportDownloadRecord | null> {
  assertOrganizationScope(input.organizationId);

  if (!input.exportId.trim()) {
    return null;
  }

  const record = await db.controlMirrorEvidencePackExport.findFirst({
    where: {
      id: input.exportId,
      organizationId: input.organizationId
    },
    select: {
      id: true,
      organizationId: true,
      snapshotId: true,
      format: true,
      schemaVersion: true,
      fileName: true,
      contentType: true,
      payload: true,
      markdownContent: true,
      generatedAt: true,
      createdBy: true,
      createdAt: true,
      retentionState: true,
      retentionPolicyLabel: true,
      retentionReviewDueAt: true,
      retentionReviewedAt: true,
      archivedAt: true,
      archivedBy: true,
      archiveReason: true
    }
  });

  return record
    ? {
        ...record,
        acceptanceSummary: buildAcceptanceSummary({})
      }
    : null;
}

export async function recordControlMirrorEvidencePackExportAcceptanceDecision(input: {
  organizationId: string;
  exportId: string;
  reviewerRole: ControlMirrorEvidencePackExportAcceptanceReviewerRole;
  decisionType: ControlMirrorEvidencePackExportAcceptanceDecisionType;
  rationale: string;
  actorId: string;
}, db: typeof prisma = prisma): Promise<ControlMirrorEvidencePackExportAcceptanceDecisionRecord> {
  assertOrganizationScope(input.organizationId);
  assertAcceptanceDecisionInput(input);

  return db.$transaction(async (tx) => {
    const exportRecord = await tx.controlMirrorEvidencePackExport.findFirst({
      where: {
        id: input.exportId,
        organizationId: input.organizationId
      },
      select: {
        id: true
      }
    });

    if (!exportRecord) {
      throw new Error("Persisted Control Mirror export was not found for this project.");
    }

    return tx.controlMirrorEvidencePackExportAcceptanceDecision.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        exportId: exportRecord.id,
        reviewerRole: input.reviewerRole,
        decisionType: input.decisionType,
        rationale: input.rationale.trim(),
        actorId: input.actorId.trim()
      },
      select: {
        id: true,
        exportId: true,
        reviewerRole: true,
        decisionType: true,
        rationale: true,
        actorId: true,
        createdAt: true
      }
    });
  });
}

export async function archiveControlMirrorEvidencePackExportRecord(input: {
  organizationId: string;
  exportId: string;
  actorId: string;
  reason: string;
  archivedAt?: Date;
}, db: typeof prisma = prisma): Promise<ControlMirrorEvidencePackExportRecord> {
  assertOrganizationScope(input.organizationId);
  assertArchiveInput(input);

  const archivedAt = input.archivedAt ?? new Date();

  return db.$transaction(async (tx) => {
    const exportRecord = await tx.controlMirrorEvidencePackExport.findFirst({
      where: {
        id: input.exportId,
        organizationId: input.organizationId
      },
      select: {
        id: true
      }
    });

    if (!exportRecord) {
      throw new Error("Persisted Control Mirror export was not found for this project.");
    }

    const record = await tx.controlMirrorEvidencePackExport.update({
      where: {
        id: exportRecord.id
      },
      data: {
        retentionState: "archived",
        archivedAt,
        archivedBy: input.actorId.trim(),
        archiveReason: input.reason.trim()
      },
      select: {
        id: true,
        organizationId: true,
        snapshotId: true,
        format: true,
        schemaVersion: true,
        fileName: true,
        contentType: true,
        generatedAt: true,
        createdBy: true,
        createdAt: true,
        retentionState: true,
        retentionPolicyLabel: true,
        retentionReviewDueAt: true,
        retentionReviewedAt: true,
        archivedAt: true,
        archivedBy: true,
        archiveReason: true
      }
    });

    return {
      ...record,
      acceptanceSummary: buildAcceptanceSummary({})
    };
  });
}

export async function recordControlMirrorEvidencePackExportDownloadEvent(input: {
  organizationId: string;
  exportId: string;
  actorId: string;
  createdAt?: Date;
}, db: typeof prisma = prisma): Promise<ControlMirrorEvidencePackExportDownloadEventRecord> {
  assertOrganizationScope(input.organizationId);
  assertDownloadAuditInput(input);

  return db.$transaction(async (tx) => {
    const exportRecord = await tx.controlMirrorEvidencePackExport.findFirst({
      where: {
        id: input.exportId,
        organizationId: input.organizationId
      },
      select: {
        id: true
      }
    });

    if (!exportRecord) {
      throw new Error("Persisted Control Mirror export was not found for this project.");
    }

    return tx.controlMirrorEvidencePackExportDownloadEvent.create({
      data: {
        id: randomUUID(),
        organizationId: input.organizationId,
        exportId: exportRecord.id,
        actorId: input.actorId.trim(),
        ...(input.createdAt ? { createdAt: input.createdAt } : {})
      },
      select: {
        id: true,
        exportId: true,
        actorId: true,
        createdAt: true
      }
    });
  });
}
