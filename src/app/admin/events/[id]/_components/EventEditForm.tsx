"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, AlignLeft, Video, Plus, X } from "lucide-react";
import { istInputToISOString, isoToISTInputValue } from "@/lib/istDatetime";

export default function EventEditForm({ eventId, initialData, members = [], onSuccess }: { eventId: string; initialData: any; members?: { id: string; name: string | null }[]; onSuccess?: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeUploads, setActiveUploads] = useState(0);

  // Team roles (chair / co-chair / volunteers), seeded from the event's members.
  const [team, setTeam] = useState<{ memberId: string; role: string }[]>(
    Array.isArray(initialData.members) ? initialData.members.map((m: any) => ({ memberId: m.memberId, role: m.role })) : []
  );
  const chairId = team.find((t) => t.role === "CHAIR")?.memberId || "";
  const coChairId = team.find((t) => t.role === "CO_CHAIR")?.memberId || "";
  const volunteerIds = team.filter((t) => t.role === "VOLUNTEER").map((t) => t.memberId);
  const setRole = (role: string, memberId: string) =>
    setTeam((prev) => {
      const filtered = prev.filter((t) => t.role !== role);
      return memberId ? [...filtered, { memberId, role }] : filtered;
    });
  const addVolunteer = (memberId: string) =>
    setTeam((prev) => (memberId && !prev.some((t) => t.memberId === memberId && t.role === "VOLUNTEER") ? [...prev, { memberId, role: "VOLUNTEER" }] : prev));
  const removeVolunteer = (memberId: string) =>
    setTeam((prev) => prev.filter((t) => !(t.memberId === memberId && t.role === "VOLUNTEER")));
  const memberName = (id: string) => members.find((m) => m.id === id)?.name || "Member";

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
  const [beneficiaries, setBeneficiaries] = useState(initialData.beneficiaries || "");
  const [volunteerHours, setVolunteerHours] = useState(
    initialData.volunteerHours != null ? String(initialData.volunteerHours) : ""
  );
  const [objectives, setObjectives] = useState<string[]>(
    Array.isArray(initialData.objectives) && initialData.objectives.length ? initialData.objectives : [""]
  );
  const setObjective = (i: number, v: string) => setObjectives((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  const addObjective = () => setObjectives((prev) => [...prev, ""]);
  const removeObjective = (i: number) => setObjectives((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

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
        beneficiaries: beneficiaries || null,
        objectives: objectives.map((o) => o.trim()).filter(Boolean),
        volunteerHours: volunteerHours ? Number(volunteerHours) : null,
        team,
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Beneficiaries</label>
            <textarea rows={2} value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none" placeholder="Who benefited, and how many" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Volunteer hrs / attendee</label>
            <input type="number" min="0" step="1" value={volunteerHours} onChange={(e) => setVolunteerHours(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" placeholder="e.g. 2" />
            <p className="mt-1 text-xs text-slate-400">Awarded to each attendee marked present.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Objectives / Goals</label>
          <div className="space-y-2">
            {objectives.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={o}
                  onChange={(e) => setObjective(i, e.target.value)}
                  className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  placeholder={`Objective ${i + 1}`}
                />
                {objectives.length > 1 && (
                  <button type="button" onClick={() => removeObjective(i)} className="shrink-0 text-slate-400 hover:text-rose-600 p-1" aria-label="Remove objective">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addObjective} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep">
            <Plus className="h-3.5 w-3.5" /> Add objective
          </button>
        </div>

        {/* Team roles */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Team</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-slate-500 mb-1">Chair</span>
              <select value={chairId} onChange={(e) => setRole("CHAIR", e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none">
                <option value="">— None —</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <span className="block text-xs text-slate-500 mb-1">Co-Chair</span>
              <select value={coChairId} onChange={(e) => setRole("CO_CHAIR", e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none">
                <option value="">— None —</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <span className="block text-xs text-slate-500 mb-1">Volunteers</span>
            <select
              value=""
              onChange={(e) => { addVolunteer(e.target.value); e.currentTarget.value = ""; }}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
            >
              <option value="">Add a volunteer…</option>
              {members.filter((m) => !volunteerIds.includes(m.id)).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div className="flex flex-wrap gap-2 pt-2">
              {volunteerIds.map((id) => (
                <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {memberName(id)}
                  <button type="button" onClick={() => removeVolunteer(id)} className="text-slate-400 hover:text-rose-600" aria-label="Remove volunteer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white">
                <option value="DRAFT">Draft</option>
                <option value="PLANNING">Planning</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white">
                <option value="PUBLIC">Public</option>
                <option value="INTERNAL">Internal</option>
                <option value="MEMBERS_ONLY">Members Only</option>
                <option value="BOARD_ONLY">Board Only</option>
              </select>
            </div>
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
