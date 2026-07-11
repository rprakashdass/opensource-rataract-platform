import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Video, Users, FileText, ArrowLeft, Mail, Clock } from "lucide-react";
import AnnouncementActions from "./AnnouncementActions";

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
      <Link 
        href="/admin/announcements" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Communications
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {announcement.type.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                announcement.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {announcement.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{announcement.title}</h1>
            {announcement.description && (
              <p className="text-gray-600 mt-2 max-w-3xl whitespace-pre-wrap">{announcement.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {announcement.status === 'DRAFT' && (
              <Link
                href={`/admin/announcements/${announcement.id}/edit`}
                className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                Edit
              </Link>
            )}
            <AnnouncementActions id={announcement.id} status={announcement.status} />
          </div>
        </div>

        {announcement.status === 'PUBLISHED' && announcement.sentAt && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Sent on {format(new Date(announcement.sentAt), "MMM d, yyyy h:mm a")}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {announcement.recipientsCount} Recipients</span>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {announcement.deliveryStatus}</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Details */}
          <div className="space-y-6">
            {isMeeting && (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Event Details</h3>
                
                {announcement.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(announcement.startDate), "MMMM d, yyyy h:mm a")}
                        {announcement.endDate && ` - ${format(new Date(announcement.endDate), "h:mm a")}`}
                      </p>
                    </div>
                  </div>
                )}

                {announcement.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{announcement.location}</p>
                    </div>
                  </div>
                )}

                {announcement.meetingLink && (
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Online Meeting Link</p>
                      <a href={announcement.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                        {announcement.meetingLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Email Content</h3>
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
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Documents</h3>
            
            <div className="space-y-4">
              <div className="p-5 border border-slate-200 rounded-xl bg-white">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-600" /> Agenda
                </h4>
                {announcement.agendaContent ? (
                  <div className="prose prose-sm text-slate-600 whitespace-pre-wrap">
                    {announcement.agendaContent}
                  </div>
                ) : announcement.agendaUrl ? (
                  <a href={announcement.agendaUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 underline">
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
                      <Link href={`/admin/announcements/${announcement.id}/edit`} className="text-sm text-indigo-600 hover:underline">
                        {announcement.minutesContent || announcement.minutesUrl ? 'Edit Minutes' : 'Add Minutes'}
                      </Link>
                    )}
                  </div>

                  {announcement.minutesContent ? (
                    <div className="prose prose-sm text-slate-600 whitespace-pre-wrap">
                      {announcement.minutesContent}
                    </div>
                  ) : announcement.minutesUrl ? (
                    <a href={announcement.minutesUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 underline">
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
