ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'direction_seed';
ALTER TYPE "ActivityEventType" ADD VALUE IF NOT EXISTS 'direction_seed_created';
ALTER TYPE "ActivityEventType" ADD VALUE IF NOT EXISTS 'direction_seed_updated';

CREATE TABLE "DirectionSeed" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "epicId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "expectedBehavior" TEXT,
    "sourceStoryId" TEXT,
    "originType" "GovernedObjectOriginType" NOT NULL DEFAULT 'native',
    "createdMode" "GovernedObjectCreatedMode" NOT NULL DEFAULT 'clean',
    "lifecycleState" "GovernedLifecycleState" NOT NULL DEFAULT 'active',
    "archivedAt" TIMESTAMP(3),
    "archiveReason" TEXT,
    "lineageSourceType" "LineageSourceType",
    "lineageSourceId" TEXT,
    "lineageNote" TEXT,
    "importedReadinessState" "ImportedGovernedReadinessState",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectionSeed_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DirectionSeed_organizationId_key_key" ON "DirectionSeed"("organizationId", "key");
CREATE INDEX "DirectionSeed_organizationId_outcomeId_lifecycleState_idx" ON "DirectionSeed"("organizationId", "outcomeId", "lifecycleState");
CREATE INDEX "DirectionSeed_organizationId_epicId_lifecycleState_idx" ON "DirectionSeed"("organizationId", "epicId", "lifecycleState");
CREATE INDEX "DirectionSeed_organizationId_originType_idx" ON "DirectionSeed"("organizationId", "originType");
CREATE INDEX "DirectionSeed_organizationId_lifecycleState_idx" ON "DirectionSeed"("organizationId", "lifecycleState");
CREATE INDEX "DirectionSeed_organizationId_createdAt_idx" ON "DirectionSeed"("organizationId", "createdAt");

ALTER TABLE "DirectionSeed" ADD CONSTRAINT "DirectionSeed_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectionSeed" ADD CONSTRAINT "DirectionSeed_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DirectionSeed" ADD CONSTRAINT "DirectionSeed_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Epic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "DirectionSeed" (
    "id",
    "organizationId",
    "outcomeId",
    "epicId",
    "key",
    "title",
    "shortDescription",
    "expectedBehavior",
    "sourceStoryId",
    "originType",
    "createdMode",
    "lifecycleState",
    "archivedAt",
    "archiveReason",
    "lineageSourceType",
    "lineageSourceId",
    "lineageNote",
    "importedReadinessState",
    "createdAt",
    "updatedAt"
)
SELECT
    'seed_' || s."id",
    s."organizationId",
    s."outcomeId",
    s."epicId",
    s."key",
    s."title",
    COALESCE(NULLIF(TRIM(s."valueIntent"), ''), 'Direction seed migrated from framing story.'),
    CASE
        WHEN COALESCE(array_length(s."acceptanceCriteria", 1), 0) = 0 THEN NULL
        WHEN COALESCE(array_length(s."acceptanceCriteria", 1), 0) = 1 THEN s."acceptanceCriteria"[1]
        ELSE s."acceptanceCriteria"[1] || ' | ' || s."acceptanceCriteria"[2]
    END,
    s."id",
    s."originType",
    s."createdMode",
    s."lifecycleState",
    s."archivedAt",
    s."archiveReason",
    s."lineageSourceType",
    s."lineageSourceId",
    s."lineageNote",
    s."importedReadinessState",
    s."createdAt",
    s."updatedAt"
FROM "Story" s
LEFT JOIN "DirectionSeed" existing
  ON existing."organizationId" = s."organizationId"
 AND existing."key" = s."key"
WHERE existing."id" IS NULL;
