-- Speeds up story workspace lookup from legacy story records back to their direction seed.
CREATE INDEX IF NOT EXISTS "DirectionSeed_organizationId_sourceStoryId_idx"
  ON "DirectionSeed"("organizationId", "sourceStoryId");
