"use client";

import { useState } from "react";
import { 
  Users, Briefcase, BookOpen, Globe, Share2, Radio, 
  Mic2, Wrench, UserPlus, Computer, CheckCircle2, HeartHandshake, Flag
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PublicHero } from "@/components/ui/public/PublicHero";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export interface Domain {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  activities: string[];
}

export const domains: Domain[] = [
  {
    id: "community",
    icon: HeartHandshake,
    title: "Community Services",
    description: "Lead initiatives that make a direct impact in local communities through service and outreach programs.",
    activities: ["Organize cleanliness drives", "Host community health camps", "Distribute essential supplies"]
  },
  {
    id: "international",
    icon: Globe,
    title: "International Services",
    description: "Foster global understanding through international collaboration and cultural exchange.",
    activities: ["Coordinate global Rotaract collaborations", "Promote cultural exchange", "Support international causes"]
  },
  {
    id: "pr",
    icon: Share2,
    title: "Public Relations",
    description: "Enhance the club's visibility and reputation through strategic communication and media outreach.",
    activities: ["Manage public image", "Write press releases", "Handle external communications"]
  },
  {
    id: "literary",
    icon: BookOpen,
    title: "Literary Services",
    description: "Encourage literary expression and intellectual engagement through various activities.",
    activities: ["Host debates and quizzes", "Organize writing competitions", "Conduct reading circles"]
  },
  {
    id: "club",
    icon: UserPlus,
    title: "Club Services",
    description: "Facilitate smooth internal functioning and foster fellowship within the club.",
    activities: ["Organize member induction", "Host internal events", "Maintain club harmony"]
  },
  {
    id: "management",
    icon: Users,
    title: "Management Services",
    description: "Oversee planning and implementation of club projects and ensure operational excellence.",
    activities: ["Supervise logistics", "Monitor event timelines", "Coordinate with service chairs"]
  },
  {
    id: "professional",
    icon: Briefcase,
    title: "Professional Development",
    description: "Empower members through career-oriented workshops, seminars, and industry exposure.",
    activities: ["Host skill-building sessions", "Organize internships and networking", "Conduct mentorship programs"]
  },
  {
    id: "arts",
    icon: Mic2,
    title: "Performing Arts",
    description: "Promote creativity through cultural performances and artistic expression.",
    activities: ["Organize dance and music events", "Coordinate talent shows", "Promote art-based outreach"]
  },
  {
    id: "social",
    icon: Radio,
    title: "Social Media Services",
    description: "Engage audiences and promote the club's work on social platforms.",
    activities: ["Create and schedule posts", "Run awareness campaigns", "Analyze social engagement"]
  },
  {
    id: "tech",
    icon: Wrench,
    title: "Technical Services",
    description: "Support all tech-based operations and ensure smooth event execution with digital tools.",
    activities: ["Maintain tech infrastructure", "Provide event tech support", "Develop internal tools"]
  },
  {
    id: "media",
    icon: Computer,
    title: "Media Services",
    description: "Create and distribute engaging visual content to promote the club's initiatives and activities.",
    activities: ["Produce event highlights", "Design promotional graphics", "Manage club photography"]
  }
];

export default function AboutClient({ data }: { data: { club: any, settings: any, milestones: any[] } }) {
  const [activeDomain, setActiveDomain] = useState<Domain>(domains[0]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <PublicHero 
        badge="Who We Are"
        title="Service Above Self."
        description={data.club?.missionStatement || "At our Rotaract Club, we strive to create a better world through volunteerism, community service, and professional development."}
      />
      
      <MaxWidthWrapper className="py-2 space-y-20 lg:py-6">

        {/* MISSION & PARENT CLUB */}
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
                alt="Rotaract Club volunteers"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-white text-2xl font-bold">Making an Impact</h3>
                <p className="text-white/80">Together we achieve more.</p>
              </div>
            </div>
            <div className="space-y-6 lg:pl-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Story</h2>
              <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                {data.settings?.aboutStory ? data.settings.aboutStory : (
                  "At our Rotaract Club, we function as a service-oriented organization that strives to create a better world through volunteerism, community service, and professional development. We are a part of the global network of Rotaract clubs sponsored by Rotary International, which gives us access to a wealth of resources and opportunities for growth."
                )}
              </div>
            </div>
          </motion.div>

        {/* Parent Club — reverse order on mobile so text comes first */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="grid gap-8 lg:grid-cols-2 lg:items-center"
        >
          <div className="space-y-6 lg:pr-10 order-2 lg:order-1">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Parent Club</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our Rotaract Club is proudly sponsored by our parent Rotary Club. 
              Through this partnership, they nurture and support the young
              leaders of our Rotaract Club, empowering us to create a
              positive impact in our community and beyond. Together, we work
              hand in hand to foster a spirit of service, fellowship, and
              social responsibility, making a meaningful difference in the
              lives of those we touch.
            </p>
          </div>
          <div className="relative group overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <Image
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"
              alt="Rotary Partnership Logo"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <h3 className="text-white text-2xl font-bold">Guided by Experience</h3>
              <p className="text-white/80">Sponsored by Rotary International.</p>
            </div>
          </div>
        </motion.div>
        </div>

        {/* INTERACTIVE DOMAINS SECTION */}
        <section className="space-y-10 pt-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-gray-900">Our 11 Domains</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We work across 11 distinctive domains to attain our common goal of
              Service above Self, exploring the power of teamwork and providing
              humanitarian aid.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-3xl p-4 lg:p-8 overflow-hidden relative">
            {/* Left: Tab List */}
            <div className="flex-shrink-0 lg:w-80 flex gap-2 lg:flex-col overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
              {domains.map((domain) => {
                const isActive = activeDomain.id === domain.id;
                const Icon = domain.icon;
                return (
                  <button
                    key={domain.id}
                    onClick={() => setActiveDomain(domain)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 whitespace-nowrap lg:whitespace-normal ${
                      isActive 
                      ? "bg-purple-50 text-purple-700 shadow-sm border border-purple-100" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                    <span className="text-sm">{domain.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Content Pane */}
            <div className="flex-1 bg-gray-50/50 rounded-2xl p-6 lg:p-10 border border-gray-100 relative min-h-[350px] flex flex-col justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDomain.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="inline-flex p-3 rounded-2xl bg-purple-100 text-purple-700">
                    <activeDomain.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{activeDomain.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {activeDomain.description}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200/60">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Key Activities</h4>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {activeDomain.activities.map((activity, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* MILESTONES (if available) */}
        {data.milestones?.length > 0 && (
          <section className="space-y-10 pt-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-gray-900">Our Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Key milestones and achievements along our path of service.
              </p>
            </div>
            <div className="bg-white p-8 lg:p-12 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 max-w-4xl mx-auto">
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-200 before:to-transparent">
                {data.milestones.map((m: any) => (
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
