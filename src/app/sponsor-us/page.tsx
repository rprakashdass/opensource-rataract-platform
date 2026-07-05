"use client";

import React, { useState, useEffect } from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { Handshake, Heart, Shield, Award, Users, Star, DollarSign, ChevronRight, Check } from "lucide-react";
import Image from "next/image";

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
  const [donationAmount, setDonationAmount] = useState(100);

  // Dynamic impact calculations based on donation slider
  const getImpact = (amount: number) => {
    if (amount < 100) {
      return {
        kids: Math.floor(amount / 5),
        kits: Math.floor(amount / 10),
        trees: Math.floor(amount / 2),
      };
    }
    if (amount < 500) {
      return {
        kids: Math.floor(amount / 4.5),
        kits: Math.floor(amount / 9),
        trees: Math.floor(amount / 1.5),
      };
    }
    return {
      kids: Math.floor(amount / 4),
      kits: Math.floor(amount / 8),
      trees: Math.floor(amount / 1.2),
    };
  };

  useEffect(() => {
    // Projects have been removed - campaigns are now event-based
    setProjects([]);
    setError("Campaigns are now managed through our Events system. Check the Events page!");
  }, []);

  const impact = getImpact(donationAmount);

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-16">
          {/* Header Hero */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Sponsor Our Campaigns
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Fuel Community Change
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every contribution helps fund local education drives, support relief efforts, and plant municipal forest blocks. Partner with us to maximize your CSR goals.
            </p>
          </div>

          {/* Interactive Calculator and Donation Tier Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Impact Calculator Widget (Left) */}
            {/* Impact Calculator Widget (Left) */}
            <div className="lg:col-span-3 bg-card border border-primary/10 p-8 rounded-3xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Impact Calculator</h3>
                <p className="text-xs text-muted-foreground">Adjust the slider to see how your funds will directly allocate to families</p>
              </div>

              {/* Slider Input */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground">Support Contribution</span>
                  <span className="text-2xl text-primary font-black flex items-center">
                    <DollarSign className="h-6 w-6 inline" />
                    {donationAmount}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full h-2 bg-primary/10 dark:bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>₹50 MIN</span>
                  <span>₹500</span>
                  <span>₹1,000 MAX</span>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary/10 text-center">
                <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10">
                  <span className="block text-2xl font-black text-purple-600 dark:text-purple-400">{impact.kids}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Kids Educated</span>
                </div>
                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                  <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">{impact.kits}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Relief Kits</span>
                </div>
                <div className="bg-pink-500/5 p-4 rounded-2xl border border-pink-500/10">
                  <span className="block text-2xl font-black text-pink-600 dark:text-pink-400">{impact.trees}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Trees Planted</span>
                </div>
              </div>
            </div>

            {/* Donation Tier card (Right) */}
            <div className="lg:col-span-2 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground p-8 rounded-3xl shadow-xl flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full w-fit">Corporate CSR Tier</span>
                <h3 className="text-2xl font-black leading-tight">Become an Official Club Patron</h3>
                <p className="text-xs text-primary-foreground/80 leading-relaxed">
                  Support our global campaigns, join district panel events, and feature your organization logo prominently across all landing flyers.
                </p>
                <ul className="space-y-2 text-xs font-semibold text-primary-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Logo on website ticker marquee
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Highlighted in newsletters
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Executive Board invites
                  </li>
                </ul>
              </div>
              <button
                onClick={() => alert("Redirecting to corporate sponsorship inquiry...")}
                className="w-full bg-white hover:bg-primary/5 text-primary hover:scale-102 transition-all font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Partner With Us</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Initiatives Showcase Grid */}
          <div className="space-y-8 max-w-5xl mx-auto pt-8">
            <h3 className="text-2xl font-extrabold text-foreground border-b pb-3">Active Campaigns Seeking Funding</h3>
            {error ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-card/80 p-6 text-sm text-muted-foreground">
                {error}
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-card/80 p-6 text-sm text-muted-foreground">
                No campaigns are currently available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-6 space-y-3">
                      <h4 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">{project.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
