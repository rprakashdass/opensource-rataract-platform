import { getBudgets } from "@/features/finance/queries/get-budgets";
import BudgetDashboard from "./_components/BudgetDashboard";
import { PageHeader } from "@/components/portal";

export default async function BudgetsPage() {
  const data = await getBudgets();

  // Ensure Decimal amounts are safely passed to Client Component
  const safeData = {
    ...data,
    budgets: data.budgets.map(b => ({
      ...b,
      allocatedAmount: Number(b.allocatedAmount)
    })),
    transactions: data.transactions.map(t => ({
      ...t,
      amount: Number(t.amount)
    })),
    activeFinancialYear: data.activeFinancialYear ? {
      ...data.activeFinancialYear,
      openingBalance: Number(data.activeFinancialYear.openingBalance),
      closingBalance: data.activeFinancialYear.closingBalance ? Number(data.activeFinancialYear.closingBalance) : null
    } : null
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <PageHeader
        title="Budgets"
        description="Allocate and track spending limits for projects and events."
        backHref="/admin/finance"
        backLabel="Back to Finance"
      />
      <BudgetDashboard data={safeData} />
    </div>
  );
}
