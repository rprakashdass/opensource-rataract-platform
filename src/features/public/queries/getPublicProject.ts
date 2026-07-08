import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

export async function getPublicProject(slug: string) {
  const fetchProject = unstable_cache(
    async (slug: string) => {
      try {
          const club = await getCurrentClub();
          if (!club) return { error: "Club not initialized" };

          const project = await prisma.project.findUnique({
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
                  category: true,
                  status: true,
                  visibility: true,
                  startDate: true,
                  endDate: true,
                  events: {
                      orderBy: { startDate: "asc" },
                      select: { id: true, title: true, slug: true, startDate: true, media: { where: { isFeatured: true }, take: 1, select: { url: true } } }
                  },
                  members: {
                      select: { role: true, member: { select: { name: true, avatar: true } } }
                  },
                  media: { where: { isFeatured: true }, select: { url: true, type: true } }
              }
          });

          if (!project || project.visibility !== "PUBLIC") {
               return { error: "Project not found or not public" };
          }

          return { project };
      } catch (error: any) {
          console.error("Failed to fetch public project:", error);
          return { error: "Failed to load project" };
      }
    },
    ['public-project', slug],
    { tags: ['projects'], revalidate: 3600 }
  );

  return fetchProject(slug);
}
