CREATE TYPE "ControlMirrorEvidencePackExportAcceptanceReviewerRole" AS ENUM ('product_owner', 'security_privacy', 'aqa');

CREATE TYPE "ControlMirrorEvidencePackExportAcceptanceDecisionType" AS ENUM ('accepted', 'accepted_with_conditions', 'changes_requested');

CREATE TABLE "ControlMirrorEvidencePackExportAcceptanceDecision" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "exportId" TEXT NOT NULL,
  "reviewerRole" "ControlMirrorEvidencePackExportAcceptanceReviewerRole" NOT NULL,
  "decisionType" "ControlMirrorEvidencePackExportAcceptanceDecisionType" NOT NULL,
  "rationale" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ControlMirrorEvidencePackExportAcceptanceDecision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cm_export_acceptance_export_idx"
ON "ControlMirrorEvidencePackExportAcceptanceDecision"("organizationId", "exportId", "createdAt");

CREATE INDEX "cm_export_acceptance_actor_idx"
ON "ControlMirrorEvidencePackExportAcceptanceDecision"("organizationId", "actorId", "createdAt");

CREATE INDEX "cm_export_acceptance_role_decision_idx"
ON "ControlMirrorEvidencePackExportAcceptanceDecision"("organizationId", "reviewerRole", "decisionType");

ALTER TABLE "ControlMirrorEvidencePackExportAcceptanceDecision"
ADD CONSTRAINT "ControlMirrorEvidencePackExportAcceptanceDecision_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ControlMirrorEvidencePackExportAcceptanceDecision"
ADD CONSTRAINT "ControlMirrorEvidencePackExportAcceptanceDecision_exportId_fkey"
FOREIGN KEY ("exportId") REFERENCES "ControlMirrorEvidencePackExport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ControlMirrorEvidencePackExportAcceptanceDecision"
ADD CONSTRAINT "ControlMirrorEvidencePackExportAcceptanceDecision_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
