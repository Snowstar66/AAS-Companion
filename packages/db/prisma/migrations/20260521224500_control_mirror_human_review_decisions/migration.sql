CREATE TYPE "ControlMirrorReviewDecisionType" AS ENUM (
  'approve',
  'approve_with_controls',
  'reject',
  'defer',
  'downgrade',
  'request_exception',
  'request_rework'
);

CREATE TABLE "ControlMirrorHumanReviewDecisionEvent" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "reviewItemId" TEXT NOT NULL,
  "decisionType" "ControlMirrorReviewDecisionType" NOT NULL,
  "rationale" TEXT NOT NULL,
  "priorState" "ControlMirrorReviewItemState" NOT NULL,
  "resultingState" "ControlMirrorReviewItemState" NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ControlMirrorHumanReviewDecisionEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ControlMirrorHumanReviewDecisionEvent_organizationId_reviewItemId_createdAt_idx"
ON "ControlMirrorHumanReviewDecisionEvent"("organizationId", "reviewItemId", "createdAt");

CREATE INDEX "ControlMirrorHumanReviewDecisionEvent_organizationId_actorId_createdAt_idx"
ON "ControlMirrorHumanReviewDecisionEvent"("organizationId", "actorId", "createdAt");

CREATE INDEX "ControlMirrorHumanReviewDecisionEvent_organizationId_decisionType_createdAt_idx"
ON "ControlMirrorHumanReviewDecisionEvent"("organizationId", "decisionType", "createdAt");

ALTER TABLE "ControlMirrorHumanReviewDecisionEvent"
ADD CONSTRAINT "ControlMirrorHumanReviewDecisionEvent_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ControlMirrorHumanReviewDecisionEvent"
ADD CONSTRAINT "ControlMirrorHumanReviewDecisionEvent_reviewItemId_fkey"
FOREIGN KEY ("reviewItemId") REFERENCES "ControlMirrorHumanReviewItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ControlMirrorHumanReviewDecisionEvent"
ADD CONSTRAINT "ControlMirrorHumanReviewDecisionEvent_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
