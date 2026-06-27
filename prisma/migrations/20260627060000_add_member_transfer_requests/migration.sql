CREATE TABLE "MemberTransferRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "initiatingClerkId" TEXT NOT NULL,
    "initiatingSponsorCode" TEXT NOT NULL,
    "receivingClerkId" TEXT NOT NULL,
    "receivingSponsorCode" TEXT NOT NULL,
    "currentFirstName" TEXT NOT NULL,
    "currentLastAndMiddleNames" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'receiving_sponsor_pending',
    "rejectionReason" TEXT,
    "receivingReviewedBy" TEXT,
    "receivingReviewedAt" TIMESTAMP(3),
    "adminReviewedBy" TEXT,
    "adminReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberTransferRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MemberTransferRequest_memberId_idx" ON "MemberTransferRequest"("memberId");
CREATE INDEX "MemberTransferRequest_initiatingClerkId_idx" ON "MemberTransferRequest"("initiatingClerkId");
CREATE INDEX "MemberTransferRequest_receivingClerkId_idx" ON "MemberTransferRequest"("receivingClerkId");
CREATE INDEX "MemberTransferRequest_initiatingSponsorCode_idx" ON "MemberTransferRequest"("initiatingSponsorCode");
CREATE INDEX "MemberTransferRequest_receivingSponsorCode_idx" ON "MemberTransferRequest"("receivingSponsorCode");
CREATE INDEX "MemberTransferRequest_status_idx" ON "MemberTransferRequest"("status");
CREATE INDEX "MemberTransferRequest_createdAt_idx" ON "MemberTransferRequest"("createdAt");

ALTER TABLE "MemberTransferRequest" ADD CONSTRAINT "MemberTransferRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
