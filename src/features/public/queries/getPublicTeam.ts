import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const getCachedPublicTeam = unstable_cache(
    async () => {
        const club = await getCurrentClub();
        if (!club) return null;

        // Public /team only ever shows the board — general members aren't
        // listed publicly, so they're not fetched here.
        const [board, portfolios, websiteSettings] = await Promise.all([
            prisma.boardMember.findMany({
                where: { clubId: club.id },
                select: {
                    id: true,
                    position: true,
                    order: true,
                    member: {
                        select: {
                            id: true,
                            name: true,
                            profession: true,
                            joinedAt: true,
                            websiteQuote: true,
                            linkedin: true,
                            instagram: true,
                            portfolioAssignments: { select: { portfolio: { select: { id: true, name: true } } } }
                        }
                    }
                },
                orderBy: { order: "asc" }
            }),
            prisma.portfolio.findMany({
                where: { clubId: club.id, isActive: true },
                orderBy: { displayOrder: "asc" },
                select: { id: true, name: true }
            }),
            prisma.websiteSettings.findUnique({
                where: { clubId: club.id }
            })
        ]);

        return {
            board,
            portfolios,
            settings: websiteSettings
        };
    },
    ["public-team-list"],
    { tags: ["team"], revalidate: 3600 }
);

export async function getPublicTeam() {
  try {
      const base = await getCachedPublicTeam();
      if (!base) return { error: "Club not initialized" };

      const memberIds = base.board.map(bm => bm.member.id);

      const avatars = memberIds.length > 0
          ? await prisma.member.findMany({
              where: { id: { in: memberIds } },
              select: { id: true, avatar: true }
            })
          : [];

      const avatarMap = new Map(avatars.map(a => [a.id, a.avatar]));

      const groupedBoardMap = new Map();
      const board = [];

      for (const bm of base.board) {
          if (groupedBoardMap.has(bm.member.id)) {
              const existing = groupedBoardMap.get(bm.member.id);
              existing.position = existing.position + " & " + bm.position;
          } else {
              const newBm = {
                  ...bm,
                  member: {
                      ...bm.member,
                      avatar: avatarMap.get(bm.member.id) || null
                  }
              };
              groupedBoardMap.set(bm.member.id, newBm);
              board.push(newBm);
          }
      }

      return {
          board,
          portfolios: base.portfolios,
          settings: base.settings
      };
  } catch (error: any) {
      console.error("Failed to fetch public team:", error);
      return { error: "Failed to load team" };
  }
}
