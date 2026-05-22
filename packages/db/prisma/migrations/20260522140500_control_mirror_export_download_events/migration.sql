CREATE TABLE "ControlMirrorEvidencePackExportDownloadEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "exportId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ControlMirrorEvidencePackExportDownloadEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cm_export_download_event_export_idx"
ON "ControlMirrorEvidencePackExportDownloadEvent"("organizationId", "exportId", "createdAt");

CREATE INDEX "cm_export_download_event_actor_idx"
ON "ControlMirrorEvidencePackExportDownloadEvent"("organizationId", "actorId", "createdAt");

ALTER TABLE "ControlMirrorEvidencePackExportDownloadEvent"
ADD CONSTRAINT "ControlMirrorEvidencePackExportDownloadEvent_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ControlMirrorEvidencePackExportDownloadEvent"
ADD CONSTRAINT "ControlMirrorEvidencePackExportDownloadEvent_exportId_fkey"
FOREIGN KEY ("exportId") REFERENCES "ControlMirrorEvidencePackExport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ControlMirrorEvidencePackExportDownloadEvent"
ADD CONSTRAINT "ControlMirrorEvidencePackExportDownloadEvent_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
