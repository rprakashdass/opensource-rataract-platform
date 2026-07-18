import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";

// Not wrapped in unstable_cache: uploaded media are stored as base64 data URLs and can
// exceed the Next.js Data Cache's 2MB-per-entry limit, which throws an unhandled
// rejection and breaks the request entirely. Caching isn't worth that failure mode here.
export async function getPublicEvent(slug: string) {
  try {
      const club = await getCurrentClub();
      if (!club) return { error: "Club not initialized" };

      const event = await prisma.event.findUnique({
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
              startDate: true,
              startTime: true,
              endTime: true,
              location: true,
              meetingLink: true,
              type: true,
              status: true,
              capacity: true,
              registeredCount: true,
              registrationEnabled: true,
              registrationRequired: true,
              bannerMediaId: true,
              posterMediaId: true,
              volunteerHours: true,
              fundsRaised: true,
              impactMetrics: true,
              project: { select: { id: true, title: true, slug: true } },
              members: {
                  select: { role: true, member: { select: { name: true, avatar: true } } }
              },
              media: { select: { id: true, url: true, type: true, isFeatured: true } }
          }
      });

      if (!event || event.status === "DRAFT") {
           return { error: "Event not found" };
      }

      return { event };
  } catch (error: any) {
      console.error("Failed to fetch public event:", error);
      return { error: "Failed to load event" };
  }
}
