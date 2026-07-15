"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RevealBlock } from "./reveal";

/** Ochre eyebrow label — the only place uppercase is allowed besides tiny metadata. */
export function Eyebrow({ children, className, onDark }: { children: React.ReactNode; className?: string; onDark?: boolean }) {
  return (
    <span
      className={cn(
        "block text-xs font-semibold uppercase tracking-[0.14em]",
        onDark ? "text-gold" : "text-brand-deep",
        className
      )}
    >
      {children}
    </span>
  );
}

/** The site's quiet moment: a full-width serif statement. */
export function Statement({
  children,
  eyebrow,
  className,
  onDark,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <RevealBlock className={cn("max-w-4xl", className)}>
      {eyebrow && <Eyebrow onDark={onDark} className="mb-6">{eyebrow}</Eyebrow>}
      <p
        className={cn(
          "font-display font-medium tracking-[-0.015em] leading-[1.15] text-[clamp(1.75rem,4vw,3rem)] text-balance",
          onDark ? "text-parchment" : "text-ink"
        )}
      >
        {children}
      </p>
    </RevealBlock>
  );
}

/** Left-aligned section opener: eyebrow + serif heading + optional support text and inline link. */
export function SectionHeader({
  eyebrow,
  heading,
  support,
  linkText,
  linkHref,
  onDark,
  className,
}: {
  eyebrow?: string;
  heading: string;
  support?: string;
  linkText?: string;
  linkHref?: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <RevealBlock className={cn("grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-4 items-end mb-12 md:mb-16", className)}>
      <div className="lg:col-span-7">
        {eyebrow && <Eyebrow onDark={onDark} className="mb-4">{eyebrow}</Eyebrow>}
        <h2
          className={cn(
            "font-display font-medium tracking-[-0.01em] leading-[1.1] text-[clamp(1.9rem,4.5vw,3.2rem)] text-balance",
            onDark ? "text-parchment" : "text-ink"
          )}
        >
          {heading}
        </h2>
      </div>
      <div className="lg:col-span-4 lg:col-start-9 flex flex-col gap-4">
        {support && (
          <p className={cn("text-base leading-relaxed", onDark ? "text-parchment/70" : "text-ink-soft")}>
            {support}
          </p>
        )}
        {linkText && linkHref && (
          <Link
            href={linkHref}
            className={cn(
              "thadam-link w-fit text-sm font-semibold",
              onDark ? "text-gold" : "text-trail"
            )}
          >
            {linkText} →
          </Link>
        )}
      </div>
    </RevealBlock>
  );
}

/** Footsteps divider — used at most 2–3 times per page. */
export function TrailRule({ className }: { className?: string }) {
  return (
    <div className={cn("thadam-trail-rule my-4", className)} aria-hidden="true">
      <span className="steps">
        <i /><i /><i /><i /><i />
      </span>
    </div>
  );
}
