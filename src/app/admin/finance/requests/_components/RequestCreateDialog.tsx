"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand";

export default function RequestCreateDialog({
  triggerLabel = "New Request",
  triggerVariant = "default",
}: {
  triggerLabel?: string;
  triggerVariant?: "default" | "outline";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    if (!open) return;
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
  }, [open]);

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
      setOpen(false);
      setTitle("");
      setDescription("");
      setAmount("");
      setCategory("DUES");
      setIsGlobal(true);
      setDueDate("");
      setAssignees([]);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
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
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={triggerVariant}
        className={triggerVariant === "default" ? "gap-1.5 bg-brand hover:bg-brand-deep text-white" : "gap-1.5"}
      >
        <Plus className="w-4 h-4" /> {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Raise Payment Request</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Q4 Membership Dues"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {Object.entries(TRANSACTION_CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Additional details about this request..."
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className={`cursor-pointer p-3 rounded-lg border-2 transition ${isGlobal ? 'border-brand bg-pink-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="audience" className="sr-only" checked={isGlobal} onChange={() => setIsGlobal(true)} />
                  <div className="font-semibold text-sm text-slate-900">All Members</div>
                  <div className="text-xs text-slate-500 mt-1">Request applies to everyone in the club</div>
                </label>
                <label className={`cursor-pointer p-3 rounded-lg border-2 transition ${!isGlobal ? 'border-brand bg-pink-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="audience" className="sr-only" checked={!isGlobal} onChange={() => setIsGlobal(false)} />
                  <div className="font-semibold text-sm text-slate-900">Specific Members</div>
                  <div className="text-xs text-slate-500 mt-1">Select exactly who owes this amount</div>
                </label>
              </div>

              {!isGlobal && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 max-h-52 overflow-y-auto">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Select Members ({assignees.length} selected)</div>
                  {members.length === 0 ? (
                    <div className="text-sm text-slate-500">No members found in system.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {members.map(member => (
                        <label key={member.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition cursor-pointer">
                          <input
                            type="checkbox"
                            checked={assignees.includes(member.id)}
                            onChange={() => toggleMember(member.id)}
                            className="rounded border-slate-300 text-brand focus:ring-brand"
                          />
                          <span className="text-sm font-medium text-slate-900">{member.name || member.email}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2 bg-brand hover:bg-brand-deep text-white">
                <Save className="h-4 w-4" />
                {submitting ? "Raising Request..." : "Raise Payment Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
