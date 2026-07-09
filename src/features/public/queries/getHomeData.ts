import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export const getHomeBaseData = unstable_cache(
    async () => {
        try {
            const club = await getCurrentClub();
            if (!club) return { error: "Club not initialized" };
            
            const websiteSettings = await prisma.websiteSettings.findUnique({
                where: { clubId: club.id }
            }) as any;
            
            return {
                club: {
                    id: club.id,
                    name: club.name,
                    missionStatement: club.missionStatement,
                    tenureYear: club.tenureYear,
                },
                settings: websiteSettings
            };
        } catch (error) {
            return { error: "Failed to load base data" };
        }
    },
    ['home-base-data'],
    { tags: ['homepage', 'club', 'website-settings'], revalidate: 3600 }
);

export const getHomePortfolios = unstable_cache(
    async (clubId: string) => {
        try {
            const portfolios = await prisma.portfolio.findMany({
                where: { clubId, isActive: true },
                orderBy: { displayOrder: "asc" }
            });
            return portfolios.map(p => ({
                id: p.id,
                name: p.name,
                icon: p.icon,
                description: p.description,
            }));
        } catch (error) {
            return [];
        }
    },
    ['home-portfolios-data'],
    { tags: ['homepage', 'portfolios'], revalidate: 3600 }
);

export const getHomeImpact = unstable_cache(
    async (clubId: string) => {
        try {
            const membersCount = await prisma.member.count({ where: { clubId, isActive: true } });
            const projectsCount = await prisma.project.count({ where: { clubId, status: "COMPLETED" } });
            const allAttendances = await prisma.attendance.findMany({
                where: { event: { clubId } },
                select: { volunteerHours: true }
            });
            const volunteerHours = allAttendances.reduce((acc, curr) => acc + Number(curr.volunteerHours || 0), 0);
            const eventsCount = await prisma.event.count({ where: { clubId, status: "COMPLETED" } });
            
            return { members: membersCount, projects: projectsCount, hours: volunteerHours, events: eventsCount };
        } catch (error) {
            return { members: 0, projects: 0, hours: 0, events: 0 };
        }
    },
    ['home-impact-data'],
    { tags: ['homepage', 'events', 'projects', 'team'], revalidate: 3600 }
);

export const getHomeNews = unstable_cache(
    async (clubId: string) => {
        try {
            const latestUpdates = await prisma.announcement.findMany({
                where: { clubId, status: "PUBLISHED", type: "GENERAL" },
                orderBy: { createdAt: "desc" },
                take: 3,
                select: { id: true, title: true, description: true, createdAt: true }
            });
            return latestUpdates;
        } catch (error) {
            return [];
        }
    },
    ['home-news-data'],
    { tags: ['homepage', 'announcements'], revalidate: 3600 }
);
