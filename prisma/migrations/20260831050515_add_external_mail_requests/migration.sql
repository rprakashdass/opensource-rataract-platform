-- CreateEnum
CREATE TYPE "ExternalMailStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT');

-- CreateTable
CREATE TABLE "ExternalMailRequest" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "requestedById" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ExternalMailStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "sentById" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMailRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalMailRequest_clubId_status_idx" ON "ExternalMailRequest"("clubId", "status");

-- CreateIndex
CREATE INDEX "ExternalMailRequest_requestedById_idx" ON "ExternalMailRequest"("requestedById");

-- AddForeignKey
ALTER TABLE "ExternalMailRequest" ADD CONSTRAINT "ExternalMailRequest_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMailRequest" ADD CONSTRAINT "ExternalMailRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMailRequest" ADD CONSTRAINT "ExternalMailRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMailRequest" ADD CONSTRAINT "ExternalMailRequest_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
