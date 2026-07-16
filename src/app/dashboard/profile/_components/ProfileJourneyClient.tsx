"use client";

import React, { useState } from "react";
import { 
  UserCircle, Mail, Phone, HeartPulse, MapPin, Award, History, 
  Calendar, CheckCircle2, Star, ShieldAlert, BadgeInfo, CheckCircle, 
  Sparkles, Camera, ArrowRight, BookOpen, User, Flame, GraduationCap, Lock
} from "lucide-react";
import { LazyMotion, domMax, m } from "framer-motion";
import { springs } from "@/lib/motion-tokens";
import { MemberAvatar } from "@/components/ui/member-avatar";
import ProfileEditDialog from "./ProfileEditDialog";
import PasswordChangeForm from "./PasswordChangeForm";
import { AnimatedCountUp } from "@/components/ui/motion/AnimatedCountUp";
import { AnimatedImage, AnimatedGrid } from "@/components/ui/motion/AnimatedLayouts";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/portal";

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
  const activeBoard = member.boardMemberships?.find(
    (b: any) => b.financialYear?.status === "ACTIVE" || !b.leftAt
  );
  
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

  // Handle adding skill tags
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    const updated = [...skills, newSkill.trim()];
    setSkills(updated);
    setNewSkill("");

    // Persist skill list via member profile update
    try {
      await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...member, skills: updated }),
      });
    } catch (err) {
      console.error("Failed to save skill", err);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);

    try {
      await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...member, skills: updated }),
      });
    } catch (err) {
      console.error("Failed to delete skill", err);
    }
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
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#F7A800]" />
            
            <div className="flex flex-col items-center text-center pt-4">
              <MemberAvatar 
                name={member.name} 
                avatarUrl={member.avatar} 
                className="w-24 h-24 border-4 border-slate-50 shadow-md mx-auto mb-4 bg-slate-100" 
                textClassName="text-3xl" 
              />
              
              <h2 className="text-2xl font-bold text-[#0B132B] tracking-tight">{member.name}</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1">
                {member.profession || "Platform Member"}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">{member.club?.name || "Rotaract Club"}</p>

              {/* Membership Badges */}
              <div className="mt-4 flex flex-col items-center gap-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 uppercase tracking-wider">
                  {"★".repeat(stars)} {statusBadge}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Member since {new Date(member.createdAt).getFullYear()}
                </span>
              </div>
            </div>

            {/* Quick Passport Service Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 border-y border-slate-100 py-5 my-6 text-center">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0B132B] leading-none">
                  <AnimatedCountUp value={totalHours} />
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hours</p>
              </div>
              <div className="space-y-1 lg:border-l lg:border-slate-100">
                <p className="text-sm font-bold text-[#0B132B] leading-none">
                  <AnimatedCountUp value={totalEvents} />
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Events</p>
              </div>
              <div className="space-y-1 lg:border-l lg:border-slate-100">
                <p className="text-sm font-bold text-[#0B132B] leading-none">
                  <AnimatedCountUp value={totalProjects} />
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Projects</p>
              </div>
              <div className="space-y-1 lg:border-l lg:border-slate-100">
                <p className="text-sm font-bold text-[#0B132B] leading-none">
                  {member.attendance?.filter((a: any) => a.certificateUrl)?.length || 0}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Awards</p>
              </div>
            </div>

            {/* Completion Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Passport Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#F7A800] to-amber-500 rounded-full transition-all duration-[1.2s] ease-out" 
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            {/* Actions list */}
            <div className="mt-6 space-y-2.5">
              <ProfileEditDialog member={member} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  disabled
                  className="rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-400 cursor-not-allowed bg-slate-50/50 transition-colors"
                >
                  Download Card
                </button>
                <button 
                  disabled 
                  className="rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-400 cursor-not-allowed bg-slate-50/50 transition-colors"
                >
                  Share Passport
                </button>
              </div>
            </div>
          </div>
          
        </div>

        {/* ─── RIGHT COLUMN: SCROLLABLE NARRATIVE ─── */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* 1. Current Responsibilities */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-[#F7A800] uppercase tracking-[0.2em] block mb-1">Active Roles</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Current Responsibilities</h3>
            </div>

            {currentPositions.length > 0 || leadingProjects.length > 0 || leadingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPositions.map((pos: any) => (
                  <div key={pos.id} className="p-5 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <Star className="w-5 h-5 text-[#F7A800]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Board Position</p>
                      <h4 className="font-bold text-[#0B132B] capitalize mt-0.5">{pos.position.replaceAll("_", " ")}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">{pos.financialYear?.name}</p>
                    </div>
                  </div>
                ))}
                {leadingProjects.map((pr: any) => (
                  <div key={pr.id} className="p-5 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <Flame className="w-5 h-5 text-[#003DA5]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Lead</p>
                      <h4 className="font-bold text-[#0B132B] mt-0.5">{pr.project.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 capitalize">{pr.role.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0B132B]">You're ready to take on your next leadership opportunity.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Speak to your club president or directors about chairing upcoming community service initiatives.
                </p>
              </div>
            )}
          </section>

          {/* 2. Next Milestones (Goals) */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-[#0B132B] uppercase tracking-[0.2em] block mb-1">Growth Path</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Next Milestones</h3>
            </div>
            
            <div className="space-y-4">
              {totalEvents < 10 && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-[#F7A800] rounded-full" />
                    <div>
                      <h4 className="text-sm font-bold text-[#0B132B]">Attend 10 Events</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Participate in more club operations. Currently: {totalEvents}/10</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F7A800] uppercase tracking-wider">{10 - totalEvents} more</span>
                </div>
              )}
              {totalHours < 50 && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-indigo-500 rounded-full" />
                    <div>
                      <h4 className="text-sm font-bold text-[#0B132B]">Dedicated Volunteer Title</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Reach 50 volunteer service hours. Currently: {totalHours}/50 hrs</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{50 - totalHours} hrs left</span>
                </div>
              )}
              {leadingProjects.length === 0 && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
                    <div>
                      <h4 className="text-sm font-bold text-[#0B132B]">Chair Your First Project</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Step up to lead a project committee</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Goal</span>
                </div>
              )}
            </div>
          </section>

          {/* 3. My Impact */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-[#003DA5] uppercase tracking-[0.2em] block mb-1">Legacy</span>
              <h3 className="text-xl font-bold text-[#0B132B]">My Impact</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* This Rotary Year */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">This Rotary Year</h4>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500 font-bold">Events Attended</span>
                      <span className="text-sm font-bold text-[#0B132B]">{currentYearEventsCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs text-slate-500 font-bold">Volunteer Hours</span>
                      <span className="text-sm font-bold text-[#0B132B]">{currentYearHours} hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 font-bold">Projects Chaired</span>
                      <span className="text-sm font-bold text-[#0B132B]">{leadingProjects.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifetime Impact */}
              <div className="p-6 bg-[#0B132B] text-white rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Lifetime Legacy</h4>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-slate-300 font-bold">Total Hours</span>
                      <span className="text-sm font-bold text-[#F7A800]">{totalHours} hrs</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-xs text-slate-300 font-bold">Events Joined</span>
                      <span className="text-sm font-bold text-[#F7A800]">{totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-300 font-bold">Projects Participated</span>
                      <span className="text-sm font-bold text-[#F7A800]">{totalProjects}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Rotaract Journey Timeline */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Story</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Rotaract Journey</h3>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-2">
              
              {/* Joined */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-[#F7A800]" />
                <span className="text-[10px] font-bold text-[#F7A800] uppercase tracking-wider block">Beginning</span>
                <h4 className="text-sm font-bold text-[#0B132B] mt-1">Joined the Club</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{formatDate(member.createdAt)}</p>
              </div>

              {/* First Event */}
              {member.attendance?.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-500" />
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">First Event</span>
                  <h4 className="text-sm font-bold text-[#0B132B] mt-1">
                    Attended {member.attendance[member.attendance.length - 1].event.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {formatDate(member.attendance[member.attendance.length - 1].checkedInAt)}
                  </p>
                </div>
              )}

              {/* First Project */}
              {member.projectRoles?.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">First Project</span>
                  <h4 className="text-sm font-bold text-[#0B132B] mt-1">
                    Assigned in {member.projectRoles[member.projectRoles.length - 1].project.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {formatDate(member.projectRoles[member.projectRoles.length - 1].joinedAt)}
                  </p>
                </div>
              )}

              {/* Leadership Role */}
              {member.boardMemberships?.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-brand" />
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">Leadership</span>
                  <h4 className="text-sm font-bold text-[#0B132B] mt-1">
                    Appointed as {member.boardMemberships[member.boardMemberships.length - 1].position.replaceAll("_", " ")}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {formatDate(member.boardMemberships[member.boardMemberships.length - 1].joinedAt)}
                  </p>
                </div>
              )}

              {/* Current Status */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Active Tenure</span>
                <h4 className="text-sm font-bold text-[#0B132B] mt-1">Ongoing Growth</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Currently participating in {member.club?.name}</p>
              </div>

            </div>
          </section>

          {/* 5. Recognition & Awards */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] block mb-1">Honors</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Recognition</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">🏅</span>
                <h5 className="text-xs font-bold text-[#0B132B]">Best Volunteer</h5>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Future Ready</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">⭐</span>
                <h5 className="text-xs font-bold text-[#0B132B]">Top Attendance</h5>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Future Ready</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">🎖</span>
                <h5 className="text-xs font-bold text-[#0B132B]">Project Chair</h5>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Future Ready</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">🌟</span>
                <h5 className="text-xs font-bold text-[#0B132B]">President Appr.</h5>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Future Ready</p>
              </div>
            </div>
          </section>

          {/* 6. Contribution Snapshot (Grouped) */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Metrics</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Contribution Snapshot</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Participation */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Events Joined</span>
                    <span className="font-bold text-[#0B132B]">{totalEvents}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Volunteer Hours</span>
                    <span className="font-bold text-[#0B132B]">{totalHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Attendance Rate</span>
                    <span className="font-bold text-[#0B132B]">
                      {totalEvents > 0 ? `${Math.min(Math.round((member.attendance?.length / member.registrations?.length) * 100), 100)}%` : "100%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leadership */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leadership</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Events Chaired</span>
                    <span className="font-bold text-[#0B132B]">{leadingEvents.length}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Projects Chaired</span>
                    <span className="font-bold text-[#0B132B]">{leadingProjects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Board Years</span>
                    <span className="font-bold text-[#0B132B]">{member.boardMemberships?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Community */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Ideas Submitted</span>
                    <span className="font-bold text-slate-400">0</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Members Mentored</span>
                    <span className="font-bold text-slate-400">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Certificates</span>
                    <span className="font-bold text-[#0B132B]">
                      {member.attendance?.filter((a: any) => a.certificateUrl)?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* 7. Memories */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] block mb-1">Visuals</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Recent Memories</h3>
            </div>

            {memoryTimeline.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memoryTimeline.map((att: any) => {
                  const mediaSrc = getGoogleDriveDirectLink(att.event.media?.[0]?.url);
                  return (
                    <div key={att.id} className="group border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 relative flex flex-col justify-between h-[280px] motion-card">
                      <div className="h-[180px] w-full relative overflow-hidden">
                        {mediaSrc ? (
                          <AnimatedImage
                            src={mediaSrc}
                            alt={att.event.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
                            <Camera className="w-8 h-8 text-slate-300" />
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">No photos yet</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white border-t">
                        <div>
                          <h4 className="font-bold text-sm text-[#0B132B] line-clamp-1">{att.event.title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {formatDate(att.checkedInAt)}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          +{Number(att.volunteerHours || 0)} hrs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Camera className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0B132B]">Upload your first event photo.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Memories from events you attend will appear here automatically once photos are shared.
                </p>
              </div>
            )}
          </section>

          {/* 8. Skills & Interests */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] block mb-1">Capabilities</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Skills & Interests</h3>
            </div>

            <div className="space-y-4">
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 rounded-full text-xs font-bold text-slate-700 border border-slate-200/60 flex items-center gap-1.5 transition-colors cursor-pointer select-none group"
                      onClick={() => handleRemoveSkill(skill)}
                      title="Click to remove"
                    >
                      {skill}
                      <span className="text-[9px] text-slate-400 group-hover:text-rose-500 font-normal">×</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">Add skills and topics you are interested in growing within Rotaract.</p>
              )}

              <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm mt-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. Design, Public Speaking)"
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs motion-input"
                />
                <button 
                  type="submit" 
                  className="bg-[#0B132B] hover:bg-[#F7A800] text-white hover:text-[#0B132B] px-4 py-2 rounded-xl text-xs font-bold transition motion-button"
                >
                  Add
                </button>
              </form>
            </div>
          </section>

          {/* 9. Certificates Showcase */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Archive</span>
              <h3 className="text-xl font-bold text-[#0B132B]">Certificates</h3>
            </div>

            {member.attendance?.filter((a: any) => a.certificateUrl).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {member.attendance.filter((a: any) => a.certificateUrl).map((att: any) => (
                  <div key={att.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0B132B]">{att.event.title}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Certificate</p>
                    </div>
                    <a 
                      href={att.certificateUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#F7A800] hover:text-[#003DA5] motion-link"
                    >
                      Preview & Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0B132B]">Earn your first certificate.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Participate or volunteer in event phases to receive registered completion credentials automatically.
                </p>
              </div>
            )}
          </section>

          {/* 10. Account Settings */}
          <section className="bg-slate-50 rounded-3xl border border-slate-200/50 p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-200/60 pb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1">Preferences</span>
              <h3 className="text-xl font-bold text-[#0B132B] flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" /> Account Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Credentials details */}
              <div className="space-y-4 text-sm font-medium">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Email</p>
                  <p className="text-slate-900">{member.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emergency Contact</p>
                  <p className="text-slate-900">{member.emergencyContact || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</p>
                  <p className="text-slate-900">{member.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                  <p className="text-slate-900">{member.bloodGroup || "Not provided"}</p>
                </div>
              </div>

              {/* Password change form */}
              <PasswordChangeForm />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
