import { getPublicEvent } from "@/features/public/queries/getPublicEvent";
import { Metadata } from "next";
import Image from "next/image";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Camera, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import PublicEventRegister from "../_components/PublicEventRegister";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getPublicEvent(resolvedParams.slug);

  if (data.error || !data.event) {
    return { title: "Event Not Found" };
  }

  const { event } = data;
  const title = `${event.title} | Rotaract Club`;
  const description = event.description ? event.description.substring(0, 160) : `Check out ${event.title}`;
  const eventAny = event as any;
  const imageUrl = eventAny.media?.find((m: any) => m.isCover)?.url || eventAny.media?.[0]?.url || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1600";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getPublicEvent(resolvedParams.slug);

  if (data.error || !data.event) {
    notFound();
  }

  const { event } = data;
  const eventAny = event as any;
  const eventDate = new Date(eventAny.startDate);
  const isPast = eventDate < new Date() || eventAny.status === "COMPLETED";

  const featuredMedia = eventAny.media?.filter((m: any) => m.isFeatured) || [];
  const bannerImage =
    eventAny.media?.find((m: any) => m.id === eventAny.bannerMediaId)?.url ||
    featuredMedia[0]?.url ||
    eventAny.media?.[0]?.url ||
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1600";
  const posterImage =
    eventAny.media?.find((m: any) => m.id === eventAny.posterMediaId)?.url ||
    featuredMedia[1]?.url ||
    featuredMedia[0]?.url;
  const gallery = eventAny.media || [];

  // Registration state for the logged-in viewer, if any
  const session = await getSession();
  let member: { id: string } | null = null;
  let isRegistered = false;
  if (session?.id) {
    member = await prisma.member.findUnique({ where: { userId: session.id }, select: { id: true } });
    if (member) {
      const registration = await prisma.registration.findUnique({
        where: { eventId_memberId: { eventId: eventAny.id, memberId: member.id } },
      });
      isRegistered = !!registration;
    }
  }
  const isFull = !!eventAny.capacity && eventAny.registeredCount >= eventAny.capacity;

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-32">
      {/* Event Header Banner */}
      <div className="w-full h-[40vh] md:h-[45vh] relative bg-slate-900">
        <Image
          src={bannerImage}
          alt={eventAny.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/30 to-transparent" />
        
        <MaxWidthWrapper className="absolute inset-x-0 bottom-0 pb-10">
          <div className="max-w-4xl space-y-4">
            <div className="flex gap-2">
              <Badge className="bg-primary text-white border-none px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                {event.type || "General"}
              </Badge>
              {isPast ? (
                <Badge className="bg-white/10 text-white border-none px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                  Event Memories
                </Badge>
              ) : (
                <Badge className="bg-secondary text-white border-none px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                  Upcoming Opportunity
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="mt-12 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Logistics Sidebar */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-6">
            
            {/* Logistics Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm space-y-6">
              <h3 className="font-black text-[#0B132B] text-lg uppercase tracking-wider border-b border-slate-100 pb-3">Logistics</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-sm font-bold text-[#0B132B]">
                      {eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                    <p className="text-sm font-bold text-[#0B132B]">
                      {event.startTime ? new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Time TBA"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2.5 rounded-lg shrink-0 text-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-sm font-bold text-[#0B132B] leading-snug">{event.location || "Venue TBA"}</p>
                  </div>
                </div>
              </div>

              {/* Action register box for upcoming */}
              {!isPast && eventAny.registrationEnabled && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  {member ? (
                    <PublicEventRegister
                      eventId={eventAny.id}
                      memberId={member.id}
                      isRegistered={isRegistered}
                      isFull={isFull}
                    />
                  ) : (
                    <>
                      <Link href={`/auth/login?redirect=/events/${eventAny.slug}`} className="block">
                        <Button className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold rounded-full py-5 text-sm shadow-sm transition-all transform hover:-translate-y-0.5">
                          Register via Portal
                        </Button>
                      </Link>
                      <p className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Log in to your portal to RSVP.</p>
                    </>
                  )}
                  {eventAny.capacity && (
                    <p className="text-center text-xs text-slate-400 font-bold">
                      {Math.max(eventAny.capacity - eventAny.registeredCount, 0)} of {eventAny.capacity} spots left
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Poster for Upcoming */}
            {!isPast && posterImage && (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 bg-white p-2">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image src={posterImage} alt="Event Poster" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-contain" />
                </div>
              </div>
            )}

            {/* Organizing Team */}
            {eventAny.members && eventAny.members.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm space-y-6">
                <h3 className="font-black text-[#0B132B] text-lg uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Organizing Team
                </h3>
                <div className="space-y-4">
                  {eventAny.members.map((em: any) => (
                    <div key={em.id} className="flex items-center gap-3.5 p-3 bg-[#FAF9F6] rounded-xl border border-slate-200/40">
                      <MemberAvatar
                        name={em.member.name}
                        avatarUrl={em.member.avatar}
                        className="w-10 h-10 border border-slate-200/60 rounded-full"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-800 leading-tight">{em.member.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{em.role.replace("_", " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Main Context Area */}
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1 space-y-12">
            
            {!isPast ? (
              // UPCOMING EVENT VIEW
              <section className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200/60 shadow-sm">
                <h2 className="text-2xl font-black text-[#0B132B] mb-4">About This Event</h2>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                  {event.description ? (
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  ) : (
                    <p className="italic text-slate-400">Operational details and descriptions will be posted shortly.</p>
                  )}
                </div>
              </section>
            ) : (
              // COMPLETED EVENT MEMORIES VIEW
              <>
                <section className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200/60 shadow-sm">
                  <h2 className="text-2xl font-black text-[#0B132B] mb-4">The Story</h2>
                  <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                    {event.description ? (
                      <p className="whitespace-pre-wrap">{event.description}</p>
                    ) : (
                      <p className="italic text-slate-400">Highlights and operations notes from this event are archived.</p>
                    )}
                  </div>
                </section>

                {/* Event Highlights Panel */}
                <section className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-lg font-black text-[#0B132B] mb-6 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Highlights
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Participants</span>
                      <span className="text-2xl font-black text-[#0B132B]">{eventAny.registeredCount ?? 0}</span>
                    </div>
                    {eventAny.volunteerHours && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volunteer Hours</span>
                        <span className="text-2xl font-black text-emerald-600">{eventAny.volunteerHours} hours</span>
                      </div>
                    )}
                    {eventAny.members && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Organizers</span>
                        <span className="text-2xl font-black text-[#0B132B]">{eventAny.members.length} members</span>
                      </div>
                    )}
                  </div>
                </section>
                
                {/* Event Memories Gallery Grid */}
                {gallery.length > 0 && (
                  <section className="space-y-6">
                    <h2 className="text-2xl font-black text-[#0B132B] flex items-center gap-2.5">
                      <Camera className="w-6 h-6 text-primary" />
                      Moments Captured
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {gallery.map((m: any) => (
                        <div 
                          key={m.id} 
                          className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200/30 relative group shadow-sm"
                        >
                          <Image 
                            src={m.url} 
                            alt="Memory moment" 
                            fill 
                            sizes="(max-width: 768px) 50vw, 25vw" 
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Associated Project / Cause context */}
            {eventAny.project && (
              <section className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <span className="inline-block text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/5 px-3 py-1 rounded-full">
                    Part of Long-Term Initiative
                  </span>
                  <h3 className="text-xl font-black text-[#0B132B]">{eventAny.project.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-2">
                    {eventAny.project.description}
                  </p>
                  <Link href={`/projects/${eventAny.project.slug}`} className="inline-block pt-2">
                    <Button variant="outline" className="rounded-full border border-slate-300 text-slate-700 hover:text-secondary hover:bg-slate-50 transition-all text-xs font-bold">
                      View full Cause Initiative &rarr;
                    </Button>
                  </Link>
                </div>
              </section>
            )}

          </div>

        </div>
      </MaxWidthWrapper>
    </main>
  );
}
