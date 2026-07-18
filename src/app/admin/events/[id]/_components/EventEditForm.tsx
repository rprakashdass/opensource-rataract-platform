"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, AlignLeft, Video } from "lucide-react";
import { istInputToISOString, isoToISTInputValue } from "@/lib/istDatetime";

export default function EventEditForm({ eventId, initialData, onSuccess }: { eventId: string; initialData: any; onSuccess?: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeUploads, setActiveUploads] = useState(0);

  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [meetingLink, setMeetingLink] = useState(initialData.meetingLink || "");
  const [locationType, setLocationType] = useState<"physical" | "online">(
    initialData.meetingLink ? "online" : "physical"
  );
  const [startDate, setStartDate] = useState(isoToISTInputValue(initialData.startDate));
  const [endDate, setEndDate] = useState(isoToISTInputValue(initialData.endDate));
  const [bannerMediaId, setBannerMediaId] = useState(initialData.bannerMediaId || "");
  const [posterMediaId, setPosterMediaId] = useState(initialData.posterMediaId || "");
  const [status, setStatus] = useState(initialData.status || "UPCOMING");
  const [publishStatus, setPublishStatus] = useState(initialData.publishStatus || "DRAFT");
  const [projectId, setProjectId] = useState(initialData.projectId || "");
  const [visibility, setVisibility] = useState(initialData.visibility || "PUBLIC");
  const [registrationEnabled, setRegistrationEnabled] = useState(initialData.registrationEnabled || false);
  const [isFeatured, setIsFeatured] = useState(initialData.isFeatured || false);
  const [seekingSponsorship, setSeekingSponsorship] = useState(initialData.seekingSponsorship || false);
  const [sponsorshipGoal, setSponsorshipGoal] = useState(initialData.sponsorshipGoal || "");
  const [sponsorshipPitch, setSponsorshipPitch] = useState(initialData.sponsorshipPitch || "");

  const handleStatusChange = (newStatus: "idle" | "uploading" | "done" | "error") => {
    if (newStatus === "uploading") {
      setActiveUploads(prev => prev + 1);
    } else if (newStatus === "done" || newStatus === "error" || newStatus === "idle") {
      setActiveUploads(prev => Math.max(0, prev - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUploads > 0) return;
    if (!title || !slug || !startDate) return setError("Required fields missing");
    setError("");
    setSubmitting(true);
    const loadingToast = toast.loading("Saving event...");

    try {
      const payload = {
        title,
        slug,
        description: description || null,
        location: locationType === "physical" ? (location || null) : null,
        meetingLink: locationType === "online" ? (meetingLink || null) : null,
        startDate: istInputToISOString(startDate),
        endDate: endDate ? istInputToISOString(endDate) : null,
        bannerMediaId: bannerMediaId || null,
        posterMediaId: posterMediaId || null,
        status,
        projectId: projectId || null,
        visibility,
        registrationEnabled,
        isFeatured,
        publishStatus,
        seekingSponsorship,
        sponsorshipGoal: sponsorshipGoal ? parseFloat(sponsorshipGoal) : null,
        sponsorshipPitch: sponsorshipPitch || null,
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
        <h2>Edit Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug URL</label>
            <input required type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1"><AlignLeft className="h-4 w-4 text-slate-400"/> Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none" placeholder="Add event description..." />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
            <MapPin className="h-4 w-4 text-slate-400"/> Location
          </label>
          {/* Location type toggle */}
          <div className="flex rounded-lg border border-slate-300 overflow-hidden mb-2 w-fit text-sm">
            <button
              type="button"
              onClick={() => setLocationType("physical")}
              className={`px-4 py-1.5 font-medium transition-colors ${
                locationType === "physical"
                  ? "bg-brand text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Physical
            </button>
            <button
              type="button"
              onClick={() => setLocationType("online")}
              className={`px-4 py-1.5 font-medium transition-colors flex items-center gap-1.5 ${
                locationType === "online"
                  ? "bg-brand text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Video className="h-3.5 w-3.5" /> Online
            </button>
          </div>
          {locationType === "physical" ? (
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              placeholder="Venue name or address..."
            />
          ) : (
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  placeholder="https://meet.google.com/..."
                />
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Opens a new Google Meet room — copy the link and paste it here"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium whitespace-nowrap transition-colors"
                >
                  <Video className="h-3.5 w-3.5" />
                  New Meet
                </a>
              </div>
              <p className="text-xs text-slate-400">Click "New Meet" → Google creates a room → copy the link → paste above.</p>
            </div>
          )}

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
            <input required type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Time <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white" />
          </div>
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
            <FileUpload 
              value={bannerMediaId} 
              onChange={(val) => setBannerMediaId(val)} 
              type="IMAGE" 
              usage="BANNER" 
              accept="image/*" 
              context={{ kind: "event", eventId, title }} 
              returnType="id"
              onStatusChange={handleStatusChange}
            />
          </div>
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-1">Poster Image</Label>
            <p className="text-xs text-slate-500 mb-2">Portrait flyer shown in the sidebar.</p>
            <FileUpload 
              value={posterMediaId} 
              onChange={(val) => setPosterMediaId(val)} 
              type="IMAGE" 
              usage="POSTER" 
              accept="image/*" 
              context={{ kind: "event", eventId, title }} 
              returnType="id"
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h4 className="font-semibold text-slate-900">Sponsorship</h4>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="seekingSponsorship" checked={seekingSponsorship} onChange={(e) => setSeekingSponsorship(e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-brand" />
            <label htmlFor="seekingSponsorship" className="text-sm font-medium text-slate-700 cursor-pointer">Feature on Sponsor Us page</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">Funding Goal (₹)</Label>
              <input type="number" value={sponsorshipGoal} onChange={(e) => setSponsorshipGoal(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="e.g. 50000" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">Sponsorship Pitch</Label>
              <textarea rows={3} value={sponsorshipPitch} onChange={(e) => setSponsorshipPitch(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none" placeholder="Brief explanation of what the funds will be used for..." />
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={submitting || activeUploads > 0} className="rounded-lg bg-brand px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-deep transition disabled:opacity-50">
            {activeUploads > 0 ? "Uploading..." : submitting ? "Saving..." : "Save Event Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
