"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle, XCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import FilterBar from "@/components/admin/FilterBar";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { TransactionCreateDialog } from "./TransactionCreateDialog";
import TransactionEditDialog from "./TransactionEditDialog";

const statusOptions = [
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "DRAFT", label: "Draft" },
  { value: "VOIDED", label: "Voided" },
];

export default function TreasuryTab() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;
  const status = searchParams.get("status") || "";

  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  const { data: transactions = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['admin-finance-transactions'],
    queryFn: async () => {
      const res = await fetch("/api/admin/finance/transactions");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    }
  });

  useLoadingToast(loading, "Loading treasury data...");

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: "APPROVED" | "REJECTED" }) => {
      const res = await fetch(`/api/admin/finance/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return { data, status };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-finance-transactions'] });
      toast.success(`Transaction ${result.status.toLowerCase()}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    }
  });

  const handleStatusUpdate = (id: string, status: "APPROVED" | "REJECTED") => {
    const toastId = toast.loading(`Marking as ${status.toLowerCase()}...`);
    statusMutation.mutate({ id, status }, {
      onSettled: () => toast.dismiss(toastId)
    });
  };

  const approvedIncome = transactions
    .filter(t => t.type === "INCOME" && (t.status === "APPROVED" || t.status === "COMPLETED"))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const approvedExpenses = transactions
    .filter(t => t.type === "EXPENSE" && (t.status === "APPROVED" || t.status === "COMPLETED"))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = approvedIncome - approvedExpenses;

  const pendingTransactions = transactions.filter((t: any) => t.status === "PENDING_APPROVAL" || t.status === "DRAFT");

  const filteredTransactions = transactions.filter((t: any) => {
    const matchesSearch = search ? (t.description?.toLowerCase().includes(search.toLowerCase()) || t.user?.name?.toLowerCase().includes(search.toLowerCase()) || t.member?.name?.toLowerCase().includes(search.toLowerCase())) : true;
    const matchesStatus = status ? t.status === status : true;
    let matchesMonth = true;
    if (month) {
      const d = new Date(t.createdAt);
      matchesMonth = d.getMonth() + 1 === month;
    }
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const pastTransactions = filteredTransactions.filter((t: any) => t.status !== "PENDING_APPROVAL" && t.status !== "DRAFT");

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-finance-transactions'] });
  };

  if (loading) return <div className="text-sm text-gray-500 py-10">Loading treasury data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-end mb-4">
        <TransactionCreateDialog />
      </div>
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Total Income</h3>
            <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{approvedIncome.toLocaleString()}</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Total Expenses</h3>
            <div className="p-1 bg-rose-50 text-rose-600 rounded">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{approvedExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-sm text-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Current Balance</h3>
            <div className="p-1 bg-slate-800 text-slate-300 rounded">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">₹{balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingTransactions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Pending Approvals
            <span className="bg-amber-100 text-amber-700 text-xs py-0.5 px-2 rounded-full font-bold">
              {pendingTransactions.length}
            </span>
          </h2>
          <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-100">
              {pendingTransactions.map(tx => (
                <li key={tx.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{tx.member?.name || tx.user?.name || "Unknown Member"}</span>
                      <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">{tx.category}</span>
                    </div>
                    <p className="text-sm text-gray-600">{tx.description}</p>
                    {tx.receiptUrl && (
                      <a href={tx.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline mt-1 inline-block">
                        View Receipt
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <span className="text-lg font-bold text-emerald-700 whitespace-nowrap">₹{tx.amount.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(tx.id, "REJECTED")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Reject"
                      >
                        <XCircle className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(tx.id, "APPROVED")}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Approve"
                      >
                        <CheckCircle className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
        <FilterBar 
          placeholder="Search transactions..." 
          showMonthFilter 
          showStatusFilter
          statusOptions={statusOptions}
        />
        {pastTransactions.length === 0 ? (
          <div className="text-slate-500 font-medium bg-white/40 backdrop-blur-md p-10 rounded-3xl text-center border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            No transaction history found matching criteria.
          </div>
        ) : (
          <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:bg-white/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/5">
                  {pastTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/50 transition-colors group cursor-default">
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{tx.description}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">{tx.member?.name || tx.user?.name || "Club / Admin"}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right font-black text-slate-900">
                        ₹{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          tx.status === 'APPROVED' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 
                          tx.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border-rose-200' : 
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                        >
                          Edit
                        </button>
                        <DeleteButton
                          endpoint="/api/admin/finance/transactions"
                          id={tx.id}
                          confirmMessage="Are you sure you want to delete this transaction?"
                          onSuccess={invalidateData}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingTransaction && (
        <TransactionEditDialog
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={invalidateData}
        />
      )}
    </div>
  );
}
