import { getEventAttendance } from "@/features/attendance/queries/getEventAttendance";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import AttendanceTracker from "./_components/AttendanceTracker";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventAttendancePage({ params }: PageProps) {
  const { id } = await params;
  const { event, error } = await getEventAttendance(id);

  if (error || !event) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in duration-300">

      <PageHeader
        title={`Attendance: ${event.title}`}
        description="Mark attendance for registered members"
        backHref={`/admin/events/${event.id}`}
        backLabel="Back to Event Details"
      />

      <AttendanceTracker event={event} activeSession={event.attendanceSessions?.[0]} />

    </div>
  );
}
