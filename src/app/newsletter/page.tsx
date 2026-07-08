"use client";

import React, { useState } from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { BookOpen, Calendar, ArrowRight, Download, X } from "lucide-react";
import { motion } from "framer-motion";
import { PublicHero } from "@/components/ui/public/PublicHero";
import { PublicSection } from "@/components/ui/public/PublicSection";

const NEWSLETTERS = [
  {
    id: "n1",
    issue: "Volume 04, Issue 01",
    title: "Eco-Summit & Community Care Highlights",
    description: "Covering our recent sustainability hackathon structures, water kit deployments, and executive training events.",
    date: "June 2026",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "n2",
    issue: "Volume 03, Issue 04",
    title: "Disaster Relief and Shelter Aid Programs",
    description: "Deep dive into our emergency flood relief distribution efforts and educational supply campaigns.",
    date: "March 2026",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "n3",
    issue: "Volume 03, Issue 03",
    title: "Winter Care & Literacy Camp Retrospective",
    description: "Recapping our winter blanket distributions and weekend literacy workshops for community center kids.",
    date: "December 2025",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=300",
  },
];

export default function NewsletterPage() {
  const [activeIssue, setActiveIssue] = useState<typeof NEWSLETTERS[0] | null>(null);

  return (
    <div className="min-h-screen bg-background pb-16">
      <PublicHero 
        badge="Club Publications"
        title="The Rotaract Chronicles"
        description="Stay updated with our official monthly and quarterly magazines detailing our active campaigns, project impact summaries, and executive notes."
      />
      <PublicSection background="white">
        <div className="space-y-16 max-w-5xl mx-auto mt-8">

          {/* Interactive Magazine Shelf Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {NEWSLETTERS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-primary/10 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all group cursor-pointer"
                onClick={() => setActiveIssue(item)}
              >
                {/* Visual Cover */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-primary/5 border-b border-primary/10">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <span className="text-[10px] font-extrabold text-white uppercase tracking-widest bg-primary px-2.5 py-1 rounded-full shadow">
                      {item.issue}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Published: {item.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-primary/10 flex justify-between items-center text-xs font-bold text-primary group-hover:text-primary-foreground">
                    <span className="group-hover:underline flex items-center gap-1">
                      Read Issue <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </PublicSection>

      {/* Reader Modal Overlay */}
      {activeIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-primary/15 max-w-lg w-full rounded-3xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveIssue(null)}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Simulated Magazine Header */}
            <div className="bg-slate-900 p-8 text-white space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full w-fit">
                {activeIssue.issue}
              </span>
              <h2 className="text-2xl font-black leading-tight">{activeIssue.title}</h2>
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-semibold uppercase tracking-wider">
                <Calendar className="h-4.5 w-4.5" />
                <span>Issue Date: {activeIssue.date}</span>
              </div>
            </div>

            {/* Simulated Content Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Executive Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This issue encapsulates our latest environmental track records, active board coordination matrices, and upcoming sustainability milestones. We invite you to view our digital summary document.
                </p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-primary/10">
                <button
                  onClick={() => alert("Simulating document viewer download...")}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-102 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => alert("Opening embedded flipbook reader...")}
                  className="flex-1 border border-primary/10 text-foreground font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Open Reader</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
