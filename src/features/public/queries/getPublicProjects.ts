import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const fetchPublicProjectsData = unstable_cache(
    async () => {
        const club = await getCurrentClub();
        if (!club) return null;

        const projects = await prisma.project.findMany({
            where: {
                clubId: club.id,
                publishStatus: "PUBLISHED",
                visibility: "PUBLIC"
            },
            orderBy: [
                { status: "asc" },
                { startDate: "desc" }
            ],
            select: {
                id: true,
                title: true,
                slug: true,
                // description is excluded to reduce egress on list views
                category: true,
                status: true,
                endDate: true,
                events: { select: { id: true } },
                media: { where: { isFeatured: true }, take: 1, select: { id: true, url: true } }
            }
        });

        const settings = await prisma.websiteSettings.findUnique({
            where: { clubId: club.id },
            select: {
                projectsSubtitle: true,
                projectsActiveTitle: true,
                projectsCompletedTitle: true,
            },
        });

        const formattedProjects = projects.map(p => ({
            ...p,
            media: p.media.map(m => ({ url: m.url || "" }))
        }));

        const activeProjects = formattedProjects.filter(p => p.status === "ACTIVE" || p.status === "PLANNING" || p.status === "ON_HOLD");
        const completedProjects = formattedProjects.filter(p => p.status === "COMPLETED");

        return {
            activeProjects,
            completedProjects,
            settings,
        };
    },
    ["public-projects-data"],
    { tags: ["projects", "settings"], revalidate: 3600 }
);

export async function getPublicProjects() {
  try {
      const data = await fetchPublicProjectsData();
      if (!data) return { error: "Club not initialized" };
      return data;
  } catch (error: any) {
      console.error("Failed to fetch public projects:", error);
      return { error: "Failed to load projects" };
  }
}
