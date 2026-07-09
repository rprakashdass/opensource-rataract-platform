import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";

// Not wrapped in unstable_cache: uploaded media are stored as base64 data URLs and can
// exceed the Next.js Data Cache's 2MB-per-entry limit, which throws an unhandled
// rejection and breaks the request entirely. Caching isn't worth that failure mode here.
export async function getPublicEvents() {
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
                bannerMediaId: true,
                media: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, url: true } }
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
                bannerMediaId: true,
                media: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, url: true } }
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
}
