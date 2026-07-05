import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, Calendar, MapPin, Video, Users } from "lucide-react";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: { attendees: true }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Bell className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-sm text-gray-500 mt-1">Schedule club meetings, gatherings, and manage attendees.</p>
          </div>
        </div>
        <Link 
          href="/admin/announcements/new"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm"
        >
          New Announcement
        </Link>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {announcements.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">No Announcements Yet</p>
            <p className="mt-1">Create your first announcement to get started.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Location</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type & Attendees</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/announcements/${announcement.id}`} className="block group">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{announcement.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">{announcement.description || "No description"}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                        {format(new Date(announcement.startDate), "MMM d, yyyy h:mm a")}
                      </div>
                      {(announcement.location || announcement.meetingLink) && (
                        <div className="flex items-center text-sm text-gray-500">
                          {announcement.location ? (
                            <><MapPin className="h-4 w-4 mr-2 text-gray-400" /> {announcement.location}</>
                          ) : (
                            <><Video className="h-4 w-4 mr-2 text-gray-400" /> Online Meeting</>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                        {announcement.type}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {announcement._count.attendees}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link 
                        href={`/admin/announcements/${announcement.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <DeleteAnnouncementButton id={announcement.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
