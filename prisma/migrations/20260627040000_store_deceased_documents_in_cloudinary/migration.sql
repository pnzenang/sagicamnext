ALTER TABLE "DeceasedMemberDocument" ADD COLUMN "cloudinaryPublicId" TEXT;
ALTER TABLE "DeceasedMemberDocument" ADD COLUMN "cloudinaryResourceType" TEXT;
ALTER TABLE "DeceasedMemberDocument" ADD COLUMN "cloudinaryDeliveryType" TEXT;
ALTER TABLE "DeceasedMemberDocument" ADD COLUMN "cloudinaryFormat" TEXT;
ALTER TABLE "DeceasedMemberDocument" ADD COLUMN "cloudinaryVersion" INTEGER;
ALTER TABLE "DeceasedMemberDocument" ADD COLUMN "secureUrl" TEXT;
ALTER TABLE "DeceasedMemberDocument" ALTER COLUMN "fileData" DROP NOT NULL;
