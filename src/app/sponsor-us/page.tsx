"use client";

import React, { useState, useEffect } from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { IndianRupee, ChevronRight, Check } from "lucide-react";
import Image from "next/image";
import { PublicHero } from "@/components/ui/public/PublicHero";
import { PublicSection } from "@/components/ui/public/PublicSection";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
}

export default function SponsorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [donationAmount, setDonationAmount] = useState(500);

  const getImpact = (amount: number) => {
    if (amount < 500) {
      return { kids: Math.floor(amount / 50), kits: Math.floor(amount / 100), trees: Math.floor(amount / 20) };
    }
    if (amount < 5000) {
      return { kids: Math.floor(amount / 40), kits: Math.floor(amount / 80), trees: Math.floor(amount / 15) };
    }
    return { kids: Math.floor(amount / 30), kits: Math.floor(amount / 60), trees: Math.floor(amount / 10) };
  };

  useEffect(() => {
    setProjects([]);
    setError("Campaigns are now managed through our Events system. Check the Events page!");
  }, []);

  const impact = getImpact(donationAmount);

  return (
    <div className="min-h-screen bg-background pb-16">
      <PublicHero 
        badge="Sponsor Our Campaigns"
        title="Fuel Community Change"
        description="Every contribution helps fund local education drives, support relief efforts, and plant municipal forest blocks. Partner with us to maximize your CSR goals."
      />
      <PublicSection background="white">
        <div className="space-y-12 sm:space-y-16 mt-8">
          {/* Calculator + Tier — stack on mobile, side-by-side on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
            {/* Impact Calculator */}
            <div className="lg:col-span-3 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Impact Calculator</h3>
                <p className="text-xs text-muted-foreground">Adjust the slider to see how your funds will directly allocate to families</p>
              </div>

              <div className="space-y-4 pt-2 sm:pt-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground">Support Contribution</span>
                  <span className="text-xl sm:text-2xl text-primary font-black flex items-center gap-0.5">
                    <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 inline" />
                    {donationAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full h-2 bg-primary/10 dark:bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>₹100 MIN</span>
                  <span>₹5,000</span>
                  <span>₹10,000 MAX</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-primary/10 text-center">
                <div className="bg-purple-500/5 p-3 sm:p-4 rounded-2xl border border-purple-500/10">
                  <span className="block text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{impact.kids}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Kids Educated</span>
                </div>
                <div className="bg-indigo-500/5 p-3 sm:p-4 rounded-2xl border border-indigo-500/10">
                  <span className="block text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">{impact.kits}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Relief Kits</span>
                </div>
                <div className="bg-pink-500/5 p-3 sm:p-4 rounded-2xl border border-pink-500/10">
                  <span className="block text-xl sm:text-2xl font-black text-pink-600 dark:text-pink-400">{impact.trees}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Trees Planted</span>
                </div>
              </div>
            </div>

            {/* Patron Tier Card */}
            <div className="lg:col-span-2 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full w-fit block">Corporate CSR Tier</span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight">Become an Official Club Patron</h3>
                <p className="text-xs text-primary-foreground/80 leading-relaxed">
                  Support our global campaigns, join district panel events, and feature your organization logo prominently across all landing flyers.
                </p>
                <ul className="space-y-2 text-xs font-semibold text-primary-foreground/90">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Logo on website ticker marquee</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Highlighted in newsletters</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Executive Board invites</li>
                </ul>
              </div>
              <button
                onClick={() => alert("Redirecting to corporate sponsorship inquiry...")}
                className="w-full bg-white hover:bg-primary/5 text-primary transition-all font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Partner With Us</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="space-y-8 pt-4 sm:pt-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground border-b pb-3">Active Campaigns Seeking Funding</h3>
            {error ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-card/80 p-6 text-sm text-muted-foreground">
                {error}
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-card/80 p-6 text-sm text-muted-foreground">
                No campaigns are currently available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-card border border-primary/10 rounded-3xl overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={project.coverImage || "/favicon.ico"}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-5 sm:p-6 space-y-3">
                      <h4 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">{project.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PublicSection>
    </div>
  );
}
