"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

interface Initiative {
  id: string;
  title: string;
}

export default function EventEditForm({ eventId, initialData }: { eventId: string; initialData: any }) {
  const router = useRouter();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [startDate, setStartDate] = useState(initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "");
  const [endDate, setEndDate] = useState(initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : "");
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || "");
  const [status, setStatus] = useState(initialData.status || "upcoming");
  const [initiativeId, setInitiativeId] = useState(initialData.initiativeId || "");

  useEffect(() => {
    fetch("/api/admin/initiatives")
      .then((res) => res.json())
      .then((data) => {
        setInitiatives(Array.isArray(data) ? data : []);
      })
      .catch(() => setInitiatives([]));
  }, []);

  const handleEventTitleChange = (val: string) => {
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
    if (!title || !slug || !startDate) return setError("Required fields missing");
    setError("");
    setSubmitting(true);
    const loadingToast = toast.loading("Saving event...");

    try {
      const payload = {
        title,
        slug,
        description: description || null,
        location: location || null,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        imageUrl: imageUrl || null,
        status,
        initiativeId: initiativeId || null,
        id: eventId,
      };

      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast.success("Event details updated!", { id: loadingToast });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 p-6 md:p-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-6 text-purple-700 font-semibold border-b pb-2">
        <Calendar className="h-5 w-5" />
        <span>Edit Event Details</span>
      </div>

      <form onSubmit={submitEvent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
          <input value={title} onChange={(e) => handleEventTitleChange(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Tree Planting Day" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="tree-planting-day" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link to Initiative (Optional)</label>
          <select value={initiativeId} onChange={(e) => setInitiativeId(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
            <option value="">-- Standalone Event --</option>
            {initiatives.map(init => (
              <option key={init.id} value={init.id}>{init.title}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">If this event is part of a recurring initiative, link it here.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time *</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="City Park / Zoom Link" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Describe the event..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="https://..." />
        </div>
        
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition">
            {submitting ? "Saving..." : "Save Event Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
