import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Video, Users, FileText, Mail, Clock } from "lucide-react";
import AnnouncementActions from "./AnnouncementActions";
import { PageHeader } from "@/components/portal";

export default async function AnnouncementDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    notFound();
  }

  const isMeeting = announcement.type === "BOARD_MEETING" || announcement.type === "CLUB_MEETING";
  const isPast = announcement.startDate ? new Date(announcement.startDate) < new Date() : false;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={announcement.title}
        backHref="/admin/announcements"
        backLabel="Back to Communications"
        actions={
          <>
            {announcement.status === 'DRAFT' && (
              <Link
                href={`/admin/announcements/${announcement.id}/edit`}
                className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Edit
              </Link>
            )}
            <AnnouncementActions id={announcement.id} status={announcement.status} />
          </>
        }
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-brand">
            {announcement.type.replace('_', ' ')}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            announcement.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {announcement.status}
          </span>
        </div>
        {announcement.description && (
          <p className="text-slate-600 mt-2 max-w-3xl whitespace-pre-wrap">{announcement.description}</p>
        )}

        {announcement.status === 'PUBLISHED' && announcement.sentAt && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Sent on {format(new Date(announcement.sentAt), "MMM d, yyyy h:mm a")}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {announcement.recipientsCount} Recipients</span>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {announcement.deliveryStatus}</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Left Column: Details */}
          <div className="space-y-6">
            {isMeeting && (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Event Details</h3>

                {announcement.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-brand mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Date & Time</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(announcement.startDate), "MMMM d, yyyy h:mm a")}
                        {announcement.endDate && ` - ${format(new Date(announcement.endDate), "h:mm a")}`}
                      </p>
                    </div>
                  </div>
                )}

                {announcement.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-brand mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Location</p>
                      <p className="text-sm text-slate-600">{announcement.location}</p>
                    </div>
                  </div>
                )}

                {announcement.meetingLink && (
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-brand mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Online Meeting Link</p>
                      <a href={announcement.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline break-all">
                        {announcement.meetingLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Email Content</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-sm font-medium text-slate-700">
                  Subject: {announcement.emailSubject}
                </div>
                <div className="p-4 bg-white prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                  {announcement.emailBody || "No email content provided."}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Docs */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Documents</h3>
            
            <div className="space-y-4">
              <div className="p-5 border border-slate-200 rounded-xl bg-white">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-brand" /> Agenda
                </h4>
                {announcement.agendaContent ? (
                  <div className="prose prose-sm text-slate-600 whitespace-pre-wrap">
                    {announcement.agendaContent}
                  </div>
                ) : announcement.agendaUrl ? (
                  <a href={announcement.agendaUrl} target="_blank" rel="noreferrer" className="text-sm text-brand underline">
                    View Attached Agenda Document
                  </a>
                ) : (
                  <p className="text-sm text-slate-500 italic">No agenda provided.</p>
                )}
              </div>

              {isMeeting && (
                <div className="p-5 border border-slate-200 rounded-xl bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" /> Minutes
                    </h4>
                    {isPast && announcement.status === 'PUBLISHED' && (
                      <Link href={`/admin/announcements/${announcement.id}/edit`} className="text-sm text-brand hover:underline">
                        {announcement.minutesContent || announcement.minutesUrl ? 'Edit Minutes' : 'Add Minutes'}
                      </Link>
                    )}
                  </div>

                  {announcement.minutesContent ? (
                    <div className="prose prose-sm text-slate-600 whitespace-pre-wrap">
                      {announcement.minutesContent}
                    </div>
                  ) : announcement.minutesUrl ? (
                    <a href={announcement.minutesUrl} target="_blank" rel="noreferrer" className="text-sm text-brand underline">
                      View Attached Minutes Document
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      {isPast ? "Minutes have not been recorded yet." : "Minutes will be recorded after the meeting."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
