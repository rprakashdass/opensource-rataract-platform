"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Repeat } from "lucide-react";

interface Initiative {
  id: string;
  title: string;
}

export default function NewEventsPage() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section") === "initiative" ? "initiative" : "event";

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
      .then((data) => setInitiatives(Array.isArray(data) ? data : []))
      .catch(() => setInitiatives([]));
  }, []);

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
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: initiativeTitle,
          slug: initiativeSlug,
          description: initiativeDescription,
          imageUrl: initiativeImageUrl || null,
          frequency: initiativeFrequency,
          status: initiativeStatus,
          startDate: initiativeStartDate,
          endDate: initiativeEndDate || null,
        }),
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          location,
          startDate,
          endDate: endDate || null,
          imageUrl: imageUrl || null,
          status,
          initiativeId: initiativeId || null,
        }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setTitle("");
      setSlug("");
      setDescription("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setImageUrl("");
      setStatus("upcoming");
      setInitiativeId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-pink-700">Create</span>
          <h1 className="text-3xl font-bold text-gray-900">Add a new {section}</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            The form is separated from the overview so you can create without crowding the list view.
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-pink-700 font-semibold border-b pb-2">
            <Repeat className="h-5 w-5" />
            <span>Create Initiative</span>
          </div>

          <form onSubmit={submitInitiative} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initiative Title *</label>
              <input value={initiativeTitle} onChange={(e) => handleInitiativeTitleChange(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Weekly Community Clean-Up" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input value={initiativeSlug} onChange={(e) => setInitiativeSlug(e.target.value)} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="weekly-community-clean-up" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
              <select value={initiativeFrequency} onChange={(e) => setInitiativeFrequency(e.target.value)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white">
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
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

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-pink-700 font-semibold border-b pb-2">
            <Calendar className="h-5 w-5" />
            <span>Create Event Instance</span>
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
      </div>
    </div>
  );
}
