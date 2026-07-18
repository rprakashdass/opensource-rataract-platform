"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Star, Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PortalEmptyState } from "@/components/portal";
import { createProjectUpdate, updateProjectUpdate, deleteProjectUpdate } from "@/features/projects/actions/projectUpdates";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AttachmentsField } from "@/components/initiatives/AttachmentsField";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then(mod => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-40 bg-slate-50 animate-pulse rounded-md" /> }
);

interface ProjectUpdatesClientProps {
  projectId: string;
  initialUpdates: any[];
}

export default function ProjectUpdatesClient({ projectId, initialUpdates }: ProjectUpdatesClientProps) {
  const [updates, setUpdates] = useState<any[]>(initialUpdates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState("");
  const [volunteerHours, setVolunteerHours] = useState("");
  const [impactNote, setImpactNote] = useState("");
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [deleteMedia, setDeleteMedia] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

  const handleStatusChange = (newStatus: "idle" | "uploading" | "done" | "error") => {
    if (newStatus === "uploading") {
      setActiveUploads(prev => prev + 1);
    } else if (newStatus === "done" || newStatus === "error" || newStatus === "idle") {
      setActiveUploads(prev => Math.max(0, prev - 1));
    }
  };

  // Members picker state
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/members")
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error("Failed to load members", err));
  }, []);

  const openAddDialog = () => {
    setEditingUpdate(null);
    setDate(new Date().toISOString().split("T")[0]);
    setTitle("");
    setBody("");
    setIsFeatured(false);
    setIsPublished(true);
    setBeneficiaries("");
    setVolunteerHours("");
    setImpactNote("");
    setMediaIds([]);
    setMediaUrls([]);
    setParticipantIds([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (update: any) => {
    setEditingUpdate(update);
    setDate(new Date(update.date).toISOString().split("T")[0]);
    setTitle(update.title);
    setBody(update.body || "");
    setIsFeatured(update.isFeatured);
    setIsPublished(update.isPublished);
    setBeneficiaries(update.beneficiaries?.toString() || "");
    setVolunteerHours(update.volunteerHours?.toString() || "");
    setImpactNote(update.impactNote || "");
    setMediaIds(update.media?.map((m: any) => m.id) || []);
    setMediaUrls(update.media?.map((m: any) => m.url) || []);
    setParticipantIds(update.participants?.map((p: any) => p.memberId) || []);
    setIsDialogOpen(true);
  };

  const confirmDelete = (update: any) => {
    setEditingUpdate(update);
    setDeleteMedia(false); // Default to unlink
    setIsDeleteDialogOpen(true);
  };

  const handleMediaUpload = (media: any) => {
    setMediaIds(prev => [...prev, media.id]);
    setMediaUrls(prev => [...prev, media.url]);
  };

  const removeMedia = (index: number) => {
    setMediaIds(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const toggleParticipant = (memberId: string) => {
    setParticipantIds(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUploads > 0) return;
    setIsSubmitting(true);
    
    const formData = {
      projectId,
      date: new Date(date).toISOString(),
      title,
      body: body || null,
      isFeatured,
      isPublished,
      beneficiaries: beneficiaries ? parseInt(beneficiaries, 10) : null,
      volunteerHours: volunteerHours ? parseFloat(volunteerHours) : null,
      impactNote: impactNote || null,
      mediaIds,
      participantIds
    };

    let result;
    if (editingUpdate) {
      result = await updateProjectUpdate(editingUpdate.id, formData);
    } else {
      result = await createProjectUpdate(formData);
    }

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(editingUpdate ? "Update saved" : "Update added");
      setIsDialogOpen(false);
      // In a real app we'd trigger a router.refresh() here, but the server action already does revalidatePath
      // So the page will reload with new data
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!editingUpdate) return;
    setIsSubmitting(true);
    
    const result = await deleteProjectUpdate(editingUpdate.id, deleteMedia);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Update deleted");
      setIsDeleteDialogOpen(false);
      setEditingUpdate(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Project Updates</h2>
          <p className="text-sm text-slate-500 mt-0.5">Chronicle the day-to-day progress and impact of this initiative.</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-brand hover:bg-brand-deep text-white">
          <Plus className="w-4 h-4" /> Add Update
        </Button>
      </div>

      {updates.length === 0 ? (
        <PortalEmptyState
          title="No updates yet"
          detail="Add the first project update to start building the timeline."
        />
      ) : (
        <div className="space-y-1 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {updates.map(update => (
            <div key={update.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex-none">
                <Calendar className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 truncate">{update.title}</span>
                  {update.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                  {!update.isPublished && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0">
                      Draft
                    </span>
                  )}
                </div>
                <span className="text-sm text-slate-500">
                  {format(new Date(update.date), "MMM d, yyyy")}
                  {update.impactNote && ` · ${update.impactNote}`}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(update)} className="text-slate-400 hover:text-brand h-8 w-8">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => confirmDelete(update)} className="text-slate-400 hover:text-red-500 h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingUpdate ? "Edit Project Update" : "Add Project Update"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder="E.g., Day 1: Ground Breaking"
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Body</Label>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Describe the update..."
                />
              </div>
            </div>

              <div className="space-y-3">
                <Label>Photos &amp; Media</Label>
                <AttachmentsField
                  value={mediaIds}
                  onChange={setMediaIds}
                  context={{ kind: "project", projectId, title: "Update" }}
                  returnType="id"
                  onStatusChange={handleStatusChange}
                />
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beneficiaries">Beneficiaries Count</Label>
                <Input 
                  id="beneficiaries" 
                  type="number" 
                  value={beneficiaries} 
                  onChange={(e) => setBeneficiaries(e.target.value)} 
                  placeholder="0"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volunteerHours">Volunteer Hours</Label>
                <Input 
                  id="volunteerHours" 
                  type="number" 
                  step="0.5"
                  value={volunteerHours} 
                  onChange={(e) => setVolunteerHours(e.target.value)} 
                  placeholder="0"
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impactNote">Impact Note</Label>
              <Input 
                id="impactNote" 
                value={impactNote} 
                onChange={(e) => setImpactNote(e.target.value)} 
                placeholder="E.g., Planted 500 saplings today"
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-3">
              <Label>Participants</Label>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <Input 
                  type="text" 
                  placeholder="Search members..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-3 bg-white"
                />
                <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                  {filteredMembers.map(member => (
                    <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg cursor-pointer">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <input
                          type="checkbox"
                          checked={participantIds.includes(member.id)}
                          onChange={() => toggleParticipant(member.id)}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-brand checked:border-brand transition-colors"
                        />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.avatar ? (
                          <Image src={member.avatar} alt="" width={24} height={24} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200" />
                        )}
                        <span className="text-sm font-medium text-slate-700">{member.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-semibold">Publish immediately</span>
                  <span className="text-xs font-normal text-slate-500">Visible on the public website</span>
                </Label>
                <Switch 
                  id="isPublished" 
                  checked={isPublished} 
                  onCheckedChange={setIsPublished} 
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-semibold">Feature on homepage</span>
                  <span className="text-xs font-normal text-slate-500">Highlights this update</span>
                </Label>
                <Switch 
                  id="isFeatured" 
                  checked={isFeatured} 
                  onCheckedChange={setIsFeatured} 
                  className="data-[state=checked]:bg-yellow-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || activeUploads > 0} className="bg-brand hover:bg-brand-deep text-white px-8">
                {activeUploads > 0 ? "Uploading..." : isSubmitting ? "Saving..." : "Save Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Delete Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{editingUpdate?.title}</span>? This action cannot be undone.
            </p>
            
            {editingUpdate?.media?.length > 0 && (
              <div className="bg-red-50 text-red-900 p-4 rounded-xl border border-red-100 flex gap-3 items-start">
                <div className="mt-0.5">
                  <input 
                    type="checkbox" 
                    id="deleteMedia" 
                    checked={deleteMedia}
                    onChange={(e) => setDeleteMedia(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                </div>
                <label htmlFor="deleteMedia" className="text-sm cursor-pointer">
                  <span className="font-semibold block mb-0.5">Delete attached media permanently</span>
                  If unchecked, the photos will be unlinked from this update but will remain in the public gallery.
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
