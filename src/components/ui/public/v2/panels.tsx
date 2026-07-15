"use client";

import React from "react";
import Image from "next/image";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { RevealBlock } from "./reveal";
import { PillLink, QuietLink } from "./buttons";

/**
 * The single join/sponsor CTA module. Max once per page, always after proof.
 */
export function InvitePanel({
  statement,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  onWash = true,
  className,
}: {
  statement: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string | null;
  secondaryHref?: string | null;
  onWash?: boolean;
  className?: string;
}) {
  return (
    <section className={cn(onWash ? "bg-wash" : "bg-paper", "py-24 md:py-32", className)}>
      <MaxWidthWrapper>
        <RevealBlock className="max-w-3xl">
          <p className="font-display font-medium tracking-[-0.015em] leading-[1.1] text-ink text-[clamp(2.2rem,5.5vw,4rem)] text-balance">
            {statement}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <PillLink href={primaryHref}>{primaryText}</PillLink>
            {secondaryText && secondaryHref && (
              <QuietLink href={secondaryHref}>{secondaryText}</QuietLink>
            )}
          </div>
        </RevealBlock>
      </MaxWidthWrapper>
    </section>
  );
}

/** Monochrome partner logo row — never louder than the mission. */
export function PartnerRail({
  sponsors,
  heading = "Partners who walk with us",
  className,
}: {
  sponsors: { id: string; name: string; logoUrl?: string | null; website?: string | null }[];
  heading?: string;
  className?: string;
}) {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <div className={cn("py-14 border-t border-hairline", className)}>
      <MaxWidthWrapper>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint mb-8">{heading}</p>
        <div className="flex flex-wrap items-center gap-x-14 gap-y-8">
          {sponsors.map((s) => {
            const logo = s.logoUrl ? getGoogleDriveDirectLink(s.logoUrl) : null;
            const mark = logo ? (
              <span className="relative block h-9 w-28 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100">
                <Image src={logo} alt={s.name} fill sizes="112px" className="object-contain object-left" />
              </span>
            ) : (
              <span className="font-display font-medium text-lg text-ink-faint transition-colors hover:text-ink">
                {s.name}
              </span>
            );
            return s.website ? (
              <a key={s.id} href={s.website} target="_blank" rel="noopener noreferrer" title={s.name}>
                {mark}
              </a>
            ) : (
              <span key={s.id} title={s.name}>{mark}</span>
            );
          })}
        </div>
      </MaxWidthWrapper>
    </div>
  );
}

/** One empty-state voice: typographic, warm, context-specific. */
export function EmptyState({
  title,
  detail,
  className,
}: {
  title: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div className={cn("py-16 text-center max-w-md mx-auto", className)}>
      <p className="font-display font-medium italic text-xl md:text-2xl text-ink-soft text-balance">{title}</p>
      {detail && <p className="text-sm text-ink-faint mt-3 leading-relaxed">{detail}</p>}
    </div>
  );
}
