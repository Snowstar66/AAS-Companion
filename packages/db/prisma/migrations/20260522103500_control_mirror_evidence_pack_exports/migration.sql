CREATE TYPE "ControlMirrorEvidencePackExportFormat" AS ENUM ('json', 'markdown');

CREATE TABLE "ControlMirrorEvidencePackExport" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "snapshotId" TEXT,
  "format" "ControlMirrorEvidencePackExportFormat" NOT NULL,
  "schemaVersion" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "markdownContent" TEXT,
  "generatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ControlMirrorEvidencePackExport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ControlMirrorEvidencePackExport_organizationId_createdAt_idx"
ON "ControlMirrorEvidencePackExport"("organizationId", "createdAt");

CREATE INDEX "ControlMirrorEvidencePackExport_organizationId_snapshotId_createdAt_idx"
ON "ControlMirrorEvidencePackExport"("organizationId", "snapshotId", "createdAt");

CREATE INDEX "ControlMirrorEvidencePackExport_organizationId_format_createdAt_idx"
ON "ControlMirrorEvidencePackExport"("organizationId", "format", "createdAt");

ALTER TABLE "ControlMirrorEvidencePackExport"
ADD CONSTRAINT "ControlMirrorEvidencePackExport_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
