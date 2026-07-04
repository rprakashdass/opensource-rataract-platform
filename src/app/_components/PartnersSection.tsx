"use client";

import React from "react";
import { Handshake, Heart, Shield, Award, Users, Star } from "lucide-react";

const PARTNERS = [
  { icon: Shield, name: "Rotary International" },
  { icon: Heart, name: "Red Cross Society" },
  { icon: Handshake, name: "UN Volunteers" },
  { icon: Award, name: "Youth Leadership Forum" },
  { icon: Users, name: "Interact District Council" },
  { icon: Star, name: "Global Peace Initiative" },
];

export default function PartnersSection() {
  // Double the list to create a seamless looping effect
  const doublePartners = [...PARTNERS, ...PARTNERS];

  return (
    <div className="w-full py-6 overflow-hidden relative select-none">
      {/* Decorative gradient masks to fade the sides */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="w-full flex items-center justify-center mb-6">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold flex items-center gap-1.5">
          <Handshake className="h-3 w-3 text-primary animate-pulse" />
          <span>Affiliated District Networks</span>
        </span>
      </div>

      <div className="flex w-[200%] md:w-[150%] animate-marquee whitespace-nowrap gap-12 items-center">
        {doublePartners.map((partner, idx) => {
          const Icon = partner.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-primary/10 bg-white/20 dark:bg-black/20 backdrop-blur-sm hover:border-primary/30 transition-colors"
            >
              <Icon className="h-4.5 w-4.5 text-primary" />
              <span className="text-xs md:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                {partner.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
