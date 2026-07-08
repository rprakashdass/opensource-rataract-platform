import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export async function getPublicProjects() {
  const fetchProjects = unstable_cache(
    async () => {
      try {
          const club = await getCurrentClub();
          if (!club) return { error: "Club not initialized" };

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
                  media: { where: { isFeatured: true }, take: 1, select: { url: true } }
              }
          });

          const activeProjects = projects.filter(p => p.status === "ACTIVE" || p.status === "PLANNING" || p.status === "ON_HOLD");
          const completedProjects = projects.filter(p => p.status === "COMPLETED");

          return {
              activeProjects,
              completedProjects
          };
      } catch (error: any) {
          console.error("Failed to fetch public projects:", error);
          return { error: "Failed to load projects" };
      }
    },
    ['public-projects'],
    { tags: ['projects'], revalidate: 3600 }
  );
  
  return fetchProjects();
}
