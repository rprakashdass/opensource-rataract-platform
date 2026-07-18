import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const fetchPublicEventsData = unstable_cache(
    async () => {
        const club = await getCurrentClub();
        if (!club) return null;

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const upcomingEvents = await prisma.event.findMany({
            where: {
                clubId: club.id,
                status: { in: ["UPCOMING", "ONGOING"] },
                publishStatus: "PUBLISHED",
                visibility: "PUBLIC",
                OR: [
                    { endTime: { gte: now } },
                    { endTime: null, startTime: { gte: twentyFourHoursAgo } }
                ]
            },
            orderBy: { startDate: "asc" },
            select: {
                id: true,
                title: true,
                slug: true,
                // description is excluded to reduce egress on list views
                startDate: true,
                startTime: true,
                location: true,
                type: true,
                capacity: true,
                registeredCount: true,
                bannerMediaId: true,
                media: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, url: true } }
            },
        });
        
        const completedEvents = await prisma.event.findMany({
            where: {
                clubId: club.id,
                publishStatus: "PUBLISHED",
                visibility: "PUBLIC",
                OR: [
                    { status: "COMPLETED" },
                    {
                        status: { in: ["UPCOMING", "ONGOING"] },
                        endTime: { lt: now }
                    },
                    {
                        status: { in: ["UPCOMING", "ONGOING"] },
                        endTime: null,
                        startTime: { lt: twentyFourHoursAgo }
                    }
                ]
            },
            orderBy: { startDate: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                // description is excluded to reduce egress on list views
                startDate: true,
                startTime: true,
                location: true,
                type: true,
                capacity: true,
                registeredCount: true,
                volunteerHours: true,
                bannerMediaId: true,
                media: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, url: true } }
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

        const formattedUpcoming = upcomingEvents.map(e => ({
            ...e,
            media: e.media.map(m => ({ id: m.id, url: m.url || "" }))
        }));

        const formattedCompleted = completedEvents.map(e => ({
            ...e,
            media: e.media.map(m => ({ id: m.id, url: m.url || "" }))
        }));

        return {
            upcomingEvents: formattedUpcoming,
            completedEvents: formattedCompleted,
            settings,
        };
    },
    ["public-events-data"],
    { tags: ["events", "settings"], revalidate: 300 }
);

export async function getPublicEvents() {
    try {
        const data = await fetchPublicEventsData();
        if (!data) return { error: "Club not initialized" };
        return data;
    } catch (error: any) {
        console.error("Failed to fetch public events:", error);
        return { error: "Failed to load events" };
    }
}
