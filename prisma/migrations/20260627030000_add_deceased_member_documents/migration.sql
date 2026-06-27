CREATE TABLE "DeceasedMemberDocument" (
    "id" TEXT NOT NULL,
    "deceasedMemberId" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "sponsorCode" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileData" BYTEA NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeceasedMemberDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeceasedMemberDocument_deceasedMemberId_documentType_key" ON "DeceasedMemberDocument"("deceasedMemberId", "documentType");
CREATE INDEX "DeceasedMemberDocument_deceasedMemberId_idx" ON "DeceasedMemberDocument"("deceasedMemberId");
CREATE INDEX "DeceasedMemberDocument_sponsorCode_idx" ON "DeceasedMemberDocument"("sponsorCode");
CREATE INDEX "DeceasedMemberDocument_clerkId_idx" ON "DeceasedMemberDocument"("clerkId");
CREATE INDEX "DeceasedMemberDocument_status_idx" ON "DeceasedMemberDocument"("status");

ALTER TABLE "DeceasedMemberDocument" ADD CONSTRAINT "DeceasedMemberDocument_deceasedMemberId_fkey" FOREIGN KEY ("deceasedMemberId") REFERENCES "DeceasedMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
