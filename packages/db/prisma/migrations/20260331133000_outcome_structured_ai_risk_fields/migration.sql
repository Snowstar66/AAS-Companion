ALTER TABLE "Outcome"
ADD COLUMN "aiUsageRole" TEXT,
ADD COLUMN "aiUsageIntent" TEXT,
ADD COLUMN "businessImpactLevel" "RiskProfile",
ADD COLUMN "businessImpactRationale" TEXT,
ADD COLUMN "dataSensitivityLevel" "RiskProfile",
ADD COLUMN "dataSensitivityRationale" TEXT,
ADD COLUMN "blastRadiusLevel" "RiskProfile",
ADD COLUMN "blastRadiusRationale" TEXT,
ADD COLUMN "decisionImpactLevel" "RiskProfile",
ADD COLUMN "decisionImpactRationale" TEXT,
ADD COLUMN "aiLevelJustification" TEXT,
ADD COLUMN "riskAcceptedAt" TIMESTAMP(3),
ADD COLUMN "riskAcceptedByValueOwnerId" TEXT;
