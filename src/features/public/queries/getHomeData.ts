import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export const getHomeBaseData = unstable_cache(
    async () => {
        try {
            const club = await getCurrentClub();
            if (!club) return { error: "Club not initialized" };
            
            const [websiteSettings, websiteMetrics] = await Promise.all([
                prisma.websiteSettings.findUnique({
                    where: { clubId: club.id }
                }),
                prisma.websiteMetric.findMany({
                    where: { clubId: club.id, enabled: true },
                    orderBy: { displayOrder: "asc" }
                })
            ]);
            
            return {
                club: {
                    id: club.id,
                    name: club.name,
                    missionStatement: club.missionStatement,
                    visionStatement: club.visionStatement,
                    presidentMessage: club.presidentMessage,
                    tenureYear: club.tenureYear,
                    aboutTitle: club.aboutTitle,
                    aboutSubtitle: club.aboutSubtitle,
                },
                settings: websiteSettings as any,
                metrics: websiteMetrics.map((m: any) => ({
                    id: m.id,
                    number: m.number,
                    label: m.label,
                    description: m.description,
                }))
            };
        } catch (error) {
            return { error: "Failed to load base data" };
        }
    },
    ['home-base-data'],
    { tags: ['homepage', 'club', 'website-settings', 'events', 'projects', 'gallery', 'team', 'announcements'], revalidate: 3600 }
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
    { tags: ['homepage', 'events', 'projects', 'team', 'gallery', 'announcements'], revalidate: 3600 }
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
    { tags: ['homepage', 'announcements', 'events', 'projects', 'gallery', 'team'], revalidate: 3600 }
);
