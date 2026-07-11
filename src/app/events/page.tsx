import { getPublicEvents } from "@/features/public/queries/getPublicEvents";
import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { PageHero } from "@/components/ui/public/PageHero";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Calendar, Clock, MapPin, Image as ImageIcon, Users, ArrowRight, Sparkles } from "lucide-react";
import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { CmsText } from "@/components/cms/CmsText";

interface EventsCopy {
  eventsEyebrow?: string | null;
  eventsSubtitle?: string | null;
  eventsUpcomingTitle?: string | null;
  eventsCompletedTitle?: string | null;
  eventsCompletedCTA?: string | null;
}

function EventsGridSkeleton() {
  return (
    <MaxWidthWrapper className="max-w-7xl mx-auto py-24 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[550px] bg-white rounded-[2rem] overflow-hidden border border-slate-100 p-6 space-y-6">
            <Skeleton className="h-[240px] w-full rounded-2xl" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isPreview = resolvedParams?.preview === "true";

  const club = await getCurrentClub();
  const settings = club ? await getOrCreateWebsiteSettings(club.id) : null;
  const heroCopy: EventsCopy = {
    eventsEyebrow: settings?.eventsEyebrow,
    eventsSubtitle: settings?.eventsSubtitle,
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <PageHero
        eyebrow={<CmsText channel="events" initial={heroCopy} field="eventsEyebrow" fallback="Calendar" isPreview={isPreview} />}
        title="Join us in action."
        subtitle={<CmsText channel="events" initial={heroCopy} field="eventsSubtitle" fallback="Discover upcoming events to connect and serve, or browse archives of our completed moments." isPreview={isPreview} />}
      />

      <Suspense fallback={<EventsGridSkeleton />}>
        <EventsGrid isPreview={isPreview} />
      </Suspense>
    </main>
  );
}

async function EventsGrid({ isPreview }: { isPreview: boolean }) {
  const data = await getPublicEvents();

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F6]">
        <div className="text-center text-slate-500 font-medium">Failed to load events.</div>
      </div>
    );
  }

  const upcomingEvents = data.upcomingEvents || [];
  const completedEvents = data.completedEvents || [];
  const copy: EventsCopy = data.settings || {};

  return (
    <>
      {/* UPCOMING EVENTS (RICH PREMIUM AESTHETIC) */}
      <section className="py-32 px-6 md:px-12 bg-[#FAF9F6] relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#F7A800]/5 to-transparent blur-[120px] pointer-events-none" />
        
        <MaxWidthWrapper className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#003DA5] bg-[#003DA5]/10 px-4 py-2 rounded-full inline-block mb-6">
                Upcoming Opportunities
              </span>
              <h2 className="text-4xl md:text-6xl font-medium text-[#0B132B] tracking-tight">
                <CmsText channel="events" initial={copy} field="eventsUpcomingTitle" fallback="Calendar & Meetings." isPreview={isPreview} />
              </h2>
            </div>
            <p className="text-slate-500 text-lg font-medium max-w-md md:text-right">
              Join us for our next service drive or fellowship gathering.
            </p>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event: any) => {
                const eventDate = new Date(event.startDate);
                const poster = event.media?.find((m: any) => m.id === event.bannerMediaId) || event.media?.[0];
                const imageUrl = getGoogleDriveDirectLink(poster?.url) || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800";
                
                return (
                  <Link 
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group flex flex-col h-[600px] bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 relative"
                  >
                    {/* Event Banner */}
                    <div className="h-[280px] w-full bg-slate-50 relative overflow-hidden shrink-0">
                      <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-[1.08] transition-transform duration-1000"
                      />
                      {/* Glassmorphism Badge */}
                      <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/40 text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg">
                        {event.type}
                      </div>
                    </div>

                    {/* Event Detail */}
                    <div className="p-8 flex flex-col flex-1 bg-white relative">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 text-xs text-[#F7A800] font-black uppercase tracking-widest">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#0B132B] leading-tight group-hover:text-[#003DA5] transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
                          {event.description || "Join us for this upcoming session. Operational details are coordinate driven."}
                        </p>
                      </div>

                      <div className="pt-6 mt-auto space-y-4 border-t border-slate-100/60">
                        <div className="space-y-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{event.startTime ? new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Time TBA"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">{event.location || "Venue TBA"}</span>
                          </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100/60">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                            {event.registeredCount || 0} RSVPs
                          </span>
                          <span className="bg-[#0B132B] text-white hover:bg-[#F7A800] hover:text-[#0B132B] font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors flex items-center gap-1 shadow-md">
                            Register <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-24 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
              <Calendar className="w-12 h-12 text-[#F7A800] mx-auto mb-6 opacity-80" />
              <h3 className="text-3xl font-medium text-[#0B132B] mb-4">Clear horizons.</h3>
              <p className="text-slate-500 font-medium text-lg">
                No upcoming events are scheduled at this exact moment. Check back soon for meetings and volunteer calls!
              </p>
            </div>
          )}
        </MaxWidthWrapper>
      </section>

      {/* PAST EVENTS */}
      <section className="py-32 px-6 md:px-12 bg-white text-[#0B132B] border-t border-slate-200/50">
        <MaxWidthWrapper className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-100 px-4 py-2 rounded-full inline-block mb-6">
                Event Memories
              </span>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tight">
                <CmsText channel="events" initial={copy} field="eventsCompletedTitle" fallback="Completed archives." isPreview={isPreview} />
              </h2>
            </div>
            <p className="text-slate-500 text-lg font-medium max-w-md md:text-right">
              A log of our past gatherings, operations, and the stories we created.
            </p>
          </div>

          {completedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedEvents.map((event: any) => {
                const poster = event.media?.find((m: any) => m.id === event.bannerMediaId) || event.media?.[0];
                const imageUrl = getGoogleDriveDirectLink(poster?.url) || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800";
                const photoPreview = event.media?.slice(0, 4) || [];
                const eventDate = new Date(event.startDate);
                
                return (
                  <Link 
                    href={`/events/${event.slug}`} 
                    key={event.id}
                    className="group flex flex-col h-[550px] bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 relative"
                  >
                    <div className="h-[240px] w-full bg-slate-200 relative overflow-hidden shrink-0">
                      <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-80 group-hover:scale-[1.08] group-hover:opacity-100 transition-all duration-1000"
                      />
                      <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm">
                        Completed
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="space-y-4 flex-1">
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                          {eventDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                        <h3 className="text-2xl font-bold text-[#0B132B] leading-tight group-hover:text-[#003DA5] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
                          {event.description || "A completed community operations drive."}
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col gap-6">
                        {/* Metric highlights */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> {event.registeredCount || 20} Attended</span>
                          {event.volunteerHours && (
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {event.volunteerHours} Hours</span>
                          )}
                        </div>

                        {/* Gallery preview inside card */}
                        {photoPreview.length > 0 && (
                          <div className="flex gap-3 items-center">
                            <div className="flex -space-x-3 overflow-hidden">
                              {photoPreview.map((media: any) => (
                                <div key={media.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden relative bg-slate-200 shrink-0">
                                  <Image src={getGoogleDriveDirectLink(media.url)} alt="Memory preview" fill sizes="30px" className="object-cover" />
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" /> Gallery
                            </span>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                           <span className="w-10 h-10 rounded-full bg-white group-hover:bg-[#0B132B] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-transparent">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-400 font-medium text-center py-20 text-lg">
              No past events recorded.
            </div>
          )}
        </MaxWidthWrapper>
      </section>
    </>
  );
}
