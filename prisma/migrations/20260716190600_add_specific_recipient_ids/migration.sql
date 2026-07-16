-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "specificRecipientIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
