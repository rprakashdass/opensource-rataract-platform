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
  const [type, setType] = useState<AnnouncementType | "CUSTOM">(() => {
    if (initialData?.emailBody?.includes("<!-- CUSTOM_EMAIL -->")) {
      return "CUSTOM";
    }
    return initialData?.type || "GENERAL";
  });
  const [visibility, setVisibility] = useState<string>(initialData?.visibility || "INTERNAL");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [meetingLink, setMeetingLink] = useState(initialData?.meetingLink || "");

  // Content State
  const [emailSubject, setEmailSubject] = useState(initialData?.emailSubject || "");
  const [emailBody, setEmailBody] = useState(() => {
    const bodyVal = initialData?.emailBody || "";
    if (bodyVal.includes("<!-- CUSTOM_EMAIL -->")) {
      return bodyVal.replace("<!-- CUSTOM_EMAIL -->", "").trim();
    }
    const parts = bodyVal.split("<!-- NOTES_START -->");
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return bodyVal;
  });
  const [agendaContent, setAgendaContent] = useState(initialData?.agendaContent || "");
  const [minutesContent, setMinutesContent] = useState(initialData?.minutesContent || "");

  // File State
  const [agendaUrl, setAgendaUrl] = useState(initialData?.agendaUrl || "");
  const [minutesUrl, setMinutesUrl] = useState(initialData?.minutesUrl || "");

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
    if (type === "CUSTOM") return;
    setLoadingTemplate(true);
    try {
      const template = await generateTemplate({
        type: type as AnnouncementType,
        title: title || undefined,
        date: startDate || undefined,
        location: location || undefined,
        link: meetingLink || undefined
      });
      setEmailSubject(template.emailSubject);
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
    if (!initialData && type && type !== "CUSTOM" && !emailSubject && !emailBody) {
      const fetchTemplate = async () => {
        const template = await generateTemplate({
          type: type as AnnouncementType,
          title: title || undefined,
          date: startDate || undefined,
          location: location || undefined,
          link: meetingLink || undefined
        });
        setEmailSubject(template.emailSubject);
        setEmailBody("");
        setAgendaContent(template.agendaContent);
      };
      fetchTemplate();
    }
  }, [type, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let compiledBody = emailBody;
    const dbType = type === "CUSTOM" ? "GENERAL" : type;

    if (type === "CUSTOM") {
      compiledBody = `${emailBody.trim()}\n\n<!-- CUSTOM_EMAIL -->`;
    } else {
      try {
        const template = await generateTemplate({
          type: type as AnnouncementType,
          title: title || undefined,
          date: startDate || undefined,
          location: location || undefined,
          link: meetingLink || undefined
        });
        compiledBody = template.emailBody;
        if (emailBody.trim()) {
          compiledBody += `\n\nAdditional Notes:\n${emailBody.trim()}`;
        }
        compiledBody += `\n\n<!-- NOTES_START -->\n${emailBody.trim()}`;
      } catch (err) {
        console.error("Failed to generate template plain text:", err);
      }
    }

    const data = {
      title,
      description,
      startDate: startDate || undefined,
      location,
      meetingLink,
      type: dbType,
      emailSubject,
      emailBody: compiledBody,
      agendaContent,
      agendaUrl,
      minutesContent,
      minutesUrl,
      visibility,
      specificRecipientIds: selectedRecipientIds,
      clubId,
      status: initialData?.status || ("DRAFT" as any)
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

  const getPreviewHtml = () => {
    const primaryColor = "#D41367";
    const clubName = "Rotaract Club of Coimbatore Nexus";
    
    if (type === "CUSTOM") {
      return `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF8F5; color: #1F2937; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.02); padding: 24px;">
    <h3 style="margin-top: 0; margin-bottom: 16px; color: #1F2937; font-size: 18px; font-weight: 800;">${title || "Notice Board Update"}</h3>
    <div style="font-size: 14px; color: #374151; line-height: 1.6;">
      ${emailBody || "<p>Here is a notice regarding our latest update.</p>"}
    </div>
  </div>
</body>
</html>
      `;
    }

    const formattedDate = startDate
      ? new Date(startDate).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) + " (IST)"
      : null;

    let headerTitle = "Club Notification";
    if (type === "BOARD_MEETING") headerTitle = "Board Meeting Invitation";
    if (type === "CLUB_MEETING") headerTitle = "Club Meeting Notice";
    if (type === "EVENT_UPDATE") headerTitle = "Event Notice";
    if (type === "FINANCE_NOTICE") headerTitle = "Finance Notice";
    if (type === "IMPORTANT_NOTICE") headerTitle = "Important Club Notice";

    const detailsRows = [
      { label: "Topic/Title", val: title },
      { label: "Date & Time", val: formattedDate },
      { label: "Location", val: location },
      { label: "Online Link", val: meetingLink, isLink: true }
    ].filter(r => r.val);

    const detailsBlock = detailsRows.length > 0
      ? `
      <div style="background-color: #D4136706; border: 1px solid #D4136715; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
          ${detailsRows.map(r => `
            <tr>
              <td valign="top" style="padding: 6px 12px 6px 0; font-size: 13px; font-weight: bold; color: #D41367; width: 110px;">${r.label}:</td>
              <td valign="top" style="padding: 6px 0; font-size: 13px; color: #1F2937; font-weight: 600;">
                ${r.isLink ? `<a href="${r.val}" target="_blank" style="color: #D41367; font-weight: bold; text-decoration: underline;">Join Link</a>` : r.val}
              </td>
            </tr>
          `).join("")}
        </table>
      </div>
      `
      : "";

    const notesBlock = emailBody
      ? `<div style="margin-bottom: 20px;"><p style="font-size: 14px; margin: 0; color: #4B5563; line-height: 1.6; white-space: pre-wrap;">${emailBody}</p></div>`
      : "";

    const ctaButton = meetingLink
      ? `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0 12px 0;">
        <tr>
          <td align="center">
            <a href="${meetingLink}" target="_blank" style="background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 12px 24px; display: inline-block; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">
              Join Meeting
            </a>
          </td>
        </tr>
      </table>
      `
      : "";

    const attachmentsBlock = agendaUrl
      ? `
      <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #F3F4F6;">
        <p style="margin: 0; font-size: 11px; color: #6B7280; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Attachments included:</p>
        <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 12px; color: #4B5563;">
          <li>Agenda PDF (Attached)</li>
        </ul>
      </div>
      `
      : "";

    return `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; color: #1F2937; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
    <tr>
      <td style="background-color: ${primaryColor}; height: 5px;"></td>
    </tr>
    <tr>
      <td align="center" style="padding: 24px; border-bottom: 1px solid #F3F4F6;">
        <div style="height: 48px; width: 48px; border-radius: 50%; background-color: ${primaryColor}10; color: ${primaryColor}; font-size: 20px; font-weight: bold; line-height: 48px; text-align: center; margin: 0 auto 12px auto;">RC</div>
        <h2 style="margin: 0; color: ${primaryColor}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">${headerTitle}</h2>
        <p style="margin: 2px 0 0 0; font-size: 11px; color: #6B7280;">${clubName}</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        ${detailsBlock}
        ${notesBlock}
        ${ctaButton}
        ${attachmentsBlock}
      </td>
    </tr>
    <tr>
      <td align="center" style="background-color: #FAF8F5; padding: 20px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280;">
        <p style="margin: 0 0 6px 0;">You are receiving this email because you are a member of <strong>${clubName}</strong>.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} ${clubName}. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {type === "CUSTOM" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Body (Custom Free-text)</label>
                  <RichTextEditor
                    value={emailBody}
                    onChange={setEmailBody}
                    placeholder="Write the custom email content here..."
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Additional Notes (Optional)</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Add personal notes, customized remarks or additional announcements..."
                    rows={12}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none text-sm font-medium min-h-[300px]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Live Email Preview</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white h-[360px] relative">
                <iframe
                  title="Email Preview"
                  srcDoc={getPreviewHtml()}
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>

          {isMeeting && (
            <>
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
                      label="Agenda"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-700">Meeting Minutes (Optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Record minutes text inline</p>
                    <RichTextEditor
                      value={minutesContent}
                      onChange={setMinutesContent}
                      placeholder="Record the minutes of the meeting here..."
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Or upload a Minutes PDF</p>
                    <DocumentUpload
                      value={minutesUrl}
                      onChange={setMinutesUrl}
                      type="MINUTES"
                      accept=".pdf,.doc,.docx"
                      linkedEntityType="ANNOUNCEMENT"
                      label="Minutes"
                    />
                  </div>
                </div>
              </div>
            </>
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
