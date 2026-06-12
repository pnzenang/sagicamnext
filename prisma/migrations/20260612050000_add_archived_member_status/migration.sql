ALTER TABLE "RemovedMember" ADD COLUMN "memberStatus" TEXT;
ALTER TABLE "DeceasedMember" ADD COLUMN "memberStatus" TEXT;

CREATE INDEX "RemovedMember_sponsorCode_memberStatus_idx" ON "RemovedMember"("sponsorCode", "memberStatus");
CREATE INDEX "DeceasedMember_sponsorCode_memberStatus_idx" ON "DeceasedMember"("sponsorCode", "memberStatus");
