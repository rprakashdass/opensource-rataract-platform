"use client";

import Link from "next/link";
import { Instagram, Linkedin, Youtube, Mail, MapPin } from "lucide-react";
import MaxWidthWrapper from "../wrappers/MaxWidthWrapper";
import { ClubLogo } from "@/components/ui/club-logo";
import { ROUTES } from "@/lib/constants";

export default function Footer({ layoutData }: { layoutData?: any }) {
  const club = layoutData?.club;

  const appName = club?.shortName || club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";
  const logoUrl = club?.logoUrl;
  const orgDescription = club?.missionStatement || process.env.NEXT_PUBLIC_ORG_DESCRIPTION || "We function as a service-oriented organization that strives to create a better world through volunteerism, community service, and professional development.";

  const socialMedia = club?.socialMedia || {};
  const orgInstagram = socialMedia.instagram || process.env.NEXT_PUBLIC_ORG_INSTAGRAM;
  const orgLinkedin = socialMedia.linkedin || process.env.NEXT_PUBLIC_ORG_LINKEDIN;
  const orgYoutube = socialMedia.youtube;

  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 border-t-4 border-amber-500">
      <MaxWidthWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand & About */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="bg-white rounded-full p-1.5 overflow-hidden shadow-lg group-hover:shadow-amber-500/20 transition-all">
                <ClubLogo logoUrl={logoUrl} name={appName} size={56} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {appName}
                </h2>
                <p className="text-[11px] text-amber-400 uppercase tracking-widest font-bold mt-1">
                  Rotary International
                </p>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-md">
              {orgDescription}
            </p>
            <div className="flex gap-4 pt-2">
              {orgInstagram && (
                <a href={orgInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {orgLinkedin && (
                <a href={orgLinkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {orgYoutube && (
                <a href={orgYoutube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-7 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Explore</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/projects" className="hover:text-amber-400 transition-colors">Initiatives</Link></li>
              <li><Link href="/events" className="hover:text-amber-400 transition-colors">Events</Link></li>
              <li><Link href="/gallery" className="hover:text-amber-400 transition-colors">Gallery</Link></li>
              <li><Link href="/announcements" className="hover:text-amber-400 transition-colors">Announcements</Link></li>
              <li><Link href={ROUTES.ADMIN} className="hover:text-amber-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Involve</h3>
            <ul className="space-y-4">
              <li><Link href="/join" className="hover:text-amber-400 transition-colors">Become a Member</Link></li>
              <li><Link href="/partner" className="hover:text-amber-400 transition-colors">Partner With Us</Link></li>
              <li><Link href="/auth/login" className="hover:text-amber-400 transition-colors">Member Portal</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Contact</h3>
            <ul className="space-y-4">
              {club?.email && (
                <li>
                  <a href={`mailto:${club.email}`} className="flex items-center gap-3 hover:text-amber-400 transition-colors group">
                    <Mail className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                    <span className="truncate text-sm">{club.email}</span>
                  </a>
                </li>
              )}
              {club?.meetingVenue && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                  <span className="text-sm leading-relaxed">{club.meetingVenue}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
