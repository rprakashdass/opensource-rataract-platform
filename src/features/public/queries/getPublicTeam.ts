import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";


export async function getPublicTeam() {
  try {
      const club = await getCurrentClub();
      if (!club) return { error: "Club not initialized" };

          const board = await prisma.boardMember.findMany({
              where: { clubId: club.id },
              select: {
                  id: true,
                  position: true,
                  order: true,
                  member: { select: { id: true, name: true, avatar: true } }
              },
              orderBy: { order: "asc" }
          });

          const members = await prisma.member.findMany({
              where: { 
                  clubId: club.id, 
                  isActive: true
              },
              select: {
                  id: true,
                  name: true,
                  avatar: true,
                  joinedAt: true,
                  profession: true,
                  boardMemberships: { select: { position: true, financialYear: { select: { status: true } }, leftAt: true } }
              },
              orderBy: { name: "asc" }
          });

      return {
          board,
          members
      };
  } catch (error: any) {
      console.error("Failed to fetch public team:", error);
      return { error: "Failed to load team" };
  }
}
