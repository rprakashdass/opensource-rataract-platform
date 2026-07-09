"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewInitiative } from "@/features/initiatives/actions/reviewInitiative";
import { convertInitiativeToEvent } from "@/features/initiatives/actions/convertInitiativeToEvent";
import { convertInitiativeToProject } from "@/features/initiatives/actions/convertInitiativeToProject";
import { ROUTES } from "@/lib/constants";
import { Eye, AlertCircle, CheckCircle2, XCircle, Calendar, Briefcase } from "lucide-react";

export function ReviewActions({ initiativeId, status }: { initiativeId: string; status: string }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const runReview = async (next: "UNDER_REVIEW" | "NEEDS_CHANGES" | "APPROVED" | "REJECTED") => {
    setLoading(next);
    const res = await reviewInitiative(initiativeId, next, comment);
    setLoading(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setComment("");
    toast.success("Proposal updated");
    router.refresh();
  };

  const runConvert = async (type: "event" | "project") => {
    setLoading(type);
    const res = type === "event"
      ? await convertInitiativeToEvent(initiativeId)
      : await convertInitiativeToProject(initiativeId);
    setLoading(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(`Converted to ${type}! Redirecting to finish setup...`);
    const entityId = (res as any).event?.id || (res as any).project?.id;
    router.push(`${ROUTES.ADMIN}/${type === "event" ? "events" : "projects"}/${entityId}`);
  };

  if (status === "CONVERTED") {
    return <p className="text-sm text-slate-500 italic">This proposal has already been converted.</p>;
  }

  if (status === "APPROVED") {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-sm text-green-700 font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Approved — ready to convert into an event or project.
        </div>
        <div className="flex gap-3">
          <Button onClick={() => runConvert("event")} disabled={loading !== null} className="rounded-xl bg-blue-600 hover:bg-blue-700">
            <Calendar className="w-4 h-4 mr-2" /> {loading === "event" ? "Converting..." : "Convert to Event"}
          </Button>
          <Button onClick={() => runConvert("project")} disabled={loading !== null} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
            <Briefcase className="w-4 h-4 mr-2" /> {loading === "project" ? "Converting..." : "Convert to Project"}
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
      />
      <div className="flex flex-wrap gap-3">
        {status === "SUBMITTED" && (
          <Button variant="outline" onClick={() => runReview("UNDER_REVIEW")} disabled={loading !== null} className="rounded-xl">
            <Eye className="w-4 h-4 mr-2" /> {loading === "UNDER_REVIEW" ? "..." : "Mark Under Review"}
          </Button>
        )}
        <Button variant="outline" onClick={() => runReview("NEEDS_CHANGES")} disabled={loading !== null} className="rounded-xl text-orange-600 border-orange-200 hover:bg-orange-50">
          <AlertCircle className="w-4 h-4 mr-2" /> {loading === "NEEDS_CHANGES" ? "..." : "Request Changes"}
        </Button>
        <Button onClick={() => runReview("APPROVED")} disabled={loading !== null} className="rounded-xl bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="w-4 h-4 mr-2" /> {loading === "APPROVED" ? "..." : "Approve"}
        </Button>
        <Button variant="outline" onClick={() => runReview("REJECTED")} disabled={loading !== null} className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
          <XCircle className="w-4 h-4 mr-2" /> {loading === "REJECTED" ? "..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
