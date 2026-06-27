CREATE TABLE "NameChangeRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "sponsorCode" TEXT NOT NULL,
    "currentFirstName" TEXT NOT NULL,
    "currentLastAndMiddleNames" TEXT NOT NULL,
    "requestedFirstName" TEXT NOT NULL,
    "requestedLastAndMiddleNames" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "documentRequired" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "cloudinaryPublicId" TEXT,
    "cloudinaryResourceType" TEXT,
    "cloudinaryDeliveryType" TEXT,
    "cloudinaryFormat" TEXT,
    "cloudinaryVersion" INTEGER,
    "secureUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NameChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NameChangeRequest_memberId_idx" ON "NameChangeRequest"("memberId");
CREATE INDEX "NameChangeRequest_clerkId_idx" ON "NameChangeRequest"("clerkId");
CREATE INDEX "NameChangeRequest_sponsorCode_idx" ON "NameChangeRequest"("sponsorCode");
CREATE INDEX "NameChangeRequest_status_idx" ON "NameChangeRequest"("status");
CREATE INDEX "NameChangeRequest_createdAt_idx" ON "NameChangeRequest"("createdAt");

ALTER TABLE "NameChangeRequest" ADD CONSTRAINT "NameChangeRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
