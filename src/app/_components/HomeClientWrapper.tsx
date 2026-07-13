"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Heart } from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Hero } from "@/components/ui/public/Hero";
import { MetricStrip } from "@/components/ui/public/MetricStrip";
import { StoryCard } from "@/components/ui/public/StoryCard";
import { GalleryMasonry } from "@/components/ui/public/GalleryMasonry";
import { EditorialSection } from "@/components/ui/public/EditorialSection";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { normalizeHomepageSections } from "@/features/public/lib/homepageSections";
import { useCmsPreview } from "@/hooks/useCmsPreview";

export default function HomeClientWrapper({
  initialData,
  photos,
  featuredProjects,
  upcomingEvents,
  latestUpdates,
  isPreview,
  fallbackImpact,
}: {
  initialData: any;
  photos: any[];
  featuredProjects: any[];
  upcomingEvents: any[];
  latestUpdates: any[];
  isPreview: boolean;
  fallbackImpact: { members: number; projects: number; hours: number; events: number };
}) {
  const data = useCmsPreview(initialData, {
    enabled: isPreview,
    channel: "homepage",
    merge: (prev, payload) => ({
      ...prev,
      settings: { ...prev.settings, ...payload.settings },
      metrics: payload.metrics || prev.metrics,
    }),
  });

  const { club, settings, metrics } = data;

  const sectionsConfig = normalizeHomepageSections(settings?.homepageSections);

  const sortedSections = [...sectionsConfig]
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col overflow-x-hidden">
      {/* Brand dynamic style overrides specifically for live preview / customized theme */}
      {isPreview && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary: ${settings?.primaryColor || "#F7A800"};
                --color-secondary: ${settings?.secondaryColor || "#003DA5"};
                --color-accent: ${settings?.accentColor || "#FAF9F6"};
                --color-foreground: ${settings?.darkColor || "#0B132B"};
                --color-background: ${settings?.lightColor || "#FAF9F6"};
              }
            `,
          }}
        />
      )}

      {sortedSections.map((sec) => {
        const content = (() => {
        switch (sec.id) {
          case "hero":
            const heroHeadline = settings?.heroHeadline || club.name;
            const heroSubtitle = settings?.heroSubtitle || club.missionStatement || "Empowering students and young professionals through service and leadership.";
            const heroCTA = settings?.heroCTA || "Join Us Today";
            const heroCTALink = settings?.heroCTALink || "/join";
            const heroSecCTA = settings?.heroSecondaryCTA || "Sponsor Us";
            const heroSecCTALink = settings?.heroSecondaryCTALink || "/partner";
            const heroImages = (settings?.heroImages as string[]) || [];

            const displayPhotos = heroImages && heroImages.length > 0
              ? heroImages.map((url, i) => ({ id: `hero-img-${i}`, url, title: null }))
              : [];

            return (
              <Hero
                key="hero"
                clubName={heroHeadline}
                missionStatement={heroSubtitle}
                tenureYear={club.tenureYear}
                ctaText={heroCTA}
                ctaLink={heroCTALink}
                secondaryCtaText={heroSecCTA}
                secondaryCtaLink={heroSecCTALink}
                photos={displayPhotos}
              />
            );

          case "president":
            const presName = settings?.presName || "The President";
            const presMessage = settings?.presMessage || club.presidentMessage || "We welcome you to our digital home. This year, we are focused on expanding our grassroots footprint, strengthening our fellowship networks, and delivering sustainable community service drives. Join us in making a real, human difference.";
            const presQuote = settings?.presQuote;
            const presPhoto = settings?.presPhoto;
            const presSignature = settings?.presSignature;

            return (
              <EditorialSection
                key="president"
                eyebrow={settings?.aboutEyebrow || `Rotary Year ${club.tenureYear || "2026-27"}`}
                heading={club.aboutTitle || "Growing together. Serving others."}
                description={club.aboutSubtitle || club.visionStatement || undefined}
                background="white"
              >
                <div className="max-w-3xl mx-auto pt-8">
                  <div className="border-t-2 border-black pt-12 relative">
                    <span className="absolute -top-6 left-0 text-6xl text-slate-200 font-serif leading-none select-none">
                      "
                    </span>
                    <blockquote className="text-[#0B132B] font-medium text-xl md:text-2xl leading-relaxed italic relative z-10">
                      {presMessage}
                    </blockquote>

                    {presQuote && (
                      <p className="text-slate-400 mt-4 text-sm font-semibold">— {presQuote}</p>
                    )}

                    <div className="mt-12 flex items-center gap-5">
                      {presPhoto ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden relative shadow-md shrink-0">
                          <Image
                            src={getGoogleDriveDirectLink(presPhoto)}
                            alt={presName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-[#0B132B] rounded-full flex items-center justify-center text-[#F7A800] font-serif text-3xl italic shadow-md shrink-0">
                          {presName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-black text-[#0B132B] text-base uppercase tracking-wider">
                          {presName}
                        </p>
                        <p className="text-sm text-slate-500 font-bold">{club.name}</p>
                        {presSignature && (
                          <div className="mt-2 relative w-32 h-12">
                            <Image
                              src={getGoogleDriveDirectLink(presSignature)}
                              alt="Signature"
                              fill
                              sizes="128px"
                              className="object-contain filter dark:invert"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </EditorialSection>
            );

          case "impact":
            return (
              <div key="impact" className="py-0">
                {metrics && metrics.length > 0 ? (
                  <MetricStrip customMetrics={metrics} />
                ) : (
                  <MetricStrip
                    members={fallbackImpact.members}
                    projects={fallbackImpact.projects}
                    hours={fallbackImpact.hours}
                    events={fallbackImpact.events}
                  />
                )}
              </div>
            );

          case "gallery":
            if (photos.length === 0) return null;
            return (
              <EditorialSection
                key="gallery"
                eyebrow={settings?.galleryTitle || "Club Memories"}
                heading={settings?.gallerySubtitle || "Moments of impact."}
                background="navy"
                className="border-t border-[#0B132B]"
              >
                <div className="flex justify-start md:justify-end mb-8 mt-4 md:-mt-20 relative z-20">
                  <Link
                    href={settings?.galleryCTALink || "/gallery"}
                    className="text-white hover:text-[#F7A800] font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-colors relative z-20"
                  >
                    {settings?.galleryCTA || "Browse Archive"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <GalleryMasonry photos={photos} />
              </EditorialSection>
            );

          case "projects":
            return (
              <EditorialSection
                key="projects"
                eyebrow={settings?.projectsEyebrow || "Flagship Initiatives"}
                heading={settings?.projectsTitle || "Ongoing impact."}
                background="slate"
              >
                <div className="flex justify-start md:justify-end mb-12 mt-4 md:-mt-20 relative z-20">
                  <Link
                    href={settings?.projectsCTALink || "/projects"}
                    className="text-primary hover:text-[#0B132B] font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-colors relative z-20"
                  >
                    {settings?.projectsCTA || "All Initiatives"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {featuredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                    {featuredProjects.map((project: any) => (
                      <StoryCard
                        key={project.id}
                        eyebrow={project.category.replace("_", " ")}
                        title={project.title}
                        imageUrl={
                          getGoogleDriveDirectLink(project.media?.[0]?.url) ||
                          "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"
                        }
                        href={`/projects/${project.slug}`}
                        meta={`${project.members?.length || 0} Volunteers • ${
                          project.events?.reduce((acc: number, e: any) => acc + (e.volunteerHours || 0), 0) || 0
                        } Hours`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/60 max-w-2xl mx-auto shadow-sm">
                    <Heart className="w-12 h-12 text-[#F7A800] mx-auto mb-4 opacity-80" />
                    <h3 className="text-lg font-black text-[#0B132B] mb-2">
                      {settings?.projectsEmptyTitle || "Every great journey starts somewhere."}
                    </h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                      {settings?.projectsEmptyDesc ||
                        "Our first initiatives and community support projects are currently in the planning pipeline."}
                    </p>
                  </div>
                )}
              </EditorialSection>
            );

          case "events_news":
            return (
              <section key="events_news" className="py-28 bg-white border-y border-slate-200/50">
                <MaxWidthWrapper className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {settings?.enableEvents !== false && (
                      <div>
                        <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
                          <div>
                            <h2 className="text-3xl md:text-4xl font-black text-[#0B132B] tracking-tight leading-tight">
                              {settings?.eventsTitle || "Join us this month."}
                            </h2>
                          </div>
                          <Link
                            href="/events"
                            className="text-primary font-black hover:text-[#0B132B] text-xs flex items-center gap-1 uppercase tracking-widest pb-1"
                          >
                            {settings?.eventsRegisterCTA || "View All"}{" "}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        <div className="space-y-4">
                          {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event: any) => {
                              const eventDate = new Date(event.startDate);
                              const monthStr = eventDate.toLocaleString("default", { month: "short" });
                              const dayStr = eventDate.getDate();
                              return (
                                <Link
                                  key={event.id}
                                  href={`/events/${event.slug}`}
                                  className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-[#FAF9F6] border border-transparent hover:border-slate-200/60 transition-all duration-300"
                                >
                                  <div className="flex flex-col items-center justify-center w-16 h-16 shrink-0 bg-[#0B132B] text-white rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F7A800]">
                                      {monthStr}
                                    </span>
                                    <span className="text-2xl font-black leading-none">{dayStr}</span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-black text-[#0B132B] group-hover:text-primary transition-colors">
                                      {event.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                                      {event.location}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })
                          ) : (
                            <div className="bg-[#FAF9F6] rounded-2xl p-8 text-center border border-slate-200/60 shadow-sm mt-4">
                              <p className="text-slate-500 text-sm font-semibold">
                                {settings?.eventsEmptyTitle ||
                                  "Our calendar is clear. Check back soon for new gatherings."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {settings?.enableAnnouncements !== false && (
                      <div>
                        <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
                          <div>
                            <h2 className="text-3xl font-black text-[#0B132B] tracking-tight">
                              {settings?.noticeboardTitle || "Notice Board"}
                            </h2>
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">
                              {settings?.noticeboardEyebrow || "Announcements & Updates"}
                            </p>
                          </div>
                          <Link
                            href="/announcements"
                            className="text-[#003DA5] font-black hover:text-[#0B132B] text-xs flex items-center gap-1 uppercase tracking-widest"
                          >
                            Board <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        <div className="space-y-4">
                          {latestUpdates.length > 0 ? (
                            latestUpdates.map((update: any) => (
                              <Link
                                href={`/announcements`}
                                key={update.id}
                                className="block group bg-[#FAF9F6] p-6 rounded-2xl border border-slate-200/60 hover:shadow-md transition-all duration-300"
                              >
                                <span className="text-[10px] font-black text-[#F7A800] uppercase tracking-widest">
                                  {new Date(update.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <h3 className="text-lg font-black text-[#0B132B] mt-2 group-hover:text-[#003DA5] transition-colors line-clamp-1">
                                  {update.title}
                                </h3>
                                {update.description && (
                                  <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed font-medium">
                                    {update.description}
                                  </p>
                                )}
                              </Link>
                            ))
                          ) : (
                            <div className="bg-[#FAF9F6] rounded-2xl p-12 text-center border border-slate-200/60 shadow-sm">
                              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500 text-sm font-semibold">
                                Official updates will be pinned here.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </MaxWidthWrapper>
              </section>
            );

          case "sponsor":
            return (
              <section
                key="sponsor"
                className="py-24 md:py-32 px-6 md:px-12 bg-white relative overflow-hidden border-t border-slate-200"
              >
                <MaxWidthWrapper>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 relative z-10">
                      <h2 className="text-4xl md:text-6xl font-black text-[#0B132B] leading-tight tracking-tight">
                        {settings?.sponsorsTitle || "Partner for"} <br />
                        <span className="text-[#F7A800]">{settings?.sponsorsSubtitle || "Global Impact."}</span>
                      </h2>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-lg">
                        {settings?.sponsorsMission ||
                          "Support our community initiatives, elevate your brand, and create real impact by partnering with our club as a corporate sponsor."}
                      </p>
                      <div className="pt-4">
                        <Link
                          href={settings?.sponsorsCTALink || "/partner"}
                          className="inline-flex items-center gap-3 bg-[#0B132B] hover:bg-[#F7A800] text-white hover:text-[#0B132B] font-black text-sm uppercase tracking-widest px-10 py-5 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                        >
                          {settings?.sponsorsCTA || "View Sponsorship Packages"}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 hidden lg:block border-[8px] border-white/5">
                      <Image
                        src={settings?.sponsorsImageUrl || "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800"}
                        alt="Community members"
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </MaxWidthWrapper>
              </section>
            );

          default:
            return null;
        }
        })();

        return content ? (
          <div key={sec.id} id={sec.id}>
            {content}
          </div>
        ) : null;
      })}
    </main>
  );
}
