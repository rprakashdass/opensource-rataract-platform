export const revalidate = 300;
import { getPublicEvents } from "@/features/public/queries/getPublicEvents";
import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { formatIST } from "@/lib/date-utils";
import { CmsText } from "@/components/cms/CmsText";
import { draftMode } from "next/headers";
import {
  RevealBlock,
  Eyebrow,
  PageIntro,
  SectionLabel,
  TrailRule,
  PillLink,
  StoryCard,
  ListRow,
  EmptyState,
  EditorialImage,
} from "@/components/ui/public/v2";

function eventPoster(event: any): string | null {
  const poster = event.media?.find((m: any) => m.id === event.posterMediaId || m.id === event.bannerMediaId) || event.media?.[0];
  return poster?.url || null;
}

interface EventsCopy {
  eventsEyebrow?: string | null;
  eventsSubtitle?: string | null;
  eventsUpcomingTitle?: string | null;
  eventsCompletedTitle?: string | null;
  eventsCompletedCTA?: string | null;
}

function EventsGridSkeleton() {
  return (
    <MaxWidthWrapper className="py-20 md:py-28 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="h-40 lg:col-span-3 rounded-xl bg-wash" />
        <div className="lg:col-span-9 space-y-4">
          <Skeleton className="h-8 w-2/3 rounded-xl bg-wash" />
          <Skeleton className="h-5 w-1/3 rounded-xl bg-wash" />
          <Skeleton className="h-16 w-full rounded-xl bg-wash" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/5] w-full rounded-xl bg-wash" />
            <Skeleton className="h-6 w-3/4 rounded-xl bg-wash" />
            <Skeleton className="h-4 w-1/2 rounded-xl bg-wash" />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}

export default async function EventsPage() {
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  const club = await getCurrentClub();
  const settings = club ? await getOrCreateWebsiteSettings(club.id) : null;
  const heroCopy: EventsCopy = {
    eventsEyebrow: settings?.eventsEyebrow,
    eventsSubtitle: settings?.eventsSubtitle,
  };

  return (
    <main className="min-h-screen bg-paper flex flex-col overflow-x-clip">
      <PageIntro
        eyebrow={<CmsText channel="events" initial={heroCopy} field="eventsEyebrow" fallback="Events" isPreview={isPreview} />}
        title={<>Come once. You&rsquo;ll come back.</>}
        support={
          <CmsText
            channel="events"
            initial={heroCopy}
            field="eventsSubtitle"
            fallback="Discover upcoming events to connect and serve, or browse archives of our completed moments."
            isPreview={isPreview}
          />
        }
      />

      <Suspense fallback={<EventsGridSkeleton />}>
        <EventsGrid isPreview={isPreview} />
      </Suspense>
    </main>
  );
}

function formatTime(startTime?: string | Date | null) {
  return startTime ? formatIST(startTime, "h:mm a") : null;
}

async function EventsGrid({ isPreview }: { isPreview: boolean }) {
  const data = await getPublicEvents();

  if ("error" in data && data.error) {
    return (
      <section className="py-24 bg-paper">
        <MaxWidthWrapper>
          <EmptyState
            title="The calendar didn't load this time."
            detail="Give the page a refresh in a moment — the events are still there."
          />
        </MaxWidthWrapper>
      </section>
    );
  }

  const eventsData = data as any;
  const upcomingEvents: any[] = eventsData.upcomingEvents || [];
  const completedEvents: any[] = eventsData.completedEvents || [];
  const copy: EventsCopy = eventsData.settings || {};

  const [nextEvent, ...laterEvents] = upcomingEvents;

  return (
    <>
      {/* NEXT UP + upcoming list — hidden entirely when there's nothing scheduled */}
      {upcomingEvents.length > 0 && (
      <section className="py-20 md:py-28 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <SectionLabel>Next up</SectionLabel>
          </RevealBlock>

          {nextEvent ? (
            <RevealBlock>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 items-start border-y border-hairline py-10 md:py-14">
                {/* Serif date block */}
                <div className="lg:col-span-2">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
                      {formatIST(nextEvent.startDate, "EEEE")}
                    </span>
                    <span className="block font-display font-medium text-ink leading-none tabular-nums text-[clamp(3.5rem,8vw,6rem)] mt-2">
                      {formatIST(nextEvent.startDate, "d")}
                    </span>
                    <span className="block font-display font-medium italic text-2xl text-ink-soft mt-2">
                      {formatIST(nextEvent.startDate, "MMMM yyyy")}
                    </span>
                  </div>
                </div>

                {/* Poster / banner */}
                <div className="lg:col-span-4">
                  <EditorialImage
                    src={eventPoster(nextEvent)}
                    alt={nextEvent.title}
                    ratio="4/5"
                    fallbackText={nextEvent.title}
                    priority
                  />
                </div>

                {/* Title + logistics + description */}
                <div className="lg:col-span-4">
                  <h3 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.15] text-[clamp(1.6rem,3.5vw,2.4rem)] text-balance">
                    {nextEvent.title}
                  </h3>
                  <p className="mt-3 text-[13px] font-medium text-ink-faint">
                    {[formatTime(nextEvent.startTime), nextEvent.location || "Venue to be announced"]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {nextEvent.description && (
                    <p className="mt-5 text-[15px] text-ink-soft leading-relaxed line-clamp-3 max-w-xl">
                      {nextEvent.description}
                    </p>
                  )}
                  <div className="mt-6">
                    <PillLink href={`/events/${nextEvent.slug}`}>
                      {nextEvent.capacity ? "RSVP" : "View event"}
                    </PillLink>
                  </div>
                </div>
              </div>
            </RevealBlock>
          ) : null}

          {laterEvents.length > 0 && (
            <RevealBlock className="mt-14 md:mt-20">
              <Eyebrow className="mb-6">And after that</Eyebrow>
              <div>
                {laterEvents.map((event) => (
                  <ListRow
                    key={event.id}
                    href={`/events/${event.slug}`}
                    date={event.startDate}
                    title={event.title}
                    meta={[formatTime(event.startTime), event.location].filter(Boolean).join(" · ") || null}
                    description={event.description}
                    imageUrl={eventPoster(event)}
                  />
                ))}
              </div>
            </RevealBlock>
          )}
        </MaxWidthWrapper>
      </section>
      )}

      <MaxWidthWrapper>
        <TrailRule />
      </MaxWidthWrapper>

      {/* PAST EVENTS */}
      <section className="py-20 md:py-28 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <SectionLabel>
              <CmsText channel="events" initial={copy} field="eventsCompletedTitle" fallback="Where we've been" isPreview={isPreview} />
            </SectionLabel>
          </RevealBlock>

          {completedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {completedEvents.map((event: any) => {
                const poster =
                  event.media?.find((m: any) => m.id === event.bannerMediaId) || event.media?.[0];
                const imageUrl = poster?.url ? getGoogleDriveDirectLink(poster.url) : null;
                const metaParts = [
                  event.registeredCount ? `${event.registeredCount} attended` : null,
                  event.volunteerHours ? `${event.volunteerHours} hours` : null,
                ].filter(Boolean);

                return (
                  <RevealBlock key={event.id}>
                    <StoryCard
                      href={`/events/${event.slug}`}
                      imageUrl={imageUrl}
                      eyebrow={formatIST(event.startDate, "MMMM yyyy")}
                      title={event.title}
                      outcome={event.description}
                      caption={metaParts.length > 0 ? metaParts.join(" · ") : event.location}
                      ratio="3/2"
                    />
                  </RevealBlock>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="The archive is waiting for its first story."
              detail="Once an event wraps up, its photos and numbers will live here."
            />
          )}
        </MaxWidthWrapper>
      </section>
    </>
  );
}
