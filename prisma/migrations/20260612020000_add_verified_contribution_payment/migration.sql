ALTER TABLE "SponsorContributionPayment"
ADD COLUMN "amountVerified" DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN "verifiedAt" TIMESTAMP(3);

UPDATE "SponsorContributionPayment"
SET "amountVerified" = "amountSent",
    "verifiedAt" = CURRENT_TIMESTAMP
WHERE "amountSent" > 0;
