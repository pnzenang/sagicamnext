CREATE TABLE "SponsorRegistrationUsage" (
  "id" TEXT NOT NULL,
  "sponsorCode" TEXT NOT NULL,
  "memberMatriculationNumber" TEXT NOT NULL,
  "amountUsed" DECIMAL(10, 2) NOT NULL DEFAULT 40,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SponsorRegistrationUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SponsorRegistrationUsage_memberMatriculationNumber_key" ON "SponsorRegistrationUsage"("memberMatriculationNumber");
CREATE INDEX "SponsorRegistrationUsage_sponsorCode_idx" ON "SponsorRegistrationUsage"("sponsorCode");

INSERT INTO "SponsorRegistrationUsage" (
  "id",
  "sponsorCode",
  "memberMatriculationNumber",
  "amountUsed",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('reg_usage_', MD5("memberMatriculationNumber")),
  "sponsorCode",
  "memberMatriculationNumber",
  40,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Member"
WHERE "memberStatus" = 'pending'
ON CONFLICT ("memberMatriculationNumber") DO NOTHING;
