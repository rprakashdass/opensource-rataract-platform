"use client";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import React, { useState, useEffect } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
}

export default function NewGalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  useLoadingToast(loading, "Loading gallery details...");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("random");
  const [imageUrl, setImageUrl] = useState("");
  const [eventId, setEventId] = useState("");

  useEffect(() => {
    // Fetch Events for dropdown
    fetch("/api/admin/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(() => {});

    // If edit mode, fetch the item
    if (editId) {
      fetch("/api/admin/gallery")
        .then(res => res.json())
        .then(data => {
          const item = data.find((d: any) => d.id === editId);
          if (item) {
            setTitle(item.title || "");
            setDescription(item.description || "");
            setCategory(item.category || "random");
            setImageUrl(item.imageUrl || "");
            setEventId(item.eventId || "");
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving...");
    setSubmitting(true);
    setError("");

    if (!imageUrl) {
      setError("Please paste an image URL or upload an image file");
      setSubmitting(false);
      toast.dismiss(loadingToast);
      return;
    }

    try {
      const url = "/api/admin/gallery";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          title,
          description,
          category,
          imageUrl,
          eventId: category === "event" ? eventId || null : null,
        }),
      });

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      toast.success(editId ? "Image updated!" : "Image added!", { id: loadingToast });
      router.push("/admin/gallery");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
      toast.dismiss(loadingToast);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700">Create</span>
          <h1 className="text-3xl font-bold text-gray-900">{editId ? "Edit Image" : "Add a new image"}</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Upload and organize photos from events, projects, and activities.
          </p>
        </div>
        <Link href="/admin/gallery" className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Back to overview
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-purple-700 font-semibold border-b pb-2">
          <ImageIcon className="h-5 w-5" />
          <span>{editId ? "Edit Image Details" : "Upload Gallery Image"}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
            </div>

            <div className="space-y-4">
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
                          reader.onloadend = () => setImageUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {imageUrl && (
                <div className="mt-2 relative aspect-video w-full rounded-md border overflow-hidden bg-gray-50">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded text-sm transition disabled:bg-purple-400 cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? "Processing..." : editId ? "Update Photo" : "Upload Photo"}
          </button>
        </form>
      </section>
    </div>
  );
}
