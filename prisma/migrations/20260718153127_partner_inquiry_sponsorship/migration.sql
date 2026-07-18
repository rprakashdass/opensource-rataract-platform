-- CreateEnum
CREATE TYPE "CauseType" AS ENUM ('PROJECT', 'EVENT');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "seekingSponsorship" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sponsorshipGoal" DOUBLE PRECISION,
ADD COLUMN     "sponsorshipPitch" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "seekingSponsorship" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sponsorshipGoal" DOUBLE PRECISION,
ADD COLUMN     "sponsorshipPitch" TEXT;

-- CreateTable
CREATE TABLE "PartnerInquiry" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "causeType" "CauseType",
    "causeId" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerInquiry_clubId_createdAt_idx" ON "PartnerInquiry"("clubId", "createdAt");

-- AddForeignKey
ALTER TABLE "PartnerInquiry" ADD CONSTRAINT "PartnerInquiry_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
