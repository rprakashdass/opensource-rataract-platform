"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { useCmsPreview } from "@/hooks/useCmsPreview";
import {
  RevealBlock,
  Eyebrow,
  PageIntro,
  SectionLabel,
  QuietLink,
  EditorialImage,
  VoiceBlock,
  TimelineRow,
  InvitePanel,
} from "@/components/ui/public/v2";

export default function AboutClient({ data, isPreview }: { data: any; isPreview?: boolean }) {
  const merged = useCmsPreview(data, {
    enabled: !!isPreview,
    channel: "about",
    merge: (prev, payload) => ({
      ...prev,
      club: { ...prev.club, ...payload.club },
      settings: { ...prev.settings, ...payload.settings },
      milestones: payload.milestones ?? prev.milestones,
      portfolios: payload.portfolios ?? prev.portfolios,
    }),
  });
  const { club, settings, milestones, portfolios } = merged;
  const [activePortfolio, setActivePortfolio] = useState(portfolios?.[0] || null);

  // Club Story fields are edited from Admin -> Website -> About Page Editor, which writes to the Club model.
  const heroEyebrow = settings?.aboutEyebrow || "About us";
  const heroTitle = club.aboutTitle || "Our story.";
  const heroSubtitle =
    club.aboutSubtitle ||
    club.missionStatement ||
    "From a group of young people with ideas, to a community creating change.";

  const storyBody =
    club.aboutStory ||
    "Our club biography is currently being curated by the board. We believe in service, friendship, and professional development.";

  const missionText =
    settings?.missionQuote ||
    club.missionStatement ||
    "We are students and young professionals building friendships while serving our community.";
  const visionText =
    settings?.visionQuote ||
    club.visionStatement ||
    "To build a vibrant ecosystem of youth empowerment and ethical leadership development.";
  const valuesText =
    settings?.valuesQuote ||
    "Fellowship through community service, integrity in operations, and professional leadership development.";

  const aboutPhoto = settings?.aboutPhoto || null;
  const foundedYear = club.foundedYear || null;
  const photoCaption = [club.name, club.city].filter(Boolean).join(" — ");

  const pillars = [
    { keyword: "Mission", text: missionText },
    { keyword: "Vision", text: visionText },
    { keyword: "Values", text: valuesText },
  ];

  const previewMilestones = (milestones || []).slice(0, 4);

  return (
    <div className="min-h-screen bg-paper">
      <div id="about-hero">
        <PageIntro
          eyebrow={heroEyebrow}
          title={heroTitle}
          support={heroSubtitle || undefined}
        />
      </div>

      {/* 1. OUR STORY — asymmetric 7/5 editorial grid */}
      <section id="about-story" className="py-20 md:py-28 bg-paper">
        <MaxWidthWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12 lg:items-start">
            <RevealBlock className="lg:col-span-7">
              <Eyebrow className="mb-6">Our story</Eyebrow>
              {foundedYear && (
                <p
                  className="font-display font-medium italic text-brand-deep leading-none text-[clamp(2.6rem,6vw,4.2rem)] mb-6"
                  aria-label={`Founded in ${foundedYear}`}
                >
                  {foundedYear}
                </p>
              )}
              <p className="text-lg text-ink-soft leading-relaxed max-w-2xl">{storyBody}</p>
              {club.history && (
                <div className="mt-10 pt-6 border-t border-hairline">
                  <Eyebrow className="mb-3">Where we come from</Eyebrow>
                  <p className="text-base text-ink-soft leading-relaxed max-w-2xl">{club.history}</p>
                </div>
              )}
            </RevealBlock>
            <div className="lg:col-span-5 lg:col-start-8">
              <EditorialImage
                src={aboutPhoto}
                alt={`${club.name} in the community`}
                ratio="4/5"
                caption={photoCaption || undefined}
                fallbackText="A photo of our people, coming soon."
              />
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* 2. WHAT WE STAND FOR — three ruled columns */}
      <section id="about-values" className="py-20 md:py-28 bg-wash">
        <MaxWidthWrapper>
          <SectionLabel>What we stand for</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {pillars.map((pillar, i) => (
              <RevealBlock key={pillar.keyword} delay={i * 0.08} className="border-t border-hairline pt-6">
                <h3 className="font-display font-medium text-xl md:text-2xl text-ink mb-3">
                  {pillar.keyword}
                </h3>
                <p className="text-[15px] text-ink-soft leading-relaxed">{pillar.text}</p>
              </RevealBlock>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* PARENT CLUB / PARTNER ORGANIZATION — only shows if configured */}
      {club.parentClubName && (
        <section id="about-parent" className="py-20 md:py-28 bg-paper">
          <MaxWidthWrapper>
            <VoiceBlock
              eyebrow="Guided by"
              quote={
                club.parentClubDescription ||
                "Our club is proudly sponsored and guided by our parent organization."
              }
              name={club.parentClubName}
              role={club.district ? `District ${club.district}` : "Parent organization"}
            />
          </MaxWidthWrapper>
        </section>
      )}

      {/* 3. PORTFOLIOS — ruled list with detail panel, accordion behavior kept */}
      {portfolios?.length > 0 && (
        <section id="about-portfolios" className={club.parentClubName ? "py-20 md:py-28 bg-wash" : "py-20 md:py-28 bg-paper"}>
          <MaxWidthWrapper>
            <SectionLabel>Portfolio teams</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12">
              <RevealBlock className="lg:col-span-4">
                <div className="flex lg:flex-col gap-x-6 overflow-x-auto lg:overflow-visible border-t border-hairline">
                  {portfolios.map((portfolio: any) => {
                    const isActive = activePortfolio?.id === portfolio.id;
                    return (
                      <button
                        key={portfolio.id}
                        onClick={() => setActivePortfolio(portfolio)}
                        aria-pressed={isActive}
                        className={`text-left py-4 border-b border-hairline whitespace-nowrap lg:whitespace-normal font-display font-medium text-lg transition-colors ${
                          isActive ? "text-brand-deep" : "text-ink-faint hover:text-ink"
                        }`}
                      >
                        {portfolio.name}
                      </button>
                    );
                  })}
                </div>
              </RevealBlock>

              <div className="lg:col-span-7 lg:col-start-6">
                <AnimatePresence mode="wait">
                  {activePortfolio && (
                    <motion.div
                      key={activePortfolio.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-t border-hairline pt-6"
                    >
                      <h3 className="font-display font-medium text-2xl md:text-3xl text-ink mb-4 text-balance">
                        {activePortfolio.name}
                      </h3>
                      <p className="text-lg text-ink-soft leading-relaxed">
                        {activePortfolio.description ||
                          "Portfolio details and service focus are managed by committee chairs."}
                      </p>

                      {activePortfolio.activities?.length > 0 && (
                        <ul className="mt-8 pt-6 border-t border-hairline grid sm:grid-cols-2 gap-x-8 gap-y-3">
                          {activePortfolio.activities.map((activity: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-[15px] text-ink-soft leading-relaxed">
                              <span className="mt-2 block w-1.5 h-1.5 rounded-full bg-brand shrink-0" aria-hidden="true" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {/* 4. MILESTONES PREVIEW */}
      {milestones?.length > 0 && (
        <section id="about-milestones" className="py-20 md:py-28 bg-paper">
          <MaxWidthWrapper>
            <SectionLabel>Milestones</SectionLabel>
            <RevealBlock className="border-t border-hairline">
              {previewMilestones.map((m: any) => (
                <TimelineRow
                  key={m.id}
                  marker={m.year}
                  title={m.title}
                  description={m.description}
                />
              ))}
            </RevealBlock>
            <RevealBlock className="mt-10">
              <QuietLink href="/our-archive">Walk the full archive</QuietLink>
            </RevealBlock>
          </MaxWidthWrapper>
        </section>
      )}

      <InvitePanel
        statement="Walk with us."
        primaryText="Join the club"
        primaryHref="/join"
        secondaryText="Meet the team"
        secondaryHref="/team"
      />
    </div>
  );
}
