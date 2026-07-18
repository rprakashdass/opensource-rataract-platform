"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { FootprintGlyph } from "./ImpactBand";
import { THADAM_EASE } from "./reveal";

/**
 * THADAM is both the Tamil word for "footprint" and this year's acronym:
 * Think Higher · Act Deeper · Achieve More. This section is the site's one
 * theatrical moment — a scroll-pinned decomposition where the wordmark's six
 * letters light up two at a time (T·H → A·D → A·M) while each phrase and its
 * meaning cross-fade in, a footprint stamping down for each step.
 *
 * The trail metaphor and the acronym reinforce each other: the thinking →
 * acting → achieving ladder IS the trail being walked.
 */

interface Phase {
  key: string;
  word: string;
  support: string;
}

const LETTERS: { ch: string; phase: number }[] = [
  { ch: "T", phase: 0 },
  { ch: "H", phase: 0 },
  { ch: "A", phase: 1 },
  { ch: "D", phase: 1 },
  { ch: "A", phase: 2 },
  { ch: "M", phase: 2 },
];

const DEFAULT_PHRASES: Phase[] = [
  {
    key: "think",
    word: "Think Higher",
    support: "We start from bigger questions — what the city actually needs, not just what's easy to plan.",
  },
  {
    key: "act",
    word: "Act Deeper",
    support: "Then we show up and do the work — hands-on, close to the people we serve, for as long as it takes.",
  },
  {
    key: "achieve",
    word: "Achieve More",
    support: "And we measure it in marks left behind — lives changed, not events counted.",
  },
];

export function ThadamCreed({
  eyebrow = "The theme for the year",
  phrases = DEFAULT_PHRASES,
  className,
}: {
  eyebrow?: string;
  phrases?: Phase[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Bias the thresholds slightly late so each phrase gets a full beat of
    // hold time before the next takes over.
    const next = v < 0.34 ? 0 : v < 0.68 ? 1 : 2;
    setPhase((prev) => (prev === next ? prev : next));
  });

  // ── Reduced motion / no-scroll fallback: a calm stacked manifesto ──
  if (reduce) {
    return (
      <section className={`bg-chapter py-24 md:py-32 ${className || ""}`} data-thadam-dark>
        <MaxWidthWrapper>
          <div className="flex items-center gap-3 mb-10 text-gold">
            <FootprintGlyph />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">{eyebrow}</span>
          </div>
          <p
            className="font-display font-medium text-parchment leading-[0.9] tracking-[0.02em] text-[clamp(2.5rem,13vw,8rem)] mb-14"
            aria-label="THADAM"
          >
            THADAM
          </p>
          <div className="space-y-10 max-w-2xl">
            {phrases.map((p) => (
              <div key={p.key}>
                <h3 className="font-display font-medium text-gold text-[clamp(1.5rem,4vw,2.4rem)] leading-tight">
                  {p.word}
                </h3>
                <p className="text-parchment/70 text-base md:text-lg leading-relaxed mt-2">{p.support}</p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    );
  }

  return (
    <section ref={outerRef} className={`relative bg-chapter h-[320vh] ${className || ""}`} data-thadam-dark aria-label="THADAM — Think Higher, Act Deeper, Achieve More">
      {/* Pinned stage */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <MaxWidthWrapper className="w-full">
          {/* Kicker */}
          <div className="flex items-center gap-3 mb-8 md:mb-12 text-gold">
            <FootprintGlyph />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">{eyebrow}</span>
          </div>

          {/* The wordmark — two letters light per phase */}
          <p
            className="font-display font-medium leading-[0.9] tracking-[0.01em] text-[clamp(3rem,15vw,10rem)] flex flex-wrap"
            aria-label="THADAM"
          >
            {LETTERS.map((l, i) => {
              const active = l.phase === phase;
              return (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  animate={{
                    color: active ? "var(--color-gold)" : "rgba(247,239,234,0.18)",
                    y: active ? -6 : 0,
                  }}
                  transition={{ duration: 0.55, ease: [...THADAM_EASE] }}
                  className="inline-block"
                >
                  {l.ch}
                </motion.span>
              );
            })}
          </p>

          {/* Cross-faded phrase + meaning (all stacked, only active shown) */}
          <div className="relative mt-10 md:mt-14 h-[12rem] sm:h-[9rem] max-w-2xl">
            {phrases.map((p, i) => (
              <motion.div
                key={p.key}
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: phase === i ? 1 : 0,
                  y: phase === i ? 0 : 16,
                }}
                transition={{ duration: 0.5, ease: [...THADAM_EASE] }}
                aria-hidden={phase !== i}
              >
                <h3 className="font-display font-medium text-gold text-[clamp(1.6rem,4.5vw,2.75rem)] leading-tight">
                  {p.word}
                </h3>
                <p className="text-parchment/75 text-base md:text-lg leading-relaxed mt-3">{p.support}</p>
              </motion.div>
            ))}
          </div>

          {/* Three-step footprint trail — fills as phases advance */}
          <div className="flex items-center gap-4 mt-12 md:mt-16" aria-hidden="true">
            {phrases.map((_, i) => (
              <React.Fragment key={i}>
                <motion.span
                  animate={{
                    color: i <= phase ? "var(--color-gold)" : "rgba(247,239,234,0.18)",
                    scale: i === phase ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.4, ease: [...THADAM_EASE] }}
                  className="inline-flex"
                >
                  <FootprintGlyph className="w-4 h-5" />
                </motion.span>
                {i < phrases.length - 1 && (
                  <motion.span
                    className="h-px flex-1 max-w-[3rem] origin-left"
                    animate={{ backgroundColor: i < phase ? "var(--color-gold)" : "rgba(247,239,234,0.15)" }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </MaxWidthWrapper>
      </div>
    </section>
  );
}
