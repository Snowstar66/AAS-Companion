CREATE TYPE "ArtifactImportIntent" AS ENUM ('framing', 'design');

ALTER TABLE "ArtifactIntakeSession"
ADD COLUMN "importIntent" "ArtifactImportIntent" NOT NULL DEFAULT 'framing';
