import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export async function getPublicEvent(slug: string) {
  const fetchEvent = unstable_cache(
    async (slug: string) => {
      try {
          const club = await getCurrentClub();
          if (!club) return { error: "Club not initialized" };

          const event = await prisma.event.findUnique({
              where: { 
                  clubId_slug: {
                      clubId: club.id,
                      slug: slug
                  } 
              },
              select: {
                  id: true,
                  title: true,
                  slug: true,
                  description: true,
                  startDate: true,
                  startTime: true,
                  endTime: true,
                  location: true,
                  type: true,
                  status: true,
                  project: { select: { id: true, title: true, slug: true } },
                  members: {
                      select: { role: true, member: { select: { name: true, avatar: true } } }
                  },
                  media: { where: { isFeatured: true }, select: { url: true, type: true } }
              }
          });

          if (!event || event.status === "DRAFT") {
               return { error: "Event not found" };
          }

          return { event };
      } catch (error: any) {
          console.error("Failed to fetch public event:", error);
          return { error: "Failed to load event" };
      }
    },
    ['public-event', slug],
    { tags: ['events'], revalidate: 3600 }
  );

  return fetchEvent(slug);
}
