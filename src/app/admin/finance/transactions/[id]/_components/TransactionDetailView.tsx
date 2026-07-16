"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, FileText, CheckCircle2, Ban, Loader2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { voidTransaction } from "@/features/finance/actions/voidTransaction";
import { updateTransactionStatus } from "@/features/finance/actions/updateTransactionStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/portal";

interface TransactionDetailViewProps {
  transaction: any;
}

export default function TransactionDetailView({ transaction }: TransactionDetailViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  const handleStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      const res = await updateTransactionStatus(transaction.id, newStatus);
      if (res.error) throw new Error(res.error);
      toast.success(`Transaction ${newStatus.toLowerCase()} successfully`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      toast.error("Void reason is required");
      return;
    }
    setLoading(true);
    try {
      const res = await voidTransaction(transaction.id, voidReason);
      if (res.error) throw new Error(res.error);
      toast.success("Transaction voided successfully");
      setIsVoiding(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to void transaction");
    } finally {
      setLoading(false);
    }
  };

  const amount = Number(transaction.amount);

  return (
    <div className="space-y-6">
      {/* Header & Status Alert */}
      <PageHeader
        title={transaction.title}
        description={`Transaction ID: ${transaction.id}`}
        backHref="/admin/finance/transactions"
        backLabel="Back to Transactions"
        actions={
          <>
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
              transaction.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              transaction.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              transaction.status === 'VOIDED' ? 'bg-slate-100 text-slate-600 border-slate-300' :
              'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {transaction.status.replace("_", " ")}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
              transaction.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {transaction.type}
            </span>
          </>
        }
      />

      {transaction.status === "VOIDED" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Voided Transaction</AlertTitle>
          <AlertDescription>
            This transaction has been voided. Its balance impact on the account has been reversed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Audit */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹{amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{transaction.category?.name || transaction.categoryId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Account</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{transaction.account?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment Method</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{transaction.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Financial Year</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{transaction.financialYear?.name || "N/A"}</p>
              </div>
              
              {transaction.project && (
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Linked Project</p>
                  <p className="text-sm font-medium text-brand mt-1">{transaction.project.title}</p>
                </div>
              )}
              {transaction.event && (
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Linked Event</p>
                  <p className="text-sm font-medium text-brand mt-1">{transaction.event.title}</p>
                </div>
              )}
              {transaction.description && (
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{transaction.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                Audit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transaction.auditLogs?.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No audit logs found.</p>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {transaction.auditLogs?.map((log: any, idx: number) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-slate-900 text-sm">{log.action.replace("_", " ").toUpperCase()}</p>
                          <time className="text-xs text-slate-500 font-medium" suppressHydrationWarning>{new Date(log.createdAt).toLocaleDateString()}</time>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">by {log.user?.name || "System"}</p>
                        {log.changes && (
                          <div className="bg-slate-50 rounded p-2 text-xs font-mono text-slate-600 break-words">
                            {JSON.stringify(JSON.parse(log.changes), null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Receipt & Actions */}
        <div className="space-y-6">
          
          {/* Actions Panel */}
          <Card className="border-pink-100 bg-pink-50/30">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transaction.status === "PENDING_APPROVAL" && (
                <>
                  <Button 
                    onClick={() => handleStatusUpdate("APPROVED")} 
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve Transaction
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate("REJECTED")}
                    disabled={loading}
                    variant="outline"
                    className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 gap-2"
                  >
                    <Ban className="w-4 h-4" /> Reject
                  </Button>
                </>
              )}

              {transaction.status === "APPROVED" && !isVoiding && (
                <Button 
                  onClick={() => setIsVoiding(true)}
                  variant="outline"
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Void Transaction
                </Button>
              )}

              {isVoiding && (
                <div className="space-y-3 p-3 bg-white rounded-xl border border-rose-200 shadow-sm">
                  <p className="text-xs font-semibold text-rose-700">Confirm Void</p>
                  <p className="text-xs text-slate-500">This will create a reversing transaction to nullify the balance impact. This action cannot be undone.</p>
                  <textarea
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="Reason for voiding..."
                    className="w-full text-sm p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
                    rows={2}
                    required
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsVoiding(false)} 
                      variant="ghost" 
                      className="flex-1 text-xs"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleVoid} 
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-xs"
                      disabled={loading || !voidReason.trim()}
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Void"}
                    </Button>
                  </div>
                </div>
              )}

              {transaction.status === "VOIDED" && (
                <p className="text-sm text-center font-medium text-slate-500 py-2">
                  No further actions available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Receipt View */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt / Proof</CardTitle>
            </CardHeader>
            <CardContent>
              {transaction.receiptUrl ? (() => {
                const isPdf = transaction.receiptUrl.toLowerCase().endsWith(".pdf") || 
                              transaction.receiptUrl.toLowerCase().includes("/media/document/") || 
                              transaction.receiptUrl.startsWith("data:application/pdf");
                return (
                  <div className="space-y-3">
                    <div className="aspect-[3/4] w-full bg-slate-100 rounded-lg overflow-hidden border flex items-center justify-center relative">
                      {isPdf ? (
                        <iframe src={transaction.receiptUrl} className="w-full h-full border-0" title="Receipt PDF" />
                      ) : (
                        <img src={transaction.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">
                        View Full Size
                      </a>
                    </Button>
                  </div>
                );
              })() : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No receipt uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
