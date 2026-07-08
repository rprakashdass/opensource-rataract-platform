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

  // Auto-generate template when key fields change (only if not editing an existing one)
  useEffect(() => {
    if (!initialData && title && type) {
      const fetchTemplate = async () => {
        const template = await generateTemplate({
          type,
          title,
          date: startDate,
          location,
          link: meetingLink
        });
        setEmailSubject(template.emailSubject);
        setEmailBody(template.emailBody);
        setAgendaContent(template.agendaContent);
      };
      fetchTemplate();
    }
  }, [type, title, startDate, location, meetingLink, initialData]);

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
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold border-b pb-2">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AnnouncementType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
            <label className="text-sm font-medium text-gray-700">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="PUBLIC">Public & Members (BOTH)</option>
              <option value="MEMBERS_ONLY">Members Only</option>
              <option value="BOARD_ONLY">Board Only</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Title / Subject</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Monthly Board Meeting"
            />
          </div>

          {isMeeting && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date & Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location (Venue)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Community Center"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Meeting Link (Optional)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="https://zoom.us/..."
                />
              </div>
            </>
          )}

          {!isMeeting && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Summary (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Brief summary of the announcement"
              />
            </div>
          )}
        </div>
      </div>

      {/* Generated Content Section */}
      <div className="space-y-6 bg-purple-50/50 p-6 rounded-xl border border-purple-100">
        <h3 className="text-lg font-semibold border-b border-purple-200 pb-2 text-purple-900">Communication Content</h3>
        <p className="text-sm text-purple-700">This content was auto-generated based on your details. You can edit it before sending.</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Body</label>
            <RichTextEditor
              value={emailBody}
              onChange={setEmailBody}
              placeholder="Write the email content here..."
            />
          </div>

          {isMeeting && (
            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium text-gray-700">Agenda Document</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="flex justify-end gap-4 pt-4">
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
