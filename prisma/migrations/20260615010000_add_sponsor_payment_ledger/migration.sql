CREATE TABLE "SponsorPaymentLedgerEntry" (
  "id" TEXT NOT NULL,
  "sponsorCode" TEXT NOT NULL,
  "paymentType" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "note" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SponsorPaymentLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SponsorPaymentLedgerEntry_sponsorCode_idx" ON "SponsorPaymentLedgerEntry"("sponsorCode");
CREATE INDEX "SponsorPaymentLedgerEntry_paymentType_idx" ON "SponsorPaymentLedgerEntry"("paymentType");
CREATE INDEX "SponsorPaymentLedgerEntry_eventType_idx" ON "SponsorPaymentLedgerEntry"("eventType");
CREATE INDEX "SponsorPaymentLedgerEntry_createdAt_idx" ON "SponsorPaymentLedgerEntry"("createdAt");
