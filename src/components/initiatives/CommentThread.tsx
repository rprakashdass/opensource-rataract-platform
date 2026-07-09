"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addInitiativeComment } from "@/features/initiatives/actions/addInitiativeComment";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  UNDER_REVIEW: "moved this to Under Review",
  NEEDS_CHANGES: "requested changes",
  APPROVED: "approved this proposal",
  REJECTED: "rejected this proposal",
};

export function CommentThread({ initiativeId, comments, currentUserId, canComment = true }: { initiativeId: string; comments: any[]; currentUserId?: string; canComment?: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    const res = await addInitiativeComment(initiativeId, body);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setBody("");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <MessageSquare className="w-4 h-4" /> Discussion
      </div>

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400 italic">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className={`p-3 rounded-xl border text-sm ${c.action !== "COMMENT" ? "bg-purple-50 border-purple-100" : "bg-slate-50 border-slate-100"}`}>
            <div className="flex justify-between items-baseline gap-2 mb-1">
              <span className="font-bold text-slate-800">{c.author?.name || c.author?.email || "Unknown"}</span>
              <span className="text-xs text-slate-400 whitespace-nowrap">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
            </div>
            {c.action !== "COMMENT" && (
              <p className="text-xs font-semibold text-purple-600 mb-1">{ACTION_LABELS[c.action] || c.action}</p>
            )}
            <p className="text-slate-600 whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
      </div>

      {canComment ? (
        <div className="flex gap-2 items-start pt-2">
          <Textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment..." className="flex-1" />
          <Button type="button" onClick={handleSubmit} disabled={loading || !body.trim()}>
            {loading ? "..." : "Post"}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic pt-2">Only the proposer and admins can comment here.</p>
      )}
    </div>
  );
}
