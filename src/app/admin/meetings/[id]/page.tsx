import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { Users, Calendar, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import MeetingInviteButton from "./_components/MeetingInviteButton";
import MeetingEditForm from "./_components/MeetingEditForm";
import MeetingAttendanceTable from "./_components/MeetingAttendanceTable";
import MeetingMinutesEditor from "./_components/MeetingMinutesEditor";

export default async function MeetingDashboardPage(
  props: { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | undefined }> }
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "agenda";
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "CLUB_ADMIN")) {
    redirect("/auth/login");
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      attendees: {
        include: {
          member: {
            include: { user: true }
          }
        },
        orderBy: { attendedAt: "desc" }
      }
    }
  });

  if (!meeting) notFound();

  const attendedCount = meeting.attendees.filter(a => a.attendedAt).length;

  const allMembers = await prisma.member.findMany({
    orderBy: { name: "asc" }
  });

  const registeredMemberIds = new Set(meeting.attendees.map(a => a.memberId));
  const availableMembers = allMembers
    .filter(m => !registeredMemberIds.has(m.id))
    .map(m => ({ id: m.id, name: m.name }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/admin/meetings" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Meetings
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{meeting.title}</h1>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
              <Calendar className="h-4 w-4 text-indigo-600" />
              {new Date(meeting.date).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-lg">
              <MapPin className="h-4 w-4 text-indigo-600" />
              {meeting.location || "TBD"}
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
          href={`/admin/meetings/${meeting.id}?tab=agenda`}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === "agenda" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Details & Agenda
        </Link>
        <Link
          href={`/admin/meetings/${meeting.id}?tab=attendees`}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === "attendees" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Attendees
          <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{meeting.attendees.length}</span>
        </Link>
        <Link
          href={`/admin/meetings/${meeting.id}?tab=minutes`}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
            activeTab === "minutes" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Meeting Minutes
        </Link>
      </div>

      {/* TAB CONTENTS */}
      <div className="mt-6">
        {activeTab === "agenda" && (
          <div className="space-y-6">
            <div className="flex justify-end gap-4">
              <MeetingInviteButton meetingId={meeting.id} />
            </div>
            <MeetingEditForm meetingId={meeting.id} initialData={meeting} />
          </div>
        )}

        {activeTab === "attendees" && (
          <MeetingAttendanceTable 
            meetingId={meeting.id} 
            attendees={meeting.attendees} 
            availableMembers={availableMembers} 
          />
        )}

        {activeTab === "minutes" && (
          <MeetingMinutesEditor meetingId={meeting.id} initialMinutes={meeting.minutes || ""} initialMinutesUrl={meeting.minutesUrl || ""} />
        )}
      </div>
    </div>
  );
}
