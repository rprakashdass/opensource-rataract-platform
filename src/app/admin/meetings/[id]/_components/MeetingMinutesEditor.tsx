"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";
import MeetingMinutesButton from "./MeetingMinutesButton";

export default function MeetingMinutesEditor({ meetingId, initialMinutes, initialMinutesUrl }: { meetingId: string; initialMinutes: string; initialMinutesUrl: string }) {
  const [minutes, setMinutes] = useState(initialMinutes || "");
  const [minutesUrl, setMinutesUrl] = useState(initialMinutesUrl || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const toastId = toast.loading("Saving minutes...");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes, minutesUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Minutes saved successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          Meeting Minutes
        </h2>
        <div className="flex gap-2">
          <MeetingMinutesButton meetingId={meetingId} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            <Save className="h-4 w-4" />
            Save Minutes
          </button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minutes Document URL (PDF Link)</label>
          <input type="url" value={minutesUrl} onChange={(e) => setMinutesUrl(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="https://drive.google.com/..." />
          <p className="text-xs text-gray-500 mt-1">If provided, this file will be attached to the minutes email.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minutes Details (Text)</label>
          <textarea
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Write the meeting minutes here... (Markdown is supported)"
            className="w-full h-64 border-gray-200 bg-gray-50/50 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 p-4 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
