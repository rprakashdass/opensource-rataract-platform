"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewExternalMailRequest } from "@/features/external-mail/actions/reviewExternalMailRequest";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ReviewMailActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  const run = async (status: "APPROVED" | "REJECTED") => {
    setLoading(status);
    try {
      const res = await reviewExternalMailRequest(requestId, status, status === "REJECTED" ? reason : undefined);
      if (res.error) throw new Error(res.error);
      toast.success(status === "APPROVED" ? "Approved and sent!" : "Request rejected");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to review request");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for rejection (shown to the member, optional)..."
        disabled={loading !== null}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => run("APPROVED")} disabled={loading !== null} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading === "APPROVED" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {loading === "APPROVED" ? "Sending..." : "Approve & Send"}
        </Button>
        <Button variant="outline" onClick={() => run("REJECTED")} disabled={loading !== null} className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50">
          {loading === "REJECTED" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
          {loading === "REJECTED" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
