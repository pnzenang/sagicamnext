ALTER TABLE "SponsorRegistrationPayment"
ADD COLUMN "amountVerified" DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN "verifiedAt" TIMESTAMP(3);
