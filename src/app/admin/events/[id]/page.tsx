import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { Users, Calendar, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AttendanceToggle from "./_components/AttendanceToggle";
import ManualAttendance from "./_components/ManualAttendance";
import InviteMailButton from "./_components/InviteMailButton";
import EventEditForm from "./_components/EventEditForm";

export default async function EventDashboardPage(
  props: { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | undefined }> }
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "details";
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "CLUB_ADMIN")) {
    redirect("/auth/login");
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      initiative: true,
      attendees: {
        include: {
          member: {
            include: { user: true }
          }
        },
        orderBy: { registeredAt: "desc" }
      }
    }
  });

  if (!event) notFound();

  const attendedCount = event.attendees.filter(a => a.attendedAt).length;

  const allMembers = await prisma.member.findMany({
    orderBy: { name: "asc" }
  });

  const registeredMemberIds = new Set(event.attendees.map(a => a.memberId));
  const availableMembers = allMembers
    .filter(m => !registeredMemberIds.has(m.id))
    .map(m => ({ id: m.id, name: m.name }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 p-6 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{event.title}</h1>
          {event.initiative && <p className="text-gray-500 text-sm mt-1">{event.initiative.title}</p>}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
              {new Date(event.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
              <MapPin className="h-4 w-4 text-purple-600" />
              {event.location || "No Location"}
            </div>
          </div>
        </div>
        
          <div className="flex gap-4">
            {/* Stats */}
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200">
          <Link
            href={`/admin/events/${event.id}?tab=details`}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "details" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Event Details
          </Link>
          <Link
            href={`/admin/events/${event.id}?tab=attendees`}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "attendees" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Attendees
            <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{event.attendees.length}</span>
          </Link>
        </div>

        {/* TAB CONTENTS */}
        <div className="mt-6">
          {activeTab === "details" && (
            <EventEditForm eventId={event.id} initialData={event} />
          )}

          {activeTab === "attendees" && (
            <div className="space-y-6">
              <div className="flex justify-end gap-4">
                <InviteMailButton eventId={event.id} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    Attendees & Manual Marking
                  </h2>
                  <ManualAttendance eventId={event.id} availableMembers={availableMembers} />
                </div>
        
        {event.attendees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No members have registered for this event yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered On</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {event.attendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{attendee.member.name}</div>
                    <div className="text-xs text-gray-500">{attendee.member.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(attendee.registeredAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <AttendanceToggle 
                      attendeeId={attendee.id} 
                      eventId={event.id}
                      isAttended={!!attendee.attendedAt} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )}
</div>
    </div>
  );
}
