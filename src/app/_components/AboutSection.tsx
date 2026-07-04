"use client";

import React from "react";
import { Compass, Lightbulb, Heart, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const PILLARS = [
  {
    icon: Compass,
    title: "Mission Guide",
    description: "Formulate strategic local initiatives addressing environmental preservation, literacy, and disaster relief.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Lightbulb,
    title: "Professional Skills",
    description: "Provide interactive career workshops, leadership speaking opportunities, and active project coordination training.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Heart,
    title: "Direct Service",
    description: "Connect active volunteers directly to hands-on support drives, blood donations, and shelter aids.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export default function AboutSection() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";

  return (
    <section className="py-16 md:py-24 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
            Who We Are
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            A Global Vision Applied Locally
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            At {appName}, we function as a branch of Rotary International, empowering young adults to lead sustainable impacts in local communities.
          </p>
        </div>
        {/* Commented out narrative link */}
        {/* <Link href="/about" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group cursor-pointer" prefetch>
          <span>Read Full Club Narrative</span>
          <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PILLARS.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-primary/10 p-8 rounded-2xl flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div className="space-y-4">
                <div className={`p-3.5 ${pillar.bg} ${pillar.color} w-fit rounded-xl group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
