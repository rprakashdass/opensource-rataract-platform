"use client";

import { useState } from "react";
import { 
  HeartHandshake, Globe, Share2, BookOpen, UserPlus, Users, Briefcase, 
  Mic2, Radio, Wrench, Computer, CheckCircle2, Flag, Circle
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { LucideIcon } from "lucide-react";
import { PublicHero } from "@/components/ui/public/PublicHero";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Map icon name strings to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  HeartHandshake, Globe, Share2, BookOpen, UserPlus, Users, Briefcase,
  Mic2, Radio, Wrench, Computer, Globe2: Globe, Circle
};

function resolveIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Circle;
  return ICON_MAP[iconName] || Circle;
}

interface Portfolio {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  activities: string[];
}

interface Data {
  club: {
    name: string;
    shortName?: string;
    aboutTitle?: string;
    aboutSubtitle?: string;
    missionStatement?: string;
    visionStatement?: string;
    aboutStory?: string;
    history?: string;
    parentClubName?: string;
    parentClubDescription?: string;
    district?: string;
    city?: string;
    tenureYear?: string;
  };
  settings?: { aboutStory?: string | null };
  milestones: any[];
  portfolios: Portfolio[];
}

export default function AboutClient({ data }: { data: Data }) {
  const { club, settings, milestones, portfolios } = data;
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(
    portfolios.length > 0 ? portfolios[0] : null
  );

  const heroTitle = club.aboutTitle || club.name;
  const heroSubtitle = club.aboutSubtitle || club.missionStatement || 
    "We strive to create a better world through volunteerism, community service, and professional development.";
  const storyText = club.aboutStory || settings?.aboutStory || null;
  const ActiveIcon = activePortfolio ? resolveIcon(activePortfolio.icon) : Circle;

  return (
    <div className="min-h-screen bg-background pb-16">
      <PublicHero 
        badge="Who We Are"
        title={heroTitle}
        description={heroSubtitle}
      />
      
      <MaxWidthWrapper className="py-2 space-y-20 lg:py-6">

        {/* OUR STORY */}
        <div className="grid gap-12 lg:gap-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="grid gap-8 lg:grid-cols-2 lg:items-center"
          >
            <div className="relative group overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                alt="Club volunteers"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {storyText && (
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-white text-2xl font-bold">{club.name}</h3>
                  <p className="text-white/80">{club.tenureYear}</p>
                </div>
              )}
            </div>
            <div className="space-y-6 lg:pl-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Story</h2>
              <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                {storyText ? (
                  storyText
                ) : (
                  <span className="italic text-gray-400">
                    No club story set yet. Add one from Admin → Website → About Page Editor.
                  </span>
                )}
              </div>
              {club.visionStatement && (
                <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Our Vision</p>
                  <p className="text-slate-700 font-medium">{club.visionStatement}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Parent Club — only shows if configured */}
          {club.parentClubName && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="grid gap-8 lg:grid-cols-2 lg:items-center"
            >
              <div className="space-y-6 lg:pr-10 order-2 lg:order-1">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">{club.parentClubName}</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {club.parentClubDescription || "Our club is proudly sponsored and guided by our parent organization."}
                </p>
              </div>
              <div className="relative group overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl order-1 lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"
                  alt="Partner organization"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-white text-2xl font-bold">Guided by Experience</h3>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* INTERACTIVE PORTFOLIOS SECTION */}
        {portfolios.length > 0 ? (
          <section className="space-y-10 pt-10">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-gray-900">Our Avenues of Service</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                We work across {portfolios.length} distinctive {portfolios.length === 1 ? "portfolio" : "portfolios"}, 
                empowering members to make a holistic impact.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-3xl p-4 lg:p-8 overflow-hidden relative">
              {/* Left: Tab List */}
              <div className="flex-shrink-0 lg:w-80 relative -mx-4 lg:mx-0">
                <div
                  className="flex gap-2 lg:flex-col overflow-x-auto px-4 lg:px-0 pb-4 lg:pb-0 scrollbar-hide snap-x snap-mandatory scroll-px-4 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)] lg:[mask-image:none]"
                >
                  {portfolios.map((portfolio) => {
                    const isActive = activePortfolio?.id === portfolio.id;
                    const Icon = resolveIcon(portfolio.icon);
                    return (
                      <button
                        key={portfolio.id}
                        onClick={() => setActivePortfolio(portfolio)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 whitespace-nowrap lg:whitespace-normal shrink-0 snap-start ${
                          isActive
                          ? "bg-purple-50 text-purple-700 shadow-sm border border-purple-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                        }`}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                        <span className="text-sm">{portfolio.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Content Pane */}
              <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 lg:p-10 border border-gray-100 relative min-h-[350px] flex flex-col justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {activePortfolio && (
                    <motion.div
                      key={activePortfolio.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="inline-flex p-3 rounded-2xl bg-purple-100 text-purple-700">
                        <ActiveIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">{activePortfolio.name}</h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {activePortfolio.description || ""}
                        </p>
                      </div>
                      
                      {activePortfolio.activities.length > 0 && (
                        <div className="pt-6 border-t border-gray-200/60">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Key Activities</h4>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {activePortfolio.activities.map((activity, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-700">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
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
          </section>
        ) : (
          <section className="text-center py-16 space-y-4 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
            <Globe className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-700">No Portfolios Configured Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Admins can define the club's avenues of service from the Portfolio Management settings.
            </p>
          </section>
        )}

        {/* MILESTONES */}
        {milestones.length > 0 && (
          <section className="space-y-10 pt-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-gray-900">Our Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Key milestones and achievements along our path of service.
              </p>
            </div>
            <div className="bg-white p-8 lg:p-12 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 max-w-4xl mx-auto">
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-200 before:to-transparent">
                {milestones.map((m: any) => (
                  <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-purple-100 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Flag className="w-3 h-3" />
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-6 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                      <div className="flex items-center justify-between space-x-2 mb-2">
                        <div className="text-xl font-bold text-gray-900">{m.title}</div>
                        <time className="font-caveat font-bold text-xl text-purple-600">{m.year}</time>
                      </div>
                      {m.description && <div className="text-gray-600 leading-relaxed">{m.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </MaxWidthWrapper>
    </div>
  );
}
