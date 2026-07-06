import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LogTransactionForm from "./_components/LogTransactionForm";

export default async function LogTransactionPage() {
  const club = await getOrCreateDefaultClub();

  // Fetch Accounts
  const accounts = await prisma.account.findMany({
    where: { clubId: club.id },
    orderBy: { type: "asc" }
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

  // Serialize Decimals for Client Component
  const accountsSerialized = accounts.map(a => ({
    ...a,
    currentBalance: Number(a.currentBalance)
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Link href="/admin/finance" className="text-purple-600 hover:underline text-sm font-semibold flex items-center gap-1 mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Workspace
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Log New Transaction</h1>
        <p className="text-sm text-slate-500 max-w-2xl font-medium">
          Create an official ledger entry to adjust account balances, or link to active project/event campaign budgets.
        </p>
      </div>

      <LogTransactionForm 
        accounts={accountsSerialized}
        categories={categories}
        projects={projects}
        events={events}
      />
    </div>
  );
}
