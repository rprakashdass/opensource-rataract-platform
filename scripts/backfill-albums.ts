import { prisma } from "../src/lib/prisma";

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  if (isDryRun) {
    console.log("Running in DRY-RUN mode. No changes will be saved.");
  }

  // Fetch all media items without an albumId
  const mediaWithoutAlbum = await prisma.media.findMany({
    where: { albumId: null },
    select: {
      id: true,
      clubId: true,
      eventId: true,
      projectId: true,
      usage: true,
      event: { select: { title: true } },
      project: { select: { title: true } }
    }
  });

  console.log(`Found ${mediaWithoutAlbum.length} media items without an albumId.`);

  for (const media of mediaWithoutAlbum) {
    let albumTitle = "General";
    
    // Determine albumTitle based on existing relations or usage
    if (media.eventId && media.event) {
      albumTitle = `Events / ${media.event.title}`;
    } else if (media.projectId && media.project) {
      albumTitle = `Projects / ${media.project.title}`;
    } else if (media.usage === "WEBSITE") {
      albumTitle = "Website";
    } else if (media.usage === "BANNER" || media.usage === "POSTER" || media.usage === "COVER") {
      albumTitle = "General";
    } else {
       albumTitle = "General";
    }

    // Find or create Album
    let album = await prisma.album.findFirst({
      where: {
        clubId: media.clubId,
        ...(media.eventId ? { eventId: media.eventId } : { eventId: null }),
        ...(media.projectId ? { projectId: media.projectId } : { projectId: null }),
        ...(!media.eventId && !media.projectId ? { title: albumTitle } : {}),
      }
    });

    if (!album) {
      console.log(`[Media ${media.id}] Creating album: ${albumTitle}`);
      if (!isDryRun) {
        album = await prisma.album.create({
          data: {
            clubId: media.clubId,
            title: albumTitle,
            eventId: media.eventId,
            projectId: media.projectId,
          }
        });
      }
    } else {
      console.log(`[Media ${media.id}] Found existing album: ${albumTitle} (${album.id})`);
    }

    if (!isDryRun && album) {
      await prisma.media.update({
        where: { id: media.id },
        data: { albumId: album.id }
      });
      console.log(`[Media ${media.id}] Assigned to album ${album.id}`);
    } else if (isDryRun) {
      console.log(`[Media ${media.id}] (Dry Run) Would assign to album: ${albumTitle}`);
    }
  }

  console.log("Backfill complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
