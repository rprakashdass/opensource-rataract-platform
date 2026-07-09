import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";

// Not wrapped in unstable_cache: uploaded media are stored as base64 data URLs and can
// exceed the Next.js Data Cache's 2MB-per-entry limit, which throws an unhandled
// rejection and breaks the request entirely. Caching isn't worth that failure mode here.
export async function getPublicProject(slug: string) {
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
}
