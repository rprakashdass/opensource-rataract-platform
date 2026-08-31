"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { recordBulkDirectPayments } from "@/features/finance/actions/recordDirectPayment";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand";

const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD", "OTHER"];

interface Member {
  id: string;
  name: string | null;
  email: string | null;
}

interface Row {
  memberId: string;
  selected: boolean;
  amount: string;
  paymentMethod: string;
  referenceNumber: string;
}

export function BulkRecordPaymentsDialog({
  requestId,
  requestTitle,
  members,
  accounts = [],
  defaultAmount,
  trigger,
}: {
  requestId: string;
  requestTitle: string;
  members: Member[];
  accounts?: { id: string; name: string }[];
  defaultAmount?: number;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPaid, setCheckingPaid] = useState(false);
  const [paidMemberIds, setPaidMemberIds] = useState<Set<string>>(new Set());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [rows, setRows] = useState<Record<string, Row>>({});

  const buildRows = (unpaidMembers: Member[]) => {
    const next: Record<string, Row> = {};
    for (const m of unpaidMembers) {
      next[m.id] = {
        memberId: m.id,
        selected: false,
        amount: defaultAmount != null ? String(defaultAmount) : "",
        paymentMethod: "CASH",
        referenceNumber: "",
      };
    }
    setRows(next);
  };

  const handleOpen = async () => {
    setOpen(true);
    setCheckingPaid(true);
    try {
      const res = await fetch(`/api/admin/finance/requests/${requestId}/payments`);
      const data = await res.json();
      const paid = new Set<string>((Array.isArray(data) ? data : []).map((p: any) => p.memberId).filter(Boolean));
      setPaidMemberIds(paid);
      buildRows(members.filter((m) => !paid.has(m.id)));
    } catch {
      // If the paid-list fetch fails, fall back to showing everyone rather than blocking the flow.
      buildRows(members);
    } finally {
      setCheckingPaid(false);
    }
  };

  const setRow = (memberId: string, patch: Partial<Row>) => {
    setRows((prev) => ({ ...prev, [memberId]: { ...prev[memberId], ...patch } }));
  };

  const selectedRows = Object.values(rows).filter((r) => r.selected);
  const allSelected = Object.values(rows).length > 0 && selectedRows.length === Object.values(rows).length;

  const toggleAll = () => {
    const next = !allSelected;
    setRows((prev) => {
      const copy: Record<string, Row> = {};
      for (const [id, r] of Object.entries(prev)) copy[id] = { ...r, selected: next };
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (selectedRows.length === 0) {
      toast.error("Select at least one member.");
      return;
    }
    const invalid = selectedRows.find((r) => !r.amount || parseFloat(r.amount) <= 0);
    if (invalid) {
      toast.error("Every selected member needs a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const inputs = selectedRows.map((r) => {
        const member = members.find((m) => m.id === r.memberId)!;
        return {
          memberId: r.memberId,
          paymentRequestId: requestId,
          payerName: member.name || "Unnamed",
          payerEmail: member.email || undefined,
          amount: parseFloat(r.amount),
          paymentMethod: r.paymentMethod,
          referenceNumber: r.referenceNumber || undefined,
          description: requestTitle,
          accountId: accountId || undefined,
          date,
        };
      });

      const res = await recordBulkDirectPayments(inputs);
      if ("error" in res) throw new Error(res.error);

      if (res.failed > 0) {
        toast.warning(`Recorded ${res.succeeded}, failed ${res.failed}. Check console for details.`);
        console.warn("Bulk payment failures:", res.results.filter((r) => !r.success));
      } else {
        toast.success(`Recorded payments for ${res.succeeded} member${res.succeeded === 1 ? "" : "s"}.`);
      }
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payments");
    } finally {
      setLoading(false);
    }
  };

  const rowList = Object.values(rows);

  return (
    <>
      <span onClick={handleOpen}>{trigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk record payments — {requestTitle}</DialogTitle>
            <DialogDescription>
              Select every member who already paid outside the app (cash, UPI, etc.), set their amount and mode, and record them all at once. Each gets its own receipt.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deposited to</label>
              <select className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">—</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {!checkingPaid && paidMemberIds.size > 0 && (
            <p className="text-xs text-slate-400">{paidMemberIds.size} member{paidMemberIds.size === 1 ? "" : "s"} already paid and {paidMemberIds.size === 1 ? "is" : "are"} hidden below.</p>
          )}

          {checkingPaid ? (
            <div className="py-10 flex items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading members...
            </div>
          ) : rowList.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">Everyone has already paid this request.</div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </th>
                    <th className="px-3 py-2">Member</th>
                    <th className="px-3 py-2">Amount (₹)</th>
                    <th className="px-3 py-2">Mode</th>
                    <th className="px-3 py-2">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rowList.map((r) => {
                    const member = members.find((m) => m.id === r.memberId)!;
                    return (
                      <tr key={r.memberId} className={r.selected ? "bg-pink-50/40" : undefined}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={r.selected}
                            onChange={(e) => setRow(r.memberId, { selected: e.target.checked })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-slate-900">{member.name || "Unnamed"}</div>
                          <div className="text-xs text-slate-400">{member.email || "—"}</div>
                        </td>
                        <td className="px-3 py-2 w-28">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={r.amount}
                            onChange={(e) => setRow(r.memberId, { amount: e.target.value })}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-3 py-2 w-36">
                          <select
                            value={r.paymentMethod}
                            onChange={(e) => setRow(r.memberId, { paymentMethod: e.target.value })}
                            className={inputClass}
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 w-36">
                          <input
                            value={r.referenceNumber}
                            onChange={(e) => setRow(r.memberId, { referenceNumber: e.target.value })}
                            className={inputClass}
                            placeholder="UPI ref, etc."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || selectedRows.length === 0}
              className="gap-2 bg-brand hover:bg-brand-deep text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Record {selectedRows.length > 0 ? `${selectedRows.length} payment${selectedRows.length === 1 ? "" : "s"}` : "payments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
