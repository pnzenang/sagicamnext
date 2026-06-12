CREATE TABLE "SponsorContributionCredit" (
  "id" TEXT NOT NULL,
  "sponsorCode" TEXT NOT NULL,
  "memberMatriculationNumber" TEXT NOT NULL,
  "amountCredited" DECIMAL(10, 2) NOT NULL DEFAULT 30,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SponsorContributionCredit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SponsorContributionCredit_memberMatriculationNumber_key" ON "SponsorContributionCredit"("memberMatriculationNumber");
CREATE INDEX "SponsorContributionCredit_sponsorCode_idx" ON "SponsorContributionCredit"("sponsorCode");
