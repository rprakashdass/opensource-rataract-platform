"use client";
import { toast } from "sonner";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, Repeat, Loader2 } from "lucide-react";

export default function NewEventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("upcoming");
  
  // By default, ONCE means just a standalone event.
  const [frequency, setFrequency] = useState("ONCE");

  useEffect(() => {
    if (editId) {
      fetch("/api/admin/events")
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          const ev = list.find((e: any) => e.id === editId);
          if (ev) {
            setTitle(ev.title || "");
            setSlug(ev.slug || "");
            setDescription(ev.description || "");
            setLocation(ev.location || "");
            setStartDate(ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 16) : "");
            setEndDate(ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : "");
            setImageUrl(ev.imageUrl || "");
            setStatus(ev.status || "upcoming");
            // If editing an existing event, frequency is hidden as we don't convert to initiative here.
          }
        });
    }
  }, [editId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
    );
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving event...");
    setSubmitting(true);
    setError("");

    try {
      const method = editId ? "PUT" : "POST";
      const payload = {
        title,
        slug,
        description,
        location,
        startDate,
        endDate: endDate || null,
        imageUrl: imageUrl || null,
        status,
        frequency: frequency, // Will create an Initiative if not "ONCE"
        ...(editId && { id: editId }),
      };

      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      toast.success(frequency !== "ONCE" ? "Recurring event series saved!" : "Event saved!", { id: loadingToast });
      router.push(`/admin/events/${result.id}?tab=attendees`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-pink-700">{isEditing ? "Edit" : "Create"}</span>
          <h1 className="text-3xl font-bold text-gray-900">{isEditing ? `Edit Event` : `Add a new Event`}</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            {isEditing ? `Update the details of this event.` : `Fill out the form below to create a new event. You can also make this a recurring event series.`}
          </p>
        </div>
        <Link href="/admin/events" className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Back to overview
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-pink-700 font-semibold border-b pb-2">
          <Calendar className="h-5 w-5" />
          <span>Event Details</span>
        </div>

        <form onSubmit={submitEvent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input value={title} onChange={(e) => handleTitleChange(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Winter Clothing Drive" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="winter-clothing-drive" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="City Public Shelter" />
            </div>
            
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repeats? (Frequency)</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="ONCE">Does not repeat (Once)</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
                {frequency !== "ONCE" && (
                  <p className="text-xs text-pink-600 mt-1 flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    This will create a recurring Event Series
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Paste an image URL or upload below" />
              <input type="file" accept="image/*" className="mt-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-pink-50 file:text-pink-700" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setImageUrl(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-md bg-pink-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-pink-700 transition disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin"/> Saving...</> : "Save Event"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
