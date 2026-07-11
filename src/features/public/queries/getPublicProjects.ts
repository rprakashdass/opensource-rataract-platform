import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const getCachedPublicProjects = unstable_cache(
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
                description: true,
                category: true,
                status: true,
                events: { select: { id: true } },
                media: { where: { isFeatured: true }, take: 1, select: { id: true } }
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

        return { projects, settings };
    },
    ["public-projects-list"],
    { tags: ["projects", "website-settings"], revalidate: 3600 }
);

export async function getPublicProjects() {
  try {
      const base = await getCachedPublicProjects();
      if (!base) return { error: "Club not initialized" };

      const allMediaIds = base.projects
          .flatMap(p => p.media.map(m => m.id))
          .filter(Boolean) as string[];

      const mediaData = allMediaIds.length > 0
          ? await prisma.media.findMany({
              where: { id: { in: allMediaIds } },
              select: { id: true, url: true }
            })
          : [];

      const urlMap = new Map(mediaData.map(m => [m.id, m.url]));

      const projects = base.projects.map(p => ({
          ...p,
          media: p.media.map(m => ({ url: urlMap.get(m.id) || "" }))
      }));

      const activeProjects = projects.filter(p => p.status === "ACTIVE" || p.status === "PLANNING" || p.status === "ON_HOLD");
      const completedProjects = projects.filter(p => p.status === "COMPLETED");

      return {
          activeProjects,
          completedProjects,
          settings: base.settings,
      };
  } catch (error: any) {
      console.error("Failed to fetch public projects:", error);
      return { error: "Failed to load projects" };
  }
}
