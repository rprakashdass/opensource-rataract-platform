"use client";

import { useEffect, useRef } from "react";

const STRIDE_PX = 96; // distance between footprints — a natural walking rhythm
const STAMP_LIFETIME_MS = 1300;
const FOOT_OFFSET_PX = 7; // perpendicular offset so left/right feet straddle the path

const FOOTPRINT_SVG = `
<svg viewBox="0 0 24 32" width="13" height="17" fill="currentColor" aria-hidden="true">
  <ellipse cx="11" cy="19" rx="7" ry="10" />
  <ellipse cx="4.5" cy="7.5" rx="2.2" ry="3" transform="rotate(-15 4.5 7.5)" />
  <ellipse cx="9.5" cy="4.8" rx="2.1" ry="2.9" transform="rotate(-6 9.5 4.8)" />
  <ellipse cx="14.5" cy="4.6" rx="2" ry="2.7" transform="rotate(4 14.5 4.6)" />
  <ellipse cx="19" cy="6.8" rx="1.8" ry="2.4" transform="rotate(14 19 6.8)" />
</svg>`;

/**
 * THADAM's signature interaction: the pointer leaves a fading trail of
 * alternating footprints — the visitor literally leaves a mark.
 * Desktop (fine pointer) only; disabled under prefers-reduced-motion.
 * Direct DOM stamps (no React state) so it costs nothing per frame.
 */
export function FootprintTrail() {
  const last = useRef<{ x: number; y: number } | null>(null);
  const leftFoot = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);

    const onMove = (e: MouseEvent) => {
      if (!last.current) {
        last.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist < STRIDE_PX) return;

      const angle = Math.atan2(dy, dx);
      // Perpendicular offset alternates so feet straddle the walking line
      const side = leftFoot.current ? -1 : 1;
      const ox = Math.cos(angle + Math.PI / 2) * FOOT_OFFSET_PX * side;
      const oy = Math.sin(angle + Math.PI / 2) * FOOT_OFFSET_PX * side;

      // Footprint art points "up", so rotate to travel direction (+90°),
      // with a slight inward toe angle per foot.
      const rotDeg = (angle * 180) / Math.PI + 90 + side * 8;

      const isDark = !!(e.target as Element | null)?.closest?.(".bg-chapter, [data-thadam-dark]");

      const stamp = document.createElement("span");
      stamp.className = "thadam-stamp";
      stamp.style.setProperty("--stamp-rot", `${rotDeg}deg`);
      stamp.style.transform = `translate(-50%, -50%) rotate(${rotDeg}deg)`;
      stamp.style.left = `${e.clientX + ox}px`;
      stamp.style.top = `${e.clientY + oy}px`;
      stamp.style.color = isDark ? "rgba(246, 238, 221, 0.5)" : "rgba(196, 136, 26, 0.55)";
      stamp.innerHTML = FOOTPRINT_SVG;
      container.appendChild(stamp);
      window.setTimeout(() => stamp.remove(), STAMP_LIFETIME_MS);

      leftFoot.current = !leftFoot.current;
      last.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      container.remove();
    };
  }, []);

  return null;
}
