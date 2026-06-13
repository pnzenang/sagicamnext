CREATE TABLE "SponsorBalanceAdjustment" (
  "id" TEXT NOT NULL,
  "sponsorCode" TEXT NOT NULL,
  "balanceType" TEXT NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SponsorBalanceAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SponsorBalanceAdjustment_sponsorCode_balanceType_key" ON "SponsorBalanceAdjustment"("sponsorCode", "balanceType");
CREATE INDEX "SponsorBalanceAdjustment_sponsorCode_idx" ON "SponsorBalanceAdjustment"("sponsorCode");
CREATE INDEX "SponsorBalanceAdjustment_balanceType_idx" ON "SponsorBalanceAdjustment"("balanceType");
