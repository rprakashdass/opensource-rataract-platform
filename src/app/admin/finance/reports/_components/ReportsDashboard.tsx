"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, AlertTriangle, Activity, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, StatGrid, TableWrap } from "@/components/portal";

interface ReportsDashboardProps {
  data: {
    financialYear: any;
    transactions: any[];
  }
}

export default function ReportsDashboard({ data }: ReportsDashboardProps) {

  if (!data.financialYear) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Financial Year</h2>
        <p className="text-slate-500 max-w-md mx-auto">Please create an active financial year in the settings to generate reports.</p>
      </div>
    );
  }

  const { transactions } = data;

  // Process data for charts/cards
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
  const netPosition = totalIncome - totalExpense;

  // Monthly breakdown
  const monthlyData: Record<string, { income: number, expense: number }> = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    if (t.type === 'INCOME') monthlyData[month].income += Number(t.amount);
    if (t.type === 'EXPENSE') monthlyData[month].expense += Number(t.amount);
  });

  // Category breakdown (Expenses)
  const categoryExpenses: Record<string, number> = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    const cat = t.category?.name || "Uncategorized";
    categoryExpenses[cat] = (categoryExpenses[cat] || 0) + Number(t.amount);
  });
  
  // Sort categories by amount
  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);

  // Project vs Event Spending
  const projectSpending = transactions.filter(t => t.type === 'EXPENSE' && t.projectId).reduce((sum, t) => sum + Number(t.amount), 0);
  const eventSpending = transactions.filter(t => t.type === 'EXPENSE' && t.eventId).reduce((sum, t) => sum + Number(t.amount), 0);
  const otherSpending = totalExpense - projectSpending - eventSpending;

  // CSV Export Function
  const exportToCSV = () => {
    const headers = ["ID", "Date", "Title", "Type", "Category", "Amount", "Project", "Event"];
    const rows = transactions.map(t => [
        t.id,
        new Date(t.date).toLocaleDateString(),
        t.title.replace(/,/g, ""), // remove commas for CSV safety
        t.type,
        t.category?.name || "",
        Number(t.amount).toString(),
        t.project?.title || "",
        t.event?.title || ""
    ]);
    
    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_report_${data.financialYear.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Export */}
      <PageHeader
        title="Financial Reports"
        description={`Summary for ${data.financialYear.name}`}
        backHref="/admin/finance"
        backLabel="Back to Finance"
        actions={
          <Button onClick={exportToCSV} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      {/* Summary Cards */}
      <StatGrid className="lg:grid-cols-3">
        <StatCard label="Total Income" value={`₹${totalIncome.toLocaleString()}`} icon={TrendingUp} tone="positive" />
        <StatCard label="Total Expense" value={`₹${totalExpense.toLocaleString()}`} icon={TrendingDown} tone="critical" />
        <StatCard
          label="Net Position"
          value={`${netPosition >= 0 ? '+' : ''}₹${netPosition.toLocaleString()}`}
          icon={Activity}
          tone={netPosition >= 0 ? "brand" : "critical"}
        />
      </StatGrid>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-brand" />
              Expense by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedCategories.length > 0 ? (
              <div className="space-y-4">
                {sortedCategories.map(([category, amount]) => {
                  const percentage = (amount / totalExpense) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">{category}</span>
                        <span className="font-bold text-slate-900">₹{amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-brand h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No expenses recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand" />
              Spending by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6 mt-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Project Expenses</p>
                    <p className="text-xs text-slate-500 mt-0.5">Linked to active projects</p>
                  </div>
                  <p className="text-lg font-bold text-rose-600">₹{projectSpending.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Event Expenses</p>
                    <p className="text-xs text-slate-500 mt-0.5">Linked to official events</p>
                  </div>
                  <p className="text-lg font-bold text-rose-600">₹{eventSpending.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">General/Operational</p>
                    <p className="text-xs text-slate-500 mt-0.5">Unlinked or administrative</p>
                  </div>
                  <p className="text-lg font-bold text-rose-600">₹{otherSpending.toLocaleString()}</p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
            <CardDescription>Income vs Expense over the financial year</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(monthlyData).length > 0 ? (
              <TableWrap
                mobile={Object.entries(monthlyData).map(([month, data]) => (
                  <div key={month} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{month}</span>
                      <span className={`font-bold ${data.income - data.expense >= 0 ? 'text-brand' : 'text-slate-900'}`}>
                        Net ₹{(data.income - data.expense).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-xs">
                      <span className="text-emerald-600 font-semibold">Income ₹{data.income.toLocaleString()}</span>
                      <span className="text-rose-600 font-semibold">Expense ₹{data.expense.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              >
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs tracking-wider">
                    <tr>
                      <th className="p-4">Month</th>
                      <th className="p-4">Income</th>
                      <th className="p-4">Expense</th>
                      <th className="p-4">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(monthlyData).map(([month, data]) => (
                      <tr key={month} className="hover:bg-slate-50/50">
                        <td className="p-4 font-medium text-slate-900">{month}</td>
                        <td className="p-4 text-emerald-600 font-bold">₹{data.income.toLocaleString()}</td>
                        <td className="p-4 text-rose-600 font-bold">₹{data.expense.toLocaleString()}</td>
                        <td className={`p-4 font-bold ${data.income - data.expense >= 0 ? 'text-brand' : 'text-slate-900'}`}>
                          ₹{(data.income - data.expense).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No transactions recorded yet.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
