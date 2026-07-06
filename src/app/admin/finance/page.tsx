import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import TreasurerWorkspace from "./_components/TreasurerWorkspace";
import { HandCoins } from "lucide-react";

export default async function AdminFinancePage() {
  const club = await getOrCreateDefaultClub();

  // 1. Seed default active Financial Year if none exists
  let fy = await prisma.financialYear.findFirst({
    where: { clubId: club.id, status: "ACTIVE" }
  });
  if (!fy) {
    fy = await prisma.financialYear.upsert({
      where: { name: "RY 2026-27" },
      update: { status: "ACTIVE" },
      create: {
        clubId: club.id,
        name: "RY 2026-27",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2027-06-30"),
        openingBalance: 40000.00,
        status: "ACTIVE"
      }
    });
  }

  // 2. Seed default Accounts if none exist
  const accountsCount = await prisma.account.count({ where: { clubId: club.id } });
  if (accountsCount === 0) {
    await prisma.account.createMany({
      data: [
        { clubId: club.id, name: "Cash Account", type: "CASH", currentBalance: 10000.00 },
        { clubId: club.id, name: "Rotaract Bank Account", type: "BANK", currentBalance: 25000.00 },
      ]
    });
  }

  // Fetch Accounts
  const rawAccounts = await prisma.account.findMany({
    where: { clubId: club.id },
    orderBy: { type: "asc" }
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

  // Fetch Budgets
  const rawBudgets = await prisma.budget.findMany({
    where: { clubId: club.id },
    include: {
      project: { select: { title: true } },
      event: { select: { title: true } }
    }
  });

  // Fetch Contributors
  const rawContributors = await prisma.contributor.findMany({
    where: { clubId: club.id }
  });

  // Fetch Transfers
  const rawTransfers = await prisma.transfer.findMany({
    where: { clubId: club.id },
    orderBy: { date: "desc" },
    include: {
      fromAccount: { select: { name: true } },
      toAccount: { select: { name: true } }
    }
  });

  // Fetch Audit Logs
  const auditLogs = await prisma.auditLog.findMany({
    where: { action: { startsWith: "create_transaction" } },
    orderBy: { createdAt: "desc" },
    take: 10
  });

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
        clubId={club.id}
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
