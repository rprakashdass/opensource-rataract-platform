-- CreateTable
CREATE TABLE "AnonComplaint" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'COMPLAINT',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnonComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnonComplaint_clubId_status_idx" ON "AnonComplaint"("clubId", "status");

-- CreateIndex
CREATE INDEX "AnonComplaint_createdAt_idx" ON "AnonComplaint"("createdAt");

-- AddForeignKey
ALTER TABLE "AnonComplaint" ADD CONSTRAINT "AnonComplaint_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
