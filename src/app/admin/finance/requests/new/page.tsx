"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewPaymentRequestPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("DUES");
  const [isGlobal, setIsGlobal] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/admin/members");
        const data = await res.json();
        if (!data.error) setMembers(data);
      } catch (err) {
        toast.error("Failed to load members");
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGlobal && assignees.length === 0) {
      toast.error("Please select at least one member or choose Global");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Raising payment request...");

    try {
      const res = await fetch("/api/admin/finance/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          amount,
          category,
          isGlobal,
          dueDate: dueDate || null,
          assignees
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Payment request raised successfully!", { id: toastId });
      router.push("/admin/finance/requests");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
      setSubmitting(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setAssignees(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link href="/admin/finance/requests" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Raise Payment Request</h1>
          <p className="text-sm text-gray-500 mt-1">Invoice members for dues or events</p>
        </div>
      </div>

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
              placeholder="e.g. Q4 Membership Dues"
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
              placeholder="e.g. 500"
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
            placeholder="Additional details about this request..."
          />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Target Audience *</label>
          <div className="flex gap-4 mb-4">
            <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition ${isGlobal ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <input type="radio" name="audience" className="sr-only" checked={isGlobal} onChange={() => setIsGlobal(true)} />
              <div className="font-bold text-sm text-gray-900">All Members</div>
              <div className="text-xs text-gray-500 mt-1">Request applies to everyone in the club</div>
            </label>
            <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition ${!isGlobal ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <input type="radio" name="audience" className="sr-only" checked={!isGlobal} onChange={() => setIsGlobal(false)} />
              <div className="font-bold text-sm text-gray-900">Specific Members</div>
              <div className="text-xs text-gray-500 mt-1">Select exactly who owes this amount</div>
            </label>
          </div>

          {!isGlobal && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="text-xs font-semibold text-gray-500 mb-3">Select Members ({assignees.length} selected)</div>
              {members.length === 0 ? (
                <div className="text-sm text-gray-500">No members found in system.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map(member => (
                    <label key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={assignees.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{member.name || member.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {submitting ? "Raising Request..." : "Raise Payment Request"}
        </button>
      </form>
    </div>
  );
}
