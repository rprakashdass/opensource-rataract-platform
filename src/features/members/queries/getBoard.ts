import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getBoardHistory(financialYearId?: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

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

  // Fetch all financial years for the filter dropdown
  const financialYears = await prisma.financialYear.findMany({
      where: whereClause,
      orderBy: { startDate: 'desc' }
  });

  if (financialYears.length === 0) {
      return { financialYears: [], currentYear: null, board: [] };
  }

  // Determine which year to show
  let currentYear = financialYears.find(fy => fy.status === "ACTIVE") || financialYears[0];
  if (financialYearId) {
      currentYear = financialYears.find(fy => fy.id === financialYearId) || currentYear;
  }

  const board = await prisma.boardMember.findMany({
      where: {
          ...whereClause,
          financialYearId: currentYear.id
      },
      include: {
          member: true
      },
      orderBy: { order: 'asc' }
  });

  return { financialYears, currentYear, board };
}
