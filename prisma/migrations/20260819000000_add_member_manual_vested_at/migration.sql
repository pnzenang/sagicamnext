ALTER TABLE "Member" ADD COLUMN "manuallyVestedAt" TIMESTAMP(3);

CREATE INDEX "Member_memberStatus_manuallyVestedAt_idx" ON "Member"("memberStatus", "manuallyVestedAt");
