"use client";

import React, { useState } from "react";
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
  const [photoError, setPhotoError] = useState(false);
  const photo = photoUrl ? getGoogleDriveDirectLink(photoUrl) : null;
  const signature = signatureUrl ? getGoogleDriveDirectLink(signatureUrl) : null;

  return (
    <RevealBlock className={cn("grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10", className)}>
      <div className="lg:col-span-8">
        {eyebrow && <Eyebrow onDark={onDark} className="mb-8">{eyebrow}</Eyebrow>}
        <blockquote
          className={cn(
            "font-statement font-semibold tracking-[-0.01em] leading-[1.3] text-[clamp(1.4rem,3vw,2.1rem)] text-balance",
            onDark ? "text-parchment" : "text-ink"
          )}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      <div className="lg:col-span-4 lg:col-start-9 flex lg:flex-col items-center lg:items-start gap-4 lg:border-l lg:border-hairline lg:pl-8">
        {photo && !photoError ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0">
            <Image src={photo} alt={name} fill sizes="96px" className="object-cover thadam-grade" onError={() => setPhotoError(true)} />
          </div>
        ) : (
          <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 bg-wash flex items-center justify-center">
             <span className="font-display font-medium italic text-ink-faint text-3xl">{name.charAt(0).toUpperCase()}</span>
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
