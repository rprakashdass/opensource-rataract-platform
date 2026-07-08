import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export async function getPublicGallery() {
  const fetchGallery = unstable_cache(
    async () => {
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
    },
    ['public-gallery'],
    { tags: ['gallery'], revalidate: 3600 }
  );

  return fetchGallery();
}
