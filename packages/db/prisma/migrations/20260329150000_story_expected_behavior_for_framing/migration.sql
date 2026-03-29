ALTER TABLE "Story"
ADD COLUMN "expectedBehavior" TEXT;

UPDATE "Story"
SET "expectedBehavior" = NULLIF(
  COALESCE(
    "acceptanceCriteria"[1],
    NULLIF(split_part(COALESCE("testDefinition", ''), E'\n', 1), ''),
    ''
  ),
  ''
);
