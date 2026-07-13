import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import TreasurerWorkspace from "./_components/TreasurerWorkspace";
import { getSession, canViewFinance } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { HandCoins } from "lucide-react";

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
  const activeClubId = adminUser?.member?.clubId || club.id;

  // 1. Seed default active Financial Year if none exists
  let fy = await prisma.financialYear.findFirst({
    where: { clubId: activeClubId, status: "ACTIVE" }
  });
  if (!fy) {
    fy = await prisma.financialYear.upsert({
      where: { name: "RY 2026-27" },
      update: { status: "ACTIVE" },
      create: {
        clubId: activeClubId,
        name: "RY 2026-27",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2027-06-30"),
        openingBalance: 0,
        status: "ACTIVE"
      }
    });
  }

  // 2. Seed default Accounts if none exist
  const accountsCount = await prisma.account.count({ where: { clubId: activeClubId } });
  if (accountsCount === 0) {
    await prisma.account.createMany({
      data: [
        { clubId: activeClubId, name: "Cash Account", type: "CASH", currentBalance: 0 },
        { clubId: activeClubId, name: "Rotaract Bank Account", type: "BANK", currentBalance: 0 },
      ]
    });
  }

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
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <HandCoins className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance & Treasury</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage cash flows, approve expense claims, and check operational budgets.</p>
        </div>
      </div>

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
