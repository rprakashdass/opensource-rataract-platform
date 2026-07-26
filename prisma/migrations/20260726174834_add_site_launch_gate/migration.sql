-- AlterTable
ALTER TABLE "WebsiteSettings" ADD COLUMN     "launchAt" TIMESTAMP(3),
ADD COLUMN     "siteLive" BOOLEAN NOT NULL DEFAULT false;
