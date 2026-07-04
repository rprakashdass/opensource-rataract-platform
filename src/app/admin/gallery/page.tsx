"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Image as ImageIcon, Pencil, X, Link as LinkIcon } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category: string;
  eventId?: string | null;
  event?: { title: string } | null;
}

interface Event {
  id: string;
  title: string;
}

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("random");
  const [imageUrl, setImageUrl] = useState("");
  const [eventId, setEventId] = useState("");

  const fetchData = async () => {
    try {
      // Fetch Gallery Items
      const resGallery = await fetch("/api/admin/gallery");
      const galleryData = await resGallery.json();
      setItems(galleryData);

      // Fetch Events for dropdown
      const resEvents = await fetch("/api/admin/events");
      const eventsData = await resEvents.json();
      setEvents(eventsData);

    } catch (err: any) {
      setError("Failed to fetch gallery records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (item: GalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setCategory(item.category || "random");
    setImageUrl(item.imageUrl || "");
    setEventId(item.eventId || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("random");
    setImageUrl("");
    setEventId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!imageUrl) {
      setError("Please paste an image URL or upload an image file");
      setSubmitting(false);
      return;
    }

    try {
      const url = "/api/admin/gallery";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title,
          description,
          category,
          imageUrl,
          eventId: category === "event" ? eventId || null : null,
        }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      handleCancelEdit();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      fetchData();
    } catch (err: any) {
      alert("Error deleting image: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and organize photos from events, projects, and activities</p>
        </div>
        <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          <span>{items.length} Images</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-6 text-purple-700 font-semibold border-b pb-2">
            <Plus className="h-5 w-5" />
            <span>{editingId ? "Edit Image Details" : "Upload Gallery Image"}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Tree Plantation Drive"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category / Group *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="random">Random / General</option>
                <option value="event">Event Association</option>
                <option value="initiative">Initiative</option>
              </select>
            </div>

            {/* Event Dropdown Association */}
            {category === "event" && (
              <div>
                <label className="block text-sm font-medium text-purple-950 mb-1">Associate Event *</label>
                <select
                  required
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full border border-purple-200 bg-purple-50 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose Event --</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Source</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description of the photo..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded text-sm transition disabled:bg-purple-400 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? "Processing..." : editingId ? "Update Photo" : "Upload Photo"}
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

        {/* Right Column: Gallery Preview Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Media Library</h3>

          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading media...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No gallery images found. Upload photos using the panel on the left.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-card flex flex-col justify-between">
                  <div className="relative aspect-video w-full bg-gray-50 flex items-center justify-center border-b overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider shadow-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-950 text-sm line-clamp-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      
                      {/* Show Event connection */}
                      {item.category === "event" && item.event && (
                        <div className="text-[10px] text-pink-700 font-semibold bg-pink-50 w-fit px-2 py-0.5 rounded-full mt-2 flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          <span>Event: {item.event.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-purple-600 hover:text-purple-800 cursor-pointer text-xs flex items-center gap-1 font-semibold"
                        title="Edit Photo Info"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer text-xs flex items-center gap-1 font-semibold"
                        title="Delete Photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
