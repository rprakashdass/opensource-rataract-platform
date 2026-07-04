"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, Banknote } from "lucide-react";

export default function LogTransactionPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging transaction...");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount,
          description,
          category,
          status: "COMPLETED" // Admin logs are auto-completed
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Transaction recorded", { id: loadingToast });
      router.push(`${ROUTES.ADMIN}/finance/transactions`);
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <Link href={`${ROUTES.ADMIN}/finance/transactions`} className="text-emerald-600 hover:underline text-sm font-semibold flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Ledger
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Log Transaction</h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Record a club expense or manual income to keep the treasury balanced.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500">
                <option value="EXPENSE">Expense (Money Out)</option>
                <option value="INCOME">Income (Money In)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input required type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-emerald-500 focus:border-emerald-500" placeholder="0.00" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500">
              <option value="LOGISTICS">Logistics / Operations</option>
              <option value="CATERING">Catering / Food</option>
              <option value="MARKETING">Marketing / Promotion</option>
              <option value="DONATION">Donation</option>
              <option value="EVENT_FEE">Event Fee</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Memo *</label>
            <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Venue booking for annual summit" />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={submitting} className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50">
              {submitting ? "Saving..." : "Record Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
