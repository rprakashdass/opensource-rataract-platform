"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Save, Send } from "lucide-react";
import MinutesMailButton from "./MinutesMailButton";

export default function MinutesEditor({ eventId, initialMinutes }: { eventId: string; initialMinutes: string }) {
  const [minutes, setMinutes] = useState(initialMinutes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const toastId = toast.loading("Saving minutes...");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/minutes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes }),
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
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          Meeting Minutes
        </h2>
        <div className="flex gap-2">
          <MinutesMailButton eventId={eventId} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            Save Minutes
          </button>
        </div>
      </div>
      <div className="p-6">
        <textarea
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Write the meeting minutes here... (Markdown is supported)"
          className="w-full h-48 border-gray-200 bg-gray-50/50 rounded-xl focus:border-purple-500 focus:ring-purple-500 p-4 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          These minutes will be visible to all members on the public event page.
        </p>
      </div>
    </div>
  );
}
