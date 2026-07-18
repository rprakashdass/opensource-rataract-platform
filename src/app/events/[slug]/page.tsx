import { getPublicEvent } from "@/features/public/queries/getPublicEvent";
import { Metadata } from "next";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import PublicEventRegister from "../_components/PublicEventRegister";
import {
  RevealBlock,
  Eyebrow,
  EditorialImage,
  PersonCard,
  ImpactBand,
  PillLink,
  QuietLink,
  TrailRule,
} from "@/components/ui/public/v2";
import type { ImpactMetric } from "@/components/ui/public/v2";

export const revalidate = 300;

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
  const imageUrl: string | undefined =
    eventAny.media?.find((m: any) => m.isCover)?.url || eventAny.media?.[0]?.url || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function humanizeRole(role: string) {
  const words = role.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
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
  const bannerImage: string | null =
    eventAny.media?.find((m: any) => m.id === eventAny.bannerMediaId)?.url ||
    featuredMedia[0]?.url ||
    eventAny.media?.[0]?.url ||
    null;
  const posterImage: string | null =
    eventAny.media?.find((m: any) => m.id === eventAny.posterMediaId)?.url ||
    featuredMedia[1]?.url ||
    featuredMedia[0]?.url ||
    null;
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

  const longDate = eventDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const monthYear = eventDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const startTime = event.startTime
    ? new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const team: any[] = eventAny.members || [];

  const teamSection = team.length > 0 && (
    <section className="py-20 md:py-28 bg-paper">
      <MaxWidthWrapper>
        <RevealBlock className="mb-10 md:mb-14">
          <Eyebrow className="mb-4">{isPast ? "Who made it happen" : "Organizing team"}</Eyebrow>
          <h2 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.1] text-[clamp(1.7rem,3.5vw,2.6rem)] text-balance">
            {isPast ? "The hands behind this one." : "The people to look for on the day."}
          </h2>
        </RevealBlock>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {team.map((em: any, i: number) => (
            <RevealBlock key={i}>
              <PersonCard
                name={em.member.name}
                role={humanizeRole(em.role)}
                photoUrl={em.member.avatar}
                compact
              />
            </RevealBlock>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );

  const projectSection = eventAny.project && (
    <section className="py-16 md:py-20 bg-wash">
      <MaxWidthWrapper>
        <RevealBlock className="max-w-2xl">
          <Eyebrow className="mb-4">Part of a longer walk</Eyebrow>
          <p className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.2] text-[clamp(1.4rem,3vw,2rem)] text-balance">
            This event belongs to {eventAny.project.title}.
          </p>
          <div className="mt-6">
            <QuietLink href={`/projects/${eventAny.project.slug}`}>See the full initiative</QuietLink>
          </div>
        </RevealBlock>
      </MaxWidthWrapper>
    </section>
  );

  if (!isPast) {
    // ── UPCOMING EVENT ──
    return (
      <main className="min-h-screen bg-paper pb-24">
        {/* Compact hero */}
        <section className="pt-40 md:pt-48 pb-12 md:pb-16 bg-paper">
          <MaxWidthWrapper>
            <RevealBlock>
              <Eyebrow className="mb-5">{event.type || "Event"} · Upcoming</Eyebrow>
              <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
                {event.title}
              </h1>
            </RevealBlock>
          </MaxWidthWrapper>
        </section>

        {/* Editorial hero image */}
        <section className="pb-16 md:pb-24 bg-paper">
          <MaxWidthWrapper>
            <RevealBlock>
              <EditorialImage
                src={posterImage || bannerImage}
                alt={event.title}
                ratio="3/2"
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
                caption={[longDate, event.location].filter(Boolean).join(" · ")}
                fallbackText={`${event.title} — ${monthYear}`}
              />
            </RevealBlock>
          </MaxWidthWrapper>
        </section>

        <section className="pb-20 md:pb-28 bg-paper">
          <MaxWidthWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-14 items-start">
              {/* Big serif date + about */}
              <div className="lg:col-span-7">
                <RevealBlock>
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
                    {eventDate.toLocaleDateString(undefined, { weekday: "long" })}
                  </span>
                  <span className="block font-display font-medium text-ink leading-none tabular-nums text-[clamp(3.5rem,8vw,6rem)] mt-2">
                    {eventDate.getDate()}
                  </span>
                  <span className="block font-display font-medium italic text-2xl text-ink-soft mt-2">
                    {monthYear}
                  </span>
                </RevealBlock>

                <RevealBlock className="mt-12">
                  <h2 className="font-display font-medium text-ink tracking-[-0.01em] text-2xl md:text-3xl mb-5">
                    About this event
                  </h2>
                  {event.description ? (
                    <p className="whitespace-pre-wrap text-[15px] md:text-base text-ink-soft leading-relaxed max-w-xl">
                      {event.description}
                    </p>
                  ) : (
                    <p className="font-display font-medium italic text-ink-faint text-lg">
                      Details are still being written — the plan will be posted here shortly.
                    </p>
                  )}
                </RevealBlock>
              </div>

              {/* Logistics rail + registration */}
              <div className="lg:col-span-4 lg:col-start-9 space-y-10">
                <RevealBlock>
                  <div className="border-t border-hairline">
                    <div className="py-5 border-b border-hairline">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1.5">When</p>
                      <p className="font-display font-medium text-lg text-ink leading-snug">{longDate}</p>
                      {startTime && <p className="text-[13px] font-medium text-ink-faint mt-1">{startTime}</p>}
                    </div>
                    <div className="py-5 border-b border-hairline">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1.5">Where</p>
                      {eventAny.meetingLink ? (
                        <div className="space-y-2">
                          <p className="font-display font-medium text-lg text-ink leading-snug">Online</p>
                          <a
                            href={eventAny.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 10l4.553-2.277A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14v-4zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                            Join Meeting
                          </a>
                        </div>
                      ) : (
                        <p className="font-display font-medium text-lg text-ink leading-snug">
                          {event.location || "Venue to be announced"}
                        </p>
                      )}
                    </div>

                  </div>
                </RevealBlock>

                {eventAny.registrationEnabled && (
                  <RevealBlock>
                    <div className="bg-wash rounded-xl p-8 space-y-5">
                      <p className="font-display font-medium text-xl text-ink leading-snug text-balance">
                        Save yourself a place.
                      </p>
                      {member ? (
                        <PublicEventRegister
                          eventId={eventAny.id}
                          memberId={member.id}
                          isRegistered={isRegistered}
                          isFull={isFull}
                        />
                      ) : (
                        <div className="space-y-3">
                          <PillLink href={`/auth/login?redirect=/events/${eventAny.slug}`} className="w-full">
                            Register via portal
                          </PillLink>
                          <p className="text-[13px] text-ink-faint leading-relaxed">
                            Log in to your member portal to RSVP.
                          </p>
                        </div>
                      )}
                      {eventAny.capacity && (
                        <p className="text-[13px] font-medium text-ink-faint">
                          {Math.max(eventAny.capacity - eventAny.registeredCount, 0)} of {eventAny.capacity} spots left
                        </p>
                      )}
                    </div>
                  </RevealBlock>
                )}
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        {teamSection}
        {projectSection}
      </main>
    );
  }

  // ── PAST EVENT ──
  const highlightMetrics: ImpactMetric[] = [
    eventAny.registeredCount ? { value: eventAny.registeredCount, label: "People took part" } : null,
    eventAny.volunteerHours ? { value: eventAny.volunteerHours, label: "Volunteer hours" } : null,
    team.length > 0 ? { value: team.length, label: "Organizers" } : null,
  ].filter(Boolean) as ImpactMetric[];

  const moments = gallery.slice(0, 6);

  return (
    <main className="min-h-screen bg-paper pb-24">
      {/* Compact hero */}
      <section className="pt-40 md:pt-48 pb-12 md:pb-16 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow className="mb-5">{event.type || "Event"} · {monthYear}</Eyebrow>
            <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              {event.title}
            </h1>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      {/* Hero photo */}
      <section className="pb-16 md:pb-24 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <EditorialImage
              src={bannerImage}
              alt={event.title}
              ratio="3/2"
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
              caption={[longDate, event.location].filter(Boolean).join(" · ")}
              fallbackText={`${event.title} — ${monthYear}`}
            />
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      {/* The story */}
      <section className="pb-20 md:pb-28 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock className="max-w-2xl">
            <Eyebrow className="mb-4">The story</Eyebrow>
            <h2 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.15] text-[clamp(1.7rem,3.5vw,2.6rem)] text-balance mb-8">
              How the day unfolded.
            </h2>
            {event.description ? (
              <p className="whitespace-pre-wrap text-[15px] md:text-base text-ink-soft leading-relaxed">
                {event.description}
              </p>
            ) : (
              <p className="font-display font-medium italic text-ink-faint text-lg">
                The write-up for this one is still on its way — the photos below tell most of it.
              </p>
            )}
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      {/* Highlights */}
      {highlightMetrics.length > 0 && (
        <ImpactBand
          kicker="What this event left behind"
          metrics={highlightMetrics}
          condensed
        />
      )}

      {/* Moments */}
      {moments.length > 0 && (
        <section className="py-20 md:py-28 bg-paper">
          <MaxWidthWrapper>
            <RevealBlock className="mb-10 md:mb-14">
              <Eyebrow className="mb-4">Moments</Eyebrow>
              <h2 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.1] text-[clamp(1.7rem,3.5vw,2.6rem)] text-balance">
                A few frames worth keeping.
              </h2>
            </RevealBlock>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {moments.map((m: any, i: number) => (
                <EditorialImage
                  key={m.id}
                  src={m.url}
                  alt={`${event.title} — moment ${i + 1}`}
                  ratio={i % 3 === 0 ? "3/2" : "4/5"}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  caption={`${event.title} · ${monthYear}`}
                />
              ))}
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      <MaxWidthWrapper>
        <TrailRule />
      </MaxWidthWrapper>

      {teamSection}
      {projectSection}
    </main>
  );
}
