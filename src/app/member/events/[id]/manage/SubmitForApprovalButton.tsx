"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, Clock } from "lucide-react";
import { submitEventForReview } from "@/features/events/actions/submitEvent";

export default function SubmitForApprovalButton({
  eventId,
  alreadySubmitted,
}: {
  eventId: string;
  alreadySubmitted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(alreadySubmitted);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await submitEventForReview(eventId);
    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    setSubmitted(true);
    toast.success("Sent to admins for approval.");
    router.refresh();
  };

  if (submitted) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-wash px-4 py-2 text-sm font-semibold text-ink-soft">
        <Clock className="w-4 h-4" /> Awaiting approval
      </span>
    );
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="motion-button inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-deep transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      Submit for approval
    </button>
  );
}
