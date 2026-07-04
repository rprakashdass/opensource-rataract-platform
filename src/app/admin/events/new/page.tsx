"use client";
import { toast } from "sonner";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar, Repeat } from "lucide-react";

interface Initiative {
  id: string;
  title: string;
}

export default function NewEventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const initiativeEditId = searchParams.get("initiativeEdit");
  
  const section = initiativeEditId || searchParams.get("section") === "initiative" ? "initiative" : "event";
  const isEditing = !!editId || !!initiativeEditId;

  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [initiativeTitle, setInitiativeTitle] = useState("");
  const [initiativeSlug, setInitiativeSlug] = useState("");
  const [initiativeDescription, setInitiativeDescription] = useState("");
  const [initiativeImageUrl, setInitiativeImageUrl] = useState("");
  const [initiativeFrequency, setInitiativeFrequency] = useState("WEEKLY");
  const [initiativeStatus, setInitiativeStatus] = useState("active");
  const [initiativeStartDate, setInitiativeStartDate] = useState("");
  const [initiativeEndDate, setInitiativeEndDate] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [initiativeId, setInitiativeId] = useState("");

  useEffect(() => {
    fetch("/api/admin/initiatives")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setInitiatives(list);
        if (initiativeEditId) {
          const init = list.find((i: any) => i.id === initiativeEditId);
          if (init) {
            setInitiativeTitle(init.title || "");
            setInitiativeSlug(init.slug || "");
            setInitiativeDescription(init.description || "");
            setInitiativeImageUrl(init.imageUrl || "");
            setInitiativeFrequency(init.frequency || "WEEKLY");
            setInitiativeStatus(init.status || "active");
            setInitiativeStartDate(init.startDate ? new Date(init.startDate).toISOString().slice(0, 16) : "");
            setInitiativeEndDate(init.endDate ? new Date(init.endDate).toISOString().slice(0, 16) : "");
          }
        }
      })
      .catch(() => setInitiatives([]));

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
            setInitiativeId(ev.initiativeId || "");
          }
        });
    }
  }, [editId, initiativeEditId]);

  const handleInitiativeTitleChange = (val: string) => {
    setInitiativeTitle(val);
    setInitiativeSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
    );
  };

  const handleEventTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
    );
  };

  const submitInitiative = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving initiative...");
    setSubmitting(true);
    setError("");

    try {
      const method = initiativeEditId ? "PUT" : "POST";
      const payload = {
        title: initiativeTitle,
        slug: initiativeSlug,
        description: initiativeDescription,
        imageUrl: initiativeImageUrl || null,
        frequency: initiativeFrequency,
        status: initiativeStatus,
        startDate: initiativeStartDate,
        endDate: initiativeEndDate || null,
        ...(initiativeEditId && { id: initiativeEditId }),
      };

      const res = await fetch("/api/admin/initiatives", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setInitiativeTitle("");
      setInitiativeSlug("");
      setInitiativeDescription("");
      setInitiativeImageUrl("");
      setInitiativeFrequency("WEEKLY");
      setInitiativeStatus("active");
      setInitiativeStartDate("");
      setInitiativeEndDate("");
      toast.success("Initiative saved", { id: loadingToast });
      router.push("/admin/events");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
      toast.dismiss(loadingToast);
    }
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
        initiativeId: initiativeId || null,
        ...(editId && { id: editId }),
      };

      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast.success("Event saved", { id: loadingToast });
      router.push(`/admin/events/${result.id}/attendees`);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-pink-700">{isEditing ? "Edit" : "Create"}</span>
          <h1 className="text-3xl font-bold text-gray-900">{isEditing ? `Edit ${section}` : `Add a new ${section}`}</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            {isEditing ? `Update the details of this ${section}.` : `The form is separated from the overview so you can create without crowding the list view.`}
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

      <div>
        {section === "initiative" ? (
          <section className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-pink-700 font-semibold border-b pb-2">
              <Repeat className="h-5 w-5" />
              <span>{initiativeEditId ? "Edit" : "Create"} Initiative</span>
            </div>

            <form onSubmit={submitInitiative} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initiative Title *</label>
                <input value={initiativeTitle} onChange={(e) => handleInitiativeTitleChange(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Community Garden" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input value={initiativeSlug} onChange={(e) => setInitiativeSlug(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="community-garden" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select value={initiativeFrequency} onChange={(e) => setInitiativeFrequency(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="ONCE">Once</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={initiativeStatus} onChange={(e) => setInitiativeStatus(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input type="datetime-local" value={initiativeStartDate} onChange={(e) => setInitiativeStartDate(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="datetime-local" value={initiativeEndDate} onChange={(e) => setInitiativeEndDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <input value={initiativeImageUrl} onChange={(e) => setInitiativeImageUrl(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Paste an image URL or upload below" />
                <input type="file" accept="image/*" className="mt-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-pink-50 file:text-pink-700" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setInitiativeImageUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={initiativeDescription} onChange={(e) => setInitiativeDescription(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={submitting} className="w-full rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition disabled:opacity-60">
                {submitting ? "Saving..." : "Save Initiative"}
              </button>
            </form>
          </section>
        ) : (

          <section className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-pink-700 font-semibold border-b pb-2">
              <Calendar className="h-5 w-5" />
              <span>{editId ? "Edit" : "Create"} Event Instance</span>
            </div>

            <form onSubmit={submitEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input value={title} onChange={(e) => handleEventTitleChange(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Winter Clothing Drive" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="winter-clothing-drive" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Initiative</label>
                <select value={initiativeId} onChange={(e) => setInitiativeId(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                  <option value="">Standalone event</option>
                  {initiatives.map((initiative) => (
                    <option key={initiative.id} value={initiative.id}>{initiative.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="City Public Shelter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={submitting} className="w-full rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition disabled:opacity-60">
                {submitting ? "Saving..." : "Save Event"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
