import { getReportSummary } from "@/features/finance/queries/get-report-summary";
import ReportsDashboard from "./_components/ReportsDashboard";

export default async function ReportsPage() {
  const data = await getReportSummary();

  if ('error' in data || !data.financialYear) {
      return (
          <div className="max-w-6xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
             <ReportsDashboard data={{ financialYear: null, transactions: [] }} />
          </div>
      )
  }

  // Ensure Decimal amounts are safely passed to Client Component
  const safeData = {
    financialYear: {
      ...data.financialYear,
      openingBalance: Number(data.financialYear.openingBalance),
      closingBalance: data.financialYear.closingBalance ? Number(data.financialYear.closingBalance) : null
    },
    transactions: data.transactions.map(t => ({
      ...t,
      amount: Number(t.amount)
    })),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      <ReportsDashboard data={safeData} />
    </div>
  );
}
