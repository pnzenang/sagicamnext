ALTER TABLE "SponsorContributionPayment" ADD COLUMN "lastSubmittedAt" TIMESTAMP(3);
ALTER TABLE "SponsorRegistrationPayment" ADD COLUMN "lastSubmittedAt" TIMESTAMP(3);

UPDATE "SponsorContributionPayment"
SET "lastSubmittedAt" = "updatedAt"
WHERE "amountSent" > 0;

UPDATE "SponsorRegistrationPayment"
SET "lastSubmittedAt" = "updatedAt"
WHERE "amountSent" > 0;

CREATE INDEX "SponsorContributionPayment_lastSubmittedAt_idx" ON "SponsorContributionPayment"("lastSubmittedAt");
CREATE INDEX "SponsorRegistrationPayment_lastSubmittedAt_idx" ON "SponsorRegistrationPayment"("lastSubmittedAt");

CREATE TABLE "PaymentAlertReset" (
  "id" TEXT NOT NULL,
  "alertType" TEXT NOT NULL,
  "resetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentAlertReset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentAlertReset_alertType_key" ON "PaymentAlertReset"("alertType");
