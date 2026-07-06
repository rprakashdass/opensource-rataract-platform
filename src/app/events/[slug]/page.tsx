import { prisma } from "@/lib/prisma";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Briefcase } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import RegisterButton from "../_components/RegisterButton";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  let memberId = null;

  if (session) {
    const member = await prisma.member.findUnique({ where: { userId: session.id } });
    if (member) memberId = member.id;
  }

  const event = await prisma.event.findFirst({
    where: { slug },
    include: {
      project: true,
      registrations: memberId ? { where: { memberId } } : false
    }
  });

  if (!event) {
    notFound();
  }

  const isRegistered = event.registrations && event.registrations.length > 0;

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-8">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          {/* Hero: stacks on mobile, side-by-side on lg */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  Event
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
                  {event.title}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {event.description || "This event has no description yet."}
                </p>
              </div>

              {event.project && (
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-primary/10 bg-card">
                  <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Part of Project</h3>
                    <p className="text-xs text-muted-foreground">{event.project.title}</p>
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-primary/10 bg-card p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground">Details & Logistics</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{new Date(event.startDate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{event.location || "Location not set"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/10 flex justify-start">
                  <RegisterButton
                    eventId={event.id}
                    isRegistered={isRegistered}
                  />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-card shadow-xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={event.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
