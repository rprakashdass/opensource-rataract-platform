"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { FootprintTrail } from "@/components/ui/public/v2/FootprintTrail";
import Countdown from "./Countdown";

type Social = { key: string; href: string };

// Subtle film grain — an inline SVG turbulence, no network request.
const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  );

const ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

// Deterministic twinkle positions (no Math.random → no hydration drift).
const TWINKLES = [
  { x: "12%", y: "22%", d: 0 }, { x: "84%", y: "18%", d: 1.4 },
  { x: "22%", y: "72%", d: 0.8 }, { x: "72%", y: "68%", d: 2.1 },
  { x: "48%", y: "12%", d: 1.1 }, { x: "8%", y: "52%", d: 2.6 },
  { x: "92%", y: "48%", d: 0.4 }, { x: "62%", y: "82%", d: 1.8 },
  { x: "34%", y: "34%", d: 3.0 }, { x: "78%", y: "88%", d: 0.6 },
];

export default function ComingSoonExperience({
  clubName,
  logoUrl,
  launchAt,
  launchLabel,
  socials,
}: {
  clubName: string;
  logoUrl: string | null;
  launchAt: string | null;
  launchLabel: string | null;
  socials: Social[];
}) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };
  const headline: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const word: Variants = {
    hidden: { y: "115%" },
    show: { y: "0%", transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-chapter px-6 py-16 text-center text-parchment">
      <FootprintTrail />

      {/* Rotating light sheen behind the content */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.5]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(212,19,103,0.10) 60deg, transparent 140deg, rgba(196,136,26,0.08) 220deg, transparent 300deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Drifting aurora — cranberry + gold glows */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-1/4 top-[-15%] h-[55vmax] w-[55vmax] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(212,19,103,0.30), transparent 62%)" }}
            animate={{ x: [0, 80, -40, 0], y: [0, 60, 30, 0], scale: [1, 1.12, 0.96, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-1/4 bottom-[-20%] h-[50vmax] w-[50vmax] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(196,136,26,0.24), transparent 62%)" }}
            animate={{ x: [0, -70, 40, 0], y: [0, -40, -20, 0], scale: [1, 1.08, 0.94, 1] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Gold twinkle field */}
      {!reduce &&
        TWINKLES.map((t, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute h-[3px] w-[3px] rounded-full bg-gold/70"
            style={{ left: t.x, top: t.y, boxShadow: "0 0 6px rgba(196,136,26,0.7)" }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 3.5, delay: t.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {/* Grain + vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "140px 140px" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(38,19,28,0.6) 100%)" }}
      />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center"
      >
        {logoUrl && (
          <motion.div variants={item} className="relative mb-8">
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 -m-3 rounded-full border border-gold/25"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <Image
              src={logoUrl}
              alt={clubName}
              width={72}
              height={72}
              className="h-16 w-16 rounded-2xl object-contain"
            />
          </motion.div>
        )}

        <motion.span
          variants={item}
          className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.35em] text-gold"
        >
          <motion.span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-gold"
            animate={reduce ? undefined : { opacity: [1, 0.2, 1], scale: [1, 0.7, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          Launching soon
        </motion.span>

        {/* Headline — word-by-word mask reveal */}
        <motion.h1
          variants={headline}
          className="mt-6 flex max-w-4xl flex-wrap justify-center gap-x-[0.28em] font-statement font-medium leading-[1.08] tracking-[-0.01em] text-[clamp(2rem,5vw,3.5rem)] text-balance"
        >
          {clubName.split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em]">
              <motion.span variants={word} className="inline-block">
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-md text-base leading-relaxed text-parchment/70 md:text-lg"
        >
          We're crafting a new digital home to share our impact and connect with our community. We can't wait to show you around.
        </motion.p>

        <motion.div variants={item}>
          <Countdown launchAt={launchAt ?? undefined} />
        </motion.div>

        {launchLabel && (
          <motion.p variants={item} className="mt-8 text-sm font-medium text-parchment/55">
            Going live on <span className="text-parchment">{launchLabel}</span>
          </motion.p>
        )}

        {socials.length > 0 && (
          <motion.div variants={item} className="mt-10 flex items-center gap-3">
            {socials.map(({ key, href }) => {
              const Icon = ICONS[key];
              if (!Icon) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-parchment/15 text-parchment/70 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </motion.div>
        )}

        <motion.div variants={item} className="mt-14 flex items-center gap-2 text-parchment/40">
          <span className="h-px w-8 bg-parchment/20" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Rotaract</span>
          <span className="h-px w-8 bg-parchment/20" />
        </motion.div>
      </motion.div>
    </main>
  );
}
