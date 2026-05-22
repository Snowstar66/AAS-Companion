CREATE TYPE "ControlMirrorEvidencePackExportRetentionState" AS ENUM ('active', 'archived');

ALTER TABLE "ControlMirrorEvidencePackExport"
ADD COLUMN "retentionState" "ControlMirrorEvidencePackExportRetentionState" NOT NULL DEFAULT 'active',
ADD COLUMN "retentionPolicyLabel" TEXT NOT NULL DEFAULT 'governance_audit_artifact',
ADD COLUMN "retentionReviewDueAt" TIMESTAMP(3),
ADD COLUMN "retentionReviewedAt" TIMESTAMP(3),
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedBy" TEXT,
ADD COLUMN "archiveReason" TEXT;

CREATE INDEX "cm_export_retention_state_idx"
ON "ControlMirrorEvidencePackExport"("organizationId", "retentionState", "createdAt");
