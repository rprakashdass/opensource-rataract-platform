"use client";

import React, { useState } from "react";
import { 
  UserCircle, Mail, Phone, HeartPulse, MapPin, Award, History, 
  Calendar, CheckCircle2, Star, ShieldAlert, BadgeInfo, CheckCircle, 
  Sparkles, Camera, ArrowRight, BookOpen, User, Flame, GraduationCap, Lock, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { LazyMotion, domMax, m } from "framer-motion";
import { springs } from "@/lib/motion-tokens";
import { MemberAvatar } from "@/components/ui/member-avatar";
import ProfileEditDialog from "./ProfileEditDialog";
import PasswordChangeForm from "./PasswordChangeForm";
import PassportActions from "./PassportActions";
import { AnimatedCountUp } from "@/components/ui/motion/AnimatedCountUp";
import { AnimatedImage, AnimatedGrid } from "@/components/ui/motion/AnimatedLayouts";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/portal";
import { formatDesignations } from "@/lib/utils";
import { getRoleResponsibilities } from "@/lib/roleResponsibilities";

const formatDate = (dateInput: any) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

interface ProfileJourneyClientProps {
  member: any;
  user: any;
}

export default function ProfileJourneyClient({ member, user }: ProfileJourneyClientProps) {
  const [skills, setSkills] = useState<string[]>(member.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);
  
  // Calculate profile completion
  const profileFields = [
    { value: member.avatar, weight: 15 },
    { value: member.phone, weight: 15 },
    { value: member.emergencyContact, weight: 15 },
    { value: member.bloodGroup, weight: 15 },
    { value: member.bio, weight: 20 },
    { value: member.skills?.length > 0, weight: 20 },
  ];
  const profileCompletion = profileFields.reduce((acc, curr) => curr.value ? acc + curr.weight : acc, 0);

  // Active positions & leadership
  const activeBoardDesignation = formatDesignations(member.boardMemberships);
  
  const currentPositions = member.boardMemberships?.filter(
    (b: any) => b.financialYear?.status === "ACTIVE" || !b.leftAt
  ) || [];

  const leadingProjects = member.projectRoles?.filter(
    (pr: any) => pr.role === "CHAIR" || pr.role === "CO_CHAIR" || pr.role === "LEAD"
  ) || [];

  const leadingEvents = member.eventRoles?.filter(
    (er: any) => er.role === "CHAIR" || er.role === "CO_CHAIR" || er.role === "LEAD"
  ) || [];

  // Metrics calculators
  const totalHours = member.attendance?.reduce((acc: number, curr: any) => acc + Number(curr.volunteerHours || 0), 0) || 0;
  const totalEvents = member.attendance?.length || 0;
  const totalProjects = member.projectRoles?.length || 0;
  
  // Current Year Impact (Assuming current year is 2026 based on mock system context)
  const currentYearAttendance = member.attendance?.filter((att: any) => {
    const date = new Date(att.checkedInAt);
    return date.getFullYear() === 2026;
  }) || [];
  
  const currentYearHours = currentYearAttendance.reduce((acc: number, curr: any) => acc + Number(curr.volunteerHours || 0), 0);
  const currentYearEventsCount = currentYearAttendance.length;

  // Stagger reveal variations
  const textReveal = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: springs.default }
  };

  // Status tiers
  let statusBadge = "New Contributor";
  let stars = 1;
  if (totalHours > 80 || totalEvents > 15) {
    statusBadge = "Elite Ambassador";
    stars = 5;
  } else if (totalHours > 40 || totalEvents > 8) {
    statusBadge = "Active Contributor";
    stars = 3;
  } else if (totalHours > 10 || totalEvents > 2) {
    statusBadge = "Dedicated Member";
    stars = 2;
  }

  // Persist the skill list, rolling back the optimistic update on failure.
  const persistSkills = async (updated: string[], previous: string[]) => {
    setSavingSkills(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...member, skills: updated }),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      setSkills(previous); // rollback
      toast.error("Couldn't save your skills. Please try again.");
    } finally {
      setSavingSkills(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = newSkill.trim();
    if (!value || skills.includes(value)) return;
    const previous = skills;
    const updated = [...skills, value];
    setSkills(updated);
    setNewSkill("");
    await persistSkills(updated, previous);
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const previous = skills;
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    await persistSkills(updated, previous);
  };

  // Group registrations or check-ins by year for Memories section
  const memoryTimeline = member.attendance?.slice(0, 3) || [];

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 sm:px-6">

      <PageHeader
        title="My Profile"
        description="Your membership passport, milestones, and account settings."
        className="mt-4 mb-0"
      />

      {/* ─── GRID LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
        
        {/* ─── LEFT COLUMN: STICKY PASSPORT CARD ─── */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* Identity Pass Card */}
          <div className="bg-white rounded-3xl border border-hairline p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand" />

            <div className="flex flex-col items-center text-center pt-4">
              <MemberAvatar
                name={member.name}
                avatarUrl={member.avatar}
                className="w-24 h-24 border-4 border-paper shadow-md mx-auto mb-4 bg-wash"
                textClassName="text-3xl"
              />

              <h2 className="text-2xl font-bold text-ink tracking-tight">{member.name}</h2>
              <p className="text-ink-soft font-bold text-xs uppercase tracking-wider mt-1">
                {activeBoardDesignation || member.profession || "Platform Member"}
              </p>
              <p className="text-ink-faint text-xs mt-0.5">{member.club?.name || "Rotaract Club"}</p>

              {/* Membership Badges */}
              <div className="mt-4 flex flex-col items-center gap-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/25 rounded-full text-xs font-bold text-gold uppercase tracking-wider">
                  {"★".repeat(stars)} {statusBadge}
                </span>
                <span className="text-[10px] text-ink-faint font-bold uppercase tracking-widest mt-1">
                  Member since {new Date(member.createdAt).getFullYear()}
                </span>
              </div>
            </div>

            {/* Quick Passport Service Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 border-y border-hairline py-5 my-6 text-center">
              <div className="space-y-1">
                <p className="text-sm font-bold text-ink leading-none">
                  <AnimatedCountUp value={totalHours} />
                </p>
                <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">Hours</p>
              </div>
              <div className="space-y-1 lg:border-l lg:border-hairline">
                <p className="text-sm font-bold text-ink leading-none">
                  <AnimatedCountUp value={totalEvents} />
                </p>
                <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">Events</p>
              </div>
              <div className="space-y-1 lg:border-l lg:border-hairline">
                <p className="text-sm font-bold text-ink leading-none">
                  <AnimatedCountUp value={totalProjects} />
                </p>
                <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">Projects</p>
              </div>
              <div className="space-y-1 lg:border-l lg:border-hairline">
                <p className="text-sm font-bold text-ink leading-none">
                  {member.attendance?.filter((a: any) => a.certificateUrl)?.length || 0}
                </p>
                <p className="text-[9px] font-bold text-ink-faint uppercase tracking-wider">Awards</p>
              </div>
            </div>

            {/* Completion Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-ink-soft">
                <span>Passport Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-wash rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-brand-deep rounded-full transition-all duration-[1.2s] ease-out"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            {/* Actions list */}
            <div className="mt-6 space-y-2.5">
              <ProfileEditDialog member={member} />
              
              <PassportActions name={member.name} />
            </div>
          </div>
          
        </div>

        {/* ─── RIGHT COLUMN: SCROLLABLE NARRATIVE ─── */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* 1. Current Responsibilities */}
          <section className="bg-white rounded-3xl border border-hairline p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] block mb-1">Active Roles</span>
              <h3 className="text-xl font-bold text-ink">Current Responsibilities</h3>
            </div>

            {currentPositions.length > 0 || leadingProjects.length > 0 || leadingEvents.length > 0 ? (
              <div className="space-y-4">
                {/* Board positions — full width, with what the role entails */}
                {currentPositions.map((pos: any) => {
                  const resp = getRoleResponsibilities(pos.position);
                  return (
                    <div key={pos.id} className="p-5 bg-wash border border-hairline rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl border border-hairline shrink-0">
                          <Star className="w-5 h-5 text-gold" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Board Position</p>
                          <h4 className="font-bold text-ink capitalize mt-0.5">{pos.position.replaceAll("_", " ")}</h4>
                          <p className="text-xs text-ink-faint font-medium mt-0.5">{pos.financialYear?.name}</p>
                        </div>
                      </div>
                      {resp && (
                        <ul className="mt-4 space-y-1.5">
                          {resp.points.map((pt, i) => (
                            <li key={i} className="flex gap-2.5 text-xs text-ink-soft leading-relaxed">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-gold shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}

                {/* Project & event leadership — compact */}
                {(leadingProjects.length > 0 || leadingEvents.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leadingProjects.map((pr: any) => (
                      <div key={pr.id} className="p-5 bg-wash border border-hairline rounded-2xl flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl border border-hairline shrink-0">
                          <Flame className="w-5 h-5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Project Lead</p>
                          <h4 className="font-bold text-ink mt-0.5">{pr.project.title}</h4>
                          <p className="text-xs text-ink-faint font-medium mt-1 capitalize">{pr.role.toLowerCase().replaceAll("_", " ")}</p>
                        </div>
                      </div>
                    ))}
                    {leadingEvents.map((er: any) => (
                      <div key={er.id} className="p-5 bg-wash border border-hairline rounded-2xl flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl border border-hairline shrink-0">
                          <Calendar className="w-5 h-5 text-brand" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Event Lead</p>
                          <h4 className="font-bold text-ink mt-0.5">{er.event.title}</h4>
                          <p className="text-xs text-ink-faint font-medium mt-1 capitalize">{er.role.toLowerCase().replaceAll("_", " ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-wash rounded-2xl border border-dashed border-hairline">
                <Sparkles className="w-8 h-8 text-ink-faint mx-auto mb-3" />
                <p className="text-sm font-semibold text-ink">You're ready to take on your next leadership opportunity.</p>
                <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto leading-relaxed">
                  Speak to your club president or directors about chairing upcoming community service initiatives.
                </p>
              </div>
            )}
          </section>

          {/* 2. Impact — this year, lifetime, and leadership (real data only) */}
          <section className="bg-white rounded-3xl border border-hairline p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.2em] block mb-1">Legacy</span>
              <h3 className="text-xl font-bold text-ink">Impact</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* This Rotary Year */}
              <div className="p-6 bg-wash rounded-2xl border border-hairline">
                <h4 className="text-sm font-bold text-ink-faint uppercase tracking-wider">This Rotary Year</h4>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between border-b border-hairline pb-2">
                    <span className="text-xs text-ink-soft font-bold">Events Attended</span>
                    <span className="text-sm font-bold text-ink">{currentYearEventsCount}</span>
                  </div>
                  <div className="flex justify-between border-b border-hairline pb-2">
                    <span className="text-xs text-ink-soft font-bold">Volunteer Hours</span>
                    <span className="text-sm font-bold text-ink">{currentYearHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-ink-soft font-bold">Attendance Rate</span>
                    <span className="text-sm font-bold text-ink">
                      {member.registrations?.length > 0
                        ? `${Math.min(Math.round((totalEvents / member.registrations.length) * 100), 100)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lifetime */}
              <div className="p-6 bg-ink text-white rounded-2xl">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider">Lifetime</h4>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-xs text-white/70 font-bold">Total Hours</span>
                    <span className="text-sm font-bold text-gold">{totalHours} hrs</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-xs text-white/70 font-bold">Events Joined</span>
                    <span className="text-sm font-bold text-gold">{totalEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-white/70 font-bold">Projects Participated</span>
                    <span className="text-sm font-bold text-gold">{totalProjects}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leadership strip — only when there's leadership to show */}
            {(leadingEvents.length > 0 || leadingProjects.length > 0 || (member.boardMemberships?.length || 0) > 0) && (
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { label: "Events Chaired", value: leadingEvents.length },
                  { label: "Projects Chaired", value: leadingProjects.length },
                  { label: "Board Years", value: member.boardMemberships?.length || 0 },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-2xl bg-wash border border-hairline">
                    <p className="text-2xl font-bold text-ink leading-none">{s.value}</p>
                    <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wider mt-1.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Rotaract Journey Timeline */}
          <section className="bg-white rounded-3xl border border-hairline p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.2em] block mb-1">Story</span>
              <h3 className="text-xl font-bold text-ink">Rotaract Journey</h3>
            </div>

            <div className="relative pl-6 border-l-2 border-hairline space-y-8 ml-2">

              {/* Joined */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-gold" />
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">Beginning</span>
                <h4 className="text-sm font-bold text-ink mt-1">Joined the Club</h4>
                <p className="text-xs text-ink-soft font-medium mt-0.5">{formatDate(member.createdAt)}</p>
              </div>

              {/* First Event */}
              {member.attendance?.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-brand" />
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">First Event</span>
                  <h4 className="text-sm font-bold text-ink mt-1">
                    Attended {member.attendance[member.attendance.length - 1].event.title}
                  </h4>
                  <p className="text-xs text-ink-soft font-medium mt-0.5">
                    {formatDate(member.attendance[member.attendance.length - 1].checkedInAt)}
                  </p>
                </div>
              )}

              {/* First Project */}
              {member.projectRoles?.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-brand-deep" />
                  <span className="text-[10px] font-bold text-brand-deep uppercase tracking-wider block">First Project</span>
                  <h4 className="text-sm font-bold text-ink mt-1">
                    Assigned in {member.projectRoles[member.projectRoles.length - 1].project.title}
                  </h4>
                  <p className="text-xs text-ink-soft font-medium mt-0.5">
                    {formatDate(member.projectRoles[member.projectRoles.length - 1].joinedAt)}
                  </p>
                </div>
              )}

              {/* Leadership Role */}
              {member.boardMemberships?.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-brand" />
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">Leadership</span>
                  <h4 className="text-sm font-bold text-ink mt-1">
                    Appointed as {member.boardMemberships[member.boardMemberships.length - 1].position.replaceAll("_", " ")}
                  </h4>
                  <p className="text-xs text-ink-soft font-medium mt-0.5">
                    {formatDate(member.boardMemberships[member.boardMemberships.length - 1].joinedAt)}
                  </p>
                </div>
              )}

              {/* Current Status */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-gold" />
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">Active Tenure</span>
                <h4 className="text-sm font-bold text-ink mt-1">Ongoing Growth</h4>
                <p className="text-xs text-ink-soft font-medium mt-0.5">Currently participating in {member.club?.name}</p>
              </div>

            </div>
          </section>

          {/* 7. Memories */}
          <section className="bg-white rounded-3xl border border-hairline p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] block mb-1">Visuals</span>
              <h3 className="text-xl font-bold text-ink">Recent Memories</h3>
            </div>

            {memoryTimeline.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memoryTimeline.map((att: any) => {
                  const mediaSrc = getGoogleDriveDirectLink(att.event.media?.[0]?.url);
                  return (
                    <div key={att.id} className="group border border-hairline rounded-2xl overflow-hidden bg-wash relative flex flex-col justify-between h-[280px] motion-card">
                      <div className="h-[180px] w-full relative overflow-hidden">
                        {mediaSrc ? (
                          <AnimatedImage
                            src={mediaSrc}
                            alt={att.event.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-wash flex flex-col items-center justify-center gap-2">
                            <Camera className="w-8 h-8 text-ink-faint" />
                            <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">No photos yet</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white border-t border-hairline">
                        <div>
                          <h4 className="font-bold text-sm text-ink line-clamp-1">{att.event.title}</h4>
                          <p className="text-[10px] text-ink-faint font-semibold mt-0.5">
                            {formatDate(att.checkedInAt)}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-gold/10 border border-gold/25 rounded-lg text-[10px] font-bold text-gold uppercase tracking-wider">
                          +{Number(att.volunteerHours || 0)} hrs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-wash rounded-2xl border border-dashed border-hairline">
                <Camera className="w-8 h-8 text-ink-faint mx-auto mb-3" />
                <p className="text-sm font-semibold text-ink">Upload your first event photo.</p>
                <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto leading-relaxed">
                  Memories from events you attend will appear here automatically once photos are shared.
                </p>
              </div>
            )}
          </section>

          {/* 8. Skills & Interests */}
          <section className="bg-white rounded-3xl border border-hairline p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] block mb-1">Capabilities</span>
              <h3 className="text-xl font-bold text-ink">Skills &amp; Interests</h3>
            </div>

            <div className="space-y-4">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      disabled={savingSkills}
                      className="px-3.5 py-1.5 bg-wash hover:bg-brand/10 hover:text-brand rounded-full text-xs font-bold text-ink border border-hairline flex items-center gap-1.5 transition-colors select-none group disabled:opacity-50"
                      onClick={() => handleRemoveSkill(skill)}
                      title="Click to remove"
                    >
                      {skill}
                      <span className="text-[10px] text-ink-faint group-hover:text-brand font-normal">×</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-soft font-medium">Add skills and topics you are interested in growing within Rotaract.</p>
              )}

              <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm mt-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  disabled={savingSkills}
                  placeholder="Add skill (e.g. Design, Public Speaking)"
                  className="flex-1 border border-hairline rounded-xl px-3 py-2 text-xs text-ink motion-input focus:border-brand focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={savingSkills || !newSkill.trim()}
                  className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-deep text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors motion-button disabled:opacity-50"
                >
                  {savingSkills && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Add
                </button>
              </form>
            </div>
          </section>

          {/* 9. Certificates Showcase */}
          <section className="bg-white rounded-3xl border border-hairline p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.2em] block mb-1">Archive</span>
              <h3 className="text-xl font-bold text-ink">Certificates</h3>
            </div>

            {member.attendance?.filter((a: any) => a.certificateUrl).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {member.attendance.filter((a: any) => a.certificateUrl).map((att: any) => (
                  <div key={att.id} className="p-4 bg-wash rounded-2xl border border-hairline flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-ink">{att.event.title}</h4>
                      <p className="text-xs text-ink-faint font-medium mt-0.5">Certificate</p>
                    </div>
                    <a
                      href={att.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-brand hover:text-brand-deep motion-link"
                    >
                      Preview &amp; Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-wash rounded-2xl border border-dashed border-hairline">
                <Award className="w-8 h-8 text-ink-faint mx-auto mb-3" />
                <p className="text-sm font-semibold text-ink">Earn your first certificate.</p>
                <p className="text-xs text-ink-soft mt-1 max-w-sm mx-auto leading-relaxed">
                  Participate or volunteer in event phases to receive registered completion credentials automatically.
                </p>
              </div>
            )}
          </section>

          {/* 10. Your Account */}
          <section className="space-y-5">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-[0.2em] block mb-1">Manage</span>
              <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                <Lock className="w-4 h-4 text-ink-faint" /> Your Account
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal details — safety & contact info (edited via Edit Profile) */}
              <div className="rounded-2xl border border-hairline bg-white p-5 space-y-4">
                <p className="text-xs font-bold text-ink-faint uppercase tracking-widest">Personal Details</p>
                {[
                  { label: "Contact Phone", value: member.phone },
                  { label: "Emergency Contact", value: member.emergencyContact },
                  { label: "Blood Group", value: member.bloodGroup },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className={`text-sm font-medium ${row.value ? "text-ink" : "text-ink-faint italic"}`}>
                      {row.value || "Not provided"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Account & security — email + password */}
              <div className="rounded-2xl border border-hairline bg-white p-5 space-y-5">
                <p className="text-xs font-bold text-ink-faint uppercase tracking-widest">Account &amp; Security</p>
                <div>
                  <p className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-0.5">Registered Email</p>
                  <p className={`text-sm font-medium ${member.email ? "text-ink" : "text-ink-faint italic"}`}>
                    {member.email || "Not provided"}
                  </p>
                </div>
                <div className="border-t border-hairline pt-5">
                  <PasswordChangeForm email={member.email} />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
