"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { categoriesForType } from "@/lib/constants";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand";

export function EventTransactionDialog({
  eventId,
  accounts = [],
}: {
  eventId: string;
  accounts?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    description: "",
    category: "OTHER",
    receiptUrl: "",
    accountId: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (uploading) {
      toast.error("Please wait for the attachment to finish uploading.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount), eventId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(
        data.status === "APPROVED" ? "Transaction recorded" : "Transaction submitted for finance admin approval"
      );
      setOpen(false);
      setFormData({ type: "EXPENSE", amount: "", description: "", category: "OTHER", receiptUrl: "", accountId: "" });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" className="text-xs h-8 gap-1 border-slate-200" onClick={() => setOpen(true)}>
        <PlusCircle className="w-3.5 h-3.5" /> Add Transaction
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-500 -mt-2">
            Finance admin entries are approved immediately. Entries from anyone else go to a finance admin for approval before they count toward the budget.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  className={inputClass}
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value as "INCOME" | "EXPENSE";
                    const validCategories = categoriesForType(type);
                    const categoryStillValid = validCategories.some(([key]) => key === formData.category);
                    setFormData({
                      ...formData,
                      type,
                      category: categoryStillValid ? formData.category : validCategories[0][0],
                    });
                  }}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  className={inputClass}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categoriesForType(formData.type as "INCOME" | "EXPENSE").map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
                <select
                  className={inputClass}
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                >
                  <option value="">—</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Invoice / Bill / Receipt <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <FileUpload
                value={formData.receiptUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, receiptUrl: url }))}
                accept="image/*,application/pdf"
                context={{ kind: "finance" }}
                onStatusChange={(status) => setUploading(status === "uploading")}
              />
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 bg-brand hover:bg-brand-deep text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                Save Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
