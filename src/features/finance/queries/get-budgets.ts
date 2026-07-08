import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

export async function getBudgets() {
  const club = await getOrCreateDefaultClub();

  // Fetch the active financial year
  const activeFinancialYear = await prisma.financialYear.findFirst({
    where: { clubId: club.id, status: "ACTIVE" }
  });

  if (!activeFinancialYear) {
    return {
      activeFinancialYear: null,
      budgets: [],
      transactions: [],
      projects: [],
      events: []
    };
  }

  // Fetch budgets for the active financial year
  const budgets = await prisma.budget.findMany({
    where: { 
      clubId: club.id,
      financialYearId: activeFinancialYear.id
    },
    include: {
      project: { select: { title: true } },
      event: { select: { title: true } },
    }
  });

  // Fetch approved transactions in this financial year to calculate spent amounts
  const transactions = await prisma.transaction.findMany({
    where: {
      clubId: club.id,
      financialYearId: activeFinancialYear.id,
      status: "APPROVED"
    },
    select: {
      id: true,
      amount: true,
      type: true,
      projectId: true,
      eventId: true,
    }
  });
  
  // Fetch active projects and events for creating new budgets
  const projects = await prisma.project.findMany({
    where: { clubId: club.id, status: { in: ["ACTIVE", "PLANNING"] } },
    select: { id: true, title: true }
  });

  const events = await prisma.event.findMany({
    where: { clubId: club.id, status: { in: ["UPCOMING", "ONGOING", "DRAFT"] } },
    select: { id: true, title: true }
  });

  return {
    activeFinancialYear,
    budgets,
    transactions,
    projects,
    events
  };
}
