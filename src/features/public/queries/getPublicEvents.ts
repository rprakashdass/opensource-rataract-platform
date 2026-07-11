import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const getCachedPublicEvents = unstable_cache(
    async () => {
        const club = await getCurrentClub();
        if (!club) return null;

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
                capacity: true,
                registeredCount: true,
                bannerMediaId: true,
                media: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true } }
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
                capacity: true,
                registeredCount: true,
                volunteerHours: true,
                bannerMediaId: true,
                media: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true } }
            },
            take: 20
        });

        const settings = await prisma.websiteSettings.findUnique({
            where: { clubId: club.id },
            select: {
                eventsEyebrow: true,
                eventsSubtitle: true,
                eventsUpcomingTitle: true,
                eventsCompletedTitle: true,
                eventsCompletedCTA: true,
            },
        });

        return {
            upcomingEvents,
            completedEvents,
            settings,
        };
    },
    ["public-events-list"],
    { tags: ["events", "website-settings"], revalidate: 3600 }
);

export async function getPublicEvents() {
    try {
        const base = await getCachedPublicEvents();
        if (!base) return { error: "Club not initialized" };

        const allMediaIds = [
            ...base.upcomingEvents.flatMap(e => e.media.map(m => m.id)),
            ...base.completedEvents.flatMap(e => e.media.map(m => m.id))
        ];

        const mediaData = allMediaIds.length > 0
            ? await prisma.media.findMany({
                where: { id: { in: allMediaIds } },
                select: { id: true, url: true }
              })
            : [];

        const urlMap = new Map(mediaData.map(m => [m.id, m.url]));

        const upcomingEvents = base.upcomingEvents.map(e => ({
            ...e,
            media: e.media.map(m => ({ id: m.id, url: urlMap.get(m.id) || "" }))
        }));

        const completedEvents = base.completedEvents.map(e => ({
            ...e,
            media: e.media.map(m => ({ id: m.id, url: urlMap.get(m.id) || "" }))
        }));

        return {
            upcomingEvents,
            completedEvents,
            settings: base.settings,
        };
    } catch (error: any) {
        console.error("Failed to fetch public events:", error);
        return { error: "Failed to load events" };
    }
}
