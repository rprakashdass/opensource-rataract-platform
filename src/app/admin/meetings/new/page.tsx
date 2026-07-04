"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function NewMeetingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [agenda, setAgenda] = useState("");
  const [agendaUrl, setAgendaUrl] = useState("");

  const submitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return setError("Title and Date are required");
    setError("");
    setSubmitting(true);
    const loadingToast = toast.loading("Scheduling meeting...");

    try {
      const payload = {
        title,
        date: new Date(date).toISOString(),
        location: location || null,
        meetingLink: meetingLink || null,
        agenda: agenda || null,
        agendaUrl: agendaUrl || null,
      };

      const res = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast.success("Meeting scheduled!", { id: loadingToast });
      router.push(`/admin/meetings/${result.id}`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700">Schedule</span>
          <h1 className="text-3xl font-bold text-gray-900">New Meeting</h1>
        </div>
        <Link href="/admin/meetings" className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={submitMeeting} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="General Body Meeting #1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (Offline)</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Clubhouse" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (Online)</label>
            <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="https://zoom.us/j/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda Details (Text)</label>
            <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono" placeholder="1. Welcome&#10;2. Treasury Update&#10;3. Upcoming Events" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda Document URL (PDF Link)</label>
            <input type="url" value={agendaUrl} onChange={(e) => setAgendaUrl(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="https://drive.google.com/..." />
            <p className="text-xs text-gray-500 mt-1">If provided, this file will be attached to the meeting invite email.</p>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
              {submitting ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
