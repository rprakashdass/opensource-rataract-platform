import { prisma } from "../src/lib/prisma";
import { Prisma } from "@prisma/client";

async function backfillMemories() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`Starting memories backfill${isDryRun ? " (DRY RUN)" : ""}...`);

  try {
    const clubs = await prisma.club.findMany({ select: { id: true, name: true } });

    for (const club of clubs) {
      console.log(`\nProcessing club: ${club.name}`);

      const settings = await prisma.websiteSettings.findUnique({
        where: { clubId: club.id }
      });

      if (!settings) {
        console.log(`  No website settings found, skipping.`);
        continue;
      }

      let albumId = settings.galleryAlbumId;
      if (!albumId) {
        if (isDryRun) {
          console.log(`  Would create 'Memories' album and link it.`);
          albumId = "dry-run-album-id";
        } else {
          const album = await prisma.album.create({
            data: {
              title: "Memories",
              clubId: club.id
            }
          });
          await prisma.websiteSettings.update({
            where: { clubId: club.id },
            data: { galleryAlbumId: album.id }
          });
          albumId = album.id;
          console.log(`  Created new Memories album (${albumId})`);
        }
      } else {
        console.log(`  Using existing Memories album (${albumId})`);
      }

      const showFeatured = settings.galleryShowFeatured ?? false;
      const showLatest = settings.galleryShowLatest ?? true;
      const limit = settings.galleryLimit || 6;

      const galleryWhere: Prisma.MediaWhereInput = {
        clubId: club.id,
        type: "IMAGE",
        ...(albumId !== "dry-run-album-id" && {
          albumId: albumId
        })
      };

      // In the old system, if showFeatured was true, it filtered by isFeatured.
      // If it was false, it just took the limit.
      const queryWhere: Prisma.MediaWhereInput = { ...galleryWhere };
      if (showFeatured) {
        queryWhere.isFeatured = true;
      }

      const currentHomepageMedia = await prisma.media.findMany({
        where: queryWhere,
        orderBy: { createdAt: showLatest === false ? "asc" : "desc" },
        take: limit,
      });

      console.log(`  Found ${currentHomepageMedia.length} images currently on homepage.`);

      if (isDryRun) {
        currentHomepageMedia.forEach((media, index) => {
          console.log(`  Would update media ${media.id} -> showOnHomepage: true, sortOrder: ${index + 1}`);
        });
      } else {
        let updatedCount = 0;
        for (let i = 0; i < currentHomepageMedia.length; i++) {
          const media = currentHomepageMedia[i];
          await prisma.media.update({
            where: { id: media.id },
            data: {
              showOnHomepage: true,
              sortOrder: i + 1
            }
          });
          updatedCount++;
        }
        console.log(`  Successfully updated ${updatedCount} images.`);
      }
    }

    console.log(`\nBackfill complete.`);
  } catch (err) {
    console.error("Backfill failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

backfillMemories();
