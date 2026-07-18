"use client";

import React from "react";
import Image from "next/image";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { normalizeHomepageSections } from "@/features/public/lib/homepageSections";
import { useCmsPreview } from "@/hooks/useCmsPreview";
import {
  RevealLines,
  RevealBlock,
  Statement,
  SectionHeader,
  TrailRule,
  PillLink,
  QuietLink,
  EditorialImage,
  StoryCard,
  ImpactBand,
  ThadamCreed,
  ListRow,
  InvitePanel,
  EmptyState,
} from "@/components/ui/public/v2";
import type { ImpactMetric } from "@/components/ui/public/v2";

/** Split a headline into two visually balanced lines for the masked reveal. */
function balanceLines(text: string): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return [text];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(i).join(" ").length;
    const diff = Math.abs(a - b);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

export default function HomeClientWrapper({
  initialData,
  photos,
  featuredProjects,
  upcomingEvents,
  latestUpdates,
  featuredUpdates,
  isPreview,
  fallbackImpact,
}: {
  initialData: any;
  photos: any[];
  featuredProjects: any[];
  upcomingEvents: any[];
  latestUpdates: any[];
  featuredUpdates: any[];
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

  const { club, settings, metrics, president } = data;

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const rawHeroImages = (settings?.heroImages as string[]) || [];
  const heroImages = rawHeroImages.filter(Boolean);
  const isAutoScroll = settings?.heroScrollAuto !== false;
  const intervalSeconds = settings?.heroScrollInterval || 10;

  React.useEffect(() => {
    if (heroImages.length <= 1 || !isAutoScroll) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [heroImages.length, isAutoScroll, intervalSeconds]);

  const activeSlideIndex = heroImages.length > 0 ? currentSlide % heroImages.length : 0;

  const sectionsConfig = normalizeHomepageSections(settings?.homepageSections);
  const sortedSections = [...sectionsConfig]
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const tenure = club.tenureYear || "2026–27";

  return (
    <main className="min-h-screen bg-paper font-body text-ink flex flex-col overflow-x-clip">
      {isPreview && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-brand: ${settings?.primaryColor || "#D41367"};
                --color-ink: ${settings?.darkColor || "#2B1F26"};
                --color-paper: ${settings?.lightColor || "#FBF7F2"};
              }
            `,
          }}
        />
      )}

      {sortedSections.map((sec) => {
        const content = (() => {
          switch (sec.id) {
            /* ── ACT 1 · AWARENESS — full-bleed hero, real members ── */
            case "hero": {
              const heroHeadline = settings?.heroHeadline || "We don't wait for the world to fix itself.";
              const heroSubtitle =
                settings?.heroSubtitle ||
                club.missionStatement ||
                "A collective of professionals building the future of our community, one project at a time.";
              const heroCTA = settings?.heroCTA || "Join us";
              const heroCTALink = settings?.heroCTALink || "/join";
              const heroSecCTA = settings?.heroSecondaryCTA || "See our work";
              const heroSecCTALink = settings?.heroSecondaryCTALink || "/projects";
              const heroImages = (settings?.heroImages as string[]) || [];
              const heroImage = heroImages[0] ? getGoogleDriveDirectLink(heroImages[0]) : null;
              const lines = balanceLines(heroHeadline);

              return (
                <section key="hero" className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col justify-end bg-chapter" data-thadam-dark aria-label="Homepage hero">
                  {heroImages.length > 0 && (
                    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
                      {heroImages.map((imgUrl, idx) => {
                        const directLink = getGoogleDriveDirectLink(imgUrl);
                        if (!directLink) return null;
                        const isActive = idx === activeSlideIndex;
                        return (
                          <div
                            key={imgUrl}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-[3000ms] ease-in-out ${isActive ? "opacity-100" : "opacity-0"
                              }`}
                          >
                            <Image
                              src={directLink}
                              alt={`Hero image ${idx + 1}`}
                              fill
                              sizes="100vw"
                              priority={idx === 0}
                              className="object-cover thadam-grade"
                            />
                          </div>
                        );
                      })}
                      <div className="absolute inset-0 bg-ink/70" />
                    </div>
                  )}
                  <MaxWidthWrapper className="relative z-10 pt-32 md:pt-40 pb-16 md:pb-24 w-full">
                    <div className="max-w-4xl">
                      <h1 className="font-display font-medium text-parchment tracking-[-0.02em] leading-[1.02] text-[clamp(2.6rem,7vw,5.5rem)]">
                        {club.themeName && (
                          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-gold mb-6">
                            Theme 2026: {club.themeName}
                          </span>
                        )}
                        <RevealLines lines={lines} />
                      </h1>
                      {heroSubtitle && (
                        <RevealBlock delay={0.35} className="mt-6 max-w-xl">
                          <p className="text-parchment/85 text-lg md:text-xl leading-relaxed">{heroSubtitle}</p>
                        </RevealBlock>
                      )}
                      <RevealBlock delay={0.5} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                        {heroCTA && <PillLink href={heroCTALink}>{heroCTA}</PillLink>}
                        {heroSecCTA && (
                          <QuietLink href={heroSecCTALink} onDark>
                            {heroSecCTA}
                          </QuietLink>
                        )}
                      </RevealBlock>
                    </div>
                  </MaxWidthWrapper>
                </section>
              );
            }

            /* ── ACT 1b · BELIEF — why we exist ── */
            case "belief": {
              const belief =
                club.visionStatement ||
                club.aboutSubtitle ||
                "Leadership you practice. Friends you serve beside. A city that knows your club's name.";
              const VALUES = [
                { label: "We serve", line: "Community before self." },
                { label: "We lead", line: "Leadership through action, not title." },
                { label: "We grow", line: "Together, through service and learning." },
              ];

              return (
                <section key="belief" className="py-20 md:py-28 bg-paper">
                  <MaxWidthWrapper>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12 items-start text-center lg:text-left">
                      <div className="lg:col-span-7">
                        <Statement eyebrow={`Why we exist`} className="max-w-none mx-auto lg:mx-0">
                          {belief}
                        </Statement>
                      </div>
                      <RevealBlock delay={0.15} className="lg:col-span-4 lg:col-start-9">
                        <span aria-hidden="true" className="hidden lg:block text-xs mb-6 invisible select-none">
                          &nbsp;
                        </span>
                        {VALUES.map((v, i) => (
                          <div key={v.label} className={i > 0 ? "mt-5 pt-5 border-t border-hairline" : ""}>
                            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                              {v.label}
                            </span>
                            <p className="mt-1.5 text-[14px] text-ink-soft leading-snug">{v.line}</p>
                          </div>
                        ))}
                      </RevealBlock>
                    </div>
                  </MaxWidthWrapper>
                </section>
              );
            }

            /* ── ACT 6 · THE LETTER (Manuscript Edition) ── */
            case "president": {
              const presName = president?.name || settings?.presName || "The President";
              const presPhoto = president?.avatar || settings?.presPhoto;
              const presMessage =
                settings?.presMessage ||
                president?.websiteQuote ||
                club.presidentMessage ||
                "This year we walk further together — more hands, more service, more marks left on the city we love.";

              return (
                <section key="president" id="president-message" className="scroll-mt-24 py-24 md:py-36 bg-paper border-t border-hairline/40">
                  <MaxWidthWrapper className="max-w-[640px] mx-auto">
                    <RevealBlock>
                      {/* Dateline Header */}
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint border-b border-hairline/60 pb-4 mb-10">
                        <span>Coimbatore</span>
                        <span>Rotary Year {tenure}</span>
                      </div>

                      {/* Salutation */}
                      <p className="font-statement text-lg md:text-xl font-medium text-ink/70 mb-6 italic">
                        To our members, partners, and community—
                      </p>

                      {/* Letter Body (Natural Prose, no quotation marks) */}
                      <div className="font-statement text-xl md:text-[22px] leading-[1.75] text-ink/90 font-normal space-y-6">
                        <p>{presMessage}</p>
                      </div>

                      {/* Sign-off & Stamp */}
                      <div className="mt-14 pt-8 border-t border-hairline/40 flex items-center justify-between pr-4 md:pr-6">
                        {/* Left: Sign-off, Signature & Name */}
                        <div>
                          <p className="text-sm font-medium text-ink-soft mb-3 italic">In service,</p>
                          
                          {settings?.presSignature ? (
                            <div className="relative w-36 h-12 mb-3">
                              <Image
                                src={getGoogleDriveDirectLink(settings.presSignature)}
                                alt={`${presName} signature`}
                                fill
                                sizes="144px"
                                className="object-contain object-left"
                              />
                            </div>
                          ) : null}

                          <p className="font-semibold text-base text-ink tracking-tight">{presName}</p>
                          <p className="text-xs text-ink-faint mt-0.5 font-medium">
                            {settings?.presQuote || "President"}, Rotaract Club of Coimbatore Nexus
                          </p>
                        </div>

                        {/* Right: Author Stamp (Wax seal / press stamp portrait) */}
                        {presPhoto && (
                          <div className="w-16 h-16 md:w-[72px] md:h-[72px] relative rounded-full overflow-hidden ring-1 ring-border/60 bg-wash shrink-0">
                            <Image
                              src={getGoogleDriveDirectLink(presPhoto)}
                              alt={presName}
                              fill
                              sizes="72px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </RevealBlock>
                  </MaxWidthWrapper>
                </section>
              );
            }

            /* ── ACT 2b · ETHOS — the year's theme, decomposed on scroll ── */
            case "thadam": {
              return (
                <ThadamCreed
                  key="thadam"
                  eyebrow={settings?.thadamEyebrow || `The theme for ${tenure}`}
                />
              );
            }

            /* ── ACT 3a · PROOF — the impact band ── */
            case "impact": {
              const customMetrics: ImpactMetric[] =
                metrics && metrics.length > 0
                  ? metrics
                    .map((m: any) => {
                      // Stored field is `number` (WebsiteMetric.number); the
                      // editor and query both use it. Tolerate `value` too in
                      // case any older preview payload sends it.
                      const raw = String(m.number ?? m.value ?? "");
                      return {
                        value: Number(raw.replace(/[^\d.]/g, "")) || 0,
                        label: m.label,
                        suffix: /\+\s*$/.test(raw) ? "+" : undefined,
                      };
                    })
                    .filter((m: ImpactMetric) => m.value > 0)
                  : [];

              const fallbackMetrics: ImpactMetric[] = [
                { value: fallbackImpact.members, label: "Active members" },
                { value: fallbackImpact.projects, label: "Projects delivered" },
                { value: fallbackImpact.hours, label: "Volunteer hours" },
                { value: fallbackImpact.events, label: "Events hosted" },
              ].filter((m) => m.value > 0);

              const shown = customMetrics.length > 0 ? customMetrics : fallbackMetrics;
              if (shown.length === 0) return null;

              return (
                <ImpactBand
                  key="impact"
                  kicker={settings?.impactEyebrow || "The marks we've left"}
                  statement={settings?.impactStatement || "Service isn't a line on our website. It's our calendar."}
                  metrics={shown}
                  provenance={`Figures from club records · Rotary year ${tenure}`}
                />
              );
            }

            /* ── ACT 3b · PROOF — flagship work ── */
            case "projects": {
              return (
                <section key="projects" className="py-24 md:py-36 bg-paper">
                  <MaxWidthWrapper>
                    <SectionHeader
                      eyebrow={settings?.projectsEyebrow || "Our work"}
                      heading={settings?.projectsTitle || "Work that outlasts the photos."}
                      linkText={settings?.projectsCTA || "All our work"}
                      linkHref={settings?.projectsCTALink || "/projects"}
                    />
                    {featuredProjects.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-14">
                        <StoryCard
                          className="lg:col-span-7"
                          href={`/projects/${featuredProjects[0].slug}`}
                          imageUrl={featuredProjects[0].media?.[0]?.url}
                          eyebrow={featuredProjects[0].category?.replace(/_/g, " ")}
                          title={featuredProjects[0].title}
                          outcome={featuredProjects[0].summary || featuredProjects[0].description}
                          ratio="3/2"
                          large
                        />
                        <div className="lg:col-span-5 flex flex-col gap-12">
                          {featuredProjects.slice(1, 3).map((project: any) => (
                            <StoryCard
                              key={project.id}
                              href={`/projects/${project.slug}`}
                              imageUrl={project.media?.[0]?.url}
                              eyebrow={project.category?.replace(/_/g, " ")}
                              title={project.title}
                              ratio="3/2"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EmptyState
                        title={settings?.projectsEmptyTitle || "Our first marks are being planned."}
                        detail={
                          settings?.projectsEmptyDesc ||
                          "New service projects are in the pipeline — check back after Installation Day."
                        }
                      />
                    )}
                  </MaxWidthWrapper>
                </section>
              );
            }

            /* ── ACT 4b · BELONGING — life in the club, editorial strip ── */
            case "gallery": {
              if (photos.length === 0) return null;

              const layout = settings?.galleryLayout || "masonry";

              let content;
              if (layout === "masonry") {
                const strip = photos.slice(0, 5);
                const spans = ["lg:col-span-5", "lg:col-span-7", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"];
                const ratios: ("4/5" | "3/2" | "square")[] = ["4/5", "3/2", "square", "square", "square"];
                content = (
                  <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 items-start">
                    {strip.map((photo: any, i: number) => (
                      <EditorialImage
                        key={photo.id}
                        src={photo.url}
                        alt={photo.altText || photo.title || "Club moment"}
                        ratio={ratios[i] || "square"}
                        caption={photo.title}
                        className={`col-span-1 ${spans[i] || "lg:col-span-4"}`}
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ))}
                  </div>
                );
              } else if (layout === "grid") {
                content = (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {photos.map((photo: any) => (
                      <EditorialImage
                        key={photo.id}
                        src={photo.url}
                        alt={photo.altText || photo.title || "Club moment"}
                        ratio="square"
                        caption={photo.title}
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ))}
                  </div>
                );
              } else {
                // Filmstrip layout
                content = (
                  <div
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 -mx-6 px-6 md:mx-0 md:px-0"
                    style={{ touchAction: 'pan-x pan-y' }}
                    tabIndex={0}
                    aria-label="Gallery image filmstrip"
                  >
                    {photos.map((photo: any) => (
                      <div key={photo.id} className="snap-center shrink-0 w-[80vw] sm:w-[50vw] md:w-[33vw]">
                        <EditorialImage
                          src={photo.url}
                          alt={photo.altText || photo.title || "Club moment"}
                          ratio="3/2"
                          caption={photo.title}
                          sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <>
                  <section key="gallery" className="py-24 md:py-36 bg-wash">
                    <MaxWidthWrapper>
                      <SectionHeader
                        eyebrow={settings?.galleryTitle || "Life in the club"}
                        heading={settings?.gallerySubtitle || "The moments between the projects."}
                        linkText={settings?.galleryCTA || "Browse the archive"}
                        linkHref={settings?.galleryCTALink || "/gallery"}
                      />
                      {content}
                    </MaxWidthWrapper>
                  </section>

                  {/* Featured project-updates trail — only rendered when there are any */}
                  {featuredUpdates && featuredUpdates.length > 0 && (
                    <section id="trail" className="py-24 md:py-36 bg-paper">
                      <MaxWidthWrapper>
                        <SectionHeader
                          eyebrow="From the field"
                          heading={settings?.updatesTitle || "Days in the making."}
                          linkText="Follow the trail"
                          linkHref="/projects"
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-14">
                          <StoryCard
                            className="lg:col-span-7"
                            href={`/projects/${featuredUpdates[0].project?.slug}`}
                            imageUrl={featuredUpdates[0].media?.[0]?.url}
                            eyebrow={featuredUpdates[0].project?.category?.replace(/_/g, " ")}
                            title={featuredUpdates[0].title}
                            outcome={featuredUpdates[0].impactNote || featuredUpdates[0].project?.title}
                            ratio="3/2"
                            large
                          />
                          <div className="lg:col-span-5 flex flex-col gap-12">
                            {featuredUpdates.slice(1, 3).map((upd: any) => (
                              <StoryCard
                                key={upd.id}
                                href={`/projects/${upd.project?.slug}`}
                                imageUrl={upd.media?.[0]?.url}
                                eyebrow={upd.project?.category?.replace(/_/g, " ")}
                                title={upd.title}
                                outcome={upd.impactNote || upd.project?.title}
                                ratio="4/5"
                              />
                            ))}
                          </div>
                        </div>
                      </MaxWidthWrapper>
                    </section>
                  )}
                </>
              );
            }

            /* ── ACT 4c · BELONGING — this month: events + notices ── */
            case "events_news": {
              const showEvents = settings?.enableEvents !== false;
              const showNotices = settings?.enableAnnouncements !== false;
              if (!showEvents && !showNotices) return null;

              return (
                <section key="events_news" className="py-24 md:py-36 bg-paper">
                  <MaxWidthWrapper>
                    <SectionHeader
                      eyebrow="This month"
                      heading={settings?.eventsTitle || "Walk with us."}
                      linkText={settings?.eventsRegisterCTA || "All events"}
                      linkHref="/events"
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16">
                      {showEvents && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint pb-4 border-b border-ink/60">
                            Upcoming
                          </p>
                          {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event: any) => (
                              <ListRow
                                key={event.id}
                                href={`/events/${event.slug}`}
                                date={event.startDate}
                                title={event.title}
                                meta={event.location}
                              />
                            ))
                          ) : (
                            <EmptyState
                              title={settings?.eventsEmptyTitle || "The calendar is catching its breath."}
                              detail="New gatherings are announced here first."
                            />
                          )}
                        </div>
                      )}
                      {showNotices && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint pb-4 border-b border-ink/60">
                            {settings?.noticeboardTitle || "Notice board"}
                          </p>
                          {latestUpdates.length > 0 ? (
                            latestUpdates.map((update: any) => (
                              <ListRow
                                key={update.id}
                                href="/announcements"
                                date={update.createdAt}
                                title={update.title}
                                description={update.description}
                              />
                            ))
                          ) : (
                            <EmptyState title="Official updates will be pinned here." />
                          )}
                        </div>
                      )}
                    </div>
                  </MaxWidthWrapper>
                </section>
              );
            }

            /* ── ACT 5 · ACTION — the single invitation ── */
            case "sponsor": {
              return (
                <InvitePanel
                  key="sponsor"
                  statement={settings?.sponsorsTitle || "Leave your mark."}
                  primaryText={settings?.heroCTA || "Join us"}
                  primaryHref="/join"
                  secondaryText={settings?.sponsorsCTA || "Partner with us"}
                  secondaryHref={settings?.sponsorsCTALink || "/partner"}
                />
              );
            }

            default:
              return null;
          }
        })();

        return content ? (
          <React.Fragment key={sec.id}>
            <div id={sec.id}>
              {content}
            </div>
            {sec.id === "president" && <MarqueeStrip />}
          </React.Fragment>
        ) : null;
      })}
    </main>
  );
}

function MarqueeStrip() {
  const text = "WE SERVE • WE LEAD • WE GROW • THADAM";
  return (
    <div className="w-full overflow-hidden bg-chapter border-y border-parchment/10 py-5 select-none" data-thadam-dark>
      <div className="flex w-max min-w-full animate-marquee whitespace-nowrap text-gold uppercase tracking-[0.2em] font-display font-medium text-sm md:text-base">
        <div className="flex shrink-0 gap-16 px-8">
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
        <div className="flex shrink-0 gap-16 px-8" aria-hidden="true">
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>
    </div>
  );
}
