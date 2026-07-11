"use client";

import { useState } from "react";
import { Globe, HeartHandshake, BookOpen, Compass, Target, CheckCircle2, Flag, Circle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { PageHero } from "@/components/ui/public/PageHero";
import { EditorialSection } from "@/components/ui/public/EditorialSection";
import { QuoteCard } from "@/components/ui/public/QuoteCard";
import { getGoogleDriveDirectLink } from "@/lib/utils";
import { useCmsPreview } from "@/hooks/useCmsPreview";

// (Keep icon resolution logic as is)
const ICON_MAP: Record<string, any> = { HeartHandshake, Globe, BookOpen, Compass, Target };
function resolveIcon(iconName?: string | null) { return iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Circle; }

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
  const heroEyebrow = settings?.aboutEyebrow || "Our Journey";
  const heroTitle = club.aboutTitle || "Our Story.";
  const heroSubtitle = club.aboutSubtitle || club.missionStatement || "From a group of young people with ideas, to a community creating change.";

  const storyEyebrow = settings?.aboutEyebrow || "About Our Club";
  const storyHeading = club.aboutTitle || "The foundation of our movement.";
  const storyBody = club.aboutStory || "Our club biography is currently being curated by the board. We believe in service, friendship, and professional development.";

  const missionText = settings?.missionQuote || club.missionStatement || "We are students and young professionals building friendships while serving our community.";
  const visionText = settings?.visionQuote || club.visionStatement || "To build a vibrant ecosystem of youth empowerment and ethical leadership development.";
  const valuesText = settings?.valuesQuote || "Fellowship through community service, integrity in operations, and professional leadership development.";

  const aboutPhoto = settings?.aboutPhoto || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Editorial page hero */}
      <div id="about-hero">
        <PageHero
          eyebrow={heroEyebrow}
          title={heroTitle}
          subtitle={heroSubtitle}
        />
      </div>

      {/* 1. OUR STORY */}
      <div id="about-story">
        <EditorialSection eyebrow={storyEyebrow} heading={storyHeading} background="white">
          <div className="grid lg:grid-cols-2 gap-16 lg:items-center mt-12">
            <div className="space-y-6">
              <h3 className="text-3xl font-medium text-[#0B132B] leading-tight">
                We are a collective of young professionals dedicated to creating lasting change.
              </h3>
              <div className="text-lg text-slate-500 leading-relaxed font-medium">
                <p>{storyBody}</p>
              </div>
              {club.history && (
                <div className="pt-4 border-t border-slate-200/60">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">History</h4>
                  <p className="text-base text-slate-500 leading-relaxed font-medium">{club.history}</p>
                </div>
              )}
            </div>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100">
               <Image
                src={getGoogleDriveDirectLink(aboutPhoto)}
                alt="Club volunteers"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </EditorialSection>
      </div>

      {/* 2. VALUES ( Pastels Style Quote Cards ) */}
      <div id="about-values">
        <section className="py-24 bg-[#FAF9F6]">
          <MaxWidthWrapper>
            <div className="grid md:grid-cols-3 gap-6">
              <QuoteCard
                quote={missionText}
                authorName="Our Mission"
                colorTheme="peach"
              />
              <QuoteCard
                quote={visionText}
                authorName="Our Vision"
                colorTheme="lavender"
              />
               <QuoteCard
                quote={valuesText}
                authorName="Our Values"
                colorTheme="blue"
              />
            </div>
          </MaxWidthWrapper>
        </section>
      </div>

      {/* PARENT CLUB / PARTNER ORGANIZATION — only shows if configured */}
      {club.parentClubName && (
        <div id="about-parent">
          <EditorialSection eyebrow="Guided By" heading={club.parentClubName} background="white">
            <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-3xl">
              {club.parentClubDescription || "Our club is proudly sponsored and guided by our parent organization."}
            </p>
          </EditorialSection>
        </div>
      )}

      {/* 3. PORTFOLIOS */}
      {portfolios?.length > 0 && (
        <div id="about-portfolios">
        <EditorialSection eyebrow="Portfolio Teams" heading="How we organize our impact." background="white">
          <div className="flex flex-col lg:flex-row gap-12 mt-12">
            <div className="flex-shrink-0 lg:w-72 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
              {portfolios.map((portfolio: any) => {
                const isActive = activePortfolio?.id === portfolio.id;
                return (
                  <button
                    key={portfolio.id}
                    onClick={() => setActivePortfolio(portfolio)}
                    className={`text-left px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap lg:whitespace-normal ${
                      isActive ? "bg-[#0B132B] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {portfolio.name}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 bg-slate-50 rounded-3xl p-10 lg:p-16">
              <AnimatePresence mode="wait">
                {activePortfolio && (
                  <motion.div
                    key={activePortfolio.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-3xl font-medium text-[#0B132B] mb-4">{activePortfolio.name}</h3>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {activePortfolio.description || "Portfolio details and service focus are managed by committee chairs."}
                      </p>
                    </div>
                    
                    {activePortfolio.activities?.length > 0 && (
                      <div className="pt-8 border-t border-slate-200">
                        <ul className="grid sm:grid-cols-2 gap-4">
                          {activePortfolio.activities.map((activity: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                              <CheckCircle2 className="h-5 w-5 text-[#F7A800] shrink-0" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </EditorialSection>
        </div>
      )}

      {/* 4. HISTORICAL MILESTONES */}
      {milestones?.length > 0 && (
        <div id="about-milestones">
         <EditorialSection eyebrow="Archive Timeline" heading="Our Milestones" background="slate">
            <div className="max-w-3xl mx-auto mt-12 space-y-8">
              {milestones.map((m: any) => (
                <div key={m.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                     <h4 className="text-xl font-bold text-[#0B132B]">{m.title}</h4>
                     {m.description && <p className="text-slate-500 mt-2">{m.description}</p>}
                  </div>
                  <span className="text-2xl font-black text-[#F7A800]/50">{m.year}</span>
                </div>
              ))}
            </div>
         </EditorialSection>
        </div>
      )}
    </div>
  );
}
