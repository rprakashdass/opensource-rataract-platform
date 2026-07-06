"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter, Calendar, Folder, User, Check, Eye, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
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

  // Detailed Transaction View overlay state
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

  return (
    <div className="space-y-6">
      {/* Back button and filters layout */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/finance" className="text-purple-600 hover:underline text-sm font-semibold flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Advanced Filter Card (SaaS Style Row) */}
      <Card className="border-gray-100 shadow-sm bg-gray-50/50">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-7 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Financial Year</label>
            <select
              value={fyFilter}
              onChange={(e) => setFyFilter(e.target.value)}
              className="w-full border border-gray-300 p-1.5 rounded-lg text-xs bg-white"
            >
              <option value="">All Years</option>
              {financialYears.map(fy => (
                <option key={fy.id} value={fy.id}>{fy.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Account</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full border border-gray-300 p-1.5 rounded-lg text-xs bg-white"
            >
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 p-1.5 rounded-lg text-xs bg-white"
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 p-1.5 rounded-lg text-xs bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full border border-gray-300 p-1.5 rounded-lg text-xs bg-white"
            >
              <option value="">All Projects</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Event</label>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full border border-gray-300 p-1.5 rounded-lg text-xs bg-white"
            >
              <option value="">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 p-1.5 rounded-lg text-xs bg-white"
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
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            No transactions found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-100 font-semibold">
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
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap" suppressHydrationWarning>{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900">{tx.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{tx.category?.name || "Other"}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        tx.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{tx.account?.name || "-"}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-gray-900">₹{Number(tx.amount).toLocaleString()}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        tx.status === "APPROVED" || tx.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : tx.status === "REJECTED"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
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
          </div>
        )}
      </Card>

      {/* Transaction Details Modal Overlay */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">Transaction details</h2>
              <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="p-5 space-y-4 text-sm text-gray-600">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Title</span>
                <p className="font-semibold text-gray-900 mt-0.5">{selectedTx.title}</p>
              </div>

              {selectedTx.description && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Memo / Description</span>
                  <p className="text-gray-700 mt-0.5">{selectedTx.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Amount</span>
                  <p className="font-bold text-gray-900 mt-0.5">₹{Number(selectedTx.amount).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Type</span>
                  <p className="mt-0.5">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      selectedTx.type === "INCOME" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {selectedTx.type}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Category</span>
                  <p className="font-medium text-gray-900 mt-0.5">{selectedTx.category?.name || "Other"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Linked Account</span>
                  <p className="font-medium text-gray-900 mt-0.5">{selectedTx.account?.name || "-"}</p>
                </div>
              </div>

              {selectedTx.receiptUrl && (
                <div className="pt-2 border-t border-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Receipt URL</span>
                  <p className="mt-0.5">
                    <a href={selectedTx.receiptUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline font-semibold flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" /> View Uploaded Receipt
                    </a>
                  </p>
                </div>
              )}

              {/* Moderate workflow triggers inside modal */}
              {(selectedTx.status === "PENDING_APPROVAL" || selectedTx.status === "DRAFT") && (
                <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
                  <Button onClick={() => handleStatusUpdate(selectedTx.id, "REJECTED")} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
                    Reject Claim
                  </Button>
                  <Button onClick={() => handleStatusUpdate(selectedTx.id, "APPROVED")} className="bg-green-600 hover:bg-green-700">
                    Approve & Disburse
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
