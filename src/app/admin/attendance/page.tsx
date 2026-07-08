import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardCheck, Calendar, Users, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";

export default async function GlobalAttendanceDashboard() {
  const session = await getSession();
  
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-purple-600" />
            Attendance Management
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Select an event below to manage its attendance roster and check-ins.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {events.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Calendar className="w-10 h-10 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No events yet</h3>
                <p className="text-sm">Create an event first to manage attendance.</p>
                <Link href="/admin/events/create" className="mt-4">
                    <Button variant="outline">Create Event</Button>
                </Link>
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {events.map(event => {
                    const totalReg = event.registrations.length;
                    const totalAtt = event.attendance.length;
                    const isUpcoming = new Date(event.startDate) > new Date();
                    
                    return (
                        <Link key={event.id} href={`/admin/events/${event.id}/attendance`} className="block hover:bg-slate-50 transition-colors">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl border ${isUpcoming ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                                        {isUpcoming ? <Clock className="w-6 h-6" /> : <ClipboardCheck className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
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
                                            <p className="text-2xl font-black text-slate-900">{totalReg}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Registered</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-purple-600">{totalAtt}</p>
                                            <p className="text-xs font-bold text-purple-300 uppercase tracking-wide">Attended</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-center p-2 text-slate-300 group-hover:text-purple-600 transition-colors">
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
