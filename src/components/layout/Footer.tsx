"use client";

import Link from "next/link";
import { Instagram, Linkedin, Youtube, Mail } from "lucide-react";
import MaxWidthWrapper from "../wrappers/MaxWidthWrapper";
import { ROUTES } from "@/lib/constants";
import { FootprintGlyph } from "@/components/ui/public/v2/ImpactBand";

/**
 * MegaFooter — the page's final chord. Dark chapter surface, a manifesto
 * line at display size, then sitemap, contact, and the Rotaract affiliation.
 */
export default function Footer({ layoutData }: { layoutData?: any }) {
  const club = layoutData?.club;
  const settings = layoutData?.settings;

  const appName = club?.shortName || club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";

  const socialMedia = (settings?.footerSocials as any) || club?.socialMedia || {};
  const orgInstagram = socialMedia.instagram || process.env.NEXT_PUBLIC_ORG_INSTAGRAM;
  const orgLinkedin = socialMedia.linkedin || process.env.NEXT_PUBLIC_ORG_LINKEDIN;
  const orgYoutube = socialMedia.youtube;

  const manifesto = settings?.footerTagline || "Leave a mark. Make impact.";
  const footerDesc =
    settings?.footerDescription ||
    `${appName} brings students and young professionals together through service, leadership, and friendship.`;

  const customQuickLinks = (settings?.footerQuickLinks as { label: string; url: string }[]) || [];

  const socialIconClass =
    "text-parchment/50 hover:text-gold transition-colors duration-300 p-2.5 border border-parchment/15 hover:border-gold/40 rounded-full";

  return (
    <footer id="footer" className="bg-chapter text-parchment/70" data-thadam-dark>
      <MaxWidthWrapper>
        {/* Manifesto — the final chord */}
        <div className="pt-24 md:pt-32 pb-16 md:pb-24 border-b border-parchment/10">
          <div className="flex items-center gap-3 text-gold mb-8">
            <FootprintGlyph />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Thadam · 2026–27</span>
          </div>
          <p className="font-display font-medium text-parchment tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,7vw,5rem)] max-w-4xl text-balance">
            {manifesto}
          </p>
        </div>

        {/* Sitemap + contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12 py-16">
          <div className="lg:col-span-5 space-y-6">
            <p className="font-display font-semibold text-parchment text-xl tracking-[-0.01em]">
              {club?.name || appName}
              <span className="text-brand">.</span>
            </p>
            <p className="text-[15px] leading-relaxed max-w-sm">{footerDesc}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              {club?.email && (
                <a href={`mailto:${club.email}`} className={socialIconClass} title="Email">
                  <Mail className="w-4 h-4" />
                </a>
              )}
              {orgLinkedin && (
                <a href={orgLinkedin} target="_blank" rel="noopener noreferrer" className={socialIconClass} title="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {orgInstagram && (
                <a href={orgInstagram} target="_blank" rel="noopener noreferrer" className={socialIconClass} title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {orgYoutube && (
                <a href={orgYoutube} target="_blank" rel="noopener noreferrer" className={socialIconClass} title="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-2 gap-10 lg:gap-8">
            {customQuickLinks.length > 0 ? (
              <div className="col-span-2 space-y-6">
                <h4 className="text-parchment text-xs font-semibold tracking-[0.18em] uppercase">Quick Links</h4>
                <div className="grid grid-cols-2 gap-4 text-[15px]">
                  {customQuickLinks.map((link, idx) => (
                    <Link key={idx} href={link.url} className="thadam-link w-fit hover:text-parchment transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <h4 className="text-parchment text-xs font-semibold tracking-[0.18em] uppercase">Explore</h4>
                  <div className="flex flex-col gap-3.5 text-[15px]">
                    <Link href="/about" className="thadam-link w-fit hover:text-parchment transition-colors">About us</Link>
                    <Link href="/projects" className="thadam-link w-fit hover:text-parchment transition-colors">Our work</Link>
                    <Link href="/events" className="thadam-link w-fit hover:text-parchment transition-colors">Events</Link>
                    <Link href="/gallery" className="thadam-link w-fit hover:text-parchment transition-colors">Gallery</Link>
                    <Link href="/team" className="thadam-link w-fit hover:text-parchment transition-colors">People</Link>
                    {settings?.enableAnnouncements !== false && (
                      <Link href="/announcements" className="thadam-link w-fit hover:text-parchment transition-colors">Notice board</Link>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-parchment text-xs font-semibold tracking-[0.18em] uppercase">Get Involved</h4>
                  <div className="flex flex-col gap-3.5 text-[15px]">
                    {settings?.enableJoin !== false && (
                      <Link href="/join" className="thadam-link w-fit hover:text-parchment transition-colors">Join us</Link>
                    )}
                    <Link href="/events" className="thadam-link w-fit hover:text-parchment transition-colors">Attend an event</Link>
                    {settings?.enablePartner !== false && (
                      <Link href="/partner" className="thadam-link w-fit hover:text-parchment transition-colors">Partner with us</Link>
                    )}
                    <Link href={ROUTES.ADMIN} className="thadam-link w-fit hover:text-parchment transition-colors">Admin portal</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Affiliation + legal */}
        <div className="border-t border-parchment/10 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px]">
          <div className="space-y-1.5 text-center md:text-left">
            <p>
              <span className="font-semibold" style={{ color: "#D41367" }}>Rotaract</span>
              <span className="text-parchment/50"> · Part of Rotary International</span>
            </p>
            <p className="text-parchment/40">
              &copy; {new Date().getFullYear()} {club?.name || appName}. All rights reserved. · Developed with ❤️ by{" "}
              <a
                href="https://www.rprakashdass.in"
                target="_blank"
                rel="noopener noreferrer"
                className="thadam-link text-parchment/60 hover:text-parchment"
              >
                Prakash Dass R
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="thadam-link hover:text-parchment transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="thadam-link hover:text-parchment transition-colors">Terms of Service</Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
