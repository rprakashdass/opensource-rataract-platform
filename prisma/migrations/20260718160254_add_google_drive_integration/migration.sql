-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "googleDriveConnectedAt" TIMESTAMP(3),
ADD COLUMN     "googleDriveConnectedById" TEXT,
ADD COLUMN     "googleDriveEmail" TEXT,
ADD COLUMN     "googleDriveRefreshToken" TEXT,
ADD COLUMN     "googleDriveRootFolderId" TEXT;
