import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import TreasurerWorkspace from "./_components/TreasurerWorkspace";
import { getSession, canViewFinance } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/portal";
import { getOrCreateActiveFinancialYear } from "@/lib/finance/financialYear";

export default async function AdminFinancePage() {
  const session = await getSession();
  
  if (!session || !session.roles) {
    redirect("/login");
  }

  const canView = canViewFinance(session);
  
  if (!canView) {
    return (
      <div className="p-20 text-center text-slate-500">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p>You do not have permission to view the Finance module.</p>
      </div>
    );
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: { member: true }
  });

  const club = await getOrCreateDefaultClub();
  const activeClubId = club.id;

  // 1. Seed default active Financial Year if none exists
  const fy = await getOrCreateActiveFinancialYear(activeClubId);

  // Accounts are no longer auto-seeded here — create them via the real
  // Accounts CRUD (POST /api/admin/finance/accounts). TreasurerWorkspace
  // renders an empty state if a club genuinely has zero accounts yet.

  // Fetch Accounts, Transactions, Budgets, Contributors, Transfers, Audit Logs concurrently —
  // none of these depend on each other's results.
  const [rawAccounts, rawTransactions, rawBudgets, rawContributors, rawTransfers, auditLogs] = await Promise.all([
    prisma.account.findMany({
      where: { clubId: activeClubId },
      orderBy: { type: "asc" }
    }),
    prisma.transaction.findMany({
      where: { clubId: activeClubId },
      orderBy: { date: "desc" },
      include: {
        member: { select: { name: true, email: true } },
        user: { select: { name: true, email: true } },
        category: { select: { name: true } },
        project: { select: { title: true } },
        event: { select: { title: true } },
        account: { select: { name: true } }
      }
    }),
    prisma.budget.findMany({
      where: { clubId: activeClubId },
      include: {
        project: { select: { title: true } },
        event: { select: { title: true } }
      }
    }),
    prisma.contributor.findMany({
      where: { clubId: activeClubId }
    }),
    prisma.transfer.findMany({
      where: { clubId: activeClubId },
      orderBy: { date: "desc" },
      include: {
        fromAccount: { select: { name: true } },
        toAccount: { select: { name: true } }
      }
    }),
    prisma.auditLog.findMany({
      where: { action: { startsWith: "create_transaction" } },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
  ]);

  // 3. Serialize Decimals to Numbers for Client Components serialization
  const fySerialized = {
    ...fy,
    openingBalance: Number(fy.openingBalance),
    closingBalance: fy.closingBalance ? Number(fy.closingBalance) : null
  };

  const accountsSerialized = rawAccounts.map(a => ({
    ...a,
    currentBalance: Number(a.currentBalance)
  }));

  const transactionsSerialized = rawTransactions.map(t => ({
    ...t,
    amount: Number(t.amount)
  }));

  const budgetsSerialized = rawBudgets.map(b => ({
    ...b,
    allocatedAmount: Number(b.allocatedAmount)
  }));

  const contributorsSerialized = rawContributors.map(c => ({
    ...c,
    totalContributed: Number(c.totalContributed)
  }));

  const transfersSerialized = rawTransfers.map(tr => ({
    ...tr,
    amount: Number(tr.amount)
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Finance & Treasury"
        description="Manage cash flows, approve expense claims, and check operational budgets."
      />

      <TreasurerWorkspace
        clubId={activeClubId}
        financialYear={fySerialized}
        accounts={accountsSerialized}
        transactions={transactionsSerialized}
        budgets={budgetsSerialized}
        contributors={contributorsSerialized}
        transfers={transfersSerialized}
        auditLogs={auditLogs}
      />
    </div>
  );
}
