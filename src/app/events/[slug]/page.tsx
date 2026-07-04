import { prisma } from "@/lib/prisma";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Repeat } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import RegisterButton from "../_components/RegisterButton";

export default async function InitiativeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  let memberId = null;

  if (session) {
    const member = await prisma.member.findUnique({ where: { userId: session.id }});
    if (member) memberId = member.id;
  }

  let initiative = await prisma.initiative.findFirst({
    where: { slug },
    include: {
      events: {
        orderBy: {
          startDate: "desc",
        },
        include: {
          attendees: memberId ? { where: { memberId } } : false
        }
      },
    },
  });

  if (!initiative) {
    const event = await prisma.event.findFirst({
      where: { slug },
      include: {
        initiative: true,
        attendees: memberId ? { where: { memberId } } : false
      }
    });

    if (event) {
      if (event.initiative) {
        redirect(`/events/${event.initiative.slug}`);
      } else {
        initiative = {
          title: event.title,
          description: event.description || "",
          frequency: "ONCE",
          imageUrl: event.imageUrl,
          events: [event as any]
        } as any;
      }
    } else {
      notFound();
    }
  }

  const isStandaloneEvent = initiative.frequency === "ONCE";

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-8">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to {isStandaloneEvent ? "events" : "initiatives"}
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  <Repeat className="h-3.5 w-3.5" />
                  {isStandaloneEvent ? "Standalone Event" : `${initiative.frequency.toLowerCase()} initiative`}
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                  {initiative.title}
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {initiative.description || `This ${isStandaloneEvent ? "event" : "initiative"} has no description yet.`}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                {!isStandaloneEvent && (
                  <div className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-card px-3 py-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{initiative.events.length} event instances</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-card px-3 py-2">
                  <Repeat className="h-4 w-4 text-primary" />
                  <span>{initiative.frequency.toLowerCase()}</span>
                </div>
              </div>

              {!isStandaloneEvent && (
                <div className="rounded-3xl border border-primary/10 bg-card p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">About this initiative</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The initiative itself is the parent card users see on the home page. Each item below is a manually created event instance tied to the same initiative.
                  </p>
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-card shadow-xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={initiative.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200"}
                  alt={initiative.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <div className="p-6 space-y-3">
                {!isStandaloneEvent && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Manual event instances below</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isStandaloneEvent 
                    ? "Join us for this single event. Register below to reserve your spot!"
                    : "Each instance keeps its own date, place, and status so the initiative stays as a single card while still showing the full history."
                  }
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {isStandaloneEvent ? "Event Details" : "All event instances"}
            </h2>

            {initiative.events.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-primary/20 bg-card/60 p-8 text-sm text-muted-foreground">
                No event instances have been created for this initiative yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {initiative.events.map((event) => (
                  <article key={event.id} className="rounded-3xl border border-primary/10 bg-card p-5 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-foreground line-clamp-1">{event.title}</h3>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {event.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {event.description || "No description added for this event instance."}
                      </p>
                      <div className="space-y-2 border-t border-primary/10 pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{new Date(event.startDate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location || "Location not set"}</span>
                        </div>
                      </div>
                      
                      {event.minutes && (
                        <div className="mt-4 pt-4 border-t border-primary/10">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Meeting Minutes</h4>
                          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap font-sans">
                            {event.minutes}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-primary/10 flex justify-end">
                        <RegisterButton 
                          eventId={event.id} 
                          isRegistered={event.attendees?.length > 0} 
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
