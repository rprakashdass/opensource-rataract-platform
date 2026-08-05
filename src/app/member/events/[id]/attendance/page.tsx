import { getEventAttendance } from "@/features/attendance/queries/getEventAttendance";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { PageHeader } from "@/components/portal";
import AttendanceTracker from "@/app/admin/events/[id]/attendance/_components/AttendanceTracker";

export const dynamic = "force-dynamic";

// Chair/co-chair attendance surface — mirrors the admin attendance page but
// lives under /member so event chairs (regular members) can actually reach it.
export default async function ChairAttendancePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (!(await canManageEvent(session, id))) notFound();

  const { event, members, error } = await getEventAttendance(id);
  if (error || !event) notFound();

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in duration-300">
      <PageHeader
        title={`Attendance: ${event.title}`}
        description="Mark attendance and add attendees for this event."
        backHref={`/member/events/${event.id}/manage`}
        backLabel="Back to Event"
      />
      <AttendanceTracker event={event} members={members || []} activeSession={event.attendanceSessions?.[0]} />
    </div>
  );
}
