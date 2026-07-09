import { getPublicEvent } from "@/features/public/queries/getPublicEvent";
import { Metadata } from "next";
import Image from "next/image";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Camera, CheckCircle2 } from "lucide-react";
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
    <main className="min-h-screen bg-[#FAFAFA] pb-32">
      {/* Event Banner */}
      <div className="w-full h-[40vh] md:h-[50vh] relative">
        <Image
          src={bannerImage}
          alt={eventAny.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        
        <MaxWidthWrapper className="absolute inset-x-0 bottom-0 pb-12">
          <div className="max-w-4xl space-y-4">
            <div className="flex gap-2">
              <Badge className="bg-amber-500 text-white border-none px-3 py-1 text-sm font-bold shadow-md">{event.type || "General"}</Badge>
              {isPast ? (
                <Badge className="bg-slate-200 text-slate-800 border-none px-3 py-1 text-sm font-bold shadow-md">Completed</Badge>
              ) : (
                <Badge className="bg-emerald-500 text-white border-none px-3 py-1 text-sm font-bold shadow-md">Upcoming</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="mt-12 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Sidebar / Logistics */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-8">
            
            {/* Logistics Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="font-black text-slate-900 text-xl mb-6">Details</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-slate-50 p-3 rounded-xl shrink-0">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="font-bold text-slate-900">{eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-slate-50 p-3 rounded-xl shrink-0">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                    <p className="font-bold text-slate-900">{event.startTime ? new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Time TBA"}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-slate-50 p-3 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="font-bold text-slate-900">{event.location || "Venue TBA"}</p>
                  </div>
                </div>
              </div>

              {!isPast && eventAny.registrationEnabled && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  {member ? (
                    <PublicEventRegister
                      eventId={eventAny.id}
                      memberId={member.id}
                      isRegistered={isRegistered}
                      isFull={isFull}
                    />
                  ) : (
                    <>
                      <Link href={`/auth/login?redirect=/events/${eventAny.slug}`}>
                        <Button className="w-full rounded-full py-6 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-1">
                          Register via Portal
                        </Button>
                      </Link>
                      <p className="text-center text-xs text-slate-500 mt-3 font-medium">Log in to your member portal to RSVP.</p>
                    </>
                  )}
                  {eventAny.capacity && (
                    <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                      {Math.max(eventAny.capacity - eventAny.registeredCount, 0)} of {eventAny.capacity} spots left
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Poster if Upcoming */}
            {!isPast && posterImage && (
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 bg-white">
                <Image src={posterImage} alt="Event Poster" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-contain" />
              </div>
            )}

            {/* Organizing Team */}
            {!isPast && eventAny.members && eventAny.members.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-amber-500" /> Organizing Team
                </h3>
                <div className="space-y-4">
                  {eventAny.members.map((em: any) => (
                    <div key={em.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <MemberAvatar
                        name={em.member.name}
                        avatarUrl={em.member.avatar}
                        className="w-12 h-12 border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{em.member.name}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{em.role.replace("_", " ")}</p>
                        <span className="text-emerald-600 font-bold ml-1 text-xs">{(eventAny.volunteerHours * 29.95).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} value</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1 space-y-16">
            
            {!isPast ? (
              // UPCOMING EVENT VIEW
              <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
                <h2 className="text-3xl font-black text-slate-900 mb-6">About This Event</h2>
                <div className="prose prose-lg prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                  {event.description ? (
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  ) : (
                    <p className="italic text-slate-400">More details about this event will be published soon.</p>
                  )}
                </div>
              </section>
            ) : (
              // COMPLETED EVENT VIEW (Impact & Memories)
              <>
                <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
                  <h2 className="text-3xl font-black text-slate-900 mb-6">Highlights</h2>
                  <div className="prose prose-lg prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                    {event.description ? (
                      <p className="whitespace-pre-wrap">{event.description}</p>
                    ) : (
                      <p className="italic text-slate-400">Highlights for this completed event are being prepared.</p>
                    )}
                  </div>
                </section>

                {eventAny.impactMetrics && (eventAny.volunteerHours > 0 || eventAny.fundsRaised > 0) && (
                  <section className="bg-amber-50 rounded-3xl p-8 md:p-12 border border-amber-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      Event Impact
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {eventAny.volunteerHours && (
                        <div>
                          <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">Vol. Hours</p>
                          <div className="text-2xl font-black text-slate-900">{eventAny.volunteerHours || 0}</div>
                        </div>
                      )}
                      {eventAny.fundsRaised && (
                        <div>
                          <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Funds Raised</p>
                          <div className="text-2xl font-black text-slate-900">{Number(eventAny.fundsRaised || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
                
                {gallery.length > 0 && (
                  <section>
                    <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <Camera className="w-8 h-8 text-amber-500" />
                      Memories
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {gallery.map((m: any) => (
                        <div key={m.id} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm relative">
                          <Image src={m.url} alt="Memory" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover hover:scale-110 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Associated Project */}
            {eventAny.project && (
              <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-none mb-4">Part of Initiative</Badge>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{eventAny.project.title}</h3>
                  <p className="text-slate-600 font-medium mb-8 line-clamp-2">{eventAny.project.description}</p>
                  <Link href={`/projects/${eventAny.project.slug}`}>
                    <Button variant="outline" className="rounded-full bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 px-6">
                      View the full Initiative
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
