ALTER TABLE "PaymentAlertReset" ADD COLUMN "sponsorCode" TEXT NOT NULL DEFAULT '__all__';

DROP INDEX "PaymentAlertReset_alertType_key";

CREATE UNIQUE INDEX "PaymentAlertReset_alertType_sponsorCode_key" ON "PaymentAlertReset"("alertType", "sponsorCode");
CREATE INDEX "PaymentAlertReset_sponsorCode_idx" ON "PaymentAlertReset"("sponsorCode");
