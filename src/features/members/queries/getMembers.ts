import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getMembers(filterStatus?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  // Assume user is associated with the first club if no member record
  const memberData = await prisma.member.findUnique({
      where: { id: session.member?.id || "" }
  });
  
  const isSuperAdmin = session.roles?.includes("SUPER_ADMIN");
  
  let clubId = memberData?.clubId;
  if (!clubId && !isSuperAdmin) {
      const defaultClub = await prisma.club.findFirst();
      clubId = defaultClub?.id;
  }
  
  if (!clubId && !isSuperAdmin) return { error: "Club association not found" };

  const whereClause: any = {};
  if (clubId) {
      whereClause.clubId = clubId;
  }
  if (filterStatus && filterStatus !== 'ALL') {
      whereClause.membershipStatus = filterStatus;
  }

  const members = await prisma.member.findMany({
      where: whereClause,
      include: {
          user: { select: { roles: true } },
          boardMemberships: {
              where: { leftAt: null }, // Current active board positions
              include: { financialYear: true, role: true }
          },
          portfolioAssignments: {
              include: { portfolio: true }
          }
      },
      orderBy: { name: 'asc' }
  });

  return { members };
}

export async function getMember(id: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };
  
    const member = await prisma.member.findUnique({
        where: { id },
        include: {
            user: { select: { roles: true } },
            boardMemberships: {
                include: { financialYear: true, role: true },
                orderBy: { joinedAt: 'desc' }
            },
            portfolioAssignments: {
                include: { portfolio: true },
                orderBy: { tenureYear: 'desc' }
            },
            attendance: {
                include: { event: true },
                orderBy: { checkedInAt: 'desc' }
            },
            registrations: {
                include: { event: true }
            },
            projectRoles: {
                include: { project: true },
                orderBy: { joinedAt: 'desc' }
            },
            eventRoles: {
                include: { event: true },
                orderBy: { joinedAt: 'desc' }
            }
        }
    });
  
    return { member };
}
