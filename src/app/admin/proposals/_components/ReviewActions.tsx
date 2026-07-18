"use client";

import { useState, useOptimistic, startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewInitiative } from "@/features/initiatives/actions/reviewInitiative";
import { convertInitiativeToEvent } from "@/features/initiatives/actions/convertInitiativeToEvent";
import { convertInitiativeToProject } from "@/features/initiatives/actions/convertInitiativeToProject";
import { ROUTES } from "@/lib/constants";
import { Eye, AlertCircle, CheckCircle2, XCircle, Calendar, Briefcase, Loader2 } from "lucide-react";

export function ReviewActions({ initiativeId, status }: { initiativeId: string; status: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    status,
    (state, newStatus: string) => newStatus
  );

  const runReview = async (next: "UNDER_REVIEW" | "NEEDS_CHANGES" | "APPROVED" | "REJECTED") => {
    setLoading(next);
    startTransition(() => {
      setOptimisticStatus(next);
    });
    
    try {
      const res = await reviewInitiative(initiativeId, next, comment);
      if (res.error) throw new Error(res.error);
      setComment("");
      toast.success("Proposal updated");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update proposal");
      startTransition(() => {
        setOptimisticStatus(status);
      });
    } finally {
      setLoading(null);
    }
  };

  const runConvert = async (type: "event" | "project") => {
    setLoading(type);
    startTransition(() => {
      setOptimisticStatus("CONVERTED");
    });
    
    try {
      const res = type === "event"
        ? await convertInitiativeToEvent(initiativeId)
        : await convertInitiativeToProject(initiativeId);
      if (res.error) throw new Error(res.error);
      
      toast.success(`Converted to ${type}! Redirecting to finish setup...`);
      const entityId = (res as any).event?.id || (res as any).project?.id;
      router.push(`${ROUTES.ADMIN}/${type === "event" ? "events" : "projects"}/${entityId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to convert proposal");
      startTransition(() => {
        setOptimisticStatus(status);
      });
      setLoading(null);
    }
  };

  if (optimisticStatus === "CONVERTED") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500 italic">This proposal has been converted.</p>
        {loading && <p className="text-xs text-brand animate-pulse">Redirecting to setup...</p>}
      </div>
    );
  }

  if (optimisticStatus === "APPROVED") {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-sm text-emerald-700 font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Approved — ready to convert into an event or project.
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => runConvert("event")} disabled={loading !== null} className="rounded-xl bg-brand hover:bg-brand-deep text-white">
            {loading === "event" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
            {loading === "event" ? "Converting..." : "Convert to Event"}
          </Button>
          <Button onClick={() => runConvert("project")} disabled={loading !== null} className="rounded-xl bg-brand hover:bg-brand-deep text-white">
            {loading === "project" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Briefcase className="w-4 h-4 mr-2" />}
            {loading === "project" ? "Converting..." : "Convert to Project"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a review comment (optional, shown to the proposer)..."
        disabled={loading !== null}
      />
      <div className="flex flex-wrap gap-3">
        {optimisticStatus === "SUBMITTED" && (
          <Button variant="outline" onClick={() => runReview("UNDER_REVIEW")} disabled={loading !== null} className="rounded-xl">
            {loading === "UNDER_REVIEW" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
            {loading === "UNDER_REVIEW" ? "Updating..." : "Mark Under Review"}
          </Button>
        )}
        <Button variant="outline" onClick={() => runReview("NEEDS_CHANGES")} disabled={loading !== null} className="rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50">
          {loading === "NEEDS_CHANGES" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertCircle className="w-4 h-4 mr-2" />}
          {loading === "NEEDS_CHANGES" ? "Updating..." : "Request Changes"}
        </Button>
        <Button onClick={() => runReview("APPROVED")} disabled={loading !== null} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading === "APPROVED" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {loading === "APPROVED" ? "Approving..." : "Approve"}
        </Button>
        <Button variant="outline" onClick={() => runReview("REJECTED")} disabled={loading !== null} className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50">
          {loading === "REJECTED" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
          {loading === "REJECTED" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
