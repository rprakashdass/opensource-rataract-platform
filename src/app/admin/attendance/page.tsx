import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardCheck, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, PortalEmptyState } from "@/components/portal";


export default async function GlobalAttendanceDashboard() {

  // Find club
  const club = await prisma.club.findFirst();
  if (!club) return <div className="p-8">No club found</div>;

  // Get recent events (last 10)
  const events = await prisma.event.findMany({
      where: { clubId: club.id },
      orderBy: { startDate: 'desc' },
      take: 10,
      include: {
          registrations: true,
          attendance: true
      }
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">

      <PageHeader
        title="Attendance Management"
        description="Select an event below to manage its attendance roster and check-ins."
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {events.length === 0 ? (
            <PortalEmptyState
                title="No events yet"
                detail="Create an event first to manage attendance."
                action={
                    <Button variant="outline" asChild>
                        <Link href="/admin/events/create">Create Event</Link>
                    </Button>
                }
            />
        ) : (
            <div className="divide-y divide-slate-100">
                {events.map(event => {
                    const totalReg = event.registrations.length;
                    const totalAtt = event.attendance.length;
                    const isUpcoming = new Date(event.startDate) > new Date();

                    return (
                        <Link key={event.id} href={`/admin/events/${event.id}/attendance`} className="block hover:bg-slate-50 transition-colors group">
                            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl border shrink-0 ${isUpcoming ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-pink-50 border-pink-100 text-brand'}`}>
                                        {isUpcoming ? <Clock className="w-6 h-6" /> : <ClipboardCheck className="w-6 h-6" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-semibold text-slate-900">{event.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs text-slate-500">
                                                {new Date(event.startDate).toLocaleDateString()}
                                            </Badge>
                                            {isUpcoming && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 text-[10px] uppercase">Upcoming</Badge>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row md:items-center gap-6">
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-slate-900 tabular-nums">{totalReg}</p>
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Registered</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-brand tabular-nums">{totalAtt}</p>
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Attended</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-center p-2 text-slate-300 group-hover:text-brand transition-colors">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )}
      </div>

    </div>
  );
}
