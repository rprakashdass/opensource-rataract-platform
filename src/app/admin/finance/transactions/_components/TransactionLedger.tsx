"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableWrap } from "@/components/portal";
import { toast } from "sonner";
import { updateTransactionStatus } from "@/features/finance/actions/updateTransactionStatus";

interface TransactionLedgerProps {
  initialTransactions: any[];
  financialYears: any[];
  accounts: any[];
  categories: any[];
  projects: any[];
  events: any[];
}

const filterSelectClass = "w-full border border-slate-300 p-1.5 rounded-lg text-xs bg-white";

export default function TransactionLedger({
  initialTransactions,
  financialYears,
  accounts,
  categories,
  projects,
  events
}: TransactionLedgerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Filters
  const [fyFilter, setFyFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Detailed Transaction View dialog state
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Client-side filtering logic
  const filtered = initialTransactions.filter(t => {
    const matchesSearch = search
      ? t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        (t.member?.name && t.member.name.toLowerCase().includes(search.toLowerCase()))
      : true;

    const matchesFy = fyFilter ? t.financialYearId === fyFilter : true;
    const matchesAccount = accountFilter ? t.accountId === accountFilter : true;
    const matchesType = typeFilter ? t.type === typeFilter : true;
    const matchesCategory = categoryFilter ? t.categoryId === categoryFilter : true;
    const matchesProject = projectFilter ? t.projectId === projectFilter : true;
    const matchesEvent = eventFilter ? t.eventId === eventFilter : true;
    const matchesStatus = statusFilter ? t.status === statusFilter : true;

    return matchesSearch && matchesFy && matchesAccount && matchesType && matchesCategory && matchesProject && matchesEvent && matchesStatus;
  });

  async function handleStatusUpdate(id: string, status: "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      const res = await updateTransactionStatus(id, status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Transaction marked as ${status.toLowerCase()}`);
        setSelectedTx(null);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to moderate transaction");
    } finally {
      setLoading(false);
    }
  }

  const statusBadgeClass = (status: string) =>
    status === "APPROVED" || status === "PAID"
      ? "bg-emerald-100 text-emerald-700"
      : status === "REJECTED"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  const mobileCards = filtered.map(tx => (
    <div key={tx.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="font-semibold text-slate-900">{tx.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{tx.category?.name || "Other"} • <span suppressHydrationWarning>{new Date(tx.date).toLocaleDateString()}</span></div>
        </div>
        <div className="text-right">
          <div className="font-bold text-slate-900">₹{Number(tx.amount).toLocaleString()}</div>
          <span className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
            tx.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}>
            {tx.type}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <div>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${statusBadgeClass(tx.status)}`}>
            {tx.status}
          </span>
        </div>
        <Button onClick={() => setSelectedTx(tx)} variant="outline" size="sm" className="h-8 gap-1">
          <Eye className="w-3.5 h-3.5" /> Details
        </Button>
      </div>
    </div>
  ));

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Advanced Filter Card */}
      <Card className="border-slate-100 shadow-sm bg-slate-50/50">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Financial Year</label>
            <select
              value={fyFilter}
              onChange={(e) => setFyFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All Years</option>
              {financialYears.map(fy => (
                <option key={fy.id} value={fy.id}>{fy.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All Projects</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Event</label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List / Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white text-center py-12 text-sm text-slate-500">
          No transactions found matching the selected filters.
        </div>
      ) : (
        <TableWrap mobile={mobileCards}>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 whitespace-nowrap" suppressHydrationWarning>{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{tx.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{tx.category?.name || "Other"}</div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      tx.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">{tx.account?.name || "-"}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">₹{Number(tx.amount).toLocaleString()}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${statusBadgeClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-right">
                    <Button onClick={() => setSelectedTx(tx)} variant="outline" size="sm" className="h-8 gap-1">
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(o) => { if (!o) setSelectedTx(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Title</span>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedTx.title}</p>
              </div>

              {selectedTx.description && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Memo / Description</span>
                  <p className="text-slate-700 mt-0.5">{selectedTx.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Amount</span>
                  <p className="font-bold text-slate-900 mt-0.5">₹{Number(selectedTx.amount).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Type</span>
                  <p className="mt-0.5">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      selectedTx.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {selectedTx.type}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Category</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedTx.category?.name || "Other"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Linked Account</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedTx.account?.name || "-"}</p>
                </div>
              </div>

              {selectedTx.receiptUrl && (
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Receipt URL</span>
                  <p className="mt-0.5">
                    <button
                      onClick={() => {
                        const url = selectedTx.receiptUrl;
                        if (url.startsWith("data:")) {
                          const win = window.open();
                          if (win) {
                            const isPdf = url.includes("pdf") || url.startsWith("data:application/pdf");
                            if (isPdf) {
                              win.document.write(`<iframe src="${url}" style="width: 100%; height: 100%; border: 0;" title="Receipt PDF"></iframe>`);
                            } else {
                              win.document.write(`<img src="${url}" style="max-width: 100%; max-height: 100vh; display: block; margin: auto;" />`);
                            }
                            win.document.title = "View Receipt";
                          }
                        } else {
                          window.open(url, "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="text-brand hover:underline font-semibold flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> View Uploaded Receipt
                    </button>
                  </p>
                </div>
              )}

              {/* Moderate workflow triggers inside dialog */}
              {(selectedTx.status === "PENDING_APPROVAL" || selectedTx.status === "DRAFT") && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 justify-end">
                  <Button onClick={() => handleStatusUpdate(selectedTx.id, "REJECTED")} disabled={loading} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                    Reject Claim
                  </Button>
                  <Button onClick={() => handleStatusUpdate(selectedTx.id, "APPROVED")} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                    Approve & Disburse
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
