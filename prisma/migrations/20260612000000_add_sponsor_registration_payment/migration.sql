CREATE TABLE "SponsorRegistrationPayment" (
  "id" TEXT NOT NULL,
  "sponsorCode" TEXT NOT NULL,
  "amountSent" DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SponsorRegistrationPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SponsorRegistrationPayment_sponsorCode_key" ON "SponsorRegistrationPayment"("sponsorCode");
CREATE INDEX "SponsorRegistrationPayment_sponsorCode_idx" ON "SponsorRegistrationPayment"("sponsorCode");
