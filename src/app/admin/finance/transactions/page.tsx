import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import TransactionLedger from "./_components/TransactionLedger";
import { Wallet } from "lucide-react";

export default async function AdminFinanceTransactionsPage() {
  const club = await getOrCreateDefaultClub();

  // Fetch Accounts
  const rawAccounts = await prisma.account.findMany({
    where: { clubId: club.id },
    orderBy: { type: "asc" }
  });

  // Fetch Financial Years
  const financialYears = await prisma.financialYear.findMany({
    where: { clubId: club.id },
    orderBy: { startDate: "desc" }
  });

  // Fetch Categories
  const categories = await prisma.financeCategory.findMany({
    orderBy: { name: "asc" }
  });

  // Fetch Projects
  const projects = await prisma.project.findMany({
    where: { clubId: club.id },
    orderBy: { startDate: "desc" }
  });

  // Fetch Events
  const events = await prisma.event.findMany({
    where: { clubId: club.id },
    orderBy: { startTime: "desc" }
  });

  // Fetch Transactions
  const rawTransactions = await prisma.transaction.findMany({
    where: { clubId: club.id },
    orderBy: { date: "desc" },
    include: {
      member: { select: { name: true, email: true } },
      user: { select: { name: true, email: true } },
      category: { select: { name: true } },
      project: { select: { title: true } },
      event: { select: { title: true } },
      account: { select: { name: true } }
    }
  });

  // Serialize Decimals for Client Component
  const accountsSerialized = rawAccounts.map(a => ({
    ...a,
    currentBalance: Number(a.currentBalance)
  }));

  const transactionsSerialized = rawTransactions.map(t => ({
    ...t,
    amount: Number(t.amount)
  }));

  const financialYearsSerialized = financialYears.map(fy => ({
    ...fy,
    openingBalance: Number(fy.openingBalance),
    closingBalance: fy.closingBalance ? Number(fy.closingBalance) : null
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Wallet className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ledger & Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Verify all recorded incomes, expense claims, and inter-account transfers.</p>
        </div>
      </div>

      <TransactionLedger
        initialTransactions={transactionsSerialized}
        financialYears={financialYearsSerialized}
        accounts={accountsSerialized}
        categories={categories}
        projects={projects}
        events={events}
      />
    </div>
  );
}
