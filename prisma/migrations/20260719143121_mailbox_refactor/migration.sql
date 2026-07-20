/*
  Warnings:

  - You are about to drop the `Complaint` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MailboxStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MailboxPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "MailboxType" AS ENUM ('COMPLAINT', 'EXCUSE', 'INQUIRY', 'OTHER');

-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_clubId_fkey";

-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_memberId_fkey";

-- DropTable
DROP TABLE "Complaint";

-- DropEnum
DROP TYPE "ComplaintPriority";

-- DropEnum
DROP TYPE "ComplaintStatus";

-- CreateTable
CREATE TABLE "MemberCommunication" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "MailboxType" NOT NULL DEFAULT 'COMPLAINT',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MailboxStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "MailboxPriority" NOT NULL DEFAULT 'MEDIUM',
    "adminNotes" TEXT,
    "statusUpdatedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberCommunication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberCommunication_clubId_status_idx" ON "MemberCommunication"("clubId", "status");

-- CreateIndex
CREATE INDEX "MemberCommunication_memberId_idx" ON "MemberCommunication"("memberId");

-- CreateIndex
CREATE INDEX "MemberCommunication_createdAt_idx" ON "MemberCommunication"("createdAt");

-- AddForeignKey
ALTER TABLE "MemberCommunication" ADD CONSTRAINT "MemberCommunication_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberCommunication" ADD CONSTRAINT "MemberCommunication_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
