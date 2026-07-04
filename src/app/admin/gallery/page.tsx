"use client";
import { toast } from "sonner";
import { useLoadingToast } from "@/hooks/useLoadingToast";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Image as ImageIcon, Pencil, X, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
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
  useLoadingToast(loading, "Loading media...");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const loadingToast = toast.loading("Deleting image...");
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Image deleted successfully", { id: loadingToast });
      fetchData();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-700">Gallery</span>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Upload and organize photos from events, projects, and activities. Use the creation page to add new images.
          </p>
        </div>
        <Link href="/admin/gallery/new" className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition">
          Add Image
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Total Images</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Event Photos</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{items.filter(i => i.category === 'event').length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Other Media</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{items.filter(i => i.category !== 'event').length}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Uploaded Media</h2>
            <p className="text-sm text-gray-500">All photos shown here without the form crowding the page.</p>
          </div>
          <Link href="/admin/gallery/new" className="text-sm font-medium text-purple-700 hover:underline">
            Add new
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">Loading media...</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No gallery images found. Upload photos by clicking "Add Image".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    
                    {item.category === "event" && item.event && (
                      <div className="text-[10px] text-pink-700 font-semibold bg-pink-50 w-fit px-2 py-0.5 rounded-full mt-2 flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        <span>Event: {item.event.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-4">
                    <Link
                      href={`/admin/gallery/new?edit=${item.id}`}
                      className="text-purple-600 hover:text-purple-800 cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      title="Edit Photo Info"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>
                    {(currentUser?.role === "ADMIN" || currentUser?.role === "CLUB_ADMIN") && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer text-xs flex items-center gap-1 font-semibold"
                        title="Delete Photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
