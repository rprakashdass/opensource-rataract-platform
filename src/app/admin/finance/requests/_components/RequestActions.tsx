"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, HandCoins, Users, Send, Bell, Loader2 } from "lucide-react";
import RequestEditDialog from "../../_components/RequestEditDialog";
import { RecordDirectPaymentDialog } from "../../_components/RecordDirectPaymentDialog";
import { BulkRecordPaymentsDialog } from "./BulkRecordPaymentsDialog";
import { notifyPaymentRequest } from "@/features/finance/actions/notifyPaymentRequest";

export default function RequestActions({
  request,
  members = [],
  accounts = [],
}: {
  request: {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    category: string;
    isGlobal: boolean;
    dueDate: string | null;
  };
  members?: { id: string; name: string | null; email: string | null }[];
  accounts?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/member/finance/requests/${request.id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Pay link copied — share it however you like.");
    } catch {
      toast.error("Couldn't copy the link. Copy it manually: " + link);
    }
  };

  const handleNotify = async () => {
    setNotifying(true);
    try {
      const res = await notifyPaymentRequest(request.id);
      if (res.error) throw new Error(res.error);
      toast.success(`Notifying ${res.notifiedCount} member${res.notifiedCount === 1 ? "" : "s"} who still owe this.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to notify members");
    } finally {
      setNotifying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this payment request? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/requests/${request.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Payment request deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8 hover:text-brand hover:bg-pink-50" onClick={handleCopyLink} title="Share the pay link">
        <Send className="w-3.5 h-3.5 text-slate-500" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8 hover:text-brand hover:bg-pink-50" onClick={handleNotify} disabled={notifying} title="Email everyone who still owes this">
        {notifying ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" /> : <Bell className="w-3.5 h-3.5 text-slate-500" />}
      </Button>
      <RecordDirectPaymentDialog
        members={members}
        accounts={accounts}
        paymentRequestId={request.id}
        defaultAmount={request.amount}
        defaultDescription={request.title}
        trigger={
          <Button variant="outline" size="icon" className="h-8 w-8 hover:text-emerald-700 hover:bg-emerald-50" title="Record a cash / direct payment for this request">
            <HandCoins className="w-3.5 h-3.5 text-emerald-600" />
          </Button>
        }
      />
      <BulkRecordPaymentsDialog
        requestId={request.id}
        requestTitle={request.title}
        members={members}
        accounts={accounts}
        defaultAmount={request.amount}
        trigger={
          <Button variant="outline" size="icon" className="h-8 w-8 hover:text-brand hover:bg-pink-50" title="Bulk record payments for members who already paid">
            <Users className="w-3.5 h-3.5 text-brand" />
          </Button>
        }
      />
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditing(true)}>
        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50" onClick={handleDelete} disabled={loading}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      {editing && (
        <RequestEditDialog
          request={request}
          onClose={() => setEditing(false)}
          onSave={() => router.refresh()}
        />
      )}
    </div>
  );
}
