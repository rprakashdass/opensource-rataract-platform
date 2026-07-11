"use client";

import React, { useState, useEffect } from "react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { IndianRupee, ChevronRight, Check } from "lucide-react";
import Image from "next/image";
import { PageHero } from "@/components/ui/public/PageHero";
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
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      <PageHero 
        eyebrow="Sponsor Our Campaigns"
        title="Fuel Community Change"
        subtitle="Every contribution directly helps fund local education drives, support relief efforts, and plant municipal forest blocks."
      />
      <PublicSection background="white">
        <div className="space-y-12 mt-8">
          {/* Calculator + Tier */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Impact Calculator */}
            <div className="lg:col-span-3 bg-[#FAF9F6] border border-slate-200/60 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0B132B]">Impact Calculator</h3>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Adjust the slider to see how your funds will directly allocate to families</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500 font-bold">Support Contribution</span>
                  <span className="text-xl text-primary font-black flex items-center gap-0.5">
                    <IndianRupee className="h-5 w-5 inline" />
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
                  className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>₹100 MIN</span>
                  <span>₹5,000</span>
                  <span>₹10,000 MAX</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/50 text-center">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <span className="block text-2xl font-black text-primary">{impact.kids}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Kids Educated</span>
                </div>
                <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/10">
                  <span className="block text-2xl font-black text-secondary">{impact.kits}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Relief Kits</span>
                </div>
                <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                  <span className="block text-2xl font-black text-emerald-600">{impact.trees}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Trees Planted</span>
                </div>
              </div>
            </div>

            {/* Patron Tier Card */}
            <div className="lg:col-span-2 bg-[#0B132B] text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col justify-between min-h-[300px] space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full w-fit block text-primary">Corporate CSR Tier</span>
                <h3 className="text-xl font-black leading-snug">Become an Official Club Patron</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Support our campaigns, sponsor district projects, and feature your organization logo prominently across all web flyers.
                </p>
                <ul className="space-y-2 text-xs font-bold text-slate-200">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Logo on website footer</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Highlighted in updates</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Executive Board invites</li>
                </ul>
              </div>
              <button
                onClick={() => alert("Redirecting to corporate sponsorship inquiry...")}
                className="w-full bg-primary hover:bg-primary/95 text-white transition-all font-black py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Partner With Us</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-black text-[#0B132B] border-b border-slate-100 pb-3">Active Campaigns Seeking Funding</h3>
            {error ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm max-w-2xl mx-auto">
                <p className="text-slate-500 text-sm font-semibold">{error}</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm max-w-2xl mx-auto">
                <p className="text-slate-500 text-sm font-semibold">No campaigns are currently seeking separate funding.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group"
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
                    <div className="p-6 space-y-2">
                      <h4 className="font-black text-[#0B132B] group-hover:text-secondary transition-colors">{project.title}</h4>
                      <p className="text-slate-600 text-sm font-medium leading-relaxed">{project.description}</p>
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
