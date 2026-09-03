"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";
import { formatIST } from "@/lib/date-utils";

/**
 * Ruled row for events/announcements: date block, title, meta, arrow.
 * Table-of-contents feel, not card soup.
 */
export function ListRow({
  href,
  date,
  title,
  meta,
  tag,
  description,
  imageUrl,
  className,
}: {
  href?: string;
  date?: Date | string | null;
  title: string;
  meta?: string | null;
  tag?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  className?: string;
}) {
  const month = date ? formatIST(date, "MMM") : null;
  const day = date ? formatIST(date, "d") : null;
  const [imgError, setImgError] = useState(false);
  const resolvedImageUrl = imageUrl ? getGoogleDriveDirectLink(imageUrl) : null;

  const inner = (
    <div
      className={cn(
        "group grid items-baseline gap-x-5 md:gap-x-8 py-6 border-b border-hairline transition-colors",
        imageUrl ? "grid-cols-[64px_56px_1fr_auto]" : "grid-cols-[64px_1fr_auto]",
        href && "hover:bg-wash/60 -mx-4 px-4 rounded-lg border-transparent [&+*]:border-t",
        className
      )}
    >
      <div className="text-center">
        {date ? (
          <>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-deep">
              {month}
            </span>
            <span className="block font-display font-medium text-2xl md:text-3xl text-ink leading-none mt-1 tabular-nums">
              {day}
            </span>
          </>
        ) : (
          <span className="block w-2 h-2 rounded-full bg-brand mx-auto" aria-hidden="true" />
        )}
      </div>
      {imageUrl && (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-wash self-center">
          {resolvedImageUrl && !imgError ? (
            <Image
              src={resolvedImageUrl}
              alt={title}
              fill
              sizes="56px"
              className="object-cover thadam-grade"
              onError={() => setImgError(true)}
            />
          ) : null}
        </div>
      )}
      <div className="min-w-0">
        {tag && (
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
            {tag}
          </span>
        )}
        <h3 className="font-display font-medium text-lg md:text-xl text-ink leading-snug text-balance">
          {title}
        </h3>
        {meta && <p className="text-[13px] font-medium text-ink-faint mt-1.5">{meta}</p>}
        {description && (
          <p className="text-[15px] text-ink-soft mt-2 leading-relaxed line-clamp-2">{description}</p>
        )}
      </div>
      {href && (
        <span className="text-brand transition-transform duration-200 group-hover:translate-x-1 self-center" aria-hidden="true">
          →
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/** Editorial ruled row for milestones, schedules, project phases. */
export function TimelineRow({
  marker,
  title,
  description,
  meta,
  children,
  className,
}: {
  marker: string;
  title: string;
  description?: string | null;
  meta?: string | null;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-3 py-8 border-b border-hairline", className)}>
      <div className="md:col-span-3">
        <span className="font-display font-medium italic text-2xl md:text-3xl text-brand-deep leading-none">
          {marker}
        </span>
        {meta && <p className="text-[13px] font-medium text-ink-faint mt-2">{meta}</p>}
      </div>
      <div className="md:col-span-8">
        <h3 className="font-display font-medium text-xl md:text-2xl text-ink leading-snug text-balance">{title}</h3>
        {description && (
          <p className="text-[15px] text-ink-soft mt-3 leading-relaxed max-w-2xl">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
