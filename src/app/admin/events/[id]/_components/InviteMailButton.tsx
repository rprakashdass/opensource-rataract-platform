"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, CalendarDays } from "lucide-react";

export default function CalendarInviteButton({ eventId }: { eventId: string }) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!confirm("This will email an invite with event details to ALL active club members. Are you sure?")) return;
    
    const toastId = toast.loading("Sending invite emails...");
    setSending(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/invite`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Invite emails sent successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-deep transition shadow-sm"
    >
      <Mail className="h-4 w-4" />
      Send Invite Mail
    </button>
  );
}
