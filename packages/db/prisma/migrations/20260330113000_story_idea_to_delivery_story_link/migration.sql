ALTER TABLE "Story"
ADD COLUMN "sourceDirectionSeedId" TEXT;

UPDATE "Story" AS story
SET "sourceDirectionSeedId" = seed."id"
FROM "DirectionSeed" AS seed
WHERE seed."organizationId" = story."organizationId"
  AND seed."sourceStoryId" = story."id"
  AND story."sourceDirectionSeedId" IS NULL;

CREATE UNIQUE INDEX "Story_organizationId_sourceDirectionSeedId_key"
ON "Story"("organizationId", "sourceDirectionSeedId");

CREATE INDEX "Story_organizationId_sourceDirectionSeedId_idx"
ON "Story"("organizationId", "sourceDirectionSeedId");

ALTER TABLE "Story"
ADD CONSTRAINT "Story_sourceDirectionSeedId_fkey"
FOREIGN KEY ("sourceDirectionSeedId") REFERENCES "DirectionSeed"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
