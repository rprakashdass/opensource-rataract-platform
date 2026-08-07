"use client";

import React, { useState } from "react";
import { HandCoins, Loader2, Save, Download } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { recordDirectPayment } from "@/features/finance/actions/recordDirectPayment";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand";

const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD", "OTHER"];

export function RecordDirectPaymentDialog({
  accounts = [],
  categories = [],
  members = [],
  paymentRequestId,
  defaultAmount,
  defaultDescription,
  trigger,
}: {
  accounts?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  members?: { id: string; name: string | null; email: string | null }[];
  paymentRequestId?: string;
  defaultAmount?: number;
  defaultDescription?: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const empty = {
    memberId: "",
    payerName: "",
    payerEmail: "",
    amount: defaultAmount != null ? String(defaultAmount) : "",
    paymentMethod: "CASH",
    referenceNumber: "",
    description: defaultDescription || "",
    categoryId: "",
    accountId: "",
    date: new Date().toISOString().split("T")[0],
  };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Picking a member auto-fills (and locks) their name + email; clearing frees the fields.
  const onPickMember = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (m) {
      setForm((f) => ({ ...f, memberId: id, payerName: m.name || "", payerEmail: m.email || "" }));
    } else {
      setForm((f) => ({ ...f, memberId: "", payerName: "", payerEmail: "" }));
    }
  };
  const isMember = !!form.memberId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await recordDirectPayment({
        memberId: form.memberId || undefined,
        paymentRequestId,
        payerName: form.payerName,
        payerEmail: form.payerEmail || undefined,
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber || undefined,
        description: form.description,
        categoryId: form.categoryId || undefined,
        accountId: form.accountId || undefined,
        date: form.date ? new Date(form.date).toISOString() : undefined,
      });
      if ((res as any).error) throw new Error((res as any).error);

      const r = res as { receiptNumber?: string; url?: string | null; emailed?: boolean };
      toast.success(
        r.receiptNumber
          ? `Receipt ${r.receiptNumber} issued${r.emailed ? " and emailed" : ""}.`
          : "Payment recorded.",
        r.url
          ? {
              action: {
                label: "Open receipt",
                onClick: () => window.open(r.url as string, "_blank", "noopener,noreferrer"),
              },
            }
          : undefined
      );
      setOpen(false);
      setForm(empty);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const showReference = form.paymentMethod !== "CASH";

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
          <HandCoins className="h-4 w-4" />
          Record direct payment
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record a direct payment</DialogTitle>
            <DialogDescription>
              Money received directly (cash, UPI, etc.). This records an approved income entry and issues an official receipt.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {members.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Is the payer a member?</label>
                <select className={inputClass} value={form.memberId} onChange={(e) => onPickMember(e.target.value)}>
                  <option value="">No — external / non-member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name || "Unnamed"}{m.email ? ` · ${m.email}` : ""}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Received from *</label>
                <input required value={form.payerName} onChange={(e) => set("payerName", e.target.value)} className={inputClass} placeholder="Full name" readOnly={isMember} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payer email</label>
                <input type="email" value={form.payerEmail} onChange={(e) => set("payerEmail", e.target.value)} className={inputClass} placeholder="To email the receipt" readOnly={isMember} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rs.) *</label>
                <input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => set("amount", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mode of payment *</label>
                <select className={inputClass} value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            {showReference && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference / transaction no.</label>
                <input value={form.referenceNumber} onChange={(e) => set("referenceNumber", e.target.value)} className={inputClass} placeholder="UPI ref, cheque no., etc." />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purpose / description *</label>
              <textarea required rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass} placeholder="e.g. Annual membership dues, donation for blood camp" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className={inputClass} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deposited to</label>
                <select className={inputClass} value={form.accountId} onChange={(e) => set("accountId", e.target.value)}>
                  <option value="">—</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="gap-2 bg-brand hover:bg-brand-deep text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Record & issue receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
