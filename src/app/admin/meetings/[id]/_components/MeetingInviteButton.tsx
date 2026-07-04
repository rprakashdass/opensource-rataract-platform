"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function MeetingInviteButton({ meetingId }: { meetingId: string }) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!confirm("This will email the meeting invite and agenda to ALL active club members. Are you sure?")) return;
    
    const toastId = toast.loading("Sending meeting invites...");
    setSending(true);
    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}/invite`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Meeting invites sent successfully!", { id: toastId });
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
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
    >
      <Mail className="h-4 w-4" />
      Send Meeting Invite
    </button>
  );
}
