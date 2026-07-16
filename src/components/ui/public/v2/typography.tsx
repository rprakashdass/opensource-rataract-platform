"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RevealBlock } from "./reveal";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

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
          "font-statement font-medium tracking-[-0.015em] leading-[1.15] text-[clamp(1.75rem,4vw,3rem)] text-balance",
          onDark ? "text-parchment" : "text-ink"
        )}
      >
        {children}
      </p>
    </RevealBlock>
  );
}

/**
 * The page opener — a shape nothing else on the page repeats.
 * Display-size serif title on the left (cols 1–8), support text
 * baseline-aligned in the right columns, closed by a hairline rule.
 */
export function PageIntro({
  eyebrow,
  title,
  support,
  meta,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  support?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("pt-40 md:pt-48 bg-paper", className)}>
      <MaxWidthWrapper>
        <RevealBlock className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 items-end border-b border-hairline pb-10 md:pb-14">
          <div className="lg:col-span-8">
            {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
            <h1 className="font-display font-medium text-ink tracking-[-0.02em] leading-[1.02] text-[clamp(2.6rem,6.5vw,4.5rem)] text-balance">
              {title}
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-1.5">
            {support && (
              <p className="text-base md:text-lg text-ink-soft leading-relaxed max-w-md">{support}</p>
            )}
            {meta && <p className="mt-4 text-[13px] font-medium text-ink-faint">{meta}</p>}
            {children}
          </div>
        </RevealBlock>
      </MaxWidthWrapper>
    </section>
  );
}

/**
 * Quiet section label: small caps + a rule running to the margin.
 * Use when the page intro already did the talking — a section
 * doesn't need a second headline, just a signpost.
 */
export function SectionLabel({
  children,
  onDark,
  className,
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-5 mb-10 md:mb-12", className)} aria-hidden={false}>
      <Eyebrow onDark={onDark} className="shrink-0">
        {children}
      </Eyebrow>
      <span className={cn("flex-1 h-px", onDark ? "bg-parchment/15" : "bg-hairline")} aria-hidden="true" />
    </div>
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
            "font-display font-medium tracking-[-0.01em] leading-[1.15] text-[clamp(1.6rem,3vw,2.25rem)] text-balance",
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
