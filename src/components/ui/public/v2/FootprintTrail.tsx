"use client";

import { useEffect, useRef } from "react";

const STRIDE_PX = 96; // distance between footprints — a natural walking rhythm
const STAMP_LIFETIME_MS = 1300;
const FOOT_OFFSET_PX = 7; // perpendicular offset so left/right feet straddle the path

const FOOTPRINT_SVG = `
<svg viewBox="0 0 24 32" width="13" height="17" fill="currentColor" aria-hidden="true">
  <path d="M12 18.5c-3.8 0-6.5 2-6.5 5 0 3.5 2.5 5.5 6.5 5.5s6.5-2 6.5-5.5c0-3-2.7-5-6.5-5z" />
  <ellipse cx="5.2" cy="15.2" rx="2" ry="3.5" transform="rotate(-30 5.2 15.2)" />
  <path d="M4.5 12.5c-.5-3-1-5 .8-4 0 1.5-.3 3-.8 4z" />
  <ellipse cx="9.8" cy="11.8" rx="2.2" ry="4" transform="rotate(-10 9.8 11.8)" />
  <path d="M9.5 8.2c-.3-3.2-.8-5.2 1-4.2-.3 1.6-.5 3.2-.7 4.2z" />
  <ellipse cx="14.2" cy="11.8" rx="2.2" ry="4" transform="rotate(10 14.2 11.8)" />
  <path d="M14.5 8.2c.3-3.2.8-5.2-1-4.2.3 1.6.5 3.2.7 4.2z" />
  <ellipse cx="18.8" cy="15.2" rx="2" ry="3.5" transform="rotate(30 18.8 15.2)" />
  <path d="M19.5 12.5c.5-3 1-5-.8-4 0 1.5.3 3 .8 4z" />
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

    let lastAngle = 0;

    const onMove = (e: MouseEvent) => {
      if (!last.current) {
        last.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist < STRIDE_PX) return;

      let angle = lastAngle;
      if (dist > 2) {
        angle = Math.atan2(dy, dx);
        lastAngle = angle;
      }

      const side = leftFoot.current ? -1 : 1;
      const ox = Math.cos(angle + Math.PI / 2) * FOOT_OFFSET_PX * side;
      const oy = Math.sin(angle + Math.PI / 2) * FOOT_OFFSET_PX * side;

      // Stamp rotation based on travel direction
      const stampRot = (angle * 180) / Math.PI + 90 + side * 8;

      const stamp = document.createElement("span");
      stamp.className = "thadam-stamp";
      stamp.style.setProperty("--stamp-rot", `${stampRot}deg`);
      stamp.style.transform = `translate(-50%, -50%) rotate(${stampRot}deg)`;
      stamp.style.left = `${e.clientX + ox}px`;
      stamp.style.top = `${e.clientY + oy}px`;

      // Strong color trail
      stamp.style.color = "#EC4899";
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

