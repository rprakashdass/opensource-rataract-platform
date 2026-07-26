"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function Unit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0");
  return (
    <div className="relative flex min-w-[72px] flex-col items-center overflow-hidden rounded-2xl border border-parchment/10 bg-gradient-to-b from-parchment/[0.08] to-parchment/[0.02] px-3 py-4 backdrop-blur-md sm:min-w-[98px] sm:px-5">
      {/* top highlight edge */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-parchment/30 to-transparent" />
      <div className="relative h-[clamp(2rem,6vw,3.5rem)] w-full">
        <AnimatePresence initial={false}>
          <motion.span
            key={str}
            initial={{ y: "-110%", opacity: 0, filter: "blur(8px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "110%", opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center font-statement font-medium tabular-nums leading-none text-parchment text-[clamp(2rem,6vw,3.5rem)]"
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-parchment/45 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

/**
 * Counts down to the launch time (ISO string). Renders nothing until mounted
 * (avoids SSR/client hydration mismatch on the live clock) and nothing if no
 * launch time is configured. When the clock hits zero the site has gone live,
 * so we send everyone watching straight to the homepage at the reveal moment.
 */
export default function Countdown({ launchAt }: { launchAt?: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!launchAt) return;
    const target = new Date(launchAt).getTime();
    if (Number.isNaN(target)) return;

    let revealed = false;
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      setRemaining(left);
      if (left <= 0 && !revealed) {
        revealed = true;
        // Small grace so the gate/DB definitely reads as live before we go.
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [launchAt]);

  if (remaining === null || remaining <= 0) return null;

  const s = Math.floor(remaining / 1000);
  const parts = [
    { label: "Days", value: Math.floor(s / 86400) },
    { label: "Hours", value: Math.floor((s % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((s % 3600) / 60) },
    { label: "Seconds", value: s % 60 },
  ];

  return (
    <div className="mt-12 flex items-center justify-center gap-2 sm:gap-3">
      {parts.map((p, i) => (
        <div key={p.label} className="flex items-center gap-2 sm:gap-3">
          <Unit value={p.value} label={p.label} />
          {i < parts.length - 1 && (
            <motion.span
              aria-hidden
              className="font-statement text-2xl text-gold/40 sm:text-3xl"
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              :
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
}
