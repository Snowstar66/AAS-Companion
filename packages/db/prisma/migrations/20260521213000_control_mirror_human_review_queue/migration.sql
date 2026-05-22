CREATE TYPE "ControlMirrorReviewItemState" AS ENUM ('open', 'decided', 'deferred', 'superseded');

CREATE TYPE "ControlMirrorReviewItemSeverity" AS ENUM ('high', 'medium', 'low');

CREATE TYPE "ControlMirrorReviewRecommendedOption" AS ENUM ('approve', 'approve_with_condition', 'reject', 'defer', 'request_change');

CREATE TABLE "ControlMirrorHumanReviewItem" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "snapshotId" TEXT,
  "sourceFindingId" TEXT NOT NULL,
  "stableFindingKey" TEXT NOT NULL,
  "severity" "ControlMirrorReviewItemSeverity" NOT NULL,
  "category" TEXT NOT NULL,
  "decisionNeeded" TEXT NOT NULL,
  "recommendedOption" "ControlMirrorReviewRecommendedOption" NOT NULL,
  "affectedObject" TEXT NOT NULL,
  "affectedOutcomeId" TEXT,
  "affectedEpicId" TEXT,
  "affectedStoryId" TEXT,
  "blocksRelease" BOOLEAN NOT NULL DEFAULT false,
  "reviewHref" TEXT NOT NULL,
  "valueRationale" TEXT NOT NULL,
  "alternatives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "riskIfApproved" TEXT NOT NULL,
  "riskIfNotApproved" TEXT NOT NULL,
  "suggestedResponse" TEXT NOT NULL,
  "rationale" TEXT NOT NULL,
  "sourceLineageJson" JSONB,
  "state" "ControlMirrorReviewItemState" NOT NULL DEFAULT 'open',
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ControlMirrorHumanReviewItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ControlMirrorHumanReviewItem_organizationId_stableFindingKey_key"
ON "ControlMirrorHumanReviewItem"("organizationId", "stableFindingKey");

CREATE INDEX "ControlMirrorHumanReviewItem_organizationId_state_updatedAt_idx"
ON "ControlMirrorHumanReviewItem"("organizationId", "state", "updatedAt");

CREATE INDEX "ControlMirrorHumanReviewItem_organizationId_sourceFindingId_idx"
ON "ControlMirrorHumanReviewItem"("organizationId", "sourceFindingId");

CREATE INDEX "ControlMirrorHumanReviewItem_organizationId_snapshotId_idx"
ON "ControlMirrorHumanReviewItem"("organizationId", "snapshotId");

CREATE INDEX "ControlMirrorHumanReviewItem_organizationId_blocksRelease_state_idx"
ON "ControlMirrorHumanReviewItem"("organizationId", "blocksRelease", "state");

ALTER TABLE "ControlMirrorHumanReviewItem"
ADD CONSTRAINT "ControlMirrorHumanReviewItem_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ControlMirrorHumanReviewItem"
ADD CONSTRAINT "ControlMirrorHumanReviewItem_snapshotId_fkey"
FOREIGN KEY ("snapshotId") REFERENCES "ControlMirrorSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
