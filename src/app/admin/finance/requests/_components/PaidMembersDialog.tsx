"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Download,
  ExternalLink,
  Loader2,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface PaidTransaction {
  id: string;
  amount: number;
  date: string;
  paymentMethod: string | null;
  referenceNumber: string | null;
  receiptNumber: string | null;
  receiptDocUrl: string | null;
  receiptIssuedAt: string | null;
  payerName: string;
  payerEmail: string | null;
}

interface PaidMembersDialogProps {
  requestId: string;
  requestTitle: string;
  paidCount: number;
  children: React.ReactNode;
}

export function PaidMembersDialog({
  requestId,
  requestTitle,
  paidCount,
  children,
}: PaidMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaidTransaction[]>([]);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/finance/requests/${requestId}/payments`
      );
      if (!res.ok) throw new Error("Failed to load payment data");
      const data = await res.json();
      setPayments(data);
    } catch (err: any) {
      toast.error(err.message || "Could not load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && payments.length === 0) {
      loadPayments();
    }
  };

  const handlePreviewReceipt = async (txId: string) => {
    setPreviewingId(txId);
    try {
      window.open(
        `/admin/finance/transactions/${txId}/receipt/preview`,
        "_blank",
        "noopener,noreferrer"
      );
    } finally {
      setPreviewingId(null);
    }
  };

  return (
    <>
      <span
        onClick={() => handleOpen(true)}
        className="cursor-pointer"
        role="button"
        aria-label={`View ${paidCount} paid members`}
      >
        {children}
      </span>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Paid Members
            </DialogTitle>
            <DialogDescription>
              {paidCount} payment{paidCount !== 1 ? "s" : ""} received for{" "}
              <span className="font-semibold text-slate-700">{requestTitle}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500">Loading payments…</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Receipt className="w-10 h-10 text-slate-200" />
                <p className="text-sm font-medium text-slate-500">
                  No approved payments yet
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {payments.map((tx) => (
                  <div
                    key={tx.id}
                    className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      {/* Payer info */}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {tx.payerName}
                        </p>
                        {tx.payerEmail && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {tx.payerEmail}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-emerald-700 text-lg">
                          ₹{tx.amount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {tx.paymentMethod && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase tracking-wide"
                        >
                          {tx.paymentMethod.replace(/_/g, " ")}
                        </Badge>
                      )}
                      {tx.referenceNumber && (
                        <span className="text-xs text-slate-400 font-mono">
                          Ref: {tx.referenceNumber}
                        </span>
                      )}
                      {tx.receiptNumber && (
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-brand" />
                          {tx.receiptNumber}
                        </span>
                      )}
                    </div>

                    {/* Receipt actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 h-7"
                        onClick={() => handlePreviewReceipt(tx.id)}
                        disabled={previewingId === tx.id}
                      >
                        {previewingId === tx.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        Preview invoice
                      </Button>

                      {tx.receiptDocUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5 h-7 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          asChild
                        >
                          <a
                            href={tx.receiptDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3 h-3" />
                            Download receipt
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 self-center">
                          No receipt generated yet
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1.5 h-7 ml-auto text-slate-500 hover:text-brand"
                        asChild
                      >
                        <a href={`/admin/finance/transactions/${tx.id}`}>
                          <ExternalLink className="w-3 h-3" />
                          View transaction
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
