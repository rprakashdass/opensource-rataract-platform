import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export const getPublicEvents = unstable_cache(
  async () => {
    try {
        const club = await getCurrentClub();
        if (!club) return { error: "Club not initialized" };

        const upcomingEvents = await prisma.event.findMany({
            where: {
                clubId: club.id,
                status: { in: ["UPCOMING", "ONGOING"] },
                publishStatus: "PUBLISHED",
                visibility: "PUBLIC",
            },
            orderBy: { startDate: "asc" },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                startDate: true,
                startTime: true,
                location: true,
                type: true,
                media: { where: { isFeatured: true }, take: 1, select: { url: true } }
            },
        });
        
        const completedEvents = await prisma.event.findMany({
            where: {
                clubId: club.id,
                status: "COMPLETED",
                publishStatus: "PUBLISHED",
                visibility: "PUBLIC",
            },
            orderBy: { startDate: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                startDate: true,
                startTime: true,
                location: true,
                type: true,
                media: { where: { isFeatured: true }, take: 1, select: { url: true } }
            },
            take: 20 // Limit to recent 20
        });

        return {
            upcomingEvents,
            completedEvents
        };
    } catch (error: any) {
        console.error("Failed to fetch public events:", error);
        return { error: "Failed to load events" };
    }
  },
  ['public-events'],
  { tags: ['events'], revalidate: 3600 }
);
