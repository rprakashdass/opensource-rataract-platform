"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedCountUp } from "@/components/ui/motion/AnimatedCountUp";
import { RevealBlock } from "./reveal";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

export interface ImpactMetric {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

/** Small footprint glyph — the mark as punctuation. */
export function FootprintGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" fill="currentColor" className={cn("w-4 h-5", className)} aria-hidden="true">
      {/* Central Pad */}
      <path d="M12 18.5c-3.8 0-6.5 2-6.5 5 0 3.5 2.5 5.5 6.5 5.5s6.5-2 6.5-5.5c0-3-2.7-5-6.5-5z" />
      {/* Left Toe & Claw */}
      <ellipse cx="5.2" cy="15.2" rx="2" ry="3.5" transform="rotate(-30 5.2 15.2)" />
      <path d="M4.5 12.5c-.5-3-1-5 .8-4 0 1.5-.3 3-.8 4z" />
      {/* Middle-Left Toe & Claw */}
      <ellipse cx="9.8" cy="11.8" rx="2.2" ry="4" transform="rotate(-10 9.8 11.8)" />
      <path d="M9.5 8.2c-.3-3.2-.8-5.2 1-4.2-.3 1.6-.5 3.2-.7 4.2z" />
      {/* Middle-Right Toe & Claw */}
      <ellipse cx="14.2" cy="11.8" rx="2.2" ry="4" transform="rotate(10 14.2 11.8)" />
      <path d="M14.5 8.2c.3-3.2.8-5.2-1-4.2.3 1.6.5 3.2.7 4.2z" />
      {/* Right Toe & Claw */}
      <ellipse cx="18.8" cy="15.2" rx="2" ry="3.5" transform="rotate(30 18.8 15.2)" />
      <path d="M19.5 12.5c.5-3 1-5-.8-4 0 1.5.3 3 .8 4z" />
    </svg>
  );
}

/**
 * Dark-chapter stat band: footprint-anchored kicker, statement,
 * 3–4 counters with a provenance footnote.
 */
export function ImpactBand({
  kicker = "The marks we've left",
  statement,
  metrics,
  provenance,
  condensed = false,
  className,
}: {
  kicker?: string;
  statement?: string | null;
  metrics: ImpactMetric[];
  provenance?: string | null;
  condensed?: boolean;
  className?: string;
}) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <section className={cn("bg-chapter", condensed ? "py-16 md:py-24" : "py-24 md:py-36", className)}>
      <MaxWidthWrapper>
        <RevealBlock>
          <div className="flex items-center gap-3 mb-6 text-gold">
            <FootprintGlyph />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">{kicker}</span>
          </div>
          {statement && !condensed && (
            <p className="font-display font-medium text-parchment tracking-[-0.01em] leading-[1.2] text-[clamp(1.6rem,3.5vw,2.5rem)] max-w-2xl text-balance mb-14">
              {statement}
            </p>
          )}
          <div className={cn("flex flex-wrap gap-y-10", condensed ? "gap-x-14 mt-4" : "gap-x-16 lg:gap-x-24")}>
            {metrics.map((m, i) => (
              <div key={i}>
                <AnimatedCountUp
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  className="font-display font-medium text-parchment leading-none tabular-nums text-[clamp(2.4rem,6vw,4rem)]"
                />
                <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-parchment/50 mt-3">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
          {provenance && (
            <p className="text-xs text-parchment/40 mt-12">{provenance}</p>
          )}
        </RevealBlock>
      </MaxWidthWrapper>
    </section>
  );
}
