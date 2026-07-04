"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { ArrowRightIcon, Users, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";
  const orgSubName = process.env.NEXT_PUBLIC_ORG_SUB_NAME || "District & Club Platform";

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto overflow-hidden">
      {/* Decorative center halo glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Floating Sparkle Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-widest select-none"
      >
        <Sparkles className="h-3 w-3 animate-pulse" />
        <span>Empowering Youth, Serving Humanity</span>
      </motion.div>

      {/* Centered Giant Typography Title */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-3xl"
      >
        Reinventing Community Service for a{" "}
        <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent">
          Better Tomorrow
        </span>
      </motion.h1>

      {/* Subtext description */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
      >
        Join {appName} in building sustainable community impacts, leading local initiatives, and fostering a global network of professional leaders.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
      >
        {/* Links commented out temporarily */}
        {/* <Link href={"/sponsor-us"} className="w-full sm:w-auto" prefetch> */}
          <Button size="lg" className="w-full sm:w-auto font-semibold shadow-lg shadow-primary/20 hover:scale-103 transition-transform cursor-pointer gap-2">
            <span>Support Our Work</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        {/* </Link> */}
        {/* <Link href={"/about"} className="w-full sm:w-auto" prefetch> */}
          <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold cursor-pointer">
            Explore Initiatives
          </Button>
        {/* </Link> */}
      </motion.div>

      {/* Decorative Interactive Node Cards Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="pt-12 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl"
      >
        <div className="bg-card border border-primary/10 p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all group">
          <div className="p-3 bg-purple-500/10 text-primary w-fit rounded-xl group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <div className="mt-8">
            <h3 className="font-bold text-foreground">Active Leadership</h3>
            <p className="text-xs text-muted-foreground mt-1">Nurturing youth leadership and coordination skills.</p>
          </div>
        </div>

        <div className="bg-card border border-primary/10 p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all group">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 w-fit rounded-xl group-hover:scale-110 transition-transform">
            <Globe className="h-5 w-5" />
          </div>
          <div className="mt-8">
            <h3 className="font-bold text-foreground">Global Connections</h3>
            <p className="text-xs text-muted-foreground mt-1">Affiliated with Rotary International networking.</p>
          </div>
        </div>

        <div className="bg-card border border-primary/10 p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all group">
          <div className="p-3 bg-pink-500/10 text-pink-500 w-fit rounded-xl group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="mt-8">
            <h3 className="font-bold text-foreground">Social Impacts</h3>
            <p className="text-xs text-muted-foreground mt-1">Direct sustainable projects in community service.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
