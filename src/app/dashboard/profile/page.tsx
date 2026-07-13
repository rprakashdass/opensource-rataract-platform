import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { UserCircle, Mail, Phone, HeartPulse, GraduationCap, MapPin, Award, History, Calendar, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/ui/member-avatar";
import ProfileEditDialog from "./_components/ProfileEditDialog";

export default async function MemberProfilePage() {
    const session = await getSession();
    if (!session || !session.id) redirect("/auth/login");

    const member = await prisma.member.findUnique({
        where: { userId: session.id },
        include: {
            club: true,
            boardMemberships: {
                include: { financialYear: true },
                orderBy: { joinedAt: 'desc' }
            },
            projectRoles: {
                include: { project: true },
                orderBy: { joinedAt: 'desc' }
            },
            eventRoles: {
                include: { event: true },
                orderBy: { joinedAt: 'desc' }
            }
        }
    });

    if (!member) return <div className="text-center py-20 text-slate-500">Profile not found.</div>;

    return (
        <div className="space-y-8 pb-10 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
                        <UserCircle className="w-8 h-8 text-purple-600" />
                        My Profile
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your personal information and Rotaract identity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Avatar & Quick Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-purple-500 to-pink-500"></div>
                        <div className="relative pt-12">
                            <MemberAvatar name={member.name} avatarUrl={member.avatar} className="w-24 h-24 border-4 border-white shadow-md mx-auto mb-4 bg-white" textClassName="text-2xl" />
                            <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
                            <p className="text-slate-500 text-sm font-medium mb-4">{member.club?.name}</p>
                            
                            <div className="flex justify-center gap-2 mb-6 text-slate-400">
                                {member.email && <Mail className="w-5 h-5 hover:text-purple-600 cursor-pointer transition-colors" />}
                                {member.phone && <Phone className="w-5 h-5 hover:text-purple-600 cursor-pointer transition-colors" />}
                            </div>

                            <ProfileEditDialog member={member} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-purple-600"/> Certificates</h3>
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Certificates earned from events and projects will appear here.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Personal Information */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                                <p className="text-slate-900 font-medium">{member.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-slate-900 font-medium">{member.email || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Phone</p>
                                <p className="text-slate-900 font-medium">{member.phone || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><HeartPulse className="w-3 h-3 text-red-500"/> Blood Group</p>
                                <p className="text-slate-900 font-medium">{member.bloodGroup || "Not provided"}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</p>
                                <p className="text-slate-900 font-medium">{member.bio || "No bio provided."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Skills & Emergency */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Skills</h3>
                            {member.skills && member.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {member.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 mt-4">No skills added.</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-4 border-l-red-400">
                            <h3 className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Emergency Contact</h3>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-900">{member.emergencyContact || "Not provided"}</p>
                                <p className="text-xs text-slate-500 mt-1">Please keep this updated.</p>
                            </div>
                        </div>
                    </div>

                    {/* Board History */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-600"/> Board History
                        </h3>
                        {member.boardMemberships && member.boardMemberships.length > 0 ? (
                            <div className="space-y-4">
                                {member.boardMemberships.map((bm: any) => (
                                    <div key={bm.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-slate-900 capitalize">{bm.position.replaceAll("_", " ")}</p>
                                            <p className="text-sm text-slate-500">{bm.financialYear.name}</p>
                                        </div>
                                        {bm.leftAt ? (
                                            <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">Past</span>
                                        ) : (
                                            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-md border border-purple-200">Active</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500">No board positions held.</p>
                            </div>
                        )}
                    </div>

                    {/* Leadership & Contributions */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500"/> Leadership & Contributions
                        </h3>
                        {(member.projectRoles?.length === 0 && member.eventRoles?.length === 0) ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-500">No specific event or project roles assigned yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {member.projectRoles?.map((pr: any) => (
                                    <div key={pr.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-slate-900 truncate">Project: {pr.project.title}</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 capitalize border-indigo-200">
                                            {pr.role.replace("_", " ").toLowerCase()}
                                        </Badge>
                                    </div>
                                ))}
                                {member.eventRoles?.map((er: any) => (
                                    <div key={er.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-slate-900 truncate">Event: {er.event.title}</p>
                                        </div>
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 capitalize border-purple-200">
                                            {er.role.replace("_", " ").toLowerCase()}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
