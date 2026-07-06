"use client";

import React, { useState } from "react";
import { X, Save, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TransactionCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "INCOME",
    amount: "",
    description: "",
    category: "OTHER",
    status: "COMPLETED",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Transaction recorded successfully");
      setOpen(false);
      setFormData({
        type: "INCOME",
        amount: "",
        description: "",
        category: "OTHER",
        status: "COMPLETED",
        date: new Date().toISOString().split("T")[0],
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Record Transaction
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Record New Transaction</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="DUES">Membership Dues</option>
                  <option value="EVENT_FEE">Event Fee</option>
                  <option value="DONATION">Donation</option>
                  <option value="SPONSORSHIP">Sponsorship</option>
                  <option value="CATERING">Catering</option>
                  <option value="LOGISTICS">Logistics</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
