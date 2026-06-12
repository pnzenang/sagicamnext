CREATE TABLE "SponsorContributionUsage" (
  "id" TEXT NOT NULL,
  "sponsorCode" TEXT NOT NULL,
  "amountUsed" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SponsorContributionUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SponsorContributionUsage_sponsorCode_key" ON "SponsorContributionUsage"("sponsorCode");
CREATE INDEX "SponsorContributionUsage_sponsorCode_idx" ON "SponsorContributionUsage"("sponsorCode");
