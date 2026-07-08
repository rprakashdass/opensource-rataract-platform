import { getEventAttendance } from "@/features/attendance/queries/getEventAttendance";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckSquare } from "lucide-react";
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
    <div className="max-w-5xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href={`/admin/events/${event.id}`} className="text-purple-600 hover:underline text-sm font-semibold flex items-center gap-1 w-fit mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Event Details
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-purple-600" />
            Attendance: {event.title}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Mark attendance for registered members</p>
        </div>
      </div>

      <AttendanceTracker event={event} activeSession={event.attendanceSessions?.[0]} />

    </div>
  );
}
