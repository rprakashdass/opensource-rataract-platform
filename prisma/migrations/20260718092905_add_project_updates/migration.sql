-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "projectUpdateId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "frequency" TEXT;

-- CreateTable
CREATE TABLE "ProjectUpdate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "beneficiaries" INTEGER,
    "volunteerHours" DOUBLE PRECISION,
    "impactNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectUpdateParticipant" (
    "id" TEXT NOT NULL,
    "projectUpdateId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "ProjectUpdateParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectUpdate_projectId_date_idx" ON "ProjectUpdate"("projectId", "date");

-- CreateIndex
CREATE INDEX "ProjectUpdate_clubId_isFeatured_idx" ON "ProjectUpdate"("clubId", "isFeatured");

-- CreateIndex
CREATE INDEX "ProjectUpdateParticipant_memberId_idx" ON "ProjectUpdateParticipant"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectUpdateParticipant_projectUpdateId_memberId_key" ON "ProjectUpdateParticipant"("projectUpdateId", "memberId");

-- AddForeignKey
ALTER TABLE "ProjectUpdate" ADD CONSTRAINT "ProjectUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUpdate" ADD CONSTRAINT "ProjectUpdate_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUpdateParticipant" ADD CONSTRAINT "ProjectUpdateParticipant_projectUpdateId_fkey" FOREIGN KEY ("projectUpdateId") REFERENCES "ProjectUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUpdateParticipant" ADD CONSTRAINT "ProjectUpdateParticipant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_projectUpdateId_fkey" FOREIGN KEY ("projectUpdateId") REFERENCES "ProjectUpdate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
