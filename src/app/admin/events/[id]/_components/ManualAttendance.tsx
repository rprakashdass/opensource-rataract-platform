"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function ManualAttendance({ eventId, availableMembers }: { eventId: string, availableMembers: { id: string, name: string }[] }) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleManualMark = async () => {
    if (!selectedMemberId) {
      toast.error("Please select a member first");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Marking attendance...");
    
    try {
      const res = await fetch(`/api/admin/events/${eventId}/attendees/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast.success("Successfully registered and marked attended", { id: toastId });
      setSelectedMemberId("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (availableMembers.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <select 
        value={selectedMemberId} 
        onChange={(e) => setSelectedMemberId(e.target.value)}
        className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
      >
        <option value="">Select member to mark present...</option>
        {availableMembers.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <button
        onClick={handleManualMark}
        disabled={loading || !selectedMemberId}
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        {loading ? "Marking..." : "Mark Present"}
      </button>
    </div>
  );
}
