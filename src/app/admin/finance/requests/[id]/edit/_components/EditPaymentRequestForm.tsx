"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  request: {
    id: string;
    title: string;
    description: string;
    amount: number;
    category: string;
    isGlobal: boolean;
    dueDate: string;
  };
  audience: string;
}

export default function EditPaymentRequestForm({ request, audience }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState(request.description);
  const [amount, setAmount] = useState(String(request.amount));
  const [category, setCategory] = useState(request.category);
  const [dueDate, setDueDate] = useState(request.dueDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const res = await fetch(`/api/admin/finance/requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          amount,
          category,
          isGlobal: request.isGlobal,
          dueDate: dueDate || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Payment request updated!", { id: toastId });
      router.push("/admin/finance/requests");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Request Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Amount (₹) *</label>
          <input
            type="number"
            required
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="DUES">Membership Dues</option>
            <option value="EVENT_FEE">Event Registration Fee</option>
            <option value="DONATION">General Donation</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Due Date (Optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Audience</p>
        <p className="text-sm text-gray-700">{audience}</p>
        <p className="text-xs text-gray-400 mt-1">Audience can't be changed after a request is created — delete and re-raise it to target different members.</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save className="h-4 w-4" />
        {submitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
