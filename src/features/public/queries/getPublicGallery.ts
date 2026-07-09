import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";

// Not wrapped in unstable_cache: uploaded media are stored as base64 data URLs and can
// exceed the Next.js Data Cache's 2MB-per-entry limit, which throws an unhandled
// rejection and breaks the request entirely. Caching isn't worth that failure mode here.
export async function getPublicGallery() {
  try {
      const club = await getCurrentClub();
      if (!club) return { error: "Club not initialized" };

      const albums = await prisma.album.findMany({
          where: { clubId: club.id },
          orderBy: { createdAt: "desc" },
          select: {
              id: true,
              title: true,
              description: true,
              createdAt: true,
              media: {
                take: 1,
                where: { isFeatured: true, type: 'IMAGE' },
                orderBy: { createdAt: 'desc' },
                select: { url: true, type: true }
              },
              _count: { select: { media: { where: { isFeatured: true } } } },
              event: { select: { title: true, slug: true } },
              project: { select: { title: true, slug: true } }
          }
      });

      return { albums };
  } catch (error: any) {
      console.error("Failed to fetch public gallery:", error);
      return { error: "Failed to load gallery" };
  }
}
