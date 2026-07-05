"use client";

import React from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Star, ShieldAlert, Award, Compass, Heart, Users, Milestone } from "lucide-react";
import { motion } from "framer-motion";

const HISTORICAL_MILESTONES = [
  {
    year: "2025",
    title: "Platinum Club Citation",
    description: "Honored with the District Platinum Club Citation for executing over 40+ local community drives, relief campaigns, and professional speaking cells.",
    icon: Award,
    color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
  {
    year: "2024",
    title: "Sustainability Hackathon Launch",
    description: "Initiated our flagship technological track event, gathering over 150+ international developers to construct open-source climate platforms.",
    icon: Milestone,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  },
  {
    year: "2023",
    title: "Emergency Water Purification Drive",
    description: "Partnered with rural administration cells to distribute 100+ portable clean water filtration kits, supporting 5,000+ school students.",
    icon: Compass,
    color: "text-pink-600 dark:text-pink-400 bg-pink-500/10",
  },
  {
    year: "2022",
    title: "Rotaract Charter Day",
    description: "Established our charter delegation officially under Rotary International sponsorship, aligning our vertical goals to global service codes.",
    icon: Star,
    color: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
  },
];

export default function OurArchivePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12 sm:space-y-16 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Club History
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Our Journey & Milestones
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore the chronological archive of campaigns, citations, and flagship projects completed by {appName} delegates over the years.
            </p>
          </div>

          {/* Timeline — left-aligned on all screen sizes, year floats left on md+ */}
          <div className="relative border-l-2 border-primary/10 ml-4 md:ml-36 space-y-10 sm:space-y-12 py-4">
            {HISTORICAL_MILESTONES.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-8 sm:pl-10"
                >
                  {/* Year label — floats to left on md+, shown inline on mobile */}
                  <span className="hidden md:flex absolute right-full mr-10 top-1.5 text-xl lg:text-2xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent select-none whitespace-nowrap">
                    {milestone.year}
                  </span>

                  {/* Bullet node */}
                  <span className={`absolute -left-[17px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background ${milestone.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>

                  {/* Mobile year badge — shown inline above card */}
                  <span className="flex md:hidden text-base font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-1.5">
                    {milestone.year}
                  </span>

                  {/* Milestone card */}
                  <div className="bg-card border border-primary/10 p-5 sm:p-6 rounded-2xl space-y-2 hover:border-primary/20 hover:shadow-md transition-all">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{milestone.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
