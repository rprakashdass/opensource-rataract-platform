"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";

/**
 * Project/event story card: 4:5 (or 3:2) image, eyebrow, serif title,
 * one-line outcome, date/place caption. The one card hover, site-wide.
 */
export function StoryCard({
  href,
  imageUrl,
  eyebrow,
  title,
  outcome,
  caption,
  ratio = "4/5",
  large = false,
  className,
}: {
  href: string;
  imageUrl?: string | null;
  eyebrow?: string;
  title: string;
  outcome?: string | null;
  caption?: string | null;
  ratio?: "4/5" | "3/2";
  large?: boolean;
  className?: string;
}) {
  const url = imageUrl ? getGoogleDriveDirectLink(imageUrl) : null;

  return (
    <Link href={href} className={cn("group block", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-wash",
          ratio === "4/5" ? "aspect-[4/5]" : "aspect-[3/2]"
        )}
      >
        {url ? (
          <Image
            src={url}
            alt={title}
            fill
            sizes={large ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover thadam-grade transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <span className="font-display font-medium italic text-ink-faint text-xl text-center text-balance">
              {title}
            </span>
          </div>
        )}
      </div>
      <div className="pt-5">
        {eyebrow && (
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ochre-deep mb-2">
            {eyebrow}
          </span>
        )}
        <h3
          className={cn(
            "font-display font-medium text-ink leading-snug text-balance",
            large ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          )}
        >
          {title}
          <span className="inline-block ml-2 text-ochre transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </h3>
        {outcome && (
          <p className="mt-2 text-[15px] text-ink-soft leading-relaxed line-clamp-2">{outcome}</p>
        )}
        {caption && (
          <p className="mt-2 text-[13px] font-medium text-ink-faint">{caption}</p>
        )}
      </div>
    </Link>
  );
}
