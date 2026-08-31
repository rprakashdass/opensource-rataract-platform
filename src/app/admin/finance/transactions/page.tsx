import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import TransactionLedger from "./_components/TransactionLedger";
import { PageHeader } from "@/components/portal";
import { RecordDirectPaymentDialog } from "@/app/admin/finance/_components/RecordDirectPaymentDialog";

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

  // Members — so a direct payment from a member can auto-fill name + email.
  const members = await prisma.member.findMany({
    where: { clubId: club.id },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
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
      contributor: { select: { name: true, contact: true } },
      category: { select: { name: true } },
      project: { select: { title: true } },
      event: { select: { title: true } },
      account: { select: { name: true } }
    }
  });

  // `createdBy`/`approvedBy` are plain userId strings (no Prisma relation) —
  // resolve them to display names in one batched lookup for the whole ledger.
  const actorIds = Array.from(
    new Set(rawTransactions.flatMap(t => [t.createdBy, t.approvedBy]).filter((v): v is string => !!v))
  );
  const actors = actorIds.length
    ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } })
    : [];
  const actorsById = new Map(actors.map(a => [a.id, a]));

  // Serialize Decimals for Client Component
  const accountsSerialized = rawAccounts.map(a => ({
    ...a,
    currentBalance: Number(a.currentBalance)
  }));

  const transactionsSerialized = rawTransactions.map(t => ({
    ...t,
    amount: Number(t.amount),
    creator: t.createdBy ? actorsById.get(t.createdBy) || null : null,
    approver: t.approvedBy ? actorsById.get(t.approvedBy) || null : null,
  }));

  const financialYearsSerialized = financialYears.map(fy => ({
    ...fy,
    openingBalance: Number(fy.openingBalance),
    closingBalance: fy.closingBalance ? Number(fy.closingBalance) : null
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Ledger & Audit Trail"
        description="Verify all recorded incomes, expense claims, and inter-account transfers."
        backHref="/admin/finance"
        backLabel="Back to Finance"
        actions={<RecordDirectPaymentDialog accounts={accountsSerialized} categories={categories} members={members} />}
      />

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
