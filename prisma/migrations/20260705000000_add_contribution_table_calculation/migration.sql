ALTER TABLE "ContributionAssessment"
ADD COLUMN "deathCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dueDate" TIMESTAMP(3);

CREATE TABLE "ContributionCalculationDeath" (
    "id" TEXT NOT NULL,
    "deceasedMemberId" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "amountToContribute" DECIMAL(10,2) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCalculationDeath_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContributionCalculationAdminFee" (
    "id" TEXT NOT NULL DEFAULT 'current',
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCalculationAdminFee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContributionAssessmentDeath" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastAndMiddleNames" TEXT NOT NULL,
    "registrationDate" TEXT NOT NULL,
    "dateOfDeath" TEXT NOT NULL,
    "amountToContribute" DECIMAL(10,2) NOT NULL,
    "sponsorCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributionAssessmentDeath_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContributionCalculationDeath_deceasedMemberId_key" ON "ContributionCalculationDeath"("deceasedMemberId");
CREATE UNIQUE INDEX "ContributionCalculationDeath_memberMatriculationNumber_key" ON "ContributionCalculationDeath"("memberMatriculationNumber");
CREATE INDEX "ContributionCalculationDeath_createdAt_idx" ON "ContributionCalculationDeath"("createdAt");

CREATE INDEX "ContributionAssessmentDeath_assessmentId_idx" ON "ContributionAssessmentDeath"("assessmentId");
CREATE INDEX "ContributionAssessmentDeath_memberMatriculationNumber_idx" ON "ContributionAssessmentDeath"("memberMatriculationNumber");
CREATE INDEX "ContributionAssessmentDeath_sponsorCode_idx" ON "ContributionAssessmentDeath"("sponsorCode");

ALTER TABLE "ContributionCalculationDeath"
ADD CONSTRAINT "ContributionCalculationDeath_deceasedMemberId_fkey"
FOREIGN KEY ("deceasedMemberId") REFERENCES "DeceasedMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContributionAssessmentDeath"
ADD CONSTRAINT "ContributionAssessmentDeath_assessmentId_fkey"
FOREIGN KEY ("assessmentId") REFERENCES "ContributionAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
