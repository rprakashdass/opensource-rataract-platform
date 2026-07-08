import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

export async function getReportSummary(financialYearId?: string) {
  const club = await getOrCreateDefaultClub();

  // Find active FY if not provided
  let fyId = financialYearId;
  let activeFinancialYear = null;

  if (!fyId) {
    activeFinancialYear = await prisma.financialYear.findFirst({
      where: { clubId: club.id, status: "ACTIVE" }
    });
    fyId = activeFinancialYear?.id;
  } else {
    activeFinancialYear = await prisma.financialYear.findUnique({
      where: { id: fyId }
    });
  }

  if (!fyId || !activeFinancialYear) {
    return { error: "No active financial year found" };
  }

  // Fetch all approved transactions for the given financial year
  const transactions = await prisma.transaction.findMany({
    where: {
      clubId: club.id,
      financialYearId: fyId,
      status: "APPROVED"
    },
    include: {
      category: { select: { name: true } },
      project: { select: { title: true } },
      event: { select: { title: true } }
    }
  });

  return {
    financialYear: activeFinancialYear,
    transactions
  };
}
