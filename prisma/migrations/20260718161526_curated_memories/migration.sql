-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WebsiteSettings" ALTER COLUMN "galleryLayout" SET DEFAULT 'masonry';

-- Data Correction
UPDATE "WebsiteSettings" SET "galleryLayout" = 'masonry'
WHERE "galleryLayout" IS NULL OR "galleryLayout" = 'MASONRY';
