import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, Calendar, MapPin, Video, Users, FileText, ArrowLeft, Mail } from "lucide-react";

export default async function AnnouncementDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      attendees: {
        include: {
          member: true
        }
      }
    }
  });

  if (!announcement) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link 
        href="/admin/announcements" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Announcements
      </Link>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {announcement.type}
              </span>
              {announcement.sendInvite && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Mail className="h-3 w-3 mr-1" />
                  Invite Sent
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{announcement.title}</h1>
            {announcement.description && (
              <p className="text-gray-600 mt-2 max-w-3xl whitespace-pre-wrap">{announcement.description}</p>
            )}
          </div>
          <Link
            href={`/admin/announcements/${announcement.id}/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition shrink-0"
          >
            Edit Details
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(announcement.startDate), "MMMM d, yyyy h:mm a")}
                  {announcement.endDate && ` - ${format(new Date(announcement.endDate), "h:mm a")}`}
                </p>
              </div>
            </div>

            {announcement.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{announcement.location}</p>
                </div>
              </div>
            )}

            {announcement.meetingLink && (
              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Online Meeting Link</p>
                  <a href={announcement.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                    {announcement.meetingLink}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
            
            <div className="space-y-2">
              {announcement.agendaUrl ? (
                <a 
                  href={announcement.agendaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Agenda Document</p>
                    <p className="text-xs text-gray-500">Click to view PDF</p>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg opacity-60">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">No Agenda Attached</p>
                  </div>
                </div>
              )}

              {announcement.minutesUrl ? (
                <a 
                  href={announcement.minutesUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Meeting Minutes</p>
                    <p className="text-xs text-gray-500">Click to view PDF</p>
                  </div>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg opacity-60">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">No Minutes Attached</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Attendees ({announcement.attendees.length})</h2>
            <p className="text-sm text-gray-500">Members automatically assigned to this announcement.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcement.attendees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No members assigned to this announcement.
                  </td>
                </tr>
              ) : (
                announcement.attendees.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{attendance.member.name || "Unnamed Member"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{attendance.member.email || "No email"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attendance.attendedAt ? format(new Date(attendance.attendedAt), "MMM d, yyyy h:mm a") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
