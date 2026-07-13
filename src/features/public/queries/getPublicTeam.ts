import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const getCachedPublicTeam = unstable_cache(
    async () => {
        const club = await getCurrentClub();
        if (!club) return null;

        const [board, members, portfolios, websiteSettings] = await Promise.all([
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
                            portfolioAssignments: { select: { portfolio: { select: { id: true, name: true } } } }
                        }
                    }
                },
                orderBy: { order: "asc" }
            }),
            prisma.member.findMany({
                where: {
                    clubId: club.id,
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    joinedAt: true,
                    profession: true,
                    boardMemberships: { select: { position: true, financialYear: { select: { status: true } }, leftAt: true } },
                    portfolioAssignments: { select: { portfolio: { select: { id: true, name: true } } } }
                },
                orderBy: { name: "asc" }
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
            members,
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

      const memberIds = [
          ...base.board.map(bm => bm.member.id),
          ...base.members.map(m => m.id)
      ];

      const avatars = memberIds.length > 0
          ? await prisma.member.findMany({
              where: { id: { in: memberIds } },
              select: { id: true, avatar: true }
            })
          : [];

      const avatarMap = new Map(avatars.map(a => [a.id, a.avatar]));

      const board = base.board.map(bm => ({
          ...bm,
          member: {
              ...bm.member,
              avatar: avatarMap.get(bm.member.id) || null
          }
      }));

      const members = base.members.map(m => ({
          ...m,
          avatar: avatarMap.get(m.id) || null
      }));

      return {
          board,
          members,
          portfolios: base.portfolios,
          settings: base.settings
      };
  } catch (error: any) {
      console.error("Failed to fetch public team:", error);
      return { error: "Failed to load team" };
  }
}
