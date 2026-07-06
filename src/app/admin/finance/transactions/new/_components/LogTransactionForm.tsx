"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Calendar, CreditCard, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { createTransaction } from "@/features/finance/actions/createTransaction";

interface LogTransactionFormProps {
  accounts: any[];
  categories: any[];
  projects: any[];
  events: any[];
}

export default function LogTransactionForm({
  accounts,
  categories,
  projects,
  events
}: LogTransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "EXPENSE",
    amount: "",
    categoryId: "",
    accountId: "",
    sourceType: "GENERAL", // GENERAL, PROJECT, EVENT
    projectId: "",
    eventId: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    receiptUrl: "",
    date: new Date().toISOString().split("T")[0]
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.categoryId || !formData.accountId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await createTransaction({
        title: formData.title,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        type: formData.type as any,
        categoryId: formData.categoryId,
        accountId: formData.accountId,
        projectId: formData.sourceType === "PROJECT" ? formData.projectId : null,
        eventId: formData.sourceType === "EVENT" ? formData.eventId : null,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber || null,
        receiptUrl: formData.receiptUrl || null,
        date: new Date(formData.date).toISOString()
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Transaction recorded successfully!");
        router.push("/admin/finance");
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              >
                <option value="EXPENSE">Expense (Money Out)</option>
                <option value="INCOME">Income (Money In)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Amount (₹) *</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Title / Subject *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Venue booking deposit"
              className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Account *</label>
              <select
                required
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              >
                <option value="">Select Account</option>
                {accounts.filter(a => a.type !== "UPI").map((a) => (
                  <option key={a.id} value={a.id}>{a.name} (₹{Number(a.currentBalance).toLocaleString()})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Source Type</label>
              <select
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              >
                <option value="GENERAL">General Club</option>
                <option value="PROJECT">Project Related</option>
                <option value="EVENT">Event Related</option>
              </select>
            </div>
            {formData.sourceType === "PROJECT" && (
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Linked Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
            {formData.sourceType === "EVENT" && (
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Linked Event</label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
                >
                  <option value="">Select Event</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reference / UPI ID</label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="e.g. Transaction Ref No."
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Receipt Link / URL</label>
              <input
                type="text"
                value={formData.receiptUrl}
                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                placeholder="e.g. Cloud Storage Receipt Link"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description / Memo</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a description of the transaction..."
              className="w-full border border-gray-300 p-2.5 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
            <Link href="/admin/finance">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Recording..." : "Record Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
