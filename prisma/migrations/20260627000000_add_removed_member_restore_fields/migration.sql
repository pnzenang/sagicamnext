ALTER TABLE "RemovedMember" ADD COLUMN "originalMemberId" TEXT;
ALTER TABLE "RemovedMember" ADD COLUMN "nameOfBeneficiary" TEXT;
ALTER TABLE "RemovedMember" ADD COLUMN "delegateRecommendation" TEXT;
ALTER TABLE "RemovedMember" ADD COLUMN "originalMemberCreatedAt" TIMESTAMP(3);
