import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const fetchPublicAnnouncementsData = unstable_cache(
  async () => {
    const club = await getCurrentClub();
    if (!club) return null;

    const announcements = await prisma.announcement.findMany({
      where: {
        clubId: club.id,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        type: {
          notIn: ["BOARD_MEETING", "CLUB_MEETING"]
        }
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        // agendaContent and minutesContent are excluded to reduce egress
        description: true,
        startDate: true,
        location: true,
        agendaUrl: true,
        attachments: true,
      },
    });

    return announcements;
  },
  ["public-announcements-data"],
  { tags: ["announcements"], revalidate: 3600 }
);

export async function getPublicAnnouncements() {
  try {
    const data = await fetchPublicAnnouncementsData();
    if (!data) return [];
    return data;
  } catch (error) {
    console.error("Failed to fetch public announcements:", error);
    return [];
  }
}
