import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { Calendar, MapPin, CheckCircle2, Clock, Users, UserCircle, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventActions from "./_components/EventActions";
import EventMemories from "./_components/EventMemories";

export default async function MemberEventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const session = await getSession();
    if (!session || !session.id) redirect("/auth/login");

    const member = await prisma.member.findUnique({
        where: { userId: session.id }
    });

    if (!member) return <div className="p-8">Member profile not found.</div>;

    const event = await prisma.event.findUnique({
        where: { id: resolvedParams.id },
        include: {
            club: true,
            registrations: { where: { memberId: member.id } },
            attendance: { where: { memberId: member.id } },
            attendanceSessions: { where: { active: true, expiresAt: { gt: new Date() } } },
            members: {
                include: { member: true }
            },
            project: {
                include: {
                    members: {
                        include: { member: true }
                    }
                }
            }
        }
    });

    if (!event) notFound();

    const isRegistered = event.registrations.length > 0;
    const hasAttended = event.attendance.length > 0;
    const hasActiveSession = event.attendanceSessions.length > 0;
    const isPast = new Date(event.startDate) < new Date() || event.status === "COMPLETED";

    // Determine state
    let state = "AVAILABLE";
    if (hasAttended) state = "ATTENDED";
    else if (isRegistered && hasActiveSession) state = "CHECK_IN_AVAILABLE";
    else if (isRegistered && !isPast) state = "REGISTERED";
    else if (isPast) state = "COMPLETED";

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
            
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard/events" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">
                    ← Back to Events
                </Link>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="h-32 sm:h-48 w-full bg-gradient-to-br from-purple-500 to-indigo-600"></div>
                
                <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{event.category || "General"}</Badge>
                        {state === "REGISTERED" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Registered</Badge>}
                        {state === "CHECK_IN_AVAILABLE" && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none animate-pulse">Check-in Open</Badge>}
                        {state === "ATTENDED" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Attended</Badge>}
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">{event.title}</h1>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-600 font-medium mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(event.startDate).toLocaleDateString()} {event.startTime ? `- ${new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {event.location || "TBA"}
                        </div>
                    </div>

                    <div className="prose prose-sm prose-slate max-w-none mb-8">
                        {event.description ? (
                            <p className="whitespace-pre-wrap">{event.description}</p>
                        ) : (
                            <p className="text-slate-400 italic">No description provided.</p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <EventActions 
                            eventId={event.id}
                            memberId={member.id}
                            state={state}
                            volunteerHours={event.attendance[0]?.volunteerHours?.toString()}
                        />
                        <a href={`/api/events/${event.id}/calendar`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="rounded-xl flex gap-2 font-semibold">
                                <Calendar className="w-4 h-4 text-slate-500" /> 
                                Add to Calendar
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* Organizing Team */}
            {event.members.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" /> Organizing Team
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {event.members.map(em => (
                            <div key={em.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <UserCircle className="w-10 h-10 text-slate-300" />
                                <div>
                                    <p className="font-bold text-slate-900 text-sm leading-tight">{em.member.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{em.role.replace("_", " ").toLowerCase()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Associated Project */}
            {event.project && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" /> Part of Project
                    </h2>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <h3 className="font-bold text-indigo-900 mb-1">{event.project.title}</h3>
                        <p className="text-sm text-indigo-700 mb-3 line-clamp-2">{event.project.description}</p>
                        <Link href={`/dashboard/projects/${event.project.id}`}>
                            <Button variant="outline" size="sm" className="bg-white rounded-xl">View Project</Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Event Memories (Drive Upload) */}
            {["REGISTERED", "ATTENDED", "COMPLETED"].includes(state) && (
                <EventMemories eventId={event.id} driveFolderId={event.driveFolderId} />
            )}

        </div>
    );
}
