-- AlterTable
ALTER TABLE "WebsiteSettings" ADD COLUMN "heroScrollAuto" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "heroScrollInterval" INTEGER NOT NULL DEFAULT 5;
