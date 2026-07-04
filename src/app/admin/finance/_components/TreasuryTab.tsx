"use client";

import React, { useState, useEffect } from "react";
import { Banknote, CheckCircle, XCircle, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import Link from "next/link";

export default function TreasuryTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useLoadingToast(loading, "Loading treasury data...");

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/finance/transactions");
      const data = await res.json();
      if (!data.error) setTransactions(data);
    } catch (err) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    const toastId = toast.loading(`Marking as ${status.toLowerCase()}...`);
    try {
      const res = await fetch(`/api/admin/finance/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(`Transaction ${status.toLowerCase()}`, { id: toastId });
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const approvedIncome = transactions
    .filter(t => t.type === "INCOME" && (t.status === "APPROVED" || t.status === "COMPLETED"))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const approvedExpenses = transactions
    .filter(t => t.type === "EXPENSE" && (t.status === "APPROVED" || t.status === "COMPLETED"))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = approvedIncome - approvedExpenses;

  const pendingTransactions = transactions.filter(t => t.status === "PENDING");
  const pastTransactions = transactions.filter(t => t.status !== "PENDING");

  if (loading) return <div className="text-sm text-gray-500 py-10">Loading treasury data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-semibold text-sm">Total Income</h3>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">₹{approvedIncome.toLocaleString()}</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-semibold text-sm">Total Expenses</h3>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">₹{approvedExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Wallet className="h-32 w-32 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-400 font-semibold text-sm mb-2">Current Balance</h3>
            <p className="text-3xl font-black text-white">₹{balance.toLocaleString()}</p>
          </div>
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
        <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
        {pastTransactions.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
            No transaction history found.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {pastTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{tx.description}</div>
                      <div className="text-xs text-gray-500">{tx.member?.name || tx.user?.name || "Club / Admin"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                      ₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                        tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
