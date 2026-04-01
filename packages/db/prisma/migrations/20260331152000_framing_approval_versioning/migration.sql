-- AlterTable
ALTER TABLE "Outcome"
ADD COLUMN "framingVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Tollgate"
ADD COLUMN "submissionVersion" INTEGER,
ADD COLUMN "approvedVersion" INTEGER,
ADD COLUMN "approvalSnapshot" JSONB;

-- AlterTable
ALTER TABLE "SignoffRecord"
ADD COLUMN "entityVersion" INTEGER;
