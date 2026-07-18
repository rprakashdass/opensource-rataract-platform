-- DropIndex
DROP INDEX "BoardMember_memberId_key";

-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "specificRecipientIds" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Announcement_clubId_status_visibility_idx" ON "Announcement"("clubId", "status", "visibility");

-- CreateIndex
CREATE INDEX "Event_clubId_status_startDate_idx" ON "Event"("clubId", "status", "startDate");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Media_clubId_albumId_idx" ON "Media"("clubId", "albumId");

-- CreateIndex
CREATE INDEX "Project_clubId_status_idx" ON "Project"("clubId", "status");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");
