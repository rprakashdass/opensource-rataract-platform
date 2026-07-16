"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnnouncementType } from "@prisma/client";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DocumentUpload } from "@/components/ui/document-upload";
import { generateTemplate } from "@/features/communication/actions/generateTemplate";
import { Button } from "@/components/ui/button";

interface AnnouncementFormProps {
  initialData?: any;
  clubId: string;
}

export default function AnnouncementForm({ initialData, clubId }: AnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<AnnouncementType>(initialData?.type || "GENERAL");
  const [visibility, setVisibility] = useState<string>(initialData?.visibility || "PUBLIC");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [meetingLink, setMeetingLink] = useState(initialData?.meetingLink || "");

  // Content State
  const [emailSubject, setEmailSubject] = useState(initialData?.emailSubject || "");
  const [emailBody, setEmailBody] = useState(initialData?.emailBody || "");
  const [agendaContent, setAgendaContent] = useState(initialData?.agendaContent || "");

  // File State
  const [agendaUrl, setAgendaUrl] = useState(initialData?.agendaUrl || "");

  // Recipients State
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(initialData?.specificRecipientIds || []);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/admin/members");
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (err) {
        console.error("Failed to load members:", err);
      }
    };
    fetchMembers();
  }, []);

  const handleAutoFill = async () => {
    setLoadingTemplate(true);
    try {
      const template = await generateTemplate({
        type,
        title: title || undefined,
        date: startDate || undefined,
        location: location || undefined,
        link: meetingLink || undefined
      });
      setEmailSubject(template.emailSubject);
      setEmailBody(template.emailBody);
      setAgendaContent(template.agendaContent);
      toast.success("Template outlines filled from form details!");
    } catch (err) {
      toast.error("Failed to generate templates");
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Auto-generate template when key fields change (only if not editing an existing one and email is empty)
  useEffect(() => {
    if (!initialData && type && !emailSubject && !emailBody) {
      const fetchTemplate = async () => {
        const template = await generateTemplate({
          type,
          title: title || undefined,
          date: startDate || undefined,
          location: location || undefined,
          link: meetingLink || undefined
        });
        setEmailSubject(template.emailSubject);
        setEmailBody(template.emailBody);
        setAgendaContent(template.agendaContent);
      };
      fetchTemplate();
    }
  }, [type, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = {
      title,
      description,
      startDate: startDate || undefined,
      location,
      meetingLink,
      type,
      emailSubject,
      emailBody,
      agendaContent,
      agendaUrl,
      visibility,
      specificRecipientIds: selectedRecipientIds,
      clubId,
      status: "DRAFT" as any
    };

    try {
      const url = initialData
        ? `/api/admin/announcements/${initialData.id}`
        : "/api/admin/announcements";

      const res = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to save announcement");
      }

      const result = await res.json();
      toast.success(initialData ? "Communication updated" : "Communication drafted");

      // If it's a new draft, redirect to its detail page to publish/send
      if (!initialData && result.id) {
        router.push(`/admin/announcements/${result.id}`);
      } else {
        router.push("/admin/announcements");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const isMeeting = ["BOARD_MEETING", "CLUB_MEETING"].includes(type);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-200 pb-2">Basic Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AnnouncementType)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
            >
              <option value="GENERAL">General Update</option>
              <option value="BOARD_MEETING">Board Meeting</option>
              <option value="CLUB_MEETING">Club Meeting</option>
              <option value="EVENT_UPDATE">Event Update</option>
              <option value="FINANCE_NOTICE">Finance Notice</option>
              <option value="IMPORTANT_NOTICE">Important Notice</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Visibility / Target Audience</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none bg-white"
            >
              <option value="PUBLIC">Public (Website)</option>
              <option value="INTERNAL">Board & Members (Internal Only)</option>
              <option value="MEMBERS_ONLY">Members Only</option>
              <option value="BOARD_ONLY">Board Only</option>
              <option value="SPECIFIC_MEMBERS">Specific Members Only</option>
            </select>
          </div>

          {visibility === "SPECIFIC_MEMBERS" && (
            <div className="space-y-3 md:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-xl animate-in fade-in duration-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Recipients *</label>
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none bg-white"
              />
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {members
                  .filter(m => 
                    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(m => {
                    const isChecked = selectedRecipientIds.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors text-sm">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedRecipientIds(selectedRecipientIds.filter(id => id !== m.id));
                            } else {
                              setSelectedRecipientIds([...selectedRecipientIds, m.id]);
                            }
                          }}
                          className="rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{m.name}</p>
                          <p className="text-xs text-slate-500">{m.email}</p>
                        </div>
                      </label>
                    );
                  })}
                {members.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No members found.</p>
                )}
              </div>
              <p className="text-xs text-slate-500 font-semibold">{selectedRecipientIds.length} members selected.</p>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Title / Subject</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
              placeholder="e.g., Monthly Board Meeting"
            />
          </div>

          {isMeeting && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date & Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Location (Venue)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
                  placeholder="e.g., Community Center"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Meeting Link (Optional)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
                  placeholder="https://zoom.us/..."
                />
              </div>
            </>
          )}

          {!isMeeting && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Summary (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
                placeholder="Brief summary of the announcement"
              />
            </div>
          )}
        </div>
      </div>

      {/* Generated Content Section */}
      <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2 gap-4">
          <h3 className="text-base font-semibold text-slate-900">Communication Content</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFill}
            disabled={loadingTemplate}
            className="text-xs gap-1 cursor-pointer bg-white text-brand border-brand/20 hover:bg-brand/5 font-semibold"
          >
            {loadingTemplate ? "Generating..." : "✨ Fill Template from Form"}
          </Button>
        </div>
        <p className="text-sm text-slate-500">This content is suggested based on your category selection. Customize it freely, or click the button above to regenerate it using form inputs.</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Body</label>
            <RichTextEditor
              value={emailBody}
              onChange={setEmailBody}
              placeholder="Write the email content here..."
            />
          </div>

          {isMeeting && (
            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-slate-700">Agenda Document</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Build agenda text inline</p>
                  <RichTextEditor
                    value={agendaContent}
                    onChange={setAgendaContent}
                    placeholder="1. Call to order..."
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Or upload an Agenda PDF</p>
                  <DocumentUpload
                    value={agendaUrl}
                    onChange={setAgendaUrl}
                    type="AGENDA"
                    accept=".pdf,.doc,.docx"
                    linkedEntityType="ANNOUNCEMENT"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Save as Draft & Continue")}
        </Button>
      </div>
    </form>
  );
}
