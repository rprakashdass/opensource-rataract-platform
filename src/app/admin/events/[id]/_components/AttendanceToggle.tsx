"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AttendanceToggle({ attendeeId, eventId, isAttended }: { attendeeId: string, eventId: string, isAttended: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleAttendance = async () => {
    setLoading(true);
    const toastId = toast.loading("Updating attendance...");
    try {
      const res = await fetch(`/api/admin/events/${eventId}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendeeId, attended: !isAttended })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Attendance updated", { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleAttendance}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
        isAttended 
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {isAttended ? (
        <><Check className="h-3.5 w-3.5" /> Attended</>
      ) : (
        <><X className="h-3.5 w-3.5" /> Mark Present</>
      )}
    </button>
  );
}
