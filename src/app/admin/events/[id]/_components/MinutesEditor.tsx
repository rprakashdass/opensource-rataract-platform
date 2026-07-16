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
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/5 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" />
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
          className="w-full h-48 border-slate-200 bg-slate-50/50 rounded-xl focus:border-brand focus:ring-brand p-4 font-mono text-sm"
        />
        <p className="text-xs text-slate-500 mt-2">
          These minutes will be visible to all members on the public event page.
        </p>
      </div>
    </div>
  );
}
