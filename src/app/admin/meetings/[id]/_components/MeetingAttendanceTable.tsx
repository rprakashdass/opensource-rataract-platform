"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, CheckCircle2, Circle } from "lucide-react";

export default function MeetingAttendanceTable({ meetingId, attendees, availableMembers }: { meetingId: string, attendees: any[], availableMembers: any[] }) {
  const [selectedMember, setSelectedMember] = useState("");
  const [marking, setMarking] = useState(false);

  const handleMarkPresent = async () => {
    if (!selectedMember) return;
    setMarking(true);
    const toastId = toast.loading("Marking member present...");
    try {
      // POST to an API that creates a MeetingAttendance record
      // We will create the API below or just use a generic one
      const res = await fetch(`/api/admin/meetings/${meetingId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember, attendedAt: new Date().toISOString() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Member marked as present!", { id: toastId });
      setSelectedMember("");
      window.location.reload(); // Quick refresh for now
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setMarking(false);
    }
  };

  const handleToggle = async (attendeeId: string, currentStatus: boolean) => {
    const toastId = toast.loading("Updating attendance...");
    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}/attendance/${attendeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendedAt: currentStatus ? null : new Date().toISOString() })
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Attendance updated!", { id: toastId });
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          Attendees
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={selectedMember} 
            onChange={(e) => setSelectedMember(e.target.value)}
            className="flex-1 sm:w-64 rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select member to mark present...</option>
            {availableMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button 
            onClick={handleMarkPresent}
            disabled={!selectedMember || marking}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-200 transition disabled:opacity-50"
          >
            + Add
          </button>
        </div>
      </div>
      
      {attendees.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No members have been marked as present.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {attendees.map((attendee) => (
              <tr key={attendee.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{attendee.member.name}</div>
                  <div className="text-xs text-gray-500">{attendee.member.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => handleToggle(attendee.id, !!attendee.attendedAt)}
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    {attendee.attendedAt ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 hover:text-emerald-500" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
