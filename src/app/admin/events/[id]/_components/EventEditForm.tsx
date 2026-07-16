"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { MediaUpload } from "@/components/ui/media-upload";
import { Label } from "@/components/ui/label";

interface Initiative {
  id: string;
  title: string;
}

export default function EventEditForm({ eventId, initialData, onSuccess }: { eventId: string; initialData: any; onSuccess?: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [startDate, setStartDate] = useState(initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "");
  const [endDate, setEndDate] = useState(initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : "");
  const [bannerMediaId, setBannerMediaId] = useState(initialData.bannerMediaId || "");
  const [posterMediaId, setPosterMediaId] = useState(initialData.posterMediaId || "");
  const [status, setStatus] = useState(initialData.status || "upcoming");
  const [publishStatus, setPublishStatus] = useState(initialData.publishStatus || "DRAFT");
  const [projectId, setProjectId] = useState(initialData.projectId || "");
  const [visibility, setVisibility] = useState(initialData.visibility || "PUBLIC");
  const [registrationEnabled, setRegistrationEnabled] = useState(initialData.registrationEnabled || false);
  const [isFeatured, setIsFeatured] = useState(initialData.isFeatured || false);



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
        bannerMediaId: bannerMediaId || null,
        posterMediaId: posterMediaId || null,
        status,
        projectId: projectId || null,
        visibility,
        registrationEnabled,
        isFeatured,
        publishStatus,
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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-900/5 p-6 md:p-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm mb-6">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-6 text-brand font-semibold border-b pb-2">
        <Calendar className="h-5 w-5" />
        <span>Edit Event Details</span>
      </div>

      <form onSubmit={submitEvent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Event Title *</label>
          <input value={title} onChange={(e) => handleEventTitleChange(e.target.value)} required className="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Tree Planting Day" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="tree-planting-day" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date/Time *</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date/Time</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="City Park / Zoom Link" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white">
            <option value="DRAFT">Draft</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Publish Status</label>
          <select value={publishStatus} onChange={(e) => setPublishStatus(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white">
            <option value="DRAFT">Draft (Hidden)</option>
            <option value="PUBLISHED">Published (Visible)</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Describe the event..." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white">
              <option value="PUBLIC">Public</option>
              <option value="INTERNAL">Internal</option>
              <option value="MEMBERS_ONLY">Members Only</option>
              <option value="BOARD_ONLY">Board Only</option>
            </select>
          </div>
          
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="registrationEnabled" checked={registrationEnabled} onChange={(e) => setRegistrationEnabled(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-brand" />
              <label htmlFor="registrationEnabled" className="text-sm font-medium text-slate-700 cursor-pointer">Enable Public Registration</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-brand" />
              <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 cursor-pointer">Feature on Homepage</label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-1">Banner Image</Label>
            <p className="text-xs text-slate-500 mb-2">Wide hero image on the event page and cards.</p>
            <MediaUpload value={bannerMediaId} onChange={setBannerMediaId} type="IMAGE" usage="BANNER" accept="image/*" />
          </div>
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-1">Poster Image</Label>
            <p className="text-xs text-slate-500 mb-2">Portrait flyer shown in the sidebar.</p>
            <MediaUpload value={posterMediaId} onChange={setPosterMediaId} type="IMAGE" usage="POSTER" accept="image/*" />
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-lg bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep transition">
            {submitting ? "Saving..." : "Save Event Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
