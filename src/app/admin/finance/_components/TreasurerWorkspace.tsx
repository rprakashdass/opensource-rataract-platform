"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowRightLeft, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { updateTransactionStatus } from "@/features/finance/actions/updateTransactionStatus";
import { createTransfer } from "@/features/finance/actions/createTransfer";

interface TreasurerWorkspaceProps {
  clubId: string;
  financialYear: any;
  accounts: any[];
  transactions: any[];
  budgets: any[];
  contributors: any[];
  transfers: any[];
  auditLogs: any[];
}

export default function TreasurerWorkspace({
  clubId,
  financialYear,
  accounts,
  transactions,
  budgets,
  contributors,
  transfers,
  auditLogs
}: TreasurerWorkspaceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Transfer Funds Dialog Form State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: ""
  });

  // Calculate Overview Card metrics
  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.currentBalance), 0);
  const cashBalance = accounts.find(a => a.type === "CASH")?.currentBalance || 0;
  const bankBalance = accounts.find(a => a.type === "BANK")?.currentBalance || 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === "APPROVED";
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === "INCOME")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netChange = monthlyIncome - monthlyExpense;

  const pendingApprovals = transactions.filter(t => t.status === "PENDING_APPROVAL" || t.status === "DRAFT");

  async function handleStatusUpdate(id: string, status: "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      const res = await updateTransactionStatus(id, status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Transaction ${status.toLowerCase()}`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update transaction status");
    } finally {
      setLoading(false);
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) {
      toast.error("Please fill in all transfer fields");
      return;
    }
    setLoading(true);
    try {
      const res = await createTransfer({
        fromAccountId: transferForm.fromAccountId,
        toAccountId: transferForm.toAccountId,
        amount: parseFloat(transferForm.amount)
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Funds transferred successfully");
        setShowTransferModal(false);
        setTransferForm({ fromAccountId: "", toAccountId: "", amount: "" });
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to execute transfer");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    // Generate CSV Content
    let csv = "Date,Title,Description,Type,Amount,Category,Account,Status\n";
    transactions.forEach(t => {
      csv += `"${new Date(t.date).toLocaleDateString()}","${t.title}","${t.description || ""}","${t.type}",${t.amount},"${t.category?.name || "Other"}","${t.account?.name || ""}","${t.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Finance_Report_${financialYear.name}.csv`);
    a.click();
    toast.success("CSV export downloaded successfully!");
  }

  return (
    <div className="space-y-6">
      {/* Action Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {financialYear.name}
            </span>
            <span className="text-slate-400 text-xs">Financial Year</span>
          </div>
          <h2 className="text-lg font-bold mt-1">Treasurer Workstation</h2>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button
            onClick={() => setShowTransferModal(true)}
            variant="outline"
            className="border-slate-600 text-slate-100 bg-slate-800 hover:bg-slate-700 hover:text-white gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer Funds
          </Button>
          <Button
            onClick={exportCSV}
            variant="outline"
            className="border-slate-600 text-slate-100 bg-slate-800 hover:bg-slate-700 hover:text-white gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Link href="/admin/finance/requests">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-100 bg-slate-800 hover:bg-slate-700 hover:text-white gap-1.5"
            >
              <Receipt className="w-4 h-4" /> Payment Requests
            </Button>
          </Link> 
          <Link href="/admin/finance/transactions/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
              <Plus className="w-4 h-4" /> Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="bg-slate-950 text-white border-slate-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 font-semibold text-xs uppercase">Current Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black tracking-tight">₹{Number(totalBalance).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500 font-semibold text-xs uppercase">Cash Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">₹{Number(cashBalance).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500 font-semibold text-xs uppercase">Bank Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">₹{Number(bankBalance).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={pendingApprovals.length > 0 ? "border-amber-300 bg-amber-50" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500 font-semibold text-xs uppercase">Pending Approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-black tracking-tight ${pendingApprovals.length > 0 ? "text-amber-700" : "text-gray-900"}`}>
              {pendingApprovals.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">transactions awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Net Change & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Summary (This Month)</CardTitle>
            <CardDescription>Monthly inflows versus outflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Income</p>
                <p className="text-2xl font-extrabold text-emerald-950 mt-1">₹{Number(monthlyIncome).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-xs font-semibold text-rose-700 flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Expense</p>
                <p className="text-2xl font-extrabold text-rose-955 mt-1">₹{Number(monthlyExpense).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs font-semibold text-purple-700">Net Change</p>
                <p className="text-2xl font-extrabold text-purple-950 mt-1">
                  {netChange >= 0 ? "+" : ""}₹{Number(netChange).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Simple high fidelity chart representation */}
            <div className="h-28 flex items-end gap-3 px-4 pt-4 border-t border-gray-50">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-emerald-100 rounded-t-lg transition-all" style={{ height: monthlyIncome > 0 ? "80px" : "10px" }}></div>
                <span className="text-[10px] font-semibold text-gray-500">Income Inflow</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-rose-100 rounded-t-lg transition-all" style={{ height: monthlyExpense > 0 ? "50px" : "10px" }}></div>
                <span className="text-[10px] font-semibold text-gray-500">Expense Outflow</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget overview progress */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilizations</CardTitle>
            <CardDescription>Event & Project budget progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500">No active budgets allocated.</div>
            ) : (
              budgets.map(b => {
                const total = Number(b.allocatedAmount);
                // Spent calculations
                const spent = transactions
                  .filter(t => t.status === "APPROVED" && (t.projectId === b.projectId || t.eventId === b.eventId) && t.type === "EXPENSE")
                  .reduce((acc, curr) => acc + Number(curr.amount), 0);
                const percent = Math.min(Math.round((spent / total) * 100) || 0, 100);

                return (
                  <div key={b.id} className="space-y-1.5 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{b.project?.title || b.event?.title || "Yearly Budget"}</span>
                      <span>₹{spent.toLocaleString()} / ₹{total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full transition-all" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-5 h-5" /> Pending Claims & Approvals
            </CardTitle>
            <CardDescription>Review member expense claims and verify receipt attachments.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {pendingApprovals.map(tx => (
              <div key={tx.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{tx.member?.name || tx.user?.name || "Club Member"}</span>
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">{tx.category?.name || "Other"}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tx.title} — {tx.description || "No description"}</p>
                  {tx.receiptUrl && (
                    <a href={tx.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline mt-1.5 inline-block font-semibold">
                      View Receipt Attached
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <span className="text-lg font-black text-rose-700 whitespace-nowrap">₹{Number(tx.amount).toLocaleString()}</span>
                  <div className="flex gap-2">
                    <Button onClick={() => handleStatusUpdate(tx.id, "REJECTED")} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 text-xs">
                      Reject
                    </Button>
                    <Button onClick={() => handleStatusUpdate(tx.id, "APPROVED")} className="bg-green-600 hover:bg-green-700 h-8 text-xs">
                      Approve Claim
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Trail</CardTitle>
          <CardDescription>Club treasury updates log.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No recent activity logs recorded.</p>
            ) : (
              auditLogs.map(log => (
                <li key={log.id} className="text-xs text-gray-600 flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span>{log.action.replace(/_/g, ' ')} on {log.entity} #{log.entityId.substring(0, 8)}</span>
                  <span className="text-gray-400" suppressHydrationWarning>{new Date(log.createdAt).toLocaleString()}</span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Transfer Funds Modal (SaaS Style Overlay) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Transfer Funds</h2>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleTransfer} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">From Account</label>
                <select
                  required
                  value={transferForm.fromAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-xl text-sm"
                >
                  <option value="">Select Account</option>
                  {accounts.filter(a => a.type !== "UPI").map(a => (
                    <option key={a.id} value={a.id}>{a.name} (₹{Number(a.currentBalance).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">To Account</label>
                <select
                  required
                  value={transferForm.toAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-xl text-sm"
                >
                  <option value="">Select Account</option>
                  {accounts.filter(a => a.type !== "UPI").map(a => (
                    <option key={a.id} value={a.id}>{a.name} (₹{Number(a.currentBalance).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setShowTransferModal(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  Execute Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
