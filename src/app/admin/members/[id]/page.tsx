import { getMember } from "@/features/members/queries/getMembers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Droplet, HeartPulse, Edit, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DeleteMemberButton from "./DeleteMemberButton";
import { prisma } from "@/lib/prisma";
import AssignmentsManager from "../_components/AssignmentsManager";
import { MemberAvatar } from "@/components/ui/member-avatar";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { id } = await params;
  const { member, error } = await getMember(id);

  if (error || !member) {
    notFound();
  }

  const activeBoard = member.boardMemberships?.find(b => !b.leftAt);
  const boardHistory = member.boardMemberships?.filter(b => b.leftAt);

  const [availablePortfolios, availableRoles, rawAvailableYears] = await Promise.all([
    prisma.portfolio.findMany({ where: { clubId: member.clubId }, orderBy: { displayOrder: 'asc' } }),
    prisma.clubRole.findMany({ where: { clubId: member.clubId }, orderBy: { displayOrder: 'asc' } }),
    prisma.financialYear.findMany({ where: { clubId: member.clubId }, orderBy: { name: 'desc' } })
  ]);

  const availableYears = rawAvailableYears.map(fy => ({
    ...fy,
    openingBalance: Number(fy.openingBalance),
    closingBalance: fy.closingBalance ? Number(fy.closingBalance) : null
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-start">
        <Link href="/admin/members" className="text-purple-600 hover:underline text-sm font-semibold flex items-center gap-1 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/admin/members/${member.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </Link>
          <DeleteMemberButton memberId={member.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Core Profile */}
        <div className="space-y-6">
          <Card className="border-slate-100 shadow-sm text-center pt-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <CardContent className="relative z-10 pt-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-white p-1 shadow-md mb-4 overflow-hidden">
                <MemberAvatar name={member.name} avatarUrl={member.avatar} className="w-full h-full" textClassName="text-3xl" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{member.name}</h1>
              {activeBoard ? (
                <Badge className="mt-2 bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 uppercase tracking-widest text-[10px]">
                  {activeBoard.role?.name || activeBoard.position}
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                  Member
                </Badge>
              )}
              
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-slate-500 font-bold">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-medium">{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-medium">{member.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-medium">{member.location || "Not provided"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-slate-500 font-bold">Medical & Emergency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700">
                <Droplet className="w-4 h-4 text-rose-500 shrink-0 fill-rose-100" />
                <span className="text-sm font-medium">Blood Group: {member.bloodGroup || "Unknown"}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-700 pt-2 border-t border-slate-100">
                <HeartPulse className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">Emergency Contact</p>
                  <span className="text-sm font-medium">{member.emergencyContact || "Not provided"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & History */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Professional Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{member.profession || "Not specified"}</p>
                  <p className="text-sm text-slate-500">{member.companyName || "Organization not specified"}</p>
                </div>
              </div>
              
              {member.bio && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Bio</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">{member.bio}</p>
                </div>
              )}

              {member.skills && member.skills.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Skills & Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <AssignmentsManager 
            memberId={member.id}
            portfolioAssignments={member.portfolioAssignments || []}
            boardMemberships={member.boardMemberships || []}
            availablePortfolios={availablePortfolios}
            availableRoles={availableRoles}
            availableYears={availableYears}
          />

          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle>Project & Event Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {member.projectRoles?.length === 0 && member.eventRoles?.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No specific event or project roles assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {member.projectRoles?.map((pr: any) => (
                    <div key={pr.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                      <div>
                        <Link href={`/admin/projects/${pr.projectId}`} className="font-bold text-indigo-600 hover:underline text-sm block">Project: {pr.project.title}</Link>
                      </div>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 capitalize border-indigo-200">
                        {pr.role.replace("_", " ").toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                  {member.eventRoles?.map((er: any) => (
                    <div key={er.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                      <div>
                        <Link href={`/admin/events/${er.eventId}`} className="font-bold text-purple-600 hover:underline text-sm block">Event: {er.event.title}</Link>
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 capitalize border-purple-200">
                        {er.role.replace("_", " ").toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Attendance History</CardTitle>
              <div className="text-right">
                <span className="text-2xl font-black text-purple-600">
                  {member.attendance?.reduce((acc: number, curr: any) => acc + Number(curr.volunteerHours || 0), 0) || 0}
                </span>
                <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Total Vol. Hours</span>
              </div>
            </CardHeader>
            <CardContent>
              {member.attendance?.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No recent events attended.</p>
              ) : (
                <div className="space-y-3 mt-4">
                  {member.attendance?.map((att: any) => (
                    <div key={att.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                      <div>
                        <Link href={`/admin/events/${att.eventId}`} className="font-bold text-purple-700 hover:underline text-sm block">{att.event.title}</Link>
                        <p className="text-xs text-slate-500">{new Date(att.checkedInAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {att.volunteerHours && Number(att.volunteerHours) > 0 && (
                           <Badge variant="secondary" className="text-[10px] bg-slate-100">{att.volunteerHours} hrs</Badge>
                        )}
                        <Badge variant="outline" className={
                            att.status === "PRESENT" ? "text-emerald-600 border-emerald-200 bg-emerald-50" : 
                            att.status === "ABSENT" ? "text-red-600 border-red-200 bg-red-50" : 
                            att.status === "LATE" ? "text-amber-600 border-amber-200 bg-amber-50" : "text-blue-600 border-blue-200 bg-blue-50"
                        }>
                          {att.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
