"use client";

import React from "react";
import Image from "next/image";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";
import { RevealBlock } from "./reveal";
import { Eyebrow } from "./typography";

/**
 * Pull-quote spread: large serif quote + small portrait + name/role/year.
 * Used for president's message, member stories, sponsor testimonials.
 */
export function VoiceBlock({
  quote,
  name,
  role,
  photoUrl,
  signatureUrl,
  eyebrow,
  onDark,
  className,
}: {
  quote: string;
  name: string;
  role?: string | null;
  photoUrl?: string | null;
  signatureUrl?: string | null;
  eyebrow?: string;
  onDark?: boolean;
  className?: string;
}) {
  const photo = photoUrl ? getGoogleDriveDirectLink(photoUrl) : null;
  const signature = signatureUrl ? getGoogleDriveDirectLink(signatureUrl) : null;

  return (
    <RevealBlock className={cn("grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10", className)}>
      <div className="lg:col-span-8">
        {eyebrow && <Eyebrow onDark={onDark} className="mb-8">{eyebrow}</Eyebrow>}
        <blockquote
          className={cn(
            "font-display font-medium tracking-[-0.01em] leading-[1.3] text-[clamp(1.4rem,3vw,2.1rem)] text-balance",
            onDark ? "text-parchment" : "text-ink"
          )}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      <div className="lg:col-span-3 lg:col-start-10 flex lg:flex-col items-center lg:items-start gap-4 lg:justify-end">
        {photo && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
            <Image src={photo} alt={name} fill sizes="64px" className="object-cover thadam-grade" />
          </div>
        )}
        <div>
          <p className={cn("font-semibold text-[15px]", onDark ? "text-parchment" : "text-ink")}>{name}</p>
          {role && (
            <p className={cn("text-[13px] font-medium mt-0.5", onDark ? "text-parchment/60" : "text-ink-faint")}>
              {role}
            </p>
          )}
          {signature && (
            <div className="relative w-28 h-10 mt-3">
              <Image src={signature} alt={`${name} signature`} fill sizes="112px" className="object-contain object-left" />
            </div>
          )}
        </div>
      </div>
    </RevealBlock>
  );
}
