"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Calendar, Image as ImageIcon, Pencil, X } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  imageUrl?: string | null;
}

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("upcoming");

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "")
      );
    }
  };

  const handleEditClick = (event: Event) => {
    setEditingId(event.id);
    setTitle(event.title || "");
    setSlug(event.slug || "");
    setDescription(event.description || "");
    setLocation(event.location || "");
    
    // datetime-local input requires YYYY-MM-DDTHH:MM format
    const sDate = event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "";
    setStartDate(sDate);
    
    const eDate = event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "";
    setEndDate(eDate);
    
    setImageUrl(event.imageUrl || "");
    setStatus(event.status || "upcoming");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setImageUrl("");
    setStatus("upcoming");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = "/api/admin/events";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title,
          slug,
          description,
          location,
          startDate,
          endDate: endDate || null,
          imageUrl: imageUrl || null,
          status,
        }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      handleCancelEdit();
      fetchEvents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      fetchEvents();
    } catch (err: any) {
      alert("Error deleting event: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and coordinate your upcoming/completed club events</p>
        </div>
        <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>{events.length} Created</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-pink-700 font-semibold border-b pb-2">
            <Plus className="h-5 w-5" />
            <span>{editingId ? "Edit Event" : "Create Event"}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g. Winter Clothing Drive"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                placeholder="winter-clothing-drive"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g. City Public Shelter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Paste an Image URL..."
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Or upload:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Describe your event details..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 rounded text-sm transition disabled:bg-pink-400 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? "Processing..." : editingId ? "Update Event" : "Save Event"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded text-sm border border-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Created Events List</h3>

          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No events found in the database. Use the form to create events.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-16 bg-pink-100 rounded overflow-hidden flex items-center justify-center text-pink-700 font-bold relative">
                            {event.imageUrl ? (
                              <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{event.title}</div>
                            <span className="px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full bg-pink-50 text-pink-800 uppercase mt-1">
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.location || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEditClick(event)}
                          className="text-pink-600 hover:text-pink-955 cursor-pointer"
                          title="Edit Event"
                        >
                          <Pencil className="h-5 w-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
