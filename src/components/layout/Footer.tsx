"use client";

import Link from "next/link";
import { Instagram, Linkedin, Youtube, Mail, MapPin } from "lucide-react";
import MaxWidthWrapper from "../wrappers/MaxWidthWrapper";
import { ROUTES } from "@/lib/constants";

export default function Footer({ layoutData }: { layoutData?: any }) {
  const club = layoutData?.club;
  const settings = layoutData?.settings;

  const appName = club?.shortName || club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";

  const socialMedia = (settings?.footerSocials as any) || club?.socialMedia || {};
  const orgInstagram = socialMedia.instagram || process.env.NEXT_PUBLIC_ORG_INSTAGRAM;
  const orgLinkedin = socialMedia.linkedin || process.env.NEXT_PUBLIC_ORG_LINKEDIN;
  const orgYoutube = socialMedia.youtube;

  const footerDesc = settings?.footerDescription || `${appName} empowers students and young professionals through service, leadership, fellowship, and meaningful community impact.`;

  const customQuickLinks = (settings?.footerQuickLinks as { label: string; url: string }[]) || [];

  return (
    <footer id="footer" className="bg-[#0B132B] text-slate-300 pt-24 pb-8 border-t border-[#F7A800]">
      <MaxWidthWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Left Column: Description */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xl font-black tracking-tighter uppercase text-white">
              {club.name}
              <span className="text-[#F7A800]">.</span>
            </span>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {footerDesc}
            </p>
          </div>

          {/* Right Columns: Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-8">
            {customQuickLinks.length > 0 ? (
              <div className="space-y-6 col-span-2">
                <h4 className="text-white font-bold text-sm tracking-widest uppercase">Quick Links</h4>
                <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-400">
                  {customQuickLinks.map((link, idx) => (
                    <Link key={idx} href={link.url} className="w-fit hover:text-[#F7A800] transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Explore */}
                <div className="space-y-6">
                  <h4 className="text-white font-bold text-sm tracking-widest uppercase">Explore</h4>
                  <div className="space-y-4 text-sm font-medium text-slate-400 flex flex-col">
                    <Link href="/about" className="w-fit hover:text-[#F7A800] transition-colors">Story</Link>
                    <Link href="/projects" className="w-fit hover:text-[#F7A800] transition-colors">Projects</Link>
                    <Link href="/events" className="w-fit hover:text-[#F7A800] transition-colors">Events</Link>
                    <Link href="/gallery" className="w-fit hover:text-[#F7A800] transition-colors">Gallery</Link>
                    {settings?.enableAnnouncements !== false && (
                      <Link href="/announcements" className="w-fit hover:text-[#F7A800] transition-colors">Notice Board</Link>
                    )}
                  </div>
                </div>

                {/* Get Involved */}
                <div className="space-y-6">
                  <h4 className="text-white font-bold text-sm tracking-widest uppercase">Get Involved</h4>
                  <div className="space-y-4 text-sm font-medium text-slate-400 flex flex-col">
                    {settings?.enableJoin !== false && (
                      <Link href="/join" className="w-fit hover:text-[#F7A800] transition-colors">Join Us</Link>
                    )}
                    <Link href="/events" className="w-fit hover:text-[#F7A800] transition-colors">Attend an Event</Link>
                    {settings?.enablePartner !== false && (
                      <Link href="/partner" className="w-fit hover:text-[#F7A800] transition-colors">Partner With Us</Link>
                    )}
                    <Link href="/about" className="w-fit hover:text-[#F7A800] transition-colors">Contact</Link>
                    <Link href={ROUTES.ADMIN} className="w-fit hover:text-[#F7A800] transition-colors">Admin Portal</Link>
                  </div>
                </div>
              </>
            )}

            {/* Connect */}
            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-2">Connect</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 block">Follow our journey</p>
              <div className="space-y-4 text-sm font-medium text-slate-400 flex flex-col">
                {club?.email && (
                  <a href={`mailto:${club.email}`} className="w-fit hover:text-[#F7A800] transition-colors flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                {orgLinkedin && (
                  <a href={orgLinkedin} target="_blank" rel="noopener noreferrer" className="w-fit hover:text-[#F7A800] transition-colors flex items-center gap-3">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {orgInstagram && (
                  <a href={orgInstagram} target="_blank" rel="noopener noreferrer" className="w-fit hover:text-[#F7A800] transition-colors flex items-center gap-3">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {orgYoutube && (
                  <a href={orgYoutube} target="_blank" rel="noopener noreferrer" className="w-fit hover:text-[#F7A800] transition-colors flex items-center gap-3">
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mb-8"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-slate-500 pb-4 text-center md:text-left">
          <div>
            <p className="font-bold text-slate-400 mb-1.5">&copy; {new Date().getFullYear()} {club?.name || appName}</p>
            <p className="text-[10px] text-slate-500 font-bold">
              Solely created with ❤️ by{" "}
              <a
                href="https://www.rprakashdass.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F7A800] hover:underline"
              >
                @rprakashdass
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Accessibility statement</Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
